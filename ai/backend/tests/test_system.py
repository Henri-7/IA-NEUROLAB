from fastapi.testclient import TestClient


def test_system_status_returns_service_metadata(client: TestClient) -> None:
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "neurolab-ai"
    assert data["version"] == "0.1.0"
    assert data["environment"] == "test"


def test_all_system_capabilities_are_disabled(client: TestClient) -> None:
    capabilities = client.get("/api/v1/system/status").json()["capabilities"]
    assert capabilities
    assert all(value is False for value in capabilities.values())


def test_system_status_does_not_expose_sensitive_configuration(client: TestClient) -> None:
    content = client.get("/api/v1/system/status").text.lower()
    assert "token" not in content
    assert "secret" not in content
    assert "c:\\" not in content

