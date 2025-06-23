from django.contrib import admin
from django.db.models import Count
from .models import JobPost

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'agency', 'application_count', 'created_at')
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

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            _application_count=Count("application", distinct=True)
        )
        return queryset

    @admin.display(description='Applicant Count', ordering='_application_count')
    def application_count(self, obj):
        return obj._application_count 