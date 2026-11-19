"""
python manage.py ensure_bucket

Creates the private S3 bucket for uploads if it does not exist yet.
Run once after starting the local storage container (RustFS).
On AWS the bucket is created by Terraform instead.
"""

import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create the uploads bucket if it is missing."

    def handle(self, *args, **options):
        if not settings.USE_S3:
            raise CommandError("USE_S3 is False, so files are saved in backend/media. Nothing to create.")
        opts = settings.STORAGES["default"]["OPTIONS"]
        s3 = boto3.client(
            "s3",
            endpoint_url=opts["endpoint_url"],
            aws_access_key_id=opts["access_key"],
            aws_secret_access_key=opts["secret_key"],
            region_name=opts["region_name"],
        )
        bucket = opts["bucket_name"]
        try:
            s3.head_bucket(Bucket=bucket)
            self.stdout.write(self.style.SUCCESS(f"Bucket '{bucket}' already exists."))
        except ClientError:
            s3.create_bucket(Bucket=bucket)
            self.stdout.write(self.style.SUCCESS(f"Created private bucket '{bucket}'."))
