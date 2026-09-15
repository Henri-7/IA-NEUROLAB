import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("neurolab_ai.errors")


class AppError(Exception):
    def __init__(self, *, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def error_payload(code: str, message: str) -> dict[str, dict[str, str]]:
    return {"error": {"code": code, "message": message}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content=error_payload(exc.code, exc.message))

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, __: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_payload("VALIDATION_ERROR", "Os dados enviados são inválidos."),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
        message = "Recurso não encontrado." if exc.status_code == 404 else "Não foi possível concluir a requisição."
        return JSONResponse(status_code=exc.status_code, content=error_payload(code, message))

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unexpected_error method=%s route=%s", request.method, request.url.path, exc_info=exc)
        return JSONResponse(
            status_code=500,
            content=error_payload("INTERNAL_ERROR", "Ocorreu um erro interno."),
        )

