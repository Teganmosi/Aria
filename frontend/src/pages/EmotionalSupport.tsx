// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { HeartHandshake, Send, RefreshCw } from 'lucide-react'
import { AnimatedBackground } from '../components/ui/SharedComponents'
import { aiService, emotionalSupportService } from '../services/api'

export const EmotionalSupport = () => {
  const [messages, setMessages] = useState<{role:string;content:string}[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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

  const createWelcomeMessage = async (sessId: string) => {
    const initialPrompt = `Greet the user warmly as a compassionate faith companion. Invite them to share what's on their heart. Use a comforting, empathetic tone. Keep it to 1-2 sentences.`
    try {
      const response = await aiService.generate(
        [{ role: 'user', content: initialPrompt }],
        'emotionalSupport'
      )
      const aiWelcome = response.content
      setMessages([{ role: 'assistant', content: aiWelcome }])
      await emotionalSupportService.createMessage(sessId, 'assistant', aiWelcome)
    } catch {
      const fallback = "I'm so glad you're here. 🕊️ You don't have to carry this alone. Please share whatever is on your heart today, I am listening."
      setMessages([{ role: 'assistant', content: fallback }])
      await emotionalSupportService.createMessage(sessId, 'assistant', fallback)
    }
  }

  const startNewSession = async () => {
    setIsLoading(true)
    try {
      const session = await emotionalSupportService.createSession("Heart-to-Heart", "A safe space to share unspoken words")
      setSessionId(session.id)
      await createWelcomeMessage(session.id)
    } catch (err) {
      console.error("Failed to start new session:", err)
      setMessages([{
        role: 'assistant',
        content: `Welcome, friend. I am here to listen and walk with you through whatever is on your heart today. Please feel free to share.`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true)
      try {
        const sessions = await emotionalSupportService.getSessions()
        if (sessions && sessions.length > 0) {
          const latestSession = sessions[0]
          setSessionId(latestSession.id)
          const msgs = await emotionalSupportService.getSessionMessages(latestSession.id)
          if (msgs && msgs.length > 0) {
            setMessages(msgs.map(m => ({ role: m.role, content: m.content })))
          } else {
            await createWelcomeMessage(latestSession.id)
          }
        } else {
          await startNewSession()
        }
      } catch (err) {
        console.error("Failed to initialize session:", err)
        setMessages([{
          role: 'assistant',
          content: `Welcome, friend. I am here to listen and walk with you through whatever is on your heart today. Please feel free to share.`
        }])
      } finally {
        setIsLoading(false)
      }
    }
    initSession()
  }, [])

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

  return (
    <div className="min-h-full relative flex flex-col overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header style={{ padding: isMobile ? '1.5rem 1rem' : '2.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0' }}>
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <HeartHandshake size={28} color="var(--brand-accent)" />
            <h1 className="font-serif m-0" style={{ fontSize: isMobile ? '1.5rem' : '2rem', color: 'var(--text-main)', fontWeight: 500 }}>Faith Companion</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>A sanctuary for your heart's unspoken words.</p>
        </div>
        <button
          onClick={startNewSession}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            padding: '0.6rem 1.25rem',
            borderRadius: '2rem',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            opacity: isLoading ? 0.6 : 1
          }}>
          NEW REFLECTION
        </button>
      </header>

      {messages.length === 0 && isLoading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <RefreshCw className="spinning" size={32} color="var(--brand-accent)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Preparing sanctuary...</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, width: '100%', maxWidth: '850px', margin: '0 auto' }}>

          {/* Chat View */}
          <div style={{ flex: 1, width: '100%', padding: isMobile ? '0 1rem 10rem' : '0 1.5rem 14rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: isMobile ? '90%' : '75%', width: 'auto' }}>
                <div style={{
                  padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                  borderRadius: '24px',
                  background: msg.role === 'user' ? 'var(--brand-solid)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'var(--text-inverse)' : 'var(--text-main)',
                  boxShadow: msg.role === 'assistant' ? 'var(--shadow-main)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  fontSize: isMobile ? '0.95rem' : '1.05rem',
                  lineHeight: 1.6,
                  position: 'relative'
                }} className={msg.role === 'assistant' ? 'font-serif' : ''}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                Aria is listening...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Floating Input Area */}
          <div style={{ position: 'fixed', bottom: isMobile ? '1rem' : '3rem', left: '50%', transform: 'translateX(-50%)', padding: isMobile ? '0 1rem' : '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100, width: '100%', maxWidth: '850px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder={isMobile ? "Share your thoughts..." : "Share what is on your soul..."}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  width: '100%',
                  padding: isMobile ? '1.25rem 3.5rem 1.25rem 1.5rem' : '1.5rem 4.5rem 1.5rem 2rem',
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
                  background: 'var(--brand-solid)', border: 'none', color: 'var(--text-inverse)',
                  width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.6 : 1
                }}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="spinning" size={isMobile ? 16 : 20} /> : <Send size={isMobile ? 18 : 20} />}
              </button>
            </div>
            <p style={{ marginTop: isMobile ? '0.75rem' : '1.25rem', fontSize: isMobile ? '0.65rem' : '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textAlign: 'center', textTransform: 'uppercase' }}>
              TAKE YOUR TIME. YOUR HEART HAS A SAFE PLACE HERE.
            </p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spinning 1.5s linear infinite; }
      `}</style>
    </div>
  )
}

export default EmotionalSupport
