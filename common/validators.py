from django.core.exceptions import ValidationError
from django.conf import settings
import magic
import os

def validate_file_type(file_obj, allowed_types):
    """
    Validate file type using python-magic.
    """
    # Read the first 2048 bytes to determine the file type
    file_mime = magic.from_buffer(file_obj.read(2048), mime=True)
    file_obj.seek(0)  # Reset file pointer
    
    if file_mime not in allowed_types:
        raise ValidationError(f'File type {file_mime} is not allowed. Allowed types: {", ".join(allowed_types)}')

def validate_file_size(file_obj, max_size=settings.FILE_UPLOAD_MAX_MEMORY_SIZE):
    """
    Validate file size.
    """
    if file_obj.size > max_size:
        raise ValidationError(f'File size must be no more than {max_size/1024/1024}MB')

def validate_image_dimensions(image, min_width=100, min_height=100, max_width=2000, max_height=2000):
    """
    Validate image dimensions.
    """
    width, height = image.size
    if width < min_width or height < min_height:
        raise ValidationError(f'Image dimensions must be at least {min_width}x{min_height} pixels')
    if width > max_width or height > max_height:
        raise ValidationError(f'Image dimensions must be no more than {max_width}x{max_height} pixels')

def validate_form_schema(schema):
    """
    Validate the form schema structure.
    """
    required_fields = ['fields']
    if not all(field in schema for field in required_fields):
        raise ValidationError('Form schema must contain "fields" key')
    
    if not isinstance(schema['fields'], list):
        raise ValidationError('Form schema "fields" must be a list')
    
    for field in schema['fields']:
        if not isinstance(field, dict):
            raise ValidationError('Each field must be a dictionary')
        
        required_field_keys = ['name', 'type', 'label']
        if not all(key in field for key in required_field_keys):
            raise ValidationError(f'Each field must contain: {", ".join(required_field_keys)}')
        
        if field['type'] == 'file':
            if 'accept' not in field:
                raise ValidationError('File fields must specify accepted file types')
            if not isinstance(field['accept'], list):
                raise ValidationError('File field "accept" must be a list of file types') 