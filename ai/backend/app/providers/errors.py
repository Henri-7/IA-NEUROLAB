class AIProviderError(Exception):
    """Erro interno e sanitizado de um provedor de IA."""


class AIProviderNotConfiguredError(AIProviderError):
    pass


class AIProviderRateLimitError(AIProviderError):
    pass


class AIProviderTimeoutError(AIProviderError):
    pass


class AIProviderUnavailableError(AIProviderError):
    pass


class AIProviderInvalidResponseError(AIProviderError):
    pass
