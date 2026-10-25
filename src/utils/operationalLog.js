import { redactSensitiveData } from './sensitiveData.js';

/** Explicit alert delivery is independent of opt-in diagnostic tracing. */
export function writeOperationalEvent(event, level = 'info') {
  const method = level === 'error' ? 'error' : (level === 'warn' ? 'warn' : 'info');
  // eslint-disable-next-line no-console
  console[method](JSON.stringify(redactSensitiveData(event)));
}
