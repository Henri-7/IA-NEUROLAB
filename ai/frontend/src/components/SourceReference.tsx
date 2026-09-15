import { FileText } from 'lucide-react'
import type { SourceReference as SourceReferenceType } from '../types/scientific'

interface SourceReferenceProps {
  source: SourceReferenceType
  compact?: boolean
}

export function SourceReference({ source, compact = false }: SourceReferenceProps) {
  const page = source.page ?? 'Não informada'
  const section = source.section ?? 'Não informada'
  return (
    <div className={`source-reference ${compact ? 'compact' : ''}`} aria-label={`Fonte: ${source.documentTitle}, página ${page}, seção ${section}`}>
      <div className="source-reference-meta">
        <span className="source-document"><FileText size={14} aria-hidden="true" /><strong>{source.documentTitle}</strong></span>
        <span><small>Página</small>{page}</span>
        <span><small>Seção</small>{section}</span>
      </div>
      {!compact && <div className="source-excerpt"><span>Trecho de apoio · dado demo da API</span><blockquote>“{source.excerpt}”</blockquote></div>}
    </div>
  )
}
