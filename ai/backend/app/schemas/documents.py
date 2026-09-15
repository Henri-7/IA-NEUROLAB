from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import AwareDatetime, Field

from app.schemas.common import StrictSchema


class DocumentStatus(StrEnum):
    READY = "ready"
    PROCESSING = "processing"
    ERROR = "error"


class FileType(StrEnum):
    PDF = "pdf"
    DOCX = "docx"


class DocumentSummary(StrictSchema):
    id: UUID
    title: str = Field(min_length=1, max_length=300)
    filename: str = Field(min_length=1, max_length=255)
    file_type: FileType
    version: str = Field(pattern=r"^v\d+\.\d+$")
    status: DocumentStatus
    created_at: AwareDatetime
    updated_at: AwareDatetime
    demo: Literal[True] = True

