import { ArrowLeftRight, Check, CircleAlert, GitCompareArrows, Minus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from '../components/FeedbackState'
import { PageHeader } from '../components/PageHeader'
import { listAnalyses } from '../services/analyses'
import { getApiErrorMessage, isRequestCancelled } from '../services/api'
import { compareStudies } from '../services/comparisons'
import type { ScientificAnalysisSummary, StudyComparison } from '../types/scientific'

export function ComparePage() {
  const [analyses, setAnalyses] = useState<ScientificAnalysisSummary[]>([])
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')
  const [comparison, setComparison] = useState<StudyComparison>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const comparisonController = useRef<AbortController>()

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true); setError('')
      try {
        const data = await listAnalyses(controller.signal)
        setAnalyses(data)
        if (data.length >= 2) {
          setLeftId(data[0].id)
          setRightId(data[1].id)
          setComparison(await compareStudies([data[0].id, data[1].id], controller.signal))
        }
      } catch (requestError) {
        if (!isRequestCancelled(requestError)) setError(getApiErrorMessage(requestError, 'Não foi possível carregar a comparação.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => {
      controller.abort()
      comparisonController.current?.abort()
    }
  }, [])

  const runComparison = async () => {
    comparisonController.current?.abort()
    const controller = new AbortController()
    comparisonController.current = controller
    setLoading(true); setError('')
    try { setComparison(await compareStudies([leftId, rightId], controller.signal)) }
    catch (requestError) {
      if (!isRequestCancelled(requestError)) setError(getApiErrorMessage(requestError, 'Não foi possível comparar as análises.'))
    }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }

  const left = analyses.find((analysis) => analysis.id === leftId)
  const right = analyses.find((analysis) => analysis.id === rightId)
  const invalidSelection = leftId === rightId

  return (
    <div className="page-container">
      <PageHeader eyebrow="LEITURA COMPARADA" title="Comparar estudos" description="Observe semelhanças e diferenças metodológicas sem atribuir notas ou conclusões automáticas." />
      <section className="comparison-selector surface-card">
        <div className="select-study"><label htmlFor="left-study">Estudo A</label><select id="left-study" value={leftId} onChange={(event) => setLeftId(event.target.value)}>{analyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.title}</option>)}</select></div>
        <span className="compare-symbol" aria-hidden="true"><ArrowLeftRight size={20} /></span>
        <div className="select-study"><label htmlFor="right-study">Estudo B</label><select id="right-study" value={rightId} onChange={(event) => setRightId(event.target.value)}>{analyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.title}</option>)}</select></div>
        <button className="button primary" type="button" disabled={invalidSelection || loading} onClick={runComparison}><GitCompareArrows size={16} /> Comparar</button>
        {invalidSelection && <p className="selection-error"><CircleAlert size={14} /> Selecione dois estudos diferentes.</p>}
      </section>

      {loading ? <LoadingState label="Organizando comparação…" /> : error ? <ErrorState onRetry={() => void runComparison()} title="Não foi possível comparar os estudos" description={error} /> : !comparison || !left || !right ? <EmptyState title="Selecione dois estudos" description="A comparação estruturada aparecerá nesta área." /> : (
        <>
          <section className="comparison-table" aria-label="Comparação lado a lado">
            <div className="comparison-head comparison-label"><span>CAMPO</span></div>
            <div className="comparison-head"><span>ESTUDO A</span><strong>{left.title}</strong><small>{left.year ?? 'Ano não informado'} · {left.documentVersion}</small></div>
            <div className="comparison-head"><span>ESTUDO B</span><strong>{right.title}</strong><small>{right.year ?? 'Ano não informado'} · {right.documentVersion}</small></div>
            {comparison.rows.map((row) => (
              <div className="comparison-row" key={row.label}>
                <div className="comparison-label"><span>{row.label}</span></div>
                <div data-study={`Estudo A · ${left.title}`}>{row.left}</div>
                <div data-study={`Estudo B · ${right.title}`}>{row.right}</div>
              </div>
            ))}
          </section>
          <section className="synthesis-grid" aria-label="Síntese descritiva da comparação">
            <ComparisonSummary title="Pontos em comum" items={comparison.commonPoints} icon={<Check size={17} />} tone="green" />
            <ComparisonSummary title="Diferenças" items={comparison.differences} icon={<Minus size={17} />} tone="blue" />
            <ComparisonSummary title="Contradições" items={comparison.contradictions} icon={<X size={17} />} tone="amber" />
          </section>
        </>
      )}
    </div>
  )
}

function ComparisonSummary({ title, items, icon, tone }: { title: string; items: string[]; icon: React.ReactNode; tone: string }) {
  return <article className={`summary-card ${tone}`}><h2><span>{icon}</span>{title}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>
}
