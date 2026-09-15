from uuid import UUID

from app.core.errors import AppError
from app.repositories.base import ReadRepository
from app.schemas.documents import DocumentSummary


class DocumentService:
    def __init__(self, repository: ReadRepository[DocumentSummary]) -> None:
        self._repository = repository

    def list_documents(self) -> list[DocumentSummary]:
        return self._repository.list_all()

    def get_document(self, document_id: UUID) -> DocumentSummary:
        document = self._repository.get_by_id(document_id)
        if document is None:
            raise AppError(status_code=404, code="DOCUMENT_NOT_FOUND", message="Documento não encontrado.")
        return document

