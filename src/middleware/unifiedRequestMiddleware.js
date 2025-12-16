/**
 * Unified Request/Response Middleware
 * Combines logging, route tracking, and audit functionality into one optimized middleware
 *
 * Features:
 * - Enhanced request/response logging with emoji indicators
 * - Route tracking and identification
 * - Configurable audit logging levels
 * - Performance monitoring
 * - Single middleware for better performance
*/

import { handleMiddleware_log, auditMiddleware_log } from '../utils/debug.js';
import { AuditLogService } from '../services/auditLogService.js';
import { getResponseLogSettings } from '../utils/dynamicConfig.js';
import { ROUTE_TYPES } from '../constants/routeCategoryMappings.js';
import '../constants/routeDefinitions.js';
import { detectFromRegistry } from './routeDetector.js';
import { sanitizeObject } from '../utils/helpers.js';
import { generateAuditRequestId } from '../utils/auditHelpers.js';

// Simplified configuration - always log and audit
const DEFAULT_CONFIGS = {
  [ROUTE_TYPES.PUBLIC]: {
    enableAudit: true,
    enableRouteTracking: true,
    enablePerformanceTracking: true,
    // Chỉ exclude assets và các favicon files, giữ lại / và /health để log console
    excludePaths: ['/assets', '/favicon.ico', '/favicon.png', '/apple-touch-icon.png', '/icon-192.png']
  },
  [ROUTE_TYPES.AUTH]: {
    enableAudit: true,
    enableRouteTracking: true,
    enablePerformanceTracking: true,
    sensitiveFields: ['password', 'token', 'refresh_token']
  },
  [ROUTE_TYPES.USER]: {
    enableAudit: true,
    enableRouteTracking: true,
    enablePerformanceTracking: true
  },
  [ROUTE_TYPES.ADMIN]: {
    enableAudit: true,
    enableRouteTracking: true,
    enablePerformanceTracking: true,
    sensitiveFields: ['password', 'token', 'refresh_token', 'jwt_secret']
  },
  [ROUTE_TYPES.SUPER_ADMIN]: {
    enableAudit: true,
    enableRouteTracking: true,
    enablePerformanceTracking: true,
    sensitiveFields: ['password', 'token', 'refresh_token', 'jwt_secret', 'api_key']
  },
  [ROUTE_TYPES.SYSTEM]: {
    enableAudit: true,
    enableRouteTracking: true,
    enablePerformanceTracking: true
  },
  [ROUTE_TYPES.API]: {
    enableAudit: true,
    enableRouteTracking: true,
    enablePerformanceTracking: true
  }
};

