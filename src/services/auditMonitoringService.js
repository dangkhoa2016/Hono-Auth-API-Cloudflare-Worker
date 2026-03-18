/**
 * Real-time Audit Monitoring Service
 * Provides live monitoring, threat detection, and automated responses
*/

import { auditMonitoring_log } from '../utils/debug.js';
import { createDatabaseService } from '../utils/serviceFactory.js';
import { BaseService } from './baseService.js';
import { ROLES, ROLE_COMBINATIONS } from '../constants/roles.js';

/**
 * Real-time Event Stream Manager
 * Handles live event streaming and real-time notifications
*/
class EventStreamManager {
  constructor() {
    this.subscribers = new Map();
    this.eventBuffer = [];
    this.maxBufferSize = 1000;
    this.streamStats = {
      totalEvents: 0,
      activeSubscribers: 0,
      eventsPerMinute: 0,
      lastEventTime: null
    };

    // Rate tracking for events per minute
    this.eventTimes = [];

    auditMonitoring_log('EventStreamManager initialized');
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(subscriberId, eventTypes = ['all'], callback) {
    this.subscribers.set(subscriberId, {
      eventTypes,
      callback,
      subscribedAt: new Date(),
      eventCount: 0
    });

    this.streamStats.activeSubscribers = this.subscribers.size;
    auditMonitoring_log(`New subscriber: ${subscriberId}, types: ${eventTypes.join(',')}`);

    // Send recent events to new subscriber
    this.sendRecentEvents(subscriberId);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriberId) {
    const removed = this.subscribers.delete(subscriberId);
    this.streamStats.activeSubscribers = this.subscribers.size;
    auditMonitoring_log(`Subscriber removed: ${subscriberId}, success: ${removed}`);
  }

  /**
   * Broadcast event to all relevant subscribers
   */
  broadcastEvent(event) {
    const now = new Date();

    // Update stream statistics
    this.streamStats.totalEvents++;
    this.streamStats.lastEventTime = now;
    this.eventTimes.push(now);

    // Keep only last minute for rate calculation
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    this.eventTimes = this.eventTimes.filter(time => time > oneMinuteAgo);
    this.streamStats.eventsPerMinute = this.eventTimes.length;

    // Add to buffer
    this.eventBuffer.push({
      ...event,
      streamId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      broadcastAt: now
    });

    // Trim buffer if needed
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer = this.eventBuffer.slice(-this.maxBufferSize);
    }

    // Broadcast to subscribers
    const eventWithMetadata = this.eventBuffer[this.eventBuffer.length - 1];

    for (const [subscriberId, subscriber] of this.subscribers) {
      try {
        const { eventTypes, callback } = subscriber;

        // Check if subscriber wants this event type
        if (eventTypes.includes('all') || eventTypes.includes(event.eventType)) {
          callback(eventWithMetadata);
          subscriber.eventCount++;
        }
      } catch (error) {
        auditMonitoring_log(`Error broadcasting to ${subscriberId}: ${error.message}`);
        // Remove problematic subscriber
        this.unsubscribe(subscriberId);
      }
    }

    auditMonitoring_log(`Event broadcasted: ${event.eventType}, subscribers: ${this.subscribers.size}`);
  }

  /**
   * Send recent events to a specific subscriber
   */
  sendRecentEvents(subscriberId, count = 50) {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {return;}

    const recentEvents = this.eventBuffer.slice(-count);
    const { eventTypes, callback } = subscriber;

    recentEvents.forEach(event => {
      if (eventTypes.includes('all') || eventTypes.includes(event.eventType)) {
        try {
          callback({ ...event, isHistorical: true });
        } catch (error) {
          auditMonitoring_log(`Error sending historical event to ${subscriberId}: ${error.message}`);
        }
      }
    });
  }

