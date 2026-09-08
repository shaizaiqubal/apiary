from fastapi import HTTPException, UploadFile, status

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024


def validate_image_content_type(photo: UploadFile) -> str:
    content_type = photo.content_type
    if content_type not in ALLOWED_IMAGE_TYPES:
        allowed_types = ", ".join(sorted(ALLOWED_IMAGE_TYPES))
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type. Use one of: {allowed_types}.",
        )
    return content_type


def validate_image_size(image_bytes: bytes) -> None:
    if len(image_bytes) > MAX_IMAGE_BYTES:
        max_size_mb = MAX_IMAGE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image is too large. Maximum size is {max_size_mb} MB.",
        )
