import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ScientificAnalysisSummary } from '../types/scientific'
import { StatusBadge } from './StatusBadge'

export function AnalysisCard({ analysis }: { analysis: ScientificAnalysisSummary }) {
  return (
    <article className="analysis-card">
      <div className="analysis-card-top">
        <span className="mono-label">ANÁLISE · {analysis.year ?? 'ANO NÃO INFORMADO'}</span>
        <StatusBadge status={analysis.status} />
      </div>
      <h3>{analysis.title}</h3>
      <div className="analysis-card-bottom">
        <span><CalendarDays size={15} />{analysis.analyzedAt}</span>
        <Link className="text-link" to={`/analises/${analysis.id}`} aria-label={`Abrir análise: ${analysis.title}`}>
          Abrir ficha <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  )
}
