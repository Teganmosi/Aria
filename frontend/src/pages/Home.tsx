// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Book, Heart, Flame, MessageSquare,
  Settings, Bookmark, ArrowRight, Quote, AlignLeft,
  BookOpen, ChevronRight, CheckCircle2, Volume2, VolumeX
} from 'lucide-react'
import { notesService, ttsService } from '../services/api'
import { toast } from 'sonner'
import { useHomeData } from '../hooks/use-home-data'
import { useAuthStore } from '../store/auth-store'
import { BurningFlame } from '../components/ui/BurningFlame'
import { StreakCelebration } from '../components/ui/StreakCelebration'

import './Home.css'

const getInitials = (name) => {
  if (!name) return 'U'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// --- Sub-components matching the Mockup ---

const FaithStreak = ({ days, streak }) => {
  const today = new Date()
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayIndex = today.getDay()

  // Calculate Sunday of current week
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-[var(--shadow-main)] min-h-[180px] border border-[var(--border-color)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[var(--bg-alt)] rounded-xl flex items-center justify-center overflow-visible">
          <BurningFlame size="sm" intensity={1} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>YOUR STREAK</p>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>{streak} Day Streak</h4>
        </div>
      </div>
      <div className="faith-streak-days flex justify-between mb-4">
        {dayLabels.map((day, i) => {
          const isCompleted = days && days[i]
          const currentDay = new Date(sunday)
          currentDay.setDate(sunday.getDate() + i)
          const displayDate = currentDay.getDate()

          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>{day}</span>
              <div
                className="streak-day"
                style={{
                  background: isCompleted ? 'var(--brand-accent)' : (i === todayIndex ? 'var(--text-main)' : 'var(--input-bg)'),
                  color: isCompleted ? 'var(--text-inverse)' : (i === todayIndex ? 'var(--bg-main)' : 'var(--text-muted)'),
                }}
              >
                {displayDate}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ActionCard = ({ icon: Icon, title, subtitle, background, onClick }) => (
  <div className="action-card" style={{ background }} onClick={onClick}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
      <Icon size={20} color="#fff" />
    </div>
    <div className="flex-1">
      <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>
    </div>
    <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
  </div>
)

const JourneyCard = ({ icon: Icon, tag, time, title, desc, progress, onClick }) => (
  <div className="journey-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="flex justify-between items-start">
      <div className="w-12 h-12 bg-[var(--bg-alt)] rounded-[14px] flex items-center justify-center">
        <Icon size={24} color="var(--brand-accent)" />
      </div>
      {tag && <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--brand-accent)', background: 'var(--bg-alt)', padding: '0.4rem 0.8rem', borderRadius: '20px', letterSpacing: '0.05em' }}>{tag}</span>}
      {time && <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{time}</span>}
    </div>
    <div>
      <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '1.25rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif" }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
    {progress !== undefined && (
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
        <div className="flex justify-between mb-2" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          <span>PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div className="h-[6px] bg-[var(--bg-alt)] rounded-[3px]">
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--brand-accent)', borderRadius: '3px' }} />
        </div>
      </div>
    )}
  </div>
)

export const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [greeting, setGreeting] = useState('GOOD DAY')
  const [isSaved, setIsSaved] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mannaPlaying, setMannaPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Maps stored user voices to YarnGPT voice names
  const FRONTEND_VOICE_MAP = {
    alloy: 'Osagie',
    ash: 'Jude',
    ballad: 'Femi',
    coral: 'Adaora',
    echo: 'Umar',
    sage: 'Osagie',
    stella: 'Wura',
    verse: 'Idera',
  }

  const { data: homeData } = useHomeData()
  const stats = homeData?.stats ?? { streak_days: 0, streak_history: [false, false, false, false, false, false, false] }
  const activities = homeData?.activity ?? []

  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (homeData?.stats) {
      const todayIdx = new Date().getDay()
      const todayCompleted = homeData.stats.streak_history?.[todayIdx] === true
      if (todayCompleted) {
        const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local format
        const celebratedDate = localStorage.getItem('aria_streak_celebrated_date')
        if (celebratedDate !== todayStr) {
          setShowCelebration(true)
          localStorage.setItem('aria_streak_celebrated_date', todayStr)
        }
      }
    }
  }, [homeData])
  const verseObj = homeData?.verse_of_day ?? {
    verse: 'The LORD is my shepherd; I shall not want.',
    reference: 'Psalm 23:1',
    insight: 'Take a moment to rest in the assurance that your every need is seen and provided for by a Shepherd who knows you by name.'
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting('GOOD MORNING')
    else if (hour >= 12 && hour < 17) setGreeting('GOOD AFTERNOON')
    else setGreeting('GOOD EVENING')
  }, [])

  // Helper to get relative time
  const getRelativeTime = (dateStr) => {
    const now = new Date()
    const past = new Date(dateStr)
    const diffMs = now - past
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60))
    if (diffHrs < 1) return 'JUST NOW'
    if (diffHrs < 24) return `${diffHrs}H AGO`
    return `${Math.round(diffHrs / 24)}D AGO`
  }

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleSaveManna = async () => {
    if (isSaved || !verseObj.daily_manna) return
    const manna = verseObj.daily_manna
    const mannaText = typeof manna === 'object'
      ? `${manna.title}\n\nReflection: ${manna.reflection}\n\nPrayer: ${manna.prayer}\n\nApplication: ${manna.application}`
      : manna
    try {
      await notesService.createNote({
        title: typeof manna === 'object' ? manna.title : "Daily Manna Prayer",
        content: mannaText,
        source_type: 'devotion',
        tags: ['manna', 'prayer', 'daily', verseObj.reference]
      })
      setIsSaved(true)
    } catch (err) {
      console.error('Home: failed to save manna to devotions:', err)
      toast.error('Could not save to your devotions. Please try again.')
    }
  }

  const toggleMannaAudio = useCallback(async () => {
    if (mannaPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setMannaPlaying(false)
      return
    }
    const manna = verseObj.daily_manna
    if (!manna) return
    const text = typeof manna === 'object'
      ? `${manna.title}. ${manna.reflection} ${manna.prayer} Today's application: ${manna.application}`
      : manna

    try {
      const userVoice = user?.aria_voice || 'verse'
      const voice = FRONTEND_VOICE_MAP[userVoice] || 'Idera'
      const url = await ttsService.getSpeechUrl(text, voice)

      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setMannaPlaying(false)
      }
      audio.onerror = () => {
        setMannaPlaying(false)
      }

      await audio.play()
      setMannaPlaying(true)
    } catch (err) {
      console.error("Manna TTS playback error:", err)
      setMannaPlaying(false)
    }
  }, [mannaPlaying, verseObj.daily_manna, user?.aria_voice])

  return (
    <div className="home-container">
      <StreakCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        streakCount={stats.streak_days}
      />
      {/* Header */}
      <div className="home-header">
        <div>
          <p className="home-greeting">{greeting}, {(user?.full_name ?? 'SANCTUARY').split(' ')[0].toUpperCase()}</p>
          <h1 className="home-title" style={{ fontSize: isMobile ? '2rem' : '3.5rem' }}>Let's walk in faith today.</h1>
        </div>
      </div>

      {/* Top Feature Grid */}
      <div className="top-feature-grid">
        {/* Quote Card */}
        <div className="top-feature-quote bg-[var(--bg-card)] rounded-3xl shadow-[var(--shadow-main)] border border-[var(--border-color)] relative overflow-hidden" style={{ padding: isMobile ? '1.5rem' : '2.5rem' }}>
          <Quote size={isMobile ? 24 : 40} color="var(--brand-accent)" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <p style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', lineHeight: '1.4', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: '0 0 1.5rem' }}>
            "{verseObj.verse}"
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-accent)', letterSpacing: '0.1em' }}>- {verseObj.reference.toUpperCase()}</p>

          <div style={{ marginTop: isMobile ? '1.5rem' : '2.5rem', paddingTop: isMobile ? '1.5rem' : '2.5rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand-accent)', letterSpacing: '0.2em' }}>ARIA INSIGHT</p>
            <p style={{ margin: 0, fontSize: isMobile ? '0.85rem' : '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {verseObj.insight}
            </p>
          </div>
        </div>

        {/* Right Stack */}
        <div className="top-feature-stack flex flex-col gap-6">
          <FaithStreak streak={stats.streak_days} days={stats.streak_history} />
          <ActionCard icon={MessageSquare} title="Guided Presence" subtitle="Start a Conversation" background="#0B192C" onClick={() => navigate('/app/ai-chat')} />
          <ActionCard icon={Bookmark} title="Deep Reflection" subtitle="Begin Devotion" background="var(--brand-accent)" onClick={() => navigate('/app/devotion')} />
          <ActionCard icon={BookOpen} title="The Living Word" subtitle="Open Bible" background="var(--input-bg)" onClick={() => navigate('/app/bible')} />
        </div>
      </div>

      {/* Spiritual Journey */}
      <div className="mb-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>YOUR JOURNEY</p>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif" }}>Continuing the Path</h3>
          </div>
          <p onClick={() => navigate('/app/activity')} style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>VIEW ALL</p>
        </div>

        <div className="journey-grid">
          {activities.length > 0 ? activities.slice(0, 4).map((activity, idx) => (
            <JourneyCard
              key={activity.id || idx}
              icon={activity.type === 'bible_study' ? Book : (activity.type === 'support' || activity.type === 'chat' ? MessageSquare : (activity.type === 'devotion' ? Bookmark : Sparkles))}
              time={getRelativeTime(activity.created_at)}
              title={activity.title}
              desc={activity.subtitle}
              onClick={() => navigate(activity.path)}
              style={{ cursor: 'pointer' }}
            />
          )) : (
            <div
              className="flex flex-col items-center justify-center text-center rounded-[28px] border border-dashed border-[var(--border-color)]"
              style={{ padding: '3.5rem 2rem', gridColumn: '1 / -1' }}
            >
              <Sparkles size={28} color="var(--brand-solid)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif" }}>
                Your journey begins here
              </h4>
              <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px', lineHeight: 1.6 }}>
                Start a conversation, open a Bible study, or begin today's devotion — your sessions will appear here.
              </p>
              <button
                onClick={() => navigate('/app/ai-chat')}
                className="l-btn border-0 rounded-xl font-semibold cursor-pointer"
                style={{ padding: '0.75rem 2rem', fontSize: '0.875rem', background: 'var(--brand-solid)', color: 'var(--bg-main)' }}
              >
                Start a Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Manna */}
      <div className="daily-manna-container">
        {/* Header row */}
        <div className="daily-manna-header flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="daily-manna-icon bg-[var(--brand-accent)] flex items-center justify-center">
              <Sparkles size={24} color="var(--text-inverse)" />
            </div>
            <div>
              <p className="daily-manna-category">DAILY MANNA</p>
              {typeof verseObj.daily_manna === 'object' && verseObj.daily_manna?.title && (
                <h3 className="daily-manna-title font-serif">
                  {verseObj.daily_manna.title}
                </h3>
              )}
            </div>
          </div>
          <button
            onClick={toggleMannaAudio}
            title={mannaPlaying ? 'Stop' : 'Listen'}
            className={`daily-manna-audio-btn ${mannaPlaying ? 'playing' : ''}`}
          >
            {mannaPlaying
              ? <VolumeX size={18} color="var(--text-inverse)" />
              : <Volume2 size={18} color="var(--text-secondary)" />}
          </button>
        </div>

        {/* Sections */}
        {typeof verseObj.daily_manna === 'object' && verseObj.daily_manna ? (
          <div className="daily-manna-sections flex flex-col">
            {/* Reflection */}
            <div className="manna-section reflection-section">
              <p className="manna-section-label">REFLECTION</p>
              <p className="manna-section-content">
                {verseObj.daily_manna.reflection}
              </p>
            </div>

            {/* Prayer */}
            <div className="manna-section prayer-section">
              <p className="manna-section-label font-serif">PRAYER</p>
              <p className="manna-section-content font-serif italic">
                {verseObj.daily_manna.prayer}
              </p>
            </div>

            {/* Application */}
            <div className="manna-section application-section">
              <p className="manna-section-label">TODAY'S APPLICATION</p>
              <p className="manna-section-content">
                {verseObj.daily_manna.application}
              </p>
            </div>
          </div>
        ) : (
          <h2 className="daily-manna-text font-serif">
            "{typeof verseObj.daily_manna === 'string' ? verseObj.daily_manna : "Grant me the grace to see Your hand in the mundane today, and the courage to follow where You lead."}"
          </h2>
        )}

        {/* Save button */}
        <div className="daily-manna-save-container flex justify-center">
          <button
            onClick={handleSaveManna}
            disabled={isSaved}
            className={`daily-manna-save-btn flex items-center gap-2 ${isSaved ? 'saved' : ''}`}
          >
            {isSaved && <CheckCircle2 size={16} />}
            {isSaved ? 'SAVED TO JOURNAL' : 'SAVE TO DEVOTIONS'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
