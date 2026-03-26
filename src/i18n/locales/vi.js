/**
 * VI translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: 2025-12-16T04:10:26.789Z
*/

export default {
  'admin': {
    'accessLevel': {
      'full': 'quyền truy cập đầy đủ hệ thống',
      'limited': 'quyền truy cập giới hạn (cấp độ admin)'
    },
    'actions': {
      'permanentDeletion': 'xóa tài khoản vĩnh viễn'
    },
    'dataScope': {
      'full': 'dữ liệu đầy đủ',
      'limited': 'dữ liệu được lọc'
    },
    'operations': {
      'adminDashboardAccess': 'truy cập dashboard quản trị',
      'adminRoutesAccess': 'truy cập routes quản trị',
      'createUser': 'tạo người dùng',
      'deleteUser': 'xóa người dùng [#{{userId}}]',
      'updateUser': 'cập nhật người dùng [#{{userId}}]'
    },
    'protectionReason': {
      'hierarchy': 'Hệ thống cấp bậc vai trò phải được duy trì',
      'higherPrivilege': 'Không thể sửa đổi người dùng có quyền cao hơn',
      'roleChange': 'Người dùng không thể sửa đổi vai trò của chính họ',
      'superAdmin': 'Tài khoản Super Administrator được bảo vệ'
    },
    'systemStatus': {
      'healthy': 'KHỎE MẠNH',
      'unhealthy': 'KHÔNG KHỎE MẠNH'
    },
    'accessDenied': 'Yêu cầu quyền admin cho thao tác này',
    'accountDeletionSuggestion': 'Liên hệ administrator khác để quản lý tài khoản',
    'activeUsersCount': '{{count}} người dùng hoạt động',
    'activeUsersCount_other': '{{count}} người dùng hoạt động ({{percentage}})',
    'changedByUser': 'Được thay đổi bởi [{{username}}] ({{role}})',
    'checkedByUser': 'Được kiểm tra bởi [{{username}}] ({{role}})',
    'createdByUser': 'Được tạo bởi [{{username}}] ({{role}})',
    'dashboardDataRetrieved': 'Dashboard đã tải với tổng quan {{totalUsers}} hệ thống (quyền truy cập {{accessLevel}}). {{requestedBy}} {{dataFreshness}}',
    'dashboardRetrieved': 'Lấy dữ liệu dashboard thành công',
    'dataFreshness': 'Được tạo lúc {{timestamp}}',
    'deletedByUser': 'Được xóa bởi [{{username}}] ({{role}})',
    'effectiveImmediately': 'Thay đổi có hiệu lực ngay lập tức',
    'failedLoginAttempts': '{{count}} lần đăng nhập thất bại trong giờ qua',
    'failedLoginAttempts_other': '{{count}} lần đăng nhập thất bại trong giờ qua',
    'performanceGrade': 'Hiệu suất: {{grade}}',
    'requestedByUser': 'Được yêu cầu bởi [{{username}}] ({{role}})',
    'responseTime': 'Thời gian phản hồi: {{time}}{{unit}}',
    'restrictedRoleAccess': 'Từ chối truy cập: {{currentRole}} không thể xem người dùng {{requestedRole}}',
    'roleChangedSuccessfully': 'Vai trò đã thay đổi từ {{oldRole}} thành {{newRole}} cho [{{targetUserName}}]. {{changedBy}} {{timestamp}} {{effectiveImmediately}}',
    'routeDiscoverySuccess': 'Lấy routes hệ thống thành công',
    'securityRisk': 'Rủi ro bảo mật: {{level}} ({{failedAttempts}})',
    'statisticsRetrieved': 'Thống kê hệ thống: {{totalUsers}}, người dùng hoạt động: {{activeUsers}} (phạm vi {{dataScope}}). {{requestedBy}}',
    'statsRetrieved': 'Lấy thống kê hệ thống thành công',
    'systemHealthRetrieved': 'Kiểm tra sức khỏe hệ thống hoàn thành: {{healthStatus}} - {{responseTime}}, {{performanceGrade}}, {{securityRisk}}. {{checkedBy}} {{timestamp}}',
    'systemHealthRetrievedFailed': 'Không thể truy xuất thông tin sức khỏe hệ thống',
    'totalUsersCount': 'Tổng {{count}} người dùng',
    'totalUsersCount_other': 'Tổng {{count}} người dùng',
    'updatedByUser': 'Được cập nhật bởi [{{username}}] ({{role}})',
    'userCreatedSuccessfully': 'Người dùng mới [{{userName}}] được tạo với vai trò {{newUserRole}}. {{createdBy}} {{timestamp}}',
    'userDeletedSuccessfully': 'Tài khoản người dùng đã bị xóa vĩnh viễn. {{deletedBy}} {{timestamp}} Hành động: {{action}}',
    'userDetailsRetrieved': 'Chi tiết người dùng: [{{userName}}] ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}',
    'usersListRetrieved': 'Đã lấy thành công {{count}} người dùng (hiển thị {{displayedCount}} trang {{currentPage}}/{{totalPages}}). {{requestedBy}}',
    'usersListRetrieved_other': 'Đã lấy thành công {{count}} người dùng (hiển thị {{displayedCount}} trang {{currentPage}}/{{totalPages}}). {{requestedBy}}',
    'userUpdatedSuccessfully': 'Người dùng [{{updatedUserName}}] đã được cập nhật. {{updatedBy}} {{timestamp}}'
  },
  'api': {
    'databaseError': 'Đã xảy ra lỗi cơ sở dữ liệu',
    'healthCheck': 'API đang chạy trơn tru',
    'methodNotAllowed': 'Phương thức không được phép',
    'routeNotFound': 'Không tìm thấy route',
    'validationError': 'Lỗi xác thực',
    'validationErrorDetails': 'Xác thực thất bại: {{errorCount}} lỗi',
    'validationErrorDetails_other': 'Xác thực thất bại: {{errorCount}} lỗi'
  },
  'audit': {
    'access': {
      'full': 'quyền truy cập hệ thống đầy đủ',
      'limited': 'quyền truy cập hạn chế (dựa trên vai trò)'
    },
    'health': {
      'healthy': 'KHỎE MẠNH',
      'suggestion_admin': 'Kiểm tra sức khỏe hệ thống có thể bị hạn chế cho vai trò của bạn.',
      'suggestion_super_admin': 'Kiểm tra tài nguyên hệ thống, kết nối cơ sở dữ liệu và trạng thái dịch vụ.',
      'systemCheck': 'Kiểm tra sức khỏe hệ thống đầy đủ',
      'unhealthy': 'KHÔNG KHỎE MẠNH'
    },
    'logs': {
      'error': 'Không thể truy xuất nhật ký kiểm toán',
      'suggestion_admin': 'Bạn chỉ có thể xem nhật ký cho người dùng thường và các hành động của chính mình.',
      'suggestion_super_admin': 'Bạn có quyền truy cập đầy đủ vào tất cả nhật ký kiểm toán trong hệ thống.'
    },
    'operations': {
      'export': 'xuất audit logs',
      'healthCheck': 'kiểm tra sức khỏe hệ thống audit',
      'logsView': 'xem audit logs',
      'search': 'tìm kiếm audit logs',
      'stats': 'lấy thống kê audit'
    },
    'search': {
      'allFields': 'tất cả các trường',
      'noQuery': 'không có truy vấn được cung cấp',
      'suggestion_admin': 'Thử tìm kiếm với các từ khác hoặc liên hệ siêu quản trị để được mở rộng quyền truy cập.',
      'suggestion_super_admin': 'Thử tinh chỉnh tiêu chí tìm kiếm hoặc kiểm tra nhật ký hệ thống để tìm vấn đề.'
    },
    'stats': {
      'suggestion_admin': 'Thống kê được lọc dựa trên cấp độ quyền truy cập của bạn. Liên hệ siêu quản trị để có thống kê hệ thống đầy đủ.',
      'suggestion_super_admin': 'Kiểm tra sức khỏe hệ thống và kết nối cơ sở dữ liệu nếu thống kê không khả dụng.'
    }
  },
  'auth': {
    'operations': {
      'export': 'xuất audit logs',
      'healthCheck': 'kiểm tra sức khỏe hệ thống audit',
      'login': 'đăng nhập người dùng',
      'logsView': 'xem audit logs',
      'search': 'tìm kiếm audit logs',
      'stats': 'lấy thống kê audit'
    },
    'accountNotActive': 'Tài khoản không hoạt động',
    'activationAlreadyActive': 'Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay.',
    'activationDisabledByAdmin': 'Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ.',
    'activationFailed': 'Kích hoạt tài khoản thất bại. Vui lòng thử lại.',
    'activationInvalidToken': 'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn',
    'activationMissingToken': 'Thiếu token kích hoạt',
    'activationServerError': 'Đã xảy ra lỗi khi kích hoạt. Vui lòng thử lại sau.',
    'activationSuccess': 'Tài khoản của bạn đã được kích hoạt thành công! Bạn có thể đăng nhập ngay.',
    'activationTokenExpired': 'Liên kết kích hoạt đã hết hạn. Vui lòng yêu cầu liên kết mới.',
    'cannotAccessOtherUsers': 'Không thể truy cập tài nguyên của người dùng khác',
    'cannotAccessSuperAdmin': 'Không thể truy cập tài nguyên Super Administrator',
    'cannotChangeAdminRole': 'Không thể thay đổi vai trò của administrator khác',
    'cannotChangeOwnRole': '[{{userName}}] ({{currentRole}}) không thể thay đổi vai trò của chính mình - {{reason}}',
    'cannotCreateAdmin': 'Không thể tạo tài khoản administrator',
    'cannotCreateHigherRole': '{{currentRole}} không thể tạo tài khoản {{requestedRole}} do hạn chế hệ thống cấp bậc vai trò',
    'cannotCreateSuperAdmin': 'Không thể tạo tài khoản Super Administrator',
    'cannotDeleteOwnAccount': '[{{userName}}] ({{role}}) không thể xóa tài khoản của chính mình. {{suggestion}}',
    'cannotDeleteSuperAdmin': 'Không thể xóa tài khoản {{targetRole}} - {{reason}} (được thử bởi {{currentRole}})',
    'cannotDeleteYourself': 'Không thể xóa tài khoản của chính mình',
    'cannotModifyHigherRoleUser': 'Không thể sửa đổi [{{targetUserName}}] ({{targetRole}}) - {{currentRole}} {{reason}}',
    'cannotModifySuperAdmin': 'Không thể chỉnh sửa tài khoản Super Administrator',
    'cannotPromoteToHigherRole': '{{currentRole}} không thể thăng cấp người dùng lên {{requestedRole}} - {{reason}}',
    'cannotPromoteToSuperAdmin': 'Không thể thăng cấp người dùng lên Super Administrator',
    'deleteNotAllowed': 'Không được phép xóa với vai trò của bạn',
    'forbidden': 'Bị cấm truy cập - không đủ quyền hạn',
    'invalidCredentials': 'Thông tin đăng nhập không hợp lệ',
    'invalidRole': 'Vai trò người dùng không hợp lệ',
    'loginSuccess': 'Đăng nhập thành công',
    'logoutAllSuccess': 'Đăng xuất khỏi tất cả thiết bị thành công',
    'logoutSuccess': 'Đăng xuất thành công',
    'passwordIncorrect': 'Mật khẩu không chính xác',
    'rateLimitExceeded': 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.',
    'refreshSuccess': 'Làm mới token thành công',
    'refreshTokenExpired': 'Refresh token đã hết hạn',
    'refreshTokenInvalid': 'Refresh token không hợp lệ',
    'superAdminRequired': 'Yêu cầu quyền Super Administrator',
    'tokenExpired': 'Token đã hết hạn',
    'tokenInvalid': 'Token không hợp lệ',
    'unauthorized': 'Truy cập không được phép',
    'userNotFound': 'Không tìm thấy người dùng hoặc tài khoản không hoạt động'
  },
  'tokenBlacklist': {
    'createSuccess': 'Token đã được thêm vào danh sách đen thành công',
    'deleteSuccess': 'Token đã được xóa khỏi danh sách đen thành công',
    'bulkDeleteSuccess': 'Xóa hàng loạt token thành công',
    'tokenNotFound': 'Không tìm thấy token',
    'listSuccess': 'Lấy danh sách token bị chặn thành công',
    'getSuccess': 'Lấy chi tiết token bị chặn thành công'
  },
  'dates': {
    'changedAt': 'Được thay đổi lúc {{date, datetime}}',
    'checkedAt': 'Được kiểm tra lúc {{date, datetime}}',
    'createdAt': 'Được tạo lúc {{date, datetime}}',
    'deletedAt': 'Được xóa lúc {{date, datetime}}',
    'updatedAt': 'Được cập nhật lúc {{date, datetime}}',
    'userJoined': 'Đã tham gia vào {{date, date}}'
  },
  'emails': {
    'registration': {
      'activateButton': 'Kích hoạt tài khoản',
      'activateLinkText': 'Hoặc sao chép và dán liên kết này vào trình duyệt:',
      'details': 'Thông tin tài khoản',
      'disclaimer': 'Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email này. Không cần thực hiện thêm hành động nào.',
      'email': 'Email: {{email}}',
      'expiryWarning': 'Liên kết kích hoạt này sẽ hết hạn sau {{hours}} giờ.',
      'footer': 'Đây là email tự động từ [{{appName}}]. Vui lòng không trả lời email này.',
      'greeting': 'Xin chào [{{userName}}],',
      'instructions': 'Để hoàn tất đăng ký và bắt đầu sử dụng tài khoản, vui lòng nhấn vào nút bên dưới:',
      'intro': 'Chào mừng bạn đến với [{{appName}}]! Tài khoản của bạn đã được tạo thành công.',
      'ip': 'Địa chỉ IP: {{ip}}',
      'securityNote': 'Vì lý do bảo mật, vui lòng không chia sẻ liên kết này với bất kỳ ai.',
      'subject': '[{{appName}}] - Kích hoạt tài khoản của bạn',
      'thanks': 'Trân trọng,\nĐội ngũ [{{appName}}]',
      'time': 'Đăng ký lúc: {{time}} ngày {{date}}'
    }
  },
  'endpoints': {
    'admin': {
      'changeRole': 'Thay đổi vai trò người dùng (yêu cầu quyền Super Admin)',
      'createUser': 'Tạo người dùng mới (yêu cầu quyền admin)',
      'dashboard': 'Lấy dữ liệu dashboard toàn diện (yêu cầu quyền admin)',
      'deleteUser': 'Xóa người dùng (yêu cầu quyền Super Admin)',
      'stats': 'Lấy thống kê hệ thống (yêu cầu quyền admin)',
      'systemHealth': 'Lấy trạng thái sức khỏe hệ thống toàn diện (yêu cầu quyền admin)',
      'updateUser': 'Cập nhật thông tin người dùng (yêu cầu quyền admin)',
      'userDetails': 'Lấy chi tiết người dùng (yêu cầu quyền admin)',
      'usersList': 'Liệt kê tất cả người dùng (yêu cầu quyền admin)',
      'blacklistList': 'Liệt kê các token bị liệt vào danh sách đen (Chỉ dành cho Super Admin)',
      'blacklistCreate': 'Thêm thủ công token vào danh sách đen (Chỉ dành cho Super Admin)',
      'blacklistDetails': 'Xem chi tiết mục danh sách đen (Chỉ dành cho Super Admin)',
      'blacklistBulkDelete': 'Xóa hàng loạt mục danh sách đen (Chỉ dành cho Super Admin)',
      'blacklistDelete': 'Xóa mục danh sách đen (Chỉ dành cho Super Admin)'
    },
    'advanced_audit': {
      'analytics': 'Phân tích audit nâng cao (yêu cầu quyền admin)',
      'analyticsBehavior': 'Phân tích hành vi (yêu cầu quyền admin)',
      'analyticsPerformance': 'Phân tích hiệu suất (yêu cầu quyền admin)',
      'analyticsSecurity': 'Phân tích bảo mật (yêu cầu quyền admin)',
      'archival': 'Lưu trữ log audit (yêu cầu quyền admin)',
      'archivalRestore': 'Khôi phục logs đã lưu trữ (yêu cầu quyền admin)',
      'archivalRun': 'Chạy quá trình lưu trữ (yêu cầu quyền admin)',
      'archivalStats': 'Thống kê lưu trữ (yêu cầu quyền admin)',
      'archiveManage': 'Quản lý lưu trữ (yêu cầu quyền admin)',
      'compliance': 'Báo cáo tuân thủ (yêu cầu quyền admin)',
      'complianceReport': 'Tạo báo cáo tuân thủ (yêu cầu quyền admin)',
      'exportAdvanced': 'Xuất nâng cao (yêu cầu quyền admin)',
      'middlewareStats': 'Thống kê middleware (yêu cầu quyền admin)'
    },
    'audit': {
      'export': 'Xuất logs audit (yêu cầu quyền admin)',
      'logs': 'Xem logs audit (yêu cầu quyền admin)',
      'search': 'Tìm kiếm logs audit (yêu cầu quyền admin)',
      'stats': 'Lấy thống kê audit (yêu cầu quyền admin)'
    },
    'auth': {
      'login': 'Đăng nhập bằng email và mật khẩu',
      'logout': 'Đăng xuất và vô hiệu hóa tokens',
      'logoutAll': 'Đăng xuất khỏi tất cả thiết bị (thu hồi toàn bộ token)',
      'refresh': 'Làm mới access token'
    },
    'demo': {
      'info': 'Thông tin demo xác thực Zod',
      'register': 'Demo đăng ký người dùng với xác thực toàn diện',
      'search': 'Demo tìm kiếm với xác thực query parameter',
      'upload': 'Demo tải lên file với xác thực metadata'
    },
    'kv_admin': {
      'audit': {
        'alerts': 'Lấy ngưỡng cảnh báo audit (chỉ Super Admin)',
        'compliance': 'Lấy cài đặt tuân thủ audit (chỉ Super Admin)',
        'configs': 'Xem cấu hình hệ thống audit (chỉ Super Admin)',
        'export': 'Lấy cài đặt xuất dữ liệu audit (chỉ Super Admin)',
        'features': 'Lấy cờ tính năng audit (chỉ Super Admin)',
        'featureToggle': 'Chuyển đổi cờ tính năng audit (chỉ Super Admin)',
        'performance': 'Lấy cài đặt hiệu suất audit (chỉ Super Admin)',
        'realtime': 'Lấy cài đặt giám sát thời gian thực (chỉ Super Admin)',
        'retention': 'Lấy chính sách lưu trữ audit (chỉ Super Admin)'
      },
      'config': 'Xem cấu hình KV (chỉ Super Admin)',
      'configBulk': 'Cập nhật hàng loạt cấu hình KV (chỉ Super Admin)',
      'configCacheClear': 'Xóa cache cấu hình KV (chỉ Super Admin)',
      'configDefaults': 'Lấy cấu hình KV mặc định (chỉ Super Admin)',
      'configDelete': 'Xóa khóa cấu hình KV (chỉ Super Admin)',
      'configEnvComparison': 'So sánh cấu hình KV giữa các môi trường (chỉ Super Admin)',
      'configGet': 'Lấy cấu hình KV cụ thể (chỉ Super Admin)',
      'configs': 'Xem danh sách cấu hình KV (chỉ Super Admin)',
      'configsBatch': 'Cập nhật hàng loạt các cấu hình KV (chỉ Super Admin)',
      'configsCacheClear': 'Xóa cache cho các cấu hình KV (chỉ Super Admin)',
      'configsDefaults': 'Lấy cấu hình KV mặc định (dạng danh sách) (chỉ Super Admin)',
      'configsEnvComparison': 'So sánh cấu hình KV giữa các môi trường (dạng danh sách) (chỉ Super Admin)',
      'configUpdate': 'Cập nhật cấu hình KV (chỉ Super Admin)'
    },
    'realtime_monitoring': {
      'alerts': 'Quản lý cảnh báo hệ thống (yêu cầu quyền admin)',
      'alertsChannels': 'Quản lý kênh cảnh báo (yêu cầu quyền admin)',
      'alertsChannelsCreate': 'Tạo kênh cảnh báo (yêu cầu quyền admin)',
      'alertsConfigure': 'Cấu hình cảnh báo hệ thống (yêu cầu quyền admin)',
      'alertsHistory': 'Lấy lịch sử cảnh báo (yêu cầu quyền admin)',
      'alertsRules': 'Quản lý quy tắc cảnh báo (yêu cầu quyền admin)',
      'alertsRulesCreate': 'Tạo quy tắc cảnh báo (yêu cầu quyền admin)',
      'alertsRuleToggle': 'Bật/tắt quy tắc cảnh báo (yêu cầu quyền admin)',
      'alertsSend': 'Gửi cảnh báo hệ thống (yêu cầu quyền admin)',
      'alertsStatus': 'Lấy trạng thái cảnh báo (yêu cầu quyền admin)',
      'alertsTest': 'Kiểm tra hệ thống cảnh báo (yêu cầu quyền admin)',
      'analyze': 'Phân tích dữ liệu giám sát (yêu cầu quyền admin)',
      'dashboard': 'Dashboard giám sát thời gian thực (yêu cầu quyền admin)',
      'dashboardCache': 'Xóa cache dashboard (yêu cầu quyền admin)',
      'dashboardExport': 'Xuất dữ liệu dashboard (yêu cầu quyền admin)',
      'dashboardHealth': 'Kiểm tra sức khỏe dashboard (yêu cầu quyền admin)',
      'dashboardLive': 'Ảnh chụp dashboard trực tiếp (yêu cầu quyền admin)',
      'dashboardOverview': 'Tổng quan dashboard (yêu cầu quyền admin)',
      'dashboardPerformance': 'Dashboard hiệu suất (yêu cầu quyền admin)',
      'dashboardRealtime': 'Dữ liệu dashboard trực tiếp (yêu cầu quyền admin)',
      'dashboardSecurity': 'Dashboard bảo mật (yêu cầu quyền admin)',
      'dashboardTimeline': 'Timeline dashboard (yêu cầu quyền admin)',
      'eventsRecent': 'Lấy các sự kiện giám sát gần đây (yêu cầu quyền admin)',
      'incidentsCreate': 'Tạo sự cố giám sát thời gian thực (yêu cầu quyền admin)',
      'metrics': 'Chỉ số hệ thống thời gian thực (yêu cầu quyền admin)',
      'resolveThreat': 'Giải quyết mối đe dọa đã phát hiện (yêu cầu quyền admin)',
      'simulate': 'Mô phỏng kịch bản giám sát (yêu cầu quyền admin)',
      'start': 'Bắt đầu giám sát thời gian thực (yêu cầu quyền admin)',
      'status': 'Lấy trạng thái giám sát (yêu cầu quyền admin)',
      'stop': 'Dừng giám sát thời gian thực (yêu cầu quyền admin)',
      'threats': 'Lấy thông tin mối đe dọa (yêu cầu quyền admin)'
    },
    'security_incident': {
      'bulkDelete': 'Xóa hàng loạt {{count}} sự cố bảo mật (yêu cầu quyền admin {{actor}})',
      'create': 'Tạo sự cố bảo mật mới (yêu cầu quyền admin {{actor}}, loại {{type}}, mức độ nghiêm trọng {{severity}})',
      'deleteById': 'Xóa sự cố bảo mật [#{{incidentId}}] (yêu cầu quyền admin {{actor}})',
      'exportCsv': 'Xuất {{count}} sự cố bảo mật ra CSV (yêu cầu quyền admin {{actor}}, khoảng thời gian: {{dateRange}})',
      'getById': 'Lấy sự cố bảo mật theo [#{{incidentId}}] (yêu cầu quyền admin {{actor}})',
      'getDashboard': 'Lấy dashboard sự cố bảo mật (yêu cầu quyền admin {{actor}}, bộ lọc: {{filters}})',
      'getStatistics': 'Lấy thống kê sự cố bảo mật (yêu cầu quyền admin {{actor}}, thời kỳ: {{period}})',
      'incidentDetails': 'Lấy chi tiết sự cố (yêu cầu quyền admin)',
      'incidentResponse': 'Thực hiện phản hồi sự cố (yêu cầu quyền admin)',
      'incidents': 'Liệt kê sự cố bảo mật (yêu cầu quyền admin)',
      'incidentsCreate': 'Tạo sự cố bảo mật (yêu cầu quyền admin)',
      'incidentStatus': 'Cập nhật trạng thái sự cố (yêu cầu quyền admin)',
      'incidentUpdate': 'Cập nhật sự cố (yêu cầu quyền admin)',
      'list': 'Liệt kê sự cố bảo mật (yêu cầu quyền admin {{actor}}, trang {{page}}, giới hạn {{limit}})',
      'serviceStatus': 'Lấy trạng thái dịch vụ (yêu cầu quyền admin)',
      'simulate': 'Mô phỏng sự cố bảo mật (yêu cầu quyền admin)',
      'statistics': 'Lấy thống kê sự cố (yêu cầu quyền admin)',
      'updateById': 'Cập nhật sự cố bảo mật [#{{incidentId}}] (yêu cầu quyền admin {{actor}}, các trường được cập nhật: {{fields}})',
      'updateStatus': 'Cập nhật trạng thái sự cố bảo mật [#{{incidentId}}] thành {{status}} (yêu cầu quyền admin {{actor}})'
    },
    'system': {
      'apiInfo': 'Thông tin API toàn diện và endpoints',
      'favicon': 'Tài nguyên favicon và icon',
      'health': 'Endpoint kiểm tra sức khỏe',
      'language': 'Endpoint chuyển đổi ngôn ngữ',
      'root': 'API root endpoint - thông báo chào mừng',
      'routes': 'Khám phá routes hệ thống (chỉ admin)',
      'unknown': 'Endpoint không xác định',
      'version': 'Thông tin phiên bản API'
    },
    'translations': {
      'get': 'Lấy tất cả bản dịch cho ngôn ngữ cụ thể',
      'list': 'Liệt kê tất cả ngôn ngữ có sẵn và trạng thái xác thực',
      'section': 'Lấy bản dịch section cụ thể',
      'validate': 'Xác thực tính đầy đủ của bản dịch'
    },
    'user': {
      'me': 'Lấy thông tin người dùng hiện tại (yêu cầu xác thực)',
      'profile': 'Lấy hồ sơ người dùng (yêu cầu xác thực)',
      'register': 'Đăng ký người dùng mới',
      'updatePassword': 'Đổi mật khẩu (yêu cầu xác thực)',
      'updateProfile': 'Cập nhật hồ sơ người dùng (yêu cầu xác thực)'
    }
  },
  'errors': {
    'admin': {
      'accessDenied': 'Yêu cầu quyền truy cập admin cho thao tác này',
      'dashboardRetrieveFailed': 'Không thể truy xuất dữ liệu bảng điều khiển admin',
      'permissionDenied': 'Không đủ quyền admin cho thao tác này',
      'roleChangeFailed': 'Không thể thay đổi vai trò người dùng',
      'statsRetrieveFailed': 'Không thể truy xuất thống kê admin',
      'systemHealthRetrieveFailed': 'Không thể truy xuất thông tin sức khỏe hệ thống',
      'userManagementFailed': 'Thao tác quản lý người dùng thất bại'
    },
    'advancedAudit': {
      'analytics': {
        'failed': 'Không thể truy xuất dữ liệu phân tích - {{actor}} không thể hoàn thành {{operation}} cho khung thời gian {{timeframe}}: {{reason}}'
      },
      'archival': {
        'archiveOperationFailed': 'Không thể thực hiện thao tác lưu trữ - {{actor}} không thể hoàn thành {{operation}} ({{action}}): {{reason}}',
        'restoreFailed': 'Không thể khôi phục logs đã lưu trữ - {{actor}} không thể thực hiện {{operation}} cho {{dateRange}}: {{reason}}',
        'runFailed': 'Không thể chạy quy trình lưu trữ - {{actor}} không thể hoàn thành {{operation}} với ngưỡng {{cutoffDays}}: {{reason}}',
        'statsFailed': 'Không thể truy xuất thống kê lưu trữ - {{actor}} không thể thực hiện {{operation}}: {{reason}}'
      },
      'behavior': {
        'failed': 'Không thể truy xuất phân tích hành vi - {{actor}} không thể hoàn thành {{operation}} cho {{timeframe}} nhắm mục tiêu {{targetRole}}: {{reason}}'
      },
      'compliance': {
        'customComplianceFailed': 'Không thể tạo báo cáo tuân thủ tùy chỉnh - {{actor}} không thể hoàn thành {{operation}} cho "[{{reportName}}]" ({{reportType}}): {{reason}}',
        'failed': 'Không thể tạo báo cáo tuân thủ - {{actor}} không thể hoàn thành {{operation}} cho {{timeframe}} với định dạng {{format}}: {{reason}}',
        'reportFailed': 'Không thể tạo báo cáo tuân thủ - {{actor}} không thể thực hiện {{operation}} cho báo cáo {{type}}: {{reason}}'
      },
      'export': {
        'failed': 'Không thể thực hiện xuất nâng cao - {{actor}} không thể hoàn thành {{operation}} với định dạng {{format}} ({{recordCount}} bản ghi): {{reason}}'
      },
      'middleware': {
        'statsFailed': 'Không thể truy xuất thống kê middleware - {{actor}} không thể thực hiện {{operation}} cho {{middlewareType}}: {{reason}}'
      },
      'performance': {
        'failed': 'Không thể truy xuất phân tích hiệu suất - {{actor}} ({{role}}) không thể thực hiện {{operation}} cho {{timeframe}}: {{reason}}'
      },
      'security': {
        'failed': 'Không thể truy xuất phân tích bảo mật - {{actor}} ({{role}}) không thể thực hiện {{operation}} cho {{timeframe}}: {{reason}}'
      }
    },
    'api': {
      'databaseError': 'Lỗi cơ sở dữ liệu trong cuộc gọi API: {{operation}}',
      'methodNotAllowed': 'Phương thức HTTP {{method}} không được phép cho tuyến {{path}}',
      'routeNotFound': 'Không tìm thấy tuyến API: {{method}} {{path}}',
      'validationError': 'Lỗi xác thực API: {{details}}'
    },
    'audit': {
      'export': {
        'exportFailed': 'Không thể xuất audit logs - {{actor}} không thể hoàn thành {{operation}} với định dạng {{format}}: {{reason}}'
      },
      'health': {
        'healthFailed': 'Không thể kiểm tra sức khỏe hệ thống audit - {{actor}} không thể thực hiện {{operation}} ({{checkType}}): {{reason}}'
      },
      'logs': {
        'retrieveFailed': 'Không thể truy xuất audit logs - {{actor}} gặp lỗi khi thực hiện {{operation}}: {{reason}}'
      },
      'search': {
        'searchFailed': 'Không thể tìm kiếm audit logs - {{actor}} không thể hoàn thành {{operation}} với truy vấn "{{query}}": {{reason}}'
      },
      'stats': {
        'statsFailed': 'Không thể truy xuất thống kê audit - {{actor}} ({{role}}) không thể thực hiện {{operation}}: {{reason}}'
      }
    },
    'auth': {
      'accountDisabled': 'Tài khoản người dùng [{{userName}}] bị vô hiệu hóa bởi quản trị viên',
      'accountInactive': 'Tài khoản của bạn chưa được kích hoạt. Vui lòng kích hoạt qua email hoặc liên hệ hỗ trợ.',
      'accountLocked': 'Tài khoản bị khóa trong {{duration, time}} do lần thử đăng nhập thất bại',
      'accountNotVerified': 'Địa chỉ email cho [{{userName}}] chưa được xác minh',
      'cannotAccessOtherUsers': 'Không thể truy cập tài nguyên của người dùng khác',
      'cannotChangeOwnRole': '[{{userName}}] ({{currentRole}}) không thể thay đổi vai trò của chính mình - {{reason}}',
      'cannotCreateHigherRole': 'Không thể tạo người dùng với vai trò cao hơn vai trò hiện tại của bạn',
      'cannotDeleteSuperAdmin': 'Không thể xóa tài khoản Super Administrator',
      'cannotDeleteYourself': 'Không thể xóa tài khoản của chính mình',
      'cannotModifyHigherRoleUser': 'Không thể sửa đổi người dùng có vai trò cao hơn',
      'cannotPromoteToHigherRole': 'Không thể thăng cấp người dùng lên vai trò {{requestedRole}} - {{reason}}',
      'deleteNotAllowed': 'Không được phép xóa với vai trò của bạn',
      'failed': 'Xác thực thất bại: {{reason}}',
      'failed_other': '{{count}} lần thử xác thực thất bại trong {{timeWindow}} qua',
      'forbidden': 'Truy cập bị cấm - không đủ đặc quyền cho {{operation}}',
      'invalidCredentials': 'Email hoặc mật khẩu không hợp lệ',
      'invalidCredentials_context_admin': 'Thông tin xác thực không hợp lệ được cung cấp cho đăng nhập tài khoản quản trị',
      'invalidCredentials_context_user': 'Thông tin xác thực không hợp lệ được cung cấp cho đăng nhập tài khoản người dùng',
      'loginFailed': 'Quá trình đăng nhập thất bại cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}}, IP: {{ipAddress}})',
      'mfaFailed': 'Xác thực đa yếu tố thất bại: {{reason}}',
      'mfaRequired': 'Xác thực đa yếu tố là bắt buộc cho [{{userName}}]',
      'passwordIncorrect': 'Mật khẩu không chính xác cho người dùng [{{userName}}]',
      'permissionDenied': 'Quyền bị từ chối cho hành động: {{action}}',
      'rateLimitExceeded': 'Vượt quá giới hạn tần suất: {{currentRequests}}/{{maxRequests}} yêu cầu mỗi {{timeWindow}}',
      'refreshTokenExpired': 'Refresh token đã hết hạn lúc {{expiredAt, datetime}}',
      'refreshTokenFailed': 'Làm mới token thất bại cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'refreshTokenInvalid': 'Refresh token không hợp lệ hoặc đã bị thu hồi',
      'roleRequired': 'Yêu cầu vai trò {{requiredRole}} cho thao tác này',
      'sessionExpired': 'Phiên người dùng đã hết hạn lúc {{expiredAt, datetime}}',
      'sessionInvalid': 'Phiên người dùng không hợp lệ hoặc bị hỏng',
      'superAdminRequired': 'Yêu cầu quyền truy cập Super Admin',
      'tokenExpired': 'Token xác thực đã hết hạn lúc {{expiredAt, datetime}}',
      'tokenInvalid': 'Token xác thực không hợp lệ hoặc bị lỗi',
      'tokenMissing': 'Token xác thực là bắt buộc nhưng không được cung cấp',
      'tooManyAttempts': 'Quá nhiều lần thử đăng nhập thất bại ({{attemptCount}}) từ {{ipAddress}}',
      'tooManyAttempts_other': 'Quá nhiều lần thử đăng nhập thất bại ({{attemptCount}} lần thử) từ {{ipAddress}}',
      'unauthorized': 'Truy cập trái phép vào tài nguyên: {{resource}}',
      'userNotFound': 'Không tìm thấy tài khoản với email {{email}}'
    },
    'business': {
      'businessHoursOnly': 'Thao tác chỉ được phép trong giờ làm việc ({{businessHours}})',
      'conflictingOperation': 'Thao tác xung đột đang tiến hành: {{operation}}',
      'deadlineExpired': 'Hạn chót thao tác đã hết vào {{deadline, datetime}}',
      'duplicateEntry': 'Phát hiện mục trùng lặp: {{entity}} với {{field}} = "{{value}}"',
      'insufficientBalance': 'Số dư không đủ: có {{available, currency}}, yêu cầu {{required, currency}}',
      'operationNotAllowed': 'Thao tác "{{operation}}" không được phép: {{reason}}',
      'preconditionFailed': 'Điều kiện tiên quyết thất bại: {{condition}}',
      'quotaReached': 'Đã đạt giới hạn hạn ngạch: {{used, number}}/{{limit, number}} {{resource}}',
      'referenceConstraint': 'Không thể xóa {{entity}} - được tham chiếu bởi {{referencingCount}} bản ghi khác',
      'referenceConstraint_other': 'Không thể xóa {{entity}} - được tham chiếu bởi {{referencingCount}} bản ghi khác',
      'resourceLocked': 'Tài nguyên "{{resource}}" bị khóa bởi {{lockedBy}} đến {{lockedUntil, datetime}}',
      'workflowViolation': 'Vi phạm luồng công việc: {{step}} không thể thực hiện ở trạng thái hiện tại {{currentState}}'
    },
    'file': {
      'accessDenied': 'Truy cập bị từ chối đến tệp "[{{filename}}]": {{reason}}',
      'corrupted': 'Tệp có vẻ bị hỏng hoặc không hoàn chỉnh',
      'formatUnsupported': 'Định dạng tệp không được hỗ trợ cho thao tác: {{operation}}',
      'invalidType': 'Loại tệp "{{fileType}}" không được phép - các loại được hỗ trợ: {{allowedTypes}}',
      'notFound': 'Không tìm thấy tệp "[{{filename}}]"',
      'processingFailed': 'Xử lý tệp thất bại: {{reason}}',
      'quotaExceeded': 'Vượt quá hạn ngạch lưu trữ: {{used, number}}MB / {{quota, number}}MB',
      'tooLarge': 'Kích thước tệp {{actualSize, number}}MB vượt quá giới hạn {{maxSize, number}}MB',
      'tooSmall': 'Kích thước tệp {{actualSize, number}} byte dưới mức tối thiểu {{minSize, number}} byte',
      'uploadFailed': 'Tải lên tệp thất bại: {{reason}}',
      'virusDetected': 'Tệp bị chặn bởi quét bảo mật: {{threat}}'
    },
    'i18n': {
      'context_demo_failed': 'Không thể chạy demo dịch thuật theo ngữ cảnh: {{reason}}',
      'context_test_failed': 'Không thể kiểm tra dịch thuật theo ngữ cảnh cho khóa "{{key}}": {{reason}}',
      'enhanced_demo_failed': 'Không thể chạy demo tính năng i18n nâng cao: {{reason}}',
      'error_demo_failed': 'Không thể chạy demo thông báo lỗi: {{reason}}',
      'formatting_demo_failed': 'Không thể chạy demo formatting: {{reason}}',
      'formatting_test_failed': 'Không thể kiểm tra tính năng formatting cho khóa "{{key}}": {{reason}}',
      'languageNotSupported': 'Ngôn ngữ "{{language}}" không được hỗ trợ. Ngôn ngữ có sẵn: {{supportedLanguages}}',
      'plurals_demo_failed': 'Không thể chạy demo pluralization: {{reason}}',
      'plurals_test_failed': 'Không thể kiểm tra tính năng pluralization cho khóa "{{key}}": {{reason}}',
      'sectionNotFound': 'Không tìm thấy phần dịch thuật "{{section}}" cho ngôn ngữ "{{language}}"',
      'success_demo_failed': 'Không thể chạy demo thông báo thành công: {{reason}}',
      'translationsFailed': 'Không thể truy xuất thông tin dịch thuật: {{reason}}'
    },
    'integration': {
      'apiLimitExceeded': 'Vượt quá giới hạn tần suất API cho [{{serviceName}}]: {{limit}} yêu cầu mỗi {{period}}',
      'authenticationFailed': 'Xác thực thất bại với [{{serviceName}}]: {{reason}}',
      'credentialsExpired': 'Thông tin xác thực API cho [{{serviceName}}] đã hết hạn vào {{expiredDate, date}}',
      'dataTransformFailed': 'Chuyển đổi dữ liệu thất bại cho [{{serviceName}}]: {{reason}}',
      'invalidResponse': 'Phản hồi không hợp lệ từ [{{serviceName}}]: {{details}}',
      'serviceDown': 'Dịch vụ bên ngoài [{{serviceName}}] hiện đang ngừng hoạt động',
      'syncFailed': 'Đồng bộ hóa dữ liệu thất bại với [{{serviceName}}]: {{reason}}',
      'webhookTimeout': 'Hết thời gian chờ webhook từ [{{serviceName}}] sau {{timeout, number}}ms'
    },
    'kv': {
      'accessDenied': 'Truy cập bị từ chối cho khóa cấu hình "{{key}}" - yêu cầu vai trò {{requiredRole}}',
      'alertThresholdsRetrieveFailed': 'Không thể truy xuất ngưỡng cảnh báo: {{reason}}',
      'auditConfigsRetrieveFailed': 'Không thể truy xuất cấu hình audit: {{reason}}',
      'batchUpdateFailed': 'Cập nhật hàng loạt thất bại cho {{failedCount}} trong số {{totalCount}} cấu hình',
      'batchUpdateFailed_other': 'Cập nhật hàng loạt thất bại cho {{failedCount}} trong số {{totalCount}} cấu hình',
      'cacheClearFailed': 'Không thể xóa cache cấu hình: {{reason}}',
      'cacheFailed': 'Không thể cập nhật cache cấu hình: {{reason}}',
      'complianceSettingsRetrieveFailed': 'Không thể truy xuất cài đặt tuân thủ: {{reason}}',
      'configResetFailed': 'Không thể đặt lại cấu hình "{{key}}": {{reason}}',
      'configRetrieveFailed': 'Không thể truy xuất cấu hình "{{key}}": {{reason}}',
      'configsCompareFailed': 'Không thể truy xuất so sánh môi trường: {{reason}}',
      'configsRetrieveFailed': 'Không thể truy xuất cấu hình: {{reason}}',
      'configUpdateFailed': 'Không thể cập nhật cấu hình "{{key}}": {{reason}}',
      'exportSettingsRetrieveFailed': 'Không thể truy xuất cài đặt xuất dữ liệu: {{reason}}',
      'featureFlagsRetrieveFailed': 'Không thể truy xuất cờ tính năng: {{reason}}',
      'featureNotFound': 'Không tìm thấy tính năng hoặc không được phép',
      'featureToggleFailed': 'Không thể chuyển đổi tính năng "{{feature}}": {{reason}}',
      'invalidFeatureValue': 'Giá trị tính năng không hợp lệ - phải là boolean',
      'invalidKey': 'Khóa cấu hình "{{key}}" không được phép',
      'keyNotFound': 'Không tìm thấy khóa cấu hình "{{key}}"',
      'performanceSettingsRetrieveFailed': 'Không thể truy xuất cài đặt hiệu suất: {{reason}}',
      'realtimeSettingsRetrieveFailed': 'Không thể truy xuất cài đặt giám sát thời gian thực: {{reason}}',
      'resetFailed': 'Reset cấu hình "{{key}}" thất bại',
      'retentionPoliciesRetrieveFailed': 'Không thể truy xuất chính sách lưu trữ: {{reason}}',
      'updateFailed': 'Cập nhật cấu hình "{{key}}" thất bại',
      'valueInvalid': 'Giá trị không hợp lệ cho cấu hình "{{key}}": mong đợi {{expectedType}}, nhận được {{actualType}}'
    },
    'kvAdmin': {
      'alertThresholdsRetrieveFailed': 'Không thể truy xuất ngưỡng cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'auditConfigsRetrieveFailed': 'Không thể truy xuất cấu hình audit cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'cacheClearFailed': 'Không thể xóa cache cấu hình KV cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'complianceSettingsRetrieveFailed': 'Không thể truy xuất cài đặt tuân thủ cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'configResetFailed': 'Không thể reset cấu hình KV {{key}} cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'configRetrieveFailed': 'Không thể truy xuất cấu hình KV {{key}} cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'configsCompareFailed': 'Không thể so sánh cấu hình ENV và KV cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'configsRetrieveFailed': 'Không thể truy xuất cấu hình KV cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'configUpdateFailed': 'Không thể cập nhật cấu hình KV {{key}} cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'exportSettingsRetrieveFailed': 'Không thể truy xuất cài đặt xuất dữ liệu cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'featureFlagsRetrieveFailed': 'Không thể truy xuất cờ tính năng cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'featureToggleFailed': 'Không thể bật/tắt tính năng {{feature}} cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'performanceSettingsRetrieveFailed': 'Không thể truy xuất cài đặt hiệu năng cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'realtimeSettingsRetrieveFailed': 'Không thể truy xuất cài đặt thời gian thực cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
      'retentionPoliciesRetrieveFailed': 'Không thể truy xuất chính sách lưu trữ cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})'
    },
    'network': {
      'apiError': 'Lỗi API bên ngoài từ [{{apiName}}]: {{error}}',
      'bandwidthExceeded': 'Vượt quá giới hạn băng thông: {{usage, number}}MB/{{limit, number}}MB',
      'connectionFailed': 'Kết nối thất bại đến {{service, uppercase}}: {{reason}}',
      'connectionRefused': 'Kết nối bị từ chối bởi {{service}} trên cổng {{port}}',
      'dnsResolutionFailed': 'Phân giải DNS thất bại cho [{{hostname}}]',
      'hostUnreachable': 'Máy chủ [{{hostname}}] không thể truy cập',
      'httpError': 'Lỗi HTTP {{statusCode}}: {{statusMessage}}',
      'protocolError': 'Lỗi giao thức mạng: {{protocol}} - {{details}}',
      'proxyError': 'Lỗi máy chủ proxy: {{proxyAddress}} - {{reason}}',
      'slowResponse': 'Phát hiện phản hồi chậm từ {{service}} ({{duration, number}}ms)',
      'socketError': 'Lỗi kết nối socket: {{details}}',
      'sslError': 'Lỗi kết nối SSL/TLS: {{details}}',
      'timeout': 'Hết thời gian chờ yêu cầu mạng sau {{duration, number}}ms đến {{service}}',
      'webhookFailed': 'Gửi webhook thất bại đến {{url}}: {{reason}}'
    },
    'realtimeMonitoring': {
      'alerts': {
        'channelsFailed': 'Không thể truy xuất kênh cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'createChannelFailed': 'Không thể tạo kênh cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'createRuleFailed': 'Không thể tạo quy tắc cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'historyFailed': 'Không thể truy xuất lịch sử cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'rulesFailed': 'Không thể truy xuất quy tắc cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'sendFailed': 'Không thể gửi cảnh báo thủ công cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'statusFailed': 'Không thể truy xuất trạng thái hệ thống cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'testFailed': 'Không thể test hệ thống cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'toggleFailed': 'Không thể bật/tắt quy tắc cảnh báo [#{{ruleId}}] cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})'
      },
      'alertsConfig': {
        'configFailed': 'Không thể cấu hình cảnh báo cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})'
      },
      'dashboard': {
        'cacheClearFailed': 'Không thể xóa cache dashboard do lỗi máy chủ',
        'exportFailed': 'Không thể xuất dashboard do lỗi máy chủ',
        'healthCheckFailed': 'Không thể kiểm tra sức khỏe dashboard do lỗi máy chủ',
        'overviewFailed': 'Không thể truy xuất tổng quan dashboard cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'performanceFailed': 'Không thể truy xuất dashboard hiệu năng do lỗi máy chủ',
        'realtimeFailed': 'Không thể truy xuất dashboard thời gian thực cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'securityFailed': 'Không thể truy xuất dashboard bảo mật cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'timelineFailed': 'Không thể truy xuất timeline dashboard cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})'
      },
      'incidents': {
        'createFailed': 'Không thể tạo sự cố giám sát thời gian thực cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})'
      },
      'monitoring': {
        'eventsFailed': 'Không thể truy xuất sự kiện giám sát gần đây cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'simulateFailed': 'Không thể mô phỏng sự kiện giám sát cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'startFailed': 'Không thể bắt đầu giám sát cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'statusFailed': 'Không thể truy xuất trạng thái giám sát cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'stopFailed': 'Không thể dừng giám sát cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})'
      },
      'threats': {
        'analyzeFailed': 'Không thể phân tích mối đe dọa cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'resolveFailed': 'Không thể giải quyết mối đe dọa [#{{threatId}}] cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})',
        'retrieveFailed': 'Không thể truy xuất trạng thái mối đe dọa cho {{actor}} (Lý do: {{reason}}, Thao tác: {{operation}})'
      }
    },
    'security': {
      'incident': {
        'notFound': 'Không tìm thấy sự cố bảo mật ([#{{incidentId}}], Thao tác: {{operation}}, Được yêu cầu bởi: {{requestedBy}})'
      },
      'incidents': {
        'createFailed': 'Không thể tạo sự cố bảo mật do lỗi máy chủ.',
        'responseExecuteFailed': 'Không thể thực thi phản hồi thủ công cho sự cố bảo mật do lỗi máy chủ.',
        'retrieveDetailFailed': 'Không thể truy xuất chi tiết sự cố bảo mật do lỗi máy chủ.',
        'retrieveFailed': 'Không thể truy xuất sự cố bảo mật do lỗi máy chủ.',
        'simulationFailed': 'Không thể mô phỏng mối đe dọa bảo mật do lỗi máy chủ.',
        'simulationNotAllowed': 'Không cho phép mô phỏng bảo mật trong môi trường {{environment}} (Được yêu cầu bởi: {{requestedBy}}, Lý do: {{reason}})',
        'statusUpdateFailed': 'Không thể cập nhật trạng thái sự cố bảo mật do lỗi máy chủ.'
      },
      'monitoring': {
        'alreadyRunning': 'Giám sát bảo mật đã đang chạy'
      },
      'service': {
        'statusRetrieveFailed': 'Không thể truy xuất trạng thái dịch vụ bảo mật do lỗi máy chủ.'
      },
      'statistics': {
        'retrieveFailed': 'Không thể truy xuất thống kê sự cố do lỗi máy chủ.'
      }
    },
    'system': {
      'cacheError': 'Thao tác cache thất bại: {{operation}} - {{error}}',
      'configurationError': 'Lỗi cấu hình hệ thống: {{setting}} - {{error}}',
      'databaseConnectionFailed': 'Không thể kết nối đến cơ sở dữ liệu: {{reason}}',
      'databaseError': 'Thao tác cơ sở dữ liệu thất bại: {{operation}} - {{error}}',
      'databaseTimeout': 'Hết thời gian chờ truy vấn cơ sở dữ liệu sau {{timeout, number}}ms',
      'dependencyFailure': 'Thất bại phụ thuộc bên ngoài: {{service}} - {{reason}}',
      'diskSpaceLow': 'Dung lượng đĩa cực kỳ thấp: còn lại {{freeSpace, number}}GB',
      'licenseExpired': 'Giấy phép hệ thống đã hết hạn vào {{expiredDate, date}}',
      'licenseInvalid': 'Giấy phép hệ thống không hợp lệ: {{reason}}',
      'maintenanceMode': 'Hệ thống đang bảo trì đến {{endTime, datetime}} - {{message}}',
      'memoryExhausted': 'Sử dụng bộ nhớ máy chủ nghiêm trọng: {{currentUsage, number}}MB / {{maxMemory, number}}MB',
      'operationFailed': 'Thao tác hệ thống "{{operation}}" thất bại: {{reason}}',
      'rateLimited': 'Hệ thống tạm thời bị giới hạn tần suất: {{currentRequests}}/{{maxRequests}} yêu cầu trong {{timeWindow}}',
      'resourceExhausted': 'Tài nguyên hệ thống cạn kiệt: {{resource}} ở {{usage, number}}% công suất',
      'serverError': 'Đã xảy ra lỗi máy chủ nội bộ',
      'serviceUnavailable': 'Dịch vụ tạm thời không khả dụng: {{reason}}',
      'taskQueueFull': 'Hàng đợi tác vụ đã đầy ({{currentTasks}}/{{maxTasks}} tác vụ)',
      'workerUnavailable': 'Không có worker khả dụng để xử lý yêu cầu'
    },
    'user': {
      'accountLocked': 'Tài khoản người dùng [{{userName}}] bị khóa do {{reason}}',
      'accountSuspended': 'Tài khoản người dùng [{{userName}}] bị đình chỉ đến {{suspendedUntil, datetime}}',
      'activationFailed': 'Không thể kích hoạt tài khoản người dùng cho [{{userName}}]: {{reason}}',
      'bulkOperationFailed': 'Thao tác hàng loạt thất bại cho {{failedCount}} trong số {{totalCount}} người dùng',
      'bulkOperationFailed_other': 'Thao tác hàng loạt thất bại cho {{failedCount}} trong số {{totalCount}} người dùng',
      'createFailed': 'Tạo tài khoản người dùng thất bại cho {{email}}',
      'deactivationFailed': 'Không thể vô hiệu hóa tài khoản người dùng cho [{{userName}}]: {{reason}}',
      'deleteFailed': 'Không thể xóa người dùng [{{userName}}]: {{reason}}',
      'emailExists': 'Email {{email}} đã tồn tại trong hệ thống',
      'emailVerificationFailed': 'Xác minh email thất bại: {{reason}}',
      'emailVerificationSystemError': 'Không thể xác minh việc thay đổi email do lỗi hệ thống. Vui lòng thử lại sau.',
      'inactive': 'Tài khoản người dùng [{{userName}}] đang ở trạng thái không hoạt động',
      'insufficientPermissions': 'Không đủ quyền để sửa đổi người dùng [{{userName}}] ({{userRole}})',
      'listFailed': 'Không thể truy xuất danh sách người dùng: {{reason}}',
      'notFound': 'Không tìm thấy người dùng [{{userName}}]',
      'notFoundById': 'Không tìm thấy người dùng có [#{{userId}}]',
      'passwordChangeFailed': 'Thay đổi mật khẩu thất bại cho [{{userName}}]. {{reason}}',
      'passwordIncorrect': 'Mật khẩu hiện tại không chính xác',
      'profileRetrieveFailed': 'Không thể truy xuất thông tin cá nhân cho [{{userName}}]. {{reason}}',
      'registrationError': 'Đăng ký thất bại do lỗi hệ thống. {{details}}',
      'registrationFailed': 'Đăng ký người dùng thất bại: {{reason}}',
      'roleChangeFailed': 'Không thể thay đổi vai trò cho [{{userName}}] từ {{oldRole}} thành {{newRole}}: {{reason}}',
      'sessionLimitExceeded': 'Người dùng [{{userName}}] đã vượt quá số phiên đồng thời tối đa ({{currentSessions}}/{{maxSessions}})',
      'updateFailed': 'Cập nhật thông tin cá nhân thất bại cho [{{userName}}]. {{reason}}',
      'usernameExists': 'Tên người dùng "[{{username}}]" đã được sử dụng'
    },
    'zodDemo': {
      'file': {
        'uploadFailed': 'Tải file thất bại - {{actor}} không thể hoàn thành {{operation}} cho "[{{fileName}}]" ({{fileSize}} bytes): {{reason}}'
      },
      'search': {
        'failed': 'Thao tác tìm kiếm thất bại - {{actor}} không thể hoàn thành {{operation}} cho truy vấn "{{query}}" ({{searchType}}): {{reason}}'
      },
      'user': {
        'registrationFailed': 'Đăng ký người dùng thất bại - {{actor}} không thể hoàn thành {{operation}} cho [{{userName}}] ({{email}}): {{reason}}'
      }
    },
    'businessRuleViolation': 'Vi phạm quy tắc kinh doanh: {{rules}}',
    'constraintViolation': 'Vi phạm ràng buộc cơ sở dữ liệu: {{constraint}}',
    'dataIntegrityError': 'Lỗi tính toàn vẹn dữ liệu: {{details}}',
    'schemaViolation': 'Vi phạm schema dữ liệu: {{violations}}',
    'validation': 'Lỗi xác thực - {{details}}',
    'validation_other': '{{count}} lỗi xác thực - {{details}}',
    'validationField': 'Xác thực thất bại cho trường "{{field}}": {{error}}',
    'validationGeneric': 'Lỗi xác thực',
    'validationMultiple': 'Nhiều lỗi xác thực trong {{count}} trường',
    'validationMultiple_other': 'Nhiều lỗi xác thực trong {{count}} trường'
  },
  'formatting': {
    'currency': 'Tổng cộng: {{amount, currency}}',
    'dateRange': 'Từ {{startDate, date}} đến {{endDate, date}}',
    'filesSize': '{{count}} tệp có kích thước {{size, number}} byte',
    'filesSize_other': '{{count}} tệp với tổng kích thước {{size, number}} byte',
    'percentage': 'Tiến độ: {{value, number}}%',
    'timeAgo': '{{time, time}} trước'
  },
  'numbers': {
    'count': '{{value, number}}',
    'currency': '{{value, number}}₫',
    'percentage': '{{value}}%'
  },
  'roles': {
    'displayName': 'Vai trò',
    'displayName_context_admin': 'Quản trị viên',
    'displayName_context_super_admin': 'Siêu quản trị viên',
    'displayName_context_user': 'Người dùng'
  },
  'security': {
    'alerts': {
      'alertTemplate': 'Cảnh báo: [{{name}}] - {{eventType}}',
      'channelCreated': 'Tạo kênh cảnh báo thành công',
      'channelsFailed': 'Không thể truy xuất kênh cảnh báo',
      'createChannelFailed': 'Không thể tạo kênh cảnh báo',
      'createRuleFailed': 'Không thể tạo quy tắc cảnh báo',
      'historyFailed': 'Không thể truy xuất lịch sử cảnh báo',
      'manualSent': 'Gửi cảnh báo thủ công thành công',
      'ruleCreated': 'Tạo quy tắc cảnh báo thành công',
      'rulesFailed': 'Không thể truy xuất quy tắc cảnh báo',
      'ruleToggled': 'Chuyển đổi quy tắc cảnh báo thành công',
      'ruleToggledTestMode': 'Chuyển đổi quy tắc thành công (chế độ thử nghiệm)',
      'sendFailed': 'Không thể gửi cảnh báo thủ công',
      'statusFailed': 'Không thể truy xuất trạng thái hệ thống cảnh báo',
      'testCompleted': 'Hoàn thành kiểm tra hệ thống cảnh báo',
      'testFailed': 'Không thể kiểm tra hệ thống cảnh báo',
      'toggleFailed': 'Không thể chuyển đổi quy tắc cảnh báo'
    }
  },
  'success': {
    'admin': {
      'backupCompleted': 'Sao lưu hệ thống đã hoàn thành thành công ({{backupSize, number}}MB trong {{duration, number}}s)',
      'backupRestored': 'Sao lưu hệ thống đã được khôi phục thành công từ {{backupDate, date}}',
      'cacheCleared': 'Cache hệ thống đã được xóa thành công - {{freedMemory, number}}MB đã giải phóng',
      'configurationUpdated': 'Cấu hình hệ thống đã được cập nhật thành công - {{changedSettings}} cài đặt đã sửa đổi',
      'configurationUpdated_other': 'Cấu hình hệ thống đã được cập nhật thành công - {{changedSettings}} cài đặt đã sửa đổi',
      'databaseOptimized': 'Tối ưu hóa cơ sở dữ liệu đã hoàn thành - {{optimizedTables}} bảng đã xử lý',
      'databaseOptimized_other': 'Tối ưu hóa cơ sở dữ liệu đã hoàn thành - {{optimizedTables}} bảng đã xử lý',
      'logRotationCompleted': 'Xoay vòng nhật ký đã hoàn thành - {{archivedLogs}} tệp nhật ký đã lưu trữ',
      'logRotationCompleted_other': 'Xoay vòng nhật ký đã hoàn thành - {{archivedLogs}} tệp nhật ký đã lưu trữ',
      'maintenanceCompleted': 'Bảo trì hệ thống đã hoàn thành thành công - thời gian ngừng hoạt động: {{downtimeDuration}}',
      'maintenanceScheduled': 'Bảo trì hệ thống đã được lên lịch cho {{maintenanceDate, date}} lúc {{maintenanceTime, time}}',
      'reportCreated': 'Báo cáo quản trị đã được tạo với {{recordCount, number}} bản ghi',
      'reportCreated_other': 'Báo cáo quản trị đã được tạo với {{recordCount, number}} bản ghi',
      'securityScanCompleted': 'Quét bảo mật đã hoàn thành - {{threatsFound}} mối đe dọa đã phát hiện',
      'securityScanCompleted_other': 'Quét bảo mật đã hoàn thành - {{threatsFound}} mối đe dọa đã phát hiện',
      'serviceRestarted': 'Dịch vụ hệ thống [{{serviceName}}] đã được khởi động lại thành công',
      'statsGenerated': 'Thống kê hệ thống đã được tạo thành công cho giai đoạn {{period}} - {{dataPoints}} điểm dữ liệu',
      'statsGenerated_other': 'Thống kê hệ thống đã được tạo thành công cho giai đoạn {{period}} - {{dataPoints}} điểm dữ liệu',
      'systemHealthy': 'Kiểm tra sức khỏe hệ thống đã hoàn thành: {{status, uppercase}} ({{uptime, number}}% thời gian hoạt động)',
      'userDetailsRetrieved': 'Chi tiết người dùng: [{{userName}}] ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}'
    },
    'advancedAudit': {
      'analytics': {
        'retrieved': 'Phân tích kiểm toán nâng cao được truy xuất thành công'
      },
      'archival': {
        'restoreCompleted': 'Khôi phục lưu trữ hoàn tất thành công với {{restoredCount}} bản ghi được khôi phục và {{skippedCount}} bị bỏ qua',
        'runCompleted': 'Quy trình lưu trữ hoàn tất thành công với {{archivedCount}} bản ghi đã lưu trữ và {{remainingCount}} còn lại',
        'statsRetrieved': 'Thống kê lưu trữ được truy xuất thành công'
      },
      'behavior': {
        'analyzed': 'Phân tích hành vi người dùng hoàn tất thành công'
      },
      'compliance': {
        'generated': 'Báo cáo tuân thủ kiểm toán được tạo thành công'
      },
      'performance': {
        'analyzed': 'Phân tích hiệu năng kiểm toán hoàn tất thành công'
      },
      'security': {
        'analyzed': 'Phân tích bảo mật kiểm toán hoàn tất thành công'
      }
    },
    'auditMessages': {
      'exported': 'Xuất log audit thành công',
      'healthRetrieved': 'Lấy trạng thái sức khỏe hệ thống audit thành công',
      'retrieved': 'Lấy thông điệp audit thành công',
      'searchCompleted': 'Tìm kiếm audit hoàn tất thành công với {{resultCount}} kết quả',
      'searchCompleted_other': 'Tìm kiếm audit hoàn tất thành công với {{resultCount}} kết quả',
      'statsRetrieved': 'Lấy thống kê audit thành công'
    },
    'auth': {
      'accessGranted': 'Quyền truy cập đã được cấp cho {{resource}} cho [{{userName}}]',
      'accountUnlocked': 'Tài khoản [{{userName}}] đã được mở khóa thành công bởi {{unlockedBy}}',
      'loginSuccess': 'Đăng nhập thành công với tư cách [{{userName}}] ({{userRole}}) lúc {{loginTime}}',
      'logoutAllSuccess': 'Đăng xuất khỏi mọi thiết bị lúc {{logoutTime}}',
      'logoutSuccess': 'Đăng xuất thành công từ {{deviceInfo}} lúc {{logoutTime}}',
      'mfaEnabled': 'Xác thực đa yếu tố đã được bật thành công cho [{{userName}}]',
      'mfaVerified': 'Xác thực đa yếu tố đã được xác minh thành công',
      'passwordChanged': 'Mật khẩu đã được thay đổi thành công cho [{{userName}}]',
      'passwordReset': 'Email đặt lại mật khẩu đã được gửi đến {{email}} - hết hạn sau {{expiryMinutes}} phút',
      'passwordReset_other': 'Email đặt lại mật khẩu đã được gửi đến {{email}} - hết hạn sau {{expiryMinutes}} phút',
      'permissionGranted': 'Quyền "{{permission}}" đã được cấp cho [{{userName}}]',
      'rateLimitReset': 'Giới hạn tần suất đã được đặt lại thành công cho {{ipAddress}}',
      'roleAssigned': 'Vai trò {{newRole}} đã được gán thành công cho [{{userName}}] bởi {{assignedBy}}',
      'sessionCreated': 'Phiên người dùng mới đã được tạo với thời hạn {{sessionDuration}} phút',
      'sessionCreated_other': 'Phiên người dùng mới đã được tạo với thời hạn {{sessionDuration}} phút',
      'sessionExtended': 'Phiên người dùng đã được gia hạn đến {{newExpiry}}',
      'tokenGenerated': 'Token truy cập mới đã được tạo - hết hạn lúc {{expiryTime}}',
      'tokenRefreshed': 'Token xác thực đã được làm mới thành công lúc {{refreshTime}}'
    },
    'business': {
      'auditPassed': 'Kiểm toán kinh doanh đã vượt qua với điểm {{auditScore, number}}% - {{criteriaCount}} tiêu chí đã đạt',
      'auditPassed_other': 'Kiểm toán kinh doanh đã vượt qua với điểm {{auditScore, number}}% - {{criteriaCount}} tiêu chí đã đạt',
      'complianceVerified': 'Xác minh tuân thủ đã hoàn thành - {{standardsCount}} tiêu chuẩn đã được xác minh',
      'complianceVerified_other': 'Xác minh tuân thủ đã hoàn thành - {{standardsCount}} tiêu chuẩn đã được xác minh',
      'operationApproved': 'Thao tác kinh doanh "{{operation}}" đã được phê duyệt bởi {{approvedBy}}',
      'processAutomated': 'Quy trình kinh doanh đã được tự động hóa thành công - {{automatedTasks}} tác vụ đã tự động hóa',
      'processAutomated_other': 'Quy trình kinh doanh đã được tự động hóa thành công - {{automatedTasks}} tác vụ đã tự động hóa',
      'ruleApplied': 'Quy tắc kinh doanh "[{{ruleName}}]" đã được áp dụng thành công cho {{affectedRecords}} bản ghi',
      'ruleApplied_other': 'Quy tắc kinh doanh "[{{ruleName}}]" đã được áp dụng thành công cho {{affectedRecords}} bản ghi',
      'validationPassed': 'Xác thực kinh doanh đã vượt qua cho {{entityType}} - tất cả {{checkCount}} kiểm tra đều thành công',
      'validationPassed_other': 'Xác thực kinh doanh đã vượt qua cho {{entityType}} - tất cả {{checkCount}} kiểm tra đều thành công',
      'workflowCompleted': 'Luồng công việc "[{{workflowName}}]" đã hoàn thành thành công trong {{steps}} bước',
      'workflowCompleted_other': 'Luồng công việc "[{{workflowName}}]" đã hoàn thành thành công trong {{steps}} bước'
    },
    'file': {
      'backup': 'Sao lưu tệp đã được tạo thành công cho "[{{filename}}]"',
      'compressed': 'Tệp đã được nén thành công - kích thước giảm {{compressionRatio, number}}%',
      'converted': 'Tệp đã được chuyển đổi thành công từ {{sourceFormat}} thành {{targetFormat}}',
      'copied': 'Tệp đã được sao chép thành công đến {{destinationPath}}',
      'deleted': 'Tệp "[{{filename}}]" đã được xóa thành công',
      'downloadCompleted': 'Tệp "[{{filename}}]" đã được tải xuống thành công',
      'extracted': 'Kho lưu trữ đã được giải nén thành công - {{extractedCount}} tệp đã giải nén',
      'extracted_other': 'Kho lưu trữ đã được giải nén thành công - {{extractedCount}} tệp đã giải nén',
      'moved': 'Tệp đã được di chuyển thành công từ {{sourcePath}} đến {{destinationPath}}',
      'processingCompleted': 'Xử lý tệp đã hoàn thành cho "[{{filename}}]" - {{operationsCount}} thao tác đã thực hiện',
      'processingCompleted_other': 'Xử lý tệp đã hoàn thành cho "[{{filename}}]" - {{operationsCount}} thao tác đã thực hiện',
      'restored': 'Tệp đã được khôi phục thành công từ bản sao lưu được tạo vào {{backupDate, date}}',
      'uploadCompleted': 'Tệp "[{{filename}}]" đã được tải lên thành công ({{fileSize}})',
      'uploadsBatch': 'Tải lên hàng loạt đã hoàn thành: {{successCount}}/{{totalCount}} tệp đã xử lý',
      'uploadsBatch_other': 'Tải lên hàng loạt đã hoàn thành: {{successCount}}/{{totalCount}} tệp đã xử lý',
      'validated': 'Xác thực tệp đã vượt qua cho "[{{filename}}]" - định dạng: {{fileFormat}}'
    },
    'integration': {
      'apiCall': 'Cuộc gọi API đến [{{serviceName}}] đã hoàn thành thành công trong {{responseTime, number}}ms',
      'credentialsValidated': 'Thông tin xác thực API đã được xác thực thành công cho [{{serviceName}}]',
      'dataSync': 'Đồng bộ hóa dữ liệu đã hoàn thành với [{{serviceName}}] - {{syncedRecords}} bản ghi đã xử lý',
      'dataSync_other': 'Đồng bộ hóa dữ liệu đã hoàn thành với [{{serviceName}}] - {{syncedRecords}} bản ghi đã xử lý',
      'dataTransform': 'Chuyển đổi dữ liệu đã hoàn thành - {{transformedRecords}} bản ghi đã xử lý',
      'dataTransform_other': 'Chuyển đổi dữ liệu đã hoàn thành - {{transformedRecords}} bản ghi đã xử lý',
      'healthCheckPassed': 'Kiểm tra sức khỏe dịch vụ bên ngoài đã vượt qua cho [{{serviceName}}]',
      'rateLimit': 'Trạng thái giới hạn tần suất API: {{usedRequests}}/{{maxRequests}} yêu cầu còn lại',
      'serviceConnected': 'Đã kết nối thành công đến [{{serviceName}}] - trạng thái: {{serviceStatus}}',
      'subscriptionActive': 'Đăng ký dịch vụ đang hoạt động cho [{{serviceName}}] đến {{expiryDate, date}}',
      'webhookDelivered': 'Webhook đã được gửi thành công đến {{webhookUrl}} - trạng thái: {{deliveryStatus}}'
    },
    'kv': {
      'configs': {
        'comparisonRetrieved': 'So sánh môi trường đã được truy xuất bởi {{actor}} - KV: {{kvCount}}, ENV: {{envCount}}, Mặc định: {{defaultCount}}',
        'configRetrieved': 'Cấu hình "{{key}}" đã được truy xuất bởi {{actor}}: {{value}} (mặc định: {{isDefault}})',
        'defaultsRetrieved': 'Cấu hình mặc định đã được truy xuất bởi {{actor}} ({{keyCount}} khóa)',
        'retrieved': 'Đã truy xuất thành công {{configCount}} cấu hình bởi {{actor}} ({{allowedKeys}} khóa được phép)'
      },
      'rateLimit': {
        'listed': 'Đã lấy danh sách giới hạn tần suất: tìm thấy {{count}} khóa',
        'batchDeleteDryRun': 'Chạy thử xóa hàng loạt giới hạn tần suất: {{count}} khóa sẽ bị xóa ({{failed}} thất bại)',
        'batchDeleted': 'Xóa hàng loạt giới hạn tần suất: {{count}} khóa đã bị xóa ({{failed}} thất bại)',
        'cleanDryRun': 'Chạy thử dọn dẹp giới hạn tần suất: {{count}} khóa sẽ bị xóa (tiền tố: {{prefix}})',
        'cleaned': 'Đã dọn dẹp giới hạn tần suất: {{count}} khóa đã bị xóa (tiền tố: {{prefix}})',
        'pruneDryRun': 'Chạy thử cắt tỉa giới hạn tần suất: {{count}} khóa sẽ bị xóa (tiền tố: {{prefix}})',
        'pruned': 'Đã cắt tỉa giới hạn tần suất: {{count}} khóa đã bị xóa (tiền tố: {{prefix}})',
        'seeded': 'Đã gieo giới hạn tần suất: {{count}} khóa đã được tạo (tiền tố: {{prefix}})'
      },
      'status': {
        'disabled': 'được tắt',
        'enabled': 'được bật'
      },
      'adminCacheCleared': 'Cache cấu hình đã được xóa bởi {{actor}}',
      'adminConfigReset': 'Cấu hình "{{key}}" đã được đặt lại về mặc định bởi {{actor}} - trước: {{oldValue}}, giờ: {{defaultValue}}',
      'adminConfigUpdated': 'Cấu hình "{{key}}" đã được cập nhật bởi {{actor}} từ {{oldValue}} thành {{newValue}}',
      'adminFeatureToggled': 'Tính năng "{{feature}}" đã được chuyển đổi bởi {{actor}}: {{previousValue}} → {{newValue}}',
      'auditConfigsRetrieved': 'Cấu hình audit đã được truy xuất bởi {{actor}} ({{configCount}} cấu hình)',
      'auditPerformanceRetrieved': 'Cài đặt hiệu suất audit đã được truy xuất bởi {{actor}} ({{settingCount}} cài đặt)',
      'auditRetentionRetrieved': 'Chính sách lưu trữ audit đã được truy xuất bởi {{actor}} ({{policyCount}} chính sách)',
      'backupCreated': 'Sao lưu cấu hình đã được tạo thành công với {{configCount}} cài đặt',
      'backupCreated_other': 'Sao lưu cấu hình đã được tạo thành công với {{configCount}} cài đặt',
      'batchConfigUpdated': 'Cập nhật cấu hình hàng loạt bởi {{actor}}: {{updatedCount}}/{{totalCount}} đã cập nhật ({{failedCount}} thất bại)',
      'batchUpdateCompleted': 'Cập nhật cấu hình hàng loạt đã hoàn thành: {{successCount}}/{{totalCount}} thành công',
      'cacheCleared': 'Cache cấu hình đã được xóa thành công - {{clearedCount}} mục đã xóa',
      'cacheCleared_other': 'Cache cấu hình đã được xóa thành công - {{clearedCount}} mục đã xóa',
      'configReset': 'Cấu hình "{{key}}" đã được đặt lại về giá trị mặc định: {{defaultValue}}',
      'configRetrieved': 'Cấu hình "{{key}}" đã được truy xuất thành công: {{value}}',
      'configUpdated': 'Cấu hình "{{key}}" đã được cập nhật thành công từ {{oldValue}} thành {{newValue}}',
      'defaultsRestored': 'Cấu hình mặc định đã được khôi phục thành công cho {{restoredCount}} khóa',
      'defaultsRestored_other': 'Cấu hình mặc định đã được khôi phục thành công cho {{restoredCount}} khóa',
      'featureToggled': 'Tính năng "{{feature}}" {{status}} thành công'
    },
    'operation': {
      'batchProcessed': 'Thao tác hàng loạt đã hoàn thành: {{successCount}}/{{totalCount}} mục đã xử lý thành công',
      'completed': 'Thao tác "{{operationType}}" đã hoàn thành thành công trong {{duration}}ms',
      'completed_other': '{{count}} thao tác đã hoàn thành thành công - thời gian trung bình: {{avgDuration}}ms',
      'taskFinished': 'Nhiệm vụ "[{{taskName}}]" đã hoàn thành thành công với {{resultCount}} kết quả',
      'taskFinished_other': 'Nhiệm vụ "[{{taskName}}]" đã hoàn thành thành công với {{resultCount}} kết quả',
      'workflowCompleted': 'Quy trình làm việc đã hoàn thành thành công - {{stepsCount}} bước đã thực hiện',
      'workflowCompleted_other': 'Quy trình làm việc đã hoàn thành thành công - {{stepsCount}} bước đã thực hiện'
    },
    'realtimeIncidents': {
      'created': 'Sự cố giám sát thời gian thực [#{{incidentId}}] được tạo thành công'
    },
    'realtimeMonitoring': {
      'alerts': {
        'configUpdated': 'Cấu hình cảnh báo được cập nhật thành công',
        'historyRetrieved': 'Lịch sử cảnh báo được truy xuất thành công',
        'manualSent': 'Gửi cảnh báo thủ công thành công',
        'ruleCreated': 'Tạo quy tắc cảnh báo thành công',
        'rulesRetrieved': 'Quy tắc cảnh báo được truy xuất thành công',
        'ruleToggled': 'Chuyển trạng thái quy tắc cảnh báo thành công',
        'statusRetrieved': 'Trạng thái hệ thống cảnh báo được truy xuất thành công'
      },
      'dashboard': {
        'cacheCleared': 'Đã xóa cache dashboard thời gian thực thành công',
        'liveRetrieved': 'Ảnh chụp dashboard trực tiếp được truy xuất thành công',
        'overviewRetrieved': 'Tổng quan dashboard giám sát thời gian thực được truy xuất thành công',
        'realtimeRetrieved': 'Dữ liệu dashboard thời gian thực được truy xuất thành công'
      },
      'incidents': {
        'created': 'Đã tạo thành công sự cố giám sát thời gian thực [#{{incidentId}}]'
      },
      'monitoring': {
        'analysisCompleted': 'Phân tích giám sát thời gian thực hoàn tất thành công',
        'eventSimulated': 'Sự kiện giám sát {{eventType}} được mô phỏng thành công',
        'eventsRetrieved': 'Sự kiện giám sát gần đây được truy xuất thành công',
        'started': 'Giám sát thời gian thực đã được bắt đầu thành công',
        'stopped': 'Giám sát thời gian thực đã được dừng thành công',
        'threatResolved': 'Mối đe dọa thời gian thực [#{{threatId}}] đã được xử lý thành công',
        'threatsRetrieved': 'Trạng thái mối đe dọa thời gian thực được truy xuất thành công'
      }
    },
    'search': {
      'completed': 'Tìm kiếm hoàn tất thành công với {{resultCount}} kết quả',
      'completed_other': 'Tìm kiếm hoàn tất thành công với {{resultCount}} kết quả'
    },
    'security': {
      'incident': {
        'created': '{{actor}} đã tạo sự cố bảo mật "{{title}}" với mức độ {{severity}} ([#{{incidentId}}], Loại: {{type}})',
        'responseExecuted': '{{actor}} đã thực hiện {{actionCount}} hành động phản hồi cho sự cố [#{{incidentId}}] (Loại: {{actionType}}) lúc {{executedAt}}',
        'retrieved': '{{actor}} đã lấy chi tiết sự cố [#{{incidentId}}] (Trạng thái: {{status}}, Mức độ: {{severity}}, Tạo lúc: {{createdAt}})',
        'statusUpdated': '{{actor}} đã cập nhật trạng thái sự cố [#{{incidentId}}] từ "{{oldStatus}}" thành "{{newStatus}}" lúc {{timestamp}}'
      },
      'incidents': {
        'created': '{{actor}} đã tạo sự cố bảo mật "{{title}}" với mức độ {{severity}} ([#{{incidentId}}], Loại: {{type}})',
        'responseExecuted': '{{actor}} đã thực hiện {{actionCount}} hành động phản hồi cho sự cố [#{{incidentId}}] (Loại: {{actionType}}) lúc {{executedAt}}',
        'retrieved': '{{actor}} đã lấy thành công {{incidentCount}} sự cố bảo mật (trang {{page}}, giới hạn {{limit}}, bộ lọc: {{filters}})',
        'statusUpdated': '{{actor}} đã cập nhật trạng thái sự cố [#{{incidentId}}] từ "{{oldStatus}}" thành "{{newStatus}}" lúc {{timestamp}}'
      },
      'monitoring': {
        'started': 'Bắt đầu giám sát thời gian thực thành công'
      },
      'service': {
        'statusRetrieved': '{{actor}} đã lấy trạng thái dịch vụ: sức khỏe {{serviceHealth}}, phiên bản {{version}}, thời gian hoạt động {{uptime}} (Kiểm tra lúc: {{checkedAt}})'
      },
      'simulation': {
        'completed': '{{actor}} đã hoàn thành mô phỏng {{threatType}} với mức độ {{severity}} ([#{{simulationId}}]) lúc {{completedAt}}'
      },
      'statistics': {
        'retrieved': '{{actor}} đã lấy thống kê bảo mật: {{totalIncidents}} tổng, {{activeIncidents}} đang hoạt động, {{resolvedIncidents}} đã giải quyết (Lấy lúc: {{retrievedAt}})'
      }
    },
    'system': {
      'cacheConnected': 'Dịch vụ cache đã kết nối thành công đến {{cacheService}}',
      'configurationLoaded': 'Cấu hình hệ thống đã được tải thành công - {{configCount}} cài đặt',
      'configurationLoaded_other': 'Cấu hình hệ thống đã được tải thành công - {{configCount}} cài đặt',
      'connectionEstablished': 'Kết nối đã được thiết lập thành công đến [{{serviceName}}]',
      'databaseConnected': 'Kết nối cơ sở dữ liệu đã được thiết lập thành công đến [{{databaseName}}]',
      'healthCheckPassed': 'Kiểm tra sức khỏe hệ thống đã vượt qua - tất cả {{componentCount}} thành phần đều khỏe mạnh',
      'healthCheckPassed_other': 'Kiểm tra sức khỏe hệ thống đã vượt qua - tất cả {{componentCount}} thành phần đều khỏe mạnh',
      'operationCompleted': 'Thao tác hệ thống "{{operation}}" đã hoàn thành thành công trong {{duration, number}}ms',
      'queueProcessed': 'Hàng đợi tác vụ đã được xử lý thành công - {{processedCount}} tác vụ đã hoàn thành',
      'queueProcessed_other': 'Hàng đợi tác vụ đã được xử lý thành công - {{processedCount}} tác vụ đã hoàn thành',
      'resourceAllocated': 'Tài nguyên hệ thống đã được phân bổ thành công: {{allocatedMemory, number}}MB bộ nhớ',
      'resourceReleased': 'Tài nguyên hệ thống đã được giải phóng thành công: {{releasedMemory, number}}MB bộ nhớ',
      'rollbackCompleted': 'Khôi phục hệ thống đã hoàn thành thành công về phiên bản {{previousVersion}}',
      'serviceStarted': 'Dịch vụ hệ thống [{{serviceName}}] đã khởi động thành công trên cổng {{port}}',
      'serviceStopped': 'Dịch vụ hệ thống [{{serviceName}}] đã dừng một cách êm thấm',
      'taskCompleted': 'Tác vụ nền [{{taskName}}] đã hoàn thành thành công',
      'taskScheduled': 'Tác vụ nền [{{taskName}}] đã được lên lịch cho {{scheduledTime, datetime}}',
      'upgradeCompleted': 'Nâng cấp hệ thống đã hoàn thành thành công lên phiên bản {{newVersion}}'
    },
    'translations': {
      'retrieved': 'Truy xuất bản dịch thành công'
    },
    'user': {
      'activated': 'Tài khoản người dùng đã được kích hoạt thành công cho [{{userName}}]',
      'activated_other': '{{count}} tài khoản người dùng đã được kích hoạt thành công',
      'bulkOperationSuccess': 'Thao tác hàng loạt đã hoàn thành: {{successCount}}/{{totalCount}} thành công',
      'created': 'Tài khoản người dùng đã được tạo thành công cho [{{userName}}] ({{email}})',
      'created_other': '{{count}} tài khoản người dùng đã được tạo thành công',
      'dataExported': 'Dữ liệu người dùng đã được xuất thành công ({{fileSize, number}}KB) cho [{{userName}}]',
      'dataImported': 'Dữ liệu người dùng đã được nhập thành công - {{importedCount}} bản ghi đã xử lý',
      'dataImported_other': 'Dữ liệu người dùng đã được nhập thành công - {{importedCount}} bản ghi đã xử lý',
      'deactivated': 'Tài khoản người dùng đã được vô hiệu hóa thành công cho [{{userName}}]',
      'deactivated_other': '{{count}} tài khoản người dùng đã được vô hiệu hóa thành công',
      'deleted': 'Tài khoản người dùng đã được xóa thành công cho [{{userName}}] bởi {{deletedBy}}',
      'deleted_other': '{{count}} tài khoản người dùng đã được xóa thành công',
      'emailUpdated': 'Địa chỉ email đã được cập nhật từ {{oldEmail}} thành {{newEmail}} cho [{{userName}}]',
      'emailVerified': 'Địa chỉ email {{email, lowercase}} đã được xác minh thành công cho [{{userName}}]',
      'loginHistory': 'Lịch sử đăng nhập đã được truy xuất: {{entryCount}} mục cho [{{userName}}]',
      'loginHistory_other': 'Lịch sử đăng nhập đã được truy xuất: {{entryCount}} mục cho [{{userName}}]',
      'passwordChanged': 'Mật khẩu đã được thay đổi thành công cho [{{userName}}]. {{changedBy}}',
      'permissionUpdated': 'Quyền người dùng đã được cập nhật thành công cho [{{userName}}]',
      'profileCompleted': 'Hồ sơ người dùng hiện đã hoàn thành {{percent, number}}% cho [{{userName}}]',
      'profileRetrieved': 'Thông tin cá nhân đã được truy xuất thành công cho [{{userName}}] ({{userRole}}) bởi [{{requestedBy}}]',
      'profileUpdated': 'Hồ sơ người dùng đã được cập nhật thành công cho [{{userName}}] - {{fieldsCount}} trường đã sửa đổi',
      'profileUpdated_other': 'Hồ sơ người dùng đã được cập nhật thành công cho [{{userName}}] - {{fieldsCount}} trường đã sửa đổi',
      'registered': 'Người dùng [{{userName}}] đã đăng ký thành công với vai trò [{{userRole}}]',
      'registeredEmailDisabled': 'Tài khoản [{{userName}}] đã được tạo. Thông báo email hiện đang bị vô hiệu hóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để kích hoạt tài khoản.',
      'registeredPendingActivation': 'Đã nhận đăng ký cho [{{userName}}]. Vui lòng kiểm tra email để xác nhận và kích hoạt tài khoản trước khi đăng nhập.',
      'roleChanged': 'Vai trò người dùng đã được thay đổi từ {{oldRole}} thành {{newRole}} cho [{{userName}}]',
      'sessionTerminated': 'Tất cả phiên đã được chấm dứt thành công cho [{{userName}}]',
      'suspended': 'Tài khoản người dùng đã được đình chỉ thành công cho [{{userName}}] đến {{suspendedUntil, datetime}}',
      'unsuspended': 'Việc đình chỉ tài khoản người dùng đã được gỡ bỏ cho [{{userName}}] bởi {{liftedBy}}',
      'updated': 'Thông tin cá nhân đã được cập nhật thành công cho [{{userName}}]. Các trường được cập nhật: {{updatedFields}}',
      'updated_other': '{{count}} hồ sơ người dùng đã được cập nhật thành công',
      'updatedWithEmailVerification': 'Hồ sơ đã được cập nhật. Vui lòng kiểm tra địa chỉ email mới {{newEmail}} của bạn để xác minh và hoàn tất thay đổi.'
    }
  },
  'system': {
    'apiInfo': 'Thông tin API',
    'error': 'Đã xảy ra lỗi',
    'invalidRequest': 'Yêu cầu không hợp lệ',
    'notFound': 'Không tìm thấy tài nguyên',
    'operationFailed': '{{operation}} thất bại: {{error}}',
    'serverError': 'Lỗi máy chủ nội bộ',
    'success': 'Hoàn thành thao tác thành công',
    'welcome': 'Chào mừng đến với Hono Auth API v{{version}} ({{language}})'
  },
  'user': {
    'statusDisplay': {
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'suspended': 'Bị tạm ngưng'
    }
  },
  'validation': {
    'advancedAudit': {
      'invalidRetentionAction': 'Hành động lưu giữ không hợp lệ: {{action}}, phải là một trong: {{validActions}}'
    },
    'advancedCleanup': {
      'backupRecommended': 'Rất khuyến khích tạo bản sao lưu trước khi dọn dẹp',
      'confirmationRequired': 'Cần xác nhận cho các hoạt động dọn dẹp thực tế',
      'invalid': 'Tham số dọn dẹp nâng cao không hợp lệ'
    },
    'arrayValidation': {
      'actions': {
        'tooFew': 'Phải chứa ít nhất {{minCount}} hành động',
        'tooFew_other': 'Phải chứa ít nhất {{minCount}} hành động',
        'tooMany': 'Không thể chứa nhiều hơn {{maxCount}} hành động',
        'tooMany_other': 'Không thể chứa nhiều hơn {{maxCount}} hành động'
      },
      'channels': {
        'tooFew': 'Phải có ít nhất {{minCount}} kênh',
        'tooFew_other': 'Phải có ít nhất {{minCount}} kênh',
        'tooMany': 'Không được vượt quá {{maxCount}} kênh',
        'tooMany_other': 'Không được vượt quá {{maxCount}} kênh'
      },
      'conditions': {
        'tooFew': 'Phải chỉ định ít nhất {{minCount}} điều kiện',
        'tooFew_other': 'Phải chỉ định ít nhất {{minCount}} điều kiện',
        'tooMany': 'Không được chỉ định nhiều hơn {{maxCount}} điều kiện',
        'tooMany_other': 'Không được chỉ định nhiều hơn {{maxCount}} điều kiện'
      },
      'configs': {
        'tooFew': 'Phải chứa ít nhất {{minCount}} cấu hình',
        'tooFew_other': 'Phải chứa ít nhất {{minCount}} cấu hình',
        'tooMany': 'Không thể chứa nhiều hơn {{maxCount}} cấu hình',
        'tooMany_other': 'Không thể chứa nhiều hơn {{maxCount}} cấu hình'
      },
      'interests': {
        'tooFew': 'Phải chứa ít nhất {{minCount}} sở thích',
        'tooFew_other': 'Phải chứa ít nhất {{minCount}} sở thích',
        'tooMany': 'Không thể chứa nhiều hơn {{maxCount}} sở thích',
        'tooMany_other': 'Không thể chứa nhiều hơn {{maxCount}} sở thích'
      },
      'items': {
        'tooFew': 'Phải chứa ít nhất {{minCount}} mục',
        'tooFew_other': 'Phải chứa ít nhất {{minCount}} mục',
        'tooMany': 'Không thể chứa nhiều hơn {{maxCount}} mục',
        'tooMany_other': 'Không thể chứa nhiều hơn {{maxCount}} mục'
      }
    },
    'auditSearch': {
      'atLeastOneFilterRequired': 'Phải chỉ định ít nhất {{min}} bộ lọc',
      'atLeastOneFilterRequired_other': 'Phải chỉ định ít nhất {{min}} bộ lọc'
    },
    'changePassword': {
      'passwordsDoNotMatch': 'Mật khẩu mới và xác nhận không khớp'
    },
    'cleanupSimulation': {
      'confirmationRequired': 'Cần xác nhận cho các hoạt động không phải thử nghiệm',
      'dataLossWarning': 'Cảnh báo: Thao tác này có thể dẫn đến mất dữ liệu',
      'invalid': 'Tham số mô phỏng dọn dẹp không hợp lệ'
    },
    'confirmPassword': {
      'mustMatch': 'Xác nhận mật khẩu phải khớp với mật khẩu',
      'required': 'Xác nhận mật khẩu là bắt buộc'
    },
    'dateRange': {
      'invalid': 'Khoảng ngày không hợp lệ - ngày kết thúc phải sau ngày bắt đầu',
      'overlapConflict': 'Phạm vi ngày trùng lặp với phạm vi hiện có: {{conflictingRange}}',
      'tooLarge': 'Phạm vi ngày không được vượt quá {{maxDays}} ngày',
      'tooLarge_other': 'Phạm vi ngày không được vượt quá {{maxDays}} ngày'
    },
    'enumValidation': {
      'action': {
        'invalid': 'Hành động phải là một trong: {{allowedValues}}'
      },
      'actionType': {
        'invalid': 'Loại hành động phải là một trong: {{allowedValues}}'
      },
      'category': {
        'invalid': 'Danh mục phải là một trong: {{allowedValues}}'
      },
      'categoryFilter': {
        'invalid': 'Bộ lọc danh mục phải là một trong: {{allowedValues}}'
      },
      'channelType': {
        'invalid': 'Loại kênh phải là một trong: {{allowedValues}}'
      },
      'file_type': {
        'invalid': 'Loại tệp phải là một trong: {{allowedValues}}'
      },
      'format': {
        'invalid': 'Định dạng phải là một trong: {{allowedValues}}'
      },
      'metric': {
        'invalid': 'Chỉ số phải là một trong: {{allowedValues}}'
      },
      'operator': {
        'invalid': 'Toán tử phải là một trong: {{allowedValues}}'
      },
      'priority': {
        'invalid': 'Mức độ ưu tiên phải là một trong: {{allowedValues}}'
      },
      'reportType': {
        'invalid': 'Loại báo cáo phải là một trong: {{allowedValues}}'
      },
      'resolution': {
        'invalid': 'Độ phân giải phải là một trong: {{allowedValues}}'
      },
      'role': {
        'invalid': 'Vai trò phải là một trong: {{allowedValues}}'
      },
      'severity': {
        'invalid': 'Mức độ nghiêm trọng phải là một trong: {{allowedValues}}'
      },
      'sort_by': {
        'invalid': 'Trường sắp xếp phải là một trong: {{allowedValues}}'
      },
      'sort_order': {
        'invalid': 'Thứ tự sắp xếp phải là một trong: {{allowedValues}}'
      },
      'status': {
        'invalid': 'Trạng thái phải là một trong: {{allowedValues}}'
      },
      'timeframe': {
        'invalid': 'Khoảng thời gian phải là một trong: {{allowedValues}}'
      },
      'userRole': {
        'invalid': 'Vai trò người dùng phải là một trong: {{allowedValues}}'
      }
    },
    'fieldRequired': {
      'action': 'Hành động là bắt buộc',
      'actionTaken': 'Hành động đã thực hiện là bắt buộc',
      'age': 'Tuổi là bắt buộc',
      'assignedTo': 'Người được gán là bắt buộc',
      'auditLogRetentionDays': 'Giá trị số ngày lưu trữ log kiểm toán là bắt buộc',
      'auditRetention': 'Giá trị lưu trữ audit là bắt buộc',
      'batchSize': 'Kích thước lô là bắt buộc',
      'categoryFilter': 'Bộ lọc danh mục là bắt buộc',
      'channel': 'Kênh là bắt buộc',
      'channelType': 'Loại kênh là bắt buộc',
      'conditionValue': 'Giá trị điều kiện là bắt buộc',
      'confirmPassword': 'Xác nhận mật khẩu là bắt buộc',
      'date': 'Ngày tháng là bắt buộc',
      'days': 'Số ngày là bắt buộc',
      'description': 'Mô tả là bắt buộc',
      'dryRun': 'Cờ chạy thử là bắt buộc',
      'email': 'Địa chỉ email là bắt buộc',
      'enabled': 'Cờ kích hoạt là bắt buộc',
      'endDate': 'Ngày kết thúc là bắt buộc',
      'endTime': 'Thời gian kết thúc là bắt buộc',
      'errorRate': 'Tỷ lệ lỗi là bắt buộc',
      'executionTime': 'Thời gian thực thi là bắt buộc',
      'failureCount': 'Số lần thất bại là bắt buộc',
      'field': 'Giá trị trường là bắt buộc',
      'fileSize': 'Kích thước tệp là bắt buộc',
      'forceArchival': 'Cờ bắt buộc lưu trữ là bắt buộc',
      'format': 'Định dạng là bắt buộc',
      'hours': 'Giờ là bắt buộc',
      'id': 'ID là bắt buộc',
      'incidentType': 'Loại sự cố là bắt buộc',
      'includeDetails': 'Cờ bao gồm chi tiết là bắt buộc',
      'includeMetadata': 'Cờ bao gồm metadata là bắt buộc',
      'includeUserData': 'Cờ bao gồm dữ liệu người dùng là bắt buộc',
      'intervalMs': 'Khoảng thời gian (ms) là bắt buộc',
      'limit': 'Giới hạn là bắt buộc',
      'maxRecords': 'Giá trị số bản ghi tối đa là bắt buộc',
      'metric': 'Chỉ số là bắt buộc',
      'metrics': 'Các chỉ số là bắt buộc',
      'name': 'Tên là bắt buộc',
      'page': 'Số trang là bắt buộc',
      'password': 'Mật khẩu là bắt buộc',
      'period': 'Giai đoạn là bắt buộc',
      'policy': 'Chính sách là bắt buộc',
      'priority': 'Mức độ ưu tiên là bắt buộc',
      'query': 'Từ khóa tìm kiếm là bắt buộc',
      'refreshToken': 'Refresh token là bắt buộc',
      'reportType': 'Loại báo cáo là bắt buộc',
      'resolution': 'Giải pháp là bắt buộc',
      'responseTime': 'Thời gian phản hồi là bắt buộc',
      'securityIncident': 'Sự cố bảo mật là bắt buộc',
      'startDate': 'Ngày bắt đầu là bắt buộc',
      'startTime': 'Thời gian bắt đầu là bắt buộc',
      'target': 'Mục tiêu là bắt buộc',
      'termsAccepted': 'Chấp nhận điều khoản là bắt buộc',
      'threshold': 'Ngưỡng (threshold) là bắt buộc',
      'timeframe': 'Khung thời gian là bắt buộc',
      'timeRange': 'Khoảng thời gian là bắt buộc',
      'token': 'Token là bắt buộc',
      'userDataRetention': 'Giá trị lưu trữ dữ liệu người dùng là bắt buộc',
      'userDataRetentionDays': 'Giá trị số ngày lưu trữ dữ liệu người dùng là bắt buộc',
      'userId': 'User ID là bắt buộc',
      'username': 'Tên người dùng là bắt buộc',
      'userRole': 'Vai trò người dùng là bắt buộc',
      'value': 'Giá trị là bắt buộc',
      'website': 'Website là bắt buộc'
    },
    'fileUpload': {
      'invalidExtension': 'Phần mở rộng tệp không hợp lệ'
    },
    'formatValidation': {
      'assignedTo': {
        'invalid': 'Định dạng ID người được gán không hợp lệ'
      },
      'date': {
        'invalid': 'Định dạng ngày tháng không hợp lệ'
      },
      'email': {
        'invalid': 'Vui lòng cung cấp địa chỉ email hợp lệ (ví dụ: user@example.com)'
      },
      'endDate': {
        'invalid': 'Định dạng ngày kết thúc không hợp lệ'
      },
      'endTime': {
        'invalid': 'Định dạng thời gian kết thúc không hợp lệ'
      },
      'id': {
        'invalid': 'Định dạng ID không hợp lệ'
      },
      'refreshToken': {
        'invalid': 'Định dạng refresh token không hợp lệ'
      },
      'startDate': {
        'invalid': 'Định dạng ngày bắt đầu không hợp lệ'
      },
      'startTime': {
        'invalid': 'Định dạng thời gian bắt đầu không hợp lệ'
      },
      'token': {
        'invalid': 'Định dạng JWT token không hợp lệ'
      },
      'url': {
        'invalid': 'Vui lòng cung cấp URL hợp lệ (ví dụ: https://example.com)'
      },
      'website': {
        'invalid': 'Vui lòng cung cấp URL website hợp lệ (ví dụ: https://example.com)'
      }
    },
    'lengthValidation': {
      'action': {
        'tooLong': 'Hành động không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Hành động phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Hành động phải có ít nhất {{minLength}} ký tự'
      },
      'actionTaken': {
        'tooLong': 'Hành động đã thực hiện không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Hành động đã thực hiện phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Hành động đã thực hiện phải có ít nhất {{minLength}} ký tự'
      },
      'bio': {
        'tooLong': 'Tiểu sử không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Tiểu sử phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Tiểu sử phải có ít nhất {{minLength}} ký tự'
      },
      'channel': {
        'tooLong': 'Kênh không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Kênh phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Kênh phải có ít nhất {{minLength}} ký tự'
      },
      'channelType': {
        'tooLong': 'Loại kênh không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Loại kênh phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Loại kênh phải có ít nhất {{minLength}} ký tự'
      },
      'confirmPassword': {
        'tooShort': 'Xác nhận mật khẩu phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Xác nhận mật khẩu phải có ít nhất {{minLength}} ký tự'
      },
      'department': {
        'tooLong': 'Phòng ban không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Phòng ban phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Phòng ban phải có ít nhất {{minLength}} ký tự'
      },
      'description': {
        'tooLong': 'Mô tả không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Mô tả phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Mô tả phải có ít nhất {{minLength}} ký tự'
      },
      'email': {
        'tooLong': 'Địa chỉ email không được vượt quá {{maxLength}} ký tự'
      },
      'entityType': {
        'tooLong': 'Loại thực thể không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Loại thực thể phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Loại thực thể phải có ít nhất {{minLength}} ký tự'
      },
      'field': {
        'tooLong': 'Trường không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Trường phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Trường phải có ít nhất {{minLength}} ký tự'
      },
      'incidentType': {
        'tooLong': 'Loại sự cố không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Loại sự cố phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Loại sự cố phải có ít nhất {{minLength}} ký tự'
      },
      'interest': {
        'tooLong': 'Sở thích không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Sở thích phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Sở thích phải có ít nhất {{minLength}} ký tự'
      },
      'name': {
        'tooLong': 'Tên không được vượt quá {{maxLength}} ký tự'
      },
      'nextSteps': {
        'tooLong': 'Các bước tiếp theo không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Các bước tiếp theo phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Các bước tiếp theo phải có ít nhất {{minLength}} ký tự'
      },
      'note': {
        'tooLong': 'Ghi chú không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Ghi chú phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Ghi chú phải có ít nhất {{minLength}} ký tự'
      },
      'notes': {
        'tooLong': 'Các ghi chú không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Các ghi chú phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Các ghi chú phải có ít nhất {{minLength}} ký tự'
      },
      'password': {
        'tooLong': 'Mật khẩu không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Mật khẩu phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Mật khẩu phải có ít nhất {{minLength}} ký tự'
      },
      'query': {
        'tooLong': 'Từ khóa tìm kiếm không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Từ khóa tìm kiếm phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Từ khóa tìm kiếm phải có ít nhất {{minLength}} ký tự'
      },
      'search': {
        'tooLong': 'Nội dung tìm kiếm không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Nội dung tìm kiếm phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Nội dung tìm kiếm phải có ít nhất {{minLength}} ký tự'
      },
      'sortBy': {
        'tooLong': 'Trường sắp xếp không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Trường sắp xếp phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Trường sắp xếp phải có ít nhất {{minLength}} ký tự'
      },
      'source': {
        'tooLong': 'Nguồn không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Nguồn phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Nguồn phải có ít nhất {{minLength}} ký tự'
      },
      'system': {
        'tooLong': 'Hệ thống không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Hệ thống phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Hệ thống phải có ít nhất {{minLength}} ký tự'
      },
      'target': {
        'tooLong': 'Mục tiêu không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Mục tiêu phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Mục tiêu phải có ít nhất {{minLength}} ký tự'
      },
      'template': {
        'tooLong': 'Mẫu không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Mẫu phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Mẫu phải có ít nhất {{minLength}} ký tự'
      },
      'token': {
        'tooLong': 'Token không được vượt quá {{maxLength}} ký tự',
        'tooShort': 'Token phải có ít nhất {{minLength}} ký tự',
        'tooShort_other': 'Token phải có ít nhất {{minLength}} ký tự'
      }
    },
    'numericValidation': {
      'age': {
        'tooLarge': 'Tuổi không được vượt quá {{maxValue}} tuổi',
        'tooSmall': 'Tuổi phải ít nhất {{minValue}} tuổi'
      },
      'auditLogRetentionDays': {
        'tooSmall': 'Số ngày lưu trữ log kiểm toán phải ít nhất {{minValue}}'
      },
      'auditRetention': {
        'tooLarge': 'Giá trị lưu trữ audit không được vượt quá {{maxValue}}',
        'tooSmall': 'Giá trị lưu trữ audit phải ít nhất {{minValue}}'
      },
      'batchSize': {
        'tooLarge': 'Kích thước lô không được vượt quá {{maxValue}}',
        'tooSmall': 'Kích thước lô phải ít nhất {{minValue}}'
      },
      'days': {
        'tooLarge': 'Số ngày không được vượt quá {{maxValue}}',
        'tooSmall': 'Số ngày phải ít nhất {{minValue}}'
      },
      'errorRate': {
        'tooLarge': 'Tỷ lệ lỗi không được vượt quá {{maxValue}}',
        'tooSmall': 'Tỷ lệ lỗi phải ít nhất {{minValue}}'
      },
      'executionTime': {
        'tooLarge': 'Thời gian thực thi không được vượt quá {{maxValue}} giây',
        'tooSmall': 'Thời gian thực thi phải ít nhất {{minValue}} giây'
      },
      'failureCount': {
        'tooLarge': 'Số lần thất bại không được vượt quá {{maxValue}}',
        'tooSmall': 'Số lần thất bại phải ít nhất {{minValue}}'
      },
      'fileSize': {
        'tooLarge': 'Kích thước tệp không được vượt quá {{maxValue}} byte',
        'tooSmall': 'Kích thước tệp phải ít nhất {{minValue}} byte'
      },
      'hours': {
        'tooLarge': 'Giờ không được vượt quá {{maxValue}}',
        'tooSmall': 'Giờ phải ít nhất {{minValue}}'
      },
      'intervalMs': {
        'tooLarge': 'Khoảng thời gian (ms) không được vượt quá {{maxValue}}',
        'tooSmall': 'Khoảng thời gian (ms) phải ít nhất {{minValue}}'
      },
      'limit': {
        'tooLarge': 'Giới hạn không được vượt quá {{maxValue}}',
        'tooSmall': 'Giới hạn phải ít nhất {{minValue}}'
      },
      'maxRecords': {
        'tooLarge': 'Số bản ghi tối đa không được vượt quá {{maxValue}}',
        'tooSmall': 'Số bản ghi tối đa phải ít nhất {{minValue}}'
      },
      'page': {
        'tooLarge': 'Số trang không được vượt quá {{maxValue}}',
        'tooSmall': 'Số trang phải ít nhất {{minValue}}'
      },
      'responseTime': {
        'tooLarge': 'Thời gian phản hồi không được vượt quá {{maxValue}}',
        'tooSmall': 'Thời gian phản hồi phải ít nhất {{minValue}}'
      },
      'securityIncident': {
        'tooLarge': 'Sự cố bảo mật không được vượt quá {{maxValue}}',
        'tooSmall': 'Sự cố bảo mật phải ít nhất {{minValue}}'
      },
      'threshold': {
        'tooSmall': 'Ngưỡng phải ít nhất {{minValue}}'
      },
      'userDataRetention': {
        'tooLarge': 'Lưu trữ dữ liệu người dùng không được vượt quá {{maxValue}}',
        'tooSmall': 'Lưu trữ dữ liệu người dùng phải ít nhất {{minValue}}'
      },
      'userDataRetentionDays': {
        'tooSmall': 'Số ngày lưu trữ dữ liệu người dùng phải ít nhất {{minValue}}'
      },
      'userId': {
        'tooSmall': 'User ID phải ít nhất {{minValue}}'
      }
    },
    'retentionPolicy': {
      'atLeastOneRequired': 'Phải chỉ định ít nhất một cài đặt lưu giữ',
      'atLeastOneRequired_other': 'Phải chỉ định ít nhất {{min}} cài đặt lưu giữ',
      'conflictingRules': 'Phát hiện quy tắc lưu giữ xung đột: {{conflicts}}',
      'invalid': 'Chính sách lưu giữ không hợp lệ'
    },
    'retentionPolicyUpdate': {
      'atLeastOneFieldRequired': 'Phải cập nhật ít nhất một trường',
      'atLeastOneFieldRequired_other': 'Phải cập nhật ít nhất {{min}} trường',
      'immutableField': 'Trường "{{field}}" không thể sửa đổi sau khi tạo',
      'invalid': 'Cập nhật chính sách lưu giữ không hợp lệ'
    },
    'security': {
      'xssPatternDetected': 'Phát hiện mẫu XSS tiềm ẩn: [{{patternName}}] không được phép'
    },
    'structureValidation': {
      'conditions': {
        'invalid': 'Cấu trúc điều kiện không hợp lệ'
      },
      'config': {
        'invalid': 'Cấu trúc cấu hình không hợp lệ'
      },
      'configUpdate': {
        'invalid': 'Định dạng cập nhật cấu hình không hợp lệ. Thiếu trường bắt buộc "value" hoặc chứa trường không được phép'
      },
      'incidentCreation': {
        'invalid': 'Cấu trúc tạo sự cố không hợp lệ'
      },
      'login': {
        'invalid': 'Định dạng yêu cầu đăng nhập không hợp lệ'
      },
      'metadata': {
        'invalid': 'Cấu trúc metadata không hợp lệ'
      },
      'object': {
        'invalid': 'Cấu trúc đối tượng không hợp lệ'
      },
      'record': {
        'invalid': 'Định dạng bản ghi không hợp lệ'
      }
    },
    'termsAccepted': {
      'mustBeTrue': 'Phải chấp nhận các điều khoản và điều kiện',
      'versionMismatch': 'Điều khoản và điều kiện đã được cập nhật - vui lòng xem xét và chấp nhận phiên bản mới nhất'
    },
    'timeRange': {
      'eitherHoursOrRangeRequired': 'Phải chỉ định giờ hoặc khoảng ngày tháng',
      'endTimeMustBeAfterStartTime': 'Thời gian kết thúc phải sau thời gian bắt đầu',
      'invalid': 'Khoảng thời gian phải là một trong: last_1h, last_6h, last_24h, last_7d, last_30d',
      'invalidFormat': 'Định dạng phạm vi thời gian không hợp lệ (mong đợi: {{expectedFormat}})',
      'rangeTooLarge': 'Phạm vi thời gian không được vượt quá {{maxDays}} ngày',
      'rangeTooLarge_other': 'Phạm vi thời gian không được vượt quá {{maxDays}} ngày',
      'required': 'Phạm vi thời gian là bắt buộc'
    },
    'typeValidation': {
      'configValue': {
        'invalid': 'Kiểu giá trị cấu hình không hợp lệ'
      },
      'value': {
        'invalid': 'Kiểu dữ liệu không hợp lệ'
      }
    },
    'username': {
      'invalid': 'Tên đăng nhập chỉ có thể chứa chữ cái, số và gạch dưới',
      'invalidCharacters': 'Tên đăng nhập chỉ có thể chứa chữ cái, số và gạch dưới',
      'required': 'Tên người dùng là bắt buộc',
      'reserved': 'Tên người dùng "[{{username}}]" đã được bảo lưu và không thể sử dụng',
      'tooLong': 'Tên đăng nhập không thể vượt quá 30 ký tự',
      'tooShort': 'Tên đăng nhập phải có ít nhất 3 ký tự',
      'tooShort_other': 'Tên người dùng phải có ít nhất {{minLength}} ký tự',
      'unavailable': 'Tên người dùng "[{{username}}]" không khả dụng'
    },
    'filterArrayTooLarge': 'Mảng filter quá lớn (tối đa 500 items)',
    'filterArrayTooLarge_other': 'Mảng bộ lọc với {{count}} mục vượt quá tối đa {{max}}',
    'invalid': 'Giá trị được cung cấp không hợp lệ',
    'invalid_other': '{{count}} giá trị không hợp lệ được cung cấp',
    'invalidArchiveAction': 'Hành động lưu trữ không hợp lệ',
    'invalidJson': 'JSON không hợp lệ trong request body',
    'invalidRole': 'Vai trò không hợp lệ được chỉ định',
    'limitTooLarge': 'Giới hạn quá lớn (tối đa 50,000 bản ghi)',
    'limitTooLarge_other': 'Giới hạn {{limit}} vượt quá tối đa {{max}} bản ghi',
    'registrationFailed': 'Đăng ký thất bại',
    'requestTooLarge': 'Request payload quá lớn',
    'required': 'Trường này là bắt buộc',
    'required_other': 'Thiếu {{count}} trường bắt buộc',
    'searchFailed': 'Tìm kiếm thất bại',
    'serviceTempUnavailable': 'Request quá lớn để xử lý - dịch vụ tạm thời không khả dụng',
    'tooLong': 'Giá trị vượt quá giới hạn {{max}} ký tự',
    'tooLong_other': 'Giá trị vượt quá giới hạn {{max}} ký tự',
    'tooShort': 'Giá trị phải có ít nhất {{min}} ký tự',
    'tooShort_other': 'Giá trị phải có ít nhất {{min}} ký tự',
    'translationsFailed': 'Lấy bản dịch thất bại',
    'unsupportedFormat': 'Định dạng export không được hỗ trợ',
    'updateRequiresField': 'Cần ít nhất một trường để cập nhật',
    'updateRequiresField_other': 'Cần ít nhất {{min}} trường cho thao tác cập nhật',
    'uploadFailed': 'Tải file lên thất bại'
  },
  'zodDemo': {
    'anotherSearchResultTitle': 'Kết quả khác cho',
    'description': 'Điều này minh họa cách sử dụng Zod với Hono để xác thực mạnh mẽ',
    'noDescription': 'Không có mô tả',
    'searchResultTitle': 'Kết quả cho',
    'title': 'Demo Xác thực Zod'
  },
  'zodDemo_operations': {
    'fileUpload': 'demo tải lên tệp',
    'searchExecution': 'demo thực thi tìm kiếm',
    'userRegistration': 'demo đăng ký người dùng'
  }
};
