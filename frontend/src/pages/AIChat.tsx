// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Sparkles, X, History } from 'lucide-react'
import { aiChatService, profileService } from '../services/api'
import { useChatSessions } from '../hooks/use-chat-sessions'
import { useAuth } from '../hooks/useAuth'
import { AnimatedBackground } from '../components/ui/SharedComponents'
import { VoiceCall } from '../components/VoiceCall'
import './AIChat.css'

export const AIChat = () => {
  const { user } = useAuth()
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{role:string;content:string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('General Chat')
  const { data: sessions = [], refetch: refetchSessions } = useChatSessions()
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [ariaCustomPrompt, setAriaCustomPrompt] = useState(user?.aria_custom_prompt || '')
  const [ariaPersonalContext, setAriaPersonalContext] = useState(user?.aria_personal_context || '')
  const [ariaVoice, setAriaVoice] = useState(user?.aria_voice || 'sage')
  const [message, setMessage] = useState(null)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSession = async (session) => {
    try {
      setIsLoading(true)
      setCurrentSessionId(session.id)
      setSessionTitle(session.title || 'Conversation')
      setShowHistory(false)

      const history = await aiChatService.getMessages(session.id)
      setMessages(history.map(m => ({
        id: m.id || crypto.randomUUID(),
        role: m.role,
        content: m.content
      })))
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!chatInput.trim() || isLoading) return

    const userMessage = chatInput
    setChatInput('')
    const newMessages = [...messages, { id: crypto.randomUUID(), role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    const assistantId = crypto.randomUUID()
    try {
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      let fullResponse = '';
      let isFirstChunk = true;

      const stream = aiChatService.chatStream(
        newMessages,
        currentSessionId,
        'general'
      )

      for await (const chunk of stream) {
        if (isFirstChunk) {
            setIsLoading(false);
            isFirstChunk = false;
        }
        fullResponse += chunk;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m));
      }

      if (!currentSessionId) {
        const { data: history } = await refetchSessions()
        if (history && history.length > 0) {
          setCurrentSessionId(history[0].id)
        }
      }
    } catch {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== assistantId)
        return [...filtered, { id: crypto.randomUUID(), role: 'assistant', content: "I'm here, but I'm having trouble reflecting right now. Please try again." }]
      })
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
        <div className="flex items-center gap-4">
          <button
            className="mobile-only bg-transparent border-0 text-[var(--text-secondary)] cursor-pointer"
            onClick={() => setShowHistory(true)}
          >
            <History size={20} />
          </button>
          <h1 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>{sessionTitle}</h1>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsCustomizing(true)}
            className="bg-transparent border-0 flex items-center gap-2 text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer"
            style={{ letterSpacing: '0.05em' }}
          >
            <Sparkles size={16} />
            <span className="desktop-only">CUSTOMIZE ARIA</span>
          </button>
          <button
            onClick={() => setIsVoiceCallOpen(true)}
            className="bg-transparent border-0 flex items-center gap-2 text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer"
            style={{ letterSpacing: '0.05em' }}
          >
            <Mic size={16} />
            <span className="desktop-only text-brand">CALL ARIA</span>
          </button>
        </div>
      </header>

      <div className="chat-main">
        {/* Mobile History Overlay */}
        {showHistory && (
          <button
            className="history-overlay border-0 p-0"
            onClick={() => setShowHistory(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowHistory(false)}
            aria-label="Close history sidebar"
          />
        )}

        {/* Sidebar - History */}
        <div className={`chat-sidebar ${showHistory ? 'open' : ''}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--text-muted)', margin: 0 }}>RECENT CONVERSATIONS</h3>
            <button className="mobile-only bg-transparent border-0 text-[var(--text-muted)]" onClick={() => setShowHistory(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
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
                <button
                  key={session.id}
                  onClick={() => loadSession(session)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && loadSession(session)}
                  className={`session-card ${currentSessionId === session.id ? 'active' : ''} bg-transparent text-left w-full`}
                  aria-label={`Select conversation: ${session.title || 'Conversation'}`}
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
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="chat-content">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--brand-accent)] opacity-10 blur-[100px] z-0 pointer-events-none"></div>

          {messages.length === 0 ? (
            <div className="mt-auto mb-auto flex flex-col items-center z-[1] text-center px-4">
              <div className="relative mb-12">
                <button
                  className="voice-circle w-[180px] h-[180px] bg-[var(--bg-card)] rounded-full flex flex-col items-center justify-center shadow-[var(--shadow-main)] gap-4 cursor-pointer border border-[var(--border-color)] p-0"
                  onClick={() => setIsVoiceCallOpen(true)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsVoiceCallOpen(true)}
                  aria-label="Tap to call Aria"
                >
                  <div className="voice-circle-inner">
                    <Mic size={24} />
                  </div>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 800 }}>TAP TO CALL</span>
                </button>
              </div>

              <div className="mb-12" style={{ maxWidth: '600px' }}>
                <h2 className="hero-quote font-serif" style={{ fontSize: '2.5rem', color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '1.5rem', fontWeight: 400 }}>
                  "Speak, Lord, for your servant is listening."
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                  Aria is here to reflect and pray with you.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
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
            <div className="w-full z-[1] flex flex-col gap-6 pb-48" style={{ maxWidth: '800px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }} className="message-bubble">
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
                className="floating-call-btn fixed bottom-32 right-8 w-14 h-14 rounded-full bg-[var(--brand-solid)] text-[var(--bg-main)] border-0 flex items-center justify-center shadow-[var(--shadow-main)] cursor-pointer z-[90] transition-all duration-300 ease-in-out"
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
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-0 text-[var(--brand-solid)] cursor-pointer"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="flex justify-center w-full mt-4" style={{ maxWidth: '800px', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[15px] z-[100] flex items-center justify-center p-8">
          <div className="glass-panel w-full bg-[var(--bg-main)] rounded-[32px] p-12 border border-[var(--border-color)]" style={{ maxWidth: '500px' }}>
            <h2 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Customize Aria</h2>

            <div className="mb-6">
              <label htmlFor="aria-voice-select" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ARIA'S VOICE</label>
              <select
                id="aria-voice-select"
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
                <option value="stella">Stella (Warm)</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="aria-custom-persona" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ARIA'S CUSTOM PERSONA</label>
              <textarea
                id="aria-custom-persona"
                placeholder="e.g. Speak like a 19th-century theologian, or use a very encouraging and lighthearted tone."
                value={ariaCustomPrompt}
                onChange={e => setAriaCustomPrompt(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', height: '100px', resize: 'none' }}
              />
            </div>

            <div className="mb-8">
              <label htmlFor="aria-personal-context" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TELL ARIA ABOUT YOU</label>
              <textarea
                id="aria-personal-context"
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

            <div className="flex gap-4">
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
