/**
 * User Management Validation Schemas
 * I18n-aware Zod schemas for user management endpoints
 */

import { createSchemaBuilder } from './base.js';
import { getAllRoles, DEFAULT_USER_ROLE, getAllUserStatuses, DEFAULT_USER_STATUS } from '../constants/roles.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create update user schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createUpdateUserSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    full_name: builder.name().optional(),
    email: builder.email(false).optional(),
    status: builder.enum(getAllUserStatuses(), 'status').optional()
  }, 'updateUser');
}

/**
 * Create change password schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createChangePasswordSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    currentPassword: builder.password(),
    newPassword: builder.password(),
    confirmPassword: builder.string('confirmPassword', 1, null, true)
  }, 'changePassword').refine((data) => data.newPassword === data.confirmPassword, {
    message: builder.tl('validation.changePassword.passwordsDoNotMatch'),
    path: ['confirmPassword']
  });
}

/**
 * Create update profile schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createUpdateProfileSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    full_name: builder.name().optional(),
    email: builder.email(false).optional()
  }, 'updateProfile');
}

/**
 * Create user creation schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createCreateUserSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    full_name: builder.name(),
    email: builder.email(),
    password: builder.password(),
    role: builder.enum(getAllRoles(), 'role').default(DEFAULT_USER_ROLE),
    status: builder.enum(getAllUserStatuses(), 'status').default(DEFAULT_USER_STATUS)
  }, 'createUser');
}

/**
 * Create user creation schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createRegisterUserSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    full_name: builder.name(),
    email: builder.email(),
    password: builder.password(),
    status: builder.enum(getAllUserStatuses(), 'status').default(DEFAULT_USER_STATUS)
  }, 'registerUser');
}

/**
 * Create update user without role schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createUpdateUserWithoutRoleSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    full_name: builder.name().optional(),
    email: builder.email(false).optional(),
    status: builder.enum(getAllUserStatuses(), 'status').optional()
  }, 'updateUserWithoutRole');
}

/**
 * Create user list query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createUserListQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    page: builder.number('page', 1).default(1).optional(),
    limit: builder.number('limit', 1, 100).default(10).optional(),
    role: builder.enum(getAllRoles(), 'role').optional(),
    status: builder.enum(getAllUserStatuses(), 'status').optional(),
    search: builder.string('search', 0, 100).optional()
  }, 'userListQuery');
}

/**
 * Create all user management i18n schemas at once
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} All user schemas with translated messages
 */
export function createUserI18nSchemas(lang = 'en') {
  return {
    updateUserSchema: createUpdateUserSchema(lang),
    changePasswordSchema: createChangePasswordSchema(lang),
    updateProfileSchema: createUpdateProfileSchema(lang),
    createUserSchema: createCreateUserSchema(lang),
    updateUserWithoutRoleSchema: createUpdateUserWithoutRoleSchema(lang),
    userListQuerySchema: createUserListQuerySchema(lang),
    registerUserSchema: createRegisterUserSchema(lang)
  };
}
