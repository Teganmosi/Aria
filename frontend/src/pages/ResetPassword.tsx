import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '../services/api'

/**
 * Recovery tokens arrive in one of two shapes depending on the Supabase auth flow:
 *  - PKCE (default):   /reset-password?code=<auth_code>
 *  - Implicit (legacy): /reset-password#access_token=...&refresh_token=...&type=recovery
 * We read both and let the backend decide which to use.
 */
const parseRecoveryTokens = () => {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return {
    code: query.get('code'),
    accessToken: hash.get('access_token'),
    refreshToken: hash.get('refresh_token'),
  }
}

export const ResetPassword = () => {
  const recovery = useMemo(parseRecoveryTokens, [])
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const hasValidTokens = Boolean(recovery.code || (recovery.accessToken && recovery.refreshToken))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await authService.resetPassword(password, recovery)
      toast.success('Password updated — sign in with your new password')
      navigate('/login')
    } catch (err) {
      toast.error((err as Error).message || 'Could not reset the password. Please request a new link.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1.1rem 1.5rem',
    borderRadius: '3rem',
    border: '1px solid var(--border-color)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    marginBottom: '1.25rem',
    boxSizing: 'border-box',
    outline: 'none',
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-main)] px-6">
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <h1
          className="font-serif"
          style={{
            fontStyle: 'italic',
            fontSize: '2.25rem',
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
            lineHeight: 1.15,
          }}
        >
          Choose a new password
        </h1>

        {!hasValidTokens ? (
          <div
            className="rounded-[20px] border border-[var(--border-color)]"
            style={{ padding: '2rem', background: 'var(--bg-card)' }}
          >
            <p style={{ color: 'var(--text-main)', lineHeight: 1.7, margin: '0 0 0.75rem', fontWeight: 600 }}>
              This reset link is invalid or has expired
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1.5rem', fontSize: '0.925rem' }}>
              Reset links can only be used once and expire after a short while.
            </p>
            <Link
              to="/forgot-password"
              style={{
                color: 'var(--text-main)',
                fontWeight: 600,
                textDecoration: 'none',
                borderBottom: '1px solid var(--text-main)',
                paddingBottom: '2px',
              }}
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 2rem' }}>
              At least 8 characters. This replaces your old password immediately.
            </p>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              style={inputStyle}
            />
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '1.15rem',
                borderRadius: '3rem',
                border: 'none',
                background: 'var(--brand-solid)',
                color: 'var(--bg-main)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
