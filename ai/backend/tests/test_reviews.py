from fastapi.testclient import TestClient


def test_list_reviews_returns_demo_records(client: TestClient) -> None:
    response = client.get("/api/v1/reviews")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(item["demo"] is True for item in data)


def test_reviews_only_use_supported_statuses(client: TestClient) -> None:
    statuses = {item["status"] for item in client.get("/api/v1/reviews").json()}
    assert statuses == {"pending", "reviewed"}


def test_reviews_do_not_create_permanent_demo_users(client: TestClient) -> None:
    assert all(item["reviewer"] is None for item in client.get("/api/v1/reviews").json())

