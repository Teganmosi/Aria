import { useState, useEffect } from 'react'
import {
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Bell,
  Moon,
  Sun,
  BookOpen,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { profileService } from '../services/api'
import { AnimatedBackground, ThemeToggle } from './LandingPage'

const SettingsCard = ({ icon, title, subtitle, action, destructive = false }) => (
  <div
    onClick={action}
    className="glass-panel"
    style={{
      padding: '1.5rem',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '1px solid var(--border-color)',
      marginBottom: '1rem',
      background: destructive ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)'
    }}
  >
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: destructive ? 'rgba(239, 68, 68, 0.1)' : 'var(--input-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: destructive ? '#ef4444' : 'var(--brand-solid)'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ color: destructive ? '#ef4444' : 'var(--text-main)', margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>{subtitle}</p>
    </div>
    <ChevronRight size={18} color="var(--text-muted)" />
  </div>
)

const Profile = () => {
  const { user, logout, refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState(user?.full_name || '')
  const [email] = useState(user?.email || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [ariaCustomPrompt, setAriaCustomPrompt] = useState(user?.aria_custom_prompt || '')
  const [ariaPersonalContext, setAriaPersonalContext] = useState(user?.aria_personal_context || '')
  const [ariaVoice, setAriaVoice] = useState(user?.aria_voice || 'sage')
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

    try {
      await profileService.updateProfile({
        full_name: displayName,
        avatar_url: avatarUrl,
        aria_custom_prompt: ariaCustomPrompt,
        aria_personal_context: ariaPersonalContext,
        aria_voice: ariaVoice
      })
      setIsEditing(false)
      await refreshUser()
      showMessage('Profile updated successfully!')
      // Refresh user data if needed? useAuth usually has it
    } catch (err) {
      showMessage(err.message || 'Failed to update profile', true)
    }
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
    <div style={{ minHeight: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: '4rem' }}>
      <AnimatedBackground />

      {/* Top Header Section */}
      <header style={{ padding: '4rem 3rem 2rem', textAlign: 'center', zIndex: 10 }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'var(--gradient-card)',
            border: '4px solid var(--brand-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'var(--brand-solid)',
            boxShadow: 'var(--shadow-main)',
            overflow: 'hidden'
          }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
            ) : (
              displayName ? displayName.charAt(0).toUpperCase() : <User size={48} />
            )}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            background: 'var(--brand-accent)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-main)'
          }}>
            <Sparkles size={14} color="var(--brand-solid)" />
          </div>
        </div>

        <h1 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {displayName || 'Seeker'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', letterSpacing: '0.05em' }}>
          {email.toUpperCase()} • SANCTUARY MEMBER SINCE {memberSince.toUpperCase()}
        </p>

        {message && (
          <div style={{
            maxWidth: '400px',
            margin: '1.5rem auto 0',
            padding: '1rem',
            borderRadius: '12px',
            background: message.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: message.isError ? '#ef4444' : '#10b981',
            fontSize: '0.9rem',
            border: `1px solid ${message.isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
          }}>
            {message.text}
          </div>
        )}
      </header>

      {/* Settings Sections */}
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 2rem', zIndex: 10 }}>

        {/* Section: Spiritual Preferences */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>SPIRITUAL PREFERENCES</h3>

          <SettingsCard
            icon={<BookOpen size={20} />}
            title="Bible Translation"
            subtitle="Current: King James Version (KJV)"
            action={() => showMessage('Translation settings coming soon!')}
          />
          <SettingsCard
            icon={<Clock size={20} />}
            title="Devotion Reminders"
            subtitle="Adjust your daily morning reflection time"
            action={() => showMessage('Notification settings coming soon!')}
          />
        </div>

        {/* Section: Aria Customization */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>ARIA CUSTOMIZATION</h3>

          <SettingsCard
            icon={<Sparkles size={20} />}
            title="AI Persona & Context"
            subtitle="Tailor Aria's personality and shared context"
            action={() => setIsEditing(true)}
          />
        </div>

        {/* Section: Account & Interface */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>ACCOUNT & INTERFACE</h3>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '1rem', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-solid)' }}>
                <Moon size={20} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Sanctuary Theme</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>Switch between light and dark modes</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <SettingsCard
            icon={<User size={20} />}
            title="Personal Details"
            subtitle="Update your display name and profile image"
            action={() => setIsEditing(true)}
          />
          <SettingsCard
            icon={<ShieldCheck size={20} />}
            title="Privacy & Security"
            subtitle="Manage your password and session data"
            action={() => showMessage('Security settings coming soon!')}
          />
        </div>

        {/* Section: Danger Zone */}
        <div>
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#ef4444', fontWeight: 800, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>EXIT SANCTUARY</h3>
          <SettingsCard
            icon={<LogOut size={20} />}
            title="Sign Out"
            subtitle="Securely end your current session"
            destructive
            action={handleLogout}
          />
        </div>
      </div>

      {/* Edit Modal Placeholder */}
      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-main)', borderRadius: '32px', padding: '3rem', border: '1px solid var(--border-color)' }}>
            <h2 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Update Profile</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="displayNameInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>DISPLAY NAME</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Display Name"
                style={{ width: '100%', padding: '1rem', background: 'var(--bg-alt)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>PROFILE IMAGE URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', padding: '1rem', background: 'var(--bg-alt)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="customVoiceInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ARIA'S VOICE</label>
              <select
                id="customVoiceInput"
                value={ariaVoice}
                onChange={e => setAriaVoice(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem' }}
              >
                <option value="alloy">Alloy (Balanced)</option>
                <option value="ash">Ash (Dynamic)</option>
                <option value="ballad">Ballad (Warm)</option>
                <option value="coral">Coral (Bright)</option>
                <option value="echo">Echo (Low-pitched)</option>
                <option value="sage">Sage (Peaceful)</option>
                <option value="stella">Stella (Warm)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="customPromptInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ARIA'S CUSTOM PROMPT / PERSONA</label>
              <textarea
                id="customPromptInput"
                placeholder="e.g. Speak like a 19th-century theologian, or use a very encouraging and lighthearted tone."
                value={ariaCustomPrompt}
                onChange={e => setAriaCustomPrompt(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', height: '100px', resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="personalContextInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>YOUR PERSONAL CONTEXT</label>
              <textarea
                id="personalContextInput"
                placeholder="Share things you want Aria to know about you, your journey, or your current life situation."
                value={ariaPersonalContext}
                onChange={e => setAriaPersonalContext(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', height: '100px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleUpdateProfile}
                style={{ flex: 1, padding: '1rem', background: 'var(--brand-solid)', color: 'var(--bg-main)', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                SAVE CHANGES
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Profile
