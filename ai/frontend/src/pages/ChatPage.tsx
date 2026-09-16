import { BookOpenText, Bot, CircleAlert, FileStack, Layers3, MessageSquareText, Send, Sparkles, UserRound } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { SourceReference } from '../components/SourceReference'
import { StatusBadge } from '../components/StatusBadge'
import { listAnalyses } from '../services/analyses'
import { ApiClientError, getApiErrorMessage, isRequestCancelled } from '../services/api'
import { sendChatMessage } from '../services/chat'
import { listDocuments } from '../services/documents'
import { getSystemStatus } from '../services/system'
import type { ApiChatContextType } from '../types/api'
import type { ChatResponse, ScientificAnalysisSummary, SystemStatus } from '../types/scientific'

const suggestions = [
  'Quais são as principais limitações dos estudos?',
  'Compare as populações analisadas.',
  'Existem resultados contraditórios?',
  'Quais resultados nulos foram encontrados?',
]

export function ChatPage() {
  const [message, setMessage] = useState('')
  const [lastQuestion, setLastQuestion] = useState('')
  const [contextType, setContextType] = useState<ApiChatContextType>('all_documents')
  const [documentIds, setDocumentIds] = useState<string[]>([])
  const [analyses, setAnalyses] = useState<ScientificAnalysisSummary[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus>()
  const [systemError, setSystemError] = useState('')
  const [chatError, setChatError] = useState('')
  const [response, setResponse] = useState<ChatResponse>()
  const [sending, setSending] = useState(false)
  const submitController = useRef<AbortController>()

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getSystemStatus(controller.signal), listDocuments(controller.signal), listAnalyses(controller.signal)])
      .then(([status, documents, analysisData]) => {
        setSystemStatus(status)
        setDocumentIds(documents.map((document) => document.id))
        setAnalyses(analysisData)
      })
      .catch((requestError: unknown) => {
        if (!isRequestCancelled(requestError)) setSystemError(getApiErrorMessage(requestError, 'Não foi possível consultar o status da assistente.'))
      })
    return () => {
      controller.abort()
      submitController.current?.abort()
    }
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedMessage = message.trim()
    if (!normalizedMessage) return

    submitController.current?.abort()
    const controller = new AbortController()
    submitController.current = controller
    setLastQuestion(normalizedMessage)
    setMessage('')
    setChatError('')
    setResponse(undefined)
    setSending(true)

    try {
      const chatResponse = await sendChatMessage({
        message: normalizedMessage,
        contextType,
        documentIds: contextType === 'selected_documents' ? documentIds.slice(0, 2) : [],
        analysisIds: contextType === 'specific_analysis' && analyses[0] ? [analyses[0].id] : [],
      }, controller.signal)
      setResponse(chatResponse)
    } catch (requestError) {
      if (isRequestCancelled(requestError)) return
      if (requestError instanceof ApiClientError && requestError.code === 'AI_NOT_CONFIGURED') {
        setChatError('A assistente científica ainda não foi configurada. Nenhuma resposta foi gerada.')
      } else {
        setChatError(getApiErrorMessage(requestError, 'Não foi possível consultar a assistente.'))
      }
    } finally {
      if (!controller.signal.aborted) setSending(false)
    }
  }

  const chatUnavailable = systemStatus?.capabilities.chat === false

  return (
    <div className="page-container chat-page">
      <PageHeader eyebrow="ASSISTENTE" title="Chat científico" description="Converse com a assistente sobre documentos, análises e evidências do workspace." />

      <section className="chat-shell" aria-label="Chat científico">
        <header className="chat-context">
          <div className="context-heading"><span className="context-icon"><Layers3 size={17} /></span><div><span className="mono-label">ESCOPO DAS FONTES</span><h2>Contexto da conversa</h2></div></div>
          <div className="context-controls">
            <label className="context-select"><span className="visually-hidden">Selecionar contexto da conversa</span><select value={contextType} onChange={(event) => setContextType(event.target.value as ApiChatContextType)} aria-label="Contexto da conversa"><option value="all_documents">Todos os documentos</option><option value="selected_documents">Documentos selecionados</option><option value="specific_analysis">Análise específica</option></select></label>
            <span className="document-availability"><FileStack size={15} /> Contexto documental disponível em uma próxima etapa</span>
          </div>
        </header>

        <div className="chat-conversation" aria-label="Conversa">
          {(chatUnavailable || systemError) && <div className="chat-capability-notice" role="status"><CircleAlert size={18} /><div><strong>{chatUnavailable ? 'Assistente ainda não configurada' : 'Status do serviço indisponível'}</strong><p>{systemError || 'O backend informa que chat, IA e análise científica permanecem desativados nesta etapa.'}</p></div></div>}

          {!lastQuestion && <div className="chat-empty-example"><span><MessageSquareText size={18} /></span><div><strong>Inicie uma conversa</strong><p>A assistente pode conversar, mas a base científica e os documentos do NeuroLab ainda não estão conectados.</p></div></div>}

          {lastQuestion && <article className="message-block user-message"><div className="message-meta"><span className="message-avatar"><UserRound size={16} /></span><strong>Você</strong></div><p>{lastQuestion}</p></article>}

          {sending && <article className="message-block assistant-message"><div className="message-meta"><span className="message-avatar"><Bot size={16} /></span><strong>Gerando resposta…</strong></div></article>}

          {chatError && <article className="message-block assistant-message insufficient-message"><div className="message-meta"><span className="message-avatar"><Bot size={16} /></span><strong>Assistente científica</strong><StatusBadge status="Indisponível" /></div><div className="insufficient-notice"><p>{chatError}</p></div><small>O backend respondeu de forma segura, sem produzir conteúdo científico fictício.</small></article>}

          {response && <article className="message-block assistant-message"><div className="message-meta"><span className="message-avatar"><Bot size={16} /></span><strong>Assistente científica</strong></div><p>{response.answer}</p>{response.sources.length > 0 && <div className="message-sources"><span className="sources-title"><BookOpenText size={15} /> Fontes utilizadas</span><div className="chat-source-list">{response.sources.map((source) => <SourceReference key={`${source.documentId}-${source.page}`} source={source} compact />)}</div></div>}</article>}
        </div>

        <footer className="chat-composer-area">
          <div className="prompt-suggestions" aria-label="Sugestões de perguntas"><span className="suggestions-label"><Sparkles size={14} /> Sugestões</span><div>{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => setMessage(suggestion)}>{suggestion}</button>)}</div></div>
          <form className="chat-composer" onSubmit={submit}>
            <label className="visually-hidden" htmlFor="chat-message">Mensagem</label>
            <textarea id="chat-message" rows={2} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} placeholder="Pergunte sobre os estudos..." />
            <button className="button primary chat-send" type="submit" disabled={sending || !message.trim()}>Enviar <Send size={16} /></button>
          </form>
          <p className="composer-disclaimer">Gemini Free Tier · sem acesso a documentos, pesquisas ou dados privados do NeuroLab.</p>
        </footer>
      </section>
    </div>
  )
}
