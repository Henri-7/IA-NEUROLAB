import asyncio
from types import SimpleNamespace
from typing import Any

import httpx
import pytest
from google.genai import errors

from app.providers.errors import (
    AIProviderInvalidResponseError,
    AIProviderNotConfiguredError,
    AIProviderRateLimitError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
)
from app.providers.gemini import GeminiProvider


class FakeModels:
    def __init__(self, result: Any = None, error: Exception | None = None, delay: float = 0) -> None:
        self.result = result
        self.error = error
        self.delay = delay
        self.kwargs: dict[str, Any] | None = None

    async def generate_content(self, **kwargs: Any) -> Any:
        self.kwargs = kwargs
        if self.delay:
            await asyncio.sleep(self.delay)
        if self.error:
            raise self.error
        return self.result


class FakeClient:
    def __init__(self, models: FakeModels) -> None:
        self.aio = SimpleNamespace(models=models)


def run(provider: GeminiProvider) -> str:
    return asyncio.run(provider.generate("Olá", "Instrução segura"))


def test_provider_uses_async_sdk_with_bounded_output() -> None:
    models = FakeModels(result=SimpleNamespace(text="  Resposta válida.  "))
    provider = GeminiProvider(api_key="test-key", model="gemini-3.6-flash", client=FakeClient(models))

    assert run(provider) == "Resposta válida."
    assert models.kwargs is not None
    assert models.kwargs["model"] == "gemini-3.6-flash"
    assert models.kwargs["contents"] == "Olá"
    assert models.kwargs["config"].system_instruction == "Instrução segura"
    assert models.kwargs["config"].max_output_tokens == 512
    assert models.kwargs["config"].thinking_config.thinking_level.value == "LOW"
    assert models.kwargs["config"].tools is None


def test_provider_rejects_missing_key_without_calling_sdk() -> None:
    provider = GeminiProvider(api_key=None, model="gemini-3.6-flash")
    with pytest.raises(AIProviderNotConfiguredError):
        run(provider)


def test_provider_maps_resource_exhausted() -> None:
    error = errors.ClientError(429, {"error": {"code": 429, "message": "quota", "status": "RESOURCE_EXHAUSTED"}})
    provider = GeminiProvider(
        api_key="test-key",
        model="gemini-3.6-flash",
        client=FakeClient(FakeModels(error=error)),
    )
    with pytest.raises(AIProviderRateLimitError):
        run(provider)


def test_provider_maps_timeout() -> None:
    provider = GeminiProvider(
        api_key="test-key",
        model="gemini-3.6-flash",
        timeout_seconds=0.001,
        client=FakeClient(FakeModels(delay=0.02, result=SimpleNamespace(text="tarde"))),
    )
    with pytest.raises(AIProviderTimeoutError):
        run(provider)


def test_provider_maps_sdk_http_timeout() -> None:
    provider = GeminiProvider(
        api_key="test-key",
        model="gemini-3.6-flash",
        client=FakeClient(FakeModels(error=httpx.ReadTimeout("timeout"))),
    )
    with pytest.raises(AIProviderTimeoutError):
        run(provider)


def test_provider_maps_unavailable_api() -> None:
    error = errors.ServerError(503, {"error": {"code": 503, "message": "unavailable"}})
    provider = GeminiProvider(
        api_key="test-key",
        model="gemini-3.6-flash",
        client=FakeClient(FakeModels(error=error)),
    )
    with pytest.raises(AIProviderUnavailableError):
        run(provider)


@pytest.mark.parametrize("text", [None, "", "   "])
def test_provider_rejects_invalid_text_response(text: str | None) -> None:
    provider = GeminiProvider(
        api_key="test-key",
        model="gemini-3.6-flash",
        client=FakeClient(FakeModels(result=SimpleNamespace(text=text))),
    )
    with pytest.raises(AIProviderInvalidResponseError):
        run(provider)
