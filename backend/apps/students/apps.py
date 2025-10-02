from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.students'

    def ready(self):
        # Import signals to ensure pre_save hooks are registered
        try:
            import apps.students.signals  # noqa: F401
        except Exception:
            # Avoid breaking startup if migrations or apps not ready
            pass
