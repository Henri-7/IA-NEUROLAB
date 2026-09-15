import { CheckCircle2, CircleHelp, CircleMinus, Clock3, LoaderCircle, SearchCheck, ShieldQuestion, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { DisplayStatus } from '../types/scientific'

interface StatusBadgeProps {
  status: DisplayStatus
}

interface StatusConfig {
  className: string
  label: string
  icon: LucideIcon
}

const statusConfig: Record<DisplayStatus, StatusConfig> = {
  'Aguardando revisão': { className: 'status-warning', label: 'Aguardando revisão', icon: Clock3 },
  'Revisado': { className: 'status-success', label: 'Revisado', icon: CheckCircle2 },
  'Em análise': { className: 'status-info', label: 'Em análise', icon: LoaderCircle },
  'Encontrada': { className: 'status-success', label: 'Informação encontrada', icon: SearchCheck },
  'Ausente': { className: 'status-neutral', label: 'Informação ausente', icon: CircleMinus },
  'Ambígua': { className: 'status-warning', label: 'Informação ambígua', icon: CircleHelp },
  'Não verificável': { className: 'status-danger', label: 'Não verificável', icon: ShieldQuestion },
  'Informação insuficiente': { className: 'status-warning', label: 'Informação insuficiente', icon: CircleHelp },
  'Indisponível': { className: 'status-warning', label: 'Indisponível', icon: CircleHelp },
  'Pronto': { className: 'status-success', label: 'Pronto', icon: CheckCircle2 },
  'Processando': { className: 'status-info', label: 'Processando', icon: LoaderCircle },
  'Erro': { className: 'status-danger', label: 'Erro', icon: TriangleAlert },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  return <span className={`status-badge ${config.className}`} aria-label={`Status: ${config.label}`}><Icon size={12} aria-hidden="true" />{config.label}</span>
}
