import React, { useState } from 'react'
import {
  User,
  LogOut,
  ShieldCheck,
  Moon,
  BookOpen,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { profileService } from '../services/api'
import { AnimatedBackground, ThemeToggle } from '../components/ui/SharedComponents'

const SettingsCard = ({ icon, title, subtitle, action, destructive = false }: { icon: React.ReactNode; title: string; subtitle: string; action: () => void; destructive?: boolean }) => {
  return (
    <button
      onClick={action}
      type="button"
      className="glass-panel p-6 rounded-[20px] flex items-center gap-6 cursor-pointer transition-all duration-300 ease-in-out border border-[var(--border-color)] mb-4 w-full text-left"
      style={{
        background: destructive ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)',
        outline: 'none',
        fontFamily: 'inherit'
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: destructive ? 'rgba(239, 68, 68, 0.1)' : 'var(--input-bg)',
          color: destructive ? '#ef4444' : 'var(--brand-solid)'
        }}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 style={{ color: destructive ? '#ef4444' : 'var(--text-main)', margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>{subtitle}</p>
      </div>
      <ChevronRight size={18} color="var(--text-muted)" className="flex-shrink-0" />
    </button>
  )
}

export const Profile = () => {
  const { user, logout, refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState(user?.full_name || '')
  const [email] = useState(user?.email || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [ariaCustomPrompt, setAriaCustomPrompt] = useState(user?.aria_custom_prompt || '')
  const [ariaPersonalContext, setAriaPersonalContext] = useState(user?.aria_personal_context || '')
  const [ariaVoice, setAriaVoice] = useState(user?.aria_voice || 'sage')
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty')
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
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update profile')
    }
  }

  const handleLogout = () => {
    try {
      logout()
    } catch {
      toast.error('Failed to log out')
    }
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
    : 'N/A'

  let avatarContent: React.ReactNode = <User size={48} />
  if (user?.avatar_url) {
    avatarContent = <img src={user.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
  } else if (displayName) {
    avatarContent = displayName.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-full relative flex flex-col overflow-y-auto pb-16">
      <AnimatedBackground />

      {/* Top Header Section */}
      <header className="pt-16 px-12 pb-8 text-center z-10">
        <div className="relative w-[120px] h-[120px] mx-auto mb-8">
          <div className="w-full h-full rounded-full bg-[var(--gradient-card)] border-4 border-[var(--brand-accent)] flex items-center justify-center text-[3rem] text-[var(--brand-solid)] shadow-[var(--shadow-main)] overflow-hidden">
            {avatarContent}
          </div>
          <div className="absolute bottom-[5px] right-[5px] bg-[var(--brand-accent)] w-7 h-7 rounded-full flex items-center justify-center border-2 border-[var(--bg-main)]">
            <Sparkles size={14} color="var(--brand-solid)" />
          </div>
        </div>

        <h1 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {displayName || 'Seeker'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', letterSpacing: '0.05em' }}>
          {email.toUpperCase()} • SANCTUARY MEMBER SINCE {memberSince.toUpperCase()}
        </p>

      </header>

      {/* Settings Sections */}
      <div className="w-full px-8 z-10" style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Section: Spiritual Preferences */}
        <div className="mb-12">
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>SPIRITUAL PREFERENCES</h3>

          <SettingsCard
            icon={<BookOpen size={20} />}
            title="Bible Translation"
            subtitle="Current: King James Version (KJV)"
            action={() => toast.info('Translation settings coming soon!')}
          />
          <SettingsCard
            icon={<Clock size={20} />}
            title="Devotion Reminders"
            subtitle="Adjust your daily morning reflection time"
            action={() => toast.info('Notification settings coming soon!')}
          />
        </div>

        {/* Section: Aria Customization */}
        <div className="mb-12">
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>ARIA CUSTOMIZATION</h3>

          <SettingsCard
            icon={<Sparkles size={20} />}
            title="AI Persona & Context"
            subtitle="Tailor Aria's personality and shared context"
            action={() => setIsEditing(true)}
          />
        </div>

        {/* Section: Account & Interface */}
        <div className="mb-12">
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>ACCOUNT & INTERFACE</h3>

          <div className="glass-panel p-6 rounded-[20px] border border-[var(--border-color)] mb-4 bg-[var(--bg-card)] flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--input-bg)] flex items-center justify-center text-[var(--brand-solid)]">
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
            action={() => toast.info('Security settings coming soon!')}
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

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[15px] z-[100] flex items-center justify-center p-8">
          <div className="glass-panel w-full bg-[var(--bg-main)] rounded-[32px] p-12 border border-[var(--border-color)]" style={{ maxWidth: '500px' }}>
            <h2 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Update Profile</h2>

            <div className="mb-6">
              <label htmlFor="displayNameInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>DISPLAY NAME</label>
              <input
                id="displayNameInput"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Display Name"
                style={{ width: '100%', padding: '1rem', background: 'var(--bg-alt)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem' }}
              />
            </div>

            <div className="mb-8">
              <label htmlFor="avatarUrlInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>PROFILE IMAGE URL</label>
              <input
                id="avatarUrlInput"
                type="text"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', padding: '1rem', background: 'var(--bg-alt)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem' }}
              />
            </div>

            <div className="mb-6">
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

            <div className="mb-6">
              <label htmlFor="customPromptInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ARIA'S CUSTOM PROMPT / PERSONA</label>
              <textarea
                id="customPromptInput"
                placeholder="e.g. Speak like a 19th-century theologian, or use a very encouraging and lighthearted tone."
                value={ariaCustomPrompt}
                onChange={e => setAriaCustomPrompt(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', height: '100px', resize: 'none' }}
              />
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="personalContextInput" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0 }}>YOUR PERSONAL CONTEXT</label>
                <button
                  type="button"
                  onClick={() => { if(confirm("Clear all of Aria's remembered context?")) setAriaPersonalContext(''); }}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  CLEAR MEMORY
                </button>
              </div>
              <textarea
                id="personalContextInput"
                placeholder="Share things you want Aria to know about you, your journey, or your current life situation."
                value={ariaPersonalContext}
                onChange={e => setAriaPersonalContext(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', height: '100px', resize: 'none' }}
              />
            </div>

            <div className="flex gap-4">
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
