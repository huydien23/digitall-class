from django.contrib import admin
from .models import ClassMaterial

@admin.register(ClassMaterial)
class ClassMaterialAdmin(admin.ModelAdmin):
    list_display = ('id', 'class_obj', 'title', 'created_by', 'created_at')
    list_filter = ('class_obj', 'created_at')
    search_fields = ('title', 'description', 'class_obj__class_name', 'class_obj__class_id')
