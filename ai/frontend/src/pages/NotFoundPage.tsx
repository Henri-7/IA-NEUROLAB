import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <div className="not-found"><span className="mono-label">ERRO 404</span><h1>Página não encontrada</h1><p>O endereço acessado não faz parte deste workspace.</p><Link className="button primary" to="/"><ArrowLeft size={16} /> Voltar à visão geral</Link></div>
}
