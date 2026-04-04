import { useState } from 'react'
import useAuth from '../hooks/useAuth'

const AuthModal = () => {
  const { showAuthModal, login, register } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!showAuthModal) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isLoginMode) {
        await login(email, password)
      } else {
        await register(email, password, fullName)
      }
      setEmail('')
      setPassword('')
      setFullName('')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setError('')
  }

  return (
    <div className="modal show">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isLoginMode ? 'Welcome to Aria' : 'Create Account'}</h2>
        </div>
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input"
              />
            </div>
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="input"
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <span className="loading"></span> : (isLoginMode ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          <p className="auth-switch">
            <span>{isLoginMode ? "Don't have an account?" : 'Already have an account?'}</span>
            <button type="button" className="toggle-btn" onClick={toggleMode}>
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
