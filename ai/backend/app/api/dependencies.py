from functools import lru_cache

from app.repositories.memory import (
    MemoryAnalysisRepository,
    MemoryDocumentRepository,
    MemoryReviewRepository,
)
from app.services.analyses import AnalysisService
from app.services.chat import ChatService
from app.services.comparisons import ComparisonService
from app.services.documents import DocumentService
from app.services.reviews import ReviewService


@lru_cache
def get_document_service() -> DocumentService:
    return DocumentService(MemoryDocumentRepository())


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService(MemoryAnalysisRepository())


@lru_cache
def get_comparison_service() -> ComparisonService:
    return ComparisonService(MemoryAnalysisRepository())


@lru_cache
def get_review_service() -> ReviewService:
    return ReviewService(MemoryReviewRepository())


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService()

