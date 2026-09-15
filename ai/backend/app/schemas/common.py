from pydantic import BaseModel, ConfigDict


class StrictSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ErrorDetail(StrictSchema):
    code: str
    message: str


class ErrorResponse(StrictSchema):
    error: ErrorDetail


class HealthResponse(StrictSchema):
    status: str
    service: str


class Capabilities(StrictSchema):
    chat: bool = False
    document_processing: bool = False
    scientific_analysis: bool = False
    research: bool = False
    rag: bool = False
    ai_provider: bool = False


class SystemStatusResponse(StrictSchema):
    service: str
    version: str
    environment: str
    capabilities: Capabilities

