from fastapi.testclient import TestClient

from app.api.dependencies import get_chat_service
from app.providers.errors import (
    AIProviderInvalidResponseError,
    AIProviderNotConfiguredError,
    AIProviderRateLimitError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
)
from app.services.chat import ChatService


class FakeAIProvider:
    def __init__(self, *, answer: str = "Resposta controlada.", error: Exception | None = None) -> None:
        self.answer = answer
        self.error = error
        self.calls: list[tuple[str, str]] = []

    async def generate(self, message: str, system_instruction: str) -> str:
        self.calls.append((message, system_instruction))
        if self.error:
            raise self.error
        return self.answer


def valid_payload() -> dict[str, object]:
    return {"message": "Mensagem de teste do contrato.", "context_type": "all_documents"}


def test_chat_returns_provider_answer(client: TestClient) -> None:
    provider = FakeAIProvider(answer="Olá da fake.")
    client.app.dependency_overrides[get_chat_service] = lambda: ChatService(provider)
    try:
        response = client.post("/api/v1/chat", json=valid_payload())
    finally:
        client.app.dependency_overrides.pop(get_chat_service, None)

    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == "Olá da fake."
    assert data["sources"] == []
    assert data["insufficient_information"] is False
    assert data["id"]
    assert data["created_at"]
    assert provider.calls[0][0] == valid_payload()["message"]
    assert "base científica do NeuroLab ainda não está conectada" in provider.calls[0][1]


def test_chat_returns_ai_not_configured_without_key(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json=valid_payload())
    assert response.status_code == 503
    assert response.json() == {
        "error": {
            "code": "AI_NOT_CONFIGURED",
            "message": "A assistente ainda não está configurada.",
        }
    }


def test_chat_maps_provider_errors(client: TestClient) -> None:
    cases = [
        (AIProviderRateLimitError(), 429, "AI_RATE_LIMITED"),
        (AIProviderTimeoutError(), 504, "AI_TIMEOUT"),
        (AIProviderUnavailableError(), 503, "AI_PROVIDER_UNAVAILABLE"),
        (AIProviderInvalidResponseError(), 502, "AI_RESPONSE_INVALID"),
        (AIProviderNotConfiguredError(), 503, "AI_NOT_CONFIGURED"),
    ]

    try:
        for error, status, code in cases:
            provider = FakeAIProvider(error=error)
            client.app.dependency_overrides[get_chat_service] = lambda provider=provider: ChatService(provider)
            response = client.post("/api/v1/chat", json=valid_payload())
            assert response.status_code == status
            assert response.json()["error"]["code"] == code
    finally:
        client.app.dependency_overrides.pop(get_chat_service, None)


def test_chat_rejects_empty_message(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json={**valid_payload(), "message": ""})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_chat_rejects_blank_message(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json={**valid_payload(), "message": "   "})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_chat_rejects_oversized_message(client: TestClient) -> None:
    payload = {**valid_payload(), "message": "x" * 4_001}
    assert client.post("/api/v1/chat", json=payload).status_code == 422


def test_chat_rejects_invalid_payload(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json={"message": 123, "context_type": "unknown"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_chat_rejects_unexpected_fields(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json={**valid_payload(), "provider": "external"})
    assert response.status_code == 422


def test_selected_documents_context_requires_ids(client: TestClient) -> None:
    response = client.post(
        "/api/v1/chat",
        json={"message": "Teste.", "context_type": "selected_documents", "document_ids": []},
    )
    assert response.status_code == 422


def test_specific_analysis_context_requires_one_id(client: TestClient) -> None:
    response = client.post(
        "/api/v1/chat",
        json={"message": "Teste.", "context_type": "specific_analysis", "analysis_ids": []},
    )
    assert response.status_code == 422