  /**
   * Get current stream statistics
   */
  getStreamStats() {
    return {
      ...this.streamStats,
      bufferSize: this.eventBuffer.length,
      subscriberDetails: Array.from(this.subscribers.entries()).map(([id, sub]) => ({
        id,
        eventTypes: sub.eventTypes,
        subscribedAt: sub.subscribedAt,
        eventCount: sub.eventCount
      }))
    };
  }

  /**
   * Clear event buffer
   */
  clearBuffer() {
    const clearedCount = this.eventBuffer.length;
    this.eventBuffer = [];
    auditMonitoring_log(`Event buffer cleared: ${clearedCount} events removed`);
    return clearedCount;
  }
}

/**
 * Threat Detection Engine
 * Advanced security threat detection and scoring
*/
class ThreatDetectionEngine {
  constructor() {
    this.threatRules = new Map();
    this.activeThreats = new Map();
    this.threatHistory = [];
    this.detectionStats = {
      totalThreatsDetected: 0,
      activeThreats: 0,
      falsePositives: 0,
      resolvedThreats: 0
    };

    this.initializeDefaultRules();
    auditMonitoring_log('ThreatDetectionEngine initialized with default rules');
  }

  /**
   * Initialize default threat detection rules
   */
  initializeDefaultRules() {
    // Brute force attack detection
    this.addThreatRule('brute_force_login', {
      name: 'Brute Force Login Attempts',
      description: 'Multiple failed login attempts from same IP',
      severity: 'high',
      timeWindow: 300000, // 5 minutes
      threshold: 5,
      condition: (events) => {
        const failedLogins = events.filter(e =>
          (e.action?.toLowerCase().includes('login') || (typeof e.target_identifier === 'string' && e.target_identifier.includes('/auth/login'))) && e.status !== 'SUCCESS'
        );

        const ipGroups = failedLogins.reduce((groups, event) => {
          const ip = event.ip_address || 'unknown';
          groups[ip] = (groups[ip] || 0) + 1;
          return groups;
        }, {});

        return Object.entries(ipGroups)
          .filter(([_ip, count]) => count >= this.threshold)
          .map(([ip, count]) => ({
            threatType: 'brute_force_login',
            sourceIp: ip,
            attemptCount: count,
            riskScore: Math.min(count * 20, 100)
          }));
      }
    });

    // Privilege escalation detection
    this.addThreatRule('privilege_escalation', {
      name: 'Privilege Escalation Attempt',
      description: 'Unauthorized role changes or admin access attempts',
      severity: 'critical',
      timeWindow: 600000, // 10 minutes
      threshold: 1,
      condition: (events) => {
        const suspiciousEvents = events.filter(e =>
          (e.action === 'role_change' && e.actor_role !== ROLES.SUPER_ADMIN) ||
          (e.action === 'admin_access' && !ROLE_COMBINATIONS.ADMIN_ONLY.includes(e.actor_role))
        );

        return suspiciousEvents.map(event => ({
          threatType: 'privilege_escalation',
          actorId: event.actor_id,
          action: event.action,
          riskScore: 90
        }));
      }
    });

    // Suspicious data access patterns
    this.addThreatRule('suspicious_data_access', {
      name: 'Suspicious Data Access Pattern',
      description: 'Unusual data access patterns or bulk operations',
      severity: 'medium',
      timeWindow: 900000, // 15 minutes
      threshold: 20,
      condition: (events) => {
        const dataAccess = events.filter(e =>
          ['user_list', 'user_details', 'admin_dashboard'].includes(e.action)
        );

        const userGroups = dataAccess.reduce((groups, event) => {
          const userId = event.actor_id || 'unknown';
          groups[userId] = (groups[userId] || 0) + 1;
          return groups;
        }, {});

        return Object.entries(userGroups)
          .filter(([_userId, count]) => count >= this.threshold)
          .map(([userId, count]) => ({
            threatType: 'suspicious_data_access',
            actorId: userId,
            accessCount: count,
            riskScore: Math.min(count * 3, 75)
          }));
      }
    });

    // Anomalous time-based access
    this.addThreatRule('anomalous_time_access', {
      name: 'Anomalous Time-based Access',
      description: 'Access during unusual hours',
      severity: 'low',
      timeWindow: 3600000, // 1 hour
      threshold: 1,
      condition: (events) => {
        const now = new Date();
        const currentHour = now.getHours();

        // Define business hours (9 AM to 6 PM)
        const isBusinessHours = currentHour >= 9 && currentHour <= 18;

        if (isBusinessHours) {return [];}

        const afterHoursEvents = events.filter(e =>
          ['login', 'admin_access', 'user_update'].includes(e.action)
        );

        return afterHoursEvents.map(event => ({
          threatType: 'anomalous_time_access',
          actorId: event.actor_id,
          action: event.action,
          accessTime: event.timestamp,
          riskScore: 30
        }));
      }
    });
  }

