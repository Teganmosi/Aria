// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Sparkles, X, History, Phone, Trash2, Check, Plus, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { aiChatService, profileService } from '../services/api'
import { useChatSessions } from '../hooks/use-chat-sessions'
import { useAuth } from '../hooks/useAuth'
import { AnimatedBackground } from '../components/ui/SharedComponents'
import { VoiceCall } from '../components/VoiceCall'


const markdownComponents = {
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2">{children}</ol>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-2">{children}</ul>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--brand-accent)] pl-4 my-4 italic text-[var(--text-secondary)] bg-white/5 p-4 rounded-r-xl">
      {children}
    </blockquote>
  ),
};

export const AIChat = () => {
  const { user, refreshUser } = useAuth()
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
  const textareaRef = useRef(null)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [chatInput])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        stream.getTracks().forEach(track => track.stop())
        await transcribeAndSetInput(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Error starting recording:", err)
      toast.error("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        const stream = mediaRecorderRef.current.stream
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      setRecordingDuration(0)
      toast.info("Recording cancelled")
    }
  }

  const transcribeAndSetInput = async (blob) => {
    try {
      setIsTranscribing(true)
      const data = await aiChatService.transcribeAudio(blob)
      if (data.transcription) {
        setChatInput(data.transcription)
        toast.success("Voice note transcribed!")
      } else {
        toast.error("Could not transcribe voice note")
      }
    } catch (err) {
      console.error("Transcription failed:", err)
      toast.error("Failed to process audio")
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this conversation?")) return
    try {
      await aiChatService.deleteSession(sessionId)
      toast.success("Conversation deleted")
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setMessages([])
        setSessionTitle('New Conversation')
        try {
          const res = await aiChatService.getWelcomeGreeting()
          if (res?.greeting) {
            setMessages([{ id: 'welcome', role: 'assistant', content: res.greeting }])
          }
        } catch (err) {
          console.error("Error fetching welcome greeting:", err)
        }
      }
      await refetchSessions()
    } catch (err) {
      console.error("Failed to delete session:", err)
      toast.error("Failed to delete conversation")
    }
  }

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!currentSessionId && messages.length === 0) {
      const fetchGreeting = async () => {
        try {
          const res = await aiChatService.getWelcomeGreeting()
          if (res?.greeting) {
            setMessages([{ id: 'welcome', role: 'assistant', content: res.greeting }])
          }
        } catch (err) {
          console.error("Error fetching welcome greeting:", err)
        }
      }
      fetchGreeting()
    }
  }, [currentSessionId, messages.length])

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

  const openCustomization = () => {
    setAriaCustomPrompt(user?.aria_custom_prompt || '')
    setAriaPersonalContext(user?.aria_personal_context || '')
    setAriaVoice(user?.aria_voice || 'sage')
    setIsCustomizing(true)
  }

  const handleSaveCustomization = async () => {
    try {
      await profileService.updateProfile({
        aria_custom_prompt: ariaCustomPrompt,
        aria_personal_context: ariaPersonalContext,
        aria_voice: ariaVoice
      })
      await refreshUser()
      setIsCustomizing(false)
      toast.success('Aria updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update Aria')
    }
  }

  return (
    <div className="h-full relative flex flex-col overflow-hidden bg-[var(--bg-main)]">
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
        .chat-textarea {
          padding-left: 1rem !important;
          padding-right: 6.5rem !important;
          padding-top: 1rem !important;
          padding-bottom: 1rem !important;
        }
        @media (min-width: 640px) {
          .chat-textarea {
            padding-left: 1.5rem !important;
            padding-right: 7.5rem !important;
            padding-top: 1.25rem !important;
            padding-bottom: 1.25rem !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="px-4 py-4 md:px-8 md:py-6 lg:px-12 lg:py-8 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            className="flex lg:hidden bg-transparent border-0 text-[var(--text-secondary)] cursor-pointer"
            onClick={() => setShowHistory(true)}
          >
            <History size={20} />
          </button>
          <h1 className="font-serif text-[1.25rem] text-[var(--text-secondary)] font-medium m-0 line-clamp-1">{sessionTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCustomization}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-alt)] hover:border-[var(--text-muted)] p-2.5 lg:px-4 lg:py-2 rounded-full flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] text-[0.8rem] font-semibold cursor-pointer tracking-[0.05em] transition-all duration-300 shadow-[var(--shadow-main)]"
          >
            <Sparkles size={14} className="text-[var(--brand-accent)] animate-pulse" />
            <span className="hidden lg:block">CUSTOMIZE ARIA</span>
          </button>
          <button
            onClick={() => setIsVoiceCallOpen(true)}
            className="bg-[var(--brand-accent)] text-[#0B192C] hover:bg-[var(--brand-accent-hover)] p-2.5 lg:px-4 lg:py-2 rounded-full flex items-center justify-center gap-2 text-[0.8rem] font-bold cursor-pointer tracking-[0.05em] transition-all duration-300 shadow-[0_4px_20px_rgba(245,206,77,0.25)] hover:scale-105"
          >
            <Phone size={14} />
            <span className="hidden lg:block">CALL ARIA</span>
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
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setCurrentSessionId(null); setMessages([]); setSessionTitle('New Conversation'); setShowHistory(false) }}
              className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-alt)] hover:border-[var(--brand-accent)] rounded-xl text-[var(--text-main)] hover:text-[var(--brand-accent)] text-[0.8rem] font-bold tracking-wide cursor-pointer mb-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-[var(--shadow-main)] hover:scale-[1.02]"
            >
              <Plus size={16} />
              NEW REFLECTION
            </button>
            {sessions.length === 0 ? (
              <p className="text-[0.8rem] text-[var(--text-muted)] italic pl-2">No past reflections yet.</p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className="group relative flex items-center w-full"
                >
                  {currentSessionId === session.id && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--brand-accent)] rounded-r-md z-20 animate-pulse" />
                  )}
                  <button
                    onClick={() => loadSession(session)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && loadSession(session)}
                    className={`relative pl-5 pr-11 py-4 rounded-xl cursor-pointer transition-all duration-300 border text-left w-full bg-transparent font-[inherit] flex flex-col gap-1.5 ${
                      currentSessionId === session.id
                        ? 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--shadow-main)]'
                        : 'border-transparent hover:bg-[var(--bg-card)] hover:border-[var(--border-color)]'
                    }`}
                    aria-label={`Select conversation: ${session.title || 'Conversation'}`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare size={13} className={`shrink-0 mt-1 ${currentSessionId === session.id ? 'text-[var(--brand-accent)]' : 'text-[var(--text-muted)]'}`} />
                      <h4 className={`font-serif italic text-[0.95rem] leading-[1.35] m-0 line-clamp-2 ${currentSessionId === session.id ? 'font-bold text-[var(--text-main)]' : 'font-medium text-[var(--text-secondary)]'}`}>
                        {session.title || 'Conversation'}
                      </h4>
                    </div>
                    <p className="pl-5 text-[0.7rem] text-[var(--text-muted)] m-0 font-medium">
                      {new Date(session.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 bg-transparent hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded-lg cursor-pointer border-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) }
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
                  <div className="w-14 h-14 bg-[var(--brand-solid)] text-[var(--bg-main)] rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--brand-accent)] group-hover:text-[#0B192C] group-hover:rotate-[15deg]">
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
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3 rounded-[2rem] text-[0.8rem] text-[var(--text-main)] hover:bg-[var(--bg-alt)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] font-semibold cursor-pointer transition-all duration-300"
                >
                  ASK FOR PRAYER
                </button>
                <button
                  onClick={() => setChatInput("Explain Hebrews 11:1")}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-3 rounded-[2rem] text-[0.8rem] text-[var(--text-main)] hover:bg-[var(--bg-alt)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] font-semibold cursor-pointer transition-all duration-300"
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
                      <ReactMarkdown components={markdownComponents}>
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

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Fixed input bar */}
          <div className="fixed bottom-4 sm:bottom-8 left-0 lg:left-80 right-0 px-4 sm:px-8 lg:px-16 flex flex-col items-center z-[100] transition-all duration-300">
            <div className="relative w-full max-w-[800px]">
              {isRecording ? (
                <div className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl flex items-center justify-between shadow-[var(--shadow-main)]">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[var(--text-secondary)] text-[0.9rem] font-medium tracking-wide">
                      Recording Voice Note: {formatDuration(recordingDuration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={cancelRecording}
                      className="bg-transparent border-0 text-red-500 hover:text-red-600 cursor-pointer flex items-center justify-center p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all animate-fade-in"
                      title="Cancel recording"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      onClick={stopRecording}
                      className="w-10 h-10 rounded-full bg-[var(--brand-accent)] text-[#0B192C] hover:bg-[var(--brand-accent-hover)] border-0 flex items-center justify-center cursor-pointer shadow-sm transition-all"
                      title="Stop and transcribe"
                    >
                      <Check size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-end">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={isTranscribing ? "Transcribing voice..." : "Talk to Aria..."}
                    value={chatInput}
                    disabled={isTranscribing}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    className={`chat-textarea w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[0.95rem] sm:text-[1rem] text-[var(--text-main)] outline-none shadow-[var(--shadow-main)] resize-none overflow-y-auto max-h-[150px] leading-relaxed ${isTranscribing ? 'opacity-50' : ''}`}
                  />
                  <div className="absolute right-4 bottom-3 sm:bottom-4.5 flex items-center gap-2">
                    <button
                      onClick={startRecording}
                      disabled={isTranscribing}
                      className="p-2 bg-transparent border-0 text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer rounded-full hover:bg-[var(--bg-alt)] transition-all"
                      title="Record voice note"
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={isTranscribing || !chatInput.trim()}
                      className={`p-2 bg-transparent border-0 cursor-pointer rounded-full transition-all ${
                        chatInput.trim() 
                          ? 'text-[var(--brand-accent)] hover:bg-[var(--bg-alt)]' 
                          : 'text-[var(--text-muted)] cursor-not-allowed'
                      }`}
                      title="Send message"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              )}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[15px] z-[100] flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-[500px] bg-[var(--bg-main)] rounded-[32px] p-6 sm:p-12 border border-[var(--border-color)]">
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
                className="flex-1 p-4 bg-[var(--brand-accent)] text-[#0B192C] hover:bg-[var(--brand-accent-hover)] border-0 rounded-xl font-bold cursor-pointer transition-all"
              >
                UPDATE ARIA
              </button>
              <button
                onClick={() => setIsCustomizing(false)}
                className="flex-1 p-4 bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)] rounded-xl font-semibold cursor-pointer transition-all"
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
