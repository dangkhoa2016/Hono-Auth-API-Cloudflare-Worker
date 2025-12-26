/**
 * DE translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: 2025-12-16T04:10:26.724Z
*/

export default {
  'admin': {
    'accessLevel': {
      'full': 'voller Systemzugriff',
      'limited': 'eingeschränkter Zugriff (Administrator-Ebene)'
    },
    'actions': {
      'permanentDeletion': 'permanente Kontolöschung'
    },
    'dataScope': {
      'full': 'vollständige Daten',
      'limited': 'gefilterte Daten'
    },
    'operations': {
      'adminDashboardAccess': 'Administrator-Dashboard Zugriff',
      'adminRoutesAccess': 'Administrator-Routen Zugriff',
      'createUser': 'Benutzererstellung',
      'deleteUser': 'Benutzer #{{userId}} löschen',
      'updateUser': 'Benutzer #{{userId}} aktualisieren'
    },
    'protectionReason': {
      'hierarchy': 'Rollenhierarchie muss beibehalten werden',
      'higherPrivilege': 'Benutzer mit höheren Berechtigungen können nicht geändert werden',
      'roleChange': 'Benutzer können ihre eigenen Rollen nicht ändern',
      'superAdmin': 'Super-Administrator-Konten sind geschützt'
    },
    'systemStatus': {
      'healthy': 'GESUND',
      'unhealthy': 'UNGESUND'
    },
    'accessDenied': 'Administrator-Zugriff für diesen Vorgang erforderlich',
    'accountDeletionSuggestion': 'Kontaktieren Sie einen anderen Administrator für die Kontoverwaltung',
    'activeUsersCount': '{{count}} aktiver Benutzer',
    'activeUsersCount_other': '{{count}} aktive Benutzer ({{percentage}})',
    'changedByUser': 'Geändert von {{username}} ({{role}})',
    'changesApplied': '{{count}} Änderung angewendet',
    'changesApplied_other': '{{count}} Änderungen angewendet',
    'checkedByUser': 'Geprüft von {{username}} ({{role}})',
    'createdByUser': 'Erstellt von {{username}} ({{role}})',
    'dashboardDataRetrieved': 'Dashboard geladen mit {{totalUsers}} Systemübersicht ({{accessLevel}} Zugriff).{{requestedBy}} {{dataFreshness}}',
    'dashboardRetrieved': 'Dashboard-Daten erfolgreich abgerufen',
    'dataFreshness': 'Generiert am {{timestamp}}',
    'deletedByUser': 'Gelöscht von {{username}} ({{role}})',
    'effectiveImmediately': 'Änderungen sofort wirksam',
    'failedLoginAttempts': '{{count}} fehlgeschlagener Login in der letzten Stunde',
    'failedLoginAttempts_other': '{{count}} fehlgeschlagene Logins in der letzten Stunde',
    'performanceGrade': 'Leistung: {{grade}}',
    'requestedByUser': 'Angefordert von {{username}} ({{role}})',
    'responseTime': 'Antwortzeit: {{time}}{{unit}}',
    'restrictedRoleAccess': 'Zugriff verweigert: {{currentRole}} kann keine {{requestedRole}}-Benutzer anzeigen',
    'roleChangedSuccessfully': 'Rolle von {{oldRole}} zu {{newRole}} für {{targetUserName}} geändert.{{changedBy}} {{timestamp}} {{effectiveImmediately}}',
    'routeDiscoverySuccess': 'Systemrouten erfolgreich abgerufen',
    'securityRisk': 'Sicherheitsrisiko: {{level}} ({{failedAttempts}})',
    'statisticsRetrieved': 'Systemstatistiken: {{totalUsers}}, aktive Benutzer: {{activeUsers}} ({{dataScope}}-Bereich).{{requestedBy}}',
    'statsRetrieved': 'Systemstatistiken erfolgreich abgerufen',
    'systemHealthRetrieved': 'Systemgesundheitsstatus erfolgreich abgerufen',
    'systemHealthRetrievedFailed': 'Fehler beim Abrufen der Systemgesundheitsinformationen',
    'totalUsersCount': 'Insgesamt {{count}} Benutzer',
    'totalUsersCount_other': 'Insgesamt {{count}} Benutzer',
    'updatedByUser': 'Aktualisiert von {{username}} ({{role}})',
    'userCreatedSuccessfully': 'Neuer Benutzer {{userName}} mit Rolle {{newUserRole}} erstellt.{{createdBy}} {{timestamp}}',
    'userDeletedSuccessfully': 'Benutzerkonto dauerhaft gelöscht.{{deletedBy}} {{timestamp}} Aktion: {{action}}',
    'userDetailsRetrieved': 'Benutzerdetails abgerufen: {{userName}} ({{userRole}}, {{userStatus}}).{{joinedDate}} {{requestedBy}}',
    'usersListRetrieved': '{{count}} Benutzer erfolgreich abgerufen ({{displayedCount}} auf Seite {{currentPage}} von {{totalPages}} angezeigt). {{requestedBy}}',
    'usersListRetrieved_other': '{{count}} Benutzer erfolgreich abgerufen ({{displayedCount}} auf Seite {{currentPage}} von {{totalPages}} angezeigt). {{requestedBy}}',
    'userUpdatedSuccessfully': 'Benutzer {{updatedUserName}} erfolgreich aktualisiert.{{changesCount}} {{updatedBy}} {{timestamp}}'
  },
  'api': {
    'databaseError': 'Datenbankfehler aufgetreten',
    'healthCheck': 'API läuft reibungslos',
    'methodNotAllowed': 'Methode nicht erlaubt',
    'routeNotFound': 'Route nicht gefunden',
    'validationError': 'Validierungsfehler',
    'validationErrorDetails': 'Validierung fehlgeschlagen: {{errorCount}} Fehler',
    'validationErrorDetails_other': 'Validierung fehlgeschlagen: {{errorCount}} Fehler'
  },
  'audit': {
    'access': {
      'full': 'voller Systemzugriff',
      'limited': 'eingeschränkter Zugriff (rollenbasiert)'
    },
    'health': {
      'healthy': 'GESUND',
      'suggestion_admin': 'Systemintegritätsprüfungen können für Ihre Rolle eingeschränkt sein.',
      'suggestion_super_admin': 'Überprüfen Sie die Systemressourcen, die Datenbankkonnektivität und den Dienststatus.',
      'systemCheck': 'Vollständige Systemintegritätsprüfung',
      'unhealthy': 'UNGESUND'
    },
    'logs': {
      'error': 'Fehler beim Abrufen der Audit-Protokolle',
      'suggestion_admin': 'Sie können nur Protokolle für normale Benutzer und Ihre eigenen Aktionen anzeigen.',
      'suggestion_super_admin': 'Sie haben vollen Zugriff auf alle Audit-Protokolle im System.'
    },
    'operations': {
      'export': 'Audit-Protokolle exportieren',
      'healthCheck': 'Systemintegritätsprüfung für Audit',
      'logsView': 'Audit-Protokolle anzeigen',
      'search': 'Audit-Protokolle durchsuchen',
      'stats': 'Audit-Statistiken abrufen'
    },
    'search': {
      'allFields': 'alle Felder',
      'noQuery': 'keine Abfrage bereitgestellt',
      'suggestion_admin': 'Versuchen Sie, mit anderen Begriffen zu suchen, oder kontaktieren Sie den Super-Administrator für erweiterten Zugriff.',
      'suggestion_super_admin': 'Versuchen Sie, Ihre Suchkriterien zu verfeinern oder überprüfen Sie die Systemprotokolle auf Probleme.'
    },
    'stats': {
      'suggestion_admin': 'Statistiken werden basierend auf Ihrem Zugriffslevel gefiltert. Kontaktieren Sie den Super-Administrator für vollständige Systemstatistiken.',
      'suggestion_super_admin': 'Überprüfen Sie die Systemintegrität und die Datenbankkonnektivität, wenn Statistiken nicht verfügbar sind.'
    }
  },
  'auth': {
    'operations': {
      'export': 'Audit-Protokolle exportieren',
      'healthCheck': 'Audit-System Gesundheitsprüfung',
      'login': 'Benutzeranmeldung',
      'logsView': 'Audit-Protokolle anzeigen',
      'search': 'Audit-Protokolle durchsuchen',
      'stats': 'Audit-Statistiken abrufen'
    },
    'accountNotActive': 'Konto ist nicht aktiv',
    'activationAlreadyActive': 'Dein Konto ist bereits aktiviert. Du kannst dich jetzt anmelden.',
    'activationDisabledByAdmin': 'Dein Konto wurde von einem Administrator deaktiviert. Bitte wende dich an den Support.',
    'activationFailed': 'Kontoaktivierung fehlgeschlagen. Bitte versuche es erneut.',
    'activationInvalidToken': 'Ungültiger oder abgelaufener Aktivierungslink',
    'activationMissingToken': 'Aktivierungstoken fehlt',
    'activationServerError': 'Bei der Aktivierung ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
    'activationSuccess': 'Dein Konto wurde erfolgreich aktiviert! Du kannst dich jetzt anmelden.',
    'activationTokenExpired': 'Aktivierungslink ist abgelaufen. Bitte fordere einen neuen an.',
    'cannotAccessOtherUsers': 'Kann nicht auf Ressourcen anderer Benutzer zugreifen',
    'cannotAccessSuperAdmin': 'Kann nicht auf Super-Administrator-Ressourcen zugreifen',
    'cannotChangeAdminRole': 'Kann Rolle anderer Administratoren nicht ändern',
    'cannotChangeOwnRole': 'Kann eigene Rolle nicht ändern',
    'cannotCreateAdmin': 'Kann keine Administrator-Konten erstellen',
    'cannotCreateHigherRole': '{{currentRole}} kann keine {{requestedRole}}-Konten aufgrund von Rollenhierarchiebeschränkungen erstellen',
    'cannotCreateSuperAdmin': 'Kann keine Super-Administrator-Konten erstellen',
    'cannotDeleteOwnAccount': '{{userName}} ({{role}}) kann eigenes Konto nicht löschen.{{suggestion}}',
    'cannotDeleteSuperAdmin': 'Kann Super-Administrator-Konto nicht löschen',
    'cannotDeleteYourself': 'Kann eigenes Konto nicht löschen',
    'cannotModifyHigherRoleUser': 'Kann {{targetUserName}} ({{targetRole}}) nicht ändern - {{currentRole}} {{reason}}',
    'cannotModifySuperAdmin': 'Kann Super-Administrator-Konten nicht ändern',
    'cannotPromoteToHigherRole': '{{currentRole}} kann Benutzer nicht zu {{requestedRole}} befördern - {{reason}}',
    'cannotPromoteToSuperAdmin': 'Kann Benutzer nicht zum Super-Administrator befördern',
    'deleteNotAllowed': 'Löschvorgang für Ihre Rolle nicht erlaubt',
    'forbidden': 'Zugriff verweigert - unzureichende Berechtigungen',
    'invalidCredentials': 'Ungültige Anmeldedaten',
    'invalidRole': 'Ungültige Benutzerrolle',
    'loginSuccess': 'Anmeldung erfolgreich',
    'logoutAllSuccess': 'Abmeldung von allen Geräten erfolgreich',
    'logoutSuccess': 'Abmeldung erfolgreich',
    'passwordIncorrect': 'Passwort ist falsch',
    'rateLimitExceeded': 'Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.',
    'refreshSuccess': 'Token erfolgreich aktualisiert',
    'refreshTokenExpired': 'Refresh-Token ist abgelaufen',
    'refreshTokenInvalid': 'Ungültiger Refresh-Token',
    'superAdminRequired': 'Super-Administrator-Zugriff erforderlich',
    'tokenExpired': 'Token ist abgelaufen',
    'tokenInvalid': 'Ungültiger Token',
    'unauthorized': 'Unbefugter Zugriff',
    'userNotFound': 'Benutzer nicht gefunden oder inaktiv'
  },
  'dates': {
    'changedAt': 'Geändert am {{date, datetime}}',
    'checkedAt': 'Geprüft am {{date, datetime}}',
    'createdAt': 'Erstellt am {{date, datetime}}',
    'deletedAt': 'Gelöscht am {{date, datetime}}',
    'updatedAt': 'Aktualisiert am {{date, datetime}}',
    'userJoined': 'Beigetreten am {{date, date}}'
  },
  'emails': {
    'registration': {
      'activateButton': 'Mein Konto aktivieren',
      'activateLinkText': 'Oder kopiere und füge diesen Link in deinen Browser ein:',
      'details': 'Kontodetails',
      'disclaimer': 'Wenn du dieses Konto nicht angefordert hast, ignoriere diese E-Mail oder kontaktiere den Support.',
      'email': 'Registrierungs-E-Mail: {{email}}',
      'expiryWarning': 'Dieser Aktivierungslink läuft in {{hours}} Stunden ab.',
      'footer': 'Dies ist eine automatische Nachricht von {{appName}}. Bitte antworte nicht auf diese E-Mail.',
      'greeting': 'Hallo {{userName}},',
      'instructions': 'Diese E-Mail bestätigt, dass wir deine Kontodaten erhalten haben. Falls eine Aktivierung oder Freigabe nötig ist, erhältst du eine weitere E-Mail.',
      'intro': 'Danke für deine Registrierung bei {{appName}}.',
      'ip': 'Anfrage-IP: {{ip}}',
      'securityNote': 'Teile diesen Link aus Sicherheitsgründen niemals mit anderen.',
      'subject': '{{appName}} - Bestätige deine Registrierung',
      'thanks': 'Vielen Dank,\nDas {{appName}} Team',
      'time': 'Registrierungszeit: {{timestamp}}'
    }
  },
  'endpoints': {
    'admin': {
      'changeRole': 'Benutzerrolle ändern (Super-Admin-Zugriff erforderlich)',
      'createUser': 'Neuen Benutzer erstellen (Admin-Zugriff erforderlich)',
      'dashboard': 'Umfassende Dashboard-Daten abrufen (Admin-Zugriff erforderlich)',
      'deleteUser': 'Benutzer löschen (Super-Admin-Zugriff erforderlich)',
      'stats': 'Systemstatistiken abrufen (Admin-Zugriff erforderlich)',
      'systemHealth': 'Umfassenden Systemgesundheitsstatus abrufen (Admin-Zugriff erforderlich)',
      'updateUser': 'Benutzerinformationen aktualisieren (Admin-Zugriff erforderlich)',
      'userDetails': 'Benutzerdetails abrufen (Admin-Zugriff erforderlich)',
      'usersList': 'Alle Benutzer auflisten (Admin-Zugriff erforderlich)'
    },
    'advanced_audit': {
      'analytics': 'Erweiterte Audit-Analytik (Admin-Zugriff erforderlich)',
      'analyticsBehavior': 'Verhaltens-Analytik (Admin-Zugriff erforderlich)',
      'analyticsPerformance': 'Leistungs-Analytik (Admin-Zugriff erforderlich)',
      'analyticsSecurity': 'Sicherheits-Analytik (Admin-Zugriff erforderlich)',
      'archival': 'Audit-Log-Archivierung (Admin-Zugriff erforderlich)',
      'archivalRestore': 'Archivierte Logs wiederherstellen (Admin-Zugriff erforderlich)',
      'archivalRun': 'Archivierungsprozess ausführen (Admin-Zugriff erforderlich)',
      'archivalStats': 'Archivierungs-Statistiken (Admin-Zugriff erforderlich)',
      'archiveManage': 'Archiv-Verwaltung (Admin-Zugriff erforderlich)',
      'compliance': 'Compliance-Berichterstattung (Admin-Zugriff erforderlich)',
      'complianceReport': 'Compliance-Bericht generieren (Admin-Zugriff erforderlich)',
      'exportAdvanced': 'Erweiterten Export (Admin-Zugriff erforderlich)',
      'middlewareStats': 'Middleware-Statistiken (Admin-Zugriff erforderlich)'
    },
    'audit': {
      'export': 'Audit-Logs exportieren (Admin-Zugriff erforderlich)',
      'logs': 'Audit-Logs anzeigen (Admin-Zugriff erforderlich)',
      'search': 'Audit-Logs durchsuchen (Admin-Zugriff erforderlich)',
      'stats': 'Audit-Statistiken abrufen (Admin-Zugriff erforderlich)'
    },
    'auth': {
      'login': 'Mit E-Mail und Passwort anmelden',
      'logout': 'Abmelden und Token ungültig machen',
      'refresh': 'Zugriffstoken aktualisieren'
    },
    'demo': {
      'info': 'Zod-Validierungs-Demo-Informationen',
      'register': 'Benutzerregistrierungs-Demo mit umfassender Validierung',
      'search': 'Such-Demo mit Query-Parameter-Validierung',
      'upload': 'Datei-Upload-Demo mit Metadaten-Validierung'
    },
    'kv_admin': {
      'audit': {
        'alerts': 'Audit-Warnschwellen abrufen (nur Super-Admin)',
        'compliance': 'Audit-Compliance-Einstellungen abrufen (nur Super-Admin)',
        'configs': 'Audit-Systemkonfigurationen anzeigen (nur Super-Admin)',
        'export': 'Audit-Exporteinstellungen abrufen (nur Super-Admin)',
        'features': 'Audit-Feature-Flags abrufen (nur Super-Admin)',
        'featureToggle': 'Audit-Feature-Flag umschalten (nur Super-Admin)',
        'performance': 'Audit-Leistungseinstellungen abrufen (nur Super-Admin)',
        'realtime': 'Echtzeit-Überwachungseinstellungen abrufen (nur Super-Admin)',
        'retention': 'Audit-Aufbewahrungsrichtlinien abrufen (nur Super-Admin)'
      },
      'config': 'KV-Konfiguration anzeigen (nur Super-Admin)',
      'configBulk': 'KV-Konfiguration in Masse aktualisieren (nur Super-Admin)',
      'configCacheClear': 'KV-Konfigurationscache leeren (nur Super-Admin)',
      'configDefaults': 'Standard-KV-Konfiguration abrufen (nur Super-Admin)',
      'configDelete': 'KV-Konfigurationsschlüssel löschen (nur Super-Admin)',
      'configEnvComparison': 'KV-Konfiguration zwischen Umgebungen vergleichen (nur Super-Admin)',
      'configGet': 'Spezifische KV-Konfiguration abrufen (nur Super-Admin)',
      'configs': 'KV-Konfigurationen anzeigen (nur Super-Admin)',
      'configsBatch': 'KV-Konfigurationen in Masse aktualisieren (nur Super-Admin)',
      'configsCacheClear': 'Cache der KV-Konfigurationen leeren (nur Super-Admin)',
      'configsDefaults': 'Standard-KV-Konfigurationen abrufen (nur Super-Admin)',
      'configsEnvComparison': 'KV-Konfigurationen zwischen Umgebungen vergleichen (nur Super-Admin)',
      'configUpdate': 'KV-Konfiguration aktualisieren (nur Super-Admin)'
    },
    'realtime_monitoring': {
      'alerts': 'Systemwarnung-Verwaltung (Admin-Zugriff erforderlich)',
      'alertsChannels': 'Warnkanäle verwalten (Admin-Zugriff erforderlich)',
      'alertsChannelsCreate': 'Warnkanal erstellen (Admin-Zugriff erforderlich)',
      'alertsConfigure': 'Systemwarnungen konfigurieren (Admin-Zugriff erforderlich)',
      'alertsHistory': 'Warnhistorie abrufen (Admin-Zugriff erforderlich)',
      'alertsRules': 'Warnregeln verwalten (Admin-Zugriff erforderlich)',
      'alertsRulesCreate': 'Warnregel erstellen (Admin-Zugriff erforderlich)',
      'alertsRuleToggle': 'Warnregel aktivieren/deaktivieren (Admin-Zugriff erforderlich)',
      'alertsSend': 'Systemwarnung senden (Admin-Zugriff erforderlich)',
      'alertsStatus': 'Warnstatus abrufen (Admin-Zugriff erforderlich)',
      'alertsTest': 'Warnsystem testen (Admin-Zugriff erforderlich)',
      'analyze': 'Überwachungsdaten analysieren (Admin-Zugriff erforderlich)',
      'dashboard': 'Echtzeit-Überwachungs-Dashboard (Admin-Zugriff erforderlich)',
      'dashboardCache': 'Dashboard-Cache leeren (Admin-Zugriff erforderlich)',
      'dashboardExport': 'Dashboard-Daten exportieren (Admin-Zugriff erforderlich)',
      'dashboardHealth': 'Dashboard-Gesundheitscheck (Admin-Zugriff erforderlich)',
      'dashboardLive': 'Live-Dashboard-Snapshot (Admin-Zugriff erforderlich)',
      'dashboardOverview': 'Dashboard-Übersicht (Admin-Zugriff erforderlich)',
      'dashboardPerformance': 'Leistungs-Dashboard (Admin-Zugriff erforderlich)',
      'dashboardRealtime': 'Live-Dashboard-Daten (Admin-Zugriff erforderlich)',
      'dashboardSecurity': 'Sicherheits-Dashboard (Admin-Zugriff erforderlich)',
      'dashboardTimeline': 'Dashboard-Zeitlinie (Admin-Zugriff erforderlich)',
      'eventsRecent': 'Neueste Überwachungsereignisse abrufen (Admin-Zugriff erforderlich)',
      'incidentsCreate': 'Echtzeit-Überwachungsvorfall erstellen (Admin-Zugriff erforderlich)',
      'metrics': 'Echtzeit-Systemmetriken (Admin-Zugriff erforderlich)',
      'resolveThreat': 'Erkannte Bedrohung lösen (Admin-Zugriff erforderlich)',
      'simulate': 'Überwachungsszenarien simulieren (Admin-Zugriff erforderlich)',
      'start': 'Echtzeit-Überwachung starten (Admin-Zugriff erforderlich)',
      'status': 'Überwachungsstatus abrufen (Admin-Zugriff erforderlich)',
      'stop': 'Echtzeit-Überwachung stoppen (Admin-Zugriff erforderlich)',
      'threats': 'Bedrohungsinformationen abrufen (Admin-Zugriff erforderlich)'
    },
    'security_incident': {
      'bulkDelete': 'Massentlöschung von {{count}} Sicherheitsvorfällen (Admin-Zugriff {{actor}} erforderlich)',
      'create': 'Neuen Sicherheitsvorfall erstellen (Admin-Zugriff {{actor}} erforderlich, Typ {{type}}, Schweregrad {{severity}})',
      'deleteById': 'Sicherheitsvorfall {{incidentId}} löschen (Admin-Zugriff {{actor}} erforderlich)',
      'exportCsv': '{{count}} Sicherheitsvorfälle nach CSV exportieren (Admin-Zugriff {{actor}} erforderlich, Datumsbereich: {{dateRange}})',
      'getById': 'Sicherheitsvorfall nach ID {{incidentId}} abrufen (Admin-Zugriff {{actor}} erforderlich)',
      'getDashboard': 'Sicherheitsvorfall-Dashboard abrufen (Admin-Zugriff {{actor}} erforderlich, Filter: {{filters}})',
      'getStatistics': 'Sicherheitsvorfall-Statistiken abrufen (Admin-Zugriff {{actor}} erforderlich, Zeitraum: {{period}})',
      'incidentDetails': 'Vorfall-Details abrufen (Admin-Zugriff erforderlich)',
      'incidentResponse': 'Vorfall-Reaktion ausführen (Admin-Zugriff erforderlich)',
      'incidents': 'Sicherheitsvorfälle auflisten (Admin-Zugriff erforderlich)',
      'incidentsCreate': 'Sicherheitsvorfall erstellen (Admin-Zugriff erforderlich)',
      'incidentStatus': 'Vorfall-Status aktualisieren (Admin-Zugriff erforderlich)',
      'incidentUpdate': 'Vorfall aktualisieren (Admin-Zugriff erforderlich)',
      'list': 'Sicherheitsvorfälle auflisten (Admin-Zugriff {{actor}} erforderlich, Seite {{page}}, Limit {{limit}})',
      'serviceStatus': 'Service-Status abrufen (Admin-Zugriff erforderlich)',
      'simulate': 'Sicherheitsvorfall simulieren (Admin-Zugriff erforderlich)',
      'statistics': 'Vorfall-Statistiken abrufen (Admin-Zugriff erforderlich)',
      'updateById': 'Sicherheitsvorfall {{incidentId}} aktualisieren (Admin-Zugriff {{actor}} erforderlich, aktualisierte Felder: {{fields}})',
      'updateStatus': 'Status des Sicherheitsvorfalls {{incidentId}} auf {{status}} aktualisieren (Admin-Zugriff {{actor}} erforderlich)'
    },
    'system': {
      'apiInfo': 'Umfassende API-Informationen und Endpunkte',
      'favicon': 'Favicon und Icon-Ressourcen',
      'health': 'Gesundheitscheck-Endpunkt',
      'language': 'Sprachwechsler-Endpunkt',
      'root': 'API-Wurzel-Endpunkt - Willkommensnachricht',
      'routes': 'System-Route-Entdeckung (nur Admin)',
      'unknown': 'Unbekannter Endpunkt',
      'version': 'API-Versionsinformationen'
    },
    'translations': {
      'get': 'Alle Übersetzungen für eine bestimmte Sprache abrufen',
      'list': 'Alle verfügbaren Sprachen und deren Validierungsstatus auflisten',
      'section': 'Spezifische Abschnitts-Übersetzungen abrufen',
      'validate': 'Übersetzungsvollständigkeit validieren'
    },
    'user': {
      'me': 'Aktuelle Benutzerinformationen abrufen (Authentifizierung erforderlich)',
      'profile': 'Benutzerprofil abrufen (Authentifizierung erforderlich)',
      'register': 'Neuen Benutzer registrieren',
      'updatePassword': 'Passwort ändern (Authentifizierung erforderlich)',
      'updateProfile': 'Benutzerprofil aktualisieren (Authentifizierung erforderlich)'
    }
  },
  'errors': {
    'admin': {
      'accessDenied': 'Admin-Zugriff für diese Operation erforderlich',
      'dashboardRetrieveFailed': 'Admin-Dashboard-Daten konnten nicht abgerufen werden',
      'permissionDenied': 'Unzureichende Admin-Berechtigungen für diese Operation',
      'roleChangeFailed': 'Benutzerrolle konnte nicht geändert werden',
      'statsRetrieveFailed': 'Admin-Statistiken konnten nicht abgerufen werden',
      'systemHealthRetrieveFailed': 'System-Gesundheitsinformationen konnten nicht abgerufen werden',
      'userManagementFailed': 'Benutzerverwaltungsvorgang fehlgeschlagen'
    },
    'advancedAudit': {
      'analytics': {
        'failed': 'Analysedaten konnten nicht abgerufen werden - {{actor}} konnte {{operation}} für Zeitraum {{timeframe}} nicht abschließen: {{reason}}'
      },
      'archival': {
        'archiveOperationFailed': 'Archivoperation konnte nicht durchgeführt werden - {{actor}} konnte {{operation}} ({{action}}) nicht abschließen: {{reason}}',
        'restoreFailed': 'Archivierte Logs konnten nicht wiederhergestellt werden - {{actor}} konnte {{operation}} für {{dateRange}} nicht durchführen: {{reason}}',
        'runFailed': 'Archivierungsprozess konnte nicht ausgeführt werden - {{actor}} konnte {{operation}} mit Schwellenwert {{cutoffDays}} nicht abschließen: {{reason}}',
        'statsFailed': 'Archivierungsstatistiken konnten nicht abgerufen werden - {{actor}} konnte {{operation}} nicht durchführen: {{reason}}'
      },
      'behavior': {
        'failed': 'Verhaltensanalyse konnte nicht abgerufen werden - {{actor}} konnte {{operation}} für {{timeframe}} zielend auf {{targetRole}} nicht abschließen: {{reason}}'
      },
      'compliance': {
        'customComplianceFailed': 'Benutzerdefinierter Compliance-Bericht konnte nicht generiert werden - {{actor}} konnte {{operation}} für "{{reportName}}" ({{reportType}}) nicht abschließen: {{reason}}',
        'failed': 'Compliance-Bericht konnte nicht generiert werden - {{actor}} konnte {{operation}} für {{timeframe}} mit Format {{format}} nicht abschließen: {{reason}}',
        'reportFailed': 'Compliance-Bericht konnte nicht generiert werden - {{actor}} konnte {{operation}} für Bericht {{type}} nicht durchführen: {{reason}}'
      },
      'export': {
        'failed': 'Erweiterte Exportierung konnte nicht durchgeführt werden - {{actor}} konnte {{operation}} mit Format {{format}} ({{recordCount}} Datensätze) nicht abschließen: {{reason}}'
      },
      'middleware': {
        'statsFailed': 'Middleware-Statistiken konnten nicht abgerufen werden - {{actor}} konnte {{operation}} für {{middlewareType}} nicht durchführen: {{reason}}'
      },
      'performance': {
        'failed': 'Leistungsanalyse konnte nicht abgerufen werden - {{actor}} ({{role}}) konnte {{operation}} für {{timeframe}} nicht durchführen: {{reason}}'
      },
      'security': {
        'failed': 'Sicherheitsanalyse konnte nicht abgerufen werden - {{actor}} ({{role}}) konnte {{operation}} für {{timeframe}} nicht durchführen: {{reason}}'
      }
    },
    'api': {
      'databaseError': 'Datenbankfehler bei API-Aufruf: {{operation}}',
      'methodNotAllowed': 'HTTP-Methode {{method}} für Route {{path}} nicht zulässig',
      'routeNotFound': 'API-Route nicht gefunden: {{method}} {{path}}',
      'validationError': 'API-Validierungsfehler: {{details}}'
    },
    'audit': {
      'export': {
        'exportFailed': 'Fehler beim Exportieren der Audit-Protokolle - {{actor}} konnte {{operation}} im Format {{format}} nicht abschließen: {{reason}}'
      },
      'health': {
        'healthFailed': 'Fehler beim Überprüfen der Audit-Systemgesundheit - {{actor}} konnte {{operation}} ({{checkType}}) nicht durchführen: {{reason}}'
      },
      'logs': {
        'retrieveFailed': 'Fehler beim Abrufen der Audit-Protokolle - {{actor}} stieß auf Fehler bei {{operation}}: {{reason}}'
      },
      'search': {
        'searchFailed': 'Fehler beim Durchsuchen der Audit-Protokolle - {{actor}} konnte {{operation}} mit Abfrage "{{query}}" nicht abschließen: {{reason}}'
      },
      'stats': {
        'statsFailed': 'Fehler beim Abrufen der Audit-Statistiken - {{actor}} ({{role}}) konnte {{operation}} nicht durchführen: {{reason}}'
      }
    },
    'auth': {
      'accountDisabled': 'Benutzerkonto {{userName}} wurde vom Administrator deaktiviert',
      'accountLocked': 'Konto für {{duration, time}} gesperrt aufgrund fehlgeschlagener Anmeldeversuche',
      'accountNotVerified': 'E-Mail-Adresse für {{userName}} ist nicht verifiziert',
      'cannotAccessOtherUsers': 'Kann nicht auf Ressourcen anderer Benutzer zugreifen',
      'cannotChangeOwnRole': '{{userName}} ({{currentRole}}) kann eigene Rolle nicht ändern - {{reason}}',
      'cannotCreateHigherRole': '{{currentRole}} kann keine {{requestedRole}}-Konten aufgrund von Rollenhierarchiebeschränkungen erstellen',
      'cannotDeleteSuperAdmin': 'Kann Super-Administrator-Konto nicht löschen',
      'cannotDeleteYourself': 'Kann eigenes Konto nicht löschen',
      'cannotModifyHigherRoleUser': 'Kann {{targetUserName}} ({{targetRole}}) nicht ändern - {{currentRole}} {{reason}}',
      'cannotPromoteToHigherRole': '{{currentRole}} kann Benutzer nicht auf {{requestedRole}} befördern - {{reason}}',
      'deleteNotAllowed': 'Löschvorgang für Ihre Rolle nicht erlaubt',
      'failed': 'Authentifizierung fehlgeschlagen: {{reason}}',
      'failed_other': '{{count}} Authentifizierungsversuche in den letzten {{timeWindow}} fehlgeschlagen',
      'forbidden': 'Zugriff verboten – unzureichende Berechtigungen für {{operation}}',
      'invalidCredentials': 'Ungültige E-Mail oder Passwort angegeben',
      'invalidCredentials_context_admin': 'Ungültige Anmeldeinformationen für die Anmeldung am Administratorkonto angegeben',
      'invalidCredentials_context_user': 'Ungültige Anmeldeinformationen für die Anmeldung am Benutzerkonto angegeben',
      'loginFailed': 'Anmeldeprozess für {{actor}} fehlgeschlagen (Grund: {{reason}}, Operation: {{operation}}, IP: {{ipAddress}})',
      'mfaFailed': 'Multi-Faktor-Authentifizierung fehlgeschlagen: {{reason}}',
      'mfaRequired': 'Multi-Faktor-Authentifizierung ist für {{userName}} erforderlich',
      'passwordIncorrect': 'Passwort ist falsch für Benutzer {{userName}}',
      'permissionDenied': 'Berechtigung für Aktion verweigert: {{action}}',
      'rateLimitExceeded': 'Ratenbegrenzung überschritten: {{currentRequests}}/{{maxRequests}} Anfragen pro {{timeWindow}}',
      'refreshTokenExpired': 'Refresh-Token abgelaufen am {{expiredAt, datetime}}',
      'refreshTokenFailed': 'Token-Aktualisierung für {{actor}} fehlgeschlagen (Grund: {{reason}}, Operation: {{operation}})',
      'refreshTokenInvalid': 'Ungültiges oder widerrufenes Refresh-Token',
      'roleRequired': 'Rolle {{requiredRole}} für diese Operation erforderlich',
      'sessionExpired': 'Benutzersitzung abgelaufen am {{expiredAt, datetime}}',
      'sessionInvalid': 'Ungültige oder beschädigte Benutzersitzung',
      'superAdminRequired': 'Super-Administrator-Zugriff erforderlich',
      'tokenExpired': 'Authentifizierungstoken abgelaufen am {{expiredAt, datetime}}',
      'tokenInvalid': 'Ungültiges oder fehlerhaftes Authentifizierungstoken',
      'tokenMissing': 'Authentifizierungstoken ist erforderlich, wurde aber nicht bereitgestellt',
      'tooManyAttempts': 'Zu viele fehlgeschlagene Anmeldeversuche ({{attemptCount}}) von {{ipAddress}}',
      'tooManyAttempts_other': 'Zu viele fehlgeschlagene Anmeldeversuche ({{attemptCount}} Versuche) von {{ipAddress}}',
      'unauthorized': 'Nicht autorisierter Zugriff auf Ressource: {{resource}}',
      'userNotFound': 'Kein Konto mit E-Mail {{email}} gefunden'
    },
    'business': {
      'businessHoursOnly': 'Operation nur während der Geschäftszeiten zulässig ({{businessHours}})',
      'conflictingOperation': 'Konfliktierende Operation im Gange: {{operation}}',
      'deadlineExpired': 'Operationsfrist abgelaufen am {{deadline, datetime}}',
      'duplicateEntry': 'Doppelter Eintrag erkannt: {{entity}} mit {{field}} = „{{value}}“',
      'insufficientBalance': 'Unzureichendes Guthaben: {{available, currency}} verfügbar, {{required, currency}} erforderlich',
      'operationNotAllowed': 'Operation „{{operation}}“ ist nicht zulässig: {{reason}}',
      'preconditionFailed': 'Vorbedingung fehlgeschlagen: {{condition}}',
      'quotaReached': 'Kontingentlimit erreicht: {{used, number}}/{{limit, number}} {{resource}}',
      'referenceConstraint': 'Kann {{entity}} nicht löschen – referenziert von {{referencingCount}} anderem Datensatz',
      'referenceConstraint_other': 'Kann {{entity}} nicht löschen – referenziert von {{referencingCount}} anderen Datensätzen',
      'resourceLocked': 'Ressource „{{resource}}“ ist von {{lockedBy}} bis {{lockedUntil, datetime}} gesperrt',
      'workflowViolation': 'Workflow-Verletzung: Schritt {{step}} kann im aktuellen Zustand {{currentState}} nicht ausgeführt werden'
    },
    'file': {
      'accessDenied': 'Zugriff auf Datei „{{filename}}“ verweigert: {{reason}}',
      'corrupted': 'Datei scheint beschädigt oder unvollständig zu sein',
      'formatUnsupported': 'Dateiformat für Operation nicht unterstützt: {{operation}}',
      'invalidType': 'Dateityp „{{fileType}}“ ist nicht zulässig – unterstützte Typen: {{allowedTypes}}',
      'notFound': 'Datei „{{filename}}“ nicht gefunden',
      'processingFailed': 'Dateiverarbeitung fehlgeschlagen: {{reason}}',
      'quotaExceeded': 'Speicherplatzkontingent überschritten: {{used, number}}MB / {{quota, number}}MB',
      'tooLarge': 'Dateigröße {{actualSize, number}}MB überschreitet {{maxSize, number}}MB Limit',
      'tooSmall': 'Dateigröße {{actualSize, number}} Bytes liegt unter dem Minimum von {{minSize, number}} Bytes',
      'uploadFailed': 'Datei-Upload fehlgeschlagen: {{reason}}',
      'virusDetected': 'Datei von Sicherheitsprüfung blockiert: {{threat}}'
    },
    'i18n': {
      'context_demo_failed': 'Kontextuelle Übersetzungs-Demonstration konnte nicht ausgeführt werden: {{reason}}',
      'context_test_failed': 'Kontextuelle Übersetzungen konnten nicht getestet werden für Schlüssel "{{key}}": {{reason}}',
      'enhanced_demo_failed': 'Erweiterte i18n-Funktions-Demonstration konnte nicht ausgeführt werden: {{reason}}',
      'error_demo_failed': 'Fehlermeldungs-Demonstration konnte nicht ausgeführt werden: {{reason}}',
      'formatting_demo_failed': 'Formatierungs-Demonstration konnte nicht ausgeführt werden: {{reason}}',
      'formatting_test_failed': 'Formatierungsfunktionalität konnte nicht getestet werden für Schlüssel "{{key}}": {{reason}}',
      'languageNotSupported': 'Sprache "{{language}}" wird nicht unterstützt. Verfügbare Sprachen: {{supportedLanguages}}',
      'plurals_demo_failed': 'Pluralisierungs-Demonstration konnte nicht ausgeführt werden: {{reason}}',
      'plurals_test_failed': 'Pluralisierungsfunktionalität konnte nicht getestet werden für Schlüssel "{{key}}": {{reason}}',
      'sectionNotFound': 'Übersetzungsabschnitt "{{section}}" nicht gefunden für Sprache "{{language}}"',
      'success_demo_failed': 'Erfolgsmeldungs-Demonstration konnte nicht ausgeführt werden: {{reason}}',
      'translationsFailed': 'Übersetzungsinformationen konnten nicht abgerufen werden: {{reason}}'
    },
    'integration': {
      'apiLimitExceeded': 'API-Ratenbegrenzung für {{serviceName}} überschritten: {{limit}} Anfragen pro {{period}}',
      'authenticationFailed': 'Authentifizierung bei {{serviceName}} fehlgeschlagen: {{reason}}',
      'credentialsExpired': 'API-Anmeldeinformationen für {{serviceName}} abgelaufen am {{expiredDate, date}}',
      'dataTransformFailed': 'Datentransformation für {{serviceName}} fehlgeschlagen: {{reason}}',
      'invalidResponse': 'Ungültige Antwort von {{serviceName}}: {{details}}',
      'serviceDown': 'Externer Dienst {{serviceName}} ist derzeit nicht verfügbar',
      'syncFailed': 'Datensynchronisierung mit {{serviceName}} fehlgeschlagen: {{reason}}',
      'webhookTimeout': 'Webhook-Timeout von {{serviceName}} nach {{timeout, number}}ms'
    },
    'kv': {
      'accessDenied': 'Zugriff verweigert für Konfigurationsschlüssel „{{key}}“ – erfordert Rolle {{requiredRole}}',
      'alertThresholdsRetrieveFailed': 'Alarmschwellenwerte konnten nicht abgerufen werden: {{reason}}',
      'auditConfigsRetrieveFailed': 'Audit-Konfigurationen konnten nicht abgerufen werden: {{reason}}',
      'batchUpdateFailed': 'Batch-Aktualisierung fehlgeschlagen für {{failedCount}} von {{totalCount}} Konfiguration',
      'batchUpdateFailed_other': 'Batch-Aktualisierung fehlgeschlagen für {{failedCount}} von {{totalCount}} Konfigurationen',
      'cacheClearFailed': 'Konfigurationscache konnte nicht geleert werden: {{reason}}',
      'cacheFailed': 'Fehler beim Aktualisieren des Konfigurationscaches: {{reason}}',
      'complianceSettingsRetrieveFailed': 'Compliance-Einstellungen konnten nicht abgerufen werden: {{reason}}',
      'configResetFailed': 'Konfiguration "{{key}}" konnte nicht zurückgesetzt werden: {{reason}}',
      'configRetrieveFailed': 'Konfiguration "{{key}}" konnte nicht abgerufen werden: {{reason}}',
      'configsCompareFailed': 'Umgebungsvergleich konnte nicht abgerufen werden: {{reason}}',
      'configsRetrieveFailed': 'Konfigurationen konnten nicht abgerufen werden: {{reason}}',
      'configUpdateFailed': 'Konfiguration "{{key}}" konnte nicht aktualisiert werden: {{reason}}',
      'exportSettingsRetrieveFailed': 'Exporteinstellungen konnten nicht abgerufen werden: {{reason}}',
      'featureFlagsRetrieveFailed': 'Feature-Flags konnten nicht abgerufen werden: {{reason}}',
      'featureNotFound': 'Feature nicht gefunden oder nicht erlaubt',
      'featureToggleFailed': 'Feature "{{feature}}" konnte nicht umgeschaltet werden: {{reason}}',
      'invalidFeatureValue': 'Ungültiger Feature-Wert - muss boolean sein',
      'invalidKey': 'Konfigurationsschlüssel „{{key}}“ ist nicht zulässig – gültige Schlüssel: {{validKeys}}',
      'keyNotFound': 'Konfigurationsschlüssel „{{key}}“ nicht gefunden',
      'performanceSettingsRetrieveFailed': 'Leistungseinstellungen konnten nicht abgerufen werden: {{reason}}',
      'realtimeSettingsRetrieveFailed': 'Echtzeit-Überwachungseinstellungen konnten nicht abgerufen werden: {{reason}}',
      'resetFailed': 'Fehler beim Zurücksetzen der Konfiguration „{{key}}“ auf den Standardwert: {{reason}}',
      'retentionPoliciesRetrieveFailed': 'Aufbewahrungsrichtlinien konnten nicht abgerufen werden: {{reason}}',
      'updateFailed': 'Fehler beim Aktualisieren der Konfiguration „{{key}}“: {{reason}}',
      'valueInvalid': 'Ungültiger Wert für Konfiguration „{{key}}“: {{expectedType}} erwartet, {{actualType}} erhalten'
    },
    'kvAdmin': {
      'alertThresholdsRetrieveFailed': 'Fehler beim Abrufen der Alarmschwellenwerte für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'auditConfigsRetrieveFailed': 'Fehler beim Abrufen der Audit-Konfigurationen für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'cacheClearFailed': 'Fehler beim Löschen des KV-Konfigurationscaches für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'complianceSettingsRetrieveFailed': 'Fehler beim Abrufen der Compliance-Einstellungen für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'configResetFailed': 'Fehler beim Zurücksetzen der KV-Konfiguration {{key}} für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'configRetrieveFailed': 'Fehler beim Abrufen der KV-Konfiguration {{key}} für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'configsCompareFailed': 'Fehler beim Vergleichen der ENV- vs KV-Konfigurationen für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'configsRetrieveFailed': 'Fehler beim Abrufen der KV-Konfigurationen für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'configUpdateFailed': 'Fehler beim Aktualisieren der KV-Konfiguration {{key}} für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'exportSettingsRetrieveFailed': 'Fehler beim Abrufen der Exporteinstellungen für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'featureFlagsRetrieveFailed': 'Fehler beim Abrufen der Feature-Flags für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'featureToggleFailed': 'Fehler beim Umschalten der Funktion {{feature}} für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'performanceSettingsRetrieveFailed': 'Fehler beim Abrufen der Leistungseinstellungen für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'realtimeSettingsRetrieveFailed': 'Fehler beim Abrufen der Echtzeit-Einstellungen für {{actor}} (Grund: {{reason}}, Operation: {{operation}})',
      'retentionPoliciesRetrieveFailed': 'Fehler beim Abrufen der Aufbewahrungsrichtlinien für {{actor}} (Grund: {{reason}}, Operation: {{operation}})'
    },
    'network': {
      'apiError': 'Externer API-Fehler von {{apiName}}: {{error}}',
      'bandwidthExceeded': 'Bandbreitenlimit überschritten: {{usage, number}}MB/{{limit, number}}MB',
      'connectionFailed': 'Verbindung zu {{service, uppercase}} fehlgeschlagen: {{reason}}',
      'connectionRefused': 'Verbindung von {{service}} auf Port {{port}} verweigert',
      'dnsResolutionFailed': 'DNS-Auflösung für {{hostname}} fehlgeschlagen',
      'hostUnreachable': 'Host {{hostname}} ist nicht erreichbar',
      'httpError': 'HTTP-Fehler {{statusCode}}: {{statusMessage}}',
      'protocolError': 'Netzwerkprotokollfehler: {{protocol}} - {{details}}',
      'proxyError': 'Proxy-Server-Fehler: {{proxyAddress}} - {{reason}}',
      'slowResponse': 'Langsame Antwort von {{service}} erkannt ({{duration, number}}ms)',
      'socketError': 'Socket-Verbindungsfehler: {{details}}',
      'sslError': 'SSL/TLS-Verbindungsfehler: {{details}}',
      'timeout': 'Netzwerkanfrage-Timeout nach {{duration, number}}ms an {{service}}',
      'webhookFailed': 'Webhook-Zustellung an {{url}} fehlgeschlagen: {{reason}}'
    },
    'realtimeMonitoring': {
      'alerts': {
        'channelsFailed': 'Fehler beim Abrufen der Alarmkanäle aufgrund eines Serverfehlers',
        'createChannelFailed': 'Fehler beim Erstellen des Alarmkanals aufgrund eines Serverfehlers',
        'createRuleFailed': 'Fehler beim Erstellen der Alarmregel aufgrund eines Serverfehlers',
        'historyFailed': 'Fehler beim Abrufen des Alarmverlaufs aufgrund eines Serverfehlers',
        'rulesFailed': 'Fehler beim Abrufen der Alarmregeln aufgrund eines Serverfehlers',
        'sendFailed': 'Fehler beim Senden des manuellen Alarms aufgrund eines Serverfehlers',
        'statusFailed': 'Fehler beim Abrufen des Alarmsystemstatus aufgrund eines Serverfehlers',
        'testFailed': 'Fehler beim Testen des Alarmsystems aufgrund eines Serverfehlers',
        'toggleFailed': 'Fehler beim Umschalten der Alarmregel aufgrund eines Serverfehlers'
      },
      'alertsConfig': {
        'configFailed': 'Fehler beim Konfigurieren von Alarmen für {{actor}} (Grund: {{reason}}, Vorgang: {{operation}})'
      },
      'dashboard': {
        'cacheClearFailed': 'Fehler beim Löschen des Dashboard-Caches aufgrund eines Serverfehlers',
        'exportFailed': 'Fehler beim Exportieren des Dashboards aufgrund eines Serverfehlers',
        'healthCheckFailed': 'Fehler beim Durchführen der Dashboard-Gesundheitsprüfung aufgrund eines Serverfehlers',
        'overviewFailed': 'Fehler beim Abrufen der Dashboard-Übersicht aufgrund eines Serverfehlers',
        'performanceFailed': 'Fehler beim Abrufen des Leistungs-Dashboards aufgrund eines Serverfehlers',
        'realtimeFailed': 'Fehler beim Abrufen des Echtzeit-Dashboards aufgrund eines Serverfehlers',
        'securityFailed': 'Fehler beim Abrufen des Sicherheits-Dashboards aufgrund eines Serverfehlers',
        'timelineFailed': 'Fehler beim Abrufen der Dashboard-Zeitachse aufgrund eines Serverfehlers'
      },
      'incidents': {
        'createFailed': 'Fehler beim Erstellen des Echtzeitüberwachungs-Vorfalls aufgrund eines Serverfehlers'
      },
      'monitoring': {
        'eventsFailed': 'Fehler beim Abrufen aktueller Überwachungsereignisse aufgrund eines Serverfehlers',
        'simulateFailed': 'Fehler beim Simulieren des Überwachungsereignisses aufgrund eines Serverfehlers',
        'startFailed': 'Fehler beim Starten der Überwachung aufgrund eines Serverfehlers',
        'statusFailed': 'Fehler beim Abrufen des Überwachungsstatus aufgrund eines Serverfehlers',
        'stopFailed': 'Fehler beim Stoppen der Überwachung aufgrund eines Serverfehlers'
      },
      'threats': {
        'analyzeFailed': 'Fehler beim Analysieren der Bedrohungen aufgrund eines Serverfehlers',
        'resolveFailed': 'Fehler beim Beheben der Bedrohung aufgrund eines Serverfehlers',
        'retrieveFailed': 'Fehler beim Abrufen des Bedrohungsstatus aufgrund eines Serverfehlers'
      }
    },
    'security': {
      'incident': {
        'notFound': 'Sicherheitsvorfall nicht gefunden (ID: {{incidentId}}, Operation: {{operation}}, Angefordert von: {{requestedBy}})'
      },
      'incidents': {
        'createFailed': '{{actor}} konnte Sicherheitsvorfall nicht erstellen (Fehler: {{errorType}}) um {{timestamp}}',
        'responseExecuteFailed': 'Fehler beim Ausführen der manuellen Antwort für Sicherheitsvorfall aufgrund eines Serverfehlers.',
        'retrieveDetailFailed': 'Fehler beim Abrufen der Sicherheitsvorfalldetails aufgrund eines Serverfehlers.',
        'retrieveFailed': '{{actor}} konnte Sicherheitsvorfälle nicht abrufen (Fehler: {{errorType}}) um {{timestamp}}',
        'simulationFailed': 'Bedrohungssimulation fehlgeschlagen',
        'simulationNotAllowed': 'Sicherheitssimulation in {{environment}}-Umgebung nicht erlaubt (Angefordert von: {{requestedBy}}, Grund: {{reason}})',
        'statusUpdateFailed': 'Fehler beim Aktualisieren des Sicherheitsvorfallstatus aufgrund eines Serverfehlers.'
      },
      'monitoring': {
        'alreadyRunning': 'Sicherheitsüberwachung läuft bereits'
      },
      'service': {
        'statusRetrieveFailed': 'Fehler beim Abrufen des Sicherheitsdienstestatus aufgrund eines Serverfehlers.'
      },
      'statistics': {
        'retrieveFailed': 'Fehler beim Abrufen der Vorfallstatistiken aufgrund eines Serverfehlers.'
      }
    },
    'system': {
      'cacheError': 'Cache-Operation fehlgeschlagen: {{operation}} - {{error}}',
      'configurationError': 'Systemkonfigurationsfehler: {{setting}} - {{error}}',
      'databaseConnectionFailed': 'Verbindung zur Datenbank fehlgeschlagen: {{reason}}',
      'databaseError': 'Datenbankoperation fehlgeschlagen: {{operation}} - {{error}}',
      'databaseTimeout': 'Datenbankabfrage-Timeout nach {{timeout, number}}ms',
      'dependencyFailure': 'Fehler bei externer Abhängigkeit: {{service}} - {{reason}}',
      'diskSpaceLow': 'Festplattenspeicher kritisch niedrig: {{freeSpace, number}}GB verbleibend',
      'licenseExpired': 'Systemlizenz abgelaufen am {{expiredDate, date}}',
      'licenseInvalid': 'Ungültige Systemlizenz: {{reason}}',
      'maintenanceMode': 'System befindet sich bis {{endTime, datetime}} im Wartungsmodus – {{message}}',
      'memoryExhausted': 'Server-Speicherauslastung kritisch: {{currentUsage, number}}MB / {{maxMemory, number}}MB',
      'operationFailed': 'Systemoperation "{{operation}}" fehlgeschlagen: {{reason}}',
      'rateLimited': 'System vorübergehend rate-begrenzt: {{currentRequests}}/{{maxRequests}} Anfragen in {{timeWindow}}',
      'resourceExhausted': 'Systemressourcen erschöpft: {{resource}} bei {{usage, number}}% Kapazität',
      'serverError': 'Interner Serverfehler aufgetreten',
      'serviceUnavailable': 'Dienst vorübergehend nicht verfügbar: {{reason}}',
      'taskQueueFull': 'Aufgabenwarteschlange ist voll ({{currentTasks}}/{{maxTasks}} Aufgaben)',
      'workerUnavailable': 'Keine verfügbaren Worker zur Bearbeitung der Anfrage'
    },
    'user': {
      'accountLocked': 'Benutzerkonto {{userName}} ist gesperrt aufgrund von {{reason}}',
      'accountSuspended': 'Benutzerkonto {{userName}} ist bis {{suspendedUntil, datetime}} gesperrt',
      'activationFailed': 'Fehler beim Aktivieren des Benutzerkontos für {{userName}}: {{reason}}',
      'bulkOperationFailed': 'Massenoperation fehlgeschlagen für {{failedCount}} von {{totalCount}} Benutzer',
      'bulkOperationFailed_other': 'Massenoperation fehlgeschlagen für {{failedCount}} von {{totalCount}} Benutzern',
      'createFailed': 'Fehler beim Erstellen des Benutzerkontos für {{email}}: {{reason}}',
      'deactivationFailed': 'Fehler beim Deaktivieren des Benutzerkontos für {{userName}}: {{reason}}',
      'deleteFailed': 'Fehler beim Löschen des Benutzers {{userName}}: {{reason}}',
      'emailExists': 'E-Mail-Adresse {{email}} ist bereits im System registriert',
      'inactive': 'Benutzerkonto {{userName}} ist inaktiv',
      'insufficientPermissions': 'Unzureichende Berechtigungen zum Ändern des Benutzers {{userName}} ({{userRole}})',
      'listFailed': 'Fehler beim Abrufen der Benutzerliste: {{reason}}',
      'notFound': 'Benutzer „{{userName}}“ nicht gefunden oder gelöscht',
      'notFoundById': 'Benutzer mit ID {{userId}} nicht gefunden',
      'passwordChangeFailed': 'Fehler beim Ändern des Passworts für {{userName}}: {{reason}}',
      'passwordIncorrect': 'Aktuelles Passwort ist falsch – bitte versuchen Sie es erneut',
      'profileRetrieveFailed': 'Fehler beim Abrufen des Benutzerprofils für {{userName}}: {{reason}}',
      'registrationError': 'Benutzerregistrierung aufgrund eines Systemfehlers fehlgeschlagen: {{details}}',
      'registrationFailed': 'Benutzerregistrierung fehlgeschlagen: {{reason}}',
      'roleChangeFailed': 'Fehler beim Ändern der Rolle für {{userName}} von {{oldRole}} zu {{newRole}}: {{reason}}',
      'sessionLimitExceeded': 'Benutzer {{userName}} hat die maximale Anzahl gleichzeitiger Sitzungen überschritten ({{currentSessions}}/{{maxSessions}})',
      'updateFailed': 'Fehler beim Aktualisieren des Benutzerprofils für {{userName}}: {{reason}}',
      'usernameExists': 'Benutzername „{{username}}“ ist bereits vergeben'
    },
    'zodDemo': {
      'file': {
        'uploadFailed': 'Datei-Upload fehlgeschlagen - {{actor}} konnte {{operation}} für "{{fileName}}" ({{fileSize}} Bytes) nicht abschließen: {{reason}}'
      },
      'search': {
        'failed': 'Suchoperation fehlgeschlagen - {{actor}} konnte {{operation}} für Abfrage "{{query}}" ({{searchType}}) nicht abschließen: {{reason}}'
      },
      'user': {
        'registrationFailed': 'Benutzerregistrierung fehlgeschlagen - {{actor}} konnte {{operation}} für {{userName}} ({{email}}) nicht abschließen: {{reason}}'
      }
    },
    'businessRuleViolation': 'Verletzung der Geschäftsregel: {{rules}}',
    'constraintViolation': 'Datenbankeinschränkungsverletzung: {{constraint}}',
    'dataIntegrityError': 'Datenintegritätsfehler: {{details}}',
    'schemaViolation': 'Daten-Schema-Verletzung: {{violations}}',
    'validation': 'Validierungsfehler aufgetreten: {{details}}',
    'validation_other': '{{count}} Validierungsfehler aufgetreten: {{details}}',
    'validationField': 'Validierung fehlgeschlagen für Feld „{{field}}“: {{error}}',
    'validationGeneric': 'Validierungsfehler',
    'validationMultiple': 'Mehrere Validierungsfehler in {{count}} Feld',
    'validationMultiple_other': 'Mehrere Validierungsfehler in {{count}} Feldern'
  },
  'formatting': {
    'currency': 'Gesamt: {{amount, currency}}',
    'dateRange': 'Von {{startDate, date}} bis {{endDate, date}}',
    'filesSize': '{{count}} Datei von {{size, number}} Bytes',
    'filesSize_other': '{{count}} Dateien mit insgesamt {{size, number}} Bytes',
    'percentage': 'Fortschritt: {{value, number}}%',
    'timeAgo': 'vor {{time, time}}'
  },
  'numbers': {
    'count': '{{value, number}}',
    'currency': '{{value, number}}€',
    'percentage': '{{value}}%'
  },
  'roles': {
    'displayName': 'Rolle',
    'displayName_context_admin': 'Verwalter',
    'displayName_context_super_admin': 'Super-Administrator',
    'displayName_context_user': 'Benutzer'
  },
  'security': {
    'alerts': {
      'alertTemplate': 'Warnung: {{name}} - {{eventType}}',
      'channelCreated': 'Warnungskanal erfolgreich erstellt',
      'channelsFailed': 'Fehler beim Abrufen der Warnkanäle',
      'createChannelFailed': 'Fehler beim Erstellen des Warnkanals',
      'createRuleFailed': 'Fehler beim Erstellen der Warnregel',
      'historyFailed': 'Fehler beim Abrufen des Warnverlaufs',
      'manualSent': 'Manuelle Warnung erfolgreich gesendet',
      'ruleCreated': 'Warnungsregel erfolgreich erstellt',
      'rulesFailed': 'Fehler beim Abrufen der Warnregeln',
      'ruleToggled': 'Warnungsregel erfolgreich umgeschaltet',
      'ruleToggledTestMode': 'Regel erfolgreich umgeschaltet (Testmodus)',
      'sendFailed': 'Fehler beim Senden einer manuellen Warnung',
      'statusFailed': 'Fehler beim Abrufen des Status des Warnsystems',
      'testCompleted': 'Warnungssystemtest abgeschlossen',
      'testFailed': 'Fehler beim Testen des Warnsystems',
      'toggleFailed': 'Fehler beim Umschalten der Warnregel'
    }
  },
  'success': {
    'admin': {
      'backupCompleted': 'Systemsicherung erfolgreich abgeschlossen ({{backupSize, number}}MB in {{duration, number}}s)',
      'backupRestored': 'Systemsicherung erfolgreich wiederhergestellt von {{backupDate, date}}',
      'cacheCleared': 'Systemcache erfolgreich geleert – {{freedMemory, number}}MB freigegeben',
      'configurationUpdated': 'Systemkonfiguration erfolgreich aktualisiert – {{changedSettings}} Einstellung geändert',
      'configurationUpdated_other': 'Systemkonfiguration erfolgreich aktualisiert – {{changedSettings}} Einstellungen geändert',
      'databaseOptimized': 'Datenbankoptimierung abgeschlossen – {{optimizedTables}} Tabelle verarbeitet',
      'databaseOptimized_other': 'Datenbankoptimierung abgeschlossen – {{optimizedTables}} Tabellen verarbeitet',
      'logRotationCompleted': 'Protokollrotation abgeschlossen – {{archivedLogs}} Protokolldatei archiviert',
      'logRotationCompleted_other': 'Protokollrotation abgeschlossen – {{archivedLogs}} Protokolldateien archiviert',
      'maintenanceCompleted': 'Systemwartung erfolgreich abgeschlossen – Ausfallzeit: {{downtimeDuration}}',
      'maintenanceScheduled': 'Systemwartung geplant für {{maintenanceDate, date}} um {{maintenanceTime, time}}',
      'reportCreated': 'Administrativer Bericht erstellt mit {{recordCount, number}} Datensatz',
      'reportCreated_other': 'Administrativer Bericht erstellt mit {{recordCount, number}} Datensätzen',
      'securityScanCompleted': 'Sicherheitsscan abgeschlossen – {{threatsFound}} Bedrohung erkannt',
      'securityScanCompleted_other': 'Sicherheitsscan abgeschlossen – {{threatsFound}} Bedrohungen erkannt',
      'serviceRestarted': 'Systemdienst {{serviceName}} erfolgreich neu gestartet',
      'statsGenerated': 'Systemstatistiken erfolgreich für den Zeitraum {{period}} generiert – {{dataPoints}} Datenpunkt',
      'statsGenerated_other': 'Systemstatistiken erfolgreich für den Zeitraum {{period}} generiert – {{dataPoints}} Datenpunkte',
      'systemHealthy': 'Systemintegritätsprüfung abgeschlossen: {{status, uppercase}} ({{uptime, number}}% Betriebszeit)',
      'userDetailsRetrieved': 'Benutzerdetails abgerufen: {{userName}} ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}'
    },
    'advancedAudit': {
      'analytics': {
        'retrieved': 'Erweiterte Audit-Analytik erfolgreich abgerufen'
      },
      'archival': {
        'restoreCompleted': 'Archivwiederherstellung erfolgreich abgeschlossen mit {{restoredCount}} wiederhergestellt und {{skippedCount}} übersprungen',
        'runCompleted': 'Archivierung erfolgreich abgeschlossen mit {{archivedCount}} archiviert und {{remainingCount}} verbleibend',
        'statsRetrieved': 'Archivierungsstatistiken erfolgreich abgerufen'
      },
      'behavior': {
        'analyzed': 'Benutzerverhaltensanalyse erfolgreich abgeschlossen'
      },
      'compliance': {
        'generated': 'Compliance-Audit-Bericht erfolgreich erstellt'
      },
      'performance': {
        'analyzed': 'Performance-Audit-Analyse erfolgreich abgeschlossen'
      },
      'security': {
        'analyzed': 'Sicherheitsanalyse des Audits erfolgreich durchgeführt'
      }
    },
    'auditMessages': {
      'exported': 'Audit-Protokolle erfolgreich exportiert',
      'healthRetrieved': 'Audit-Systemzustand erfolgreich abgerufen',
      'retrieved': 'Audit-Nachrichten erfolgreich abgerufen',
      'searchCompleted': 'Audit-Suche erfolgreich abgeschlossen mit {{resultCount}} Ergebnis',
      'searchCompleted_other': 'Audit-Suche erfolgreich abgeschlossen mit {{resultCount}} Ergebnissen',
      'statsRetrieved': 'Audit-Statistiken erfolgreich abgerufen'
    },
    'auth': {
      'accessGranted': 'Zugriff auf {{resource}} für {{userName}} gewährt',
      'accountUnlocked': 'Konto {{userName}} erfolgreich von {{unlockedBy}} entsperrt',
      'loginSuccess': 'Erfolgreich als {{userName}} ({{userRole}}) um {{loginTime}} angemeldet',
      'logoutAllSuccess': 'Von allen Geräten um {{logoutTime}} abgemeldet',
      'logoutSuccess': 'Erfolgreich von {{deviceInfo}} um {{logoutTime}} abgemeldet',
      'mfaEnabled': 'Multi-Faktor-Authentifizierung erfolgreich für {{userName}} aktiviert',
      'mfaVerified': 'Multi-Faktor-Authentifizierung erfolgreich verifiziert',
      'passwordChanged': 'Passwort erfolgreich für {{userName}} um {{changeTime}} geändert',
      'passwordReset': 'Passwort-Reset-E-Mail an {{email}} gesendet – läuft ab in {{expiryMinutes}} Minute',
      'passwordReset_other': 'Passwort-Reset-E-Mail an {{email}} gesendet – läuft ab in {{expiryMinutes}} Minuten',
      'permissionGranted': 'Berechtigung „{{permission}}“ an {{userName}} erteilt',
      'rateLimitReset': 'Ratenbegrenzung erfolgreich für {{ipAddress}} zurückgesetzt',
      'roleAssigned': 'Rolle {{newRole}} erfolgreich {{userName}} von {{assignedBy}} zugewiesen',
      'sessionCreated': 'Neue Benutzersitzung mit {{sessionDuration}} Minute Gültigkeit erstellt',
      'sessionCreated_other': 'Neue Benutzersitzung mit {{sessionDuration}} Minuten Gültigkeit erstellt',
      'sessionExtended': 'Benutzersitzung bis {{newExpiry}} verlängert',
      'tokenGenerated': 'Neues Zugriffstoken generiert – läuft ab um {{expiryTime}}',
      'tokenRefreshed': 'Authentifizierungstoken erfolgreich um {{refreshTime}} aktualisiert'
    },
    'business': {
      'auditPassed': 'Geschäftsprüfung mit {{auditScore, number}}% bestanden – {{criteriaCount}} Kriterium erfüllt',
      'auditPassed_other': 'Geschäftsprüfung mit {{auditScore, number}}% bestanden – {{criteriaCount}} Kriterien erfüllt',
      'complianceVerified': 'Compliance-Überprüfung abgeschlossen – {{standardsCount}} Standard verifiziert',
      'complianceVerified_other': 'Compliance-Überprüfung abgeschlossen – {{standardsCount}} Standards verifiziert',
      'operationApproved': 'Geschäftsoperation „{{operation}}“ von {{approvedBy}} genehmigt',
      'processAutomated': 'Geschäftsprozess erfolgreich automatisiert – {{automatedTasks}} Aufgabe automatisiert',
      'processAutomated_other': 'Geschäftsprozess erfolgreich automatisiert – {{automatedTasks}} Aufgaben automatisiert',
      'ruleApplied': 'Geschäftsregel „{{ruleName}}“ erfolgreich auf {{affectedRecords}} Datensatz angewendet',
      'ruleApplied_other': 'Geschäftsregel „{{ruleName}}“ erfolgreich auf {{affectedRecords}} Datensätze angewendet',
      'validationPassed': 'Geschäftliche Validierung für {{entityType}} bestanden – alle {{checkCount}} Prüfung erfolgreich',
      'validationPassed_other': 'Geschäftliche Validierung für {{entityType}} bestanden – alle {{checkCount}} Prüfungen erfolgreich',
      'workflowCompleted': 'Workflow „{{workflowName}}“ erfolgreich in {{steps}} Schritt abgeschlossen',
      'workflowCompleted_other': 'Workflow „{{workflowName}}“ erfolgreich in {{steps}} Schritten abgeschlossen'
    },
    'file': {
      'backup': 'Dateisicherung erfolgreich für „{{filename}}“ erstellt',
      'compressed': 'Datei erfolgreich komprimiert – Größe um {{compressionRatio, number}}% reduziert',
      'converted': 'Datei erfolgreich von {{sourceFormat}} zu {{targetFormat}} konvertiert',
      'copied': 'Datei erfolgreich nach {{destinationPath}} kopiert',
      'deleted': 'Datei „{{filename}}“ erfolgreich gelöscht',
      'downloadCompleted': 'Datei „{{filename}}“ erfolgreich heruntergeladen',
      'extracted': 'Archiv erfolgreich entpackt – {{extractedCount}} Datei entpackt',
      'extracted_other': 'Archiv erfolgreich entpackt – {{extractedCount}} Dateien entpackt',
      'moved': 'Datei erfolgreich von {{sourcePath}} nach {{destinationPath}} verschoben',
      'processingCompleted': 'Dateiverarbeitung für „{{filename}}“ abgeschlossen – {{operationsCount}} Operation ausgeführt',
      'processingCompleted_other': 'Dateiverarbeitung für „{{filename}}“ abgeschlossen – {{operationsCount}} Operationen ausgeführt',
      'restored': 'Datei erfolgreich aus Sicherung vom {{backupDate, date}} wiederhergestellt',
      'uploadCompleted': 'Datei „{{filename}}“ erfolgreich hochgeladen ({{fileSize}})',
      'uploadsBatch': 'Batch-Upload abgeschlossen: {{successCount}}/{{totalCount}} Datei verarbeitet',
      'uploadsBatch_other': 'Batch-Upload abgeschlossen: {{successCount}}/{{totalCount}} Dateien verarbeitet',
      'validated': 'Dateivalidierung für „{{filename}}“ bestanden – Format: {{fileFormat}}'
    },
    'integration': {
      'apiCall': 'API-Aufruf an {{serviceName}} erfolgreich in {{responseTime, number}}ms abgeschlossen',
      'credentialsValidated': 'API-Anmeldeinformationen erfolgreich für {{serviceName}} validiert',
      'dataSync': 'Datensynchronisierung mit {{serviceName}} abgeschlossen – {{syncedRecords}} Datensatz verarbeitet',
      'dataSync_other': 'Datensynchronisierung mit {{serviceName}} abgeschlossen – {{syncedRecords}} Datensätze verarbeitet',
      'dataTransform': 'Datentransformation abgeschlossen – {{transformedRecords}} Datensatz verarbeitet',
      'dataTransform_other': 'Datentransformation abgeschlossen – {{transformedRecords}} Datensätze verarbeitet',
      'healthCheckPassed': 'Integritätsprüfung des externen Dienstes für {{serviceName}} bestanden',
      'rateLimit': 'API-Ratenbegrenzungsstatus: {{usedRequests}}/{{maxRequests}} Anfragen verbleibend',
      'serviceConnected': 'Erfolgreich mit {{serviceName}} verbunden – Status: {{serviceStatus}}',
      'subscriptionActive': 'Dienstabonnement für {{serviceName}} aktiv bis {{expiryDate, date}}',
      'webhookDelivered': 'Webhook erfolgreich an {{webhookUrl}} zugestellt – Status: {{deliveryStatus}}'
    },
    'kv': {
      'configs': {
        'comparisonRetrieved': 'Umgebungsvergleich von {{actor}} abgerufen - KV: {{kvCount}}, ENV: {{envCount}}, Standard: {{defaultCount}}',
        'configRetrieved': 'Konfiguration "{{key}}" von {{actor}} abgerufen: {{value}} (Standard: {{isDefault}})',
        'defaultsRetrieved': 'Standardkonfigurationen von {{actor}} abgerufen ({{keyCount}} Schlüssel)',
        'retrieved': '{{configCount}} Konfigurationen erfolgreich von {{actor}} abgerufen ({{allowedKeys}} erlaubte Schlüssel)'
      },
      'status': {
        'disabled': 'deaktiviert',
        'enabled': 'aktiviert'
      },
      'adminCacheCleared': 'Konfigurationscache von {{actor}} geleert',
      'adminConfigReset': 'Konfiguration "{{key}}" von {{actor}} auf Standard zurückgesetzt - war: {{oldValue}}, jetzt: {{defaultValue}}',
      'adminConfigUpdated': 'Konfiguration "{{key}}" von {{actor}} aktualisiert von {{oldValue}} zu {{newValue}}',
      'adminFeatureToggled': 'Feature "{{feature}}" von {{actor}} umgeschaltet: {{previousValue}} → {{newValue}}',
      'auditConfigsRetrieved': 'Audit-Konfigurationen von {{actor}} abgerufen ({{configCount}} Konfigurationen)',
      'auditPerformanceRetrieved': 'Audit-Leistungseinstellungen von {{actor}} abgerufen ({{settingCount}} Einstellungen)',
      'auditRetentionRetrieved': 'Audit-Aufbewahrungsrichtlinien von {{actor}} abgerufen ({{policyCount}} Richtlinien)',
      'backupCreated': 'Konfigurationssicherung erfolgreich erstellt mit {{configCount}} Einstellung',
      'backupCreated_other': 'Konfigurationssicherung erfolgreich erstellt mit {{configCount}} Einstellungen',
      'batchConfigUpdated': 'Batch-Konfigurationsaktualisierung von {{actor}}: {{updatedCount}}/{{totalCount}} aktualisiert ({{failedCount}} fehlgeschlagen)',
      'batchUpdateCompleted': 'Batch-Konfigurationsaktualisierung abgeschlossen: {{successCount}}/{{totalCount}} erfolgreich',
      'cacheCleared': 'Konfigurationscache erfolgreich geleert – {{clearedCount}} Eintrag entfernt',
      'cacheCleared_other': 'Konfigurationscache erfolgreich geleert – {{clearedCount}} Einträge entfernt',
      'configReset': 'Konfiguration „{{key}}“ auf Standardwert zurückgesetzt: {{defaultValue}}',
      'configRetrieved': 'Konfiguration „{{key}}“ erfolgreich abgerufen: {{value}}',
      'configUpdated': 'Konfiguration „{{key}}“ erfolgreich von {{oldValue}} auf {{newValue}} aktualisiert',
      'defaultsRestored': 'Standardkonfigurationen erfolgreich für {{restoredCount}} Schlüssel wiederhergestellt',
      'defaultsRestored_other': 'Standardkonfigurationen erfolgreich für {{restoredCount}} Schlüssel wiederhergestellt',
      'featureToggled': 'Funktion „{{feature}}“ erfolgreich {{status}}'
    },
    'operation': {
      'batchProcessed': 'Batch-Operation abgeschlossen: {{successCount}}/{{totalCount}} Elemente erfolgreich verarbeitet',
      'completed': 'Operation "{{operationType}}" erfolgreich abgeschlossen in {{duration}}ms',
      'completed_other': '{{count}} Operationen erfolgreich abgeschlossen - Durchschnittszeit: {{avgDuration}}ms',
      'taskFinished': 'Aufgabe "{{taskName}}" erfolgreich beendet mit {{resultCount}} Ergebnis',
      'taskFinished_other': 'Aufgabe "{{taskName}}" erfolgreich beendet mit {{resultCount}} Ergebnissen',
      'workflowCompleted': 'Workflow erfolgreich abgeschlossen - {{stepsCount}} Schritt ausgeführt',
      'workflowCompleted_other': 'Workflow erfolgreich abgeschlossen - {{stepsCount}} Schritte ausgeführt'
    },
    'realtimeIncidents': {
      'created': 'Echtzeitüberwachungs-Vorfall {{incidentId}} erfolgreich erstellt'
    },
    'realtimeMonitoring': {
      'alerts': {
        'configUpdated': 'Alarmkonfiguration erfolgreich aktualisiert',
        'historyRetrieved': 'Alarmverlauf erfolgreich abgerufen',
        'manualSent': 'Manuelle Warnung erfolgreich gesendet',
        'rulesRetrieved': 'Alarmregeln erfolgreich abgerufen',
        'statusRetrieved': 'Alarm-Systemstatus erfolgreich abgerufen'
      },
      'dashboard': {
        'cacheCleared': 'Echtzeit-Dashboard-Cache erfolgreich geleert',
        'liveRetrieved': 'Live-Dashboard-Snapshot erfolgreich abgegerufen',
        'overviewRetrieved': 'Übersicht des Echtzeitüberwachungs-Dashboards erfolgreich abgerufen',
        'realtimeRetrieved': 'Echtzeit-Dashboard-Daten erfolgreich abgerufen'
      },
      'incidents': {
        'created': 'Echtzeitüberwachungs-Vorfall {{incidentId}} erfolgreich erstellt'
      },
      'monitoring': {
        'analysisCompleted': 'Echtzeitüberwachungsanalyse erfolgreich abgeschlossen',
        'eventSimulated': 'Überwachungsereignis {{eventType}} erfolgreich simuliert',
        'eventsRetrieved': 'Aktuelle Überwachungsereignisse erfolgreich abgerufen',
        'started': 'Echtzeitüberwachung erfolgreich gestartet',
        'stopped': 'Echtzeitüberwachung erfolgreich gestoppt',
        'threatResolved': 'Echtzeit-Bedrohung {{threatId}} erfolgreich behoben',
        'threatsRetrieved': 'Echtzeit-Bedrohungsstatus erfolgreich abgerufen'
      }
    },
    'search': {
      'completed': 'Suche erfolgreich abgeschlossen mit {{resultCount}} Ergebnis',
      'completed_other': 'Suche erfolgreich abgeschlossen mit {{resultCount}} Ergebnissen'
    },
    'security': {
      'incident': {
        'created': '{{actor}} hat Sicherheitsvorfall "{{title}}" mit Schweregrad {{severity}} erstellt (ID: {{incidentId}}, Typ: {{type}})',
        'responseExecuted': '{{actor}} hat {{actionCount}} Antwortaktionen für Vorfall {{incidentId}} ausgeführt (Typ: {{actionType}}) um {{executedAt}}',
        'retrieved': '{{actor}} hat Details zu Vorfall {{incidentId}} abgerufen (Status: {{status}}, Schweregrad: {{severity}}, Erstellt: {{createdAt}})',
        'statusUpdated': '{{actor}} hat Status des Vorfalls {{incidentId}} von "{{oldStatus}}" zu "{{newStatus}}" um {{timestamp}} aktualisiert'
      },
      'incidents': {
        'created': '{{actor}} hat Sicherheitsvorfall "{{title}}" mit Schweregrad {{severity}} erstellt (ID: {{incidentId}}, Typ: {{type}})',
        'responseExecuted': '{{actor}} hat {{actionCount}} Antwortaktionen für Vorfall {{incidentId}} ausgeführt (Typ: {{actionType}}) um {{executedAt}}',
        'retrieved': '{{actor}} hat erfolgreich {{incidentCount}} Sicherheitsvorfälle abgerufen (Seite {{page}}, Limit {{limit}}, Filter: {{filters}})',
        'statusUpdated': '{{actor}} hat Status des Vorfalls {{incidentId}} von "{{oldStatus}}" zu "{{newStatus}}" um {{timestamp}} aktualisiert'
      },
      'monitoring': {
        'started': 'Echtzeitüberwachung erfolgreich gestartet'
      },
      'service': {
        'statusRetrieved': '{{actor}} hat Service-Status abgerufen: {{serviceHealth}} Zustand, Version {{version}}, Betriebszeit {{uptime}} (Geprüft um: {{checkedAt}})'
      },
      'simulation': {
        'completed': '{{actor}} hat {{threatType}}-Simulation mit Schweregrad {{severity}} abgeschlossen (Simulations-ID: {{simulationId}}) um {{completedAt}}'
      },
      'statistics': {
        'retrieved': '{{actor}} hat Sicherheitsstatistiken abgerufen: {{totalIncidents}} gesamt, {{activeIncidents}} aktiv, {{resolvedIncidents}} gelöst (Abgerufen um: {{retrievedAt}})'
      }
    },
    'system': {
      'cacheConnected': 'Cache-Dienst erfolgreich mit {{cacheService}} verbunden',
      'configurationLoaded': 'Systemkonfiguration erfolgreich geladen – {{configCount}} Einstellung',
      'configurationLoaded_other': 'Systemkonfiguration erfolgreich geladen – {{configCount}} Einstellungen',
      'connectionEstablished': 'Verbindung erfolgreich zu {{serviceName}} hergestellt',
      'databaseConnected': 'Datenbankverbindung erfolgreich zu {{databaseName}} hergestellt',
      'healthCheckPassed': 'Systemintegritätsprüfung bestanden – alle {{componentCount}} Komponente gesund',
      'healthCheckPassed_other': 'Systemintegritätsprüfung bestanden – alle {{componentCount}} Komponenten gesund',
      'operationCompleted': 'Systemoperation „{{operation}}“ erfolgreich in {{duration, number}}ms abgeschlossen',
      'queueProcessed': 'Aufgabenwarteschlange erfolgreich verarbeitet – {{processedCount}} Aufgabe abgeschlossen',
      'queueProcessed_other': 'Aufgabenwarteschlange erfolgreich verarbeitet – {{processedCount}} Aufgaben abgeschlossen',
      'resourceAllocated': 'Systemressourcen erfolgreich zugewiesen: {{allocatedMemory, number}}MB Speicher',
      'resourceReleased': 'Systemressourcen erfolgreich freigegeben: {{releasedMemory, number}}MB Speicher',
      'rollbackCompleted': 'System-Rollback erfolgreich auf Version {{previousVersion}} abgeschlossen',
      'serviceStarted': 'Systemdienst {{serviceName}} erfolgreich auf Port {{port}} gestartet',
      'serviceStopped': 'Systemdienst {{serviceName}} ordnungsgemäß gestoppt',
      'taskCompleted': 'Hintergrundaufgabe {{taskName}} erfolgreich abgeschlossen',
      'taskScheduled': 'Hintergrundaufgabe {{taskName}} geplant für {{scheduledTime, datetime}}',
      'upgradeCompleted': 'System-Upgrade erfolgreich auf Version {{newVersion}} abgeschlossen'
    },
    'translations': {
      'retrieved': 'Übersetzungen erfolgreich abgerufen'
    },
    'user': {
      'activated': 'Benutzerkonto erfolgreich für {{userName}} aktiviert',
      'activated_other': '{{count}} Benutzerkonten erfolgreich aktiviert',
      'bulkOperationSuccess': 'Massenoperation abgeschlossen: {{successCount}}/{{totalCount}} erfolgreich',
      'created': 'Benutzerkonto erfolgreich für {{userName}} ({{email}}) erstellt',
      'created_other': '{{count}} Benutzerkonten erfolgreich erstellt',
      'dataExported': 'Benutzerdaten erfolgreich exportiert ({{fileSize, number}}KB) für {{userName}}',
      'dataImported': 'Benutzerdaten erfolgreich importiert – {{importedCount}} Datensatz verarbeitet',
      'dataImported_other': 'Benutzerdaten erfolgreich importiert – {{importedCount}} Datensätze verarbeitet',
      'deactivated': 'Benutzerkonto erfolgreich für {{userName}} deaktiviert',
      'deactivated_other': '{{count}} Benutzerkonten erfolgreich deaktiviert',
      'deleted': 'Benutzerkonto erfolgreich für {{userName}} von {{deletedBy}} gelöscht',
      'deleted_other': '{{count}} Benutzerkonten erfolgreich gelöscht',
      'emailUpdated': 'E-Mail-Adresse von {{oldEmail}} zu {{newEmail}} für {{userName}} aktualisiert',
      'emailVerified': 'E-Mail-Adresse {{email, lowercase}} erfolgreich für {{userName}} verifiziert',
      'loginHistory': 'Anmeldeverlauf abgerufen: {{entryCount}} Eintrag für {{userName}}',
      'loginHistory_other': 'Anmeldeverlauf abgerufen: {{entryCount}} Einträge für {{userName}}',
      'passwordChanged': 'Passwort erfolgreich für {{userName}} geändert',
      'permissionUpdated': 'Benutzerberechtigungen erfolgreich für {{userName}} aktualisiert',
      'profileCompleted': 'Benutzerprofil ist jetzt zu {{percent, number}}% vollständig für {{userName}}',
      'profileRetrieved': 'Benutzerprofil erfolgreich für {{userName}} ({{userRole}}) von [{{requestedBy}}] abgerufen',
      'profileUpdated': 'Benutzerprofil erfolgreich aktualisiert für {{userName}} - {{fieldsCount}} Feld geändert',
      'profileUpdated_other': 'Benutzerprofil erfolgreich aktualisiert für {{userName}} - {{fieldsCount}} Felder geändert',
      'registered': 'Benutzer {{userName}} erfolgreich mit Rolle {{userRole}} registriert',
      'registeredPendingActivation': 'Registrierung für {{userName}} erhalten. Bitte überprüfe deine E-Mail, um dein Konto zu bestätigen und zu aktivieren, bevor du dich anmeldest.',
      'roleChanged': 'Benutzerrolle von {{oldRole}} zu {{newRole}} für {{userName}} geändert',
      'sessionTerminated': 'Alle Sitzungen erfolgreich für {{userName}} beendet',
      'suspended': 'Benutzerkonto erfolgreich für {{userName}} bis {{suspendedUntil, datetime}} gesperrt',
      'unsuspended': 'Benutzerkontosperrung für {{userName}} von {{liftedBy}} aufgehoben',
      'updated': 'Benutzerprofil erfolgreich für {{userName}} aktualisiert – Felder: {{updatedFields}}',
      'updated_other': '{{count}} Benutzerprofile erfolgreich aktualisiert'
    }
  },
  'system': {
    'apiInfo': 'API-Informationen',
    'error': 'Ein Fehler ist aufgetreten',
    'invalidRequest': 'Ungültige Anfrage',
    'notFound': 'Ressource nicht gefunden',
    'operationFailed': '{{operation}} fehlgeschlagen: {{error}}',
    'serverError': 'Interner Serverfehler',
    'success': 'Vorgang erfolgreich abgeschlossen',
    'welcome': 'Willkommen bei Hono Auth API v{{version}} ({{language}})'
  },
  'user': {
    'statusDisplay': {
      'active': 'Aktiv',
      'inactive': 'Inaktiv',
      'suspended': 'Suspendiert'
    }
  },
  'validation': {
    'advancedAudit': {
      'invalidRetentionAction': 'Ungültige Aufbewahrungsaktion: {{action}}, muss eine von: {{validActions}} sein'
    },
    'advancedCleanup': {
      'backupRecommended': 'Es wird dringend empfohlen, vor der Bereinigung eine Sicherung zu erstellen',
      'confirmationRequired': 'Bestätigung erforderlich für tatsächliche Bereinigungsoperationen',
      'invalid': 'Ungültige erweiterte Bereinigungsparameter'
    },
    'arrayValidation': {
      'actions': {
        'tooFew': 'Mindestens {{minCount}} Aktion muss enthalten sein',
        'tooFew_other': 'Mindestens {{minCount}} Aktionen müssen enthalten sein',
        'tooMany': 'Es darf nicht mehr als {{maxCount}} Aktion enthalten sein',
        'tooMany_other': 'Es dürfen nicht mehr als {{maxCount}} Aktionen enthalten sein'
      },
      'channels': {
        'tooFew': 'Es muss mindestens {{minCount}} Kanal enthalten sein',
        'tooFew_other': 'Es müssen mindestens {{minCount}} Kanäle enthalten sein',
        'tooMany': 'Es darf nicht mehr als {{maxCount}} Kanal enthalten sein',
        'tooMany_other': 'Es dürfen nicht mehr als {{maxCount}} Kanäle enthalten sein'
      },
      'conditions': {
        'tooFew': 'Mindestens {{minCount}} Bedingung muss angegeben werden',
        'tooFew_other': 'Mindestens {{minCount}} Bedingungen müssen angegeben werden',
        'tooMany': 'Es darf nicht mehr als {{maxCount}} Bedingung angegeben werden',
        'tooMany_other': 'Es dürfen nicht mehr als {{maxCount}} Bedingungen angegeben werden'
      },
      'configs': {
        'tooFew': 'Mindestens {{minCount}} Konfiguration muss enthalten sein',
        'tooFew_other': 'Mindestens {{minCount}} Konfigurationen müssen enthalten sein',
        'tooMany': 'Es darf nicht mehr als {{maxCount}} Konfiguration enthalten sein',
        'tooMany_other': 'Es dürfen nicht mehr als {{maxCount}} Konfigurationen enthalten sein'
      },
      'interests': {
        'tooFew': 'Mindestens {{minCount}} Interesse muss enthalten sein',
        'tooFew_other': 'Mindestens {{minCount}} Interessen müssen enthalten sein',
        'tooMany': 'Es darf nicht mehr als {{maxCount}} Interesse enthalten sein',
        'tooMany_other': 'Es dürfen nicht mehr als {{maxCount}} Interessen enthalten sein'
      },
      'items': {
        'tooFew': 'Mindestens {{minCount}} Element muss enthalten sein',
        'tooFew_other': 'Mindestens {{minCount}} Elemente müssen enthalten sein',
        'tooMany': 'Es darf nicht mehr als {{maxCount}} Element enthalten sein',
        'tooMany_other': 'Es dürfen nicht mehr als {{maxCount}} Elemente enthalten sein'
      }
    },
    'auditSearch': {
      'atLeastOneFilterRequired': 'Mindestens {{min}} Filter muss angegeben werden',
      'atLeastOneFilterRequired_other': 'Mindestens {{min}} Filter müssen angegeben werden'
    },
    'changePassword': {
      'passwordsDoNotMatch': 'Neues Passwort und Bestätigung stimmen nicht überein'
    },
    'cleanupSimulation': {
      'confirmationRequired': 'Bestätigung erforderlich für Nicht-Testlauf-Operationen',
      'dataLossWarning': 'Warnung: Dieser Vorgang kann zu Datenverlust führen',
      'invalid': 'Ungültige Bereinigungssimulationsparameter'
    },
    'confirmPassword': {
      'mustMatch': 'Passwort-Bestätigung muss mit dem Passwort übereinstimmen',
      'required': 'Passwort-Bestätigung ist erforderlich'
    },
    'dateRange': {
      'invalid': 'Ungültiger Datumsbereich - Enddatum muss nach dem Startdatum liegen',
      'overlapConflict': 'Datumsbereich überschneidet sich mit bestehendem Bereich: {{conflictingRange}}',
      'tooLarge': 'Datumsbereich darf {{maxDays}} Tag nicht überschreiten',
      'tooLarge_other': 'Datumsbereich darf {{maxDays}} Tage nicht überschreiten'
    },
    'enumValidation': {
      'action': {
        'invalid': 'Ungültig: Aktion muss eine der folgenden sein: {{allowedValues}}'
      },
      'actionType': {
        'invalid': 'Ungültig: Aktionstyp muss einer der folgenden sein: {{allowedValues}}'
      },
      'category': {
        'invalid': 'Ungültig: Kategorie muss eine der folgenden sein: {{allowedValues}}'
      },
      'channelType': {
        'invalid': 'Ungültig: Kanaltyp muss einer der folgenden sein: {{allowedValues}}'
      },
      'file_type': {
        'invalid': 'Ungültig: Dateityp muss einer der folgenden sein: {{allowedValues}}'
      },
      'format': {
        'invalid': 'Ungültig: Format muss eines der folgenden sein: {{allowedValues}}'
      },
      'metric': {
        'invalid': 'Ungültig: Metrik muss einer der folgenden sein: {{allowedValues}}'
      },
      'operator': {
        'invalid': 'Ungültig: Operator muss einer der folgenden sein: {{allowedValues}}'
      },
      'priority': {
        'invalid': 'Ungültig: Priorität muss einer der folgenden sein: {{allowedValues}}'
      },
      'reportType': {
        'invalid': 'Ungültig: Berichtstyp muss einer der folgenden sein: {{allowedValues}}'
      },
      'resolution': {
        'invalid': 'Ungültig: Auflösung muss eine der folgenden sein: {{allowedValues}}'
      },
      'role': {
        'invalid': 'Ungültig: Rolle muss eine der folgenden sein: {{allowedValues}}'
      },
      'severity': {
        'invalid': 'Ungültig: Schweregrad muss einer der folgenden sein: {{allowedValues}}'
      },
      'sort_by': {
        'invalid': 'Ungültig: Sortierfeld muss eines der folgenden sein: {{allowedValues}}'
      },
      'sort_order': {
        'invalid': 'Ungültig: Sortierreihenfolge muss eine der folgenden sein: {{allowedValues}}'
      },
      'status': {
        'invalid': 'Ungültig: Status muss einer der folgenden sein: {{allowedValues}}'
      },
      'timeframe': {
        'invalid': 'Ungültig: Zeitraum muss einer der folgenden sein: {{allowedValues}}'
      },
      'userRole': {
        'invalid': 'Ungültig: Benutzerrolle muss einer der folgenden sein: {{allowedValues}}'
      }
    },
    'fieldRequired': {
      'action': 'Aktion ist erforderlich',
      'actionTaken': 'Durchgeführte Aktion ist erforderlich',
      'age': 'Alter ist erforderlich',
      'assignedTo': 'Zugewiesener Benutzer ist erforderlich',
      'auditLogRetentionDays': 'Aufbewahrungsdauer für Audit-Logs ist erforderlich',
      'auditRetention': 'Audit-Aufbewahrungswert ist erforderlich',
      'batchSize': 'Batch-Größe ist erforderlich',
      'categoryFilter': 'Kategoriefilter ist erforderlich',
      'channel': 'Kanal ist erforderlich',
      'channelType': 'Kanaltyp ist erforderlich',
      'conditionValue': 'Bedingungswert ist erforderlich',
      'confirmPassword': 'Passwortbestätigung ist erforderlich',
      'date': 'Datum ist erforderlich',
      'days': 'Tageswert ist erforderlich',
      'description': 'Beschreibung ist erforderlich',
      'dryRun': 'Testlauf-Flag ist erforderlich',
      'email': 'E-Mail-Adresse ist erforderlich',
      'enabled': 'Aktiviert-Status ist erforderlich',
      'endDate': 'Enddatum ist erforderlich',
      'endTime': 'Endzeit ist erforderlich',
      'errorRate': 'Fehlerrate ist erforderlich',
      'executionTime': 'Ausführungszeit-Wert ist erforderlich',
      'failureCount': 'Anzahl der Fehler ist erforderlich',
      'field': 'Feldwert ist erforderlich',
      'fileSize': 'Dateigröße ist erforderlich',
      'forceArchival': 'Erzwungene Archivierung ist erforderlich',
      'format': 'Format ist erforderlich',
      'hours': 'Stundenzahl ist erforderlich',
      'id': 'ID ist erforderlich',
      'incidentType': 'Vorfalltyp ist erforderlich',
      'includeDetails': 'Details einbeziehen ist erforderlich',
      'includeMetadata': 'Metadaten einbeziehen ist erforderlich',
      'includeUserData': 'Benutzerdaten einbeziehen ist erforderlich',
      'intervalMs': 'Intervall (ms) ist erforderlich',
      'limit': 'Limit ist erforderlich',
      'maxRecords': 'Maximale Anzahl Datensätze ist erforderlich',
      'metric': 'Metrik ist erforderlich',
      'metrics': 'Metriken sind erforderlich',
      'name': 'Name ist erforderlich',
      'page': 'Seitennummer ist erforderlich',
      'password': 'Passwort ist erforderlich',
      'period': 'Zeitraum ist erforderlich',
      'policy': 'Die Richtlinie ist erforderlich',
      'priority': 'Priorität ist erforderlich',
      'query': 'Suchanfrage ist erforderlich',
      'refreshToken': 'Refresh-Token ist erforderlich',
      'reportType': 'Berichtstyp ist erforderlich',
      'resolution': 'Auflösung ist erforderlich',
      'responseTime': 'Antwortzeit ist erforderlich',
      'securityIncident': 'Sicherheitsvorfall ist erforderlich',
      'startDate': 'Startdatum ist erforderlich',
      'startTime': 'Startzeit ist erforderlich',
      'target': 'Ziel ist erforderlich',
      'termsAccepted': 'Die Zustimmung zu den Nutzungsbedingungen ist erforderlich',
      'threshold': 'Schwellenwert ist erforderlich',
      'timeframe': 'Zeitrahmen ist erforderlich',
      'timeRange': 'Zeitbereich ist erforderlich',
      'token': 'Token ist erforderlich',
      'userDataRetention': 'Aufbewahrungswert für Nutzerdaten ist erforderlich',
      'userDataRetentionDays': 'Aufbewahrungstage für Nutzerdaten sind erforderlich',
      'userId': 'Benutzer-ID ist erforderlich',
      'username': 'Benutzername ist erforderlich',
      'userRole': 'Benutzerrolle ist erforderlich',
      'value': 'Wert ist erforderlich',
      'website': 'Website ist erforderlich'
    },
    'fileUpload': {
      'invalidExtension': 'Ungültige Dateierweiterung'
    },
    'formatValidation': {
      'assignedTo': {
        'invalid': 'Ungültiges Format für zugewiesene Benutzer-ID'
      },
      'date': {
        'invalid': 'Ungültiges Datumsformat'
      },
      'email': {
        'invalid': 'Bitte geben Sie eine gültige E-Mail-Adresse an (z.B. user@example.com)'
      },
      'endDate': {
        'invalid': 'Ungültiges Enddatumsformat'
      },
      'endTime': {
        'invalid': 'Ungültiges Endzeitformat'
      },
      'id': {
        'invalid': 'Ungültiges ID-Format'
      },
      'refreshToken': {
        'invalid': 'Ungültiges Refresh-Token-Format'
      },
      'startDate': {
        'invalid': 'Ungültiges Startdatumsformat'
      },
      'startTime': {
        'invalid': 'Ungültiges Startzeitformat'
      },
      'token': {
        'invalid': 'Ungültiges JWT-Token-Format'
      },
      'url': {
        'invalid': 'Bitte geben Sie eine gültige URL an (z.B. https://example.com)'
      },
      'website': {
        'invalid': 'Bitte geben Sie eine gültige Website-URL an (z.B. https://example.com)'
      }
    },
    'lengthValidation': {
      'action': {
        'tooLong': 'Aktion darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Aktion muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Aktion muss mindestens {{minLength}} Zeichen lang sein'
      },
      'actionTaken': {
        'tooLong': 'Durchgeführte Aktion darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Durchgeführte Aktion muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Durchgeführte Aktion muss mindestens {{minLength}} Zeichen lang sein'
      },
      'bio': {
        'tooLong': 'Biografie darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Biografie muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Biografie muss mindestens {{minLength}} Zeichen lang sein'
      },
      'channel': {
        'tooLong': 'Kanal darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Kanal muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Kanal muss mindestens {{minLength}} Zeichen lang sein'
      },
      'channelType': {
        'tooLong': 'Kanaltyp darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Kanaltyp muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Kanaltyp muss mindestens {{minLength}} Zeichen lang sein'
      },
      'confirmPassword': {
        'tooShort': 'Passwortbestätigung muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Passwortbestätigung muss mindestens {{minLength}} Zeichen lang sein'
      },
      'department': {
        'tooLong': 'Abteilung darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Abteilung muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Abteilung muss mindestens {{minLength}} Zeichen lang sein'
      },
      'description': {
        'tooLong': 'Beschreibung darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Beschreibung muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Beschreibung muss mindestens {{minLength}} Zeichen lang sein'
      },
      'email': {
        'tooLong': 'E-Mail-Adresse darf {{maxLength}} Zeichen nicht überschreiten'
      },
      'entityType': {
        'tooLong': 'Entitätstyp darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Entitätstyp muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Entitätstyp muss mindestens {{minLength}} Zeichen lang sein'
      },
      'field': {
        'tooLong': 'Feld darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Feld muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Feld muss mindestens {{minLength}} Zeichen lang sein'
      },
      'incidentType': {
        'tooLong': 'Vorfalltyp darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Vorfalltyp muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Vorfalltyp muss mindestens {{minLength}} Zeichen lang sein'
      },
      'interest': {
        'tooLong': 'Interesse darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Interesse muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Interesse muss mindestens {{minLength}} Zeichen lang sein'
      },
      'name': {
        'tooLong': 'Name darf {{maxLength}} Zeichen nicht überschreiten'
      },
      'nextSteps': {
        'tooLong': 'Nächste Schritte dürfen {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Nächste Schritte müssen mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Nächste Schritte müssen mindestens {{minLength}} Zeichen lang sein'
      },
      'note': {
        'tooLong': 'Notiz darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Notiz muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Notiz muss mindestens {{minLength}} Zeichen lang sein'
      },
      'notes': {
        'tooLong': 'Notizen dürfen {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Notizen müssen mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Notizen müssen mindestens {{minLength}} Zeichen lang sein'
      },
      'password': {
        'tooLong': 'Zu lang: Passwort darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Zu kurz: Passwort muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Zu kurz: Passwort muss mindestens {{minLength}} Zeichen lang sein'
      },
      'query': {
        'tooLong': 'Suchanfrage darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Suchanfrage muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Suchanfrage muss mindestens {{minLength}} Zeichen lang sein'
      },
      'search': {
        'tooLong': 'Suchtext darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Suchtext muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Suchtext muss mindestens {{minLength}} Zeichen lang sein'
      },
      'sortBy': {
        'tooLong': 'Sortierfeld darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Sortierfeld muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Sortierfeld muss mindestens {{minLength}} Zeichen lang sein'
      },
      'source': {
        'tooLong': 'Quelle darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Quelle muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Quelle muss mindestens {{minLength}} Zeichen lang sein'
      },
      'system': {
        'tooLong': 'System darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'System muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'System muss mindestens {{minLength}} Zeichen lang sein'
      },
      'target': {
        'tooLong': 'Ziel darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Ziel muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Ziel muss mindestens {{minLength}} Zeichen lang sein'
      },
      'template': {
        'tooLong': 'Vorlage darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Vorlage muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Vorlage muss mindestens {{minLength}} Zeichen lang sein'
      },
      'token': {
        'tooLong': 'Token darf {{maxLength}} Zeichen nicht überschreiten',
        'tooShort': 'Token muss mindestens {{minLength}} Zeichen lang sein',
        'tooShort_other': 'Token muss mindestens {{minLength}} Zeichen lang sein'
      }
    },
    'numericValidation': {
      'age': {
        'tooLarge': 'Alter darf {{maxValue}} Jahre nicht überschreiten',
        'tooSmall': 'Alter muss mindestens {{minValue}} Jahre betragen'
      },
      'auditLogRetentionDays': {
        'tooSmall': 'Aufbewahrungstage für Audit-Logs müssen mindestens {{minValue}} betragen'
      },
      'auditRetention': {
        'tooLarge': 'Audit-Aufbewahrungswert darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Audit-Aufbewahrungswert muss mindestens {{minValue}} betragen'
      },
      'batchSize': {
        'tooLarge': 'Batch-Größe darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Batch-Größe muss mindestens {{minValue}} betragen'
      },
      'days': {
        'tooLarge': 'Tage dürfen {{maxValue}} nicht überschreiten',
        'tooSmall': 'Tage müssen mindestens {{minValue}} betragen'
      },
      'errorRate': {
        'tooLarge': 'Fehlerrate darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Fehlerrate muss mindestens {{minValue}} betragen'
      },
      'executionTime': {
        'tooLarge': 'Ausführungszeit darf {{maxValue}} Sekunden nicht überschreiten',
        'tooSmall': 'Ausführungszeit muss mindestens {{minValue}} Sekunden betragen'
      },
      'failureCount': {
        'tooLarge': 'Anzahl der Fehler darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Anzahl der Fehler muss mindestens {{minValue}} betragen'
      },
      'fileSize': {
        'tooLarge': 'Dateigröße darf {{maxValue}} Bytes nicht überschreiten',
        'tooSmall': 'Dateigröße muss mindestens {{minValue}} Bytes betragen'
      },
      'hours': {
        'tooLarge': 'Stunden dürfen {{maxValue}} nicht überschreiten',
        'tooSmall': 'Stunden müssen mindestens {{minValue}} betragen'
      },
      'intervalMs': {
        'tooLarge': 'Intervall (ms) darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Intervall (ms) muss mindestens {{minValue}} betragen'
      },
      'limit': {
        'tooLarge': 'Limit darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Limit muss mindestens {{minValue}} betragen'
      },
      'maxRecords': {
        'tooLarge': 'Maximale Anzahl Datensätze darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Maximale Anzahl Datensätze muss mindestens {{minValue}} sein'
      },
      'page': {
        'tooLarge': 'Seitenzahl darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Seitenzahl muss mindestens {{minValue}} betragen'
      },
      'responseTime': {
        'tooLarge': 'Antwortzeit darf {{maxValue}} Millisekunden nicht überschreiten',
        'tooSmall': 'Antwortzeit muss mindestens {{minValue}} Millisekunden betragen'
      },
      'securityIncident': {
        'tooLarge': 'Sicherheitsvorfall darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Sicherheitsvorfall muss mindestens {{minValue}} betragen'
      },
      'threshold': {
        'tooSmall': 'Schwellenwert muss mindestens {{minValue}} sein'
      },
      'userDataRetention': {
        'tooLarge': 'Benutzerdaten-Aufbewahrung darf {{maxValue}} nicht überschreiten',
        'tooSmall': 'Benutzerdaten-Aufbewahrung muss mindestens {{minValue}} betragen'
      },
      'userDataRetentionDays': {
        'tooSmall': 'Aufbewahrungstage für Nutzerdaten müssen mindestens {{minValue}} betragen'
      },
      'userId': {
        'tooSmall': 'Benutzer-ID muss mindestens {{minValue}} sein'
      }
    },
    'retentionPolicy': {
      'atLeastOneRequired': 'Mindestens eine Aufbewahrungseinstellung muss angegeben werden',
      'atLeastOneRequired_other': 'Mindestens {{min}} Aufbewahrungseinstellungen müssen angegeben werden',
      'conflictingRules': 'Konfliktierende Aufbewahrungsregeln erkannt: {{conflicts}}',
      'invalid': 'Ungültige Aufbewahrungsrichtlinie'
    },
    'retentionPolicyUpdate': {
      'atLeastOneFieldRequired': 'Mindestens ein Feld muss aktualisiert werden',
      'atLeastOneFieldRequired_other': 'Mindestens {{min}} Felder müssen aktualisiert werden',
      'immutableField': 'Feld „{{field}}“ kann nach der Erstellung nicht mehr geändert werden',
      'invalid': 'Ungültige Aktualisierung der Aufbewahrungsrichtlinie'
    },
    'security': {
      'xssPatternDetected': 'Mögliches XSS-Muster erkannt: {{patternName}} ist nicht erlaubt'
    },
    'structureValidation': {
      'conditions': {
        'invalid': 'Ungültige Bedingungsstruktur'
      },
      'config': {
        'invalid': 'Ungültige Konfigurationsstruktur'
      },
      'configUpdate': {
        'invalid': 'Ungültiges Konfigurationsaktualisierungsformat. Pflichtfeld "value" fehlt oder enthält unerkannte Felder'
      },
      'incidentCreation': {
        'invalid': 'Ungültige Incident-Erstellungsstruktur'
      },
      'login': {
        'invalid': 'Ungültiges Login-Anfrageformat'
      },
      'metadata': {
        'invalid': 'Ungültige Metadatenstruktur'
      },
      'object': {
        'invalid': 'Ungültige Objektstruktur'
      },
      'record': {
        'invalid': 'Ungültiges Datensatzformat'
      }
    },
    'termsAccepted': {
      'mustBeTrue': 'Allgemeine Geschäftsbedingungen müssen akzeptiert werden',
      'versionMismatch': 'Nutzungsbedingungen wurden aktualisiert – bitte überprüfen und akzeptieren Sie die neueste Version'
    },
    'timeRange': {
      'eitherHoursOrRangeRequired': 'Entweder Stunden oder Datumsbereich muss angegeben werden',
      'endTimeMustBeAfterStartTime': 'Endzeit muss nach der Startzeit liegen',
      'invalid': 'Zeitrahmen muss einer der folgenden sein: last_1h, last_6h, last_24h, last_7d, last_30d',
      'invalidFormat': 'Zeitbereichsformat ist ungültig (erwartet: {{expectedFormat}})',
      'rangeTooLarge': 'Zeitbereich darf {{maxDays}} Tag nicht überschreiten',
      'rangeTooLarge_other': 'Zeitbereich darf {{maxDays}} Tage nicht überschreiten',
      'required': 'Zeitbereich ist erforderlich'
    },
    'typeValidation': {
      'configValue': {
        'invalid': 'Ungültiger Konfigurationswert-Typ'
      },
      'value': {
        'invalid': 'Ungültiger Datentyp'
      }
    },
    'username': {
      'invalid': 'Benutzername kann nur Buchstaben, Zahlen und Unterstriche enthalten',
      'invalidCharacters': 'Benutzername kann nur Buchstaben, Zahlen und Unterstriche enthalten',
      'required': 'Benutzername ist erforderlich',
      'reserved': 'Benutzername „{{username}}“ ist reserviert und kann nicht verwendet werden',
      'tooLong': 'Zu lang: Benutzername kann 30 Zeichen nicht überschreiten',
      'tooShort': 'Zu kurz: Benutzername muss mindestens 3 Zeichen haben',
      'tooShort_other': 'Zu kurz: Benutzername muss mindestens {{minLength}} Zeichen lang sein',
      'unavailable': 'Benutzername „{{username}}“ ist nicht verfügbar'
    },
    'filterArrayTooLarge': 'Filter-Array zu groß (max 500 Elemente)',
    'filterArrayTooLarge_other': 'Filter-Array mit {{count}} Elementen überschreitet das Maximum von {{max}}',
    'invalid': 'Ungültiger Wert angegeben',
    'invalid_other': '{{count}} ungültige Werte angegeben',
    'invalidArchiveAction': 'Ungültige Archiv-Aktion',
    'invalidJson': 'Ungültiges JSON im Anfragekörper',
    'invalidRole': 'Ungültige Rolle angegeben',
    'limitTooLarge': 'Limit zu groß (max 50.000 Datensätze)',
    'limitTooLarge_other': 'Limit {{limit}} überschreitet das Maximum von {{max}} Datensätzen',
    'registrationFailed': 'Registrierung fehlgeschlagen',
    'requestTooLarge': 'Anfrage-Payload zu groß',
    'required': 'Dieses Feld ist erforderlich',
    'required_other': '{{count}} Pflichtfelder fehlen',
    'searchFailed': 'Suche fehlgeschlagen',
    'serviceTempUnavailable': 'Anfrage zu groß zum Verarbeiten - Service vorübergehend nicht verfügbar',
    'tooLong': 'Wert überschreitet das Zeichenlimit von {{max}}',
    'tooLong_other': 'Wert überschreitet das Zeichenlimit von {{max}}',
    'tooShort': 'Wert muss mindestens {{min}} Zeichen lang sein',
    'tooShort_other': 'Wert muss mindestens {{min}} Zeichen lang sein',
    'translationsFailed': 'Übersetzungen konnten nicht abgerufen werden',
    'unsupportedFormat': 'Nicht unterstütztes Export-Format',
    'updateRequiresField': 'Mindestens ein Feld ist für Update erforderlich',
    'updateRequiresField_other': 'Mindestens {{min}} Felder sind für den Aktualisierungsvorgang erforderlich',
    'uploadFailed': 'Datei-Upload fehlgeschlagen'
  },
  'zodDemo': {
    'anotherSearchResultTitle': 'Weiteres Ergebnis für',
    'description': 'Dies zeigt, wie man Zod mit Hono für robuste Validierung verwendet',
    'noDescription': 'Keine Beschreibung angegeben',
    'searchResultTitle': 'Ergebnis für',
    'title': 'Zod-Validierungs-Demo'
  },
  'zodDemo_operations': {
    'fileUpload': 'Demo-Datei-Upload',
    'searchExecution': 'Demo-Suchausführung',
    'userRegistration': 'Demo-Benutzerregistrierung'
  }
};