  /**
   * Add a custom threat detection rule
   */
  addThreatRule(ruleId, rule) {
    this.threatRules.set(ruleId, {
      ...rule,
      id: ruleId,
      createdAt: new Date(),
      enabled: true
    });
    auditMonitoring_log(`Threat rule added: ${ruleId}`);
  }

  /**
   * Remove a threat detection rule
   */
  removeThreatRule(ruleId) {
    const removed = this.threatRules.delete(ruleId);
    auditMonitoring_log(`Threat rule removed: ${ruleId}, success: ${removed}`);
    return removed;
  }

  /**
   * Enable/disable a threat detection rule
   */
  toggleThreatRule(ruleId, enabled) {
    const rule = this.threatRules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      auditMonitoring_log(`Threat rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Analyze events for threats
   */
  analyzeThreats(recentEvents) {
    const detectedThreats = [];
    const now = new Date();

    for (const [ruleId, rule] of this.threatRules) {
      if (!rule.enabled) {continue;}

      try {
        // Filter events within the rule's time window
        const windowStart = new Date(now.getTime() - rule.timeWindow);
        const relevantEvents = recentEvents.filter(event =>
          new Date(event.timestamp) >= windowStart
        );

        // Apply rule condition
        const threats = rule.condition(relevantEvents);

        for (const threat of threats) {
          const threatId = `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const detectedThreat = {
            id: threatId,
            ruleId,
            ruleName: rule.name,
            severity: rule.severity,
            description: rule.description,
            detectedAt: now,
            status: 'active',
            ...threat
          };

          detectedThreats.push(detectedThreat);
          this.activeThreats.set(threatId, detectedThreat);
          this.threatHistory.push(detectedThreat);

          this.detectionStats.totalThreatsDetected++;
          this.detectionStats.activeThreats = this.activeThreats.size;

          auditMonitoring_log(`Threat detected: ${rule.name}, severity: ${rule.severity}, score: ${threat.riskScore}`);
        }
      } catch (error) {
        auditMonitoring_log(`Error in threat rule ${ruleId}: ${error.message}`);
      }
    }

    return detectedThreats;
  }

  /**
   * Resolve a threat
   */
  resolveThreat(threatId, resolution = 'manual') {
    const threat = this.activeThreats.get(threatId);
    if (threat) {
      threat.status = 'resolved';
      threat.resolvedAt = new Date();
      threat.resolution = resolution;

      this.activeThreats.delete(threatId);
      this.detectionStats.activeThreats = this.activeThreats.size;
      this.detectionStats.resolvedThreats++;

      auditMonitoring_log(`Threat resolved: ${threatId}, resolution: ${resolution}`);
      return true;
    }
    return false;
  }

  /**
   * Mark threat as false positive
   */
  markFalsePositive(threatId) {
    const threat = this.activeThreats.get(threatId);
    if (threat) {
      threat.status = 'false_positive';
      threat.resolvedAt = new Date();
      threat.resolution = 'false_positive';

      this.activeThreats.delete(threatId);
      this.detectionStats.activeThreats = this.activeThreats.size;
      this.detectionStats.falsePositives++;

      auditMonitoring_log(`Threat marked as false positive: ${threatId}`);
      return true;
    }
    return false;
  }

  /**
   * Get current threat status
   */
  getThreatStatus() {
    return {
      statistics: this.detectionStats,
      activeThreats: Array.from(this.activeThreats.values()),
      threatRules: Array.from(this.threatRules.values()).map(rule => ({
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        enabled: rule.enabled,
        description: rule.description
      })),
      recentThreats: this.threatHistory.slice(-20)
    };
  }
}

