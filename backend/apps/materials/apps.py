from django.apps import AppConfig


class MaterialsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.materials'
    verbose_name = 'Tài liệu'

    def ready(self):
        # Import signals to ensure they are registered
        from . import signals  # noqa
