import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Mic, BookOpen, Calendar, ArrowRight, Play, Sparkles } from 'lucide-react'
import { AnimatedBackground, ThemeToggle } from '../components/ui/SharedComponents'

export const LandingPage = () => {
  const navigate = useNavigate()
  const heroBgRef = useRef<HTMLDivElement>(null)
  const [navScrolled, setNavScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('product')

  useEffect(() => {
    const handleNavScroll = () => setNavScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleNavScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleNavScroll)
  }, [])

  useEffect(() => {
    const ids = ['product', 'features', 'about']
    const observers = ids.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.25, rootMargin: '-64px 0px 0px 0px' }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  useEffect(() => {
    const handleParallax = () => {
      if (!heroBgRef.current) return
      heroBgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`
    }
    window.addEventListener('scroll', handleParallax, { passive: true })
    return () => window.removeEventListener('scroll', handleParallax)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="relative bg-[var(--bg-main)]">
      <AnimatedBackground />

      <style>{`
        /* Nav */
        .l-nav { animation: l-ld 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes l-ld {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Hero stagger */
        .l-h1 { animation: l-fu .65s .04s cubic-bezier(0.16,1,0.3,1) both; }
        .l-h2 { animation: l-fu .72s .16s cubic-bezier(0.16,1,0.3,1) both; }
        .l-h3 { animation: l-fu .72s .28s cubic-bezier(0.16,1,0.3,1) both; }
        .l-h4 { animation: l-fu .72s .40s cubic-bezier(0.16,1,0.3,1) both; }
        .l-img { animation: l-zi 1s .06s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes l-fu {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes l-zi {
          from { opacity: 0; transform: scale(1.05); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Scroll reveal */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .65s cubic-bezier(0.16,1,0.3,1), transform .65s cubic-bezier(0.16,1,0.3,1);
        }
        [data-reveal].in-view { opacity: 1; transform: translateY(0); }

        /* Nav link underline */
        .l-nl { position: relative; }
        .l-nl::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          width: 0; height: 1.5px; background: currentColor;
          transition: width .22s cubic-bezier(0.16,1,0.3,1);
        }
        .l-nl:hover::after, .l-nl.l-active::after { width: 100%; }

        /* Button hover */
        .l-btn { transition: opacity .18s, transform .18s; }
        .l-btn:hover { opacity: .84; transform: translateY(-1px); }

        /* Feature card hover lift */
        .l-card { transition: transform .28s cubic-bezier(0.16,1,0.3,1), box-shadow .28s; }
        .l-card:hover { transform: translateY(-5px); box-shadow: 0 28px 56px rgba(11,25,44,0.12); }
      `}</style>

      {/* ─── NAV ─── */}
      <nav
        className={`l-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 transition-all duration-300 ${navScrolled ? 'glass-panel' : ''}`}
        style={{
          height: '68px',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: navScrolled ? undefined : 'none',
          background: navScrolled ? undefined : 'linear-gradient(to bottom, rgba(6,14,26,0.45) 0%, transparent 100%)',
        }}
      >
        <button
          className="bg-transparent border-0 p-0 cursor-pointer shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span
            className="font-serif"
            style={{ fontStyle: 'italic', fontSize: '1.75rem', fontWeight: 700, color: navScrolled ? 'var(--brand-solid)' : '#fff' }}
          >
            Aria
          </span>
        </button>

        <div className="hidden md:flex gap-8 text-[0.9rem]">
          {[
            { id: 'product', label: 'The Product' },
            { id: 'features', label: 'Features' },
            { id: 'about', label: 'About' },
          ].map(({ id, label }) => {
            const isActive = activeSection === id
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`l-nl ${isActive ? 'l-active font-semibold' : 'font-medium'}`}
                style={{
                  color: navScrolled
                    ? (isActive ? 'var(--text-main)' : 'var(--text-secondary)')
                    : (isActive ? '#ffffff' : 'rgba(255,255,255,0.55)'),
                }}
              >
                {label}
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            className="l-btn bg-transparent text-[0.875rem] font-semibold cursor-pointer px-4 py-2 rounded-xl"
            style={{
              border: navScrolled ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.35)',
              color: navScrolled ? 'var(--text-main)' : '#fff',
            }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="l-btn border-0 rounded-xl text-[0.875rem] font-semibold cursor-pointer px-5 py-2"
            style={{
              background: navScrolled ? 'var(--brand-solid)' : 'var(--brand-accent)',
              color: navScrolled ? 'var(--bg-main)' : '#0B192C',
            }}
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* ─── HERO — Full-screen centered with parallax ─── */}
      <section
        id="product"
        className="relative overflow-hidden flex items-center justify-center"
        style={{ minHeight: '100dvh' }}
      >
        {/* Parallax background */}
        <div
          ref={heroBgRef}
          className="absolute left-0 right-0 pointer-events-none will-change-transform"
          style={{ top: '-20%', bottom: '-20%' }}
        >
          <img
            src="https://picsum.photos/seed/sanctuary-morning-spiritual/1600/1100"
            className="w-full h-full object-cover object-center"
            alt=""
            aria-hidden="true"
          />
        </div>

        {/* Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(6,14,26,0.55) 0%, rgba(6,14,26,0.42) 45%, rgba(6,14,26,0.80) 100%)' }}
        />

        {/* Centered content */}
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{ padding: '5rem 1.5rem', maxWidth: '800px', width: '100%' }}
        >
          <p className="l-h1 text-[0.7rem] font-bold tracking-[0.24em] uppercase mb-6" style={{ color: 'rgba(255,255,255,0.52)' }}>
            Faith-Based AI Companion
          </p>
          <h1
            className="l-h2 font-serif mb-7"
            style={{
              fontStyle: 'italic',
              fontSize: 'clamp(2.8rem,5.5vw,5.5rem)',
              fontWeight: 700,
              lineHeight: 1.06,
              color: '#ffffff',
            }}
          >
            Begin your Christian journey with Aria
          </h1>
          <p
            className="l-h3 mb-10 leading-[1.72]"
            style={{ fontSize: '1.1rem', maxWidth: '480px', color: 'rgba(255,255,255,0.70)' }}
          >
            Your personal guide for daily devotions, scripture study, and spiritual reflection.
          </p>
          <div className="l-h4 flex gap-4 items-center flex-wrap justify-center">
            <button
              onClick={() => navigate('/register')}
              className="l-btn border-0 rounded-xl font-semibold cursor-pointer"
              style={{ padding: '0.9rem 2.5rem', fontSize: '0.925rem', background: 'var(--brand-accent)', color: '#0B192C' }}
            >
              Start for Free
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="l-btn flex items-center gap-2.5 bg-transparent border-0 text-white text-[0.875rem] font-medium cursor-pointer"
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <Play size={11} fill="currentColor" />
              </span>
              See how it works
            </button>
          </div>
        </div>

        {/* Bottom fade to page background */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: '140px', background: 'linear-gradient(to bottom, transparent, var(--bg-main))' }}
        />
      </section>

      {/* ─── SCRIPTURE STRIP ─── */}
      <div className="relative z-10 py-10 border-t border-b border-[var(--border-color)] text-center">
        <p className="font-serif text-[var(--text-muted)]" style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
          &ldquo;Be still, and know that I am God.&rdquo;
        </p>
        <p className="text-[0.7rem] uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mt-2">
          Psalm 46:10
        </p>
      </div>

      {/* ─── FEATURES BENTO ─── */}
      <section
        id="features"
        className="relative z-10"
        style={{ maxWidth: '1500px', margin: '0 auto', padding: '6rem 1.5rem 8rem', scrollMarginTop: '68px' }}
      >
        <div className="text-center mb-14">
          <h2
            className="font-serif"
            style={{ fontSize: 'clamp(2.25rem,4vw,3.5rem)', color: 'var(--text-main)', marginBottom: '1rem' }}
          >
            Designed for your soul.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
            Four pillars of spiritual growth, guided by AI trained on Scripture.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Bento row 1 */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.65fr_1fr]">
            {/* Emotional Support */}
            <div
              data-reveal
              className="l-card glass-panel rounded-[28px] relative overflow-hidden border border-[var(--border-color)] flex flex-col"
              style={{ minHeight: '420px', padding: '3rem' }}
            >
              <div className="absolute inset-0" style={{ opacity: 0.06 }}>
                <img
                  src="https://picsum.photos/seed/peaceful-reading-light/1200/600"
                  className="w-full h-full object-cover"
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <MessageSquare size={26} color="var(--text-main)" style={{ marginBottom: '2.25rem' }} />
                <h3
                  className="font-serif mb-4"
                  style={{ fontStyle: 'italic', fontSize: '2.5rem', color: 'var(--text-main)', lineHeight: 1.08 }}
                >
                  Emotional Support
                </h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.7, fontSize: '1rem' }}>
                  Share the weight of your day. Aria listens with empathy and responds with comfort rooted in Scripture.
                </p>
                <div
                  className="flex items-center gap-4 mt-auto pt-8 rounded-[14px] self-start bg-[var(--bg-card)]"
                  style={{ padding: '1rem 1.5rem', boxShadow: 'var(--shadow-main)', marginTop: '2.5rem' }}
                >
                  <div className="w-8 h-8 bg-[var(--brand-solid)] rounded-full shrink-0" />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    "Let's look at Philippians 4:6 together..."
                  </span>
                </div>
              </div>
            </div>

            {/* Voice Guidance */}
            <div
              data-reveal
              className="l-card rounded-[28px] flex flex-col items-center justify-center text-center relative overflow-hidden border border-[var(--border-color)]"
              style={{ background: 'var(--brand-accent)', minHeight: '420px', padding: '3rem 2.5rem' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-7"
                style={{ background: 'rgba(255,255,255,0.35)' }}
              >
                <Mic size={28} color="#0B192C" />
              </div>
              <h3 className="font-serif mb-4" style={{ fontSize: '2.25rem', color: '#0B192C', lineHeight: 1.08 }}>
                Real-Time Guidance
              </h3>
              <p style={{ color: 'rgba(11,25,44,0.68)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '2.5rem' }}>
                Deep, instantaneous conversations for theological understanding and spiritual clarity.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="l-btn bg-[#0B192C] text-white border-0 rounded-xl font-semibold cursor-pointer"
                style={{ padding: '0.875rem 2.5rem', fontSize: '0.9rem' }}
              >
                Call Aria
              </button>
            </div>
          </div>

          {/* Bento row 2 */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Bible Study */}
            <div
              data-reveal
              className="l-card rounded-[28px] flex flex-col"
              style={{ background: '#0B192C', minHeight: '380px', padding: '3rem' }}
            >
              <BookOpen size={30} color="var(--brand-accent)" style={{ marginBottom: '2.25rem' }} />
              <h3 className="font-serif mb-4" style={{ fontSize: '2.25rem', color: 'white', lineHeight: 1.08 }}>
                In-Depth Bible Study
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, fontSize: '1rem', marginBottom: 'auto' }}>
                Select any verse for AI-powered explanations covering original context, theology, and historical background.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="l-btn mt-10 flex items-center gap-2.5 bg-transparent border-0 p-0 text-white text-[0.78rem] tracking-[0.14em] uppercase font-semibold cursor-pointer"
              >
                Open a Lesson <ArrowRight size={15} />
              </button>
            </div>

            {/* Daily Devotions */}
            <div
              data-reveal
              className="l-card rounded-[28px] flex overflow-hidden border border-[var(--border-color)]"
              style={{ background: 'var(--bg-card)', minHeight: '380px' }}
            >
              <div className="flex flex-col justify-center" style={{ padding: '3rem', flex: 1 }}>
                <Calendar size={30} color="var(--text-main)" style={{ marginBottom: '2.25rem' }} />
                <h3
                  className="font-serif mb-4"
                  style={{ fontStyle: 'italic', fontSize: '2.25rem', color: 'var(--text-main)', lineHeight: 1.08 }}
                >
                  Daily Devotions
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>
                  Start each morning centred on God with tailor-made prayers and scripture readings.
                </p>
              </div>
              <div className="shrink-0" style={{ width: '250px' }}>
                <img
                  src="https://picsum.photos/seed/forest-path-morning-faith/500/760"
                  className="w-full h-full object-cover"
                  alt="Forest path at dawn"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section
        id="about"
        className="relative z-10 border-t border-[var(--border-color)]"
        style={{ background: 'var(--bg-card)', padding: '7rem 2rem', scrollMarginTop: '68px' }}
      >
        <div className="text-center" style={{ maxWidth: '740px', margin: '0 auto' }}>
          <Sparkles size={38} color="var(--brand-accent)" style={{ marginBottom: '1.75rem' }} />
          <h2
            className="font-serif mb-8"
            style={{ fontSize: 'clamp(2.25rem,4vw,3.5rem)', color: 'var(--text-main)' }}
          >
            Our Mission
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.85, marginBottom: '1.5rem' }}>
            We built Aria with a simple conviction: technology should bring us closer to faith, not push us further away. In a world of noise, Aria is a quiet place.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.85 }}>
            Our team crafted every interaction to be empathetic, biblically grounded, and deeply human. We invite you to experience spiritual growth reimagined.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="l-btn mt-12 bg-[var(--brand-solid)] text-[var(--bg-main)] border-0 rounded-xl text-[0.875rem] font-semibold cursor-pointer"
            style={{ padding: '0.875rem 2.5rem' }}
          >
            Join the Community
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 bg-[var(--bg-main)] border-t border-[var(--border-color)]">
        <div
          className="flex justify-between flex-wrap gap-12"
          style={{ maxWidth: '1500px', margin: '0 auto', padding: '3.5rem 1.5rem' }}
        >
          <div style={{ maxWidth: '260px' }}>
            <span
              className="font-serif block mb-3"
              style={{ fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}
            >
              Aria
            </span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              A digital companion where faith meets intelligence. Nourish the soul, enlighten the mind.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h5 style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '1.25rem', fontWeight: 700 }}>
                Ecosystem
              </h5>
              <div className="flex flex-col gap-3 text-[0.85rem] text-[var(--text-secondary)]">
                <a href="#features" className="l-nl">Emotional Support</a>
                <a href="#features" className="l-nl">Real-Time Chat</a>
                <a href="#features" className="l-nl">Bible Study</a>
                <a href="#features" className="l-nl">Daily Devotion</a>
              </div>
            </div>
            <div>
              <h5 style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '1.25rem', fontWeight: 700 }}>
                Company
              </h5>
              <div className="flex flex-col gap-3 text-[0.85rem] text-[var(--text-secondary)]">
                <a href="#about" className="l-nl">About Us</a>
                <button className="l-nl bg-transparent border-0 p-0 text-[var(--text-secondary)] text-[0.85rem] text-left cursor-pointer">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] text-center py-5">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            &copy; {new Date().getFullYear()} Aria. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
