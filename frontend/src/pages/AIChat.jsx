import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Send, 
  Mic, 
  MicOff,
  MoreVertical, 
  Sparkles, 
  X, 
  Volume2, 
  VolumeX,
  Phone,
  PhoneOff,
  Circle,
  Copy,
  Check,
  MessageCircle,
  BookOpen,
  Heart,
  Sun,
  ChevronDown
} from 'lucide-react'
import { aiService, voiceCallService } from '../services/api'

const CHAT_MODES = [
  {
    id: 'general',
    name: 'Faith Companion',
    description: 'General spiritual conversations',
    color: '#c9a227',
    icon: MessageCircle
  },
  {
    id: 'bibleStudy',
    name: 'Bible Guide',
    description: 'Scripture explanations',
    color: '#6366f1',
    icon: BookOpen
  },
  {
    id: 'emotionalSupport',
    name: 'Prayer Partner',
    description: 'Comfort & guidance',
    color: '#8b5cf6',
    icon: Heart
  },
  {
    id: 'devotion',
    name: 'Devotional',
    description: 'Daily reflection',
    color: '#f59e0b',
    icon: Sun
  }
]

const SUGGESTED_PROMPTS = {
  general: [
    "How can I grow closer to God?",
    "What does the Bible say about love?",
    "Help me understand prayer better"
  ],
  bibleStudy: [
    "Explain Romans 8:28",
    "What is the meaning of Psalm 23?",
    "Tell me about the prodigal son"
  ],
  emotionalSupport: [
    "I'm feeling anxious about the future",
    "I need comfort during hard times",
    "How do I find peace?"
  ],
  devotion: [
    "Give me a morning prayer",
    "What should I reflect on today?",
    "Words of encouragement"
  ]
}

const EMOJI_REACTIONS = ['❤️', '🙏', '✨', '💡', '🤔']

// Call duration limits
const MAX_CALL_DURATION = 10 * 60 // 10 minutes in seconds
const WARNING_DURATION = 8 * 60    // 8 minutes in seconds

// Simple animated background
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 8,
        y: (e.clientY / window.innerHeight - 0.5) * 8
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="chat-bg">
      <div 
        className="bg-orb"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      />
    </div>
  )
}

// Simple markdown-like formatting for Bible verses
const formatMessage = (content) => {
  // Handle quoted scripture
  let formatted = content.replace(/"([^"]+)"/g, '<blockquote>"$1"</blockquote>')
  
  // Handle bullet points
  formatted = formatted.replace(/• /g, '<li>')
  
  // Handle numbered lists
  formatted = formatted.replace(/(\d+)\. /g, '<span class="list-num">$1. </span>')
  
  // Handle emphasis
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  
  return formatted
}

