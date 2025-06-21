from django.contrib import admin
from .models import JobPost

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'agency', 'created_at')
    list_filter = ('agency', 'created_at')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'agency')
        }),
        ('Form Schema', {
            'fields': ('schema',),
            'description': 'Include "as_on_date" in the schema for experience calculation cutoff'
        }),
    ) 