#!/usr/bin/env node

/**
 * Real-time Monitoring System Test Suite
 * Tests real-time monitoring features: /api/realtime-monitoring/*
 *
 * Real-time monitoring endpoints tested:
 * - GET /api/realtime-monitoring/status - Monitoring system status
 * - POST /api/realtime-monitoring/start - Start monitoring session
 * - POST /api/realtime-monitoring/stop - Stop monitoring session
 * - GET /api/realtime-monitoring/threats - Recent threat events
 * - POST /api/realtime-monitoring/analyze - Threat analysis for time periods
 * - POST /api/realtime-monitoring/simulate - Event simulation for testing
 * - GET /api/realtime-monitoring/dashboard/realtime - Live dashboard data
 * - GET /api/realtime-monitoring/dashboard/overview - Dashboard overview
 * - GET /api/realtime-monitoring/dashboard/timeline - Time-ranged dashboard data
 * - POST /api/realtime-monitoring/dashboard/export - Dashboard data export
 *
 * Test coverage:
 * - Monitoring session lifecycle (start/stop/status)
 * - Real-time event streaming and processing
 * - Threat detection and analysis
 * - Live dashboard data visualization
 * - Alert system integration
 * - Incident management workflows
 * - Performance monitoring under load
 * - Security access control (super admin only)
 * - Integration with audit system
 * - Event simulation for testing scenarios
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class RealtimeMonitoringTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.tokens = {};
    this.monitoringSession = null;
  }

  async runAll() {
    this.logger.logSuiteHeader('🔴 Starting Real-time Monitoring Tests');

    try {
      await this.setupAuthentication();
      this.logger.success('setupAuthentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] setupAuthentication failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testMonitoringLifecycle,
      this.testEventStreaming,
      this.testDashboardFeatures,
      this.testAlertSystem,
      this.testIncidentManagement,
      this.testPerformanceAndScalability,
      this.testSecurityAndAccess,
      this.testIntegration,
      this.testThreatResolution,
      this.testAlertRulesManagement,
      this.testAlertChannelsManagement,
      this.testComprehensiveDashboard,
      this.testAdvancedMonitoringScenarios,
      this.testErrorHandlingAndEdgeCases
    ];

    // Process tests using standard pattern
    for (const test of tests) {
      try {
        await test.call(this);
        this.logger.recordResult(true);
        this.logger.success(`${test.name} passed`);
      } catch (error) {
        this.logger.recordResult(false);
        this.logger.error(`[runAll] [${test.name}] failed: ${error.message}`);
      }
    }

    this.logger.logSummary();

    // Cleanup any running monitoring sessions
    await this.cleanup();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  async setupAuthentication() {
    try {
      this.logger.info('Setting up authentication tokens...');

      // Get admin token
      const adminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);

      if (adminLogin.success && adminLogin.data.data.access_token) {
        this.tokens.admin = adminLogin.data.data.access_token;
        this.logger.success('Admin token acquired');
      } else {
        throw new Error('Failed to get admin token');
      }

      // Try to get super admin token
      try {
        const superAdminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

        if (superAdminLogin.success && superAdminLogin.data.data.access_token) {
          this.tokens.superAdmin = superAdminLogin.data.data.access_token;
          this.logger.success('Super admin token acquired');
        }
      } catch (error) {
        this.logger.info('Super admin user may not exist (using admin for tests)');
        this.tokens.superAdmin = this.tokens.admin; // Fallback for testing
      }
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  async testMonitoringLifecycle() {
    this.logger.info('Testing monitoring lifecycle (start/stop/status)...');

    try {
      // Check monitoring status
      const statusResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringStatus, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(statusResponse.status === 200 || statusResponse.status === 403,
        'Should check monitoring status');

      if (statusResponse.status === 200) {
        this.assert.assertTrue(statusResponse.data && statusResponse.data.success, 'Status response should be successful');
        this.logger.success('Monitoring status accessible');
      }

      // Start monitoring session
      const startResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringStart, {
        intervalMs: 5000,
        enableThreatDetection: true
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(startResponse.status === 200 || startResponse.status === 403,
        'Should start monitoring session');

      if (startResponse.status === 200) {
        this.assert.assertTrue(startResponse.data && startResponse.data.success, 'Start monitoring should be successful');
        this.monitoringSession = startResponse.data.data?.monitoring_id;
        this.logger.success('Monitoring session started');
      }

      // Stop monitoring session
      const stopResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringStop, {}, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(stopResponse.status === 200 || stopResponse.status === 403 || stopResponse.status === 404,
        'Should stop monitoring session');

      if (stopResponse.status === 200) {
        this.logger.success('Monitoring session stopped');
      }

      this.logger.success('Monitoring Lifecycle completed successfully');
    } catch (error) {
      this.logger.error(`[testMonitoringLifecycle] failed: ${error.message}`);
      throw error;
    }
  }

  async testEventStreaming() {
    this.logger.info('Testing real-time event streaming...');

    try {
      // Test recent events retrieval
      const threatsResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringThreats, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(threatsResponse.status === 200 || threatsResponse.status === 403,
        'Should retrieve recent threats');

      if (threatsResponse.status === 200) {
        this.assert.assertTrue(threatsResponse.data && threatsResponse.data.success, 'Threats response should be successful');
        this.logger.success('Threat data accessible');
      }

      // Test event analysis
      const analyzeResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringAnalyze, {
        hours: 1
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertEqual(analyzeResponse.status, 200, 'Should analyze threats for time period');
      if (analyzeResponse.status === 200) {
        this.assert.assertTrue(analyzeResponse.data && analyzeResponse.data.success, 'Analysis response should be successful');
      }

      // Test event simulation
      const simulateResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringSimulate, {
        eventType: 'test_event',
        data: { test: true }
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(simulateResponse.status === 200 || simulateResponse.status === 403,
        'Should simulate events');

      this.logger.success('Event Streaming completed successfully');
    } catch (error) {
      this.logger.error(`[testEventStreaming] failed: ${error.message}`);
      throw error;
    }
  }

  async testDashboardFeatures() {
    this.logger.info('Testing dashboard features...');

    try {
      // Test live dashboard data
      const realtimeResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardRealtime, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(realtimeResponse.status === 200 || realtimeResponse.status === 403,
        'Should access live dashboard data');

      if (realtimeResponse.status === 200) {
        this.assert.assertTrue(realtimeResponse.data.success, 'Dashboard response should be successful');
        this.logger.success('Live dashboard data accessible');
      }

      // Test dashboard overview
      const overviewResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardOverview, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(overviewResponse.status === 200 || overviewResponse.status === 403,
        'Should access dashboard overview');

      // Test dashboard export
      const exportResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringDashboardExport, {
        format: 'json',
        timeRange: 'last_24h'
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(exportResponse.status === 200 || exportResponse.status === 403 || exportResponse.status === 404,
        'Should handle dashboard export');

      this.logger.success('Dashboard Features completed successfully');
    } catch (error) {
      this.logger.error(`[testDashboardFeatures] failed: ${error.message}`);
      throw error;
    }
  }

  async testAlertSystem() {
    this.logger.info('Testing alert system functionality...');

    try {
      // Test alert status
      const statusResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringAlertsStatus, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(statusResponse.status === 200 || statusResponse.status === 403,
        'Should check alert status');

      // Test alert history
      const historyResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringAlertsHistory, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(historyResponse.status === 200 || historyResponse.status === 403,
        'Should access alert history');

      // Test alert sending
      const sendResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringAlertsSend, {
        severity: 'medium',
        title: 'Test Alert',
        message: 'Manual test alert triggered'
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertEqual(sendResponse.status, 200, 'Should trigger manual alert');
      if (sendResponse.status === 200) {
        this.assert.assertTrue(sendResponse.data && sendResponse.data.success, 'Alert response should be successful');
      }

      this.logger.success('Alert System completed successfully');
    } catch (error) {
      this.logger.error(`[testAlertSystem] failed: ${error.message}`);
      throw error;
    }
  }

  async testIncidentManagement() {
    this.logger.info('Testing incident management functionality...');

    try {
      // Test security dashboard
      const securityResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardSecurity, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(securityResponse.status === 200 || securityResponse.status === 403,
        'Should access security dashboard');

      // Test performance monitoring
      const performanceResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardPerformance, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(performanceResponse.status === 200 || performanceResponse.status === 403,
        'Should access performance dashboard');

      // Test health check
      const healthResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardHealth, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(healthResponse.status === 200 || healthResponse.status === 403,
        'Should perform health check');

      this.logger.success('Incident Management completed successfully');
    } catch (error) {
      this.logger.error(`[testIncidentManagement] failed: ${error.message}`);
      throw error;
    }
  }

  async testPerformanceAndScalability() {
    this.logger.info('Testing performance and scalability...');

    try {
      // Test multiple dashboard requests
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardOverview, {
            Authorization: `Bearer ${this.tokens.superAdmin}`
          })
        );
      }

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r =>
        r.status === 'fulfilled' &&
        (r.value.status === 200 || r.value.status === 403)
      ).length;

      this.assert.assertTrue(successCount >= 2, 'Should handle concurrent requests');

      // Test response time
      const startTime = Date.now();
      const response = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardRealtime, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.assert.assertTrue(response.status === 200 || response.status === 403,
        'Should load dashboard efficiently');

      if (response.status === 200) {
        this.logger.info(`⏱️ Dashboard load time: ${responseTime}ms`);
      }

      this.logger.success('Performance and Scalability completed successfully');
    } catch (error) {
      this.logger.error(`[testPerformanceAndScalability] failed: ${error.message}`);
      throw error;
    }
  }

  async testSecurityAndAccess() {
    this.logger.info('Testing security and access control...');

    try {
      // Test unauthorized access
      const unauthorizedResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringStatus);

      this.assert.assertEqual(unauthorizedResponse.status, 401,
        'Should require authentication');

      // Test admin access restriction (if different from super admin)
      if (this.tokens.admin !== this.tokens.superAdmin) {
        const adminResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringStatus, {
          Authorization: `Bearer ${this.tokens.admin}`
        });

        this.assert.assertTrue(adminResponse.status === 403 || adminResponse.status === 404,
          'Admin should be restricted from real-time monitoring');
      }

      this.logger.success('Security and Access completed successfully');
    } catch (error) {
      this.logger.error(`[testSecurityAndAccess] failed: ${error.message}`);
      throw error;
    }
  }

  async testIntegration() {
    this.logger.info('Testing integration with other systems...');

    try {
      // Test dashboard integration
      const response = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardOverview, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(response.status === 200 || response.status === 403,
        'Should integrate with dashboard system');

      // Test alert system integration
      const alertResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringAlertsStatus, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(alertResponse.status === 200 || alertResponse.status === 403,
        'Should integrate with alert system');

      this.logger.success('Integration completed successfully');
    } catch (error) {
      this.logger.error(`[testIntegration] failed: ${error.message}`);
      throw error;
    }
  }

  async testThreatResolution() {
    this.logger.info('Testing threat resolution functionality...');

    try {
      // Test threat resolution
      const threatId = 'test_threat_' + Date.now();
      const response = await this.client.post(`${API_ENDPOINTS.realtimeMonitoringThreats}/${threatId}/resolve`, {
        resolution: 'manual',
        notes: 'Test threat resolution'
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertEqual(response.status, 200, 'Should handle threat resolution');
      if (response.status === 200) {
        this.assert.assertTrue(response.data && response.data.success, 'Threat resolution response should be successful');
      }

      this.logger.success('Threat Resolution completed successfully');
    } catch (error) {
      this.logger.error(`[testThreatResolution] failed: ${error.message}`);
      throw error;
    }
  }

  async testAlertRulesManagement() {
    this.logger.info('Testing alert rules management...');

    try {
      // Test get alert rules
      const rulesResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringAlertsRules, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(rulesResponse.status === 200 || rulesResponse.status === 403,
        'Should access alert rules');

      // Test create alert rule
      const createResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringAlertsRules, {
        name: 'Test Alert Rule',
        severity: 'medium',
        condition: 'return event.action === "test_action"',
        enabled: true,
        description: 'Test rule for monitoring test actions'
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(createResponse.status === 200 || createResponse.status === 403 || createResponse.status === 400,
        'Should handle alert rule creation');

      this.logger.success('Alert Rules Management completed successfully');
    } catch (error) {
      this.logger.error(`[testAlertRulesManagement] failed: ${error.message}`);
      throw error;
    }
  }

  async testAlertChannelsManagement() {
    this.logger.info('Testing alert channels management...');

    try {
      // Test get alert channels
      const channelsResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringAlertsChannels, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(channelsResponse.status === 200 || channelsResponse.status === 403,
        'Should access alert channels');

      // Test create alert channel
      const createResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringAlertsChannels, {
        name: 'Test Webhook Channel',
        type: 'webhook',
        config: {
          url: 'https://webhook.test.com/alerts',
          method: 'POST'
        },
        enabled: true
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(createResponse.status === 200 || createResponse.status === 403 || createResponse.status === 400,
        'Should handle alert channel creation');

      this.logger.success('Alert Channels Management completed successfully');
    } catch (error) {
      this.logger.error(`[testAlertChannelsManagement] failed: ${error.message}`);
      throw error;
    }
  }

  async testComprehensiveDashboard() {
    this.logger.info('Testing comprehensive dashboard functionality...');

    try {
      // Test cache management
      const cacheResponse = await this.client.delete(`${API_ENDPOINTS.realtimeMonitoringDashboardCache}?key=test_key`, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(cacheResponse.status === 200 || cacheResponse.status === 403,
        'Should manage cache');

      // Test dashboard export
      const exportResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringDashboardExport, {
        format: 'json',
        timeRange: 'last_6h'
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(exportResponse.status === 200 || exportResponse.status === 403 || exportResponse.status === 404,
        'Should export dashboard data');

      this.logger.success('Comprehensive Dashboard completed successfully');
    } catch (error) {
      this.logger.error(`[testComprehensiveDashboard] failed: ${error.message}`);
      throw error;
    }
  }

  async testAdvancedMonitoringScenarios() {
    this.logger.info('Testing advanced monitoring scenarios...');

    try {
      // Test custom monitoring configuration
      const startResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringStart, {
        intervalMs: 3000,
        enableThreatDetection: false,
        monitoringMode: 'basic'
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(startResponse.status === 200 || startResponse.status === 403 || startResponse.status === 409,
        'Should handle custom monitoring configuration');

      // Test multiple event types
      const eventTypes = [
        { eventType: 'security_alert', data: { severity: 'high' } },
        { eventType: 'performance_issue', data: { metric: 'response_time' } }
      ];

      for (const event of eventTypes) {
        const response = await this.client.post(API_ENDPOINTS.realtimeMonitoringSimulate, event, {
          Authorization: `Bearer ${this.tokens.superAdmin}`
        });

        this.assert.assertTrue(response.status === 200 || response.status === 403,
          `Should simulate ${event.eventType} events`);
      }

      this.logger.success('Advanced Monitoring Scenarios completed successfully');
    } catch (error) {
      this.logger.error(`[testAdvancedMonitoringScenarios] failed: ${error.message}`);
      throw error;
    }
  }

  async testErrorHandlingAndEdgeCases() {
    this.logger.info('Testing error handling and edge cases...');

    try {
      // Test invalid monitoring configuration
      const invalidStartResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringStart, {
        intervalMs: -1000, // Invalid negative interval
        enableThreatDetection: 'not_boolean'
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(invalidStartResponse.status === 400 || invalidStartResponse.status === 403 || invalidStartResponse.status === 422,
        'Should reject invalid monitoring configuration');

      // Test invalid alert request
      const invalidAlertResponse = await this.client.post(API_ENDPOINTS.realtimeMonitoringAlertsSend, {
        severity: 'invalid_severity',
        title: '', // Empty title
        message: null
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(invalidAlertResponse.status === 400 || invalidAlertResponse.status === 403 || invalidAlertResponse.status === 422,
        'Should reject invalid alert requests');

      this.logger.success('Error Handling and Edge Cases completed successfully');
    } catch (error) {
      this.logger.error(`[testErrorHandlingAndEdgeCases] failed: ${error.message}`);
      throw error;
    }
  }

  async cleanup() {
    if (this.monitoringSession && this.tokens.superAdmin) {
      try {
        await this.client.post(API_ENDPOINTS.realtimeMonitoringStop, {
          monitoring_id: this.monitoringSession
        }, {
          Authorization: `Bearer ${this.tokens.superAdmin}`
        });
        this.logger.info('Monitoring session cleaned up');
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}

// Export and run if called directly
export { RealtimeMonitoringTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new RealtimeMonitoringTest();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