/**
 * Enhanced Unified Middleware Factory
 * @param {string} routeType - Type of route
 * @param {string} routeName - Specific route name for tracking
 * @param {string} routePattern - Route pattern (e.g., "GET /api/users/:id")
 * @param {Object} customOptions - Custom configuration overrides
 * @returns {Function} Hono middleware function
*/
export function createUnifiedRequestMiddleware(
  routeType = ROUTE_TYPES.API,
  routeName = null,
  routePattern = null,
  customOptions = {}
) {
  // Merge default config with custom options
  const defaultConfig = DEFAULT_CONFIGS[routeType] || DEFAULT_CONFIGS[ROUTE_TYPES.API];
  const config = { ...defaultConfig, ...customOptions };

  handleMiddleware_log(`🔧 Creating unified middleware for ${routeType}: ${routeName || 'Unknown'}`);

  return async (c, next) => {
    // Idempotent guard to prevent duplicate processing if middleware applied multiple times
    if (c.get('__unifiedApplied')) {
      return next();
    }
    c.set('__unifiedApplied', true);
    const startTime = Date.now();
    const requestId = generateAuditRequestId();
    const timestamp = new Date().toISOString();

    // Parse URL and request info
    const url = new URL(c.req.url);
    const path = url.pathname;
    const method = c.req.method;
    const query = c.req.query();
    const userAgent = c.req.header('user-agent') || 'Unknown';
    const ip = c.req.header('x-forwarded-for') ||
               c.req.header('x-real-ip') ||
               c.req.header('CF-Connecting-IP') ||
               'Unknown';

    // Skip excluded paths
    if (config.excludePaths && config.excludePaths.some(excludePath => path.includes(excludePath))) {
      await next();
      return;
    }

    // Route tracking - store in context
    if (config.enableRouteTracking && routeName && routePattern) {
      c.set('routeName', routeName);
      c.set('routePattern', routePattern);
      c.set('routeType', routeType);
    }

    // Auto-detect route info dynamically if not provided
    let dynamicInfo = null;
    if (!routeName) {
      dynamicInfo = detectFromRegistry(path, method);
    }
    const finalRouteName = routeName || dynamicInfo?.name || `${method} ${path}`;
    const finalRoutePattern = routePattern || dynamicInfo?.pattern || `${method} ${path}`;
    if (dynamicInfo && !routeName) {
      // If detection determined a more precise routeType (e.g., param route) override for logging
      routeType = dynamicInfo.routeType || routeType; // eslint-disable-line no-param-reassign
    }

    // Always log request information
    handleMiddleware_log(`🚀 REQUEST START [${requestId}] ${timestamp}`);
    handleMiddleware_log(`📍 ${method} ${path} ${Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : ''}`);
    handleMiddleware_log(`🌐 IP: ${ip} | User-Agent: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}`);

    if (config.enableRouteTracking) {
      handleMiddleware_log(`🎯 Route: ${finalRouteName} (${finalRoutePattern}) | Type: ${routeType}`);
    }

    // Always capture request body for logging and audit
    let requestBody = null;
    let requestBodyForAudit = null;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const contentType = c.req.header('content-type') || '';

        if (contentType.includes('application/json')) {
          // Read body once and cache for downstream validators (Zod) which also call c.req.json()
          requestBody = await c.req.json();
          // Monkey patch c.req.json so subsequent calls re-use cached body to avoid empty body issues
          try {
            const originalReq = c.req;
            if (!originalReq.__cachedJson) {
              originalReq.__cachedJson = requestBody;
              originalReq.json = () => originalReq.__cachedJson; // override
            }
          } catch (e) {
            handleMiddleware_log('⚠️ Failed to monkey patch request json(): ' + e.message);
          }
          // Sanitize user input to prevent XSS
          requestBody = sanitizeObject(requestBody, ['description', 'message', 'comment', 'content', 'name', 'title']);
          requestBodyForAudit = sanitizeRequestBody(requestBody, config.sensitiveFields);
          handleMiddleware_log(`📝 Request Body (JSON Cached and Sanitized): ${JSON.stringify(requestBodyForAudit, null, 2)}`);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          // Use raw request instead of clone for compatibility
          const formData = await c.req.formData();
          const formObject = Object.fromEntries(formData.entries());
          // Sanitize form data
          requestBody = sanitizeObject(formObject, ['description', 'message', 'comment', 'content', 'name', 'title']);
          requestBodyForAudit = sanitizeRequestBody(requestBody, config.sensitiveFields);

          handleMiddleware_log(`📝 Request Body (Form Sanitized): ${JSON.stringify(requestBodyForAudit, null, 2)}`);
        } else if (contentType.includes('multipart/form-data')) {
          handleMiddleware_log('📝 Request Body: [Multipart Form Data - Content not logged for security]');
        }
      } catch (e) {
        handleMiddleware_log(`❌ Error parsing request body: ${e.message}`);
      }
    }

    // Store comprehensive request info in context
    c.set('requestId', requestId);
    c.set('startTime', startTime);
    c.set('unifiedRequestInfo', {
      requestId,
      method,
      path,
      query,
      timestamp,
      ip,
      userAgent,
      requestBody: requestBodyForAudit,
      routeName: finalRouteName,
      routePattern: finalRoutePattern,
      routeType
    });

    let responseData = null;
    let statusCode = null;
    let error = null;

    try {
      // Execute the route handler
      await next();

      // Capture response data
      statusCode = c.res.status;

      // Always try to get response body for logging - controlled by KV setting
      try {
        // Check if response body capture is enabled via KV setting
        const { responseCaptureEnabled } = await getResponseLogSettings(c.env);

        if (responseCaptureEnabled) {
          try {
            const contentType = c.res.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
              // Try to clone and read the response body
              const clonedResponse = c.res.clone();
              const responseText = await clonedResponse.text();
              try {
                const responseJson = JSON.parse(responseText);
                responseData = responseJson;
                handleMiddleware_log(`🔓 Response body captured (JSON): ${responseText.length} chars`);
              } catch (parseError) {
                responseData = `[JSON Parse Error: ${parseError.message}] Raw: ${responseText.substring(0, 500)}...`;
              }
            } else if (contentType.includes('text/')) {
              const clonedResponse = c.res.clone();
              const responseText = await clonedResponse.text();
              responseData = responseText.substring(0, 1000) + (responseText.length > 1000 ? '...[truncated]' : '');
              handleMiddleware_log(`🔓 Response body captured (TEXT): ${responseText.length} chars`);
            } else {
              responseData = `[${contentType} - Capture enabled, Size: ${c.res.headers.get('content-length') || 'Unknown'}]`;
            }
          } catch (captureError) {
            handleMiddleware_log(`⚠️  Failed to capture response body: ${captureError.message}`);
            responseData = `[Capture Failed: ${captureError.message}]`;
          }
        } else {
          // Default behavior when capture is disabled
          const contentType = c.res.headers.get('content-type') || '';

          if (contentType.includes('application/json') || (contentType.includes('text/'))) {
            responseData = '[Text Response - Body not captured for compatibility]';
          } else {
            responseData = `[${contentType} - ${c.res.headers.get('content-length') || 'Unknown size'}]`;
          }
        }
      } catch (e) {
        handleMiddleware_log(`⚠️  Could not read response body: ${e.message}`);
      }

    } catch (middlewareError) {
      statusCode = 500;
      error = {
        message: middlewareError.message,
        stack: middlewareError.stack
      };
      responseData = { error: middlewareError.message };
      handleMiddleware_log(`💥 Route Error: ${middlewareError.message}`);
      throw middlewareError; // Re-throw to maintain error flow
    }

    // Calculate performance metrics
    const processingTime = Date.now() - startTime;
    const endTimestamp = new Date().toISOString();

    // Always log response information
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' :
      statusCode >= 300 && statusCode < 400 ? '🔄' :
        statusCode >= 400 && statusCode < 500 ? '⚠️' : '💥';

    handleMiddleware_log(`${statusEmoji} RESPONSE END [${requestId}] ${endTimestamp}`);
    handleMiddleware_log(`📊 Status: ${statusCode} | Time: ${processingTime}ms | Route: ${finalRouteName}`);

    if (config.enablePerformanceTracking) {
      // Add performance header
      c.header('X-Response-Time', `${processingTime}ms`);
      c.header('X-Request-ID', requestId);

      // Log slow requests
      if (processingTime > 1000) {
        handleMiddleware_log(`🐌 SLOW REQUEST: ${processingTime}ms - ${method} ${path}`);
      } else if (processingTime > 500) {
        handleMiddleware_log(`⚡ MODERATE REQUEST: ${processingTime}ms - ${method} ${path}`);
      }
    }

    // Always log response body if available
    if (responseData) {
      if (typeof responseData === 'object') {
        handleMiddleware_log(`📤 Response Body: ${JSON.stringify(responseData, null, 2)}`);
      } else {
        handleMiddleware_log(`📤 Response Body: ${responseData}`);
      }
    }

    handleMiddleware_log(`🏁 REQUEST COMPLETE [${requestId}] - Total time: ${processingTime}ms\n`);

    // Always enable audit logging for all routes
    try {
      const auditEntry = createAuditEntry(c, {
        requestId,
        method,
        path,
        query,
        ip,
        userAgent,
        requestBody: requestBodyForAudit,
        responseData,
        statusCode,
        processingTime,
        error,
        routeName: finalRouteName,
        routeType
      });

      const auditLogService = new AuditLogService(c.env);
      
      // Use waitUntil to prevent blocking the response
      if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
        c.executionCtx.waitUntil(
          auditLogService.log(auditEntry)
            .then(() => handleMiddleware_log(`📋 Audit logged (async): ${auditEntry.action} by ${auditEntry.actor_role}`))
            .catch(err => auditMiddleware_log(`❌ Failed to log audit entry (async):`, err))
        );
      } else {
        // Fallback for environments without executionCtx (e.g. some tests)
        await auditLogService.log(auditEntry);
        handleMiddleware_log(`📋 Audit logged (sync): ${auditEntry.action} by ${auditEntry.actor_role}`);
      }

    } catch (auditError) {
      auditMiddleware_log(`❌ Failed to log audit entry for ${routeType} route:`, auditError);
    }
  };
}

