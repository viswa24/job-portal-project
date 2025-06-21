from django.contrib import admin
from django import forms
from .models import Agency, JobPost
import json

class PrettyJSONWidget(forms.Textarea):
    def format_value(self, value):
        if value is None or value == '':
            return ''
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except Exception:
                return value
        return json.dumps(value, indent=2, ensure_ascii=False)

class AgencyAdminForm(forms.ModelForm):
    class Meta:
        model = Agency
        fields = '__all__'
        widgets = {
            'default_form_schema': PrettyJSONWidget(attrs={'rows': 20, 'cols': 80}),
        }

class JobPostAdminForm(forms.ModelForm):
    class Meta:
        model = JobPost
        fields = '__all__'
        widgets = {
            'form_schema': PrettyJSONWidget(attrs={'rows': 20, 'cols': 80}),
        }

@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    form = AgencyAdminForm
    list_display = ('name', 'code', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'code')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {
            'fields': ('name', 'code', 'description', 'instructions', 'is_active')
        }),
        ('Form Schema', {
            'classes': ('collapse',),
            'fields': ('default_form_schema',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    form = JobPostAdminForm
    list_display = ('title', 'agency', 'is_active', 'created_at')
    list_filter = ('is_active', 'agency', 'created_at')
    search_fields = ('title', 'description', 'agency__name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
