import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuth from '../hooks/useAuth'
import { registerSchema, type RegisterFormData } from '../schemas/auth'

export const Register = () => {
  const navigate = useNavigate()
  const { register: authRegister, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate('/app/home')
  }, [isAuthenticated, navigate])

  const onSubmit = async (values: RegisterFormData) => {
    setServerError('')
    try {
      await authRegister(values.email, values.password, values.fullName)
    } catch (err) {
      setServerError((err as Error).message || 'Failed to create account')
    }
  }

  return (
    <div className="responsive-stack flex min-h-screen w-screen overflow-x-hidden bg-[var(--bg-main)]">

      {/* Left Panel - Hero Image */}
      <div
        className="register-hero"
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
          <img src="/register-hero.png" className="w-full h-full object-cover" alt="Sanctuary reflection" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,15,0.3), rgba(10,10,15,0.8))' }}></div>
        </div>

        <div className="relative z-10 cursor-pointer inline-flex" onClick={() => navigate('/')}>
          <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '2rem', fontWeight: 700, color: 'white' }}>Aria</span>
        </div>

        <div className="relative z-10 mt-auto" style={{ maxWidth: '600px' }}>
          <h1 className="font-serif" style={{ fontSize: isMobile ? '2.5rem' : '4.5rem', lineHeight: 1.1, marginBottom: '1.5rem', color: 'white' }}>
            Join the sanctuary of <span style={{ fontStyle: 'italic' }}>quiet reflection.</span>
          </h1>
          <p style={{ fontSize: isMobile ? '0.8rem' : '1.1rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            BEGIN YOUR JOURNEY TOWARDS SPIRITUAL CLARITY AND PEACE.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div
        className="register-form-container"
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
        <button onClick={() => navigate('/')} className="bg-transparent border-0 text-[var(--text-secondary)] flex items-center gap-2 cursor-pointer self-start mb-8 text-[0.9rem] font-medium">
          <ArrowLeft size={16} /> Back to Sanctuary
        </button>

        <div className="w-full my-auto">
          <div style={{ marginBottom: '2.5rem' }}>
            <img src="/sanctuary-mark.png" style={{ width: '48px', height: '48px', marginBottom: '1.5rem', opacity: 0.9 }} alt="Sanctuary Logo" />
            <h2 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.2 }}>Create Your Account</h2>
            <p className="text-[var(--text-secondary)] text-base">Start your spiritual journey with Aria today.</p>
          </div>

          {serverError && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 500 }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label htmlFor="fullName" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                style={{ width: '100%', padding: '1rem 1.25rem', background: 'var(--input-bg)', border: '1px solid transparent', borderRadius: '12px', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-red-600 text-[0.8rem] mt-1">{errors.fullName.message}</p>}
            </div>

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
              <label htmlFor="password" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            <button type="submit" disabled={isSubmitting} style={{ marginTop: '1rem', width: '100%', padding: '1.25rem', borderRadius: '3rem', border: 'none', background: 'var(--brand-solid)', color: 'var(--bg-main)', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <div className="relative flex items-center justify-center my-8">
              <div className="absolute w-full border-t border-[var(--border-color)]"></div>
              <span style={{ background: 'var(--bg-card)', padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', zIndex: 1, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>OR SIGN UP WITH</span>
            </div>
            <div className="flex gap-4">
              <button style={{ flex: 1, padding: '1rem', background: 'var(--input-bg)', border: 'none', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Google</button>
              <button style={{ flex: 1, padding: '1rem', background: 'var(--input-bg)', border: 'none', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Apple</button>
            </div>
            <p className="mt-10 text-base text-[var(--text-secondary)]">
              Already have an account? <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--text-main)', paddingBottom: '2px', marginLeft: '0.5rem' }}>Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
