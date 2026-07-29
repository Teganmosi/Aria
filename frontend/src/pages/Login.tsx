import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import useAuth from '../hooks/useAuth'
import { loginSchema, type LoginFormData } from '../schemas/auth'

export const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, exchangeOAuthToken } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
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

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        if (accessToken) {
          const toastId = toast.loading('Signing in with Google...')
          try {
            await exchangeOAuthToken(accessToken, refreshToken || '')
            toast.success('Successfully signed in!', { id: toastId })
            navigate('/app/home')
          } catch (err) {
            toast.error((err as Error).message || 'OAuth sign in failed', { id: toastId })
          } finally {
            window.history.replaceState(null, '', window.location.pathname)
          }
        }
      }
    }
    handleOAuthCallback()
  }, [navigate, exchangeOAuthToken])

  const onSubmit = async (values: LoginFormData) => {
    try {
      await login(values.email, values.password)
    } catch (err) {
      toast.error((err as Error).message || 'Failed to sign in')
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl =
      import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8002/api/v1' : null)
    if (!backendUrl) {
      toast.error('This app is misconfigured: VITE_API_URL is missing')
      return
    }
    const redirectTo = window.location.origin + '/login'
    window.location.href = `${backendUrl}/auth/oauth/google?redirect_to=${encodeURIComponent(redirectTo)}`
  }

  return (
    <div className="responsive-stack flex min-h-screen w-full overflow-x-hidden bg-[var(--bg-main)]">

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
        <div className="absolute inset-0 z-0">
          <img src="/login-hero.png" className="w-full h-full object-cover" alt="Sanctuary reflection" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,15,0.1), rgba(10,10,15,0.8))' }}></div>
        </div>

        <div className="relative z-10 cursor-pointer inline-flex" onClick={() => navigate('/')}>
          <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '2rem', fontWeight: 700, color: 'white' }}>Aria</span>
        </div>

        <div className="relative z-10 mt-auto" style={{ maxWidth: '600px' }}>
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
        <button onClick={() => navigate('/')} className="bg-transparent border-0 text-[var(--text-secondary)] flex items-center gap-2 cursor-pointer self-start mb-auto text-[0.9rem] font-medium">
          <ArrowLeft size={16} /> Back to Sanctuary
        </button>

        <div className="w-full my-auto">
          <div style={{ marginBottom: '2.5rem' }}>
            <img src="/sanctuary-mark.png" style={{ width: '48px', height: '48px', marginBottom: '1.5rem', opacity: 0.9 }} alt="Sanctuary Logo" />
            <h2 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.2 }}>Welcome Back</h2>
            <p className="text-[var(--text-secondary)] text-base">Enter your details to return to your moment of peace.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
              {errors.email && <p className="text-red-600 text-[0.8rem] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '1rem 1.25rem', background: 'var(--input-bg)', border: '1px solid transparent', borderRadius: '12px', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-[var(--text-muted)] flex items-center">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-[0.8rem] mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} style={{ marginTop: '1.5rem', width: '100%', padding: '1.25rem', borderRadius: '3rem', border: 'none', background: 'var(--brand-solid)', color: 'var(--bg-main)', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-12 text-center">
            <div className="relative flex items-center justify-center my-8">
              <div className="absolute w-full border-t border-[var(--border-color)]"></div>
              <span style={{ background: 'var(--bg-card)', padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', zIndex: 1, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>OR CONTINUE WITH</span>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={handleGoogleLogin} style={{ flex: 1, padding: '1rem', background: 'var(--input-bg)', border: 'none', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Google</button>
            </div>
            <p className="mt-12 text-base text-[var(--text-secondary)]">
              New to the sanctuary? <Link to="/register" style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--text-main)', paddingBottom: '2px', marginLeft: '0.5rem' }}>Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
