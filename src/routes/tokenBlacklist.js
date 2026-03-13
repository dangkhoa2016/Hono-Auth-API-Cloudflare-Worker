import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  listQuerySchema,
  createBlacklistSchema,
  bulkDeleteSchema
} from '../schemas/tokenBlacklist.js';
import { createTokenBlacklistService } from '../utils/serviceFactory.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/authorization.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { adminRoutes_log, error_log } from '../utils/debug.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { t } from '../i18n/index.js';

const tokenBlacklistRoutes = new Hono();

// Middleware Stack
tokenBlacklistRoutes.use('*', authMiddleware);
tokenBlacklistRoutes.use('*', requireSuperAdmin);
tokenBlacklistRoutes.use('*', unifiedMiddlewares.auto());

// Routes

/**
 * GET / - List blacklisted tokens
 */
tokenBlacklistRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  try {
    const { page, limit, search } = c.req.valid('query');
    const service = createTokenBlacklistService(c.env);

    adminRoutes_log(`List blacklist tokens page=${page} limit=${limit} search=${search}`);

    const result = await service.listTokens({ page, limit, search });

    return c.json(createSuccessResponse(result, t(c, 'tokenBlacklist.listSuccess')));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to list blacklisted tokens', error_log);
  }
});

/**
 * POST / - Add token to blacklist
 */
tokenBlacklistRoutes.post('/', zValidator('json', createBlacklistSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const service = createTokenBlacklistService(c.env);

    if (!data.userId) {
      // Attempt to auto-detect the user's ID associated with this token from audit logs
      const auditLog = await service.dbService.select(
        'SELECT user_id FROM token_audit_logs WHERE token_jti = ? LIMIT 1',
        [data.jti],
        true
      );
      
      if (auditLog && auditLog.user_id) {
        data.userId = auditLog.user_id;
        adminRoutes_log(`Auto-detected userId=${data.userId} for jti=${data.jti}`);
      } else {
        throw new Error('User ID is required. The system could not auto-detect it from the provided JTI.');
      }
    }

    adminRoutes_log(`Adding jti=${data.jti} to blacklist`);

    const success = await service.addToBlacklist(data);

    if (!success) {
      throw new Error('Failed to create blacklist entry');
    }

    return c.json(createSuccessResponse({ success: true }, t(c, 'tokenBlacklist.createSuccess')), 201);
  } catch (error) {
    return handleStandardError(c, error, 'Failed to blacklist token', error_log);
  }
});

/**
 * GET /:id - Get token details
 */
tokenBlacklistRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const service = createTokenBlacklistService(c.env);
    const token = await service.getTokenDetails(id);

    if (!token) {
      return c.json({ success: false, error: t(c, 'tokenBlacklist.tokenNotFound') }, 404);
    }

    return c.json(createSuccessResponse(token, t(c, 'tokenBlacklist.getSuccess')));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to get blacklist token details', error_log);
  }
});

/**
 * DELETE /bulk-delete - Bulk delete tokens
 */
tokenBlacklistRoutes.post('/bulk-delete', zValidator('json', bulkDeleteSchema), async (c) => {
  try {
    const { ids } = c.req.valid('json');
    const service = createTokenBlacklistService(c.env);

    adminRoutes_log(`Bulk deleting blacklist tokens: ${ids.length} items`);

    const count = await service.bulkDeleteTokens(ids);

    return c.json(createSuccessResponse({ deleted_sub_count: count }, t(c, 'tokenBlacklist.bulkDeleteSuccess')));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to bulk delete tokens', error_log);
  }
});

/**
 * DELETE /:id - Delete token
 */
tokenBlacklistRoutes.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const service = createTokenBlacklistService(c.env);
    const success = await service.deleteToken(id);

    if (!success) {
      // Maybe it didn't exist, but delete is usually idempotent-ish for "not found" vs "success",
      // service.deleteToken returns changes > 0.
      // We can consider 0 changes as 404 or just success 0.
      // Let's assume 404 if not found for strict API
      return c.json({ success: false, error: t(c, 'tokenBlacklist.tokenNotFound') }, 404);
    }

    return c.json(createSuccessResponse({ success: true }, t(c, 'tokenBlacklist.deleteSuccess')));
  } catch (error) {
    return handleStandardError(c, error, 'Failed to delete blacklist token', error_log);
  }
});

export default tokenBlacklistRoutes;
