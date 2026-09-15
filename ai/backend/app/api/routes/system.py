from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas.common import Capabilities, SystemStatusResponse

router = APIRouter(prefix="/system", tags=["System"])


@router.get("/status", response_model=SystemStatusResponse, summary="Consultar capacidades atuais")
def system_status(settings: Annotated[Settings, Depends(get_settings)]) -> SystemStatusResponse:
    return SystemStatusResponse(
        service="neurolab-ai",
        version=settings.app_version,
        environment=settings.app_env.value,
        capabilities=Capabilities(),
    )

