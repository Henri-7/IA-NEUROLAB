import { CircleHelp, FileWarning } from 'lucide-react'
import type { ScientificField } from '../types/scientific'
import { SourceReference } from './SourceReference'
import { StatusBadge } from './StatusBadge'

export function EvidenceField({ field }: { field: ScientificField }) {
  const hasSources = field.sources.length > 0
  return (
    <article className="evidence-field" id={`field-${field.id}`}>
      <div className="evidence-heading">
        <div>
          <span className="field-index">{String(field.id).slice(0, 2).toUpperCase()}</span>
          <h2>{field.label}</h2>
        </div>
        <StatusBadge status={field.state} />
      </div>
      <p className="field-value">{field.value}</p>
      {hasSources ? (
        <div className="field-sources">{field.sources.map((source) => <SourceReference key={`${source.documentId}-${source.page}-${source.section}`} source={source} />)}</div>
      ) : (
        <div className="source-missing">
          {field.state === 'Ausente' ? <FileWarning size={16} /> : <CircleHelp size={16} />}
          Nenhum trecho de apoio vinculado a este campo.
        </div>
      )}
    </article>
  )
}
