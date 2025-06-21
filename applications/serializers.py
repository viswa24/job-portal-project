from rest_framework import serializers
from .models import Application, ApplicationDocument
from agencies.serializers import JobPostSerializer

class ApplicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationDocument
        fields = ['id', 'application', 'document_type', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']

class ApplicationSerializer(serializers.ModelSerializer):
    job_post_details = JobPostSerializer(source='job_post', read_only=True)
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    agency_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ['id', 'agency_code', 'job_post', 'job_post_details', 'full_name', 'email', 'phone', 'form_data', 'photo', 'signature', 'status', 'notes', 'documents', 'created_at', 'updated_at', 'ip_address']
        read_only_fields = ['status', 'created_at', 'updated_at', 'ip_address']
    
    def get_agency_code(self, obj):
        return obj.job_post.agency.code

    def validate_form_data(self, value):
        # Validate that form_data matches the job_post's form_schema
        job_post = self.context.get('job_post')
        if job_post:
            schema_fields = {field['name'] for field in job_post.form_schema['fields']}
            form_data_fields = set(value.keys())
            
            # Check for missing required fields
            missing_fields = schema_fields - form_data_fields
            if missing_fields:
                raise serializers.ValidationError(f'Missing required fields: {", ".join(missing_fields)}')
            
            # Check for extra fields
            extra_fields = form_data_fields - schema_fields
            if extra_fields:
                raise serializers.ValidationError(f'Extra fields not allowed: {", ".join(extra_fields)}')
        
        return value 