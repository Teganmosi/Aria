// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Sparkles, X, History } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { aiChatService, profileService } from '../services/api'
import { useChatSessions } from '../hooks/use-chat-sessions'
import { useAuth } from '../hooks/useAuth'
import { AnimatedBackground } from '../components/ui/SharedComponents'
import { VoiceCall } from '../components/VoiceCall'

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
      toast.error('Failed to load conversation')
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
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
      let fullResponse = ''
      let isFirstChunk = true
      const stream = aiChatService.chatStream(newMessages, currentSessionId, 'general')
      for await (const chunk of stream) {
        if (isFirstChunk) { setIsLoading(false); isFirstChunk = false }
        fullResponse += chunk
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m))
      }
      if (!currentSessionId) {
        const { data: history } = await refetchSessions()
        if (history && history.length > 0) setCurrentSessionId(history[0].id)
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
      toast.success('Aria updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update Aria')
    }
  }

  return (
    <div className="h-screen relative flex flex-col overflow-hidden bg-[var(--bg-main)]">
      <AnimatedBackground />

      {/* Ripple animation for voice circle — pseudo-elements can't be done in Tailwind */}
      <style>{`
        .voice-ripple { position: relative; }
        .voice-ripple::before, .voice-ripple::after {
          content: ''; position: absolute; inset: -2px; border-radius: 50%;
          border: 1px solid var(--brand-accent); opacity: 0; z-index: -1;
        }
        .voice-ripple::before { animation: ripple 3s infinite; }
        .voice-ripple::after  { animation: ripple 3s infinite 1.5s; }
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <header className="px-8 py-6 lg:px-12 lg:py-8 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            className="flex lg:hidden bg-transparent border-0 text-[var(--text-secondary)] cursor-pointer"
            onClick={() => setShowHistory(true)}
          >
            <History size={20} />
          </button>
          <h1 className="font-serif text-[1.25rem] text-[var(--text-secondary)] font-medium m-0">{sessionTitle}</h1>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsCustomizing(true)}
            className="bg-transparent border-0 flex items-center gap-2 text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer tracking-[0.05em]"
          >
            <Sparkles size={16} />
            <span className="hidden lg:block">CUSTOMIZE ARIA</span>
          </button>
          <button
            onClick={() => setIsVoiceCallOpen(true)}
            className="bg-transparent border-0 flex items-center gap-2 text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer tracking-[0.05em]"
          >
            <Mic size={16} />
            <span className="hidden lg:block text-[var(--brand-solid)]">CALL ARIA</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">

        {/* Mobile history overlay */}
        {showHistory && (
          <button
            className="fixed inset-0 bg-black/30 z-[150] backdrop-blur-sm border-0 p-0 lg:hidden"
            onClick={() => setShowHistory(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowHistory(false)}
            aria-label="Close history sidebar"
          />
        )}

        {/* Sidebar */}
        <div className={`
          w-80 shrink-0 h-full bg-transparent px-8 py-4 z-10 overflow-y-auto transition-transform duration-300 ease-in-out
          max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:bg-[var(--bg-main)] max-lg:shadow-[var(--shadow-lg)] max-lg:z-[200]
          ${showHistory ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}
        `}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[0.75rem] tracking-[0.15em] text-[var(--text-muted)] m-0">RECENT CONVERSATIONS</h3>
            <button className="flex lg:hidden bg-transparent border-0 text-[var(--text-muted)] cursor-pointer" onClick={() => setShowHistory(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { setCurrentSessionId(null); setMessages([]); setSessionTitle('New Conversation'); setShowHistory(false) }}
              className="p-4 bg-white/5 border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-main)] text-[0.8rem] cursor-pointer mb-4"
            >
              + NEW CHAT
            </button>
            {sessions.length === 0 ? (
              <p className="text-[0.8rem] text-[var(--text-muted)] italic">No past reflections yet.</p>
            ) : (
              sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && loadSession(session)}
                  className={`px-4 py-5 rounded-xl cursor-pointer transition-all duration-200 border text-left w-full bg-transparent font-[inherit] ${
                    currentSessionId === session.id
                      ? 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--shadow-main)]'
                      : 'border-transparent'
                  }`}
                  aria-label={`Select conversation: ${session.title || 'Conversation'}`}
                >
                  <h4 className={`font-serif italic text-[1rem] m-0 mb-1 ${currentSessionId === session.id ? 'font-bold text-[var(--text-main)]' : 'font-medium text-[var(--text-secondary)]'}`}>
                    {session.title || 'Conversation'}
                  </h4>
                  <p className="text-[0.7rem] text-[var(--text-muted)] m-0">
                    {new Date(session.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat content */}
        <div className={`flex-1 min-h-0 relative flex flex-col items-center p-8 w-full ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--brand-accent)] opacity-10 blur-[100px] z-0 pointer-events-none" />

          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center z-[1] text-center px-4 pb-24 w-full">
              {/* Voice call button */}
              <div className="relative mb-12">
                <button
                  className="voice-ripple group relative w-[180px] h-[180px] bg-[var(--bg-card)] rounded-full flex flex-col items-center justify-center shadow-[var(--shadow-main)] gap-4 cursor-pointer border border-[var(--border-color)] p-0 transition-all duration-[400ms] hover:scale-105 hover:border-[var(--brand-accent)]"
                  onClick={() => setIsVoiceCallOpen(true)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsVoiceCallOpen(true)}
                  aria-label="Tap to call Aria"
                >
                  <div className="w-14 h-14 bg-[var(--brand-solid)] text-[var(--bg-main)] rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--brand-accent)] group-hover:text-[var(--brand-solid)] group-hover:rotate-[15deg]">
                    <Mic size={24} />
                  </div>
                  <span className="text-[0.65rem] tracking-[0.15em] text-[var(--text-secondary)] font-extrabold">TAP TO CALL</span>
                </button>
              </div>

              {/* Quote */}
              <div className="mb-12 max-w-[600px]">
                <h2 className="font-serif text-[2.5rem] max-sm:text-[1.75rem] text-[var(--text-main)] leading-[1.3] mb-6 font-normal">
                  "Speak, Lord, for your servant is listening."
                </h2>
                <p className="text-[var(--text-secondary)] text-[1rem] leading-[1.6]">
                  Aria is here to reflect and pray with you.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={() => setChatInput("I'd like to pray for strength")}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3 rounded-[2rem] text-[0.8rem] text-[var(--text-main)] font-semibold cursor-pointer"
                >
                  ASK FOR PRAYER
                </button>
                <button
                  onClick={() => setChatInput("Explain Hebrews 11:1")}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3 rounded-[2rem] text-[0.8rem] text-[var(--text-main)] font-semibold cursor-pointer"
                >
                  SCRIPTURE CONTEXT
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full z-[1] flex flex-col gap-6 pb-48 max-w-[800px]">
              {messages.map((msg) => (
                <div key={msg.id} className={`max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                  <div className={`px-6 py-5 rounded-[1.5rem] text-[1rem] leading-[1.6] ${
                    msg.role === 'user'
                      ? 'bg-[var(--brand-solid)] text-[var(--bg-main)]'
                      : 'font-serif bg-[var(--bg-card)] text-[var(--text-main)] shadow-[var(--shadow-main)] border border-[var(--border-color)]'
                  }`}>
                    {msg.role === 'user' ? msg.content : (
                      <ReactMarkdown
                        components={{
                          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2">{children}</ol>,
                          ul: ({ children }) => <ul className="list-disc pl-5 space-y-2">{children}</ul>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="self-start text-[var(--text-muted)] text-[0.85rem] italic ml-4">
                  Aria is reflecting...
                </div>
              )}

              {/* Floating call button */}
              <button
                onClick={() => setIsVoiceCallOpen(true)}
                className="fixed bottom-32 right-8 w-14 h-14 rounded-full bg-[var(--brand-solid)] text-[var(--bg-main)] border-0 flex items-center justify-center shadow-[var(--shadow-main)] cursor-pointer z-[90] transition-all duration-300 hover:scale-110 hover:rotate-[5deg] hover:bg-[var(--brand-accent)] hover:text-[var(--brand-solid)]"
              >
                <Mic size={24} />
              </button>

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Fixed input bar */}
          <div className="fixed bottom-8 left-0 lg:left-80 right-0 px-8 lg:px-16 flex flex-col items-center z-[100] transition-all duration-300">
            <div className="relative w-full max-w-[800px]">
              <input
                type="text"
                placeholder="Talk to Aria..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full px-6 py-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[1rem] text-[var(--text-main)] outline-none shadow-[var(--shadow-main)]"
              />
              <button
                onClick={handleSend}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-0 text-[var(--brand-solid)] cursor-pointer"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="hidden lg:flex justify-center w-full mt-4 max-w-[800px] text-[0.6rem] text-[var(--text-muted)] tracking-[0.05em]">
              END-TO-END ENCRYPTED SANCTUARY
            </div>
          </div>
        </div>
      </div>

      <VoiceCall isOpen={isVoiceCallOpen} onClose={() => setIsVoiceCallOpen(false)} mode="voiceCall" />

      {/* Customization modal */}
      {isCustomizing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[15px] z-[100] flex items-center justify-center p-8">
          <div className="w-full max-w-[500px] bg-[var(--bg-main)] rounded-[32px] p-12 border border-[var(--border-color)]">
            <h2 className="font-serif text-[1.75rem] text-[var(--text-main)] mb-8">Customize Aria</h2>

            <div className="mb-6">
              <label htmlFor="aria-voice-select" className="block text-[0.7rem] font-extrabold text-[var(--text-muted)] mb-2">ARIA'S VOICE</label>
              <select
                id="aria-voice-select"
                value={ariaVoice}
                onChange={e => setAriaVoice(e.target.value)}
                className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] text-[1rem] outline-none"
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
              <label htmlFor="aria-custom-persona" className="block text-[0.7rem] font-extrabold text-[var(--text-muted)] mb-2">ARIA'S CUSTOM PERSONA</label>
              <textarea
                id="aria-custom-persona"
                placeholder="e.g. Speak like a 19th-century theologian, or use a very encouraging and lighthearted tone."
                value={ariaCustomPrompt}
                onChange={e => setAriaCustomPrompt(e.target.value)}
                className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] text-[1rem] h-[100px] resize-none outline-none"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="aria-personal-context" className="block text-[0.7rem] font-extrabold text-[var(--text-muted)] mb-2">TELL ARIA ABOUT YOU</label>
              <textarea
                id="aria-personal-context"
                placeholder="Share things you want Aria to remember about you or your current situation."
                value={ariaPersonalContext}
                onChange={e => setAriaPersonalContext(e.target.value)}
                className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] text-[1rem] h-[100px] resize-none outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveCustomization}
                className="flex-1 p-4 bg-[var(--brand-solid)] text-[var(--bg-main)] border-0 rounded-xl font-semibold cursor-pointer"
              >
                UPDATE ARIA
              </button>
              <button
                onClick={() => setIsCustomizing(false)}
                className="flex-1 p-4 bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-semibold cursor-pointer"
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
