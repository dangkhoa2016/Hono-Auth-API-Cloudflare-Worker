/**
 * ES translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: 2025-12-16T04:10:26.743Z
*/

export default {
  'admin': {
    'accessLevel': {
      'full': 'acceso completo al sistema',
      'limited': 'acceso limitado (nivel de administrador)'
    },
    'actions': {
      'permanentDeletion': 'eliminación permanente de cuenta'
    },
    'dataScope': {
      'full': 'datos completos',
      'limited': 'datos filtrados'
    },
    'operations': {
      'adminDashboardAccess': 'acceso al dashboard de administración',
      'adminRoutesAccess': 'acceso a rutas de administración',
      'createUser': 'creación de usuario',
      'deleteUser': 'eliminar usuario #{{userId}}',
      'updateUser': 'actualizar usuario #{{userId}}'
    },
    'protectionReason': {
      'hierarchy': 'Se debe mantener la jerarquía de roles',
      'higherPrivilege': 'No se pueden modificar usuarios con privilegios superiores',
      'roleChange': 'Los usuarios no pueden modificar sus propios roles',
      'superAdmin': 'Las cuentas de Super Administrador están protegidas'
    },
    'systemStatus': {
      'healthy': 'SALUDABLE',
      'unhealthy': 'NO SALUDABLE'
    },
    'accessDenied': 'Se requiere acceso de administrador para esta operación',
    'accountDeletionSuggestion': 'Contacte a otro administrador para la gestión de la cuenta',
    'activeUsersCount': '{{count}} usuario activo',
    'activeUsersCount_other': '{{count}} usuarios activos ({{percentage}})',
    'changedByUser': 'Cambiado por {{username}} ({{role}})',
    'changesApplied': '{{count}} cambio aplicado',
    'changesApplied_other': '{{count}} cambios aplicados',
    'checkedByUser': 'Verificado por {{username}} ({{role}})',
    'createdByUser': 'Creado por {{username}} ({{role}})',
    'dashboardDataRetrieved': 'Panel de control cargado con {{totalUsers}} vista general del sistema (acceso {{accessLevel}}).{{requestedBy}} {{dataFreshness}}',
    'dashboardRetrieved': 'Datos del dashboard obtenidos exitosamente',
    'dataFreshness': 'Generado el {{timestamp}}',
    'deletedByUser': 'Eliminado por {{username}} ({{role}})',
    'effectiveImmediately': 'Cambios efectivos inmediatamente',
    'failedLoginAttempts': '{{count}} intento de inicio de sesión fallido en la última hora',
    'failedLoginAttempts_other': '{{count}} intentos de inicio de sesión fallidos en la última hora',
    'performanceGrade': 'Rendimiento: {{grade}}',
    'requestedByUser': 'Solicitado por {{username}} ({{role}})',
    'responseTime': 'Tiempo de respuesta: {{time}}{{unit}}',
    'restrictedRoleAccess': 'Acceso denegado: {{currentRole}} no puede ver usuarios de {{requestedRole}}',
    'roleChangedSuccessfully': 'Rol cambiado de {{oldRole}} a {{newRole}} para {{targetUserName}}.{{changedBy}} {{timestamp}} {{effectiveImmediately}}',
    'routeDiscoverySuccess': 'Rutas del sistema obtenidas exitosamente',
    'securityRisk': 'Riesgo de seguridad: {{level}} ({{failedAttempts}})',
    'statisticsRetrieved': 'Estadísticas del sistema: {{totalUsers}}, usuarios activos: {{activeUsers}} (alcance {{dataScope}}).{{requestedBy}}',
    'statsRetrieved': 'Estadísticas del sistema obtenidas exitosamente',
    'systemHealthRetrieved': 'Estado de salud del sistema obtenido exitosamente',
    'systemHealthRetrievedFailed': 'Error al obtener información de salud del sistema',
    'totalUsersCount': '{{count}} usuario total',
    'totalUsersCount_other': '{{count}} usuarios totales',
    'updatedByUser': 'Actualizado por {{username}} ({{role}})',
    'userCreatedSuccessfully': 'Nuevo usuario {{userName}} creado con el rol {{newUserRole}}.{{createdBy}} {{timestamp}}',
    'userDeletedSuccessfully': 'Cuenta de usuario eliminada permanentemente.{{deletedBy}} {{timestamp}} Acción: {{action}}',
    'userDetailsRetrieved': 'Detalles del usuario recuperados: {{userName}} ({{userRole}}, {{userStatus}}).{{joinedDate}} {{requestedBy}}',
    'usersListRetrieved': 'Se recuperó exitosamente {{count}} usuario (mostrando {{displayedCount}} en la página {{currentPage}} de {{totalPages}}). {{requestedBy}}',
    'usersListRetrieved_other': 'Se recuperaron exitosamente {{count}} usuarios (mostrando {{displayedCount}} en la página {{currentPage}} de {{totalPages}}). {{requestedBy}}',
    'userUpdatedSuccessfully': 'Usuario {{updatedUserName}} actualizado exitosamente.{{changesCount}} {{updatedBy}} {{timestamp}}'
  },
  'api': {
    'databaseError': 'Error de base de datos ocurrido',
    'healthCheck': 'La API funciona sin problemas',
    'methodNotAllowed': 'Método no permitido',
    'routeNotFound': 'Ruta no encontrada',
    'validationError': 'Error de validación',
    'validationErrorDetails': 'Validación fallida: {{errorCount}} error encontrado',
    'validationErrorDetails_other': 'Validación fallida: {{errorCount}} errores encontrados'
  },
  'audit': {
    'access': {
      'full': 'acceso completo al sistema',
      'limited': 'acceso limitado (basado en roles)'
    },
    'health': {
      'healthy': 'SALUDABLE',
      'suggestion_admin': 'Las verificaciones de salud del sistema pueden ser limitadas para su rol.',
      'suggestion_super_admin': 'Verifique los recursos del sistema, la conectividad de la base de datos y el estado del servicio.',
      'systemCheck': 'Verificación completa de la salud del sistema',
      'unhealthy': 'NO SALUDABLE'
    },
    'logs': {
      'error': 'Error al recuperar los registros de auditoría',
      'suggestion_admin': 'Solo puede ver los registros de usuarios regulares y sus propias acciones.',
      'suggestion_super_admin': 'Tiene acceso completo a todos los registros de auditoría en el sistema.'
    },
    'operations': {
      'export': 'exportar registros de auditoría',
      'healthCheck': 'verificación de salud del sistema de auditoría',
      'logsView': 'ver registros de auditoría',
      'search': 'buscar en registros de auditoría',
      'stats': 'obtener estadísticas de auditoría'
    },
    'search': {
      'allFields': 'todos los campos',
      'noQuery': 'no se proporcionó ninguna consulta',
      'suggestion_admin': 'Intente buscar con diferentes términos o contacte al superadministrador para un acceso ampliado.',
      'suggestion_super_admin': 'Intente refinar sus criterios de búsqueda o verifique los registros del sistema en busca de problemas.'
    },
    'stats': {
      'suggestion_admin': 'Las estadísticas se filtran según su nivel de acceso. Contacte al superadministrador para obtener estadísticas completas del sistema.',
      'suggestion_super_admin': 'Verifique la salud del sistema y la conectividad de la base de datos si las estadísticas no están disponibles.'
    }
  },
  'auth': {
    'operations': {
      'export': 'exportar registros de auditoría',
      'healthCheck': 'verificación de salud del sistema de auditoría',
      'login': 'inicio de sesión de usuario',
      'logsView': 'ver registros de auditoría',
      'search': 'buscar registros de auditoría',
      'stats': 'obtener estadísticas de auditoría'
    },
    'accountNotActive': 'La cuenta no está activa',
    'activationAlreadyActive': 'Tu cuenta ya está activa. Ya puedes iniciar sesión.',
    'activationDisabledByAdmin': 'Tu cuenta ha sido desactivada por un administrador. Por favor contacta al soporte.',
    'activationFailed': 'No se pudo activar la cuenta. Inténtalo de nuevo.',
    'activationInvalidToken': 'Enlace de activación inválido o expirado',
    'activationMissingToken': 'Falta el token de activación',
    'activationServerError': 'Ocurrió un error durante la activación. Inténtalo de nuevo más tarde.',
    'activationSuccess': 'Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.',
    'activationTokenExpired': 'El enlace de activación ha expirado. Solicita uno nuevo.',
    'cannotAccessOtherUsers': 'No se puede acceder a recursos de otros usuarios',
    'cannotAccessSuperAdmin': 'No se puede acceder a recursos de Super Administrador',
    'cannotChangeAdminRole': 'No se puede cambiar el rol de otros administradores',
    'cannotChangeOwnRole': 'No puedes cambiar tu propio rol',
    'cannotCreateAdmin': 'No se pueden crear cuentas de administrador',
    'cannotCreateHigherRole': '{{currentRole}} no puede crear cuentas de {{requestedRole}} debido a restricciones de jerarquía de roles',
    'cannotCreateSuperAdmin': 'No se pueden crear cuentas de Super Administrador',
    'cannotDeleteOwnAccount': '{{userName}} ({{role}}) no puede eliminar su propia cuenta.{{suggestion}}',
    'cannotDeleteSuperAdmin': 'No se puede eliminar cuenta de Super Administrador',
    'cannotDeleteYourself': 'No puedes eliminar tu propia cuenta',
    'cannotModifyHigherRoleUser': 'No se puede modificar a {{targetUserName}} ({{targetRole}}) - {{currentRole}} {{reason}}',
    'cannotModifySuperAdmin': 'No se pueden modificar cuentas de Super Administrador',
    'cannotPromoteToHigherRole': '{{currentRole}} no puede promover usuarios a {{requestedRole}} - {{reason}}',
    'cannotPromoteToSuperAdmin': 'No se puede promover usuario a Super Administrador',
    'deleteNotAllowed': 'Operación de eliminación no permitida para tu rol',
    'forbidden': 'Acceso denegado - privilegios insuficientes',
    'invalidCredentials': 'Credenciales inválidas',
    'invalidRole': 'Rol de usuario inválido',
    'loginSuccess': 'Inicio de sesión exitoso',
    'logoutAllSuccess': 'Cierre de sesión en todos los dispositivos exitoso',
    'logoutSuccess': 'Cierre de sesión exitoso',
    'passwordIncorrect': 'La contraseña es incorrecta',
    'rateLimitExceeded': 'Demasiados intentos fallidos de inicio de sesión. Inténtalo de nuevo más tarde.',
    'refreshSuccess': 'Token actualizado exitosamente',
    'refreshTokenExpired': 'El token de actualización ha expirado',
    'refreshTokenInvalid': 'Token de actualización inválido',
    'superAdminRequired': 'Se requiere acceso de Super Administrador',
    'tokenExpired': 'El token ha expirado',
    'tokenInvalid': 'Token inválido',
    'unauthorized': 'Acceso no autorizado',
    'userNotFound': 'Usuario no encontrado o inactivo'
  },
  'tokenBlacklist': {
    'createSuccess': 'Token añadido a la lista negra con éxito',
    'deleteSuccess': 'Token eliminado de la lista negra con éxito',
    'bulkDeleteSuccess': 'Eliminación masiva de tokens exitosa',
    'tokenNotFound': 'Token no encontrado',
    'listSuccess': 'Tokens en lista negra recuperados con éxito',
    'getSuccess': 'Detalles de la entrada en lista negra recuperados con éxito'
  },
  'dates': {
    'changedAt': 'Cambiado el {{date, datetime}}',
    'checkedAt': 'Verificado el {{date, datetime}}',
    'createdAt': 'Creado el {{date, datetime}}',
    'deletedAt': 'Eliminado el {{date, datetime}}',
    'updatedAt': 'Actualizado el {{date, datetime}}',
    'userJoined': 'Se unió el {{date, date}}'
  },
  'emails': {
    'registration': {
      'activateButton': 'Activar mi cuenta',
      'activateLinkText': 'O copia y pega este enlace en tu navegador:',
      'details': 'Detalles de la cuenta',
      'disclaimer': 'Si no solicitaste esta cuenta, ignora este correo o contacta al soporte.',
      'email': 'Correo de registro: {{email}}',
      'expiryWarning': 'Este enlace de activación expirará en {{hours}} horas.',
      'footer': 'Este es un mensaje automático de {{appName}}. No respondas a este correo.',
      'greeting': 'Hola {{userName}},',
      'instructions': 'Este correo confirma que recibimos los datos de tu cuenta. Si se requiere activación o aprobación, recibirás otro correo.',
      'intro': 'Gracias por registrarte en {{appName}}.',
      'ip': 'IP de la solicitud: {{ip}}',
      'securityNote': 'Por tu seguridad, no compartas este enlace con nadie.',
      'subject': '{{appName}} - Confirma tu registro',
      'thanks': 'Gracias,\nEl equipo de {{appName}}',
      'time': 'Hora de registro: {{timestamp}}'
    }
  },
  'endpoints': {
    'admin': {
      'changeRole': 'Cambiar rol de usuario (requiere acceso de Super Admin)',
      'createUser': 'Crear nuevo usuario (requiere acceso de admin)',
      'dashboard': 'Obtener datos completos del dashboard (requiere acceso de admin)',
      'deleteUser': 'Eliminar usuario (requiere acceso de Super Admin)',
      'stats': 'Obtener estadísticas del sistema (requiere acceso de admin)',
      'systemHealth': 'Obtener estado completo de salud del sistema (requiere acceso de admin)',
      'updateUser': 'Actualizar información de usuario (requiere acceso de admin)',
      'userDetails': 'Obtener detalles de usuario (requiere acceso de admin)',
      'usersList': 'Listar todos los usuarios (requiere acceso de admin)',
      'blacklistList': 'Listar tokens en lista negra (solo Super Admin)',
      'blacklistCreate': 'Poner token en lista negra manualmente (solo Super Admin)',
      'blacklistDetails': 'Obtener detalles de entrada en lista negra (solo Super Admin)',
      'blacklistBulkDelete': 'Borrado masivo de entradas en lista negra (solo Super Admin)',
      'blacklistDelete': 'Borrar entrada de lista negra (solo Super Admin)'
    },
    'advanced_audit': {
      'analytics': 'Análisis avanzado de auditoría (requiere acceso de admin)',
      'analyticsBehavior': 'Análisis de comportamiento (requiere acceso de admin)',
      'analyticsPerformance': 'Análisis de rendimiento (requiere acceso de admin)',
      'analyticsSecurity': 'Análisis de seguridad (requiere acceso de admin)',
      'archival': 'Archivado de logs de auditoría (requiere acceso de admin)',
      'archivalRestore': 'Restaurar logs archivados (requiere acceso de admin)',
      'archivalRun': 'Ejecutar proceso de archivado (requiere acceso de admin)',
      'archivalStats': 'Estadísticas de archivado (requiere acceso de admin)',
      'archiveManage': 'Gestión de archivos (requiere acceso de admin)',
      'compliance': 'Reportes de cumplimiento (requiere acceso de admin)',
      'complianceReport': 'Generar reporte de cumplimiento (requiere acceso de admin)',
      'exportAdvanced': 'Exportación avanzada (requiere acceso de admin)',
      'middlewareStats': 'Estadísticas de middleware (requiere acceso de admin)'
    },
    'audit': {
      'export': 'Exportar logs de auditoría (requiere acceso de admin)',
      'logs': 'Ver logs de auditoría (requiere acceso de admin)',
      'search': 'Buscar logs de auditoría (requiere acceso de admin)',
      'stats': 'Obtener estadísticas de auditoría (requiere acceso de admin)'
    },
    'auth': {
      'login': 'Iniciar sesión con email y contraseña',
      'logout': 'Cerrar sesión e invalidar tokens',
      'logoutAll': 'Cerrar sesión en todos los dispositivos (revocar todos los tokens)',
      'refresh': 'Actualizar token de acceso'
    },
    'demo': {
      'info': 'Información de demo de validación Zod',
      'register': 'Demo de registro de usuario con validación completa',
      'search': 'Demo de búsqueda con validación de parámetros de consulta',
      'upload': 'Demo de subida de archivos con validación de metadatos'
    },
    'kv_admin': {
      'audit': {
        'alerts': 'Obtener umbrales de alertas de auditoría (solo Super Admin)',
        'compliance': 'Obtener configuraciones de cumplimiento de auditoría (solo Super Admin)',
        'configs': 'Ver configuraciones del sistema de auditoría (solo Super Admin)',
        'export': 'Obtener ajustes de exportación de auditoría (solo Super Admin)',
        'features': 'Obtener flags de características de auditoría (solo Super Admin)',
        'featureToggle': 'Alternar una característica de auditoría (solo Super Admin)',
        'performance': 'Obtener ajustes de rendimiento de auditoría (solo Super Admin)',
        'realtime': 'Obtener configuraciones de monitoreo en tiempo real (solo Super Admin)',
        'retention': 'Obtener políticas de retención de auditoría (solo Super Admin)'
      },
      'config': 'Ver configuración KV (solo Super Admin)',
      'configBulk': 'Actualización masiva de configuración KV (solo Super Admin)',
      'configCacheClear': 'Limpiar caché de configuración KV (solo Super Admin)',
      'configDefaults': 'Obtener configuración KV por defecto (solo Super Admin)',
      'configDelete': 'Eliminar clave de configuración KV (solo Super Admin)',
      'configEnvComparison': 'Comparar configuración KV entre entornos (solo Super Admin)',
      'configGet': 'Obtener configuración KV específica (solo Super Admin)',
      'configs': 'Ver configuraciones KV (solo Super Admin)',
      'configsBatch': 'Actualizar en lote configuraciones KV (solo Super Admin)',
      'configsCacheClear': 'Limpiar caché de configuraciones KV (solo Super Admin)',
      'configsDefaults': 'Obtener configuraciones KV por defecto (solo Super Admin)',
      'configsEnvComparison': 'Comparar configuraciones KV entre entornos (solo Super Admin)',
      'configUpdate': 'Actualizar configuración KV (solo Super Admin)'
    },
    'realtime_monitoring': {
      'alerts': 'Gestión de alertas del sistema (requiere acceso de admin)',
      'alertsChannels': 'Gestionar canales de alerta (requiere acceso de admin)',
      'alertsChannelsCreate': 'Crear canal de alerta (requiere acceso de admin)',
      'alertsConfigure': 'Configurar alertas del sistema (requiere acceso de admin)',
      'alertsHistory': 'Obtener historial de alertas (requiere acceso de admin)',
      'alertsRules': 'Gestionar reglas de alerta (requiere acceso de admin)',
      'alertsRulesCreate': 'Crear regla de alerta (requiere acceso de admin)',
      'alertsRuleToggle': 'Activar/desactivar regla de alerta (requiere acceso de admin)',
      'alertsSend': 'Enviar alerta del sistema (requiere acceso de admin)',
      'alertsStatus': 'Obtener estado de alertas (requiere acceso de admin)',
      'alertsTest': 'Probar sistema de alertas (requiere acceso de admin)',
      'analyze': 'Analizar datos de monitoreo (requiere acceso de admin)',
      'dashboard': 'Dashboard de monitoreo en tiempo real (requiere acceso de admin)',
      'dashboardCache': 'Limpiar caché del dashboard (requiere acceso de admin)',
      'dashboardExport': 'Exportar datos del dashboard (requiere acceso de admin)',
      'dashboardHealth': 'Verificación de salud del dashboard (requiere acceso de admin)',
      'dashboardLive': 'Instantánea del panel en vivo (requiere acceso de admin)',
      'dashboardOverview': 'Resumen del dashboard (requiere acceso de admin)',
      'dashboardPerformance': 'Dashboard de rendimiento (requiere acceso de admin)',
      'dashboardRealtime': 'Datos en vivo del dashboard (requiere acceso de admin)',
      'dashboardSecurity': 'Dashboard de seguridad (requiere acceso de admin)',
      'dashboardTimeline': 'Línea de tiempo del dashboard (requiere acceso de admin)',
      'eventsRecent': 'Obtener eventos de monitoreo recientes (requiere acceso de admin)',
      'incidentsCreate': 'Crear incidente de monitoreo en tiempo real (requiere acceso de administrador)',
      'metrics': 'Métricas del sistema en tiempo real (requiere acceso de admin)',
      'resolveThreat': 'Resolver amenaza detectada (requiere acceso de admin)',
      'simulate': 'Simular escenarios de monitoreo (requiere acceso de admin)',
      'start': 'Iniciar monitoreo en tiempo real (requiere acceso de admin)',
      'status': 'Obtener estado de monitoreo (requiere acceso de admin)',
      'stop': 'Detener monitoreo en tiempo real (requiere acceso de admin)',
      'threats': 'Obtener información de amenazas (requiere acceso de admin)'
    },
    'security_incident': {
      'bulkDelete': 'Eliminación masiva de {{count}} incidentes de seguridad (acceso de administrador {{actor}} requerido)',
      'create': 'Crear nuevo incidente de seguridad (acceso de administrador {{actor}} requerido, tipo {{type}}, gravedad {{severity}})',
      'deleteById': 'Eliminar incidente de seguridad {{incidentId}} (acceso de administrador {{actor}} requerido)',
      'exportCsv': 'Exportar {{count}} incidentes de seguridad a CSV (acceso de administrador {{actor}} requerido, rango de fechas: {{dateRange}})',
      'getById': 'Obtener incidente de seguridad por ID {{incidentId}} (acceso de administrador {{actor}} requerido)',
      'getDashboard': 'Obtener panel de incidentes de seguridad (acceso de administrador {{actor}} requerido, filtros: {{filters}})',
      'getStatistics': 'Obtener estadísticas de incidentes de seguridad (acceso de administrador {{actor}} requerido, período: {{period}})',
      'incidentDetails': 'Obtener detalles del incidente (requiere acceso de admin)',
      'incidentResponse': 'Ejecutar respuesta al incidente (requiere acceso de admin)',
      'incidents': 'Listar incidentes de seguridad (requiere acceso de admin)',
      'incidentsCreate': 'Crear incidente de seguridad (requiere acceso de admin)',
      'incidentStatus': 'Actualizar estado del incidente (requiere acceso de admin)',
      'incidentUpdate': 'Actualizar incidente (requiere acceso de admin)',
      'list': 'Listar incidentes de seguridad (acceso de administrador {{actor}} requerido, página {{page}}, límite {{limit}})',
      'serviceStatus': 'Obtener estado del servicio (requiere acceso de admin)',
      'simulate': 'Simular incidente de seguridad (requiere acceso de admin)',
      'statistics': 'Obtener estadísticas de incidentes (requiere acceso de admin)',
      'updateById': 'Actualizar incidente de seguridad {{incidentId}} (acceso de administrador {{actor}} requerido, campos actualizados: {{fields}})',
      'updateStatus': 'Actualizar estado del incidente de seguridad {{incidentId}} a {{status}} (acceso de administrador {{actor}} requerido)'
    },
    'system': {
      'apiInfo': 'Información y endpoints completos de la API',
      'favicon': 'Recursos de favicon e iconos',
      'health': 'Endpoint de verificación de salud',
      'language': 'Endpoint de cambio de idioma',
      'root': 'Endpoint raíz de la API - mensaje de bienvenida',
      'routes': 'Descubrimiento de rutas del sistema (solo admin)',
      'unknown': 'Endpoint desconocido',
      'version': 'Información de versión de la API'
    },
    'translations': {
      'get': 'Obtener todas las traducciones para un idioma específico',
      'list': 'Listar todos los idiomas disponibles y su estado de validación',
      'section': 'Obtener traducciones de sección específica',
      'validate': 'Validar completitud de traducciones'
    },
    'user': {
      'me': 'Obtener información del usuario actual (requiere autenticación)',
      'profile': 'Obtener perfil de usuario (requiere autenticación)',
      'register': 'Registrar nuevo usuario',
      'updatePassword': 'Cambiar contraseña (requiere autenticación)',
      'updateProfile': 'Actualizar perfil de usuario (requiere autenticación)'
    }
  },
  'errors': {
    'admin': {
      'accessDenied': 'Se requiere acceso de administrador para esta operación',
      'dashboardRetrieveFailed': 'No se pudieron recuperar los datos del panel de administración',
      'permissionDenied': 'Permisos de administrador insuficientes para esta operación',
      'roleChangeFailed': 'No se pudo cambiar el rol del usuario',
      'statsRetrieveFailed': 'No se pudieron recuperar las estadísticas de administración',
      'systemHealthRetrieveFailed': 'No se pudo recuperar la información de salud del sistema',
      'userManagementFailed': 'Operación de gestión de usuarios falló'
    },
    'advancedAudit': {
      'analytics': {
        'failed': 'No se pudieron recuperar datos de análisis - {{actor}} no pudo completar {{operation}} para el período {{timeframe}}: {{reason}}'
      },
      'archival': {
        'archiveOperationFailed': 'No se pudo realizar operación de archivo - {{actor}} no pudo completar {{operation}} ({{action}}): {{reason}}',
        'restoreFailed': 'No se pudieron restaurar logs archivados - {{actor}} no pudo realizar {{operation}} para {{dateRange}}: {{reason}}',
        'runFailed': 'No se pudo ejecutar proceso de archivo - {{actor}} no pudo completar {{operation}} con umbral {{cutoffDays}}: {{reason}}',
        'statsFailed': 'No se pudieron recuperar estadísticas de archivo - {{actor}} no pudo realizar {{operation}}: {{reason}}'
      },
      'behavior': {
        'failed': 'No se pudo recuperar análisis de comportamiento - {{actor}} no pudo completar {{operation}} para {{timeframe}} dirigido a {{targetRole}}: {{reason}}'
      },
      'compliance': {
        'customComplianceFailed': 'No se pudo generar informe de cumplimiento personalizado - {{actor}} no pudo completar {{operation}} para "{{reportName}}" ({{reportType}}): {{reason}}',
        'failed': 'No se pudo generar informe de cumplimiento - {{actor}} no pudo completar {{operation}} para {{timeframe}} con formato {{format}}: {{reason}}',
        'reportFailed': 'No se pudo generar informe de cumplimiento - {{actor}} no pudo realizar {{operation}} para informe {{type}}: {{reason}}'
      },
      'export': {
        'failed': 'No se pudo realizar exportación avanzada - {{actor}} no pudo completar {{operation}} con formato {{format}} ({{recordCount}} registros): {{reason}}'
      },
      'middleware': {
        'statsFailed': 'No se pudieron recuperar estadísticas de middleware - {{actor}} no pudo realizar {{operation}} para {{middlewareType}}: {{reason}}'
      },
      'performance': {
        'failed': 'No se pudo recuperar análisis de rendimiento - {{actor}} ({{role}}) no pudo realizar {{operation}} para {{timeframe}}: {{reason}}'
      },
      'security': {
        'failed': 'No se pudo recuperar análisis de seguridad - {{actor}} ({{role}}) no pudo realizar {{operation}} para {{timeframe}}: {{reason}}'
      }
    },
    'api': {
      'databaseError': 'Error de base de datos en la llamada a la API: {{operation}}',
      'methodNotAllowed': 'El método HTTP {{method}} no está permitido para la ruta {{path}}',
      'routeNotFound': 'Ruta de API no encontrada: {{method}} {{path}}',
      'validationError': 'Error de validación de API: {{details}}'
    },
    'audit': {
      'export': {
        'exportFailed': 'Error al exportar los registros de auditoría - {{actor}} no pudo completar {{operation}} en formato {{format}}: {{reason}}'
      },
      'health': {
        'healthFailed': 'Error al verificar la salud del sistema de auditoría - {{actor}} no pudo realizar {{operation}} ({{checkType}}): {{reason}}'
      },
      'logs': {
        'retrieveFailed': 'Error al recuperar los registros de auditoría - {{actor}} encontró un error al realizar {{operation}}: {{reason}}'
      },
      'search': {
        'searchFailed': 'Error al buscar en los registros de auditoría - {{actor}} no pudo completar {{operation}} con consulta "{{query}}": {{reason}}'
      },
      'stats': {
        'statsFailed': 'Error al recuperar las estadísticas de auditoría - {{actor}} ({{role}}) no pudo realizar {{operation}}: {{reason}}'
      }
    },
    'auth': {
      'accountDisabled': 'La cuenta de usuario {{userName}} está deshabilitada por el administrador',
      'accountInactive': 'Tu cuenta está inactiva. Actívala por correo electrónico o contacta con el soporte.',
      'accountLocked': 'Cuenta bloqueada durante {{duration, time}} debido a intentos fallidos de inicio de sesión',
      'accountNotVerified': 'La dirección de correo electrónico para {{userName}} no está verificada',
      'cannotAccessOtherUsers': 'No se puede acceder a recursos de otros usuarios',
      'cannotChangeOwnRole': '{{userName}} ({{currentRole}}) no puede cambiar su propio rol - {{reason}}',
      'cannotCreateHigherRole': '{{currentRole}} no puede crear cuentas de {{requestedRole}} debido a restricciones de jerarquía de roles',
      'cannotDeleteSuperAdmin': 'No se puede eliminar cuenta de Super Administrador',
      'cannotDeleteYourself': 'No puedes eliminar tu propia cuenta',
      'cannotModifyHigherRoleUser': 'No se puede modificar a {{targetUserName}} ({{targetRole}}) - {{currentRole}} {{reason}}',
      'cannotPromoteToHigherRole': '{{currentRole}} no puede promover usuarios a {{requestedRole}} - {{reason}}',
      'deleteNotAllowed': 'Operación de eliminación no permitida para tu rol',
      'failed': 'Autenticación fallida: {{reason}}',
      'failed_other': '{{count}} intentos de autenticación fallidos en las últimas {{timeWindow}}',
      'forbidden': 'Acceso prohibido - privilegios insuficientes para {{operation}}',
      'invalidCredentials': 'Correo electrónico o contraseña no válidos',
      'invalidCredentials_context_admin': 'Credenciales no válidas proporcionadas para el inicio de sesión de la cuenta administrativa',
      'invalidCredentials_context_user': 'Credenciales no válidas proporcionadas para el inicio de sesión de la cuenta de usuario',
      'loginFailed': 'El proceso de inicio de sesión falló para {{actor}} (Motivo: {{reason}}, Operación: {{operation}}, IP: {{ipAddress}})',
      'mfaFailed': 'Autenticación multifactor fallida: {{reason}}',
      'mfaRequired': 'Se requiere autenticación multifactor para {{userName}}',
      'passwordIncorrect': 'La contraseña es incorrecta para el usuario {{userName}}',
      'permissionDenied': 'Permiso denegado para la acción: {{action}}',
      'rateLimitExceeded': 'Límite de tasa excedido: {{currentRequests}}/{{maxRequests}} solicitudes por {{timeWindow}}',
      'refreshTokenExpired': 'El token de actualización expiró el {{expiredAt, datetime}}',
      'refreshTokenFailed': 'La actualización del token falló para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'refreshTokenInvalid': 'Token de actualización no válido o revocado',
      'roleRequired': 'Rol {{requiredRole}} requerido para esta operación',
      'sessionExpired': 'La sesión de usuario expiró el {{expiredAt, datetime}}',
      'sessionInvalid': 'Sesión de usuario no válida o corrupta',
      'superAdminRequired': 'Se requiere acceso de Super Administrador',
      'tokenExpired': 'El token de autenticación expiró el {{expiredAt, datetime}}',
      'tokenInvalid': 'Token de autenticación no válido o mal formado',
      'tokenMissing': 'Se requiere un token de autenticación pero no se proporcionó',
      'tooManyAttempts': 'Demasiados intentos de inicio de sesión fallidos ({{attemptCount}}) desde {{ipAddress}}',
      'tooManyAttempts_other': 'Demasiados intentos de inicio de sesión fallidos ({{attemptCount}} intentos) desde {{ipAddress}}',
      'unauthorized': 'Acceso no autorizado al recurso: {{resource}}',
      'userNotFound': 'No se encontró ninguna cuenta con el correo electrónico {{email}}'
    },
    'business': {
      'businessHoursOnly': 'Operación solo permitida durante el horario comercial ({{businessHours}})',
      'conflictingOperation': 'Operación conflictiva en progreso: {{operation}}',
      'deadlineExpired': 'La fecha límite de la operación expiró el {{deadline, datetime}}',
      'duplicateEntry': 'Entrada duplicada detectada: {{entity}} con {{field}} = "{{value}}"',
      'insufficientBalance': 'Saldo insuficiente: {{available, currency}} disponible, {{required, currency}} requerido',
      'operationNotAllowed': 'La operación "{{operation}}" no está permitida: {{reason}}',
      'preconditionFailed': 'La condición previa falló: {{condition}}',
      'quotaReached': 'Límite de cuota alcanzado: {{used, number}}/{{limit, number}} {{resource}}',
      'referenceConstraint': 'No se puede eliminar {{entity}} - referenciado por {{referencingCount}} otro registro',
      'referenceConstraint_other': 'No se puede eliminar {{entity}} - referenciado por {{referencingCount}} otros registros',
      'resourceLocked': 'El recurso "{{resource}}" está bloqueado por {{lockedBy}} hasta {{lockedUntil, datetime}}',
      'workflowViolation': 'Violación de flujo de trabajo: {{step}} no se puede realizar en el estado actual {{currentState}}'
    },
    'file': {
      'accessDenied': 'Acceso denegado al archivo "{{filename}}": {{reason}}',
      'corrupted': 'El archivo parece estar corrupto o incompleto',
      'formatUnsupported': 'Formato de archivo no admitido para la operación: {{operation}}',
      'invalidType': 'El tipo de archivo "{{fileType}}" no está permitido - tipos admitidos: {{allowedTypes}}',
      'notFound': 'Archivo "{{filename}}" no encontrado',
      'processingFailed': 'Error al procesar el archivo: {{reason}}',
      'quotaExceeded': 'Cuota de almacenamiento excedida: {{used, number}}MB / {{quota, number}}MB',
      'tooLarge': 'El tamaño del archivo {{actualSize, number}}MB excede el límite de {{maxSize, number}}MB',
      'tooSmall': 'El tamaño del archivo {{actualSize, number}} bytes está por debajo del mínimo de {{minSize, number}} bytes',
      'uploadFailed': 'Error al cargar el archivo: {{reason}}',
      'virusDetected': 'Archivo bloqueado por escaneo de seguridad: {{threat}}'
    },
    'i18n': {
      'context_demo_failed': 'No se pudo ejecutar la demostración de traducción contextual: {{reason}}',
      'context_test_failed': 'No se pudo probar las traducciones contextuales para la clave "{{key}}": {{reason}}',
      'enhanced_demo_failed': 'No se pudo ejecutar la demostración de funciones i18n avanzadas: {{reason}}',
      'error_demo_failed': 'No se pudo ejecutar la demostración de mensajes de error: {{reason}}',
      'formatting_demo_failed': 'No se pudo ejecutar la demostración de formato: {{reason}}',
      'formatting_test_failed': 'No se pudo probar la funcionalidad de formato para la clave "{{key}}": {{reason}}',
      'languageNotSupported': 'El idioma "{{language}}" no es compatible. Idiomas disponibles: {{supportedLanguages}}',
      'plurals_demo_failed': 'No se pudo ejecutar la demostración de pluralización: {{reason}}',
      'plurals_test_failed': 'No se pudo probar la funcionalidad de pluralización para la clave "{{key}}": {{reason}}',
      'sectionNotFound': 'Sección de traducción "{{section}}" no encontrada para el idioma "{{language}}"',
      'success_demo_failed': 'No se pudo ejecutar la demostración de mensajes de éxito: {{reason}}',
      'translationsFailed': 'No se pudo recuperar la información de traducciones: {{reason}}'
    },
    'integration': {
      'apiLimitExceeded': 'Límite de tasa de API excedido para {{serviceName}}: {{limit}} solicitudes por {{period}}',
      'authenticationFailed': 'Autenticación fallida con {{serviceName}}: {{reason}}',
      'credentialsExpired': 'Las credenciales de API para {{serviceName}} expiraron el {{expiredDate, date}}',
      'dataTransformFailed': 'La transformación de datos falló para {{serviceName}}: {{reason}}',
      'invalidResponse': 'Respuesta no válida de {{serviceName}}: {{details}}',
      'serviceDown': 'El servicio externo {{serviceName}} está actualmente inactivo',
      'syncFailed': 'La sincronización de datos falló con {{serviceName}}: {{reason}}',
      'webhookTimeout': 'Tiempo de espera del webhook de {{serviceName}} después de {{timeout, number}}ms'
    },
    'kv': {
      'accessDenied': 'Acceso denegado para la clave de configuración "{{key}}" - requiere el rol {{requiredRole}}',
      'alertThresholdsRetrieveFailed': 'Error al recuperar umbrales de alerta: {{reason}}',
      'auditConfigsRetrieveFailed': 'Error al recuperar configuraciones de auditoría: {{reason}}',
      'batchUpdateFailed': 'La actualización por lotes falló para {{failedCount}} de {{totalCount}} configuración',
      'batchUpdateFailed_other': 'La actualización por lotes falló para {{failedCount}} de {{totalCount}} configuraciones',
      'cacheClearFailed': 'Error al limpiar caché de configuración: {{reason}}',
      'cacheFailed': 'Error al actualizar la caché de configuración: {{reason}}',
      'complianceSettingsRetrieveFailed': 'Error al recuperar configuraciones de cumplimiento: {{reason}}',
      'configResetFailed': 'Error al restablecer configuración "{{key}}": {{reason}}',
      'configRetrieveFailed': 'Error al recuperar configuración "{{key}}": {{reason}}',
      'configsCompareFailed': 'Error al recuperar comparación de entornos: {{reason}}',
      'configsRetrieveFailed': 'Error al recuperar configuraciones: {{reason}}',
      'configUpdateFailed': 'Error al actualizar configuración "{{key}}": {{reason}}',
      'exportSettingsRetrieveFailed': 'Error al recuperar configuraciones de exportación: {{reason}}',
      'featureFlagsRetrieveFailed': 'Error al recuperar indicadores de características: {{reason}}',
      'featureNotFound': 'Característica no encontrada o no permitida',
      'featureToggleFailed': 'Error al alternar característica "{{feature}}": {{reason}}',
      'invalidFeatureValue': 'Valor de característica inválido - debe ser booleano',
      'invalidKey': 'La clave de configuración "{{key}}" no está permitida - claves válidas: {{validKeys}}',
      'keyNotFound': 'Clave de configuración "{{key}}" no encontrada',
      'performanceSettingsRetrieveFailed': 'Error al recuperar configuraciones de rendimiento: {{reason}}',
      'realtimeSettingsRetrieveFailed': 'Error al recuperar configuraciones de monitoreo en tiempo real: {{reason}}',
      'resetFailed': 'Error al restablecer la configuración "{{key}}" al valor predeterminado: {{reason}}',
      'retentionPoliciesRetrieveFailed': 'Error al recuperar políticas de retención: {{reason}}',
      'updateFailed': 'Error al actualizar la configuración "{{key}}": {{reason}}',
      'valueInvalid': 'Valor no válido para la configuración "{{key}}": se esperaba {{expectedType}}, se obtuvo {{actualType}}'
    },
    'kvAdmin': {
      'alertThresholdsRetrieveFailed': 'Error al recuperar los umbrales de alerta para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'auditConfigsRetrieveFailed': 'Error al recuperar las configuraciones de auditoría para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'cacheClearFailed': 'Error al limpiar la caché de configuración KV para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'complianceSettingsRetrieveFailed': 'Error al recuperar la configuración de cumplimiento para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'configResetFailed': 'Error al restablecer la configuración KV {{key}} para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'configRetrieveFailed': 'Error al recuperar la configuración KV {{key}} para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'configsCompareFailed': 'Error al comparar las configuraciones ENV vs KV para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'configsRetrieveFailed': 'Error al recuperar las configuraciones KV para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'configUpdateFailed': 'Error al actualizar la configuración KV {{key}} para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'exportSettingsRetrieveFailed': 'Error al recuperar la configuración de exportación para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'featureFlagsRetrieveFailed': 'Error al recuperar los indicadores de funciones para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'featureToggleFailed': 'Error al alternar la función {{feature}} para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'performanceSettingsRetrieveFailed': 'Error al recuperar la configuración de rendimiento para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'realtimeSettingsRetrieveFailed': 'Error al recuperar la configuración en tiempo real para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
      'retentionPoliciesRetrieveFailed': 'Error al recuperar las políticas de retención para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})'
    },
    'network': {
      'apiError': 'Error de API externa de {{apiName}}: {{error}}',
      'bandwidthExceeded': 'Límite de ancho de banda excedido: {{usage, number}}MB/{{limit, number}}MB',
      'connectionFailed': 'La conexión a {{service, uppercase}} falló: {{reason}}',
      'connectionRefused': 'Conexión rechazada por {{service}} en el puerto {{port}}',
      'dnsResolutionFailed': 'La resolución DNS falló para {{hostname}}',
      'hostUnreachable': 'El host {{hostname}} es inalcanzable',
      'httpError': 'Error HTTP {{statusCode}}: {{statusMessage}}',
      'protocolError': 'Error de protocolo de red: {{protocol}} - {{details}}',
      'proxyError': 'Error del servidor proxy: {{proxyAddress}} - {{reason}}',
      'slowResponse': 'Respuesta lenta detectada de {{service}} ({{duration, number}}ms)',
      'socketError': 'Error de conexión de socket: {{details}}',
      'sslError': 'Error de conexión SSL/TLS: {{details}}',
      'timeout': 'Tiempo de espera de la solicitud de red después de {{duration, number}}ms a {{service}}',
      'webhookFailed': 'La entrega del webhook falló a {{url}}: {{reason}}'
    },
    'realtimeMonitoring': {
      'alerts': {
        'channelsFailed': 'Error al recuperar los canales de alerta debido a un error del servidor',
        'createChannelFailed': 'Error al crear el canal de alerta debido a un error del servidor',
        'createRuleFailed': 'Error al crear la regla de alerta debido a un error del servidor',
        'historyFailed': 'Error al recuperar el historial de alertas debido a un error del servidor',
        'rulesFailed': 'Error al recuperar las reglas de alerta debido a un error del servidor',
        'sendFailed': 'Error al enviar la alerta manual debido a un error del servidor',
        'statusFailed': 'Error al recuperar el estado del sistema de alertas debido a un error del servidor',
        'testFailed': 'Error al probar el sistema de alertas debido a un error del servidor',
        'toggleFailed': 'Error al alternar la regla de alerta debido a un error del servidor'
      },
      'alertsConfig': {
        'configFailed': 'Error al configurar las alertas para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})'
      },
      'dashboard': {
        'cacheClearFailed': 'Error al limpiar la caché del panel para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'exportFailed': 'Error al exportar el panel para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'healthCheckFailed': 'Error al realizar la verificación de salud del panel para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'overviewFailed': 'Error al recuperar la vista general del panel para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'performanceFailed': 'Error al recuperar el panel de rendimiento para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'realtimeFailed': 'Error al recuperar el panel en tiempo real para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'securityFailed': 'Error al recuperar el panel de seguridad para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'timelineFailed': 'Error al recuperar la línea de tiempo del panel para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})'
      },
      'incidents': {
        'createFailed': 'Error al crear el incidente de monitoreo en tiempo real para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})'
      },
      'monitoring': {
        'eventsFailed': 'Error al recuperar los eventos de monitoreo recientes para {{actor}} (Motivo: {{reason}}, Operación: {{operation}})',
        'simulateFailed': 'Error al simular el evento de monitoreo debido a un error del servidor',
        'startFailed': 'Error al iniciar el monitoreo debido a un error del servidor',
        'statusFailed': 'Error al recuperar el estado de monitoreo debido a un error del servidor',
        'stopFailed': 'Error al detener el monitoreo debido a un error del servidor'
      },
      'threats': {
        'analyzeFailed': 'Error al analizar las amenazas debido a un error del servidor',
        'resolveFailed': 'Error al resolver la amenaza debido a un error del servidor',
        'retrieveFailed': 'Error al recuperar el estado de amenaza debido a un error del servidor'
      }
    },
    'security': {
      'incident': {
        'notFound': 'Incidente de seguridad no encontrado (ID: {{incidentId}}, Operación: {{operation}}, Solicitado por: {{requestedBy}})'
      },
      'incidents': {
        'createFailed': '{{actor}} falló al crear incidente de seguridad (Error: {{errorType}}) en {{timestamp}}',
        'responseExecuteFailed': 'Error al ejecutar la respuesta manual para el incidente de seguridad debido a un error del servidor.',
        'retrieveDetailFailed': 'Error al recuperar los detalles del incidente de seguridad debido a un error del servidor.',
        'retrieveFailed': '{{actor}} falló al recuperar incidentes de seguridad (Error: {{errorType}}) en {{timestamp}}',
        'simulationFailed': 'Falló al simular amenaza',
        'simulationNotAllowed': 'Simulación de seguridad no permitida en entorno {{environment}} (Solicitado por: {{requestedBy}}, Razón: {{reason}})',
        'statusUpdateFailed': 'Error al actualizar el estado del incidente de seguridad debido a un error del servidor.'
      },
      'monitoring': {
        'alreadyRunning': 'La monitorización de seguridad ya se está ejecutando'
      },
      'service': {
        'statusRetrieveFailed': 'Error al recuperar el estado del servicio de seguridad debido a un error del servidor.'
      },
      'statistics': {
        'retrieveFailed': 'Error al recuperar las estadísticas del incidente debido a un error del servidor.'
      }
    },
    'system': {
      'cacheError': 'Operación de caché fallida: {{operation}} - {{error}}',
      'configurationError': 'Error de configuración del sistema: {{setting}} - {{error}}',
      'databaseConnectionFailed': 'Error al conectar con la base de datos: {{reason}}',
      'databaseError': 'Operación de base de datos fallida: {{operation}} - {{error}}',
      'databaseTimeout': 'Tiempo de espera de la consulta de la base de datos después de {{timeout, number}}ms',
      'dependencyFailure': 'Fallo de dependencia externa: {{service}} - {{reason}}',
      'diskSpaceLow': 'Espacio en disco críticamente bajo: {{freeSpace, number}}GB restantes',
      'licenseExpired': 'La licencia del sistema expiró el {{expiredDate, date}}',
      'licenseInvalid': 'Licencia del sistema no válida: {{reason}}',
      'maintenanceMode': 'El sistema está en mantenimiento hasta {{endTime, datetime}} - {{message}}',
      'memoryExhausted': 'Uso de memoria del servidor crítico: {{currentUsage, number}}MB / {{maxMemory, number}}MB',
      'operationFailed': 'Operación del sistema "{{operation}}" fallida: {{reason}}',
      'rateLimited': 'Sistema temporalmente limitado: {{currentRequests}}/{{maxRequests}} solicitudes en {{timeWindow}}',
      'resourceExhausted': 'Recursos del sistema agotados: {{resource}} al {{usage, number}}% de capacidad',
      'serverError': 'Ocurrió un error interno del servidor',
      'serviceUnavailable': 'Servicio temporalmente no disponible: {{reason}}',
      'taskQueueFull': 'La cola de tareas está llena ({{currentTasks}}/{{maxTasks}} tareas)',
      'workerUnavailable': 'No hay trabajadores disponibles para procesar la solicitud'
    },
    'user': {
      'accountLocked': 'La cuenta de usuario {{userName}} está bloqueada debido a {{reason}}',
      'accountSuspended': 'La cuenta de usuario {{userName}} está suspendida hasta {{suspendedUntil, datetime}}',
      'activationFailed': 'Error al activar la cuenta de usuario para {{userName}}: {{reason}}',
      'bulkOperationFailed': 'Operación masiva fallida para {{failedCount}} de {{totalCount}} usuario',
      'bulkOperationFailed_other': 'Operación masiva fallida para {{failedCount}} de {{totalCount}} usuarios',
      'createFailed': 'Error al crear la cuenta de usuario para {{email}}: {{reason}}',
      'deactivationFailed': 'Error al desactivar la cuenta de usuario para {{userName}}: {{reason}}',
      'deleteFailed': 'Error al eliminar el usuario {{userName}}: {{reason}}',
      'emailExists': 'La dirección de correo electrónico {{email}} ya está registrada en el sistema',
      'emailVerificationFailed': 'La verificación del correo electrónico falló: {{reason}}',
      'emailVerificationSystemError': 'No se pudo verificar el cambio de correo electrónico debido a un error del sistema. Por favor, inténtelo de nuevo más tarde.',
      'inactive': 'La cuenta de usuario {{userName}} está inactiva',
      'insufficientPermissions': 'Permisos insuficientes para modificar el usuario {{userName}} ({{userRole}})',
      'listFailed': 'Error al recuperar la lista de usuarios: {{reason}}',
      'notFound': 'Usuario "{{userName}}" no encontrado o ha sido eliminado',
      'notFoundById': 'Usuario con ID {{userId}} no encontrado',
      'passwordChangeFailed': 'Error al cambiar la contraseña para {{userName}}: {{reason}}',
      'passwordIncorrect': 'La contraseña actual es incorrecta - por favor, inténtelo de nuevo',
      'profileRetrieveFailed': 'Error al recuperar el perfil de usuario para {{userName}}: {{reason}}',
      'registrationError': 'El registro de usuario falló debido a un error del sistema: {{details}}',
      'registrationFailed': 'El registro de usuario falló: {{reason}}',
      'roleChangeFailed': 'Error al cambiar el rol para {{userName}} de {{oldRole}} a {{newRole}}: {{reason}}',
      'sessionLimitExceeded': 'El usuario {{userName}} ha excedido el máximo de sesiones concurrentes ({{currentSessions}}/{{maxSessions}})',
      'updateFailed': 'Error al actualizar el perfil de usuario para {{userName}}: {{reason}}',
      'usernameExists': 'El nombre de usuario "{{username}}" ya está en uso'
    },
    'zodDemo': {
      'file': {
        'uploadFailed': 'Carga de archivo falló - {{actor}} no pudo completar {{operation}} para "{{fileName}}" ({{fileSize}} bytes): {{reason}}'
      },
      'search': {
        'failed': 'Operación de búsqueda falló - {{actor}} no pudo completar {{operation}} para consulta "{{query}}" ({{searchType}}): {{reason}}'
      },
      'user': {
        'registrationFailed': 'Registro de usuario falló - {{actor}} no pudo completar {{operation}} para {{userName}} ({{email}}): {{reason}}'
      }
    },
    'businessRuleViolation': 'Violación de la regla de negocio: {{rules}}',
    'constraintViolation': 'Violación de restricción de base de datos: {{constraint}}',
    'dataIntegrityError': 'Error de integridad de datos: {{details}}',
    'schemaViolation': 'Violación del esquema de datos: {{violations}}',
    'validation': 'Error de validación: {{details}}',
    'validation_other': '{{count}} errores de validación: {{details}}',
    'validationField': 'La validación falló para el campo "{{field}}": {{error}}',
    'validationGeneric': 'Error de validación',
    'validationMultiple': 'Múltiples errores de validación en {{count}} campo',
    'validationMultiple_other': 'Múltiples errores de validación en {{count}} campos'
  },
  'formatting': {
    'currency': 'Total: {{amount, currency}}',
    'dateRange': 'Desde {{startDate, date}} hasta {{endDate, date}}',
    'filesSize': '{{count}} archivo de {{size, number}} bytes',
    'filesSize_other': '{{count}} archivos que suman {{size, number}} bytes',
    'percentage': 'Progreso: {{value, number}}%',
    'timeAgo': 'Hace {{time, time}}'
  },
  'numbers': {
    'count': '{{value, number}}',
    'currency': '${{value, number}}',
    'percentage': '{{value}}%'
  },
  'roles': {
    'displayName': 'Rol',
    'displayName_context_admin': 'Administrador',
    'displayName_context_super_admin': 'Superadministrador',
    'displayName_context_user': 'Usuario'
  },
  'security': {
    'alerts': {
      'alertTemplate': 'Alerta: {{name}} - {{eventType}}',
      'channelCreated': 'Canal de alerta creado exitosamente',
      'channelsFailed': 'Error al recuperar los canales de alerta',
      'createChannelFailed': 'Error al crear el canal de alerta',
      'createRuleFailed': 'Error al crear la regla de alerta',
      'historyFailed': 'Error al recuperar el historial de alertas',
      'manualSent': 'Alerta manual enviada exitosamente',
      'ruleCreated': 'Regla de alerta creada exitosamente',
      'rulesFailed': 'Error al recuperar las reglas de alerta',
      'ruleToggled': 'Regla de alerta alternada exitosamente',
      'ruleToggledTestMode': 'Regla alternada exitosamente (modo de prueba)',
      'sendFailed': 'Error al enviar alerta manual',
      'statusFailed': 'Error al recuperar el estado del sistema de alertas',
      'testCompleted': 'Prueba del sistema de alertas completada',
      'testFailed': 'Error al probar el sistema de alertas',
      'toggleFailed': 'Error al alternar la regla de alerta'
    }
  },
  'success': {
    'admin': {
      'backupCompleted': 'Copia de seguridad del sistema completada exitosamente ({{backupSize, number}}MB en {{duration, number}}s)',
      'backupRestored': 'Copia de seguridad del sistema restaurada exitosamente desde el {{backupDate, date}}',
      'cacheCleared': 'Caché del sistema borrada exitosamente - {{freedMemory, number}}MB liberados',
      'configurationUpdated': 'Configuración del sistema actualizada exitosamente - {{changedSettings}} ajuste modificado',
      'configurationUpdated_other': 'Configuración del sistema actualizada exitosamente - {{changedSettings}} ajustes modificados',
      'databaseOptimized': 'Optimización de la base de datos completada - {{optimizedTables}} tabla procesada',
      'databaseOptimized_other': 'Optimización de la base de datos completada - {{optimizedTables}} tablas procesadas',
      'logRotationCompleted': 'Rotación de registros completada - {{archivedLogs}} archivo de registro archivado',
      'logRotationCompleted_other': 'Rotación de registros completada - {{archivedLogs}} archivos de registro archivados',
      'maintenanceCompleted': 'Mantenimiento del sistema completado exitosamente - tiempo de inactividad: {{downtimeDuration}}',
      'maintenanceScheduled': 'Mantenimiento del sistema programado para el {{maintenanceDate, date}} a las {{maintenanceTime, time}}',
      'reportCreated': 'Informe administrativo creado con {{recordCount, number}} registro',
      'reportCreated_other': 'Informe administrativo creado con {{recordCount, number}} registros',
      'securityScanCompleted': 'Escaneo de seguridad completado - {{threatsFound}} amenaza detectada',
      'securityScanCompleted_other': 'Escaneo de seguridad completado - {{threatsFound}} amenazas detectadas',
      'serviceRestarted': 'Servicio del sistema {{serviceName}} reiniciado exitosamente',
      'statsGenerated': 'Estadísticas del sistema generadas exitosamente para el período {{period}} - {{dataPoints}} punto de datos',
      'statsGenerated_other': 'Estadísticas del sistema generadas exitosamente para el período {{period}} - {{dataPoints}} puntos de datos',
      'systemHealthy': 'Verificación de salud del sistema completada: {{status, uppercase}} ({{uptime, number}}% de tiempo de actividad)',
      'userDetailsRetrieved': 'Detalles del usuario recuperados: {{userName}} ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}'
    },
    'advancedAudit': {
      'analytics': {
        'retrieved': 'Analítica de auditoría avanzada recuperada correctamente'
      },
      'archival': {
        'restoreCompleted': 'Proceso de restauración de archivos completado con éxito con {{restoredCount}} restaurados y {{skippedCount}} omitidos',
        'runCompleted': 'Proceso de archivado completado con éxito con {{archivedCount}} archivados y {{remainingCount}} restantes',
        'statsRetrieved': 'Estadísticas de archivado recuperadas correctamente'
      },
      'behavior': {
        'analyzed': 'Análisis de comportamiento de usuarios completado correctamente'
      },
      'compliance': {
        'generated': 'Informe de auditoría de cumplimiento generado correctamente'
      },
      'performance': {
        'analyzed': 'Análisis de rendimiento de auditoría completado correctamente'
      },
      'security': {
        'analyzed': 'Análisis de seguridad de auditoría completado correctamente'
      }
    },
    'auditMessages': {
      'exported': 'Registros de auditoría exportados correctamente',
      'healthRetrieved': 'Estado de salud del sistema de auditoría recuperado correctamente',
      'retrieved': 'Mensajes de auditoría recuperados correctamente',
      'searchCompleted': 'Búsqueda de auditoría completada correctamente con {{resultCount}} resultado',
      'searchCompleted_other': 'Búsqueda de auditoría completada correctamente con {{resultCount}} resultados',
      'statsRetrieved': 'Estadísticas de auditoría recuperadas correctamente'
    },
    'auth': {
      'accessGranted': 'Acceso otorgado a {{resource}} para {{userName}}',
      'accountUnlocked': 'Cuenta {{userName}} desbloqueada exitosamente por {{unlockedBy}}',
      'loginSuccess': 'Sesión iniciada exitosamente como {{userName}} ({{userRole}}) el {{loginTime}}',
      'logoutAllSuccess': 'Sesión cerrada en todos los dispositivos el {{logoutTime}}',
      'logoutSuccess': 'Sesión cerrada exitosamente desde {{deviceInfo}} el {{logoutTime}}',
      'mfaEnabled': 'Autenticación multifactor habilitada exitosamente para {{userName}}',
      'mfaVerified': 'Autenticación multifactor verificada exitosamente',
      'passwordChanged': 'Contraseña cambiada exitosamente para {{userName}} el {{changeTime}}',
      'passwordReset': 'Correo electrónico de restablecimiento de contraseña enviado a {{email}} - expira en {{expiryMinutes}} minuto',
      'passwordReset_other': 'Correo electrónico de restablecimiento de contraseña enviado a {{email}} - expira en {{expiryMinutes}} minutos',
      'permissionGranted': 'Permiso "{{permission}}" otorgado a {{userName}}',
      'rateLimitReset': 'Límite de tasa restablecido exitosamente para {{ipAddress}}',
      'roleAssigned': 'Rol {{newRole}} asignado exitosamente a {{userName}} por {{assignedBy}}',
      'sessionCreated': 'Nueva sesión de usuario creada con {{sessionDuration}} minuto de validez',
      'sessionCreated_other': 'Nueva sesión de usuario creada con {{sessionDuration}} minutos de validez',
      'sessionExtended': 'Sesión de usuario extendida hasta {{newExpiry}}',
      'tokenGenerated': 'Nuevo token de acceso generado - expira el {{expiryTime}}',
      'tokenRefreshed': 'Token de autenticación actualizado exitosamente el {{refreshTime}}'
    },
    'business': {
      'auditPassed': 'Auditoría comercial superada con una puntuación de {{auditScore, number}}% - {{criteriaCount}} criterio cumplido',
      'auditPassed_other': 'Auditoría comercial superada con una puntuación de {{auditScore, number}}% - {{criteriaCount}} criterios cumplidos',
      'complianceVerified': 'Verificación de cumplimiento completada - {{standardsCount}} estándar verificado',
      'complianceVerified_other': 'Verificación de cumplimiento completada - {{standardsCount}} estándares verificados',
      'operationApproved': 'Operación comercial "{{operation}}" aprobada por {{approvedBy}}',
      'processAutomated': 'Proceso comercial automatizado exitosamente - {{automatedTasks}} tarea automatizada',
      'processAutomated_other': 'Proceso comercial automatizado exitosamente - {{automatedTasks}} tareas automatizadas',
      'ruleApplied': 'Regla comercial "{{ruleName}}" aplicada exitosamente a {{affectedRecords}} registro',
      'ruleApplied_other': 'Regla comercial "{{ruleName}}" aplicada exitosamente a {{affectedRecords}} registros',
      'validationPassed': 'Validación comercial superada para {{entityType}} - todas las {{checkCount}} verificaciones exitosas',
      'validationPassed_other': 'Validación comercial superada para {{entityType}} - todas las {{checkCount}} verificaciones exitosas',
      'workflowCompleted': 'Flujo de trabajo "{{workflowName}}" completado exitosamente en {{steps}} paso',
      'workflowCompleted_other': 'Flujo de trabajo "{{workflowName}}" completado exitosamente en {{steps}} pasos'
    },
    'file': {
      'backup': 'Copia de seguridad del archivo creada exitosamente para "{{filename}}"',
      'compressed': 'Archivo comprimido exitosamente - tamaño reducido en {{compressionRatio, number}}%',
      'converted': 'Archivo convertido exitosamente de {{sourceFormat}} a {{targetFormat}}',
      'copied': 'Archivo copiado exitosamente a {{destinationPath}}',
      'deleted': 'Archivo "{{filename}}" eliminado exitosamente',
      'downloadCompleted': 'Archivo "{{filename}}" descargado exitosamente',
      'extracted': 'Archivo extraído exitosamente - {{extractedCount}} archivo extraído',
      'extracted_other': 'Archivo extraído exitosamente - {{extractedCount}} archivos extraídos',
      'moved': 'Archivo movido exitosamente de {{sourcePath}} a {{destinationPath}}',
      'processingCompleted': 'Procesamiento de archivo completado para "{{filename}}" - {{operationsCount}} operación realizada',
      'processingCompleted_other': 'Procesamiento de archivo completado para "{{filename}}" - {{operationsCount}} operaciones realizadas',
      'restored': 'Archivo restaurado exitosamente desde la copia de seguridad creada el {{backupDate, date}}',
      'uploadCompleted': 'Archivo "{{filename}}" cargado exitosamente ({{fileSize}})',
      'uploadsBatch': 'Carga por lotes completada: {{successCount}}/{{totalCount}} archivo procesado',
      'uploadsBatch_other': 'Carga por lotes completada: {{successCount}}/{{totalCount}} archivos procesados',
      'validated': 'Validación de archivo superada para "{{filename}}" - formato: {{fileFormat}}'
    },
    'integration': {
      'apiCall': 'Llamada a la API a {{serviceName}} completada exitosamente en {{responseTime, number}}ms',
      'credentialsValidated': 'Credenciales de API validadas exitosamente para {{serviceName}}',
      'dataSync': 'Sincronización de datos completada con {{serviceName}} - {{syncedRecords}} registro procesado',
      'dataSync_other': 'Sincronización de datos completada con {{serviceName}} - {{syncedRecords}} registros procesados',
      'dataTransform': 'Transformación de datos completada - {{transformedRecords}} registro procesado',
      'dataTransform_other': 'Transformación de datos completada - {{transformedRecords}} registros procesados',
      'healthCheckPassed': 'Verificación de salud del servicio externo superada para {{serviceName}}',
      'rateLimit': 'Estado del límite de tasa de API: {{usedRequests}}/{{maxRequests}} solicitudes restantes',
      'serviceConnected': 'Conectado exitosamente a {{serviceName}} - estado: {{serviceStatus}}',
      'subscriptionActive': 'La suscripción al servicio está activa para {{serviceName}} hasta el {{expiryDate, date}}',
      'webhookDelivered': 'Webhook entregado exitosamente a {{webhookUrl}} - estado: {{deliveryStatus}}'
    },
    'kv': {
      'configs': {
        'comparisonRetrieved': 'Comparación de entorno recuperada por {{actor}} - KV: {{kvCount}}, ENV: {{envCount}}, Predeterminado: {{defaultCount}}',
        'configRetrieved': 'Configuración "{{key}}" recuperada por {{actor}}: {{value}} (predeterminado: {{isDefault}})',
        'defaultsRetrieved': 'Configuraciones predeterminadas recuperadas por {{actor}} ({{keyCount}} claves)',
        'retrieved': '{{configCount}} configuraciones recuperadas exitosamente por {{actor}} ({{allowedKeys}} claves permitidas)'
      },
      'rateLimit': {
        'batchDeleteDryRun': 'Simulacro de eliminación por lotes de límite de tasa: {{count}} claves serán eliminadas ({{failed}} fallidas)',
        'batchDeleted': 'Eliminación por lotes de límite de tasa: {{count}} claves eliminadas ({{failed}} fallidas)',
        'cleanDryRun': 'Simulacro de limpieza de límite de tasa: {{count}} claves serán eliminadas (prefijo: {{prefix}})',
        'cleaned': 'Limpieza de límite de tasa: {{count}} claves eliminadas (prefijo: {{prefix}})',
        'pruneDryRun': 'Simulacro de poda de límite de tasa: {{count}} claves serán eliminadas (prefijo: {{prefix}})',
        'pruned': 'Poda de límite de tasa: {{count}} claves eliminadas (prefijo: {{prefix}})',
        'seeded': 'Siembra de límite de tasa: {{count}} claves creadas (prefijo: {{prefix}})'
      },
      'status': {
        'disabled': 'deshabilitada',
        'enabled': 'habilitada'
      },
      'adminCacheCleared': 'Caché de configuración limpiado por {{actor}}',
      'adminConfigReset': 'Configuración "{{key}}" restablecida por defecto por {{actor}} - era: {{oldValue}}, ahora: {{defaultValue}}',
      'adminConfigUpdated': 'Configuración "{{key}}" actualizada por {{actor}} de {{oldValue}} a {{newValue}}',
      'adminFeatureToggled': 'Característica "{{feature}}" alternada por {{actor}}: {{previousValue}} → {{newValue}}',
      'auditConfigsRetrieved': 'Configuraciones de auditoría recuperadas por {{actor}} ({{configCount}} configuraciones)',
      'auditPerformanceRetrieved': 'Configuraciones de rendimiento de auditoría recuperadas por {{actor}} ({{settingCount}} configuraciones)',
      'auditRetentionRetrieved': 'Políticas de retención de auditoría recuperadas por {{actor}} ({{policyCount}} políticas)',
      'backupCreated': 'Copia de seguridad de la configuración creada exitosamente con {{configCount}} ajuste',
      'backupCreated_other': 'Copia de seguridad de la configuración creada exitosamente con {{configCount}} ajustes',
      'batchConfigUpdated': 'Actualización de configuración por lotes por {{actor}}: {{updatedCount}}/{{totalCount}} actualizadas ({{failedCount}} fallidas)',
      'batchUpdateCompleted': 'Actualización de configuración por lotes completada: {{successCount}}/{{totalCount}} exitosas',
      'cacheCleared': 'Caché de configuración borrada exitosamente - {{clearedCount}} entrada eliminada',
      'cacheCleared_other': 'Caché de configuración borrada exitosamente - {{clearedCount}} entradas eliminadas',
      'configReset': 'Configuración "{{key}}" restablecida al valor predeterminado: {{defaultValue}}',
      'configRetrieved': 'Configuración "{{key}}" recuperada exitosamente: {{value}}',
      'configUpdated': 'Configuración "{{key}}" actualizada exitosamente de {{oldValue}} a {{newValue}}',
      'defaultsRestored': 'Configuraciones predeterminadas restauradas exitosamente para {{restoredCount}} clave',
      'defaultsRestored_other': 'Configuraciones predeterminadas restauradas exitosamente para {{restoredCount}} claves',
      'featureToggled': 'Función "{{feature}}" {{status}} exitosamente'
    },
    'operation': {
      'batchProcessed': 'Operación por lotes completada: {{successCount}}/{{totalCount}} elementos procesados exitosamente',
      'completed': 'Operación "{{operationType}}" completada exitosamente en {{duration}}ms',
      'completed_other': '{{count}} operaciones completadas exitosamente - tiempo promedio: {{avgDuration}}ms',
      'taskFinished': 'Tarea "{{taskName}}" terminada exitosamente con {{resultCount}} resultado',
      'taskFinished_other': 'Tarea "{{taskName}}" terminada exitosamente con {{resultCount}} resultados',
      'workflowCompleted': 'Flujo de trabajo completado exitosamente - {{stepsCount}} paso ejecutado',
      'workflowCompleted_other': 'Flujo de trabajo completado exitosamente - {{stepsCount}} pasos ejecutados'
    },
    'realtimeIncidents': {
      'created': 'Incidente en tiempo real creado correctamente'
    },
    'realtimeMonitoring': {
      'alerts': {
        'configUpdated': 'Configuración de alertas actualizada correctamente',
        'historyRetrieved': 'Historial de alertas recuperado correctamente',
        'manualSent': 'Alerta manual enviada exitosamente',
        'rulesRetrieved': 'Reglas de alerta recuperadas correctamente',
        'statusRetrieved': 'Estado del sistema de alertas recuperado correctamente'
      },
      'dashboard': {
        'cacheCleared': 'Caché del panel en tiempo real limpiada correctamente',
        'liveRetrieved': 'Instantánea en vivo del panel recuperada correctamente',
        'overviewRetrieved': 'Resumen del panel de monitorización en tiempo real recuperado correctamente',
        'realtimeRetrieved': 'Datos del panel en tiempo real recuperados correctamente'
      },
      'incidents': {
        'created': 'Incidente de monitoreo en tiempo real {{incidentId}} creado exitosamente'
      },
      'monitoring': {
        'analysisCompleted': 'Análisis de monitorización en tiempo real completado correctamente',
        'eventSimulated': 'Evento de monitorización {{eventType}} simulado correctamente',
        'eventsRetrieved': 'Eventos de monitorización en tiempo real recuperados correctamente',
        'started': 'La monitorización en tiempo real se inició correctamente',
        'stopped': 'La monitorización en tiempo real se detuvo correctamente',
        'threatResolved': 'Amenaza en tiempo real {{threatId}} resuelta correctamente',
        'threatsRetrieved': 'Estado de amenazas en tiempo real recuperado correctamente'
      }
    },
    'search': {
      'completed': 'Búsqueda completada con éxito con {{resultCount}} resultado',
      'completed_other': 'Búsqueda completada con éxito con {{resultCount}} resultados'
    },
    'security': {
      'incident': {
        'created': '{{actor}} creó incidente de seguridad "{{title}}" con gravedad {{severity}} (ID: {{incidentId}}, Tipo: {{type}})',
        'responseExecuted': '{{actor}} ejecutó {{actionCount}} acciones de respuesta para el incidente {{incidentId}} (Tipo: {{actionType}}) en {{executedAt}}',
        'retrieved': '{{actor}} recuperó detalles del incidente {{incidentId}} (Estado: {{status}}, Gravedad: {{severity}}, Creado: {{createdAt}})',
        'statusUpdated': '{{actor}} actualizó el estado del incidente {{incidentId}} de "{{oldStatus}}" a "{{newStatus}}" en {{timestamp}}'
      },
      'incidents': {
        'created': '{{actor}} creó incidente de seguridad "{{title}}" con gravedad {{severity}} (ID: {{incidentId}}, Tipo: {{type}})',
        'responseExecuted': '{{actor}} ejecutó {{actionCount}} acciones de respuesta para el incidente {{incidentId}} (Tipo: {{actionType}}) en {{executedAt}}',
        'retrieved': '{{actor}} recuperó exitosamente {{incidentCount}} incidentes de seguridad (página {{page}}, límite {{limit}}, filtros: {{filters}})',
        'statusUpdated': '{{actor}} actualizó el estado del incidente {{incidentId}} de "{{oldStatus}}" a "{{newStatus}}" en {{timestamp}}'
      },
      'monitoring': {
        'started': 'Monitoreo en tiempo real iniciado correctamente'
      },
      'service': {
        'statusRetrieved': '{{actor}} recuperó estado del servicio: salud {{serviceHealth}}, versión {{version}}, tiempo de actividad {{uptime}} (Verificado en: {{checkedAt}})'
      },
      'simulation': {
        'completed': '{{actor}} completó simulación de {{threatType}} con gravedad {{severity}} (ID de Simulación: {{simulationId}}) en {{completedAt}}'
      },
      'statistics': {
        'retrieved': '{{actor}} recuperó estadísticas de seguridad: {{totalIncidents}} total, {{activeIncidents}} activos, {{resolvedIncidents}} resueltos (Recuperado en: {{retrievedAt}})'
      }
    },
    'system': {
      'cacheConnected': 'Servicio de caché conectado exitosamente con {{cacheService}}',
      'configurationLoaded': 'Configuración del sistema cargada exitosamente - {{configCount}} ajuste',
      'configurationLoaded_other': 'Configuración del sistema cargada exitosamente - {{configCount}} ajustes',
      'connectionEstablished': 'Conexión establecida exitosamente con {{serviceName}}',
      'databaseConnected': 'Conexión a la base de datos establecida exitosamente con {{databaseName}}',
      'healthCheckPassed': 'Verificación de salud del sistema superada - todos los {{componentCount}} componentes saludables',
      'healthCheckPassed_other': 'Verificación de salud del sistema superada - todos los {{componentCount}} componentes saludables',
      'operationCompleted': 'Operación del sistema "{{operation}}" completada exitosamente en {{duration, number}}ms',
      'queueProcessed': 'Cola de tareas procesada exitosamente - {{processedCount}} tarea completada',
      'queueProcessed_other': 'Cola de tareas procesada exitosamente - {{processedCount}} tareas completadas',
      'resourceAllocated': 'Recursos del sistema asignados exitosamente: {{allocatedMemory, number}}MB de memoria',
      'resourceReleased': 'Recursos del sistema liberados exitosamente: {{releasedMemory, number}}MB de memoria',
      'rollbackCompleted': 'Reversión del sistema completada exitosamente a la versión {{previousVersion}}',
      'serviceStarted': 'Servicio del sistema {{serviceName}} iniciado exitosamente en el puerto {{port}}',
      'serviceStopped': 'Servicio del sistema {{serviceName}} detenido correctamente',
      'taskCompleted': 'Tarea en segundo plano {{taskName}} completada exitosamente',
      'taskScheduled': 'Tarea en segundo plano {{taskName}} programada para {{scheduledTime, datetime}}',
      'upgradeCompleted': 'Actualización del sistema completada exitosamente a la versión {{newVersion}}'
    },
    'translations': {
      'retrieved': 'Traducciones obtenidas correctamente'
    },
    'user': {
      'activated': 'Cuenta de usuario activada exitosamente para {{userName}}',
      'activated_other': '{{count}} cuentas de usuario activadas exitosamente',
      'bulkOperationSuccess': 'Operación masiva completada: {{successCount}}/{{totalCount}} exitosas',
      'created': 'Cuenta de usuario creada exitosamente para {{userName}} ({{email}})',
      'created_other': '{{count}} cuentas de usuario creadas exitosamente',
      'dataExported': 'Datos de usuario exportados exitosamente ({{fileSize, number}}KB) para {{userName}}',
      'dataImported': 'Datos de usuario importados exitosamente - {{importedCount}} registro procesado',
      'dataImported_other': 'Datos de usuario importados exitosamente - {{importedCount}} registros procesados',
      'deactivated': 'Cuenta de usuario desactivada exitosamente para {{userName}}',
      'deactivated_other': '{{count}} cuentas de usuario desactivadas exitosamente',
      'deleted': 'Cuenta de usuario eliminada exitosamente para {{userName}} por {{deletedBy}}',
      'deleted_other': '{{count}} cuentas de usuario eliminadas exitosamente',
      'emailUpdated': 'Dirección de correo electrónico actualizada de {{oldEmail}} a {{newEmail}} para {{userName}}',
      'emailVerified': 'Dirección de correo electrónico {{email, lowercase}} verificada exitosamente para {{userName}}',
      'loginHistory': 'Historial de inicio de sesión recuperado: {{entryCount}} entrada para {{userName}}',
      'loginHistory_other': 'Historial de inicio de sesión recuperado: {{entryCount}} entradas para {{userName}}',
      'passwordChanged': 'Contraseña cambiada exitosamente para {{userName}}',
      'permissionUpdated': 'Permisos de usuario actualizados exitosamente para {{userName}}',
      'profileCompleted': 'El perfil de usuario está ahora {{percent, number}}% completo para {{userName}}',
      'profileRetrieved': 'Perfil de usuario recuperado exitosamente para {{userName}} ({{userRole}}) por [{{requestedBy}}]',
      'profileUpdated': 'Perfil de usuario actualizado con éxito para {{userName}} - {{fieldsCount}} campo modificado',
      'profileUpdated_other': 'Perfil de usuario actualizado con éxito para {{userName}} - {{fieldsCount}} campos modificados',
      'registered': 'Usuario {{userName}} registrado exitosamente con el rol [{{userRole}}]',
      'registeredEmailDisabled': 'Cuenta creada para {{userName}}. Las notificaciones por correo están actualmente deshabilitadas por el administrador. Contacte al soporte para la activación de la cuenta.',
      'registeredPendingActivation': 'Registro recibido para {{userName}}. Revisa tu correo para confirmar y activar tu cuenta antes de iniciar sesión.',
      'roleChanged': 'Rol de usuario cambiado de {{oldRole}} a {{newRole}} para {{userName}}',
      'sessionTerminated': 'Todas las sesiones terminadas exitosamente para {{userName}}',
      'suspended': 'Cuenta de usuario suspendida exitosamente para {{userName}} hasta {{suspendedUntil, datetime}}',
      'unsuspended': 'Suspensión de cuenta de usuario levantada para {{userName}} por {{liftedBy}}',
      'updated': 'Perfil de usuario actualizado exitosamente para {{userName}} - campos: {{updatedFields}}',
      'updated_other': '{{count}} perfiles de usuario actualizados exitosamente',
      'updatedWithEmailVerification': 'Perfil actualizado. Por favor, verifique su nueva dirección de correo electrónico {{newEmail}} para confirmar y completar el cambio.'
    }
  },
  'system': {
    'apiInfo': 'Información de la API',
    'error': 'Ha ocurrido un error',
    'invalidRequest': 'Solicitud inválida',
    'notFound': 'Recurso no encontrado',
    'operationFailed': '{{operation}} falló: {{error}}',
    'serverError': 'Error interno del servidor',
    'success': 'Operación completada exitosamente',
    'welcome': 'Bienvenido a Hono Auth API v{{version}} ({{language}})'
  },
  'user': {
    'statusDisplay': {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'suspended': 'Suspendido'
    }
  },
  'validation': {
    'advancedAudit': {
      'invalidRetentionAction': 'Acción de retención inválida: {{action}}, debe ser una de: {{validActions}}'
    },
    'advancedCleanup': {
      'backupRecommended': 'Se recomienda encarecidamente crear una copia de seguridad antes de la limpieza',
      'confirmationRequired': 'Se requiere confirmación para operaciones de limpieza reales',
      'invalid': 'Parámetros de limpieza avanzada inválidos'
    },
    'arrayValidation': {
      'actions': {
        'tooFew': 'Debe contener al menos {{minCount}} acción',
        'tooFew_other': 'Debe contener al menos {{minCount}} acciones',
        'tooMany': 'No puede contener más de {{maxCount}} acción',
        'tooMany_other': 'No puede contener más de {{maxCount}} acciones'
      },
      'channels': {
        'tooFew': 'Debe incluir al menos {{minCount}} canal',
        'tooFew_other': 'Deben incluirse al menos {{minCount}} canales',
        'tooMany': 'No se puede incluir más de {{maxCount}} canal',
        'tooMany_other': 'No se pueden incluir más de {{maxCount}} canales'
      },
      'conditions': {
        'tooFew': 'Debe especificar al menos {{minCount}} condición',
        'tooFew_other': 'Debe especificar al menos {{minCount}} condiciones',
        'tooMany': 'No puede especificar más de {{maxCount}} condición',
        'tooMany_other': 'No puede especificar más de {{maxCount}} condiciones'
      },
      'configs': {
        'tooFew': 'Debe contener al menos {{minCount}} configuración',
        'tooFew_other': 'Debe contener al menos {{minCount}} configuraciones',
        'tooMany': 'No puede contener más de {{maxCount}} configuración',
        'tooMany_other': 'No puede contener más de {{maxCount}} configuraciones'
      },
      'interests': {
        'tooFew': 'Debe contener al menos {{minCount}} interés',
        'tooFew_other': 'Debe contener al menos {{minCount}} intereses',
        'tooMany': 'No puede contener más de {{maxCount}} interés',
        'tooMany_other': 'No puede contener más de {{maxCount}} intereses'
      },
      'items': {
        'tooFew': 'Debe contener al menos {{minCount}} elemento',
        'tooFew_other': 'Debe contener al menos {{minCount}} elementos',
        'tooMany': 'No puede contener más de {{maxCount}} elemento',
        'tooMany_other': 'No puede contener más de {{maxCount}} elementos'
      }
    },
    'auditSearch': {
      'atLeastOneFilterRequired': 'Debe especificarse al menos {{min}} filtro',
      'atLeastOneFilterRequired_other': 'Deben especificarse al menos {{min}} filtros'
    },
    'changePassword': {
      'passwordsDoNotMatch': 'La nueva contraseña y su confirmación no coinciden'
    },
    'cleanupSimulation': {
      'confirmationRequired': 'Se requiere confirmación para operaciones no de prueba',
      'dataLossWarning': 'Advertencia: Esta operación puede resultar en pérdida de datos',
      'invalid': 'Parámetros de simulación de limpieza inválidos'
    },
    'confirmPassword': {
      'mustMatch': 'La confirmación de contraseña debe coincidir con la contraseña',
      'required': 'La confirmación de contraseña es requerida'
    },
    'dateRange': {
      'invalid': 'Rango de fechas inválido - la fecha de fin debe ser posterior a la fecha de inicio',
      'overlapConflict': 'El rango de fechas se superpone con un rango existente: {{conflictingRange}}',
      'tooLarge': 'El rango de fechas no puede exceder {{maxDays}} día',
      'tooLarge_other': 'El rango de fechas no puede exceder {{maxDays}} días'
    },
    'enumValidation': {
      'action': {
        'invalid': 'La acción debe ser una de: {{allowedValues}}'
      },
      'actionType': {
        'invalid': 'El tipo de acción debe ser uno de los siguientes: {{allowedValues}}'
      },
      'category': {
        'invalid': 'La categoría debe ser una de: {{allowedValues}}'
      },
      'channelType': {
        'invalid': 'El tipo de canal debe ser uno de: {{allowedValues}}'
      },
      'file_type': {
        'invalid': 'El tipo de archivo debe ser uno de: {{allowedValues}}'
      },
      'format': {
        'invalid': 'El formato debe ser uno de: {{allowedValues}}'
      },
      'metric': {
        'invalid': 'La métrica debe ser una de las siguientes: {{allowedValues}}'
      },
      'operator': {
        'invalid': 'El operador debe ser uno de: {{allowedValues}}'
      },
      'priority': {
        'invalid': 'La prioridad debe ser una de las siguientes: {{allowedValues}}'
      },
      'reportType': {
        'invalid': 'El tipo de informe debe ser uno de los siguientes: {{allowedValues}}'
      },
      'resolution': {
        'invalid': 'La resolución debe ser una de: {{allowedValues}}'
      },
      'role': {
        'invalid': 'El rol debe ser uno de: {{allowedValues}}'
      },
      'severity': {
        'invalid': 'La gravedad debe ser una de: {{allowedValues}}'
      },
      'sort_by': {
        'invalid': 'El campo de ordenación debe ser uno de: {{allowedValues}}'
      },
      'sort_order': {
        'invalid': 'El orden de clasificación debe ser uno de: {{allowedValues}}'
      },
      'status': {
        'invalid': 'El estado debe ser uno de: {{allowedValues}}'
      },
      'timeframe': {
        'invalid': 'El intervalo de tiempo debe ser uno de: {{allowedValues}}'
      },
      'userRole': {
        'invalid': 'El rol de usuario debe ser uno de los siguientes: {{allowedValues}}'
      }
    },
    'fieldRequired': {
      'action': 'La acción es obligatoria',
      'actionTaken': 'La acción realizada es obligatoria',
      'age': 'La edad es obligatoria',
      'assignedTo': 'El usuario asignado es obligatorio',
      'auditLogRetentionDays': 'El valor de días de retención de registros de auditoría es obligatorio',
      'auditRetention': 'El valor de retención de auditoría es obligatorio',
      'batchSize': 'El tamaño del lote es obligatorio',
      'categoryFilter': 'El filtro de categoría es obligatorio',
      'channel': 'El canal es obligatorio',
      'channelType': 'El tipo de canal es obligatorio',
      'conditionValue': 'El valor de condición es obligatorio',
      'confirmPassword': 'La confirmación de la contraseña es obligatoria',
      'date': 'La fecha es obligatoria',
      'days': 'El valor de días es obligatorio',
      'description': 'La descripción es obligatoria',
      'dryRun': 'El indicador de ejecución en seco es obligatorio',
      'email': 'La dirección de correo electrónico es obligatoria',
      'enabled': 'El indicador habilitado es obligatorio',
      'endDate': 'La fecha de finalización es obligatoria',
      'endTime': 'La hora de fin es obligatoria',
      'errorRate': 'La tasa de error es obligatoria',
      'executionTime': 'El tiempo de ejecución es obligatorio',
      'failureCount': 'El conteo de fallos es obligatorio',
      'field': 'El valor del campo es obligatorio',
      'fileSize': 'El tamaño del archivo es obligatorio',
      'forceArchival': 'El indicador de archivo forzado es obligatorio',
      'format': 'El formato es obligatorio',
      'hours': 'Las horas son obligatorias',
      'id': 'El ID es obligatorio',
      'incidentType': 'El tipo de incidente es obligatorio',
      'includeDetails': 'El indicador de inclusión de detalles es obligatorio',
      'includeMetadata': 'El indicador de inclusión de metadatos es obligatorio',
      'includeUserData': 'El indicador de inclusión de datos de usuario es obligatorio',
      'intervalMs': 'El intervalo (ms) es obligatorio',
      'limit': 'El límite es obligatorio',
      'maxRecords': 'El valor máximo de registros es obligatorio',
      'metric': 'La métrica es obligatoria',
      'metrics': 'Las métricas son obligatorias',
      'name': 'El nombre es obligatorio',
      'page': 'El número de página es obligatorio',
      'password': 'La contraseña es obligatoria',
      'period': 'El período es obligatorio',
      'policy': 'La política es obligatoria',
      'priority': 'La prioridad es obligatoria',
      'query': 'La consulta de búsqueda es obligatoria',
      'refreshToken': 'El token de actualización es obligatorio',
      'reportType': 'El tipo de informe es obligatorio',
      'resolution': 'La resolución es obligatoria',
      'responseTime': 'El tiempo de respuesta es obligatorio',
      'securityIncident': 'El incidente de seguridad es obligatorio',
      'startDate': 'La fecha de inicio es obligatoria',
      'startTime': 'La hora de inicio es obligatoria',
      'target': 'El objetivo es obligatorio',
      'termsAccepted': 'La aceptación de los términos es obligatoria',
      'threshold': 'El umbral es obligatorio',
      'timeframe': 'El marco de tiempo es obligatorio',
      'timeRange': 'El rango de tiempo es obligatorio',
      'token': 'El token es obligatorio',
      'userDataRetention': 'El valor de retención de datos de usuario es obligatorio',
      'userDataRetentionDays': 'El valor de días de retención de datos de usuario es obligatorio',
      'userId': 'El ID de usuario es obligatorio',
      'username': 'El nombre de usuario es obligatorio',
      'userRole': 'El rol de usuario es obligatorio',
      'value': 'El valor es obligatorio',
      'website': 'El sitio web es obligatorio'
    },
    'fileUpload': {
      'invalidExtension': 'Extensión de archivo inválida'
    },
    'formatValidation': {
      'assignedTo': {
        'invalid': 'Formato de ID de usuario asignado no válido'
      },
      'date': {
        'invalid': 'Formato de fecha no válido'
      },
      'email': {
        'invalid': 'Por favor, proporcione una dirección de correo electrónico válida (ejemplo: usuario@example.com)'
      },
      'endDate': {
        'invalid': 'Formato de fecha de fin no válido'
      },
      'endTime': {
        'invalid': 'Formato de hora de fin no válido'
      },
      'id': {
        'invalid': 'Formato de ID no válido'
      },
      'refreshToken': {
        'invalid': 'Formato de token de actualización no válido'
      },
      'startDate': {
        'invalid': 'Formato de fecha de inicio no válido'
      },
      'startTime': {
        'invalid': 'Formato de hora de inicio no válido'
      },
      'token': {
        'invalid': 'Formato de token JWT no válido'
      },
      'url': {
        'invalid': 'Por favor, proporcione una URL válida (ejemplo: https://example.com)'
      },
      'website': {
        'invalid': 'Por favor, proporcione una URL de sitio web válida (ejemplo: https://example.com)'
      }
    },
    'lengthValidation': {
      'action': {
        'tooLong': 'La acción no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'La acción debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La acción debe tener al menos {{minLength}} caracteres'
      },
      'actionTaken': {
        'tooLong': 'La acción realizada no puede exceder de {{maxLength}} caracteres',
        'tooShort': 'La acción realizada debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La acción realizada debe tener al menos {{minLength}} caracteres'
      },
      'bio': {
        'tooLong': 'La biografía no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'La biografía debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La biografía debe tener al menos {{minLength}} caracteres'
      },
      'channel': {
        'tooLong': 'El canal no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El canal debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El canal debe tener al menos {{minLength}} caracteres'
      },
      'channelType': {
        'tooLong': 'El tipo de canal no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El tipo de canal debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El tipo de canal debe tener al menos {{minLength}} caracteres'
      },
      'confirmPassword': {
        'tooShort': 'La confirmación de la contraseña debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La confirmación de la contraseña debe tener al menos {{minLength}} caracteres'
      },
      'department': {
        'tooLong': 'El departamento no puede exceder de {{maxLength}} caracteres',
        'tooShort': 'El departamento debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El departamento debe tener al menos {{minLength}} caracteres'
      },
      'description': {
        'tooLong': 'La descripción no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'La descripción debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La descripción debe tener al menos {{minLength}} caracteres'
      },
      'email': {
        'tooLong': 'La dirección de correo electrónico no puede exceder los {{maxLength}} caracteres'
      },
      'entityType': {
        'tooLong': 'El tipo de entidad no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El tipo de entidad debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El tipo de entidad debe tener al menos {{minLength}} caracteres'
      },
      'field': {
        'tooLong': 'El campo no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El campo debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El campo debe tener al menos {{minLength}} caracteres'
      },
      'incidentType': {
        'tooLong': 'El tipo de incidente no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El tipo de incidente debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El tipo de incidente debe tener al menos {{minLength}} caracteres'
      },
      'interest': {
        'tooLong': 'El interés no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El interés debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El interés debe tener al menos {{minLength}} caracteres'
      },
      'name': {
        'tooLong': 'El nombre no puede exceder los {{maxLength}} caracteres'
      },
      'nextSteps': {
        'tooLong': 'Los próximos pasos no pueden exceder de {{maxLength}} caracteres',
        'tooShort': 'Los próximos pasos deben tener al menos {{minLength}} carácter',
        'tooShort_other': 'Los próximos pasos deben tener al menos {{minLength}} caracteres'
      },
      'note': {
        'tooLong': 'La nota no puede exceder de {{maxLength}} caracteres',
        'tooShort': 'La nota debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La nota debe tener al menos {{minLength}} caracteres'
      },
      'notes': {
        'tooLong': 'Las notas no pueden exceder de {{maxLength}} caracteres',
        'tooShort': 'Las notas deben tener al menos {{minLength}} carácter',
        'tooShort_other': 'Las notas deben tener al menos {{minLength}} caracteres'
      },
      'password': {
        'tooLong': 'La contraseña no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'La contraseña debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La contraseña debe tener al menos {{minLength}} caracteres'
      },
      'query': {
        'tooLong': 'La consulta no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'La consulta debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La consulta debe tener al menos {{minLength}} caracteres'
      },
      'search': {
        'tooLong': 'El texto de búsqueda no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El texto de búsqueda debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El texto de búsqueda debe tener al menos {{minLength}} caracteres'
      },
      'sortBy': {
        'tooLong': 'El campo de ordenación no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El campo de ordenación debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El campo de ordenación debe tener al menos {{minLength}} caracteres'
      },
      'source': {
        'tooLong': 'La fuente no puede exceder de {{maxLength}} caracteres',
        'tooShort': 'La fuente debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La fuente debe tener al menos {{minLength}} caracteres'
      },
      'system': {
        'tooLong': 'El sistema no puede exceder de {{maxLength}} caracteres',
        'tooShort': 'El sistema debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El sistema debe tener al menos {{minLength}} caracteres'
      },
      'target': {
        'tooLong': 'El objetivo no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El objetivo debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El objetivo debe tener al menos {{minLength}} caracteres'
      },
      'template': {
        'tooLong': 'La plantilla no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'La plantilla debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'La plantilla debe tener al menos {{minLength}} caracteres'
      },
      'token': {
        'tooLong': 'El token no puede exceder los {{maxLength}} caracteres',
        'tooShort': 'El token debe tener al menos {{minLength}} carácter',
        'tooShort_other': 'El token debe tener al menos {{minLength}} caracteres'
      }
    },
    'numericValidation': {
      'age': {
        'tooLarge': 'La edad no puede exceder los {{maxValue}} años',
        'tooSmall': 'La edad debe ser de al menos {{minValue}} años'
      },
      'auditLogRetentionDays': {
        'tooSmall': 'Los días de retención de registros de auditoría deben ser al menos {{minValue}}'
      },
      'auditRetention': {
        'tooLarge': 'El valor de retención de auditoría no debe exceder {{maxValue}}',
        'tooSmall': 'El valor de retención de auditoría debe ser al menos {{minValue}}'
      },
      'batchSize': {
        'tooLarge': 'El tamaño del lote no puede exceder {{maxValue}}',
        'tooSmall': 'El tamaño del lote debe ser al menos {{minValue}}'
      },
      'days': {
        'tooLarge': 'Los días no pueden exceder {{maxValue}}',
        'tooSmall': 'Los días deben ser al menos {{minValue}}'
      },
      'errorRate': {
        'tooLarge': 'La tasa de error no puede exceder {{maxValue}}%',
        'tooSmall': 'La tasa de error debe ser al menos {{minValue}}%'
      },
      'executionTime': {
        'tooLarge': 'El tiempo de ejecución no puede exceder {{maxValue}} segundos',
        'tooSmall': 'El tiempo de ejecución debe ser al menos {{minValue}} segundos'
      },
      'failureCount': {
        'tooLarge': 'El conteo de fallos no puede exceder {{maxValue}}',
        'tooSmall': 'El conteo de fallos debe ser al menos {{minValue}}'
      },
      'fileSize': {
        'tooLarge': 'El tamaño del archivo no puede exceder los {{maxValue}} bytes',
        'tooSmall': 'El tamaño del archivo debe ser de al menos {{minValue}} bytes'
      },
      'hours': {
        'tooLarge': 'Las horas no pueden exceder {{maxValue}}',
        'tooSmall': 'Las horas deben ser al menos {{minValue}}'
      },
      'intervalMs': {
        'tooLarge': 'El intervalo (ms) no puede exceder {{maxValue}}',
        'tooSmall': 'El intervalo (ms) debe ser al menos {{minValue}}'
      },
      'limit': {
        'tooLarge': 'El límite no puede exceder los {{maxValue}}',
        'tooSmall': 'El límite debe ser al menos {{minValue}}'
      },
      'maxRecords': {
        'tooLarge': 'El máximo de registros no puede exceder {{maxValue}}',
        'tooSmall': 'El máximo de registros debe ser al menos {{minValue}}'
      },
      'page': {
        'tooLarge': 'El número de página no puede exceder los {{maxValue}}',
        'tooSmall': 'El número de página debe ser al menos {{minValue}}'
      },
      'responseTime': {
        'tooLarge': 'El tiempo de respuesta no puede exceder {{maxValue}} ms',
        'tooSmall': 'El tiempo de respuesta debe ser al menos {{minValue}} ms'
      },
      'securityIncident': {
        'tooLarge': 'El incidente de seguridad no puede exceder {{maxValue}}',
        'tooSmall': 'El incidente de seguridad debe ser al menos {{minValue}}'
      },
      'threshold': {
        'tooSmall': 'El umbral debe ser al menos {{minValue}}'
      },
      'userDataRetention': {
        'tooLarge': 'La retención de datos de usuario no debe exceder {{maxValue}}',
        'tooSmall': 'La retención de datos de usuario debe ser al menos {{minValue}}'
      },
      'userDataRetentionDays': {
        'tooSmall': 'Los días de retención de datos de usuario deben ser al menos {{minValue}}'
      },
      'userId': {
        'tooSmall': 'El ID de usuario debe ser al menos {{minValue}}'
      }
    },
    'retentionPolicy': {
      'atLeastOneRequired': 'Se debe especificar al menos una configuración de retención',
      'atLeastOneRequired_other': 'Se debe especificar al menos {{min}} configuración de retención',
      'conflictingRules': 'Reglas de retención en conflicto detectadas: {{conflicts}}',
      'invalid': 'Política de retención inválida'
    },
    'retentionPolicyUpdate': {
      'atLeastOneFieldRequired': 'Se debe actualizar al menos un campo',
      'atLeastOneFieldRequired_other': 'Se deben actualizar al menos {{min}} campos',
      'immutableField': 'El campo "{{field}}" no puede modificarse después de la creación',
      'invalid': 'Actualización de política de retención inválida'
    },
    'security': {
      'xssPatternDetected': 'Patrón XSS potencial detectado: {{patternName}} no está permitido'
    },
    'structureValidation': {
      'conditions': {
        'invalid': 'Estructura de condiciones no válida'
      },
      'config': {
        'invalid': 'Estructura de configuración no válida'
      },
      'configUpdate': {
        'invalid': 'Formato de actualización de configuración no válido. El campo requerido "value" falta o contiene campos no reconocidos'
      },
      'incidentCreation': {
        'invalid': 'Estructura de creación de incidente no válida'
      },
      'login': {
        'invalid': 'Formato de solicitud de inicio de sesión no válido'
      },
      'metadata': {
        'invalid': 'Estructura de metadatos no válida'
      },
      'object': {
        'invalid': 'Estructura de objeto no válida'
      },
      'record': {
        'invalid': 'Formato de registro no válido'
      }
    },
    'termsAccepted': {
      'mustBeTrue': 'Se deben aceptar los términos y condiciones',
      'versionMismatch': 'Los términos y condiciones se han actualizado - por favor, revise y acepte la última versión'
    },
    'timeRange': {
      'eitherHoursOrRangeRequired': 'Se debe especificar horas o rango de fechas',
      'endTimeMustBeAfterStartTime': 'La hora de fin debe ser posterior a la hora de inicio',
      'invalid': 'El rango de tiempo debe ser uno de: last_1h, last_6h, last_24h, last_7d, last_30d',
      'invalidFormat': 'El formato del rango de tiempo no es válido (esperado: {{expectedFormat}})',
      'rangeTooLarge': 'El rango de tiempo no puede exceder {{maxDays}} día',
      'rangeTooLarge_other': 'El rango de tiempo no puede exceder {{maxDays}} días',
      'required': 'El rango de tiempo es obligatorio'
    },
    'typeValidation': {
      'configValue': {
        'invalid': 'Tipo de valor de configuración no válido'
      },
      'value': {
        'invalid': 'Tipo de dato no válido'
      }
    },
    'username': {
      'invalid': 'El nombre de usuario solo puede contener letras, números y guiones bajos',
      'invalidCharacters': 'El nombre de usuario solo puede contener letras, números y guiones bajos',
      'required': 'El nombre de usuario es obligatorio',
      'reserved': 'El nombre de usuario "{{username}}" está reservado y no puede usarse',
      'tooLong': 'El nombre de usuario no puede exceder 30 caracteres',
      'tooShort': 'El nombre de usuario debe tener al menos 3 caracteres',
      'tooShort_other': 'El nombre de usuario debe tener al menos {{minLength}} caracteres',
      'unavailable': 'El nombre de usuario "{{username}}" no está disponible'
    },
    'filterArrayTooLarge': 'Array de filtros demasiado grande (máx 500 elementos)',
    'filterArrayTooLarge_other': 'La matriz de filtros con {{count}} elementos excede el máximo de {{max}}',
    'invalid': 'Valor proporcionado no válido',
    'invalid_other': '{{count}} valores no válidos proporcionados',
    'invalidArchiveAction': 'Acción de archivo inválida',
    'invalidJson': 'JSON inválido en el cuerpo de la solicitud',
    'invalidRole': 'Rol inválido especificado',
    'limitTooLarge': 'Límite demasiado grande (máx 50,000 registros)',
    'limitTooLarge_other': 'El límite {{limit}} excede el máximo de {{max}} registros',
    'registrationFailed': 'Registro fallido',
    'requestTooLarge': 'Carga útil de solicitud demasiado grande',
    'required': 'Este campo es requerido',
    'required_other': '{{count}} campos obligatorios faltan',
    'searchFailed': 'Búsqueda fallida',
    'serviceTempUnavailable': 'Solicitud demasiado grande para procesar - servicio temporalmente no disponible',
    'tooLong': 'El valor excede el límite de {{max}} caracteres',
    'tooLong_other': 'El valor excede el límite de {{max}} caracteres',
    'tooShort': 'El valor debe tener al menos {{min}} carácter',
    'tooShort_other': 'El valor debe tener al menos {{min}} caracteres',
    'translationsFailed': 'Error al obtener traducciones',
    'unsupportedFormat': 'Formato de exportación no soportado',
    'updateRequiresField': 'Se requiere al menos un campo para la actualización',
    'updateRequiresField_other': 'Se requieren al menos {{min}} campos para la operación de actualización',
    'uploadFailed': 'Subida de archivo fallida'
  },
  'zodDemo': {
    'anotherSearchResultTitle': 'Otro resultado para',
    'description': 'Esto demuestra cómo usar Zod con Hono para validación robusta',
    'noDescription': 'No se proporcionó descripción',
    'searchResultTitle': 'Resultado para',
    'title': 'Demo de Validación Zod'
  },
  'zodDemo_operations': {
    'fileUpload': 'demo de carga de archivo',
    'searchExecution': 'demo de ejecución de búsqueda',
    'userRegistration': 'demo de registro de usuario'
  }
};
