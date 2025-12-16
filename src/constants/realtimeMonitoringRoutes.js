/**
 * Real-time Monitoring Routes Definitions
 * Register all real-time monitoring and alerting routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * Real-time monitoring routes with metadata
 * Updated to reflect implemented endpoints under monitoring/*, alerts/*, and dashboard/*.
*/
const REALTIME_MONITORING_ROUTES = [
  // Events
  {
    method: 'GET',
    path: '/api/realtime-monitoring/events/recent',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.eventsRecent',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get recent real-time monitoring / threat events'
    }
  },
  // Monitoring
  {
    method: 'GET',
    path: '/api/realtime-monitoring/monitoring/status',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.status',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get monitoring system status'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/monitoring/start',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.start',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Start real-time monitoring services'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/monitoring/stop',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.stop',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Stop real-time monitoring services'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/monitoring/threats',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.threats',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get current threat status and detected threats'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/monitoring/threats/:threatId/resolve',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.resolveThreat',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Resolve a detected threat'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/monitoring/analyze',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.analyze',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Run manual threat analysis'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/monitoring/simulate',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.simulate',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Simulate an event for testing'
    }
  },

  // Alerts
  {
    method: 'GET',
    path: '/api/realtime-monitoring/alerts/status',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsStatus',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get alert system status and configuration'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/alerts/history',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsHistory',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get historical alert data and trends'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/alerts/send',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsSend',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Send manual alert or notification'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/alerts/rules',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsRules',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get all alert rules'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/alerts/rules',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsRulesCreate',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Create a new alert rule'
    }
  },
  {
    method: 'PUT',
    path: '/api/realtime-monitoring/alerts/rules/:ruleId/toggle',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsRuleToggle',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Enable/disable an alert rule'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/alerts/channels',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsChannels',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get alert channels'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/alerts/channels',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsChannelsCreate',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Create alert channel'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/alerts/test',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsTest',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Test the alert system'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/alerts/configure',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.alertsConfigure',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Configure alert thresholds/settings'
    }
  },

  // Dashboard
  {
    method: 'GET',
    path: '/api/realtime-monitoring/dashboard/overview',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardOverview',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Dashboard overview with key metrics'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/dashboard/realtime',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardRealtime',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Real-time dashboard updates and live data'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/dashboard/live',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardLive',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Live dashboard snapshot (alias)'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/dashboard/timeline',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardTimeline',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Activity timeline data'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/dashboard/security',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardSecurity',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Security dashboard data'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/dashboard/performance',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardPerformance',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Performance dashboard data'
    }
  },
  {
    method: 'POST',
    path: '/api/realtime-monitoring/dashboard/export',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardExport',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Export dashboard data'
    }
  },
  {
    method: 'DELETE',
    path: '/api/realtime-monitoring/dashboard/cache',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardCache',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Clear dashboard cache'
    }
  },
  {
    method: 'GET',
    path: '/api/realtime-monitoring/dashboard/health',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.dashboardHealth',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Dashboard health check'
    }
  }
  ,
  // Incidents (realtime monitoring specific lightweight incidents)
  {
    method: 'POST',
    path: '/api/realtime-monitoring/incidents/create',
    metadata: {
      category: 'realtime_monitoring',
      i18nKey: 'endpoints.realtime_monitoring.incidentsCreate',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Create a realtime monitoring incident'
    }
  }
];

/**
 * Register all real-time monitoring routes
*/
export function registerRealtimeMonitoringRoutes() {
  registerRoutes('realtime_monitoring', REALTIME_MONITORING_ROUTES);
}

// Auto-register when imported
registerRealtimeMonitoringRoutes();
