from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_comparison_service
from app.schemas.common import ErrorResponse
from app.schemas.comparisons import ComparisonRequest, ComparisonResponse
from app.services.comparisons import ComparisonService

router = APIRouter(prefix="/comparisons", tags=["Comparisons"])


@router.post(
    "",
    response_model=ComparisonResponse,
    responses={404: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
    summary="Comparar duas análises demonstrativas",
)
def compare_analyses(
    payload: ComparisonRequest,
    service: Annotated[ComparisonService, Depends(get_comparison_service)],
) -> ComparisonResponse:
    return service.compare(payload)

