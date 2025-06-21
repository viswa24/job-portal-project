from django.contrib import admin
from .models import Application, ApplicationDocument

class ApplicationDocumentInline(admin.TabularInline):
    model = ApplicationDocument
    extra = 0
    readonly_fields = ('uploaded_at',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'job_post', 'status', 'get_total_experience', 'created_at')
    list_filter = ('status', 'job_post__agency', 'created_at')
    search_fields = ('full_name', 'email', 'job_post__title')
    readonly_fields = ('ip_address', 'created_at', 'updated_at', 'get_total_experience')
    inlines = [ApplicationDocumentInline]
    ordering = ('-created_at',)

@admin.register(ApplicationDocument)
class ApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ('application', 'document_type', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at')
    search_fields = ('application__first_name', 'application__last_name', 'document_type')
    readonly_fields = ('uploaded_at',)
    ordering = ('-uploaded_at',)
