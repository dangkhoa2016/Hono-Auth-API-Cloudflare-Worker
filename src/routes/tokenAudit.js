import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  listQuerySchema,
  updateAuditLogSchema,
  bulkDeleteSchema
} from '../schemas/tokenAudit.js';
import { createTokenAuditService } from '../utils/serviceFactory.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/authorization.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { adminRoutes_log, error_log } from '../utils/debug.js';
import { handleStandardError } from '../utils/errorHandler.js';

const tokenAuditRoutes = new Hono();

// Middleware Stack
tokenAuditRoutes.use('*', authMiddleware);
tokenAuditRoutes.use('*', requireSuperAdmin);
tokenAuditRoutes.use('*', unifiedMiddlewares.auto());

// Routes

/**
 * GET / - List token audit logs
 */
tokenAuditRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  try {
    const { page, limit, search } = c.req.valid('query');
    const service = createTokenAuditService(c.env);

    adminRoutes_log(`List token audit logs page=${page} limit=${limit} search=${search}`);
    const result = await service.listLogs({ page, limit, search });

    return c.json(createSuccessResponse(result, 'Token audit logs retrieved successfully'));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to list token audit logs', error_log);
  }
});

/**
 * GET /:id - Get token audit log details
 */
tokenAuditRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const service = createTokenAuditService(c.env);
    const logDetails = await service.getLogDetails(id);

    if (!logDetails) {
      return c.json({ success: false, error: 'Audit log not found' }, 404);
    }

    return c.json(createSuccessResponse(logDetails, 'Audit log details retrieved successfully'));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to get audit log details', error_log);
  }
});

/**
 * PUT /:id - Update token audit log
 */
tokenAuditRoutes.put('/:id', zValidator('json', updateAuditLogSchema), async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const data = c.req.valid('json');
    const service = createTokenAuditService(c.env);

    adminRoutes_log(`Updating audit log id=${id}`);
    const success = await service.updateLog(id, data);

    if (!success) {
      return c.json({ success: false, error: 'Audit log not found or update failed' }, 404);
    }

    return c.json(createSuccessResponse({ success: true }, 'Audit log updated successfully'));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to update audit log', error_log);
  }
});

/**
 * DELETE /bulk-delete - Bulk delete token audit logs
 */
tokenAuditRoutes.post('/bulk-delete', zValidator('json', bulkDeleteSchema), async (c) => {
  try {
    const { ids } = c.req.valid('json');
    const service = createTokenAuditService(c.env);

    adminRoutes_log(`Bulk deleting audit logs: ${ids.length} items`);
    const count = await service.bulkDeleteLogs(ids);

    return c.json(createSuccessResponse({ deleted_sub_count: count }, 'Audit logs deleted successfully'));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to bulk delete audit logs', error_log);
  }
});

/**
 * DELETE /:id - Delete token audit log
 */
tokenAuditRoutes.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const service = createTokenAuditService(c.env);
    const success = await service.deleteLog(id);

    if (!success) {
      return c.json({ success: false, error: 'Audit log not found' }, 404);
    }

    return c.json(createSuccessResponse({ success: true }, 'Audit log deleted successfully'));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to delete audit log', error_log);
  }
});

export default tokenAuditRoutes;
