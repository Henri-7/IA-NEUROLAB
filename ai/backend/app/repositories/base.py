from typing import Protocol, TypeVar
from uuid import UUID

from app.schemas.reviews import ReviewItem

T_co = TypeVar("T_co", covariant=True)


class ReadRepository(Protocol[T_co]):
    def list_all(self) -> list[T_co]: ...

    def get_by_id(self, item_id: UUID) -> T_co | None: ...


class ReviewRepository(Protocol):
    def list_all(self) -> list[ReviewItem]: ...

