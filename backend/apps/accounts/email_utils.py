# Email utilities for password reset
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_password_reset_email(user, reset_url):
    """Send password reset email to user"""
    try:
        # Email configuration
        smtp_server = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com')
        smtp_port = getattr(settings, 'EMAIL_PORT', 587)
        sender_email = getattr(settings, 'EMAIL_HOST_USER', 'noreply@eduattend.com')
        sender_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
        
        if not sender_password:
            logger.warning("Email password not configured, skipping email send")
            return False
        
        # Email content
        subject = "Đặt lại mật khẩu - EduAttend"
        
        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Đặt lại mật khẩu</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 14px;
                    color: #6b7280;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎓 EduAttend</h1>
                <p>Hệ thống quản lý sinh viên</p>
            </div>
            <div class="content">
                <h2>Xin chào {user.first_name}!</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Đặt lại mật khẩu</a>
                </p>
                <p><strong>Lưu ý quan trọng:</strong></p>
                <ul>
                    <li>Link này sẽ hết hạn sau 24 giờ</li>
                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                    <li>Để bảo mật, không chia sẻ link này với bất kỳ ai</li>
                </ul>
                <p>Nếu nút không hoạt động, bạn có thể copy và paste link sau vào trình duyệt:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">
                    {reset_url}
                </p>
            </div>
            <div class="footer">
                <p>Email này được gửi tự động từ hệ thống EduAttend.</p>
                <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ: support@eduattend.com</p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Xin chào {user.first_name}!
        
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        
        Vui lòng truy cập link sau để đặt lại mật khẩu:
        {reset_url}
        
        Lưu ý:
        - Link này sẽ hết hạn sau 24 giờ
        - Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này
        - Để bảo mật, không chia sẻ link này với bất kỳ ai
        
        Trân trọng,
        Đội ngũ EduAttend
        """
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"EduAttend <{sender_email}>"
        message["To"] = user.email
        
        # Add both plain text and HTML versions
        text_part = MIMEText(text_content, "plain", "utf-8")
        html_part = MIMEText(html_content, "html", "utf-8")
        
        message.attach(text_part)
        message.attach(html_part)
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, user.email, message.as_string())
        server.quit()
        
        logger.info(f"Password reset email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        return False


def send_password_reset_confirmation_email(user):
    """Send confirmation email after successful password reset"""
    try:
        # Email configuration
        smtp_server = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com')
        smtp_port = getattr(settings, 'EMAIL_PORT', 587)
        sender_email = getattr(settings, 'EMAIL_HOST_USER', 'noreply@eduattend.com')
        sender_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
        
        if not sender_password:
            logger.warning("Email password not configured, skipping confirmation email")
            return False
        
        # Email content
        subject = "Mật khẩu đã được đặt lại thành công - EduAttend"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Mật khẩu đã được đặt lại</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .success-icon {{
                    font-size: 48px;
                    text-align: center;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎓 EduAttend</h1>
                <p>Hệ thống quản lý sinh viên</p>
            </div>
            <div class="content">
                <div class="success-icon">✅</div>
                <h2>Xin chào {user.first_name}!</h2>
                <p>Mật khẩu của bạn đã được đặt lại thành công.</p>
                <p>Bạn có thể đăng nhập vào hệ thống với mật khẩu mới.</p>
                <p><strong>Lưu ý bảo mật:</strong></p>
                <ul>
                    <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                    <li>Sử dụng mật khẩu mạnh và duy nhất</li>
                    <li>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với chúng tôi</li>
                </ul>
            </div>
        </body>
        </html>
        """
        
        # Create and send message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"EduAttend <{sender_email}>"
        message["To"] = user.email
        
        html_part = MIMEText(html_content, "html", "utf-8")
        message.attach(html_part)
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, user.email, message.as_string())
        server.quit()
        
        logger.info(f"Password reset confirmation email sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {user.email}: {str(e)}")
        return False
