import { BaseService } from './baseService.js';
import { emailService_log, error_log } from '../utils/debug.js';
import { getAppSettings } from '../utils/dynamicConfig.js';
import { tl, getDefaultLanguage, isLanguageSupported } from '../i18n/index.js';


/**
 * Format date/time in user-friendly format based on locale
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale code (en, vi, fr, etc.)
 * @returns {{date: string, time: string}} Formatted date and time
 */
export function formatDateTime(date, locale) {
  const d = new Date(date);

  const dateOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const localeMap = {
    'vi': 'vi-VN',
    'en': 'en-US',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'th': 'th-TH'
  };

  const localeCode = localeMap[locale] || 'en-US';

  const formattedDate = d.toLocaleDateString(localeCode, dateOptions);
  const formattedTime = d.toLocaleTimeString(localeCode, timeOptions);

  return { date: formattedDate, time: formattedTime };
}

/**
 * Generate activation token (64-char random string)
 * @returns {string} Random activation token
 */
export function generateActivationToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Build registration email content with i18n support
 * This is a standalone function that can be used by both EmailService and test tools
 *
 * @param {Object} params - Parameters for building email
 * @param {Object} params.user - User data { email, full_name, activation_token }
 * @param {Object} params.context - Context { locale, ipAddress }
 * @param {string} params.appName - Application name
 * @param {string} params.baseUrl - Base URL for activation link
 * @returns {Promise<{subject: string, plainText: string, htmlBody: string, lang: string, activationUrl: string}>}
 */
