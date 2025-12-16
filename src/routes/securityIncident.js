/**
 * Security Incident Management Routes
*/

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import { createSecurityIncidentResponseService } from '../utils/serviceFactory.js';
import { ROLE_COMBINATIONS } from '../constants/roles.js';
import { securityIncidentRoutes_log } from '../utils/debug.js';
import { t, tError, tSuccess } from '../i18n/index.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
import { handleStandardError } from '../utils/errorHandler.js';

const securityIncident = new Hono();

// All incident routes require admin+ access
securityIncident.use('*', authMiddleware);
securityIncident.use('*', requireRole(ROLE_COMBINATIONS.ADMIN_ONLY));
// Apply unified auto middleware once (remove per-endpoint admin() usages to avoid duplicate logging)
securityIncident.use('*', unifiedMiddlewares.auto());

/**
 * GET /api/security-incident/incidents
 * Get all security incidents with filtering
*/
securityIncident.get('/incidents', async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);

    // Parse query parameters
    const filters = {
      status: c.req.query('status'),
      severity: c.req.query('severity'),
      type: c.req.query('type'),
      page: parseInt(c.req.query('page')) || 1,
      limit: parseInt(c.req.query('limit')) || 50,
      startTime: c.req.query('startTime'),
      endTime: c.req.query('endTime')
    };

    const result = securityService.getIncidents(filters);

    securityIncidentRoutes_log(`Retrieved ${result.incidents.length} incidents`);

    return c.json({
      success: true,
      data: result,
      message: tSuccess(c, 'security.incidents.retrieved', {
        actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
        incidentCount: result.incidents.length,
        filters: Object.keys(filters).filter(k => filters[k]).join(', ') || 'none',
        page: filters.page,
        limit: filters.limit
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve security incidents', securityIncidentRoutes_log, 'security.incidents.retrieveFailed', {
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      // Use existing endpoint description key for operation label (dedicated operations.* keys not defined yet)
      operation: t(c, 'endpoints.security_incident.incidents')
    });
  }
});

/**
 * POST /api/security-incident/incidents
 * Create a new security incident manually
*/
securityIncident.post('/incidents', i18nValidatorsMiddleware.createIncident('json'), async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);
    const incidentData = c.req.valid('json');
    const user = c.get('user');

    // Add creator information
    incidentData.metadata = {
      ...incidentData.metadata,
      createdBy: user.id,
      creatorEmail: user.email,
      manual: true
    };

    const incident = securityService.createManualIncident(incidentData);

    securityIncidentRoutes_log(`Manual incident created: ${incident.id} by user ${user.id}`);

    return c.json({
      success: true,
      data: incident,
      message: tSuccess(c, 'security.incident.created', {
        actor: user.fullName || user.email,
        incidentId: incident.id,
        severity: incidentData.severity || 'unknown',
        type: incidentData.type || 'unknown',
        title: incidentData.title || 'Untitled Incident'
      })
    }, 201);
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to create security incident', securityIncidentRoutes_log, 'security.incidents.createFailed', {
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      operation: t(c, 'endpoints.security_incident.incidentsCreate')
    });
  }
});

/**
 * GET /api/security-incident/incidents/:id
 * Get specific incident details
*/
securityIncident.get('/incidents/:id', async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);
    const incidentId = c.req.param('id');

    const incident = securityService.getIncident(incidentId);

    if (!incident) {
      return c.json({
        success: false,
        error: tError(c, 'security.incident.notFound', {
          incidentId,
          requestedBy: c.get('user')?.email || 'Unknown',
          // Provide operation context for interpolation consistency
          operation: t(c, 'endpoints.security_incident.incidentDetails')
        })
      }, 404);
    }

    securityIncidentRoutes_log(`Retrieved incident details: ${incidentId}`);

    return c.json({
      success: true,
      data: incident,
      message: tSuccess(c, 'security.incident.retrieved', {
        actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
        incidentId,
        status: incident.status || 'unknown',
        severity: incident.severity || 'unknown',
        createdAt: incident.createdAt || 'unknown'
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve security incident details', securityIncidentRoutes_log, 'security.incidents.retrieveDetailFailed', {
      incidentId: c.req.param('id'),
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      operation: t(c, 'endpoints.security_incident.incidentDetails')
    });
  }
});

/**
 * PUT /api/security-incident/incidents/:id/status
 * Update incident status
*/
securityIncident.put('/incidents/:id/status', i18nValidatorsMiddleware.updateIncidentStatus('json'), async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);
    const incidentId = c.req.param('id');
    const updateData = c.req.valid('json');
    const user = c.get('user');

    const updateInfo = {
      ...updateData,
      actor: user.email
    };

    const updatedIncident = securityService.updateIncidentStatus(incidentId, updateData.status, updateInfo);

    securityIncidentRoutes_log(`Incident status updated: ${incidentId} -> ${updateData.status} by ${user.email}`);

    return c.json({
      success: true,
      data: updatedIncident,
      message: tSuccess(c, 'security.incident.statusUpdated', {
        incidentId,
        actor: user.fullName || user.email,
        oldStatus: updatedIncident.previousStatus || 'unknown',
        newStatus: updateData.status,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Check if it's a "not found" error (broaden pattern just in case)
    if (error.message && /incident not found/i.test(error.message)) {
      return c.json({
        success: false,
        error: tError(c, 'security.incident.notFound', {
          incidentId: c.req.param('id'),
          operation: t(c, 'endpoints.security_incident.incidentStatus'),
          requestedBy: c.get('user')?.email || c.get('user')?.fullName || 'Unknown'
        })
      }, 404);
    }

    return await handleStandardError(c, error, 'Failed to update security incident status', securityIncidentRoutes_log, 'security.incidents.statusUpdateFailed', {
      incidentId: c.req.param('id'),
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      operation: t(c, 'endpoints.security_incident.incidentStatus')
    });
  }
});

/**
 * POST /api/security-incident/incidents/:id/response
 * Execute manual response actions
*/
securityIncident.post('/incidents/:id/response', i18nValidatorsMiddleware.manualResponse('json'), async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);
    const incidentId = c.req.param('id');
    const responseData = c.req.valid('json');
    const user = c.get('user');

    // Convert single response to array format expected by service
    const actions = [responseData];
    const responseResult = await securityService.executeManualResponse(incidentId, actions);

    securityIncidentRoutes_log(`Manual response executed for incident ${incidentId} by ${user.email}`);

    return c.json({
      success: true,
      data: responseResult,
      message: tSuccess(c, 'security.incident.responseExecuted', {
        incidentId,
        actor: user.fullName || user.email,
        actionCount: actions.length,
        actionType: responseData.type || 'manual',
        executedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    // Check if it's a "not found" error (broaden pattern just in case)
    if (error.message && /incident not found/i.test(error.message)) {
      return c.json({
        success: false,
        error: tError(c, 'security.incident.notFound', {
          incidentId: c.req.param('id'),
          operation: t(c, 'endpoints.security_incident.incidentResponse'),
          requestedBy: c.get('user')?.email || c.get('user')?.fullName || 'Unknown'
        })
      }, 404);
    }

    return await handleStandardError(c, error, 'Failed to execute manual response for security incident', securityIncidentRoutes_log, 'security.incidents.responseExecuteFailed', {
      incidentId: c.req.param('id'),
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      operation: t(c, 'endpoints.security_incident.incidentResponse')
    });
  }
});

/**
 * GET /api/security-incident/statistics
 * Get incident statistics
*/
securityIncident.get('/statistics', async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);

    const stats = securityService.getIncidentStatistics();

    securityIncidentRoutes_log('Retrieved incident statistics');

    return c.json({
      success: true,
      data: stats,
      message: tSuccess(c, 'security.statistics.retrieved', {
        actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
        totalIncidents: stats.totalIncidents || 0,
        activeIncidents: stats.activeIncidents || 0,
        resolvedIncidents: stats.resolvedIncidents || 0,
        retrievedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve incident statistics', securityIncidentRoutes_log, 'security.statistics.retrieveFailed', {
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      operation: t(c, 'endpoints.security_incident.statistics')
    });
  }
});

/**
 * GET /api/security-incident/status
 * Get service status and configuration
*/
securityIncident.get('/status', async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);

    const status = securityService.getServiceStatus();

    securityIncidentRoutes_log('Retrieved service status');

    return c.json({
      success: true,
      data: status,
      message: tSuccess(c, 'security.service.statusRetrieved', {
        actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
        serviceHealth: status.health || 'unknown',
        version: status.version || 'unknown',
        uptime: status.uptime || 'unknown',
        checkedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve security service status', securityIncidentRoutes_log, 'security.service.statusRetrieveFailed', {
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      operation: t(c, 'endpoints.security_incident.serviceStatus')
    });
  }
});

/**
 * POST /api/security-incident/simulate
 * Simulate a security threat for testing (development only)
*/
securityIncident.post('/simulate', async (c) => {
  try {
    const securityService = createSecurityIncidentResponseService(c.env);

    // Check if in development environment
    const environment = c.env.ENVIRONMENT || 'development';
    if (environment === 'production') {
      return c.json({
        success: false,
        error: tError(c, 'security.incidents.simulationNotAllowed', {
          environment,
          requestedBy: c.get('user')?.email || 'Unknown',
          reason: 'Production environment detected'
        })
      }, 403);
    }

    // Simulate a brute force attack
    const threatData = {
      type: 'brute_force_login',
      severity: 'high',
      title: 'Simulated Brute Force Attack',
      description: 'Simulated brute force login attempt for testing',
      metadata: {
        sourceIp: '192.168.1.100',
        attemptCount: 15,
        targetUser: 'test@example.com',
        timeWindow: '5 minutes',
        simulation: true
      },
      tags: ['simulation', 'test']
    };

    const result = await securityService.processThreat(threatData);

    securityIncidentRoutes_log('Threat simulation completed');

    return c.json({
      success: true,
      data: result,
      message: tSuccess(c, 'security.simulation.completed', {
        actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
        threatType: threatData.type,
        severity: threatData.severity,
        simulationId: result.incidentId || 'unknown',
        completedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to simulate security threat', securityIncidentRoutes_log, 'security.incidents.simulationFailed', {
      actor: c.get('user')?.fullName || c.get('user')?.email || 'System',
      reason: error.message,
      operation: t(c, 'endpoints.security_incident.simulate'),
      environment: c.env.ENVIRONMENT || 'development'
    });
  }
});

export default securityIncident;
