// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Book, Heart, Flame, MessageSquare,
  Settings, Bookmark, ArrowRight, Quote, AlignLeft,
  BookOpen, ChevronRight, CheckCircle2, Volume2, VolumeX
} from 'lucide-react'
import { notesService, ttsService } from '../services/api'
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
          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>FAITH STREAK</p>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>{streak} Day Streak</h4>
        </div>
      </div>
      <div className="flex justify-between mb-4">
        {dayLabels.map((day, i) => {
          const isCompleted = days && days[i]
          const currentDay = new Date(sunday)
          currentDay.setDate(sunday.getDate() + i)
          const displayDate = currentDay.getDate()

          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>{day}</span>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: isCompleted ? 'var(--brand-accent)' : (i === todayIndex ? 'var(--text-main)' : 'var(--input-bg)'),
                color: isCompleted ? 'var(--text-inverse)' : (i === todayIndex ? 'var(--bg-main)' : 'var(--text-muted)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
              }}>
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
  const stats = homeData?.stats ?? { streak_days: 7, streak_history: [true, true, true, true, true, true, false] }
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
    } catch { }
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
        <div className="flex gap-6 items-center">
          <Settings
            size={22}
            color="var(--text-main)"
            className="cursor-pointer"
            onClick={() => navigate('/app/profile')}
          />
          <div
            className="w-11 h-11 rounded-full bg-[var(--bg-alt)] overflow-hidden border-2 border-[var(--bg-card)] shadow-[var(--shadow-main)] cursor-pointer"
            onClick={() => navigate('/app/profile')}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-[var(--text-secondary)]" style={{ fontSize: '0.9rem' }}>
                {getInitials(user?.full_name)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Feature Grid */}
      <div className="top-feature-grid">
        {/* Quote Card */}
        <div className="bg-[var(--bg-card)] rounded-3xl shadow-[var(--shadow-main)] border border-[var(--border-color)] relative overflow-hidden" style={{ padding: isMobile ? '1.5rem' : '2.5rem' }}>
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
        <div className="flex flex-col gap-6">
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
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>YOUR SPIRITUAL JOURNEY</p>
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
            <>
              <JourneyCard
                icon={AlignLeft}
                tag="IN PROGRESS"
                title="The Life of David"
                desc="Exploring leadership, failure, and the heart after God. You are currently on Session 4: Facing Goliaths."
                progress={70}
              />
              <JourneyCard
                icon={MessageSquare}
                time="JUST NOW"
                title="Finding Peace"
                desc="Waiting for your first spiritual session to begin."
              />
            </>
          )}
        </div>
      </div>

      {/* Bottom Manna */}
      <div className="bg-[var(--gradient-card)] rounded-[40px] border border-[var(--border-color)] shadow-[var(--shadow-main)]" style={{ padding: isMobile ? '2.5rem 1.5rem' : '4rem 5rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="w-[52px] h-[52px] bg-[var(--brand-accent)] rounded-[16px] flex items-center justify-center" style={{ boxShadow: '0 8px 20px rgba(245, 206, 77, 0.2)', flexShrink: 0 }}>
              <Sparkles size={24} color="var(--text-inverse)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>DAILY MANNA</p>
              {typeof verseObj.daily_manna === 'object' && verseObj.daily_manna?.title && (
                <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.4rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                  {verseObj.daily_manna.title}
                </h3>
              )}
            </div>
          </div>
          <button
            onClick={toggleMannaAudio}
            title={mannaPlaying ? 'Stop' : 'Listen'}
            style={{
              background: mannaPlaying ? 'var(--brand-accent)' : 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {mannaPlaying
              ? <VolumeX size={18} color="var(--text-inverse)" />
              : <Volume2 size={18} color="var(--text-secondary)" />}
          </button>
        </div>

        {/* Sections */}
        {typeof verseObj.daily_manna === 'object' && verseObj.daily_manna ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Reflection */}
            <div style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--brand-accent)', letterSpacing: '0.2em' }}>REFLECTION</p>
              <p style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                {verseObj.daily_manna.reflection}
              </p>
            </div>

            {/* Prayer */}
            <div style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--input-bg)', borderLeft: '3px solid var(--brand-accent)' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--brand-accent)', letterSpacing: '0.2em' }}>PRAYER</p>
              <p style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', lineHeight: 1.75, color: 'var(--text-main)', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                {verseObj.daily_manna.prayer}
              </p>
            </div>

            {/* Application */}
            <div style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>TODAY'S APPLICATION</p>
              <p style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {verseObj.daily_manna.application}
              </p>
            </div>
          </div>
        ) : (
          <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif", lineHeight: 1.6, margin: '0 0 2.5rem' }}>
            "{typeof verseObj.daily_manna === 'string' ? verseObj.daily_manna : "Grant me the grace to see Your hand in the mundane today, and the courage to follow where You lead."}"
          </h2>
        )}

        {/* Save button */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSaveManna}
            disabled={isSaved}
            style={{
              background: isSaved ? '#10b981' : 'var(--text-main)',
              color: 'var(--bg-main)',
              border: 'none',
              padding: '1.1rem 2.75rem',
              borderRadius: '50px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              cursor: isSaved ? 'default' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
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
