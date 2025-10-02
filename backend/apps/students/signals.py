from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.conf import settings

from .models import Student
from .utils import build_student_email


@receiver(pre_save, sender=Student)
def ensure_student_email(sender, instance: Student, **kwargs):
    """
    Auto-generate student email when:
    - email is empty, or
    - email uses a placeholder/local domain (e.g., *.local)

    Format: {lowercase_given_name}{MSSV}@{STUDENT_EMAIL_DOMAIN}
    Only the given name (instance.first_name) is lowercased and accent-free.
    MSSV is appended as-is.
    """
    try:
        domain = getattr(settings, 'STUDENT_EMAIL_DOMAIN', 'student.nctu.edu.vn').strip().lower()
        current_email = (instance.email or '').strip()
        needs_generate = False

        if not current_email:
            needs_generate = True
        else:
            local_domain = current_email.split('@')[-1].lower() if '@' in current_email else ''
            if local_domain.endswith('.local') or local_domain == 'student.local':
                needs_generate = True

        if needs_generate and instance.student_id:
            instance.email = build_student_email(
                given_name=(instance.first_name or ''),
                student_id=instance.student_id,
                domain=domain,
            )
    except Exception:
        # Do not block save if anything goes wrong; keep original value
        pass
