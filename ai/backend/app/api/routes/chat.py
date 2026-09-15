from typing import Annotated, NoReturn

from fastapi import APIRouter, Depends

from app.api.dependencies import get_chat_service
from app.schemas.chat import ChatRequest
from app.schemas.common import ErrorResponse
from app.services.chat import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "",
    response_model=None,
    responses={501: {"model": ErrorResponse}},
    summary="Enviar mensagem ao chat (indisponível nesta etapa)",
)
def chat(payload: ChatRequest, service: Annotated[ChatService, Depends(get_chat_service)]) -> NoReturn:
    return service.request_response(payload)
