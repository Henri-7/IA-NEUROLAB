import logging
from time import perf_counter

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


def configure_logging(log_level: str) -> None:
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        started_at = perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration_ms = (perf_counter() - started_at) * 1000
            logging.getLogger("neurolab_ai.request").info(
                "request method=%s route=%s status=%s duration_ms=%.2f",
                request.method,
                request.url.path,
                status_code,
                duration_ms,
            )
