import { ArrowUpRight, BookOpenCheck, CircleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/FeedbackState'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { listAnalyses } from '../services/analyses'
import { getApiErrorMessage, isRequestCancelled } from '../services/api'
import { listReviews } from '../services/reviews'
import type { ReviewItem, ScientificAnalysisSummary } from '../types/scientific'

type ReviewTab = 'pending' | 'reviewed'

export function ReviewsPage() {
  const [analyses, setAnalyses] = useState<ScientificAnalysisSummary[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [tab, setTab] = useState<ReviewTab>('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (signal?: AbortSignal) => {
    setLoading(true); setError('')
    try {
      const [reviewData, analysisData] = await Promise.all([listReviews(signal), listAnalyses(signal)])
      setReviews(reviewData)
      setAnalyses(analysisData)
    } catch (requestError) {
      if (!isRequestCancelled(requestError)) setError(getApiErrorMessage(requestError, 'Não foi possível carregar as revisões.'))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() => reviews.filter((review) => tab === 'pending' ? review.status === 'Aguardando revisão' : review.status === 'Revisado'), [reviews, tab])
  const pendingCount = reviews.filter((review) => review.status === 'Aguardando revisão').length
  const reviewedCount = reviews.filter((review) => review.status === 'Revisado').length

  return (
    <div className="page-container">
      <PageHeader eyebrow="CURADORIA HUMANA" title="Revisões" description="Acompanhe fichas que precisam de validação e o histórico já revisado." />
      <div className="science-limit-note"><CircleAlert size={18} /><p><strong>Análise automática não significa aprovação científica.</strong> A revisão confirma a conferência da ficha, não a qualidade metodológica ou as conclusões do artigo.</p></div>
      <div className="review-tabs" role="tablist" aria-label="Status da revisão">
        <button type="button" role="tab" aria-selected={tab === 'pending'} className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>Aguardando revisão <span>{pendingCount}</span></button>
        <button type="button" role="tab" aria-selected={tab === 'reviewed'} className={tab === 'reviewed' ? 'active' : ''} onClick={() => setTab('reviewed')}>Revisados <span>{reviewedCount}</span></button>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState onRetry={() => void load()} title="Não foi possível carregar as revisões" description={error} /> : filtered.length === 0 ? <EmptyState title={tab === 'pending' ? 'Nenhuma revisão pendente' : 'Nenhum conteúdo revisado'} description="Quando uma análise mudar de status, ela aparecerá aqui." /> : (
        <section className="review-list" aria-label={tab === 'pending' ? 'Aguardando revisão' : 'Revisados'}>
          {filtered.map((review) => {
            const analysis = analyses.find((item) => item.id === review.analysisId)
            return <article className="review-row" key={review.analysisId}>
              <span className="review-file-icon"><BookOpenCheck size={19} /></span>
              <div className="review-main"><span className="mono-label">{analysis?.year ?? 'ANO NÃO INFORMADO'} · {analysis?.documentVersion ?? '—'}</span><h2>{analysis?.title ?? 'Análise demonstrativa'}</h2><p>{analysis?.documentTitle ?? 'Documento demo da API'}</p></div>
              <StatusBadge status={review.status} />
              <Link className="button secondary" to={`/analises/${review.analysisId}`}>Abrir ficha <ArrowUpRight size={16} /></Link>
            </article>
          })}
        </section>
      )}
    </div>
  )
}
