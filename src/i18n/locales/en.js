/**
 * EN translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: 2025-12-16T04:10:26.732Z
*/

export default {
  'admin': {
    'accessLevel': {
      'full': "full system access",
      'limited': "limited access (admin level)"
    },
    'actions': {
      'permanentDeletion': "permanent account deletion"
    },
    'dataScope': {
      'full': "complete data",
      'limited': "filtered data"
    },
    'operations': {
      'adminDashboardAccess': "admin dashboard access",
      'adminRoutesAccess': "admin routes access",
      'createUser': "user creation",
      'deleteUser': "delete user #{{userId}}",
      'updateUser': "update user #{{userId}}"
    },
    'protectionReason': {
      'hierarchy': "Role hierarchy must be maintained",
      'higherPrivilege': "Cannot modify users with higher privileges",
      'roleChange': "Users cannot modify their own roles",
      'superAdmin': "Super Administrator accounts are protected"
    },
    'systemStatus': {
      'healthy': "HEALTHY",
      'unhealthy': "UNHEALTHY"
    },
    'accessDenied': "Admin access required for this operation",
    'accountDeletionSuggestion': "Contact another administrator for account management",
    'activeUsersCount': "{{count}} active user",
    'activeUsersCount_other': "{{count}} active users ({{percentage}})",
    'changedByUser': "Changed by {{username}} ({{role}})",
    'changesApplied': "{{count}} change applied",
    'changesApplied_other': "{{count}} changes applied",
    'checkedByUser': "Checked by {{username}} ({{role}})",
    'createdByUser': "Created by {{username}} ({{role}})",
    'dashboardDataRetrieved': "Dashboard loaded with {{totalUsers}} system overview ({{accessLevel}} access). {{requestedBy}} {{dataFreshness}}",
    'dashboardRetrieved': "Dashboard data retrieved successfully",
    'dataFreshness': "Generated at {{timestamp}}",
    'deletedByUser': "Deleted by {{username}} ({{role}})",
    'effectiveImmediately': "Changes effective immediately",
    'failedLoginAttempts': "{{count}} failed login in last hour",
    'failedLoginAttempts_other': "{{count}} failed logins in last hour",
    'performanceGrade': "Performance: {{grade}}",
    'requestedByUser': "Requested by {{username}} ({{role}})",
    'responseTime': "Response time: {{time}}{{unit}}",
    'restrictedRoleAccess': "Access denied: {{currentRole}} cannot view {{requestedRole}} users",
    'roleChangedSuccessfully': "Role changed from {{oldRole}} to {{newRole}} for {{targetUserName}}. {{changedBy}} {{timestamp}} {{effectiveImmediately}}",
    'routeDiscoverySuccess': "System routes retrieved successfully",
    'securityRisk': "Security risk: {{level}} ({{failedAttempts}})",
    'statisticsRetrieved': "System statistics: {{totalUsers}}, active users: {{activeUsers}} ({{dataScope}} scope). {{requestedBy}}",
    'statsRetrieved': "System statistics retrieved successfully",
    'systemHealthRetrieved': "System health check complete: {{healthStatus}} - {{responseTime}}, {{performanceGrade}}, {{securityRisk}}. {{checkedBy}} {{timestamp}}",
    'systemHealthRetrievedFailed': "Failed to retrieve system health information",
    'totalUsersCount': "{{count}} user total",
    'totalUsersCount_other': "{{count}} users total",
    'updatedByUser': "Updated by {{username}} ({{role}})",
    'userCreatedSuccessfully': "New user {{userName}} created with {{newUserRole}} role. {{createdBy}} {{timestamp}}",
    'userDeletedSuccessfully': "User account permanently deleted. {{deletedBy}} {{timestamp}} Action: {{action}}",
    'userDetailsRetrieved': "User details retrieved: {{userName}} ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}",
    'usersListRetrieved': "Successfully retrieved {{count}} user (showing {{displayedCount}} on page {{currentPage}} of {{totalPages}}). {{requestedBy}}",
    'usersListRetrieved_other': "Successfully retrieved {{count}} users (showing {{displayedCount}} on page {{currentPage}} of {{totalPages}}). {{requestedBy}}",
    'userUpdatedSuccessfully': "User {{updatedUserName}} updated successfully. {{changesCount}} {{updatedBy}} {{timestamp}}"
  },
  'api': {
    'databaseError': "Database error occurred",
    'healthCheck': "API is running smoothly",
    'methodNotAllowed': "Method not allowed",
    'routeNotFound': "Route not found",
    'validationError': "Validation error",
    'validationErrorDetails': "Validation failed: {{errorCount}} error",
    'validationErrorDetails_other': "Validation failed: {{errorCount}} errors"
  },
  'audit': {
    'access': {
      'full': "full system access",
      'limited': "limited access (role-based)"
    },
    'health': {
      'healthy': "HEALTHY",
      'suggestion_admin': "System health checks may be limited for your role.",
      'suggestion_super_admin': "Check system resources, database connectivity, and service status.",
      'systemCheck': "Full System Health Check",
      'unhealthy': "UNHEALTHY"
    },
    'logs': {
      'error': "Failed to retrieve audit logs",
      'suggestion_admin': "You can only view logs for regular users and your own actions.",
      'suggestion_super_admin': "You have full access to all audit logs in the system."
    },
    'operations': {
      'export': "export audit logs",
      'healthCheck': "audit system health check",
      'logsView': "view audit logs",
      'search': "search audit logs",
      'stats': "retrieve audit statistics"
    },
    'search': {
      'allFields': "all fields",
      'noQuery': "no query provided",
      'suggestion_admin': "Try searching with different terms or contact super admin for expanded access.",
      'suggestion_super_admin': "Try refining your search criteria or check system logs for issues."
    },
    'stats': {
      'suggestion_admin': "Statistics are filtered based on your access level. Contact super admin for full system statistics.",
      'suggestion_super_admin': "Check system health and database connectivity if statistics are unavailable."
    }
  },
  'auth': {
    'operations': {
      'export': "export audit logs",
      'healthCheck': "audit system health check",
      'login': "user login",
      'logsView': "view audit logs",
      'search': "search audit logs",
      'stats': "retrieve audit statistics"
    },
    'accountNotActive': "Account is not active",
    'cannotAccessOtherUsers': "Cannot access other users' resources",
    'cannotAccessSuperAdmin': "Cannot access Super Administrator resources",
    'cannotChangeAdminRole': "Cannot change role of other administrators",
    'cannotChangeOwnRole': "{{userName}} ({{currentRole}}) cannot change own role - {{reason}}",
    'cannotCreateAdmin': "Cannot create administrator accounts",
    'cannotCreateHigherRole': "{{currentRole}} cannot create {{requestedRole}} accounts due to role hierarchy restrictions",
    'cannotCreateSuperAdmin': "Cannot create Super Administrator accounts",
    'cannotDeleteOwnAccount': "{{userName}} ({{role}}) cannot delete own account. {{suggestion}}",
    'cannotDeleteSuperAdmin': "Cannot delete {{targetRole}} account - {{reason}} (attempted by {{currentRole}})",
    'cannotDeleteYourself': "Cannot delete your own account",
    'cannotModifyHigherRoleUser': "Cannot modify {{targetUserName}} ({{targetRole}}) - {{currentRole}} {{reason}}",
    'cannotModifySuperAdmin': "Cannot modify Super Administrator accounts",
    'cannotPromoteToHigherRole': "{{currentRole}} cannot promote users to {{requestedRole}} - {{reason}}",
    'cannotPromoteToSuperAdmin': "Cannot promote user to Super Administrator",
    'deleteNotAllowed': "Delete operation not allowed for your role",
    'forbidden': "Access forbidden - insufficient privileges",
    'invalidCredentials': "Invalid credentials",
    'invalidRole': "Invalid user role",
    'loginSuccess': "Login successful",
    'logoutAllSuccess': "Logged out from all devices successfully",
    'logoutSuccess': "Logout successful",
    'passwordIncorrect': "Password is incorrect",
    'rateLimitExceeded': "Too many failed login attempts. Please try again later.",
    'refreshSuccess': "Token refreshed successfully",
    'refreshTokenExpired': "Refresh token has expired",
    'refreshTokenInvalid': "Invalid refresh token",
    'superAdminRequired': "Super Administrator access required",
    'tokenExpired': "Token has expired",
    'tokenInvalid': "Invalid token",
    'unauthorized': "Unauthorized access",
    'userNotFound': "User not found or inactive"
  },
  'dates': {
    'changedAt': "Changed at {{date, datetime}}",
    'checkedAt': "Checked at {{date, datetime}}",
    'createdAt': "Created at {{date, datetime}}",
    'deletedAt': "Deleted at {{date, datetime}}",
    'updatedAt': "Updated at {{date, datetime}}",
    'userJoined': "Joined on {{date, date}}"
  },
  'endpoints': {
    'admin': {
      'changeRole': "Change user role (Super Admin access required)",
      'createUser': "Create new user (admin access required)",
      'dashboard': "Get comprehensive dashboard data (admin access required)",
      'deleteUser': "Delete user (Super Admin access required)",
      'stats': "Get system statistics (admin access required)",
      'systemHealth': "Get comprehensive system health status (admin access required)",
      'updateUser': "Update user information (admin access required)",
      'userDetails': "Get user details (admin access required)",
      'usersList': "List all users (admin access required)"
    },
    'advanced_audit': {
      'analytics': "Advanced audit analytics (admin access required)",
      'analyticsBehavior': "Behavior analytics (admin access required)",
      'analyticsPerformance': "Performance analytics (admin access required)",
      'analyticsSecurity': "Security analytics (admin access required)",
      'archival': "Audit log archival (admin access required)",
      'archivalRestore': "Restore archived logs (admin access required)",
      'archivalRun': "Run archival process (admin access required)",
      'archivalStats': "Archival statistics (admin access required)",
      'archiveManage': "Archive management (admin access required)",
      'compliance': "Compliance reporting (admin access required)",
      'complianceReport': "Generate compliance report (admin access required)",
      'exportAdvanced': "Advanced export (admin access required)",
      'middlewareStats': "Middleware statistics (admin access required)"
    },
    'audit': {
      'export': "Export audit logs (admin access required)",
      'logs': "View audit logs (admin access required)",
      'search': "Search audit logs (admin access required)",
      'stats': "Get audit statistics (admin access required)"
    },
    'auth': {
      'login': "Login with email and password",
      'logout': "Logout and invalidate tokens",
      'refresh': "Refresh access token"
    },
    'demo': {
      'info': "Zod validation demo information",
      'register': "User registration demo with comprehensive validation",
      'search': "Search demo with query parameter validation",
      'upload': "File upload demo with metadata validation"
    },
    'kv_admin': {
      'audit': {
        'alerts': "Get audit alert thresholds (Super Admin only)",
        'compliance': "Get audit compliance settings (Super Admin only)",
        'configs': "View audit system configurations (Super Admin only)",
        'export': "Get audit export settings (Super Admin only)",
        'features': "Get audit feature flags (Super Admin only)",
        'featureToggle': "Toggle an audit feature flag (Super Admin only)",
        'performance': "Get audit performance settings (Super Admin only)",
        'realtime': "Get real-time monitoring settings (Super Admin only)",
        'retention': "Get audit retention policies (Super Admin only)"
      },
      'config': "View KV configuration (Super Admin only)",
      'configBulk': "Bulk update KV configuration (Super Admin only)",
      'configCacheClear': "Clear KV configuration cache (Super Admin only)",
      'configDefaults': "Get default KV configuration (Super Admin only)",
      'configDelete': "Delete KV configuration key (Super Admin only)",
      'configEnvComparison': "Compare KV configuration across environments (Super Admin only)",
      'configGet': "Get specific KV configuration (Super Admin only)",
      'configs': "View KV configurations (Super Admin only)",
      'configsBatch': "Batch update KV configurations (Super Admin only)",
      'configsCacheClear': "Clear KV configurations cache (Super Admin only)",
      'configsDefaults': "Get default KV configurations (Super Admin only)",
      'configsEnvComparison': "Compare KV configurations across environments (Super Admin only)",
      'configUpdate': "Update KV configuration (Super Admin only)"
    },
    'realtime_monitoring': {
      'alerts': "System alerts management (admin access required)",
      'alertsChannels': "Manage alert channels (admin access required)",
      'alertsChannelsCreate': "Create alert channel (admin access required)",
      'alertsConfigure': "Configure system alerts (admin access required)",
      'alertsHistory': "Get alerts history (admin access required)",
      'alertsRules': "Manage alert rules (admin access required)",
      'alertsRulesCreate': "Create alert rule (admin access required)",
      'alertsRuleToggle': "Enable/disable alert rule (admin access required)",
      'alertsSend': "Send system alert (admin access required)",
      'alertsStatus': "Get alerts status (admin access required)",
      'alertsTest': "Test alert system (admin access required)",
      'analyze': "Analyze monitoring data (admin access required)",
      'dashboard': "Real-time monitoring dashboard (admin access required)",
      'dashboardCache': "Clear dashboard cache (admin access required)",
      'dashboardExport': "Export dashboard data (admin access required)",
      'dashboardHealth': "Dashboard health check (admin access required)",
      'dashboardLive': "Live dashboard snapshot (admin access required)",
      'dashboardOverview': "Dashboard overview (admin access required)",
      'dashboardPerformance': "Performance dashboard (admin access required)",
      'dashboardRealtime': "Live dashboard data (admin access required)",
      'dashboardSecurity': "Security dashboard (admin access required)",
      'dashboardTimeline': "Dashboard timeline (admin access required)",
      'eventsRecent': "Get recent monitoring events (admin access required)",
      'incidentsCreate': "Create realtime monitoring incident (admin access required)",
      'metrics': "Real-time system metrics (admin access required)",
      'resolveThreat': "Resolve detected threat (admin access required)",
      'simulate': "Simulate monitoring scenarios (admin access required)",
      'start': "Start real-time monitoring (admin access required)",
      'status': "Get monitoring status (admin access required)",
      'stop': "Stop real-time monitoring (admin access required)",
      'threats': "Get threat information (admin access required)"
    },
    'security_incident': {
      'bulkDelete': "Bulk delete {{count}} security incidents (admin {{actor}} access required)",
      'create': "Create new security incident (admin {{actor}} access required, type {{type}}, severity {{severity}})",
      'deleteById': "Delete security incident {{incidentId}} (admin {{actor}} access required)",
      'exportCsv': "Export {{count}} security incidents to CSV (admin {{actor}} access required, date range: {{dateRange}})",
      'getById': "Get security incident by ID {{incidentId}} (admin {{actor}} access required)",
      'getDashboard': "Get security incident dashboard (admin {{actor}} access required, filters: {{filters}})",
      'getStatistics': "Get security incident statistics (admin {{actor}} access required, period: {{period}})",
      'incidentDetails': "Get incident details (admin access required)",
      'incidentResponse': "Execute incident response (admin access required)",
      'incidents': "List security incidents (admin access required)",
      'incidentsCreate': "Create security incident (admin access required)",
      'incidentStatus': "Update incident status (admin access required)",
      'incidentUpdate': "Update incident (admin access required)",
      'list': "List security incidents (admin {{actor}} access required, page {{page}}, limit {{limit}})",
      'serviceStatus': "Get service status (admin access required)",
      'simulate': "Simulate security incident (admin access required)",
      'statistics': "Get incident statistics (admin access required)",
      'updateById': "Update security incident {{incidentId}} (admin {{actor}} access required, updated fields: {{fields}})",
      'updateStatus': "Update security incident {{incidentId}} status to {{status}} (admin {{actor}} access required)"
    },
    'system': {
      'apiInfo': "Comprehensive API information and endpoints",
      'favicon': "Favicon and icon resources",
      'health': "Health check endpoint",
      'language': "Language switcher endpoint",
      'root': "API root endpoint - welcome message",
      'routes': "System route discovery (admin only)",
      'unknown': "Unknown endpoint",
      'version': "API version information"
    },
    'translations': {
      'get': "Get all translations for a specific language",
      'list': "List all available languages and their validation status",
      'section': "Get specific section translations",
      'validate': "Validate translation completeness"
    },
    'user': {
      'me': "Get current user info (requires authentication)",
      'profile': "Get user profile (requires authentication)",
      'register': "Register new user",
      'updatePassword': "Change password (requires authentication)",
      'updateProfile': "Update user profile (requires authentication)"
    }
  },
  'errors': {
    'admin': {
      'accessDenied': "Admin access required for this operation",
      'dashboardRetrieveFailed': "Failed to retrieve admin dashboard data",
      'permissionDenied': "Insufficient admin permissions for this operation",
      'roleChangeFailed': "Failed to change user role",
      'statsRetrieveFailed': "Failed to retrieve admin statistics",
      'systemHealthRetrieveFailed': "Failed to retrieve system health information",
      'userManagementFailed': "User management operation failed"
    },
    'advancedAudit': {
      'analytics': {
        'failed': "Failed to retrieve analytics data - {{actor}} unable to complete {{operation}} for {{timeframe}} timeframe: {{reason}}"
      },
      'archival': {
        'archiveOperationFailed': "Failed to perform archive operation - {{actor}} unable to complete {{operation}} ({{action}}): {{reason}}",
        'restoreFailed': "Failed to restore archived logs - {{actor}} unable to perform {{operation}} for {{dateRange}}: {{reason}}",
        'runFailed': "Failed to run archival process - {{actor}} unable to complete {{operation}} with {{cutoffDays}} cutoff: {{reason}}",
        'statsFailed': "Failed to retrieve archival statistics - {{actor}} unable to perform {{operation}}: {{reason}}"
      },
      'behavior': {
        'failed': "Failed to retrieve behavior analytics - {{actor}} unable to complete {{operation}} for {{timeframe}} targeting {{targetRole}}: {{reason}}"
      },
      'compliance': {
        'customComplianceFailed': "Failed to create custom compliance report - {{actor}} unable to complete {{operation}} for \"{{reportName}}\" ({{reportType}}): {{reason}}",
        'failed': "Failed to generate compliance report - {{actor}} unable to complete {{operation}} for {{timeframe}} in {{format}} format: {{reason}}",
        'reportFailed': "Failed to generate compliance report - {{actor}} unable to perform {{operation}} for {{type}} report: {{reason}}"
      },
      'export': {
        'failed': "Failed to perform advanced export - {{actor}} unable to complete {{operation}} in {{format}} format ({{recordCount}} records): {{reason}}"
      },
      'middleware': {
        'statsFailed': "Failed to retrieve middleware statistics - {{actor}} unable to perform {{operation}} for {{middlewareType}}: {{reason}}"
      },
      'performance': {
        'failed': "Failed to retrieve performance analytics - {{actor}} ({{role}}) unable to perform {{operation}} for {{timeframe}}: {{reason}}"
      },
      'security': {
        'failed': "Failed to retrieve security analytics - {{actor}} ({{role}}) unable to perform {{operation}} for {{timeframe}}: {{reason}}"
      }
    },
    'api': {
      'databaseError': "Database error in API call: {{operation}}",
      'methodNotAllowed': "HTTP method {{method}} not allowed for route {{path}}",
      'routeNotFound': "API route not found: {{method}} {{path}}",
      'validationError': "API validation error: {{details}}"
    },
    'audit': {
      'export': {
        'exportFailed': "Failed to export audit logs - {{actor}} unable to complete {{operation}} in {{format}} format: {{reason}}"
      },
      'health': {
        'healthFailed': "Failed to check audit system health - {{actor}} unable to perform {{operation}} ({{checkType}}): {{reason}}"
      },
      'logs': {
        'retrieveFailed': "Failed to retrieve audit logs - {{actor}} encountered error while performing {{operation}}: {{reason}}"
      },
      'search': {
        'searchFailed': "Failed to search audit logs - {{actor}} unable to complete {{operation}} with query \"{{query}}\": {{reason}}"
      },
      'stats': {
        'statsFailed': "Failed to retrieve audit statistics - {{actor}} ({{role}}) unable to perform {{operation}}: {{reason}}"
      }
    },
    'auth': {
      'accountDisabled': "User account {{userName}} is disabled by administrator",
      'accountLocked': "Account locked for {{duration, time}} due to failed login attempts",
      'accountNotVerified': "Email address for {{userName}} is not verified",
      'cannotAccessOtherUsers': "Cannot access other users' resources",
      'cannotChangeOwnRole': "{{userName}} ({{currentRole}}) cannot change own role - {{reason}}",
      'cannotCreateHigherRole': "Cannot create a user with a higher role than yours",
      'cannotDeleteSuperAdmin': "Cannot delete Super Administrator account",
      'cannotDeleteYourself': "You cannot delete your own account",
      'cannotModifyHigherRoleUser': "Cannot modify a user with higher role privileges",
      'cannotPromoteToHigherRole': "Cannot promote user to a higher role ({{requestedRole}}) from {{currentRole}} - {{reason}}",
      'deleteNotAllowed': "Delete operation not allowed for your role",
      'failed': "Authentication failed: {{reason}}",
      'failed_other': "{{count}} authentication attempts failed in the last {{timeWindow}}",
      'forbidden': "Access forbidden - insufficient privileges for {{operation}}",
      'invalidCredentials': "Invalid email or password provided",
      'invalidCredentials_context_admin': "Invalid credentials provided for administrative account login",
      'invalidCredentials_context_user': "Invalid credentials provided for user account login",
      'loginFailed': "Login process failed for {{actor}} (Reason: {{reason}}, Operation: {{operation}}, IP: {{ipAddress}})",
      'mfaFailed': "Multi-factor authentication failed: {{reason}}",
      'mfaRequired': "Multi-factor authentication is required for {{userName}}",
      'passwordIncorrect': "Password is incorrect for user {{userName}}",
      'permissionDenied': "Permission denied for action: {{action}}",
      'rateLimitExceeded': "Rate limit exceeded: {{currentRequests}}/{{maxRequests}} requests per {{timeWindow}}",
      'refreshTokenExpired': "Refresh token expired at {{expiredAt, datetime}}",
      'refreshTokenFailed': "Token refresh failed for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'refreshTokenInvalid': "Invalid or revoked refresh token",
      'roleRequired': "{{requiredRole}} role required for this operation",
      'sessionExpired': "User session expired at {{expiredAt, datetime}}",
      'sessionInvalid': "Invalid or corrupted user session",
      'superAdminRequired': "Super Administrator access required",
      'tokenExpired': "Authentication token expired at {{expiredAt, datetime}}",
      'tokenInvalid': "Invalid or malformed authentication token",
      'tokenMissing': "Authentication token is required but not provided",
      'tooManyAttempts': "Too many failed login attempts ({{attemptCount}}) from {{ipAddress}}",
      'tooManyAttempts_other': "Too many failed login attempts ({{attemptCount}} attempts) from {{ipAddress}}",
      'unauthorized': "Unauthorized access to resource: {{resource}}",
      'userNotFound': "No account found with email {{email}}"
    },
    'business': {
      'businessHoursOnly': "Operation only allowed during business hours ({{businessHours}})",
      'conflictingOperation': "Conflicting operation in progress: {{operation}}",
      'deadlineExpired': "Operation deadline expired on {{deadline, datetime}}",
      'duplicateEntry': "Duplicate entry detected: {{entity}} with {{field}} = \"{{value}}\"",
      'insufficientBalance': "Insufficient balance: {{available, currency}} available, {{required, currency}} required",
      'operationNotAllowed': "Operation \"{{operation}}\" is not allowed: {{reason}}",
      'preconditionFailed': "Precondition failed: {{condition}}",
      'quotaReached': "Quota limit reached: {{used, number}}/{{limit, number}} {{resource}}",
      'referenceConstraint': "Cannot delete {{entity}} - referenced by {{referencingCount}} other record",
      'referenceConstraint_other': "Cannot delete {{entity}} - referenced by {{referencingCount}} other records",
      'resourceLocked': "Resource \"{{resource}}\" is locked by {{lockedBy}} until {{lockedUntil, datetime}}",
      'workflowViolation': "Workflow violation: {{step}} cannot be performed in current state {{currentState}}"
    },
    'file': {
      'accessDenied': "Access denied to file \"{{filename}}\": {{reason}}",
      'corrupted': "File appears to be corrupted or incomplete",
      'formatUnsupported': "File format not supported for operation: {{operation}}",
      'invalidType': "File type \"{{fileType}}\" is not allowed - supported types: {{allowedTypes}}",
      'notFound': "File \"{{filename}}\" not found",
      'processingFailed': "File processing failed: {{reason}}",
      'quotaExceeded': "Storage quota exceeded: {{used, number}}MB / {{quota, number}}MB",
      'tooLarge': "File size {{actualSize, number}}MB exceeds {{maxSize, number}}MB limit",
      'tooSmall': "File size {{actualSize, number}} bytes is below {{minSize, number}} bytes minimum",
      'uploadFailed': "File upload failed: {{reason}}",
      'virusDetected': "File blocked by security scan: {{threat}}"
    },
    'i18n': {
      'context_demo_failed': "Failed to run contextual translation demonstration: {{reason}}",
      'context_test_failed': "Failed to test contextual translations for key \"{{key}}\": {{reason}}",
      'enhanced_demo_failed': "Failed to run enhanced i18n features demonstration: {{reason}}",
      'error_demo_failed': "Failed to run error messages demonstration: {{reason}}",
      'formatting_demo_failed': "Failed to run formatting demonstration: {{reason}}",
      'formatting_test_failed': "Failed to test formatting functionality for key \"{{key}}\": {{reason}}",
      'languageNotSupported': "Language \"{{language}}\" is not supported. Available languages: {{supportedLanguages}}",
      'plurals_demo_failed': "Failed to run pluralization demonstration: {{reason}}",
      'plurals_test_failed': "Failed to test pluralization functionality for key \"{{key}}\": {{reason}}",
      'sectionNotFound': "Translation section \"{{section}}\" not found for language \"{{language}}\"",
      'success_demo_failed': "Failed to run success messages demonstration: {{reason}}",
      'translationsFailed': "Failed to retrieve translation information: {{reason}}"
    },
    'integration': {
      'apiLimitExceeded': "API rate limit exceeded for {{serviceName}}: {{limit}} requests per {{period}}",
      'authenticationFailed': "Authentication failed with {{serviceName}}: {{reason}}",
      'credentialsExpired': "API credentials for {{serviceName}} expired on {{expiredDate, date}}",
      'dataTransformFailed': "Data transformation failed for {{serviceName}}: {{reason}}",
      'invalidResponse': "Invalid response from {{serviceName}}: {{details}}",
      'serviceDown': "External service {{serviceName}} is currently down",
      'syncFailed': "Data synchronization failed with {{serviceName}}: {{reason}}",
      'webhookTimeout': "Webhook timeout from {{serviceName}} after {{timeout, number}}ms"
    },
    'kv': {
      'accessDenied': "Access denied for configuration key \"{{key}}\" - requires {{requiredRole}} role",
      'alertThresholdsRetrieveFailed': "Failed to retrieve alert thresholds: {{reason}}",
      'auditConfigsRetrieveFailed': "Failed to retrieve audit configurations: {{reason}}",
      'batchUpdateFailed': "Batch update failed for {{failedCount}} out of {{totalCount}} configuration",
      'batchUpdateFailed_other': "Batch update failed for {{failedCount}} out of {{totalCount}} configurations",
      'cacheClearFailed': "Failed to clear configuration cache: {{reason}}",
      'cacheFailed': "Failed to update configuration cache: {{reason}}",
      'complianceSettingsRetrieveFailed': "Failed to retrieve compliance settings: {{reason}}",
      'configResetFailed': "Failed to reset configuration \"{{key}}\": {{reason}}",
      'configRetrieveFailed': "Failed to retrieve configuration \"{{key}}\": {{reason}}",
      'configsCompareFailed': "Failed to retrieve environment comparison: {{reason}}",
      'configsRetrieveFailed': "Failed to retrieve configurations: {{reason}}",
      'configUpdateFailed': "Failed to update configuration \"{{key}}\": {{reason}}",
      'exportSettingsRetrieveFailed': "Failed to retrieve export settings: {{reason}}",
      'featureFlagsRetrieveFailed': "Failed to retrieve feature flags: {{reason}}",
      'featureNotFound': "Feature not found or not allowed",
      'featureToggleFailed': "Failed to toggle feature \"{{feature}}\": {{reason}}",
      'invalidFeatureValue': "Invalid feature value - must be boolean",
      'invalidKey': "Configuration key \"{{key}}\" is not allowed - valid keys: {{validKeys}}",
      'keyNotFound': "Configuration key \"{{key}}\" not found",
      'performanceSettingsRetrieveFailed': "Failed to retrieve performance settings: {{reason}}",
      'realtimeSettingsRetrieveFailed': "Failed to retrieve real-time monitoring settings: {{reason}}",
      'resetFailed': "Failed to reset configuration \"{{key}}\" to default value: {{reason}}",
      'retentionPoliciesRetrieveFailed': "Failed to retrieve retention policies: {{reason}}",
      'updateFailed': "Failed to update configuration \"{{key}}\": {{reason}}",
      'valueInvalid': "Invalid value for configuration \"{{key}}\": expected {{expectedType}}, got {{actualType}}"
    },
    'kvAdmin': {
      'alertThresholdsRetrieveFailed': "Failed to retrieve alert thresholds for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'auditConfigsRetrieveFailed': "Failed to retrieve audit configurations for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'cacheClearFailed': "Failed to clear KV configuration cache for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'complianceSettingsRetrieveFailed': "Failed to retrieve compliance settings for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'configResetFailed': "Failed to reset KV configuration {{key}} for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'configRetrieveFailed': "Failed to retrieve KV configuration {{key}} for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'configsCompareFailed': "Failed to compare ENV vs KV configurations for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'configsRetrieveFailed': "Failed to retrieve KV configurations for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'configUpdateFailed': "Failed to update KV configuration {{key}} for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'exportSettingsRetrieveFailed': "Failed to retrieve export settings for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'featureFlagsRetrieveFailed': "Failed to retrieve feature flags for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'featureToggleFailed': "Failed to toggle feature {{feature}} for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'performanceSettingsRetrieveFailed': "Failed to retrieve performance settings for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'realtimeSettingsRetrieveFailed': "Failed to retrieve realtime settings for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
      'retentionPoliciesRetrieveFailed': "Failed to retrieve retention policies for {{actor}} (Reason: {{reason}}, Operation: {{operation}})"
    },
    'network': {
      'apiError': "External API error from {{apiName}}: {{error}}",
      'bandwidthExceeded': "Bandwidth limit exceeded: {{usage, number}}MB/{{limit, number}}MB",
      'connectionFailed': "Connection failed to {{service, uppercase}}: {{reason}}",
      'connectionRefused': "Connection refused by {{service}} on port {{port}}",
      'dnsResolutionFailed': "DNS resolution failed for {{hostname}}",
      'hostUnreachable': "Host {{hostname}} is unreachable",
      'httpError': "HTTP error {{statusCode}}: {{statusMessage}}",
      'protocolError': "Network protocol error: {{protocol}} - {{details}}",
      'proxyError': "Proxy server error: {{proxyAddress}} - {{reason}}",
      'slowResponse': "Slow response detected from {{service}} ({{duration, number}}ms)",
      'socketError': "Socket connection error: {{details}}",
      'sslError': "SSL/TLS connection error: {{details}}",
      'timeout': "Network request timeout after {{duration, number}}ms to {{service}}",
      'webhookFailed': "Webhook delivery failed to {{url}}: {{reason}}"
    },
    'realtimeMonitoring': {
      'alerts': {
        'channelsFailed': "Failed to retrieve alert channels for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'createChannelFailed': "Failed to create alert channel for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'createRuleFailed': "Failed to create alert rule for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'historyFailed': "Failed to retrieve alert history for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'rulesFailed': "Failed to retrieve alert rules for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'sendFailed': "Failed to send manual alert for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'statusFailed': "Failed to retrieve alert system status for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'testFailed': "Failed to test alert system for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'toggleFailed': "Failed to toggle alert rule {{ruleId}} for {{actor}} (Reason: {{reason}}, Operation: {{operation}})"
      },
      'alertsConfig': {
        'configFailed': "Failed to configure alerts for {{actor}} (Reason: {{reason}}, Operation: {{operation}})"
      },
      'dashboard': {
        'cacheClearFailed': "Failed to clear dashboard cache due to server error",
        'exportFailed': "Failed to export dashboard due to server error",
        'healthCheckFailed': "Failed to perform dashboard health check due to server error",
        'overviewFailed': "Failed to retrieve dashboard overview for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'performanceFailed': "Failed to retrieve performance dashboard due to server error",
        'realtimeFailed': "Failed to retrieve realtime dashboard for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'securityFailed': "Failed to retrieve security dashboard for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'timelineFailed': "Failed to retrieve dashboard timeline for {{actor}} (Reason: {{reason}}, Operation: {{operation}})"
      },
      'incidents': {
        'createFailed': "Failed to create realtime monitoring incident for {{actor}} (Reason: {{reason}}, Operation: {{operation}})"
      },
      'monitoring': {
        'eventsFailed': "Failed to retrieve recent monitoring events for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'simulateFailed': "Failed to simulate monitoring event for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'startFailed': "Failed to start monitoring for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'statusFailed': "Failed to retrieve monitoring status for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'stopFailed': "Failed to stop monitoring for {{actor}} (Reason: {{reason}}, Operation: {{operation}})"
      },
      'threats': {
        'analyzeFailed': "Failed to analyze threats for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'resolveFailed': "Failed to resolve threat {{threatId}} for {{actor}} (Reason: {{reason}}, Operation: {{operation}})",
        'retrieveFailed': "Failed to retrieve threat status for {{actor}} (Reason: {{reason}}, Operation: {{operation}})"
      }
    },
    'security': {
      'incident': {
        'notFound': "Security incident not found (ID: {{incidentId}}, Operation: {{operation}}, Requested by: {{requestedBy}})"
      },
      'incidents': {
        'createFailed': "Failed to create security incident due to server error.",
        'responseExecuteFailed': "Failed to execute manual response for security incident due to server error.",
        'retrieveDetailFailed': "Failed to retrieve security incident details due to server error.",
        'retrieveFailed': "Failed to retrieve security incidents due to server error.",
        'simulationFailed': "Failed to simulate security threat due to server error.",
        'simulationNotAllowed': "Security simulation not allowed in {{environment}} environment (Requested by: {{requestedBy}}, Reason: {{reason}})",
        'statusUpdateFailed': "Failed to update security incident status due to server error."
      },
      'monitoring': {
        'alreadyRunning': "Security monitoring is already running"
      },
      'service': {
        'statusRetrieveFailed': "Failed to retrieve security service status due to server error."
      },
      'statistics': {
        'retrieveFailed': "Failed to retrieve incident statistics due to server error."
      }
    },
    'system': {
      'cacheError': "Cache operation failed: {{operation}} - {{error}}",
      'configurationError': "System configuration error: {{setting}} - {{error}}",
      'databaseConnectionFailed': "Failed to connect to database: {{reason}}",
      'databaseError': "Database operation failed: {{operation}} - {{error}}",
      'databaseTimeout': "Database query timeout after {{timeout, number}}ms",
      'dependencyFailure': "External dependency failure: {{service}} - {{reason}}",
      'diskSpaceLow': "Disk space critically low: {{freeSpace, number}}GB remaining",
      'licenseExpired': "System license expired on {{expiredDate, date}}",
      'licenseInvalid': "Invalid system license: {{reason}}",
      'maintenanceMode': "System is under maintenance until {{endTime, datetime}} - {{message}}",
      'memoryExhausted': "Server memory usage critical: {{currentUsage, number}}MB / {{maxMemory, number}}MB",
      'operationFailed': "System operation \"{{operation}}\" failed: {{reason}}",
      'rateLimited': "System temporarily rate limited: {{currentRequests}}/{{maxRequests}} requests in {{timeWindow}}",
      'resourceExhausted': "System resources exhausted: {{resource}} at {{usage, number}}% capacity",
      'serverError': "Internal server error occurred",
      'serviceUnavailable': "Service temporarily unavailable: {{reason}}",
      'taskQueueFull': "Task queue is full ({{currentTasks}}/{{maxTasks}} tasks)",
      'workerUnavailable': "No available workers to process request"
    },
    'user': {
      'accountLocked': "User account {{userName}} is locked due to {{reason}}",
      'accountSuspended': "User account {{userName}} is suspended until {{suspendedUntil, datetime}}",
      'activationFailed': "Failed to activate user account for {{userName}}: {{reason}}",
      'bulkOperationFailed': "Bulk operation failed for {{failedCount}} out of {{totalCount}} user",
      'bulkOperationFailed_other': "Bulk operation failed for {{failedCount}} out of {{totalCount}} users",
      'createFailed': "Failed to create user account for {{email}}: {{reason}}",
      'deactivationFailed': "Failed to deactivate user account for {{userName}}: {{reason}}",
      'deleteFailed': "Failed to delete user {{userName}}: {{reason}}",
      'emailExists': "Email address {{email}} is already registered in the system",
      'inactive': "User account {{userName}} is inactive",
      'insufficientPermissions': "Insufficient permissions to modify user {{userName}} ({{userRole}})",
      'listFailed': "Failed to retrieve users list: {{reason}}",
      'notFound': "User \"{{userName}}\" not found or has been deleted",
      'notFoundById': "User with ID {{userId}} not found",
      'passwordChangeFailed': "Failed to change password for {{userName}}: {{reason}}",
      'passwordIncorrect': "Current password is incorrect - please try again",
      'profileRetrieveFailed': "Failed to retrieve user profile for {{userName}}: {{reason}}",
      'registrationError': "User registration failed due to system error: {{details}}",
      'registrationFailed': "User registration failed: {{reason}}",
      'roleChangeFailed': "Failed to change role for {{userName}} from {{oldRole}} to {{newRole}}: {{reason}}",
      'sessionLimitExceeded': "User {{userName}} has exceeded maximum concurrent sessions ({{currentSessions}}/{{maxSessions}})",
      'updateFailed': "Failed to update user profile for {{userName}}: {{reason}}",
      'usernameExists': "Username \"{{username}}\" is already taken"
    },
    'zodDemo': {
      'file': {
        'uploadFailed': "File upload failed - {{actor}} could not complete {{operation}} for \"{{fileName}}\" ({{fileSize}} bytes): {{reason}}"
      },
      'search': {
        'failed': "Search operation failed - {{actor}} could not complete {{operation}} for query \"{{query}}\" ({{searchType}}): {{reason}}"
      },
      'user': {
        'registrationFailed': "User registration failed - {{actor}} could not complete {{operation}} for {{userName}} ({{email}}): {{reason}}"
      }
    },
    'businessRuleViolation': "Business rule violation: {{rules}}",
    'constraintViolation': "Database constraint violation: {{constraint}}",
    'dataIntegrityError': "Data integrity error: {{details}}",
    'schemaViolation': "Data schema violation: {{violations}}",
    'validation': "Validation error - {{details}}",
    'validation_other': "{{count}} validation errors - {{details}}",
    'validationField': "Validation failed for field \"{{field}}\": {{error}}",
    'validationGeneric': "Validation error",
    'validationMultiple': "Multiple validation errors in {{count}} field",
    'validationMultiple_other': "Multiple validation errors in {{count}} fields"
  },
  'formatting': {
    'currency': "Total: {{amount, currency}}",
    'dateRange': "From {{startDate, date}} to {{endDate, date}}",
    'filesSize': "{{count}} file of {{size, number}} bytes",
    'filesSize_other': "{{count}} files totaling {{size, number}} bytes",
    'percentage': "Progress: {{value, number}}%",
    'timeAgo': "{{time, time}} ago"
  },
  'numbers': {
    'count': "{{value, number}}",
    'currency': "${{value, number}}",
    'percentage': "{{value}}%"
  },
  'roles': {
    'displayName': "Role",
    'displayName_context_admin': "Administrator",
    'displayName_context_super_admin': "Super Administrator",
    'displayName_context_user': "User"
  },
  'security': {
    'alerts': {
      'alertTemplate': "Alert: {{name}} - {{eventType}}",
      'channelCreated': "Alert channel created successfully",
      'channelsFailed': "Failed to retrieve alert channels",
      'createChannelFailed': "Failed to create alert channel",
      'createRuleFailed': "Failed to create alert rule",
      'historyFailed': "Failed to retrieve alert history",
      'manualSent': "Manual alert sent successfully",
      'ruleCreated': "Alert rule created successfully",
      'rulesFailed': "Failed to retrieve alert rules",
      'ruleToggled': "Alert rule toggled successfully",
      'ruleToggledTestMode': "Rule toggled successfully (test mode)",
      'sendFailed': "Failed to send manual alert",
      'statusFailed': "Failed to retrieve alert system status",
      'testCompleted': "Alert system test completed",
      'testFailed': "Failed to test alert system",
      'toggleFailed': "Failed to toggle alert rule"
    }
  },
  'success': {
    'admin': {
      'backupCompleted': "System backup completed successfully ({{backupSize, number}}MB in {{duration, number}}s)",
      'backupRestored': "System backup restored successfully from {{backupDate, date}}",
      'cacheCleared': "System cache cleared successfully - {{freedMemory, number}}MB freed",
      'configurationUpdated': "System configuration updated successfully - {{changedSettings}} setting modified",
      'configurationUpdated_other': "System configuration updated successfully - {{changedSettings}} settings modified",
      'databaseOptimized': "Database optimization completed - {{optimizedTables}} table processed",
      'databaseOptimized_other': "Database optimization completed - {{optimizedTables}} tables processed",
      'logRotationCompleted': "Log rotation completed - {{archivedLogs}} log file archived",
      'logRotationCompleted_other': "Log rotation completed - {{archivedLogs}} log files archived",
      'maintenanceCompleted': "System maintenance completed successfully - downtime: {{downtimeDuration}}",
      'maintenanceScheduled': "System maintenance scheduled for {{maintenanceDate, date}} at {{maintenanceTime, time}}",
      'reportCreated': "Administrative report created with {{recordCount, number}} record",
      'reportCreated_other': "Administrative report created with {{recordCount, number}} records",
      'securityScanCompleted': "Security scan completed - {{threatsFound}} threat detected",
      'securityScanCompleted_other': "Security scan completed - {{threatsFound}} threats detected",
      'serviceRestarted': "System service {{serviceName}} restarted successfully",
      'statsGenerated': "System statistics generated successfully for {{period}} period - {{dataPoints}} data point",
      'statsGenerated_other': "System statistics generated successfully for {{period}} period - {{dataPoints}} data points",
      'systemHealthy': "System health check completed: {{status, uppercase}} ({{uptime, number}}% uptime)",
      'userDetailsRetrieved': "User details retrieved: {{userName}} ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}"
    },
    'advancedAudit': {
      'analytics': {
        'retrieved': "Advanced audit analytics retrieved successfully"
      },
      'archival': {
        'restoreCompleted': "Archival restore operation completed successfully with {{restoredCount}} restored and {{skippedCount}} skipped",
        'runCompleted': "Archival process completed successfully with {{archivedCount}} archived and {{remainingCount}} remaining",
        'statsRetrieved': "Archival statistics retrieved successfully"
      },
      'behavior': {
        'analyzed': "User behavior analysis completed successfully"
      },
      'compliance': {
        'generated': "Compliance audit report generated successfully"
      },
      'performance': {
        'analyzed': "Performance audit analysis completed successfully"
      },
      'security': {
        'analyzed': "Security audit analysis completed successfully"
      }
    },
    'auditMessages': {
      'exported': "Audit logs exported successfully",
      'healthRetrieved': "Audit system health retrieved successfully",
      'retrieved': "Audit messages retrieved successfully",
      'searchCompleted': "Audit search completed successfully with {{resultCount}} result",
      'searchCompleted_other': "Audit search completed successfully with {{resultCount}} results",
      'statsRetrieved': "Audit statistics retrieved successfully"
    },
    'auth': {
      'accessGranted': "Access granted to {{resource}} for {{userName}}",
      'accountUnlocked': "Account {{userName}} unlocked successfully by {{unlockedBy}}",
      'loginSuccess': "Successfully logged in as {{userName}} ({{userRole}}) at {{loginTime}}",
      'logoutAllSuccess': "Logged out from all devices at {{logoutTime}}",
      'logoutSuccess': "Successfully logged out from {{deviceInfo}} at {{logoutTime}}",
      'mfaEnabled': "Multi-factor authentication enabled successfully for {{userName}}",
      'mfaVerified': "Multi-factor authentication verified successfully",
      'passwordChanged': "Password changed successfully for {{userName}} at {{changeTime}}",
      'passwordReset': "Password reset email sent to {{email}} - expires in {{expiryMinutes}} minute",
      'passwordReset_other': "Password reset email sent to {{email}} - expires in {{expiryMinutes}} minutes",
      'permissionGranted': "Permission \"{{permission}}\" granted to {{userName}}",
      'rateLimitReset': "Rate limit reset successfully for {{ipAddress}}",
      'roleAssigned': "Role {{newRole}} assigned successfully to {{userName}} by {{assignedBy}}",
      'sessionCreated': "New user session created with {{sessionDuration}} minute validity",
      'sessionCreated_other': "New user session created with {{sessionDuration}} minutes validity",
      'sessionExtended': "User session extended until {{newExpiry}}",
      'tokenGenerated': "New access token generated - expires at {{expiryTime}}",
      'tokenRefreshed': "Authentication token refreshed successfully at {{refreshTime}}"
    },
    'business': {
      'auditPassed': "Business audit passed with score {{auditScore, number}}% - {{criteriaCount}} criterion met",
      'auditPassed_other': "Business audit passed with score {{auditScore, number}}% - {{criteriaCount}} criteria met",
      'complianceVerified': "Compliance verification completed - {{standardsCount}} standard verified",
      'complianceVerified_other': "Compliance verification completed - {{standardsCount}} standards verified",
      'operationApproved': "Business operation \"{{operation}}\" approved by {{approvedBy}}",
      'processAutomated': "Business process automated successfully - {{automatedTasks}} task automated",
      'processAutomated_other': "Business process automated successfully - {{automatedTasks}} tasks automated",
      'ruleApplied': "Business rule \"{{ruleName}}\" applied successfully to {{affectedRecords}} record",
      'ruleApplied_other': "Business rule \"{{ruleName}}\" applied successfully to {{affectedRecords}} records",
      'validationPassed': "Business validation passed for {{entityType}} - all {{checkCount}} check successful",
      'validationPassed_other': "Business validation passed for {{entityType}} - all {{checkCount}} checks successful",
      'workflowCompleted': "Workflow \"{{workflowName}}\" completed successfully in {{steps}} step",
      'workflowCompleted_other': "Workflow \"{{workflowName}}\" completed successfully in {{steps}} steps"
    },
    'file': {
      'backup': "File backup created successfully for \"{{filename}}\"",
      'compressed': "File compressed successfully - size reduced by {{compressionRatio, number}}%",
      'converted': "File converted successfully from {{sourceFormat}} to {{targetFormat}}",
      'copied': "File copied successfully to {{destinationPath}}",
      'deleted': "File \"{{filename}}\" deleted successfully",
      'downloadCompleted': "File \"{{filename}}\" downloaded successfully",
      'extracted': "Archive extracted successfully - {{extractedCount}} file extracted",
      'extracted_other': "Archive extracted successfully - {{extractedCount}} files extracted",
      'moved': "File moved successfully from {{sourcePath}} to {{destinationPath}}",
      'processingCompleted': "File processing completed for \"{{filename}}\" - {{operationsCount}} operation performed",
      'processingCompleted_other': "File processing completed for \"{{filename}}\" - {{operationsCount}} operations performed",
      'restored': "File restored successfully from backup created on {{backupDate, date}}",
      'uploadCompleted': "File \"{{filename}}\" uploaded successfully ({{fileSize}})",
      'uploadsBatch': "Batch upload completed: {{successCount}}/{{totalCount}} file processed",
      'uploadsBatch_other': "Batch upload completed: {{successCount}}/{{totalCount}} files processed",
      'validated': "File validation passed for \"{{filename}}\" - format: {{fileFormat}}"
    },
    'integration': {
      'apiCall': "API call to {{serviceName}} completed successfully in {{responseTime, number}}ms",
      'credentialsValidated': "API credentials validated successfully for {{serviceName}}",
      'dataSync': "Data synchronization completed with {{serviceName}} - {{syncedRecords}} record processed",
      'dataSync_other': "Data synchronization completed with {{serviceName}} - {{syncedRecords}} records processed",
      'dataTransform': "Data transformation completed - {{transformedRecords}} record processed",
      'dataTransform_other': "Data transformation completed - {{transformedRecords}} records processed",
      'healthCheckPassed': "External service health check passed for {{serviceName}}",
      'rateLimit': "API rate limit status: {{usedRequests}}/{{maxRequests}} requests remaining",
      'serviceConnected': "Successfully connected to {{serviceName}} - status: {{serviceStatus}}",
      'subscriptionActive': "Service subscription is active for {{serviceName}} until {{expiryDate, date}}",
      'webhookDelivered': "Webhook delivered successfully to {{webhookUrl}} - status: {{deliveryStatus}}"
    },
    'kv': {
      'configs': {
        'comparisonRetrieved': "Environment comparison retrieved by {{actor}} - KV: {{kvCount}}, ENV: {{envCount}}, Default: {{defaultCount}}",
        'configRetrieved': "Configuration \"{{key}}\" retrieved by {{actor}}: {{value}} (default: {{isDefault}})",
        'defaultsRetrieved': "Default configurations retrieved by {{actor}} ({{keyCount}} keys)",
        'retrieved': "Successfully retrieved {{configCount}} configurations by {{actor}} ({{allowedKeys}} allowed keys)"
      },
      'status': {
        'disabled': "disabled",
        'enabled': "enabled"
      },
      'adminCacheCleared': "Configuration cache cleared by {{actor}}",
      'adminConfigReset': "Configuration \"{{key}}\" reset to default by {{actor}} - was: {{oldValue}}, now: {{defaultValue}}",
      'adminConfigUpdated': "Configuration \"{{key}}\" updated by {{actor}} from {{oldValue}} to {{newValue}}",
      'adminFeatureToggled': "Feature \"{{feature}}\" toggled by {{actor}}: {{previousValue}} → {{newValue}}",
      'auditConfigsRetrieved': "Audit configurations retrieved by {{actor}} ({{configCount}} configurations)",
      'auditPerformanceRetrieved': "Audit performance settings retrieved by {{actor}} ({{settingCount}} settings)",
      'auditRetentionRetrieved': "Audit retention policies retrieved by {{actor}} ({{policyCount}} policies)",
      'backupCreated': "Configuration backup created successfully with {{configCount}} setting",
      'backupCreated_other': "Configuration backup created successfully with {{configCount}} settings",
      'batchConfigUpdated': "Batch configuration update by {{actor}}: {{updatedCount}}/{{totalCount}} updated ({{failedCount}} failed)",
      'batchUpdateCompleted': "Batch configuration update completed: {{successCount}}/{{totalCount}} successful",
      'cacheCleared': "Configuration cache cleared successfully - {{clearedCount}} entry removed",
      'cacheCleared_other': "Configuration cache cleared successfully - {{clearedCount}} entries removed",
      'configReset': "Configuration \"{{key}}\" reset to default value: {{defaultValue}}",
      'configRetrieved': "Configuration \"{{key}}\" retrieved successfully: {{value}}",
      'configUpdated': "Configuration \"{{key}}\" updated successfully from {{oldValue}} to {{newValue}}",
      'defaultsRestored': "Default configurations restored successfully for {{restoredCount}} key",
      'defaultsRestored_other': "Default configurations restored successfully for {{restoredCount}} keys",
      'featureToggled': "Feature \"{{feature}}\" {{status}} successfully"
    },
    'operation': {
      'batchProcessed': "Batch operation completed: {{successCount}}/{{totalCount}} items processed successfully",
      'completed': "Operation \"{{operationType}}\" completed successfully in {{duration}}ms",
      'completed_other': "{{count}} operations completed successfully - average time: {{avgDuration}}ms",
      'taskFinished': "Task \"{{taskName}}\" finished successfully with {{resultCount}} result",
      'taskFinished_other': "Task \"{{taskName}}\" finished successfully with {{resultCount}} results",
      'workflowCompleted': "Workflow completed successfully - {{stepsCount}} step executed",
      'workflowCompleted_other': "Workflow completed successfully - {{stepsCount}} steps executed"
    },
    'realtimeIncidents': {
      'created': "Realtime monitoring incident {{incidentId}} created successfully"
    },
    'realtimeMonitoring': {
      'alerts': {
        'configUpdated': "Alert configuration updated successfully",
        'historyRetrieved': "Alert history retrieved successfully",
        'manualSent': "Manual alert sent successfully",
        'rulesRetrieved': "Alert rules retrieved successfully",
        'statusRetrieved': "Alert system status retrieved successfully"
      },
      'dashboard': {
        'cacheCleared': "Real-time monitoring dashboard cache cleared successfully",
        'liveRetrieved': "Live dashboard snapshot retrieved successfully",
        'overviewRetrieved': "Real-time monitoring dashboard overview retrieved successfully",
        'realtimeRetrieved': "Real-time monitoring dashboard data retrieved successfully"
      },
      'incidents': {
        'created': "Realtime monitoring incident {{incidentId}} created successfully"
      },
      'monitoring': {
        'analysisCompleted': "Real-time monitoring analysis completed successfully",
        'eventSimulated': "Monitoring event {{eventType}} simulated successfully",
        'eventsRetrieved': "Recent monitoring events retrieved successfully",
        'started': "Real-time monitoring started successfully",
        'stopped': "Real-time monitoring stopped successfully",
        'threatResolved': "Real-time threat {{threatId}} resolved successfully",
        'threatsRetrieved': "Real-time threat status retrieved successfully"
      }
    },
    'search': {
      'completed': "Search completed successfully with {{resultCount}} result",
      'completed_other': "Search completed successfully with {{resultCount}} results"
    },
    'security': {
      'incident': {
        'created': "{{actor}} created security incident \"{{title}}\" with {{severity}} severity (ID: {{incidentId}}, Type: {{type}})",
        'responseExecuted': "{{actor}} executed {{actionCount}} response actions for incident {{incidentId}} (Type: {{actionType}}) at {{executedAt}}",
        'retrieved': "{{actor}} retrieved incident {{incidentId}} details (Status: {{status}}, Severity: {{severity}}, Created: {{createdAt}})",
        'statusUpdated': "{{actor}} updated incident {{incidentId}} status from \"{{oldStatus}}\" to \"{{newStatus}}\" at {{timestamp}}"
      },
      'incidents': {
        'created': "{{actor}} created security incident \"{{title}}\" with {{severity}} severity (ID: {{incidentId}}, Type: {{type}})",
        'responseExecuted': "{{actor}} executed {{actionCount}} response actions for incident {{incidentId}} (Type: {{actionType}}) at {{executedAt}}",
        'retrieved': "{{actor}} successfully retrieved {{incidentCount}} security incidents (page {{page}}, limit {{limit}}, filters: {{filters}})",
        'statusUpdated': "{{actor}} updated incident {{incidentId}} status from \"{{oldStatus}}\" to \"{{newStatus}}\" at {{timestamp}}"
      },
      'monitoring': {
        'started': "Real-time monitoring started successfully"
      },
      'service': {
        'statusRetrieved': "{{actor}} retrieved service status: {{serviceHealth}} health, version {{version}}, uptime {{uptime}} (Checked at: {{checkedAt}})"
      },
      'simulation': {
        'completed': "{{actor}} completed {{threatType}} simulation with {{severity}} severity (Simulation ID: {{simulationId}}) at {{completedAt}}"
      },
      'statistics': {
        'retrieved': "{{actor}} retrieved security statistics: {{totalIncidents}} total, {{activeIncidents}} active, {{resolvedIncidents}} resolved (Retrieved at: {{retrievedAt}})"
      }
    },
    'system': {
      'cacheConnected': "Cache service connected successfully to {{cacheService}}",
      'configurationLoaded': "System configuration loaded successfully - {{configCount}} setting",
      'configurationLoaded_other': "System configuration loaded successfully - {{configCount}} settings",
      'connectionEstablished': "Connection established successfully to {{serviceName}}",
      'databaseConnected': "Database connection established successfully to {{databaseName}}",
      'healthCheckPassed': "System health check passed - all {{componentCount}} component healthy",
      'healthCheckPassed_other': "System health check passed - all {{componentCount}} components healthy",
      'operationCompleted': "System operation \"{{operation}}\" completed successfully in {{duration, number}}ms",
      'queueProcessed': "Task queue processed successfully - {{processedCount}} task completed",
      'queueProcessed_other': "Task queue processed successfully - {{processedCount}} tasks completed",
      'resourceAllocated': "System resources allocated successfully: {{allocatedMemory, number}}MB memory",
      'resourceReleased': "System resources released successfully: {{releasedMemory, number}}MB memory",
      'rollbackCompleted': "System rollback completed successfully to version {{previousVersion}}",
      'serviceStarted': "System service {{serviceName}} started successfully on port {{port}}",
      'serviceStopped': "System service {{serviceName}} stopped gracefully",
      'taskCompleted': "Background task {{taskName}} completed successfully",
      'taskScheduled': "Background task {{taskName}} scheduled for {{scheduledTime, datetime}}",
      'upgradeCompleted': "System upgrade completed successfully to version {{newVersion}}"
    },
    'translations': {
      'retrieved': "Translations retrieved successfully"
    },
    'user': {
      'activated': "User account activated successfully for {{userName}}",
      'activated_other': "{{count}} user accounts activated successfully",
      'bulkOperationSuccess': "Bulk operation completed: {{successCount}}/{{totalCount}} successful",
      'created': "User account created successfully for {{userName}} ({{email}})",
      'created_other': "{{count}} user accounts created successfully",
      'dataExported': "User data exported successfully ({{fileSize, number}}KB) for {{userName}}",
      'dataImported': "User data imported successfully - {{importedCount}} record processed",
      'dataImported_other': "User data imported successfully - {{importedCount}} records processed",
      'deactivated': "User account deactivated successfully for {{userName}}",
      'deactivated_other': "{{count}} user accounts deactivated successfully",
      'deleted': "User account deleted successfully for {{userName}} by {{deletedBy}}",
      'deleted_other': "{{count}} user accounts deleted successfully",
      'emailUpdated': "Email address updated from {{oldEmail}} to {{newEmail}} for {{userName}}",
      'emailVerified': "Email address {{email, lowercase}} verified successfully for {{userName}}",
      'loginHistory': "Login history retrieved: {{entryCount}} entry for {{userName}}",
      'loginHistory_other': "Login history retrieved: {{entryCount}} entries for {{userName}}",
      'passwordChanged': "Password changed successfully for {{userName}}",
      'permissionUpdated': "User permissions updated successfully for {{userName}}",
      'profileCompleted': "User profile is now {{percent, number}}% complete for {{userName}}",
      'profileRetrieved': "User profile retrieved successfully for {{userName}} ({{userRole}}) by [{{requestedBy}}]",
      'profileUpdated': "User profile updated successfully for {{userName}} - {{fieldsCount}} field modified",
      'profileUpdated_other': "User profile updated successfully for {{userName}} - {{fieldsCount}} fields modified",
      'registered': "User {{userName}} registered successfully with {{userRole}} role",
      'roleChanged': "User role changed from {{oldRole}} to {{newRole}} for {{userName}}",
      'sessionTerminated': "All sessions terminated successfully for {{userName}}",
      'suspended': "User account suspended successfully for {{userName}} until {{suspendedUntil, datetime}}",
      'unsuspended': "User account suspension lifted for {{userName}} by {{liftedBy}}",
      'updated': "User profile updated successfully for {{userName}} - fields: {{updatedFields}}",
      'updated_other': "{{count}} user profiles updated successfully"
    }
  },
  'system': {
    'apiInfo': "API information",
    'error': "An error occurred",
    'invalidRequest': "Invalid request",
    'notFound': "Resource not found",
    'operationFailed': "{{operation}} failed: {{error}}",
    'serverError': "Internal server error",
    'success': "Operation completed successfully",
    'welcome': "Welcome to Hono Auth API v{{version}} ({{language}})"
  },
  'user': {
    'statusDisplay': {
      'active': "Active",
      'inactive': "Inactive",
      'suspended': "Suspended"
    }
  },
  'validation': {
    'advancedAudit': {
      'invalidRetentionAction': "Invalid retention action: {{action}}, must be one of: {{validActions}}"
    },
    'advancedCleanup': {
      'backupRecommended': "It is strongly recommended to create a backup before cleanup",
      'confirmationRequired': "Explicit confirmation required for actual cleanup operations",
      'invalid': "Invalid advanced cleanup parameters: {{details}}"
    },
    'arrayValidation': {
      'actions': {
        'tooFew': "Must contain at least {{minCount}} action",
        'tooFew_other': "Must contain at least {{minCount}} actions",
        'tooMany': "Cannot contain more than {{maxCount}} action",
        'tooMany_other': "Cannot contain more than {{maxCount}} actions"
      },
      'channels': {
        'tooFew': "Must include at least {{minCount}} channel",
        'tooFew_other': "Must include at least {{minCount}} channels",
        'tooMany': "Cannot include more than {{maxCount}} channel",
        'tooMany_other': "Cannot include more than {{maxCount}} channels"
      },
      'conditions': {
        'tooFew': "Must specify at least {{minCount}} condition",
        'tooFew_other': "Must specify at least {{minCount}} conditions",
        'tooMany': "Cannot specify more than {{maxCount}} condition",
        'tooMany_other': "Cannot specify more than {{maxCount}} conditions"
      },
      'configs': {
        'tooFew': "Must contain at least {{minCount}} configuration",
        'tooFew_other': "Must contain at least {{minCount}} configurations",
        'tooMany': "Cannot contain more than {{maxCount}} configuration",
        'tooMany_other': "Cannot contain more than {{maxCount}} configurations"
      },
      'interests': {
        'tooFew': "Must contain at least {{minCount}} interest",
        'tooFew_other': "Must contain at least {{minCount}} interests",
        'tooMany': "Cannot contain more than {{maxCount}} interest",
        'tooMany_other': "Cannot contain more than {{maxCount}} interests"
      },
      'items': {
        'tooFew': "Must contain at least {{minCount}} item",
        'tooFew_other': "Must contain at least {{minCount}} items",
        'tooMany': "Cannot contain more than {{maxCount}} item",
        'tooMany_other': "Cannot contain more than {{maxCount}} items"
      }
    },
    'auditSearch': {
      'atLeastOneFilterRequired': "At least {{min}} filter must be specified",
      'atLeastOneFilterRequired_other': "At least {{min}} filters must be specified"
    },
    'changePassword': {
      'passwordsDoNotMatch': "New password and confirmation do not match"
    },
    'cleanupSimulation': {
      'confirmationRequired': "Confirmation required for non-dry-run operations",
      'dataLossWarning': "Warning: This operation may result in data loss",
      'invalid': "Invalid cleanup simulation parameters: {{details}}"
    },
    'confirmPassword': {
      'mustMatch': "Password confirmation must match the original password",
      'required': "Password confirmation is required"
    },
    'dateRange': {
      'invalid': "Invalid date range - end date must be after start date",
      'overlapConflict': "Date range overlaps with existing range: {{conflictingRange}}",
      'tooLarge': "Date range cannot exceed {{maxDays}} day",
      'tooLarge_other': "Date range cannot exceed {{maxDays}} days"
    },
    'enumValidation': {
      'action': {
        'invalid': "Action must be one of: {{allowedValues}}"
      },
      'actionType': {
        'invalid': "Action type must be one of: {{allowedValues}}"
      },
      'category': {
        'invalid': "Category must be one of: {{allowedValues}}"
      },
      'channelType': {
        'invalid': "Channel type must be one of: {{allowedValues}}"
      },
      'file_type': {
        'invalid': "File type must be one of: {{allowedValues}}"
      },
      'format': {
        'invalid': "Format must be one of: {{allowedValues}}"
      },
      'metric': {
        'invalid': "Metric must be one of: {{allowedValues}}"
      },
      'operator': {
        'invalid': "Operator must be one of: {{allowedValues}}"
      },
      'priority': {
        'invalid': "Priority must be one of: {{allowedValues}}"
      },
      'reportType': {
        'invalid': "Report type must be one of: {{allowedValues}}"
      },
      'resolution': {
        'invalid': "Resolution must be one of: {{allowedValues}}"
      },
      'role': {
        'invalid': "Role must be one of: {{allowedValues}}"
      },
      'severity': {
        'invalid': "Severity must be one of: {{allowedValues}}"
      },
      'sort_by': {
        'invalid': "Sort field must be one of: {{allowedValues}}"
      },
      'sort_order': {
        'invalid': "Sort order must be one of: {{allowedValues}}"
      },
      'status': {
        'invalid': "Status must be one of: {{allowedValues}}"
      },
      'timeframe': {
        'invalid': "Timeframe must be one of: {{allowedValues}}"
      },
      'userRole': {
        'invalid': "User role must be one of: {{allowedValues}}"
      }
    },
    'fieldRequired': {
      'action': "Action is required",
      'actionTaken': "Action taken is required",
      'age': "Age is required",
      'assignedTo': "Assigned user is required",
      'auditLogRetentionDays': "Audit log retention days value is required",
      'auditRetention': "Audit retention value is required",
      'batchSize': "Batch size is required",
      'categoryFilter': "Category filter is required",
      'channel': "Channel is required",
      'channelType': "Channel type is required",
      'conditionValue': "Condition value is required",
      'confirmPassword': "Password confirmation is required",
      'date': "Date is required",
      'days': "Days value is required",
      'description': "Description is required",
      'dryRun': "Dry run flag is required",
      'email': "Email address is required",
      'enabled': "Enabled flag is required",
      'endDate': "End date is required",
      'endTime': "End time is required",
      'errorRate': "Error rate is required",
      'executionTime': "Execution time value is required",
      'failureCount': "Failure count is required",
      'field': "Field value is required",
      'fileSize': "File size is required",
      'forceArchival': "Force archival flag is required",
      'format': "Format is required",
      'hours': "Hours value is required",
      'id': "ID is required",
      'incidentType': "Incident type is required",
      'includeDetails': "Include details flag is required",
      'includeMetadata': "Include metadata flag is required",
      'includeUserData': "Include user data flag is required",
      'intervalMs': "Interval (ms) is required",
      'limit': "Limit is required",
      'maxRecords': "Max records value is required",
      'metric': "Metric is required",
      'metrics': "Metrics are required",
      'name': "Name is required",
      'page': "Page number is required",
      'password': "Password is required",
      'period': "Period is required",
      'policy': "Policy is required",
      'priority': "Priority is required",
      'query': "Search query is required",
      'refreshToken': "Refresh token is required",
      'reportType': "Report type is required",
      'resolution': "Resolution is required",
      'responseTime': "Response time is required",
      'securityIncident': "Security incident is required",
      'startDate': "Start date is required",
      'startTime': "Start time is required",
      'target': "Target is required",
      'termsAccepted': "Terms acceptance is required",
      'threshold': "Threshold value is required",
      'timeframe': "Timeframe is required",
      'timeRange': "Time range is required",
      'token': "Token is required",
      'userDataRetention': "User data retention value is required",
      'userDataRetentionDays': "User data retention days value is required",
      'userId': "User ID is required",
      'username': "Username is required",
      'userRole': "User role is required",
      'value': "Value is required",
      'website': "Website is required"
    },
    'fileUpload': {
      'invalidExtension': "Invalid file extension"
    },
    'formatValidation': {
      'assignedTo': {
        'invalid': "Invalid assigned user ID format"
      },
      'date': {
        'invalid': "Invalid date format"
      },
      'email': {
        'invalid': "Please provide a valid email address (e.g., user@example.com)"
      },
      'endDate': {
        'invalid': "Invalid end date format"
      },
      'endTime': {
        'invalid': "Invalid end time format"
      },
      'id': {
        'invalid': "Invalid ID format"
      },
      'refreshToken': {
        'invalid': "Invalid refresh token format"
      },
      'startDate': {
        'invalid': "Invalid start date format"
      },
      'startTime': {
        'invalid': "Invalid start time format"
      },
      'token': {
        'invalid': "Invalid JWT token format"
      },
      'url': {
        'invalid': "Please provide a valid URL (e.g., https://example.com)"
      },
      'website': {
        'invalid': "Please provide a valid website URL (e.g., https://example.com)"
      }
    },
    'lengthValidation': {
      'action': {
        'tooLong': "Action cannot exceed {{maxLength}} characters",
        'tooShort': "Action must be at least {{minLength}} character long",
        'tooShort_other': "Action must be at least {{minLength}} characters long"
      },
      'actionTaken': {
        'tooLong': "Action taken cannot exceed {{maxLength}} characters",
        'tooShort': "Action taken must be at least {{minLength}} character long",
        'tooShort_other': "Action taken must be at least {{minLength}} characters long"
      },
      'bio': {
        'tooLong': "Bio cannot exceed {{maxLength}} characters",
        'tooShort': "Bio must be at least {{minLength}} character long",
        'tooShort_other': "Bio must be at least {{minLength}} characters long"
      },
      'channel': {
        'tooLong': "Channel cannot exceed {{maxLength}} characters",
        'tooShort': "Channel must be at least {{minLength}} character long",
        'tooShort_other': "Channel must be at least {{minLength}} characters long"
      },
      'channelType': {
        'tooLong': "Channel type cannot exceed {{maxLength}} characters",
        'tooShort': "Channel type must be at least {{minLength}} character long",
        'tooShort_other': "Channel type must be at least {{minLength}} characters long"
      },
      'confirmPassword': {
        'tooShort': "Password confirmation must be at least {{minLength}} character long",
        'tooShort_other': "Password confirmation must be at least {{minLength}} characters long"
      },
      'department': {
        'tooLong': "Department cannot exceed {{maxLength}} characters",
        'tooShort': "Department must be at least {{minLength}} character long",
        'tooShort_other': "Department must be at least {{minLength}} characters long"
      },
      'description': {
        'tooLong': "Description cannot exceed {{maxLength}} characters",
        'tooShort': "Description must be at least {{minLength}} character long",
        'tooShort_other': "Description must be at least {{minLength}} characters long"
      },
      'email': {
        'tooLong': "Email address cannot exceed {{maxLength}} characters"
      },
      'entityType': {
        'tooLong': "Entity type cannot exceed {{maxLength}} characters",
        'tooShort': "Entity type must be at least {{minLength}} character long",
        'tooShort_other': "Entity type must be at least {{minLength}} characters long"
      },
      'field': {
        'tooLong': "Field cannot exceed {{maxLength}} characters",
        'tooShort': "Field must be at least {{minLength}} character long",
        'tooShort_other': "Field must be at least {{minLength}} characters long"
      },
      'incidentType': {
        'tooLong': "Incident type cannot exceed {{maxLength}} characters",
        'tooShort': "Incident type must be at least {{minLength}} character long",
        'tooShort_other': "Incident type must be at least {{minLength}} characters long"
      },
      'interest': {
        'tooLong': "Interest cannot exceed {{maxLength}} characters",
        'tooShort': "Interest must be at least {{minLength}} character long",
        'tooShort_other': "Interest must be at least {{minLength}} characters long"
      },
      'name': {
        'tooLong': "Name cannot exceed {{maxLength}} characters"
      },
      'nextSteps': {
        'tooLong': "Next steps cannot exceed {{maxLength}} characters",
        'tooShort': "Next steps must be at least {{minLength}} character long",
        'tooShort_other': "Next steps must be at least {{minLength}} characters long"
      },
      'note': {
        'tooLong': "Note cannot exceed {{maxLength}} characters",
        'tooShort': "Note must be at least {{minLength}} character long",
        'tooShort_other': "Note must be at least {{minLength}} characters long"
      },
      'notes': {
        'tooLong': "Notes cannot exceed {{maxLength}} characters",
        'tooShort': "Notes must be at least {{minLength}} character long",
        'tooShort_other': "Notes must be at least {{minLength}} characters long"
      },
      'password': {
        'tooLong': "Password cannot exceed {{maxLength}} characters",
        'tooShort': "Password must be at least {{minLength}} character long",
        'tooShort_other': "Password must be at least {{minLength}} characters long"
      },
      'query': {
        'tooLong': "Search query cannot exceed {{maxLength}} characters",
        'tooShort': "Search query must be at least {{minLength}} character long",
        'tooShort_other': "Search query must be at least {{minLength}} characters long"
      },
      'search': {
        'tooLong': "Search text cannot exceed {{maxLength}} characters",
        'tooShort': "Search text must be at least {{minLength}} character long",
        'tooShort_other': "Search text must be at least {{minLength}} characters long"
      },
      'sortBy': {
        'tooLong': "Sort by field cannot exceed {{maxLength}} characters",
        'tooShort': "Sort by field must be at least {{minLength}} character long",
        'tooShort_other': "Sort by field must be at least {{minLength}} characters long"
      },
      'source': {
        'tooLong': "Source cannot exceed {{maxLength}} characters",
        'tooShort': "Source must be at least {{minLength}} character long",
        'tooShort_other': "Source must be at least {{minLength}} characters long"
      },
      'system': {
        'tooLong': "System cannot exceed {{maxLength}} characters",
        'tooShort': "System must be at least {{minLength}} character long",
        'tooShort_other': "System must be at least {{minLength}} characters long"
      },
      'target': {
        'tooLong': "Target cannot exceed {{maxLength}} characters",
        'tooShort': "Target must be at least {{minLength}} character long",
        'tooShort_other': "Target must be at least {{minLength}} characters long"
      },
      'template': {
        'tooLong': "Template cannot exceed {{maxLength}} characters",
        'tooShort': "Template must be at least {{minLength}} character long",
        'tooShort_other': "Template must be at least {{minLength}} characters long"
      },
      'token': {
        'tooLong': "Token cannot exceed {{maxLength}} characters",
        'tooShort': "Token must be at least {{minLength}} character long",
        'tooShort_other': "Token must be at least {{minLength}} characters long"
      }
    },
    'numericValidation': {
      'age': {
        'tooLarge': "Age cannot exceed {{maxValue}} years",
        'tooSmall': "Age must be at least {{minValue}} years"
      },
      'auditLogRetentionDays': {
        'tooSmall': "Audit log retention days must be at least {{minValue}}"
      },
      'auditRetention': {
        'tooLarge': "Audit retention value cannot exceed {{maxValue}}",
        'tooSmall': "Audit retention value must be at least {{minValue}}"
      },
      'batchSize': {
        'tooLarge': "Batch size cannot exceed {{maxValue}}",
        'tooSmall': "Batch size must be at least {{minValue}}"
      },
      'days': {
        'tooLarge': "Days cannot exceed {{maxValue}}",
        'tooSmall': "Days must be at least {{minValue}}"
      },
      'errorRate': {
        'tooLarge': "Error rate cannot exceed {{maxValue}}",
        'tooSmall': "Error rate must be at least {{minValue}}"
      },
      'executionTime': {
        'tooLarge': "Execution time cannot exceed {{maxValue}} seconds",
        'tooSmall': "Execution time must be at least {{minValue}} seconds"
      },
      'failureCount': {
        'tooLarge': "Failure count cannot exceed {{maxValue}}",
        'tooSmall': "Failure count must be at least {{minValue}}"
      },
      'fileSize': {
        'tooLarge': "File size cannot exceed {{maxValue}} bytes",
        'tooSmall': "File size must be at least {{minValue}} bytes"
      },
      'hours': {
        'tooLarge': "Hours cannot exceed {{maxValue}}",
        'tooSmall': "Hours must be at least {{minValue}}"
      },
      'intervalMs': {
        'tooLarge': "Interval (ms) cannot exceed {{maxValue}}",
        'tooSmall': "Interval (ms) must be at least {{minValue}}"
      },
      'limit': {
        'tooLarge': "Limit cannot exceed {{maxValue}}",
        'tooSmall': "Limit must be at least {{minValue}}"
      },
      'maxRecords': {
        'tooLarge': "Max records cannot exceed {{maxValue}}",
        'tooSmall': "Max records must be at least {{minValue}}"
      },
      'page': {
        'tooLarge': "Page number cannot exceed {{maxValue}}",
        'tooSmall': "Page number must be at least {{minValue}}"
      },
      'responseTime': {
        'tooLarge': "Response time cannot exceed {{maxValue}}",
        'tooSmall': "Response time must be at least {{minValue}}"
      },
      'securityIncident': {
        'tooLarge': "Security incident cannot exceed {{maxValue}}",
        'tooSmall': "Security incident must be at least {{minValue}}"
      },
      'threshold': {
        'tooSmall': "Threshold must be at least {{minValue}}"
      },
      'userDataRetention': {
        'tooLarge': "User data retention cannot exceed {{maxValue}}",
        'tooSmall': "User data retention must be at least {{minValue}}"
      },
      'userDataRetentionDays': {
        'tooSmall': "User data retention days must be at least {{minValue}}"
      },
      'userId': {
        'tooSmall': "User ID must be at least {{minValue}}"
      }
    },
    'retentionPolicy': {
      'atLeastOneRequired': "At least {{min}} retention setting must be specified",
      'atLeastOneRequired_other': "At least {{min}} retention settings must be specified",
      'conflictingRules': "Conflicting retention rules detected: {{conflicts}}",
      'invalid': "Invalid retention policy configuration"
    },
    'retentionPolicyUpdate': {
      'atLeastOneFieldRequired': "At least {{min}} field must be updated",
      'atLeastOneFieldRequired_other': "At least {{min}} fields must be updated",
      'immutableField': "Field \"{{field}}\" cannot be modified after creation",
      'invalid': "Invalid retention policy update: {{details}}"
    },
    'security': {
      'xssPatternDetected': "Potential XSS pattern detected: {{patternName}} is not allowed"
    },
    'structureValidation': {
      'conditions': {
        'invalid': "Invalid conditions structure"
      },
      'config': {
        'invalid': "Invalid configuration structure"
      },
      'configUpdate': {
        'invalid': "Invalid configuration update format. Required field \"value\" is missing or contains unrecognized fields"
      },
      'incidentCreation': {
        'invalid': "Invalid incident creation structure"
      },
      'login': {
        'invalid': "Invalid login request format"
      },
      'metadata': {
        'invalid': "Invalid metadata structure"
      },
      'object': {
        'invalid': "Invalid object structure"
      },
      'record': {
        'invalid': "Invalid record format"
      }
    },
    'termsAccepted': {
      'mustBeTrue': "Terms and conditions must be accepted to proceed",
      'versionMismatch': "Terms and conditions have been updated - please review and accept the latest version"
    },
    'timeRange': {
      'eitherHoursOrRangeRequired': "Either hours value or date range must be specified",
      'endTimeMustBeAfterStartTime': "End time must be after start time",
      'invalid': "Time range must be one of: {{ranges}}",
      'invalidFormat': "Time range format is invalid (expected: {{expectedFormat}})",
      'rangeTooLarge': "Time range cannot exceed {{maxDays}} day",
      'rangeTooLarge_other': "Time range cannot exceed {{maxDays}} days",
      'required': "Time range is required"
    },
    'typeValidation': {
      'configValue': {
        'invalid': "Invalid configuration value type"
      },
      'value': {
        'invalid': "Invalid data type"
      }
    },
    'username': {
      'invalid': "Username can only contain letters, numbers, underscores, and hyphens",
      'invalidCharacters': "Username contains invalid characters: {{invalidChars}}",
      'required': "Username is required",
      'reserved': "Username \"{{username}}\" is reserved and cannot be used",
      'tooLong': "Username cannot exceed {{maxLength}} characters",
      'tooShort': "Username must be at least {{minLength}} character long",
      'tooShort_other': "Username must be at least {{minLength}} characters long",
      'unavailable': "Username \"{{username}}\" is not available"
    },
    'filterArrayTooLarge': "Filter array with {{count}} item exceeds maximum of {{max}}",
    'filterArrayTooLarge_other': "Filter array with {{count}} items exceeds maximum of {{max}}",
    'invalid': "Invalid value provided",
    'invalid_other': "{{count}} invalid values provided",
    'invalidArchiveAction': "Invalid archive action \"{{action}}\" - must be one of: {{validActions}}",
    'invalidJson': "Invalid JSON in request body: {{details}}",
    'invalidRole': "Invalid role \"{{role}}\" specified - must be one of: {{validRoles}}",
    'limitTooLarge': "Limit {{limit}} exceeds maximum of {{max}} record",
    'limitTooLarge_other': "Limit {{limit}} exceeds maximum of {{max}} records",
    'registrationFailed': "User registration failed: {{reason}}",
    'requestTooLarge': "Request payload {{actualSize}}MB exceeds {{maxSize}}MB limit",
    'required': "This field is required",
    'required_other': "{{count}} required fields are missing",
    'searchFailed': "Search operation failed: {{reason}}",
    'serviceTempUnavailable': "Request too large to process - service temporarily unavailable (try reducing batch size)",
    'tooLong': "Value exceeds {{max}} character limit",
    'tooLong_other': "Value exceeds {{max}} characters limit",
    'tooShort': "Value must be at least {{min}} character long",
    'tooShort_other': "Value must be at least {{min}} characters long",
    'translationsFailed': "Failed to fetch translations for language \"{{language}}\": {{reason}}",
    'unsupportedFormat': "Export format \"{{format}}\" is not supported - available formats: {{supportedFormats}}",
    'updateRequiresField': "At least {{min}} field is required for update operation",
    'updateRequiresField_other': "At least {{min}} fields are required for update operation",
    'uploadFailed': "File upload failed: {{reason}}"
  },
  'zodDemo': {
    'anotherSearchResultTitle': "Another result for",
    'description': "This demonstrates how to use Zod with Hono for robust validation",
    'noDescription': "No description provided",
    'searchResultTitle': "Result for",
    'title': "Zod Validation Demo"
  },
  'zodDemo_operations': {
    'fileUpload': "demo file upload",
    'searchExecution': "demo search execution",
    'userRegistration': "demo user registration"
  }
};
