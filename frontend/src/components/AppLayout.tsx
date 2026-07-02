import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
import { useQueryClient } from '@tanstack/react-query'

export const AppLayout = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const queryClient = useQueryClient()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    const handleSyncComplete = () => {
      queryClient.invalidateQueries()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('aria-sync-complete', handleSyncComplete)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('aria-sync-complete', handleSyncComplete)
    }
  }, [queryClient])

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
          {isOffline && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'rgb(245, 158, 11)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              <span 
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'rgb(245, 158, 11)',
                  boxShadow: '0 0 8px rgb(245, 158, 11)'
                }}
              />
              OFFLINE
            </div>
          )}
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
