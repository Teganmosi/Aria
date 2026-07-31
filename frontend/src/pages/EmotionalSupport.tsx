// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { Heart, Sparkles, Play, ArrowRight, HeartHandshake, Mic, Moon, Sun, Cloud, Send } from 'lucide-react'
import { AnimatedBackground } from '../components/ui/SharedComponents'
import { aiService, emotionalSupportService } from '../services/api'

const SITUATIONS = [
  { id: 'anxious', label: 'Seeking Peace', description: 'When the world feels loud', icon: <Moon size={24} />, color: '#8b5cf6' },
  { id: 'lonely', label: 'Feeling Alone', description: 'Finding companionship in faith', icon: <Heart size={24} />, color: '#ec4899' },
  { id: 'struggle', label: 'Overcoming', description: 'Strength for the hard days', icon: <Cloud size={24} />, color: '#3b82f6' },
  { id: 'faith', label: 'Faith Questions', description: 'Seeking clarity & light', icon: <Sparkles size={24} />, color: '#10b981' },
  { id: 'thankful', label: 'Gratitude', description: 'Giving thanks for life', icon: <Sun size={24} />, color: '#f59e0b' },
  { id: 'other', label: 'Just Talk', description: 'A safe space to share', icon: <HeartHandshake size={24} />, color: '#6b7280' },
]

