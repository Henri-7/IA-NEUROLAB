from uuid import UUID

from app.data.demo import DEMO_ANALYSES, DEMO_DOCUMENTS, DEMO_REVIEWS
from app.schemas.analyses import AnalysisDetail
from app.schemas.documents import DocumentSummary
from app.schemas.reviews import ReviewItem


class MemoryDocumentRepository:
    def list_all(self) -> list[DocumentSummary]:
        return [item.model_copy(deep=True) for item in DEMO_DOCUMENTS]

    def get_by_id(self, item_id: UUID) -> DocumentSummary | None:
        item = next((document for document in DEMO_DOCUMENTS if document.id == item_id), None)
        return item.model_copy(deep=True) if item else None


class MemoryAnalysisRepository:
    def list_all(self) -> list[AnalysisDetail]:
        return [item.model_copy(deep=True) for item in DEMO_ANALYSES]

    def get_by_id(self, item_id: UUID) -> AnalysisDetail | None:
        item = next((analysis for analysis in DEMO_ANALYSES if analysis.id == item_id), None)
        return item.model_copy(deep=True) if item else None


class MemoryReviewRepository:
    def list_all(self) -> list[ReviewItem]:
        return [item.model_copy(deep=True) for item in DEMO_REVIEWS]

