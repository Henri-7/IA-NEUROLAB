from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies import get_document_service
from app.schemas.common import ErrorResponse
from app.schemas.documents import DocumentSummary
from app.services.documents import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("", response_model=list[DocumentSummary], summary="Listar documentos demonstrativos")
def list_documents(service: Annotated[DocumentService, Depends(get_document_service)]) -> list[DocumentSummary]:
    return service.list_documents()


@router.get(
    "/{document_id}",
    response_model=DocumentSummary,
    responses={404: {"model": ErrorResponse}},
    summary="Obter documento demonstrativo",
)
def get_document(document_id: UUID, service: Annotated[DocumentService, Depends(get_document_service)]) -> DocumentSummary:
    return service.get_document(document_id)

