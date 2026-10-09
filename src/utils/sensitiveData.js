/**
 * Shared sensitive-data registry and redaction helpers.
 * Used by debug logging, audit capture and KV/env comparison so that a secret
 * value is never serialized to logs, audit entries or API responses.
 */

export const REDACTED = '[REDACTED]';
export const MASKED = '***MASKED***';
export const URL_REDACTED = 'REDACTED';

const SENSITIVE_KEY_PATTERNS = [
  'password',
  'passwd',
  'passphrase',
  'secret',
  'token',
  'credential',
  'authorization',
  'cookie',
  'set-cookie',
  'apikey',
  'api_key',
  'access_key',
  'private_key',
  'signature',
  'session',
  'jti'
];

const SENSITIVE_QUERY_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'password',
  'passwd',
  'secret',
  'api_key',
  'apikey',
  'key',
  'code',
  'auth',
  'authorization',
  'credential',
  'jti'
]);

const DEFAULT_MAX_DEPTH = 6;
const DEFAULT_MAX_KEYS = 200;
const DEFAULT_MAX_STRING = 512;

export function isSensitiveKey(key) {
  if (typeof key !== 'string' || key.length === 0) {
    return false;
  }
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Describes a config value for logs/comparison output.
 * Sensitive keys never render their value, only presence and a short type hint.
 */
export function describeConfigValue(key, value) {
  if (isSensitiveKey(key)) {
    if (value === null || value === undefined || value === '') {
      return '<unset>';
    }
    return '<redacted:set>';
  }
  if (typeof value === 'string') {
    return redactText(value, { maxString: 128 });
  }
  return value;
}


export function maskSecret(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    return MASKED;
  }
  return `${value.slice(0, 2)}${'*'.repeat(6)}`;
}

/**
 * Authorization schemes that may be named in a log line. The value is
 * client-controlled, so an unknown scheme is reported as `unknown`/`opaque`
 * with a length only — never echoed back.
 */
const KNOWN_AUTH_SCHEMES = new Set(['bearer', 'basic', 'token', 'digest', 'apikey', 'negotiate']);

/**
 * Describe an Authorization-like header without exposing the credential or any
 * client-controlled text.
 * @param {string} header - Raw header value
 * @returns {string} e.g. `bearer`, `unknown, 24 chars`, `opaque, 9 chars`
 */
export function describeAuthScheme(header) {
  if (!header) {
    return 'absent';
  }
  const value = String(header);
  const separator = value.search(/\s/);
  if (separator === -1) {
    // A bare credential with no scheme: report the length, never the content.
    return `opaque, ${value.length} chars`;
  }
  const scheme = value.slice(0, separator).toLowerCase();
  if (!KNOWN_AUTH_SCHEMES.has(scheme)) {
    return `unknown, ${value.length} chars`;
  }
  return scheme;
}

/**
 * Describe the shape of a stored/returned value without rendering it.
 * Used by sinks that only need to prove a value exists and its type.
 * @param {*} value - Any value
 * @returns {string} e.g. `string(24)`
 */
export function describeValueShape(value) {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return `string(${value.length})`;
  }
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }
  if (typeof value === 'object') {
    return `object(${Object.keys(value).length} keys)`;
  }
  return typeof value;
}

/**
 * Returns a safe copy of any value with sensitive keys/values redacted.
 * Never mutates the input, so business logic keeps receiving real values.
 */
export function redactSensitiveData(value, options = {}) {
  const maxDepth = Number.isInteger(options.maxDepth) ? options.maxDepth : DEFAULT_MAX_DEPTH;
  const maxKeys = Number.isInteger(options.maxKeys) ? options.maxKeys : DEFAULT_MAX_KEYS;
  const maxString = Number.isInteger(options.maxString) ? options.maxString : DEFAULT_MAX_STRING;
  const seen = new WeakSet();

  const walk = (node, depth) => {
    if (node === null || node === undefined) {
      return node;
    }
    if (typeof node === 'string') {
      // Strings are untrusted free text: URL queries, bearer tokens and JSON
      // payloads can hide a credential under an innocuous key, so pattern
      // redaction runs before truncation here too.
      return redactStringByPattern(node, maxString);
    }
    if (typeof node === 'number' || typeof node === 'boolean' || typeof node === 'bigint') {
      return node;
    }
    if (typeof node === 'function' || typeof node === 'symbol') {
      return `[${typeof node}]`;
    }
    if (node instanceof Date) {
      return node.toISOString();
    }
    if (node instanceof Error) {
      return { name: node.name, message: redactStringByPattern(node.message, maxString) };
    }
    if (depth >= maxDepth) {
      return '[TRUNCATED_DEPTH]';
    }
    if (typeof node === 'object') {
      if (seen.has(node)) {
        return '[CIRCULAR]';
      }
      seen.add(node);

      if (Array.isArray(node)) {
        const out = node.slice(0, maxKeys).map((item) => walk(item, depth + 1));
        if (node.length > maxKeys) {
          out.push(`...[truncated ${node.length - maxKeys} items]`);
        }
        return out;
      }

      const out = {};
      let count = 0;
      for (const [key, item] of Object.entries(node)) {
        if (count >= maxKeys) {
          out.__truncatedKeys = Object.keys(node).length - count;
          break;
        }
        count += 1;
        if (isSensitiveKey(key)) {
          out[key] = item === null || item === undefined || item === '' ? null : REDACTED;
          continue;
        }
        out[key] = walk(item, depth + 1);
      }
      return out;
    }
    return String(node);
  };

  return walk(value, 0);
}

