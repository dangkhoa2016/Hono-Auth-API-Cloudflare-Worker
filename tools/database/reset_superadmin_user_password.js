import { pathToFileURL } from 'node:url';
import { PasswordResetError, runLocalPasswordReset } from './superadminPasswordReset.js';

// Importing the command must never open a database or change an account.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runLocalPasswordReset().catch((error) => {
    const message = error instanceof PasswordResetError
      ? error.message
      : 'Local database operation failed; check the configuration and migrations. No success was confirmed.';
    process.stderr.write(`Password reset failed: ${message}\n`);
    process.exitCode = 1;
  });
}
