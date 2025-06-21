from django.db import models
from agencies.models import Agency

class JobPost(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE)
    schema = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title 