/**
 * Main Audit Monitoring Service
 * Coordinates real-time monitoring, threat detection, and alerting
*/
export class AuditMonitoringService extends BaseService {
  constructor(env) {
    super(env);
    this.eventStream = new EventStreamManager();
    this.threatDetection = new ThreatDetectionEngine();
    this.databaseService = createDatabaseService(env);
    this.monitoringActive = false;
    this.monitoringInterval = null;
    this.lastProcessedId = 0;
    this.startTime = null;

    auditMonitoring_log('AuditMonitoringService initialized');
  }

  /**
   * Start real-time monitoring
   */
  async startMonitoring(intervalMs = 5000) {
    if (this.monitoringActive) {
      auditMonitoring_log('Monitoring already active');
      return false;
    }

    this.monitoringActive = true;
    this.startTime = Date.now();
    auditMonitoring_log(`Starting real-time monitoring with ${intervalMs}ms interval`);

    // Initial setup - get the latest audit log ID
    try {
      const result = await this.databaseService.select(
        'SELECT MAX(id) as maxId FROM audit_logs',
        []
      );
      this.lastProcessedId = result?.[0]?.maxId || 0;
      auditMonitoring_log(`Starting from audit log ID: ${this.lastProcessedId}`);
    } catch (error) {
      auditMonitoring_log(`Error getting initial audit log ID: ${error.message}`);
      this.lastProcessedId = 0;
    }

    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.processNewEvents();
    }, intervalMs);

    return true;
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring() {
    if (!this.monitoringActive) {
      auditMonitoring_log('Monitoring not active');
      return false;
    }

    this.monitoringActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    auditMonitoring_log('Real-time monitoring stopped');
    return true;
  }

  /**
   * Process new events since last check
   */
  async processNewEvents() {
    try {
      // Get new audit events
      const newEvents = await this.databaseService.select(
        'SELECT * FROM audit_logs WHERE id > ? ORDER BY id ASC LIMIT 100',
        [this.lastProcessedId]
      );

      if (newEvents.length === 0) {return;}

      auditMonitoring_log(`Processing ${newEvents.length} new events`);

      // Update last processed ID
      this.lastProcessedId = Math.max(...newEvents.map(e => e.id));

      // Process each event
      for (const event of newEvents) {
        // Enrich event data
        const enrichedEvent = await this.enrichEvent(event);

        // Broadcast to real-time subscribers
        this.eventStream.broadcastEvent({
          eventType: 'audit_log',
          ...enrichedEvent
        });
      }

      // Get recent events for threat analysis (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 1800000).toISOString();
      const recentEvents = await this.databaseService.select(
        'SELECT * FROM audit_logs WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 1000',
        [thirtyMinutesAgo]
      );

      // Analyze for threats
      const detectedThreats = await this.threatDetection.analyzeThreats(recentEvents);

      // Broadcast threats
      for (const threat of detectedThreats) {
        this.eventStream.broadcastEvent({
          eventType: 'threat_detected',
          ...threat
        });
      }

    } catch (error) {
      auditMonitoring_log(`Error processing new events: ${error.message}`);
    }
  }

  /**
   * Enrich event with additional context
   */
  enrichEvent(event) {
    try {
      // Parse details if it's a string
      const details = typeof event.details === 'string'
        ? JSON.parse(event.details)
        : event.details || {};

      // Add geographic info based on IP (simplified)
      const geoInfo = this.getGeoInfo(event.ip_address);

      // Add risk assessment
      const riskScore = this.calculateEventRiskScore(event);

      return {
        ...event,
        details,
        geo: geoInfo,
        riskScore,
        enrichedAt: new Date().toISOString()
      };
    } catch (error) {
      auditMonitoring_log(`Error enriching event: ${error.message}`);
      return event;
    }
  }

  /**
   * Simple geo info extraction (can be enhanced with real GeoIP service)
   */
  getGeoInfo(ipAddress) {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return { country: 'Local', city: 'Localhost', isp: 'Local' };
    }

    // This is a simplified implementation
    // In production, you'd use a real GeoIP service
    return {
      country: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      isLocal: false
    };
  }

  /**
   * Calculate risk score for an event
   */
  calculateEventRiskScore(event) {
    let score = 0;

    // Base scores by action type
    const actionScores = {
      'login_failed': 20,
      'role_change': 40,
      'user_delete': 35,
      'admin_access': 25,
      'password_change': 15,
      'login': 5,
      'logout': 2
    };

    score += actionScores[event.action] || 10;

    // Increase score for failed logns based on action or status
    if (event.status !== 'SUCCESS' && (event.action?.toLowerCase().includes('login') || (typeof event.target_identifier === 'string' && event.target_identifier.includes('/auth/login')))) {
      score += 20;
    }

    // Increase score for failed actions
    if (event.status !== 'SUCCESS' || event.details?.success === false) {
      score += 15;
    }

    // Increase score for admin actions
    if (ROLE_COMBINATIONS.ADMIN_ONLY.includes(event.actor_role)) {
      score += 10;
    }

    // Increase score for after-hours activity
    const eventTime = new Date(event.timestamp);
    const hour = eventTime.getHours();
    if (hour < 6 || hour > 22) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Subscribe to real-time events
   */
  subscribeToEvents(subscriberId, eventTypes, callback) {
    return this.eventStream.subscribe(subscriberId, eventTypes, callback);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribeFromEvents(subscriberId) {
    return this.eventStream.unsubscribe(subscriberId);
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats() {
    return {
      monitoring: {
        active: this.monitoringActive,
        lastProcessedId: this.lastProcessedId,
        uptime: this.monitoringActive ? Date.now() - this.startTime : 0
      },
      eventStream: this.eventStream.getStreamStats(),
      threatDetection: this.threatDetection.getThreatStatus()
    };
  }

  /**
   * Get threat management interface
   */
  getThreatDetection() {
    return this.threatDetection;
  }

  /**
   * Manual threat analysis for specific time range
   */
  async analyzeThreatsForPeriod(startTime, endTime) {
    try {
      const events = await this.databaseService.select(
        'SELECT * FROM audit_logs WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
        [startTime, endTime]
      );

      const threats = await this.threatDetection.analyzeThreats(events);
      auditMonitoring_log(`Manual threat analysis completed: ${threats.length} threats found`);

      return {
        period: { startTime, endTime },
        eventCount: events.length,
        threatsDetected: threats.length,
        threats
      };
    } catch (error) {
      auditMonitoring_log(`Error in manual threat analysis: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate real-time event for testing
   */
  simulateEvent(eventData) {
    const baseType = eventData?.eventType || eventData?.type || 'test_event';
    const simulatedEvent = {
      id: `sim_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: baseType,
      type: baseType,
      eventType: baseType,
      actor_id: 'system',
      actor_role: 'system',
      ip_address: '127.0.0.1',
      user_agent: 'Testing Agent',
      details: {},
      ...eventData
    };

    try {
      this.eventStream.broadcastEvent({
        eventType: simulatedEvent.eventType || 'audit_log',
        ...simulatedEvent,
        isSimulated: true
      });
      auditMonitoring_log(`Simulated event broadcasted: ${simulatedEvent.action}`);
    } catch (err) {
      auditMonitoring_log(`Error broadcasting simulated event: ${err.message}`);
    }
    return simulatedEvent;
  }
}

export default AuditMonitoringService;
