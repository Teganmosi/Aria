import { Outlet, NavLink } from 'react-router-dom'
import {
  House,
  MessageSquare,
  BookOpen,
  BookText,
  Calendar,
  Settings,
  Heart
} from 'lucide-react'
import { ThemeToggle } from '../pages/LandingPage'

const AppLayout = () => {

  const navItems = [
    { path: '/app/home', icon: <House size={18} />, label: 'HOME' },
    { path: '/app/ai-chat', icon: <MessageSquare size={18} />, label: 'CHAT' },
    { path: '/app/bible', icon: <BookText size={18} />, label: 'BIBLE' },
    { path: '/app/bible-study', icon: <BookOpen size={18} />, label: 'STUDY' },
    { path: '/app/emotional-support', icon: <Heart size={18} />, label: 'SUPPORT' },
    { path: '/app/notes', icon: <BookText size={18} />, label: 'NOTES' },
    { path: '/app/devotion', icon: <Calendar size={18} />, label: 'DEVOTIONS' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-main)', color: 'var(--text-main)', overflow: 'hidden' }}>

      {/* Sidebar - Refined & Slimmer */}
      <aside style={{
        width: '240px',
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 1.5rem',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
        height: '100%'
      }}>

        {/* Brand - Integrated */}
        <div style={{ marginBottom: '3.5rem', paddingLeft: '0.25rem' }}>
          <h2 className="font-serif" style={{ fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Aria</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-solid)', boxShadow: '0 0 10px var(--brand-solid)' }}></div>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700 }}>SANCTUARY ACTIVE</span>
          </div>
        </div>

        {/* Nav Links - Tailored Spacing */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1rem', paddingLeft: '0.5rem' }}>NAVIGATE</p>
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

        {/* Footer Actions - Clean & Integrated */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: 'auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
            <NavLink
              to="/app/profile"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              <Settings size={16} />
              SETTINGS
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflowY: 'auto', background: 'var(--bg-main)' }}>
        <Outlet />
      </main>

    </div>
  )
}

export default AppLayout