export const EmotionalSupport = () => {
  const [mode, setMode] = useState('select')
  const [selectedSituation, setSelectedSituation] = useState(null)
  const [messages, setMessages] = useState<{role:string;content:string}[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const startCompanion = async () => {
    if (!selectedSituation) return

    setIsLoading(true)
    setMode('companion')

    const situationInfo = SITUATIONS.find(s => s.id === selectedSituation)

    const initialPrompt = `User is coming to you seeking support for: ${situationInfo.label}.
    As a compassionate faith companion, greet them warmly and invite them to share what's on their heart.
    Use a comforting, empathetic tone. Keep it to 1-2 sentences.`

    try {
      const session = await emotionalSupportService.createSession(
        situationInfo.label,
        situationInfo.description
      )
      setSessionId(session.id)

      const response = await aiService.generate(
        [{ role: 'user', content: initialPrompt }],
        'emotionalSupport'
      )

      const aiWelcome = response.content
      setMessages([{ role: 'assistant', content: aiWelcome }])

      await emotionalSupportService.createMessage(session.id, 'assistant', aiWelcome)

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
      if (sessionId) {
        await emotionalSupportService.createMessage(sessionId, 'user', userMsg)
      }

      const response = await aiService.generate(
        [...messages, { role: 'user', content: userMsg }],
        'emotionalSupport'
      )

      const aiResponse = response.content
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

      if (sessionId) {
        await emotionalSupportService.createMessage(sessionId, 'assistant', aiResponse)
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here with you, friend. Please tell me more, I'm listening." }])
    } finally {
      setIsLoading(false)
    }
  }

  const selectedSituationInfo = SITUATIONS.find(s => s.id === selectedSituation)

  return (
    <div className="min-h-full relative flex flex-col overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header style={{ padding: isMobile ? '1.5rem 1rem' : '2.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0' }}>
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <h1 className="font-serif" style={{ fontSize: isMobile ? '1.5rem' : '2rem', color: 'var(--text-main)', fontWeight: 500 }}>Faith Companion</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>A sanctuary for your heart's unspoken words.</p>
        </div>
        {mode === 'companion' && (
          <button
            onClick={() => setMode('select')}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '2rem', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer' }}>
            NEW REFLECTION
          </button>
        )}
      </header>

      {mode === 'select' ? (
        <div style={{ flex: 1, padding: isMobile ? '0 1rem 2rem' : '0 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>

          <div style={{ textAlign: 'center', maxWidth: '700px', marginBottom: isMobile ? '2rem' : '4rem', paddingLeft: isMobile ? '0.5rem' : '0', paddingRight: isMobile ? '0.5rem' : '0' }}>
            <h2 className="font-serif" style={{ fontSize: isMobile ? '1.75rem' : '3rem', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.2 }}>
              How does your <span style={{ fontStyle: 'italic' }}>soul</span> feel today?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.95rem' : '1.1rem', lineHeight: 1.6 }}>
              Select a path for our conversation. Whether you need strength, peace, or just someone to listen, your sanctuary is ready.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1rem' : '1.5rem', width: '100%', maxWidth: '900px', marginBottom: isMobile ? '2rem' : '4rem' }}>
            {SITUATIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSituation(s.id)}
                style={{
                  background: selectedSituation === s.id ? 'var(--bg-card)' : 'var(--bg-alt)',
                  border: selectedSituation === s.id ? '2px solid var(--brand-solid)' : '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: isMobile ? '1.25rem' : '2rem',
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
                  width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px', background: `${s.color}25`, borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '0.75rem' : '1.25rem',
                  color: s.color
                }}>
                  {s.icon}
                </div>
                <h3 className="font-serif" style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{s.label}</h3>
                <p style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', color: 'var(--text-secondary)' }}>{s.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={startCompanion}
            disabled={!selectedSituation || isLoading}
            style={{
              padding: isMobile ? '1rem 2.5rem' : '1.25rem 4rem', borderRadius: '3rem', border: 'none',
              background: 'var(--brand-solid)', color: 'var(--bg-main)',
              fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 600, cursor: 'pointer',
              opacity: !selectedSituation ? 0.5 : 1, transition: 'all 0.2s',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            {isLoading ? 'PREPARING SANCTUARY...' : 'BEGIN REFLECTION'}
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>

          {/* Chat View */}
          <div style={{ flex: 1, padding: isMobile ? '0 1rem 10rem' : '0 4rem 14rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '2rem' }}>
            <div style={{ alignSelf: 'center', textAlign: 'center', marginBottom: isMobile ? '1.5rem' : '3rem', maxWidth: '500px', paddingLeft: isMobile ? '0.5rem' : '0', paddingRight: isMobile ? '0.5rem' : '0' }}>
              <div style={{ color: selectedSituationInfo?.color, marginBottom: '0.75rem' }}>{selectedSituationInfo?.icon}</div>
              <h4 style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 800 }}>NOW REFLECTING ON</h4>
              <p className="font-serif" style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', color: 'var(--text-main)', fontStyle: 'italic' }}>{selectedSituationInfo?.label}</p>
            </div>

            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: isMobile ? '85%' : '70%', width: '100%' }}>
                <div style={{
                  padding: isMobile ? '1rem 1.25rem' : '1.5rem 1.75rem',
                  borderRadius: isMobile ? '1.25rem' : '1.75rem',
                  background: msg.role === 'user' ? 'var(--brand-solid)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'var(--bg-main)' : 'var(--text-main)',
                  boxShadow: msg.role === 'assistant' ? 'var(--shadow-main)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  lineHeight: 1.7,
                  position: 'relative'
                }} className={msg.role === 'assistant' ? 'font-serif' : ''}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 2rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                Aria is listening...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Floating Input Area */}
          <div style={{ position: 'fixed', bottom: isMobile ? '1rem' : '3rem', left: isMobile ? '0.5rem' : 'auto', right: isMobile ? '0.5rem' : 'auto', padding: isMobile ? '0 0.5rem' : '0 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100, width: isMobile ? 'calc(100% - 1rem)' : '100%' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '900px' }}>
              <input
                type="text"
                placeholder={isMobile ? "Share your thoughts..." : "Share what is on your soul..."}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  width: '100%',
                  padding: isMobile ? '1.25rem 3rem 1.25rem 1.25rem' : '1.75rem 2rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '24px',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-lg)',
                  backdropFilter: 'blur(20px)'
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  position: 'absolute', right: isMobile ? '0.75rem' : '1.25rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'var(--brand-solid)', border: 'none', color: 'var(--bg-main)',
                  width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px', borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Send size={isMobile ? 18 : 20} />
              </button>
            </div>
            <p style={{ marginTop: isMobile ? '0.75rem' : '1.25rem', fontSize: isMobile ? '0.6rem' : '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textAlign: 'center' }}>
              TAKE YOUR TIME. YOUR HEART HAS A SAFE PLACE HERE.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmotionalSupport
