import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
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

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0f'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await register(formData.email, formData.password, formData.fullName)
      if (response.message) {
        setSuccessMessage(response.message)
      } else {
        navigate('/app/home')
      }
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    { icon: '💬', text: '24/7 AI Spiritual Guidance' },
    { icon: '📖', text: 'Complete Digital Bible' },
    { icon: '🙏', text: 'Personalized Devotionals' },
    { icon: '🔒', text: 'Private & Secure' }
  ]

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
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Begin your spiritual journey with AI-powered guidance</p>

          {/* Error/Success Messages */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <div className="terms-group">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  I agree to the{' '}
                  <Link to="#" className="auth-link">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="#" className="auth-link">Privacy Policy</Link>
                </span>
              </label>
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
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Benefits */}
      <div className="auth-info-section">
        <div className="auth-info-content">
          <h2 className="info-title">
            Why Join <span className="highlight">Aria</span>?
          </h2>
          <p className="info-desc">
            Experience a revolutionary way to connect with your faith through the power of artificial intelligence.
          </p>

          <div className="benefits-list">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <div className="benefit-icon">{benefit.icon}</div>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="free-badge">
            🎉 <strong>Free to start</strong> — No credit card required
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
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--primary-dark) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
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
          margin-bottom: 2rem;
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
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 1.5rem;
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

        .success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #6ee7b7;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1rem;
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

        .terms-group {
          margin-bottom: 1.25rem;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          color: #a1a1aa;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
          margin-top: 2px;
        }

        .auth-link {
          color: var(--primary);
          text-decoration: none;
        }

        .auth-link:hover {
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
          max-width: 440px;
        }

        .info-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.75rem;
        }

        .highlight {
          color: var(--primary);
        }

        .info-desc {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          color: #e4e4e7;
          transition: all 0.2s;
        }

        .benefit-item:hover {
          border-color: rgba(201, 162, 39, 0.3);
          background: rgba(201, 162, 39, 0.05);
        }

        .benefit-icon {
          width: 40px;
          height: 40px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .free-badge {
          padding: 1rem 1.25rem;
          background: rgba(79, 70, 229, 0.15);
          border: 1px solid rgba(79, 70, 229, 0.3);
          border-radius: 0.75rem;
          text-align: center;
          color: #c7d2fe;
          font-size: 0.95rem;
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
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Register
