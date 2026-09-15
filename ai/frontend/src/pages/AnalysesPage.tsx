import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AnalysisCard } from '../components/AnalysisCard'
import { EmptyState, ErrorState, LoadingState } from '../components/FeedbackState'
import { PageHeader } from '../components/PageHeader'
import { listAnalyses } from '../services/analyses'
import { getApiErrorMessage, isRequestCancelled } from '../services/api'
import type { ReviewStatus, ScientificAnalysisSummary } from '../types/scientific'

type Filter = 'Todas' | ReviewStatus
const filters: Filter[] = ['Todas', 'Aguardando revisão', 'Em análise', 'Revisado']

export function AnalysesPage() {
  const [analyses, setAnalyses] = useState<ScientificAnalysisSummary[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('Todas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (signal?: AbortSignal) => {
    setLoading(true); setError('')
    try {
      setAnalyses(await listAnalyses(signal))
    } catch (requestError) {
      if (!isRequestCancelled(requestError)) setError(getApiErrorMessage(requestError, 'Não foi possível carregar as análises.'))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() => analyses.filter((analysis) => {
    const matchesQuery = analysis.title.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
    return matchesQuery && (filter === 'Todas' || analysis.status === filter)
  }), [analyses, query, filter])

  return (
    <div className="page-container">
      <PageHeader eyebrow="EVIDÊNCIAS" title="Análises científicas" description="Fichas estruturadas geradas a partir dos documentos do workspace." />
      <section className="content-section no-margin" aria-label="Análises disponíveis">
        <div className="analysis-toolbar">
          <label className="search-field"><Search size={17} /><span className="visually-hidden">Buscar análises</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar análise…" /></label>
          <div className="filter-tabs" role="group" aria-label="Filtrar por status">
            {filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState onRetry={() => void load()} title="Não foi possível carregar as análises" description={error} /> : filtered.length === 0 ? <EmptyState title="Nenhuma análise encontrada" description="Ajuste a busca ou selecione outro status." /> : <div className="cards-grid">{filtered.map((analysis) => <AnalysisCard key={analysis.id} analysis={analysis} />)}</div>}
      </section>
    </div>
  )
}
