from uuid import uuid4

from fastapi.testclient import TestClient

from app.data.demo import DOCUMENT_A_ID


def test_list_documents_returns_demo_records(client: TestClient) -> None:
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert all(document["demo"] is True for document in data)


def test_get_document_by_id(client: TestClient) -> None:
    response = client.get(f"/api/v1/documents/{DOCUMENT_A_ID}")
    assert response.status_code == 200
    assert response.json()["id"] == str(DOCUMENT_A_ID)
    assert response.json()["status"] == "ready"


def test_document_dates_are_timezone_aware_iso_8601(client: TestClient) -> None:
    document = client.get(f"/api/v1/documents/{DOCUMENT_A_ID}").json()
    assert document["created_at"].endswith("Z") or "+00:00" in document["created_at"]
    assert document["updated_at"].endswith("Z") or "+00:00" in document["updated_at"]


def test_missing_document_returns_standard_error(client: TestClient) -> None:
    response = client.get(f"/api/v1/documents/{uuid4()}")
    assert response.status_code == 404
    assert response.json() == {"error": {"code": "DOCUMENT_NOT_FOUND", "message": "Documento não encontrado."}}


def test_invalid_document_uuid_returns_validation_error(client: TestClient) -> None:
    response = client.get("/api/v1/documents/not-a-uuid")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"

