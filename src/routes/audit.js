/**
 * Audit Log Routes
 * API endpoints for viewing and managing audit logs
*/

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import { createAuditLogService } from '../utils/serviceFactory.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { ROLE_COMBINATIONS, ROLES } from '../constants/roles.js';
import { auditRoutes_log } from '../utils/debug.js';
import { tSuccess, t } from '../i18n/index.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { serviceErrorFromResult } from '../utils/serviceErrors.js';
import { createAuditScope } from '../services/auditScope.js';

const audit = new Hono();

// All audit routes require authentication FIRST
audit.use('*', authMiddleware);
// Apply unified auto middleware once globally (remove per-endpoint usage to avoid duplicate logging)
audit.use('*', unifiedMiddlewares.auto());

/**
 * GET /api/audit/logs - Get audit logs with filtering and pagination
 * Accessible by: admin (own actions + subordinates), super_admin (all)
*/
audit.get('/logs',
  requireRole(ROLE_COMBINATIONS.ADMIN_ONLY),
  i18nValidatorsMiddleware.auditQuery('query'),
  async (c) => {
    const user = c.get('user');
    const query = c.req.valid('query');
    const actorRoleFilter = query.actorRole || c.req.query('actorRole');

    try {
      auditRoutes_log(`Audit logs request by ${user.role} ${user.id} with filters: ${JSON.stringify(query)}`);

      const auditLogService = createAuditLogService(c.env);

      // Role restriction is derived server-side; the client only narrows filters
      const filters = {
        action: query.action,
        actor_id: query.userId,
        actor_role: actorRoleFilter,
        target_type: query.entityType,
        start_date: query.startDate,
        end_date: query.endDate
      };

      const pagination = {
        page: query.page,
        limit: query.limit
      };

      const result = await auditLogService.getLogs(filters, pagination, user);

      if (!result.success) {
        auditRoutes_log(`Failed to get audit logs: ${result.error}`);
        return await handleStandardError(
          c,
          new Error(result.error || 'AUDIT_LOGS_FAILED'),
          'Failed to get audit logs',
          auditRoutes_log,
          'audit.logs.retrieveFailed',
          {
            actor: user.full_name || user.email,
            reason: t(c, 'system.serverError'),
            suggestion: user.role === 'super_admin' ?
              t(c, 'audit.logs.suggestion_super_admin') :
              t(c, 'audit.logs.suggestion_admin'),
            operation: t(c, 'audit.operations.logsView')
          },
          500
        );
      }

      auditRoutes_log(`Retrieved ${result.data.logs.length} audit logs for ${user.role} ${user.id}`);

      return c.json(createSuccessResponse({
        logs: result.data.logs,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.data.pagination.total,
          totalPages: result.data.pagination.totalPages,
          hasNext: query.page * query.limit < result.data.pagination.total,
          hasPrev: query.page > 1
        },
        filters: query
      }, tSuccess(c, 'auditMessages.retrieved', {
        count: result.data.logs.length,
        role: user.role,
        actor: user.full_name || user.email,
        totalPages: result.data.pagination.totalPages,
        currentPage: query.page
      })));

    } catch (error) {
      return await handleStandardError(
        c,
        error,
        'Failed to retrieve audit logs',
        auditRoutes_log,
        'audit.logs.retrieveFailed',
        {
          actor: user.full_name || user.email,
          reason: t(c, 'system.serverError'),
          operation: t(c, 'audit.operations.logsView')
        }
      );
    }
  }
);

/**
 * GET /api/audit/search - Advanced search audit logs
 * Accessible by: admin (own actions + subordinates), super_admin (all)
*/
audit.get('/search',
  requireRole(ROLE_COMBINATIONS.ADMIN_ONLY),
  i18nValidatorsMiddleware.auditSearch('query'),
  async (c) => {
    const user = c.get('user');
    const query = c.req.valid('query');
    const actorRoleFilter = query.actorRole || c.req.query('actorRole');

    try {
      auditRoutes_log(`Audit search request by ${user.role} ${user.id}:`, query);

      const auditLogService = createAuditLogService(c.env);
      const result = await auditLogService.searchLogs({
        ...query,
        actorRole: actorRoleFilter
      }, user);

      if (!result.success) {
        return await handleStandardError(
          c,
          new Error(result.error || 'AUDIT_SEARCH_FAILED'),
          'Failed to search audit logs',
          auditRoutes_log,
          'audit.search.searchFailed',
          {
            actor: user.full_name || user.email,
            reason: t(c, 'system.serverError'),
            query: query.search,
            suggestion: user.role === 'super_admin' ?
              t(c, 'audit.search.suggestion_super_admin') :
              t(c, 'audit.search.suggestion_admin'),
            operation: t(c, 'audit.operations.search')
          },
          500
        );
      }

      auditRoutes_log(`Search returned ${result.data.logs.length} audit logs`);

      return c.json(createSuccessResponse({
        logs: result.data.logs,
        pagination: result.data.pagination,
        searchQuery: {
          search: query.search,
          searchFields: query.searchFields,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }
      }, tSuccess(c, 'auditMessages.searchCompleted', {
        // Use resultCount to match i18n key placeholder
        resultCount: result.data.logs.length,
        query: query.search,
        actor: user.full_name || user.email,
        fields: query.searchFields?.join(', ') || t(c, 'audit.search.allFields')
      })));

    } catch (error) {
      return await handleStandardError(
        c,
        error,
        'Failed to search audit logs',
        auditRoutes_log,
        'audit.search.searchFailed',
        {
          actor: user.full_name || user.email,
          reason: t(c, 'system.serverError'),
          operation: t(c, 'audit.operations.search'),
          query: query.search || t(c, 'audit.search.noQuery')
        }
      );
    }
  }
);

