from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies import get_analysis_service
from app.schemas.analyses import AnalysisDetail, AnalysisSummary
from app.schemas.common import ErrorResponse
from app.services.analyses import AnalysisService

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.get("", response_model=list[AnalysisSummary], summary="Listar análises demonstrativas")
def list_analyses(service: Annotated[AnalysisService, Depends(get_analysis_service)]) -> list[AnalysisSummary]:
    return service.list_analyses()


@router.get(
    "/{analysis_id}",
    response_model=AnalysisDetail,
    responses={404: {"model": ErrorResponse}},
    summary="Obter análise demonstrativa",
)
def get_analysis(analysis_id: UUID, service: Annotated[AnalysisService, Depends(get_analysis_service)]) -> AnalysisDetail:
    return service.get_analysis(analysis_id)

