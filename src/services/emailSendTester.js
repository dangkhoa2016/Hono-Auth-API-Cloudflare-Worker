import { BaseService } from './baseService.js';
import { EmailService, generateActivationToken } from './emailService.js';

/**
 * Utility class to verify email settings and send manual test emails.
 * Default environment name is "development".
 */
export class EmailSendTester extends BaseService {
  constructor(env, options = {}) {
    super(env, 'EmailSendTester');
    this.envName = options.envName || 'development';
    this.emailService = new EmailService(env);
  }

  /**
   * Verify essential email settings for the current environment.
   * @returns {Promise<{env: string, provider: string, enabled: boolean, confirmationEnabled: boolean, missing: string[], warnings: string[], values: Object}>}
   */
  async verifySettings() {
    const emailConfig = await this.getEmailConfig();
    const provider = emailConfig.provider.toLowerCase();

    const missing = [];
    const warnings = [];
    const notes = [];

    const secretKeys = ['EMAIL_PROVIDER_API_KEY'];
    const maskValue = (key, value) => {
      if (value === undefined || value === null || value === '') {return '(empty)';}
      return secretKeys.includes(key) ? '***' : value;
    };

    const requiredKeys = [
      {
        key: 'EMAIL_ENABLED',
        present: emailConfig.enabled === true || emailConfig.enabled === 'true',
        value: emailConfig.enabled
      },
      {
        key: 'EMAIL_CONFIRMATION_ENABLED',
        present: emailConfig.confirmationEnabled === true || emailConfig.confirmationEnabled === 'true',
        value: emailConfig.confirmationEnabled
      },
      {
        key: 'EMAIL_FROM_ADDRESS',
        present: Boolean(emailConfig.fromAddress),
        value: maskValue('EMAIL_FROM_ADDRESS', emailConfig.fromAddress)
      },
      {
        key: 'EMAIL_PROVIDER_ENDPOINT',
        present: Boolean(emailConfig.providerEndpoint),
        value: maskValue('EMAIL_PROVIDER_ENDPOINT', emailConfig.providerEndpoint)
      }
    ];

    if (provider === 'brevo') {
      requiredKeys.push({
        key: 'EMAIL_PROVIDER_API_KEY',
        present: Boolean(emailConfig.providerApiKey),
        value: maskValue('EMAIL_PROVIDER_API_KEY', emailConfig.providerApiKey)
      });
      if (!emailConfig.providerApiKey) {
        notes.push('EMAIL_PROVIDER_API_KEY is mandatory for Brevo');
      }
    }

    // Guidance notes for provider selection and current state
    notes.push(`Current provider=${provider}`);
    if (provider !== 'brevo') {
      notes.push('To use Brevo, set EMAIL_PROVIDER=brevo and provide EMAIL_PROVIDER_API_KEY');
    }

    const optionalKeys = [
      {
        key: 'EMAIL_PROVIDER',
        value: provider
      },
      {
        key: 'EMAIL_FROM_NAME',
        present: Boolean(emailConfig.fromName),
        value: maskValue('EMAIL_FROM_NAME', emailConfig.fromName)
      },
      {
        key: 'EMAIL_REPLY_TO',
        present: Boolean(emailConfig.replyTo),
        value: maskValue('EMAIL_REPLY_TO', emailConfig.replyTo)
      },
      {
        key: 'EMAIL_PROVIDER_AUTH_HEADER',
        present: Boolean(emailConfig.providerAuthHeader),
        value: maskValue('EMAIL_PROVIDER_AUTH_HEADER', emailConfig.providerAuthHeader)
      }
    ];

    for (const req of requiredKeys) {
      if (!req.present) {
        missing.push(req.key);
      }
    }

    if (!emailConfig.fromName) {warnings.push('EMAIL_FROM_NAME not set (fallback will be app name)');}

    if (!emailConfig.enabled) {
      warnings.push('EMAIL_ENABLED is false (emails will be skipped)');
    }

    if (!emailConfig.confirmationEnabled) {
      warnings.push('EMAIL_CONFIRMATION_ENABLED is false (registration emails will be skipped)');
    }

    return {
      env: this.envName,
      provider,
      enabled: Boolean(emailConfig.enabled),
      confirmationEnabled: Boolean(emailConfig.confirmationEnabled),
      missing,
      warnings,
      notes,
      requiredKeys,
      optionalKeys,
      values: {
        fromAddress: emailConfig.fromAddress,
        fromName: emailConfig.fromName,
        replyTo: emailConfig.replyTo,
        providerEndpoint: emailConfig.providerEndpoint,
        providerAuthHeader: emailConfig.providerAuthHeader,
        providerApiKeyPresent: Boolean(emailConfig.providerApiKey),
      }
    };
  }

  /**
   * Send a manual test registration confirmation email using EmailService logic.
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} [params.name] - Recipient name
   * @param {string} [params.locale='en'] - Locale for email content
   * @param {string} [params.ipAddress='203.0.113.10'] - Simulated IP
   * @param {string} [params.baseUrl] - Activation base URL override
    * @param {boolean} [params.preview=false] - Preview mode (no send)
    * @param {boolean} [params.debug=false] - Debug mode (return error details)
   * @returns {Promise<Object>} Result from EmailService
   */
  async manuallySendRegistrationConfirmation({ to, name, locale = 'en', ipAddress = '203.0.113.10', baseUrl, preview = false, debug = false }) {
    if (!to) {
      return { success: false, error: 'MISSING_RECIPIENT', message: 'Recipient email is required' };
    }

    const user = {
      email: to,
      full_name: name || to,
      activation_token: generateActivationToken()
    };

    const context = {
      locale,
      ipAddress,
      baseUrl,
      userAgent: 'email-manual-tester',
      preview,
      debug
    };

    return await this.emailService.sendRegistrationConfirmation(user, context);
  }
}
