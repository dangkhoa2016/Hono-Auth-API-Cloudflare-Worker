/**
 * Authentication Validation Schemas
 * I18n-aware Zod schemas for authentication endpoints
 */

import { createSchemaBuilder } from './base.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create login schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createLoginSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    email: builder.email(),
    password: builder.password()
  }, 'login');
}

/**
 * Create refresh token schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createRefreshTokenSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    refresh_token: builder.jwtToken('refreshToken')
  }, 'refreshToken');
}

/**
 * Create logout schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createLogoutSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    refresh_token: builder.jwtToken('refreshToken')
  }, 'logout');
}

/**
 * Create logout-all schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createLogoutAllSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    refresh_token: builder.jwtToken('refreshToken')
  }, 'logoutAll');
}

/**
 * Create password reset request schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createPasswordResetRequestSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    email: builder.email()
  }, 'passwordResetRequest');
}

/**
 * Create password reset confirmation schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createPasswordResetConfirmSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    token: builder.string('token', 1, null, true),
    password: builder.password(),
    confirmPassword: builder.string('confirmPassword', 1, null, true)
  }, 'passwordResetConfirm').refine((data) => data.password === data.confirmPassword, {
    message: builder.tl('validation.confirmPassword.mustMatch'),
    path: ['confirmPassword']
  });
}

/**
 * Create all authentication i18n schemas at once
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} All authentication schemas with translated messages
 */
export function createAuthI18nSchemas(lang = 'en') {
  return {
    loginSchema: createLoginSchema(lang),
    refreshTokenSchema: createRefreshTokenSchema(lang),
    logoutSchema: createLogoutSchema(lang),
    logoutAllSchema: createLogoutAllSchema(lang),
    passwordResetRequestSchema: createPasswordResetRequestSchema(lang),
    passwordResetConfirmSchema: createPasswordResetConfirmSchema(lang)
  };
}
