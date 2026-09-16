from datetime import UTC, datetime
from uuid import uuid4

from app.core.errors import AppError
from app.providers.base import AIProvider
from app.providers.errors import (
    AIProviderInvalidResponseError,
    AIProviderNotConfiguredError,
    AIProviderRateLimitError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
)
from app.schemas.chat import ChatRequest, ChatResponse

SYSTEM_INSTRUCTION = """Você é a NeuroLab AI, assistente do ecossistema NeuroLab Digital.

Nesta versão inicial, converse de forma clara, objetiva e educativa.

A base científica do NeuroLab ainda não está conectada. Não invente artigos, referências, resultados ou fontes, nem afirme ter consultado documentos não fornecidos.

Não realize diagnósticos clínicos. Não afirme medir, estimar ou inferir níveis individuais de dopamina. Não crie risco dopaminérgico, scores científicos ou conclusões biológicas individuais.

Se uma pergunta depender das pesquisas, documentos ou datasets do NeuroLab, informe claramente que essa base ainda não está conectada nesta versão."""


class ChatService:
    def __init__(self, provider: AIProvider) -> None:
        self._provider = provider

    async def request_response(self, request: ChatRequest) -> ChatResponse:
        try:
            answer = await self._provider.generate(request.message, SYSTEM_INSTRUCTION)
        except AIProviderNotConfiguredError as exc:
            raise AppError(
                status_code=503,
                code="AI_NOT_CONFIGURED",
                message="A assistente ainda não está configurada.",
            ) from exc
        except AIProviderRateLimitError as exc:
            raise AppError(
                status_code=429,
                code="AI_RATE_LIMITED",
                message="O limite temporário da assistente foi atingido. Tente novamente em alguns instantes.",
            ) from exc
        except AIProviderTimeoutError as exc:
            raise AppError(
                status_code=504,
                code="AI_TIMEOUT",
                message="A assistente demorou mais do que o esperado para responder. Tente novamente.",
            ) from exc
        except AIProviderUnavailableError as exc:
            raise AppError(
                status_code=503,
                code="AI_PROVIDER_UNAVAILABLE",
                message="A assistente está temporariamente indisponível.",
            ) from exc
        except AIProviderInvalidResponseError as exc:
            raise AppError(
                status_code=502,
                code="AI_RESPONSE_INVALID",
                message="A assistente retornou uma resposta inválida. Tente novamente.",
            ) from exc

        return ChatResponse(
            id=uuid4(),
            answer=answer,
            sources=[],
            insufficient_information=False,
            created_at=datetime.now(UTC),
        )
