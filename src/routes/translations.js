/**
 * Translation Management Routes
 * API endpoints for managing translations
*/

import { Hono } from 'hono';
import { loadTranslation, getSupportedLanguagesFromFiles, validateTranslation } from '../i18n/loader.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { i18n_log } from '../utils/debug.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { tSuccess } from '../i18n/index.js';
import { I18nDemo, i18nTestUtils } from '../utils/i18nDemo.js';

const translations = new Hono();
translations.use('*', unifiedMiddlewares.auto());

// GET /translations - List all available translations

translations.get('/', async (c) => {
  i18n_log('Fetching all available translations');

  try {
    const supportedLanguages = await getSupportedLanguagesFromFiles();
    const translationsInfo = {};

    for (const lang of supportedLanguages) {
      const validation = await validateTranslation(lang);
      translationsInfo[lang] = {
        language: lang,
        valid: validation.valid,
        totalKeys: validation.totalKeys,
        sections: validation.sectionsFound,
        missingSections: validation.missingSections
      };
    }

    return c.json(createSuccessResponse({
      supportedLanguages,
      translations: translationsInfo,
      totalLanguages: supportedLanguages.length
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve all translation information', i18n_log, 'i18n.translationsFailed', {
      reason: error.message
    });
  }
});

// GET /translations/:language - Get specific language translations
translations.get('/:language', async (c) => {
  const language = c.req.param('language');
  i18n_log(`Fetching translations for language: ${language}`);

  try {
    const supportedLanguages = await getSupportedLanguagesFromFiles();

    if (!supportedLanguages.includes(language)) {
      return await handleStandardError(c, new Error('LANGUAGE_NOT_SUPPORTED'), 'Translations get language - not supported', i18n_log, 'i18n.languageNotSupported', {
        language,
        supportedLanguages: supportedLanguages.join(', ')
      }, 404);
    }

    const translationData = await loadTranslation(language);
    const validation = await validateTranslation(language);

    return c.json(createSuccessResponse({
      message: tSuccess(c, 'translations.retrieved', {
        language,
        keyCount: validation.totalKeys
      }),
      language,
      translations: translationData,
      validation,
      metadata: {
        totalKeys: validation.totalKeys,
        sections: validation.sectionsFound,
        valid: validation.valid
      }
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve specific language translations', i18n_log, 'i18n.translationsFailed', {
      reason: error.message
    });
  }
});

// GET /translations/:language/validate - Validate translation file
translations.get('/:language/validate', async (c) => {
  const language = c.req.param('language');
  i18n_log(`Validating translations for language: ${language}`);

  try {
    const validation = await validateTranslation(language);

    return c.json(createSuccessResponse({
      language,
      validation,
      recommendations: validation.valid
        ? ['Translation file is complete and valid']
        : [`Missing sections: ${validation.missingSections.join(', ')}`]
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to validate translation file', i18n_log, 'i18n.translationsFailed', {
      reason: error.message
    });
  }
});

// GET /translations/:language/section/:section - Get specific section
translations.get('/:language/section/:section', async (c) => {
  const language = c.req.param('language');
  const section = c.req.param('section');
  i18n_log(`Fetching section '${section}' for language: ${language}`);

  try {
    const translationData = await loadTranslation(language);

    if (!translationData[section]) {
      return await handleStandardError(c, new Error('SECTION_NOT_FOUND'), 'Translations get section - not found', i18n_log, 'i18n.sectionNotFound', {
        section,
        language
      }, 404);
    }

    return c.json(createSuccessResponse({
      language,
      section,
      translations: translationData[section],
      totalKeys: Object.keys(translationData[section]).length
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve translation section', i18n_log, 'i18n.translationsFailed', {
      reason: error.message
    });
  }
});

// GET /translations/demo/enhanced - Demo enhanced i18n features
translations.get('/demo/enhanced', async (c) => {
  i18n_log('Running enhanced i18n features demo');

  try {
    const demoResults = I18nDemo.completeDemo(c);

    return c.json(createSuccessResponse({
      ...demoResults,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'enhanced_demo',
        duration: 150
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to run enhanced i18n demo', i18n_log, 'i18n.enhanced_demo_failed', {
      reason: error.message
    });
  }
});

// GET /translations/demo/plurals - Demo plural translations
translations.get('/demo/plurals', async (c) => {
  i18n_log('Running plurals demo');

  try {
    const pluralsDemo = I18nDemo.pluralsDemo(c);

    return c.json(createSuccessResponse({
      ...pluralsDemo,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'plurals_demo',
        duration: 25
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to run plurals demo', i18n_log, 'i18n.plurals_demo_failed', {
      reason: error.message
    });
  }
});

// GET /translations/demo/formatting - Demo formatting features
translations.get('/demo/formatting', async (c) => {
  i18n_log('Running formatting demo');

  try {
    const formattingDemo = I18nDemo.formattingDemo(c);

    return c.json(createSuccessResponse({
      ...formattingDemo,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'formatting_demo',
        duration: 35
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to run formatting demo', i18n_log, 'i18n.formatting_demo_failed', {
      reason: error.message
    });
  }
});

// GET /translations/demo/context - Demo contextual translations
translations.get('/demo/context', async (c) => {
  i18n_log('Running contextual translations demo');

  try {
    const contextDemo = I18nDemo.contextDemo(c);

    return c.json(createSuccessResponse({
      ...contextDemo,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'context_demo',
        duration: 30
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to run context demo', i18n_log, 'i18n.context_demo_failed', {
      reason: error.message
    });
  }
});

// GET /translations/demo/errors - Demo enhanced error messages
translations.get('/demo/errors', async (c) => {
  i18n_log('Running error messages demo');

  try {
    const errorDemo = I18nDemo.errorMessagesDemo(c);

    return c.json(createSuccessResponse({
      ...errorDemo,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'error_demo',
        duration: 40
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to run error messages demo', i18n_log, 'i18n.error_demo_failed', {
      reason: error.message
    });
  }
});

// GET /translations/demo/success - Demo enhanced success messages
translations.get('/demo/success', async (c) => {
  i18n_log('Running success messages demo');

  try {
    const successDemo = I18nDemo.successMessagesDemo(c);

    return c.json(createSuccessResponse({
      ...successDemo,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'success_demo',
        duration: 45
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to run success messages demo', i18n_log, 'i18n.success_demo_failed', {
      reason: error.message
    });
  }
});

// POST /translations/test/plurals - Test pluralization with custom data
translations.post('/test/plurals', async (c) => {
  i18n_log('Testing pluralization with custom data');

  let key; // Declare key variable at the top level

  try {
  // Accept optional interpolation params in request body
    const { key: parsedKey, counts, params } = await c.req.json();
    key = parsedKey; // Assign parsed key

    if (!key) {
      return await handleStandardError(c, new Error('VALIDATION_KEY_REQUIRED'), 'Translations plural test - key required', i18n_log, 'validationField', {
        field: 'key',
        error: 'Field is required'
      }, 400);
    }

    const testCounts = counts || [0, 1, 2, 5, 10, 100];
    // Forward provided interpolation params so keys with required placeholders (e.g. details, userName, email) don't trigger missing interpolation warnings
    const results = i18nTestUtils.testPluralization(c, key, testCounts, params || {});

    return c.json(createSuccessResponse({
      key,
      testCounts,
      results,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'pluralization_test',
        duration: 25 // Approximate processing time
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to test pluralization functionality', i18n_log, 'i18n.plurals_test_failed', {
      key: key || 'unknown',
      reason: error.message
    });
  }
});

// POST /translations/test/formatting - Test formatting with custom data
translations.post('/test/formatting', async (c) => {
  i18n_log('Testing formatting with custom data');

  let key; // Declare key variable at the top level

  try {
    const { key: parsedKey, testCases } = await c.req.json();
    key = parsedKey; // Assign parsed key

    if (!key || !testCases) {
      return await handleStandardError(c, new Error('VALIDATION_REQUIRED'), 'Translations formatting test - required field', i18n_log, 'validationField', {
        field: !key ? 'key' : 'testCases',
        error: 'Field is required'
      }, 400);
    }

    const results = i18nTestUtils.testFormatting(c, key, testCases);

    return c.json(createSuccessResponse({
      key,
      testCases,
      results,
      message: tSuccess(c, 'operation.completed', {
        operationType: 'formatting_test',
        duration: 50 // Approximate processing time
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to test formatting functionality', i18n_log, 'i18n.formatting_test_failed', {
      key: key || 'unknown',
      reason: error.message
    });
  }
});

// POST /translations/test/context - Test contextual translations
translations.post('/test/context', async (c) => {
  i18n_log('Testing contextual translations with custom data');

  let key; // Declare key variable at the top level

  try {
    const { key: parsedKey, contexts } = await c.req.json();
    key = parsedKey; // Assign parsed key

    if (!key || !contexts) {
      return await handleStandardError(c, new Error('VALIDATION_REQUIRED'), 'Translations context test - required field', i18n_log, 'validationField', {
        field: !key ? 'key' : 'contexts',
        error: 'Field is required'
      }, 400);
    }

    const results = i18nTestUtils.testContextual(c, key, contexts);

    return c.json(createSuccessResponse({
      key,
      contexts,
      results,
      message: tSuccess(c, 'operation.completed', {
        count: results.length,
        context: 'contextual_test'
      })
    }));
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to test contextual translations', i18n_log, 'i18n.context_test_failed', {
      key: key || 'unknown',
      reason: error.message
    });
  }
});

export default translations;
