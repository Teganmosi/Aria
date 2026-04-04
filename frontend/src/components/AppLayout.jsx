import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  House,
  MessageSquare,
  BookOpen,
  Heart,
  Sun,
  User,
  LogOut,
  Sparkles,
  BookText,
  FileText,
  Menu,
  X
} from 'lucide-react'
import useAuth from '../hooks/useAuth'

const AppLayout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { 
      path: '/app/home', 
      icon: <House size={20} />, 
      label: 'Home',
      desc: 'Dashboard',
      color: '#c9a227'
    },
    { 
      path: '/app/ai-chat', 
      icon: <MessageSquare size={20} />, 
      label: 'AI Chat',
      desc: 'Ask anything',
      color: '#8b5cf6'
    },
    { 
      path: '/app/bible', 
      icon: <BookText size={20} />, 
      label: 'Bible',
      desc: 'Read Scripture',
      color: '#10b981'
    },
    { 
      path: '/app/bible-study', 
      icon: <BookOpen size={20} />, 
      label: 'Bible Study',
      desc: 'Interactive companion',
      color: '#3b82f6'
    },
    { 
      path: '/app/emotional-support', 
      icon: <Heart size={20} />, 
      label: 'Faith Companion',
      desc: 'Emotional support',
      color: '#ec4899'
    },
    {
      path: '/app/devotion',
      icon: <Sun size={20} />,
      label: 'Daily Devotion',
      desc: 'Morning reflection',
      color: '#f59e0b'
    },
    {
      path: '/app/notes',
      icon: <FileText size={20} />,
      label: 'My Notes',
      desc: 'Personal insights',
      color: '#8b5cf6'
    },
  ]

  return (
    <div className="app-layout">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 200,
          background: 'rgba(20, 20, 25, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0.5rem',
          color: '#f5f5f5',
          cursor: 'pointer',
          display: 'none'
        }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">Aria</span>
            <span className="brand-tagline">Your spiritual companion</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => isActive ? { 
                borderLeftColor: item.color,
                background: `${item.color}15`
              } : {}}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="link-icon" style={{ color: item.color }}>
                {item.icon}
              </div>
              <div className="link-text">
                <span className="link-label">{item.label}</span>
                <span className="link-desc">{item.desc}</span>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink to="/app/profile" className="sidebar-link profile-link">
            <div className="profile-avatar">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.full_name || 'User'}</span>
              <span className="profile-email">{user?.email || 'faith@companion.app'}</span>
            </div>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #0f0f14 0%, #141419 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 100;
        }

        .sidebar-brand {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .brand-icon-wrapper {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #c9a227 0%, #a88620 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
        }

        .brand-icon-wrapper .brand-icon {
          color: white;
          width: 22px;
          height: 22px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #f5f5f5;
          letter-spacing: -0.02em;
        }

        .brand-tagline {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.25rem 0.875rem;
          overflow-y: auto;
        }

        .nav-section-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.3);
          padding: 0 0.75rem;
          margin-bottom: 0.75rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s ease;
          font-weight: 500;
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
          border-left: 3px solid transparent;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }

        .sidebar-link.active {
          color: #f5f5f5;
        }

        .link-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }

        .sidebar-link.active .link-icon {
          background: rgba(255, 255, 255, 0.1);
        }

        .link-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.125rem;
        }

        .link-label {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .link-desc {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .sidebar-footer {
          padding: 1rem 0.875rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .profile-link {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          color: white;
          flex-shrink: 0;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .profile-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #f5f5f5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-email {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
        }

        .logout-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .app-main {
          flex: 1;
          margin-left: 280px;
          padding: 0;
          background: #0a0a0f;
          min-height: 100vh;
        }

        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
          
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .app-main {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default AppLayout
