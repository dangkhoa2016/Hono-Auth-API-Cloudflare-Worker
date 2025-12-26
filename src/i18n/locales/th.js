/**
 * TH translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: 2025-12-16T04:10:26.777Z
*/

export default {
  'admin': {
    'accessLevel': {
      'full': 'การเข้าถึงระบบเต็มรูปแบบ',
      'limited': 'การเข้าถึงจำกัด (ระดับผู้ดูแล)'
    },
    'actions': {
      'permanentDeletion': 'การลบบัญชีอย่างถาวร'
    },
    'dataScope': {
      'full': 'ข้อมูลครบถ้วน',
      'limited': 'ข้อมูลที่กรองแล้ว'
    },
    'operations': {
      'adminDashboardAccess': 'การเข้าถึงแดชบอร์ดผู้ดูแลระบบ',
      'adminRoutesAccess': 'การเข้าถึงเส้นทางผู้ดูแลระบบ',
      'createUser': 'การสร้างผู้ใช้',
      'deleteUser': 'ลบผู้ใช้ #{{userId}}',
      'updateUser': 'อัพเดทผู้ใช้ #{{userId}}'
    },
    'protectionReason': {
      'hierarchy': 'ต้องรักษาลำดับชั้นบทบาท',
      'higherPrivilege': 'ไม่สามารถแก้ไขผู้ใช้ที่มีสิทธิ์สูงกว่าได้',
      'roleChange': 'ผู้ใช้ไม่สามารถแก้ไขบทบาทของตัวเองได้',
      'superAdmin': 'บัญชีผู้ดูแลระบบสูงสุดได้รับการป้องกัน'
    },
    'systemStatus': {
      'healthy': 'สุขภาพดี',
      'unhealthy': 'สุขภาพไม่ดี'
    },
    'accessDenied': 'การดำเนินการนี้ต้องการสิทธิ์ผู้ดูแลระบบ',
    'accountDeletionSuggestion': 'ติดต่อผู้ดูแลคนอื่นสำหรับการจัดการบัญชี',
    'activeUsersCount': 'ผู้ใช้ที่ใช้งาน {{count}} คน',
    'activeUsersCount_other': 'ผู้ใช้ที่ใช้งาน {{count}} คน ({{percentage}})',
    'changedByUser': 'เปลี่ยนแปลงโดย {{username}} ({{role}})',
    'changesApplied': 'ใช้งานการเปลี่ยนแปลง {{count}} ครั้ง',
    'changesApplied_other': 'ใช้งานการเปลี่ยนแปลง {{count}} ครั้ง',
    'checkedByUser': 'ตรวจสอบโดย {{username}} ({{role}})',
    'createdByUser': 'สร้างโดย {{username}} ({{role}})',
    'dashboardDataRetrieved': 'โหลดแดชบอร์ดด้วยภาพรวมระบบ {{totalUsers}} (การเข้าถึง {{accessLevel}}) {{requestedBy}} {{dataFreshness}}',
    'dashboardRetrieved': 'ดึงข้อมูลแดชบอร์ดสำเร็จ',
    'dataFreshness': 'สร้างที่ {{timestamp}}',
    'deletedByUser': 'ลบโดย {{username}} ({{role}})',
    'effectiveImmediately': 'การเปลี่ยนแปลงมีผลทันที',
    'failedLoginAttempts': 'การพยายามเข้าสู่ระบบล้มเหลว {{count}} ครั้งในชั่วโมงที่ผ่านมา',
    'failedLoginAttempts_other': 'การพยายามเข้าสู่ระบบล้มเหลว {{count}} ครั้งในชั่วโมงที่ผ่านมา',
    'performanceGrade': 'ประสิทธิภาพ: {{grade}}',
    'requestedByUser': 'ขอโดย {{username}} ({{role}})',
    'responseTime': 'เวลาตอบสนอง: {{time}}{{unit}}',
    'restrictedRoleAccess': 'การเข้าถึงถูกปฏิเสธ: {{currentRole}} ไม่สามารถดูผู้ใช้ {{requestedRole}} ได้',
    'roleChangedSuccessfully': 'เปลี่ยนบทบาทจาก {{oldRole}} เป็น {{newRole}} สำหรับ {{targetUserName}} {{changedBy}} {{timestamp}} {{effectiveImmediately}}',
    'routeDiscoverySuccess': 'ดึงเส้นทางของระบบสำเร็จ',
    'securityRisk': 'ความเสี่ยงด้านความปลอดภัย: {{level}} ({{failedAttempts}})',
    'statisticsRetrieved': 'สถิติระบบ: {{totalUsers}}, ผู้ใช้ที่ใช้งาน: {{activeUsers}} (ขอบเขต {{dataScope}}) {{requestedBy}}',
    'statsRetrieved': 'ดึงสถิติระบบสำเร็จ',
    'systemHealthRetrieved': 'ดึงสถานะสุขภาพของระบบสำเร็จ',
    'systemHealthRetrievedFailed': 'ไม่สามารถดึงข้อมูลสุขภาพของระบบได้',
    'totalUsersCount': 'ผู้ใช้ทั้งหมด {{count}} คน',
    'totalUsersCount_other': 'ผู้ใช้ทั้งหมด {{count}} คน',
    'updatedByUser': 'อัพเดทโดย {{username}} ({{role}})',
    'userCreatedSuccessfully': 'สร้างผู้ใช้ใหม่ {{userName}} ด้วยบทบาท {{newUserRole}} สำเร็จ {{createdBy}} {{timestamp}}',
    'userDeletedSuccessfully': 'ลบบัญชีผู้ใช้อย่างถาวรแล้ว {{deletedBy}} {{timestamp}} การดำเนินการ: {{action}}',
    'userDetailsRetrieved': 'ดึงข้อมูลรายละเอียดผู้ใช้: {{userName}} ({{userRole}}, {{userStatus}}) {{joinedDate}} {{requestedBy}}',
    'usersListRetrieved': 'ดึงข้อมูล {{count}} ผู้ใช้สำเร็จแล้ว (แสดง {{displayedCount}} ในหน้า {{currentPage}} จาก {{totalPages}}) {{requestedBy}}',
    'usersListRetrieved_other': 'ดึงข้อมูล {{count}} ผู้ใช้สำเร็จแล้ว (แสดง {{displayedCount}} ในหน้า {{currentPage}} จาก {{totalPages}}) {{requestedBy}}',
    'userUpdatedSuccessfully': 'อัพเดทผู้ใช้ {{updatedUserName}} สำเร็จแล้ว {{changesCount}} {{updatedBy}} {{timestamp}}'
  },
  'api': {
    'databaseError': 'เกิดข้อผิดพลาดของฐานข้อมูล',
    'healthCheck': 'API ทำงานได้อย่างราบรื่น',
    'methodNotAllowed': 'เมธอดไม่ได้รับอนุญาต',
    'routeNotFound': 'ไม่พบเส้นทาง',
    'validationError': 'ข้อผิดพลาดในการตรวจสอบความถูกต้อง',
    'validationErrorDetails': 'การตรวจสอบล้มเหลว: พบ {{errorCount}} ข้อผิดพลาด',
    'validationErrorDetails_other': 'การตรวจสอบล้มเหลว: พบ {{errorCount}} ข้อผิดพลาด'
  },
  'audit': {
    'access': {
      'full': 'การเข้าถึงระบบเต็มรูปแบบ',
      'limited': 'การเข้าถึงจำกัด (ตามบทบาท)'
    },
    'health': {
      'healthy': 'สุขภาพดี',
      'suggestion_admin': 'การตรวจสอบสุขภาพระบบอาจถูกจำกัดสำหรับบทบาทของคุณ',
      'suggestion_super_admin': 'ตรวจสอบทรัพยากรระบบ การเชื่อมต่อฐานข้อมูล และสถานะบริการ',
      'systemCheck': 'การตรวจสอบสุขภาพระบบเต็มรูปแบบ',
      'unhealthy': 'สุขภาพไม่ดี'
    },
    'logs': {
      'error': 'ไม่สามารถดึงล็อกการตรวจสอบได้',
      'suggestion_admin': 'คุณสามารถดูล็อกของผู้ใช้ทั่วไปและการดำเนินการของคุณเองเท่านั้น',
      'suggestion_super_admin': 'คุณมีการเข้าถึงล็อกการตรวจสอบทั้งหมดในระบบอย่างเต็มรูปแบบ'
    },
    'operations': {
      'export': 'ส่งออกบันทึกการตรวจสอบ',
      'healthCheck': 'ตรวจสอบสุขภาพระบบการตรวจสอบ',
      'logsView': 'ดูบันทึกการตรวจสอบ',
      'search': 'ค้นหาบันทึกการตรวจสอบ',
      'stats': 'ดึงสถิติการตรวจสอบ'
    },
    'search': {
      'allFields': 'ทุกฟิลด์',
      'noQuery': 'ไม่ได้ระบุคิวรี',
      'suggestion_admin': 'ลองค้นหาด้วยคำที่แตกต่างหรือติดต่อผู้ดูแลระบบสูงสุดสำหรับการเข้าถึงที่กว้างขึ้น',
      'suggestion_super_admin': 'ลองปรับแต่งเกณฑ์การค้นหาหรือตรวจสอบล็อกระบบสำหรับปัญหา'
    },
    'stats': {
      'suggestion_admin': 'สถิติถูกกรองตามระดับการเข้าถึงของคุณ ติดต่อผู้ดูแลระบบสูงสุดสำหรับสถิติระบบเต็มรูปแบบ',
      'suggestion_super_admin': 'ตรวจสอบสุขภาพระบบและการเชื่อมต่อฐานข้อมูลหากสถิติไม่สามารถใช้งานได้'
    }
  },
  'auth': {
    'operations': {
      'export': 'ส่งออกบันทึกการตรวจสอบ',
      'healthCheck': 'ตรวจสอบสุขภาพระบบการตรวจสอบ',
      'login': 'การเข้าสู่ระบบผู้ใช้',
      'logsView': 'ดูบันทึกการตรวจสอบ',
      'search': 'ค้นหาบันทึกการตรวจสอบ',
      'stats': 'ดึงสถิติการตรวจสอบ'
    },
    'accountNotActive': 'บัญชีไม่เปิดใช้งาน',
    'activationAlreadyActive': 'บัญชีของคุณเปิดใช้งานแล้ว คุณสามารถเข้าสู่ระบบได้ทันที',
    'activationDisabledByAdmin': 'บัญชีของคุณถูกผู้ดูแลระบบปิดการใช้งาน โปรดติดต่อฝ่ายสนับสนุน',
    'activationFailed': 'เปิดใช้งานบัญชีไม่สำเร็จ โปรดลองอีกครั้ง',
    'activationInvalidToken': 'ลิงก์เปิดใช้งานไม่ถูกต้องหรือหมดอายุ',
    'activationMissingToken': 'ไม่มีโทเค็นสำหรับเปิดใช้งาน',
    'activationServerError': 'เกิดข้อผิดพลาดระหว่างการเปิดใช้งาน โปรดลองอีกครั้งในภายหลัง',
    'activationSuccess': 'บัญชีของคุณเปิดใช้งานเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบได้',
    'activationTokenExpired': 'ลิงก์เปิดใช้งานหมดอายุแล้ว กรุณาขอลิงก์ใหม่',
    'cannotAccessOtherUsers': 'ไม่สามารถเข้าถึงทรัพยากรของผู้ใช้อื่นได้',
    'cannotAccessSuperAdmin': 'ไม่สามารถเข้าถึงทรัพยากรของผู้ดูแลระบบสูงสุดได้',
    'cannotChangeAdminRole': 'ไม่สามารถเปลี่ยนบทบาทของผู้ดูแลระบบคนอื่นได้',
    'cannotChangeOwnRole': 'ไม่สามารถเปลี่ยนบทบาทของตัวเองได้',
    'cannotCreateAdmin': 'ไม่สามารถสร้างบัญชีผู้ดูแลระบบได้',
    'cannotCreateHigherRole': '{{currentRole}} ไม่สามารถสร้างบัญชี {{requestedRole}} ได้เนื่องจากข้อจำกัดในลำดับชั้นของบทบาท',
    'cannotCreateSuperAdmin': 'ไม่สามารถสร้างบัญชีผู้ดูแลระบบสูงสุดได้',
    'cannotDeleteOwnAccount': '{{userName}} ({{role}}) ไม่สามารถลบบัญชีของตัวเองได้ {{suggestion}}',
    'cannotDeleteSuperAdmin': 'ไม่สามารถลบบัญชีผู้ดูแลระบบสูงสุดได้',
    'cannotDeleteYourself': 'ไม่สามารถลบบัญชีของตัวเองได้',
    'cannotModifyHigherRoleUser': 'ไม่สามารถแก้ไข {{targetUserName}} ({{targetRole}}) - {{currentRole}} {{reason}}',
    'cannotModifySuperAdmin': 'ไม่สามารถแก้ไขบัญชีผู้ดูแลระบบสูงสุดได้',
    'cannotPromoteToHigherRole': '{{currentRole}} ไม่สามารถเลื่อนตำแหน่งผู้ใช้เป็น {{requestedRole}} - {{reason}}',
    'cannotPromoteToSuperAdmin': 'ไม่สามารถเลื่อนตำแหน่งผู้ใช้เป็นผู้ดูแลระบบสูงสุดได้',
    'deleteNotAllowed': 'ไม่อนุญาตให้ดำเนินการลบสำหรับบทบาทของคุณ',
    'forbidden': 'การเข้าถึงถูกปฏิเสธ - สิทธิ์ไม่เพียงพอ',
    'invalidCredentials': 'ข้อมูลประจำตัวไม่ถูกต้อง',
    'invalidRole': 'บทบาทผู้ใช้ไม่ถูกต้อง',
    'loginSuccess': 'เข้าสู่ระบบสำเร็จ',
    'logoutAllSuccess': 'ออกจากระบบจากทุกอุปกรณ์เรียบร้อยแล้ว',
    'logoutSuccess': 'ออกจากระบบสำเร็จ',
    'passwordIncorrect': 'รหัสผ่านไม่ถูกต้อง',
    'rateLimitExceeded': 'พยายามเข้าสู่ระบบล้มเหลวมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    'refreshSuccess': 'รีเฟรชโทเค็นสำเร็จ',
    'refreshTokenExpired': 'โทเค็นสำหรับรีเฟรชหมดอายุแล้ว',
    'refreshTokenInvalid': 'โทเค็นสำหรับรีเฟรชไม่ถูกต้อง',
    'superAdminRequired': 'ต้องการสิทธิ์ผู้ดูแลระบบสูงสุด',
    'tokenExpired': 'โทเค็นหมดอายุแล้ว',
    'tokenInvalid': 'โทเค็นไม่ถูกต้อง',
    'unauthorized': 'ไม่ได้รับอนุญาตให้เข้าถึง',
    'userNotFound': 'ไม่พบผู้ใช้หรือไม่มีการใช้งาน'
  },
  'dates': {
    'changedAt': 'เปลี่ยนแปลงที่ {{date, datetime}}',
    'checkedAt': 'ตรวจสอบที่ {{date, datetime}}',
    'createdAt': 'สร้างที่ {{date, datetime}}',
    'deletedAt': 'ลบที่ {{date, datetime}}',
    'updatedAt': 'อัพเดทที่ {{date, datetime}}',
    'userJoined': 'เข้าร่วมเมื่อ {{date, date}}'
  },
  'emails': {
    'registration': {
      'activateButton': 'เปิดใช้งานบัญชีของฉัน',
      'activateLinkText': 'หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์ของคุณ:',
      'details': 'รายละเอียดบัญชี',
      'disclaimer': 'หากคุณไม่ได้ขอบัญชีนี้ โปรดละเว้นอีเมลหรือ ติดต่อฝ่ายสนับสนุน',
      'email': 'อีเมลที่ใช้สมัคร: {{email}}',
      'expiryWarning': 'ลิงก์เปิดใช้งานนี้จะหมดอายุภายใน {{hours}} ชั่วโมง',
      'footer': 'นี่คืออีเมลอัตโนมัติจาก {{appName}} โปรดอย่าตอบกลับอีเมลนี้',
      'greeting': 'สวัสดี {{userName}},',
      'instructions': 'อีเมลนี้ยืนยันว่าเราได้รับข้อมูลบัญชีของคุณแล้ว หากต้องมีการเปิดใช้งานหรืออนุมัติ คุณจะได้รับอีเมลติดตามผล',
      'intro': 'ขอบคุณที่สมัครใช้งาน {{appName}}',
      'ip': 'IP ที่ร้องขอ: {{ip}}',
      'securityNote': 'เพื่อความปลอดภัย ห้ามแชร์ลิงก์นี้กับผู้อื่น',
      'subject': '{{appName}} - ยืนยันการสมัครสมาชิก',
      'thanks': 'ขอบคุณ\nทีมงาน {{appName}}',
      'time': 'เวลาที่สมัคร: {{timestamp}}'
    }
  },
  'endpoints': {
    'admin': {
      'changeRole': 'เปลี่ยนบทบาทผู้ใช้ (ต้องการสิทธิ์ผู้ดูแลระบบสูงสุด)',
      'createUser': 'สร้างผู้ใช้ใหม่ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboard': 'รับข้อมูลแดชบอร์ดที่ครอบคลุม (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'deleteUser': 'ลบผู้ใช้ (ต้องการสิทธิ์ผู้ดูแลระบบสูงสุด)',
      'stats': 'รับสถิติระบบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'systemHealth': 'รับสถานะสุขภาพของระบบที่ครอบคลุม (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'updateUser': 'อัปเดตข้อมูลผู้ใช้ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'userDetails': 'รับรายละเอียดผู้ใช้ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'usersList': 'แสดงรายชื่อผู้ใช้ทั้งหมด (ต้องการสิทธิ์ผู้ดูแลระบบ)'
    },
    'advanced_audit': {
      'analytics': 'การวิเคราะห์การตรวจสอบขั้นสูง (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'analyticsBehavior': 'การวิเคราะห์พฤติกรรม (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'analyticsPerformance': 'การวิเคราะห์ประสิทธิภาพ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'analyticsSecurity': 'การวิเคราะห์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'archival': 'การจัดเก็บบันทึกการตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'archivalRestore': 'กู้คืนบันทึกที่จัดเก็บ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'archivalRun': 'เรียกใช้กระบวนการจัดเก็บ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'archivalStats': 'สถิติการจัดเก็บ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'archiveManage': 'การจัดการที่เก็บถาวร (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'compliance': 'การรายงานการปฏิบัติตามข้อกำหนด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'complianceReport': 'สร้างรายงานการปฏิบัติตามข้อกำหนด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'exportAdvanced': 'การส่งออกขั้นสูง (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'middlewareStats': 'สถิติมิดเดิลแวร์ (ต้องการสิทธิ์ผู้ดูแลระบบ)'
    },
    'audit': {
      'export': 'ส่งออกบันทึกการตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'logs': 'ดูบันทึกการตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'search': 'ค้นหาบันทึกการตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'stats': 'รับสถิติการตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)'
    },
    'auth': {
      'login': 'เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน',
      'logout': 'ออกจากระบบและทำให้โทเค็นไม่ถูกต้อง',
      'refresh': 'รีเฟรชโทเค็นการเข้าถึง'
    },
    'demo': {
      'info': 'ข้อมูลสาธิตการตรวจสอบความถูกต้องของ Zod',
      'register': 'สาธิตการลงทะเบียนผู้ใช้พร้อมการตรวจสอบที่ครอบคลุม',
      'search': 'สาธิตการค้นหาพร้อมการตรวจสอบพารามิเตอร์การค้นหา',
      'upload': 'สาธิตการอัปโหลดไฟล์พร้อมการตรวจสอบเมตาดาต้า'
    },
    'kv_admin': {
      'audit': {
        'alerts': 'รับเกณฑ์แจ้งเตือนของ Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'compliance': 'รับการตั้งค่าการปฏิบัติตามข้อกำหนดของ Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'configs': 'ดูการกำหนดค่าระบบ Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'export': 'รับการตั้งค่าการส่งออกของ Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'features': 'รับคุณลักษณะ (feature flags) ของ Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'featureToggle': 'สลับคุณลักษณะของ Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'performance': 'รับการตั้งค่าประสิทธิภาพของ Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'realtime': 'รับการตั้งค่าการตรวจสอบแบบเรียลไทม์ (ผู้ดูแลระบบสูงสุดเท่านั้น)',
        'retention': 'รับนโยบายการเก็บรักษา Audit (ผู้ดูแลระบบสูงสุดเท่านั้น)'
      },
      'config': 'ดูการกำหนดค่า KV (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configBulk': 'อัปเดตการกำหนดค่า KV จำนวนมาก (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configCacheClear': 'ล้างแคชการกำหนดค่า KV (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configDefaults': 'รับการกำหนดค่า KV เริ่มต้น (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configDelete': 'ลบคีย์การกำหนดค่า KV (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configEnvComparison': 'เปรียบเทียบการกำหนดค่า KV ระหว่างสภาพแวดล้อม (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configGet': 'รับการกำหนดค่า KV ที่ระบุ (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configs': 'ดูรายการการกำหนดค่า KV (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configsBatch': 'อัปเดตรายการการกำหนดค่า KV แบบกลุ่ม (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configsCacheClear': 'ล้างแคชของรายการการกำหนดค่า KV (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configsDefaults': 'รับรายการการกำหนดค่า KV ค่าเริ่มต้น (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configsEnvComparison': 'เปรียบเทียบรายการการกำหนดค่า KV ข้ามสภาพแวดล้อม (ผู้ดูแลระบบสูงสุดเท่านั้น)',
      'configUpdate': 'อัปเดตการกำหนดค่า KV (ผู้ดูแลระบบสูงสุดเท่านั้น)'
    },
    'realtime_monitoring': {
      'alerts': 'การจัดการการแจ้งเตือนของระบบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsChannels': 'จัดการช่องทางการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsChannelsCreate': 'สร้างช่องทางการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsConfigure': 'กำหนดค่าการแจ้งเตือนของระบบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsHistory': 'รับประวัติการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsRules': 'จัดการกฎการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsRulesCreate': 'สร้างกฎการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsRuleToggle': 'เปิด/ปิดกฎการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsSend': 'ส่งการแจ้งเตือนของระบบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsStatus': 'รับสถานะการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'alertsTest': 'ทดสอบระบบการแจ้งเตือน (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'analyze': 'วิเคราะห์ข้อมูลการตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboard': 'แดชบอร์ดการตรวจสอบแบบเรียลไทม์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardCache': 'ล้างแคชแดชบอร์ด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardExport': 'ส่งออกข้อมูลแดชบอร์ด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardHealth': 'ตรวจสอบสถานะแดชบอร์ด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardLive': 'ภาพรวมแดชบอร์ดสด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardOverview': 'ภาพรวมแดชบอร์ด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardPerformance': 'แดชบอร์ดประสิทธิภาพ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardRealtime': 'ข้อมูลแดชบอร์ดสด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardSecurity': 'แดชบอร์ดความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'dashboardTimeline': 'ไทม์ไลน์แดชบอร์ด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'eventsRecent': 'ดึงเหตุการณ์การตรวจสอบล่าสุด (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'incidentsCreate': 'สร้างเหตุการณ์การตรวจสอบแบบเรียลไทม์ (ต้องใช้สิทธิ์ผู้ดูแลระบบ)',
      'metrics': 'เมตริกของระบบแบบเรียลไทม์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'resolveThreat': 'แก้ไขภัยคุกคามที่ตรวจพบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'simulate': 'จำลองสถานการณ์การตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'start': 'เริ่มการตรวจสอบแบบเรียลไทม์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'status': 'รับสถานะการตรวจสอบ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'stop': 'หยุดการตรวจสอบแบบเรียลไทม์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'threats': 'รับข้อมูลภัยคุกคาม (ต้องการสิทธิ์ผู้ดูแลระบบ)'
    },
    'security_incident': {
      'bulkDelete': 'ลบหลายรายการ {{count}} เหตุการณ์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}})',
      'create': 'สร้างเหตุการณ์ความปลอดภัยใหม่ (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}}, ประเภท {{type}}, ระดับความรุนแรง {{severity}})',
      'deleteById': 'ลบเหตุการณ์ความปลอดภัย {{incidentId}} (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}})',
      'exportCsv': 'ส่งออก {{count}} เหตุการณ์ความปลอดภัยไปยัง CSV (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}}, ช่วงวันที่: {{dateRange}})',
      'getById': 'รับเหตุการณ์ความปลอดภัยด้วย ID {{incidentId}} (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}})',
      'getDashboard': 'รับแดชบอร์ดเหตุการณ์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}}, ตัวกรอง: {{filters}})',
      'getStatistics': 'รับสถิติเหตุการณ์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}}, ระยะเวลา: {{period}})',
      'incidentDetails': 'รับรายละเอียดเหตุการณ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'incidentResponse': 'ดำเนินการตอบสนองต่อเหตุการณ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'incidents': 'แสดงรายการเหตุการณ์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'incidentsCreate': 'สร้างเหตุการณ์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'incidentStatus': 'อัปเดตสถานะเหตุการณ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'incidentUpdate': 'อัปเดตเหตุการณ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'list': 'แสดงรายการเหตุการณ์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}}, หน้า {{page}}, จำกัด {{limit}})',
      'serviceStatus': 'รับสถานะบริการ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'simulate': 'จำลองเหตุการณ์ความปลอดภัย (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'statistics': 'รับสถิติเหตุการณ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      'updateById': 'อัปเดตเหตุการณ์ความปลอดภัย {{incidentId}} (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}}, ฟิลด์ที่อัปเดต: {{fields}})',
      'updateStatus': 'อัปเดตสถานะเหตุการณ์ความปลอดภัย {{incidentId}} เป็น {{status}} (ต้องการสิทธิ์ผู้ดูแลระบบ {{actor}})'
    },
    'system': {
      'apiInfo': 'ข้อมูล API และจุดสิ้นสุดที่ครอบคลุม',
      'favicon': 'ทรัพยากร Favicon และไอคอน',
      'health': 'จุดสิ้นสุดการตรวจสอบสถานะ',
      'language': 'จุดสิ้นสุดการสลับภาษา',
      'root': 'จุดสิ้นสุดรากของ API - ข้อความต้อนรับ',
      'routes': 'การค้นพบเส้นทางของระบบ (ผู้ดูแลระบบเท่านั้น)',
      'unknown': 'ไม่รู้จักจุดสิ้นสุด',
      'version': 'ข้อมูลเวอร์ชัน API'
    },
    'translations': {
      'get': 'รับคำแปลทั้งหมดสำหรับภาษาที่ระบุ',
      'list': 'แสดงรายการภาษาที่มีทั้งหมดและสถานะการตรวจสอบความถูกต้อง',
      'section': 'รับคำแปลเฉพาะส่วน',
      'validate': 'ตรวจสอบความสมบูรณ์ของคำแปล'
    },
    'user': {
      'me': 'รับข้อมูลผู้ใช้ปัจจุบัน (ต้องมีการยืนยันตัวตน)',
      'profile': 'รับโปรไฟล์ผู้ใช้ (ต้องมีการยืนยันตัวตน)',
      'register': 'ลงทะเบียนผู้ใช้ใหม่',
      'updatePassword': 'เปลี่ยนรหัสผ่าน (ต้องมีการยืนยันตัวตน)',
      'updateProfile': 'อัปเดตโปรไฟล์ผู้ใช้ (ต้องมีการยืนยันตัวตน)'
    }
  },
  'errors': {
    'admin': {
      'accessDenied': 'ต้องการสิทธิ์ผู้ดูแลระบบสำหรับการดำเนินการนี้',
      'dashboardRetrieveFailed': 'ไม่สามารถดึงข้อมูลแดชบอร์ดผู้ดูแลระบบได้',
      'permissionDenied': 'สิทธิ์ผู้ดูแลระบบไม่เพียงพอสำหรับการดำเนินการนี้',
      'roleChangeFailed': 'ไม่สามารถเปลี่ยนบทบาทผู้ใช้ได้',
      'statsRetrieveFailed': 'ไม่สามารถดึงสถิติผู้ดูแลระบบได้',
      'systemHealthRetrieveFailed': 'ไม่สามารถดึงข้อมูลสุขภาพระบบได้',
      'userManagementFailed': 'การดำเนินการจัดการผู้ใช้ล้มเหลว'
    },
    'advancedAudit': {
      'analytics': {
        'failed': 'ไม่สามารถดึงข้อมูลการวิเคราะห์ได้ - {{actor}} ไม่สามารถทำ {{operation}} สำหรับช่วงเวลา {{timeframe}} ให้เสร็จสิ้น: {{reason}}'
      },
      'archival': {
        'archiveOperationFailed': 'ไม่สามารถดำเนินการเก็บถาวรได้ - {{actor}} ไม่สามารถทำ {{operation}} ({{action}}) ให้เสร็จสิ้น: {{reason}}',
        'restoreFailed': 'ไม่สามารถคืนค่าล็อกที่เก็บถาวรได้ - {{actor}} ไม่สามารถดำเนินการ {{operation}} สำหรับ {{dateRange}}: {{reason}}',
        'runFailed': 'ไม่สามารถรันกระบวนการเก็บถาวรได้ - {{actor}} ไม่สามารถทำ {{operation}} ด้วยเกณฑ์ {{cutoffDays}} ให้เสร็จสิ้น: {{reason}}',
        'statsFailed': 'ไม่สามารถดึงสถิติการเก็บถาวรได้ - {{actor}} ไม่สามารถดำเนินการ {{operation}}: {{reason}}'
      },
      'behavior': {
        'failed': 'ไม่สามารถดึงการวิเคราะห์พฤติกรรมได้ - {{actor}} ไม่สามารถทำ {{operation}} สำหรับ {{timeframe}} ที่เป้าหมาย {{targetRole}} ให้เสร็จสิ้น: {{reason}}'
      },
      'compliance': {
        'customComplianceFailed': 'ไม่สามารถสร้างรายงานการปฏิบัติตามกฎระเบียบแบบกำหนดเองได้ - {{actor}} ไม่สามารถทำ {{operation}} สำหรับ \"{{reportName}}\" ({{reportType}}) ให้เสร็จสิ้น: {{reason}}',
        'failed': 'ไม่สามารถสร้างรายงานการปฏิบัติตามกฎระเบียบได้ - {{actor}} ไม่สามารถทำ {{operation}} สำหรับ {{timeframe}} ด้วยรูปแบบ {{format}} ให้เสร็จสิ้น: {{reason}}',
        'reportFailed': 'ไม่สามารถสร้างรายงานการปฏิบัติตามกฎระเบียบได้ - {{actor}} ไม่สามารถดำเนินการ {{operation}} สำหรับรายงาน {{type}}: {{reason}}'
      },
      'export': {
        'failed': 'ไม่สามารถทำการส่งออกขั้นสูงได้ - {{actor}} ไม่สามารถทำ {{operation}} ด้วยรูปแบบ {{format}} ({{recordCount}} เรคอร์ด) ให้เสร็จสิ้น: {{reason}}'
      },
      'middleware': {
        'statsFailed': 'ไม่สามารถดึงสถิติมิดเดิลแวร์ได้ - {{actor}} ไม่สามารถดำเนินการ {{operation}} สำหรับ {{middlewareType}}: {{reason}}'
      },
      'performance': {
        'failed': 'ไม่สามารถดึงการวิเคราะห์ประสิทธิภาพได้ - {{actor}} ({{role}}) ไม่สามารถดำเนินการ {{operation}} สำหรับ {{timeframe}}: {{reason}}'
      },
      'security': {
        'failed': 'ไม่สามารถดึงการวิเคราะห์ความปลอดภัยได้ - {{actor}} ({{role}}) ไม่สามารถดำเนินการ {{operation}} สำหรับ {{timeframe}}: {{reason}}'
      }
    },
    'api': {
      'databaseError': 'ข้อผิดพลาดฐานข้อมูลในการเรียก API: {{operation}}',
      'methodNotAllowed': 'HTTP method {{method}} ไม่ได้รับอนุญาตสำหรับเส้นทาง {{path}}',
      'routeNotFound': 'ไม่พบเส้นทาง API: {{method}} {{path}}',
      'validationError': 'ข้อผิดพลาดการตรวจสอบ API: {{details}}'
    },
    'audit': {
      'export': {
        'exportFailed': 'ไม่สามารถส่งออกบันทึกการตรวจสอบได้ - {{actor}} ไม่สามารถทำ {{operation}} ให้เสร็จสมบูรณ์ในรูปแบบ {{format}}: {{reason}}'
      },
      'health': {
        'healthFailed': 'ไม่สามารถตรวจสอบสุขภาพของระบบตรวจสอบได้ - {{actor}} ไม่สามารถทำ {{operation}} ({{checkType}}): {{reason}}'
      },
      'logs': {
        'retrieveFailed': 'ไม่สามารถดึงข้อมูลบันทึกการตรวจสอบได้ - {{actor}} พบข้อผิดพลาดขณะทำ {{operation}}: {{reason}}'
      },
      'search': {
        'searchFailed': 'ไม่สามารถค้นหาในบันทึกการตรวจสอบได้ - {{actor}} ไม่สามารถทำ {{operation}} ให้เสร็จสมบูรณ์ด้วยคำค้นหา \"{{query}}\": {{reason}}'
      },
      'stats': {
        'statsFailed': 'ไม่สามารถดึงสถิติการตรวจสอบได้ - {{actor}} ({{role}}) ไม่สามารถทำ {{operation}}: {{reason}}'
      }
    },
    'auth': {
      'accountDisabled': 'บัญชีผู้ใช้ {{userName}} ถูกปิดใช้งานโดยผู้ดูแลระบบ',
      'accountLocked': 'บัญชีถูกล็อคเป็นเวลา {{duration, time}} เนื่องจากการพยายามเข้าสู่ระบบล้มเหลว',
      'accountNotVerified': 'ที่อยู่อีเมลสำหรับ {{userName}} ยังไม่ได้ยืนยัน',
      'cannotAccessOtherUsers': 'ไม่สามารถเข้าถึงทรัพยากรของผู้ใช้อื่นได้',
      'cannotChangeOwnRole': '{{userName}} ({{currentRole}}) ไม่สามารถเปลี่ยนบทบาทของตนเองได้ - {{reason}}',
      'cannotCreateHigherRole': '{{currentRole}} ไม่สามารถสร้างบัญชี {{requestedRole}} ได้เนื่องจากข้อจำกัดในลำดับชั้นของบทบาท',
      'cannotDeleteSuperAdmin': 'ไม่สามารถลบบัญชีผู้ดูแลระบบสูงสุดได้',
      'cannotDeleteYourself': 'ไม่สามารถลบบัญชีของตัวเองได้',
      'cannotModifyHigherRoleUser': 'ไม่สามารถแก้ไข {{targetUserName}} ({{targetRole}}) - {{currentRole}} {{reason}}',
      'cannotPromoteToHigherRole': '{{currentRole}} ไม่สามารถเลื่อนระดับผู้ใช้เป็น {{requestedRole}} ได้ - {{reason}}',
      'deleteNotAllowed': 'ไม่อนุญาตให้ดำเนินการลบสำหรับบทบาทของคุณ',
      'failed': 'การตรวจสอบสิทธิ์ล้มเหลว: {{reason}}',
      'failed_other': 'การพยายามตรวจสอบสิทธิ์ล้มเหลว {{count}} ครั้งใน {{timeWindow}} ที่ผ่านมา',
      'forbidden': 'การเข้าถึงถูกห้าม - สิทธิ์ไม่เพียงพอสำหรับ {{operation}}',
      'invalidCredentials': 'ระบุอีเมลหรือรหัสผ่านไม่ถูกต้อง',
      'invalidCredentials_context_admin': 'ข้อมูลประจำตัวไม่ถูกต้องสำหรับการเข้าสู่ระบบบัญชีผู้ดูแลระบบ',
      'invalidCredentials_context_user': 'ข้อมูลประจำตัวไม่ถูกต้องสำหรับการเข้าสู่ระบบบัญชีผู้ใช้',
      'loginFailed': 'กระบวนการเข้าสู่ระบบล้มเหลวสำหรับ {{actor}} (เหตุผล: {{reason}}, การดำเนินการ: {{operation}}, IP: {{ipAddress}})',
      'mfaFailed': 'การยืนยันตัวตนแบบหลายปัจจัยล้มเหลว: {{reason}}',
      'mfaRequired': 'ต้องมีการยืนยันตัวตนแบบหลายปัจจัยสำหรับ {{userName}}',
      'passwordIncorrect': 'รหัสผ่านไม่ถูกต้องสำหรับผู้ใช้ {{userName}}',
      'permissionDenied': 'การอนุญาตถูกปฏิเสธสำหรับการดำเนินการ: {{action}}',
      'rateLimitExceeded': 'เกินขีดจำกัดอัตรา: {{currentRequests}}/{{maxRequests}} คำขอต่อ {{timeWindow}}',
      'refreshTokenExpired': 'โทเค็นรีเฟรชหมดอายุที่ {{expiredAt, datetime}}',
      'refreshTokenFailed': 'การรีเฟรชโทเค็นล้มเหลวสำหรับ {{actor}} (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'refreshTokenInvalid': 'โทเค็นรีเฟรชไม่ถูกต้องหรือถูกเพิกถอน',
      'roleRequired': 'ต้องการบทบาท {{requiredRole}} สำหรับการดำเนินการนี้',
      'sessionExpired': 'เซสชันผู้ใช้หมดอายุที่ {{expiredAt, datetime}}',
      'sessionInvalid': 'เซสชันผู้ใช้ไม่ถูกต้องหรือเสียหาย',
      'superAdminRequired': 'ต้องใช้การเข้าถึงผู้ดูแลระบบสูงสุด',
      'tokenExpired': 'โทเค็นการตรวจสอบสิทธิ์หมดอายุที่ {{expiredAt, datetime}}',
      'tokenInvalid': 'โทเค็นการตรวจสอบสิทธิ์ไม่ถูกต้องหรือเสียหาย',
      'tokenMissing': 'ต้องการโทเค็นการตรวจสอบสิทธิ์แต่ไม่ได้ระบุ',
      'tooManyAttempts': 'การพยายามเข้าสู่ระบบล้มเหลวมากเกินไป ({{attemptCount}}) จาก {{ipAddress}}',
      'tooManyAttempts_other': 'การพยายามเข้าสู่ระบบล้มเหลวมากเกินไป ({{attemptCount}} ครั้ง) จาก {{ipAddress}}',
      'unauthorized': 'การเข้าถึงทรัพยากรโดยไม่ได้รับอนุญาต: {{resource}}',
      'userNotFound': 'ไม่พบบัญชีที่มีอีเมล {{email}}'
    },
    'business': {
      'businessHoursOnly': 'อนุญาตการดำเนินการเฉพาะในเวลาทำการ ({{businessHours}})',
      'conflictingOperation': 'มีการดำเนินการที่ขัดแย้งกัน: {{operation}}',
      'deadlineExpired': 'กำหนดเวลาดำเนินการหมดอายุเมื่อวันที่ {{deadline, datetime}}',
      'duplicateEntry': 'ตรวจพบรายการที่ซ้ำกัน: {{entity}} ที่มี {{field}} = \"{{value}}\"',
      'insufficientBalance': 'ยอดเงินไม่เพียงพอ: {{available, currency}} ที่ใช้ได้, ต้องการ {{required, currency}}',
      'operationNotAllowed': 'ไม่อนุญาตการดำเนินการ \"{{operation}}\": {{reason}}',
      'preconditionFailed': 'เงื่อนไขเบื้องต้นล้มเหลว: {{condition}}',
      'quotaReached': 'ถึงขีดจำกัดโควตา: ใช้ไป {{used, number}}/{{limit, number}} {{resource}}',
      'referenceConstraint': 'ไม่สามารถลบ {{entity}} ได้ - อ้างอิงโดย {{referencingCount}} บันทึกอื่น',
      'referenceConstraint_other': 'ไม่สามารถลบ {{entity}} ได้ - อ้างอิงโดย {{referencingCount}} บันทึกอื่น',
      'resourceLocked': 'ทรัพยากร \"{{resource}}\" ถูกล็อกโดย {{lockedBy}} จนถึง {{lockedUntil, datetime}}',
      'workflowViolation': 'การละเมิด Workflow: ไม่สามารถดำเนินการ {{step}} ในสถานะปัจจุบัน {{currentState}}'
    },
    'file': {
      'accessDenied': 'การเข้าถึงไฟล์ \"{{filename}}\" ถูกปฏิเสธ: {{reason}}',
      'corrupted': 'ไฟล์ดูเหมือนจะเสียหายหรือไม่สมบูรณ์',
      'formatUnsupported': 'รูปแบบไฟล์ไม่รองรับสำหรับการดำเนินการ: {{operation}}',
      'invalidType': 'ประเภทไฟล์ \"{{fileType}}\" ไม่ได้รับอนุญาต - ประเภทที่รองรับ: {{allowedTypes}}',
      'notFound': 'ไม่พบไฟล์ \"{{filename}}\"',
      'processingFailed': 'การประมวลผลไฟล์ล้มเหลว: {{reason}}',
      'quotaExceeded': 'เกินโควตาที่เก็บข้อมูล: ใช้ไป {{used, number}}MB / โควตา {{quota, number}}MB',
      'tooLarge': 'ขนาดไฟล์ {{actualSize, number}}MB เกินขีดจำกัด {{maxSize, number}}MB',
      'tooSmall': 'ขนาดไฟล์ {{actualSize, number}} ไบต์ต่ำกว่าขั้นต่ำ {{minSize, number}} ไบต์',
      'uploadFailed': 'การอัพโหลดไฟล์ล้มเหลว: {{reason}}',
      'virusDetected': 'ไฟล์ถูกบล็อกโดยการสแกนความปลอดภัย: {{threat}}'
    },
    'i18n': {
      'context_demo_failed': 'ไม่สามารถรันการสาธิตการแปลตามบริบทได้: {{reason}}',
      'context_test_failed': 'ไม่สามารถทดสอบการแปลตามบริบทได้สำหรับคีย์ \"{{key}}\": {{reason}}',
      'enhanced_demo_failed': 'ไม่สามารถรันการสาธิตคุณลักษณะ i18n ขั้นสูงได้: {{reason}}',
      'error_demo_failed': 'ไม่สามารถรันการสาธิตข้อความแสดงข้อผิดพลาดได้: {{reason}}',
      'formatting_demo_failed': 'ไม่สามารถรันการสาธิตการจัดรูปแบบได้: {{reason}}',
      'formatting_test_failed': 'ไม่สามารถทดสอบฟังก์ชันการจัดรูปแบบได้สำหรับคีย์ \"{{key}}\": {{reason}}',
      'languageNotSupported': 'ภาษา \"{{language}}\" ไม่ได้รับการสนับสนุน ภาษาที่ใช้ได้: {{supportedLanguages}}',
      'plurals_demo_failed': 'ไม่สามารถรันการสาธิตพหูพจน์ได้: {{reason}}',
      'plurals_test_failed': 'ไม่สามารถทดสอบฟังก์ชันพหูพจน์ได้สำหรับคีย์ \"{{key}}\": {{reason}}',
      'sectionNotFound': 'ไม่พบส่วนการแปล \"{{section}}\" สำหรับภาษา \"{{language}}\"',
      'success_demo_failed': 'ไม่สามารถรันการสาธิตข้อความแสดงความสำเร็จได้: {{reason}}',
      'translationsFailed': 'ไม่สามารถดึงข้อมูลการแปลได้: {{reason}}'
    },
    'integration': {
      'apiLimitExceeded': 'เกินขีดจำกัดอัตรา API สำหรับ {{serviceName}}: {{limit}} คำขอต่อ {{period}}',
      'authenticationFailed': 'การยืนยันตัวตนล้มเหลวกับ {{serviceName}}: {{reason}}',
      'credentialsExpired': 'ข้อมูลประจำตัว API สำหรับ {{serviceName}} หมดอายุเมื่อวันที่ {{expiredDate, date}}',
      'dataTransformFailed': 'การแปลงข้อมูลล้มเหลวสำหรับ {{serviceName}}: {{reason}}',
      'invalidResponse': 'การตอบสนองไม่ถูกต้องจาก {{serviceName}}: {{details}}',
      'serviceDown': 'บริการภายนอก {{serviceName}} ไม่สามารถใช้งานได้ในขณะนี้',
      'syncFailed': 'การซิงโครไนซ์ข้อมูลล้มเหลวกับ {{serviceName}}: {{reason}}',
      'webhookTimeout': 'Webhook หมดเวลาจาก {{serviceName}} หลังจาก {{timeout, number}}ms'
    },
    'kv': {
      'accessDenied': 'การเข้าถึงถูกปฏิเสธสำหรับคีย์การกำหนดค่า \"{{key}}\" - ต้องการบทบาท {{requiredRole}}',
      'alertThresholdsRetrieveFailed': 'ไม่สามารถดึงข้อมูลเกณฑ์การแจ้งเตือนได้: {{reason}}',
      'auditConfigsRetrieveFailed': 'ไม่สามารถดึงข้อมูลการกำหนดค่าการตรวจสอบได้: {{reason}}',
      'batchUpdateFailed': 'การอัพเดทแบบกลุ่มล้มเหลวสำหรับ {{failedCount}} จาก {{totalCount}} การกำหนดค่า',
      'batchUpdateFailed_other': 'การอัพเดทแบบกลุ่มล้มเหลวสำหรับ {{failedCount}} จาก {{totalCount}} การกำหนดค่า',
      'cacheClearFailed': 'ไม่สามารถล้างแคชการกำหนดค่าได้: {{reason}}',
      'cacheFailed': 'ล้มเหลวในการอัพเดทแคชการกำหนดค่า: {{reason}}',
      'complianceSettingsRetrieveFailed': 'ไม่สามารถดึงข้อมูลการตั้งค่าการปฏิบัติตามกฎระเบียบได้: {{reason}}',
      'configResetFailed': 'ไม่สามารถรีเซ็ตการกำหนดค่า \"{{key}}\" ได้: {{reason}}',
      'configRetrieveFailed': 'ไม่สามารถดึงข้อมูลการกำหนดค่า \"{{key}}\" ได้: {{reason}}',
      'configsCompareFailed': 'ไม่สามารถดึงข้อมูลการเปรียบเทียบสภาพแวดล้อมได้: {{reason}}',
      'configsRetrieveFailed': 'ไม่สามารถดึงข้อมูลการกำหนดค่าได้: {{reason}}',
      'configUpdateFailed': 'ไม่สามารถอัปเดตการกำหนดค่า \"{{key}}\" ได้: {{reason}}',
      'exportSettingsRetrieveFailed': 'ไม่สามารถดึงข้อมูลการตั้งค่าการส่งออกได้: {{reason}}',
      'featureFlagsRetrieveFailed': 'ไม่สามารถดึงข้อมูลแฟล็กฟีเจอร์ได้: {{reason}}',
      'featureNotFound': 'ไม่พบฟีเจอร์หรือไม่ได้รับอนุญาต',
      'featureToggleFailed': 'ไม่สามารถเปลี่ยนฟีเจอร์ \"{{feature}}\" ได้: {{reason}}',
      'invalidFeatureValue': 'ค่าฟีเจอร์ไม่ถูกต้อง - ต้องเป็นค่าบูลีน',
      'invalidKey': 'คีย์การกำหนดค่า \"{{key}}\" ไม่ได้รับอนุญาต - คีย์ที่ถูกต้อง: {{validKeys}}',
      'keyNotFound': 'ไม่พบคีย์การกำหนดค่า \"{{key}}\"',
      'performanceSettingsRetrieveFailed': 'ไม่สามารถดึงข้อมูลการตั้งค่าประสิทธิภาพได้: {{reason}}',
      'realtimeSettingsRetrieveFailed': 'ไม่สามารถดึงข้อมูลการตั้งค่าการตรวจสอบแบบเรียลไทม์ได้: {{reason}}',
      'resetFailed': 'ล้มเหลวในการรีเซ็ตการกำหนดค่า \"{{key}}\" เป็นค่าเริ่มต้น: {{reason}}',
      'retentionPoliciesRetrieveFailed': 'ไม่สามารถดึงข้อมูลนโยบายการเก็บรักษาได้: {{reason}}',
      'updateFailed': 'ล้มเหลวในการอัพเดทการกำหนดค่า \"{{key}}\": {{reason}}',
      'valueInvalid': 'ค่าไม่ถูกต้องสำหรับการกำหนดค่า \"{{key}}\": คาดหวัง {{expectedType}}, ได้รับ {{actualType}}'
    },
    'kvAdmin': {
      'alertThresholdsRetrieveFailed': 'ไม่สามารถดึงเกณฑ์การแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'auditConfigsRetrieveFailed': 'ไม่สามารถดึงการกำหนดค่าการตรวจสอบสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'cacheClearFailed': 'ไม่สามารถล้างแคชการกำหนดค่า KV สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'complianceSettingsRetrieveFailed': 'ไม่สามารถดึงการตั้งค่าการปฏิบัติตามกฎระเบียบสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'configResetFailed': 'ไม่สามารถรีเซ็ตการกำหนดค่า KV {{key}} สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'configRetrieveFailed': 'ไม่สามารถดึงการกำหนดค่า KV {{key}} สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'configsCompareFailed': 'ไม่สามารถเปรียบเทียบการกำหนดค่า ENV กับ KV สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'configsRetrieveFailed': 'ไม่สามารถดึงการกำหนดค่า KV สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'configUpdateFailed': 'ไม่สามารถอัปเดตการกำหนดค่า KV {{key}} สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'exportSettingsRetrieveFailed': 'ไม่สามารถดึงการตั้งค่าการส่งออกสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'featureFlagsRetrieveFailed': 'ไม่สามารถดึงแฟล็กฟีเจอร์สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'featureToggleFailed': 'ไม่สามารถสลับฟีเจอร์ {{feature}} สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'performanceSettingsRetrieveFailed': 'ไม่สามารถดึงการตั้งค่าประสิทธิภาพสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'realtimeSettingsRetrieveFailed': 'ไม่สามารถดึงการตั้งค่าเรียลไทม์สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
      'retentionPoliciesRetrieveFailed': 'ไม่สามารถดึงนโยบายการเก็บรักษาสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})'
    },
    'network': {
      'apiError': 'ข้อผิดพลาด API ภายนอกจาก {{apiName}}: {{error}}',
      'bandwidthExceeded': 'เกินขีดจำกัดแบนด์วิดธ์: {{usage, number}}MB/{{limit, number}}MB',
      'connectionFailed': 'การเชื่อมต่อล้มเหลวไปยัง {{service, uppercase}}: {{reason}}',
      'connectionRefused': 'การเชื่อมต่อถูกปฏิเสธโดย {{service}} บนพอร์ต {{port}}',
      'dnsResolutionFailed': 'การแปลง DNS ล้มเหลวสำหรับ {{hostname}}',
      'hostUnreachable': 'โฮสต์ {{hostname}} ไม่สามารถเข้าถึงได้',
      'httpError': 'ข้อผิดพลาด HTTP {{statusCode}}: {{statusMessage}}',
      'protocolError': 'ข้อผิดพลาดโปรโตคอลเครือข่าย: {{protocol}} - {{details}}',
      'proxyError': 'ข้อผิดพลาดเซิร์ฟเวอร์พร็อกซี: {{proxyAddress}} - {{reason}}',
      'slowResponse': 'ตรวจพบการตอบสนองช้าจาก {{service}} ({{duration, number}}ms)',
      'socketError': 'ข้อผิดพลาดการเชื่อมต่อ Socket: {{details}}',
      'sslError': 'ข้อผิดพลาดการเชื่อมต่อ SSL/TLS: {{details}}',
      'timeout': 'การขอเครือข่ายหมดเวลาหลังจาก {{duration, number}}ms ไปยัง {{service}}',
      'webhookFailed': 'การส่ง Webhook ล้มเหลวไปยัง {{url}}: {{reason}}'
    },
    'realtimeMonitoring': {
      'alerts': {
        'channelsFailed': 'ไม่สามารถดึงช่องทางการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'createChannelFailed': 'ไม่สามารถสร้างช่องทางการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'createRuleFailed': 'ไม่สามารถสร้างกฎการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'historyFailed': 'ไม่สามารถดึงประวัติการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'rulesFailed': 'ไม่สามารถดึงกฎการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'sendFailed': 'ไม่สามารถส่งการแจ้งเตือนด้วยตนเองสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'statusFailed': 'ไม่สามารถดึงสถานะระบบการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'testFailed': 'ไม่สามารถทดสอบระบบการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'toggleFailed': 'ไม่สามารถสลับกฎการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})'
      },
      'alertsConfig': {
        'configFailed': 'ไม่สามารถกำหนดค่าการแจ้งเตือนสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})'
      },
      'dashboard': {
        'cacheClearFailed': 'ไม่สามารถล้างแคชแดชบอร์ดสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'exportFailed': 'ไม่สามารถส่งออกแดชบอร์ดสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'healthCheckFailed': 'ไม่สามารถดำเนินการตรวจสอบสุขภาพแดชบอร์ดสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'overviewFailed': 'ไม่สามารถดึงภาพรวมแดชบอร์ดสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'performanceFailed': 'ไม่สามารถดึงแดชบอร์ดประสิทธิภาพสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'realtimeFailed': 'ไม่สามารถดึงแดชบอร์ดเรียลไทม์สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'securityFailed': 'ไม่สามารถดึงแดชบอร์ดความปลอดภัยสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'timelineFailed': 'ไม่สามารถดึงไทม์ไลน์แดชบอร์ดสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})'
      },
      'incidents': {
        'createFailed': 'ไม่สามารถสร้างเหตุการณ์การตรวจสอบแบบเรียลไทม์สำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})'
      },
      'monitoring': {
        'eventsFailed': 'ไม่สามารถดึงเหตุการณ์การตรวจสอบล่าสุดสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'simulateFailed': 'ไม่สามารถจำลองเหตุการณ์การตรวจสอบสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'startFailed': 'ไม่สามารถเริ่มการตรวจสอบสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'statusFailed': 'ไม่สามารถดึงสถานะการตรวจสอบสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'stopFailed': 'ไม่สามารถหยุดการตรวจสอบสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})'
      },
      'threats': {
        'analyzeFailed': 'ไม่สามารถวิเคราะห์ภัยคุกคามสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'resolveFailed': 'ไม่สามารถแก้ไขภัยคุกคามสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})',
        'retrieveFailed': 'ไม่สามารถดึงสถานะภัยคุกคามสำหรับ {{actor}} ได้ (เหตุผล: {{reason}}, การดำเนินการ: {{operation}})'
      }
    },
    'security': {
      'incident': {
        'notFound': 'ไม่พบเหตุการณ์ความปลอดภัย (ID: {{incidentId}}, การดำเนินการ: {{operation}}, ขอโดย: {{requestedBy}})'
      },
      'incidents': {
        'createFailed': '{{actor}} ไม่สามารถสร้างเหตุการณ์ความปลอดภัยได้ (ข้อผิดพลาด: {{errorType}}) เมื่อ {{timestamp}}',
        'responseExecuteFailed': 'ไม่สามารถดำเนินการตอบสนองด้วยตนเองสำหรับเหตุการณ์ความปลอดภัยได้เนื่องจากข้อผิดพลาดของเซิร์ฟเวอร์',
        'retrieveDetailFailed': 'ไม่สามารถดึงรายละเอียดเหตุการณ์ความปลอดภัยได้เนื่องจากข้อผิดพลาดของเซิร์ฟเวอร์',
        'retrieveFailed': '{{actor}} ไม่สามารถดึงข้อมูลเหตุการณ์ความปลอดภัยได้ (ข้อผิดพลาด: {{errorType}}) เมื่อ {{timestamp}}',
        'simulationFailed': 'ไม่สามารถจำลองภัยคุกคามได้',
        'simulationNotAllowed': 'ไม่อนุญาตให้จำลองความปลอดภัยในสภาพแวดล้อม {{environment}} (ขอโดย: {{requestedBy}}, เหตุผล: {{reason}})',
        'statusUpdateFailed': 'ไม่สามารถอัปเดตสถานะเหตุการณ์ความปลอดภัยได้เนื่องจากข้อผิดพลาดของเซิร์ฟเวอร์'
      },
      'monitoring': {
        'alreadyRunning': 'การตรวจสอบความปลอดภัยกำลังทำงานอยู่แล้ว'
      },
      'service': {
        'statusRetrieveFailed': 'ไม่สามารถดึงสถานะบริการความปลอดภัยได้เนื่องจากข้อผิดพลาดของเซิร์ฟเวอร์'
      },
      'statistics': {
        'retrieveFailed': 'ไม่สามารถดึงสถิติเหตุการณ์ได้เนื่องจากข้อผิดพลาดของเซิร์ฟเวอร์'
      }
    },
    'system': {
      'cacheError': 'การดำเนินการแคชล้มเหลว: {{operation}} - {{error}}',
      'configurationError': 'ข้อผิดพลาดการกำหนดค่าระบบ: {{setting}} - {{error}}',
      'databaseConnectionFailed': 'ล้มเหลวในการเชื่อมต่อฐานข้อมูล: {{reason}}',
      'databaseError': 'การดำเนินการฐานข้อมูลล้มเหลว: {{operation}} - {{error}}',
      'databaseTimeout': 'การสืบค้นฐานข้อมูลหมดเวลาหลังจาก {{timeout, number}}ms',
      'dependencyFailure': 'ความล้มเหลวของการพึ่งพาภายนอก: {{service}} - {{reason}}',
      'diskSpaceLow': 'พื้นที่ดิสก์เหลือน้อยมาก: {{freeSpace, number}}GB เหลืออยู่',
      'licenseExpired': 'ใบอนุญาตระบบหมดอายุเมื่อวันที่ {{expiredDate, date}}',
      'licenseInvalid': 'ใบอนุญาตระบบไม่ถูกต้อง: {{reason}}',
      'maintenanceMode': 'ระบบอยู่ในระหว่างการบำรุงรักษาจนถึง {{endTime, datetime}} - {{message}}',
      'memoryExhausted': 'การใช้หน่วยความจำเซิร์ฟเวอร์อยู่ในภาวะวิกฤต: {{currentUsage, number}}MB / {{maxMemory, number}}MB',
      'operationFailed': 'การดำเนินการระบบ \"{{operation}}\" ล้มเหลว: {{reason}}',
      'rateLimited': 'ระบบถูกจำกัดอัตราชั่วคราว: {{currentRequests}}/{{maxRequests}} คำขอภายใน {{timeWindow}}',
      'resourceExhausted': 'ทรัพยากรระบบหมด: {{resource}} ที่ {{usage, number}}% ของความสามารถ',
      'serverError': 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      'serviceUnavailable': 'บริการไม่สามารถใช้งานได้ชั่วคราว: {{reason}}',
      'taskQueueFull': 'คิวงานเต็ม ({{currentTasks}}/{{maxTasks}} งาน)',
      'workerUnavailable': 'ไม่มี Worker ที่พร้อมใช้งานเพื่อประมวลผลคำขอ'
    },
    'user': {
      'accountLocked': 'บัญชีผู้ใช้ {{userName}} ถูกล็อคเนื่องจาก {{reason}}',
      'accountSuspended': 'บัญชีผู้ใช้ {{userName}} ถูกระงับจนถึง {{suspendedUntil, datetime}}',
      'activationFailed': 'ไม่สามารถเปิดใช้งานบัญชีผู้ใช้สำหรับ {{userName}}: {{reason}}',
      'bulkOperationFailed': 'การดำเนินการแบบกลุ่มล้มเหลวสำหรับ {{failedCount}} จาก {{totalCount}} ผู้ใช้',
      'bulkOperationFailed_other': 'การดำเนินการแบบกลุ่มล้มเหลวสำหรับ {{failedCount}} จาก {{totalCount}} ผู้ใช้',
      'createFailed': 'ล้มเหลวในการสร้างบัญชีผู้ใช้สำหรับ {{email}}: {{reason}}',
      'deactivationFailed': 'ไม่สามารถปิดใช้งานบัญชีผู้ใช้สำหรับ {{userName}}: {{reason}}',
      'deleteFailed': 'ล้มเหลวในการลบผู้ใช้ {{userName}}: {{reason}}',
      'emailExists': 'ที่อยู่อีเมล {{email}} ถูกลงทะเบียนในระบบแล้ว',
      'inactive': 'บัญชีผู้ใช้ {{userName}} ไม่ได้ใช้งาน',
      'insufficientPermissions': 'สิทธิ์ไม่เพียงพอในการแก้ไขผู้ใช้ {{userName}} ({{userRole}})',
      'listFailed': 'ล้มเหลวในการดึงรายชื่อผู้ใช้: {{reason}}',
      'notFound': 'ผู้ใช้ \"{{userName}}\" ไม่พบหรือถูกลบแล้ว',
      'notFoundById': 'ไม่พบผู้ใช้ที่มี ID {{userId}}',
      'passwordChangeFailed': 'ล้มเหลวในการเปลี่ยนรหัสผ่านสำหรับ {{userName}}: {{reason}}',
      'passwordIncorrect': 'รหัสผ่านปัจจุบันไม่ถูกต้อง - กรุณาลองใหม่',
      'profileRetrieveFailed': 'ล้มเหลวในการดึงโปรไฟล์ผู้ใช้สำหรับ {{userName}}: {{reason}}',
      'registrationError': 'การลงทะเบียนผู้ใช้ล้มเหลวเนื่องจากข้อผิดพลาดระบบ: {{details}}',
      'registrationFailed': 'การลงทะเบียนผู้ใช้ล้มเหลว: {{reason}}',
      'roleChangeFailed': 'ล้มเหลวในการเปลี่ยนบทบาทสำหรับ {{userName}} จาก {{oldRole}} เป็น {{newRole}}: {{reason}}',
      'sessionLimitExceeded': 'ผู้ใช้ {{userName}} เกินขีดจำกัดเซสชันที่เกิดขึ้นพร้อมกันสูงสุด ({{currentSessions}}/{{maxSessions}})',
      'updateFailed': 'ล้มเหลวในการอัพเดทโปรไฟล์ผู้ใช้สำหรับ {{userName}}: {{reason}}',
      'usernameExists': 'ชื่อผู้ใช้ \"{{username}}\" ถูกใช้แล้ว'
    },
    'zodDemo': {
      'file': {
        'uploadFailed': 'การอัปโหลดไฟล์ล้มเหลว - {{actor}} ไม่สามารถดำเนินการ {{operation}} สำหรับ \"{{fileName}}\" ({{fileSize}} ไบต์) ได้: {{reason}}'
      },
      'search': {
        'failed': 'การค้นหาล้มเหลว - {{actor}} ไม่สามารถดำเนินการ {{operation}} สำหรับคำค้น \"{{query}}\" ({{searchType}}) ได้: {{reason}}'
      },
      'user': {
        'registrationFailed': 'การลงทะเบียนผู้ใช้ล้มเหลว - {{actor}} ไม่สามารถดำเนินการ {{operation}} ให้กับ {{userName}} ({{email}}) ได้: {{reason}}'
      }
    },
    'businessRuleViolation': 'การละเมิดกฎทางธุรกิจ: {{rules}}',
    'constraintViolation': 'การละเมิดข้อจำกัดฐานข้อมูล: {{constraint}}',
    'dataIntegrityError': 'ข้อผิดพลาดความสมบูรณ์ของข้อมูล: {{details}}',
    'schemaViolation': 'การละเมิด Schema ข้อมูล: {{violations}}',
    'validation': 'เกิดข้อผิดพลาดในการตรวจสอบ: {{details}}',
    'validation_other': 'เกิดข้อผิดพลาดในการตรวจสอบ {{count}} ข้อ: {{details}}',
    'validationField': 'การตรวจสอบล้มเหลวสำหรับฟิลด์ \"{{field}}\": {{error}}',
    'validationGeneric': 'ข้อผิดพลาดการตรวจสอบ',
    'validationMultiple': 'ข้อผิดพลาดการตรวจสอบหลายข้อในฟิลด์ {{count}} ฟิลด์',
    'validationMultiple_other': 'ข้อผิดพลาดการตรวจสอบหลายข้อในฟิลด์ {{count}} ฟิลด์'
  },
  'formatting': {
    'currency': 'รวม: {{amount, currency}}',
    'dateRange': 'ตั้งแต่ {{startDate, date}} ถึง {{endDate, date}}',
    'filesSize': '{{count}} ไฟล์ขนาด {{size, number}} ไบต์',
    'filesSize_other': '{{count}} ไฟล์รวมขนาด {{size, number}} ไบต์',
    'percentage': 'ความคืบหน้า: {{value, number}}%',
    'timeAgo': '{{time, time}} ที่ผ่านมา'
  },
  'numbers': {
    'count': '{{value, number}}',
    'currency': '฿{{value, number}}',
    'percentage': '{{value}}%'
  },
  'roles': {
    'displayName': 'บทบาท',
    'displayName_context_admin': 'ผู้ดูแลระบบ',
    'displayName_context_super_admin': 'ผู้ดูแลระบบสูงสุด',
    'displayName_context_user': 'ผู้ใช้'
  },
  'security': {
    'alerts': {
      'alertTemplate': 'การแจ้งเตือน: {{name}} - {{eventType}}',
      'channelCreated': 'สร้างช่องทางการแจ้งเตือนสำเร็จ',
      'channelsFailed': 'ล้มเหลวในการดึงช่องทางการแจ้งเตือน',
      'createChannelFailed': 'ล้มเหลวในการสร้างช่องทางการแจ้งเตือน',
      'createRuleFailed': 'ล้มเหลวในการสร้างกฎการแจ้งเตือน',
      'historyFailed': 'ล้มเหลวในการดึงประวัติการแจ้งเตือน',
      'manualSent': 'ส่งการแจ้งเตือนด้วยตนเองสำเร็จ',
      'ruleCreated': 'สร้างกฎการแจ้งเตือนสำเร็จ',
      'rulesFailed': 'ล้มเหลวในการดึงกฎการแจ้งเตือน',
      'ruleToggled': 'สลับกฎการแจ้งเตือนสำเร็จ',
      'ruleToggledTestMode': 'สลับกฎสำเร็จ (โหมดทดสอบ)',
      'sendFailed': 'ล้มเหลวในการส่งการแจ้งเตือนแบบแมนยวล',
      'statusFailed': 'ล้มเหลวในการdataฏิข้อมูลสถานะระบบแจ้งเตือน',
      'testCompleted': 'การทดสอบระบบการแจ้งเตือนเสร็จสิ้น',
      'testFailed': 'ล้มเหลวในการทดสอบระบบแจ้งเตือน',
      'toggleFailed': 'ล้มเหลวในการเปิด/ปิดกฎการแจ้งเตือน'
    }
  },
  'success': {
    'admin': {
      'backupCompleted': 'สำรองข้อมูลระบบเสร็จสิ้น ({{backupSize, number}}MB ใน {{duration, number}}s)',
      'backupRestored': 'คืนค่าการสำรองข้อมูลระบบสำเร็จจาก {{backupDate, date}}',
      'cacheCleared': 'ล้างแคชระบบสำเร็จ - เพิ่มพื้นที่ว่าง {{freedMemory, number}}MB',
      'configurationUpdated': 'อัพเดทการกำหนดค่าระบบสำเร็จ - แก้ไขการตั้งค่า {{changedSettings}} การตั้งค่า',
      'configurationUpdated_other': 'อัพเดทการกำหนดค่าระบบสำเร็จ - แก้ไขการตั้งค่า {{changedSettings}} การตั้งค่า',
      'databaseOptimized': 'เพิ่มประสิทธิภาพฐานข้อมูลเสร็จสิ้น - ประมวลผลตาราง {{optimizedTables}} ตาราง',
      'databaseOptimized_other': 'เพิ่มประสิทธิภาพฐานข้อมูลเสร็จสิ้น - ประมวลผลตาราง {{optimizedTables}} ตาราง',
      'logRotationCompleted': 'หมุนเวียน Log เสร็จสมบูรณ์ - {{archivedLogs}} ไฟล์ Log ถูกเก็บถาวร',
      'logRotationCompleted_other': 'หมุนเวียน Log เสร็จสมบูรณ์ - {{archivedLogs}} ไฟล์ Log ถูกเก็บถาวร',
      'maintenanceCompleted': 'การบำรุงรักษาระบบเสร็จสิ้น - เวลาหยุดทำงาน: {{downtimeDuration}}',
      'maintenanceScheduled': 'กำหนดการบำรุงรักษาระบบสำหรับ {{maintenanceDate, date}} เวลา {{maintenanceTime, time}}',
      'reportCreated': 'สร้างรายงานการดูแลระบบด้วยเรคคอร์ด {{recordCount, number}} เรคคอร์ด',
      'reportCreated_other': 'สร้างรายงานการดูแลระบบด้วยเรคคอร์ด {{recordCount, number}} เรคคอร์ด',
      'securityScanCompleted': 'สแกนความปลอดภัยเสร็จสมบูรณ์ - ตรวจพบ {{threatsFound}} ภัยคุกคาม',
      'securityScanCompleted_other': 'สแกนความปลอดภัยเสร็จสมบูรณ์ - ตรวจพบ {{threatsFound}} ภัยคุกคาม',
      'serviceRestarted': 'รีสตาร์ทบริการระบบ {{serviceName}} สำเร็จ',
      'statsGenerated': 'สร้างสถิติระบบสำเร็จสำหรับช่วงเวลา {{period}} - จุดข้อมูล {{dataPoints}} จุด',
      'statsGenerated_other': 'สร้างสถิติระบบสำเร็จสำหรับช่วงเวลา {{period}} - จุดข้อมูล {{dataPoints}} จุด',
      'systemHealthy': 'ตรวจสอบสุขภาพระบบเสร็จสิ้น: {{status, uppercase}} ({{uptime, number}}% เวลาทำงาน)',
      'userDetailsRetrieved': 'ดึงข้อมูลรายละเอียดผู้ใช้: {{userName}} ({{userRole}}, {{userStatus}}). {{joinedDate}} {{requestedBy}}'
    },
    'advancedAudit': {
      'analytics': {
        'retrieved': 'ดึงข้อมูลการวิเคราะห์การตรวจสอบขั้นสูงสำเร็จ'
      },
      'archival': {
        'restoreCompleted': 'การกู้คืนข้อมูลที่จัดเก็บเสร็จสมบูรณ์สำเร็จ โดยกู้คืน {{restoredCount}} รายการ และข้าม {{skippedCount}} รายการ',
        'runCompleted': 'กระบวนการจัดเก็บถาวรเสร็จสมบูรณ์ด้วย {{archivedCount}} รายการที่จัดเก็บและเหลือ {{remainingCount}} รายการ',
        'statsRetrieved': 'ดึงสถิติการจัดเก็บถาวรสำเร็จ'
      },
      'behavior': {
        'analyzed': 'การวิเคราะห์พฤติกรรมผู้ใช้เสร็จสมบูรณ์สำเร็จ'
      },
      'compliance': {
        'generated': 'สร้างรายงานการตรวจสอบการปฏิบัติตามข้อกำหนดสำเร็จ'
      },
      'performance': {
        'analyzed': 'การวิเคราะห์ประสิทธิภาพการตรวจสอบเสร็จสมบูรณ์สำเร็จ'
      },
      'security': {
        'analyzed': 'การวิเคราะห์ด้านความปลอดภัยของการตรวจสอบเสร็จสมบูรณ์สำเร็จ'
      }
    },
    'auditMessages': {
      'exported': 'ส่งออกบันทึกการตรวจสอบสำเร็จ',
      'healthRetrieved': 'ดึงสถานะสุขภาพของระบบตรวจสอบ (audit) สำเร็จ',
      'retrieved': 'ดึงข้อความตรวจสอบ (audit) สำเร็จ',
      'searchCompleted': 'ค้นหาการตรวจสอบเสร็จสิ้นสำเร็จพร้อมผลลัพธ์ {{resultCount}} รายการ',
      'searchCompleted_other': 'ค้นหาการตรวจสอบเสร็จสิ้นสำเร็จพร้อมผลลัพธ์ {{resultCount}} รายการ',
      'statsRetrieved': 'ดึงสถิติการตรวจสอบสำเร็จ'
    },
    'auth': {
      'accessGranted': 'อนุญาตการเข้าถึง {{resource}} สำหรับ {{userName}}',
      'accountUnlocked': 'ปลดล็อคบัญชี {{userName}} สำเร็จโดย {{unlockedBy}}',
      'loginSuccess': 'เข้าสู่ระบบสำเร็จในชื่อ {{userName}} ({{userRole}}) ที่ {{loginTime}}',
      'logoutAllSuccess': 'ออกจากระบบจากทุกอุปกรณ์ที่ {{logoutTime}}',
      'logoutSuccess': 'ออกจากระบบสำเร็จจาก {{deviceInfo}} ที่ {{logoutTime}}',
      'mfaEnabled': 'เปิดใช้งานการยืนยันตัวตนแบบหลายปัจจัยสำเร็จสำหรับ {{userName}}',
      'mfaVerified': 'ยืนยันตัวตนแบบหลายปัจจัยสำเร็จ',
      'passwordChanged': 'เปลี่ยนรหัสผ่านสำเร็จสำหรับ {{userName}} ที่ {{changeTime}}',
      'passwordReset': 'ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง {{email}} - หมดอายุใน {{expiryMinutes}} นาที',
      'passwordReset_other': 'ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง {{email}} - หมดอายุใน {{expiryMinutes}} นาที',
      'permissionGranted': 'อนุญาตสิทธิ์ \"{{permission}}\" ให้ {{userName}}',
      'rateLimitReset': 'รีเซ็ตขีดจำกัดอัตราสำเร็จสำหรับ {{ipAddress}}',
      'roleAssigned': 'มอบหมายบทบาท {{newRole}} สำเร็จให้ {{userName}} โดย {{assignedBy}}',
      'sessionCreated': 'สร้างเซสชันผู้ใช้ใหม่ที่มีอายุ {{sessionDuration}} นาที',
      'sessionCreated_other': 'สร้างเซสชันผู้ใช้ใหม่ที่มีอายุ {{sessionDuration}} นาที',
      'sessionExtended': 'ขยายเซสชันผู้ใช้จนถึง {{newExpiry}}',
      'tokenGenerated': 'สร้างโทเค็นการเข้าถึงใหม่ - หมดอายุที่ {{expiryTime}}',
      'tokenRefreshed': 'รีเฟรชโทเค็นการตรวจสอบสิทธิ์สำเร็จที่ {{refreshTime}}'
    },
    'business': {
      'auditPassed': 'การตรวจสอบทางธุรกิจผ่านด้วยคะแนน {{auditScore, number}}% - {{criteriaCount}} เกณฑ์ได้รับการปฏิบัติตาม',
      'auditPassed_other': 'การตรวจสอบทางธุรกิจผ่านด้วยคะแนน {{auditScore, number}}% - {{criteriaCount}} เกณฑ์ได้รับการปฏิบัติตาม',
      'complianceVerified': 'การตรวจสอบการปฏิบัติตามข้อกำหนดเสร็จสมบูรณ์ - {{standardsCount}} มาตรฐานได้รับการตรวจสอบ',
      'complianceVerified_other': 'การตรวจสอบการปฏิบัติตามข้อกำหนดเสร็จสมบูรณ์ - {{standardsCount}} มาตรฐานได้รับการตรวจสอบ',
      'operationApproved': 'การดำเนินการทางธุรกิจ \"{{operation}}\" ได้รับอนุมัติโดย {{approvedBy}}',
      'processAutomated': 'กระบวนการทางธุรกิจถูกทำให้เป็นอัตโนมัติสำเร็จ - {{automatedTasks}} งานถูกทำให้เป็นอัตโนมัติ',
      'processAutomated_other': 'กระบวนการทางธุรกิจถูกทำให้เป็นอัตโนมัติสำเร็จ - {{automatedTasks}} งานถูกทำให้เป็นอัตโนมัติ',
      'ruleApplied': 'กฎทางธุรกิจ \"{{ruleName}}\" ถูกนำไปใช้สำเร็จกับ {{affectedRecords}} รายการ',
      'ruleApplied_other': 'กฎทางธุรกิจ \"{{ruleName}}\" ถูกนำไปใช้สำเร็จกับ {{affectedRecords}} รายการ',
      'validationPassed': 'การตรวจสอบทางธุรกิจผ่านสำหรับ {{entityType}} - การตรวจสอบทั้งหมด {{checkCount}} รายการสำเร็จ',
      'validationPassed_other': 'การตรวจสอบทางธุรกิจผ่านสำหรับ {{entityType}} - การตรวจสอบทั้งหมด {{checkCount}} รายการสำเร็จ',
      'workflowCompleted': 'Workflow \"{{workflowName}}\" เสร็จสมบูรณ์ใน {{steps}} ขั้นตอน',
      'workflowCompleted_other': 'Workflow \"{{workflowName}}\" เสร็จสมบูรณ์ใน {{steps}} ขั้นตอน'
    },
    'file': {
      'backup': 'สร้างสำรองข้อมูลไฟล์สำเร็จสำหรับ \"{{filename}}\"',
      'compressed': 'บีบอัดไฟล์สำเร็จ - ลดขนาดลง {{compressionRatio, number}}%',
      'converted': 'แปลงไฟล์สำเร็จจาก {{sourceFormat}} เป็น {{targetFormat}}',
      'copied': 'คัดลอกไฟล์สำเร็จไปยัง {{destinationPath}}',
      'deleted': 'ลบไฟล์ \"{{filename}}\" สำเร็จ',
      'downloadCompleted': 'ดาวน์โหลดไฟล์ \"{{filename}}\" สำเร็จ',
      'extracted': 'แตกไฟล์บีบอัดสำเร็จ - แตกไฟล์ {{extractedCount}} ไฟล์',
      'extracted_other': 'แตกไฟล์บีบอัดสำเร็จ - แตกไฟล์ {{extractedCount}} ไฟล์',
      'moved': 'ย้ายไฟล์สำเร็จจาก {{sourcePath}} ไปยัง {{destinationPath}}',
      'processingCompleted': 'ประมวลผลไฟล์เสร็จสิ้นสำหรับ \"{{filename}}\" - ดำเนินการ {{operationsCount}} การดำเนินการ',
      'processingCompleted_other': 'ประมวลผลไฟล์เสร็จสิ้นสำหรับ \"{{filename}}\" - ดำเนินการ {{operationsCount}} การดำเนินการ',
      'restored': 'กู้คืนไฟล์สำเร็จจากสำรองข้อมูลที่สร้างเมื่อ {{backupDate, date}}',
      'uploadCompleted': 'อัพโหลดไฟล์ \"{{filename}}\" สำเร็จ ({{fileSize}})',
      'uploadsBatch': 'อัพโหลดแบบกลุ่มเสร็จสิ้น: {{successCount}}/{{totalCount}} ไฟล์ประมวลผล',
      'uploadsBatch_other': 'อัพโหลดแบบกลุ่มเสร็จสิ้น: {{successCount}}/{{totalCount}} ไฟล์ประมวลผล',
      'validated': 'การตรวจสอบไฟล์ผ่านสำหรับ \"{{filename}}\" - รูปแบบ: {{fileFormat}}'
    },
    'integration': {
      'apiCall': 'การเรียก API ไปยัง {{serviceName}} เสร็จสมบูรณ์ใน {{responseTime, number}}ms',
      'credentialsValidated': 'ข้อมูลประจำตัว API ได้รับการตรวจสอบสำเร็จสำหรับ {{serviceName}}',
      'dataSync': 'การซิงโครไนซ์ข้อมูลเสร็จสมบูรณ์กับ {{serviceName}} - ประมวลผล {{syncedRecords}} รายการ',
      'dataSync_other': 'การซิงโครไนซ์ข้อมูลเสร็จสมบูรณ์กับ {{serviceName}} - ประมวลผล {{syncedRecords}} รายการ',
      'dataTransform': 'การแปลงข้อมูลเสร็จสมบูรณ์ - ประมวลผล {{transformedRecords}} รายการ',
      'dataTransform_other': 'การแปลงข้อมูลเสร็จสมบูรณ์ - ประมวลผล {{transformedRecords}} รายการ',
      'healthCheckPassed': 'การตรวจสอบสถานะบริการภายนอกผ่านสำหรับ {{serviceName}}',
      'rateLimit': 'สถานะขีดจำกัดอัตรา API: เหลือ {{usedRequests}}/{{maxRequests}} คำขอ',
      'serviceConnected': 'เชื่อมต่อกับ {{serviceName}} สำเร็จ - สถานะ: {{serviceStatus}}',
      'subscriptionActive': 'การสมัครใช้บริการเปิดใช้งานอยู่สำหรับ {{serviceName}} จนถึง {{expiryDate, date}}',
      'webhookDelivered': 'Webhook ถูกส่งสำเร็จไปยัง {{webhookUrl}} - สถานะ: {{deliveryStatus}}'
    },
    'kv': {
      'configs': {
        'comparisonRetrieved': 'ดึงข้อมูลการเปรียบเทียบสภาพแวดล้อมโดย {{actor}} - KV: {{kvCount}}, ENV: {{envCount}}, เริ่มต้น: {{defaultCount}}',
        'configRetrieved': 'ดึงข้อมูลการกำหนดค่า \"{{key}}\" โดย {{actor}}: {{value}} (เริ่มต้น: {{isDefault}})',
        'defaultsRetrieved': 'ดึงข้อมูลการกำหนดค่าเริ่มต้นโดย {{actor}} ({{keyCount}} คีย์)',
        'retrieved': 'ดึงข้อมูลการกำหนดค่า {{configCount}} รายการสำเร็จโดย {{actor}} ({{allowedKeys}} คีย์ที่อนุญาต)'
      },
      'status': {
        'disabled': 'ปิดใช้งาน',
        'enabled': 'เปิดใช้งาน'
      },
      'adminCacheCleared': 'ล้างแคชการกำหนดค่าโดย {{actor}}',
      'adminConfigReset': 'รีเซ็ตการกำหนดค่า \"{{key}}\" เป็นค่าเริ่มต้นโดย {{actor}} - เดิม: {{oldValue}}, ตอนนี้: {{defaultValue}}',
      'adminConfigUpdated': 'อัปเดตการกำหนดค่า \"{{key}}\" โดย {{actor}} จาก {{oldValue}} เป็น {{newValue}}',
      'adminFeatureToggled': 'เปลี่ยนฟีเจอร์ \"{{feature}}\" โดย {{actor}}: {{previousValue}} → {{newValue}}',
      'auditConfigsRetrieved': 'ดึงข้อมูลการกำหนดค่าการตรวจสอบโดย {{actor}} ({{configCount}} การกำหนดค่า)',
      'auditPerformanceRetrieved': 'ดึงข้อมูลการตั้งค่าประสิทธิภาพการตรวจสอบโดย {{actor}} ({{settingCount}} การตั้งค่า)',
      'auditRetentionRetrieved': 'ดึงข้อมูลนโยบายการเก็บรักษาการตรวจสอบโดย {{actor}} ({{policyCount}} นโยบาย)',
      'backupCreated': 'สำรองข้อมูลการกำหนดค่าสำเร็จด้วย {{configCount}} การตั้งค่า',
      'backupCreated_other': 'สำรองข้อมูลการกำหนดค่าสำเร็จด้วย {{configCount}} การตั้งค่า',
      'batchConfigUpdated': 'อัปเดตการกำหนดค่าแบบกลุ่มโดย {{actor}}: {{updatedCount}}/{{totalCount}} อัปเดต ({{failedCount}} ล้มเหลว)',
      'batchUpdateCompleted': 'การอัพเดทการกำหนดค่าแบบกลุ่มเสร็จสิ้น: {{successCount}}/{{totalCount}} สำเร็จ',
      'cacheCleared': 'ล้างแคชการกำหนดค่าสำเร็จ - ลบ {{clearedCount}} รายการ',
      'cacheCleared_other': 'ล้างแคชการกำหนดค่าสำเร็จ - ลบ {{clearedCount}} รายการ',
      'configReset': 'รีเซ็ตการกำหนดค่า \"{{key}}\" เป็นค่าเริ่มต้น: {{defaultValue}}',
      'configRetrieved': 'ดึงการกำหนดค่า \"{{key}}\" สำเร็จ: {{value}}',
      'configUpdated': 'อัพเดทการกำหนดค่า \"{{key}}\" สำเร็จจาก {{oldValue}} เป็น {{newValue}}',
      'defaultsRestored': 'คืนค่าการกำหนดค่าเริ่มต้นสำเร็จสำหรับ {{restoredCount}} คีย์',
      'defaultsRestored_other': 'คืนค่าการกำหนดค่าเริ่มต้นสำเร็จสำหรับ {{restoredCount}} คีย์',
      'featureToggled': 'คุณสมบัติ \"{{feature}}\" {{status}} สำเร็จ'
    },
    'operation': {
      'batchProcessed': 'การดำเนินการแบบกลุ่มเสร็จสิ้น: ประมวลผล {{successCount}}/{{totalCount}} รายการสำเร็จ',
      'completed': 'การดำเนินการ \"{{operationType}}\" เสร็จสิ้นสำเร็จใน {{duration}}ms',
      'completed_other': 'การดำเนินการ {{count}} รายการเสร็จสิ้นสำเร็จ - เวลาเฉลี่ย: {{avgDuration}}ms',
      'taskFinished': 'งาน \"{{taskName}}\" เสร็จสิ้นสำเร็จด้วย {{resultCount}} ผลลัพธ์',
      'taskFinished_other': 'งาน \"{{taskName}}\" เสร็จสิ้นสำเร็จด้วย {{resultCount}} ผลลัพธ์',
      'workflowCompleted': 'เวิร์กโฟลว์เสร็จสิ้นสำเร็จ - ดำเนินการ {{stepsCount}} ขั้นตอน',
      'workflowCompleted_other': 'เวิร์กโฟลว์เสร็จสิ้นสำเร็จ - ดำเนินการ {{stepsCount}} ขั้นตอน'
    },
    'realtimeIncidents': {
      'created': 'สร้างเหตุการณ์แบบเรียลไทม์สำเร็จ'
    },
    'realtimeMonitoring': {
      'alerts': {
        'configUpdated': 'อัปเดตการกำหนดค่าการแจ้งเตือนสำเร็จ',
        'historyRetrieved': 'ดึงประวัติการแจ้งเตือนสำเร็จ',
        'manualSent': 'ส่งการแจ้งเตือนด้วยตนเองสำเร็จ',
        'rulesRetrieved': 'ดึงกฎการแจ้งเตือนสำเร็จ',
        'statusRetrieved': 'ดึงสถานะระบบการแจ้งเตือนสำเร็จ'
      },
      'dashboard': {
        'cacheCleared': 'ล้างแคชแดชบอร์ดแบบเรียลไทม์สำเร็จ',
        'liveRetrieved': 'ดึงสแนปช็อตแดชบอร์ดสดสำเร็จ',
        'overviewRetrieved': 'ดึงภาพรวมแดชบอร์ดการตรวจสอบแบบเรียลไทม์สำเร็จ',
        'realtimeRetrieved': 'ดึงข้อมูลแดชบอร์ดแบบเรียลไทม์สำเร็จ'
      },
      'incidents': {
        'created': 'สร้างเหตุการณ์การตรวจสอบแบบเรียลไทม์ {{incidentId}} สำเร็จแล้ว'
      },
      'monitoring': {
        'analysisCompleted': 'การวิเคราะห์การตรวจสอบแบบเรียลไทม์เสร็จสิ้นสำเร็จ',
        'eventSimulated': 'จำลองเหตุการณ์การตรวจสอบ {{eventType}} สำเร็จ',
        'eventsRetrieved': 'ดึงเหตุการณ์การตรวจสอบแบบเรียลไทม์สำเร็จ',
        'started': 'เริ่มการตรวจสอบแบบเรียลไทม์สำเร็จแล้ว',
        'stopped': 'หยุดการตรวจสอบแบบเรียลไทม์สำเร็จแล้ว',
        'threatResolved': 'แก้ไขภัยคุกคามแบบเรียลไทม์ {{threatId}} สำเร็จ',
        'threatsRetrieved': 'ดึงสถานะภัยคุกคามแบบเรียลไทม์สำเร็จ'
      }
    },
    'search': {
      'completed': 'การค้นหาเสร็จสมบูรณ์ด้วยผลลัพธ์ {{resultCount}} รายการ',
      'completed_other': 'การค้นหาเสร็จสมบูรณ์ด้วยผลลัพธ์ {{resultCount}} รายการ'
    },
    'security': {
      'incident': {
        'created': '{{actor}} สร้างเหตุการณ์ความปลอดภัย \"{{title}}\" ระดับความรุนแรง {{severity}} (ID: {{incidentId}}, ประเภท: {{type}})',
        'responseExecuted': '{{actor}} ดำเนินการตอบสนอง {{actionCount}} รายการสำหรับเหตุการณ์ {{incidentId}} (ประเภท: {{actionType}}) เมื่อ {{executedAt}}',
        'retrieved': '{{actor}} ดึงข้อมูลรายละเอียดเหตุการณ์ {{incidentId}} (สถานะ: {{status}}, ความรุนแรง: {{severity}}, สร้างเมื่อ: {{createdAt}})',
        'statusUpdated': '{{actor}} อัปเดตสถานะเหตุการณ์ {{incidentId}} จาก \"{{oldStatus}}\" เป็น \"{{newStatus}}\" เมื่อ {{timestamp}}'
      },
      'incidents': {
        'created': '{{actor}} สร้างเหตุการณ์ความปลอดภัย \"{{title}}\" ระดับความรุนแรง {{severity}} (ID: {{incidentId}}, ประเภท: {{type}})',
        'responseExecuted': '{{actor}} ดำเนินการตอบสนอง {{actionCount}} รายการสำหรับเหตุการณ์ {{incidentId}} (ประเภท: {{actionType}}) เมื่อ {{executedAt}}',
        'retrieved': '{{actor}} ดึงข้อมูลเหตุการณ์ความปลอดภัย {{incidentCount}} รายการสำเร็จ (หน้า {{page}}, จำกัด {{limit}}, ตัวกรอง: {{filters}})',
        'statusUpdated': '{{actor}} อัปเดตสถานะเหตุการณ์ {{incidentId}} จาก \"{{oldStatus}}\" เป็น \"{{newStatus}}\" เมื่อ {{timestamp}}'
      },
      'monitoring': {
        'started': 'เริ่มการตรวจสอบแบบเรียลไทม์สำเร็จ'
      },
      'service': {
        'statusRetrieved': '{{actor}} ดึงข้อมูลสถานะเซอร์วิส: สุขภาพ {{serviceHealth}}, เวอร์ชัน {{version}}, เวลาทำงาน {{uptime}} (ตรวจสอบเมื่อ: {{checkedAt}})'
      },
      'simulation': {
        'completed': '{{actor}} จำลองภัยคุกคาม {{threatType}} ระดับความรุนแรง {{severity}} เสร็จสิ้น (ID การจำลอง: {{simulationId}}) เมื่อ {{completedAt}}'
      },
      'statistics': {
        'retrieved': '{{actor}} ดึงข้อมูลสถิติความปลอดภัย: ทั้งหมด {{totalIncidents}} รายการ, ใช้งาน {{activeIncidents}} รายการ, แก้ไขแล้ว {{resolvedIncidents}} รายการ (ดึงข้อมูลเมื่อ: {{retrievedAt}})'
      }
    },
    'system': {
      'cacheConnected': 'เชื่อมต่อบริการแคชสำเร็จไปยัง {{cacheService}}',
      'configurationLoaded': 'โหลดการกำหนดค่าระบบสำเร็จ - การตั้งค่า {{configCount}} การตั้งค่า',
      'configurationLoaded_other': 'โหลดการกำหนดค่าระบบสำเร็จ - การตั้งค่า {{configCount}} การตั้งค่า',
      'connectionEstablished': 'สร้างการเชื่อมต่อสำเร็จไปยัง {{serviceName}}',
      'databaseConnected': 'เชื่อมต่อฐานข้อมูลสำเร็จไปยัง {{databaseName}}',
      'healthCheckPassed': 'ตรวจสอบสุขภาพระบบผ่าน - คอมโพเนนต์ {{componentCount}} คอมโพเนนต์สุขภาพดี',
      'healthCheckPassed_other': 'ตรวจสอบสุขภาพระบบผ่าน - คอมโพเนนต์ {{componentCount}} คอมโพเนนต์สุขภาพดี',
      'operationCompleted': 'การดำเนินการระบบ \"{{operation}}\" เสร็จสิ้นใน {{duration, number}}ms',
      'queueProcessed': 'ประมวลผลคิวงานสำเร็จ - งาน {{processedCount}} งานเสร็จสิ้น',
      'queueProcessed_other': 'ประมวลผลคิวงานสำเร็จ - งาน {{processedCount}} งานเสร็จสิ้น',
      'resourceAllocated': 'จัดสรรทรัพยากรระบบสำเร็จ: หน่วยความจำ {{allocatedMemory, number}}MB',
      'resourceReleased': 'ปล่อยทรัพยากรระบบสำเร็จ: หน่วยความจำ {{releasedMemory, number}}MB',
      'rollbackCompleted': 'ย้อนกลับระบบเสร็จสิ้นเป็นเวอร์ชัน {{previousVersion}}',
      'serviceStarted': 'เริ่มบริการระบบ {{serviceName}} สำเร็จบนพอร์ต {{port}}',
      'serviceStopped': 'หยุดบริการระบบ {{serviceName}} อย่างสง่างาม',
      'taskCompleted': 'งานเบื้องหลัง {{taskName}} เสร็จสิ้น',
      'taskScheduled': 'กำหนดเวลางานเบื้องหลัง {{taskName}} สำหรับ {{scheduledTime, datetime}}',
      'upgradeCompleted': 'อัพเกรดระบบเสร็จสิ้นเป็นเวอร์ชัน {{newVersion}}'
    },
    'translations': {
      'retrieved': 'ดึงข้อมูลการแปลสำเร็จ'
    },
    'user': {
      'activated': 'เปิดใช้งานบัญชีผู้ใช้สำเร็จสำหรับ {{userName}}',
      'activated_other': 'เปิดใช้งานบัญชีผู้ใช้ {{count}} บัญชีสำเร็จ',
      'bulkOperationSuccess': 'การดำเนินการแบบกลุ่มเสร็จสมบูรณ์: {{successCount}}/{{totalCount}} สำเร็จ',
      'created': 'สร้างบัญชีผู้ใช้สำเร็จสำหรับ {{userName}} ({{email}})',
      'created_other': 'สร้างบัญชีผู้ใช้ {{count}} บัญชีสำเร็จ',
      'dataExported': 'ส่งออกข้อมูลผู้ใช้สำเร็จ ({{fileSize, number}}KB) สำหรับ {{userName}}',
      'dataImported': 'นำเข้าข้อมูลผู้ใช้สำเร็จ - ประมวลผล {{importedCount}} รายการ',
      'dataImported_other': 'นำเข้าข้อมูลผู้ใช้สำเร็จ - ประมวลผล {{importedCount}} รายการ',
      'deactivated': 'ปิดใช้งานบัญชีผู้ใช้สำเร็จสำหรับ {{userName}}',
      'deactivated_other': 'ปิดใช้งานบัญชีผู้ใช้ {{count}} บัญชีสำเร็จ',
      'deleted': 'ลบบัญชีผู้ใช้สำเร็จสำหรับ {{userName}} โดย {{deletedBy}}',
      'deleted_other': 'ลบบัญชีผู้ใช้ {{count}} บัญชีสำเร็จ',
      'emailUpdated': 'อัปเดตที่อยู่อีเมลจาก {{oldEmail}} เป็น {{newEmail}} สำหรับ {{userName}}',
      'emailVerified': 'ยืนยันที่อยู่อีเมล {{email, lowercase}} สำเร็จสำหรับ {{userName}}',
      'loginHistory': 'เรียกดูประวัติการเข้าสู่ระบบ: {{entryCount}} รายการสำหรับ {{userName}}',
      'loginHistory_other': 'เรียกดูประวัติการเข้าสู่ระบบ: {{entryCount}} รายการสำหรับ {{userName}}',
      'passwordChanged': 'เปลี่ยนรหัสผ่านสำเร็จสำหรับ {{userName}}',
      'permissionUpdated': 'อัปเดตสิทธิ์ผู้ใช้สำเร็จสำหรับ {{userName}}',
      'profileCompleted': 'โปรไฟล์ผู้ใช้สมบูรณ์ {{percent, number}}% สำหรับ {{userName}}',
      'profileRetrieved': 'ดึงโปรไฟล์ผู้ใช้สำเร็จสำหรับ {{userName}} ({{userRole}}) โดย [{{requestedBy}}]',
      'profileUpdated': 'อัปเดตโปรไฟล์ผู้ใช้สำเร็จสำหรับ {{userName}} - แก้ไข {{fieldsCount}} ฟิลด์',
      'profileUpdated_other': 'อัปเดตโปรไฟล์ผู้ใช้สำเร็จสำหรับ {{userName}} - แก้ไข {{fieldsCount}} ฟิลด์',
      'registered': 'ลงทะเบียนผู้ใช้ {{userName}} สำเร็จด้วยบทบาท {{userRole}}',
      'registeredPendingActivation': 'ได้รับคำขอลงทะเบียนของ {{userName}} แล้ว โปรดตรวจสอบอีเมลเพื่อยืนยันและเปิดใช้งานบัญชีก่อนเข้าสู่ระบบ',
      'roleChanged': 'เปลี่ยนบทบาทผู้ใช้จาก {{oldRole}} เป็น {{newRole}} สำหรับ {{userName}}',
      'sessionTerminated': 'สิ้นสุดเซสชันทั้งหมดสำเร็จสำหรับ {{userName}}',
      'suspended': 'ระงับบัญชีผู้ใช้สำเร็จสำหรับ {{userName}} จนถึง {{suspendedUntil, datetime}}',
      'unsuspended': 'ยกเลิกการระงับบัญชีผู้ใช้สำหรับ {{userName}} โดย {{liftedBy}}',
      'updated': 'อัพเดทโปรไฟล์ผู้ใช้สำเร็จสำหรับ {{userName}} - ฟิลด์: {{updatedFields}}',
      'updated_other': 'อัพเดทโปรไฟล์ผู้ใช้ {{count}} โปรไฟล์สำเร็จ'
    }
  },
  'system': {
    'apiInfo': 'ข้อมูล API',
    'error': 'เกิดข้อผิดพลาด',
    'invalidRequest': 'คำขอไม่ถูกต้อง',
    'notFound': 'ไม่พบทรัพยากร',
    'operationFailed': '{{operation}} ล้มเหลว: {{error}}',
    'serverError': 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    'success': 'ดำเนินการสำเร็จ',
    'welcome': 'ยินดีต้อนรับสู่ Hono Auth API v{{version}} ({{language}})'
  },
  'user': {
    'statusDisplay': {
      'active': 'ใช้งาน',
      'inactive': 'ไม่ได้ใช้งาน',
      'suspended': 'ถูกระงับ'
    }
  },
  'validation': {
    'advancedAudit': {
      'invalidRetentionAction': 'การดำเนินการเก็บรักษาไม่ถูกต้อง: {{action}}, ต้องเป็นหนึ่งใน: {{validActions}}'
    },
    'advancedCleanup': {
      'backupRecommended': 'ขอแนะนำอย่างยิ่งให้สร้างข้อมูลสำรองก่อนการล้างข้อมูล',
      'confirmationRequired': 'ต้องมีการยืนยันสำหรับการดำเนินการล้างข้อมูลจริง',
      'invalid': 'พารามิเตอร์การล้างข้อมูลขั้นสูงไม่ถูกต้อง'
    },
    'arrayValidation': {
      'actions': {
        'tooFew': 'ต้องมีการกระทำอย่างน้อย {{minCount}} รายการ',
        'tooFew_other': 'ต้องมีการกระทำอย่างน้อย {{minCount}} รายการ',
        'tooMany': 'ต้องมีการกระทำไม่เกิน {{maxCount}} รายการ',
        'tooMany_other': 'ต้องมีการกระทำไม่เกิน {{maxCount}} รายการ'
      },
      'channels': {
        'tooFew': 'ต้องมีช่องทางอย่างน้อย {{minCount}} รายการ',
        'tooFew_other': 'ต้องมีช่องทางอย่างน้อย {{minCount}} รายการ',
        'tooMany': 'ต้องไม่มีช่องทางเกิน {{maxCount}} รายการ',
        'tooMany_other': 'ต้องไม่มีช่องทางเกิน {{maxCount}} รายการ'
      },
      'conditions': {
        'tooFew': 'ต้องระบุเงื่อนไขอย่างน้อย {{minCount}} รายการ',
        'tooFew_other': 'ต้องระบุเงื่อนไขอย่างน้อย {{minCount}} รายการ',
        'tooMany': 'ต้องไม่ระบุเงื่อนไขเกิน {{maxCount}} รายการ',
        'tooMany_other': 'ต้องไม่ระบุเงื่อนไขเกิน {{maxCount}} รายการ'
      },
      'configs': {
        'tooFew': 'ต้องมีการกำหนดค่าอย่างน้อย {{minCount}} รายการ',
        'tooFew_other': 'ต้องมีการกำหนดค่าอย่างน้อย {{minCount}} รายการ',
        'tooMany': 'ต้องมีการกำหนดค่าไม่เกิน {{maxCount}} รายการ',
        'tooMany_other': 'ต้องมีการกำหนดค่าไม่เกิน {{maxCount}} รายการ'
      },
      'interests': {
        'tooFew': 'ต้องมีความสนใจอย่างน้อย {{minCount}} รายการ',
        'tooFew_other': 'ต้องมีความสนใจอย่างน้อย {{minCount}} รายการ',
        'tooMany': 'ต้องมีความสนใจไม่เกิน {{maxCount}} รายการ',
        'tooMany_other': 'ต้องมีความสนใจไม่เกิน {{maxCount}} รายการ'
      },
      'items': {
        'tooFew': 'ต้องมีอย่างน้อย {{minCount}} รายการ',
        'tooFew_other': 'ต้องมีอย่างน้อย {{minCount}} รายการ',
        'tooMany': 'ต้องมีไม่เกิน {{maxCount}} รายการ',
        'tooMany_other': 'ต้องมีไม่เกิน {{maxCount}} รายการ'
      }
    },
    'auditSearch': {
      'atLeastOneFilterRequired': 'ต้องระบุฟิลเตอร์อย่างน้อย {{min}} ตัว',
      'atLeastOneFilterRequired_other': 'ต้องระบุฟิลเตอร์อย่างน้อย {{min}} ตัว'
    },
    'changePassword': {
      'passwordsDoNotMatch': 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน'
    },
    'cleanupSimulation': {
      'confirmationRequired': 'ต้องมีการยืนยันสำหรับการดำเนินการที่ไม่ใช่แบบทดสอบ',
      'dataLossWarning': 'คำเตือน: การดำเนินการนี้อาจส่งผลให้ข้อมูลสูญหาย',
      'invalid': 'พารามิเตอร์การจำลองการล้างข้อมูลไม่ถูกต้อง'
    },
    'confirmPassword': {
      'mustMatch': 'การยืนยันรหัสผ่านต้องตรงกับรหัสผ่าน',
      'required': 'ต้องยืนยันรหัสผ่าน'
    },
    'dateRange': {
      'invalid': 'ช่วงวันที่ไม่ถูกต้อง - วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น',
      'overlapConflict': 'ช่วงวันที่ซ้อนทับกับช่วงที่มีอยู่: {{conflictingRange}}',
      'tooLarge': 'ช่วงวันที่ต้องไม่เกิน {{maxDays}} วัน',
      'tooLarge_other': 'ช่วงวันที่ต้องไม่เกิน {{maxDays}} วัน'
    },
    'enumValidation': {
      'action': {
        'invalid': 'การดำเนินการต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'actionType': {
        'invalid': 'ประเภทการดำเนินการต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'category': {
        'invalid': 'หมวดหมู่ต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'channelType': {
        'invalid': 'ประเภทช่องต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'file_type': {
        'invalid': 'ประเภทไฟล์ต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'format': {
        'invalid': 'รูปแบบต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'metric': {
        'invalid': 'เมตริกต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'operator': {
        'invalid': 'ตัวดำเนินการต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'priority': {
        'invalid': 'ลำดับความสำคัญต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'reportType': {
        'invalid': 'ประเภทรายงานต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'resolution': {
        'invalid': 'ความละเอียดต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'role': {
        'invalid': 'บทบาทต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'severity': {
        'invalid': 'ระดับความรุนแรงต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'sort_by': {
        'invalid': 'ฟิลด์การจัดเรียงต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'sort_order': {
        'invalid': 'ลำดับการจัดเรียงต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'status': {
        'invalid': 'สถานะต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'timeframe': {
        'invalid': 'ช่วงเวลา (timeframe) ต้องเป็นหนึ่งใน: {{allowedValues}}'
      },
      'userRole': {
        'invalid': 'บทบาทผู้ใช้ต้องเป็นหนึ่งใน: {{allowedValues}}'
      }
    },
    'fieldRequired': {
      'action': 'การดำเนินการเป็นสิ่งจำเป็น',
      'actionTaken': 'การดำเนินการที่ทำเป็นสิ่งจำเป็น',
      'age': 'อายุเป็นสิ่งจำเป็น',
      'assignedTo': 'ผู้ถูกมอบหมายเป็นสิ่งจำเป็น',
      'auditLogRetentionDays': 'ต้องระบุจำนวนวันเก็บรักษาบันทึกการตรวจสอบ (audit log)',
      'auditRetention': 'ต้องระบุมูลค่าการเก็บรักษาการตรวจสอบ',
      'batchSize': 'ขนาดชุด (batch) เป็นสิ่งจำเป็น',
      'categoryFilter': 'ตัวกรองหมวดหมู่เป็นสิ่งจำเป็น',
      'channel': 'ช่องทางเป็นสิ่งจำเป็น',
      'channelType': 'ประเภทช่องทางเป็นสิ่งจำเป็น',
      'conditionValue': 'ค่าของเงื่อนไขเป็นสิ่งจำเป็น',
      'confirmPassword': 'การยืนยันรหัสผ่านเป็นสิ่งจำเป็น',
      'date': 'วันที่เป็นสิ่งจำเป็น',
      'days': 'ต้องระบุจำนวนวัน',
      'description': 'คำอธิบายเป็นสิ่งจำเป็น',
      'dryRun': 'แฟล็ก Dry Run เป็นสิ่งจำเป็น',
      'email': 'ที่อยู่อีเมลเป็นสิ่งจำเป็น',
      'enabled': 'สถานะเปิดใช้งานเป็นสิ่งจำเป็น',
      'endDate': 'วันที่สิ้นสุดเป็นสิ่งจำเป็น',
      'endTime': 'เวลาสิ้นสุดเป็นสิ่งจำเป็น',
      'errorRate': 'อัตราการเกิดข้อผิดพลาดเป็นสิ่งจำเป็น',
      'executionTime': 'ต้องระบุเวลาในการทำงาน',
      'failureCount': 'จำนวนครั้งที่ล้มเหลวเป็นสิ่งจำเป็น',
      'field': 'จำเป็นต้องระบุค่าของฟิลด์',
      'fileSize': 'ขนาดไฟล์เป็นสิ่งจำเป็น',
      'forceArchival': 'แฟล็กบังคับเก็บถาวรเป็นสิ่งจำเป็น',
      'format': 'รูปแบบเป็นสิ่งจำเป็น',
      'hours': 'ต้องระบุจำนวนชั่วโมง',
      'id': 'ID เป็นสิ่งจำเป็น',
      'incidentType': 'ประเภทเหตุการณ์เป็นสิ่งจำเป็น',
      'includeDetails': 'แฟล็กระบุรายละเอียดเป็นสิ่งจำเป็น',
      'includeMetadata': 'แฟล็กระบุข้อมูลเมตาเป็นสิ่งจำเป็น',
      'includeUserData': 'แฟล็กระบุข้อมูลผู้ใช้เป็นสิ่งจำเป็น',
      'intervalMs': 'ช่วงเวลา (ms) เป็นสิ่งจำเป็น',
      'limit': 'ขีดจำกัดเป็นสิ่งจำเป็น',
      'maxRecords': 'จำเป็นต้องระบุจำนวนระเบียนสูงสุด',
      'metric': 'เมตริกเป็นสิ่งจำเป็น',
      'metrics': 'เมตริกเป็นสิ่งจำเป็น',
      'name': 'ชื่อเป็นสิ่งจำเป็น',
      'page': 'หมายเลขหน้าเป็นสิ่งจำเป็น',
      'password': 'รหัสผ่านเป็นสิ่งจำเป็น',
      'period': 'ระยะเวลาเป็นสิ่งจำเป็น',
      'policy': 'นโยบายเป็นสิ่งจำเป็น',
      'priority': 'ลำดับความสำคัญเป็นสิ่งจำเป็น',
      'query': 'คำค้นหาเป็นสิ่งจำเป็น',
      'refreshToken': 'โทเค็นรีเฟรชเป็นสิ่งจำเป็น',
      'reportType': 'ประเภทรายงานเป็นสิ่งจำเป็น',
      'resolution': 'การแก้ไขเป็นสิ่งจำเป็น',
      'responseTime': 'เวลาตอบสนองเป็นสิ่งจำเป็น',
      'securityIncident': 'เหตุการณ์ด้านความปลอดภัยเป็นสิ่งจำเป็น',
      'startDate': 'วันที่เริ่มต้นเป็นสิ่งจำเป็น',
      'startTime': 'เวลาเริ่มต้นเป็นสิ่งจำเป็น',
      'target': 'ต้องระบุเป้าหมาย',
      'termsAccepted': 'ต้องยอมรับเงื่อนไขการใช้งาน',
      'threshold': 'ค่าเกณฑ์ (threshold) เป็นสิ่งจำเป็น',
      'timeframe': 'กรอบเวลาเป็นสิ่งจำเป็น',
      'timeRange': 'ช่วงเวลาเป็นสิ่งจำเป็น',
      'token': 'โทเค็นเป็นสิ่งจำเป็น',
      'userDataRetention': 'ต้องระบุค่าการเก็บรักษาข้อมูลผู้ใช้',
      'userDataRetentionDays': 'ต้องระบุจำนวนวันเก็บรักษาข้อมูลผู้ใช้',
      'userId': 'รหัสผู้ใช้เป็นสิ่งจำเป็น',
      'username': 'ชื่อผู้ใช้เป็นสิ่งจำเป็น',
      'userRole': 'บทบาทผู้ใช้เป็นสิ่งจำเป็น',
      'value': 'ค่าเป็นสิ่งจำเป็น',
      'website': 'จำเป็นต้องมีเว็บไซต์'
    },
    'fileUpload': {
      'invalidExtension': 'ส่วนขยายไฟล์ไม่ถูกต้อง'
    },
    'formatValidation': {
      'assignedTo': {
        'invalid': 'รูปแบบรหัสผู้ใช้ที่กำหนดไม่ถูกต้อง'
      },
      'date': {
        'invalid': 'รูปแบบวันที่ไม่ถูกต้อง'
      },
      'email': {
        'invalid': 'กรุณาระบุที่อยู่อีเมลที่ถูกต้อง (เช่น user@example.com)'
      },
      'endDate': {
        'invalid': 'รูปแบบวันที่สิ้นสุดไม่ถูกต้อง'
      },
      'endTime': {
        'invalid': 'รูปแบบเวลาสิ้นสุดไม่ถูกต้อง'
      },
      'id': {
        'invalid': 'รูปแบบ ID ไม่ถูกต้อง'
      },
      'refreshToken': {
        'invalid': 'รูปแบบโทเค็นรีเฟรชไม่ถูกต้อง'
      },
      'startDate': {
        'invalid': 'รูปแบบวันเริ่มต้นไม่ถูกต้อง'
      },
      'startTime': {
        'invalid': 'รูปแบบเวลาเริ่มต้นไม่ถูกต้อง'
      },
      'token': {
        'invalid': 'รูปแบบโทเค็น JWT ไม่ถูกต้อง'
      },
      'url': {
        'invalid': 'กรุณาระบุ URL ที่ถูกต้อง (เช่น https://example.com)'
      },
      'website': {
        'invalid': 'โปรดระบุ URL เว็บไซต์ที่ถูกต้อง (เช่น https://example.com)'
      }
    },
    'lengthValidation': {
      'action': {
        'tooLong': 'การกระทำไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'การกระทำต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'การกระทำต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'actionTaken': {
        'tooLong': 'การดำเนินการที่ทำต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'การดำเนินการที่ทำต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'การดำเนินการที่ทำต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'bio': {
        'tooLong': 'ประวัติไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'ประวัติต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'ประวัติต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'channel': {
        'tooLong': 'ช่องทางต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'ช่องทางต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'ช่องทางต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'channelType': {
        'tooLong': 'ประเภทช่องทางต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'ประเภทช่องทางต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'ประเภทช่องทางต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'confirmPassword': {
        'tooShort': 'การยืนยันรหัสผ่านต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'การยืนยันรหัสผ่านต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'department': {
        'tooLong': 'แผนกต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'แผนกต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'แผนกต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'description': {
        'tooLong': 'คำอธิบายไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'คำอธิบายต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'คำอธิบายต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'email': {
        'tooLong': 'ที่อยู่อีเมลไม่สามารถเกิน {{maxLength}} ตัวอักษร'
      },
      'entityType': {
        'tooLong': 'ประเภทเอนทิตีไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'ประเภทเอนทิตีต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'ประเภทเอนทิตีต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'field': {
        'tooLong': 'ฟิลด์ต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'ฟิลด์ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'ฟิลด์ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'incidentType': {
        'tooLong': 'ประเภทเหตุการณ์ต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'ประเภทเหตุการณ์ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'ประเภทเหตุการณ์ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'interest': {
        'tooLong': 'ความสนใจไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'ความสนใจต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'ความสนใจต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'name': {
        'tooLong': 'ชื่อไม่สามารถเกิน {{maxLength}} ตัวอักษร'
      },
      'nextSteps': {
        'tooLong': 'ขั้นตอนถัดไปต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'ขั้นตอนถัดไปต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'ขั้นตอนถัดไปต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'note': {
        'tooLong': 'หมายเหตุ ต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'หมายเหตุ ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'หมายเหตุ ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'notes': {
        'tooLong': 'บันทึก ต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'บันทึก ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'บันทึก ต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'password': {
        'tooLong': 'รหัสผ่านไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'รหัสผ่านต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'รหัสผ่านต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'query': {
        'tooLong': 'คำค้นหาไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'คำค้นหาต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'คำค้นหาต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'search': {
        'tooLong': 'ข้อความค้นหาไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'ข้อความค้นหาต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'ข้อความค้นหาต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'sortBy': {
        'tooLong': 'ฟิลด์การจัดเรียงไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'ฟิลด์การจัดเรียงต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'ฟิลด์การจัดเรียงต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      },
      'source': {
        'tooLong': 'แหล่งที่มา ต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'แหล่งที่มาต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'แหล่งที่มามีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'system': {
        'tooLong': 'ระบบต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'ระบบต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'ระบบต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'target': {
        'tooLong': 'เป้าหมายต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'เป้าหมายต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'เป้าหมายต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'template': {
        'tooLong': 'แม่แบบต้องไม่เกิน {{maxLength}} อักขระ',
        'tooShort': 'แม่แบบต้องมีความยาวอย่างน้อย {{minLength}} อักขระ',
        'tooShort_other': 'แม่แบบต้องมีความยาวอย่างน้อย {{minLength}} อักขระ'
      },
      'token': {
        'tooLong': 'โทเค็นไม่สามารถเกิน {{maxLength}} ตัวอักษร',
        'tooShort': 'โทเค็นต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
        'tooShort_other': 'โทเค็นต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร'
      }
    },
    'numericValidation': {
      'age': {
        'tooLarge': 'อายุต้องไม่เกิน {{maxValue}} ปี',
        'tooSmall': 'อายุต้องมีอย่างน้อย {{minValue}} ปี'
      },
      'auditLogRetentionDays': {
        'tooSmall': 'จำนวนวันเก็บรักษาบันทึกการตรวจสอบต้องมีอย่างน้อย {{minValue}}'
      },
      'auditRetention': {
        'tooLarge': 'ค่าการเก็บรักษา audit ต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'ค่าการเก็บรักษา audit ต้องมีอย่างน้อย {{minValue}}'
      },
      'batchSize': {
        'tooLarge': 'ขนาดชุด (batch) ต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'ขนาดชุด (batch) ต้องมีอย่างน้อย {{minValue}}'
      },
      'days': {
        'tooLarge': 'จำนวนวันต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'จำนวนวันต้องมีอย่างน้อย {{minValue}}'
      },
      'errorRate': {
        'tooLarge': 'อัตราการเกิดข้อผิดพลาดต้องไม่เกิน {{maxValue}}%',
        'tooSmall': 'อัตราการเกิดข้อผิดพลาดต้องมีอย่างน้อย {{minValue}}%'
      },
      'executionTime': {
        'tooLarge': 'เวลาในการทำงานต้องไม่เกิน {{maxValue}} วินาที',
        'tooSmall': 'เวลาในการทำงานต้องมีอย่างน้อย {{minValue}} วินาที'
      },
      'failureCount': {
        'tooLarge': 'จำนวนครั้งที่ล้มเหลวต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'จำนวนครั้งที่ล้มเหลวต้องมีอย่างน้อย {{minValue}}'
      },
      'fileSize': {
        'tooLarge': 'ขนาดไฟล์ต้องไม่เกิน {{maxValue}} ไบต์',
        'tooSmall': 'ขนาดไฟล์ต้องมีอย่างน้อย {{minValue}} ไบต์'
      },
      'hours': {
        'tooLarge': 'ชั่วโมงต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'ชั่วโมงต้องมีอย่างน้อย {{minValue}}'
      },
      'intervalMs': {
        'tooLarge': 'ช่วงเวลา (ms) ต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'ช่วงเวลา (ms) ต้องมีอย่างน้อย {{minValue}}'
      },
      'limit': {
        'tooLarge': 'ขีดจำกัดต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'ขีดจำกัดต้องมีอย่างน้อย {{minValue}}'
      },
      'maxRecords': {
        'tooLarge': 'จำนวนระเบียนสูงสุดต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'จำนวนระเบียนสูงสุดต้องมีอย่างน้อย {{minValue}}'
      },
      'page': {
        'tooLarge': 'หมายเลขหน้าต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'หมายเลขหน้าต้องมีอย่างน้อย {{minValue}}'
      },
      'responseTime': {
        'tooLarge': 'เวลาตอบสนองต้องไม่เกิน {{maxValue}} มิลลิวินาที',
        'tooSmall': 'เวลาตอบสนองต้องมีอย่างน้อย {{minValue}} มิลลิวินาที'
      },
      'securityIncident': {
        'tooLarge': 'เหตุการณ์ด้านความปลอดภัยต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'เหตุการณ์ด้านความปลอดภัยต้องมีอย่างน้อย {{minValue}}'
      },
      'threshold': {
        'tooSmall': 'ค่า threshold ต้องมีอย่างน้อย {{minValue}}'
      },
      'userDataRetention': {
        'tooLarge': 'การเก็บรักษาข้อมูลผู้ใช้ต้องไม่เกิน {{maxValue}}',
        'tooSmall': 'การเก็บรักษาข้อมูลผู้ใช้ต้องมีอย่างน้อย {{minValue}}'
      },
      'userDataRetentionDays': {
        'tooSmall': 'จำนวนวันเก็บรักษาข้อมูลผู้ใช้ต้องมีอย่างน้อย {{minValue}}'
      },
      'userId': {
        'tooSmall': 'รหัสผู้ใช้ต้องมีอย่างน้อย {{minValue}}'
      }
    },
    'retentionPolicy': {
      'atLeastOneRequired': 'ต้องระบุการตั้งค่าการเก็บรักษาอย่างน้อยหนึ่งรายการ',
      'atLeastOneRequired_other': 'ต้องระบุการตั้งค่าการเก็บรักษาอย่างน้อย {{min}} รายการ',
      'conflictingRules': 'ตรวจพบกฎการเก็บรักษาที่ขัดแย้งกัน: {{conflicts}}',
      'invalid': 'นโยบายการเก็บรักษาไม่ถูกต้อง'
    },
    'retentionPolicyUpdate': {
      'atLeastOneFieldRequired': 'ต้องอัปเดตอย่างน้อยหนึ่งฟิลด์',
      'atLeastOneFieldRequired_other': 'ต้องอัปเดตอย่างน้อย {{min}} ฟิลด์',
      'immutableField': 'ฟิลด์ \"{{field}}\" ไม่สามารถแก้ไขได้หลังจากสร้าง',
      'invalid': 'การอัปเดตนโยบายการเก็บรักษาไม่ถูกต้อง'
    },
    'security': {
      'xssPatternDetected': 'ตรวจพบรูปแบบ XSS ที่อาจเป็นอันตราย: ไม่อนุญาต {{patternName}}'
    },
    'structureValidation': {
      'conditions': {
        'invalid': 'โครงสร้างเงื่อนไขไม่ถูกต้อง'
      },
      'config': {
        'invalid': 'โครงสร้างการกำหนดค่าไม่ถูกต้อง'
      },
      'configUpdate': {
        'invalid': 'รูปแบบการอัปเดตการกำหนดค่าไม่ถูกต้อง ขาดฟิลด์ที่จำเป็น \"value\" หรือมีฟิลด์ที่ไม่รู้จัก'
      },
      'incidentCreation': {
        'invalid': 'โครงสร้างการสร้างเหตุการณ์ไม่ถูกต้อง'
      },
      'login': {
        'invalid': 'รูปแบบคำขอลงชื่อเข้าใช้ไม่ถูกต้อง'
      },
      'metadata': {
        'invalid': 'โครงสร้างข้อมูลเมตาไม่ถูกต้อง'
      },
      'object': {
        'invalid': 'โครงสร้างออบเจกต์ไม่ถูกต้อง'
      },
      'record': {
        'invalid': 'รูปแบบบันทึกไม่ถูกต้อง'
      }
    },
    'termsAccepted': {
      'mustBeTrue': 'ต้องยอมรับข้อกำหนดและเงื่อนไข',
      'versionMismatch': 'ข้อกำหนดและเงื่อนไขได้รับการอัปเดตแล้ว - โปรดตรวจสอบและยอมรับเวอร์ชันล่าสุด'
    },
    'timeRange': {
      'eitherHoursOrRangeRequired': 'ต้องระบุชั่วโมงหรือช่วงวันที่อย่างใดอย่างหนึ่ง',
      'endTimeMustBeAfterStartTime': 'เวลาสิ้นสุดต้องมาหลังเวลาเริ่มต้น',
      'invalid': 'ช่วงเวลาต้องเป็นหนึ่งใน: last_1h, last_6h, last_24h, last_7d, last_30d',
      'invalidFormat': 'รูปแบบช่วงเวลาไม่ถูกต้อง (ที่คาดไว้: {{expectedFormat}})',
      'rangeTooLarge': 'ช่วงเวลาต้องไม่เกิน {{maxDays}} วัน',
      'rangeTooLarge_other': 'ช่วงเวลาต้องไม่เกิน {{maxDays}} วัน',
      'required': 'ต้องระบุช่วงเวลา'
    },
    'typeValidation': {
      'configValue': {
        'invalid': 'ประเภทของค่าการกำหนดค่าไม่ถูกต้อง'
      },
      'value': {
        'invalid': 'ชนิดข้อมูลไม่ถูกต้อง'
      }
    },
    'username': {
      'invalid': 'ชื่อผู้ใช้สามารถมีได้เฉพาะตัวอักษร, ตัวเลข และขีดล่างเท่านั้น',
      'invalidCharacters': 'ชื่อผู้ใช้สามารถมีได้เฉพาะตัวอักษร, ตัวเลข และขีดล่างเท่านั้น',
      'required': 'ต้องระบุชื่อผู้ใช้',
      'reserved': 'ชื่อผู้ใช้ \"{{username}}\" ถูกจองไว้และไม่สามารถใช้ได้',
      'tooLong': 'ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร',
      'tooShort': 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร',
      'tooShort_other': 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย {{minLength}} ตัวอักษร',
      'unavailable': 'ชื่อผู้ใช้ \"{{username}}\" ไม่พร้อมใช้งาน'
    },
    'filterArrayTooLarge': 'อาร์เรย์ตัวกรองใหญ่เกินไป (สูงสุด 500 รายการ)',
    'filterArrayTooLarge_other': 'อาร์เรย์ตัวกรองที่มี {{count}} รายการเกินค่าสูงสุด {{max}}',
    'invalid': 'ระบุค่าที่ไม่ถูกต้อง',
    'invalid_other': 'ระบุค่าที่ไม่ถูกต้อง {{count}} ค่า',
    'invalidArchiveAction': 'การดำเนินการจัดเก็บถาวรไม่ถูกต้อง',
    'invalidJson': 'JSON ในเนื้อหาคำขอไม่ถูกต้อง',
    'invalidRole': 'ระบุบทบาทไม่ถูกต้อง',
    'limitTooLarge': 'ขีดจำกัดใหญ่เกินไป (สูงสุด 50,000 ระเบียน)',
    'limitTooLarge_other': 'ขีดจำกัด {{limit}} เกินค่าสูงสุด {{max}} รายการ',
    'registrationFailed': 'การลงทะเบียนล้มเหลว',
    'requestTooLarge': 'เพย์โหลดคำขอใหญ่เกินไป',
    'required': 'ฟิลด์นี้จำเป็น',
    'required_other': 'ฟิลด์บังคับ {{count}} ฟิลด์หายไป',
    'searchFailed': 'การค้นหาล้มเหลว',
    'serviceTempUnavailable': 'คำขอใหญ่เกินกว่าจะประมวลผลได้ - บริการไม่พร้อมใช้งานชั่วคราว',
    'tooLong': 'ค่าเกินขีดจำกัด {{max}} ตัวอักษร',
    'tooLong_other': 'ค่าเกินขีดจำกัด {{max}} ตัวอักษร',
    'tooShort': 'ค่าต้องมีความยาวอย่างน้อย {{min}} ตัวอักษร',
    'tooShort_other': 'ค่าต้องมีความยาวอย่างน้อย {{min}} ตัวอักษร',
    'translationsFailed': 'ดึงข้อมูลคำแปลล้มเหลว',
    'unsupportedFormat': 'รูปแบบการส่งออกไม่รองรับ',
    'updateRequiresField': 'ต้องระบุอย่างน้อยหนึ่งฟิลด์สำหรับการอัปเดต',
    'updateRequiresField_other': 'ต้องระบุอย่างน้อย {{min}} ฟิลด์สำหรับการดำเนินการอัปเดต',
    'uploadFailed': 'การอัปโหลดไฟล์ล้มเหลว'
  },
  'zodDemo': {
    'anotherSearchResultTitle': 'ผลลัพธ์อื่นสำหรับ',
    'description': 'นี่คือการสาธิตวิธีใช้ Zod กับ Hono สำหรับการตรวจสอบที่แข็งแกร่ง',
    'noDescription': 'ไม่มีคำอธิบาย',
    'searchResultTitle': 'ผลลัพธ์สำหรับ',
    'title': 'การสาธิตการตรวจสอบ Zod'
  },
  'zodDemo_operations': {
    'fileUpload': 'เดโมการอัปโหลดไฟล์',
    'searchExecution': 'เดโมการค้นหา',
    'userRegistration': 'เดโมการสมัครผู้ใช้'
  }
};
