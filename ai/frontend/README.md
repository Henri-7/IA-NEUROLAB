# NeuroLab AI — Assistente Científica

Frontend React da NeuroLab AI integrado ao backend FastAPI de demonstração.

## Executar localmente

```bash
npm install
npm run dev
```

O backend deve estar disponível em `http://127.0.0.1:8001`. Para configurar outro endereço, copie `.env.example` para `.env` e altere `VITE_AI_API_BASE_URL`.

Para validar o frontend:

```bash
npm run lint
npm run test:run
npm run build
```

Para visualizar o build de produção:

```bash
npm run preview
```

## Integração

- Documentos, análises, revisões, comparação e estado do sistema são carregados pela API.
- A camada central em `src/services/api.ts` aplica URL-base, timeout, cancelamento, validação de JSON e erros tipados.
- Os contratos de transporte permanecem em `snake_case`; os serviços os convertem para os tipos de interface em `camelCase`.
- O chat consulta o endpoint real, que atualmente responde `501 AI_NOT_CONFIGURED`; a interface informa essa indisponibilidade sem inventar respostas.
- O upload e a ação local de revisão continuam demonstrativos e não persistem.
- Não há modelo de IA, pesquisa externa, RAG, banco de dados ou autenticação nesta fase.
