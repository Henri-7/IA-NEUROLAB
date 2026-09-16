import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

os.environ["APP_ENV"] = "test"

from app.api.dependencies import get_ai_provider, get_chat_service  # noqa: E402
from app.core.config import get_settings  # noqa: E402
from app.main import create_app  # noqa: E402


@pytest.fixture(autouse=True)
def isolate_gemini_from_automated_tests(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv("GEMINI_API_KEY", "")
    get_settings.cache_clear()
    get_chat_service.cache_clear()
    get_ai_provider.cache_clear()
    yield
    get_settings.cache_clear()
    get_chat_service.cache_clear()
    get_ai_provider.cache_clear()


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(create_app(), raise_server_exceptions=False) as test_client:
        yield test_client