/**
 * GET /api/audit/stats - Get audit statistics
 * Accessible by: admin (limited), super_admin (all)
*/
audit.get('/stats',
  requireRole(ROLE_COMBINATIONS.ADMIN_ONLY),
  async (c) => {
    const user = c.get('user');

    try {
      auditRoutes_log(`Audit stats request by ${user.role} ${user.id}`);

      const auditLogService = createAuditLogService(c.env);
      const stats = await auditLogService.getAuditStats({
        exclude_super_admin: createAuditScope(user).excludeSuperAdmin
      });

      if (!stats.success) {
        auditRoutes_log(`Failed to get audit stats: ${stats.error}`);
        return await handleStandardError(
          c,
          new Error(stats.error || 'AUDIT_STATS_FAILED'),
          'Failed to get audit stats',
          auditRoutes_log,
          'audit.stats.statsFailed',
          {
            actor: user.full_name || user.email,
            reason: t(c, 'system.serverError'),
            suggestion: user.role === 'super_admin' ?
              t(c, 'audit.stats.suggestion_super_admin') :
              t(c, 'audit.stats.suggestion_admin'),
            operation: t(c, 'audit.operations.stats')
          },
          500
        );
      }

      auditRoutes_log(`Retrieved audit stats for ${user.role} ${user.id}: ${Object.keys(stats.data)}`);

      return c.json(createSuccessResponse(stats.data,
        tSuccess(c, 'auditMessages.statsRetrieved', {
          actor: user.full_name || user.email,
          role: user.role,
          statsCount: Object.keys(stats.data).length,
          accessLevel: user.role === ROLES.SUPER_ADMIN ?
            t(c, 'audit.access.full') :
            t(c, 'audit.access.limited')
        })
      ));

    } catch (error) {
      return await handleStandardError(
        c,
        error,
        'Failed to retrieve audit statistics',
        auditRoutes_log,
        'audit.stats.statsFailed',
        {
          actor: user.full_name || user.email,
          reason: t(c, 'system.serverError'),
          operation: t(c, 'audit.operations.stats'),
          role: user.role
        }
      );
    }
  }
);

/**
 * GET /api/audit/export - Export audit logs as CSV
 * Accessible by: super_admin only
*/
audit.get('/export',
  requireRole(ROLE_COMBINATIONS.ADMIN_ONLY),
  i18nValidatorsMiddleware.auditExport('query'),
  async (c) => {
    const user = c.get('user');
    const query = c.req.valid('query');
    // The export service already defaults an absent format to json, but the
    // route went on to use the raw query value for the content type, the
    // filename and the success message. Omitting `format` therefore produced a
    // 500 from `undefined.toUpperCase()` and a filename ending in
    // `.undefined`. One value, used everywhere, so the default a client gets is
    // the default the service already chose.
    const format = String(query.format || 'json').toLowerCase();

    try {
      auditRoutes_log(`Audit export request by ${user.role} ${user.id} format: ${format}`);

      const auditLogService = createAuditLogService(c.env);
      const exportResult = await auditLogService.exportLogs({
        format,
        startDate: query.startDate,
        endDate: query.endDate,
        filters: query.filters,
        includeDetails: query.includeDetails,
        maxRecords: query.maxRecords
      }, user);

      if (!exportResult.success) {
        // A format we cannot produce is the caller's mistake, not a server
        // fault: 422 with the real list, never a file labelled `.excel` that
        // turns out to hold JSON.
        if (exportResult.statusCode === 422) {
          // The correlation id has to reach the body, not only the
          // `X-Request-ID` header: a support request usually starts from the
          // JSON a client logged, and an id that is absent there cannot be
          // quoted. The middleware minted this one, so body and header agree.
          const requestId = c.get('requestId');
          return c.json({
            success: false,
            error: exportResult.error,
            code: exportResult.error,
            message: exportResult.message,
            supported_formats: exportResult.supported_formats,
            ...(requestId ? { requestId } : {})
          }, 422);
        }


        // The service has already decided what this failure is. Rebuilding a
        // bare `Error` from its message threw that decision away, which is how
        // a store outage ended up reported to the client as a 500 the client
        // caused. `serviceErrorFromResult` keeps the status and the machine
        // code, and the status is re-read from the error below.
        const failure = serviceErrorFromResult(exportResult, 'AUDIT_EXPORT_FAILED');
        const requestId = c.get('requestId');

        return await handleStandardError(
          c,
          failure,
          'Failed to export audit logs',
          auditRoutes_log,
          'audit.export.exportFailed',
          {
            actor: user.full_name || user.email,
            // Not `exportResult.error`: that is an internal token, and a caller
            // cannot act on it. The machine code rides in `code` instead.
            reason: t(c, 'system.serverError'),
            operation: t(c, 'audit.operations.export'),
            format
          },
          500,
          // The id has to be in the body, not only the `X-Request-ID` header:
          // a support request usually starts from the JSON a client logged.
          requestId ? { requestId } : null
        );
      }

      const exportContent = exportResult.data?.content ?? '';

      const contentType = format === 'csv' ? 'text/csv' : 'application/json';
      const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;

      auditRoutes_log(`Exporting audit logs as ${format}: ${filename}`);

      // Add success message as header (for logging/debugging)
      const successMessage = tSuccess(c, 'auditMessages.exported', {
        format: format.toUpperCase(),
        filename: filename,
        actor: user.full_name || user.email,
        date: new Date().toLocaleDateString()
      });

      return new Response(exportContent, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Export-Message': successMessage
        }
      });

    } catch (error) {
      return await handleStandardError(
        c,
        error,
        'Failed to export audit logs',
        auditRoutes_log,
        'audit.export.exportFailed',
        {
          actor: user.full_name || user.email,
          reason: t(c, 'system.serverError'),
          operation: t(c, 'audit.operations.export'),
          format
        }
      );
    }
  }
);

