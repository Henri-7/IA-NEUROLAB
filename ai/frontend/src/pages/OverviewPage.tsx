import { ArrowRight, Check, FileCheck2, FileSearch, FileStack, FileText, FlaskConical, UploadCloud } from 'lucide-react'
import { type DragEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnalysisCard } from '../components/AnalysisCard'
import { EmptyState, ErrorState, LoadingState } from '../components/FeedbackState'
import { PageHeader } from '../components/PageHeader'
import { listAnalyses } from '../services/analyses'
import { getApiErrorMessage, isRequestCancelled } from '../services/api'
import { listDocuments } from '../services/documents'
import type { DocumentSummary, ScientificAnalysisSummary } from '../types/scientific'

type UploadState = 'idle' | 'selected' | 'uploading' | 'sent'

export function OverviewPage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [analyses, setAnalyses] = useState<ScientificAnalysisSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const load = async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const [documentData, analysisData] = await Promise.all([listDocuments(signal), listAnalyses(signal)])
      setDocuments(documentData)
      setAnalyses(analysisData)
    } catch (requestError) {
      if (!isRequestCancelled(requestError)) setError(getApiErrorMessage(requestError, 'Não foi possível atualizar a visão geral.'))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [])

  const simulateSelection = (file?: File) => {
    if (!file) return
    setFileName(file.name)
    setUploadState('selected')
    window.setTimeout(() => setUploadState('uploading'), 600)
    window.setTimeout(() => setUploadState('sent'), 1500)
  }

  const resetUpload = () => {
    setUploadState('idle')
    setFileName('')
    if (fileInput.current) fileInput.current.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    simulateSelection(event.dataTransfer.files[0])
  }

  const waitingCount = analyses.filter((analysis) => analysis.status === 'Aguardando revisão').length

  return (
    <div className="page-container">
      <PageHeader eyebrow="NEUROLAB AI" title="Assistente científica" description="Analise e organize evidências científicas de forma rastreável." />

      <section className="overview-flow" aria-label="Início da análise">
        <div className="upload-card primary-action-card surface-card">
          <div className="section-heading">
            <div><span className="section-kicker">COMECE POR AQUI</span><h2>Analisar novo documento</h2></div>
            <span className="demo-chip">Demonstração</span>
          </div>
          <div
            className={`drop-zone ${uploadState !== 'idle' ? 'has-file' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            aria-live="polite"
          >
            <input ref={fileInput} className="visually-hidden" type="file" accept=".pdf,.doc,.docx" onChange={(event) => simulateSelection(event.target.files?.[0])} />
            {uploadState === 'idle' && <><span className="upload-icon"><UploadCloud size={24} /></span><h3>Arraste seu documento para cá</h3><p>ou selecione um arquivo no seu dispositivo</p><button className="button primary" type="button" onClick={() => fileInput.current?.click()}>Selecionar documento</button><small>PDF ou DOCX · até 25 MB (demonstrativo)</small></>}
            {uploadState === 'selected' && <><span className="upload-icon"><FileText size={24} /></span><span className="upload-state-label"><Check size={13} /> Documento selecionado</span><h3>Arquivo preparado</h3><p className="file-name">{fileName}</p><small>Iniciando simulação de envio…</small></>}
            {uploadState === 'uploading' && <><span className="upload-icon"><UploadCloud size={24} /></span><span className="upload-state-label"><FileCheck2 size={13} /> Enviando documento</span><h3>Preparando análise…</h3><p className="file-name">{fileName}</p><span className="progress-track"><span /></span><small>Simulação local — o arquivo não é enviado</small></>}
            {uploadState === 'sent' && <><span className="upload-icon success"><Check size={24} /></span><span className="upload-state-label success"><Check size={13} /> Documento enviado</span><h3>Análise concluída</h3><p className="file-name">{fileName}</p><div className="upload-actions"><Link className="button primary" to={analyses[0] ? `/analises/${analyses[0].id}` : '/analises'}>Ver análise demonstrativa <ArrowRight size={16} /></Link><button className="button ghost" type="button" onClick={resetUpload}>Trocar arquivo</button></div><small>Fluxo simulado · nenhum conteúdo foi processado</small></>}
          </div>
        </div>

        <div className="dashboard-summary">
          <div className="section-heading compact"><div><span className="section-kicker">RESUMO</span><h2>Visão do workspace</h2></div></div>
          <div className="metrics-grid">
            <article className="metric-card"><span className="metric-icon blue"><FileStack size={18} /></span><div><span>Documentos</span><strong>{loading ? '—' : documents.length}</strong><small>No workspace</small></div></article>
            <article className="metric-card"><span className="metric-icon lavender"><FlaskConical size={18} /></span><div><span>Análises</span><strong>{loading ? '—' : analyses.length}</strong><small>Total gerado</small></div></article>
            <article className="metric-card"><span className="metric-icon amber"><FileSearch size={18} /></span><div><span>Aguardando revisão</span><strong>{loading ? '—' : waitingCount}</strong><small>Requer atenção</small></div></article>
          </div>
        </div>
      </section>

      <section className="content-section" aria-labelledby="recent-title">
        <div className="section-heading inline">
          <div><span className="section-kicker">ATIVIDADE</span><h2 id="recent-title">Análises recentes</h2></div>
          <Link className="text-link" to="/analises">Ver todas <ArrowRight size={16} /></Link>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState onRetry={() => void load()} title="Erro ao carregar dados da API" description={error} /> : analyses.length === 0 ? <EmptyState title="Nenhuma análise recente" description="As análises concluídas aparecerão aqui." /> : <div className="cards-grid">{analyses.slice(0, 3).map((analysis) => <AnalysisCard key={analysis.id} analysis={analysis} />)}</div>}
      </section>
    </div>
  )
}
