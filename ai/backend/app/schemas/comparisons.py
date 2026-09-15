from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.common import StrictSchema


class ComparisonFieldKey(StrEnum):
    POPULATION = "population"
    AGE_RANGE = "age_range"
    SAMPLE_SIZE = "sample_size"
    STUDY_DESIGN = "study_design"
    EXPOSURE = "exposure"
    INSTRUMENTS = "instruments"
    RESULTS = "results"
    NULL_RESULTS = "null_results"
    LIMITATIONS = "limitations"


class ComparisonRequest(StrictSchema):
    analysis_ids: list[UUID] = Field(max_length=10)


class ComparisonStudy(StrictSchema):
    analysis_id: UUID
    title: str = Field(min_length=1, max_length=300)


class ComparisonRow(StrictSchema):
    key: ComparisonFieldKey
    label: str = Field(min_length=1, max_length=100)
    left: str = Field(min_length=1, max_length=4_000)
    right: str = Field(min_length=1, max_length=4_000)


class ComparisonResponse(StrictSchema):
    studies: list[ComparisonStudy] = Field(min_length=2, max_length=2)
    rows: list[ComparisonRow] = Field(min_length=1, max_length=20)
    common_points: list[str] = Field(max_length=20)
    differences: list[str] = Field(max_length=20)
    contradictions: list[str] = Field(max_length=20)
    demo: Literal[True] = True
