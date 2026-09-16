from fastapi.testclient import TestClient

from app.core.config import get_settings


def test_system_status_returns_service_metadata(client: TestClient) -> None:
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "neurolab-ai"
    assert data["version"] == "0.1.0"
    assert data["environment"] == "test"
    assert data["provider"] == "gemini"
    assert data["model"] == "gemini-3.6-flash"


def test_system_status_without_key_disables_ai_capabilities(client: TestClient) -> None:
    capabilities = client.get("/api/v1/system/status").json()["capabilities"]
    assert capabilities["chat"] is False
    assert capabilities["ai_provider"] is False
    assert capabilities["document_processing"] is False
    assert capabilities["scientific_analysis"] is False
    assert capabilities["research"] is False
    assert capabilities["rag"] is False


def test_system_status_with_key_enables_only_chat_and_provider(client: TestClient, monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-only-not-a-real-key")
    get_settings.cache_clear()

    data = client.get("/api/v1/system/status").json()
    assert data["capabilities"] == {
        "chat": True,
        "document_processing": False,
        "scientific_analysis": False,
        "research": False,
        "rag": False,
        "ai_provider": True,
    }
    assert "test-only-not-a-real-key" not in str(data)


def test_system_status_does_not_expose_sensitive_configuration(client: TestClient) -> None:
    content = client.get("/api/v1/system/status").text.lower()
    assert "token" not in content
    assert "secret" not in content
    assert "c:\\" not in content
