/**
 * Security Incident Routes Definitions
 * Register all security incident management routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * Security incident routes with metadata
*/
const SECURITY_INCIDENT_ROUTES = [
  {
    method: 'GET',
    path: '/api/security-incident/incidents',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.incidents',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get list of security incidents with filtering'
    }
  },
  {
    method: 'POST',
    path: '/api/security-incident/incidents',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.incidentsCreate',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Create new security incident report'
    }
  },
  {
    method: 'GET',
    path: '/api/security-incident/incidents/:id',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.incidentDetails',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get detailed information of specific incident'
    }
  },
  {
    method: 'PUT',
    path: '/api/security-incident/incidents/:id/status',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.incidentStatus',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Update security incident status'
    }
  },
  {
    method: 'POST',
    path: '/api/security-incident/incidents/:id/response',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.incidentResponse',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Add response action to security incident'
    }
  },
  {
    method: 'GET',
    path: '/api/security-incident/statistics',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.statistics',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Security incident statistics and trends'
    }
  },
  {
    method: 'GET',
    path: '/api/security-incident/status',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.serviceStatus',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Security incident management service status'
    }
  },
  {
    method: 'POST',
    path: '/api/security-incident/simulate',
    metadata: {
      category: 'security',
      i18nKey: 'endpoints.security_incident.simulate',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Simulate security incident for testing purposes'
    }
  }
];

/**
 * Register all security incident routes
*/
export function registerSecurityIncidentRoutes() {
  registerRoutes('security_incident', SECURITY_INCIDENT_ROUTES);
}

// Auto-register when imported
registerSecurityIncidentRoutes();
