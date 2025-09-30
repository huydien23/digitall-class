from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import ClassMaterial, MaterialVersion


@receiver(post_delete, sender=ClassMaterial)
def delete_file_on_delete(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)


@receiver(pre_save, sender=ClassMaterial)
def delete_old_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = ClassMaterial.objects.get(pk=instance.pk)
    except ClassMaterial.DoesNotExist:
        return
    old_file = old.file
    new_file = instance.file
    if old_file and old_file != new_file:
        old_file.delete(save=False)


@receiver(post_delete, sender=MaterialVersion)
def delete_material_version_file(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)
