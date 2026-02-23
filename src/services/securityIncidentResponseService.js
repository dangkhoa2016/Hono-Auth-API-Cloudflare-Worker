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
  // --- Response Actions DB CRUD ---
  async addResponseActionRecord(action) {
    // Insert into DB
    await this.db.insert(
      `INSERT INTO incident_response_actions (incident_id, rule_id, rule_name, action_type, action_status, priority, params, result, executed_at, completed_at, error_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        action.incident_id,
        action.rule_id || null,
        action.rule_name || null,
        action.action_type,
        action.action_status || 'completed',
        action.priority || 0,
        action.params ? JSON.stringify(action.params) : null,
        action.result ? JSON.stringify(action.result) : null,
        action.executed_at || new Date().toISOString(),
        action.completed_at || null,
        action.error_message || null,
        action.executed_at || new Date().toISOString()
      ]
    );
    // Optionally: update cache if needed
  }

  async getResponseActions(incidentId) {
    const rows = await this.db.select(
      `SELECT * FROM incident_response_actions WHERE incident_id = ? ORDER BY executed_at ASC`,
      [incidentId]
    );
    return rows.map(row => ({
      id: row.id,
      incident_id: row.incident_id,
      rule_id: row.rule_id,
      rule_name: row.rule_name,
      action_type: row.action_type,
      action_status: row.action_status,
      priority: row.priority,
      params: row.params ? JSON.parse(row.params) : null,
      result: row.result ? JSON.parse(row.result) : null,
      executed_at: row.executed_at,
      completed_at: row.completed_at,
      error_message: row.error_message,
      created_at: row.created_at
    }));
  }

  constructor(databaseService) {
    this.db = databaseService;
    this.incidents = new Map(); // RAM cache: id -> incident
    this.incidentCounter = 0;
    securityIncident_log('IncidentManager initialized');
  }

  /**
   * Create a new security incident
   */
  async createIncident(incidentData) {
    const incidentId = `SEC_${Date.now()}_${++this.incidentCounter}`;
    const now = new Date().toISOString();
    const incident = {
      id: incidentId,
      type: incidentData.type,
      severity: incidentData.severity || INCIDENT_SEVERITY.MEDIUM,
      status: INCIDENT_STATUS.DETECTED,
      title: incidentData.title,
      description: incidentData.description,
      metadata: incidentData.metadata || {},
      detectedAt: now,
      updatedAt: now,
      assignee: null,
    };
    // Insert into DB
    await this.db.insert(
      `INSERT INTO security_incidents (id, type, severity, status, title, description, metadata, detected_at, updated_at, tags, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [incident.id, incident.type, incident.severity, incident.status, incident.title, incident.description, JSON.stringify(incident.metadata), incident.detectedAt, incident.updatedAt, JSON.stringify(incident.tags), incidentData.metadata?.createdBy || 'system']
    );
    // Add timeline entry in DB
    await this.db.insert(
      `INSERT INTO incident_timeline (incident_id, timestamp, event_type, description, actor, details) VALUES (?, ?, ?, ?, ?, ?)`,
      [incident.id, now, 'incident_created', 'Security incident detected and created', 'system', null]
    );
    // Cache in RAM
    this.incidents.set(incidentId, { ...incident, timeline: [{ timestamp: now, event: 'incident_created', description: 'Security incident detected and created', actor: 'system' }], responseResults: [] });
    securityIncident_log(`Security incident created: ${incidentId} (${incident.type})`);
    return this.incidents.get(incidentId);
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(incidentId, newStatus, updateInfo = {}) {
    let incident = this.incidents.get(incidentId);
    if (!incident) {
      // Try to load from DB
      incident = await this.getIncident(incidentId);
      if (!incident) throw new Error(`Incident not found: ${incidentId}`);
    }
    const oldStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date().toISOString();
    if (updateInfo.assignedTo) incident.assignee = updateInfo.assignedTo;
    if (updateInfo.resolution) incident.resolution = updateInfo.resolution;
    // Update DB
    await this.db.update(
      `UPDATE security_incidents SET status=?, updated_at=?, assignee=?, notes=? WHERE id=?`,
      [incident.status, incident.updatedAt, incident.assignee, updateInfo.resolution || null, incidentId]
    );
    // Add timeline entry in DB
    await this.db.insert(
      `INSERT INTO incident_timeline (incident_id, timestamp, event_type, description, actor, details) VALUES (?, ?, ?, ?, ?, ?)`,
      [incidentId, incident.updatedAt, 'status_change', `Status changed from ${oldStatus} to ${newStatus}`, updateInfo.actor || 'system', updateInfo.resolution ? JSON.stringify({ resolution: updateInfo.resolution }) : null]
    );
    // Update cache
    if (!incident.timeline) incident.timeline = [];
    incident.timeline.push({ timestamp: incident.updatedAt, event: 'status_change', description: `Status changed from ${oldStatus} to ${newStatus}`, actor: updateInfo.actor || 'system', resolution: updateInfo.resolution });
    this.incidents.set(incidentId, incident);
    securityIncident_log(`Incident ${incidentId} status updated: ${oldStatus} -> ${newStatus}`);
    return incident;
  }

  /**
   * Add response results to incident
   */
  async addResponseResults(incidentId, responseResults) {
    let incident = this.incidents.get(incidentId);
    if (!incident) {
      incident = await this.getIncident(incidentId);
      if (!incident) throw new Error(`Incident not found: ${incidentId}`);
    }
    if (!incident.responseResults) incident.responseResults = [];
    incident.responseResults.push(responseResults);
    incident.updatedAt = new Date().toISOString();
    // Insert response actions into DB (flattened)
    if (responseResults.results && Array.isArray(responseResults.results)) {
      for (const ruleResult of responseResults.results) {
        if (ruleResult.actions && Array.isArray(ruleResult.actions)) {
          for (const action of ruleResult.actions) {
            await this.db.insert(
              `INSERT INTO incident_response_actions (incident_id, rule_id, rule_name, action_type, action_status, priority, params, result, executed_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [incidentId, ruleResult.ruleId, ruleResult.ruleName, action.action, action.success ? 'completed' : 'failed', action.priority || 0, action.params ? JSON.stringify(action.params) : null, JSON.stringify(action), action.timestamp || incident.updatedAt, action.timestamp || incident.updatedAt]
            );
          }
        }
      }
    }
    // Add timeline entry in DB
    await this.db.insert(
      `INSERT INTO incident_timeline (incident_id, timestamp, event_type, description, actor, details) VALUES (?, ?, ?, ?, ?, ?)`,
      [incidentId, incident.updatedAt, 'response_executed', `Automated response executed: ${responseResults.actionsExecuted} actions`, 'automated_response_system', JSON.stringify(responseResults)]
    );
    // Update cache
    if (!incident.timeline) incident.timeline = [];
    incident.timeline.push({ timestamp: incident.updatedAt, event: 'response_executed', description: `Automated response executed: ${responseResults.actionsExecuted} actions`, actor: 'automated_response_system', details: responseResults });
    this.incidents.set(incidentId, incident);
    securityIncident_log(`Response results added to incident ${incidentId}`);
    return incident;
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId) {
    // Try RAM cache first
    if (this.incidents.has(incidentId)) return this.incidents.get(incidentId);
    // Load from DB
    const row = await this.db.select('SELECT * FROM security_incidents WHERE id = ?', [incidentId], true);
    if (!row) return null;
    // Load timeline
    const timeline = await this.db.select('SELECT * FROM incident_timeline WHERE incident_id = ? ORDER BY timestamp ASC', [incidentId]);
    // Load response actions
    const responseActions = await this.db.select('SELECT * FROM incident_response_actions WHERE incident_id = ?', [incidentId]);
    // Parse JSON fields
    row.metadata = row.metadata ? JSON.parse(row.metadata) : {};
    row.tags = row.tags ? JSON.parse(row.tags) : [];
    row.timeline = timeline || [];
    row.responseResults = responseActions || [];
    this.incidents.set(incidentId, row);
    return row;
  }

  /**
   * Get all incidents with optional filters
   */
  async getIncidents(filters = {}) {
    // Build WHERE clause
    const allowedFields = ['status', 'severity', 'type'];
    const search = typeof filters.search === 'string' ? filters.search.trim() : '';
    const { whereClause: baseWhereClause, params: baseParams } = this.db.buildWhereClause(filters, allowedFields);

    const whereParts = [];
    const params = [];

    if (baseWhereClause) {
      whereParts.push(baseWhereClause.replace(/^WHERE\s+/i, ''));
      params.push(...baseParams);
    }

    if (search) {
      const likeValue = `%${search}%`;
      whereParts.push('(id LIKE ? OR title LIKE ? OR type LIKE ? OR description LIKE ? OR created_by LIKE ?)');
      params.push(likeValue, likeValue, likeValue, likeValue, likeValue);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    const sql = `SELECT * FROM security_incidents ${whereClause} ORDER BY detected_at DESC LIMIT ? OFFSET ?`;
    const allParams = [...params, limit, offset];
    const rows = await this.db.select(sql, allParams);
    // Parse JSON fields and cache
    const incidents = [];
    for (const row of rows) {
      row.metadata = row.metadata ? JSON.parse(row.metadata) : {};
      row.tags = row.tags ? JSON.parse(row.tags) : [];
      // Optionally load timeline/response if needed (skip for perf)
      this.incidents.set(row.id, row);
      incidents.push(row);
    }
    // Get total count
    const countRow = await this.db.select(`SELECT COUNT(*) as total FROM security_incidents ${whereClause}`, params, true);
    return {
      incidents,
      pagination: {
        page,
        limit,
        total: countRow?.total || 0,
        pages: Math.ceil((countRow?.total || 0) / limit)
      }
    };
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats() {
    // Total
    const totalRow = await this.db.select('SELECT COUNT(*) as total FROM security_incidents', [], true);
    // By status
    const byStatusRows = await this.db.select('SELECT status, COUNT(*) as count FROM security_incidents GROUP BY status');
    // By severity
    const bySeverityRows = await this.db.select('SELECT severity, COUNT(*) as count FROM security_incidents GROUP BY severity');
    // By type
    const byTypeRows = await this.db.select('SELECT type, COUNT(*) as count FROM security_incidents GROUP BY type');
    // Recent
    const last24hRow = await this.db.select('SELECT COUNT(*) as count FROM security_incidents WHERE detected_at >= datetime("now", "-24 hours")', [], true);
    const last7dRow = await this.db.select('SELECT COUNT(*) as count FROM security_incidents WHERE detected_at >= datetime("now", "-7 days")', [], true);
    // Open incidents
    const openRow = await this.db.select('SELECT COUNT(*) as count FROM security_incidents WHERE status NOT IN (?, ?)', [INCIDENT_STATUS.RESOLVED, INCIDENT_STATUS.FALSE_POSITIVE], true);
    // Compose stats
    const stats = {
      total: totalRow?.total || 0,
      byStatus: {},
      bySeverity: {},
      byType: {},
      recent: {
        last24h: last24hRow?.count || 0,
        last7d: last7dRow?.count || 0
      },
      avgResolutionTime: 0, // TODO: calculate from resolved_at - detected_at
      openIncidents: openRow?.count || 0
    };
    for (const row of byStatusRows) stats.byStatus[row.status] = row.count;
    for (const row of bySeverityRows) stats.bySeverity[row.severity] = row.count;
    for (const row of byTypeRows) stats.byType[row.type] = row.count;
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
      const incident = await this.incidentManager.createIncident({
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
      await this.incidentManager.addResponseResults(incident.id, responseResults);

      // Update incident status based on response
      if (responseResults.actionsExecuted > 0) {
        await this.incidentManager.updateIncidentStatus(incident.id, INCIDENT_STATUS.CONTAINED, {
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
  async createManualIncident(incidentData) {
    const incident = await this.incidentManager.createIncident({
      ...incidentData,
      tags: [...(incidentData.tags || []), 'manual']
    });
    securityIncident_log(`Manual incident created: ${incident.id}`);
    return incident;
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(incidentId, newStatus, updateInfo = {}) {
    return await this.incidentManager.updateIncidentStatus(incidentId, newStatus, updateInfo);
  }

  /**
   * Get incident details
   */
  async getIncident(incidentId) {
    return await this.incidentManager.getIncident(incidentId);
  }

  /**
   * Get incidents with filters
   */
  async getIncidents(filters = {}) {
    return await this.incidentManager.getIncidents(filters);
  }

  /**
   * Get incident statistics
   */
  async getIncidentStatistics() {
    return await this.incidentManager.getIncidentStats();
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
    const incident = await this.incidentManager.getIncident(incidentId);
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

    await this.incidentManager.addResponseResults(incidentId, manualResponseResults);

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
