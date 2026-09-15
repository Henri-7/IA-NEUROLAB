interface SectionItem {
  id: string
  label: string
}

export function SectionNavigation({ items }: { items: SectionItem[] }) {
  return (
    <nav className="section-navigation" aria-label="Seções da ficha científica">
      <span className="section-navigation-label">Nesta ficha</span>
      <div>
        {items.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
      </div>
    </nav>
  )
}
