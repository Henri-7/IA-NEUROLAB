from enum import StrEnum
from uuid import UUID

from pydantic import AwareDatetime, Field, field_validator, model_validator

from app.schemas.analyses import SourceReference
from app.schemas.common import StrictSchema


class ChatContextType(StrEnum):
    ALL_DOCUMENTS = "all_documents"
    SELECTED_DOCUMENTS = "selected_documents"
    SPECIFIC_ANALYSIS = "specific_analysis"


class ChatRequest(StrictSchema):
    message: str = Field(min_length=1, max_length=4_000)
    context_type: ChatContextType
    document_ids: list[UUID] = Field(default_factory=list, max_length=50)
    analysis_ids: list[UUID] = Field(default_factory=list, max_length=50)

    @field_validator("message")
    @classmethod
    def reject_blank_message(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("A mensagem não pode conter apenas espaços.")
        return value

    @model_validator(mode="after")
    def validate_context_references(self) -> "ChatRequest":
        if self.context_type is ChatContextType.SELECTED_DOCUMENTS and not self.document_ids:
            raise ValueError("selected_documents requer ao menos um document_id.")
        if self.context_type is ChatContextType.SPECIFIC_ANALYSIS and len(self.analysis_ids) != 1:
            raise ValueError("specific_analysis requer exatamente um analysis_id.")
        return self


class ChatResponse(StrictSchema):
    id: UUID
    answer: str = Field(min_length=1, max_length=20_000)
    sources: list[SourceReference] = Field(default_factory=list, max_length=50)
    insufficient_information: bool
    created_at: AwareDatetime
