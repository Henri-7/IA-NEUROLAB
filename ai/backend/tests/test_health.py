from fastapi.testclient import TestClient


def test_health_returns_200(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200


def test_health_schema_is_minimal(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok", "service": "neurolab-ai"}


def test_health_does_not_depend_on_gemini(client: TestClient, monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "invalid-test-value")
    assert client.get("/health").json() == {"status": "ok", "service": "neurolab-ai"}


def test_openapi_docs_are_available_in_test(client: TestClient) -> None:
    assert client.get("/docs").status_code == 200
    assert client.get("/openapi.json").status_code == 200
