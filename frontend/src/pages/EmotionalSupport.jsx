import { useState, useEffect, useRef } from 'react'
import { Heart, Sparkles, Play, ArrowRight, HeartHandshake, Mic, Moon, Sun, Cloud, Send } from 'lucide-react'
import { AnimatedBackground } from './LandingPage'
import { aiService } from '../services/api'

const SITUATIONS = [
  { id: 'anxious', label: 'Seeking Peace', description: 'When the world feels loud', icon: <Moon size={24} />, color: '#8b5cf6' },
  { id: 'lonely', label: 'Feeling Alone', description: 'Finding companionship in faith', icon: <Heart size={24} />, color: '#ec4899' },
  { id: 'struggle', label: 'Overcoming', description: 'Strength for the hard days', icon: <Cloud size={24} />, color: '#3b82f6' },
  { id: 'faith', label: 'Faith Questions', description: 'Seeking clarity & light', icon: <Sparkles size={24} />, color: '#10b981' },
  { id: 'thankful', label: 'Gratitude', description: 'Giving thanks for life', icon: <Sun size={24} />, color: '#f59e0b' },
  { id: 'other', label: 'Just Talk', description: 'A safe space to share', icon: <HeartHandshake size={24} />, color: '#6b7280' },
]

const EmotionalSupport = () => {
  const [mode, setMode] = useState('select')
  const [selectedSituation, setSelectedSituation] = useState(null)
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startCompanion = async () => {
    if (!selectedSituation) return

    setIsLoading(true)
    setMode('companion')

    const situationInfo = SITUATIONS.find(s => s.id === selectedSituation)

    // Initial prompt for the AI to be warm and pastoral
    const initialPrompt = `User is coming to you seeking support for: ${situationInfo.label}. 
    As a compassionate faith companion, greet them warmly and invite them to share what's on their heart. 
    Use a comforting, empathetic tone. Keep it to 1-2 sentences.`

    try {
      const response = await aiService.generate(
        [{ role: 'user', content: initialPrompt }],
        'emotionalSupport'
      )
      setMessages([{ role: 'assistant', content: response.content }])
    } catch (err) {
      setMessages([{
        role: 'assistant',
        content: `I'm so glad you're here. 🕊️ You don't have to carry this alone. Please share whatever is on your heart today, I am listening.`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!userMessage.trim()) return

    const userMsg = userMessage.trim()
    setUserMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const response = await aiService.generate(
        [...messages, { role: 'user', content: userMsg }],
        'emotionalSupport'
      )
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here with you, friend. Please tell me more, I'm listening." }])
    } finally {
      setIsLoading(false)
    }
  }

  const selectedSituationInfo = SITUATIONS.find(s => s.id === selectedSituation)

  return (
    <div style={{ minHeight: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AnimatedBackground />

      {/* Header */}
      <header style={{ padding: '2.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 500 }}>Faith Companion</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>A sanctuary for your heart's unspoken words.</p>
        </div>
        {mode === 'companion' && (
          <button
            onClick={() => setMode('select')}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
            NEW REfLECTION
          </button>
        )}
      </header>

      {mode === 'select' ? (
        <div style={{ flex: 1, padding: '0 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>

          <div style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '4rem' }}>
            <h2 className="font-serif" style={{ fontSize: '3rem', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              How does your <span style={{ fontStyle: 'italic' }}>soul</span> feel today?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Select a path for our conversation. Whether you need strength, peace, or just someone to listen, your sanctuary is ready.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', width: '100%', maxWidth: '900px', marginBottom: '4rem' }}>
            {SITUATIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSituation(s.id)}
                style={{
                  background: selectedSituation === s.id ? 'var(--bg-card)' : 'var(--bg-alt)',
                  border: selectedSituation === s.id ? '2px solid var(--brand-solid)' : '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedSituation === s.id ? 'var(--shadow-main)' : 'none',
                  transform: selectedSituation === s.id ? 'translateY(-5px)' : 'none'
                }}
              >
                <div style={{
                  width: '50px', height: '50px', background: `${s.color}25`, borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
                  color: s.color
                }}>
                  {s.icon}
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{s.label}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={startCompanion}
            disabled={!selectedSituation || isLoading}
            style={{
              padding: '1.25rem 4rem', borderRadius: '3rem', border: 'none',
              background: 'var(--brand-solid)', color: 'var(--bg-main)',
              fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer',
              opacity: !selectedSituation ? 0.5 : 1, transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'PREPARING SANCTUARY...' : 'BEGIN REFLECTION'}
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>

          {/* Chat View */}
          <div style={{ flex: 1, padding: '0 4rem 14rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ alignSelf: 'center', textAlign: 'center', marginBottom: '3rem', maxWidth: '500px' }}>
              <div style={{ color: selectedSituationInfo?.color, marginBottom: '1rem' }}>{selectedSituationInfo?.icon}</div>
              <h4 style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800 }}>NOW REFLECTING ON</h4>
              <p className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontStyle: 'italic' }}>{selectedSituationInfo?.label}</p>
            </div>

            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                <div style={{
                  padding: '1.5rem 1.75rem',
                  borderRadius: '1.75rem',
                  background: msg.role === 'user' ? 'var(--brand-solid)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'var(--bg-main)' : 'var(--text-main)',
                  boxShadow: msg.role === 'assistant' ? 'var(--shadow-main)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  fontSize: '1.1rem',
                  lineHeight: 1.7,
                  position: 'relative'
                }} className={msg.role === 'assistant' ? 'font-serif' : ''}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1rem' }}>
                Aria is listening...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Floating Input Area */}
          <div style={{ position: 'fixed', bottom: '3rem', left: 'auto', right: 'auto', padding: '0 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100, width: 'calc(100% - 240px - 4rem)' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '900px' }}>
              <input
                type="text"
                placeholder="Share what is on your soul..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  width: '100%',
                  padding: '1.75rem 2rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '24px',
                  fontSize: '1.1rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-lg)',
                  backdropFilter: 'blur(20px)'
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'var(--brand-solid)', border: 'none', color: 'var(--bg-main)',
                  width: '50px', height: '50px', borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Send size={20} />
              </button>
            </div>
            <p style={{ marginTop: '1.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              TAKE YOUR TIME. YOUR HEART HAS A SAFE PLACE HERE.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmotionalSupport
