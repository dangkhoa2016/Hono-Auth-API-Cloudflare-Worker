/**
 * Security Incident Response Service
 * Provides automated security incident handling and response workflows
*/

import { securityIncident_log } from '../utils/debug.js';
import { createDatabaseService } from '../utils/serviceFactory.js';
import { BaseService } from './baseService.js';

/**
 * Incident Severity Levels
*/
const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Incident Status Types
*/
const INCIDENT_STATUS = {
  DETECTED: 'detected',
  INVESTIGATING: 'investigating',
  CONTAINED: 'contained',
  RESOLVED: 'resolved',
  FALSE_POSITIVE: 'false_positive'
};

/**
 * Response Action Types
*/
const RESPONSE_ACTIONS = {
  LOG_ALERT: 'log_alert',
  BLOCK_IP: 'block_ip',
  DISABLE_USER: 'disable_user',
  ESCALATE: 'escalate',
  NOTIFY_ADMIN: 'notify_admin',
  QUARANTINE: 'quarantine'
};

/**
 * Incident Response Engine
 * Manages automated incident response workflows
*/
class IncidentResponseEngine {
  constructor() {
    this.responseRules = new Map();
    this.responseActions = new Map();
    this.initializeDefaultRules();
    this.initializeResponseActions();

    securityIncident_log('IncidentResponseEngine initialized');
  }

  /**
   * Initialize default incident response rules
   */
  initializeDefaultRules() {
    // Critical brute force response
    this.addResponseRule('brute_force_critical', {
      name: 'Critical Brute Force Response',
      description: 'Immediate response to critical brute force attacks',
      triggerCondition: (incident) => {
        return incident.type === 'brute_force_login' &&
               incident.severity === INCIDENT_SEVERITY.CRITICAL &&
               incident.metadata?.attemptCount > 10;
      },
      actions: [
        { action: RESPONSE_ACTIONS.LOG_ALERT, priority: 1 },
        { action: RESPONSE_ACTIONS.BLOCK_IP, priority: 2, params: { duration: 3600 } },
        { action: RESPONSE_ACTIONS.NOTIFY_ADMIN, priority: 3 },
        { action: RESPONSE_ACTIONS.ESCALATE, priority: 4 }
      ],
      enabled: true,
      autoExecute: true
    });

    // Privilege escalation response
    this.addResponseRule('privilege_escalation', {
      name: 'Privilege Escalation Response',
      description: 'Response to privilege escalation attempts',
      triggerCondition: (incident) => {
        return incident.type === 'privilege_escalation' &&
               incident.severity !== INCIDENT_SEVERITY.LOW;
      },
      actions: [
        { action: RESPONSE_ACTIONS.LOG_ALERT, priority: 1 },
        { action: RESPONSE_ACTIONS.DISABLE_USER, priority: 2, params: { reason: 'privilege_escalation_attempt' } },
        { action: RESPONSE_ACTIONS.NOTIFY_ADMIN, priority: 3 },
        { action: RESPONSE_ACTIONS.ESCALATE, priority: 4 }
      ],
      enabled: true,
      autoExecute: false // Requires manual approval
    });

    // Suspicious data access response
    this.addResponseRule('data_access_anomaly', {
      name: 'Suspicious Data Access Response',
      description: 'Response to anomalous data access patterns',
      triggerCondition: (incident) => {
        return incident.type === 'suspicious_data_access' &&
               incident.severity === INCIDENT_SEVERITY.HIGH;
      },
      actions: [
        { action: RESPONSE_ACTIONS.LOG_ALERT, priority: 1 },
        { action: RESPONSE_ACTIONS.QUARANTINE, priority: 2, params: { scope: 'user_session' } },
        { action: RESPONSE_ACTIONS.NOTIFY_ADMIN, priority: 3 }
      ],
      enabled: true,
      autoExecute: true
    });

    // After-hours access response
    this.addResponseRule('after_hours_access', {
      name: 'After Hours Access Response',
      description: 'Response to after-hours administrative access',
      triggerCondition: (incident) => {
        return incident.type === 'anomalous_time_access' &&
               incident.metadata?.isAdminAccess === true;
      },
      actions: [
        { action: RESPONSE_ACTIONS.LOG_ALERT, priority: 1 },
        { action: RESPONSE_ACTIONS.NOTIFY_ADMIN, priority: 2 }
      ],
      enabled: true,
      autoExecute: true
    });
  }

  /**
   * Initialize response action handlers
   */
  initializeResponseActions() {
    // Log alert action
    this.addResponseAction(RESPONSE_ACTIONS.LOG_ALERT, (incident, params) => {
      securityIncident_log(`addResponseAction incident: ${JSON.stringify(incident)}, params: ${JSON.stringify(params)}`);
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'SECURITY_ALERT',
        incident_id: incident.id,
        type: incident.type,
        severity: incident.severity,
        message: `Security incident detected: ${incident.description}`,
        details: incident.metadata
      };

      securityIncident_log(`🚨 SECURITY ALERT: ${JSON.stringify(logEntry, null, 2)}`);
      securityIncident_log(`Alert logged for incident ${incident.id}`);

      return {
        success: true,
        action: RESPONSE_ACTIONS.LOG_ALERT,
        result: 'Alert logged successfully',
        timestamp: logEntry.timestamp
      };
    });

    // Block IP action (simulated)
    this.addResponseAction(RESPONSE_ACTIONS.BLOCK_IP, (incident, params) => {
      const sourceIp = incident.metadata?.sourceIp || incident.metadata?.ip_address;
      const duration = params?.duration || 3600; // Default 1 hour

      if (!sourceIp) {
        throw new Error('No source IP found for blocking');
      }

      // In production, this would integrate with firewall/WAF
      securityIncident_log(`IP blocked: ${sourceIp} for ${duration} seconds`);

      return {
        success: true,
        action: RESPONSE_ACTIONS.BLOCK_IP,
        result: `IP ${sourceIp} blocked for ${duration} seconds`,
        blockedIp: sourceIp,
        duration,
        blockedAt: new Date().toISOString()
      };
    });

    // Disable user action (simulated)
    this.addResponseAction(RESPONSE_ACTIONS.DISABLE_USER, (incident, params) => {
      const userId = incident.metadata?.actorId || incident.metadata?.userId;
      const reason = params?.reason || 'security_incident';

      if (!userId) {
        throw new Error('No user ID found for disabling');
      }

      // In production, this would update user status in database
      securityIncident_log(`User disabled: ${userId}, reason: ${reason}`);

      return {
        success: true,
        action: RESPONSE_ACTIONS.DISABLE_USER,
        result: `User ${userId} disabled due to ${reason}`,
        disabledUser: userId,
        reason,
        disabledAt: new Date().toISOString()
      };
    });

    // Escalate action
    this.addResponseAction(RESPONSE_ACTIONS.ESCALATE, (incident, params) => {
      const escalationLevel = params?.level || 'L2';

      // In production, this would integrate with incident management system
      securityIncident_log(`Incident escalated: ${incident.id} to ${escalationLevel}`);

      return {
        success: true,
        action: RESPONSE_ACTIONS.ESCALATE,
        result: `Incident escalated to ${escalationLevel}`,
        escalationLevel,
        escalatedAt: new Date().toISOString()
      };
    });

    // Notify admin action
    this.addResponseAction(RESPONSE_ACTIONS.NOTIFY_ADMIN, (incident, params) => {
      const notificationMethod = params?.method || 'internal';

      // In production, this would send notifications via email, Slack, etc.
      securityIncident_log(`Admin notification sent for incident ${incident.id}`);

      return {
        success: true,
        action: RESPONSE_ACTIONS.NOTIFY_ADMIN,
        result: `Admin notification sent via ${notificationMethod}`,
        method: notificationMethod,
        notifiedAt: new Date().toISOString()
      };
    });

    // Quarantine action
    this.addResponseAction(RESPONSE_ACTIONS.QUARANTINE, (incident, params) => {
      const scope = params?.scope || 'user_session';

      // In production, this would isolate user sessions, limit access, etc.
      securityIncident_log(`Quarantine applied: ${scope} for incident ${incident.id}`);

      return {
        success: true,
        action: RESPONSE_ACTIONS.QUARANTINE,
        result: `Quarantine applied to ${scope}`,
        scope,
        quarantinedAt: new Date().toISOString()
      };
    });
  }

  /**
   * Add a response rule
   */
  addResponseRule(ruleId, rule) {
    this.responseRules.set(ruleId, {
      ...rule,
      id: ruleId,
      createdAt: new Date(),
      executionCount: 0,
      lastExecuted: null
    });

    securityIncident_log(`Response rule added: ${ruleId}`);
  }

  /**
   * Add a response action handler
   */
  addResponseAction(actionType, handler) {
    this.responseActions.set(actionType, {
      type: actionType,
      handler,
      executionCount: 0,
      lastExecuted: null
    });

    securityIncident_log(`Response action registered: ${actionType}`);
  }

  /**
   * Execute response for an incident
   */
  async executeResponse(incident) {
    const applicableRules = [];

    // Find applicable response rules
    for (const [ruleId, rule] of this.responseRules) {
      if (!rule.enabled) {continue;}

      try {
        if (rule.triggerCondition(incident)) {
          applicableRules.push(rule);
        }
      } catch (error) {
        securityIncident_log(`Error in response rule ${ruleId}: ${error.message}`);
      }
    }

    if (applicableRules.length === 0) {
      securityIncident_log(`No applicable response rules for incident ${incident.id}`);
      return {
        incidentId: incident.id,
        rulesApplied: 0,
        actionsExecuted: 0,
        results: []
      };
    }

    const responseResults = [];
    let totalActionsExecuted = 0;

    // Execute actions for each applicable rule
    for (const rule of applicableRules) {
      securityIncident_log(`Executing response rule: ${rule.name} for incident ${incident.id}`);

      // Check if rule requires manual approval
      if (!rule.autoExecute) {
        responseResults.push({
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'pending_approval',
          message: 'Response rule requires manual approval',
          actions: rule.actions
        });
        continue;
      }

      // Sort actions by priority
      const sortedActions = [...rule.actions].sort((a, b) => a.priority - b.priority);
      const actionResults = [];

      for (const actionConfig of sortedActions) {
        const actionHandler = this.responseActions.get(actionConfig.action);

        if (!actionHandler) {
          securityIncident_log(`Unknown response action: ${actionConfig.action}`);
          continue;
        }

        try {
          const result = await actionHandler.handler(incident, actionConfig.params);
          actionResults.push({
            action: actionConfig.action,
            priority: actionConfig.priority,
            ...result
          });

          actionHandler.executionCount++;
          actionHandler.lastExecuted = new Date();
          totalActionsExecuted++;

          securityIncident_log(`Response action executed: ${actionConfig.action} for incident ${incident.id}`);
        } catch (error) {
          actionResults.push({
            action: actionConfig.action,
            priority: actionConfig.priority,
            success: false,
            error: error.message
          });

          securityIncident_log(`Response action failed: ${actionConfig.action}, error: ${error.message}`);
        }
      }

      responseResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'executed',
        actionsExecuted: actionResults.length,
        actions: actionResults
      });

      rule.executionCount++;
      rule.lastExecuted = new Date();
    }

    return {
      incidentId: incident.id,
      rulesApplied: applicableRules.length,
      actionsExecuted: totalActionsExecuted,
      results: responseResults,
      executedAt: new Date().toISOString()
    };
  }

  /**
   * Get response rule statistics
   */
  getResponseStats() {
    const rules = Array.from(this.responseRules.values()).map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      enabled: rule.enabled,
      autoExecute: rule.autoExecute,
      executionCount: rule.executionCount,
      lastExecuted: rule.lastExecuted,
      actionCount: rule.actions.length
    }));

    const actions = Array.from(this.responseActions.values()).map(action => ({
      type: action.type,
      executionCount: action.executionCount,
      lastExecuted: action.lastExecuted
    }));

    return {
      totalRules: this.responseRules.size,
      enabledRules: rules.filter(r => r.enabled).length,
      totalActions: this.responseActions.size,
      rules,
      actions
    };
  }
}

/**
 * Incident Manager
 * Manages security incident lifecycle and storage
*/
class IncidentManager {
  constructor(databaseService) {
    this.db = databaseService;
    this.incidents = new Map();
    this.incidentCounter = 0;

    securityIncident_log('IncidentManager initialized');
  }

  /**
   * Create a new security incident
   */
  createIncident(incidentData) {
    const incidentId = `SEC_${Date.now()}_${++this.incidentCounter}`;

    const incident = {
      id: incidentId,
      type: incidentData.type,
      severity: incidentData.severity || INCIDENT_SEVERITY.MEDIUM,
      status: INCIDENT_STATUS.DETECTED,
      title: incidentData.title,
      description: incidentData.description,
      metadata: incidentData.metadata || {},
      detectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: null,
      timeline: [{
        timestamp: new Date().toISOString(),
        event: 'incident_created',
        description: 'Security incident detected and created',
        actor: 'system'
      }],
      responseResults: [],
      tags: incidentData.tags || []
    };

    this.incidents.set(incidentId, incident);
    securityIncident_log(`Security incident created: ${incidentId} (${incident.type})`);

    return incident;
  }

  /**
   * Update incident status
   */
  updateIncidentStatus(incidentId, newStatus, updateInfo = {}) {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const oldStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date().toISOString();

    if (updateInfo.assignedTo) {
      incident.assignee = updateInfo.assignedTo;
    }

    if (updateInfo.resolution) {
      incident.resolution = updateInfo.resolution;
    }

    // Add timeline entry
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      event: 'status_change',
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      actor: updateInfo.actor || 'system',
      resolution: updateInfo.resolution
    });

    securityIncident_log(`Incident ${incidentId} status updated: ${oldStatus} -> ${newStatus}`);
    return incident;
  }

  /**
   * Add response results to incident
   */
  addResponseResults(incidentId, responseResults) {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    incident.responseResults.push(responseResults);
    incident.updatedAt = new Date().toISOString();

    // Add timeline entry
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      event: 'response_executed',
      description: `Automated response executed: ${responseResults.actionsExecuted} actions`,
      actor: 'automated_response_system',
      details: responseResults
    });

    securityIncident_log(`Response results added to incident ${incidentId}`);
    return incident;
  }

  /**
   * Get incident by ID
   */
  getIncident(incidentId) {
    return this.incidents.get(incidentId);
  }

  /**
   * Get all incidents with optional filters
   */
  getIncidents(filters = {}) {
    let incidents = Array.from(this.incidents.values());

    // Filter by status
    if (filters.status) {
      incidents = incidents.filter(i => i.status === filters.status);
    }

    // Filter by severity
    if (filters.severity) {
      incidents = incidents.filter(i => i.severity === filters.severity);
    }

    // Filter by type
    if (filters.type) {
      incidents = incidents.filter(i => i.type === filters.type);
    }

    // Filter by time range
    if (filters.startTime) {
      const startTime = new Date(filters.startTime);
      incidents = incidents.filter(i => new Date(i.detectedAt) >= startTime);
    }

    if (filters.endTime) {
      const endTime = new Date(filters.endTime);
      incidents = incidents.filter(i => new Date(i.detectedAt) <= endTime);
    }

    // Sort by detection time (newest first)
    incidents.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      incidents: incidents.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: incidents.length,
        pages: Math.ceil(incidents.length / limit)
      }
    };
  }

  /**
   * Get incident statistics
   */
  getIncidentStats() {
    const incidents = Array.from(this.incidents.values());
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: incidents.length,
      byStatus: {},
      bySeverity: {},
      byType: {},
      recent: {
        last24h: incidents.filter(i => new Date(i.detectedAt) >= last24h).length,
        last7d: incidents.filter(i => new Date(i.detectedAt) >= last7d).length
      },
      avgResolutionTime: 0,
      openIncidents: incidents.filter(i => ![INCIDENT_STATUS.RESOLVED, INCIDENT_STATUS.FALSE_POSITIVE].includes(i.status)).length
    };

    // Count by status
    for (const status of Object.values(INCIDENT_STATUS)) {
      stats.byStatus[status] = incidents.filter(i => i.status === status).length;
    }

    // Count by severity
    for (const severity of Object.values(INCIDENT_SEVERITY)) {
      stats.bySeverity[severity] = incidents.filter(i => i.severity === severity).length;
    }

    // Count by type
    const types = [...new Set(incidents.map(i => i.type))];
    for (const type of types) {
      stats.byType[type] = incidents.filter(i => i.type === type).length;
    }

    return stats;
  }
}

/**
 * Main Security Incident Response Service
*/
export class SecurityIncidentResponseService extends BaseService {
  constructor(env) {
    super(env);
    this.databaseService = createDatabaseService(env);
    this.responseEngine = new IncidentResponseEngine();
    this.incidentManager = new IncidentManager(this.databaseService);

    securityIncident_log('SecurityIncidentResponseService initialized');
  }

  /**
   * Process a security threat and create incident if needed
   */
  async processThreat(threatData) {
    try {
      // Create security incident from threat
      const incident = this.incidentManager.createIncident({
        type: threatData.threatType || threatData.type,
        severity: this.mapThreatSeverityToIncident(threatData.severity),
        title: `Security Threat: ${threatData.threatType || threatData.type}`,
        description: threatData.description || `Threat detected: ${threatData.threatType}`,
        metadata: {
          ...threatData,
          sourceSystem: 'threat_detection_engine'
        },
        tags: ['automated', 'threat_detection']
      });

      // Execute automated response
      const responseResults = await this.responseEngine.executeResponse(incident);

      // Add response results to incident
      this.incidentManager.addResponseResults(incident.id, responseResults);

      // Update incident status based on response
      if (responseResults.actionsExecuted > 0) {
        this.incidentManager.updateIncidentStatus(incident.id, INCIDENT_STATUS.CONTAINED, {
          actor: 'automated_response',
          notes: `Automated response executed: ${responseResults.actionsExecuted} actions`
        });
      }

      securityIncident_log(`Threat processed and incident created: ${incident.id}`);

      return {
        incident,
        responseResults,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      securityIncident_log(`Error processing threat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map threat severity to incident severity
   */
  mapThreatSeverityToIncident(threatSeverity) {
    const severityMap = {
      'low': INCIDENT_SEVERITY.LOW,
      'medium': INCIDENT_SEVERITY.MEDIUM,
      'high': INCIDENT_SEVERITY.HIGH,
      'critical': INCIDENT_SEVERITY.CRITICAL
    };

    return severityMap[threatSeverity] || INCIDENT_SEVERITY.MEDIUM;
  }

  /**
   * Create manual security incident
   */
  createManualIncident(incidentData) {
    const incident = this.incidentManager.createIncident({
      ...incidentData,
      tags: [...(incidentData.tags || []), 'manual']
    });

    securityIncident_log(`Manual incident created: ${incident.id}`);
    return incident;
  }

  /**
   * Update incident status
   */
  updateIncidentStatus(incidentId, newStatus, updateInfo = {}) {
    return this.incidentManager.updateIncidentStatus(incidentId, newStatus, updateInfo);
  }

  /**
   * Get incident details
   */
  getIncident(incidentId) {
    return this.incidentManager.getIncident(incidentId);
  }

  /**
   * Get incidents with filters
   */
  getIncidents(filters = {}) {
    return this.incidentManager.getIncidents(filters);
  }

  /**
   * Get incident statistics
   */
  getIncidentStatistics() {
    return this.incidentManager.getIncidentStats();
  }

  /**
   * Get response engine for configuration
   */
  getResponseEngine() {
    return this.responseEngine;
  }

  /**
   * Execute manual response action
   */
  async executeManualResponse(incidentId, actions) {
    const incident = this.incidentManager.getIncident(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const responseResults = [];

    for (const actionConfig of actions) {
      const actionHandler = this.responseEngine.responseActions.get(actionConfig.action);

      if (!actionHandler) {
        responseResults.push({
          action: actionConfig.action,
          success: false,
          error: 'Unknown action type'
        });
        continue;
      }

      try {
        const result = await actionHandler.handler(incident, actionConfig.params);
        responseResults.push({
          action: actionConfig.action,
          ...result
        });

        actionHandler.executionCount++;
        actionHandler.lastExecuted = new Date();
      } catch (error) {
        securityIncident_log(`Manual response action failed: ${actionConfig.action}, error: ${error.message}`);
        responseResults.push({
          action: actionConfig.action,
          success: false,
          error: error.message
        });
      }
    }

    // Add response results to incident
    const manualResponseResults = {
      incidentId,
      rulesApplied: 0,
      actionsExecuted: responseResults.filter(r => r.success).length,
      results: [{
        ruleId: 'manual',
        ruleName: 'Manual Response',
        status: 'executed',
        actionsExecuted: responseResults.length,
        actions: responseResults
      }],
      executedAt: new Date().toISOString(),
      manual: true
    };

    this.incidentManager.addResponseResults(incidentId, manualResponseResults);

    securityIncident_log(`Manual response executed for incident ${incidentId}`);
    return manualResponseResults;
  }

  /**
   * Get comprehensive service status
   */
  getServiceStatus() {
    return {
      incidents: this.incidentManager.getIncidentStats(),
      responseEngine: this.responseEngine.getResponseStats(),
      constants: {
        severityLevels: INCIDENT_SEVERITY,
        statusTypes: INCIDENT_STATUS,
        responseActions: RESPONSE_ACTIONS
      },
      serviceInfo: {
        name: 'SecurityIncidentResponseService',
        version: '4.0.0',
        initialized: true
      }
    };
  }
}

export { INCIDENT_SEVERITY, INCIDENT_STATUS, RESPONSE_ACTIONS };
export default SecurityIncidentResponseService;
