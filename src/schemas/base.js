/**
 * Base Schema Utilities
 *export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }ommon validation patterns and utilities for all schemas
 */

import { z } from 'zod';
import { tl } from '../i18n/index.js';
import { getAllRoles } from '../constants/roles.js';

/**
 * Schema creation configuration
 */
export const SCHEMA_CONFIG = {
  // String lengths
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,

  // Validation patterns
  JWT_PATTERN: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  // Enums
  SEVERITY_LEVELS: ['low', 'medium', 'high', 'critical'],
  BOOLEAN_VALUES: [true, false]
};

/**
 * XSS Protection Helper Functions
 */
export function sanitizeInput(input, ctx, lang = 'en') {
  if (typeof input !== 'string') {
    return input;
  }

  // First decode HTML entities and URL encoding to catch encoding attempts
  const decoded = input
    // HTML entity decoding
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, '\'')
    .replace(/&#39;/g, '\'')
    .replace(/&#x2F;/g, '/')
    .replace(/&#47;/g, '/')
    .replace(/&#60;/g, '<')
    .replace(/&#62;/g, '>')
    .replace(/&amp;/g, '&')
    // URL decoding for common XSS patterns
    .replace(/%3C/gi, '<')
    .replace(/%3E/gi, '>')
    .replace(/%22/gi, '"')
    .replace(/%27/gi, '\'')
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2F/gi, '/');

  // Check for dangerous patterns - if found, add validation issue
  const dangerousPatterns = [
    { pattern: /javascript:/gi, name: 'JavaScript protocol' },
    { pattern: /vbscript:/gi, name: 'VBScript protocol' },
    { pattern: /data:/gi, name: 'Data protocol' },
    { pattern: /on\w+\s*=/gi, name: 'Event handler' },
    { pattern: /<script[^>]*>/gi, name: 'Script tag' },
    { pattern: /<\/script>/gi, name: 'Script tag' },
    { pattern: /<iframe[^>]*>/gi, name: 'Iframe tag' },
    { pattern: /<\/iframe>/gi, name: 'Iframe tag' },
    { pattern: /<object[^>]*>/gi, name: 'Object tag' },
    { pattern: /<\/object>/gi, name: 'Object tag' },
    { pattern: /<embed[^>]*>/gi, name: 'Embed tag' },
    { pattern: /<link[^>]*>/gi, name: 'Link tag' },
    { pattern: /<meta[^>]*>/gi, name: 'Meta tag' },
    { pattern: /<svg[^>]*>/gi, name: 'SVG tag' },
    { pattern: /<\/svg>/gi, name: 'SVG tag' },
    { pattern: /expression\s*\(/gi, name: 'CSS expression' },
    { pattern: /@import/gi, name: 'CSS import' },
    { pattern: /alert\s*\(/gi, name: 'Alert function' },
    { pattern: /confirm\s*\(/gi, name: 'Confirm function' },
    { pattern: /prompt\s*\(/gi, name: 'Prompt function' },
    { pattern: /eval\s*\(/gi, name: 'Eval function' },
    { pattern: /document\./gi, name: 'Document object' },
    { pattern: /window\./gi, name: 'Window object' },
    { pattern: /location\./gi, name: 'Location object' }
  ];

  // If any dangerous pattern is found, use Zod's addIssue method
  for (const { pattern, name } of dangerousPatterns) {
    if (pattern.test(decoded)) {
      // Allow common safe filename patterns like "document.pdf" even though they contain 'document.'
      if (name === 'Document object' && /^[A-Za-z0-9_.-]+\.[A-Za-z0-9]{1,10}$/.test(decoded)) {
        // treat as safe filename, skip issuing an error
        continue;
      }
      // Determine language from refinement context if available (custom prop), else default to 'en'
      const langFromCtx = lang;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: tl(langFromCtx, 'validation.security.xssPatternDetected', { patternName: name })
      });
      return z.NEVER;
    }
  }

  // If safe, HTML encode the content to prevent injection
  return decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Base schema builders with common validation patterns
 */
export class BaseSchemaBuilder {
  constructor(lang = 'en') {
    this.lang = lang;
  }

  /**
   * Translation lookup helper
   */
  tl(key, options = {}) {
    return tl(this.lang, key, options);
  }

  /**
   * Helper to create validation with required check and early return
   * @param {Object} params - Validation parameters
   * @param {string} params.fieldName - Field name for translation keys
   * @param {boolean} params.required - Whether field is required
   * @param {Function} params.additionalValidations - Additional validation logic
   * @param {boolean} params.applySanitization - Whether to apply sanitization
   * @returns {z.ZodString} Zod string schema
   */
  createValidatedString({ fieldName, required = true, additionalValidations, applySanitization = false }) {
    let schema = z.string({
      required_error: required ? tl(this.lang, `validation.fieldRequired.${fieldName}`) : undefined
    });

    if (required) {
      schema = schema.superRefine((val, ctx) => {
        // Check empty first - if empty, only return this error and stop
        if (!val || val.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 1,
            type: 'string',
            inclusive: true,
            message: tl(this.lang, `validation.fieldRequired.${fieldName}`)
          });
          return z.NEVER; // Stop further validation
        }

        // Run additional validations only if not empty
        if (additionalValidations) {
          additionalValidations(val, ctx, this.lang);
        }
      });

      // Apply sanitization if needed
      if (applySanitization) {
        schema = schema.transform((val, ctx) => sanitizeInput(val, ctx, this.lang));
      }
    }

    return schema;
  }

  /**
   * Email validation schema
   */
  email(required = true) {
    if (required) {
      return this.createValidatedString({
        fieldName: 'email',
        required: true,
        applySanitization: true,
        additionalValidations: (val, ctx, lang) => {
          // Check email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_string,
              validation: 'email',
              message: tl(lang, 'validation.formatValidation.email.invalid')
            });
          }

          // Check maximum length
          if (val.length > SCHEMA_CONFIG.EMAIL_MAX_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_big,
              maximum: SCHEMA_CONFIG.EMAIL_MAX_LENGTH,
              type: 'string',
              inclusive: true,
              message: tl(lang, 'validation.lengthValidation.email.tooLong', { maxLength: SCHEMA_CONFIG.EMAIL_MAX_LENGTH })
            });
          }
        }
      });
    } else {
      return z.string()
        .email({ message: tl(this.lang, 'validation.formatValidation.email.invalid') })
        .max(SCHEMA_CONFIG.EMAIL_MAX_LENGTH, {
          message: tl(this.lang, 'validation.lengthValidation.email.tooLong', { maxLength: SCHEMA_CONFIG.EMAIL_MAX_LENGTH })
        })
        .transform((val, ctx) => sanitizeInput(val, ctx, this.lang));
    }
  }

  /**
   * Password validation schema
   */
  password(required = true) {
    if (required) {
      return this.createValidatedString({
        fieldName: 'password',
        required: true,
        applySanitization: false,
        additionalValidations: (val, ctx, lang) => {
          // Check minimum length
          if (val.length < SCHEMA_CONFIG.PASSWORD_MIN_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_small,
              minimum: SCHEMA_CONFIG.PASSWORD_MIN_LENGTH,
              type: 'string',
              inclusive: true,
              message: tl(lang, 'validation.lengthValidation.password.tooShort', { minLength: SCHEMA_CONFIG.PASSWORD_MIN_LENGTH })
            });
          }

          // Check maximum length
          if (val.length > SCHEMA_CONFIG.PASSWORD_MAX_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_big,
              maximum: SCHEMA_CONFIG.PASSWORD_MAX_LENGTH,
              type: 'string',
              inclusive: true,
              message: tl(lang, 'validation.lengthValidation.password.tooLong', { maxLength: SCHEMA_CONFIG.PASSWORD_MAX_LENGTH })
            });
          }
        }
      });
    } else {
      return z.string()
        .min(SCHEMA_CONFIG.PASSWORD_MIN_LENGTH, {
          message: tl(this.lang, 'validation.lengthValidation.password.tooShort', { minLength: SCHEMA_CONFIG.PASSWORD_MIN_LENGTH })
        })
        .max(SCHEMA_CONFIG.PASSWORD_MAX_LENGTH, {
          message: tl(this.lang, 'validation.lengthValidation.password.tooLong', { maxLength: SCHEMA_CONFIG.PASSWORD_MAX_LENGTH })
        });
    }
  }

  /**
   * Name validation schema (for user names, rule names, etc.)
   */
  name(required = true) {
    if (required) {
      return this.createValidatedString({
        fieldName: 'name',
        required: true,
        applySanitization: true,
        additionalValidations: (val, ctx, lang) => {
          // Check maximum length
          if (val.length > SCHEMA_CONFIG.NAME_MAX_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_big,
              maximum: SCHEMA_CONFIG.NAME_MAX_LENGTH,
              type: 'string',
              inclusive: true,
              message: tl(lang, 'validation.lengthValidation.name.tooLong', { maxLength: SCHEMA_CONFIG.NAME_MAX_LENGTH })
            });
          }
        }
      });
    } else {
      return z.string()
        .max(SCHEMA_CONFIG.NAME_MAX_LENGTH, {
          message: tl(this.lang, 'validation.lengthValidation.name.tooLong', { maxLength: SCHEMA_CONFIG.NAME_MAX_LENGTH })
        })
        .transform((val, ctx) => sanitizeInput(val, ctx, this.lang));
    }
  }

  /**
   * Description validation schema
   */
  description(required = false) {
    let schema = z.string({
      required_error: required ? tl(this.lang, 'validation.fieldRequired.description') : undefined
    });

    if (required) {
      schema = schema.min(1, { message: tl(this.lang, 'validation.fieldRequired.description') });
    }

    return schema
      .max(SCHEMA_CONFIG.DESCRIPTION_MAX_LENGTH, {
        message: tl(this.lang, 'validation.lengthValidation.description.tooLong', { maxLength: SCHEMA_CONFIG.DESCRIPTION_MAX_LENGTH })
      })
      .transform((val, ctx) => sanitizeInput(val, ctx, this.lang))
      .optional();
  }

  /**
   * JWT token validation schema
   */
  jwtToken(fieldName = 'token') {
    return z.string({
      required_error: tl(this.lang, `validation.fieldRequired.${fieldName}`)
    })
      .min(1, { message: tl(this.lang, `validation.fieldRequired.${fieldName}`) })
      .regex(SCHEMA_CONFIG.JWT_PATTERN, {
        message: tl(this.lang, `validation.formatValidation.${fieldName}.invalid`)
      });
  }

  /**
   * UUID validation schema
   */
  uuid(fieldName = 'id') {
    return z.string({
      required_error: tl(this.lang, `validation.fieldRequired.${fieldName}`)
    })
      .min(1, { message: tl(this.lang, `validation.fieldRequired.${fieldName}`) })
      .regex(SCHEMA_CONFIG.UUID_PATTERN, {
        message: tl(this.lang, `validation.formatValidation.${fieldName}.invalid`)
      });
  }

  /**
   * Enum validation schema
   */
  enum(values, fieldName = 'value') {
    return z.enum(values, {
      errorMap: () => ({
        message: tl(this.lang, `validation.enumValidation.${fieldName}.invalid`, { allowedValues: values.join(', ') })
      })
    });
  }

  /**
   * Boolean validation schema
   */
  boolean(fieldName = 'value', required = false) {
    let schema = z.boolean();

    if (required) {
      schema = schema.refine((val) => val !== undefined, {
        message: tl(this.lang, `validation.fieldRequired.${fieldName}`)
      });
    }

    return schema.optional();
  }

  /**
   * Boolean validation schema with coerce (for query parameters)
   */
  coerceBoolean(fieldName = 'value', required = false) {
    let schema = z.coerce.boolean();

    if (required) {
      schema = schema.refine((val) => val !== undefined, {
        message: tl(this.lang, `validation.fieldRequired.${fieldName}`)
      });
    }

    return schema.optional();
  }

  /**
   * Number validation schema with range
   */
  number(fieldName = 'value', min = null, max = null, required = false) {
    let schema = z.number({
      required_error: tl(this.lang, `validation.fieldRequired.${fieldName}`)
    });

    if (min !== null) {
      schema = schema.min(min, {
        message: tl(this.lang, `validation.numericValidation.${fieldName}.tooSmall`, { minValue: min })
      });
    }

    if (max !== null) {
      schema = schema.max(max, {
        message: tl(this.lang, `validation.numericValidation.${fieldName}.tooLarge`, { maxValue: max })
      });
    }

    return required ? schema : schema.optional();
  }

  /**
   * Number validation schema with coerce (for query parameters)
   */
  coerceNumber(fieldName = 'value', min = null, max = null, required = false) {
    let schema = z.coerce.number({
      required_error: tl(this.lang, `validation.fieldRequired.${fieldName}`)
    });

    if (min !== null) {
      schema = schema.min(min, {
        message: tl(this.lang, `validation.numericValidation.${fieldName}.tooSmall`, { minValue: min })
      });
    }

    if (max !== null) {
      schema = schema.max(max, {
        message: tl(this.lang, `validation.numericValidation.${fieldName}.tooLarge`, { maxValue: max })
      });
    }

    return required ? schema : schema.optional();
  }  /**
   * Date validation schema
   */
  date(fieldName = 'date', required = false) {
    const schema = z.string({
      required_error: required ? tl(this.lang, `validation.fieldRequired.${fieldName}`) : undefined
    })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: tl(this.lang, `validation.formatValidation.${fieldName}.invalid`)
      })
      .transform((val) => new Date(val));

    return required ? schema : schema.optional();
  }

  /**
   * Array validation schema
   */
  array(itemSchema, fieldName = 'items', minLength = null, maxLength = null) {
    let schema = z.array(itemSchema);

    if (minLength !== null) {
      schema = schema.min(minLength, {
        message: tl(this.lang, `validation.arrayValidation.${fieldName}.tooFew`, { minCount: minLength })
      });
    }

    if (maxLength !== null) {
      schema = schema.max(maxLength, {
        message: tl(this.lang, `validation.arrayValidation.${fieldName}.tooMany`, { maxCount: maxLength })
      });
    }

    return schema;
  }

  /**
   * String validation schema (generic string with sanitization)
   */
  string(fieldName = 'value', minLength = null, maxLength = null, required = false) {
    let schema = z.string({
      required_error: required ? tl(this.lang, `validation.fieldRequired.${fieldName}`) : undefined
    });

    if (required) {
      schema = schema.min(1, { message: tl(this.lang, `validation.fieldRequired.${fieldName}`) });
    }

    if (minLength !== null) {
      schema = schema.min(minLength, {
        message: tl(this.lang, `validation.lengthValidation.${fieldName}.tooShort`, { minLength })
      });
    }

    if (maxLength !== null) {
      schema = schema.max(maxLength, {
        message: tl(this.lang, `validation.lengthValidation.${fieldName}.tooLong`, { maxLength })
      });
    }

    return schema.transform((val, ctx) => sanitizeInput(val, ctx, this.lang));
  }

  /**
   * Union validation schema (for multiple types)
   */
  union(schemas, fieldName = 'value') {
    return z.union(schemas, {
      errorMap: () => ({
        message: tl(this.lang, `validation.typeValidation.${fieldName}.invalid`)
      })
    });
  }

  /**
   * Object validation schema (for nested objects)
   */
  object(shape, fieldName = 'object', params = {}) {
    return z.object(shape, {
      errorMap: () => ({
        message: tl(this.lang, `validation.structureValidation.${fieldName}.invalid`, params)
      })
    });
  }

  /**
   * Condition schema for alert configurations
   */
  conditionSchema() {
    return this.object({
      field: this.string('field', 1, 100, true),
      operator: this.enum(['equals', 'contains', 'greater_than', 'less_than', 'in_range'], 'operator'),
      value: this.union([
        z.string(),
        z.number(),
        z.array(z.string())
      ], 'conditionValue')
    }, 'condition');
  }

  /**
   * Action schema for alert configurations
   */
  actionSchema() {
    return this.object({
      type: this.enum(['email', 'webhook', 'sms', 'slack'], 'actionType'),
      target: this.string('target', 1, 255, true),
      template: this.string('template', 0, 500).optional()
    }, 'action');
  }

  /**
   * Date range schema for reports and queries
   */
  dateRangeSchema() {
    return this.object({
      start: this.date('startDate', true),
      end: this.date('endDate', true)
    }, 'dateRange').refine((data) => {
      return data.start <= data.end;
    }, {
      message: tl(this.lang, 'validation.dateRange.invalid'),
      path: ['end']
    });
  }

  /**
   * Filter criteria schema for compliance reports
   */
  filterCriteriaSchema() {
    return this.object({
      severity: this.enum(['low', 'medium', 'high', 'critical'], 'severity').optional(),
      department: this.string('department', 0, 100).optional(),
      actorRole: this.enum(getAllRoles(), 'actorRole').optional()
    }, 'filterCriteria').optional();
  }

  /**
   * Policy schema for retention policies
   */
  policySchema() {
    return this.object({
      audit_log_retention_days: this.number('auditLogRetentionDays', 1).optional(),
      user_data_retention_days: this.number('userDataRetentionDays', 1).optional()
    }, 'policy').optional();
  }

  /**
   * URL validation schema
   */
  url(fieldName = 'url') {
    return z.string({
      required_error: tl(this.lang, `validation.fieldRequired.${fieldName}`)
    }).url({
      message: tl(this.lang, `validation.formatValidation.${fieldName}.invalid`)
    });
  }

  /**
   * Regex validation schema
   */
  regex(pattern, fieldName = 'value', message = null) {
    return z.string({
      required_error: tl(this.lang, `validation.fieldRequired.${fieldName}`)
    }).regex(pattern, {
      message: message || tl(this.lang, `validation.formatValidation.${fieldName}.invalid`)
    });
  }

  /**
   * Record validation schema (for dynamic key-value objects)
   */
  record(valueSchema, fieldName = 'record') {
    return z.record(valueSchema, {
      errorMap: () => ({
        message: tl(this.lang, `validation.structureValidation.${fieldName}.invalid`)
      })
    });
  }

  /**
   * Any type validation schema
   */
  any() {
    return z.any();
  }
}

