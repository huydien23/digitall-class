from django.core.management.base import BaseCommand
from django.conf import settings

from apps.students.models import Student
from apps.students.utils import create_user_for_student


class Command(BaseCommand):
    help = """
    Create User accounts for students who don't have one yet.
    Default password is the student's MSSV (student_id).
    Students can login with either email or MSSV.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', 
            action='store_true', 
            help='Only show what would be created without saving'
        )
        parser.add_argument(
            '--limit', 
            type=int, 
            default=None, 
            help='Limit number of students to process'
        )
        parser.add_argument(
            '--password', 
            type=str, 
            default=None, 
            help='Custom default password (defaults to student_id if not provided)'
        )
        parser.add_argument(
            '--force', 
            action='store_true', 
            help='Update existing User accounts if found'
        )
        parser.add_argument(
            '--email-domain',
            type=str,
            default=None,
            help='Filter students by email domain (e.g., student.nctu.edu.vn)'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        password = options['password']
        force = options['force']
        email_domain = options['email_domain']

        # Get students without User accounts (or all if force)
        qs = Student.objects.filter(is_active=True).select_related('user')
        
        if not force:
            qs = qs.filter(user__isnull=True)
        
        if email_domain:
            qs = qs.filter(email__iendswith=f'@{email_domain}')
            
        qs = qs.order_by('student_id')
        total = qs.count()
        
        if limit:
            qs = qs[:limit]

        self.stdout.write(f"Found {total} students to process{f' (limited to {limit})' if limit else ''}")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY-RUN MODE: No changes will be saved"))

        created_count = 0
        updated_count = 0
        error_count = 0
        processed = 0

        for student in qs:
            processed += 1
            try:
                if dry_run:
                    if student.user:
                        self.stdout.write(
                            f"  [{processed}/{total}] SKIP {student.student_id} - Already has User: {student.user.email}"
                        )
                    else:
                        self.stdout.write(
                            f"  [{processed}/{total}] WOULD CREATE User for {student.student_id} ({student.full_name})"
                            f" - Email: {student.email}, Password: {password or student.student_id}"
                        )
                else:
                    user, created = create_user_for_student(
                        student=student,
                        default_password=password,
                        force=force
                    )
                    
                    if created:
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"  [{processed}/{total}] CREATED User for {student.student_id} - "
                                f"Email: {user.email}, Login: {student.student_id} or {user.email}"
                            )
                        )
                    else:
                        updated_count += 1
                        self.stdout.write(
                            f"  [{processed}/{total}] EXISTS {student.student_id} - User: {user.email}"
                        )
                        
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"  [{processed}/{total}] ERROR {student.student_id}: {str(e)}"
                    )
                )

        # Summary
        self.stdout.write("\n" + "=" * 60)
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY-RUN SUMMARY:"))
            self.stdout.write(f"Would create: {total - updated_count} User accounts")
        else:
            self.stdout.write(self.style.SUCCESS("SUMMARY:"))
            self.stdout.write(f"Total processed: {processed}/{total}")
            self.stdout.write(self.style.SUCCESS(f"Created: {created_count}"))
            self.stdout.write(f"Already existed: {updated_count}")
            if error_count > 0:
                self.stdout.write(self.style.ERROR(f"Errors: {error_count}"))
            
        self.stdout.write("\n" + self.style.SUCCESS("Done!"))
        self.stdout.write(f"Students can now login with:")
        self.stdout.write(f"  - MSSV (student_id) + password")
        self.stdout.write(f"  - Email + password")
        self.stdout.write(f"Default password: {password or 'student_id (MSSV)'}")
