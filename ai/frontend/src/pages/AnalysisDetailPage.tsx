import { BookOpenCheck, Check, CircleAlert, FileText, Library, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { EvidenceField } from '../components/EvidenceField'
import { EmptyState, ErrorState, LoadingState } from '../components/FeedbackState'
import { SectionNavigation } from '../components/SectionNavigation'
import { SourceReference } from '../components/SourceReference'
import { StatusBadge } from '../components/StatusBadge'
import { getAnalysis } from '../services/analyses'
import { ApiClientError, getApiErrorMessage, isRequestCancelled } from '../services/api'
import type { ScientificAnalysis } from '../types/scientific'

export function AnalysisDetailPage() {
  const { id = '' } = useParams()
  const [analysis, setAnalysis] = useState<ScientificAnalysis>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(''); setNotFound(false)
    try {
      setAnalysis(await getAnalysis(id, signal))
    } catch (requestError) {
      if (isRequestCancelled(requestError)) return
      if (requestError instanceof ApiClientError && requestError.code === 'ANALYSIS_NOT_FOUND') setNotFound(true)
      else setError(getApiErrorMessage(requestError, 'Não foi possível carregar a ficha científica.'))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [id])
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const review = () => {
    setSaving(true)
    window.setTimeout(() => {
      setAnalysis((current) => current ? { ...current, status: 'Revisado' } : current)
      setSaving(false)
    }, 250)
  }

  if (loading) return <div className="page-container"><LoadingState label="Carregando ficha científica…" /></div>
  if (error) return <div className="page-container"><ErrorState onRetry={() => void load()} title="Não foi possível carregar a análise" description={error} /></div>
  if (notFound || !analysis) return <div className="page-container"><EmptyState title="Análise não encontrada" description="Esta ficha não existe no backend demonstrativo." /></div>

  return (
    <div className="page-container detail-page">
      <Breadcrumbs items={[{ label: 'Análises', to: '/analises' }, { label: analysis.title }]} />
      <header className="detail-header">
        <div className="detail-title-row">
          <div><span className="eyebrow">FICHA CIENTÍFICA · DADOS DEMO DA API</span><h1>{analysis.title}</h1><p>{analysis.authors.join(' · ')}</p></div>
          <StatusBadge status={analysis.status} />
        </div>
        <dl className="metadata-grid">
          <div><dt>Ano</dt><dd>{analysis.year ?? 'Não informado'}</dd></div>
          <div><dt>Identificador</dt><dd>{analysis.identifier ?? 'Não informado'}</dd></div>
          <div><dt>Documento</dt><dd><FileText size={14} /> {analysis.documentTitle}</dd></div>
          <div><dt>Versão</dt><dd>{analysis.documentVersion}</dd></div>
        </dl>
      </header>

      <div className="human-review-notice" role="note">
        <span><CircleAlert size={19} /></span>
        <div><strong>Revisão humana necessária</strong><p>Conteúdo gerado pela assistente requer revisão humana. Os dados abaixo são fictícios e servem apenas para demonstrar a interface.</p></div>
      </div>

      <SectionNavigation items={[
        ...analysis.fields.map((field) => ({ id: `field-${field.id}`, label: field.label === 'Limitações dos autores' ? 'Limitações' : field.label })),
        { id: 'field-sources', label: 'Fontes' },
      ]} />

      <div className="detail-layout">
        <section className="evidence-list" aria-label="Campos da ficha científica">
          {analysis.fields.map((field) => <EvidenceField key={field.id} field={field} />)}
          <section className="sources-summary" id="field-sources" aria-labelledby="sources-summary-title">
            <div className="sources-summary-heading"><span><Library size={18} /></span><div><span className="section-kicker">RASTREABILIDADE</span><h2 id="sources-summary-title">Fontes da ficha</h2></div></div>
            <p>Referências vinculadas aos campos extraídos nesta análise demonstrativa.</p>
            <div className="sources-summary-list">
              {analysis.fields.flatMap((field) => field.sources.map((source) => (
                <div key={`${field.id}-${source.documentId}-${source.page}`}><strong>{field.label}</strong><SourceReference source={source} compact /></div>
              )))}
            </div>
          </section>
        </section>
        <aside className="review-panel">
          <div className="review-panel-icon"><BookOpenCheck size={22} /></div>
          <span className="section-kicker">REVISÃO</span>
          <h2>Validação da ficha</h2>
          <p>Confirme os campos e os respectivos trechos de apoio antes de alterar o status.</p>
          <ul><li><Check size={15} /> Verifique o contexto das fontes</li><li><Check size={15} /> Confirme campos ambíguos</li><li><Check size={15} /> Registre informações ausentes</li></ul>
          {analysis.status === 'Revisado' ? (
            <div className="review-complete"><ShieldCheck size={18} /> Marcado como revisado</div>
          ) : (
            <button className="button primary full-width" type="button" disabled={saving || analysis.status === 'Em análise'} onClick={review}>
              {saving ? 'Salvando…' : 'Marcar como revisado'}
            </button>
          )}
          {analysis.status === 'Em análise' && <small>A revisão ficará disponível após a análise simulada.</small>}
        </aside>
      </div>
    </div>
  )
}
