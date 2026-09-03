from google.cloud import storage
import google.auth
from google.auth import iam
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = os.getenv("BUCKET_NAME")
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT")
SIGNING_SERVICE_ACCOUNT_EMAIL = os.getenv("SIGNING_SERVICE_ACCOUNT_EMAIL")

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


def get_signed_image_url(object_name: str) -> str | None:
    if bucket is None or not SIGNING_SERVICE_ACCOUNT_EMAIL:
        print(
            "GCP signed URL generation failed: missing bucket or signing service account config. "
            "Set BUCKET_NAME and SIGNING_SERVICE_ACCOUNT_EMAIL before requesting images."
        )
        return None

    try:
        credentials, project_id = google.auth.default()
        signer = iam.Signer(
            Request(),
            credentials,
            SIGNING_SERVICE_ACCOUNT_EMAIL,
        )
        signing_credentials = service_account.Credentials(
            signer=signer,
            service_account_email=SIGNING_SERVICE_ACCOUNT_EMAIL,
            project_id=project_id or PROJECT_ID,
            token_uri="https://oauth2.googleapis.com/token",
        )
        blob = bucket.blob(object_name)
        return blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=15),
            method="GET",
            credentials=signing_credentials,
        )
    except Exception as exc:
        print(f"GCP signed URL generation failed: {exc}")
        return None
