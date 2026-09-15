from uuid import uuid4

from fastapi.testclient import TestClient

from app.data.demo import ANALYSIS_A_ID


def test_list_analyses_returns_demo_summaries(client: TestClient) -> None:
    response = client.get("/api/v1/analyses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert all(item["demo"] is True for item in data)
    assert all("fields" not in item for item in data)


def test_get_analysis_returns_structured_fields(client: TestClient) -> None:
    response = client.get(f"/api/v1/analyses/{ANALYSIS_A_ID}")
    assert response.status_code == 200
    data = response.json()
    keys = {field["key"] for field in data["fields"]}
    assert {"identification", "objective", "study_design", "population", "results", "limitations"} <= keys


def test_analysis_sources_are_traceable_and_demo(client: TestClient) -> None:
    data = client.get(f"/api/v1/analyses/{ANALYSIS_A_ID}").json()
    sources = [source for field in data["fields"] for source in field["sources"]]
    assert sources
    assert all(source["demo"] is True for source in sources)
    assert all(source["source_type"] == "document" for source in sources)


def test_missing_analysis_returns_standard_error(client: TestClient) -> None:
    response = client.get(f"/api/v1/analyses/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "ANALYSIS_NOT_FOUND"


def test_invalid_analysis_uuid_returns_validation_error(client: TestClient) -> None:
    response = client.get("/api/v1/analyses/invalid")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"

