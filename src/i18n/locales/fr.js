/**
 * FR translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: 2025-12-16T04:10:26.760Z
*/

export default {
  'admin': {
    'accessLevel': {
      'full': 'accès complet au système',
      'limited': 'accès limité (niveau administrateur)'
    },
    'actions': {
      'permanentDeletion': 'suppression permanente du compte'
    },
    'dataScope': {
      'full': 'données complètes',
      'limited': 'données filtrées'
    },
    'operations': {
      'adminDashboardAccess': 'accès au tableau de bord administrateur',
      'adminRoutesAccess': 'accès aux routes administrateur',
      'createUser': 'création d\'utilisateur',
      'deleteUser': 'suppression de l\'utilisateur #{{userId}}',
      'updateUser': 'mise à jour de l\'utilisateur #{{userId}}'
    },
    'protectionReason': {
      'hierarchy': 'La hiérarchie des rôles doit être maintenue',
      'higherPrivilege': 'Impossible de modifier les utilisateurs avec des privilèges supérieurs',
      'roleChange': 'Les utilisateurs ne peuvent pas modifier leurs propres rôles',
      'superAdmin': 'Les comptes Super Administrateur sont protégés'
    },
    'systemStatus': {
      'healthy': 'SAIN',
      'unhealthy': 'INSALUBRE'
    },
    'accessDenied': 'Accès administrateur requis pour cette opération',
    'accountDeletionSuggestion': 'Contactez un autre administrateur pour la gestion du compte',
    'activeUsersCount': '{{count}} utilisateur actif',
    'activeUsersCount_other': '{{count}} utilisateurs actifs ({{percentage}})',
    'changedByUser': 'Modifié par {{username}} ({{role}})',
    'changesApplied': '{{count}} modification appliquée',
    'changesApplied_other': '{{count}} modifications appliquées',
    'checkedByUser': 'Vérifié par {{username}} ({{role}})',
    'createdByUser': 'Créé par {{username}} ({{role}})',
    'dashboardDataRetrieved': 'Tableau de bord chargé avec {{totalUsers}} aperçu du système (accès {{accessLevel}}). {{requestedBy}} {{dataFreshness}}',
    'dashboardRetrieved': 'Données du tableau de bord récupérées avec succès',
    'dataFreshness': 'Généré le {{timestamp}}',
    'deletedByUser': 'Supprimé par {{username}} ({{role}})',
    'effectiveImmediately': 'Modifications effectives immédiatement',
    'failedLoginAttempts': '{{count}} échec de connexion au cours de la dernière heure',
    'failedLoginAttempts_other': '{{count}} échecs de connexion au cours de la dernière heure',
    'performanceGrade': 'Performance : {{grade}}',
    'requestedByUser': 'Demandé par {{username}} ({{role}})',
    'responseTime': 'Temps de réponse : {{time}}{{unit}}',
    'restrictedRoleAccess': 'Accès refusé : {{currentRole}} ne peut pas afficher les utilisateurs {{requestedRole}}',
    'roleChangedSuccessfully': 'Rôle changé de {{oldRole}} à {{newRole}} pour {{targetUserName}}. {{changedBy}} {{timestamp}} {{effectiveImmediately}}',
    'routeDiscoverySuccess': 'Routes du système récupérées avec succès',
    'securityRisk': 'Risque de sécurité : {{level}} ({{failedAttempts}})',
    'statisticsRetrieved': 'Statistiques du système : {{totalUsers}}, utilisateurs actifs : {{activeUsers}} (portée {{dataScope}}). {{requestedBy}}',
    'statsRetrieved': 'Statistiques du système récupérées avec succès',
    'systemHealthRetrieved': 'État de santé du système récupéré avec succès',
    'systemHealthRetrievedFailed': 'Échec de la récupération des informations de santé du système',
    'totalUsersCount': '{{count}} utilisateur au total',
    'totalUsersCount_other': '{{count}} utilisateurs au total',
    'updatedByUser': 'Mis à jour par {{username}} ({{role}})',
    'userCreatedSuccessfully': 'Nouvel utilisateur {{userName}} créé avec le rôle {{newUserRole}}. {{createdBy}} {{timestamp}}',
    'userDeletedSuccessfully': 'Compte utilisateur supprimé définitivement. {{deletedBy}} {{timestamp}} Action : {{action}}',
    'userDetailsRetrieved': 'Détails de l\'utilisateur récupérés : {{userName}} ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}',
    'usersListRetrieved': 'Récupération réussie de {{count}} utilisateur (affichage de {{displayedCount}} sur la page {{currentPage}} sur {{totalPages}}). {{requestedBy}}',
    'usersListRetrieved_other': 'Récupération réussie de {{count}} utilisateurs (affichage de {{displayedCount}} sur la page {{currentPage}} sur {{totalPages}}). {{requestedBy}}',
    'userUpdatedSuccessfully': 'Utilisateur {{updatedUserName}} mis à jour avec succès. {{changesCount}} {{updatedBy}} {{timestamp}}'
  },
  'api': {
    'databaseError': 'Erreur de base de données survenue',
    'healthCheck': 'L\'API fonctionne correctement',
    'methodNotAllowed': 'Méthode non autorisée',
    'routeNotFound': 'Route non trouvée',
    'validationError': 'Erreur de validation',
    'validationErrorDetails': 'Échec de la validation : {{errorCount}} erreur',
    'validationErrorDetails_other': 'Échec de la validation : {{errorCount}} erreurs'
  },
  'audit': {
    'access': {
      'full': 'accès complet au système',
      'limited': 'accès limité (basé sur le rôle)'
    },
    'health': {
      'healthy': 'SAIN',
      'suggestion_admin': 'Les contrôles de santé du système peuvent être limités pour votre rôle.',
      'suggestion_super_admin': 'Vérifiez les ressources système, la connectivité de la base de données et l\'état du service.',
      'systemCheck': 'Contrôle complet de la santé du système',
      'unhealthy': 'INSALUBRE'
    },
    'logs': {
      'error': 'Échec de la récupération des journaux d\'audit',
      'suggestion_admin': 'Vous ne pouvez consulter les journaux que pour les utilisateurs réguliers et vos propres actions.',
      'suggestion_super_admin': 'Vous avez un accès complet à tous les journaux d\'audit du système.'
    },
    'operations': {
      'export': 'exporter les journaux d’audit',
      'healthCheck': 'vérification de santé du système d’audit',
      'logsView': 'voir les journaux d’audit',
      'search': 'rechercher dans les journaux d’audit',
      'stats': 'récupérer les statistiques d’audit'
    },
    'search': {
      'allFields': 'tous les champs',
      'noQuery': 'aucune requête fournie',
      'suggestion_admin': 'Essayez de rechercher avec des termes différents ou contactez le super administrateur pour un accès étendu.',
      'suggestion_super_admin': 'Essayez d\'affiner vos critères de recherche ou vérifiez les journaux système pour les problèmes.'
    },
    'stats': {
      'suggestion_admin': 'Les statistiques sont filtrées en fonction de votre niveau d\'accès. Contactez le super administrateur pour des statistiques système complètes.',
      'suggestion_super_admin': 'Vérifiez la santé du système et la connectivité de la base de données si les statistiques ne sont pas disponibles.'
    }
  },
  'auth': {
    'operations': {
      'export': 'exporter les journaux d\'audit',
      'healthCheck': 'vérification de santé du système d\'audit',
      'login': 'connexion utilisateur',
      'logsView': 'voir les journaux d\'audit',
      'search': 'rechercher dans les journaux d\'audit',
      'stats': 'récupérer les statistiques d\'audit'
    },
    'accountNotActive': 'Le compte n\'est pas actif',
    'activationAlreadyActive': 'Votre compte est déjà actif. Vous pouvez vous connecter.',
    'activationDisabledByAdmin': 'Votre compte a été désactivé par un administrateur. Veuillez contacter le support.',
    'activationFailed': 'Échec de l\'activation du compte. Veuillez réessayer.',
    'activationInvalidToken': 'Lien d\'activation invalide ou expiré',
    'activationMissingToken': 'Jeton d\'activation manquant',
    'activationServerError': 'Une erreur s\'est produite lors de l\'activation. Veuillez réessayer plus tard.',
    'activationSuccess': 'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
    'activationTokenExpired': 'Le lien d\'activation a expiré. Veuillez en demander un nouveau.',
    'cannotAccessOtherUsers': 'Impossible d\'accéder aux ressources d\'autres utilisateurs',
    'cannotAccessSuperAdmin': 'Impossible d\'accéder aux ressources du Super Administrateur',
    'cannotChangeAdminRole': 'Impossible de changer le rôle d\'autres administrateurs',
    'cannotChangeOwnRole': '{{userName}} ({{currentRole}}) ne peut pas changer son propre rôle - {{reason}}',
    'cannotCreateAdmin': 'Impossible de créer des comptes administrateur',
    'cannotCreateHigherRole': '{{currentRole}} ne peut pas créer de comptes {{requestedRole}} en raison des restrictions de hiérarchie des rôles',
    'cannotCreateSuperAdmin': 'Impossible de créer des comptes Super Administrateur',
    'cannotDeleteOwnAccount': '{{userName}} ({{role}}) ne peut pas supprimer son propre compte. {{suggestion}}',
    'cannotDeleteSuperAdmin': 'Impossible de supprimer le compte {{targetRole}} - {{reason}} (tentative par {{currentRole}})',
    'cannotDeleteYourself': 'Impossible de supprimer votre propre compte',
    'cannotModifyHigherRoleUser': '{{currentRole}} ne peut pas modifier {{targetUserName}} ({{targetRole}}) - {{reason}}',
    'cannotModifySuperAdmin': 'Impossible de modifier les comptes Super Administrateur',
    'cannotPromoteToHigherRole': '{{currentRole}} ne peut pas promouvoir les utilisateurs vers {{requestedRole}} - {{reason}}',
    'cannotPromoteToSuperAdmin': 'Impossible de promouvoir l\'utilisateur au rang de Super Administrateur',
    'deleteNotAllowed': 'Opération de suppression non autorisée pour votre rôle',
    'forbidden': 'Accès interdit - privilèges insuffisants',
    'invalidCredentials': 'Identifiants invalides',
    'invalidRole': 'Rôle utilisateur invalide',
    'loginSuccess': 'Connexion réussie',
    'logoutAllSuccess': 'Déconnexion de tous les appareils réussie',
    'logoutSuccess': 'Déconnexion réussie',
    'passwordIncorrect': 'Le mot de passe est incorrect',
    'rateLimitExceeded': 'Trop de tentatives de connexion échouées. Veuillez réessayer plus tard.',
    'refreshSuccess': 'Token actualisé avec succès',
    'refreshTokenExpired': 'Le token de rafraîchissement a expiré',
    'refreshTokenInvalid': 'Token de rafraîchissement invalide',
    'superAdminRequired': 'Accès Super Administrateur requis',
    'tokenExpired': 'Le token a expiré',
    'tokenInvalid': 'Token invalide',
    'unauthorized': 'Accès non autorisé',
    'userNotFound': 'Utilisateur non trouvé ou inactif'
  },
  'dates': {
    'changedAt': 'Modifié le {{date, datetime}}',
    'checkedAt': 'Vérifié le {{date, datetime}}',
    'createdAt': 'Créé le {{date, datetime}}',
    'deletedAt': 'Supprimé le {{date, datetime}}',
    'updatedAt': 'Mis à jour le {{date, datetime}}',
    'userJoined': 'Rejoint le {{date, date}}'
  },
  'emails': {
    'registration': {
      'activateButton': 'Activer mon compte',
      'activateLinkText': 'Ou copiez et collez ce lien dans votre navigateur :',
      'details': 'Détails du compte',
      'disclaimer': 'Si vous n\'avez pas demandé ce compte, ignorez cet e-mail ou contactez le support.',
      'email': 'E-mail d\'inscription : {{email}}',
      'expiryWarning': 'Ce lien d\'activation expirera dans {{hours}} heures.',
      'footer': 'Ceci est un message automatique de {{appName}}. Ne répondez pas à cet email.',
      'greeting': 'Bonjour {{userName}},',
      'instructions': 'Cet e-mail confirme que nous avons reçu vos informations de compte. Si une activation ou approbation est nécessaire, vous recevrez un autre e-mail.',
      'intro': 'Merci de vous être inscrit(e) sur {{appName}}.',
      'ip': 'Adresse IP de la requête : {{ip}}',
      'securityNote': 'Pour votre sécurité, ne partagez jamais ce lien avec personne.',
      'subject': '{{appName}} - Confirmez votre inscription',
      'thanks': 'Merci,\nL\'équipe {{appName}}',
      'time': 'Heure d\'inscription : {{timestamp}}'
    }
  },
  'endpoints': {
    'admin': {
      'changeRole': 'Changer le rôle utilisateur (accès Super Admin requis)',
      'createUser': 'Créer un nouvel utilisateur (accès admin requis)',
      'dashboard': 'Obtenir des données complètes du tableau de bord (accès admin requis)',
      'deleteUser': 'Supprimer l\'utilisateur (accès Super Admin requis)',
      'stats': 'Obtenir les statistiques système (accès admin requis)',
      'systemHealth': 'Obtenir l\'état de santé complet du système (accès admin requis)',
      'updateUser': 'Mettre à jour les informations utilisateur (accès admin requis)',
      'userDetails': 'Obtenir les détails de l\'utilisateur (accès admin requis)',
      'usersList': 'Lister tous les utilisateurs (accès admin requis)'
    },
    'advanced_audit': {
      'analytics': 'Analyses d\'audit avancées (accès admin requis)',
      'analyticsBehavior': 'Analyses de comportement (accès admin requis)',
      'analyticsPerformance': 'Analyses de performance (accès admin requis)',
      'analyticsSecurity': 'Analyses de sécurité (accès admin requis)',
      'archival': 'Archivage des logs d\'audit (accès admin requis)',
      'archivalRestore': 'Restaurer les logs archivés (accès admin requis)',
      'archivalRun': 'Exécuter le processus d\'archivage (accès admin requis)',
      'archivalStats': 'Statistiques d\'archivage (accès admin requis)',
      'archiveManage': 'Gestion des archives (accès admin requis)',
      'compliance': 'Rapports de conformité (accès admin requis)',
      'complianceReport': 'Générer un rapport de conformité (accès admin requis)',
      'exportAdvanced': 'Exportation avancée (accès admin requis)',
      'middlewareStats': 'Statistiques du middleware (accès admin requis)'
    },
    'audit': {
      'export': 'Exporter les logs d\'audit (accès admin requis)',
      'logs': 'Voir les logs d\'audit (accès admin requis)',
      'search': 'Rechercher dans les logs d\'audit (accès admin requis)',
      'stats': 'Obtenir les statistiques d\'audit (accès admin requis)'
    },
    'auth': {
      'login': 'Se connecter avec email et mot de passe',
      'logout': 'Se déconnecter et invalider les tokens',
      'refresh': 'Actualiser le token d\'accès'
    },
    'demo': {
      'info': 'Informations de démonstration de validation Zod',
      'register': 'Démonstration d\'inscription utilisateur avec validation complète',
      'search': 'Démonstration de recherche avec validation des paramètres de requête',
      'upload': 'Démonstration de téléchargement de fichier avec validation des métadonnées'
    },
    'kv_admin': {
      'audit': {
        'alerts': 'Obtenir les seuils d’alerte d’audit (Super Admin uniquement)',
        'compliance': 'Obtenir les paramètres de conformité d’audit (Super Admin uniquement)',
        'configs': 'Voir les configurations du système d’audit (Super Admin uniquement)',
        'export': 'Obtenir les paramètres d’export d’audit (Super Admin uniquement)',
        'features': 'Obtenir les fonctionnalités (feature flags) d’audit (Super Admin uniquement)',
        'featureToggle': 'Basculer une fonctionnalité d’audit (Super Admin uniquement)',
        'performance': 'Obtenir les paramètres de performance d’audit (Super Admin uniquement)',
        'realtime': 'Obtenir les paramètres de surveillance en temps réel (Super Admin uniquement)',
        'retention': 'Obtenir les politiques de rétention d’audit (Super Admin uniquement)'
      },
      'config': 'Voir la configuration KV (Super Admin uniquement)',
      'configBulk': 'Mise à jour en lot de la configuration KV (Super Admin uniquement)',
      'configCacheClear': 'Vider le cache de configuration KV (Super Admin uniquement)',
      'configDefaults': 'Obtenir la configuration KV par défaut (Super Admin uniquement)',
      'configDelete': 'Supprimer la clé de configuration KV (Super Admin uniquement)',
      'configEnvComparison': 'Comparer la configuration KV entre environnements (Super Admin uniquement)',
      'configGet': 'Obtenir une configuration KV spécifique (Super Admin uniquement)',
      'configs': 'Voir les configurations KV (Super Admin uniquement)',
      'configsBatch': 'Mettre à jour en lot les configurations KV (Super Admin uniquement)',
      'configsCacheClear': 'Vider le cache des configurations KV (Super Admin uniquement)',
      'configsDefaults': 'Obtenir les configurations KV par défaut (Super Admin uniquement)',
      'configsEnvComparison': 'Comparer les configurations KV entre environnements (Super Admin uniquement)',
      'configUpdate': 'Mettre à jour la configuration KV (Super Admin uniquement)'
    },
    'realtime_monitoring': {
      'alerts': 'Gestion des alertes système (accès admin requis)',
      'alertsChannels': 'Gérer les canaux d\'alerte (accès admin requis)',
      'alertsChannelsCreate': 'Créer un canal d’alerte (accès admin requis)',
      'alertsConfigure': 'Configurer les alertes système (accès admin requis)',
      'alertsHistory': 'Obtenir l\'historique des alertes (accès admin requis)',
      'alertsRules': 'Gérer les règles d\'alerte (accès admin requis)',
      'alertsRulesCreate': 'Créer une règle d’alerte (accès admin requis)',
      'alertsRuleToggle': 'Activer/désactiver une règle d’alerte (accès admin requis)',
      'alertsSend': 'Envoyer une alerte système (accès admin requis)',
      'alertsStatus': 'Obtenir le statut des alertes (accès admin requis)',
      'alertsTest': 'Tester le système d\'alerte (accès admin requis)',
      'analyze': 'Analyser les données de surveillance (accès admin requis)',
      'dashboard': 'Tableau de bord de surveillance en temps réel (accès admin requis)',
      'dashboardCache': 'Vider le cache du tableau de bord (accès admin requis)',
      'dashboardExport': 'Exporter les données du tableau de bord (accès admin requis)',
      'dashboardHealth': 'Vérification de santé du tableau de bord (accès admin requis)',
      'dashboardLive': 'Instantané du tableau de bord en direct (accès admin requis)',
      'dashboardOverview': 'Aperçu du tableau de bord (accès admin requis)',
      'dashboardPerformance': 'Tableau de bord de performance (accès admin requis)',
      'dashboardRealtime': 'Données en direct du tableau de bord (accès admin requis)',
      'dashboardSecurity': 'Tableau de bord de sécurité (accès admin requis)',
      'dashboardTimeline': 'Chronologie du tableau de bord (accès admin requis)',
      'eventsRecent': 'Obtenir les événements de surveillance récents (accès admin requis)',
      'incidentsCreate': 'Créer un incident de surveillance en temps réel (accès admin requis)',
      'metrics': 'Métriques système en temps réel (accès admin requis)',
      'resolveThreat': 'Résoudre une menace détectée (accès admin requis)',
      'simulate': 'Simuler des scénarios de surveillance (accès admin requis)',
      'start': 'Démarrer la surveillance en temps réel (accès admin requis)',
      'status': 'Obtenir le statut de surveillance (accès admin requis)',
      'stop': 'Arrêter la surveillance en temps réel (accès admin requis)',
      'threats': 'Obtenir les informations de menaces (accès admin requis)'
    },
    'security_incident': {
      'bulkDelete': 'Suppression en masse de {{count}} incidents de sécurité (accès administrateur {{actor}} requis)',
      'create': 'Créer un nouvel incident de sécurité (accès administrateur {{actor}} requis, type {{type}}, gravité {{severity}})',
      'deleteById': 'Supprimer l\'incident de sécurité {{incidentId}} (accès administrateur {{actor}} requis)',
      'exportCsv': 'Exporter {{count}} incidents de sécurité vers CSV (accès administrateur {{actor}} requis, plage de dates : {{dateRange}})',
      'getById': 'Obtenir un incident de sécurité par ID {{incidentId}} (accès administrateur {{actor}} requis)',
      'getDashboard': 'Obtenir le tableau de bord des incidents de sécurité (accès administrateur {{actor}} requis, filtres : {{filters}})',
      'getStatistics': 'Obtenir les statistiques des incidents de sécurité (accès administrateur {{actor}} requis, période : {{period}})',
      'incidentDetails': 'Obtenir les détails de l\'incident (accès admin requis)',
      'incidentResponse': 'Exécuter la réponse à l\'incident (accès admin requis)',
      'incidents': 'Lister les incidents de sécurité (accès admin requis)',
      'incidentsCreate': 'Créer un incident de surveillance en temps réel (accès admin requis)',
      'incidentStatus': 'Mettre à jour le statut de l\'incident (accès admin requis)',
      'incidentUpdate': 'Mettre à jour l\'incident (accès admin requis)',
      'list': 'Lister les incidents de sécurité (accès administrateur {{actor}} requis, page {{page}}, limite {{limit}})',
      'serviceStatus': 'Obtenir le statut du service (accès admin requis)',
      'simulate': 'Simuler un incident de sécurité (accès admin requis)',
      'statistics': 'Obtenir les statistiques d\'incident (accès admin requis)',
      'updateById': 'Mettre à jour l\'incident de sécurité {{incidentId}} (accès administrateur {{actor}} requis, champs mis à jour : {{fields}})',
      'updateStatus': 'Mettre à jour le statut de l\'incident de sécurité {{incidentId}} à {{status}} (accès administrateur {{actor}} requis)'
    },
    'system': {
      'apiInfo': 'Informations complètes de l\'API et points de terminaison',
      'favicon': 'Ressources favicon et icônes',
      'health': 'Point de terminaison de vérification de santé',
      'language': 'Point de terminaison de changement de langue',
      'root': 'Point de terminaison racine de l\'API - message de bienvenue',
      'routes': 'Découverte des routes système (admin uniquement)',
      'unknown': 'Point de terminaison inconnu',
      'version': 'Informations de version de l\'API'
    },
    'translations': {
      'get': 'Obtenir toutes les traductions pour une langue spécifique',
      'list': 'Lister toutes les langues disponibles et leur statut de validation',
      'section': 'Obtenir les traductions de section spécifique',
      'validate': 'Valider l\'exhaustivité des traductions'
    },
    'user': {
      'me': 'Obtenir les informations de l\'utilisateur actuel (authentification requise)',
      'profile': 'Obtenir le profil utilisateur (authentification requise)',
      'register': 'Enregistrer un nouvel utilisateur',
      'updatePassword': 'Changer le mot de passe (authentification requise)',
      'updateProfile': 'Mettre à jour le profil utilisateur (authentification requise)'
    }
  },
  'errors': {
    'admin': {
      'accessDenied': 'Accès admin requis pour cette opération',
      'dashboardRetrieveFailed': 'Impossible de récupérer les données du tableau de bord admin',
      'permissionDenied': 'Permissions admin insuffisantes pour cette opération',
      'roleChangeFailed': 'Impossible de changer le rôle utilisateur',
      'statsRetrieveFailed': 'Impossible de récupérer les statistiques admin',
      'systemHealthRetrieveFailed': 'Impossible de récupérer les informations de santé du système',
      'userManagementFailed': 'Opération de gestion des utilisateurs échouée'
    },
    'advancedAudit': {
      'analytics': {
        'failed': 'Impossible de récupérer les données d\'analyse - {{actor}} n\'a pas pu compléter {{operation}} pour la période {{timeframe}}: {{reason}}'
      },
      'archival': {
        'archiveOperationFailed': 'Impossible d\'effectuer l\'opération d\'archivage - {{actor}} n\'a pas pu compléter {{operation}} ({{action}}): {{reason}}',
        'restoreFailed': 'Impossible de restaurer les journaux archivés - {{actor}} n\'a pas pu effectuer {{operation}} pour {{dateRange}}: {{reason}}',
        'runFailed': 'Impossible d\'exécuter le processus d\'archivage - {{actor}} n\'a pas pu compléter {{operation}} avec le seuil {{cutoffDays}}: {{reason}}',
        'statsFailed': 'Impossible de récupérer les statistiques d\'archivage - {{actor}} n\'a pas pu effectuer {{operation}}: {{reason}}'
      },
      'behavior': {
        'failed': 'Impossible de récupérer l\'analyse comportementale - {{actor}} n\'a pas pu compléter {{operation}} pour {{timeframe}} ciblant {{targetRole}}: {{reason}}'
      },
      'compliance': {
        'customComplianceFailed': 'Impossible de générer le rapport de conformité personnalisé - {{actor}} n\'a pas pu compléter {{operation}} pour \"{{reportName}}\" ({{reportType}}): {{reason}}',
        'failed': 'Impossible de générer le rapport de conformité - {{actor}} n\'a pas pu compléter {{operation}} pour {{timeframe}} avec le format {{format}}: {{reason}}',
        'reportFailed': 'Impossible de générer le rapport de conformité - {{actor}} n\'a pas pu effectuer {{operation}} pour le rapport {{type}}: {{reason}}'
      },
      'export': {
        'failed': 'Impossible d\'effectuer l\'exportation avancée - {{actor}} n\'a pas pu compléter {{operation}} avec le format {{format}} ({{recordCount}} enregistrements): {{reason}}'
      },
      'middleware': {
        'statsFailed': 'Impossible de récupérer les statistiques du middleware - {{actor}} n\'a pas pu effectuer {{operation}} pour {{middlewareType}}: {{reason}}'
      },
      'performance': {
        'failed': 'Impossible de récupérer l\'analyse des performances - {{actor}} ({{role}}) n\'a pas pu effectuer {{operation}} pour {{timeframe}}: {{reason}}'
      },
      'security': {
        'failed': 'Impossible de récupérer l\'analyse de sécurité - {{actor}} ({{role}}) n\'a pas pu effectuer {{operation}} pour {{timeframe}}: {{reason}}'
      }
    },
    'api': {
      'databaseError': 'Erreur de base de données dans l\'appel API : {{operation}}',
      'methodNotAllowed': 'Méthode HTTP {{method}} non autorisée pour la route {{path}}',
      'routeNotFound': 'Route API introuvable : {{method}} {{path}}',
      'validationError': 'Erreur de validation API : {{details}}'
    },
    'audit': {
      'export': {
        'exportFailed': 'Échec de l\'exportation des journaux d\'audit - {{actor}} n\'a pas pu terminer {{operation}} au format {{format}} : {{reason}}'
      },
      'health': {
        'healthFailed': 'Échec de la vérification de la santé du système d\'audit - {{actor}} n\'a pas pu effectuer {{operation}} ({{checkType}}) : {{reason}}'
      },
      'logs': {
        'retrieveFailed': 'Échec de la récupération des journaux d\'audit - {{actor}} a rencontré une erreur lors de {{operation}} : {{reason}}'
      },
      'search': {
        'searchFailed': 'Échec de la recherche dans les journaux d\'audit - {{actor}} n\'a pas pu terminer {{operation}} avec la requête \"{{query}}\" : {{reason}}'
      },
      'stats': {
        'statsFailed': 'Échec de la récupération des statistiques d\'audit - {{actor}} ({{role}}) n\'a pas pu effectuer {{operation}} : {{reason}}'
      }
    },
    'auth': {
      'accountDisabled': 'Le compte utilisateur {{userName}} est désactivé par l\'administrateur',
      'accountLocked': 'Compte verrouillé pour {{duration, time}} en raison de tentatives de connexion échouées',
      'accountNotVerified': 'L\'adresse e-mail de {{userName}} n\'est pas vérifiée',
      'cannotAccessOtherUsers': 'Impossible d\'accéder aux ressources d\'autres utilisateurs',
      'cannotChangeOwnRole': '{{userName}} ({{currentRole}}) ne peut pas changer son propre rôle - {{reason}}',
      'cannotCreateHigherRole': '{{currentRole}} ne peut pas créer de comptes {{requestedRole}} en raison des restrictions de hiérarchie des rôles',
      'cannotDeleteSuperAdmin': 'Impossible de supprimer le compte Super Administrateur',
      'cannotDeleteYourself': 'Impossible de supprimer votre propre compte',
      'cannotModifyHigherRoleUser': 'Impossible de modifier {{targetUserName}} ({{targetRole}}) - {{currentRole}} {{reason}}',
      'cannotPromoteToHigherRole': '{{currentRole}} ne peut pas promouvoir les utilisateurs vers {{requestedRole}} - {{reason}}',
      'deleteNotAllowed': 'Opération de suppression non autorisée pour votre rôle',
      'failed': 'Échec de l\'authentification : {{reason}}',
      'failed_other': '{{count}} tentatives d\'authentification ont échoué au cours de la dernière {{timeWindow}}',
      'forbidden': 'Accès interdit - privilèges insuffisants pour {{operation}}',
      'invalidCredentials': 'Identifiants invalides fournis (adresse e-mail ou mot de passe)',
      'invalidCredentials_context_admin': 'Identifiants invalides fournis pour la connexion au compte administratif',
      'invalidCredentials_context_user': 'Identifiants invalides fournis pour la connexion au compte utilisateur',
      'loginFailed': 'Le processus de connexion a échoué pour {{actor}} (Raison: {{reason}}, Opération: {{operation}}, IP: {{ipAddress}})',
      'mfaFailed': 'L\'authentification multi-facteurs a échoué : {{reason}}',
      'mfaRequired': 'L\'authentification multi-facteurs est requise pour {{userName}}',
      'passwordIncorrect': 'Le mot de passe est incorrect pour l\'utilisateur {{userName}}',
      'permissionDenied': 'Permission refusée pour l\'action : {{action}}',
      'rateLimitExceeded': 'Limite de débit dépassée : {{currentRequests}}/{{maxRequests}} requêtes par {{timeWindow}}',
      'refreshTokenExpired': 'Le jeton de rafraîchissement a expiré le {{expiredAt, datetime}}',
      'refreshTokenFailed': 'Le rafraîchissement du jeton a échoué pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'refreshTokenInvalid': 'Jeton de rafraîchissement invalide ou révoqué',
      'roleRequired': 'Rôle {{requiredRole}} requis pour cette opération',
      'sessionExpired': 'La session utilisateur a expiré le {{expiredAt, datetime}}',
      'sessionInvalid': 'Session utilisateur invalide ou corrompue',
      'superAdminRequired': 'Accès Super Administrateur requis',
      'tokenExpired': 'Le jeton d\'authentification a expiré le {{expiredAt, datetime}}',
      'tokenInvalid': 'Jeton d\'authentification invalide ou malformé',
      'tokenMissing': 'Le jeton d\'authentification est requis mais non fourni',
      'tooManyAttempts': 'Trop de tentatives de connexion échouées ({{attemptCount}}) depuis {{ipAddress}}',
      'tooManyAttempts_other': 'Trop de tentatives de connexion échouées ({{attemptCount}} tentatives) depuis {{ipAddress}}',
      'unauthorized': 'Accès non autorisé à la ressource : {{resource}}',
      'userNotFound': 'Aucun compte trouvé avec l\'adresse e-mail {{email}}'
    },
    'business': {
      'businessHoursOnly': 'Opération autorisée uniquement pendant les heures ouvrables ({{businessHours}})',
      'conflictingOperation': 'Opération conflictuelle en cours : {{operation}}',
      'deadlineExpired': 'La date limite de l\'opération a expiré le {{deadline, datetime}}',
      'duplicateEntry': 'Entrée en double détectée : {{entity}} avec {{field}} = « {{value}} »',
      'insufficientBalance': 'Solde insuffisant : {{available, currency}} disponible, {{required, currency}} requis',
      'operationNotAllowed': 'L\'opération « {{operation}} » n\'est pas autorisée : {{reason}}',
      'preconditionFailed': 'Précondition échouée : {{condition}}',
      'quotaReached': 'Limite de quota atteinte : {{used, number}}/{{limit, number}} {{resource}}',
      'referenceConstraint': 'Impossible de supprimer {{entity}} - référencé par {{referencingCount}} autre enregistrement',
      'referenceConstraint_other': 'Impossible de supprimer {{entity}} - référencé par {{referencingCount}} autres enregistrements',
      'resourceLocked': 'La ressource « {{resource}} » est verrouillée par {{lockedBy}} jusqu\'à {{lockedUntil, datetime}}',
      'workflowViolation': 'Violation de flux de travail : l\'étape {{step}} ne peut pas être effectuée dans l\'état actuel {{currentState}}'
    },
    'file': {
      'accessDenied': 'Accès refusé au fichier « {{filename}} » : {{reason}}',
      'corrupted': 'Le fichier semble corrompu ou incomplet',
      'formatUnsupported': 'Format de fichier non supporté pour l\'opération : {{operation}}',
      'invalidType': 'Le type de fichier « {{fileType}} » n\'est pas autorisé - types supportés : {{allowedTypes}}',
      'notFound': 'Fichier « {{filename}} » introuvable',
      'processingFailed': 'Le traitement du fichier a échoué : {{reason}}',
      'quotaExceeded': 'Quota de stockage dépassé : {{used, number}}Mo / {{quota, number}}Mo',
      'tooLarge': 'La taille du fichier {{actualSize, number}}Mo dépasse la limite de {{maxSize, number}}Mo',
      'tooSmall': 'La taille du fichier {{actualSize, number}} octets est inférieure au minimum de {{minSize, number}} octets',
      'uploadFailed': 'Échec du téléchargement du fichier : {{reason}}',
      'virusDetected': 'Fichier bloqué par l\'analyse de sécurité : {{threat}}'
    },
    'i18n': {
      'context_demo_failed': 'Impossible d\'exécuter la démonstration de traduction contextuelle : {{reason}}',
      'context_test_failed': 'Impossible de tester les traductions contextuelles pour la clé \"{{key}}\" : {{reason}}',
      'enhanced_demo_failed': 'Impossible d\'exécuter la démonstration des fonctionnalités i18n avancées : {{reason}}',
      'error_demo_failed': 'Impossible d\'exécuter la démonstration des messages d\'erreur : {{reason}}',
      'formatting_demo_failed': 'Impossible d\'exécuter la démonstration de formatage : {{reason}}',
      'formatting_test_failed': 'Impossible de tester la fonctionnalité de formatage pour la clé \"{{key}}\" : {{reason}}',
      'languageNotSupported': 'La langue \"{{language}}\" n\'est pas prise en charge. Langues disponibles : {{supportedLanguages}}',
      'plurals_demo_failed': 'Impossible d\'exécuter la démonstration de pluralisation : {{reason}}',
      'plurals_test_failed': 'Impossible de tester la fonctionnalité de pluralisation pour la clé \"{{key}}\" : {{reason}}',
      'sectionNotFound': 'Section de traduction \"{{section}}\" non trouvée pour la langue \"{{language}}\"',
      'success_demo_failed': 'Impossible d\'exécuter la démonstration des messages de succès : {{reason}}',
      'translationsFailed': 'Impossible de récupérer les informations de traduction : {{reason}}'
    },
    'integration': {
      'apiLimitExceeded': 'Limite de débit API dépassée pour {{serviceName}} : {{limit}} requêtes par {{period}}',
      'authenticationFailed': 'L\'authentification a échoué avec {{serviceName}} : {{reason}}',
      'credentialsExpired': 'Les identifiants API pour {{serviceName}} ont expiré le {{expiredDate, date}}',
      'dataTransformFailed': 'La transformation des données a échoué pour {{serviceName}} : {{reason}}',
      'invalidResponse': 'Réponse invalide de {{serviceName}} : {{details}}',
      'serviceDown': 'Le service externe {{serviceName}} est actuellement en panne',
      'syncFailed': 'La synchronisation des données a échoué avec {{serviceName}} : {{reason}}',
      'webhookTimeout': 'Délai d\'attente du webhook de {{serviceName}} après {{timeout, number}}ms'
    },
    'kv': {
      'accessDenied': 'Accès refusé pour la clé de configuration « {{key}} » - nécessite le rôle {{requiredRole}}',
      'alertThresholdsRetrieveFailed': 'Impossible de récupérer les seuils d\'alerte : {{reason}}',
      'auditConfigsRetrieveFailed': 'Impossible de récupérer les configurations d\'audit : {{reason}}',
      'batchUpdateFailed': 'Échec de la mise à jour par lots pour {{failedCount}} configuration sur {{totalCount}}',
      'batchUpdateFailed_other': 'Échec de la mise à jour par lots pour {{failedCount}} configurations sur {{totalCount}}',
      'cacheClearFailed': 'Impossible de vider le cache de configuration : {{reason}}',
      'cacheFailed': 'Échec de la mise à jour du cache de configuration : {{reason}}',
      'complianceSettingsRetrieveFailed': 'Impossible de récupérer les paramètres de conformité : {{reason}}',
      'configResetFailed': 'Impossible de réinitialiser la configuration \"{{key}}\" : {{reason}}',
      'configRetrieveFailed': 'Impossible de récupérer la configuration \"{{key}}\" : {{reason}}',
      'configsCompareFailed': 'Impossible de récupérer la comparaison des environnements : {{reason}}',
      'configsRetrieveFailed': 'Impossible de récupérer les configurations : {{reason}}',
      'configUpdateFailed': 'Impossible de mettre à jour la configuration \"{{key}}\" : {{reason}}',
      'exportSettingsRetrieveFailed': 'Impossible de récupérer les paramètres d\'exportation : {{reason}}',
      'featureFlagsRetrieveFailed': 'Impossible de récupérer les indicateurs de fonctionnalité : {{reason}}',
      'featureNotFound': 'Fonctionnalité introuvable ou non autorisée',
      'featureToggleFailed': 'Impossible de basculer la fonctionnalité \"{{feature}}\" : {{reason}}',
      'invalidFeatureValue': 'Valeur de fonctionnalité invalide - doit être booléenne',
      'invalidKey': 'La clé de configuration « {{key}} » n\'est pas autorisée - clés valides : {{validKeys}}',
      'keyNotFound': 'Clé de configuration « {{key}} » introuvable',
      'performanceSettingsRetrieveFailed': 'Impossible de récupérer les paramètres de performance : {{reason}}',
      'realtimeSettingsRetrieveFailed': 'Impossible de récupérer les paramètres de surveillance en temps réel : {{reason}}',
      'resetFailed': 'Échec de la réinitialisation de la configuration « {{key}} » à sa valeur par défaut : {{reason}}',
      'retentionPoliciesRetrieveFailed': 'Impossible de récupérer les politiques de rétention : {{reason}}',
      'updateFailed': 'Échec de la mise à jour de la configuration « {{key}} » : {{reason}}',
      'valueInvalid': 'Valeur invalide pour la configuration « {{key}} » : attendu {{expectedType}}, obtenu {{actualType}}'
    },
    'kvAdmin': {
      'alertThresholdsRetrieveFailed': 'Échec de la récupération des seuils d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'auditConfigsRetrieveFailed': 'Échec de la récupération des configurations d\'audit pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'cacheClearFailed': 'Échec de la suppression du cache de configuration KV pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'complianceSettingsRetrieveFailed': 'Échec de la récupération des paramètres de conformité pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'configResetFailed': 'Échec de la réinitialisation de la configuration KV {{key}} pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'configRetrieveFailed': 'Échec de la récupération de la configuration KV {{key}} pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'configsCompareFailed': 'Échec de la comparaison des configurations ENV vs KV pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'configsRetrieveFailed': 'Échec de la récupération des configurations KV pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'configUpdateFailed': 'Échec de la mise à jour de la configuration KV {{key}} pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'exportSettingsRetrieveFailed': 'Échec de la récupération des paramètres d\'exportation pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'featureFlagsRetrieveFailed': 'Échec de la récupération des indicateurs de fonctionnalités pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'featureToggleFailed': 'Échec de la bascule de la fonctionnalité {{feature}} pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'performanceSettingsRetrieveFailed': 'Échec de la récupération des paramètres de performance pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'realtimeSettingsRetrieveFailed': 'Échec de la récupération des paramètres temps réel pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
      'retentionPoliciesRetrieveFailed': 'Échec de la récupération des politiques de rétention pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})'
    },
    'network': {
      'apiError': 'Erreur API externe de {{apiName}} : {{error}}',
      'bandwidthExceeded': 'Limite de bande passante dépassée : {{usage, number}}Mo/{{limit, number}}Mo',
      'connectionFailed': 'La connexion a échoué à {{service, uppercase}} : {{reason}}',
      'connectionRefused': 'Connexion refusée par {{service}} sur le port {{port}}',
      'dnsResolutionFailed': 'Échec de la résolution DNS pour {{hostname}}',
      'hostUnreachable': 'L\'hôte {{hostname}} est inaccessible',
      'httpError': 'Erreur HTTP {{statusCode}} : {{statusMessage}}',
      'protocolError': 'Erreur de protocole réseau : {{protocol}} - {{details}}',
      'proxyError': 'Erreur du serveur proxy : {{proxyAddress}} - {{reason}}',
      'slowResponse': 'Réponse lente détectée de {{service}} ({{duration, number}}ms)',
      'socketError': 'Erreur de connexion socket : {{details}}',
      'sslError': 'Erreur de connexion SSL/TLS : {{details}}',
      'timeout': 'Délai d\'attente de la requête réseau expiré après {{duration, number}}ms vers {{service}}',
      'webhookFailed': 'Échec de la livraison du webhook à {{url}} : {{reason}}'
    },
    'realtimeMonitoring': {
      'alerts': {
        'channelsFailed': 'Échec de la récupération des canaux d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'createChannelFailed': 'Échec de la création du canal d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'createRuleFailed': 'Échec de la création de la règle d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'historyFailed': 'Échec de la récupération de l\'historique des alertes pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'rulesFailed': 'Échec de la récupération des règles d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'sendFailed': 'Échec de l\'envoi de l\'alerte manuelle pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'statusFailed': 'Échec de la récupération du statut du système d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'testFailed': 'Échec du test du système d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'toggleFailed': 'Échec de la bascule de la règle d\'alerte pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})'
      },
      'alertsConfig': {
        'configFailed': 'Échec de la configuration des alertes pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})'
      },
      'dashboard': {
        'cacheClearFailed': 'Échec de la suppression du cache du tableau de bord pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'exportFailed': 'Échec de l\'exportation du tableau de bord pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'healthCheckFailed': 'Échec de la vérification de santé du tableau de bord pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'overviewFailed': 'Échec de la récupération de l\'aperçu du tableau de bord pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'performanceFailed': 'Échec de la récupération du tableau de bord de performance pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'realtimeFailed': 'Échec de la récupération du tableau de bord temps réel pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'securityFailed': 'Échec de la récupération du tableau de bord de sécurité pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'timelineFailed': 'Échec de la récupération de la chronologie du tableau de bord pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})'
      },
      'incidents': {
        'createFailed': 'Échec de la création de l\'incident de surveillance temps réel pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})'
      },
      'monitoring': {
        'eventsFailed': 'Échec de la récupération des événements de surveillance récents pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'simulateFailed': 'Échec de la simulation de l\'événement de surveillance pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'startFailed': 'Échec du démarrage de la surveillance pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'statusFailed': 'Échec de la récupération du statut de surveillance pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'stopFailed': 'Échec de l\'arrêt de la surveillance pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})'
      },
      'threats': {
        'analyzeFailed': 'Échec de l\'analyse des menaces pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'resolveFailed': 'Échec de la résolution de la menace pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})',
        'retrieveFailed': 'Échec de la récupération du statut des menaces pour {{actor}} (Raison: {{reason}}, Opération: {{operation}})'
      }
    },
    'security': {
      'incident': {
        'notFound': 'Incident de sécurité non trouvé (ID : {{incidentId}}, Opération : {{operation}}, Demandé par : {{requestedBy}})'
      },
      'incidents': {
        'createFailed': '{{actor}} a échoué à créer un incident de sécurité (Erreur : {{errorType}}) à {{timestamp}}',
        'responseExecuteFailed': 'Échec de l\'exécution de la réponse manuelle pour l\'incident de sécurité en raison d\'une erreur serveur.',
        'retrieveDetailFailed': 'Échec de la récupération des détails de l\'incident de sécurité en raison d\'une erreur serveur.',
        'retrieveFailed': '{{actor}} a échoué à récupérer les incidents de sécurité (Erreur : {{errorType}}) à {{timestamp}}',
        'simulationFailed': 'Échec de la simulation de menace',
        'simulationNotAllowed': 'Simulation de sécurité non autorisée dans l\'environnement {{environment}} (Demandé par : {{requestedBy}}, Raison : {{reason}})',
        'statusUpdateFailed': 'Échec de la mise à jour du statut de l\'incident de sécurité en raison d\'une erreur serveur.'
      },
      'monitoring': {
        'alreadyRunning': 'La surveillance de sécurité est déjà en cours d’exécution'
      },
      'service': {
        'statusRetrieveFailed': 'Échec de la récupération du statut du service de sécurité en raison d\'une erreur serveur.'
      },
      'statistics': {
        'retrieveFailed': 'Échec de la récupération des statistiques d\'incident en raison d\'une erreur serveur.'
      }
    },
    'system': {
      'cacheError': 'L\'opération de cache a échoué : {{operation}} - {{error}}',
      'configurationError': 'Erreur de configuration du système : {{setting}} - {{error}}',
      'databaseConnectionFailed': 'Échec de la connexion à la base de données : {{reason}}',
      'databaseError': 'L\'opération de base de données a échoué : {{operation}} - {{error}}',
      'databaseTimeout': 'Délai d\'attente de la requête de base de données expiré après {{timeout, number}}ms',
      'dependencyFailure': 'Défaillance de dépendance externe : {{service}} - {{reason}}',
      'diskSpaceLow': 'Espace disque critiquement faible : {{freeSpace, number}}Go restants',
      'licenseExpired': 'La licence système a expiré le {{expiredDate, date}}',
      'licenseInvalid': 'Licence système invalide : {{reason}}',
      'maintenanceMode': 'Le système est en maintenance jusqu\'à {{endTime, datetime}} - {{message}}',
      'memoryExhausted': 'Utilisation de la mémoire du serveur critique : {{currentUsage, number}}Mo / {{maxMemory, number}}Mo',
      'operationFailed': 'Opération système \"{{operation}}\" échouée : {{reason}}',
      'rateLimited': 'Système temporairement limité en débit : {{currentRequests}}/{{maxRequests}} requêtes sur {{timeWindow}}',
      'resourceExhausted': 'Ressources système épuisées : {{resource}} à {{usage, number}}% de capacité',
      'serverError': 'Une erreur interne du serveur est survenue',
      'serviceUnavailable': 'Service temporairement indisponible : {{reason}}',
      'taskQueueFull': 'La file d\'attente des tâches est pleine ({{currentTasks}}/{{maxTasks}} tâches)',
      'workerUnavailable': 'Aucun travailleur disponible pour traiter la requête'
    },
    'user': {
      'accountLocked': 'Le compte utilisateur {{userName}} est verrouillé en raison de {{reason}}',
      'accountSuspended': 'Le compte utilisateur {{userName}} est suspendu jusqu\'à {{suspendedUntil, datetime}}',
      'activationFailed': 'Échec de l\'activation du compte utilisateur pour {{userName}} : {{reason}}',
      'bulkOperationFailed': 'L\'opération en bloc a échoué pour {{failedCount}} utilisateur sur {{totalCount}}',
      'bulkOperationFailed_other': 'L\'opération en bloc a échoué pour {{failedCount}} utilisateurs sur {{totalCount}}',
      'createFailed': 'Échec de la création du compte utilisateur pour {{email}} : {{reason}}',
      'deactivationFailed': 'Échec de la désactivation du compte utilisateur pour {{userName}} : {{reason}}',
      'deleteFailed': 'Échec de la suppression de l\'utilisateur {{userName}} : {{reason}}',
      'emailExists': 'L\'adresse e-mail {{email}} est déjà enregistrée dans le système',
      'inactive': 'Le compte utilisateur {{userName}} est inactif',
      'insufficientPermissions': 'Permissions insuffisantes pour modifier l\'utilisateur {{userName}} ({{userRole}})',
      'listFailed': 'Échec de la récupération de la liste des utilisateurs : {{reason}}',
      'notFound': 'Utilisateur « {{userName}} » introuvable ou a été supprimé',
      'notFoundById': 'Utilisateur avec l\'ID {{userId}} introuvable',
      'passwordChangeFailed': 'Échec du changement de mot de passe pour {{userName}} : {{reason}}',
      'passwordIncorrect': 'Le mot de passe actuel est incorrect - veuillez réessayer',
      'profileRetrieveFailed': 'Échec de la récupération du profil utilisateur pour {{userName}} : {{reason}}',
      'registrationError': 'L\'enregistrement de l\'utilisateur a échoué en raison d\'une erreur système : {{details}}',
      'registrationFailed': 'L\'enregistrement de l\'utilisateur a échoué : {{reason}}',
      'roleChangeFailed': 'Échec du changement de rôle pour {{userName}} de {{oldRole}} à {{newRole}} : {{reason}}',
      'sessionLimitExceeded': 'L\'utilisateur {{userName}} a dépassé le nombre maximal de sessions concurrentes ({{currentSessions}}/{{maxSessions}})',
      'updateFailed': 'Échec de la mise à jour du profil utilisateur pour {{userName}} : {{reason}}',
      'usernameExists': 'Le nom d\'utilisateur « {{username}} » est déjà pris'
    },
    'zodDemo': {
      'file': {
        'uploadFailed': 'Téléchargement de fichier échoué - {{actor}} n\'a pas pu compléter {{operation}} pour \"{{fileName}}\" ({{fileSize}} octets) : {{reason}}'
      },
      'search': {
        'failed': 'Opération de recherche échouée - {{actor}} n\'a pas pu compléter {{operation}} pour la requête \"{{query}}\" ({{searchType}}) : {{reason}}'
      },
      'user': {
        'registrationFailed': 'Inscription de l\'utilisateur échouée - {{actor}} n\'a pas pu compléter {{operation}} pour {{userName}} ({{email}}) : {{reason}}'
      }
    },
    'businessRuleViolation': 'Violation de règle métier : {{rules}}',
    'constraintViolation': 'Violation de contrainte de base de données : {{constraint}}',
    'dataIntegrityError': 'Erreur d\'intégrité des données : {{details}}',
    'schemaViolation': 'Violation du schéma de données : {{violations}}',
    'validation': 'Une erreur de validation est survenue : {{details}}',
    'validation_other': '{{count}} erreurs de validation sont survenues : {{details}}',
    'validationField': 'La validation a échoué pour le champ « {{field}} » : {{error}}',
    'validationGeneric': 'Erreur de validation',
    'validationMultiple': 'Plusieurs erreurs de validation dans {{count}} champ',
    'validationMultiple_other': 'Plusieurs erreurs de validation dans {{count}} champs'
  },
  'formatting': {
    'currency': 'Total : {{amount, currency}}',
    'dateRange': 'Du {{startDate, date}} au {{endDate, date}}',
    'filesSize': '{{count}} fichier de {{size, number}} octets',
    'filesSize_other': '{{count}} fichiers totalisant {{size, number}} octets',
    'percentage': 'Progression : {{value, number}}%',
    'timeAgo': 'il y a {{time, time}}'
  },
  'numbers': {
    'count': '{{value, number}}',
    'currency': '{{value, number}} €',
    'percentage': '{{value}}%'
  },
  'roles': {
    'displayName': 'Rôle',
    'displayName_context_admin': 'Administrateur',
    'displayName_context_super_admin': 'Super Administrateur',
    'displayName_context_user': 'Utilisateur'
  },
  'security': {
    'alerts': {
      'alertTemplate': 'Alerte: {{name}} - {{eventType}}',
      'channelCreated': 'Canal d\'alerte créé avec succès',
      'channelsFailed': 'Échec de la récupération des canaux d\'alerte',
      'createChannelFailed': 'Échec de la création du canal d\'alerte',
      'createRuleFailed': 'Échec de la création de la règle d\'alerte',
      'historyFailed': 'Échec de la récupération de l\'historique des alertes',
      'manualSent': 'Alerte manuelle envoyée avec succès',
      'ruleCreated': 'Règle d\'alerte créée avec succès',
      'rulesFailed': 'Échec de la récupération des règles d\'alerte',
      'ruleToggled': 'Règle d\'alerte basculée avec succès',
      'ruleToggledTestMode': 'Règle basculée avec succès (mode test)',
      'sendFailed': 'Échec de l\'envoi de l\'alerte manuelle',
      'statusFailed': 'Échec de la récupération de l\'état du système d\'alerte',
      'testCompleted': 'Test du système d\'alerte terminé',
      'testFailed': 'Échec du test du système d\'alerte',
      'toggleFailed': 'Échec de l\'activation/désactivation de la règle d\'alerte'
    }
  },
  'success': {
    'admin': {
      'backupCompleted': 'Sauvegarde du système terminée avec succès ({{backupSize, number}}Mo en {{duration, number}}s)',
      'backupRestored': 'Sauvegarde du système restaurée avec succès à partir du {{backupDate, date}}',
      'cacheCleared': 'Cache système vidé avec succès - {{freedMemory, number}}Mo libérés',
      'configurationUpdated': 'Configuration du système mise à jour avec succès - {{changedSettings}} paramètre modifié',
      'configurationUpdated_other': 'Configuration du système mise à jour avec succès - {{changedSettings}} paramètres modifiés',
      'databaseOptimized': 'Optimisation de la base de données terminée - {{optimizedTables}} table traitée',
      'databaseOptimized_other': 'Optimisation de la base de données terminée - {{optimizedTables}} tables traitées',
      'logRotationCompleted': 'Rotation des journaux terminée - {{archivedLogs}} fichier journal archivé',
      'logRotationCompleted_other': 'Rotation des journaux terminée - {{archivedLogs}} fichiers journaux archivés',
      'maintenanceCompleted': 'Maintenance du système terminée avec succès - temps d\'arrêt : {{downtimeDuration}}',
      'maintenanceScheduled': 'Maintenance du système prévue pour le {{maintenanceDate, date}} à {{maintenanceTime, time}}',
      'reportCreated': 'Rapport administratif créé avec {{recordCount, number}} enregistrement',
      'reportCreated_other': 'Rapport administratif créé avec {{recordCount, number}} enregistrements',
      'securityScanCompleted': 'Analyse de sécurité terminée - {{threatsFound}} menace détectée',
      'securityScanCompleted_other': 'Analyse de sécurité terminée - {{threatsFound}} menaces détectées',
      'serviceRestarted': 'Service système {{serviceName}} redémarré avec succès',
      'statsGenerated': 'Statistiques système générées avec succès pour la période {{period}} - {{dataPoints}} point de données',
      'statsGenerated_other': 'Statistiques système générées avec succès pour la période {{period}} - {{dataPoints}} points de données',
      'systemHealthy': 'Contrôle de santé du système terminé : {{status, uppercase}} ({{uptime, number}}% de temps de fonctionnement)',
      'userDetailsRetrieved': 'Détails de l\'utilisateur récupérés : {{userName}} ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}'
    },
    'advancedAudit': {
      'analytics': {
        'retrieved': 'Analyses d’audit avancées récupérées avec succès'
      },
      'archival': {
        'restoreCompleted': 'Restauration d’archives terminée avec succès avec {{restoredCount}} restauré(s) et {{skippedCount}} ignoré(s)',
        'runCompleted': 'Processus d’archivage terminé avec succès avec {{archivedCount}} archivé(s) et {{remainingCount}} restant(s)',
        'statsRetrieved': 'Statistiques d’archivage récupérées avec succès'
      },
      'behavior': {
        'analyzed': 'Analyse du comportement des utilisateurs réalisée avec succès'
      },
      'compliance': {
        'generated': 'Rapport d’audit de conformité généré avec succès'
      },
      'performance': {
        'analyzed': 'Analyse de performance d’audit réalisée avec succès'
      },
      'security': {
        'analyzed': 'Analyse de sécurité d’audit réalisée avec succès'
      }
    },
    'auditMessages': {
      'exported': 'Journaux d\'audit exportés avec succès',
      'healthRetrieved': 'État de santé du système d\'audit récupéré avec succès',
      'retrieved': 'Messages d\'audit récupérés avec succès',
      'searchCompleted': 'Recherche d\'audit terminée avec succès avec {{resultCount}} résultat',
      'searchCompleted_other': 'Recherche d\'audit terminée avec succès avec {{resultCount}} résultats',
      'statsRetrieved': 'Statistiques d\'audit récupérées avec succès'
    },
    'auth': {
      'accessGranted': 'Accès accordé à {{resource}} pour {{userName}}',
      'accountUnlocked': 'Compte {{userName}} déverrouillé avec succès par {{unlockedBy}}',
      'loginSuccess': 'Connecté avec succès en tant que {{userName}} ({{userRole}}) à {{loginTime}}',
      'logoutAllSuccess': 'Déconnecté de tous les appareils à {{logoutTime}}',
      'logoutSuccess': 'Déconnecté avec succès de {{deviceInfo}} à {{logoutTime}}',
      'mfaEnabled': 'Authentification multi-facteurs activée avec succès pour {{userName}}',
      'mfaVerified': 'Authentification multi-facteurs vérifiée avec succès',
      'passwordChanged': 'Mot de passe changé avec succès pour {{userName}} à {{changeTime}}',
      'passwordReset': 'E-mail de réinitialisation du mot de passe envoyé à {{email}} - expire dans {{expiryMinutes}} minute',
      'passwordReset_other': 'E-mail de réinitialisation du mot de passe envoyé à {{email}} - expire dans {{expiryMinutes}} minutes',
      'permissionGranted': 'Permission « {{permission}} » accordée à {{userName}}',
      'rateLimitReset': 'Limite de débit réinitialisée avec succès pour {{ipAddress}}',
      'roleAssigned': 'Rôle {{newRole}} attribué avec succès à {{userName}} par {{assignedBy}}',
      'sessionCreated': 'Nouvelle session utilisateur créée avec {{sessionDuration}} minute de validité',
      'sessionCreated_other': 'Nouvelle session utilisateur créée avec {{sessionDuration}} minutes de validité',
      'sessionExtended': 'Session utilisateur étendue jusqu\'à {{newExpiry}}',
      'tokenGenerated': 'Nouveau jeton d\'accès généré - expire à {{expiryTime}}',
      'tokenRefreshed': 'Jeton d\'authentification rafraîchi avec succès à {{refreshTime}}'
    },
    'business': {
      'auditPassed': 'Audit métier réussi avec un score de {{auditScore, number}}% - {{criteriaCount}} critère satisfait',
      'auditPassed_other': 'Audit métier réussi avec un score de {{auditScore, number}}% - {{criteriaCount}} critères satisfaits',
      'complianceVerified': 'Vérification de la conformité terminée - {{standardsCount}} norme vérifiée',
      'complianceVerified_other': 'Vérification de la conformité terminée - {{standardsCount}} normes vérifiées',
      'operationApproved': 'Opération métier « {{operation}} » approuvée par {{approvedBy}}',
      'processAutomated': 'Processus métier automatisé avec succès - {{automatedTasks}} tâche automatisée',
      'processAutomated_other': 'Processus métier automatisé avec succès - {{automatedTasks}} tâches automatisées',
      'ruleApplied': 'Règle métier « {{ruleName}} » appliquée avec succès à {{affectedRecords}} enregistrement',
      'ruleApplied_other': 'Règle métier « {{ruleName}} » appliquée avec succès à {{affectedRecords}} enregistrements',
      'validationPassed': 'Validation métier réussie pour {{entityType}} - tous les {{checkCount}} contrôles réussis',
      'validationPassed_other': 'Validation métier réussie pour {{entityType}} - tous les {{checkCount}} contrôles réussis',
      'workflowCompleted': 'Flux de travail « {{workflowName}} » terminé avec succès en {{steps}} étape',
      'workflowCompleted_other': 'Flux de travail « {{workflowName}} » terminé avec succès en {{steps}} étapes'
    },
    'file': {
      'backup': 'Sauvegarde du fichier créée avec succès pour « {{filename}} »',
      'compressed': 'Fichier compressé avec succès - taille réduite de {{compressionRatio, number}}%',
      'converted': 'Fichier converti avec succès de {{sourceFormat}} à {{targetFormat}}',
      'copied': 'Fichier copié avec succès vers {{destinationPath}}',
      'deleted': 'Fichier « {{filename}} » supprimé avec succès',
      'downloadCompleted': 'Fichier « {{filename}} » téléchargé avec succès',
      'extracted': 'Archive extraite avec succès - {{extractedCount}} fichier extrait',
      'extracted_other': 'Archive extraite avec succès - {{extractedCount}} fichiers extraits',
      'moved': 'Fichier déplacé avec succès de {{sourcePath}} à {{destinationPath}}',
      'processingCompleted': 'Traitement du fichier terminé pour « {{filename}} » - {{operationsCount}} opération effectuée',
      'processingCompleted_other': 'Traitement du fichier terminé pour « {{filename}} » - {{operationsCount}} opérations effectuées',
      'restored': 'Fichier restauré avec succès à partir de la sauvegarde créée le {{backupDate, date}}',
      'uploadCompleted': 'Fichier « {{filename}} » téléchargé avec succès ({{fileSize}})',
      'uploadsBatch': 'Téléchargement par lots terminé : {{successCount}}/{{totalCount}} fichier traité',
      'uploadsBatch_other': 'Téléchargement par lots terminé : {{successCount}}/{{totalCount}} fichiers traités',
      'validated': 'Validation du fichier réussie pour « {{filename}} » - format : {{fileFormat}}'
    },
    'integration': {
      'apiCall': 'Appel API à {{serviceName}} terminé avec succès en {{responseTime, number}}ms',
      'credentialsValidated': 'Identifiants API validés avec succès pour {{serviceName}}',
      'dataSync': 'Synchronisation des données terminée avec {{serviceName}} - {{syncedRecords}} enregistrement traité',
      'dataSync_other': 'Synchronisation des données terminée avec {{serviceName}} - {{syncedRecords}} enregistrements traités',
      'dataTransform': 'Transformation des données terminée - {{transformedRecords}} enregistrement traité',
      'dataTransform_other': 'Transformation des données terminée - {{transformedRecords}} enregistrements traités',
      'healthCheckPassed': 'Contrôle de santé du service externe réussi pour {{serviceName}}',
      'rateLimit': 'Statut de la limite de débit API : {{usedRequests}}/{{maxRequests}} requêtes restantes',
      'serviceConnected': 'Connecté avec succès à {{serviceName}} - statut : {{serviceStatus}}',
      'subscriptionActive': 'L\'abonnement au service est actif pour {{serviceName}} jusqu\'au {{expiryDate, date}}',
      'webhookDelivered': 'Webhook livré avec succès à {{webhookUrl}} - statut : {{deliveryStatus}}'
    },
    'kv': {
      'configs': {
        'comparisonRetrieved': 'Comparaison d\'environnement récupérée par {{actor}} - KV: {{kvCount}}, ENV: {{envCount}}, Défaut: {{defaultCount}}',
        'configRetrieved': 'Configuration \"{{key}}\" récupérée par {{actor}}: {{value}} (défaut: {{isDefault}})',
        'defaultsRetrieved': 'Configurations par défaut récupérées par {{actor}} ({{keyCount}} clés)',
        'retrieved': '{{configCount}} configurations récupérées avec succès par {{actor}} ({{allowedKeys}} clés autorisées)'
      },
      'status': {
        'disabled': 'désactivée',
        'enabled': 'activée'
      },
      'adminCacheCleared': 'Cache de configuration vidé par {{actor}}',
      'adminConfigReset': 'Configuration \"{{key}}\" réinitialisée par défaut par {{actor}} - était: {{oldValue}}, maintenant: {{defaultValue}}',
      'adminConfigUpdated': 'Configuration \"{{key}}\" mise à jour par {{actor}} de {{oldValue}} à {{newValue}}',
      'adminFeatureToggled': 'Fonctionnalité \"{{feature}}\" basculée par {{actor}}: {{previousValue}} → {{newValue}}',
      'auditConfigsRetrieved': 'Configurations d\'audit récupérées par {{actor}} ({{configCount}} configurations)',
      'auditPerformanceRetrieved': 'Paramètres de performance d\'audit récupérés par {{actor}} ({{settingCount}} paramètres)',
      'auditRetentionRetrieved': 'Politiques de rétention d\'audit récupérées par {{actor}} ({{policyCount}} politiques)',
      'backupCreated': 'Sauvegarde de la configuration créée avec succès avec {{configCount}} paramètre',
      'backupCreated_other': 'Sauvegarde de la configuration créée avec succès avec {{configCount}} paramètres',
      'batchConfigUpdated': 'Mise à jour de configuration par lot par {{actor}}: {{updatedCount}}/{{totalCount}} mis à jour ({{failedCount}} échoués)',
      'batchUpdateCompleted': 'Mise à jour de configuration par lots terminée : {{successCount}}/{{totalCount}} réussie',
      'cacheCleared': 'Cache de configuration vidé avec succès - {{clearedCount}} entrée supprimée',
      'cacheCleared_other': 'Cache de configuration vidé avec succès - {{clearedCount}} entrées supprimées',
      'configReset': 'Configuration « {{key}} » réinitialisée à la valeur par défaut : {{defaultValue}}',
      'configRetrieved': 'Configuration « {{key}} » récupérée avec succès : {{value}}',
      'configUpdated': 'Configuration « {{key}} » mise à jour avec succès de {{oldValue}} à {{newValue}}',
      'defaultsRestored': 'Configurations par défaut restaurées avec succès pour {{restoredCount}} clé',
      'defaultsRestored_other': 'Configurations par défaut restaurées avec succès pour {{restoredCount}} clés',
      'featureToggled': 'Fonctionnalité « {{feature}} » {{status}} avec succès'
    },
    'operation': {
      'batchProcessed': 'Opération par lots terminée : {{successCount}}/{{totalCount}} éléments traités avec succès',
      'completed': 'Opération « {{operationType}} » terminée avec succès en {{duration}}ms',
      'completed_other': '{{count}} opérations terminées avec succès - temps moyen : {{avgDuration}}ms',
      'taskFinished': 'Tâche « {{taskName}} » terminée avec succès avec {{resultCount}} résultat',
      'taskFinished_other': 'Tâche « {{taskName}} » terminée avec succès avec {{resultCount}} résultats',
      'workflowCompleted': 'Flux de travail terminé avec succès - {{stepsCount}} étape exécutée',
      'workflowCompleted_other': 'Flux de travail terminé avec succès - {{stepsCount}} étapes exécutées'
    },
    'realtimeIncidents': {
      'created': 'Incident de surveillance temps réel {{incidentId}} créé avec succès'
    },
    'realtimeMonitoring': {
      'alerts': {
        'configUpdated': 'Configuration des alertes mise à jour avec succès',
        'historyRetrieved': 'Historique des alertes récupéré avec succès',
        'manualSent': 'Alerte manuelle envoyée avec succès',
        'rulesRetrieved': 'Règles d’alerte récupérées avec succès',
        'statusRetrieved': 'Statut du système d’alertes récupéré avec succès'
      },
      'dashboard': {
        'cacheCleared': 'Cache du tableau de bord temps réel vidé avec succès',
        'liveRetrieved': 'Instantané du tableau de bord en direct récupéré avec succès',
        'overviewRetrieved': 'Vue d’ensemble du tableau de bord de surveillance en temps réel récupérée avec succès',
        'realtimeRetrieved': 'Données du tableau de bord temps réel récupérées avec succès'
      },
      'incidents': {
        'created': 'Incident de surveillance temps réel {{incidentId}} créé avec succès'
      },
      'monitoring': {
        'analysisCompleted': 'Analyse de la surveillance en temps réel terminée avec succès',
        'eventSimulated': 'Événement de surveillance {{eventType}} simulé avec succès',
        'eventsRetrieved': 'Événements de surveillance récents récupérés avec succès',
        'started': 'La surveillance en temps réel a démarré avec succès',
        'stopped': 'La surveillance en temps réel s’est arrêtée avec succès',
        'threatResolved': 'Menace en temps réel {{threatId}} résolue avec succès',
        'threatsRetrieved': 'Statut des menaces en temps réel récupéré avec succès'
      }
    },
    'search': {
      'completed': 'Recherche terminée avec succès avec {{resultCount}} résultat',
      'completed_other': 'Recherche terminée avec succès avec {{resultCount}} résultats'
    },
    'security': {
      'incident': {
        'created': '{{actor}} a créé l\'incident de sécurité \"{{title}}\" avec une gravité {{severity}} (ID : {{incidentId}}, Type : {{type}})',
        'responseExecuted': '{{actor}} a exécuté {{actionCount}} actions de réponse pour l\'incident {{incidentId}} (Type : {{actionType}}) à {{executedAt}}',
        'retrieved': '{{actor}} a récupéré les détails de l\'incident {{incidentId}} (Statut : {{status}}, Gravité : {{severity}}, Créé : {{createdAt}})',
        'statusUpdated': '{{actor}} a mis à jour le statut de l\'incident {{incidentId}} de \"{{oldStatus}}\" à \"{{newStatus}}\" à {{timestamp}}'
      },
      'incidents': {
        'created': '{{actor}} a créé l\'incident de sécurité \"{{title}}\" avec une gravité {{severity}} (ID : {{incidentId}}, Type : {{type}})',
        'responseExecuted': '{{actor}} a exécuté {{actionCount}} actions de réponse pour l\'incident {{incidentId}} (Type : {{actionType}}) à {{executedAt}}',
        'retrieved': '{{actor}} a récupéré avec succès {{incidentCount}} incidents de sécurité (page {{page}}, limite {{limit}}, filtres : {{filters}})',
        'statusUpdated': '{{actor}} a mis à jour le statut de l\'incident {{incidentId}} de \"{{oldStatus}}\" à \"{{newStatus}}\" à {{timestamp}}'
      },
      'monitoring': {
        'started': 'Surveillance en temps réel démarrée avec succès'
      },
      'service': {
        'statusRetrieved': '{{actor}} a récupéré le statut du service : santé {{serviceHealth}}, version {{version}}, temps de fonctionnement {{uptime}} (Vérifié à : {{checkedAt}})'
      },
      'simulation': {
        'completed': '{{actor}} a terminé la simulation {{threatType}} avec une gravité {{severity}} (ID de simulation : {{simulationId}}) à {{completedAt}}'
      },
      'statistics': {
        'retrieved': '{{actor}} a récupéré les statistiques de sécurité : {{totalIncidents}} total, {{activeIncidents}} actifs, {{resolvedIncidents}} résolus (Récupéré à : {{retrievedAt}})'
      }
    },
    'system': {
      'cacheConnected': 'Service de cache connecté avec succès à {{cacheService}}',
      'configurationLoaded': 'Configuration système chargée avec succès - {{configCount}} paramètre',
      'configurationLoaded_other': 'Configuration système chargée avec succès - {{configCount}} paramètres',
      'connectionEstablished': 'Connexion établie avec succès à {{serviceName}}',
      'databaseConnected': 'Connexion à la base de données établie avec succès à {{databaseName}}',
      'healthCheckPassed': 'Contrôle de santé du système réussi - tous les {{componentCount}} composants sains',
      'healthCheckPassed_other': 'Contrôle de santé du système réussi - tous les {{componentCount}} composants sains',
      'operationCompleted': 'Opération système « {{operation}} » terminée avec succès en {{duration, number}}ms',
      'queueProcessed': 'File d\'attente des tâches traitée avec succès - {{processedCount}} tâche terminée',
      'queueProcessed_other': 'File d\'attente des tâches traitée avec succès - {{processedCount}} tâches terminées',
      'resourceAllocated': 'Ressources système allouées avec succès : {{allocatedMemory, number}}Mo de mémoire',
      'resourceReleased': 'Ressources système libérées avec succès : {{releasedMemory, number}}Mo de mémoire',
      'rollbackCompleted': 'Retour arrière du système terminé avec succès vers la version {{previousVersion}}',
      'serviceStarted': 'Service système {{serviceName}} démarré avec succès sur le port {{port}}',
      'serviceStopped': 'Service système {{serviceName}} arrêté gracieusement',
      'taskCompleted': 'Tâche d\'arrière-plan {{taskName}} terminée avec succès',
      'taskScheduled': 'Tâche d\'arrière-plan {{taskName}} planifiée pour {{scheduledTime, datetime}}',
      'upgradeCompleted': 'Mise à niveau du système terminée avec succès vers la version {{newVersion}}'
    },
    'translations': {
      'retrieved': 'Traductions récupérées avec succès'
    },
    'user': {
      'activated': 'Compte utilisateur activé avec succès pour {{userName}}',
      'activated_other': '{{count}} comptes utilisateur activés avec succès',
      'bulkOperationSuccess': 'Opération en bloc terminée : {{successCount}}/{{totalCount}} réussie',
      'created': 'Compte utilisateur créé avec succès pour {{userName}} ({{email}})',
      'created_other': '{{count}} comptes utilisateur créés avec succès',
      'dataExported': 'Données utilisateur exportées avec succès ({{fileSize, number}}Ko) pour {{userName}}',
      'dataImported': 'Données utilisateur importées avec succès - {{importedCount}} enregistrement traité',
      'dataImported_other': 'Données utilisateur importées avec succès - {{importedCount}} enregistrements traités',
      'deactivated': 'Compte utilisateur désactivé avec succès pour {{userName}}',
      'deactivated_other': '{{count}} comptes utilisateur désactivés avec succès',
      'deleted': 'Compte utilisateur supprimé avec succès pour {{userName}} par {{deletedBy}}',
      'deleted_other': '{{count}} comptes utilisateur supprimés avec succès',
      'emailUpdated': 'Adresse e-mail mise à jour de {{oldEmail}} à {{newEmail}} pour {{userName}}',
      'emailVerified': 'Adresse e-mail {{email, lowercase}} vérifiée avec succès pour {{userName}}',
      'loginHistory': 'Historique de connexion récupéré : {{entryCount}} entrée pour {{userName}}',
      'loginHistory_other': 'Historique de connexion récupéré : {{entryCount}} entrées pour {{userName}}',
      'passwordChanged': 'Mot de passe changé avec succès pour {{userName}}',
      'permissionUpdated': 'Permissions utilisateur mises à jour avec succès pour {{userName}}',
      'profileCompleted': 'Le profil utilisateur est maintenant complet à {{percent, number}}% pour {{userName}}',
      'profileRetrieved': 'Profil utilisateur récupéré avec succès pour {{userName}} ({{userRole}}) par [{{requestedBy}}]',
      'profileUpdated': 'Profil utilisateur mis à jour avec succès pour {{userName}} - {{fieldsCount}} champ modifié',
      'profileUpdated_other': 'Profil utilisateur mis à jour avec succès pour {{userName}} - {{fieldsCount}} champs modifiés',
      'registered': 'Utilisateur {{userName}} enregistré avec succès avec le rôle {{userRole}}',
      'registeredPendingActivation': 'Inscription reçue pour {{userName}}. Veuillez vérifier votre email pour confirmer et activer votre compte avant de vous connecter.',
      'roleChanged': 'Rôle utilisateur changé de {{oldRole}} à {{newRole}} pour {{userName}}',
      'sessionTerminated': 'Toutes les sessions terminées avec succès pour {{userName}}',
      'suspended': 'Compte utilisateur suspendu avec succès pour {{userName}} jusqu\'à {{suspendedUntil, datetime}}',
      'unsuspended': 'Suspension de compte utilisateur levée pour {{userName}} par {{liftedBy}}',
      'updated': 'Profil utilisateur mis à jour avec succès pour {{userName}} - champs : {{updatedFields}}',
      'updated_other': '{{count}} profils utilisateur mis à jour avec succès'
    }
  },
  'system': {
    'apiInfo': 'Informations de l\'API',
    'error': 'Une erreur s\'est produite',
    'invalidRequest': 'Requête invalide',
    'notFound': 'Ressource non trouvée',
    'operationFailed': '{{operation}} a échoué : {{error}}',
    'serverError': 'Erreur interne du serveur',
    'success': 'Opération terminée avec succès',
    'welcome': 'Bienvenue dans Hono Auth API v{{version}} ({{language}})'
  },
  'user': {
    'statusDisplay': {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    }
  },
  'validation': {
    'advancedAudit': {
      'invalidRetentionAction': 'Action de rétention invalide : {{action}}, doit être l\'une de : {{validActions}}'
    },
    'advancedCleanup': {
      'backupRecommended': 'Il est fortement recommandé de créer une sauvegarde avant le nettoyage',
      'confirmationRequired': 'Confirmation requise pour les opérations de nettoyage réelles',
      'invalid': 'Paramètres de nettoyage avancé invalides'
    },
    'arrayValidation': {
      'actions': {
        'tooFew': 'Doit contenir au moins {{minCount}} action',
        'tooFew_other': 'Doit contenir au moins {{minCount}} actions',
        'tooMany': 'Ne peut pas contenir plus de {{maxCount}} action',
        'tooMany_other': 'Ne peut pas contenir plus de {{maxCount}} actions'
      },
      'channels': {
        'tooFew': 'Doit inclure au moins {{minCount}} canal',
        'tooFew_other': 'Doit inclure au moins {{minCount}} canaux',
        'tooMany': 'Ne peut pas inclure plus de {{maxCount}} canal',
        'tooMany_other': 'Ne peut pas inclure plus de {{maxCount}} canaux'
      },
      'conditions': {
        'tooFew': 'Doit spécifier au moins {{minCount}} condition',
        'tooFew_other': 'Doit spécifier au moins {{minCount}} conditions',
        'tooMany': 'Ne peut pas spécifier plus de {{maxCount}} condition',
        'tooMany_other': 'Ne peut pas spécifier plus de {{maxCount}} conditions'
      },
      'configs': {
        'tooFew': 'Doit contenir au moins {{minCount}} configuration',
        'tooFew_other': 'Doit contenir au moins {{minCount}} configurations',
        'tooMany': 'Ne peut pas contenir plus de {{maxCount}} configuration',
        'tooMany_other': 'Ne peut pas contenir plus de {{maxCount}} configurations'
      },
      'interests': {
        'tooFew': 'Doit contenir au moins {{minCount}} centre d\'intérêt',
        'tooFew_other': 'Doit contenir au moins {{minCount}} centres d\'intérêt',
        'tooMany': 'Ne peut pas contenir plus de {{maxCount}} centre d\'intérêt',
        'tooMany_other': 'Ne peut pas contenir plus de {{maxCount}} centres d\'intérêt'
      },
      'items': {
        'tooFew': 'Doit contenir au moins {{minCount}} élément',
        'tooFew_other': 'Doit contenir au moins {{minCount}} éléments',
        'tooMany': 'Ne peut pas contenir plus de {{maxCount}} élément',
        'tooMany_other': 'Ne peut pas contenir plus de {{maxCount}} éléments'
      }
    },
    'auditSearch': {
      'atLeastOneFilterRequired': 'Au moins {{min}} filtre doit être spécifié',
      'atLeastOneFilterRequired_other': 'Au moins {{min}} filtres doivent être spécifiés'
    },
    'changePassword': {
      'passwordsDoNotMatch': 'Le nouveau mot de passe et sa confirmation ne correspondent pas'
    },
    'cleanupSimulation': {
      'confirmationRequired': 'Confirmation requise pour les opérations non-test',
      'dataLossWarning': 'Avertissement : Cette opération peut entraîner une perte de données',
      'invalid': 'Paramètres de simulation de nettoyage invalides'
    },
    'confirmPassword': {
      'mustMatch': 'La confirmation du mot de passe doit correspondre au mot de passe',
      'required': 'La confirmation du mot de passe est requise'
    },
    'dateRange': {
      'invalid': 'Plage de dates invalide - la date de fin doit être après la date de début',
      'overlapConflict': 'La plage de dates chevauche une plage existante : {{conflictingRange}}',
      'tooLarge': 'La plage de dates ne peut pas dépasser {{maxDays}} jour',
      'tooLarge_other': 'La plage de dates ne peut pas dépasser {{maxDays}} jours'
    },
    'enumValidation': {
      'action': {
        'invalid': 'L’action doit être l’une des suivantes : {{allowedValues}}'
      },
      'actionType': {
        'invalid': 'Le type d\'action doit être l\'un des suivants : {{allowedValues}}'
      },
      'category': {
        'invalid': 'La catégorie doit être l\'une des suivantes : {{allowedValues}}'
      },
      'channelType': {
        'invalid': 'Le type de canal doit être l’un des suivants : {{allowedValues}}'
      },
      'file_type': {
        'invalid': 'Le type de fichier doit être l\'un des suivants : {{allowedValues}}'
      },
      'format': {
        'invalid': 'Le format doit être l\'un des suivants : {{allowedValues}}'
      },
      'metric': {
        'invalid': 'La métrique doit être l\'une des suivantes : {{allowedValues}}'
      },
      'operator': {
        'invalid': 'L\'opérateur doit être l\'un des suivants : {{allowedValues}}'
      },
      'priority': {
        'invalid': 'La priorité doit être l\'une des suivantes : {{allowedValues}}'
      },
      'reportType': {
        'invalid': 'Le type de rapport doit être l\'un des suivants : {{allowedValues}}'
      },
      'resolution': {
        'invalid': 'La résolution doit être l’une des suivantes : {{allowedValues}}'
      },
      'role': {
        'invalid': 'Le rôle doit être l\'un des suivants : {{allowedValues}}'
      },
      'severity': {
        'invalid': 'La gravité doit être l\'une des suivantes : {{allowedValues}}'
      },
      'sort_by': {
        'invalid': 'Le champ de tri doit être l\'un des suivants : {{allowedValues}}'
      },
      'sort_order': {
        'invalid': 'L\'ordre de tri doit être l\'un des suivants : {{allowedValues}}'
      },
      'status': {
        'invalid': 'Le statut doit être l’un des suivants : {{allowedValues}}'
      },
      'timeframe': {
        'invalid': 'La période doit être l\'une des suivantes : {{allowedValues}}'
      },
      'userRole': {
        'invalid': 'Le rôle de l\'utilisateur doit être l\'un des suivants : {{allowedValues}}'
      }
    },
    'fieldRequired': {
      'action': 'L\'action est requise',
      'actionTaken': 'L\'action effectuée est requise',
      'age': 'L\'âge est requis',
      'assignedTo': 'L’utilisateur assigné est requis',
      'auditLogRetentionDays': 'La valeur des jours de rétention des journaux d’audit est requise',
      'auditRetention': 'La valeur de rétention d\'audit est requise',
      'batchSize': 'La taille du lot est requise',
      'categoryFilter': 'Le filtre de catégorie est requis',
      'channel': 'Le canal est requis',
      'channelType': 'Le type de canal est requis',
      'conditionValue': 'La valeur de condition est requise',
      'confirmPassword': 'La confirmation du mot de passe est requise',
      'date': 'La date est requise',
      'days': 'La valeur en jours est requise',
      'description': 'La description est requise',
      'dryRun': 'L\'indicateur d\'exécution à sec est requis',
      'email': 'L\'adresse e-mail est requise',
      'enabled': 'L\'indicateur activé est requis',
      'endDate': 'La date de fin est requise',
      'endTime': 'L\'heure de fin est requise',
      'errorRate': 'Le taux d\'erreur est requis',
      'executionTime': 'La valeur du temps d\'exécution est requise',
      'failureCount': 'Le nombre d\'échecs est requis',
      'field': 'La valeur du champ est requise',
      'fileSize': 'La taille du fichier est requise',
      'forceArchival': 'L\'indicateur d\'archivage forcé est requis',
      'format': 'Le format est requis',
      'hours': 'La valeur des heures est requise',
      'id': 'L\'ID est requis',
      'incidentType': 'Le type d\'incident est requis',
      'includeDetails': 'L\'indicateur d\'inclusion des détails est requis',
      'includeMetadata': 'L\'indicateur d\'inclusion des métadonnées est requis',
      'includeUserData': 'L\'indicateur d\'inclusion des données utilisateur est requis',
      'intervalMs': 'L\'intervalle (ms) est requis',
      'limit': 'La limite est requise',
      'maxRecords': 'La valeur maximale des enregistrements est requise',
      'metric': 'La métrique est requise',
      'metrics': 'Les métriques sont requises',
      'name': 'Le nom est requis',
      'page': 'Le numéro de page est requis',
      'password': 'Le mot de passe est requis',
      'period': 'La période est requise',
      'policy': 'La politique est requise',
      'priority': 'La priorité est requise',
      'query': 'La requête de recherche est requise',
      'refreshToken': 'Le jeton de rafraîchissement est requis',
      'reportType': 'Le type de rapport est requis',
      'resolution': 'La résolution est requise',
      'responseTime': 'Le temps de réponse est requis',
      'securityIncident': 'L\'incident de sécurité est requis',
      'startDate': 'La date de début est requise',
      'startTime': 'L\'heure de début est requise',
      'target': 'La cible est requise',
      'termsAccepted': 'L\'acceptation des conditions est requise',
      'threshold': 'Le seuil est requis',
      'timeframe': 'Le délai est requis',
      'timeRange': 'La plage horaire est requise',
      'token': 'Le jeton est requis',
      'userDataRetention': 'La valeur de rétention des données utilisateur est requise',
      'userDataRetentionDays': 'La valeur des jours de rétention des données utilisateur est requise',
      'userId': 'L\'identifiant utilisateur est requis',
      'username': 'Le nom d\'utilisateur est requis',
      'userRole': 'Le rôle de l\'utilisateur est requis',
      'value': 'La valeur est requise',
      'website': 'Le site Web est requis'
    },
    'fileUpload': {
      'invalidExtension': 'Extension de fichier invalide'
    },
    'formatValidation': {
      'assignedTo': {
        'invalid': 'Format d\'identifiant utilisateur assigné invalide'
      },
      'date': {
        'invalid': 'Format de date invalide'
      },
      'email': {
        'invalid': 'Veuillez fournir une adresse e-mail valide (par exemple, user@example.com)'
      },
      'endDate': {
        'invalid': 'Format de date de fin invalide'
      },
      'endTime': {
        'invalid': 'Format d\'heure de fin invalide'
      },
      'id': {
        'invalid': 'Format d\'ID invalide'
      },
      'refreshToken': {
        'invalid': 'Format de jeton de rafraîchissement invalide'
      },
      'startDate': {
        'invalid': 'Format de la date de début invalide'
      },
      'startTime': {
        'invalid': 'Format d\'heure de début invalide'
      },
      'token': {
        'invalid': 'Format de jeton JWT invalide'
      },
      'url': {
        'invalid': 'Veuillez fournir une URL valide (par exemple, https://example.com)'
      },
      'website': {
        'invalid': 'Veuillez fournir une URL de site valide (par ex. https://example.com)'
      }
    },
    'lengthValidation': {
      'action': {
        'tooLong': 'L\'action ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'L\'action doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'L\'action doit contenir au moins {{minLength}} caractères'
      },
      'actionTaken': {
        'tooLong': 'L’action effectuée ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'L’action effectuée doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'L’action effectuée doit contenir au moins {{minLength}} caractères'
      },
      'bio': {
        'tooLong': 'La biographie ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'La biographie doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'La biographie doit contenir au moins {{minLength}} caractères'
      },
      'channel': {
        'tooLong': 'Le canal ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le canal doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le canal doit contenir au moins {{minLength}} caractères'
      },
      'channelType': {
        'tooLong': 'Le type de canal ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le type de canal doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le type de canal doit contenir au moins {{minLength}} caractères'
      },
      'confirmPassword': {
        'tooShort': 'La confirmation du mot de passe doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'La confirmation du mot de passe doit contenir au moins {{minLength}} caractères'
      },
      'department': {
        'tooLong': 'Le département ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le département doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le département doit contenir au moins {{minLength}} caractères'
      },
      'description': {
        'tooLong': 'La description ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'La description doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'La description doit contenir au moins {{minLength}} caractères'
      },
      'email': {
        'tooLong': 'L\'adresse e-mail ne peut pas dépasser {{maxLength}} caractères'
      },
      'entityType': {
        'tooLong': 'Le type d\'entité ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le type d\'entité doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le type d\'entité doit contenir au moins {{minLength}} caractères'
      },
      'field': {
        'tooLong': 'Le champ ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le champ doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le champ doit contenir au moins {{minLength}} caractères'
      },
      'incidentType': {
        'tooLong': 'Le type d\'incident ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le type d\'incident doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le type d\'incident doit contenir au moins {{minLength}} caractères'
      },
      'interest': {
        'tooLong': 'Le centre d\'intérêt ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le centre d\'intérêt doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le centre d\'intérêt doit contenir au moins {{minLength}} caractères'
      },
      'name': {
        'tooLong': 'Le nom ne peut pas dépasser {{maxLength}} caractères'
      },
      'nextSteps': {
        'tooLong': 'Les prochaines étapes ne peuvent pas dépasser {{maxLength}} caractères',
        'tooShort': 'Les prochaines étapes doivent contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Les prochaines étapes doivent contenir au moins {{minLength}} caractères'
      },
      'note': {
        'tooLong': 'La note ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'La note doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'La note doit contenir au moins {{minLength}} caractères'
      },
      'notes': {
        'tooLong': 'Les notes ne peuvent pas dépasser {{maxLength}} caractères',
        'tooShort': 'Les notes doivent contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Les notes doivent contenir au moins {{minLength}} caractères'
      },
      'password': {
        'tooLong': 'Le mot de passe ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le mot de passe doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le mot de passe doit contenir au moins {{minLength}} caractères'
      },
      'query': {
        'tooLong': 'La requête ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'La requête doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'La requête doit contenir au moins {{minLength}} caractères'
      },
      'search': {
        'tooLong': 'Le texte de recherche ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le texte de recherche doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le texte de recherche doit contenir au moins {{minLength}} caractères'
      },
      'sortBy': {
        'tooLong': 'Le champ de tri ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le champ de tri doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le champ de tri doit contenir au moins {{minLength}} caractères'
      },
      'source': {
        'tooLong': 'La source ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'La source doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'La source doit contenir au moins {{minLength}} caractères'
      },
      'system': {
        'tooLong': 'Le système ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le système doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le système doit contenir au moins {{minLength}} caractères'
      },
      'target': {
        'tooLong': 'La cible ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'La cible doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'La cible doit contenir au moins {{minLength}} caractères'
      },
      'template': {
        'tooLong': 'Le modèle ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le modèle doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le modèle doit contenir au moins {{minLength}} caractères'
      },
      'token': {
        'tooLong': 'Le jeton ne peut pas dépasser {{maxLength}} caractères',
        'tooShort': 'Le jeton doit contenir au moins {{minLength}} caractère',
        'tooShort_other': 'Le jeton doit contenir au moins {{minLength}} caractères'
      }
    },
    'numericValidation': {
      'age': {
        'tooLarge': 'L\'âge ne peut pas dépasser {{maxValue}} ans',
        'tooSmall': 'L\'âge doit être d\'au moins {{minValue}} ans'
      },
      'auditLogRetentionDays': {
        'tooSmall': 'Les jours de rétention des journaux d’audit doivent être au moins {{minValue}}'
      },
      'auditRetention': {
        'tooLarge': 'La valeur de rétention d\'audit ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'La valeur de rétention d\'audit doit être au moins {{minValue}}'
      },
      'batchSize': {
        'tooLarge': 'La taille du lot ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'La taille du lot doit être au moins {{minValue}}'
      },
      'days': {
        'tooLarge': 'Les jours ne peuvent pas dépasser {{maxValue}}',
        'tooSmall': 'Les jours doivent être au moins {{minValue}}'
      },
      'errorRate': {
        'tooLarge': 'Le taux d\'erreur ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'Le taux d\'erreur doit être au moins {{minValue}}'
      },
      'executionTime': {
        'tooLarge': 'Le temps d\'exécution ne peut pas dépasser {{maxValue}} secondes',
        'tooSmall': 'Le temps d\'exécution doit être au moins {{minValue}} secondes'
      },
      'failureCount': {
        'tooLarge': 'Le nombre d\'échecs ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'Le nombre d\'échecs doit être au moins {{minValue}}'
      },
      'fileSize': {
        'tooLarge': 'La taille du fichier ne peut pas dépasser {{maxValue}} octets',
        'tooSmall': 'La taille du fichier doit être d\'au moins {{minValue}} octets'
      },
      'hours': {
        'tooLarge': 'Les heures ne peuvent pas dépasser {{maxValue}}',
        'tooSmall': 'Les heures doivent être au moins {{minValue}}'
      },
      'intervalMs': {
        'tooLarge': 'L\'intervalle (ms) ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'L\'intervalle (ms) doit être au moins {{minValue}}'
      },
      'limit': {
        'tooLarge': 'La limite ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'La limite doit être d\'au moins {{minValue}}'
      },
      'maxRecords': {
        'tooLarge': 'Le nombre maximum d\'enregistrements ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'Le nombre maximum d\'enregistrements doit être au moins {{minValue}}'
      },
      'page': {
        'tooLarge': 'Le numéro de page ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'Le numéro de page doit être d\'au moins {{minValue}}'
      },
      'responseTime': {
        'tooLarge': 'Le temps de réponse ne peut pas dépasser {{maxValue}} millisecondes',
        'tooSmall': 'Le temps de réponse doit être au moins {{minValue}} millisecondes'
      },
      'securityIncident': {
        'tooLarge': 'L\'incident de sécurité ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'L\'incident de sécurité doit être au moins {{minValue}}'
      },
      'threshold': {
        'tooSmall': 'Le seuil doit être au moins {{minValue}}'
      },
      'userDataRetention': {
        'tooLarge': 'La rétention des données utilisateur ne peut pas dépasser {{maxValue}}',
        'tooSmall': 'La rétention des données utilisateur doit être au moins {{minValue}}'
      },
      'userDataRetentionDays': {
        'tooSmall': 'Les jours de rétention des données utilisateur doivent être au moins {{minValue}}'
      },
      'userId': {
        'tooSmall': 'L\'identifiant utilisateur doit être au moins {{minValue}}'
      }
    },
    'retentionPolicy': {
      'atLeastOneRequired': 'Au moins un paramètre de rétention doit être spécifié',
      'atLeastOneRequired_other': 'Au moins {{min}} paramètres de rétention doivent être spécifiés',
      'conflictingRules': 'Règles de rétention conflictuelles détectées : {{conflicts}}',
      'invalid': 'Politique de rétention invalide'
    },
    'retentionPolicyUpdate': {
      'atLeastOneFieldRequired': 'Au moins un champ doit être mis à jour',
      'atLeastOneFieldRequired_other': 'Au moins {{min}} champs doivent être mis à jour',
      'immutableField': 'Le champ « {{field}} » ne peut pas être modifié après la création',
      'invalid': 'Mise à jour de politique de rétention invalide'
    },
    'security': {
      'xssPatternDetected': 'Modèle XSS potentiel détecté : {{patternName}} n\'est pas autorisé'
    },
    'structureValidation': {
      'conditions': {
        'invalid': 'Structure de conditions invalide'
      },
      'config': {
        'invalid': 'Structure de configuration invalide'
      },
      'configUpdate': {
        'invalid': 'Format de mise à jour de configuration invalide. Le champ requis \"value\" est manquant ou contient des champs non reconnus'
      },
      'incidentCreation': {
        'invalid': 'Structure de création d’incident invalide'
      },
      'login': {
        'invalid': 'Format de requête de connexion invalide'
      },
      'metadata': {
        'invalid': 'Structure de métadonnées invalide'
      },
      'object': {
        'invalid': 'Structure d\'objet invalide'
      },
      'record': {
        'invalid': 'Format d\'enregistrement invalide'
      }
    },
    'termsAccepted': {
      'mustBeTrue': 'Les termes et conditions doivent être acceptés',
      'versionMismatch': 'Les conditions générales ont été mises à jour - veuillez consulter et accepter la dernière version'
    },
    'timeRange': {
      'eitherHoursOrRangeRequired': 'Either hours or date range must be specified',
      'endTimeMustBeAfterStartTime': 'L\'heure de fin doit être postérieure à l\'heure de début',
      'invalid': 'La plage horaire doit être l\'une des suivantes : last_1h, last_6h, last_24h, last_7d, last_30d',
      'invalidFormat': 'Le format de la plage horaire est invalide (attendu : {{expectedFormat}})',
      'rangeTooLarge': 'La plage horaire ne peut pas dépasser {{maxDays}} jour',
      'rangeTooLarge_other': 'La plage horaire ne peut pas dépasser {{maxDays}} jours',
      'required': 'La plage horaire est requise'
    },
    'typeValidation': {
      'configValue': {
        'invalid': 'Type de valeur de configuration invalide'
      },
      'value': {
        'invalid': 'Type de données invalide'
      }
    },
    'username': {
      'invalid': 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres et des underscores',
      'invalidCharacters': 'Username can only contain letters, numbers, and underscores',
      'required': 'Le nom d\'utilisateur est requis',
      'reserved': 'Le nom d\'utilisateur « {{username}} » est réservé et ne peut pas être utilisé',
      'tooLong': 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères',
      'tooShort': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
      'tooShort_other': 'Le nom d\'utilisateur doit contenir au moins {{minLength}} caractères',
      'unavailable': 'Le nom d\'utilisateur « {{username}} » n\'est pas disponible'
    },
    'filterArrayTooLarge': 'Tableau de filtres trop volumineux (max 500 éléments)',
    'filterArrayTooLarge_other': 'Le tableau de filtres avec {{count}} éléments dépasse le maximum de {{max}}',
    'invalid': 'Valeur fournie invalide',
    'invalid_other': '{{count}} valeurs invalides fournies',
    'invalidArchiveAction': 'Action d\'archivage invalide',
    'invalidJson': 'JSON invalide dans le corps de la requête',
    'invalidRole': 'Rôle invalide spécifié',
    'limitTooLarge': 'Limite trop élevée (max 50 000 enregistrements)',
    'limitTooLarge_other': 'La limite {{limit}} dépasse le maximum de {{max}} enregistrements',
    'registrationFailed': 'Échec de l\'inscription',
    'requestTooLarge': 'Charge utile de la requête trop volumineuse',
    'required': 'Ce champ est requis',
    'required_other': '{{count}} champs obligatoires sont manquants',
    'searchFailed': 'Échec de la recherche',
    'serviceTempUnavailable': 'Requête trop volumineuse à traiter - service temporairement indisponible',
    'tooLong': 'La valeur dépasse la limite de {{max}} caractère',
    'tooLong_other': 'La valeur dépasse la limite de {{max}} caractères',
    'tooShort': 'La valeur doit contenir au moins {{min}} caractère',
    'tooShort_other': 'La valeur doit contenir au moins {{min}} caractères',
    'translationsFailed': 'Échec de la récupération des traductions',
    'unsupportedFormat': 'Format d\'exportation non pris en charge',
    'updateRequiresField': 'Au moins un champ est requis pour la mise à jour',
    'updateRequiresField_other': 'Au moins {{min}} champs sont requis pour l\'opération de mise à jour',
    'uploadFailed': 'Échec du téléchargement de fichier'
  },
  'zodDemo': {
    'anotherSearchResultTitle': 'Autre résultat pour',
    'description': 'Ceci démontre comment utiliser Zod avec Hono pour une validation robuste',
    'noDescription': 'Aucune description fournie',
    'searchResultTitle': 'Résultat pour',
    'title': 'Démo de Validation Zod'
  },
  'zodDemo_operations': {
    'fileUpload': 'démo téléversement de fichier',
    'searchExecution': 'démo exécution de recherche',
    'userRegistration': 'démo inscription utilisateur'
  }
};
