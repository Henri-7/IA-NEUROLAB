from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import AwareDatetime, Field, PositiveInt

from app.schemas.common import StrictSchema


class AnalysisStatus(StrEnum):
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    REVIEWED = "reviewed"


class EvidenceStatus(StrEnum):
    FOUND = "found"
    MISSING = "missing"
    AMBIGUOUS = "ambiguous"
    UNVERIFIABLE = "unverifiable"


class SourceType(StrEnum):
    DOCUMENT = "document"


class ScientificFieldKey(StrEnum):
    IDENTIFICATION = "identification"
    OBJECTIVE = "objective"
    STUDY_DESIGN = "study_design"
    POPULATION = "population"
    AGE_RANGE = "age_range"
    SAMPLE_SIZE = "sample_size"
    EXPOSURE = "exposure"
    MEASURES = "measures"
    RESULTS = "results"
    NULL_RESULTS = "null_results"
    LIMITATIONS = "limitations"
    OBSERVATIONS = "observations"


class SourceReference(StrictSchema):
    document_id: UUID
    document_title: str = Field(min_length=1, max_length=300)
    page: PositiveInt | None = None
    section: str | None = Field(default=None, min_length=1, max_length=200)
    excerpt: str = Field(min_length=1, max_length=2_000)
    source_type: SourceType = SourceType.DOCUMENT
    demo: Literal[True] = True


class ScientificField(StrictSchema):
    key: ScientificFieldKey
    label: str = Field(min_length=1, max_length=100)
    value: str = Field(min_length=1, max_length=4_000)
    evidence_status: EvidenceStatus
    sources: list[SourceReference] = Field(default_factory=list, max_length=10)


class AnalysisSummary(StrictSchema):
    id: UUID
    document_id: UUID
    document_title: str = Field(min_length=1, max_length=300)
    title: str = Field(min_length=1, max_length=300)
    year: int | None = Field(default=None, ge=1900, le=2200)
    document_version: str = Field(pattern=r"^v\d+\.\d+$")
    status: AnalysisStatus
    created_at: AwareDatetime
    updated_at: AwareDatetime
    demo: Literal[True] = True


class AnalysisDetail(AnalysisSummary):
    authors: list[str] = Field(default_factory=list, max_length=100)
    identifier: str | None = Field(default=None, max_length=300)
    fields: list[ScientificField] = Field(max_length=50)

