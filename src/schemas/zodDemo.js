/**
 * Zod Demo Validation Schemas
 * I18n-aware Zod schemas for demonstrating validation capabilities
 */

import { createSchemaBuilder } from './base.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create user registration schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createUserRegistrationSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    full_name: builder.name(),
    email: builder.email(),
    password: builder.password(),
    confirmPassword: builder.string('confirmPassword', 1, null, true),
    age: builder.number('age', 13, 120, true),
    terms_accepted: builder.boolean('termsAccepted', true).refine(val => val === true, {
      message: builder.tl('validation.termsAccepted.mustBeTrue')
    })
  }, 'userRegistration').refine((data) => data.password === data.confirmPassword, {
    message: builder.tl('validation.confirmPassword.mustMatch'),
    path: ['confirmPassword']
  });
}

/**
 * Create search schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createSearchSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    query: builder.string('query', 1, 200, true),
    category: builder.enum(['all', 'users', 'posts', 'comments'], 'category').default('all'),
    sort_by: builder.enum(['relevance', 'date', 'popularity'], 'sort_by').default('relevance'),
    // Add sort_order support to match route response shape and tests
    sort_order: builder.enum(['asc', 'desc'], 'sort_order').default('desc'),
    // Use coerceNumber for query parameters to transform strings
    page: builder.coerceNumber('page', 1, 1000).default(1),
    limit: builder.coerceNumber('limit', 1, 100).default(10)
  }, 'search');
}

/**
 * Create file upload schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createFileUploadSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    file_name: builder
      .name()
      .refine(val => /\.(pdf|png|jpe?g|gif)$/i.test(val), {
        // Use i18n translation key instead of hardcoded string
        message: builder.tl('validation.fileUpload.invalidExtension')
      }),
    file_size: builder.number('fileSize', 1, 10485760, true), // Max 10MB
    file_type: builder.enum(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'], 'file_type'),
    description: builder.description().optional()
  }, 'fileUpload');
}

/**
 * Create advanced validation schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createAdvancedValidationSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    username: builder.regex(/^[a-zA-Z0-9_]+$/, 'username', builder.tl('validation.username.invalidCharacters', { invalidChars: 'Only letters, numbers, underscores allowed' }))
      .min(3, { message: builder.tl('validation.username.tooShort', { minLength: 3 }) })
      .max(20, { message: builder.tl('validation.username.tooLong', { maxLength: 20 }) }),
    website: builder.url('website').optional(),
    bio: builder.string('bio', 0, 500).optional(),
    interests: builder.array(builder.string('interest', 1), 'interests', 1, 10),
    notifications: builder.object({
      email: builder.boolean('email').default(true),
      sms: builder.boolean('sms').default(false),
      push: builder.boolean('push').default(true)
    }, 'notifications')
  }, 'advancedValidation');
}

/**
 * Create all zod demo i18n schemas at once
 * @param {string} lang - Language code
 * @returns {Object} All zod demo schemas with translated messages
 */
export function createZodDemoSchemas(lang = 'en') {
  return {
    userRegistrationSchema: createUserRegistrationSchema(lang),
    searchSchema: createSearchSchema(lang),
    fileUploadSchema: createFileUploadSchema(lang),
    advancedValidationSchema: createAdvancedValidationSchema(lang)
  };
}
