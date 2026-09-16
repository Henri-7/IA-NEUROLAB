import asyncio
import logging
from time import perf_counter
from typing import Any

import httpx
from google import genai
from google.genai import errors, types

from app.providers.errors import (
    AIProviderInvalidResponseError,
    AIProviderNotConfiguredError,
    AIProviderRateLimitError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
)

logger = logging.getLogger("neurolab_ai.provider")


class GeminiProvider:
    provider_name = "gemini"

    def __init__(
        self,
        *,
        api_key: str | None,
        model: str,
        timeout_seconds: float = 30.0,
        max_output_tokens: int = 512,
        client: Any | None = None,
    ) -> None:
        self.model = model
        self._api_key = api_key.strip() if api_key else None
        self._timeout_seconds = timeout_seconds
        self._max_output_tokens = max_output_tokens
        self._client = client

        if self._api_key and self._client is None:
            self._client = genai.Client(
                api_key=self._api_key,
                http_options=types.HttpOptions(
                    api_version="v1",
                    timeout=int(timeout_seconds * 1_000),
                    retry_options=types.HttpRetryOptions(attempts=1),
                ),
            )

    async def generate(self, message: str, system_instruction: str) -> str:
        if self._client is None:
            raise AIProviderNotConfiguredError

        started_at = perf_counter()
        try:
            async with asyncio.timeout(self._timeout_seconds):
                response = await self._client.aio.models.generate_content(
                    model=self.model,
                    contents=message,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        max_output_tokens=self._max_output_tokens,
                        thinking_config=types.ThinkingConfig(
                            thinking_level=types.ThinkingLevel.LOW,
                        ),
                    ),
                )
        except (TimeoutError, httpx.TimeoutException) as exc:
            self._log_result(started_at, "error", "timeout")
            raise AIProviderTimeoutError from exc
        except errors.APIError as exc:
            if exc.code == 429:
                self._log_result(started_at, "error", "rate_limited")
                raise AIProviderRateLimitError from exc
            if exc.code in {408, 504}:
                self._log_result(started_at, "error", "timeout")
                raise AIProviderTimeoutError from exc
            self._log_result(started_at, "error", f"api_{exc.code}")
            raise AIProviderUnavailableError from exc
        except Exception as exc:
            self._log_result(started_at, "error", type(exc).__name__)
            raise AIProviderUnavailableError from exc

        try:
            text = response.text
        except Exception as exc:
            self._log_result(started_at, "error", "invalid_response")
            raise AIProviderInvalidResponseError from exc

        if not isinstance(text, str) or not text.strip():
            self._log_result(started_at, "error", "invalid_response")
            raise AIProviderInvalidResponseError

        self._log_result(started_at, "success")
        return text.strip()

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aio.aclose()

    def _log_result(self, started_at: float, status: str, error_type: str | None = None) -> None:
        logger.info(
            "ai_provider provider=%s model=%s status=%s duration_ms=%.2f error_type=%s",
            self.provider_name,
            self.model,
            status,
            (perf_counter() - started_at) * 1_000,
            error_type or "none",
        )