/**
 * Sanitize request body by removing sensitive fields
*/
function sanitizeRequestBody(body, sensitiveFields = []) {
  if (!body || typeof body !== 'object') {return body;}

  const sanitized = { ...body };
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  return sanitized;
}

/**
 * Detect route info from central registry (exact + param match)
 */
// detection moved to routeDetector.js

/**
 * Create audit entry from request/response data
*/
function createAuditEntry(c, requestData) {
  const user = c.get('user') || null;
  const { method, path, ip, userAgent, statusCode, processingTime, routeName, routeType } = requestData;

  // Determine action and entity
  const action = determineAction(method, path);
  const entityType = determineEntityType(path);
  const entityId = extractEntityId(path);

  // Determine status
  let status = 'SUCCESS';
  let errorMessage = null;

  if (statusCode >= 400) {
    if (statusCode === 401) {
      status = 'UNAUTHORIZED';
      errorMessage = 'Authentication required';
    } else if (statusCode === 403) {
      status = 'FORBIDDEN';
      errorMessage = 'Access denied';
    } else if (statusCode >= 500) {
      status = 'ERROR';
      errorMessage = requestData.error?.message || 'Server error';
    } else {
      status = 'FAILED';
      errorMessage = `Request failed with status ${statusCode}`;
    }
  }

  return {
    action,
    actor_id: user?.user_id || user?.id || null,
    actor_role: user?.role || 'anonymous',
    actor_email: user?.email || null,
    target_type: entityType,
    target_id: entityId,
    target_identifier: entityId || path,
    ip_address: ip,
    user_agent: userAgent,
    status,
    error_message: errorMessage,
    details: {
      method,
      path,
      statusCode,
      duration: processingTime,
      routeName,
      routeType,
      requestId: requestData.requestId,
      // Always include request/response data for comprehensive audit
      requestBody: requestData.requestBody,
      responseData: requestData.responseData
    }
  };
}

