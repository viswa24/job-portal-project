from django.db import models
from agencies.models import JobPost
from datetime import datetime, timedelta

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    ]

    job_post = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Custom application ID (agency-specific)
    custom_application_id = models.CharField(max_length=32, unique=True, blank=True, null=True)
    
    # Dynamic form data
    form_data = models.JSONField()  # Stores all form submissions including custom fields
    
    # File uploads
    photo = models.ImageField(upload_to='applications/photos/')
    signature = models.ImageField(upload_to='applications/signatures/')
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.custom_application_id:
            agency_code = self.job_post.agency.code.upper()
            # Count existing applications for this agency
            count = Application.objects.filter(job_post__agency__code=agency_code).count() + 1
            self.custom_application_id = f"{agency_code}-{count:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.custom_application_id} - {self.full_name} - {self.job_post.title}"

    def get_total_experience(self):
        """
        Calculate total work experience from form_data, considering as_on_date from job post schema.
        Returns: 'X years Y days' format
        """
        total_days = 0
        
        # Get as_on_date from job post schema
        as_on_date = None
        if hasattr(self.job_post, 'form_schema') and self.job_post.form_schema:
            as_on_date = self.job_post.form_schema.get('as_on_date')
        
        if as_on_date:
            try:
                as_on_date = datetime.strptime(as_on_date, "%Y-%m-%d").date()
            except (ValueError, TypeError):
                as_on_date = None
        
        # Get work experience from form_data
        work_experience = self.form_data.get('work_experience', [])
        
        if not work_experience:
            return "0 years 0 days"
        
        for exp in work_experience:
            from_date = exp.get('from_date')
            to_date = exp.get('to_date')
            
            if from_date and to_date:
                try:
                    from_date = datetime.strptime(from_date, "%Y-%m-%d").date()
                    to_date = datetime.strptime(to_date, "%Y-%m-%d").date()
                    
                    # Use as_on_date if to_date is after as_on_date
                    if as_on_date and to_date > as_on_date:
                        to_date = as_on_date
                    
                    # Calculate days (inclusive of both dates)
                    days = (to_date - from_date).days + 1
                    if days > 0:
                        total_days += days
                        
                except (ValueError, TypeError):
                    continue
        
        years = total_days // 365
        days = total_days % 365
        
        return f"{years} years {days} days"
    
    get_total_experience.short_description = "Total Work Experience"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['job_post', 'status']),
            models.Index(fields=['email']),
        ]

class ApplicationDocument(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50)  # e.g., 'education_certificate', 'experience_certificate'
    file = models.FileField(upload_to='applications/documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.application} - {self.document_type}"

    class Meta:
        ordering = ['-uploaded_at']
