# NeuroLab AI — Backend

Fundação técnica independente da **NeuroLab AI — Assistente Científica**, parte do ecossistema NeuroLab Digital.

Esta etapa oferece contratos HTTP, validação, dados demonstrativos e pontos de extensão. Ela não executa inteligência artificial, não processa documentos e não produz conteúdo científico.

## Escopo atual

- FastAPI com prefixo `/api/v1` e health check independente.
- Schemas Pydantic v2 estritos e tipados.
- Erros estruturados sem stack traces ou detalhes internos.
- CORS explícito para o frontend local.
- Logging de método, rota, status e duração, sem corpo das requisições.
- Services conectados a repositories em memória.
- Documentos, análises, revisões e comparações exclusivamente demonstrativos, sempre com `demo: true`.
- Chat explicitamente indisponível com HTTP `501 AI_NOT_CONFIGURED`.

## Arquitetura

```text
app/
├── api/             # Rotas e dependências HTTP
├── core/            # Configuração, erros e logging
├── data/            # Dados neutros de demonstração
├── repositories/    # Contratos e implementação em memória
├── schemas/         # Contratos públicos Pydantic
├── services/        # Regras de aplicação
└── main.py          # Criação da aplicação FastAPI
tests/               # Testes automatizados da API
```

O fluxo das funcionalidades com dados é:

```text
Route → Service → Repository → Demo data
```

Essa separação permite trocar os repositories em memória no futuro sem reconstruir as rotas. Nenhum repository de banco foi implementado nesta etapa.

## Requisitos

- Python 3.11 ou superior.

## Instalação no Windows

No PowerShell, a partir de `ai/backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
```

Copie `.env.example` para `.env` somente se quiser alterar os valores locais. Nenhuma chave secreta é necessária.

## Execução

```powershell
uvicorn app.main:app --reload --port 8001
```

Endereços locais:

- API: `http://127.0.0.1:8001`
- Health check: `http://127.0.0.1:8001/health`
- Swagger: `http://127.0.0.1:8001/docs`
- OpenAPI: `http://127.0.0.1:8001/openapi.json`

## Testes

```powershell
pytest
```

## Endpoints

| Método | Endpoint | Estado atual |
|---|---|---|
| `GET` | `/health` | Disponível |
| `GET` | `/api/v1/system/status` | Disponível |
| `GET` | `/api/v1/documents` | Dados demo |
| `GET` | `/api/v1/documents/{document_id}` | Dados demo |
| `GET` | `/api/v1/analyses` | Dados demo |
| `GET` | `/api/v1/analyses/{analysis_id}` | Dados demo |
| `GET` | `/api/v1/reviews` | Dados demo |
| `POST` | `/api/v1/comparisons` | Comparação de dados demo |
| `POST` | `/api/v1/chat` | Indisponível; retorna HTTP 501 |

## Configuração

As configurações são lidas por `pydantic-settings`:

- `APP_NAME`
- `APP_ENV` (`development` ou `test`)
- `APP_VERSION`
- `LOG_LEVEL`
- `API_PREFIX`
- `CORS_ORIGINS` (lista separada por vírgulas)

## Limitações intencionais

Não foram implementados: IA, provedores de modelos, RAG, embeddings, pesquisa científica, busca de artigos, upload ou leitura de arquivos, banco de dados, ORM, migrations, autenticação, persistência, filas, streaming, WebSockets ou integrações externas.

Os textos em `app/data/demo.py` são neutros, fictícios e destinados apenas a testes de contrato e interface. Eles não representam literatura, evidência ou conclusão científica.

