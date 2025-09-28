import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const savedLang = typeof window !== 'undefined' ? (localStorage.getItem('appLanguage') || 'vi') : 'vi'

const resources = {
  vi: {
    common: {
      settings: 'Cài đặt',
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
      english: 'English'
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
      }
    }
  },
  en: {
    common: {
      settings: 'Settings',
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
      english: 'English'
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
        attendance_today: 'Today\'s attendance',
        class_schedule: 'Today\'s classes',
        weekly_report: 'Attendance statistics',
        recent_activities: 'Recent activities',
        notifications: 'New notifications'
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
