from google.cloud import storage
import os
from dotenv import load_dotenv
load_dotenv()

BUCKET_NAME=os.getenv("BUCKET_NAME")

client = storage.Client()

bucket = client.bucket(BUCKET_NAME)

def upload_image( image_bytes: bytes, object_name: str, content_type: str) -> str | None:
    try:
        blob = bucket.blob(object_name)
        blob.upload_from_string(
            data=image_bytes,
            content_type=content_type
        )
        return object_name
    except Exception as exec:
        print(f"GCP image upload failed: {exec}")
        return None
    