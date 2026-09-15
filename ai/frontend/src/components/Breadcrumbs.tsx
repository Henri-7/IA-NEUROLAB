import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Navegação estrutural">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight size={12} aria-hidden="true" />}
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
