from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_review_service
from app.schemas.reviews import ReviewItem
from app.services.reviews import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=list[ReviewItem], summary="Listar revisões demonstrativas")
def list_reviews(service: Annotated[ReviewService, Depends(get_review_service)]) -> list[ReviewItem]:
    return service.list_reviews()