/**
 * Create schema builder instance for a specific language
 * @param {string} lang - Language code
 * @returns {BaseSchemaBuilder} Schema builder instance
 */
export function createSchemaBuilder(lang = 'en') {
  return new BaseSchemaBuilder(lang);
}

/**
 * Common validation patterns for reuse across schemas
 */
export const ValidationPatterns = {
  // Pagination
  createPaginationSchema(lang = 'en') {
    const builder = createSchemaBuilder(lang);
    // Preprocess empty string -> undefined so defaults work instead of NaN
    const emptyToUndefined = (v) => {
      if (v === '' || v === null || (typeof v === 'string' && /^\s*nan\s*$/i.test(v))) {
        return undefined;
      }
      return v;
    };
    return z.object({
      page: z.preprocess(emptyToUndefined, builder.coerceNumber('page', 1, 1000)).default(1),
      limit: z.preprocess(emptyToUndefined, builder.coerceNumber('limit', 1, 100)).default(10),
      sortBy: z.string().optional(),
      sortOrder: builder.enum(['asc', 'desc'], 'sortOrder').default('desc')
    });
  },

  // Date range
  createDateRangeSchema(lang = 'en') {
    const builder = createSchemaBuilder(lang);
    return z.object({
      startDate: builder.date('startDate'),
      endDate: builder.date('endDate')
    }).refine((data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    }, {
      message: tl(lang, 'validation.dateRange.invalid'),
      path: ['endDate']
    });
  },

  // Search filters
  createSearchSchema() {
    return z.object({
      query: z.string().max(200).optional(),
      filters: z.record(z.any()).optional()
    });
  }
};
