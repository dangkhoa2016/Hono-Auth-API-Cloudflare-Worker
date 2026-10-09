import { rateLimitService_log, rateLimit_log, dbError_log } from '../utils/debug.js';
import { BaseService } from './baseService.js';
import { createKvConfigService } from '../utils/serviceFactory.js';
import { ServiceUnavailableError } from '../utils/serviceErrors.js';

const DEFAULT_CONTEXT = 'auth:ip';

/**
 * Bucket used when the caller cannot be identified at all - a missing client IP
 * header, a header that is literally `unknown`, an empty string.
 *
 * The previous behaviour was to return `allowed: true` and skip the counter
 * entirely, which meant a request whose IP could not be parsed had no budget at
 * all: every such request was free. That is a bypass, and it is reachable by
 * anything that can suppress a header. Collapsing them into one shared bucket
 * is a deliberate choice over the alternative - giving each unparsable value its
 * own key, which is the same bypass with more bookkeeping. The cost is that a
 * deployment which cannot resolve any client IP will exhaust the shared bucket
 * and start returning 429s; that is a loud, diagnosable failure, which is
 * preferable to a silent one.
 */
const UNRESOLVED_IDENTIFIER_BUCKET = 'unresolved';

/**
 * The admission statement.
 *
 * A counter row is reserved by the statement that decides the request, so the
 * decision and the write cannot be interleaved with another request's:
 *
 *   - `WHERE attempts_count < ? OR <window elapsed>` is the admission. When it
 *     is false, the `DO UPDATE` matches nothing, the row is not written at all,
 *     and `RETURNING` yields zero rows. A denial therefore cannot move
 *     `last_attempt_at`, which matters: a denial that touched the row would hold
 *     the window open indefinitely under a flood.
 *   - When the window has elapsed the update branch restarts the counter at 1 and
 *     moves `first_attempt_at`, so the window is fixed at first admission and a
 *     denied request never extends it.
 *   - `RETURNING attempts_count` gives the admitted request its own position in
 *     the window. Reading it back afterwards would answer for whoever wrote
 *     last, not for this request.
 *
 * `unixepoch()` is used instead of comparing the stored strings because the
 * column holds two shapes: the ISO strings this service writes and the
 * `CURRENT_TIMESTAMP` shape a seeded or upgraded database carries. A lexical
 * comparison of those two is wrong.
 *
 * `windowSeconds <= 0` means "no window": the counter never resets on its own,
 * which is the same meaning the option had before.
 */
const ADMISSION_SQL = `INSERT INTO rate_limit_counters
     (context, identifier, attempts_count, first_attempt_at, last_attempt_at, created_at, updated_at)
   VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
   ON CONFLICT(context, identifier) DO UPDATE SET
     attempts_count   = CASE WHEN ? > 0 AND unixepoch(first_attempt_at) + ? <= ? THEN 1 ELSE attempts_count + 1 END,
     first_attempt_at = CASE WHEN ? > 0 AND unixepoch(first_attempt_at) + ? <= ? THEN ? ELSE first_attempt_at END,
     last_attempt_at  = ?,
     updated_at       = CURRENT_TIMESTAMP
   WHERE attempts_count < ? OR (? > 0 AND unixepoch(first_attempt_at) + ? <= ?)
   RETURNING attempts_count, first_attempt_at, last_attempt_at`;

function isInvalidIdentifier(identifier) {
  if (!identifier && identifier !== 0) {return true;}
  const value = String(identifier).trim();
  if (!value) {return true;}
  return value.toLowerCase() === 'unknown';
}

function normalizeIdentifier(identifier) {
  if (isInvalidIdentifier(identifier)) {
    return null;
  }
  return String(identifier).trim().toLowerCase().slice(0, 255);
}

/**
 * Service for managing rate limiting
 *
 * The limiter is an admission control, not a counter you poll: a request either
 * reserves a unit of its window or it does not, and the two are decided by one
 * D1 statement. See `admitRequest`.
 */
export class RateLimitService extends BaseService {
  constructor(env) {
    super(env, 'RateLimitService');
    this.kvService = createKvConfigService(env);
    rateLimitService_log('RateLimitService initialized with optimized config management');
  }

  /**
   * Reserve one unit of a window, or refuse.
   *
   * D1 is the only authority. A cached copy cannot answer this question: KV has
   * no compare-and-set, so a KV-based limiter is a read followed by a write and
   * two concurrent callers can both be admitted. The old implementation had
   * that path, preferred it whenever a KV binding existed, and fell back to
   * `allowed: true` when either store failed - so a stale or broken cache did
   * not fail the request, it waved it through. Configuration still comes from
   * KV through the base service; only the counter is authoritative in D1.
   *
   * @param {string} identifier - IP, email or user id to limit
   * @param {Object} [options] - Window description
   * @param {string} [options.context] - Counter context, part of the key
   * @param {number} [options.limit] - Admissions allowed per window
   * @param {number} [options.windowSeconds] - Window length; 0 disables the reset
   * @param {string} [options.unresolvedBucket] - Bucket for unusable identifiers
   * @returns {Promise<{allowed: boolean, attempts: number, limit: number, retryAfterSeconds: number, context: string, windowSeconds: number, skipped?: boolean, reason?: string}>} Admission decision
   * @throws {ServiceUnavailableError} When the counter cannot be read or written
   */
  async admitRequest(identifier, options = {}) {
    const resolved = await this._resolveAdmissionOptions(options);

    if (resolved.disabled) {
      return {
        allowed: true,
        attempts: 0,
        limit: resolved.limit,
        retryAfterSeconds: 0,
        context: resolved.context,
        windowSeconds: resolved.windowSeconds,
        skipped: true,
        reason: 'rate_limiting_disabled'
      };
    }

    const key = normalizeIdentifier(identifier) || options.unresolvedBucket || UNRESOLVED_IDENTIFIER_BUCKET;
    const nowUnix = Math.floor(Date.now() / 1000);
    const nowIso = new Date(nowUnix * 1000).toISOString();
    const { windowSeconds, limit } = resolved;

    rateLimit_log(`Admitting request for ${key} in context ${resolved.context} (limit ${limit}/${windowSeconds}s)`);

    let admitted;
    try {
      admitted = await this.dbService.writeReturning(ADMISSION_SQL, [
        resolved.context,
        key,
        nowIso,
        nowIso,
        windowSeconds, windowSeconds, nowUnix,
        windowSeconds, windowSeconds, nowUnix, nowIso,
        nowIso,
        limit,
        windowSeconds, windowSeconds, nowUnix
      ]);
    } catch (error) {
      // A write that did not happen must not be reported as an admission. The
      // caller decides what a 503 means; it is never this layer's call to allow.
      dbError_log(`Rate limit admission failed for context ${resolved.context}: ${error.message}`);
      if (error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new ServiceUnavailableError('Rate limit counter is unavailable', {
        context: resolved.context,
        cause: error.message
      });
    }

    const row = admitted.rows[0];
    if (row) {
      return {
        allowed: true,
        attempts: Number(row.attempts_count),
        limit,
        retryAfterSeconds: 0,
        context: resolved.context,
        windowSeconds
      };
    }

    rateLimit_log(`Rate limit exceeded for ${key} in context ${resolved.context}`);
    return {
      allowed: false,
      attempts: limit,
      limit,
      retryAfterSeconds: await this._retryAfterSeconds(resolved, key, nowUnix),
      context: resolved.context,
      windowSeconds
    };
  }

  /**
   * Seconds until the current window ends.
   *
   * This is reporting only - the decision has already been made by the admission
   * statement, and nothing here can turn a denial into an admission. The row is
   * read after the fact, so a concurrent request may have moved it; the value is
   * a hint for a `Retry-After` header, and the worst case is being told to come
   * back a moment too early and be refused again.
   *
   * If the read fails the full window is reported. That is the pessimistic
   * answer and it costs the caller a retry, not an over-admission.
   * @param {Object} resolved - Resolved admission options
   * @param {string} key - Counter key the admission used
   * @param {number} nowUnix - Current time in whole seconds
   * @returns {Promise<number>} Seconds to wait
   */
  async _retryAfterSeconds(resolved, key, nowUnix) {
    if (resolved.windowSeconds <= 0) {
      return 1;
    }
    try {
      const row = await this.dbService.select(
        `SELECT attempts_count, first_attempt_at
         FROM rate_limit_counters
         WHERE context = ? AND identifier = ?`,
        [resolved.context, key],
        true
      );
      if (!row) {
        return resolved.windowSeconds;
      }
      const windowStartedAt = Math.floor(Date.parse(row.first_attempt_at) / 1000);
      if (!Number.isFinite(windowStartedAt)) {
        return resolved.windowSeconds;
      }
      const remaining = resolved.windowSeconds - (nowUnix - windowStartedAt);
      return remaining > 0 ? remaining : 1;
    } catch (error) {
      dbError_log(`Rate limit retry-after lookup failed for context ${resolved.context}: ${error.message}`);
      return resolved.windowSeconds;
    }
  }

  /**
   * Option precedence: an explicit option wins, otherwise the environment
   * configuration applies. `lockoutDuration` is published in minutes and becomes
   * the window in seconds, which is how it was read before and is kept so no
   * deployment's effective limit changes silently.
   * @param {Object} options - Caller options
   * @returns {Promise<Object>} Resolved options
   */
  async _resolveAdmissionOptions(options) {
    const config = await this.getRateLimitConfig();
    const context = options.context || DEFAULT_CONTEXT;
    const limit = typeof options.limit === 'number' && options.limit > 0
      ? options.limit
      : config.maxAttempts;
    const lockoutSeconds = typeof options.blockDurationSeconds === 'number'
      ? Math.max(0, options.blockDurationSeconds)
      : config.lockoutDuration * 60;
    const windowSeconds = typeof options.windowSeconds === 'number'
      ? Math.max(0, options.windowSeconds)
      : lockoutSeconds;

    return {
      context,
      limit,
      windowSeconds,
      disabled: config.disabled === true
    };
  }

  /**
   * Release a budget.
   *
   * Used where the policy really is "this key is no longer under attack" - a
   * successful login for the account itself. It is deliberately not applied to a
   * shared per-IP budget: one account logging in successfully would otherwise
   * hand every other attempt from that address a fresh window.
   * @param {string} identifier - Identifier to release
   * @param {Object} [options] - Context description
   * @returns {Promise<boolean>} True when released
   * @throws {ServiceUnavailableError} When the counter cannot be deleted
   */
  async resetFailedAttempts(identifier, options = {}) {
    const key = normalizeIdentifier(identifier);
    const context = options.context || DEFAULT_CONTEXT;

    if (!key) {
      return true;
    }

    try {
      await this.dbService.delete(
        'DELETE FROM rate_limit_counters WHERE context = ? AND identifier = ?',
        [context, key]
      );
      return true;
    } catch (error) {
      dbError_log(`Failed to reset rate limit counter: ${error.message}`);
      if (error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new ServiceUnavailableError('Rate limit counter is unavailable', {
        context,
        cause: error.message
      });
    }
  }

  /**
   * Get attempt count for identifier/context
   * @param {string} identifier - IP/email/user
   * @param {Object} options - Context configuration
   * @returns {Promise<number>} Number of attempts recorded
   */
  async getAttemptCount(identifier, options = {}) {
    const key = normalizeIdentifier(identifier);
    const context = options.context || DEFAULT_CONTEXT;

    if (!key) {
      return 0;
    }

    try {
      const record = await this.dbService.select(
        `SELECT attempts_count
         FROM rate_limit_counters
         WHERE context = ? AND identifier = ?`,
        [context, key],
        true
      );

      return record ? record.attempts_count : 0;
    } catch (error) {
      dbError_log(`Error getting rate limit count: ${error.message}`);
      if (error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new ServiceUnavailableError('Rate limit counter is unavailable', {
        context,
        cause: error.message
      });
    }
  }
}