export async function buildRegistrationEmailContent({ user, context = {}, appName = 'Hono Auth API', baseUrl = 'https://your-app.com' }) {
  const desiredLang = context.locale;
  const lang = (desiredLang && isLanguageSupported(desiredLang)) ? desiredLang : await getDefaultLanguage();

  // Load language if needed
  try {
    const { loadLanguage, isLanguageLoaded } = await import('../i18n/config.js');
    if (!isLanguageLoaded(lang)) {
      await loadLanguage(lang);
    }
  } catch (loadErr) {
    emailService_log(`Language preload failed for ${lang}: ${loadErr.message}`);
  }

  const safeTl = (key, options, fallback) => {
    try {
      return tl(lang, key, options);
    } catch (err) {
      emailService_log(`Translation fallback for ${key}: ${err.message}`);
      return fallback;
    }
  };

  const recipientName = user.full_name || user.email;
  const now = new Date();
  const { date, time } = formatDateTime(now, lang);

  // Build activation URL (token-only for security)
  const activationToken = user.activation_token || '';
  const activationUrl = activationToken ? `${baseUrl}/api/auth/activate?token=${activationToken}` : '';

  // Translation keys
  const subject = safeTl('emails.registration.subject', { appName }, `${appName} - Activate your account`);
  const greeting = safeTl('emails.registration.greeting', { userName: recipientName }, `Hello ${recipientName},`);
  const intro = safeTl('emails.registration.intro', { appName }, `Welcome to ${appName}! Your account has been created successfully.`);
  const instructions = safeTl('emails.registration.instructions', {}, 'To complete your registration and start using your account, please click the button below:');
  const activateButton = safeTl('emails.registration.activateButton', {}, 'Activate My Account');
  const activateLinkText = safeTl('emails.registration.activateLinkText', {}, 'Or copy and paste this link into your browser:');
  const details = safeTl('emails.registration.details', {}, 'Account Details');
  const emailLine = safeTl('emails.registration.email', { email: user.email }, `Email: ${user.email}`);
  const timeLine = safeTl('emails.registration.time', { date, time }, `Registered on: ${date} at ${time}`);
  const ipLine = context.ipAddress ? safeTl('emails.registration.ip', { ip: context.ipAddress }, `IP Address: ${context.ipAddress}`) : null;
  const expiryWarning = safeTl('emails.registration.expiryWarning', { hours: 48 }, 'This activation link will expire in 48 hours.');
  const disclaimer = safeTl('emails.registration.disclaimer', {}, 'If you did not create this account, you can safely ignore this email.');
  const securityNote = safeTl('emails.registration.securityNote', {}, 'For your security, never share this link with anyone.');
  const thanks = safeTl('emails.registration.thanks', { appName }, `Best regards,\nThe ${appName} Team`);
  const footer = safeTl('emails.registration.footer', { appName }, `This is an automated message from ${appName}. Please do not reply to this email.`);

  // Plain text version
  const plainText = [
    greeting,
    '',
    intro,
    '',
    instructions,
    '',
    activationUrl ? `${activateButton}: ${activationUrl}` : '',
    '',
    '─'.repeat(40),
    details,
    `• ${emailLine}`,
    `• ${timeLine}`,
    ipLine ? `• ${ipLine}` : null,
    '─'.repeat(40),
    '',
    activationUrl ? expiryWarning : '',
    '',
    disclaimer,
    securityNote,
    '',
    thanks,
    '',
    '─'.repeat(40),
    footer
  ].filter(Boolean).join('\n');

  // Beautiful HTML template
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${appName}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">${greeting}</p>
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">${intro}</p>
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 30px 0;">${instructions}</p>
              
              ${activationUrl ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${activationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                      ${activateButton}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="font-size: 14px; color: #888; text-align: center; margin: 20px 0 10px 0;">${activateLinkText}</p>
              <p style="font-size: 12px; color: #667eea; text-align: center; word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 0 0 30px 0;">
                <a href="${activationUrl}" style="color: #667eea; text-decoration: none;">${activationUrl}</a>
              </p>
              ` : ''}
              
              <!-- Account Details -->
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 0 5px 5px 0; margin: 30px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">${details}</h3>
                <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>📧</strong> ${emailLine}</p>
                <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>📅</strong> ${timeLine}</p>
                ${ipLine ? `<p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>🌐</strong> ${ipLine}</p>` : ''}
              </div>
              
              ${activationUrl ? `
              <!-- Warning -->
              <p style="font-size: 14px; color: #e67e22; background: #fef9e7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                ⏰ ${expiryWarning}
              </p>
              ` : ''}
              
              <!-- Security Note -->
              <p style="font-size: 13px; color: #888; margin: 20px 0;">${disclaimer}</p>
              <p style="font-size: 13px; color: #e74c3c; margin: 0 0 20px 0;">🔒 ${securityNote}</p>
              
              <!-- Signature -->
              <p style="font-size: 16px; color: #333; margin: 30px 0 0 0; white-space: pre-line;">${thanks}</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">${footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, plainText, htmlBody, lang, activationUrl };
}


/**
 * Lightweight email delivery service.
 * Supports HTTP providers (MailChannels, Resend, SendGrid) by default.
 */
export class EmailService extends BaseService {
  constructor(env) {
    super(env, 'EmailService');
    emailService_log('EmailService initialized with config caching');
  }

  /**
   * Build registration email content using instance configuration
   * @param {Object} user - User payload { email, full_name, activation_token }
   * @param {Object} context - Optional context { locale, ipAddress, baseUrl }
   * @returns {Promise<Object>} Email content { subject, plainText, htmlBody, lang, activationUrl }
   */
  async buildEmailContent(user, context = {}) {
    const emailConfig = await this.getEmailConfig();
    const appSettings = await getAppSettings(this.env);

    const baseUrl = context.baseUrl || emailConfig.appUrl || appSettings.url || 'https://your-app.com';

    return buildRegistrationEmailContent({
      user,
      context,
      appName: appSettings.name,
      baseUrl
    });
  }

  /**
   * Send registration confirmation email with activation link
   * @param {Object} user - User payload { email, full_name, status, id, activation_token }
   * @param {Object} context - Optional context { locale, ipAddress, userAgent, baseUrl }
   * @returns {Promise<{success: boolean, skipped?: boolean, error?: string, status?: number, provider?: string, reason?: string}>}
   */
  async sendRegistrationConfirmation(user, context = {}) {
    const emailConfig = await this.getEmailConfig();
    const provider = (emailConfig.provider || 'mailchannels').toLowerCase();
    const debugMode = Boolean(context.debug);
    delete context.debug;

    if (debugMode) {
      emailService_log(`context: ${JSON.stringify(context)}`);
    }

    if (!emailConfig.enabled || !emailConfig.confirmationEnabled) {
      emailService_log('Registration confirmation email skipped: email disabled via config');
      return { success: true, skipped: true, reason: 'EMAIL_DISABLED' };
    }

    if (!user?.email) {
      error_log('Registration confirmation email failed: missing recipient email');
      return { success: false, error: 'MISSING_RECIPIENT', message: 'Recipient email address is required' };
    }

    if (!emailConfig.fromAddress) {
      error_log('Registration confirmation email failed: missing sender address (EMAIL_FROM_ADDRESS not configured)');
      return { success: false, error: 'MISSING_SENDER', message: 'Sender address (EMAIL_FROM_ADDRESS) is not configured in KV or environment' };
    }

    // Build email content using shared function
    const { subject, plainText, htmlBody, lang, activationUrl } = await this.buildEmailContent(user, context);
    const appSettings = await getAppSettings(this.env);
    const recipientName = user.full_name || user.email;

    // Allow preview mode (skip sending) for testing/local validation
    if (context.preview) {
      emailService_log('Preview mode enabled - skipping email send');
      return {
        success: true,
        skipped: true,
        provider: emailConfig.provider,
        preview: {
          lang,
          subject,
          plainText,
          htmlBody,
          activationUrl
        }
      };
    }

    const payload = provider === 'brevo'
      ? {
        sender: {
          email: emailConfig.fromAddress,
          name: emailConfig.fromName || appSettings.name
        },
        to: [{ email: user.email, name: recipientName }],
        subject,
        htmlContent: htmlBody,
        textContent: plainText,
        ...(emailConfig.replyTo
          ? { replyTo: { email: emailConfig.replyTo, name: emailConfig.fromName || appSettings.name } }
          : {}),
        ...(context.userAgent ? { headers: { 'User-Agent': context.userAgent } } : {})
      }
      : {
        personalizations: [
          {
            to: [{ email: user.email, name: recipientName }],
            ...(context.userAgent ? { headers: { 'User-Agent': context.userAgent } } : {})
          }
        ],
        from: {
          email: emailConfig.fromAddress,
          name: emailConfig.fromName || appSettings.name
        },
        subject,
        content: [
          { type: 'text/plain', value: plainText },
          { type: 'text/html', value: htmlBody }
        ],
        ...(emailConfig.replyTo
          ? {
            reply_to: {
              email: emailConfig.replyTo,
              name: emailConfig.fromName || appSettings.name
            }
          }
          : {})
      };

    const headers = {
      'content-type': 'application/json'
    };

    const authHeader = emailConfig.providerAuthHeader || (provider === 'brevo' ? 'api-key' : 'Authorization');

    if (emailConfig.providerApiKey) {
      headers[authHeader] = emailConfig.providerApiKey;
    } else if (provider === 'brevo') {
      return {
        success: false,
        error: 'MISSING_API_KEY',
        message: 'Brevo provider requires EMAIL_PROVIDER_API_KEY'
      };
    }

    const endpoint = emailConfig.providerEndpoint || (provider === 'brevo'
      ? 'https://api.brevo.com/v3/smtp/email'
      : 'https://api.mailchannels.net/tx/v1/send');

    try {
      if (debugMode) {
        emailService_log(`Headers: ${JSON.stringify(headers)}`);
        emailService_log(`Payload: ${JSON.stringify(payload)}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        error_log(`Email send failed with status ${response.status}: ${bodyText}`);
        return {
          success: false,
          error: 'EMAIL_SEND_FAILED',
          status: response.status,
          provider: emailConfig.provider,
          ...(debugMode ? {
            debug: {
              endpoint,
              authHeader,
              apiKeyPresent: Boolean(emailConfig.providerApiKey),
              body: bodyText
            }
          } : {})
        };
      }

      emailService_log(`Registration confirmation email sent to ${user.email} via ${emailConfig.provider}`);
      return { success: true, provider: emailConfig.provider, activationUrl };
    } catch (error) {
      error_log(`Email send error: ${error.message}`);
      return {
        success: false,
        error: 'EMAIL_SEND_ERROR',
        provider: emailConfig.provider,
        ...(debugMode ? {
          debug: {
            endpoint,
            authHeader,
            apiKeyPresent: Boolean(emailConfig.providerApiKey),
            message: error.message
          }
        } : {})
      };
    }
  }
}
