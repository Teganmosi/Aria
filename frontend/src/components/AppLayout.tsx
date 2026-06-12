import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  House,
  MessageSquare,
  BookOpen,
  BookText,
  Calendar,
  Settings,
  Heart,
  Menu,
  X
} from 'lucide-react'
import { ThemeToggle } from '../components/ui/SharedComponents'
import { useState, useEffect } from 'react'

export const AppLayout = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/app/home', icon: <House size={20} />, label: 'Home' },
    { path: '/app/ai-chat', icon: <MessageSquare size={20} />, label: 'Chat' },
    { path: '/app/bible', icon: <BookText size={20} />, label: 'Bible' },
    { path: '/app/bible-study', icon: <BookOpen size={20} />, label: 'Study' },
    { path: '/app/emotional-support', icon: <Heart size={20} />, label: 'Support' },
  ]

  const moreNavItems = [
    { path: '/app/notes', icon: <BookText size={20} />, label: 'Notes' },
    { path: '/app/devotion', icon: <Calendar size={20} />, label: 'Devotions' },
  ]

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden flex-col">

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-[10px] z-[100]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-transparent border-0 text-[var(--text-main)] cursor-pointer p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="font-serif" style={{ fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Aria</h2>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NavLink to="/app/profile">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-alt)] overflow-hidden">
              <Settings size={18} style={{ margin: '7px', color: 'var(--text-secondary)' }} />
            </div>
          </NavLink>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-only fixed inset-0 bg-black/50 z-[998] backdrop-blur-[4px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className="mobile-only fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--bg-card)] z-[999] p-6 flex flex-col gap-2 shadow-[4px_0_20px_rgba(0,0,0,0.1)] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)', margin: 0 }}>MENU</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="bg-transparent border-0 text-[var(--text-muted)]">
                <X size={20} />
              </button>
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  background: isActive ? 'var(--bg-alt)' : 'transparent',
                  transition: 'all 0.2s ease'
                })}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>MORE</p>
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem',
                    borderRadius: '12px',
                    background: isActive ? 'var(--bg-alt)' : 'transparent',
                    transition: 'all 0.2s ease'
                  })}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto bg-[var(--bg-main)]">
        <Outlet />
      </main>
    </div>
  )
}
