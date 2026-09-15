from fastapi.testclient import TestClient

from app.main import create_app


def test_unknown_route_uses_standard_error_shape(client: TestClient) -> None:
    response = client.get("/api/v1/unknown")
    assert response.status_code == 404
    assert response.json()["error"] == {"code": "NOT_FOUND", "message": "Recurso não encontrado."}


def test_errors_do_not_expose_stack_traces_or_local_paths(client: TestClient) -> None:
    content = client.get("/api/v1/documents/00000000-0000-4000-8000-000000000000").text.lower()
    assert "traceback" not in content
    assert "c:\\users" not in content
    assert ".py" not in content


def test_internal_errors_are_sanitized() -> None:
    application = create_app()

    @application.get("/__test__/internal-error")
    def raise_internal_error() -> None:
        raise RuntimeError("private technical detail")

    with TestClient(application, raise_server_exceptions=False) as test_client:
        response = test_client.get("/__test__/internal-error")

    assert response.status_code == 500
    assert response.json() == {"error": {"code": "INTERNAL_ERROR", "message": "Ocorreu um erro interno."}}
    assert "private technical detail" not in response.text


def test_cors_allows_local_frontend_without_credentials(client: TestClient) -> None:
    response = client.options(
        "/api/v1/documents",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") is None
