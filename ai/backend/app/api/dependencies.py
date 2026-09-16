from functools import lru_cache

from app.core.config import get_settings
from app.providers.gemini import GeminiProvider
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
def get_ai_provider() -> GeminiProvider:
    settings = get_settings()
    api_key = (
        settings.gemini_api_key.get_secret_value()
        if settings.gemini_configured and settings.gemini_api_key
        else None
    )
    return GeminiProvider(api_key=api_key, model=settings.gemini_model)


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService(get_ai_provider())


async def close_ai_provider() -> None:
    if get_ai_provider.cache_info().currsize:
        await get_ai_provider().close()
    get_chat_service.cache_clear()
    get_ai_provider.cache_clear()
