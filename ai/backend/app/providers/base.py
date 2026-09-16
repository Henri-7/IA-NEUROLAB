from typing import Protocol


class AIProvider(Protocol):
    async def generate(self, message: str, system_instruction: str) -> str:
        """Gera uma resposta textual para uma mensagem independente."""
        ...
