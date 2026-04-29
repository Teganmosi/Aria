import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, MessageSquare, Mic, BookOpen, Calendar, ArrowRight, Play, Moon, Sun, CheckCircle2 } from 'lucide-react'

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.dataset.theme = 'dark'
    } else {
      setIsDark(false)
      delete document.documentElement.dataset.theme
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      delete document.documentElement.dataset.theme
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.dataset.theme = 'dark'
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export const AnimatedBackground = () => (
  <div className="animated-bg">
    <div className="bg-orb orb-1"></div>
    <div className="bg-orb orb-2"></div>
  </div>
)

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 8rem', position: 'sticky', top: 0, zIndex: 50, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '2rem', fontWeight: 700, color: 'var(--brand-solid)' }}>Aria</span>
        </button>

        <div style={{ display: 'flex', gap: '4rem', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          <a href="#product" style={{ color: 'var(--text-main)', fontWeight: 500 }}>The Product</a>
          <a href="#features">Features</a>
          <a href="#about">About Us</a>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <ThemeToggle />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 1rem' }}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'var(--brand-solid)', color: 'var(--bg-main)', border: 'none', borderRadius: '2rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: '0.625rem 1.5rem', transition: 'transform 0.2s' }}
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section (The Product) */}
      <section id="product" style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '10rem 4rem 8rem' }}>
        <p style={{ fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2rem' }}>Welcome to your sanctuary</p>
        <h1 className="font-serif" style={{ fontSize: '5.5rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          Begin your Christian journey with Aria
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
          Experience a faith-based AI companion bridging the gap between eternal wisdom and modern intelligence. Aria is designed to guide your daily devotions, provide deep emotional support, and navigate the scriptures with you.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{ background: 'var(--brand-solid)', color: 'var(--text-inverse)', padding: '1rem 2rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'transform 0.2s' }}>
            Start Prayer
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 500, cursor: 'pointer' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'var(--border-subtle)', borderRadius: '50%' }}>
              <Play size={16} fill="var(--text-main)" />
            </span>
            {'See how it works'}
          </button>
        </div>
      </section>

      <div style={{ textAlign: 'center', margin: '2rem 0 6rem', position: 'relative', zIndex: 10 }}>
        <p className="font-serif" style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{"\"Be still, and know that I am God.\""}</p>
      </div>

      {/* Bento Grid (Features) */}
      <section id="features" style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 4rem 10rem', position: 'relative', zIndex: 10, scrollMarginTop: '8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h2 className="font-serif" style={{ fontSize: '3.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Designed for your soul.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Aria leverages advanced AI to provide four pillars of spiritual growth tailored entirely to you.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-panel" style={{ background: 'var(--gradient-card)', borderRadius: '32px', padding: '4rem', position: 'relative', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ position: 'absolute', top: '4rem', left: '4rem' }}>
              <MessageSquare style={{ color: 'var(--text-main)' }} size={28} />
            </div>
            <div style={{ zIndex: 1, marginTop: '3rem' }}>
              <h3 className="font-serif" style={{ fontStyle: 'italic', fontSize: '3rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Emotional Support</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, fontSize: '1.1rem' }}>Share your feelings and the weight of your day. Aria listens with empathy, providing comfort and practical guidance rooted deeply in scripture to help you find peace.</p>
            </div>
            <div style={{ position: 'absolute', bottom: '3rem', left: '4rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-card)', padding: '1.25rem 2rem', borderRadius: '16px', boxShadow: 'var(--shadow-main)' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--brand-solid)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{"\"I understand you're anxious. Let's look at Philippians 4:6...\""}</span>
            </div>
          </div>

          <div style={{ background: 'var(--brand-accent)', borderRadius: '32px', padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
              <Mic size={32} color="#0B192C" />
            </div>
            <h3 className="font-serif" style={{ fontSize: '2.5rem', color: '#0B192C', marginBottom: '1.5rem' }}>Real-Time Guidance</h3>
            <p style={{ color: 'rgba(11, 25, 44, 0.7)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: 1.6 }}>Engage in deep, instantaneous conversational chats for profound theological understanding.</p>
            <button onClick={() => navigate('/register')} style={{ background: '#0B192C', color: 'white', padding: '1rem 3rem', borderRadius: '8px', border: 'none', fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }}>Call Aria</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          <div style={{ background: 'var(--brand-solid)', borderRadius: '32px', padding: '4rem', color: 'var(--text-inverse)', display: 'flex', flexDirection: 'column' }}>
            <BookOpen size={36} style={{ marginBottom: '2.5rem' }} color="var(--brand-accent)" />
            <h3 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>In-Depth Bible Study</h3>
            <p style={{ color: 'inherit', opacity: 0.7, marginBottom: '4rem', lineHeight: 1.6, fontSize: '1.1rem' }}>Select any verse to receive AI-powered explanations. Uncover original context, theology, and historical background instantly.</p>
            <button
              style={{
                marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem',
                fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', background: 'none', border: 'none', padding: 0,
                color: 'inherit', fontWeight: 'inherit'
              }}
              onClick={() => navigate('/register')}
            >
              OPEN LESSON <ArrowRight size={20} />
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '0', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ padding: '4rem', flex: 1 }}>
              <Calendar size={36} color="var(--text-main)" style={{ marginBottom: '2.5rem' }} />
              <h3 className="font-serif" style={{ fontStyle: 'italic', fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Daily Devotions</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.1rem' }}>Start your day centered on God. Share your upcoming plans and receive tailor-made prayers and scripture readings to set your spirit right.</p>
            </div>
            <div style={{ flex: '0 0 320px', background: 'var(--bg-alt)' }}>
              <img
                src={"https://images.unsplash.com/photo-1492447105260-2e947425b5cc?q=80&w=600&auto=format&fit=crop"}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Forest path"
              />
            </div>
          </div>
        </div>
      </section>


      {/* About Us Section */}
      <section id="about" style={{ background: 'var(--bg-card)', padding: '8rem 4rem', position: 'relative', zIndex: 10, borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Sparkles size={48} color="var(--brand-accent-hover)" style={{ marginBottom: '2rem' }} />
          <h2 className="font-serif" style={{ fontSize: '3.5rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.8, marginBottom: '2rem' }}>
            We developed Aria with a profound belief: Technology should not distance us from our faith; it should bring us closer to it. In a world full of noise, Aria was built to be a quiet place—a digital companion.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.8 }}>
            Our team of technologists and theologians carefully crafted every interaction to be empathetic, biblically accurate, and deeply reflective. We invite you to join us in making spiritual growth more accessible than ever before.
          </p>
          <button onClick={() => navigate('/register')} style={{ marginTop: '3rem', background: 'transparent', border: '2px solid var(--border-color)', color: 'var(--text-main)', padding: '1rem 3rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Join the Community</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 6rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', position: 'relative', zIndex: 10, background: 'var(--bg-main)' }}>
        <div style={{ width: '300px' }}>
          <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '1rem' }}>Aria</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>Crafting a digital companion where faith meets modern intelligence. Designed to nourish the soul and enlighten the mind.</p>
        </div>

        <div style={{ display: 'flex', gap: '6rem' }}>
          <div>
            <h5 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Ecosystem</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <a href="#features">Emotional Support</a>
              <a href="#features">Real-Time Chat</a>
              <a href="#features">Bible Study</a>
              <a href="#features">Daily Devotion</a>
            </div>
          </div>
          <div>
            <h5 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Company</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <a href="#about">About Us</a>
              <button
                onClick={() => { }}
                style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontSize: 'inherit', textAlign: 'left', cursor: 'pointer' }}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
