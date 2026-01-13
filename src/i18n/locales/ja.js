/**
 * JA translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: 2025-12-16T04:10:26.766Z
*/

export default {
  'admin': {
    'accessLevel': {
      'full': 'フルシステムアクセス',
      'limited': '制限付きアクセス (管理者レベル)'
    },
    'actions': {
      'permanentDeletion': 'アカウントの完全削除'
    },
    'dataScope': {
      'full': '完全なデータ',
      'limited': 'フィルタリングされたデータ'
    },
    'operations': {
      'adminDashboardAccess': '管理ダッシュボードアクセス',
      'adminRoutesAccess': '管理ルートアクセス',
      'createUser': 'ユーザー作成',
      'deleteUser': 'ユーザー #{{userId}} を削除',
      'updateUser': 'ユーザー #{{userId}} を更新'
    },
    'protectionReason': {
      'hierarchy': 'ロール階層を維持する必要があります',
      'higherPrivilege': '上位の権限を持つユーザーは変更できません',
      'roleChange': 'ユーザーは自分のロールを変更できません',
      'superAdmin': 'スーパー管理者アカウントは保護されています'
    },
    'systemStatus': {
      'healthy': '正常',
      'unhealthy': '異常'
    },
    'accessDenied': 'この操作には管理者アクセスが必要です',
    'accountDeletionSuggestion': 'アカウント管理については、他の管理者にお問い合わせください',
    'activeUsersCount': 'アクティブユーザー {{count}} 人',
    'activeUsersCount_other': 'アクティブユーザー {{count}} 人 ({{percentage}})',
    'changedByUser': '{{username}} ({{role}}) が変更しました',
    'changesApplied': '{{count}} 件の変更を適用しました',
    'changesApplied_other': '{{count}} 件の変更を適用しました',
    'checkedByUser': '{{username}} ({{role}}) が確認しました',
    'createdByUser': '{{username}} ({{role}}) が作成しました',
    'dashboardDataRetrieved': 'ダッシュボードを {{totalUsers}} のシステム概要で読み込みました ({{accessLevel}} アクセス)。{{requestedBy}} {{dataFreshness}}',
    'dashboardRetrieved': 'ダッシュボードデータを正常に取得しました',
    'dataFreshness': '{{timestamp}} に生成',
    'deletedByUser': '{{username}} ({{role}}) が削除しました',
    'effectiveImmediately': '変更はすぐに有効になります',
    'failedLoginAttempts': '過去1時間に {{count}} 回のログイン失敗',
    'failedLoginAttempts_other': '過去1時間に {{count}} 回のログイン失敗',
    'performanceGrade': 'パフォーマンス: {{grade}}',
    'requestedByUser': '{{username}} ({{role}}) が要求しました',
    'responseTime': '応答時間: {{time}}{{unit}}',
    'restrictedRoleAccess': 'アクセス拒否: {{currentRole}} は {{requestedRole}} ユーザーを表示できません',
    'roleChangedSuccessfully': '{{targetUserName}} のロールを {{oldRole}} から {{newRole}} に変更しました。{{changedBy}} {{timestamp}} {{effectiveImmediately}}',
    'routeDiscoverySuccess': 'システムルートを正常に取得しました',
    'securityRisk': 'セキュリティリスク: {{level}} ({{failedAttempts}})',
    'statisticsRetrieved': 'システム統計: {{totalUsers}}, アクティブユーザー: {{activeUsers}} ({{dataScope}} スコープ)。{{requestedBy}}',
    'statsRetrieved': 'システム統計を正常に取得しました',
    'systemHealthRetrieved': 'システムヘルス状態を正常に取得しました',
    'systemHealthRetrievedFailed': 'システムヘルス情報の取得に失敗しました',
    'totalUsersCount': '合計 {{count}} ユーザー',
    'totalUsersCount_other': '合計 {{count}} ユーザー',
    'updatedByUser': '{{username}} ({{role}}) が更新しました',
    'userCreatedSuccessfully': '新しいユーザー {{userName}} を {{newUserRole}} ロールで作成しました。{{createdBy}} {{timestamp}}',
    'userDeletedSuccessfully': 'ユーザーアカウントを完全に削除しました。{{deletedBy}} {{timestamp}} アクション: {{action}}',
    'userDetailsRetrieved': 'ユーザー詳細を取得しました: {{userName}} ({{userRole}}, {{userStatus}})。{{joinedDate}} {{requestedBy}}',
    'usersListRetrieved': '{{count}} ユーザーを正常に取得しました ({{currentPage}}/{{totalPages}} ページに {{displayedCount}} 件表示)。{{requestedBy}}',
    'usersListRetrieved_other': '{{count}} ユーザーを正常に取得しました ({{currentPage}}/{{totalPages}} ページに {{displayedCount}} 件表示)。{{requestedBy}}',
    'userUpdatedSuccessfully': 'ユーザー {{updatedUserName}} を正常に更新しました。{{changesCount}} {{updatedBy}} {{timestamp}}'
  },
  'api': {
    'databaseError': 'データベースエラーが発生しました',
    'healthCheck': 'APIは正常に動作しています',
    'methodNotAllowed': '許可されていないメソッド',
    'routeNotFound': 'ルートが見つかりません',
    'validationError': 'バリデーションエラー',
    'validationErrorDetails': '検証に失敗しました: {{errorCount}} 件のエラー',
    'validationErrorDetails_other': '検証に失敗しました: {{errorCount}} 件のエラー'
  },
  'audit': {
    'access': {
      'full': 'フルシステムアクセス',
      'limited': '制限付きアクセス (役割ベース)'
    },
    'health': {
      'healthy': '正常',
      'suggestion_admin': 'システムのヘルスチェックはあなたの役割では制限される場合があります。',
      'suggestion_super_admin': 'システムリソース、データベース接続、およびサービスステータスを確認してください。',
      'systemCheck': '完全なシステムヘルスチェック',
      'unhealthy': '異常'
    },
    'logs': {
      'error': '監査ログの取得に失敗しました',
      'suggestion_admin': '一般ユーザーのログと自分のアクションのみを表示できます。',
      'suggestion_super_admin': 'システム内のすべての監査ログに完全にアクセスできます。'
    },
    'operations': {
      'export': '監査ログをエクスポート',
      'healthCheck': '監査システムのヘルスチェック',
      'logsView': '監査ログを表示',
      'search': '監査ログを検索',
      'stats': '監査統計を取得'
    },
    'search': {
      'allFields': 'すべてのフィールド',
      'noQuery': 'クエリが指定されていません',
      'suggestion_admin': '別の検索語句を試すか、拡張アクセスについてはスーパー管理者にお問い合わせください。',
      'suggestion_super_admin': '検索条件を絞り込むか、問題がある場合はシステムログを確認してください。'
    },
    'stats': {
      'suggestion_admin': '統計はアクセスレベルに基づいてフィルタリングされます。完全なシステム統計についてはスーパー管理者にお問い合わせください。',
      'suggestion_super_admin': '統計が利用できない場合は、システムの状態とデータベース接続を確認してください。'
    }
  },
  'auth': {
    'operations': {
      'export': '監査ログをエクスポート',
      'healthCheck': '監査システムのヘルスチェック',
      'login': 'ユーザーログイン',
      'logsView': '監査ログを表示',
      'search': '監査ログを検索',
      'stats': '監査統計を取得'
    },
    'accountNotActive': 'アカウントがアクティブではありません',
    'activationAlreadyActive': 'アカウントは既に有効化されています。すぐにログインできます。',
    'activationDisabledByAdmin': 'アカウントは管理者によって無効化されています。サポートへお問い合わせください。',
    'activationFailed': 'アカウントの有効化に失敗しました。もう一度お試しください。',
    'activationInvalidToken': '無効または期限切れの有効化リンクです',
    'activationMissingToken': '有効化トークンがありません',
    'activationServerError': '有効化処理中にエラーが発生しました。しばらくしてからお試しください。',
    'activationSuccess': 'アカウントが正常に有効化されました。ログインできます。',
    'activationTokenExpired': '有効化リンクの期限が切れています。新しいリンクをリクエストしてください。',
    'cannotAccessOtherUsers': '他のユーザーのリソースにアクセスできません',
    'cannotAccessSuperAdmin': 'スーパー管理者のリソースにアクセスできません',
    'cannotChangeAdminRole': '他の管理者の役割を変更できません',
    'cannotChangeOwnRole': '自分の役割を変更できません',
    'cannotCreateAdmin': '管理者アカウントを作成できません',
    'cannotCreateHigherRole': '{{currentRole}} は役割階層の制限により {{requestedRole}} アカウントを作成できません',
    'cannotCreateSuperAdmin': 'スーパー管理者アカウントを作成できません',
    'cannotDeleteOwnAccount': '{{userName}} ({{role}}) は自分のアカウントを削除できません。{{suggestion}}',
    'cannotDeleteSuperAdmin': 'スーパー管理者アカウントを削除できません',
    'cannotDeleteYourself': '自分のアカウントを削除できません',
    'cannotModifyHigherRoleUser': '{{targetUserName}} ({{targetRole}}) を変更できません - {{currentRole}} {{reason}}',
    'cannotModifySuperAdmin': 'スーパー管理者アカウントを変更できません',
    'cannotPromoteToHigherRole': '{{currentRole}} はユーザーを {{requestedRole}} に昇格できません - {{reason}}',
    'cannotPromoteToSuperAdmin': 'ユーザーをスーパー管理者に昇格できません',
    'deleteNotAllowed': 'あなたの役割では削除操作は許可されていません',
    'forbidden': 'アクセスが拒否されました - 権限が不十分です',
    'invalidCredentials': '無効な認証情報',
    'invalidRole': '無効なユーザーの役割',
    'loginSuccess': 'ログインに成功しました',
    'logoutAllSuccess': 'すべてのデバイスから正常にログアウトしました',
    'logoutSuccess': 'ログアウトに成功しました',
    'passwordIncorrect': 'パスワードが間違っています',
    'rateLimitExceeded': 'ログイン試行に失敗回数が多すぎます。後でもう一度お試しください。',
    'refreshSuccess': 'トークンが正常に更新されました',
    'refreshTokenExpired': 'リフレッシュトークンの有効期限が切れています',
    'refreshTokenInvalid': '無効なリフレッシュトークン',
    'superAdminRequired': 'スーパー管理者のアクセスが必要です',
    'tokenExpired': 'トークンの有効期限が切れています',
    'tokenInvalid': '無効なトークン',
    'unauthorized': '許可されていないアクセス',
    'userNotFound': 'ユーザーが見つからないか、非アクティブです'
  },
  'tokenBlacklist': {
    'createSuccess': 'トークンがブラックリストに正常に追加されました',
    'deleteSuccess': 'トークンがブラックリストから正常に削除されました',
    'bulkDeleteSuccess': 'トークンの一括削除に成功しました',
    'tokenNotFound': 'トークンが見つかりません',
    'listSuccess': 'ブラックリストのトークンが正常に取得されました',
    'getSuccess': 'ブラックリストのエントリ詳細が正常に取得されました'
  },
  'dates': {
    'changedAt': '{{date, datetime}} に変更',
    'checkedAt': '{{date, datetime}} に確認',
    'createdAt': '{{date, datetime}} に作成',
    'deletedAt': '{{date, datetime}} に削除',
    'updatedAt': '{{date, datetime}} に更新',
    'userJoined': '{{date, date}} に参加'
  },
  'emails': {
    'registration': {
      'activateButton': 'アカウントを有効化',
      'activateLinkText': 'またはこのリンクをブラウザにコピー＆ペーストしてください:',
      'details': 'アカウント詳細',
      'disclaimer': 'このアカウントに心当たりがない場合は、このメールを無視するかサポートまでご連絡ください。',
      'email': '登録メールアドレス: {{email}}',
      'expiryWarning': 'この有効化リンクは{{hours}}時間後に期限切れになります。',
      'footer': 'このメールは{{appName}}からの自動送信です。返信しないでください。',
      'greeting': '{{userName}} 様',
      'instructions': 'このメールはアカウント情報を受け取ったことを確認するものです。承認や有効化が必要な場合、別途メールをお送りします。',
      'intro': '{{appName}} にご登録いただきありがとうございます。',
      'ip': 'リクエストIP: {{ip}}',
      'securityNote': '安全のため、このリンクを他人と共有しないでください。',
      'subject': '{{appName}} - 登録確認',
      'thanks': 'ありがとうございます。\n{{appName}} チーム',
      'time': '登録日時: {{timestamp}}'
    }
  },
  'endpoints': {
    'admin': {
      'changeRole': 'ユーザーの役割を変更（スーパー管理者アクセス必須）',
      'createUser': '新しいユーザーを作成（管理者アクセス必須）',
      'dashboard': '包括的なダッシュボードデータを取得（管理者アクセス必須）',
      'deleteUser': 'ユーザーを削除（スーパー管理者アクセス必須）',
      'stats': 'システム統計を取得（管理者アクセス必須）',
      'systemHealth': '包括的なシステムヘルス状態を取得（管理者アクセス必須）',
      'updateUser': 'ユーザー情報を更新（管理者アクセス必須）',
      'userDetails': 'ユーザー詳細を取得（管理者アクセス必須）',
      'usersList': '全ユーザーをリスト（管理者アクセス必須）',
      'blacklistList': 'ブラックリストトークンの一覧（スーパー管理者のみ）',
      'blacklistCreate': 'トークンを手動でブラックリストに追加（スーパー管理者のみ）',
      'blacklistDetails': 'ブラックリストエントリの詳細を取得（スーパー管理者のみ）',
      'blacklistBulkDelete': 'ブラックリストエントリの一括削除（スーパー管理者のみ）',
      'blacklistDelete': 'ブラックリストエントリの削除（スーパー管理者のみ）'
    },
    'advanced_audit': {
      'analytics': '高度な監査分析（管理者アクセス必須）',
      'analyticsBehavior': '行動分析（管理者アクセス必須）',
      'analyticsPerformance': 'パフォーマンス分析（管理者アクセス必須）',
      'analyticsSecurity': 'セキュリティ分析（管理者アクセス必須）',
      'archival': '監査ログアーカイブ（管理者アクセス必須）',
      'archivalRestore': 'アーカイブされたログを復元（管理者アクセス必須）',
      'archivalRun': 'アーカイブプロセスを実行（管理者アクセス必須）',
      'archivalStats': 'アーカイブ統計（管理者アクセス必須）',
      'archiveManage': 'アーカイブ管理（管理者アクセス必須）',
      'compliance': 'コンプライアンス報告（管理者アクセス必須）',
      'complianceReport': 'コンプライアンスレポートを生成（管理者アクセス必須）',
      'exportAdvanced': '高度なエクスポート（管理者アクセス必須）',
      'middlewareStats': 'ミドルウェア統計（管理者アクセス必須）'
    },
    'audit': {
      'export': '監査ログをエクスポート（管理者アクセス必須）',
      'logs': '監査ログを表示（管理者アクセス必須）',
      'search': '監査ログを検索（管理者アクセス必須）',
      'stats': '監査統計を取得（管理者アクセス必須）'
    },
    'auth': {
      'login': 'メールアドレスとパスワードでログイン',
      'logout': 'ログアウトしてトークンを無効化',
      'logoutAll': 'すべてのデバイスからログアウト（全トークンを無効化）',
      'refresh': 'アクセストークンを更新'
    },
    'demo': {
      'info': 'Zodバリデーションデモ情報',
      'register': '包括的なバリデーションを含むユーザー登録デモ',
      'search': 'クエリパラメーターバリデーション付き検索デモ',
      'upload': 'メタデータバリデーション付きファイルアップロードデモ'
    },
    'kv_admin': {
      'audit': {
        'alerts': '監査のアラートしきい値を取得（スーパー管理者のみ）',
        'compliance': '監査のコンプライアンス設定を取得（スーパー管理者のみ）',
        'configs': '監査システム設定を表示（スーパー管理者のみ）',
        'export': '監査のエクスポート設定を取得（スーパー管理者のみ）',
        'features': '監査の機能フラグを取得（スーパー管理者のみ）',
        'featureToggle': '監査の機能フラグを切り替え（スーパー管理者のみ）',
        'performance': '監査パフォーマンス設定を取得（スーパー管理者のみ）',
        'realtime': 'リアルタイム監視設定を取得（スーパー管理者のみ）',
        'retention': '監査ログの保持ポリシーを取得（スーパー管理者のみ）'
      },
      'config': 'KV設定を表示（スーパー管理者のみ）',
      'configBulk': 'KV設定を一括更新（スーパー管理者のみ）',
      'configCacheClear': 'KV設定キャッシュをクリア（スーパー管理者のみ）',
      'configDefaults': 'デフォルトKV設定を取得（スーパー管理者のみ）',
      'configDelete': 'KV設定キーを削除（スーパー管理者のみ）',
      'configEnvComparison': '環境間でKV設定を比較（スーパー管理者のみ）',
      'configGet': '特定のKV設定を取得（スーパー管理者のみ）',
      'configs': 'KV設定一覧を表示（スーパー管理者のみ）',
      'configsBatch': 'KV設定を一括更新（スーパー管理者のみ）',
      'configsCacheClear': 'KV設定一覧のキャッシュをクリア（スーパー管理者のみ）',
      'configsDefaults': 'デフォルトのKV設定一覧を取得（スーパー管理者のみ）',
      'configsEnvComparison': '環境間でKV設定一覧を比較（スーパー管理者のみ）',
      'configUpdate': 'KV設定を更新（スーパー管理者のみ）'
    },
    'realtime_monitoring': {
      'alerts': 'システムアラート管理（管理者アクセス必須）',
      'alertsChannels': 'アラートチャンネルを管理（管理者アクセス必須）',
      'alertsChannelsCreate': 'アラートチャネルを作成（管理者アクセス必須）',
      'alertsConfigure': 'システムアラートを設定（管理者アクセス必須）',
      'alertsHistory': 'アラート履歴を取得（管理者アクセス必須）',
      'alertsRules': 'アラートルールを管理（管理者アクセス必須）',
      'alertsRulesCreate': 'アラートルールを作成（管理者アクセス必須）',
      'alertsRuleToggle': 'アラートルールを有効/無効化（管理者アクセス必須）',
      'alertsSend': 'システムアラートを送信（管理者アクセス必須）',
      'alertsStatus': 'アラート状態を取得（管理者アクセス必須）',
      'alertsTest': 'アラートシステムをテスト（管理者アクセス必須）',
      'analyze': '監視データを分析（管理者アクセス必須）',
      'dashboard': 'リアルタイム監視ダッシュボード（管理者アクセス必須）',
      'dashboardCache': 'ダッシュボードキャッシュをクリア（管理者アクセス必須）',
      'dashboardExport': 'ダッシュボードデータをエクスポート（管理者アクセス必須）',
      'dashboardHealth': 'ダッシュボードヘルスチェック（管理者アクセス必須）',
      'dashboardLive': 'ライブダッシュボードスナップショット（管理者アクセス必須）',
      'dashboardOverview': 'ダッシュボード概要（管理者アクセス必須）',
      'dashboardPerformance': 'パフォーマンスダッシュボード（管理者アクセス必須）',
      'dashboardRealtime': 'ライブダッシュボードデータ（管理者アクセス必須）',
      'dashboardSecurity': 'セキュリティダッシュボード（管理者アクセス必須）',
      'dashboardTimeline': 'ダッシュボードタイムライン（管理者アクセス必須）',
      'eventsRecent': '最近の監視イベントを取得（管理者アクセス必須）',
      'incidentsCreate': 'リアルタイム監視インシデントの作成（管理者アクセスが必要）',
      'metrics': 'リアルタイムシステムメトリクス（管理者アクセス必須）',
      'resolveThreat': '検出された脅威を解決（管理者アクセス必須）',
      'simulate': '監視シナリオをシミュレート（管理者アクセス必須）',
      'start': 'リアルタイム監視を開始（管理者アクセス必須）',
      'status': '監視状態を取得（管理者アクセス必須）',
      'stop': 'リアルタイム監視を停止（管理者アクセス必須）',
      'threats': '脅威情報を取得（管理者アクセス必須）'
    },
    'security_incident': {
      'bulkDelete': '{{count}}件のセキュリティインシデントを一括削除（管理者{{actor}}のアクセスが必要）',
      'create': '新しいセキュリティインシデントを作成（管理者{{actor}}のアクセスが必要、タイプ{{type}}、重要度{{severity}}）',
      'deleteById': 'セキュリティインシデント{{incidentId}}を削除（管理者{{actor}}のアクセスが必要）',
      'exportCsv': '{{count}}件のセキュリティインシデントをCSVにエクスポート（管理者{{actor}}のアクセスが必要、日付範囲：{{dateRange}}）',
      'getById': 'ID {{incidentId}}でセキュリティインシデントを取得（管理者{{actor}}のアクセスが必要）',
      'getDashboard': 'セキュリティインシデントダッシュボードを取得（管理者{{actor}}のアクセスが必要、フィルター：{{filters}}）',
      'getStatistics': 'セキュリティインシデント統計を取得（管理者{{actor}}のアクセスが必要、期間：{{period}}）',
      'incidentDetails': 'インシデント詳細を取得（管理者アクセス必須）',
      'incidentResponse': 'インシデント対応を実行（管理者アクセス必須）',
      'incidents': 'セキュリティインシデントをリスト（管理者アクセス必須）',
      'incidentsCreate': 'セキュリティインシデントを作成（管理者アクセス必須）',
      'incidentStatus': 'インシデント状態を更新（管理者アクセス必須）',
      'incidentUpdate': 'インシデントを更新（管理者アクセス必須）',
      'list': 'セキュリティインシデント一覧（管理者{{actor}}のアクセスが必要、ページ{{page}}、制限{{limit}}）',
      'serviceStatus': 'サービス状態を取得（管理者アクセス必須）',
      'simulate': 'セキュリティインシデントをシミュレート（管理者アクセス必須）',
      'statistics': 'インシデント統計を取得（管理者アクセス必須）',
      'updateById': 'セキュリティインシデント{{incidentId}}を更新（管理者{{actor}}のアクセスが必要、更新されたフィールド：{{fields}}）',
      'updateStatus': 'セキュリティインシデント{{incidentId}}のステータスを{{status}}に更新（管理者{{actor}}のアクセスが必要）'
    },
    'system': {
      'apiInfo': '包括的なAPI情報とエンドポイント',
      'favicon': 'ファビコンとアイコンリソース',
      'health': 'ヘルスチェックエンドポイント',
      'language': '言語切り替えエンドポイント',
      'root': 'APIルートエンドポイント - ウェルカムメッセージ',
      'routes': 'システムルート発見（管理者のみ）',
      'unknown': '不明なエンドポイント',
      'version': 'APIバージョン情報'
    },
    'translations': {
      'get': '特定の言語の全翻訳を取得',
      'list': '利用可能な全言語とその検証状態をリスト',
      'section': '特定のセクション翻訳を取得',
      'validate': '翻訳の完全性を検証'
    },
    'user': {
      'me': '現在のユーザー情報を取得（認証が必要）',
      'profile': 'ユーザープロフィールを取得（認証が必要）',
      'register': '新しいユーザーを登録',
      'updatePassword': 'パスワードを変更（認証が必要）',
      'updateProfile': 'ユーザープロフィールを更新（認証が必要）'
    }
  },
  'errors': {
    'admin': {
      'accessDenied': 'この操作には管理者アクセスが必要です',
      'dashboardRetrieveFailed': '管理者ダッシュボードデータの取得に失敗しました',
      'permissionDenied': 'この操作に対する管理者権限が不十分です',
      'roleChangeFailed': 'ユーザーロールの変更に失敗しました',
      'statsRetrieveFailed': '管理者統計情報の取得に失敗しました',
      'systemHealthRetrieveFailed': 'システムヘルス情報の取得に失敗しました',
      'userManagementFailed': 'ユーザー管理操作が失敗しました'
    },
    'advancedAudit': {
      'analytics': {
        'failed': '分析データを取得できませんでした - {{actor}}が期間{{timeframe}}の{{operation}}を完了できませんでした: {{reason}}'
      },
      'archival': {
        'archiveOperationFailed': 'アーカイブ操作を実行できませんでした - {{actor}}が{{operation}} ({{action}})を完了できませんでした: {{reason}}',
        'restoreFailed': 'アーカイブされたログを復元できませんでした - {{actor}}が{{dateRange}}の{{operation}}を実行できませんでした: {{reason}}',
        'runFailed': 'アーカイブプロセスを実行できませんでした - {{actor}}が閾値{{cutoffDays}}での{{operation}}を完了できませんでした: {{reason}}',
        'statsFailed': 'アーカイブ統計情報を取得できませんでした - {{actor}}が{{operation}}を実行できませんでした: {{reason}}'
      },
      'behavior': {
        'failed': '行動分析を取得できませんでした - {{actor}}が{{targetRole}}を対象とした{{timeframe}}の{{operation}}を完了できませんでした: {{reason}}'
      },
      'compliance': {
        'customComplianceFailed': 'カスタムコンプライアンスレポートを生成できませんでした - {{actor}}が「{{reportName}}」({{reportType}})の{{operation}}を完了できませんでした: {{reason}}',
        'failed': 'コンプライアンスレポートを生成できませんでした - {{actor}}が{{format}}形式で{{timeframe}}の{{operation}}を完了できませんでした: {{reason}}',
        'reportFailed': 'コンプライアンスレポートを生成できませんでした - {{actor}}が{{type}}レポートの{{operation}}を実行できませんでした: {{reason}}'
      },
      'export': {
        'failed': '高度なエクスポートを実行できませんでした - {{actor}}が{{format}}形式 ({{recordCount}}レコード)の{{operation}}を完了できませんでした: {{reason}}'
      },
      'middleware': {
        'statsFailed': 'ミドルウェア統計情報を取得できませんでした - {{actor}}が{{middlewareType}}の{{operation}}を実行できませんでした: {{reason}}'
      },
      'performance': {
        'failed': 'パフォーマンス分析を取得できませんでした - {{actor}} ({{role}})が{{timeframe}}の{{operation}}を実行できませんでした: {{reason}}'
      },
      'security': {
        'failed': 'セキュリティ分析を取得できませんでした - {{actor}} ({{role}})が{{timeframe}}の{{operation}}を実行できませんでした: {{reason}}'
      }
    },
    'api': {
      'databaseError': 'API 呼び出しでのデータベースエラー: {{operation}}',
      'methodNotAllowed': 'HTTP メソッド {{method}} はルート {{path}} で許可されていません',
      'routeNotFound': 'API ルートが見つかりません: {{method}} {{path}}',
      'validationError': 'API 検証エラー: {{details}}'
    },
    'audit': {
      'export': {
        'exportFailed': '監査ログのエクスポートに失敗しました - {{actor}}が{{format}}形式での{{operation}}を完了できませんでした：{{reason}}'
      },
      'health': {
        'healthFailed': '監査システムヘルスチェックに失敗しました - {{actor}}が{{operation}}（{{checkType}}）を実行できませんでした：{{reason}}'
      },
      'logs': {
        'retrieveFailed': '監査ログの取得に失敗しました - {{actor}}が{{operation}}を実行中にエラーが発生しました：{{reason}}'
      },
      'search': {
        'searchFailed': '監査ログの検索に失敗しました - {{actor}}がクエリ「{{query}}」で{{operation}}を完了できませんでした：{{reason}}'
      },
      'stats': {
        'statsFailed': '監査統計情報の取得に失敗しました - {{actor}}（{{role}}）が{{operation}}を実行できませんでした：{{reason}}'
      }
    },
    'auth': {
      'accountDisabled': 'ユーザーアカウント {{userName}} は管理者によって無効にされています',
      'accountInactive': 'アカウントは無効状態です。メールで有効化するか、サポートに連絡してください。',
      'accountLocked': 'ログイン試行の失敗によりアカウントが {{duration, time}} ロックされています',
      'accountNotVerified': '{{userName}} のメールアドレスは認証されていません',
      'cannotAccessOtherUsers': '他のユーザーのリソースにアクセスできません',
      'cannotChangeOwnRole': '{{userName}} ({{currentRole}}) は自分の役割を変更できません - {{reason}}',
      'cannotCreateHigherRole': '{{currentRole}} は役割階層の制限により {{requestedRole}} アカウントを作成できません',
      'cannotDeleteSuperAdmin': 'スーパー管理者アカウントを削除できません',
      'cannotDeleteYourself': '自分のアカウントを削除できません',
      'cannotModifyHigherRoleUser': '{{targetUserName}} ({{targetRole}}) を変更できません - {{currentRole}} {{reason}}',
      'cannotPromoteToHigherRole': '{{currentRole}} は {{requestedRole}} への昇格を実行できません - {{reason}}',
      'deleteNotAllowed': 'あなたの役割では削除操作は許可されていません',
      'failed': '認証に失敗しました: {{reason}}',
      'failed_other': '過去 {{timeWindow}} に {{count}} 回の認証試行が失敗しました',
      'forbidden': 'アクセス禁止 - {{operation}} の権限が不足しています',
      'invalidCredentials': '無効なメールアドレスまたはパスワードが指定されました',
      'invalidCredentials_context_admin': '管理アカウントログインに無効な認証情報が指定されました',
      'invalidCredentials_context_user': 'ユーザーアカウントログインに無効な認証情報が指定されました',
      'loginFailed': '{{actor}}のログインプロセスが失敗しました (理由: {{reason}}, 操作: {{operation}}, IP: {{ipAddress}})',
      'mfaFailed': '多要素認証に失敗しました: {{reason}}',
      'mfaRequired': '{{userName}} には多要素認証が必要です',
      'passwordIncorrect': 'ユーザー {{userName}} のパスワードが正しくありません',
      'permissionDenied': 'アクションに対する権限が拒否されました: {{action}}',
      'rateLimitExceeded': 'レート制限を超過しました: {{timeWindow}} あたり {{currentRequests}}/{{maxRequests}} リクエスト',
      'refreshTokenExpired': 'リフレッシュトークンは {{expiredAt, datetime}} に期限切れになりました',
      'refreshTokenFailed': '{{actor}}のトークンリフレッシュが失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'refreshTokenInvalid': '無効な、または取り消されたリフレッシュトークン',
      'roleRequired': 'この操作には {{requiredRole}} ロールが必要です',
      'sessionExpired': 'ユーザーセッションは {{expiredAt, datetime}} に期限切れになりました',
      'sessionInvalid': '無効な、または破損したユーザーセッション',
      'superAdminRequired': 'スーパー管理者アクセスが必要です',
      'tokenExpired': '認証トークンは {{expiredAt, datetime}} に期限切れになりました',
      'tokenInvalid': '無効な、または形式が不正な認証トークン',
      'tokenMissing': '認証トークンが必要です',
      'tooManyAttempts': 'IPアドレス {{ipAddress}} からのログイン試行が多すぎます ({{attemptCount}} 回)',
      'tooManyAttempts_other': 'IPアドレス {{ipAddress}} からのログイン試行が多すぎます ({{attemptCount}} 回)',
      'unauthorized': 'リソースへの不正アクセス: {{resource}}',
      'userNotFound': 'メールアドレス {{email}} のアカウントが見つかりません'
    },
    'business': {
      'businessHoursOnly': '操作は営業時間中のみ許可されます ({{businessHours}})',
      'conflictingOperation': '競合する操作が進行中です: {{operation}}',
      'deadlineExpired': '操作期限は {{deadline, datetime}} に期限切れになりました',
      'duplicateEntry': '重複エントリが検出されました: {{field}} = "{{value}}" を持つ {{entity}}',
      'insufficientBalance': '残高不足: {{available, currency}} 利用可能、{{required, currency}} 必要',
      'operationNotAllowed': '操作 "{{operation}}" は許可されていません: {{reason}}',
      'preconditionFailed': '前提条件が満たされていません: {{condition}}',
      'quotaReached': 'クォータ制限に達しました: {{used, number}}/{{limit, number}} {{resource}}',
      'referenceConstraint': '{{referencingCount}} 件の他のレコードによって参照されているため、{{entity}} を削除できません',
      'referenceConstraint_other': '{{referencingCount}} 件の他のレコードによって参照されているため、{{entity}} を削除できません',
      'resourceLocked': 'リソース "{{resource}}" は {{lockedBy}} によって {{lockedUntil, datetime}} までロックされています',
      'workflowViolation': 'ワークフロー違反: 現在の状態 {{currentState}} では {{step}} を実行できません'
    },
    'file': {
      'accessDenied': 'ファイル "{{filename}}" へのアクセスが拒否されました: {{reason}}',
      'corrupted': 'ファイルが破損しているか不完全なようです',
      'formatUnsupported': '操作でファイル形式がサポートされていません: {{operation}}',
      'invalidType': 'ファイルタイプ "{{fileType}}" は許可されていません - サポートされているタイプ: {{allowedTypes}}',
      'notFound': 'ファイル "{{filename}}" が見つかりません',
      'processingFailed': 'ファイル処理に失敗しました: {{reason}}',
      'quotaExceeded': 'ストレージクォータを超過しました: {{used, number}}MB / {{quota, number}}MB',
      'tooLarge': 'ファイルサイズ {{actualSize, number}}MB は {{maxSize, number}}MB の制限を超えています',
      'tooSmall': 'ファイルサイズ {{actualSize, number}} バイトは最小 {{minSize, number}} バイトを下回っています',
      'uploadFailed': 'ファイルのアップロードに失敗しました: {{reason}}',
      'virusDetected': 'セキュリティスキャンによりファイルがブロックされました: {{threat}}'
    },
    'i18n': {
      'context_demo_failed': 'コンテキスト翻訳のデモンストレーションを実行できませんでした：{{reason}}',
      'context_test_failed': 'キー "{{key}}" のコンテキスト翻訳をテストできませんでした：{{reason}}',
      'enhanced_demo_failed': '拡張i18n機能のデモンストレーションを実行できませんでした：{{reason}}',
      'error_demo_failed': 'エラーメッセージのデモンストレーションを実行できませんでした：{{reason}}',
      'formatting_demo_failed': 'フォーマットのデモンストレーションを実行できませんでした：{{reason}}',
      'formatting_test_failed': 'キー "{{key}}" のフォーマット機能をテストできませんでした：{{reason}}',
      'languageNotSupported': '言語 "{{language}}" はサポートされていません。利用可能な言語：{{supportedLanguages}}',
      'plurals_demo_failed': '複数形のデモンストレーションを実行できませんでした：{{reason}}',
      'plurals_test_failed': 'キー "{{key}}" の複数形機能をテストできませんでした：{{reason}}',
      'sectionNotFound': '言語 "{{language}}" の翻訳セクション "{{section}}" が見つかりません',
      'success_demo_failed': '成功メッセージのデモンストレーションを実行できませんでした：{{reason}}',
      'translationsFailed': '翻訳情報の取得に失敗しました：{{reason}}'
    },
    'integration': {
      'apiLimitExceeded': '{{serviceName}} の API レート制限を超過しました: {{period}} あたり {{limit}} リクエスト',
      'authenticationFailed': '{{serviceName}} との認証に失敗しました: {{reason}}',
      'credentialsExpired': '{{serviceName}} の API 認証情報は {{expiredDate, date}} に期限切れになりました',
      'dataTransformFailed': '{{serviceName}} のデータ変換に失敗しました: {{reason}}',
      'invalidResponse': '{{serviceName}} からの応答が無効です: {{details}}',
      'serviceDown': '外部サービス {{serviceName}} は現在停止中です',
      'syncFailed': '{{serviceName}} とのデータ同期に失敗しました: {{reason}}',
      'webhookTimeout': '{{serviceName}} からのウェブフックが {{timeout, number}}ms 後にタイムアウトしました'
    },
    'kv': {
      'accessDenied': '設定キー "{{key}}" へのアクセスが拒否されました - {{requiredRole}} ロールが必要です',
      'alertThresholdsRetrieveFailed': 'アラート閾値の取得に失敗しました: {{reason}}',
      'auditConfigsRetrieveFailed': '監査設定の取得に失敗しました: {{reason}}',
      'batchUpdateFailed': '{{totalCount}} 件中 {{failedCount}} 件の設定のバッチ更新に失敗しました',
      'batchUpdateFailed_other': '{{totalCount}} 件中 {{failedCount}} 件の設定のバッチ更新に失敗しました',
      'cacheClearFailed': '設定キャッシュのクリアに失敗しました: {{reason}}',
      'cacheFailed': '設定キャッシュの更新に失敗しました: {{reason}}',
      'complianceSettingsRetrieveFailed': 'コンプライアンス設定の取得に失敗しました: {{reason}}',
      'configResetFailed': '設定「{{key}}」のリセットに失敗しました: {{reason}}',
      'configRetrieveFailed': '設定「{{key}}」の取得に失敗しました: {{reason}}',
      'configsCompareFailed': '環境比較の取得に失敗しました: {{reason}}',
      'configsRetrieveFailed': '設定の取得に失敗しました: {{reason}}',
      'configUpdateFailed': '設定「{{key}}」の更新に失敗しました: {{reason}}',
      'exportSettingsRetrieveFailed': 'エクスポート設定の取得に失敗しました: {{reason}}',
      'featureFlagsRetrieveFailed': 'フィーチャーフラグの取得に失敗しました: {{reason}}',
      'featureNotFound': 'フィーチャーが見つからないか、許可されていません',
      'featureToggleFailed': 'フィーチャー「{{feature}}」の切り替えに失敗しました: {{reason}}',
      'invalidFeatureValue': '無効なフィーチャー値 - ブール値である必要があります',
      'invalidKey': '設定キー "{{key}}" は許可されていません - 有効なキー: {{validKeys}}',
      'keyNotFound': '設定キー "{{key}}" が見つかりません',
      'performanceSettingsRetrieveFailed': 'パフォーマンス設定の取得に失敗しました: {{reason}}',
      'realtimeSettingsRetrieveFailed': 'リアルタイムモニタリング設定の取得に失敗しました: {{reason}}',
      'resetFailed': '設定 "{{key}}" をデフォルト値にリセットできませんでした: {{reason}}',
      'retentionPoliciesRetrieveFailed': '保持ポリシーの取得に失敗しました: {{reason}}',
      'updateFailed': '設定 "{{key}}" の更新に失敗しました: {{reason}}',
      'valueInvalid': '設定 "{{key}}" の値が無効です: {{expectedType}} が必要ですが、{{actualType}} が与えられました'
    },
    'kvAdmin': {
      'alertThresholdsRetrieveFailed': '{{actor}}のアラートしきい値取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'auditConfigsRetrieveFailed': '{{actor}}のオーディット設定取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'cacheClearFailed': '{{actor}}のKV設定キャッシュクリアに失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'complianceSettingsRetrieveFailed': '{{actor}}のコンプライアンス設定取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'configResetFailed': '{{actor}}のKV設定{{key}}リセットに失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'configRetrieveFailed': '{{actor}}のKV設定{{key}}取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'configsCompareFailed': '{{actor}}のENV対KV設定比較に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'configsRetrieveFailed': '{{actor}}のKV設定取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'configUpdateFailed': '{{actor}}のKV設定{{key}}更新に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'exportSettingsRetrieveFailed': '{{actor}}のエクスポート設定取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'featureFlagsRetrieveFailed': '{{actor}}のフィーチャーフラグ取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'featureToggleFailed': '{{actor}}のオーディット機能{{feature}}切り替えに失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'performanceSettingsRetrieveFailed': '{{actor}}のパフォーマンス設定取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'realtimeSettingsRetrieveFailed': '{{actor}}のリアルタイム設定取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
      'retentionPoliciesRetrieveFailed': '{{actor}}のリテンションポリシー取得に失敗しました (理由: {{reason}}, 操作: {{operation}})'
    },
    'network': {
      'apiError': '{{apiName}} からの外部APIエラー: {{error}}',
      'bandwidthExceeded': '帯域幅制限を超過しました: {{usage, number}}MB/{{limit, number}}MB',
      'connectionFailed': '{{service, uppercase}} への接続に失敗しました: {{reason}}',
      'connectionRefused': 'ポート {{port}} の {{service}} によって接続が拒否されました',
      'dnsResolutionFailed': '{{hostname}} の DNS 解決に失敗しました',
      'hostUnreachable': 'ホスト {{hostname}} に到達できません',
      'httpError': 'HTTP エラー {{statusCode}}: {{statusMessage}}',
      'protocolError': 'ネットワークプロトコルエラー: {{protocol}} - {{details}}',
      'proxyError': 'プロキシサーバーエラー: {{proxyAddress}} - {{reason}}',
      'slowResponse': '{{service}} からの応答が遅いです ({{duration, number}}ms)',
      'socketError': 'ソケット接続エラー: {{details}}',
      'sslError': 'SSL/TLS 接続エラー: {{details}}',
      'timeout': '{{service}} へのネットワークリクエストが {{duration, number}}ms 後にタイムアウトしました',
      'webhookFailed': '{{url}} へのウェブフック配信に失敗しました: {{reason}}'
    },
    'realtimeMonitoring': {
      'alerts': {
        'channelsFailed': '{{actor}}のアラートチャンネル取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'createChannelFailed': '{{actor}}のアラートチャネル作成に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'createRuleFailed': '{{actor}}のアラートルール作成に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'historyFailed': '{{actor}}のアラート履歴取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'rulesFailed': '{{actor}}のアラートルール取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'sendFailed': '{{actor}}の手動アラート送信に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'statusFailed': '{{actor}}のアラートシステムステータス取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'testFailed': '{{actor}}のアラートシステムテストに失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'toggleFailed': '{{actor}}のアラートルール切り替えに失敗しました (理由: {{reason}}, 操作: {{operation}})'
      },
      'alertsConfig': {
        'configFailed': '{{actor}}のアラート設定に失敗しました (理由: {{reason}}, 操作: {{operation}})'
      },
      'dashboard': {
        'cacheClearFailed': '{{actor}}のダッシュボードキャッシュクリアに失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'exportFailed': '{{actor}}のダッシュボードエクスポートに失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'healthCheckFailed': '{{actor}}のダッシュボードヘルスチェック実行に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'overviewFailed': '{{actor}}のダッシュボード概要取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'performanceFailed': '{{actor}}のパフォーマンスダッシュボード取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'realtimeFailed': '{{actor}}のリアルタイムダッシュボード取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'securityFailed': '{{actor}}のセキュリティダッシュボード取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'timelineFailed': '{{actor}}のダッシュボードタイムライン取得に失敗しました (理由: {{reason}}, 操作: {{operation}})'
      },
      'incidents': {
        'createFailed': '{{actor}}のリアルタイム監視インシデント作成に失敗しました (理由: {{reason}}, 操作: {{operation}})'
      },
      'monitoring': {
        'eventsFailed': '{{actor}}の最近のモニタリングイベント取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'simulateFailed': '{{actor}}のモニタリングイベントシミュレーションに失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'startFailed': '{{actor}}のモニタリング開始に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'statusFailed': '{{actor}}のモニタリングステータス取得に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'stopFailed': '{{actor}}のモニタリング停止に失敗しました (理由: {{reason}}, 操作: {{operation}})'
      },
      'threats': {
        'analyzeFailed': '{{actor}}の脅威分析に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'resolveFailed': '{{actor}}の脅威解決に失敗しました (理由: {{reason}}, 操作: {{operation}})',
        'retrieveFailed': '{{actor}}の脅威ステータス取得に失敗しました (理由: {{reason}}, 操作: {{operation}})'
      }
    },
    'security': {
      'incident': {
        'notFound': 'セキュリティインシデントが見つかりません（ID：{{incidentId}}、操作：{{operation}}、リクエスト者：{{requestedBy}}）'
      },
      'incidents': {
        'createFailed': '{{actor}}がセキュリティインシデントの作成に失敗しました（エラー：{{errorType}}）{{timestamp}}',
        'responseExecuteFailed': 'サーバーエラーによりセキュリティインシデントの手動応答の実行に失敗しました。',
        'retrieveDetailFailed': 'サーバーエラーによりセキュリティインシデントの詳細の取得に失敗しました。',
        'retrieveFailed': '{{actor}}がセキュリティインシデントの取得に失敗しました（エラー：{{errorType}}）{{timestamp}}',
        'simulationFailed': '脅威のシミュレーションに失敗しました',
        'simulationNotAllowed': '{{environment}}環境でのセキュリティシミュレーションは許可されていません（リクエスト者：{{requestedBy}}、理由：{{reason}}）',
        'statusUpdateFailed': 'サーバーエラーによりセキュリティインシデントのステータス更新に失敗しました。'
      },
      'monitoring': {
        'alreadyRunning': 'セキュリティ監視は既に実行中です'
      },
      'service': {
        'statusRetrieveFailed': 'サーバーエラーによりセキュリティサービスのステータス取得に失敗しました。'
      },
      'statistics': {
        'retrieveFailed': 'サーバーエラーによりインシデント統計の取得に失敗しました。'
      }
    },
    'system': {
      'cacheError': 'キャッシュ操作が失敗しました: {{operation}} - {{error}}',
      'configurationError': 'システム設定エラー: {{setting}} - {{error}}',
      'databaseConnectionFailed': 'データベースへの接続に失敗しました: {{reason}}',
      'databaseError': 'データベース操作が失敗しました: {{operation}} - {{error}}',
      'databaseTimeout': 'データベースクエリが {{timeout, number}}ms 後にタイムアウトしました',
      'dependencyFailure': '外部依存関係の障害: {{service}} - {{reason}}',
      'diskSpaceLow': 'ディスク容量が危機的に不足しています: 残り {{freeSpace, number}}GB',
      'licenseExpired': 'システムライセンスは {{expiredDate, date}} に期限切れになりました',
      'licenseInvalid': '無効なシステムライセンス: {{reason}}',
      'maintenanceMode': 'システムは {{endTime, datetime}} までメンテナンス中です - {{message}}',
      'memoryExhausted': 'サーバーメモリ使用量が危機的です: {{currentUsage, number}}MB / {{maxMemory, number}}MB',
      'operationFailed': 'システム操作「{{operation}}」は失敗しました: {{reason}}',
      'rateLimited': 'システムが一時的にレート制限中: {{timeWindow}} 内 {{currentRequests}}/{{maxRequests}} リクエスト',
      'resourceExhausted': 'システムリソースが枯渇しました: {{resource}} が {{usage, number}}% の容量で使用されています',
      'serverError': '内部サーバーエラーが発生しました',
      'serviceUnavailable': 'サービスは一時的に利用できません: {{reason}}',
      'taskQueueFull': 'タスクキューがいっぱいです ({{currentTasks}}/{{maxTasks}} タスク)',
      'workerUnavailable': 'リクエストを処理する利用可能なワーカーがありません'
    },
    'user': {
      'accountLocked': 'ユーザーアカウント {{userName}} は {{reason}} によりロックされています',
      'accountSuspended': 'ユーザーアカウント {{userName}} は {{suspendedUntil, datetime}} まで停止されています',
      'activationFailed': '{{userName}} のユーザーアカウントのアクティブ化に失敗しました: {{reason}}',
      'bulkOperationFailed': '{{totalCount}} 件中 {{failedCount}} 件のユーザーの一括操作が失敗しました',
      'bulkOperationFailed_other': '{{totalCount}} 件中 {{failedCount}} 件のユーザーの一括操作が失敗しました',
      'createFailed': '{{email}} のユーザーアカウントの作成に失敗しました: {{reason}}',
      'deactivationFailed': '{{userName}} のユーザーアカウントの非アクティブ化に失敗しました: {{reason}}',
      'deleteFailed': 'ユーザー {{userName}} の削除に失敗しました: {{reason}}',
      'emailExists': 'メールアドレス {{email}} はすでにシステムに登録されています',
      'emailVerificationFailed': 'メール認証に失敗しました: {{reason}}',
      'emailVerificationSystemError': 'システムエラーのため、メールアドレスの変更を確認できませんでした。後でもう一度お試しください。',
      'inactive': 'ユーザーアカウント {{userName}} は非アクティブです',
      'insufficientPermissions': 'ユーザー {{userName}} ({{userRole}}) を変更する権限がありません',
      'listFailed': 'ユーザーリストの取得に失敗しました: {{reason}}',
      'notFound': 'ユーザー "{{userName}}" が見つからないか、削除されています',
      'notFoundById': 'ID {{userId}} のユーザーが見つかりません',
      'passwordChangeFailed': '{{userName}} のパスワードの変更に失敗しました: {{reason}}',
      'passwordIncorrect': '現在のパスワードが正しくありません - もう一度お試しください',
      'profileRetrieveFailed': '{{userName}} のユーザープロファイルの取得に失敗しました: {{reason}}',
      'registrationError': 'システムエラーによりユーザー登録に失敗しました: {{details}}',
      'registrationFailed': 'ユーザー登録に失敗しました: {{reason}}',
      'roleChangeFailed': '{{userName}} のロールを {{oldRole}} から {{newRole}} に変更できませんでした: {{reason}}',
      'sessionLimitExceeded': 'ユーザー {{userName}} は最大同時セッション数 ({{currentSessions}}/{{maxSessions}}) を超えました',
      'updateFailed': '{{userName}} のユーザープロファイルの更新に失敗しました: {{reason}}',
      'usernameExists': 'ユーザー名 "{{username}}" はすでに使用されています'
    },
    'zodDemo': {
      'file': {
        'uploadFailed': 'ファイルアップロードが失敗しました - {{actor}}が"{{fileName}}" ({{fileSize}} バイト)の{{operation}}を完了できませんでした: {{reason}}'
      },
      'search': {
        'failed': '検索操作が失敗しました - {{actor}}がクエリ"{{query}}" ({{searchType}})の{{operation}}を完了できませんでした: {{reason}}'
      },
      'user': {
        'registrationFailed': 'ユーザー登録が失敗しました - {{actor}}が{{userName}} ({{email}})の{{operation}}を完了できませんでした: {{reason}}'
      }
    },
    'businessRuleViolation': 'ビジネスルール違反: {{rules}}',
    'constraintViolation': 'データベース制約違反: {{constraint}}',
    'dataIntegrityError': 'データ整合性エラー: {{details}}',
    'schemaViolation': 'データスキーマ違反: {{violations}}',
    'validation': 'バリデーションエラーが発生しました: {{details}}',
    'validation_other': '{{count}} 件のバリデーションエラーが発生しました: {{details}}',
    'validationField': 'フィールド "{{field}}" のバリデーションに失敗しました: {{error}}',
    'validationGeneric': 'バリデーションエラー',
    'validationMultiple': '{{count}} 個のフィールドで複数の検証エラー',
    'validationMultiple_other': '{{count}} 個のフィールドで複数の検証エラー'
  },
  'formatting': {
    'currency': '合計: {{amount, currency}}',
    'dateRange': '{{startDate, date}} から {{endDate, date}} まで',
    'filesSize': '{{size, number}} バイトのファイル {{count}} 件',
    'filesSize_other': '合計 {{size, number}} バイトのファイル {{count}} 件',
    'percentage': '進捗: {{value, number}}%',
    'timeAgo': '{{time, time}} 前'
  },
  'numbers': {
    'count': '{{value, number}}',
    'currency': '¥{{value, number}}',
    'percentage': '{{value}}%'
  },
  'roles': {
    'displayName': 'ロール',
    'displayName_context_admin': '管理者',
    'displayName_context_super_admin': 'スーパー管理者',
    'displayName_context_user': 'ユーザー'
  },
  'security': {
    'alerts': {
      'alertTemplate': 'アラート: {{name}} - {{eventType}}',
      'channelCreated': 'アラートチャンネルが正常に作成されました',
      'channelsFailed': 'アラートチャネルの取得に失敗しました',
      'createChannelFailed': 'アラートチャネルの作成に失敗しました',
      'createRuleFailed': 'アラートルールの作成に失敗しました',
      'historyFailed': 'アラート履歴の取得に失敗しました',
      'manualSent': '手動アラートが正常に送信されました',
      'ruleCreated': 'アラートルールが正常に作成されました',
      'rulesFailed': 'アラートルールの取得に失敗しました',
      'ruleToggled': 'アラートルールが正常に切り替えられました',
      'ruleToggledTestMode': 'ルールが正常に切り替えられました（テストモード）',
      'sendFailed': '手動アラートの送信に失敗しました',
      'statusFailed': 'アラートシステムステータスの取得に失敗しました',
      'testCompleted': 'アラートシステムテストが完了しました',
      'testFailed': 'アラートシステムのテストに失敗しました',
      'toggleFailed': 'アラートルールの切り替えに失敗しました'
    }
  },
  'success': {
    'admin': {
      'backupCompleted': 'システムバックアップが正常に完了しました ({{duration, number}}秒で {{backupSize, number}}MB)',
      'backupRestored': 'システムバックアップが {{backupDate, date}} から正常に復元されました',
      'cacheCleared': 'システムキャッシュを正常にクリアしました - {{freedMemory, number}}MB を解放しました',
      'configurationUpdated': 'システム設定を正常に更新しました - {{changedSettings}} 件の設定を変更しました',
      'configurationUpdated_other': 'システム設定を正常に更新しました - {{changedSettings}} 件の設定を変更しました',
      'databaseOptimized': 'データベース最適化が完了しました - {{optimizedTables}} テーブルを処理しました',
      'databaseOptimized_other': 'データベース最適化が完了しました - {{optimizedTables}} テーブルを処理しました',
      'logRotationCompleted': 'ログローテーションが完了しました - {{archivedLogs}} 件のログファイルをアーカイブしました',
      'logRotationCompleted_other': 'ログローテーションが完了しました - {{archivedLogs}} 件のログファイルをアーカイブしました',
      'maintenanceCompleted': 'システムメンテナンスが正常に完了しました - ダウンタイム: {{downtimeDuration}}',
      'maintenanceScheduled': '{{maintenanceDate, date}} の {{maintenanceTime, time}} にシステムメンテナンスをスケジュールしました',
      'reportCreated': '{{recordCount, number}} 件のレコードを含む管理レポートを作成しました',
      'reportCreated_other': '{{recordCount, number}} 件のレコードを含む管理レポートを作成しました',
      'securityScanCompleted': 'セキュリティスキャンが完了しました - {{threatsFound}} 件の脅威を検出しました',
      'securityScanCompleted_other': 'セキュリティスキャンが完了しました - {{threatsFound}} 件の脅威を検出しました',
      'serviceRestarted': 'システムサービス {{serviceName}} を正常に再起動しました',
      'statsGenerated': '{{period}} 期間のシステム統計を正常に生成しました - {{dataPoints}} データポイント',
      'statsGenerated_other': '{{period}} 期間のシステム統計を正常に生成しました - {{dataPoints}} データポイント',
      'systemHealthy': 'システムヘルスチェックが完了しました: {{status, uppercase}} (稼働時間 {{uptime, number}}%)',
      'userDetailsRetrieved': 'ユーザー詳細を取得しました: {{userName}} ({{userRole}}, {{userStatus}})。{{joinedDate}} {{requestedBy}}'
    },
    'advancedAudit': {
      'analytics': {
        'retrieved': '高度な監査分析を正常に取得しました'
      },
      'archival': {
        'restoreCompleted': 'アーカイブの復元が正常に完了しました。{{restoredCount}} 件を復元し、{{skippedCount}} 件をスキップしました',
        'runCompleted': 'アーカイブ処理が正常に完了しました。{{archivedCount}} 件をアーカイブし、{{remainingCount}} 件が残っています',
        'statsRetrieved': 'アーカイブ統計を正常に取得しました'
      },
      'behavior': {
        'analyzed': 'ユーザー行動分析が正常に完了しました'
      },
      'compliance': {
        'generated': 'コンプライアンス監査レポートが正常に生成されました'
      },
      'performance': {
        'analyzed': 'パフォーマンス監査分析が正常に完了しました'
      },
      'security': {
        'analyzed': '監査のセキュリティ分析が正常に完了しました'
      }
    },
    'auditMessages': {
      'exported': '監査ログを正常にエクスポートしました',
      'healthRetrieved': '監査システムのヘルス状態を正常に取得しました',
      'retrieved': '監査メッセージを正常に取得しました',
      'searchCompleted': '監査検索が正常に完了しました（{{resultCount}} 件の結果）',
      'searchCompleted_other': '監査検索が正常に完了しました（{{resultCount}} 件の結果）',
      'statsRetrieved': '監査統計を正常に取得しました'
    },
    'auth': {
      'accessGranted': '{{userName}} に {{resource}} へのアクセスを許可しました',
      'accountUnlocked': '{{unlockedBy}} によってアカウント {{userName}} が正常にロック解除されました',
      'loginSuccess': '{{userName}} ({{userRole}}) として {{loginTime}} に正常にログインしました',
      'logoutAllSuccess': 'すべてのデバイスから {{logoutTime}} にログアウトしました',
      'logoutSuccess': '{{deviceInfo}} から {{logoutTime}} に正常にログアウトしました',
      'mfaEnabled': '{{userName}} の多要素認証を正常に有効にしました',
      'mfaVerified': '多要素認証を正常に検証しました',
      'passwordChanged': '{{userName}} のパスワードを {{changeTime}} に正常に変更しました',
      'passwordReset': 'パスワードリセットメールを {{email}} に送信しました - {{expiryMinutes}} 分後に期限切れになります',
      'passwordReset_other': 'パスワードリセットメールを {{email}} に送信しました - {{expiryMinutes}} 分後に期限切れになります',
      'permissionGranted': '{{userName}} にパーミッション "{{permission}}" を付与しました',
      'rateLimitReset': '{{ipAddress}} のレート制限を正常にリセットしました',
      'roleAssigned': '{{assignedBy}} によって {{newRole}} ロールが {{userName}} に正常に割り当てられました',
      'sessionCreated': '{{sessionDuration}} 分の有効期間を持つ新しいユーザーセッションを作成しました',
      'sessionCreated_other': '{{sessionDuration}} 分の有効期間を持つ新しいユーザーセッションを作成しました',
      'sessionExtended': 'ユーザーセッションが {{newExpiry}} まで延長されました',
      'tokenGenerated': '新しいアクセストークンが生成されました - {{expiryTime}} に期限切れになります',
      'tokenRefreshed': '{{refreshTime}} に認証トークンを正常に更新しました'
    },
    'business': {
      'auditPassed': 'ビジネス監査がスコア {{auditScore, number}}% で合格しました - {{criteriaCount}} 件の基準を満たしました',
      'auditPassed_other': 'ビジネス監査がスコア {{auditScore, number}}% で合格しました - {{criteriaCount}} 件の基準を満たしました',
      'complianceVerified': 'コンプライアンス検証が完了しました - {{standardsCount}} 件の標準を検証しました',
      'complianceVerified_other': 'コンプライアンス検証が完了しました - {{standardsCount}} 件の標準を検証しました',
      'operationApproved': 'ビジネス操作 "{{operation}}" が {{approvedBy}} によって承認されました',
      'processAutomated': 'ビジネスプロセスを正常に自動化しました - {{automatedTasks}} 件のタスクを自動化しました',
      'processAutomated_other': 'ビジネスプロセスを正常に自動化しました - {{automatedTasks}} 件のタスクを自動化しました',
      'ruleApplied': 'ビジネスルール "{{ruleName}}" を {{affectedRecords}} 件のレコードに正常に適用しました',
      'ruleApplied_other': 'ビジネスルール "{{ruleName}}" を {{affectedRecords}} 件のレコードに正常に適用しました',
      'validationPassed': '{{entityType}} のビジネス検証に合格しました - すべての {{checkCount}} 件のチェックが成功しました',
      'validationPassed_other': '{{entityType}} のビジネス検証に合格しました - すべての {{checkCount}} 件のチェックが成功しました',
      'workflowCompleted': 'ワークフロー "{{workflowName}}" が {{steps}} ステップで正常に完了しました',
      'workflowCompleted_other': 'ワークフロー "{{workflowName}}" が {{steps}} ステップで正常に完了しました'
    },
    'file': {
      'backup': 'ファイル "{{filename}}" のバックアップを正常に作成しました',
      'compressed': 'ファイルを正常に圧縮しました - サイズが {{compressionRatio, number}}% 削減されました',
      'converted': 'ファイルを {{sourceFormat}} から {{targetFormat}} に正常に変換しました',
      'copied': 'ファイルを {{destinationPath}} に正常にコピーしました',
      'deleted': 'ファイル "{{filename}}" を正常に削除しました',
      'downloadCompleted': 'ファイル "{{filename}}" を正常にダウンロードしました',
      'extracted': 'アーカイブを正常に解凍しました - {{extractedCount}} 件のファイルを解凍しました',
      'extracted_other': 'アーカイブを正常に解凍しました - {{extractedCount}} 件のファイルを解凍しました',
      'moved': 'ファイルを {{sourcePath}} から {{destinationPath}} に正常に移動しました',
      'processingCompleted': 'ファイル "{{filename}}" の処理が完了しました - {{operationsCount}} 件の操作を実行しました',
      'processingCompleted_other': 'ファイル "{{filename}}" の処理が完了しました - {{operationsCount}} 件の操作を実行しました',
      'restored': '{{backupDate, date}} に作成されたバックアップからファイルを正常に復元しました',
      'uploadCompleted': 'ファイル "{{filename}}" を正常にアップロードしました ({{fileSize}})',
      'uploadsBatch': 'バッチアップロードが完了しました: {{totalCount}} 件中 {{successCount}} 件のファイルを処理しました',
      'uploadsBatch_other': 'バッチアップロードが完了しました: {{totalCount}} 件中 {{successCount}} 件のファイルを処理しました',
      'validated': 'ファイル "{{filename}}" の検証に合格しました - 形式: {{fileFormat}}'
    },
    'integration': {
      'apiCall': '{{serviceName}} への API 呼び出しが {{responseTime, number}}ms で正常に完了しました',
      'credentialsValidated': '{{serviceName}} の API 認証情報を正常に検証しました',
      'dataSync': '{{serviceName}} とのデータ同期が完了しました - {{syncedRecords}} 件のレコードを処理しました',
      'dataSync_other': '{{serviceName}} とのデータ同期が完了しました - {{syncedRecords}} 件のレコードを処理しました',
      'dataTransform': 'データ変換が完了しました - {{transformedRecords}} 件のレコードを処理しました',
      'dataTransform_other': 'データ変換が完了しました - {{transformedRecords}} 件のレコードを処理しました',
      'healthCheckPassed': '{{serviceName}} の外部サービスヘルスチェックに合格しました',
      'rateLimit': 'API レート制限ステータス: 残り {{usedRequests}}/{{maxRequests}} リクエスト',
      'serviceConnected': '{{serviceName}} に正常に接続しました - ステータス: {{serviceStatus}}',
      'subscriptionActive': '{{serviceName}} のサービスサブスクリプションは {{expiryDate, date}} までアクティブです',
      'webhookDelivered': 'ウェブフックが {{webhookUrl}} に正常に配信されました - ステータス: {{deliveryStatus}}'
    },
    'kv': {
      'configs': {
        'comparisonRetrieved': '{{actor}}によって環境比較が取得されました - KV: {{kvCount}}、ENV: {{envCount}}、デフォルト: {{defaultCount}}',
        'configRetrieved': '{{actor}}によって設定「{{key}}」が取得されました: {{value}}（デフォルト: {{isDefault}}）',
        'defaultsRetrieved': '{{actor}}によってデフォルト設定が取得されました（{{keyCount}}個のキー）',
        'retrieved': '{{actor}}によって{{configCount}}個の設定が正常に取得されました（{{allowedKeys}}個の許可されたキー）'
      },
      'rateLimit': {
        'batchDeleteDryRun': 'レート制限の一括削除ドライラン: {{count}} 個のキーが削除されます ({{failed}} 失敗)',
        'batchDeleted': 'レート制限の一括削除: {{count}} 個のキーが削除されました ({{failed}} 失敗)',
        'cleanDryRun': 'レート制限のクリーニングドライラン: {{count}} 個のキーが削除されます (プレフィックス: {{prefix}})',
        'cleaned': 'レート制限のクリーニング: {{count}} 個のキーが削除されました (プレフィックス: {{prefix}})',
        'pruneDryRun': 'レート制限のプルーニングドライラン: {{count}} 個のキーが削除されます (プレフィックス: {{prefix}})',
        'pruned': 'レート制限のプルーニング: {{count}} 個のキーが削除されました (プレフィックス: {{prefix}})',
        'seeded': 'レート制限のシード: {{count}} 個のキーが作成されました (プレフィックス: {{prefix}})'
      },
      'status': {
        'disabled': '無効化',
        'enabled': '有効化'
      },
      'adminCacheCleared': '{{actor}}によって設定キャッシュがクリアされました',
      'adminConfigReset': '{{actor}}によって設定「{{key}}」がデフォルトにリセットされました - 以前: {{oldValue}}、現在: {{defaultValue}}',
      'adminConfigUpdated': '{{actor}}によって設定「{{key}}」が{{oldValue}}から{{newValue}}に更新されました',
      'adminFeatureToggled': '{{actor}}によってフィーチャー「{{feature}}」が切り替えられました: {{previousValue}} → {{newValue}}',
      'auditConfigsRetrieved': '{{actor}}によって監査設定が取得されました（{{configCount}}個の設定）',
      'auditPerformanceRetrieved': '{{actor}}によって監査パフォーマンス設定が取得されました（{{settingCount}}個の設定）',
      'auditRetentionRetrieved': '{{actor}}によって監査保持ポリシーが取得されました（{{policyCount}}個のポリシー）',
      'backupCreated': '{{configCount}} 件の設定のバックアップを正常に作成しました',
      'backupCreated_other': '{{configCount}} 件の設定のバックアップを正常に作成しました',
      'batchConfigUpdated': '{{actor}}によるバッチ設定更新: {{updatedCount}}/{{totalCount}}が更新されました（{{failedCount}}個が失敗）',
      'batchUpdateCompleted': 'バッチ設定更新が完了しました: {{totalCount}} 件中 {{successCount}} 件が成功',
      'cacheCleared': '設定キャッシュを正常にクリアしました - {{clearedCount}} 件のエントリを削除しました',
      'cacheCleared_other': '設定キャッシュを正常にクリアしました - {{clearedCount}} 件のエントリを削除しました',
      'configReset': '設定 "{{key}}" をデフォルト値 {{defaultValue}} にリセットしました',
      'configRetrieved': '設定 "{{key}}" を正常に取得しました: {{value}}',
      'configUpdated': '設定 "{{key}}" を {{oldValue}} から {{newValue}} に正常に更新しました',
      'defaultsRestored': '{{restoredCount}} 件のキーのデフォルト設定を正常に復元しました',
      'defaultsRestored_other': '{{restoredCount}} 件のキーのデフォルト設定を正常に復元しました',
      'featureToggled': '機能 "{{feature}}" を正常に {{status}} しました'
    },
    'operation': {
      'batchProcessed': 'バッチ操作が完了しました: {{successCount}}/{{totalCount}} アイテムが正常に処理されました',
      'completed': '操作「{{operationType}}」が {{duration}}ms で正常に完了しました',
      'completed_other': '{{count}} 個の操作が正常に完了しました - 平均時間: {{avgDuration}}ms',
      'taskFinished': 'タスク「{{taskName}}」が {{resultCount}} の結果で正常に完了しました',
      'taskFinished_other': 'タスク「{{taskName}}」が {{resultCount}} の結果で正常に完了しました',
      'workflowCompleted': 'ワークフローが正常に完了しました - {{stepsCount}} ステップが実行されました',
      'workflowCompleted_other': 'ワークフローが正常に完了しました - {{stepsCount}} ステップが実行されました'
    },
    'realtimeIncidents': {
      'created': 'リアルタイムインシデントが正常に作成されました'
    },
    'realtimeMonitoring': {
      'alerts': {
        'configUpdated': 'アラート設定が正常に更新されました',
        'historyRetrieved': 'アラート履歴を正常に取得しました',
        'manualSent': '手動アラートが正常に送信されました',
        'rulesRetrieved': 'アラートルールを正常に取得しました',
        'statusRetrieved': 'アラートシステムステータスを正常に取得しました'
      },
      'dashboard': {
        'cacheCleared': 'リアルタイムダッシュボードキャッシュを正常にクリアしました',
        'liveRetrieved': 'ライブダッシュボードスナップショットを正常に取得しました',
        'overviewRetrieved': 'リアルタイム監視ダッシュボードの概要を正常に取得しました',
        'realtimeRetrieved': 'リアルタイムダッシュボードデータを正常に取得しました'
      },
      'incidents': {
        'created': 'リアルタイム監視インシデント {{incidentId}} が正常に作成されました'
      },
      'monitoring': {
        'analysisCompleted': 'リアルタイム監視分析が正常に完了しました',
        'eventSimulated': '監視イベント {{eventType}} を正常にシミュレートしました',
        'eventsRetrieved': 'リアルタイム監視イベントを正常に取得しました',
        'started': 'リアルタイム監視が正常に開始されました',
        'stopped': 'リアルタイム監視が正常に停止されました',
        'threatResolved': 'リアルタイム脅威 {{threatId}} を正常に解決しました',
        'threatsRetrieved': 'リアルタイム脅威ステータスを正常に取得しました'
      }
    },
    'search': {
      'completed': '検索が正常に完了しました。結果数: {{resultCount}} 件',
      'completed_other': '検索が正常に完了しました。結果数: {{resultCount}} 件'
    },
    'security': {
      'incident': {
        'created': '{{actor}}がセキュリティインシデント「{{title}}」を重要度{{severity}}で作成しました（ID：{{incidentId}}、タイプ：{{type}}）',
        'responseExecuted': '{{actor}}がインシデント{{incidentId}}に対して{{actionCount}}件の対応アクションを実行しました（タイプ：{{actionType}}）（{{executedAt}}）',
        'retrieved': '{{actor}}がインシデント{{incidentId}}の詳細を取得しました（ステータス：{{status}}、重要度：{{severity}}、作成日：{{createdAt}}）',
        'statusUpdated': '{{actor}}がインシデント{{incidentId}}のステータスを「{{oldStatus}}」から「{{newStatus}}」に更新しました（{{timestamp}}）'
      },
      'incidents': {
        'created': '{{actor}}がセキュリティインシデント「{{title}}」を重要度{{severity}}で作成しました（ID：{{incidentId}}、タイプ：{{type}}）',
        'responseExecuted': '{{actor}}がインシデント{{incidentId}}に対して{{actionCount}}件の対応アクションを実行しました（タイプ：{{actionType}}）（{{executedAt}}）',
        'retrieved': '{{actor}}が{{incidentCount}}件のセキュリティインシデントを正常に取得しました（ページ{{page}}、制限{{limit}}、フィルター：{{filters}}）',
        'statusUpdated': '{{actor}}がインシデント{{incidentId}}のステータスを「{{oldStatus}}」から「{{newStatus}}」に更新しました（{{timestamp}}）'
      },
      'monitoring': {
        'started': 'リアルタイム監視を正常に開始しました'
      },
      'service': {
        'statusRetrieved': '{{actor}}がサービスステータスを取得しました：ヘルス{{serviceHealth}}、バージョン{{version}}、稼働時間{{uptime}}（確認日時：{{checkedAt}}）'
      },
      'simulation': {
        'completed': '{{actor}}が{{threatType}}シミュレーションを重要度{{severity}}で完了しました（シミュレーションID：{{simulationId}}）（{{completedAt}}）'
      },
      'statistics': {
        'retrieved': '{{actor}}がセキュリティ統計を取得しました：合計{{totalIncidents}}件、アクティブ{{activeIncidents}}件、解決済み{{resolvedIncidents}}件（取得日時：{{retrievedAt}}）'
      }
    },
    'system': {
      'cacheConnected': 'キャッシュサービス {{cacheService}} に正常に接続しました',
      'configurationLoaded': 'システム設定を正常に読み込みました - {{configCount}} 件の設定',
      'configurationLoaded_other': 'システム設定を正常に読み込みました - {{configCount}} 件の設定',
      'connectionEstablished': '{{serviceName}} への接続を正常に確立しました',
      'databaseConnected': '{{databaseName}} へのデータベース接続を正常に確立しました',
      'healthCheckPassed': 'システムヘルスチェックに合格しました - すべての {{componentCount}} コンポーネントが正常です',
      'healthCheckPassed_other': 'システムヘルスチェックに合格しました - すべての {{componentCount}} コンポーネントが正常です',
      'operationCompleted': 'システム操作 "{{operation}}" が {{duration, number}}ms で正常に完了しました',
      'queueProcessed': 'タスクキューを正常に処理しました - {{processedCount}} 件のタスクが完了しました',
      'queueProcessed_other': 'タスクキューを正常に処理しました - {{processedCount}} 件のタスクが完了しました',
      'resourceAllocated': 'システムリソースを正常に割り当てました: {{allocatedMemory, number}}MB メモリ',
      'resourceReleased': 'システムリソースを正常に解放しました: {{releasedMemory, number}}MB メモリ',
      'rollbackCompleted': 'システムロールバックがバージョン {{previousVersion}} に正常に完了しました',
      'serviceStarted': 'システムサービス {{serviceName}} がポート {{port}} で正常に開始されました',
      'serviceStopped': 'システムサービス {{serviceName}} が正常に停止しました',
      'taskCompleted': 'バックグラウンドタスク {{taskName}} が正常に完了しました',
      'taskScheduled': 'バックグラウンドタスク {{taskName}} を {{scheduledTime, datetime}} にスケジュールしました',
      'upgradeCompleted': 'システムアップグレードがバージョン {{newVersion}} に正常に完了しました'
    },
    'translations': {
      'retrieved': '翻訳を正常に取得しました'
    },
    'user': {
      'activated': '{{userName}} のユーザーアカウントを正常にアクティブ化しました',
      'activated_other': '{{count}} 件のユーザーアカウントを正常にアクティブ化しました',
      'bulkOperationSuccess': '一括操作が完了しました: {{totalCount}} 件中 {{successCount}} 件が成功',
      'created': '{{userName}} ({{email}}) のユーザーアカウントを正常に作成しました',
      'created_other': '{{count}} 件のユーザーアカウントを正常に作成しました',
      'dataExported': '{{userName}} のユーザーデータ ({{fileSize, number}}KB) を正常にエクスポートしました',
      'dataImported': 'ユーザーデータを正常にインポートしました - {{importedCount}} 件のレコードを処理しました',
      'dataImported_other': 'ユーザーデータを正常にインポートしました - {{importedCount}} 件のレコードを処理しました',
      'deactivated': '{{userName}} のユーザーアカウントを正常に非アクティブ化しました',
      'deactivated_other': '{{count}} 件のユーザーアカウントを正常に非アクティブ化しました',
      'deleted': '{{deletedBy}} によって {{userName}} のユーザーアカウントを正常に削除しました',
      'deleted_other': '{{count}} 件のユーザーアカウントを正常に削除しました',
      'emailUpdated': '{{userName}} のメールアドレスを {{oldEmail}} から {{newEmail}} に更新しました',
      'emailVerified': '{{userName}} のメールアドレス {{email, lowercase}} を正常に検証しました',
      'loginHistory': 'ログイン履歴を取得しました: {{userName}} の {{entryCount}} 件のエントリ',
      'loginHistory_other': 'ログイン履歴を取得しました: {{userName}} の {{entryCount}} 件のエントリ',
      'passwordChanged': 'って {{userName}} のパスワードを正常に変更しました',
      'permissionUpdated': '{{userName}} のユーザー権限を正常に更新しました',
      'profileCompleted': '{{userName}} のユーザープロファイルが {{percent, number}}% 完了しました',
      'profileRetrieved': '[{{requestedBy}}] によって {{userName}} ({{userRole}}) のユーザープロファイルを正常に取得しました',
      'profileUpdated': '{{userName}} のユーザープロフィールが正常に更新されました - {{fieldsCount}} 個のフィールドが変更されました',
      'profileUpdated_other': '{{userName}} のユーザープロフィールが正常に更新されました - {{fieldsCount}} 個のフィールドが変更されました',
      'registered': 'って {{userName}} が [{{userRole}}] ロールで正常に登録されました',
      'registeredEmailDisabled': '{{userName}} のアカウントが作成されました。メール通知は現在管理者によって無効になっています。アカウントの有効化についてはサポートにお問い合わせください。',
      'registeredPendingActivation': '{{userName}} の登録を受け付けました。ログインする前に、メールを確認してアカウントを確認・有効化してください。',
      'roleChanged': '{{userName}} のユーザーロールを {{oldRole}} から {{newRole}} に変更しました',
      'sessionTerminated': '{{userName}} のすべてのセッションを正常に終了しました',
      'suspended': '{{userName}} のユーザーアカウントを {{suspendedUntil, datetime}} まで正常に停止しました',
      'unsuspended': '{{liftedBy}} によって {{userName}} のユーザーアカウントの停止が解除されました',
      'updated': '{{userName}} のユーザープロファイルを正常に更新しました - フィールド: {{updatedFields}}',
      'updated_other': '{{count}} 件のユーザープロファイルを正常に更新しました',
      'updatedWithEmailVerification': 'プロフィールが更新されました。新しいメールアドレス {{newEmail}} を確認して、変更を完了してください。'
    }
  },
  'system': {
    'apiInfo': 'API情報',
    'error': 'エラーが発生しました',
    'invalidRequest': '無効なリクエスト',
    'notFound': 'リソースが見つかりません',
    'operationFailed': '{{operation}} が失敗しました: {{error}}',
    'serverError': '内部サーバーエラー',
    'success': '操作が正常に完了しました',
    'welcome': 'Hono Auth API v{{version}} ({{language}}) へようこそ'
  },
  'user': {
    'statusDisplay': {
      'active': 'アクティブ',
      'inactive': '非アクティブ',
      'suspended': '停止中'
    }
  },
  'validation': {
    'advancedAudit': {
      'invalidRetentionAction': '無効な保持アクション: {{action}}、次のいずれかである必要があります: {{validActions}}'
    },
    'advancedCleanup': {
      'backupRecommended': 'クリーンアップの前にバックアップを作成することを強くお勧めします',
      'confirmationRequired': '実際のクリーンアップ操作には確認が必要です',
      'invalid': '無効な高度なクリーンアップパラメータ'
    },
    'arrayValidation': {
      'actions': {
        'tooFew': '少なくとも{{minCount}}個のアクションを含める必要があります',
        'tooFew_other': '少なくとも{{minCount}}個のアクションを含める必要があります',
        'tooMany': '{{maxCount}}個を超えるアクションを含めることはできません',
        'tooMany_other': '{{maxCount}}個を超えるアクションを含めることはできません'
      },
      'channels': {
        'tooFew': '少なくとも{{minCount}}個のチャンネルを含める必要があります',
        'tooFew_other': '少なくとも{{minCount}}個のチャンネルを含める必要があります',
        'tooMany': '{{maxCount}}個を超えるチャンネルを含めることはできません',
        'tooMany_other': '{{maxCount}}個を超えるチャンネルを含めることはできません'
      },
      'conditions': {
        'tooFew': '少なくとも{{minCount}}個の条件を指定する必要があります',
        'tooFew_other': '少なくとも{{minCount}}個の条件を指定する必要があります',
        'tooMany': '{{maxCount}}個を超える条件を指定することはできません',
        'tooMany_other': '{{maxCount}}個を超える条件を指定することはできません'
      },
      'configs': {
        'tooFew': '少なくとも{{minCount}}個の構成を含める必要があります',
        'tooFew_other': '少なくとも{{minCount}}個の構成を含める必要があります',
        'tooMany': '{{maxCount}}個を超える構成を含めることはできません',
        'tooMany_other': '{{maxCount}}個を超える構成を含めることはできません'
      },
      'interests': {
        'tooFew': '少なくとも{{minCount}}個の興味を含める必要があります',
        'tooFew_other': '少なくとも{{minCount}}個の興味を含める必要があります',
        'tooMany': '{{maxCount}}個を超える興味を含めることはできません',
        'tooMany_other': '{{maxCount}}個を超える興味を含めることはできません'
      },
      'items': {
        'tooFew': '少なくとも{{minCount}}個のアイテムが含まれている必要があります',
        'tooFew_other': '少なくとも{{minCount}}個のアイテムが含まれている必要があります',
        'tooMany': '{{maxCount}}個を超えるアイテムを含めることはできません',
        'tooMany_other': '{{maxCount}}個を超えるアイテムを含めることはできません'
      }
    },
    'auditSearch': {
      'atLeastOneFilterRequired': '少なくとも{{min}}個のフィルターを指定する必要があります',
      'atLeastOneFilterRequired_other': '少なくとも{{min}}個のフィルターを指定する必要があります'
    },
    'changePassword': {
      'passwordsDoNotMatch': '新しいパスワードと確認用パスワードが一致しません'
    },
    'cleanupSimulation': {
      'confirmationRequired': 'ドライラン以外の操作には確認が必要です',
      'dataLossWarning': '警告: この操作によりデータが失われる可能性があります',
      'invalid': '無効なクリーンアップシミュレーションパラメータ'
    },
    'confirmPassword': {
      'mustMatch': 'パスワード確認はパスワードと一致する必要があります',
      'required': 'パスワード確認は必須です'
    },
    'dateRange': {
      'invalid': '無効な日付範囲 - 終了日は開始日より後である必要があります',
      'overlapConflict': '日付範囲が既存の範囲と重複しています: {{conflictingRange}}',
      'tooLarge': '日付範囲は{{maxDays}}日を超えることはできません',
      'tooLarge_other': '日付範囲は{{maxDays}}日を超えることはできません'
    },
    'enumValidation': {
      'action': {
        'invalid': '無効: アクションは次のいずれかである必要があります: {{allowedValues}}'
      },
      'actionType': {
        'invalid': '無効: アクションタイプは次のいずれかである必要があります: {{allowedValues}}'
      },
      'category': {
        'invalid': '無効: カテゴリは次のいずれかである必要があります: {{allowedValues}}'
      },
      'channelType': {
        'invalid': '無効: チャネルタイプは次のいずれかである必要があります: {{allowedValues}}'
      },
      'file_type': {
        'invalid': '無効: ファイルタイプは次のいずれかである必要があります: {{allowedValues}}'
      },
      'format': {
        'invalid': '無効: 形式は次のいずれかである必要があります: {{allowedValues}}'
      },
      'metric': {
        'invalid': '無効: メトリックは次のいずれかである必要があります: {{allowedValues}}'
      },
      'operator': {
        'invalid': '無効: 演算子は次のいずれかである必要があります: {{allowedValues}}'
      },
      'priority': {
        'invalid': '無効: 優先度は次のいずれかである必要があります: {{allowedValues}}'
      },
      'reportType': {
        'invalid': '無効: レポートタイプは次のいずれかである必要があります: {{allowedValues}}'
      },
      'resolution': {
        'invalid': '無効: 解像度は次のいずれかである必要があります: {{allowedValues}}'
      },
      'role': {
        'invalid': '無効: ロールは次のいずれかである必要があります: {{allowedValues}}'
      },
      'severity': {
        'invalid': '無効: 重大度は次のいずれかである必要があります: {{allowedValues}}'
      },
      'sort_by': {
        'invalid': '無効: 並べ替えフィールドは次のいずれかである必要があります: {{allowedValues}}'
      },
      'sort_order': {
        'invalid': '無効: 並べ替え順序は次のいずれかである必要があります: {{allowedValues}}'
      },
      'status': {
        'invalid': '無効: ステータスは次のいずれかである必要があります: {{allowedValues}}'
      },
      'timeframe': {
        'invalid': '無効: 期間は次のいずれかである必要があります: {{allowedValues}}'
      },
      'userRole': {
        'invalid': '無効: ユーザーロールは次のいずれかである必要があります: {{allowedValues}}'
      }
    },
    'fieldRequired': {
      'action': 'アクションは必須です',
      'actionTaken': '実行したアクションは必須です',
      'age': '年齢は必須です',
      'assignedTo': '割り当てられたユーザーは必須です',
      'auditLogRetentionDays': '監査ログ保持日数の値は必須です',
      'auditRetention': '監査保持値は必須です',
      'batchSize': 'バッチサイズは必須です',
      'categoryFilter': 'カテゴリフィルターは必須です',
      'channel': 'チャンネルは必須です',
      'channelType': 'チャンネルタイプは必須です',
      'conditionValue': '条件値は必須です',
      'confirmPassword': 'パスワード確認は必須です',
      'date': '日付は必須です',
      'days': '日数の値は必須です',
      'description': '説明は必須です',
      'dryRun': 'ドライランフラグは必須です',
      'email': 'メールアドレスは必須です',
      'enabled': '有効ステータスは必須です',
      'endDate': '終了日は必須です',
      'endTime': '終了時刻は必須です',
      'errorRate': 'エラー率は必須です',
      'executionTime': '実行時間の値は必須です',
      'failureCount': '失敗回数は必須です',
      'field': 'フィールド値は必須です',
      'fileSize': 'ファイルサイズは必須です',
      'forceArchival': '強制アーカイブは必須です',
      'format': 'フォーマットは必須です',
      'hours': '時間の値は必須です',
      'id': 'IDは必須です',
      'incidentType': 'インシデントタイプは必須です',
      'includeDetails': '詳細を含めることは必須です',
      'includeMetadata': 'メタデータを含めることは必須です',
      'includeUserData': 'ユーザーデータを含めることは必須です',
      'intervalMs': 'インターバル (ms) は必須です',
      'limit': '制限値は必須です',
      'maxRecords': '最大レコード数の値は必須です',
      'metric': 'メトリックは必須です',
      'metrics': 'メトリクスは必須です',
      'name': '名前は必須です',
      'page': 'ページ番号は必須です',
      'password': 'パスワードは必須です',
      'period': '期間は必須です',
      'policy': 'ポリシーは必須です',
      'priority': '優先度は必須です',
      'query': '検索クエリは必須です',
      'refreshToken': 'リフレッシュトークンは必須です',
      'reportType': 'レポートタイプは必須です',
      'resolution': '解決は必須です',
      'responseTime': '応答時間は必須です',
      'securityIncident': 'セキュリティインシデントは必須です',
      'startDate': '開始日は必須です',
      'startTime': '開始時刻は必須です',
      'target': 'ターゲットは必須です',
      'termsAccepted': '利用規約への同意が必要です',
      'threshold': 'しきい値は必須です',
      'timeframe': 'タイムフレームは必須です',
      'timeRange': '時間範囲は必須です',
      'token': 'トークンは必須です',
      'userDataRetention': 'ユーザーデータ保持の値は必須です',
      'userDataRetentionDays': 'ユーザーデータ保持日数の値は必須です',
      'userId': 'ユーザーIDは必須です',
      'username': 'ユーザー名は必須です',
      'userRole': 'ユーザーロールは必須です',
      'value': '値は必須です',
      'website': 'ウェブサイトは必須です'
    },
    'fileUpload': {
      'invalidExtension': '無効なファイル拡張子'
    },
    'formatValidation': {
      'assignedTo': {
        'invalid': '無効な割り当てユーザーID形式です'
      },
      'date': {
        'invalid': '無効な日付形式です'
      },
      'email': {
        'invalid': '有効なメールアドレス（例：user@example.com）を入力してください'
      },
      'endDate': {
        'invalid': '無効な終了日形式です'
      },
      'endTime': {
        'invalid': '無効な終了時刻形式です'
      },
      'id': {
        'invalid': '無効なID形式です'
      },
      'refreshToken': {
        'invalid': '無効なリフレッシュトークン形式です'
      },
      'startDate': {
        'invalid': '無効な開始日形式'
      },
      'startTime': {
        'invalid': '無効な開始時刻形式です'
      },
      'token': {
        'invalid': '無効なJWTトークン形式です'
      },
      'url': {
        'invalid': '有効なURL（例：https://example.com）を入力してください'
      },
      'website': {
        'invalid': '有効なウェブサイトURL（例：https://example.com）を入力してください'
      }
    },
    'lengthValidation': {
      'action': {
        'tooLong': 'アクションは{{maxLength}}文字を超えることはできません',
        'tooShort': 'アクションは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': 'アクションは少なくとも{{minLength}}文字である必要があります'
      },
      'actionTaken': {
        'tooLong': '実行したアクションは{{maxLength}}文字を超えてはいけません',
        'tooShort': '実行したアクションは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': '実行したアクションは最低 {{minLength}} 文字である必要があります'
      },
      'bio': {
        'tooLong': '自己紹介文は{{maxLength}}文字を超えることはできません',
        'tooShort': '自己紹介文は少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': '自己紹介文は少なくとも{{minLength}}文字である必要があります'
      },
      'channel': {
        'tooLong': 'チャンネルは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'チャンネルは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'チャンネルは最低 {{minLength}} 文字である必要があります'
      },
      'channelType': {
        'tooLong': 'チャンネルタイプは{{maxLength}}文字を超えることはできません',
        'tooShort': 'チャンネルタイプは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': 'チャンネルタイプは少なくとも{{minLength}}文字である必要があります'
      },
      'confirmPassword': {
        'tooShort': 'パスワードの確認は少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': 'パスワードの確認は少なくとも{{minLength}}文字である必要があります'
      },
      'department': {
        'tooLong': '部署は{{maxLength}}文字を超えてはいけません',
        'tooShort': '部署は最低 {{minLength}} 文字である必要があります',
        'tooShort_other': '部署は最低 {{minLength}} 文字である必要があります'
      },
      'description': {
        'tooLong': '説明は{{maxLength}}文字を超えることはできません',
        'tooShort': '説明は少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': '説明は少なくとも{{minLength}}文字である必要があります'
      },
      'email': {
        'tooLong': 'メールアドレスは{{maxLength}}文字を超えることはできません'
      },
      'entityType': {
        'tooLong': 'エンティティタイプは{{maxLength}}文字を超えることはできません',
        'tooShort': 'エンティティタイプは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': 'エンティティタイプは少なくとも{{minLength}}文字である必要があります'
      },
      'field': {
        'tooLong': 'フィールドは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'フィールドは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'フィールドは最低 {{minLength}} 文字である必要があります'
      },
      'incidentType': {
        'tooLong': 'インシデントタイプは{{maxLength}}文字を超えることはできません',
        'tooShort': 'インシデントタイプは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': 'インシデントタイプは少なくとも{{minLength}}文字である必要があります'
      },
      'interest': {
        'tooLong': '興味は{{maxLength}}文字を超えることはできません',
        'tooShort': '興味は少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': '興味は少なくとも{{minLength}}文字である必要があります'
      },
      'name': {
        'tooLong': '名前は{{maxLength}}文字を超えることはできません'
      },
      'nextSteps': {
        'tooLong': '次のステップは{{maxLength}}文字を超えてはいけません',
        'tooShort': '次のステップは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': '次のステップは最低 {{minLength}} 文字である必要があります'
      },
      'note': {
        'tooLong': 'メモは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'メモは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'メモは最低 {{minLength}} 文字である必要があります'
      },
      'notes': {
        'tooLong': 'ノートは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'ノートは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'ノートは最低 {{minLength}} 文字である必要があります'
      },
      'password': {
        'tooLong': '長すぎます: パスワードは{{maxLength}}文字を超えることはできません',
        'tooShort': '短すぎます: パスワードは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': '短すぎます: パスワードは少なくとも{{minLength}}文字である必要があります'
      },
      'query': {
        'tooLong': '検索クエリは{{maxLength}}文字を超えることはできません',
        'tooShort': '検索クエリは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': '検索クエリは少なくとも{{minLength}}文字である必要があります'
      },
      'search': {
        'tooLong': '検索テキストは{{maxLength}}文字を超えることはできません',
        'tooShort': '検索テキストは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': '検索テキストは少なくとも{{minLength}}文字である必要があります'
      },
      'sortBy': {
        'tooLong': 'ソートフィールドは{{maxLength}}文字を超えることはできません',
        'tooShort': 'ソートフィールドは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': 'ソートフィールドは少なくとも{{minLength}}文字である必要があります'
      },
      'source': {
        'tooLong': 'ソースは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'ソースは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'ソースは最低 {{minLength}} 文字である必要があります'
      },
      'system': {
        'tooLong': 'システムは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'システムは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'システムは最低 {{minLength}} 文字である必要があります'
      },
      'target': {
        'tooLong': 'ターゲットは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'ターゲットは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'ターゲットは最低 {{minLength}} 文字である必要があります'
      },
      'template': {
        'tooLong': 'テンプレートは{{maxLength}}文字を超えてはいけません',
        'tooShort': 'テンプレートは最低 {{minLength}} 文字である必要があります',
        'tooShort_other': 'テンプレートは最低 {{minLength}} 文字である必要があります'
      },
      'token': {
        'tooLong': 'トークンは{{maxLength}}文字を超えることはできません',
        'tooShort': 'トークンは少なくとも{{minLength}}文字である必要があります',
        'tooShort_other': 'トークンは少なくとも{{minLength}}文字である必要があります'
      }
    },
    'numericValidation': {
      'age': {
        'tooLarge': '年齢は{{maxValue}}歳を超えることはできません',
        'tooSmall': '年齢は{{minValue}}歳以上である必要があります'
      },
      'auditLogRetentionDays': {
        'tooSmall': '監査ログ保持日数は{{minValue}}以上である必要があります'
      },
      'auditRetention': {
        'tooLarge': '監査保持値は{{maxValue}}を超えることはできません',
        'tooSmall': '監査保持値は{{minValue}}以上である必要があります'
      },
      'batchSize': {
        'tooLarge': 'バッチサイズは{{maxValue}}を超えてはいけません',
        'tooSmall': 'バッチサイズは{{minValue}}以上である必要があります'
      },
      'days': {
        'tooLarge': '日数は{{maxValue}}を超えることはできません',
        'tooSmall': '日数は{{minValue}}以上である必要があります'
      },
      'errorRate': {
        'tooLarge': 'エラー率は{{maxValue}}%を超えることはできません',
        'tooSmall': 'エラー率は{{minValue}}%以上である必要があります'
      },
      'executionTime': {
        'tooLarge': '実行時間は{{maxValue}}秒を超えることはできません',
        'tooSmall': '実行時間は{{minValue}}秒以上である必要があります'
      },
      'failureCount': {
        'tooLarge': '失敗回数は{{maxValue}}を超えることはできません',
        'tooSmall': '失敗回数は{{minValue}}以上である必要があります'
      },
      'fileSize': {
        'tooLarge': 'ファイルサイズは{{maxValue}}バイトを超えることはできません',
        'tooSmall': 'ファイルサイズは少なくとも{{minValue}}バイトである必要があります'
      },
      'hours': {
        'tooLarge': '時間は{{maxValue}}を超えることはできません',
        'tooSmall': '時間は{{minValue}}以上である必要があります'
      },
      'intervalMs': {
        'tooLarge': 'インターバル (ms) は{{maxValue}}を超えてはいけません',
        'tooSmall': 'インターバル (ms) は{{minValue}}以上である必要があります'
      },
      'limit': {
        'tooLarge': '制限は{{maxValue}}を超えることはできません',
        'tooSmall': '制限は{{minValue}}以上である必要があります'
      },
      'maxRecords': {
        'tooLarge': '最大レコード数は{{maxValue}}を超えることはできません',
        'tooSmall': '最大レコード数は{{minValue}}以上である必要があります'
      },
      'page': {
        'tooLarge': 'ページ番号は{{maxValue}}を超えることはできません',
        'tooSmall': 'ページ番号は{{minValue}}以上である必要があります'
      },
      'responseTime': {
        'tooLarge': '応答時間は{{maxValue}}ミリ秒を超えることはできません',
        'tooSmall': '応答時間は{{minValue}}ミリ秒以上である必要があります'
      },
      'securityIncident': {
        'tooLarge': 'セキュリティインシデントは{{maxValue}}を超えることはできません',
        'tooSmall': 'セキュリティインシデントは{{minValue}}以上である必要があります'
      },
      'threshold': {
        'tooSmall': 'しきい値は{{minValue}}以上である必要があります'
      },
      'userDataRetention': {
        'tooLarge': 'ユーザーデータ保持は{{maxValue}}を超えてはいけません',
        'tooSmall': 'ユーザーデータ保持は{{minValue}}以上である必要があります'
      },
      'userDataRetentionDays': {
        'tooSmall': 'ユーザーデータ保持日数は{{minValue}}以上である必要があります'
      },
      'userId': {
        'tooSmall': 'ユーザーIDは{{minValue}}以上である必要があります'
      }
    },
    'retentionPolicy': {
      'atLeastOneRequired': '少なくとも1つの保持設定を指定する必要があります',
      'atLeastOneRequired_other': '少なくとも{{min}}個の保持設定を指定する必要があります',
      'conflictingRules': '競合する保持ルールが検出されました: {{conflicts}}',
      'invalid': '無効な保持ポリシー'
    },
    'retentionPolicyUpdate': {
      'atLeastOneFieldRequired': '少なくとも1つのフィールドを更新する必要があります',
      'atLeastOneFieldRequired_other': '少なくとも{{min}}個のフィールドを更新する必要があります',
      'immutableField': 'フィールド"{{field}}"は作成後に変更できません',
      'invalid': '無効な保持ポリシー更新'
    },
    'security': {
      'xssPatternDetected': '潜在的なXSSパターンを検出: {{patternName}} は許可されていません'
    },
    'structureValidation': {
      'conditions': {
        'invalid': '条件構造が無効です'
      },
      'config': {
        'invalid': '設定構成が無効です'
      },
      'configUpdate': {
        'invalid': '設定更新フォーマットが無効です。必須フィールド "value" が不足しているか、認識されないフィールドが含まれています'
      },
      'incidentCreation': {
        'invalid': 'インシデント作成の構造が無効です'
      },
      'login': {
        'invalid': 'ログインリクエストの形式が無効です'
      },
      'metadata': {
        'invalid': 'メタデータの構造が無効です'
      },
      'object': {
        'invalid': '無効なオブジェクト構造です'
      },
      'record': {
        'invalid': '無効なレコード形式です'
      }
    },
    'termsAccepted': {
      'mustBeTrue': '利用規約に同意する必要があります',
      'versionMismatch': '利用規約が更新されました - 最新バージョンを確認して同意してください'
    },
    'timeRange': {
      'eitherHoursOrRangeRequired': '時間または日付範囲のいずれかを指定する必要があります',
      'endTimeMustBeAfterStartTime': '終了時刻は開始時刻より後である必要があります',
      'invalid': '時間範囲は次のいずれかである必要があります: last_1h, last_6h, last_24h, last_7d, last_30d',
      'invalidFormat': '時間範囲の形式が無効です（予期される形式: {{expectedFormat}}）',
      'rangeTooLarge': '時間範囲は{{maxDays}}日を超えることはできません',
      'rangeTooLarge_other': '時間範囲は{{maxDays}}日を超えることはできません',
      'required': '時間範囲は必須です'
    },
    'typeValidation': {
      'configValue': {
        'invalid': '無効な設定値の型です'
      },
      'value': {
        'invalid': '無効なデータ型です'
      }
    },
    'username': {
      'invalid': 'ユーザー名は文字、数字、アンダースコアのみを含めることができます',
      'invalidCharacters': 'ユーザー名は文字、数字、アンダースコアのみを含めることができます',
      'required': 'ユーザー名は必須です',
      'reserved': 'ユーザー名 "{{username}}" は予約されており使用できません',
      'tooLong': '長すぎます: ユーザー名は30文字を超えることはできません',
      'tooShort': '短すぎます: ユーザー名は少なくとも3文字である必要があります',
      'tooShort_other': '短すぎます: ユーザー名は少なくとも{{minLength}}文字である必要があります',
      'unavailable': 'ユーザー名 "{{username}}" は使用できません'
    },
    'filterArrayTooLarge': 'フィルター配列が大きすぎます（最大500項目）',
    'filterArrayTooLarge_other': '{{count}}個のアイテムを含むフィルター配列は、最大{{max}}個を超えています',
    'invalid': '無効な値が指定されました',
    'invalid_other': '{{count}}個の無効な値が指定されました',
    'invalidArchiveAction': '無効なアーカイブアクション',
    'invalidJson': 'リクエストボディの無効なJSON',
    'invalidRole': '無効な役割が指定されています',
    'limitTooLarge': '制限が大きすぎます（最大50,000レコード）',
    'limitTooLarge_other': '制限{{limit}}は、最大{{max}}レコードを超えています',
    'registrationFailed': '登録に失敗しました',
    'requestTooLarge': 'リクエストペイロードが大きすぎます',
    'required': 'このフィールドは必須です',
    'required_other': '{{count}}個の必須フィールドが不足しています',
    'searchFailed': '検索に失敗しました',
    'serviceTempUnavailable': 'リクエストが大きすぎて処理できません - サービスが一時的に利用できません',
    'tooLong': '値が{{max}}文字の制限を超えています',
    'tooLong_other': '値が{{max}}文字の制限を超えています',
    'tooShort': '値は少なくとも{{min}}文字である必要があります',
    'tooShort_other': '値は少なくとも{{min}}文字である必要があります',
    'translationsFailed': '翻訳の取得に失敗しました',
    'unsupportedFormat': 'サポートされていないエクスポート形式',
    'updateRequiresField': '更新には少なくとも1つのフィールドが必要です',
    'updateRequiresField_other': '更新操作には少なくとも{{min}}個のフィールドが必要です',
    'uploadFailed': 'ファイルアップロードに失敗しました'
  },
  'zodDemo': {
    'anotherSearchResultTitle': '別の結果',
    'description': 'これは、堅牢なバリデーションのためにHonoでZodを使用する方法を示しています',
    'noDescription': '説明が提供されていません',
    'searchResultTitle': '結果',
    'title': 'Zodバリデーションデモ'
  },
  'zodDemo_operations': {
    'fileUpload': 'デモファイルアップロード',
    'searchExecution': 'デモ検索実行',
    'userRegistration': 'デモユーザー登録'
  }
};
