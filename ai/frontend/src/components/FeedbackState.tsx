import { FileQuestion, TriangleAlert } from 'lucide-react'

export function LoadingState({ label = 'Carregando dados de demonstração…' }: { label?: string }) {
  return (
    <div className="feedback-state loading-state" role="status" aria-live="polite">
      <div className="skeleton-stack" aria-hidden="true"><span /><span /><span /></div>
      <span className="loading-label">{label}</span>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="feedback-state"><FileQuestion size={26} /><strong>{title}</strong><p>{description}</p></div>
}

interface ErrorStateProps {
  onRetry?: () => void
  title?: string
  description?: string
}

export function ErrorState({ onRetry, title = 'Não foi possível carregar os dados', description = 'Tente novamente. Nenhum dado foi alterado.' }: ErrorStateProps) {
  return (
    <div className="feedback-state" role="alert">
      <TriangleAlert size={26} />
      <strong>{title}</strong>
      <p>{description}</p>
      {onRetry && <button className="button secondary" type="button" onClick={onRetry}>Tentar novamente</button>}
    </div>
  )
}
