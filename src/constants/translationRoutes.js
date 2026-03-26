/**
 * Translation and Demo Routes Definitions
 * Register all translation and demonstration routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * Translation routes with metadata
*/
const TRANSLATION_ROUTES = [
  {
    method: 'GET',
    path: '/api/translations',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.list',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Get list of available languages and translations'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/:language',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.get',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Get translation data for specific language'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/:language/validate',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.validate',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Validate translation completeness for language'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/:language/section/:section',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.section',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Get specific section of translations for language'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/demo/enhanced',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.demoEnhanced',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate enhanced i18n capabilities'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/demo/plurals',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.demoPlurals',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate pluralization behavior'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/demo/formatting',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.demoFormatting',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate formatting behavior'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/demo/context',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.demoContext',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate contextual translations'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/demo/errors',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.demoErrors',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate translated error messaging'
    }
  },
  {
    method: 'GET',
    path: '/api/translations/demo/success',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.demoSuccess',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate translated success messaging'
    }
  },
  {
    method: 'POST',
    path: '/api/translations/test/plurals',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.testPlurals',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Test pluralization with custom payloads'
    }
  },
  {
    method: 'POST',
    path: '/api/translations/test/formatting',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.testFormatting',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Test formatting with custom payloads'
    }
  },
  {
    method: 'POST',
    path: '/api/translations/test/context',
    metadata: {
      category: 'i18n',
      i18nKey: 'endpoints.translations.testContext',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Test contextual translations with custom payloads'
    }
  }
];

/**
 * Zod demo routes with metadata
*/
const ZOD_DEMO_ROUTES = [
  {
    method: 'GET',
    path: '/api/zod_demo',
    metadata: {
      category: 'demo',
      i18nKey: 'endpoints.demo.info',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Zod validation demonstration information'
    }
  },
  {
    method: 'POST',
    path: '/api/zod_demo/register',
    metadata: {
      category: 'demo',
      i18nKey: 'endpoints.demo.register',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate user registration validation with Zod'
    }
  },
  {
    method: 'GET',
    path: '/api/zod_demo/search',
    metadata: {
      category: 'demo',
      i18nKey: 'endpoints.demo.search',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate search query validation with Zod'
    }
  },
  {
    method: 'POST',
    path: '/api/zod_demo/upload',
    metadata: {
      category: 'demo',
      i18nKey: 'endpoints.demo.upload',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Demonstrate file upload validation with Zod'
    }
  }
];

/**
 * Register all translation and demo routes
*/
export function registerTranslationAndDemoRoutes() {
  registerRoutes('translations', TRANSLATION_ROUTES);
  registerRoutes('zod_demo', ZOD_DEMO_ROUTES);
}

// Auto-register when imported
registerTranslationAndDemoRoutes();
