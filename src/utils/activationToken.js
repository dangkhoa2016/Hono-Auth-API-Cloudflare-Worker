/** Generate a 64-character alphanumeric token using Web Crypto only. */
export function generateActivationToken() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(96);
  let token = '';
  while (token.length < 64) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      // Reject the incomplete remainder of 256 / 62 to avoid modulo bias.
      if (byte >= 248) {continue;}
      token += alphabet[byte % alphabet.length];
      if (token.length === 64) {break;}
    }
  }
  return token;
}
