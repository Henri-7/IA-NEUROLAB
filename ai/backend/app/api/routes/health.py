from fastapi import APIRouter

from app.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["System"], summary="Verificar disponibilidade")
def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="neurolab-ai")

