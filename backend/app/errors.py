class ServiceError(Exception):
    status_code = 503
    code = "service_unavailable"

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


class VerificationServiceError(ServiceError):
    code = "verification_unavailable"


class StorageServiceError(ServiceError):
    code = "storage_unavailable"
