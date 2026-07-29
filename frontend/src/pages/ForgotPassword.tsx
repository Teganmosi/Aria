import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '../services/api'

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      await authService.forgotPassword(
        email.trim(),
        window.location.origin + '/reset-password'
      )
      setSent(true)
    } catch (err) {
      // The backend returns success regardless of whether the account exists,
      // so an error here means a network/server problem.
      toast.error((err as Error).message || 'Could not send the reset email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-main)] px-6">
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Link
          to="/login"
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '2rem',
          }}
        >
          ← Back to login
        </Link>

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
          Reset your password
        </h1>

        {sent ? (
          <div
            className="rounded-[20px] border border-[var(--border-color)]"
            style={{ padding: '2rem', background: 'var(--bg-card)' }}
          >
            <p style={{ color: 'var(--text-main)', lineHeight: 1.7, margin: '0 0 0.75rem', fontWeight: 600 }}>
              Check your inbox
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.925rem' }}>
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
              It can take a minute or two to arrive — and check your spam folder.
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 2rem' }}>
              Enter the email you signed up with and we'll send you a link to choose a new password.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
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
                }}
              />
              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '1.15rem',
                  borderRadius: '3rem',
                  border: 'none',
                  background: 'var(--brand-solid)',
                  color: 'var(--bg-main)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: sending ? 'default' : 'pointer',
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
