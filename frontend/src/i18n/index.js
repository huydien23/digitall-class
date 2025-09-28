import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const savedLang = typeof window !== 'undefined' ? (localStorage.getItem('appLanguage') || 'vi') : 'vi'

const resources = {
  vi: {
    common: {
      settings: 'Cài đặt',
      // Navigation & header
      nav: {
        home: 'Trang chủ',
        overview: 'Tổng quan',
        my_classes: 'Lớp của tôi',
        settings: 'Cài đặt',
        students: 'Quản lý sinh viên',
        teachers: 'Quản lý giảng viên',
        classes: 'Quản lý lớp học',
        classes_student: 'Lớp học',
        grades: 'Quản lý điểm số',
        grades_student: 'Điểm số',
        attendance: 'Điểm danh',
        schedule: 'Thời khóa biểu',
        schedule_management: 'Quản lý thời khóa biểu',
        rooms: 'Quản lý phòng học',
        reports: 'Báo cáo hệ thống'
      },
      header: {
        notifications: 'Thông báo',
        settings: 'Cài đặt',
        greeting: 'Xin chào, {{name}}',
        account: 'Tài khoản'
      },
      account: {
        profile: 'Hồ sơ cá nhân',
        settings: 'Cài đặt',
        logout: 'Đăng xuất'
      },
      roles: {
        admin: 'Admin',
        teacher: 'Giảng viên',
        student: 'Sinh viên'
      },
      brand: {
        subtitle: 'Quản lý sinh viên'
      },
      teacher_settings: 'Cài đặt giảng viên',
      save: 'Lưu',
      saving: 'Đang lưu...',
      cancel: 'Hủy',
      restore: 'Khôi phục',
      restored: 'Đã khôi phục',
      restore_confirmation: 'Xác nhận khôi phục',
      restore_confirm_message: 'Bạn có chắc muốn khôi phục mục "{{section}}" về mặc định? Thao tác này không thể hoàn tác.',
      dark: 'Tối',
      light: 'Sáng',
      auto: 'Tự động (theo hệ thống)',
      primary_color: 'Màu chủ đạo',
      font_size: 'Kích thước chữ',
      small: 'Nhỏ',
      medium: 'Vừa',
      large: 'Lớn',
      density: 'Mật độ hiển thị',
      comfortable: 'Thoải mái',
      compact: 'Gọn',
      comfortable_desc: 'Khoảng cách lớn, dễ đọc',
      compact_desc: 'Hiển thị nhiều thông tin hơn',
      sidebar: 'Thanh bên',
      collapse_default: 'Thu gọn mặc định',
      collapse_default_desc: 'Sidebar sẽ thu gọn khi mở trang',
      show_labels: 'Hiển thị nhãn',
      show_labels_desc: 'Hiển thị tên bên cạnh icon',
      dashboard_customization: 'Tùy chỉnh Dashboard',
      show_widgets: 'Hiển thị widget',
      widgets_desc: 'Chọn các widget sẽ hiển thị trên Dashboard',
      default_time_range: 'Phạm vi thời gian mặc định',
      today: 'Hôm nay',
      week: 'Tuần này',
      month: 'Tháng này',
      quarter: 'Quý này',
      language: 'Ngôn ngữ',
      language_display: 'Ngôn ngữ hiển thị',
      language_note: 'Ngôn ngữ hiển thị sẽ được áp dụng cho toàn bộ ứng dụng.',
      preview: 'Xem trước',
      preview_desc: 'Đây là ví dụ về giao diện với các cài đặt hiện tại của bạn.',
      interface: 'Giao diện',
      interface_updated: 'Giao diện đã được cập nhật!',
      settings_saved: 'Cài đặt đã được lưu thành công!',
      settings_restored: 'Đã khôi phục cài đặt mặc định!',
      error_saving: 'Lỗi khi lưu cài đặt',
      error_restoring: 'Lỗi khi khôi phục',
      has_unsaved_changes: 'Có thay đổi chưa lưu',
      unsaved_changes_warning: 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?',
      last_saved: 'Lưu lần cuối',
      note: 'Lưu ý',
      note_theme: 'Một số thay đổi giao diện sẽ được áp dụng ngay lập tức, một số khác cần tải lại trang để hiệu lực hoàn toàn.',
      sample_chip: 'Chíp mẫu',
      success: 'Thành công',
      warning: 'Cảnh báo',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      loading: 'Đang tải...',
      please_login: 'Vui lòng đăng nhập để tiếp tục',
      // Common units and helpers
      minute: 'phút',
      min_short: 'p',
      hour_short: 'h',
      meter_short: 'm',
      off: 'Tắt',
      on: 'Bật',
      colors: {
        default: 'Mặc định',
        green: 'Xanh lá',
        purple: 'Tím',
        orange: 'Cam',
        red: 'Đỏ'
      }
    },
    settings: {
      tabs: {
        account: 'Tài khoản & Bảo mật',
        qr: 'QR & Điểm danh',
        notifications: 'Thông báo',
        interface: 'Giao diện',
        data: 'Dữ liệu & Báo cáo'
      },
      desc: {
        account: 'Quản lý thông tin cá nhân, mật khẩu và bảo mật',
        qr: 'Cài đặt chính sách QR Code và quy tắc điểm danh',
        notifications: 'Quản lý thông báo và nhắc nhở tự động',
        interface: 'Tùy chỉnh giao diện và bảng điều khiển',
        data: 'Cấu hình xuất dữ liệu và báo cáo tự động'
      },
      widgets: {
        attendance_today: 'Điểm danh hôm nay',
        class_schedule: 'Lớp học hôm nay',
        weekly_report: 'Thống kê điểm danh',
        recent_activities: 'Hoạt động gần đây',
        notifications: 'Thông báo mới'
      },
      // Account & Security
      account: {
        profile: {
          title: 'Thông tin cá nhân',
          labels: {
            first_name: 'Họ',
            last_name: 'Tên',
            email: 'Email',
            phone: 'Số điện thoại',
            department: 'Khoa/Bộ môn',
            bio: 'Giới thiệu'
          },
          email_fixed_note: 'Email không thể thay đổi',
          updated: 'Thông tin cá nhân đã được cập nhật!'
        },
        password: {
          title: 'Đổi mật khẩu',
          current: 'Mật khẩu hiện tại',
          new: 'Mật khẩu mới',
          confirm: 'Xác nhận mật khẩu mới',
          change_button: 'Đổi mật khẩu',
          changed: 'Mật khẩu đã được thay đổi thành công!',
          errors: {
            mismatch: 'Mật khẩu xác nhận không khớp',
            too_short: 'Mật khẩu mới phải có ít nhất 8 ký tự',
            current_incorrect: 'Mật khẩu hiện tại không chính xác',
            change_failed: 'Đổi mật khẩu thất bại'
          }
        },
        security: {
          title: 'Cài đặt bảo mật',
          two_factor: {
            title: 'Xác thực 2 yếu tố',
            desc: 'Thêm lớp bảo mật cho tài khoản'
          },
          new_login: {
            title: 'Thông báo đăng nhập mới',
            desc: 'Nhận thông báo khi có đăng nhập từ thiết bị mới'
          },
          session_timeout: {
            title: 'Thời gian hết phiên',
            desc: 'Tự động đăng xuất sau {{minutes}} phút không hoạt động'
          }
        },
        sessions: {
          title: 'Phiên đăng nhập',
          current_session: 'Phiên hiện tại',
          logout_all_others: 'Đăng xuất tất cả thiết bị khác ({{count}})',
          logged_out_session: 'Đã đăng xuất phiên làm việc #{{id}}',
          logged_out_others: 'Đã đăng xuất tất cả thiết bị khác'
        }
      },
      // QR & Attendance
      qr: {
        info: 'Các cài đặt này sẽ được áp dụng mặc định cho tất cả phiên điểm danh mới. Bạn vẫn có thể thay đổi riêng cho từng phiên khi cần.',
        qr_settings: 'Cài đặt QR Code',
        auto_refresh: {
          title: 'Tự động làm mới QR',
          desc: 'Mã QR sẽ tự động thay đổi sau {{minutes}} {{unit}}'
        },
        validity: {
          title: 'Thời hạn QR Code',
          desc: 'Mã QR hết hạn sau {{minutes}} {{unit}} kể từ khi tạo'
        },
        security_level: {
          title: 'Mức độ bảo mật',
          desc: 'Kiểm soát mức độ xác thực khi điểm danh',
          options: { low: 'Thấp', medium: 'Trung bình', high: 'Cao' }
        },
        manual_code: {
          title: 'Cho phép nhập mã thủ công',
          desc: 'Sinh viên có thể nhập mã nếu không quét được QR'
        },
        rules: {
          title: 'Quy tắc điểm danh',
          late_threshold: {
            label: 'Ngưỡng đi trễ',
            helper: 'Sau thời gian này tính là đi trễ'
          },
          absent_threshold: {
            label: 'Ngưỡng vắng mặt',
            helper: 'Sau thời gian này tính là vắng'
          },
          grace_time: {
            label: 'Thời gian ân hạn',
            helper: 'Thời gian cho phép điểm danh trước giờ học'
          },
          auto_close: 'Tự động đóng phiên khi hết giờ'
        },
        security: {
          title: 'Bảo mật điểm danh',
          location: {
            title: 'Xác thực vị trí',
            require: 'Yêu cầu xác thực vị trí',
            radius_label: 'Bán kính cho phép',
            warning: 'Sinh viên phải trong phạm vi {{meters}}m từ phòng học'
          },
          device: {
            title: 'Giới hạn thiết bị',
            max_per_student: 'Số thiết bị tối đa/sinh viên',
            helper: 'Giới hạn số thiết bị mỗi sinh viên có thể dùng',
            prevent_duplicate: 'Chặn điểm danh trùng lặp'
          }
        },
        defaults: {
          title: 'Phiên học mặc định',
          templates_label: 'Mẫu phiên học',
          templates: {
            standard: 'Tiêu chuẩn',
            lab: 'Thực hành',
            seminar: 'Seminar'
          },
          default_duration: 'Thời lượng mặc định',
          default_location: 'Vị trí mặc định',
          default_location_placeholder: 'VD: Phòng 14-02',
          preview: 'Xem trước cài đặt mặc định:',
          preview_fields: {
            auto_refresh: 'QR tự động làm mới',
            validity: 'Thời hạn QR',
            late_threshold: 'Ngưỡng trễ',
            security: 'Bảo mật'
          }
        },
        changed: 'Cài đặt đã thay đổi!',
        press_save: 'Nhấn "{{action}}" để lưu thay đổi'
      },
      // Notifications
      notifications: {
        channels_title: 'Kênh thông báo',
        in_app: {
          title: 'Thông báo trong ứng dụng',
          desc: 'Hiển thị popup và badge'
        },
        email: {
          title: 'Email',
          to: 'Gửi đến: {{email}}'
        },
        sms: {
          title: 'SMS',
          desc: 'Tin nhắn điện thoại (Premium)',
          premium: 'Tính năng Premium'
        },
        test_email_send: 'Gửi email test',
        test_email_sent: 'Email test đã gửi!',
        events_title: 'Sự kiện thông báo',
        events: {
          sessionStart: {
            label: 'Khi phiên học bắt đầu',
            description: 'Nhận thông báo khi phiên điểm danh mở'
          },
          studentCheckIn: {
            label: 'Khi sinh viên điểm danh',
            description: 'Thông báo realtime khi có sinh viên check-in',
            warning: 'Có thể gây nhiễu với lớp đông'
          },
          lowAttendance: {
            label: 'Cảnh báo điểm danh thấp',
            description: 'Khi tỷ lệ điểm danh < 60%'
          },
          suspiciousActivity: {
            label: 'Hoạt động đáng ngờ',
            description: 'Phát hiện điểm danh bất thường',
            important: 'Quan trọng'
          }
        },
        student_reminders_title: 'Nhắc nhở sinh viên',
        reminders: {
          reminderBeforeClass: {
            label: 'Nhắc nhở trước giờ học',
            unit: 'phút'
          },
          reminderDuringClass: {
            label: 'Nhắc nhở trong giờ học',
            description: 'Tự động nhắc sinh viên chưa điểm danh'
          },
          absenceNotification: {
            label: 'Thông báo vắng mặt',
            description: 'Gửi email cho sinh viên vắng'
          }
        },
        digest_and_recipients_title: 'Tóm tắt & Người nhận',
        digest: {
          title: 'Tóm tắt định kỳ',
          frequency_label: 'Tần suất',
          frequency_value: {
            none: 'Không gửi',
            daily: 'Hàng ngày',
            weekly: 'Hàng tuần'
          },
          send_time: 'Thời gian gửi'
        },
        recipients: {
          title: 'Email nhận thông báo bổ sung',
          placeholder: 'email@example.com',
          helper: 'Ngăn cách bằng dấu phẩy'
        },
        info_note: 'Thông báo email chỉ hoạt động khi bạn đã xác thực địa chỉ email. SMS là tính năng Premium và cần đăng ký gói dịch vụ.',
        updated_success: 'Cài đặt thông báo đã được cập nhật!'
      },
      // Data & Reports
      data: {
        export_title: 'Xuất dữ liệu',
        formats: {
          excel: 'Excel (.xlsx)',
          csv: 'CSV (.csv)',
          pdf: 'PDF (.pdf)'
        },
        default_format: 'Định dạng mặc định',
        columns_title: 'Cột dữ liệu xuất',
        columns: {
          mssv: 'Mã số sinh viên',
          name: 'Họ và tên',
          email: 'Email',
          phone: 'Số điện thoại',
          attendance: 'Điểm danh',
          attendance_rate: 'Tỷ lệ điểm danh',
          grade: 'Điểm số',
          notes: 'Ghi chú',
          last_checkin: 'Lần điểm danh cuối'
        },
        column_required: 'Bắt buộc',
        additional_options: 'Tùy chọn bổ sung',
        include_photos: 'Bao gồm ảnh sinh viên',
        include_charts: 'Thêm biểu đồ thống kê',
        test_export: {
          export_sample: 'Xuất mẫu',
          exporting: 'Đang xuất...'
        },
        privacy_title: 'Bảo mật dữ liệu',
        share_with_admin: {
          title: 'Chia sẻ với quản trị viên',
          desc: 'Cho phép admin xem báo cáo của bạn'
        },
        anonymize_exports: {
          title: 'Ẩn danh dữ liệu xuất',
          desc: 'Làm ẩn thông tin nhạy cảm khi xuất'
        },
        retention: {
          title: 'Thời gian lưu trữ',
          option_30: '30 ngày',
          option_90: '90 ngày',
          option_180: '180 ngày',
          option_365: '1 năm',
          desc: 'Dữ liệu sẽ được lưu trong {{days}} ngày'
        },
        auto_reports_title: 'Báo cáo tự động',
        auto_generate_label: 'Tự động tạo báo cáo định kỳ',
        frequency_label: 'Tần suất báo cáo',
        frequency: {
          daily: 'Hàng ngày',
          weekly: 'Hàng tuần',
          monthly: 'Hàng tháng',
          quarterly: 'Hàng quý'
        },
        report_template: 'Mẫu báo cáo',
        report_templates: {
          standard: {
            name: 'Tiêu chuẩn',
            desc: 'Báo cáo cơ bản với thông tin chính'
          },
          detailed: {
            name: 'Chi tiết',
            desc: 'Bao gồm tất cả thông tin và biểu đồ'
          },
          summary: {
            name: 'Tóm tắt',
            desc: 'Chỉ hiển thị thống kê chính'
          }
        },
        recipients_label: 'Gửi báo cáo đến',
        recipients_placeholder: 'email1@example.com, email2@example.com',
        recipients_helper: 'Ngăn cách bằng dấu phẩy',
        storage_title: 'Dung lượng lưu trữ',
        storage_used: 'Dung lượng sử dụng',
        storage_delete_old: 'Xóa dữ liệu cũ',
        storage: {
          categories: {
            reports: 'Báo cáo',
            exports: 'Dữ liệu xuất',
            images: 'Hình ảnh'
          }
        },
        cloud_backup_title: 'Sao lưu đám mây',
        cloud_backup_coming: 'Tính năng sao lưu tự động lên đám mây sắp ra mắt. Bạn sẽ có thể tự động sao lưu dữ liệu quan trọng và khôi phục khi cần.',
        connect_google_drive: 'Kết nối Google Drive',
        connect_onedrive: 'Kết nối OneDrive',
        connect_dropbox: 'Kết nối Dropbox'
      }
    },
    dashboard: {
      title_teacher: 'Dashboard Giảng viên',
      welcome: 'Chào mừng, {{first}} {{last}}',
      refresh_data: 'Làm mới dữ liệu',
      stats: {
        my_classes: 'Lớp của tôi',
        assigned_classes: 'Lớp được phân công',
        students: 'Sinh viên',
        total_students: 'Tổng sinh viên',
        attendance_rate: 'Tỷ lệ điểm danh',
        avg_today: 'Trung bình hôm nay',
        avg_grade: 'Điểm trung bình',
        recent_grade: 'Điểm gần đây'
      },
      today_sessions: {
        title: 'Buổi điểm danh hôm nay',
        none: 'Hôm nay chưa có buổi điểm danh',
        start: 'Bắt đầu',
        stop: 'Kết thúc',
        qr: 'QR điểm danh',
        view: 'Xem'
      },
      my_classes: {
        title: 'Lớp của tôi',
        none: 'Chưa được phân công lớp nào',
        students_suffix: 'sinh viên',
        manage: 'Quản lý'
      },
      quick_actions: {
        title: 'Thao tác nhanh',
        create_session: 'Tạo buổi học',
        generate_qr: 'Tạo QR điểm danh',
        join_code: 'Mã tham gia lớp',
        import_grades: 'Nhập điểm',
        view_reports: 'Xem báo cáo'
      },
      excel: {
        title: 'Import từ Excel',
        subtitle: 'Tải file Excel để nhập dữ liệu hàng loạt',
        import_students: 'Import Sinh Viên',
        import_grades: 'Import Điểm Số',
        import_attendance: 'Import Điểm Danh',
        drag_drop: 'Kéo Thả Excel'
      }
    }
  },
  en: {
    common: {
      settings: 'Settings',
      // Navigation & header
      nav: {
        home: 'Home',
        overview: 'Overview',
        my_classes: 'My classes',
        settings: 'Settings',
        students: 'Students',
        teachers: 'Teachers',
        classes: 'Classes',
        classes_student: 'Classes',
        grades: 'Grades management',
        grades_student: 'Grades',
        attendance: 'Attendance',
        schedule: 'Schedule',
        schedule_management: 'Schedule management',
        rooms: 'Rooms',
        reports: 'System reports'
      },
      header: {
        notifications: 'Notifications',
        settings: 'Settings',
        greeting: 'Hello, {{name}}',
        account: 'Account'
      },
      account: {
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Log out'
      },
      roles: {
        admin: 'Admin',
        teacher: 'Teacher',
        student: 'Student'
      },
      brand: {
        subtitle: 'Student management'
      },
      teacher_settings: 'Teacher Settings',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      restore: 'Restore',
      restored: 'Restored',
      restore_confirmation: 'Restore confirmation',
      restore_confirm_message: 'Are you sure you want to restore "{{section}}" to defaults? This action cannot be undone.',
      dark: 'Dark',
      light: 'Light',
      auto: 'Auto (system)',
      primary_color: 'Primary color',
      font_size: 'Font size',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      density: 'Density',
      comfortable: 'Comfortable',
      compact: 'Compact',
      comfortable_desc: 'More spacing, easier to read',
      compact_desc: 'Display more information',
      sidebar: 'Sidebar',
      collapse_default: 'Collapse by default',
      collapse_default_desc: 'Sidebar will be collapsed on page load',
      show_labels: 'Show labels',
      show_labels_desc: 'Show text next to icons',
      dashboard_customization: 'Dashboard customization',
      show_widgets: 'Show widgets',
      widgets_desc: 'Choose which widgets to display on Dashboard',
      default_time_range: 'Default time range',
      today: 'Today',
      week: 'This week',
      month: 'This month',
      quarter: 'This quarter',
      language: 'Language',
      language_display: 'Display language',
      language_note: 'Display language will be applied to the entire application.',
      preview: 'Preview',
      preview_desc: 'This is an example of the interface with your current settings.',
      interface: 'Interface',
      interface_updated: 'Interface updated!',
      settings_saved: 'Settings saved successfully!',
      settings_restored: 'Settings restored to defaults!',
      error_saving: 'Error saving settings',
      error_restoring: 'Error restoring',
      has_unsaved_changes: 'Unsaved changes',
      unsaved_changes_warning: 'You have unsaved changes. Are you sure you want to leave?',
      last_saved: 'Last saved',
      note: 'Note',
      note_theme: 'Some changes take effect immediately; others may require a page reload.',
      sample_chip: 'Sample chip',
      success: 'Success',
      warning: 'Warning',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      loading: 'Loading...',
      please_login: 'Please log in to continue',
      // Common units and helpers
      minute: 'minute',
      min_short: 'min',
      hour_short: 'h',
      meter_short: 'm',
      off: 'Off',
      on: 'On',
      colors: {
        default: 'Default',
        green: 'Green',
        purple: 'Purple',
        orange: 'Orange',
        red: 'Red'
      }
    },
    settings: {
      tabs: {
        account: 'Account & Security',
        qr: 'QR & Attendance',
        notifications: 'Notifications',
        interface: 'Interface',
        data: 'Data & Reports'
      },
      desc: {
        account: 'Manage personal info, password and security',
        qr: 'Configure QR policies and attendance rules',
        notifications: 'Manage notifications and reminders',
        interface: 'Customize UI and dashboard',
        data: 'Configure exports and automated reports'
      },
      widgets: {
        attendance_today: "Today's attendance",
        class_schedule: "Today's classes",
        weekly_report: 'Attendance statistics',
        recent_activities: 'Recent activities',
        notifications: 'New notifications'
      },
      account: {
        profile: {
          title: 'Profile',
          labels: {
            first_name: 'First name',
            last_name: 'Last name',
            email: 'Email',
            phone: 'Phone number',
            department: 'Department',
            bio: 'Bio'
          },
          email_fixed_note: 'Email cannot be changed',
          updated: 'Profile updated!'
        },
        password: {
          title: 'Change password',
          current: 'Current password',
          new: 'New password',
          confirm: 'Confirm new password',
          change_button: 'Change password',
          changed: 'Password changed successfully!',
          errors: {
            mismatch: 'Password confirmation does not match',
            too_short: 'New password must be at least 8 characters',
            current_incorrect: 'Current password is incorrect',
            change_failed: 'Password change failed'
          }
        },
        security: {
          title: 'Security settings',
          two_factor: {
            title: 'Two-factor authentication',
            desc: 'Add an extra security layer to your account'
          },
          new_login: {
            title: 'New login notification',
            desc: 'Get notified when there is a login from a new device'
          },
          session_timeout: {
            title: 'Session timeout',
            desc: 'Automatically log out after {{minutes}} minutes of inactivity'
          }
        },
        sessions: {
          title: 'Active sessions',
          current_session: 'Current session',
          logout_all_others: 'Log out all other devices ({{count}})',
          logged_out_session: 'Logged out session #{{id}}',
          logged_out_others: 'Logged out all other devices'
        }
      },
      qr: {
        info: 'These settings will apply by default to all new attendance sessions. You can still override them per session.',
        qr_settings: 'QR Code settings',
        auto_refresh: {
          title: 'Auto refresh QR',
          desc: 'QR code will rotate every {{minutes}} {{unit}}'
        },
        validity: {
          title: 'QR validity',
          desc: 'QR expires after {{minutes}} {{unit}} from creation'
        },
        security_level: {
          title: 'Security level',
          desc: 'Control the verification level for attendance',
          options: { low: 'Low', medium: 'Medium', high: 'High' }
        },
        manual_code: {
          title: 'Allow manual code entry',
          desc: "Students can enter a code if they can't scan the QR"
        },
        rules: {
          title: 'Attendance rules',
          late_threshold: {
            label: 'Late threshold',
            helper: 'After this time, a student is considered late'
          },
          absent_threshold: {
            label: 'Absent threshold',
            helper: 'After this time, a student is considered absent'
          },
          grace_time: {
            label: 'Grace time',
            helper: 'Allowed check-in time before class starts'
          },
          auto_close: 'Auto close session when time is up'
        },
        security: {
          title: 'Attendance security',
          location: {
            title: 'Location verification',
            require: 'Require location verification',
            radius_label: 'Allowed radius',
            warning: 'Students must be within {{meters}}m of the classroom'
          },
          device: {
            title: 'Device limits',
            max_per_student: 'Max devices per student',
            helper: 'Limit the number of devices each student can use',
            prevent_duplicate: 'Prevent duplicate check-in'
          }
        },
        defaults: {
          title: 'Default session',
          templates_label: 'Session templates',
          templates: {
            standard: 'Standard',
            lab: 'Lab',
            seminar: 'Seminar'
          },
          default_duration: 'Default duration',
          default_location: 'Default location',
          default_location_placeholder: 'e.g., Room 14-02',
          preview: 'Preview default settings:',
          preview_fields: {
            auto_refresh: 'QR auto refresh',
            validity: 'QR validity',
            late_threshold: 'Late threshold',
            security: 'Security'
          }
        },
        changed: 'Settings changed!',
        press_save: 'Press "{{action}}" to save changes'
      },
      notifications: {
        channels_title: 'Notification channels',
        in_app: {
          title: 'In-app notifications',
          desc: 'Show popups and badges'
        },
        email: {
          title: 'Email',
          to: 'Send to: {{email}}'
        },
        sms: {
          title: 'SMS',
          desc: 'Phone text (Premium)',
          premium: 'Premium feature'
        },
        test_email_send: 'Send test email',
        test_email_sent: 'Test email sent!',
        events_title: 'Notification events',
        events: {
          sessionStart: {
            label: 'When session starts',
            description: 'Notify when an attendance session opens'
          },
          studentCheckIn: {
            label: 'When a student checks in',
            description: 'Realtime notification when a student checks in',
            warning: 'May be noisy for large classes'
          },
          lowAttendance: {
            label: 'Low attendance warning',
            description: 'When attendance rate < 60%'
          },
          suspiciousActivity: {
            label: 'Suspicious activity',
            description: 'Detect abnormal attendance',
            important: 'Important'
          }
        },
        student_reminders_title: 'Student reminders',
        reminders: {
          reminderBeforeClass: {
            label: 'Reminder before class',
            unit: 'minutes'
          },
          reminderDuringClass: {
            label: 'Reminder during class',
            description: 'Auto remind students who have not checked in'
          },
          absenceNotification: {
            label: 'Absence notification',
            description: 'Send email to absent students'
          }
        },
        digest_and_recipients_title: 'Digest & Recipients',
        digest: {
          title: 'Periodic digest',
          frequency_label: 'Frequency',
          frequency_value: {
            none: "Don't send",
            daily: 'Daily',
            weekly: 'Weekly'
          },
          send_time: 'Send time'
        },
        recipients: {
          title: 'Additional recipient emails',
          placeholder: 'email@example.com',
          helper: 'Separate with commas'
        },
        info_note: 'Email notifications only work after verifying your email address. SMS is a Premium feature and requires a paid plan.',
        updated_success: 'Notification settings updated!'
      },
      data: {
        export_title: 'Export data',
        formats: {
          excel: 'Excel (.xlsx)',
          csv: 'CSV (.csv)',
          pdf: 'PDF (.pdf)'
        },
        default_format: 'Default format',
        columns_title: 'Export columns',
        columns: {
          mssv: 'Student ID',
          name: 'Full name',
          email: 'Email',
          phone: 'Phone number',
          attendance: 'Attendance',
          attendance_rate: 'Attendance rate',
          grade: 'Grade',
          notes: 'Notes',
          last_checkin: 'Last check-in'
        },
        column_required: 'Required',
        additional_options: 'Additional options',
        include_photos: 'Include student photos',
        include_charts: 'Include charts',
        test_export: {
          export_sample: 'Export sample',
          exporting: 'Exporting...'
        },
        privacy_title: 'Data privacy',
        share_with_admin: {
          title: 'Share with admin',
          desc: 'Allow admin to view your reports'
        },
        anonymize_exports: {
          title: 'Anonymize exported data',
          desc: 'Mask sensitive information on export'
        },
        retention: {
          title: 'Retention period',
          option_30: '30 days',
          option_90: '90 days',
          option_180: '180 days',
          option_365: '1 year',
          desc: 'Data will be retained for {{days}} days'
        },
        auto_reports_title: 'Automated reports',
        auto_generate_label: 'Auto-generate scheduled reports',
        frequency_label: 'Report frequency',
        frequency: {
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly',
          quarterly: 'Quarterly'
        },
        report_template: 'Report template',
        report_templates: {
          standard: { name: 'Standard', desc: 'Basic report with key info' },
          detailed: { name: 'Detailed', desc: 'Includes all info and charts' },
          summary: { name: 'Summary', desc: 'Only key statistics' }
        },
        recipients_label: 'Send report to',
        recipients_placeholder: 'email1@example.com, email2@example.com',
        recipients_helper: 'Separate with commas',
        storage_title: 'Storage usage',
        storage_used: 'Storage used',
        storage_delete_old: 'Delete old data',
        storage: {
          categories: {
            reports: 'Reports',
            exports: 'Exports',
            images: 'Images'
          }
        },
        cloud_backup_title: 'Cloud backup',
        cloud_backup_coming: 'Automatic cloud backup is coming soon. You will be able to auto-backup important data and restore when needed.',
        connect_google_drive: 'Connect Google Drive',
        connect_onedrive: 'Connect OneDrive',
      connect_dropbox: 'Connect Dropbox'
      }
    },
    dashboard: {
      title_teacher: 'Teacher Dashboard',
      welcome: 'Welcome, {{first}} {{last}}',
      refresh_data: 'Refresh data',
      stats: {
        my_classes: 'My classes',
        assigned_classes: 'Assigned classes',
        students: 'Students',
        total_students: 'Total students',
        attendance_rate: 'Attendance rate',
        avg_today: 'Today\'s average',
        avg_grade: 'Average grade',
        recent_grade: 'Recent grades'
      },
      today_sessions: {
        title: 'Today\'s sessions',
        none: 'No attendance sessions today',
        start: 'Start',
        stop: 'Stop',
        qr: 'Attendance QR',
        view: 'View'
      },
      my_classes: {
        title: 'My classes',
        none: 'No classes assigned',
        students_suffix: 'students',
        manage: 'Manage'
      },
      quick_actions: {
        title: 'Quick actions',
        create_session: 'Create session',
        generate_qr: 'Generate attendance QR',
        join_code: 'Class join code',
        import_grades: 'Record grades',
        view_reports: 'View reports'
      },
      excel: {
        title: 'Import from Excel',
        subtitle: 'Upload an Excel file to bulk import data',
        import_students: 'Import Students',
        import_grades: 'Import Grades',
        import_attendance: 'Import Attendance',
        drag_drop: 'Drag & Drop Excel'
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'vi',
    interpolation: { escapeValue: false },
    defaultNS: 'common'
  })

export default i18n
