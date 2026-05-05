import boto3
from app.config import settings

if not settings.AWS_REGION:
    raise RuntimeError("Missing AWS_REGION")

dynamodb = boto3.resource("dynamodb", region_name=settings.AWS_REGION)