// Message component
const MessageBubble = ({ message, isLast, onCopy }) => {
  const isUser = message.role === 'user'
  const [showActions, setShowActions] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(message.content)
        utterance.onstart = () => setIsPlaying(true)
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (onCopy) onCopy()
  }

  const handleEmojiClick = () => {
    setShowEmojis(false)
    // Could send reaction to backend in future
  }

  const formattedContent = !isUser ? formatMessage(message.content) : message.content

  return (
    <div 
      className={`message-wrapper ${isUser ? 'outgoing' : 'incoming'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojis(false) }}
    >
      <div className="message-bubble">
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="message-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )}
        <div className="message-meta">
          <span className="message-time">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && isLast && (
            <span className="message-status"><Sparkles size={12} /></span>
          )}
        </div>
      </div>
      
      {showActions && !isUser && (
        <div className="message-actions">
          <button onClick={handleSpeak} title={isPlaying ? "Stop" : "Read aloud"}>
            {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={handleCopy} title="Copy">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button onClick={() => setShowEmojis(!showEmojis)} title="React">
            <Sparkles size={16} />
          </button>
        </div>
      )}

      {showEmojis && !isUser && (
        <div className="emoji-picker">
          {EMOJI_REACTIONS.map((emoji, idx) => (
            <button key={idx} onClick={() => handleEmojiClick(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Custom hook for audio capture and playback
const useVoiceCall = (callIdRef, _mode, onTranscript, _onAudioOutput, onError, onConnected) => {
  const wsRef = useRef(null)
  const audioContextRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const isRecordingRef = useRef(false)
  const audioQueueRef = useRef([])
  const isPlayingRef = useRef(false)
  const audioElementRef = useRef(null)
  const playNextAudioRef = useRef(null)

  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return
    
    isPlayingRef.current = true
    const audioBase64 = audioQueueRef.current.shift()
    
    try {
      // Convert base64 to audio
      const audioBytes = atob(audioBase64)
      const arrayBuffer = new ArrayBuffer(audioBytes.length)
      const uint8Array = new Uint8Array(arrayBuffer)
      for (let i = 0; i < audioBytes.length; i++) {
        uint8Array[i] = audioBytes.charCodeAt(i)
      }
      
      // Create audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      
      // Play audio
      const blob = new Blob([uint8Array], { type: 'audio/pcm' })
      const url = URL.createObjectURL(blob)
      
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio()
      }
      
      audioElementRef.current.src = url
      await audioElementRef.current.play()
      
      audioElementRef.current.onended = () => {
        isPlayingRef.current = false
        URL.revokeObjectURL(url)
        // Play next in queue via ref to avoid circular reference
        if (audioQueueRef.current.length > 0 && playNextAudioRef.current) {
          playNextAudioRef.current()
        }
      }
    } catch (err) {
      console.error('Error playing audio:', err)
      isPlayingRef.current = false
    }
  }, [])

  // Store the function in ref after it's created
  useEffect(() => {
    playNextAudioRef.current = playNextAudio
  }, [playNextAudio])

  const stopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      if (mediaStreamRef.current.mediaRecorder) {
        mediaStreamRef.current.mediaRecorder.stop()
      }
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    isRecordingRef.current = false
  }, [])

  const connect = useCallback(async () => {
    try {
      const currentCallId = callIdRef.current
      const wsUrl = voiceCallService.getWebSocketUrl(currentCallId)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('Voice call WebSocket connected')
        onConnected?.()
      }

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'conversation_started' || data.type === 'transcript_complete') {
          onTranscript?.(data.message || data.text, 'assistant')
        } else if (data.type === 'transcript') {
          onTranscript?.(data.text, 'assistant', true)
        } else if (data.type === 'audio_output') {
          // Queue audio for playback
          audioQueueRef.current.push(data.audio)
          if (playNextAudioRef.current) {
            playNextAudioRef.current()
          }
        } else if (data.type === 'error') {
          onError?.(data.message)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onError?.('Connection error')
      }

      ws.onclose = () => {
        console.log('Voice call WebSocket closed')
        stopRecording()
      }
    } catch (err) {
      console.error('Failed to connect voice call:', err)
      onError?.('Failed to connect')
    }
  }, [callIdRef, onTranscript, onError, onConnected, stopRecording])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })
      mediaStreamRef.current = stream
      isRecordingRef.current = true

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = btoa(reader.result)
            wsRef.current?.send(JSON.stringify({
              type: 'audio_input',
              audio: base64
            }))
          }
          reader.readAsBinaryString(event.data)
        }
      }

      // Collect audio in chunks
      mediaRecorder.start(100) // Send every 100ms
      
      // Keep reference to recorder
      mediaStreamRef.current.mediaRecorder = mediaRecorder
    } catch (err) {
      console.error('Failed to start recording:', err)
      onError?.('Failed to access microphone')
    }
  }, [onError])

  const disconnect = useCallback(() => {
    stopRecording()
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }))
      wsRef.current.close()
      wsRef.current = null
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current = null
    }
  }, [stopRecording])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    startRecording,
    stopRecording
  }
}

// Generate phone ringtone using Web Audio API
const playRingtone = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  const playTone = (startTime) => {
    // Create oscillator for the ringtone
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // First tone (440Hz)
    oscillator.frequency.setValueAtTime(440, startTime)
    oscillator.type = 'sine'
    
    // Fade in and out for the ring
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, startTime + 0.25)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.25)
    
    // Second tone (480Hz) - slight delay
    const oscillator2 = audioContext.createOscillator()
    const gainNode2 = audioContext.createGain()
    
    oscillator2.connect(gainNode2)
    gainNode2.connect(audioContext.destination)
    
    oscillator2.frequency.setValueAtTime(480, startTime + 0.3)
    oscillator2.type = 'sine'
    
    gainNode2.gain.setValueAtTime(0, startTime + 0.3)
    gainNode2.gain.linearRampToValueAtTime(0.3, startTime + 0.35)
    gainNode2.gain.linearRampToValueAtTime(0, startTime + 0.55)
    
    oscillator2.start(startTime + 0.3)
    oscillator2.stop(startTime + 0.55)
  }
  
  // Play the ring pattern twice
  const now = audioContext.currentTime
  playTone(now)
  playTone(now + 0.6)
  
  return audioContext
}

// Call Interface
const CallInterface = ({ 
  isRinging, 
  isConnected, 
  onAccept, 
  onDecline, 
  mode,
  callDuration,
  isMuted,
  onToggleMute,
  warningShown
}) => {
  const [pulse, setPulse] = useState(true)
  const ringtoneRef = useRef(null)

  useEffect(() => {
    if (isRinging) {
      // Play ringtone when ringing starts
      ringtoneRef.current = playRingtone()
      
      // Play ringtone every 1.5 seconds
      const ringInterval = setInterval(() => {
        ringtoneRef.current = playRingtone()
      }, 1500)
      
      const pulseInterval = setInterval(() => setPulse(prev => !prev), 800)
      
      return () => {
        clearInterval(ringInterval)
        clearInterval(pulseInterval)
        if (ringtoneRef.current) {
          ringtoneRef.current.close()
        }
      }
    }
  }, [isRinging])

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isRinging && !isConnected) return null

  return (
    <div className={`call-overlay ${isConnected ? 'connected' : ''}`}>
      <div className="call-container">
        {isRinging && (
          <>
            <div className={`call-avatar ${pulse ? 'pulse' : ''}`}>
              <Sparkles size={40} />
            </div>
            <h3>Aria</h3>
            <p className="call-status">{pulse ? 'calling...' : 'ringing'}</p>
            
            <div className="call-actions">
              <button className="call-btn decline" onClick={onDecline}>
                <PhoneOff size={24} />
              </button>
              <button className="call-btn accept" onClick={onAccept}>
                <Phone size={24} />
              </button>
            </div>
          </>
        )}

        {isConnected && (
          <>
            <div className={`connected-avatar ${warningShown ? 'warning' : ''}`}>
              <Sparkles size={50} />
            </div>
            <h3>Aria</h3>
            <p className="call-duration">{formatDuration(callDuration)}</p>
            <p className="call-mode">{mode.name}</p>
            
            {warningShown && (
              <div className="call-warning">
                <span>⚠️ 2 minutes remaining</span>
              </div>
            )}
            
            <div className="call-info">
              <Circle size={8} fill={isMuted ? "#ef4444" : "#c9a227"} />
              <span>{isMuted ? 'Muted' : 'Connected - Voice Chat Active'}</span>
            </div>

            <div className="connected-actions">
              <button className={`call-btn mute ${isMuted ? 'muted' : ''}`} onClick={onToggleMute}>
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button className="call-btn end" onClick={onDecline}>
                <PhoneOff size={24} />
              </button>
              <button className="call-btn speaker">
                <Volume2 size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const AIChat = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState(CHAT_MODES[0])
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [hasChatted, setHasChatted] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  // Call states
  const [isRinging, setIsRinging] = useState(false)
  const [isCallConnected, setIsCallConnected] = useState(false)
  const [callId, setCallId] = useState(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [warningShown, setWarningShown] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const declineCallRef = useRef(null)
  const callIdRef = useRef(null)
  
  // Keep the ref in sync with state
  useEffect(() => {
    callIdRef.current = callId
  }, [callId])
  
  // Voice call handler
  const voiceCallHandler = useVoiceCall(
    callIdRef,
    currentMode.id,
    // onTranscript
    (text, role, isPartial = false) => {
      if (!isPartial) {
        setMessages(prev => [...prev, { role, content: text }])
      }
    },
    // onAudioOutput
    (_audioData) => {
      console.log('Audio output received')
    },
    // onError
    (error) => {
      console.error('Voice call error:', error)
      if (declineCallRef.current) {
        declineCallRef.current()
      }
    },
    // onConnected
    () => {
      console.log('Voice call connected')
    }
  )

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem('aria_chat_history')
    const savedMode = localStorage.getItem('aria_chat_mode')
    
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat)
        setMessages(parsed)
        setHasChatted(parsed.length > 0)
      } catch (e) {
        console.error('Error loading chat history:', e)
      }
    }

    if (savedMode) {
      const mode = CHAT_MODES.find(m => m.id === savedMode)
      if (mode) setCurrentMode(mode)
    }
  }, [])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aria_chat_history', JSON.stringify(messages))
    }
  }, [messages])

  // Save mode to localStorage
  useEffect(() => {
    localStorage.setItem('aria_chat_mode', currentMode.id)
  }, [currentMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Call timer effect
  useEffect(() => {
    if (isCallConnected) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1
          
          // Check for warning at 8 minutes
          if (newDuration === WARNING_DURATION && !warningShown) {
            setWarningShown(true)
            // Add warning message
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "I'm enjoying our conversation! I wanted to let you know that I have to end our call in about 2 minutes. Is there anything else you'd like to share?"
            }])
          }
          
          // End call at 10 minutes
          if (newDuration >= MAX_CALL_DURATION) {
            if (declineCallRef.current) {
              declineCallRef.current()
            }
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "It's been wonderful talking with you! I've really enjoyed our conversation about faith. Remember, I'm always here if you want to chat more. Take care and God bless!"
            }])
          }
          
          return newDuration
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isCallConnected, warningShown])

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || isCallConnected) return

    const userMessage = inputMessage
    setInputMessage('')
    setHasChatted(true)
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await aiService.generate(
        [...messages, { role: 'user', content: userMessage }],
        currentMode.id
      )
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again." 
      }])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleModeChange = (mode) => {
    setCurrentMode(mode)
    setShowModeSelector(false)
    setMessages([{ 
      role: 'assistant', 
      content: `Hello! I'm your ${mode.name}. ${mode.description}. How can I help you?` 
    }])
  }

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const initiateCall = async () => {
    try {
      // Create a voice session
      const session = await voiceCallService.createCallSession(currentMode.id)
      setCallId(session.session_id)
      setIsRinging(true)
      setWarningShown(false)
      setCallDuration(0)
      
      // Simulate ringing for 3 seconds then auto-connect
      const timeout = setTimeout(() => {
        acceptCall()
      }, 3000)
      
      // Store timeout reference for cleanup
      window.callTimeout = timeout
    } catch (err) {
      console.error('Failed to initiate call:', err)
    }
  }

  const acceptCall = async () => {
    if (window.callTimeout) {
      clearTimeout(window.callTimeout)
    }
    setIsRinging(false)
    setIsCallConnected(true)
    setCallDuration(0)
    setWarningShown(false)
    
    // Connect to voice call WebSocket
    await voiceCallHandler.connect()
    
    // Start recording audio
    await voiceCallHandler.startRecording()
    
    // Add initial greeting
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: "Hello! I'm here to talk with you about your faith. How are you feeling today?" 
    }])
  }

  const declineCall = () => {
    if (window.callTimeout) {
      clearTimeout(window.callTimeout)
    }
    
    // Stop voice call
    voiceCallHandler.disconnect()
    
    setIsRinging(false)
    setIsCallConnected(false)
    setCallId(null)
    setCallDuration(0)
    setWarningShown(false)
    setIsMuted(false)
  }

  // Set up ref for declineCall after it's defined
  useEffect(() => {
    declineCallRef.current = declineCall
  }, [declineCall])

  const toggleMute = () => {
    if (isMuted) {
      voiceCallHandler.startRecording()
    } else {
      voiceCallHandler.stopRecording()
    }
    setIsMuted(!isMuted)
  }

  const clearChat = () => {
    setMessages([])
    setHasChatted(false)
    localStorage.removeItem('aria_chat_history')
  }

  const CurrentModeIcon = currentMode.icon

  return (
    <div className="chat-page">
      <AnimatedBackground />

      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <div className="avatar" style={{ background: currentMode.color }}>
            <Sparkles size={20} />
          </div>
          <div className="header-info">
            <h2>Aria</h2>
            <p>{isCallConnected ? 'Voice call...' : currentMode.name}</p>
          </div>
        </div>
        
        <div className="header-actions">
          {/* Mode Selector Button - More Visible */}
          <button 
            className="mode-selector-btn"
            onClick={() => setShowModeSelector(!showModeSelector)}
            style={{ '--mode-color': currentMode.color }}
          >
            <CurrentModeIcon size={16} />
            <span>{currentMode.name}</span>
            <ChevronDown size={14} className={showModeSelector ? 'rotated' : ''} />
          </button>
          
          <button 
            className="header-btn"
            onClick={initiateCall}
            disabled={isCallConnected || isRinging}
            title="Voice call"
          >
            <Phone size={20} />
          </button>
          
          <button 
            className="header-btn"
            onClick={clearChat}
            title="Clear chat"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Mode Selector Dropdown */}
      {showModeSelector && (
        <div className="mode-dropdown">
          <div className="mode-header">
            <span>Choose Chat Mode</span>
            <button onClick={() => setShowModeSelector(false)}>
              <X size={18} />
            </button>
          </div>
          {CHAT_MODES.map((mode) => {
            const ModeIcon = mode.icon
            return (
              <button
                key={mode.id}
                className={`mode-option ${currentMode.id === mode.id ? 'active' : ''}`}
                onClick={() => handleModeChange(mode)}
                style={{ '--mode-color': mode.color }}
              >
                <div className="mode-icon" style={{ background: mode.color }}>
                  <ModeIcon size={18} />
                </div>
                <div className="mode-info">
                  <span>{mode.name}</span>
                  <small>{mode.description}</small>
                </div>
                {currentMode.id === mode.id && (
                  <Check size={16} className="check-icon" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        <div className="messages-list">
          {/* Welcome - Only show if hasn't chatted */}
          {!hasChatted && messages.length === 0 && (
            <div className="welcome-section">
              <div className="welcome-icon">
                <Sparkles size={40} />
              </div>
              <h3>Welcome to Aria</h3>
              <p>Your AI spiritual companion. Ask me anything about faith, scripture, or life.</p>
              <div className="welcome-features">
                <span><Sparkles size={14} /> AI-Powered</span>
                <span><Sparkles size={14} /> Voice Chat</span>
                <span><Sparkles size={14} /> 24/7 Available</span>
              </div>
              
              {/* Show suggested prompts immediately */}
              <div className="welcome-prompts">
                <p className="prompts-label">Try asking me:</p>
                <div className="quick-prompts">
                  {SUGGESTED_PROMPTS[currentMode.id].map((prompt, index) => (
                    <button 
                      key={index}
                      className="prompt-btn"
                      onClick={() => handleSuggestionClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <MessageBubble 
              key={index} 
              message={msg} 
              isLast={index === messages.length - 1}
            />
          ))}
          
          {/* Typing Indicator */}
          {(isLoading || isTyping) && (
            <div className="message-wrapper incoming">
              <div className="message-bubble typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <button className="input-btn" onClick={() => setShowModeSelector(!showModeSelector)}>
            <MoreVertical size={20} />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${currentMode.name}...`}
            disabled={isCallConnected}
          />
          
          {inputMessage.trim() ? (
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          ) : (
            <button className="mic-btn">
              <Mic size={20} />
            </button>
          )}
        </div>
        
        {/* Quick Prompts - Show only when has chatted but few messages */}
        {!isCallConnected && hasChatted && messages.length < 5 && (
          <div className="quick-prompts">
            {SUGGESTED_PROMPTS[currentMode.id].map((prompt, index) => (
              <button 
                key={index}
                className="prompt-btn"
                onClick={() => handleSuggestionClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Call Overlay */}
      <CallInterface 
        isRinging={isRinging}
        isConnected={isCallConnected}
        onAccept={() => acceptCall()}
        onDecline={declineCall}
        mode={currentMode}
        callDuration={callDuration}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        warningShown={warningShown}
      />

      <style>{`
        :root {
          --primary: #c9a227;
          --bg-dark: #0a0a0f;
          --bg-card: #141418;
          --text: #f5f5f5;
          --text-muted: #888;
          --border: rgba(255, 255, 255, 0.1);
        }

        .chat-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: transparent;
          position: relative;
          overflow: hidden;
        }

        .chat-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.2;
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease-out;
        }

        /* Header */
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(15, 15, 20, 0.95);
          border-bottom: 1px solid var(--border);
          z-index: 10;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
        }

        .header-info h2 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .header-info p {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        /* Mode Selector Button */
        .mode-selector-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid var(--mode-color, var(--primary));
          border-radius: 20px;
          color: var(--text);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-selector-btn:hover {
          background: rgba(201, 162, 39, 0.15);
        }

        .mode-selector-btn svg.rotated {
          transform: rotate(180deg);
        }

        .header-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .header-btn:hover:not(:disabled) {
          background: #374151;
          color: var(--text);
        }

        .header-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mode Dropdown */
        .mode-dropdown {
          position: absolute;
          top: 60px;
          right: 10px;
          background: rgba(30, 30, 40, 0.98);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 16px;
          z-index: 100;
          width: 300px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .mode-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .mode-header button {
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
        }

        .mode-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .mode-option:hover {
          background: rgba(201, 162, 39, 0.1);
        }

        .mode-option.active {
          background: rgba(201, 162, 39, 0.15);
        }

        .mode-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .mode-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .mode-info span {
          color: var(--text);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .mode-info small {
          color: #9CA3AF;
          font-size: 0.75rem;
        }

        .check-icon {
          color: var(--primary);
        }

        /* Messages */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          background: transparent;
          padding: 1rem 0;
          position: relative;
          z-index: 1;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 0.5rem;
        }

        .welcome-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          text-align: center;
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1rem;
          box-shadow: 0 10px 30px rgba(201, 162, 39, 0.3);
        }

        .welcome-section h3 {
          color: var(--text);
          font-size: 1.3rem;
          margin: 0 0 0.5rem;
        }

        .welcome-section p {
          color: #9CA3AF;
          font-size: 0.9rem;
          margin: 0 0 1rem;
          max-width: 300px;
        }

        .welcome-features {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .welcome-features span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--primary);
          font-size: 0.75rem;
        }

        .welcome-prompts {
          width: 100%;
          max-width: 400px;
        }

        .prompts-label {
          color: #9CA3AF;
          font-size: 0.8rem;
          margin: 0 0 0.75rem;
        }

        /* Message Bubbles */
        .message-wrapper {
          display: flex;
          margin: 0.25rem 0;
          position: relative;
        }

        .message-wrapper.incoming {
          justify-content: flex-start;
        }

        .message-wrapper.outgoing {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 75%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          position: relative;
        }

        .message-wrapper.incoming .message-bubble {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-top-left-radius: 4px;
        }

        .message-wrapper.outgoing .message-bubble {
          background: var(--primary);
          border-top-right-radius: 4px;
        }

        .message-bubble p, .message-content {
          margin: 0;
          color: var(--text);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .message-content blockquote {
          margin: 0.5rem 0;
          padding: 0.5rem 0.75rem;
          border-left: 3px solid var(--primary);
          background: rgba(201, 162, 39, 0.1);
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }

        .message-content li {
          margin-left: 1rem;
          list-style: disc;
        }

        .message-content .list-num {
          font-weight: 600;
        }

        .message-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.25rem;
          margin-top: 0.35rem;
        }

        .message-time {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .message-status {
          color: var(--text);
        }

        /* Message Actions */
        .message-actions {
          position: absolute;
          top: -10px;
          right: 0;
          display: flex;
          gap: 0.25rem;
          background: rgba(30, 30, 40, 0.95);
          border-radius: 20px;
          padding: 0.25rem;
          border: 1px solid var(--border);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .message-actions button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .message-actions button:hover {
          background: rgba(201, 162, 39, 0.2);
          color: var(--primary);
        }

        /* Emoji Picker */
        .emoji-picker {
          position: absolute;
          top: -40px;
          right: 50px;
          display: flex;
          gap: 0.25rem;
          background: rgba(30, 30, 40, 0.95);
          border-radius: 20px;
          padding: 0.35rem;
          border: 1px solid var(--border);
        }

        .emoji-picker button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s;
        }

        .emoji-picker button:hover {
          transform: scale(1.2);
        }

        /* Typing Indicator */
        .message-bubble.typing {
          display: flex;
          gap: 0.3rem;
          padding: 0.75rem 1rem;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        /* Input Area */
        .input-area {
          padding: 0.75rem 1rem 1rem;
          background: rgba(15, 15, 20, 0.95);
          border-top: 1px solid var(--border);
        }

        .input-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 0.5rem 0.75rem;
          transition: border-color 0.2s;
        }

        .input-container:focus-within {
          border-color: var(--primary);
        }

        .input-container input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 0.9rem;
          padding: 0.25rem 0.5rem;
        }

        .input-container input::placeholder {
          color: #9CA3AF;
        }

        .input-btn, .mic-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .input-btn:hover, .mic-btn:hover {
          background: rgba(201, 162, 39, 0.15);
          color: var(--primary);
        }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          border: none;
          color: #0a0a0f;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: #d4a017;
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Quick Prompts */
        .quick-prompts {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.75rem 0 0;
        }

        .quick-prompts::-webkit-scrollbar {
          display: none;
        }

        .prompt-btn {
          padding: 0.5rem 0.875rem;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 20px;
          color: #e4e4e7;
          font-size: 0.8rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }

        .prompt-btn:hover {
          background: rgba(201, 162, 39, 0.2);
          border-color: rgba(201, 162, 39, 0.5);
          transform: translateY(-1px);
        }

        /* Call Overlay */
        .call-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .call-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: white;
        }

        .call-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          border: 3px solid white;
        }

        .call-avatar.pulse {
          animation: pulse 0.8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .call-container h3 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem;
        }

        .call-status {
          font-size: 1rem;
          opacity: 0.8;
          margin: 0 0 2rem;
        }

        .call-duration {
          font-size: 2rem;
          font-weight: 300;
          margin: 0 0 0.25rem;
        }

        .call-mode {
          font-size: 0.875rem;
          opacity: 0.8;
          margin: 0 0 1.5rem;
        }

        .call-warning {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #ef4444;
        }

        .call-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }

        .call-actions, .connected-actions {
          display: flex;
          gap: 2rem;
        }

        .call-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .call-btn.decline { background: #ef4444; color: white; }
        .call-btn.accept { background: var(--primary); color: #0a0a0f; }
        .call-btn.end { background: #ef4444; color: white; }
        .call-btn.mute, .call-btn.speaker { background: rgba(255, 255, 255, 0.2); color: white; }
        .call-btn.mute.muted { background: #ef4444; color: white; }

        .call-btn:hover { transform: scale(1.1); }

        .connected-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 3px solid white;
        }

        .connected-avatar.warning {
          border-color: #ef4444;
          animation: warningPulse 1s ease-in-out infinite;
        }

        @keyframes warningPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .message-bubble { max-width: 88%; }
          .mode-dropdown { 
            width: calc(100% - 20px); 
            left: 10px; 
            right: 10px; 
            top: 55px; 
            border-radius: 12px; 
          }
          .mode-selector-btn span {
            display: none;
          }
          .quick-prompts {
            flex-wrap: nowrap;
          }
          .prompt-btn {
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default AIChat
