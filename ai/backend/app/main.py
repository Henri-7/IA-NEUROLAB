from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.core.config import AppEnvironment, get_settings
from app.core.errors import register_error_handlers
from app.core.logging import RequestLoggingMiddleware, configure_logging


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)
    docs_enabled = settings.app_env in {AppEnvironment.DEVELOPMENT, AppEnvironment.TEST}

    application = FastAPI(
        title=settings.app_name,
        description="Assistente científica do ecossistema NeuroLab Digital.",
        version=settings.app_version,
        docs_url="/docs" if docs_enabled else None,
        redoc_url="/redoc" if docs_enabled else None,
        openapi_url="/openapi.json" if docs_enabled else None,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Accept"],
    )
    application.add_middleware(RequestLoggingMiddleware)
    register_error_handlers(application)
    application.include_router(health_router)
    application.include_router(api_router, prefix=settings.api_prefix)
    return application


app = create_app()

