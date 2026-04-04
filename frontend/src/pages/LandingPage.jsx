import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Sparkles, BookOpen, Heart, MessageCircle, ArrowRight, ChevronDown, Check } from 'lucide-react'

// Simple animated background with floating orbs - minimal animation
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="bg-container">
      <div 
        className="orb orb-1"
        style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
      />
      <div 
        className="orb orb-2"
        style={{ transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` }}
      />
      <div className="grid-overlay" />
    </div>
  )
}

const LandingPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [activeFaq, setActiveFaq] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  
  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0f'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])
  
  const features = [
    {
      icon: <MessageCircle size={24} />,
      title: 'AI Spiritual Guide',
      description: 'Chat with an AI companion about faith, scripture, and life\'s questions.'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Digital Bible',
      description: 'Access the complete Bible with searchable verses and AI-powered insights.'
    },
    {
      icon: <Heart size={24} />,
      title: 'Emotional Support',
      description: 'Find comfort and encouragement during difficult times with compassionate AI.'
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Daily Devotion',
      description: 'Start your day with personalized prayers and scripture reflections.'
    }
  ]

  const faqs = [
    {
      question: 'How does Aria work?',
      answer: 'Aria uses advanced AI to have natural conversations about faith and scripture. It combines technology with biblical wisdom to provide personalized guidance.'
    },
    {
      question: 'Is my data private?',
      answer: 'Yes. Your conversations are encrypted and we never share your personal data. You can delete your data at any time.'
    },
    {
      question: 'Is there a free plan?',
      answer: 'Yes! Our free tier includes 5 AI conversations per day and basic Bible search. No credit card required.'
    }
  ]

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail('')
    }
  }

  return (
    <div className="landing-page">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/')}>
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <span className="brand-name">Aria</span>
          </div>
          
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </div>
          
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Your AI Spiritual Companion</span>
          </div>
          
          <h1 className="hero-title">
            Where Faith Meets{' '}
            <span className="gradient-text">Artificial Intelligence</span>
          </h1>
          
          <p className="hero-subtitle">
            Experience your faith in a new dimension. Have meaningful conversations, 
            study scripture with AI insights, and find spiritual guidance whenever you need it.
          </p>
          
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">AI Available</span>
            </div>
            <div className="stat">
              <span className="stat-value">66+</span>
              <span className="stat-label">Bible Books</span>
            </div>
            <div className="stat">
              <span className="stat-value">Free</span>
              <span className="stat-label">To Start</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2>Everything You Need for Your Spiritual Journey</h2>
            <p>Powerful features designed to deepen your faith in the digital age.</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Begin Your Spiritual Journey Today</h2>
            <p>Join thousands who have discovered a new way to connect with their faith. Start for free.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Create Free Account <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <ChevronDown size={20} className="faq-icon" />
                </div>
                {activeFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Stay Connected</h3>
              <p>Get weekly spiritual insights and updates</p>
            </div>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              {isSubscribed ? (
                <div className="subscribed-message">
                  <Check size={20} /> Thanks for subscribing!
                </div>
              ) : (
                <>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">Subscribe</button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-brand">
            <div className="nav-brand">
              <div className="brand-icon">
                <Sparkles size={20} />
              </div>
              <span className="brand-name">Aria</span>
            </div>
            <p>Pioneering the intersection of faith and technology.</p>
          </div>
          
          <div className="footer-bottom">
            <p>© 2024 Aria. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
          overflow-x: hidden;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: var(--bg-dark) !important;
          color: var(--text);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
        }

        .landing-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow-x: hidden;
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
          filter: blur(80px);
          opacity: 0.4;
          transition: transform 0.3s ease-out;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--primary-dark) 0%, transparent 70%);
          top: -200px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(100, 100, 150, 0.3) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .container {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
          box-sizing: border-box;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .nav-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: var(--primary-light);
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
        }

        /* Buttons */
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.95rem;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #0a0a0f;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--primary-light), var(--primary));
          transform: translateY(-1px);
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .btn-lg {
          padding: 1rem 1.75rem;
          font-size: 1rem;
        }

        /* Hero */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
        }

        .hero-content {
          text-align: center;
          max-width: 700px;
          width: 100%;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 2rem;
          color: var(--primary-light);
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 50%, var(--primary-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          to { background-position: 200% center; }
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          line-height: 1.7;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .hero-stats {
          display: flex;
          gap: 3rem;
          justify-content: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--primary);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* Features */
        .features {
          position: relative;
          z-index: 1;
          padding: 6rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          width: 100%;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-tag {
          display: inline-block;
          padding: 0.4rem 0.9rem;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 2rem;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-header h2 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.75rem;
          transition: all 0.2s;
        }

        .feature-card:hover {
          border-color: rgba(201, 162, 39, 0.3);
          transform: translateY(-2px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 1.25rem;
        }

        .feature-card h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* CTA */
        .cta {
          position: relative;
          z-index: 1;
          padding: 6rem 2rem;
          width: 100%;
        }

        .cta-content {
          text-align: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 4rem 2rem;
        }

        .cta-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .cta-content p {
          color: var(--text-muted);
          font-size: 1.1rem;
          margin-bottom: 2rem;
          max-width: 450px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* FAQ */
        .faq {
          position: relative;
          z-index: 1;
          padding: 6rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          width: 100%;
        }

        .faq-list {
          max-width: 700px;
          margin: 0 auto;
        }

        .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }

        .faq-item:hover {
          border-color: rgba(201, 162, 39, 0.2);
        }

        .faq-item.active {
          border-color: rgba(201, 162, 39, 0.3);
        }

        .faq-question {
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
        }

        .faq-icon {
          transition: transform 0.2s;
          color: var(--text-muted);
        }

        .faq-item.active .faq-icon {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 1.5rem 1.25rem;
        }

        .faq-answer p {
          color: var(--text-muted);
          line-height: 1.7;
        }

        /* Newsletter */
        .newsletter {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          width: 100%;
        }

        .newsletter-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .newsletter-text h3 {
          margin-bottom: 0.25rem;
        }

        .newsletter-text p {
          color: var(--text-muted);
        }

        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }

        .newsletter-form input {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: white;
          outline: none;
          width: 220px;
        }

        .newsletter-form input::placeholder {
          color: var(--text-muted);
        }

        .subscribed-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #22c55e;
        }

        /* Footer */
        .footer {
          position: relative;
          z-index: 1;
          padding: 3rem 2rem;
          background: #050507;
          width: 100%;
        }

        .footer-brand {
          margin-bottom: 1.5rem;
        }

        .footer-brand p {
          color: var(--text-muted);
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .footer-bottom {
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .hero-stats {
            gap: 1.5rem;
          }

          .newsletter-content {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            width: 100%;
            flex-direction: column;
          }

          .newsletter-form input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default LandingPage
