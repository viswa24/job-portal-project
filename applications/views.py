from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Application, ApplicationDocument
from .serializers import ApplicationSerializer, ApplicationDocumentSerializer
from agencies.models import JobPost
from common.storage import generate_presigned_url
from common.validators import validate_file_type, validate_file_size
from .authentication import CsrfExemptSessionAuthentication

# Create your views here.

class IsAuthenticatedOrCreateOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticatedOrCreateOnly]
    authentication_classes = [CsrfExemptSessionAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Application.objects.all()
        job_post_id = self.request.query_params.get('job_post', None)
        if job_post_id:
            queryset = queryset.filter(job_post_id=job_post_id)
        return queryset

    def perform_create(self, serializer):
        # Get client IP
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        
        serializer.save(ip_address=ip)

    @action(detail=False, methods=['post'])
    def upload_url(self, request):
        file_name = request.data.get('file_name')
        file_type = request.data.get('file_type')
        folder = request.data.get('folder', 'uploads/')

        if not file_name or not file_type:
            return Response(
                {'error': 'file_name and file_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        presigned_data = generate_presigned_url(file_name, file_type, folder)
        if not presigned_data:
            return Response(
                {'error': 'Failed to generate upload URL'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(presigned_data)

    def create(self, request, *args, **kwargs):
        # Use the default serializer to validate and create the Application
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        application = serializer.instance

        # Handle education_qualifications certificate files
        form_data = application.form_data or {}
        eq_list = form_data.get('education_qualifications', [])
        updated_eq_list = []
        for idx, eq in enumerate(eq_list):
            cert_key = eq.get('certificate')
            if cert_key and cert_key in request.FILES:
                file_obj = request.FILES[cert_key]
                doc = ApplicationDocument.objects.create(
                    application=application,
                    document_type='education_certificate',
                    file=file_obj
                )
                # Store the file URL in the JSON
                eq['certificate'] = doc.file.url
            updated_eq_list.append(eq)
        form_data['education_qualifications'] = updated_eq_list

        # Handle work_experience certificate files
        we_list = form_data.get('work_experience', [])
        updated_we_list = []
        for idx, we in enumerate(we_list):
            cert_key = we.get('certificate')
            if cert_key and cert_key in request.FILES:
                file_obj = request.FILES[cert_key]
                doc = ApplicationDocument.objects.create(
                    application=application,
                    document_type='work_experience_certificate',
                    file=file_obj
                )
                # Store the file URL in the JSON
                we['certificate'] = doc.file.url
            updated_we_list.append(we)
        form_data['work_experience'] = updated_we_list

        application.form_data = form_data
        application.save(update_fields=['form_data'])

        headers = self.get_success_headers(serializer.data)
        return Response(self.get_serializer(application).data, status=status.HTTP_201_CREATED, headers=headers)

class ApplicationDocumentViewSet(viewsets.ModelViewSet):
    queryset = ApplicationDocument.objects.all()
    serializer_class = ApplicationDocumentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = ApplicationDocument.objects.all()
        application_id = self.request.query_params.get('application', None)
        if application_id:
            queryset = queryset.filter(application_id=application_id)
        return queryset

    def perform_create(self, serializer):
        # Validate file type and size
        file_obj = self.request.FILES.get('file')
        if file_obj:
            validate_file_type(file_obj, ['application/pdf', 'image/jpeg', 'image/png'])
            validate_file_size(file_obj)
        
        serializer.save()
