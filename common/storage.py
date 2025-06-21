import boto3
from django.conf import settings
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

def generate_presigned_url(file_name, file_type, folder='uploads/'):
    """
    Generate a presigned URL for uploading a file to S3.
    """
    try:
        s3_client = boto3.client('s3',
                                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                region_name=settings.AWS_S3_REGION_NAME)
        
        key = f"{folder}{file_name}"
        
        presigned_post = s3_client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
            Fields={"Content-Type": file_type},
            Conditions=[
                ["content-length-range", 0, settings.FILE_UPLOAD_MAX_MEMORY_SIZE],
                {"Content-Type": file_type}
            ],
            ExpiresIn=600  # URL expires in 10 minutes
        )
        
        return presigned_post
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        return None

def delete_file_from_s3(file_path):
    """
    Delete a file from S3.
    """
    try:
        s3_client = boto3.client('s3',
                                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                region_name=settings.AWS_S3_REGION_NAME)
        
        s3_client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=file_path
        )
        return True
    except ClientError as e:
        logger.error(f"Error deleting file from S3: {e}")
        return False 