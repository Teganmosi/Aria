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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { path: '/app/home', icon: <House size={isMobile ? 22 : 18} />, label: 'HOME' },
    { path: '/app/ai-chat', icon: <MessageSquare size={isMobile ? 22 : 18} />, label: 'CHAT' },
    { path: '/app/bible', icon: <BookText size={isMobile ? 22 : 18} />, label: 'BIBLE' },
    { path: '/app/bible-study', icon: <BookOpen size={isMobile ? 22 : 18} />, label: 'STUDY' },
    { path: '/app/emotional-support', icon: <Heart size={isMobile ? 22 : 18} />, label: 'SUPPORT' },
    { path: '/app/notes', icon: <BookText size={isMobile ? 22 : 18} />, label: 'NOTES' },
    { path: '/app/devotion', icon: <Calendar size={isMobile ? 22 : 18} />, label: 'DEVOTIONS' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-main)', color: 'var(--text-main)', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>

      {/* Desktop Sidebar */}
      <aside 
        className="desktop-only"
        style={{
          width: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2.5rem 1.5rem',
          borderRight: '1px solid var(--border-color)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          zIndex: 50,
          height: '100%'
        }}
      >
        {/* Brand */}
        <div style={{ marginBottom: '3.5rem', paddingLeft: '0.25rem' }}>
          <h2 className="font-serif" style={{ fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Aria</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-solid)', boxShadow: '0 0 10px var(--brand-solid)' }}></div>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700 }}>SANCTUARY ACTIVE</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                borderRadius: '12px',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                boxShadow: isActive ? 'var(--shadow-main)' : 'none',
                border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                opacity: isActive ? 1 : 0.7
              })}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
            <NavLink to="/app/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              <Settings size={16} />
              SETTINGS
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header 
        className="mobile-only"
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
        <h2 className="font-serif" style={{ fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Aria</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <NavLink to="/app/profile">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-alt)', overflow: 'hidden' }}>
              <Settings size={18} style={{ margin: '7px', color: 'var(--text-secondary)' }} />
            </div>
          </NavLink>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative', overflowY: 'auto', background: 'var(--bg-main)', paddingBottom: isMobile ? '80px' : '0' }}>
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav 
        className="mobile-only"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '72px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 0.5rem',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
        }}
      >
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.6rem',
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.2s ease',
              minWidth: '60px'
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ 
                  padding: '0.5rem', 
                  borderRadius: '12px', 
                  background: isActive ? 'var(--brand-accent)' : 'transparent',
                  color: isActive ? 'var(--text-inverse)' : 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.05em' }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppLayout
