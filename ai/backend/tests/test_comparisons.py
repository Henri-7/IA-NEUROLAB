from uuid import uuid4

from fastapi.testclient import TestClient

from app.data.demo import ANALYSIS_A_ID, ANALYSIS_B_ID


def post_comparison(client: TestClient, ids: list[str], **extra: object):
    return client.post("/api/v1/comparisons", json={"analysis_ids": ids, **extra})


def test_comparison_accepts_exactly_two_demo_analyses(client: TestClient) -> None:
    response = post_comparison(client, [str(ANALYSIS_A_ID), str(ANALYSIS_B_ID)])
    assert response.status_code == 200
    data = response.json()
    assert data["demo"] is True
    assert len(data["studies"]) == 2
    assert len(data["rows"]) == 9


def test_comparison_has_no_scoring_or_winner(client: TestClient) -> None:
    data = post_comparison(client, [str(ANALYSIS_A_ID), str(ANALYSIS_B_ID)]).json()
    serialized = str(data).lower()
    assert "score" not in serialized
    assert "winner" not in serialized
    assert "confidence" not in serialized


def test_comparison_rejects_one_id(client: TestClient) -> None:
    response = post_comparison(client, [str(ANALYSIS_A_ID)])
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_COMPARISON"


def test_comparison_rejects_zero_ids(client: TestClient) -> None:
    response = post_comparison(client, [])
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_COMPARISON"


def test_comparison_rejects_three_ids(client: TestClient) -> None:
    response = post_comparison(client, [str(ANALYSIS_A_ID), str(ANALYSIS_B_ID), str(uuid4())])
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_COMPARISON"


def test_comparison_rejects_duplicate_ids(client: TestClient) -> None:
    response = post_comparison(client, [str(ANALYSIS_A_ID), str(ANALYSIS_A_ID)])
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_COMPARISON"


def test_comparison_rejects_unknown_id(client: TestClient) -> None:
    response = post_comparison(client, [str(ANALYSIS_A_ID), str(uuid4())])
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "ANALYSIS_NOT_FOUND"


def test_comparison_rejects_invalid_uuid(client: TestClient) -> None:
    response = post_comparison(client, [str(ANALYSIS_A_ID), "invalid"])
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_comparison_rejects_unexpected_fields(client: TestClient) -> None:
    response = post_comparison(client, [str(ANALYSIS_A_ID), str(ANALYSIS_B_ID)], score=True)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
