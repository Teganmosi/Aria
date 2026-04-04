import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MessageSquare, 
  BookOpen, 
  Heart, 
  Sun, 
  Sparkles,
  Clock,
  Flame,
  Lightbulb,
  HeartHandshake,
  Loader2
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { homeService, prayerService } from '../services/api'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

// Simple animated background
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="home-bg">
      <div 
        className="bg-orb orb-1"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      />
      <div 
        className="bg-orb orb-2"
        style={{ transform: `translate(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px)` }}
      />
    </div>
  )
}

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [prayerInput, setPrayerInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [homeData, setHomeData] = useState({
    user: { name: 'Believer' },
    verse_of_day: { verse: '', reference: '' },
    activity: [],
    stats: { streak: 0, time_today_minutes: 0, verses_saved: 0 },
    recent_prayers: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setIsLoading(true)
      const data = await homeService.getHomeData()
      setHomeData(data)
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    {
      icon: <MessageSquare size={24} />,
      title: 'Chat with Aria',
      description: 'Have a spiritual conversation',
      path: '/app/ai-chat',
      color: '#6366f1'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Read the Bible',
      description: 'Explore scripture',
      path: '/app/bible',
      color: '#8b5cf6'
    },
    {
      icon: <Heart size={24} />,
      title: 'Emotional Support',
      description: 'Find comfort & guidance',
      path: '/app/emotional-support',
      color: '#ec4899'
    },
    {
      icon: <Sun size={24} />,
      title: 'Daily Devotion',
      description: 'Start your day with God',
      path: '/app/devotion',
      color: '#f59e0b'
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'bible_study': return <BookOpen size={18} />
      case 'support': return <Heart size={18} />
      case 'devotion': return <Sun size={18} />
      default: return <MessageSquare size={18} />
    }
  }

  const handlePrayerSubmit = async () => {
    if (prayerInput.trim()) {
      setIsSubmitting(true)
      try {
        await prayerService.createPrayer({ content: prayerInput })
        await fetchHomeData()
        setPrayerInput('')
      } catch (error) {
        console.error('Error submitting prayer:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const userName = homeData.user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Believer'

  if (isLoading) {
    return (
      <div className="home-page">
        <AnimatedBackground />
        <div className="loading-container">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <AnimatedBackground />
      
      <div className="home-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-text">
            <p className="greeting">{getGreeting()},</p>
            <h1>{userName}!</h1>
            <p className="welcome-subtitle">Welcome to your spiritual home. How can we walk with you today?</p>
          </div>
        </section>

        {/* Daily Verse Card */}
        <section className="verse-section">
          <div className="verse-card">
            <div className="verse-header">
              <Sparkles size={18} />
              <span>Verse of the Day</span>
            </div>
            <blockquote className="verse-text">
              "{homeData.verse_of_day?.verse || 'Loading verse...'}"
            </blockquote>
            <cite className="verse-reference">— {homeData.verse_of_day?.reference || '...'}</cite>
            <button 
              className="verse-btn"
              onClick={() => navigate('/app/bible-study')}
            >
              <Lightbulb size={16} />
              Study this verse
            </button>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="actions-section">
          <h2 className="section-title">How would you like to connect?</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="action-card"
                style={{ '--action-color': action.color }}
                onClick={() => navigate(action.path)}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-info">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="home-columns">
          {/* Continue Learning */}
          <section className="continue-section">
            <h2 className="section-title">Continue Where You Left Off</h2>
            {homeData.activity && homeData.activity.length > 0 ? (
              <div className="continue-list">
                {homeData.activity.map((item, index) => (
                  <button
                    key={index}
                    className="continue-item"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="continue-icon">{getActivityIcon(item.type)}</div>
                    <div className="continue-info">
                      <span className="continue-title">{item.title}</span>
                      <span className="continue-subtitle">{item.subtitle}</span>
                    </div>
                    <span className="continue-time">{getRelativeTime(item.created_at)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-activity">
                <p>Start your spiritual journey today!</p>
                <p className="empty-hint">Use any of the features above to begin.</p>
              </div>
            )}
          </section>

          {/* Prayer Section */}
          <section className="prayer-section">
            <h2 className="section-title">What's on your heart?</h2>
            <div className="prayer-card">
              <div className="prayer-icon">
                <HeartHandshake size={28} />
              </div>
              <textarea
                className="prayer-input"
                placeholder="Share your thoughts, prayers, or reflections with God..."
                value={prayerInput}
                onChange={(e) => setPrayerInput(e.target.value)}
                rows={3}
              />
              <button 
                className="prayer-btn"
                onClick={handlePrayerSubmit}
                disabled={isSubmitting || !prayerInput.trim()}
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                Send Prayer
              </button>
              {homeData.recent_prayers && homeData.recent_prayers.length > 0 && (
                <div className="recent-prayers">
                  <p className="recent-title">Recent Prayers:</p>
                  {homeData.recent_prayers.slice(0, 2).map((prayer, idx) => (
                    <div key={idx} className="prayer-preview">
                      <p>{prayer.content.substring(0, 50)}{prayer.content.length > 50 ? '...' : ''}</p>
                      <span className="prayer-time">{getRelativeTime(prayer.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Stats Strip */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <Flame size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{homeData.stats?.streak || 0} day streak</span>
                <span className="stat-label">Keep going!</span>
              </div>
            </div>
            <div className="stat-item">
              <Clock size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{homeData.stats?.time_today_minutes || 0} min today</span>
                <span className="stat-label">Time in app</span>
              </div>
            </div>
            <div className="stat-item">
              <BookOpen size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{homeData.stats?.verses_saved || 0} verses</span>
                <span className="stat-label">Saved this week</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .home-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .home-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
          transition: transform 0.2s ease-out;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          top: -150px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
        }

        .home-content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
          color: var(--primary);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Welcome Section */
        .welcome-section {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .welcome-text h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0.25rem 0 0.5rem;
        }

        .greeting {
          color: var(--text-muted);
          margin: 0;
        }

        .welcome-subtitle {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }

        /* Verse Section */
        .verse-section {
          margin-bottom: 1.5rem;
        }

        .verse-card {
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .verse-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        .verse-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #e4e4e7;
          margin: 0 0 0.5rem;
          font-style: italic;
        }

        .verse-reference {
          display: block;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .verse-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: #0a0a0f;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .verse-btn:hover {
          background: #d4a017;
        }

        /* Actions Section */
        .actions-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 1rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-card);
          text-align: left;
        }

        .action-card:hover {
          border-color: var(--action-color);
          transform: translateY(-2px);
        }

        .action-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--action-color);
          flex-shrink: 0;
        }

        .action-info h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 0.2rem;
          color: var(--text);
        }

        .action-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Two Column Layout */
        .home-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .home-columns {
            grid-template-columns: 1fr;
          }
        }

        /* Continue Section */
        .continue-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .continue-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .continue-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .continue-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--border);
        }

        .continue-icon {
          width: 36px;
          height: 36px;
          background: rgba(99, 102, 241, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }

        .continue-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .continue-title {
          font-weight: 600;
          color: var(--text);
          font-size: 0.9rem;
        }

        .continue-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .continue-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .empty-activity {
          text-align: center;
          padding: 1.5rem;
          color: var(--text-muted);
        }

        .empty-activity p {
          margin: 0;
        }

        .empty-hint {
          font-size: 0.85rem;
          margin-top: 0.25rem !important;
        }

        /* Prayer Section */
        .prayer-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .prayer-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .prayer-icon {
          width: 56px;
          height: 56px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
          margin-bottom: 0.75rem;
        }

        .prayer-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          resize: none;
          font-family: inherit;
          margin-bottom: 0.75rem;
          color: var(--text);
          transition: border-color 0.2s;
        }

        .prayer-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .prayer-input::placeholder {
          color: var(--text-muted);
        }

        .prayer-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: #0a0a0f;
          border: none;
          padding: 0.625rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .prayer-btn:hover:not(:disabled) {
          background: #d4a017;
        }

        .prayer-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .recent-prayers {
          width: 100%;
          margin-top: 0.75rem;
          text-align: left;
        }

        .recent-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          margin: 0 0 0.5rem;
        }

        .prayer-preview {
          background: rgba(255, 255, 255, 0.03);
          padding: 0.5rem;
          border-radius: 6px;
          margin-bottom: 0.35rem;
          border: 1px solid var(--border);
        }

        .prayer-preview p {
          margin: 0;
          font-size: 0.8rem;
          color: #e4e4e7;
        }

        .prayer-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Stats Section */
        .stats-section {
          margin-bottom: 1rem;
        }

        .stats-grid {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-icon {
          color: var(--primary);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-weight: 700;
          color: var(--text);
          font-size: 0.9rem;
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .welcome-section {
            padding: 1.5rem;
          }

          .welcome-text h1 {
            font-size: 1.5rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Home