/**
 * GET /api/audit/system-health - Get audit system health
 * Accessible by: super_admin only
*/
audit.get('/system-health',
  requireRole(ROLE_COMBINATIONS.ADMIN_ONLY),
  async (c) => {
    const user = c.get('user');

    try {
      auditRoutes_log(`Audit system health check by ${user.role} ${user.id}`);

      const auditLogService = createAuditLogService(c.env);
      const health = await auditLogService.checkAuditHealth();

      auditRoutes_log(`Audit system health status: ${health.success ? 'success' : 'failed'}`);

      return c.json(createSuccessResponse(health,
        tSuccess(c, 'auditMessages.healthRetrieved', {
          status: health.success ? t(c, 'audit.health.healthy') : t(c, 'audit.health.unhealthy'), actor: user.full_name || user.email,
          timestamp: new Date().toISOString(),
          checkType: t(c, 'audit.health.systemCheck')
        })
      ));

    } catch (error) {
      return await handleStandardError(
        c,
        error,
        'Failed to check audit system health',
        auditRoutes_log,
        'audit.health.healthFailed',
        {
          actor: user.full_name || user.email,
          reason: t(c, 'system.serverError'),
          operation: t(c, 'audit.operations.healthCheck'),
          checkType: t(c, 'audit.health.systemCheck')
        }
      );
    }
  }
);

/**
 * DELETE /api/audit/logs/:id - Delete single audit log
 * Accessible by: super_admin (full); admin allowed (policy can be tightened later)
 */
audit.delete('/logs/:id', requireRole(ROLE_COMBINATIONS.ADMIN_ONLY), async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');
  const id = Number(idParam);
  if (Number.isNaN(id) || id <= 0) {
    return c.json({ success: false, error: 'Invalid audit log id' }, 400);
  }
  try {
    auditRoutes_log(`Delete audit log request id=${id} by ${user.role} ${user.id}`);
    const auditLogService = createAuditLogService(c.env);
    const result = await auditLogService.deleteLogById(id);
    if (result.notFound) {
      return c.json({ success: false, error: 'Audit log not found' }, 404);
    }
    if (!result.success) {
      return await handleStandardError(
        c,
        new Error(result.error || 'DELETE_AUDIT_FAILED'),
        'Failed to delete audit log',
        auditRoutes_log,
        'audit.logs.retrieveFailed',
        {
          actor: user.full_name || user.email,
          reason: t(c, 'system.serverError'),
          operation: 'delete audit log'
        },
        500
      );
    }
    return c.json(createSuccessResponse({ id, deleted: result.deleted }, tSuccess(c, 'operation.completed', {
      operationType: 'delete audit log',
      duration: 0
    })));
  } catch (error) {
    return await handleStandardError(
      c,
      error,
      'Failed to delete audit log',
      auditRoutes_log,
      'audit.logs.retrieveFailed',
      {
        actor: user.full_name || user.email,
        reason: t(c, 'system.serverError'),
        operation: 'delete audit log'
      }
    );
  }
});

export default audit;