// Helper functions
function determineAction(method, path) {
  const lowerPath = path.toLowerCase();

  if (lowerPath.includes('/login')) {return 'login';}
  if (lowerPath.includes('/logout')) {return 'logout';}
  if (lowerPath.includes('/register')) {return 'register';}

  switch (method) {
  case 'GET': return 'view';
  case 'POST': return 'create';
  case 'PUT': return 'update';
  case 'PATCH': return 'modify';
  case 'DELETE': return 'delete';
  default: return method.toLowerCase();
  }
}

function determineEntityType(path) {
  const lowerPath = path.toLowerCase();

  if (lowerPath.includes('/users')) {return 'user';}
  if (lowerPath.includes('/admin')) {return 'admin';}
  if (lowerPath.includes('/auth')) {return 'authentication';}
  if (lowerPath.includes('/audit')) {return 'audit';}
  if (lowerPath.includes('/security')) {return 'security';}
  if (lowerPath.includes('/monitoring')) {return 'monitoring';}

  return 'system';
}

function extractEntityId(path) {
  const idMatch = path.match(/\/(\d+)(?:\/|$)/);
  return idMatch ? idMatch[1] : null;
}

// Pre-configured middleware factories - simplified without levels
export const unifiedMiddlewares = {
  // Public endpoints
  public: (routeName, routePattern) =>
    createUnifiedRequestMiddleware(ROUTE_TYPES.PUBLIC, routeName, routePattern),

  // Authentication endpoints
  auth: (routeName, routePattern) =>
    createUnifiedRequestMiddleware(ROUTE_TYPES.AUTH, routeName, routePattern),

  // User endpoints
  user: (routeName, routePattern) =>
    createUnifiedRequestMiddleware(ROUTE_TYPES.USER, routeName, routePattern),

  // Admin endpoints
  admin: (routeName, routePattern) =>
    createUnifiedRequestMiddleware(ROUTE_TYPES.ADMIN, routeName, routePattern),

  // Super Admin endpoints
  superAdmin: (routeName, routePattern) =>
    createUnifiedRequestMiddleware(ROUTE_TYPES.SUPER_ADMIN, routeName, routePattern),

  // System endpoints
  system: (routeName, routePattern) =>
    createUnifiedRequestMiddleware(ROUTE_TYPES.SYSTEM, routeName, routePattern),

  // General API endpoints
  api: (routeName, routePattern) =>
    createUnifiedRequestMiddleware(ROUTE_TYPES.API, routeName, routePattern),

  // Auto-detect route type and apply appropriate middleware
  auto: (routeName, routePattern) => {
    return (c, next) => {
      // Try dynamic detection to pick routeType
      const match = detectFromRegistry(c.req.path, c.req.method);
      const rt = match?.routeType || ROUTE_TYPES.API;
      return createUnifiedRequestMiddleware(rt, routeName || match?.name, routePattern || match?.pattern)(c, next);
    };
  },

  // Custom configuration
  custom: (routeType, routeName, routePattern, options) =>
    createUnifiedRequestMiddleware(routeType, routeName, routePattern, options)
};

// Export detection for testing / diagnostics
export const __internal = { detectFromRegistry };
