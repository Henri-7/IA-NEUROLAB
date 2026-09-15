from fastapi import APIRouter

from app.api.routes import analyses, chat, comparisons, documents, reviews, system

api_router = APIRouter()
api_router.include_router(system.router)
api_router.include_router(documents.router)
api_router.include_router(analyses.router)
api_router.include_router(comparisons.router)
api_router.include_router(reviews.router)
api_router.include_router(chat.router)

