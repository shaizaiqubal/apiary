from google.cloud import storage
import os
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = os.getenv("BUCKET_NAME")
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT")

try:
    client = storage.Client(project=PROJECT_ID) if PROJECT_ID else storage.Client()
    bucket = client.bucket(BUCKET_NAME) if BUCKET_NAME else None
except Exception as exc:
    client = None
    bucket = None
    _storage_init_error = exc
else:
    _storage_init_error = None


def upload_image(image_bytes: bytes, object_name: str, content_type: str) -> str | None:
    if client is None or bucket is None:
        print(
            "GCP image upload failed: missing Google Cloud project or bucket config. "
            "Set GOOGLE_CLOUD_PROJECT and BUCKET_NAME before uploading images."
        )
        if _storage_init_error:
            print(_storage_init_error)
        return None

    try:
        blob = bucket.blob(object_name)
        blob.upload_from_string(
            data=image_bytes,
            content_type=content_type,
        )
        return object_name
    except Exception as exc:
        print(f"GCP image upload failed: {exc}")
        return None
