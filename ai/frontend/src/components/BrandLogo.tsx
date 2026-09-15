import { Link } from 'react-router-dom'

export function BrandLogo() {
  return (
    <Link className="brand" to="/" aria-label="NeuroLab AI — página inicial">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="brand-wordmark">
        <span><strong>NeuroLab</strong> Digital</span>
        <small>Assistente Científica</small>
      </span>
    </Link>
  )
}
