import { BarChart3, BookCheck, FileStack, FlaskConical, Menu, MessageSquareText, Scale, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'

const navItems = [
  { to: '/', label: 'Visão geral', icon: BarChart3 },
  { to: '/chat', label: 'Chat', icon: MessageSquareText },
  { to: '/documentos', label: 'Documentos', icon: FileStack },
  { to: '/analises', label: 'Análises', icon: FlaskConical },
  { to: '/comparar', label: 'Comparar', icon: Scale },
  { to: '/revisoes', label: 'Revisões', icon: BookCheck },
]

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <header className="mobile-header">
        <BrandLogo />
        <button className="icon-button" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação principal">
        <div className="sidebar-brand"><BrandLogo /><span className="version-badge">V1</span></div>
        <nav>
          <span className="nav-section-label">WORKSPACE</span>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-icon"><FlaskConical size={16} /></span>
          <div><strong>Ambiente demonstrativo</strong><p>Nenhuma análise representa validação científica.</p></div>
        </div>
      </aside>
      {menuOpen && <button className="menu-backdrop" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}

      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
