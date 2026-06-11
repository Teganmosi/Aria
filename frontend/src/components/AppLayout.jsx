import { Outlet, NavLink } from 'react-router-dom'
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
import { ThemeToggle } from '../pages/LandingPage'
import { useState, useEffect } from 'react'

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [])

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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-main)', color: 'var(--text-main)', overflow: 'hidden', flexDirection: 'column' }}>

      {/* Header */}
      <header 
        style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 1.25rem', 
          borderBottom: '1px solid var(--border-color)', 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(10px)', 
          zIndex: 100 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="font-serif" style={{ fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Aria</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <NavLink to="/app/profile">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-alt)', overflow: 'hidden' }}>
              <Settings size={18} style={{ margin: '7px', color: 'var(--text-secondary)' }} />
            </div>
          </NavLink>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="mobile-only"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 998,
              backdropFilter: 'blur(4px)'
            }}
          />
          <nav 
            className="mobile-only"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              background: 'var(--bg-card)',
              zIndex: 999,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)', margin: 0 }}>MENU</h3>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
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
      <main style={{ flex: 1, position: 'relative', overflowY: 'auto', background: 'var(--bg-main)' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
