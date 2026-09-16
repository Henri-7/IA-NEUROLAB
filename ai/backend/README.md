# NeuroLab AI — Backend

Backend FastAPI independente da **NeuroLab AI — Assistente Científica**, parte do ecossistema NeuroLab Digital.

O chat usa a Gemini Developer API exclusivamente com um projeto no **Free Tier**. O modelo padrão é o identificador estável/GA `gemini-3.6-flash`; um identificador fixo foi escolhido para evitar a troca automática provocada por aliases como `gemini-flash-latest`.

## Arquitetura do chat

```text
POST /api/v1/chat
  → ChatService
  → AIProvider
  → GeminiProvider
  → Gemini Developer API
```

A rota não conhece a chave nem o SDK do Google. `ChatService` recebe um `AIProvider`, o que permite usar um fake nos testes e trocar o provedor no futuro sem alterar a rota. A integração é assíncrona (`client.aio`), sem streaming, retries automáticos, ferramentas, Search Grounding, histórico persistente ou banco de chat.

Cada chamada é independente. O texto do usuário tem limite de 4.000 caracteres, a saída é limitada a 512 tokens e o nível de raciocínio é `low`, equilibrando qualidade, latência e consumo da cota. A chamada externa tem timeout de 30 segundos. `sources` é sempre `[]`, pois a base científica do NeuroLab não está conectada.

## Free Tier e chave

1. Crie manualmente a chave em [Google AI Studio](https://aistudio.google.com/app/apikey), em um projeto identificado como nível gratuito.
2. Não vincule conta de cobrança e não ative billing.
3. Copie `.env.example` para `.env` e preencha localmente apenas `GEMINI_API_KEY`.

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
```

O aplicativo não cria chaves, projetos ou configuração de faturamento. O Free Tier depende de a chave pertencer a um projeto gratuito no Google AI Studio. A aplicação inicia sem a chave; nesse caso, somente o chat retorna HTTP 503 com `AI_NOT_CONFIGURED`, enquanto `/health` permanece saudável.

O SDK oficial de runtime é `google-genai>=2.23,<3.0`. O SDK legado `google-generativeai` não é usado.

## Instalação e execução

Requer Python 3.11 ou superior. No PowerShell, a partir de `ai/backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8001
```

Endereços locais:

- API: `http://127.0.0.1:8001`
- Health: `http://127.0.0.1:8001/health`
- Status: `http://127.0.0.1:8001/api/v1/system/status`
- Swagger: `http://127.0.0.1:8001/docs`

## Testes

```powershell
pytest
```

Os testes automatizados sempre substituem ou desativam o provider e nunca chamam a Gemini real. Para um teste manual, use somente mensagens comuns ou fictícias, por exemplo:

- `Olá. Quem é você?`
- `Você consegue analisar as pesquisas científicas do NeuroLab?`

A segunda resposta deve informar que a base científica ainda não está conectada.

## Erros do chat

| HTTP | Código | Situação |
|---|---|---|
| 429 | `AI_RATE_LIMITED` | Cota temporária do Free Tier atingida |
| 502 | `AI_RESPONSE_INVALID` | O provider não retornou texto utilizável |
| 503 | `AI_NOT_CONFIGURED` | Chave ausente |
| 503 | `AI_PROVIDER_UNAVAILABLE` | Gemini temporariamente indisponível |
| 504 | `AI_TIMEOUT` | A chamada excedeu 30 segundos |

Mensagens técnicas do Google, prompts, respostas completas e credenciais não são registrados nem enviados ao cliente.

## Privacidade no Free Tier

No Free Tier, os dados enviados podem ser usados pelo Google para melhorar seus produtos. Nesta fase, **não envie**:

- dados pessoais ou sensíveis;
- dados reais de participantes;
- documentos ou datasets privados;
- material confidencial ou arquivos internos;
- credenciais.

Use somente mensagens comuns, conteúdo fictício e dados demonstrativos.

## Limitações atuais

Não estão implementados: acesso à base científica, RAG, embeddings, pesquisa científica, upload, PDF/OCR, datasets, Power BI, Search Grounding, function calling, agentes, memória persistente, autenticação nova, banco de dados, streaming, SSE ou WebSocket. Os demais endpoints demonstrativos existentes permanecem inalterados.
