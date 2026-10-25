import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { ROLES } from '../../src/constants/roles.js';
import { SCHEMA_CONFIG } from '../../src/schemas/base.js';

export class PasswordResetError extends Error {}

function validateSelector({ email, userId }) {
  if ((email !== undefined) === (userId !== undefined)) {
    throw new PasswordResetError('Provide exactly one selector: email or user-id.');
  }
  if (email !== undefined) {
    if (typeof email !== 'string' || email.length > SCHEMA_CONFIG.EMAIL_MAX_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new PasswordResetError('Provide a valid email selector.');
    }
    return { where: 'email = ? COLLATE NOCASE', value: email };
  }
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new PasswordResetError('Provide a positive integer user-id selector.');
  }
  return { where: 'id = ?', value: userId };
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < SCHEMA_CONFIG.PASSWORD_MIN_LENGTH || password.length > SCHEMA_CONFIG.PASSWORD_MAX_LENGTH) {
    throw new PasswordResetError(`Password must contain ${SCHEMA_CONFIG.PASSWORD_MIN_LENGTH}–${SCHEMA_CONFIG.PASSWORD_MAX_LENGTH} characters.`);
  }
}

/** Reset exactly one selected super-admin using an existing local D1 binding. */
export async function resetSuperAdminPassword(db, { email, userId, password } = {}) {
  const selector = validateSelector({ email, userId });
  validatePassword(password);
  const selected = await db.prepare(`SELECT id, role, password FROM users WHERE ${selector.where} LIMIT 2`)
    .bind(selector.value).all();
  if (selected.results.length !== 1) {
    throw new PasswordResetError('Account not found or ambiguous; exactly one account is required.');
  }
  const user = selected.results[0];
  if (user.role !== ROLES.SUPER_ADMIN) {
    throw new PasswordResetError('The selected account is not a super_admin.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // Recheck the selection, role and original credential in the atomic write.
  // A concurrent reset or newly ambiguous email must fail rather than overwrite.
  let results;
  try {
    results = await db.batch([
      db.prepare(`
        UPDATE users SET password = ?, auth_version = auth_version + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND role = ? AND password = ? AND ${selector.where}
          AND (SELECT COUNT(*) FROM users WHERE ${selector.where}) = 1
      `).bind(hashedPassword, user.id, ROLES.SUPER_ADMIN, user.password, selector.value, selector.value),
      // Abort the transaction if a concurrent change prevented the credential
      // write. SQLite integer overflow makes this guard rollback the batch.
      db.prepare('SELECT CASE WHEN changes() = 1 THEN 1 ELSE abs(-9223372036854775808) END AS reset_verified'),
      db.prepare(`UPDATE refresh_tokens SET revoked = 1, revoked_at = ?,
        revocation_reason = 'PASSWORD_RESET', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND revoked = 0`).bind(new Date().toISOString(), user.id)
    ]);
  } catch {
    throw new PasswordResetError('Password update and session revocation did not complete; no success was confirmed.');
  }
  if (results[0]?.success !== true || results[0].meta?.changes !== 1) {
    throw new PasswordResetError('Password update did not change exactly one account; no success was confirmed.');
  }
  return { userId: user.id };
}

const USAGE = `Usage: node tools/database/reset_superadmin_user_password.js --env test|development (--email ADDRESS | --user-id ID) [--config PATH]
Local D1 only. Apply migrations first. Supply the password through piped stdin
or RESET_SUPERADMIN_PASSWORD; never pass a password as a command argument.
The password must contain ${SCHEMA_CONFIG.PASSWORD_MIN_LENGTH}–${SCHEMA_CONFIG.PASSWORD_MAX_LENGTH} characters.
The default config is wrangler.toml; local storage is .wrangler/state/v3 under the current directory.
`;

/** Command boundary; injectable local resource ownership also permits D1 tests. */
export async function runLocalPasswordReset({
  args = process.argv.slice(2), env = process.env,
  stdin = process.stdin, stdout = process.stdout,
  createProxy = async (options) => (await import('wrangler')).getPlatformProxy(options)
} = {}) {
  if (args.length === 1 && args[0] === '--help') {
    stdout.write(USAGE);
    return;
  }
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!['--env', '--email', '--user-id', '--config'].includes(key) || options[key] !== undefined || !value || value.startsWith('--')) {
      throw new PasswordResetError('Invalid arguments. Use --help; passwords must come from stdin or RESET_SUPERADMIN_PASSWORD.');
    }
    options[key] = value;
  }
  const environment = options['--env'];
  if (!['test', 'development'].includes(environment)) {
    throw new PasswordResetError('Select --env test or --env development; only local D1 is supported.');
  }
  const email = options['--email'];
  const id = options['--user-id'];
  const userId = id === undefined ? undefined : (/^[1-9]\d*$/.test(id) ? Number(id) : NaN);
  validateSelector({ email, userId });

  let password = env.RESET_SUPERADMIN_PASSWORD;
  if (password === undefined) {
    if (stdin.isTTY) {
      throw new PasswordResetError('Supply the password through piped stdin or RESET_SUPERADMIN_PASSWORD.');
    }
    let input = '';
    stdin.setEncoding('utf8');
    for await (const chunk of stdin) {
      input += chunk.toString();
      if (input.length > SCHEMA_CONFIG.PASSWORD_MAX_LENGTH + 2) {
        throw new PasswordResetError('Password input is too long.');
      }
    }
    password = input.replace(/\r?\n$/, '');
    if (/[\r\n]/.test(password)) {
      throw new PasswordResetError('Supply one password line through stdin.');
    }
  }
  validatePassword(password);

  const proxy = await createProxy({
    configPath: options['--config'] || fileURLToPath(new URL('../../wrangler.toml', import.meta.url)),
    environment, remoteBindings: false, envFiles: []
  });
  try {
    if (!proxy.env?.DB) {
      throw new PasswordResetError('Local D1 binding DB is missing; check the selected configuration.');
    }
    const result = await resetSuperAdminPassword(proxy.env.DB, { email, userId, password });
    stdout.write(`Local ${environment} password reset completed for user ID ${result.userId}.\n`);
    return result;
  } finally {
    await proxy.dispose();
  }
}
