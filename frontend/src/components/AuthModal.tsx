import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuth from '../hooks/useAuth'
import { authModalSchema, type AuthModalFormData } from '../schemas/auth'

export const AuthModal = () => {
  const { showAuthModal, login, register: authRegister } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthModalFormData>({ resolver: zodResolver(authModalSchema) })

  if (!showAuthModal) return null

  const onSubmit = async (values: AuthModalFormData) => {
    setServerError('')
    try {
      if (isLoginMode) {
        await login(values.email, values.password)
      } else {
        await authRegister(values.email, values.password, values.fullName ?? '')
      }
      reset()
    } catch (err) {
      setServerError((err as Error).message || 'Authentication failed')
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setServerError('')
    reset()
  }

  return (
    <dialog className="modal show">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isLoginMode ? 'Welcome to Aria' : 'Create Account'}</h2>
        </div>
        <div className="modal-body">
          {serverError && <div className="error-message" role="alert">{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="modal-email">Email</label>
              <input
                id="modal-email"
                type="email"
                placeholder="your@email.com"
                className="input"
                {...register('email')}
              />
              {errors.email && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="modal-password">Password</label>
              <input
                id="modal-password"
                type="password"
                placeholder="••••••••"
                className="input"
                {...register('password')}
              />
              {errors.password && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
            </div>
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="modal-fullName">Full Name</label>
                <input
                  id="modal-fullName"
                  type="text"
                  placeholder="John Doe"
                  className="input"
                  {...register('fullName')}
                />
                {errors.fullName && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.fullName.message}</p>}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? <span className="loading" aria-hidden="true" />
                : (isLoginMode ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          <div className="auth-switch">
            <span>{isLoginMode ? "Don't have an account?" : 'Already have an account?'}</span>
            <button type="button" className="toggle-btn" onClick={toggleMode}>
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

