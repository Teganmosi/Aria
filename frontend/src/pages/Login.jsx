import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import useAuth from '../hooks/useAuth'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate('/app/home')
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>

      {/* Left Panel - Hero Image Edge to Edge */}
      <div style={{ flex: 1.2, position: 'relative', display: 'flex', flexDirection: 'column', padding: '4rem' }}>
        {/* Background Image */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <img
            src="/login-hero.png"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt="Sanctuary Sanctuary reflection"
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(10,10,15,0.1), rgba(10,10,15,0.8))' }}></div>
        </div>

        {/* Brand Link */}
        <div style={{ position: 'relative', zIndex: 10, cursor: 'pointer', display: 'inline-flex' }} onClick={() => navigate('/')}>
          <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '2rem', fontWeight: 700, color: 'white' }}>Aria</span>
        </div>

        {/* Text Overlay */}
        <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', maxWidth: '600px' }}>
          <h1 className="font-serif" style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '1.5rem', color: 'white' }}>
            Find <span style={{ fontStyle: 'italic' }}>peace</span> in the digital noise.
          </h1>
          <p style={{ fontSize: '1.1rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Your private space for scripture, study, and reflection.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div style={{ flex: '0 0 600px', background: 'var(--bg-card)', padding: '4rem 6rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '-20px 0 40px rgba(0,0,0,0.05)', zIndex: 10 }}>

        {/* Back Button */}
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start', marginBottom: 'auto', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Sanctuary
        </button>

        {/* Form Area */}
        <div style={{ width: '100%', margin: 'auto 0' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <img src="/sanctuary-mark.png" style={{ width: '48px', height: '48px', marginBottom: '1.5rem', opacity: 0.9 }} alt="Sanctuary Logo" />
            <h2 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.2 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Enter your details to return to your moment of peace.</p>
          </div>

          {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 500 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sanctuary.com"
                required
                style={{ width: '100%', padding: '1rem 1.25rem', background: 'var(--input-bg)', border: '1px solid transparent', borderRadius: '12px', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '1rem 1.25rem', background: 'var(--input-bg)', border: '1px solid transparent', borderRadius: '12px', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{ marginTop: '1.5rem', width: '100%', padding: '1.25rem', borderRadius: '3rem', border: 'none', background: 'var(--brand-solid)', color: 'var(--bg-main)', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Third Party Layout */}
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
              <div style={{ borderTop: '1px solid var(--border-color)', position: 'absolute', width: '100%' }}></div>
              <span style={{ background: 'var(--bg-card)', padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', zIndex: 1, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>OR CONTINUE WITH</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ flex: 1, padding: '1rem', background: 'var(--input-bg)', border: 'none', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Google
              </button>
              <button style={{ flex: 1, padding: '1rem', background: 'var(--input-bg)', border: 'none', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Apple
              </button>
            </div>

            <p style={{ marginTop: '3rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
              New to the sanctuary? <Link to="/register" style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--text-main)', paddingBottom: '2px', marginLeft: '0.5rem' }}>Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