const BEARER_PATTERN = /\b(Bearer|Basic|Token)\s+[A-Za-z0-9._~+/=-]{4,}/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9._-]{6,}/g;
const QUERY_SECRET_PATTERN =
  /([?&#](?:token|access_token|refresh_token|id_token|password|secret|api_key|apikey|code|auth|credential|jti)=)([^&\s#]+)/gi;
/**
 * A sensitive key followed by an encoded or literal `=`, with an optional
 * encoded/literal query separator in front. This intentionally does not require
 * a leading `?`/`&`/`%3F`: a credential whose query string is percent-encoded
 * into the path (`/activate%3Ftoken%3D…`) must still be recognised before any
 * decoding is attempted, because decoding may fail.
 */
const ASSIGNED_SECRET_PATTERN =
  /((?:%3[fF]|%26|[?&#])?(?:token|access_token|refresh_token|id_token|password|secret|api_key|apikey|code|auth|authorization|credential|jti)(?:%3[dD]|=))([^&\s#%]*)/gi;
const SENSITIVE_KEY_NEIGHBOUR_PATTERN =
  /(?:token|access_token|refresh_token|id_token|password|secret|api_key|apikey|code|auth|authorization|credential|jti)/i;

const MAX_DECODE_ROUNDS = 3;
const MAX_DECODE_LENGTH = 4096;

/**
 * Decode a percent-encoded string.
 * @param {string} value - Possibly encoded string
 * @returns {string|null} Decoded string, or `null` when the input contains a
 * malformed escape. Returning the raw input here would hand a credential that
 * only looks encoded straight to the caller, so callers must treat `null` as
 * "this fragment cannot be parsed safely".
 */
function safeDecode(value) {
  if (typeof value !== 'string' || !value.includes('%')) {
    return value;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Locate the first percent escape that is not two hex digits.
 * @param {string} value - Candidate string
 * @returns {number} Index of the malformed `%`, or -1 when every escape is valid
 */
function findMalformedEscapeIndex(value) {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '%') {
      continue;
    }
    if (!/^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))) {
      return index;
    }
  }
  return -1;
}

/**
 * Redact a JSON document that was embedded inside a string field, so a
 * `details` payload serialized as text cannot smuggle a credential past the
 * key-based redaction.
 * @param {string} value - Candidate string
 * @returns {string} Redacted JSON text, or the original when it is not JSON
 */
function redactEmbeddedJson(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return value;
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return value;
  }
  try {
    return JSON.stringify(redactSensitiveData(parsed));
  } catch {
    return value;
  }
}

function redactStringByPattern(value, maxString = DEFAULT_MAX_STRING, decodeRounds = 0) {
  if (typeof value !== 'string') {
    return value;
  }
  const withEmbeddedJson = redactEmbeddedJson(value);
  let out = withEmbeddedJson.replace(BEARER_PATTERN, '$1 [REDACTED]');
  out = out.replace(JWT_PATTERN, '[REDACTED_JWT]');
  out = out.replace(QUERY_SECRET_PATTERN, '$1[REDACTED]');
  out = out.replace(ASSIGNED_SECRET_PATTERN, '$1[REDACTED]');

  // An encoded query is only reliably visible after decoding, so redact the
  // decoded view too and keep it when it turned out to be safer. Decoding is
  // bounded in rounds and length so a crafted input cannot force deep
  // recursion, and a fragment that cannot be decoded is dropped rather than
  // returned verbatim.
  if (decodeRounds < MAX_DECODE_ROUNDS && out.length <= MAX_DECODE_LENGTH) {
    const decoded = safeDecode(out);
    if (decoded === null) {
      const malformedAt = findMalformedEscapeIndex(out);
      if (malformedAt !== -1 && SENSITIVE_KEY_NEIGHBOUR_PATTERN.test(out)) {
        out = `${out.slice(0, malformedAt)}[REDACTED_UNPARSED]`;
      }
    } else if (decoded !== out) {
      const redactedDecoded = redactStringByPattern(decoded, maxString, decodeRounds + 1);
      out = redactedDecoded.includes('[REDACTED]') ? redactedDecoded : out;
    }
  } else if (out.length > MAX_DECODE_LENGTH) {
    out = `${out.slice(0, MAX_DECODE_LENGTH)}...[truncated]`;
  }
  return out.length > maxString ? `${out.slice(0, maxString)}...[truncated]` : out;
}

export function redactText(value, options = {}) {
  return redactStringByPattern(value, options.maxString ?? DEFAULT_MAX_STRING);
}

/**
 * Masks sensitive query parameters on a URL or path+query string.
 * Returns the input unchanged when it cannot be parsed.
 */
export function sanitizeAuditUrl(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }
  const sanitized = redactStringByPattern(value, 2048);
  if (!sanitized.includes('?')) {
    return sanitized;
  }
  const hashIndex = sanitized.indexOf('#');
  const base = hashIndex === -1 ? sanitized : sanitized.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : sanitized.slice(hashIndex);
  const queryIndex = base.indexOf('?');
  if (queryIndex === -1) {
    return sanitized;
  }
  const path = base.slice(0, queryIndex);
  const query = base.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  for (const key of [...params.keys()]) {
    if (isSensitiveKey(key) || SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
      params.set(key, URL_REDACTED);
    }
  }
  return `${path}?${params.toString()}${fragment}`;
}

export function sanitizeHeaders(headers = {}) {
  const out = {};
  for (const [key, value] of Object.entries(headers || {})) {
    const lower = key.toLowerCase();
    if (lower === 'authorization' || lower === 'cookie' || lower === 'set-cookie' || lower === 'x-api-key') {
      out[key] = value ? REDACTED : value;
      continue;
    }
    out[key] = redactText(String(value));
  }
  return out;
}
