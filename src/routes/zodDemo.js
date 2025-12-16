/**
 * Demo Route - Showcasing Zod Validation
 * Examples of how to use Zod validation with Hono
*/

import { Hono } from 'hono';
// import { zValidator } from '@hono/zod-validator'; // Removed: using i18n validators instead
// Import removed: now using i18n validators only
// import { userRegistrationSchema, searchSchema, fileUploadSchema } from '../schemas/zodDemo.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { validation_log, zod_log } from '../utils/debug.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { t, tSuccess } from '../i18n/index.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';

const zodDemo = new Hono();

zodDemo.use('*', unifiedMiddlewares.auto());

// Demo Routes

// 1. User Registration Demo (POST body validation)
zodDemo.post('/register', i18nValidatorsMiddleware.userRegistration(), async (c) => {
  zod_log('User registration validation passed with Zod schema');

  let validatedData;
  try {
    validatedData = c.req.valid('json');

    // Here you would handle registration logic
    // const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    // const user = await userService.create({...validatedData, password: hashedPassword});

    zod_log(`Registration data:', ${JSON.stringify({
      full_name: validatedData.full_name,
      email: validatedData.email,
      age: validatedData.age,
      country: validatedData.country,
      terms_accepted: validatedData.terms_accepted
      // password not logged for security
    })}`);

    return c.json(createSuccessResponse({
      message: tSuccess(c, 'user.created', { userName: validatedData.full_name, email: validatedData.email }),
      user: {
        full_name: validatedData.full_name,
        email: validatedData.email,
        age: validatedData.age,
        country: validatedData.country
      }
    }));

  } catch (error) {
    return await handleStandardError(
      c,
      error,
      'User registration demo failed',
      zod_log,
      'user.registrationFailed',
      {
        actor: 'user',
        reason: error.message || 'validation error',
        operation: t(c, 'zodDemo_operations.userRegistration'),
        userName: validatedData?.full_name || 'unknown',
        email: validatedData?.email || 'unknown'
      }
    );
  }
});

// 2. Search Demo (Query parameters validation)
zodDemo.get('/search', i18nValidatorsMiddleware.search('query'), async (c) => {
  zod_log('Search query validation passed with Zod schema');

  let validatedQuery;
  try {
    validatedQuery = c.req.valid('query');

    zod_log(`Search parameters: ${JSON.stringify(validatedQuery)}`);

    // Here you would handle search logic
    const mockResults = [
      { id: 1, title: `${t(c, 'zodDemo.searchResultTitle')} "${validatedQuery.query}"`, date: '2024-01-01' },
      { id: 2, title: `${t(c, 'zodDemo.anotherSearchResultTitle')} "${validatedQuery.query}"`, date: '2024-01-02' }
    ];

    return c.json(createSuccessResponse({
      message: tSuccess(c, 'search.completed', {
        query: validatedQuery.query,
        resultCount: mockResults.length
      }),
      query: validatedQuery.query,
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      sort_by: validatedQuery.sort_by,
      sort_order: validatedQuery.sort_order,
      results: mockResults,
      total: mockResults.length
    }));

  } catch (error) {
    return await handleStandardError(
      c,
      error,
      'Search demo failed',
      zod_log,
      'search.failed',
      {
        actor: 'user',
        reason: error.message || 'search error',
        operation: t(c, 'zodDemo_operations.searchExecution'),
        query: validatedQuery?.query || 'unknown',
        searchType: 'demo-search'
      }
    );
  }
});

// 3. File Upload Demo (Mixed validation)
zodDemo.post('/upload', i18nValidatorsMiddleware.fileUpload(), async (c) => {
  zod_log('File upload validation passed with Zod schema');

  let validatedData;
  try {
    validatedData = c.req.valid('json');

    validation_log(`File upload data: ${JSON.stringify(validatedData)}`);

    // Here you would handle file upload logic
    // const uploadResult = await cloudflareR2.upload(validatedData);

    return c.json(createSuccessResponse({
      message: tSuccess(c, 'file.uploadCompleted', {
        filename: validatedData.file_name,
        fileSize: validatedData.file_size
      }),
      file: {
        name: validatedData.file_name,
        size: validatedData.file_size,
        description: validatedData.description || t(c, 'zodDemo.noDescription')
      }
    }));

  } catch (error) {
    return await handleStandardError(
      c,
      error,
      'File upload demo failed',
      zod_log,
      'file.uploadFailed',
      {
        actor: 'user',
        reason: error.message || 'file upload error',
        operation: t(c, 'zodDemo_operations.fileUpload'),
        fileName: validatedData?.file_name || 'unknown',
        fileSize: validatedData?.file_size || 0
      }
    );
  }
});

// 4. Demo Info Route
zodDemo.get('/', (c) => {
  return c.json({
    message: t(c, 'zodDemo.title'),
    description: t(c, 'zodDemo.description'),
    available_endpoints: {
      'POST /zod_demo/register': {
        description: 'User registration with comprehensive validation',
        required_fields: ['full_name', 'email', 'password', 'age', 'country', 'terms_accepted'],
        validation_features: [
          'Email format validation',
          'Password strength validation',
          'Age range validation',
          'Country code transformation',
          'Terms acceptance validation',
          'Data transformation and sanitization'
        ]
      },
      'GET /zod_demo/search': {
        description: 'Search with query parameter validation',
        query_parameters: ['query', 'page', 'limit', 'sort_by', 'sort_order'],
        validation_features: [
          'Required vs optional parameters',
          'Default value assignment',
          'Data type transformation',
          'Enum validation',
          'Range validation'
        ]
      },
      'POST /zod_demo/upload': {
        description: 'File upload metadata validation',
        required_fields: ['file_name', 'file_size'],
        optional_fields: ['description'],
        validation_features: [
          'File extension validation',
          'File size limits',
          'String length validation'
        ]
      }
    },
    examples: {
      register: {
        url: '/zod_demo/register',
        method: 'POST',
        body: {
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
          age: 25,
          country: 'us',
          terms_accepted: true
        }
      },
      search: {
        url: '/zod_demo/search?query=test&page=1&limit=10&sort_by=date&sort_order=desc',
        method: 'GET'
      },
      upload: {
        url: '/zod_demo/upload',
        method: 'POST',
        body: {
          file_name: 'document.pdf',
          file_size: 1024000,
          description: 'Important document'
        }
      }
    }
  });
});

export default zodDemo;
