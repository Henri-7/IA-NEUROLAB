from app.repositories.base import ReviewRepository
from app.schemas.reviews import ReviewItem


class ReviewService:
    def __init__(self, repository: ReviewRepository) -> None:
        self._repository = repository

    def list_reviews(self) -> list[ReviewItem]:
        return self._repository.list_all()

