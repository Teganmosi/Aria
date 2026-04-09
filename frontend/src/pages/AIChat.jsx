import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Sparkles, X, History } from 'lucide-react'
import { aiChatService, profileService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { AnimatedBackground } from './LandingPage'
import VoiceCall from '../components/VoiceCall'
import './AIChat.css'

const AIChat = () => {
  const { user } = useAuth()
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('General Chat')
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [ariaCustomPrompt, setAriaCustomPrompt] = useState(user?.aria_custom_prompt || '')
  const [ariaPersonalContext, setAriaPersonalContext] = useState(user?.aria_personal_context || '')
  const [ariaVoice, setAriaVoice] = useState(user?.aria_voice || 'verse')
  const [message, setMessage] = useState(null)

  const messagesEndRef = useRef(null)

  // Fetch past sessions
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await aiChatService.getSessions()
        setSessions(history || [])
      } catch (err) {
        console.error('Failed to fetch history:', err)
      }
    }
    fetchHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSession = async (session) => {
    try {
      setIsLoading(true)
      setCurrentSessionId(session.id)
      setSessionTitle(session.title || 'Conversation')
      setShowHistory(false) // Close sidebar on mobile after selection

      const history = await aiChatService.getMessages(session.id)
      setMessages(history.map(m => ({
        role: m.role,
        content: m.content
      })))
    } catch (err) {
      console.error('Failed to load session:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!chatInput.trim() || isLoading) return

    const userMessage = chatInput
    setChatInput('')
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await aiChatService.chat(
        newMessages,
        currentSessionId,
        'general'
      )
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])

      // If it was a new session, refresh history to show it
      if (!currentSessionId) {
        const history = await aiChatService.getSessions()
        setSessions(history || [])
        // Find the new session id (it should be the first one)
        if (history && history.length > 0) {
          setCurrentSessionId(history[0].id)
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here, but I'm having trouble reflecting right now. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCustomization = async () => {
    try {
      await profileService.updateProfile({
        aria_custom_prompt: ariaCustomPrompt,
        aria_personal_context: ariaPersonalContext,
        aria_voice: ariaVoice
      })
      setMessage({ text: 'Aria updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update Aria', isError: true })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="chat-container">
      <AnimatedBackground />

      {/* Top Header */}
      <header className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="mobile-only"
            onClick={() => setShowHistory(true)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <History size={20} />
          </button>
          <h1 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>{sessionTitle}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => setIsCustomizing(true)}
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: 600, cursor: 'pointer' }}
          >
            <Sparkles size={16} />
            <span className="desktop-only">CUSTOMIZE ARIA</span>
          </button>
          <button
            onClick={() => setIsVoiceCallOpen(true)}
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: 600, cursor: 'pointer' }}
          >
            <Mic size={16} />
            <span className="desktop-only text-brand">CALL ARIA</span>
          </button>
        </div>
      </header>

      <div className="chat-main">
        {/* Mobile History Overlay */}
        {showHistory && <div className="history-overlay" onClick={() => setShowHistory(false)} />}

        {/* Sidebar - History */}
        <div className={`chat-sidebar ${showHistory ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)', margin: 0 }}>RECENT CONVERSATIONS</h3>
            <button className="mobile-only" onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => {
                setCurrentSessionId(null);
                setMessages([]);
                setSessionTitle('New Conversation');
                setShowHistory(false);
              }}
              style={{
                padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border-color)',
                borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '1rem'
              }}
            >
              + NEW CHAT
            </button>
            {sessions.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No past reflections yet.</p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={`session-card ${currentSessionId === session.id ? 'active' : ''}`}
                >
                  <h4 className="font-serif" style={{
                    fontStyle: 'italic',
                    fontWeight: currentSessionId === session.id ? 700 : 500,
                    fontSize: '1rem',
                    color: currentSessionId === session.id ? 'var(--text-main)' : 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    margin: 0
                  }}>
                    {session.title || 'Conversation'}
                  </h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                    {new Date(session.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="chat-content">
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'var(--brand-accent)', opacity: 0.1, filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>

          {messages.length === 0 ? (
            <div style={{ marginTop: 'auto', marginBottom: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, textAlign: 'center', padding: '0 1rem' }}>
              <div style={{ position: 'relative', marginBottom: '3rem' }}>
                <div
                  className="voice-circle"
                  onClick={() => setIsVoiceCallOpen(true)}
                  style={{ width: '180px', height: '180px', background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-main)', gap: '1rem', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                  <div className="voice-circle-inner">
                    <Mic size={24} />
                  </div>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 800 }}>TAP TO CALL</span>
                </div>
              </div>

              <div style={{ maxWidth: '600px', marginBottom: '3rem' }}>
                <h2 className="hero-quote font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '1.5rem', fontWeight: 400 }}>
                  "Speak, Lord, for your servant is listening."
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                  Aria is here to reflect and pray with you.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => { setChatInput("I'd like to pray for strength"); }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: '2rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                >
                  ASK FOR PRAYER
                </button>
                <button
                  onClick={() => { setChatInput("Explain Hebrews 11:1"); }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: '2rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                >
                  SCRIPTURE CONTEXT
                </button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '800px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '12rem' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }} className="message-bubble">
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '1.5rem',
                    background: msg.role === 'user' ? 'var(--brand-solid)' : 'var(--bg-card)',
                    color: msg.role === 'user' ? 'var(--bg-main)' : 'var(--text-main)',
                    boxShadow: msg.role === 'assistant' ? 'var(--shadow-main)' : 'none',
                    border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }} className={msg.role === 'assistant' ? 'font-serif' : ''}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginLeft: '1rem' }}>
                  Aria is reflecting...
                </div>
              )}

              {/* Floating Call Button for active chats */}
              <button
                onClick={() => setIsVoiceCallOpen(true)}
                className="floating-call-btn"
                style={{
                  position: 'fixed',
                  bottom: '8rem',
                  right: '2rem',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--brand-solid)',
                  color: 'var(--bg-main)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-main)',
                  cursor: 'pointer',
                  zIndex: 90,
                  transition: 'all 0.3s ease'
                }}
              >
                <Mic size={24} />
              </button>

              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="chat-input-wrapper">
            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Talk to Aria..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--brand-solid)', cursor: 'pointer' }}
              >
                <Send size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '800px', marginTop: '1rem', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              <span className="desktop-only text-center">END-TO-END ENCRYPTED SANCTUARY</span>
            </div>
          </div>
        </div>
      </div>

      <VoiceCall
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        mode="voiceCall"
      />

      {/* Customization Modal */}
      {isCustomizing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-main)', borderRadius: '32px', padding: '3rem', border: '1px solid var(--border-color)' }}>
            <h2 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Customize Aria</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ARIA'S VOICE</label>
              <select
                value={ariaVoice}
                onChange={e => setAriaVoice(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem' }}
              >
                <option value="alloy">Alloy (Balanced)</option>
                <option value="ash">Ash (Dynamic)</option>
                <option value="ballad">Ballad (Warm)</option>
                <option value="coral">Coral (Bright)</option>
                <option value="echo">Echo (Low-pitched)</option>
                <option value="sage">Sage (Peaceful)</option>
                <option value="shimmer">Shimmer (High-pitched)</option>
                <option value="verse">Verse (Classic Aria)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ARIA'S CUSTOM PERSONA</label>
              <textarea
                placeholder="e.g. Speak like a 19th-century theologian, or use a very encouraging and lighthearted tone."
                value={ariaCustomPrompt}
                onChange={e => setAriaCustomPrompt(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', height: '100px', resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TELL ARIA ABOUT YOU</label>
              <textarea
                placeholder="Share things you want Aria to remember about you or your current situation."
                value={ariaPersonalContext}
                onChange={e => setAriaPersonalContext(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', height: '100px', resize: 'none' }}
              />
            </div>

            {message && (
              <div style={{ padding: '1rem', borderRadius: '12px', background: message.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.isError ? '#ef4444' : '#10b981', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid currentColor' }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSaveCustomization}
                style={{ flex: 1, padding: '1rem', background: 'var(--brand-solid)', color: 'var(--bg-main)', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                UPDATE ARIA
              </button>
              <button
                onClick={() => setIsCustomizing(false)}
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIChat
