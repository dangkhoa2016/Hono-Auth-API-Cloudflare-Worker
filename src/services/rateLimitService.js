import { rateLimitService_log, rateLimit_log, dbError_log } from '../utils/debug.js';
import { BaseService } from './baseService.js';

const DEFAULT_CONTEXT = 'auth:ip';

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
 * Inherits optimized config management from BaseService
*/
export class RateLimitService extends BaseService {
  constructor(env) {
    super(env, 'RateLimitService');
    rateLimitService_log('RateLimitService initialized with optimized config management');
  }

  /**
   * Check rate limit for a given identifier and context
   * @param {string} identifier - Identifier to rate limit (IP, email, userId)
   * @param {Object} options - Context-specific options
   * @returns {Promise<Object>} Rate limit evaluation result
   */
  async checkRateLimit(identifier, options = {}) {
    const normalized = normalizeIdentifier(identifier);
    const resolved = await this._resolveOptions(options);

    rateLimit_log(`Checking rate limit for identifier: ${normalized || 'N/A'} in context: ${resolved.context}`);

    if (!normalized) {
      return {
        allowed: true,
        attempts: 0,
        limit: resolved.limit,
        context: resolved.context
      };
    }

    if (resolved.disabled) {
      return {
        allowed: true,
        attempts: 0,
        limit: resolved.limit,
        context: resolved.context,
        isDisabled: true
      };
    }

    // Use KV if available (Performance Optimization)
    if (this.env.CONFIG_KV) {
      return this.checkRateLimitKV(normalized, resolved);
    }

    try {
      const record = await this.dbService.select(
        `SELECT id, attempts_count, first_attempt_at, last_attempt_at
         FROM rate_limit_counters
         WHERE context = ? AND identifier = ?`,
        [resolved.context, normalized],
        true
      );

      if (!record) {
        return {
          allowed: true,
          attempts: 0,
          limit: resolved.limit,
          context: resolved.context
        };
      }

      const now = Date.now();
      const firstAttempt = record.first_attempt_at ? Date.parse(record.first_attempt_at) : null;
      const lastAttempt = record.last_attempt_at ? Date.parse(record.last_attempt_at) : null;

      if (firstAttempt && resolved.windowSeconds > 0 && (now - firstAttempt) / 1000 > resolved.windowSeconds) {
        await this.resetFailedAttempts(normalized, resolved);
        return {
          allowed: true,
          attempts: 0,
          limit: resolved.limit,
          context: resolved.context,
          reset: true
        };
      }

      if (record.attempts_count >= resolved.limit) {
        if (lastAttempt && resolved.blockDurationSeconds > 0) {
          const elapsedSeconds = (now - lastAttempt) / 1000;
          if (elapsedSeconds < resolved.blockDurationSeconds) {
            const retryAfterSeconds = Math.max(1, Math.ceil(resolved.blockDurationSeconds - elapsedSeconds));
            rateLimit_log(`Rate limit exceeded for context ${resolved.context}, retry after ${retryAfterSeconds}s`);
            return {
              allowed: false,
              attempts: record.attempts_count,
              limit: resolved.limit,
              context: resolved.context,
              retryAfterSeconds,
              blockDurationSeconds: resolved.blockDurationSeconds
            };
          }
        }

        await this.resetFailedAttempts(normalized, resolved);
        return {
          allowed: true,
          attempts: 0,
          limit: resolved.limit,
          context: resolved.context,
          reset: true
        };
      }

      return {
        allowed: true,
        attempts: record.attempts_count,
        limit: resolved.limit,
        context: resolved.context,
        blockDurationSeconds: resolved.blockDurationSeconds
      };
    } catch (error) {
      dbError_log(`Rate limit check error: ${error.message}`);
      return {
        allowed: true,
        attempts: 0,
        limit: resolved.limit,
        context: resolved.context,
        error: error.message
      };
    }
  }

  /**
   * Check rate limit using KV
   * @param {string} normalized - Normalized identifier
   * @param {Object} resolved - Resolved options
   */
  async checkRateLimitKV(normalized, resolved) {
    const key = `ratelimit:${resolved.context}:${normalized}`;
    try {
      const record = await this.env.CONFIG_KV.get(key, 'json');
      
      if (!record) {
        return { allowed: true, attempts: 0, limit: resolved.limit, context: resolved.context };
      }

      const now = Date.now();
      // Check window reset
      if (resolved.windowSeconds > 0 && (now - record.firstAttempt) / 1000 > resolved.windowSeconds) {
        await this.resetFailedAttemptsKV(normalized, resolved);
        return { allowed: true, attempts: 0, limit: resolved.limit, context: resolved.context, reset: true };
      }

      if (record.attempts >= resolved.limit) {
        // Check lockout
        if (record.lastAttempt && resolved.blockDurationSeconds > 0) {
             const elapsed = (now - record.lastAttempt) / 1000;
             if (elapsed < resolved.blockDurationSeconds) {
                 const retryAfter = Math.ceil(resolved.blockDurationSeconds - elapsed);
                 rateLimit_log(`Rate limit exceeded (KV) for context ${resolved.context}, retry after ${retryAfter}s`);
                 return { allowed: false, attempts: record.attempts, limit: resolved.limit, context: resolved.context, retryAfterSeconds: retryAfter, blockDurationSeconds: resolved.blockDurationSeconds };
             }
        }
        // Lockout expired
        await this.resetFailedAttemptsKV(normalized, resolved);
        return { allowed: true, attempts: 0, limit: resolved.limit, context: resolved.context, reset: true };
      }

      return { allowed: true, attempts: record.attempts, limit: resolved.limit, context: resolved.context };

    } catch (e) {
        dbError_log(`KV Rate limit check error: ${e.message}`);
        // Fallback to allow if KV fails
        return { allowed: true, attempts: 0, limit: resolved.limit, context: resolved.context, error: e.message };
    }
  }

  /**
   * Record failed attempt for the given identifier/context
   * @param {string} identifier - Identifier (IP/email/user)
   * @param {Object} options - Context configuration
   * @returns {Promise<boolean>} True if recorded successfully
   */
  async recordFailedAttempt(identifier, options = {}) {
    const normalized = normalizeIdentifier(identifier);
    const resolved = await this._resolveOptions(options);

    if (!normalized || resolved.disabled) {
      return true;
    }

    rateLimit_log(`Recording failed attempt for ${normalized} in context ${resolved.context}`);

    // Use KV if available
    if (this.env.CONFIG_KV) {
      return this.recordFailedAttemptKV(normalized, resolved);
    }

    try {
      const nowIso = new Date().toISOString();
      const existing = await this.dbService.select(
        `SELECT id, attempts_count, first_attempt_at
         FROM rate_limit_counters
         WHERE context = ? AND identifier = ?`,
        [resolved.context, normalized],
        true
      );

      const metadataJson = resolved.metadata ? JSON.stringify(resolved.metadata).slice(0, 1024) : null;

      if (!existing) {
        await this.dbService.insert(
          `INSERT INTO rate_limit_counters (
             context, identifier, attempts_count, first_attempt_at,
             last_attempt_at, metadata, created_at, updated_at
           ) VALUES (?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)` ,
          [resolved.context, normalized, nowIso, nowIso, metadataJson]
        );
        return true;
      }

      const firstAttempt = existing.first_attempt_at ? Date.parse(existing.first_attempt_at) : null;
      if (firstAttempt && resolved.windowSeconds > 0 && (Date.now() - firstAttempt) / 1000 > resolved.windowSeconds) {
        await this.dbService.update(
          `UPDATE rate_limit_counters
           SET attempts_count = 1,
               first_attempt_at = ?,
               last_attempt_at = ?,
               metadata = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [nowIso, nowIso, metadataJson, existing.id]
        );
        return true;
      }

      await this.dbService.update(
        `UPDATE rate_limit_counters
         SET attempts_count = attempts_count + 1,
             last_attempt_at = ?,
             metadata = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nowIso, metadataJson, existing.id]
      );

      return true;
    } catch (error) {
      dbError_log(`Failed to record rate limit attempt: ${error.message}`);
      return false;
    }
  }

  /**
   * Record failed attempt using KV
   * @param {string} normalized - Normalized identifier
   * @param {Object} resolved - Resolved options
   */
  async recordFailedAttemptKV(normalized, resolved) {
      const key = `ratelimit:${resolved.context}:${normalized}`;
      const now = Date.now();
      
      try {
        let record = await this.env.CONFIG_KV.get(key, 'json');
        
        if (!record) {
            record = { attempts: 1, firstAttempt: now, lastAttempt: now, metadata: resolved.metadata };
        } else {
            if (resolved.windowSeconds > 0 && (now - record.firstAttempt) / 1000 > resolved.windowSeconds) {
                record = { attempts: 1, firstAttempt: now, lastAttempt: now, metadata: resolved.metadata };
            } else {
                record.attempts++;
                record.lastAttempt = now;
                if (resolved.metadata) record.metadata = resolved.metadata;
            }
        }
        
        // Calculate TTL: Max of window or block duration
        const ttl = Math.max(resolved.windowSeconds, resolved.blockDurationSeconds, 60); // Min 60s
        await this.env.CONFIG_KV.put(key, JSON.stringify(record), { expirationTtl: ttl });
        return true;
      } catch (e) {
        dbError_log(`Failed to record rate limit attempt (KV): ${e.message}`);
        return false;
      }
  }

  /**
   * Reset failed attempts for the given identifier/context
   * @param {string} identifier - Identifier (IP/email/user)
   * @param {Object} options - Context configuration
   * @returns {Promise<boolean>} True if reset successfully
   */
  async resetFailedAttempts(identifier, options = {}) {
    const normalized = normalizeIdentifier(identifier);
    const resolved = await this._resolveOptions(options);

    if (!normalized || resolved.disabled) {
      return true;
    }

    // Use KV if available
    if (this.env.CONFIG_KV) {
      return this.resetFailedAttemptsKV(normalized, resolved);
    }

    try {
      await this.dbService.delete(
        `DELETE FROM rate_limit_counters WHERE context = ? AND identifier = ?`,
        [resolved.context, normalized]
      );
      return true;
    } catch (error) {
      dbError_log(`Failed to reset rate limit counter: ${error.message}`);
      return false;
    }
  }

  /**
   * Reset failed attempts using KV
   * @param {string} normalized - Normalized identifier
   * @param {Object} resolved - Resolved options
   */
  async resetFailedAttemptsKV(normalized, resolved) {
    const key = `ratelimit:${resolved.context}:${normalized}`;
    try {
      await this.env.CONFIG_KV.delete(key);
      return true;
    } catch (e) {
      dbError_log(`Failed to reset rate limit counter (KV): ${e.message}`);
      return false;
    }
  }

  /**
   * Get attempt count for identifier/context
   * @param {string} identifier - Identifier (IP/email/user)
   * @param {Object} options - Context configuration
   * @returns {Promise<number>} Number of attempts recorded
   */
  async getAttemptCount(identifier, options = {}) {
    const normalized = normalizeIdentifier(identifier);
    const resolved = await this._resolveOptions(options);

    if (!normalized || resolved.disabled) {
      return 0;
    }

    // Use KV if available
    if (this.env.CONFIG_KV) {
      return this.getAttemptCountKV(normalized, resolved);
    }

    try {
      const record = await this.dbService.select(
        `SELECT attempts_count
         FROM rate_limit_counters
         WHERE context = ? AND identifier = ?`,
        [resolved.context, normalized],
        true
      );

      return record ? record.attempts_count : 0;
    } catch (error) {
      dbError_log(`Error getting rate limit count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get attempt count using KV
   * @param {string} normalized - Normalized identifier
   * @param {Object} resolved - Resolved options
   */
  async getAttemptCountKV(normalized, resolved) {
    const key = `ratelimit:${resolved.context}:${normalized}`;
    try {
      const record = await this.env.CONFIG_KV.get(key, 'json');
      return record ? record.attempts : 0;
    } catch (e) {
      dbError_log(`Error getting rate limit count (KV): ${e.message}`);
      return 0;
    }
  }

  async _resolveOptions(options) {
    const config = await this.getRateLimitConfig();
    const context = options.context || DEFAULT_CONTEXT;
    const limit = typeof options.limit === 'number' && options.limit > 0 ? options.limit : config.maxAttempts;
    const lockoutSeconds = typeof options.blockDurationSeconds === 'number'
      ? Math.max(0, options.blockDurationSeconds)
      : config.lockoutDuration * 60;
    const windowSeconds = typeof options.windowSeconds === 'number'
      ? Math.max(0, options.windowSeconds)
      : lockoutSeconds;

    return {
      context,
      limit,
      blockDurationSeconds: lockoutSeconds,
      windowSeconds,
      metadata: options.metadata || null,
      disabled: config.disabled,
      isDisabled: config.disabled
    };
  }
}
