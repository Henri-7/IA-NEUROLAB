from fastapi.testclient import TestClient


def valid_payload() -> dict[str, object]:
    return {"message": "Mensagem de teste do contrato.", "context_type": "all_documents"}


def test_chat_returns_501(client: TestClient) -> None:
    assert client.post("/api/v1/chat", json=valid_payload()).status_code == 501


def test_chat_returns_ai_not_configured(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json=valid_payload())
    assert response.json() == {
        "error": {
            "code": "AI_NOT_CONFIGURED",
            "message": "O modelo da NeuroLab AI ainda não foi configurado.",
        }
    }


def test_chat_does_not_return_fake_scientific_answer(client: TestClient) -> None:
    data = client.post("/api/v1/chat", json=valid_payload()).json()
    assert "answer" not in data
    assert "sources" not in data


def test_chat_rejects_blank_message(client: TestClient) -> None:
    payload = {**valid_payload(), "message": "   "}
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_chat_rejects_oversized_message(client: TestClient) -> None:
    payload = {**valid_payload(), "message": "x" * 4_001}
    assert client.post("/api/v1/chat", json=payload).status_code == 422


def test_chat_rejects_unexpected_fields(client: TestClient) -> None:
    response = client.post("/api/v1/chat", json={**valid_payload(), "provider": "external"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


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

