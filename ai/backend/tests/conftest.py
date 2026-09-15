import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

os.environ["APP_ENV"] = "test"

from app.core.config import get_settings  # noqa: E402
from app.main import create_app  # noqa: E402


@pytest.fixture
def client() -> Iterator[TestClient]:
    get_settings.cache_clear()
    with TestClient(create_app(), raise_server_exceptions=False) as test_client:
        yield test_client

