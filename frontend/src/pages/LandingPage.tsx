import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, MessageSquare, Mic, BookOpen, Calendar, ArrowRight, Play, CheckCircle2 } from 'lucide-react'
import { AnimatedBackground, ThemeToggle } from '../components/ui/SharedComponents'

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen z-[1]">
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="glass-panel flex justify-between items-center px-32 py-8 sticky top-0 z-50" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <button
          className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="font-serif" style={{ fontStyle: 'italic', fontSize: '2rem', fontWeight: 700, color: 'var(--brand-solid)' }}>Aria</span>
        </button>

        <div className="flex gap-16 text-[1.05rem] text-[var(--text-secondary)]">
          <a href="#product" className="text-[var(--text-main)] font-medium">The Product</a>
          <a href="#features">Features</a>
          <a href="#about">About Us</a>
        </div>

        <div className="flex gap-6 items-center">
          <ThemeToggle />
          <div className="flex gap-4 items-center ml-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-transparent border-0 text-[var(--text-main)] text-[0.95rem] font-semibold cursor-pointer px-4 py-2"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-[var(--brand-solid)] text-[var(--bg-main)] border-0 rounded-[2rem] text-[0.95rem] font-semibold cursor-pointer transition-transform duration-200"
              style={{ padding: '0.625rem 1.5rem' }}
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section (The Product) */}
      <section id="product" className="relative z-10 text-center" style={{ padding: '10rem 4rem 8rem' }}>
        <p style={{ fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2rem' }}>Welcome to your sanctuary</p>
        <h1 className="font-serif" style={{ fontSize: '5.5rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          Begin your Christian journey with Aria
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
          Experience a faith-based AI companion bridging the gap between eternal wisdom and modern intelligence. Aria is designed to guide your daily devotions, provide deep emotional support, and navigate the scriptures with you.
        </p>

        <div className="flex gap-6 justify-center items-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-[var(--brand-solid)] text-[var(--text-inverse)] rounded-lg border-0 text-base font-medium cursor-pointer transition-transform duration-200"
            style={{ padding: '1rem 2rem' }}>
            Start Prayer
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-3 bg-transparent border-0 text-[var(--text-main)] text-base font-medium cursor-pointer"
          >
            <span className="flex items-center justify-center w-9 h-9 bg-[var(--border-subtle)] rounded-full">
              <Play size={16} fill="var(--text-main)" />
            </span>
            {'See how it works'}
          </button>
        </div>
      </section>

      <div className="text-center my-8 mb-24 relative z-10">
        <p className="font-serif" style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{"\"Be still, and know that I am God.\""}</p>
      </div>

      {/* Bento Grid (Features) */}
      <section id="features" className="relative z-10" style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 4rem 10rem', scrollMarginTop: '8rem' }}>
        <div className="text-center mb-24">
          <h2 className="font-serif" style={{ fontSize: '3.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Designed for your soul.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Aria leverages advanced AI to provide four pillars of spiritual growth tailored entirely to you.</p>
        </div>

        <div className="grid mb-10" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '2.5rem' }}>
          <div className="glass-panel bg-[var(--gradient-card)] rounded-[32px] relative overflow-hidden min-h-[400px] flex flex-col justify-center border border-[var(--border-color)]" style={{ padding: '4rem' }}>
            <div className="absolute top-16 left-16">
              <MessageSquare style={{ color: 'var(--text-main)' }} size={28} />
            </div>
            <div className="z-[1] mt-12">
              <h3 className="font-serif" style={{ fontStyle: 'italic', fontSize: '3rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Emotional Support</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, fontSize: '1.1rem' }}>Share your feelings and the weight of your day. Aria listens with empathy, providing comfort and practical guidance rooted deeply in scripture to help you find peace.</p>
            </div>
            <div className="absolute bottom-12 left-16 flex items-center gap-6 bg-[var(--bg-card)] rounded-[16px] shadow-[var(--shadow-main)]" style={{ padding: '1.25rem 2rem' }}>
              <div className="w-10 h-10 bg-[var(--brand-solid)] rounded-full"></div>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{"\"I understand you're anxious. Let's look at Philippians 4:6...\""}</span>
            </div>
          </div>

          <div className="bg-[var(--brand-accent)] rounded-[32px] text-center flex flex-col items-center justify-center border border-[var(--border-color)]" style={{ padding: '4rem' }}>
            <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-10" style={{ background: 'rgba(255,255,255,0.4)' }}>
              <Mic size={32} color="#0B192C" />
            </div>
            <h3 className="font-serif" style={{ fontSize: '2.5rem', color: '#0B192C', marginBottom: '1.5rem' }}>Real-Time Guidance</h3>
            <p style={{ color: 'rgba(11, 25, 44, 0.7)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: 1.6 }}>Engage in deep, instantaneous conversational chats for profound theological understanding.</p>
            <button onClick={() => navigate('/register')} className="bg-[#0B192C] text-white rounded-lg border-0 font-medium text-base cursor-pointer" style={{ padding: '1rem 3rem' }}>Call Aria</button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          <div className="bg-[var(--brand-solid)] rounded-[32px] flex flex-col" style={{ padding: '4rem', color: 'var(--text-inverse)' }}>
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

          <div className="bg-[var(--bg-card)] rounded-[32px] flex overflow-hidden border border-[var(--border-color)]" style={{ padding: 0 }}>
            <div className="flex-1" style={{ padding: '4rem' }}>
              <Calendar size={36} color="var(--text-main)" style={{ marginBottom: '2.5rem' }} />
              <h3 className="font-serif" style={{ fontStyle: 'italic', fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Daily Devotions</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.1rem' }}>Start your day centered on God. Share your upcoming plans and receive tailor-made prayers and scripture readings to set your spirit right.</p>
            </div>
            <div className="shrink-0 bg-[var(--bg-alt)]" style={{ flex: '0 0 320px' }}>
              <img
                src={"https://images.unsplash.com/photo-1492447105260-2e947425b5cc?q=80&w=600&auto=format&fit=crop"}
                className="w-full h-full object-cover"
                alt="Forest path"
              />
            </div>
          </div>
        </div>
      </section>


      {/* About Us Section */}
      <section id="about" className="bg-[var(--bg-card)] relative z-10 border-t border-[var(--border-color)]" style={{ padding: '8rem 4rem' }}>
        <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Sparkles size={48} color="var(--brand-accent-hover)" style={{ marginBottom: '2rem' }} />
          <h2 className="font-serif" style={{ fontSize: '3.5rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.8, marginBottom: '2rem' }}>
            We developed Aria with a profound belief: Technology should not distance us from our faith; it should bring us closer to it. In a world full of noise, Aria was built to be a quiet place—a digital companion.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.8 }}>
            Our team of technologists and theologians carefully crafted every interaction to be empathetic, biblically accurate, and deeply reflective. We invite you to join us in making spiritual growth more accessible than ever before.
          </p>
          <button onClick={() => navigate('/register')} className="mt-12 bg-transparent border-2 border-[var(--border-color)] text-[var(--text-main)] rounded-lg text-base font-semibold cursor-pointer" style={{ padding: '1rem 3rem' }}>Join the Community</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex justify-between flex-wrap relative z-10 bg-[var(--bg-main)] border-t border-[var(--border-color)]" style={{ padding: '4rem 6rem' }}>
        <div style={{ width: '300px' }}>
          <span className="font-serif block mb-4" style={{ fontStyle: 'italic', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Aria</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>Crafting a digital companion where faith meets modern intelligence. Designed to nourish the soul and enlighten the mind.</p>
        </div>

        <div className="flex gap-24">
          <div>
            <h5 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Ecosystem</h5>
            <div className="flex flex-col gap-4 text-[0.85rem] text-[var(--text-secondary)]">
              <a href="#features">Emotional Support</a>
              <a href="#features">Real-Time Chat</a>
              <a href="#features">Bible Study</a>
              <a href="#features">Daily Devotion</a>
            </div>
          </div>
          <div>
            <h5 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Company</h5>
            <div className="flex flex-col gap-4 text-[0.85rem] text-[var(--text-secondary)]">
              <a href="#about">About Us</a>
              <button
                onClick={() => { }}
                className="bg-transparent border-0 p-0 text-[var(--text-secondary)] text-[0.85rem] text-left cursor-pointer"
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
