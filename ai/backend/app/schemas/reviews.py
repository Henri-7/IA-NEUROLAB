from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import AwareDatetime, Field

from app.schemas.common import StrictSchema


class ReviewStatus(StrEnum):
    PENDING = "pending"
    REVIEWED = "reviewed"


class ReviewItem(StrictSchema):
    analysis_id: UUID
    document_id: UUID
    status: ReviewStatus
    reviewed_at: AwareDatetime | None = None
    reviewer: str | None = Field(default=None, min_length=1, max_length=200)
    demo: Literal[True] = True

