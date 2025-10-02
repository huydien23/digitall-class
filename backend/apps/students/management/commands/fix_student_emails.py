from django.core.management.base import BaseCommand
from django.conf import settings

from apps.students.models import Student
from apps.students.utils import build_student_email


class Command(BaseCommand):
    help = "Fix or (re)generate student emails to the format {lowercase_given_name}{MSSV}@{STUDENT_EMAIL_DOMAIN}."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Only show changes without saving')
        parser.add_argument('--limit', type=int, default=None, help='Limit number of students to process')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        domain = getattr(settings, 'STUDENT_EMAIL_DOMAIN', 'student.nctu.edu.vn').strip().lower()

        qs = Student.objects.all().order_by('student_id')
        total = qs.count()
        if limit:
            qs = qs[:limit]

        changed = 0
        processed = 0
        for s in qs:
            processed += 1
            target = build_student_email(s.first_name or '', s.student_id, domain)
            needs = False
            if not s.email:
                needs = True
            else:
                dom = s.email.split('@')[-1].lower() if '@' in s.email else ''
                if dom.endswith('.local') or dom == 'student.local' or s.email != target:
                    needs = True
            if needs:
                changed += 1
                if dry_run:
                    self.stdout.write(f"DRY-RUN would set {s.student_id}: {s.email!r} -> {target!r}")
                else:
                    s.email = target
                    s.save(update_fields=['email'])
                    self.stdout.write(f"Updated {s.student_id}: {target}")

        self.stdout.write(self.style.SUCCESS(
            f"Processed {processed}/{total} students. {'Changed ' + str(changed) if changed else 'No changes needed.'}"
        ))
