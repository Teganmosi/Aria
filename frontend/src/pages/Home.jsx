import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Book, Heart, Flame, MessageSquare,
  Settings, Bookmark, ArrowRight, Quote, AlignLeft,
  BookOpen, ChevronRight, CheckCircle2
} from 'lucide-react'
import { homeService, authService } from '../services/api'

import './Home.css'

// --- Sub-components matching the Mockup ---

const FaithStreak = ({ days, streak }) => {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayIndex = new Date().getDay()

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '1.5rem', boxShadow: 'var(--shadow-main)', minHeight: '180px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--bg-alt)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={20} color="var(--brand-accent)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>FAITH STREAK</p>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>{streak} Day Streak</h4>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        {dayLabels.map((day, i) => {
          const isCompleted = days && days[i]
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>{day}</span>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: isCompleted ? 'var(--brand-accent)' : (i === todayIndex ? 'var(--text-main)' : 'var(--input-bg)'),
                color: isCompleted ? 'var(--text-inverse)' : (i === todayIndex ? 'var(--bg-main)' : 'var(--text-muted)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
              }}>
                {i + 14}
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
    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} color="#fff" />
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>
    </div>
    <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
  </div>
)

const JourneyCard = ({ icon: Icon, tag, time, title, desc, progress, onClick }) => (
  <div className="journey-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: '48px', height: '48px', background: 'var(--bg-alt)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          <span>PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-alt)', borderRadius: '3px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--brand-accent)', borderRadius: '3px' }} />
        </div>
      </div>
    )}
  </div>
)

const Home = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    streak_days: 7,
    streak_history: [true, true, true, true, true, true, false]
  })
  const [user, setUser] = useState({ full_name: 'SANCTUARY' })
  const [greeting, setGreeting] = useState('GOOD DAY')
  const [activities, setActivities] = useState([])
  const [verseObj, setVerseObj] = useState({
    verse: 'The LORD is my shepherd; I shall not want.',
    reference: 'Psalm 23:1',
    insight: 'Take a moment to rest in the assurance that your every need is seen and provided for by a Shepherd who knows you by name.'
  })

  useEffect(() => {
    // Set dynamic greeting based on time
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting('GOOD MORNING')
    else if (hour >= 12 && hour < 17) setGreeting('GOOD AFTERNOON')
    else setGreeting('GOOD EVENING')

    const fetchData = async () => {
      try {
        // Fetch home data (stats, activity, verse)
        const data = await homeService.getHomeData()
        if (data.stats) setStats(data.stats)
        if (data.verse_of_day) setVerseObj(data.verse_of_day)
        if (data.activity) setActivities(data.activity)

        // Fetch real user name
        const userData = await authService.getMe()
        if (userData && userData.full_name) setUser(userData)
      } catch (e) {
        console.error('Failed to fetch dashboard data', e)
      }
    }
    fetchData()
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

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <div>
          <p className="home-greeting">{greeting}, {user.full_name?.split(' ')[0].toUpperCase()}</p>
          <h1 className="home-title">Let's walk in faith today.</h1>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Settings size={22} color="var(--text-main)" style={{ cursor: 'pointer' }} />
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-alt)', overflow: 'hidden', border: '2px solid var(--bg-card)', boxShadow: 'var(--shadow-main)' }}>
            <img src="https://i.pravatar.cc/150?u=aria" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
          </div>
        </div>
      </div>

      {/* Top Feature Grid */}
      <div className="top-feature-grid">
        {/* Quote Card */}
        <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '24px', boxShadow: 'var(--shadow-main)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
          <Quote size={40} color="var(--brand-accent)" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <p style={{ fontSize: '1.75rem', lineHeight: '1.4', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: '0 0 1.5rem' }}>
            "{verseObj.verse}"
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-accent)', letterSpacing: '0.1em' }}>- {verseObj.reference.toUpperCase()}</p>

          <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand-accent)', letterSpacing: '0.2em' }}>ARIA INSIGHT</p>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {verseObj.insight}
            </p>
          </div>
        </div>

        {/* Right Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FaithStreak streak={stats.streak_days} days={stats.streak_history} />
          <ActionCard icon={MessageSquare} title="Guided Presence" subtitle="Start a Conversation" background="#0B192C" onClick={() => navigate('/app/ai-chat')} />
          <ActionCard icon={Bookmark} title="Deep Reflection" subtitle="Begin Devotion" background="var(--brand-accent)" onClick={() => navigate('/app/devotion')} />
          <ActionCard icon={BookOpen} title="The Living Word" subtitle="Open Bible" background="var(--input-bg)" onClick={() => navigate('/app/bible')} />
        </div>
      </div>

      {/* Spiritual Journey */}
      <div style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>YOUR SPIRITUAL JOURNEY</p>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif" }}>Continuing the Path</h3>
          </div>
          <p onClick={() => navigate('/app/activity')} style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>VIEW ALL</p>
        </div>

        <div className="journey-grid">
          {activities.length > 0 ? activities.slice(0, 2).map((activity, idx) => (
            <JourneyCard
              key={activity.id || idx}
              icon={activity.type === 'bible_study' ? Book : (activity.type === 'support' ? MessageSquare : Sparkles)}
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
      <div style={{
        background: 'var(--gradient-card)', borderRadius: '40px', padding: 'var(--manna-padding, 5rem)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-main)'
      }}>
        <div style={{ width: '60px', height: '60px', background: 'var(--brand-accent)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 8px 20px rgba(245, 206, 77, 0.2)' }}>
          <Sparkles size={28} color="var(--text-inverse)" />
        </div>
        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>DAILY MANNA</p>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif", maxWidth: '600px', lineHeight: 1.6, marginBottom: '3rem' }}>
          "Grant me the grace to see Your hand in the mundane today, and the courage to follow where You lead."
        </h2>
        <button style={{
          background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', padding: '1.25rem 3rem', borderRadius: '50px',
          fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.3s'
        }}>
          SAVE TO DEVOTIONS
        </button>
      </div>
    </div>
  )
}

export default Home
