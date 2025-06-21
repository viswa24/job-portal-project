from django.db import models
from django.utils.text import slugify

# Create your models here.

class Agency(models.Model):
    name = models.CharField(max_length=255)
    code = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True, help_text="Instructions to be displayed on the agency's landing page.")
    default_form_schema = models.JSONField(default=dict, help_text="Default form fields for all job posts")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        if not self.default_form_schema:
            self.default_form_schema = {
                "fields": [
                    {
                        "name": "full_name",
                        "label": "Full Name",
                        "type": "text",
                        "required": True
                    },
                    {
                        "name": "email",
                        "label": "Email",
                        "type": "email",
                        "required": True
                    },
                    {
                        "name": "phone",
                        "label": "Phone Number",
                        "type": "text",
                        "required": True
                    },
                    {
                        "name": "resume",
                        "label": "Resume",
                        "type": "file",
                        "required": True,
                        "accept": [".pdf", ".doc", ".docx"]
                    }
                ]
            }
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Agencies"
        ordering = ['-created_at']

class JobPost(models.Model):
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name='job_posts')
    title = models.CharField(max_length=255)
    description = models.TextField()
    form_schema = models.JSONField()  # Stores the dynamic form configuration
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.agency.name} - {self.title}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['agency', 'title']
