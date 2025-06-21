from rest_framework import serializers
from .models import Agency, JobPost
from common.validators import validate_form_schema

class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ['id', 'name', 'code', 'description', 'instructions', 'default_form_schema', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['code', 'created_at', 'updated_at']

class JobPostSerializer(serializers.ModelSerializer):
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    
    class Meta:
        model = JobPost
        fields = ['id', 'agency', 'agency_name', 'title', 'description', 'form_schema', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_form_schema(self, value):
        validate_form_schema(value)
        return value 