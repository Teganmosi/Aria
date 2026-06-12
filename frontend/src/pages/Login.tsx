import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuth from '../hooks/useAuth'
import { loginSchema, type LoginFormData } from '../schemas/auth'

export const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate('/app/home')
  }, [isAuthenticated, navigate])

  const onSubmit = async (values: LoginFormData) => {
    setServerError('')
    try {
      await login(values.email, values.password)
    } catch (err) {
      setServerError((err as Error).message || 'Failed to sign in')
    }
  }

  return (
    <div className="responsive-stack" style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden', backgroundColor: 'var(--bg-main)' }}>

      {/* Left Panel - Hero Image */}
      <div
        className="login-hero"
        style={{
          flex: isMobile ? 'none' : 1.2,
          height: isMobile ? '20vh' : 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '1.5rem' : '4rem',
          minHeight: isMobile ? '200px' : 'auto'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <img src="/login-hero.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Sanctuary reflection" />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(10,10,15,0.1), rgba(10,10,15,0.8))' }}></div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, cursor: 'pointer', display: 'inline-flex' }} onClick={() => navigate('/')}>
          <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '2rem', fontWeight: 700, color: 'white' }}>Aria</span>
        </div>

        <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', maxWidth: '600px' }}>
          <h1 className="font-serif" style={{ fontSize: isMobile ? '2.5rem' : '4.5rem', lineHeight: 1.1, marginBottom: '1.5rem', color: 'white' }}>
            Find <span style={{ fontStyle: 'italic' }}>peace</span> in the digital noise.
          </h1>
          <p style={{ fontSize: isMobile ? '0.8rem' : '1.1rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Your private space for scripture, study, and reflection.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div
        className="login-form-container"
        style={{
          flex: isMobile ? '1' : '0 0 600px',
          background: 'var(--bg-card)',
          padding: isMobile ? '2rem 1.5rem' : '4rem 6rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: isMobile ? 'none' : '-20px 0 40px rgba(0,0,0,0.05)',
          zIndex: 10,
          overflowY: 'auto'
        }}
      >
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start', marginBottom: 'auto', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Sanctuary
        </button>

        <div style={{ width: '100%', margin: 'auto 0' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <img src="/sanctuary-mark.png" style={{ width: '48px', height: '48px', marginBottom: '1.5rem', opacity: 0.9 }} alt="Sanctuary Logo" />
            <h2 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.2 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Enter your details to return to your moment of peace.</p>
          </div>

          {serverError && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 500 }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="email" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@sanctuary.com"
                style={{ width: '100%', padding: '1rem 1.25rem', background: 'var(--input-bg)', border: '1px solid transparent', borderRadius: '12px', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
                {...register('email')}
              />
              {errors.email && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="password" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '1rem 1.25rem', background: 'var(--input-bg)', border: '1px solid transparent', borderRadius: '12px', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} style={{ marginTop: '1.5rem', width: '100%', padding: '1.25rem', borderRadius: '3rem', border: 'none', background: 'var(--brand-solid)', color: 'var(--bg-main)', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
              <div style={{ borderTop: '1px solid var(--border-color)', position: 'absolute', width: '100%' }}></div>
              <span style={{ background: 'var(--bg-card)', padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', zIndex: 1, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>OR CONTINUE WITH</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ flex: 1, padding: '1rem', background: 'var(--input-bg)', border: 'none', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Google</button>
              <button style={{ flex: 1, padding: '1rem', background: 'var(--input-bg)', border: 'none', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Apple</button>
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

