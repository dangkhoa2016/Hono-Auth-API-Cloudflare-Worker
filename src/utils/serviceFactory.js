/**
 * Optimized Service factory helper functions
 * Creates services with shared config management and caching
*/

import { UserService } from '../services/userService.js';
import { AuthService } from '../services/authService.js';
import { DatabaseService } from '../services/databaseService.js';
import { RateLimitService } from '../services/rateLimitService.js';
import { AuditLogService } from '../services/auditLogService.js';
import { KVConfigService } from '../services/kvConfigService.js';
import { AuditAnalyticsService } from '../services/auditAnalyticsService.js';
import { AuditArchivalService } from '../services/auditArchivalService.js';
import { AuditMonitoringService } from '../services/auditMonitoringService.js';
import { AlertSystemService } from '../services/alertSystemService.js';
import { AuditDashboardService } from '../services/auditDashboardService.js';
import { SecurityIncidentResponseService } from '../services/securityIncidentResponseService.js';
import { TokenService } from '../services/tokenService.js';
import { TokenBlacklistService } from '../services/tokenBlacklistService.js';
import { TokenAuditService } from '../services/tokenAuditService.js';
import { serviceConfigManager } from './serviceConfigManager.js';

/**
 * Create UserService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {UserService} UserService instance
*/
export function createUserService(env) {
  return serviceConfigManager.getServiceInstance('UserService', UserService, env);
}

/**
 * Create AuthService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {AuthService} AuthService instance
*/
export function createAuthService(env) {
  return serviceConfigManager.getServiceInstance('AuthService', AuthService, env);
}

/**
 * Create DatabaseService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {DatabaseService} DatabaseService instance
*/
export function createDatabaseService(env) {
  return serviceConfigManager.getServiceInstance('DatabaseService', DatabaseService, env);
}

/**
 * Create RateLimitService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {RateLimitService} RateLimitService instance
*/
export function createRateLimitService(env) {
  return serviceConfigManager.getServiceInstance('RateLimitService', RateLimitService, env);
}

/**
 * Create TokenService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {TokenService} TokenService instance
*/
export function createTokenService(env) {
  return serviceConfigManager.getServiceInstance('TokenService', TokenService, env);
}

/**
 * Create TokenBlacklistService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {TokenBlacklistService} TokenBlacklistService instance
*/
export function createTokenBlacklistService(env) {
  return serviceConfigManager.getServiceInstance('TokenBlacklistService', TokenBlacklistService, env);
}

/**
 * Create TokenAuditService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {TokenAuditService} TokenAuditService instance
*/
export function createTokenAuditService(env) {
  return serviceConfigManager.getServiceInstance('TokenAuditService', TokenAuditService, env);
}

/**
 * Create AuditLogService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {AuditLogService} AuditLogService instance
*/
export function createAuditLogService(env) {
  return serviceConfigManager.getServiceInstance('AuditLogService', AuditLogService, env);
}

/**
 * Create KvConfigService with optimized config management
 * @param {Object} env - Environment context (contains DB and KV)
 * @returns {KVConfigService} KVConfigService instance
*/
export function createKvConfigService(env) {
  return serviceConfigManager.getServiceInstance('KVConfigService', KVConfigService, env);
}

/**
 * Create AuditAnalyticsService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {AuditAnalyticsService} AuditAnalyticsService instance
*/
export function createAuditAnalyticsService(env) {
  return serviceConfigManager.getServiceInstance('AuditAnalyticsService', AuditAnalyticsService, env);
}

/**
 * Create AuditArchivalService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {AuditArchivalService} AuditArchivalService instance
*/
export function createAuditArchivalService(env) {
  return serviceConfigManager.getServiceInstance('AuditArchivalService', AuditArchivalService, env);
}

/**
 * Create AuditMonitoringService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {AuditMonitoringService} AuditMonitoringService instance
*/
export function createAuditMonitoringService(env) {
  return serviceConfigManager.getServiceInstance('AuditMonitoringService', AuditMonitoringService, env);
}

/**
 * Create AlertSystemService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {AlertSystemService} AlertSystemService instance
*/
export function createAlertSystemService(env) {
  return serviceConfigManager.getServiceInstance('AlertSystemService', AlertSystemService, env);
}

/**
 * Create AuditDashboardService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {AuditDashboardService} AuditDashboardService instance
*/
export function createAuditDashboardService(env) {
  return serviceConfigManager.getServiceInstance('AuditDashboardService', AuditDashboardService, env);
}

/**
 * Create SecurityIncidentResponseService with optimized config management
 * @param {Object} env - Environment context (contains DB)
 * @returns {SecurityIncidentResponseService} SecurityIncidentResponseService instance
*/
export function createSecurityIncidentResponseService(env) {
  return serviceConfigManager.getServiceInstance('SecurityIncidentResponseService', SecurityIncidentResponseService, env);
}

/**
 * Pre-warm commonly used configurations
 * Call this during application startup for better performance
 * @param {Object} env - Environment context
*/
export async function preWarmServiceConfigs(env) {
  const commonConfigs = [
    'jwt',
    'rateLimit',
    'bcrypt',
    'featureFlags',
    'environment'
  ];

  await serviceConfigManager.preWarmConfigs(env, commonConfigs);
}

/**
 * Get service cache statistics (useful for monitoring)
 * @returns {Object} Cache statistics
*/
export function getServiceCacheStats() {
  return serviceConfigManager.getCacheStats();
}

/**
 * Clear all service caches (useful for testing or config refresh)
*/
export function clearServiceCaches() {
  serviceConfigManager.clearAllCache();
}
