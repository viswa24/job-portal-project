from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Agency, JobPost
from .serializers import AgencySerializer, JobPostSerializer

# Create your views here.

class AgencyViewSet(viewsets.ModelViewSet):
    queryset = Agency.objects.all()
    serializer_class = AgencySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'code'

    @action(detail=True, methods=['get'])
    def job_posts(self, request, code=None):
        agency = self.get_object()
        job_posts = JobPost.objects.filter(agency=agency, is_active=True)
        serializer = JobPostSerializer(job_posts, many=True)
        return Response(serializer.data)

class JobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = JobPost.objects.all()
        agency_code = self.request.query_params.get('agency', None)
        if agency_code:
            queryset = queryset.filter(agency__code=agency_code)
        return queryset

    @action(detail=True, methods=['get'])
    def form_schema(self, request, pk=None):
        job_post = self.get_object()
        # Get default schema from agency
        default_schema = job_post.agency.default_form_schema
        job_schema = job_post.form_schema

        # Merge schemas
        merged_schema = {
            "fields": [],
            "as_on_date": default_schema.get("as_on_date") 
        }

        # Add default fields
        if "fields" in default_schema:
            merged_schema["fields"].extend(default_schema["fields"])

        # Add or override with job-specific fields
        if "fields" in job_schema:
            # Create a map of existing fields by name
            field_map = {field["name"]: field for field in merged_schema["fields"]}
            
            # Add or update fields from job schema
            for field in job_schema["fields"]:
                field_map[field["name"]] = field
            
            # Convert back to list
            merged_schema["fields"] = list(field_map.values())

        # Override as_on_date if it exists in job_schema
        if "as_on_date" in job_schema:
            merged_schema["as_on_date"] = job_schema.get("as_on_date")

        return Response(merged_schema)
