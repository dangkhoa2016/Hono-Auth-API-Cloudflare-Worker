/**
 * Alert System Service
 * Manages alerts, notifications, and escalation rules
*/

import { alertSystem_log } from '../utils/debug.js';
import { BaseService } from './baseService.js';
import { createKvConfigService } from '../utils/serviceFactory.js';
import { ROLE_COMBINATIONS } from '../constants/roles.js';

/**
 * Alert Channel Manager
 * Handles different types of alert channels (email, webhook, log, etc.)
*/
class AlertChannelManager {
  constructor() {
    this.channels = new Map();
    this.channelStats = new Map();
    this.initializeDefaultChannels();
    alertSystem_log('AlertChannelManager initialized');
  }

  /**
   * Initialize default alert channels
   */
  initializeDefaultChannels() {
    // Console/Log Channel
    this.addChannel('console', {
      name: 'Console Logger',
      type: 'console',
      enabled: true,
      config: { logLevel: 'info' },
      handler: this.handleConsoleAlert.bind(this)
    });

    // Webhook Channel (placeholder)
    this.addChannel('webhook', {
      name: 'Webhook Notifications',
      type: 'webhook',
      enabled: false,
      config: {
        url: '',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      },
      handler: this.handleWebhookAlert.bind(this)
    });

    // Email Channel (placeholder)
    this.addChannel('email', {
      name: 'Email Notifications',
      type: 'email',
      enabled: false,
      config: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        fromEmail: '',
        toEmails: []
      },
      handler: this.handleEmailAlert.bind(this)
    });

    // Cloudflare Workers KV Storage Channel
    this.addChannel('kv_storage', {
      name: 'KV Storage Alerts',
      type: 'kv_storage',
      enabled: true,
      config: { namespace: 'AUDIT_ALERTS' },
      handler: this.handleKVStorageAlert.bind(this)
    });
  }

  /**
   * Add a new alert channel
   */
  addChannel(channelId, channelConfig) {
    this.channels.set(channelId, {
      ...channelConfig,
      id: channelId,
      createdAt: new Date(),
      lastUsed: null
    });

    this.channelStats.set(channelId, {
      alertsSent: 0,
      successCount: 0,
      errorCount: 0,
      lastError: null,
      averageResponseTime: 0
    });

    alertSystem_log(`Alert channel added: ${channelId}`);
  }

  /**
   * Remove an alert channel
   */
  removeChannel(channelId) {
    const removed = this.channels.delete(channelId);
    this.channelStats.delete(channelId);
    alertSystem_log(`Alert channel removed: ${channelId}, success: ${removed}`);
    return removed;
  }

  /**
   * Enable/disable a channel
   */
  toggleChannel(channelId, enabled) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.enabled = enabled;
      alertSystem_log(`Channel ${channelId} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Update channel status based on configuration
   */
  updateChannelStatus(channelId, enabled) {
    return this.toggleChannel(channelId, enabled);
  }

  /**
   * Get active channels
   */
  getActiveChannels() {
    return Array.from(this.channels.entries())
      .filter(([_id, channel]) => channel.enabled)
      .map(([id, channel]) => ({
        id: id,
        name: channel.name,
        type: channel.type
      }));
  }

  /**
   * Update channel configuration
   */
  updateChannelConfig(channelId, newConfig) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.config = { ...channel.config, ...newConfig };
      alertSystem_log(`Channel config updated: ${channelId}`);
      return true;
    }
    return false;
  }

  /**
   * Send alert through specified channels
   */
  async sendAlert(alert, channelIds = null) {
    const targetChannels = channelIds
      ? channelIds.map(id => this.channels.get(id)).filter(Boolean)
      : Array.from(this.channels.values()).filter(c => c.enabled);

    const results = [];

    for (const channel of targetChannels) {
      const startTime = Date.now();
      const stats = this.channelStats.get(channel.id);

      try {
        await channel.handler(alert, channel.config);

        const responseTime = Date.now() - startTime;
        stats.alertsSent++;
        stats.successCount++;
        stats.averageResponseTime = (stats.averageResponseTime + responseTime) / 2;

        channel.lastUsed = new Date();

        results.push({
          channelId: channel.id,
          success: true,
          responseTime
        });

        alertSystem_log(`Alert sent successfully via ${channel.id}, response time: ${responseTime}ms`);
      } catch (error) {
        stats.alertsSent++;
        stats.errorCount++;
        stats.lastError = error.message;

        results.push({
          channelId: channel.id,
          success: false,
          error: error.message
        });

        alertSystem_log(`Alert failed via ${channel.id}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Console alert handler
   */
  handleConsoleAlert(alert, config) {
    const logLevel = config.logLevel || 'info';
    const message = `🚨 ALERT [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`;

    switch (logLevel) {
    case 'error':
      alertSystem_log(`error: ${message}`);
      break;
    case 'warn':
      alertSystem_log(`warn: ${message}`);
      break;
    default:
      alertSystem_log(`log: ${message}`);
    }
  }

  /**
   * Webhook alert handler
   */
  async handleWebhookAlert(alert, config) {
    if (!config.url) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      alert: {
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.timestamp,
        source: alert.source,
        data: alert.data
      },
      metadata: {
        system: 'hono-audit-system',
        version: '4.0.0',
        sentAt: new Date().toISOString()
      }
    };

    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: config.headers || { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.timeout || 5000)
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}`);
    }
  }

  /**
   * Email alert handler (placeholder - would integrate with email service)
   */
  handleEmailAlert(alert, config) {
    // This is a placeholder implementation
    // In production, integrate with email service like SendGrid, AWS SES, etc.

    if (!config.toEmails || config.toEmails.length === 0) {
      throw new Error('No email recipients configured');
    }

    const emailContent = {
      to: config.toEmails,
      from: config.fromEmail,
      subject: `[AUDIT ALERT] ${alert.severity.toUpperCase()}: ${alert.title}`,
      text: `
Alert Details:
- Title: ${alert.title}
- Message: ${alert.message}
- Severity: ${alert.severity}
- Time: ${alert.timestamp}
- Source: ${alert.source}

Additional Data:
${JSON.stringify(alert.data, null, 2)}

This is an automated alert from the Hono Audit System.
      `.trim()
    };

    // Simulate email sending (replace with actual email service)
    alertSystem_log(`Email alert prepared: ${emailContent.subject}`);

    // For now, just log the email content
    // In production: await emailService.send(emailContent);
  }

  /**
   * KV Storage alert handler (for Cloudflare Workers)
   */
  handleKVStorageAlert(alert, config) {
    alertSystem_log(`Storing alert to KV: ${alert.id}: ${JSON.stringify(config)}`);
    try {
      // In Cloudflare Workers, you would use the KV namespace
      // For now, we'll simulate storing the alert
      const alertKey = `alert_${alert.id}_${Date.now()}`;
      const alertData = {
        ...alert,
        storedAt: new Date().toISOString()
      };
      alertSystem_log(`Storing alert to KV: ${alertKey}: ${JSON.stringify(alertData)}`);

      // Simulate KV storage (in production, use actual KV)
      alertSystem_log(`Alert stored to KV: ${alertKey}`);

      // In production:
      // await env.AUDIT_ALERTS.put(alertKey, JSON.stringify(alertData));
    } catch (error) {
      throw new Error(`KV Storage error: ${error.message}`);
    }
  }

  /**
   * Get channel statistics
   */
  getChannelStats() {
    const channels = Array.from(this.channels.values()).map(channel => {
      const stats = this.channelStats.get(channel.id);
      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        enabled: channel.enabled,
        stats,
        lastUsed: channel.lastUsed
      };
    });

    return {
      totalChannels: this.channels.size,
      enabledChannels: channels.filter(c => c.enabled).length,
      channels
    };
  }
}

/**
 * Alert Rule Engine
 * Manages alert rules and conditions
*/
class AlertRuleEngine {
  constructor() {
    this.rules = new Map();
    this.ruleStats = new Map();
    this.initializeDefaultRules();
    alertSystem_log('AlertRuleEngine initialized');
  }

  /**
   * Initialize default alert rules
   */
  initializeDefaultRules() {
    // Critical threat detection
    this.addRule('critical_threat', {
      name: 'Critical Threat Detected',
      description: 'Alert on critical security threats',
      severity: 'critical',
      enabled: true,
      condition: (event) => {
        return event.eventType === 'threat_detected' &&
               event.severity === 'critical';
      },
      cooldown: 300000, // 5 minutes
      channels: ['console', 'webhook', 'kv_storage'],
      template: {
        title: 'Critical Security Threat Detected',
        message: 'A critical security threat has been detected: {{threatType}} (Risk Score: {{riskScore}})'
      }
    });

    // High-risk threat detection
    this.addRule('high_threat', {
      name: 'High Risk Threat',
      description: 'Alert on high-risk security threats',
      severity: 'high',
      enabled: true,
      condition: (event) => {
        return event.eventType === 'threat_detected' &&
               event.severity === 'high' &&
               event.riskScore >= 70;
      },
      cooldown: 600000, // 10 minutes
      channels: ['console', 'kv_storage'],
      template: {
        title: 'High Risk Security Threat',
        message: 'High-risk threat detected: {{threatType}} from {{sourceIp || actorId}}'
      }
    });

    // Multiple failed logins
    this.addRule('brute_force', {
      name: 'Brute Force Attack',
      description: 'Alert on potential brute force attacks',
      severity: 'high',
      enabled: true,
      condition: (event) => {
        return event.eventType === 'threat_detected' &&
               event.threatType === 'brute_force_login';
      },
      cooldown: 900000, // 15 minutes
      channels: ['console', 'webhook'],
      template: {
        title: 'Brute Force Attack Detected',
        message: 'Multiple failed login attempts from IP: {{sourceIp}} ({{attemptCount}} attempts)'
      }
    });

    // Admin account activity
    this.addRule('admin_activity', {
      name: 'Admin Account Activity',
      description: 'Alert on significant admin activities',
      severity: 'medium',
      enabled: true,
      condition: (event) => {
        return event.eventType === 'audit_log' &&
               ROLE_COMBINATIONS.ADMIN_ONLY.includes(event.actor_role) &&
               ['role_change', 'user_delete', 'admin_access'].includes(event.action);
      },
      cooldown: 1800000, // 30 minutes
      channels: ['console', 'kv_storage'],
      template: {
        title: 'Admin Activity Alert',
        message: 'Admin {{actor_role}} performed: {{action}} (Actor: {{actor_id}})'
      }
    });

    // System errors
    this.addRule('system_error', {
      name: 'System Error',
      description: 'Alert on system errors and failures',
      severity: 'medium',
      enabled: true,
      condition: (event) => {
        return event.eventType === 'audit_log' &&
               event.details?.success === false &&
               event.details?.error;
      },
      cooldown: 600000, // 10 minutes
      channels: ['console'],
      template: {
        title: 'System Error Detected',
        message: 'System error in {{action}}: {{details.error}}'
      }
    });

    // After-hours access
    this.addRule('after_hours', {
      name: 'After Hours Access',
      description: 'Alert on access during non-business hours',
      severity: 'low',
      enabled: false, // Disabled by default to avoid noise
      condition: (event) => {
        if (event.eventType !== 'audit_log') {return false;}

        const eventTime = new Date(event.timestamp);
        const hour = eventTime.getHours();

        return (hour < 6 || hour > 22) &&
               ['login', 'admin_access'].includes(event.action);
      },
      cooldown: 3600000, // 1 hour
      channels: ['console'],
      template: {
        title: 'After Hours Access',
        message: 'After-hours access detected: {{action}} by {{actor_id}} at {{timestamp}}'
      }
    });
  }

  /**
   * Add a new alert rule
   */
  addRule(ruleId, rule) {
    this.rules.set(ruleId, {
      ...rule,
      id: ruleId,
      createdAt: new Date(),
      lastTriggered: null
    });

    this.ruleStats.set(ruleId, {
      triggeredCount: 0,
      lastTriggered: null,
      suppressedCount: 0
    });

    alertSystem_log(`Alert rule added: ${ruleId}`);
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId) {
    const removed = this.rules.delete(ruleId);
    this.ruleStats.delete(ruleId);
    alertSystem_log(`Alert rule removed: ${ruleId}, success: ${removed}`);
    return removed;
  }

  /**
   * Enable/disable a rule
   */
  toggleRule(ruleId, enabled) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      alertSystem_log(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Update rule configuration
   */
  updateRule(ruleId, updates) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      alertSystem_log(`Rule updated: ${ruleId}`);
      return true;
    }
    return false;
  }

  /**
   * Evaluate event against all rules with dynamic thresholds
   */
  evaluateEvent(event, dynamicThresholds = null) {
    const triggeredRules = [];
    const now = Date.now();

    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) {continue;}

      const stats = this.ruleStats.get(ruleId);

      // Check cooldown period
      if (rule.lastTriggered && (now - rule.lastTriggered.getTime()) < rule.cooldown) {
        stats.suppressedCount++;
        continue;
      }

      try {
        // Create enhanced event with dynamic thresholds for condition evaluation
        const enhancedEvent = {
          ...event,
          dynamicThresholds: dynamicThresholds || {}
        };

        // Evaluate rule condition with dynamic thresholds
        if (rule.condition(enhancedEvent, dynamicThresholds)) {
          rule.lastTriggered = new Date();
          stats.triggeredCount++;
          stats.lastTriggered = rule.lastTriggered;

          triggeredRules.push({
            ruleId,
            rule,
            event: enhancedEvent,
            thresholdsUsed: dynamicThresholds
          });

          alertSystem_log(`Rule triggered: ${ruleId} for event ${event.eventType} with dynamic thresholds`);
        }
      } catch (error) {
        alertSystem_log(`Error evaluating rule ${ruleId}:`, error.message);
      }
    }

    return triggeredRules;
  }

  /**
   * Generate alert from triggered rule
   */
  generateAlert(triggeredRule) {
    const { ruleId, rule, event } = triggeredRule;

    // Template processing
    const processTemplate = (template, data) => {
      return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = path.split('.').reduce((obj, key) => obj?.[key], data);
        return value !== undefined ? String(value) : match;
      });
    };

    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: alertId,
      ruleId,
      ruleName: rule.name,
      severity: rule.severity,
      title: processTemplate(rule.template.title, event),
      message: processTemplate(rule.template.message, event),
      timestamp: new Date().toISOString(),
      source: 'audit_alert_system',
      channels: rule.channels,
      data: {
        originalEvent: event,
        rule: {
          id: ruleId,
          name: rule.name,
          description: rule.description
        }
      }
    };
  }

  /**
   * Get rule statistics
   */
  getRuleStats() {
    const rules = Array.from(this.rules.values()).map(rule => {
      const stats = this.ruleStats.get(rule.id);
      return {
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        enabled: rule.enabled,
        description: rule.description,
        cooldown: rule.cooldown,
        channels: rule.channels,
        stats,
        lastTriggered: rule.lastTriggered
      };
    });

    return {
      totalRules: this.rules.size,
      enabledRules: rules.filter(r => r.enabled).length,
      rules
    };
  }
}

/**
 * Main Alert System Service
 * Coordinates alerting, notifications, and escalation
*/
export class AlertSystemService extends BaseService {
  constructor(env) {
    super(env);
    this.channelManager = new AlertChannelManager();
    this.ruleEngine = new AlertRuleEngine();
    this.alertHistory = [];
    this.maxHistorySize = 1000;

    // Initialize KV Configuration Service for dynamic config
    this.kvConfig = createKvConfigService(env);

    this.systemStats = {
      totalAlerts: 0,
      alertsBySevertiy: { critical: 0, high: 0, medium: 0, low: 0 },
      alertsToday: 0,
      lastAlert: null
    };

    alertSystem_log('AlertSystemService initialized with dynamic configuration');
  }

  /**
   * Get dynamic alert system configuration
   * @returns {Object} Alert configuration from KV storage
   */
  async getAlertConfiguration() {
    try {
      const alertSettings = await this.kvConfig.getAlertThresholds();
      const featureFlags = await this.kvConfig.getFeatureFlags();
      const realtimeSettings = await this.kvConfig.getRealtimeMonitoringSettings();

      return {
        enabled: featureFlags.enableAlerting || true,
        channels: {
          console: featureFlags.enableConsoleAlerts || true,
          webhook: featureFlags.enableWebhookAlerts || false,
          email: featureFlags.enableEmailAlerts || false
        },
        thresholds: {
          errorRate: alertSettings.errorRateThreshold || 10,
          responseTime: alertSettings.responseTimeThreshold || 5000,
          failureCount: alertSettings.failureCountThreshold || 5,
          securityIncident: alertSettings.securityIncidentThreshold || 1
        },
        cooldown: {
          general: alertSettings.alertCooldownSeconds || 300,
          critical: alertSettings.criticalAlertCooldownSeconds || 60,
          security: alertSettings.securityAlertCooldownSeconds || 30
        },
        realtime: {
          enabled: realtimeSettings.enableRealtime || true,
          interval: realtimeSettings.monitoringIntervalSeconds || 30,
          batchSize: realtimeSettings.eventBatchSize || 100
        }
      };
    } catch (error) {
      alertSystem_log(`Failed to get alert configuration: ${error.message}`);
      // Return fallback configuration
      return {
        enabled: true,
        channels: { console: true, webhook: false, email: false },
        thresholds: { errorRate: 10, responseTime: 5000, failureCount: 5, securityIncident: 1 },
        cooldown: { general: 300, critical: 60, security: 30 },
        realtime: { enabled: true, interval: 30, batchSize: 100 }
      };
    }
  }

  /**
   * Process an event through the alert system with dynamic configuration
   */
  async processEvent(event) {
    try {
      // Get current alert configuration
      const alertConfig = await this.getAlertConfiguration();

      // Check if alerting is enabled
      if (!alertConfig.enabled) {
        alertSystem_log('Alert system disabled via configuration');
        return { eventProcessed: false, alertsGenerated: 0, alerts: [] };
      }

      // Evaluate event against all rules with dynamic thresholds
      const triggeredRules = this.ruleEngine.evaluateEvent(event, alertConfig.thresholds);

      const alerts = [];

      for (const triggeredRule of triggeredRules) {
        // Check cooldown period based on alert severity
        const cooldownPeriod = this.getCooldownPeriod(triggeredRule.severity, alertConfig.cooldown);
        if (this.isInCooldown(triggeredRule, cooldownPeriod)) {
          alertSystem_log(`Alert in cooldown period: ${triggeredRule.id}`);
          continue;
        }

        // Generate alert
        const alert = this.ruleEngine.generateAlert(triggeredRule);

        // Filter channels based on configuration
        const enabledChannels = this.getEnabledChannels(alert.channels, alertConfig.channels);
        if (enabledChannels.length === 0) {
          alertSystem_log(`No enabled channels for alert: ${alert.id}`);
          continue;
        }

        // Send alert through configured channels
        const sendResults = await this.channelManager.sendAlert(alert, enabledChannels);

        // Store alert in history
        const alertWithResults = {
          ...alert,
          sendResults,
          processedAt: new Date().toISOString(),
          configUsed: {
            thresholds: alertConfig.thresholds,
            cooldown: cooldownPeriod,
            channels: enabledChannels
          }
        };

        this.addToHistory(alertWithResults);
        this.updateStats(alertWithResults);

        alerts.push(alertWithResults);

        alertSystem_log(`Alert processed: ${alert.id}, severity: ${alert.severity}, channels: ${enabledChannels.join(', ')}`);
      }

      return {
        eventProcessed: true,
        alertsGenerated: alerts.length,
        alerts,
        configurationUsed: alertConfig
      };
    } catch (error) {
      alertSystem_log(`Failed to process event: ${error.message}`);
      return { eventProcessed: false, error: error.message };
    }
  }

  /**
   * Get cooldown period based on alert severity and configuration
   */
  getCooldownPeriod(severity, cooldownConfig) {
    switch (severity) {
    case 'critical':
      return cooldownConfig.critical * 1000; // Convert to milliseconds
    case 'security':
      return cooldownConfig.security * 1000;
    default:
      return cooldownConfig.general * 1000;
    }
  }

  /**
   * Check if alert is in cooldown period
   */
  isInCooldown(rule, cooldownMs) {
    const lastAlert = this.alertHistory.find(alert =>
      alert.ruleId === rule.id &&
      Date.now() - new Date(alert.processedAt).getTime() < cooldownMs
    );
    return !!lastAlert;
  }

  /**
   * Filter channels based on configuration
   */
  getEnabledChannels(requestedChannels, channelConfig) {
    return requestedChannels.filter(channel => channelConfig[channel] === true);
  }

  /**
   * Process an event through the alert system
   */
  async processEventLegacy(event) {
    try {
      // Evaluate event against all rules
      const triggeredRules = this.ruleEngine.evaluateEvent(event);

      const alerts = [];

      for (const triggeredRule of triggeredRules) {
        // Generate alert
        const alert = this.ruleEngine.generateAlert(triggeredRule);

        // Send alert through configured channels
        const sendResults = await this.channelManager.sendAlert(alert, alert.channels);

        // Store alert in history
        const alertWithResults = {
          ...alert,
          sendResults,
          processedAt: new Date().toISOString()
        };

        this.addToHistory(alertWithResults);
        this.updateStats(alertWithResults);

        alerts.push(alertWithResults);

        alertSystem_log(`Alert processed: ${alert.id}, severity: ${alert.severity}`);
      }

      return {
        eventProcessed: true,
        alertsGenerated: alerts.length,
        alerts
      };
    } catch (error) {
      alertSystem_log(`Error processing event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a manual alert
   */
  async sendManualAlert(alertData, channelIds = null) {
    const alert = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: 'manual',
      ...alertData
    };

    const sendResults = await this.channelManager.sendAlert(alert, channelIds);

    const alertWithResults = {
      ...alert,
      sendResults,
      processedAt: new Date().toISOString(),
      isManual: true
    };

    this.addToHistory(alertWithResults);
    this.updateStats(alertWithResults);

    alertSystem_log(`Manual alert sent: ${alert.id}`);
    return alertWithResults;
  }

  /**
   * Add alert to history
   */
  addToHistory(alert) {
    this.alertHistory.unshift(alert);

    // Trim history if it exceeds max size
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Update system statistics
   */
  updateStats(alert) {
    this.systemStats.totalAlerts++;
    this.systemStats.alertsBySevertiy[alert.severity]++;
    this.systemStats.lastAlert = alert.timestamp;

    // Count today's alerts
    const today = new Date().toDateString();
    const alertDate = new Date(alert.timestamp).toDateString();
    if (today === alertDate) {
      this.systemStats.alertsToday++;
    }
  }

  /**
   * Get alert history with filters
   */
  getAlertHistory(filters = {}) {
    let filteredAlerts = [...this.alertHistory];

    // Filter by severity
    if (filters.severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
    }

    // Filter by time range
    if (filters.startTime) {
      const startTime = new Date(filters.startTime);
      filteredAlerts = filteredAlerts.filter(a => new Date(a.timestamp) >= startTime);
    }

    if (filters.endTime) {
      const endTime = new Date(filters.endTime);
      filteredAlerts = filteredAlerts.filter(a => new Date(a.timestamp) <= endTime);
    }

    // Filter by rule
    if (filters.ruleId) {
      filteredAlerts = filteredAlerts.filter(a => a.ruleId === filters.ruleId);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      alerts: filteredAlerts.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: filteredAlerts.length,
        pages: Math.ceil(filteredAlerts.length / limit)
      }
    };
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    return {
      statistics: this.systemStats,
      channels: this.channelManager.getChannelStats(),
      rules: this.ruleEngine.getRuleStats(),
      recentAlerts: this.alertHistory.slice(0, 10).map(alert => ({
        id: alert.id,
        severity: alert.severity,
        title: alert.title,
        timestamp: alert.timestamp,
        ruleId: alert.ruleId,
        isManual: alert.isManual
      }))
    };
  }

  /**
   * Configure alert channels based on dynamic configuration
   */
  async configureChannels() {
    try {
      const alertConfig = await this.getAlertConfiguration();
      const channelSettings = alertConfig.channels;

      // Update console channel
      this.channelManager.updateChannelStatus('console', channelSettings.console);

      // Update webhook channel
      this.channelManager.updateChannelStatus('webhook', channelSettings.webhook);

      // Update email channel
      this.channelManager.updateChannelStatus('email', channelSettings.email);

      alertSystem_log(`Alert channels configured: console=${channelSettings.console}, webhook=${channelSettings.webhook}, email=${channelSettings.email}`);

      return {
        success: true,
        channelsConfigured: channelSettings,
        activeChannels: this.channelManager.getActiveChannels()
      };
    } catch (error) {
      alertSystem_log(`Failed to configure channels: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update alert thresholds dynamically
   */
  async updateAlertThresholds(newThresholds) {
    try {
      // Update thresholds in KV storage
      const currentConfig = await this.kvConfig.getAlertThresholds();
      const updatedConfig = { ...currentConfig, ...newThresholds };

      await this.kvConfig.setConfig('ALERT_ERROR_RATE_THRESHOLD', updatedConfig.errorRateThreshold);
      await this.kvConfig.setConfig('ALERT_RESPONSE_TIME_THRESHOLD', updatedConfig.responseTimeThreshold);
      await this.kvConfig.setConfig('ALERT_FAILURE_COUNT_THRESHOLD', updatedConfig.failureCountThreshold);
      await this.kvConfig.setConfig('ALERT_SECURITY_INCIDENT_THRESHOLD', updatedConfig.securityIncidentThreshold);

      alertSystem_log('Alert thresholds updated successfully');

      return {
        success: true,
        oldThresholds: currentConfig,
        newThresholds: updatedConfig
      };
    } catch (error) {
      alertSystem_log(`Failed to update alert thresholds: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test alert system with dynamic configuration
   */
  async testAlertSystemWithConfig() {
    try {
      // Configure channels first
      const channelConfig = await this.configureChannels();
      if (!channelConfig.success) {
        return channelConfig;
      }

      // Get current configuration
      const alertConfig = await this.getAlertConfiguration();

      // Create test event to trigger alerts
      const testEvent = {
        eventType: 'SYSTEM_TEST',
        severity: 'low',
        message: 'Alert system configuration test',
        data: {
          test: true,
          configUsed: alertConfig,
          timestamp: new Date().toISOString()
        }
      };

      // Process test event
      const processResult = await this.processEvent(testEvent);

      alertSystem_log('Alert system test with configuration completed');

      return {
        success: true,
        testEvent,
        processResult,
        configurationUsed: alertConfig,
        channelsConfigured: channelConfig.activeChannels
      };
    } catch (error) {
      alertSystem_log(`Alert system test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system status with dynamic configuration info
   */
  async getSystemStatusWithConfig() {
    try {
      const basicStatus = this.getSystemStatus();
      const alertConfig = await this.getAlertConfiguration();

      return {
        ...basicStatus,
        configuration: {
          enabled: alertConfig.enabled,
          activeChannels: this.getEnabledChannels(['console', 'webhook', 'email'], alertConfig.channels),
          thresholds: alertConfig.thresholds,
          cooldownSettings: alertConfig.cooldown,
          realtimeSettings: alertConfig.realtime
        },
        configurationHealth: {
          kvConfigAccessible: true,
          thresholdsValid: this.validateThresholds(alertConfig.thresholds),
          channelsConfigured: Object.keys(alertConfig.channels).length
        }
      };
    } catch (error) {
      alertSystem_log(`Failed to get system status with config: ${error.message}`);
      return {
        ...this.getSystemStatus(),
        configuration: null,
        configurationHealth: {
          kvConfigAccessible: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Validate alert thresholds
   */
  validateThresholds(thresholds) {
    return {
      errorRateValid: typeof thresholds.errorRate === 'number' && thresholds.errorRate > 0,
      responseTimeValid: typeof thresholds.responseTime === 'number' && thresholds.responseTime > 0,
      failureCountValid: typeof thresholds.failureCount === 'number' && thresholds.failureCount > 0,
      securityValid: typeof thresholds.securityIncident === 'number' && thresholds.securityIncident >= 0
    };
  }

  /**
   * Get channel manager for configuration
   */
  getChannelManager() {
    return this.channelManager;
  }

  /**
   * Get rule engine for configuration
   */
  getRuleEngine() {
    return this.ruleEngine;
  }

  /**
   * Test alert system
   */
  async testAlertSystem() {
    const testAlert = {
      severity: 'low',
      title: 'Test Alert',
      message: 'This is a test alert to verify the alert system is working correctly.',
      data: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };

    const result = await this.sendManualAlert(testAlert);
    alertSystem_log('Alert system test completed');

    return {
      success: true,
      testAlert: result,
      systemStatus: this.getSystemStatus()
    };
  }
}

export default AlertSystemService;
