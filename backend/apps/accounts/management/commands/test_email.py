from django.core.management.base import BaseCommand
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from apps.accounts.models import User
from apps.accounts.email_utils import send_password_reset_email, send_password_reset_confirmation_email


class Command(BaseCommand):
    help = 'Test email functionality for password reset'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test email to',
            required=True
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['reset', 'confirmation'],
            default='reset',
            help='Type of email to send (reset or confirmation)'
        )

    def handle(self, *args, **options):
        email = options['email']
        email_type = options['type']
        
        try:
            # Find user by email
            user = User.objects.get(email=email)
            
            if email_type == 'reset':
                # Generate token and send reset email
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
                
                success = send_password_reset_email(user, reset_url)
                
                if success:
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Password reset email sent successfully to {email}')
                    )
                    self.stdout.write(f'Reset URL: {reset_url}')
                else:
                    self.stdout.write(
                        self.style.ERROR(f'❌ Failed to send password reset email to {email}')
                    )
                    
            elif email_type == 'confirmation':
                # Send confirmation email
                success = send_password_reset_confirmation_email(user)
                
                if success:
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Confirmation email sent successfully to {email}')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f'❌ Failed to send confirmation email to {email}')
                    )
                    
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ User with email {email} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error: {str(e)}')
            )
