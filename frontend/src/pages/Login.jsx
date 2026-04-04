import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import useAuth from '../hooks/useAuth'

// Simple animated background
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="bg-container">
      <div 
        className="orb orb-1"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      />
      <div 
        className="orb orb-2"
        style={{ transform: `translate(${-mousePosition.x * 0.7}px, ${-mousePosition.y * 0.7}px)` }}
      />
    </div>
  )
}

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0f'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

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
    <div className="auth-page">
      <AnimatedBackground />
      
      {/* Left Panel - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          {/* Brand */}
          <div className="auth-brand" onClick={() => navigate('/')}>
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <span className="brand-name">Aria</span>
          </div>

          {/* Welcome Text */}
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Continue your spiritual journey with AI-powered guidance</p>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? (
                <span className="loading-spinner" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Info */}
      <div className="auth-info-section">
        <div className="auth-info-content">
          <blockquote className="auth-quote">
            "Faith is taking the first step even when you don't see the whole staircase."
            <cite>— Martin Luther King Jr.</cite>
          </blockquote>

          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <span>AI Spiritual Conversations</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📖</div>
              <span>Digital Bible Access</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">❤️</div>
              <span>Emotional Support</span>
            </div>
          </div>

          <div className="auth-stats">
            <div className="stat-item">
              <span className="stat-value">50K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">2M+</span>
              <span className="stat-label">Conversations</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">4.9</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --primary: #c9a227;
          --primary-light: #e6c455;
          --primary-dark: #a68520;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          background: var(--bg-dark);
          position: relative;
          overflow: hidden;
        }

        .bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          transition: transform 0.2s ease-out;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%);
          top: -150px;
          left: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--primary-dark) 0%, transparent 70%);
          bottom: -100px;
          right: -100px;
        }

        .auth-form-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 2rem;
        }

        .auth-form-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          cursor: pointer;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        .auth-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .error-message {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #fca5a5;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          color: #d4d4d8;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0 1rem;
          transition: all 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(201, 162, 39, 0.5);
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .input-icon {
          color: #71717a;
          flex-shrink: 0;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 1rem;
          color: var(--text);
          font-size: 1rem;
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: #52525b;
        }

        .password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #71717a;
          display: flex;
          align-items: center;
        }

        .password-toggle:hover {
          color: var(--text-muted);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #a1a1aa;
          font-size: 0.9rem;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
        }

        .forgot-link {
          color: var(--primary);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .forgot-link:hover {
          color: var(--primary-light);
        }

        .btn {
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #0a0a0f;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-light), var(--primary));
        }

        .btn-full {
          width: 100%;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer-text {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--text-muted);
        }

        .auth-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover {
          color: var(--primary-light);
        }

        /* Right Panel */
        .auth-info-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 3rem;
          background: rgba(20, 20, 25, 0.5);
          border-left: 1px solid var(--border);
        }

        .auth-info-content {
          max-width: 420px;
        }

        .auth-quote {
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          color: #e0e7ff;
          font-size: 1.1rem;
          font-style: italic;
          line-height: 1.6;
        }

        .auth-quote cite {
          display: block;
          margin-top: 1rem;
          color: #818cf8;
          font-style: normal;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #d4d4d8;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .auth-stats {
          display: flex;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .auth-info-section {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .auth-form-section {
            padding: 1.5rem;
          }

          .auth-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
