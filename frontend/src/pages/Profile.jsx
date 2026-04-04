import { useState, useEffect } from 'react'
import { User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// Simple animated background
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 8,
        y: (e.clientY / window.innerHeight - 0.5) * 8
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="page-bg">
      <div className="bg-orb" style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }} />
    </div>
  )
}

const Profile = () => {
  const { user, logout } = useAuth()
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [email] = useState(user?.email || '')
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState(null)

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      showMessage('Display name cannot be empty', true)
      return
    }
    // In a real app, this would call an API to update the profile
    showMessage('Profile updated successfully!')
    setIsEditing(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      showMessage('Failed to log out', true)
    }
  }

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'N/A'

  return (
    <div className="page-container">
      <AnimatedBackground />
      
      <div className="page-content">
        <div className="page-header">
          <div className="header-icon">
            <User size={24} />
          </div>
          <h1>Your Profile</h1>
          <p>Manage your account settings</p>
        </div>
        
        <div className="content-card">
          <div className="profile-section">
            <div className="avatar">
              {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="disabled"
                    />
                  </div>
                  <div className="form-actions">
                    <button onClick={handleUpdateProfile} className="btn btn-primary">
                      Save Changes
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-display">
                  <h2>{displayName || 'Set up your profile'}</h2>
                  <p className="email">{email}</p>
                  <p className="member-since">Member since {memberSince}</p>
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    <Settings size={16} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className={`message ${message.isError ? 'error' : 'success'}`}>
              {message.text}
            </div>
          )}

          <div className="settings-section">
            <h3>Account Actions</h3>
            <div className="actions-list">
              <button onClick={handleLogout} className="action-btn logout">
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .page-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          background: radial-gradient(circle, #ec4899 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease-out;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ec4899;
          margin: 0 auto 1rem;
        }

        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.5rem;
        }

        .page-header p {
          color: var(--text-muted);
          margin: 0;
        }

        .content-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .profile-section {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .profile-info {
          flex: 1;
        }

        .info-display h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 0.25rem;
        }

        .info-display .email {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin: 0 0 0.25rem;
        }

        .info-display .member-since {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin: 0 0 1rem;
        }

        .edit-form .form-group {
          margin-bottom: 1rem;
        }

        .edit-form label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .edit-form input {
          width: 100%;
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .edit-form input:focus {
          outline: none;
          border-color: #ec4899;
        }

        .edit-form input.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.625rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ec4899, #db2777);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #f472b6, #ec4899);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.25rem;
          font-size: 0.9rem;
        }

        .message.error {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          color: #fca5a5;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #6ee7b7;
        }

        .settings-section {
          border-top: 1px solid var(--border);
          padding-top: 1.25rem;
        }

        .settings-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 1rem;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .action-btn.logout {
          color: #f87171;
        }

        .action-btn.logout:hover {
          background: rgba(220, 38, 38, 0.1);
          border-color: rgba(220, 38, 38, 0.3);
        }

        @media (max-width: 640px) {
          .profile-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile
