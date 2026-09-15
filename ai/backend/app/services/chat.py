from typing import NoReturn

from app.core.errors import AppError
from app.schemas.chat import ChatRequest


class ChatService:
    def request_response(self, _: ChatRequest) -> NoReturn:
        raise AppError(
            status_code=501,
            code="AI_NOT_CONFIGURED",
            message="O modelo da NeuroLab AI ainda não foi configurado.",
        )

