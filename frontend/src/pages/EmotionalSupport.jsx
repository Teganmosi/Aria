import { useState, useEffect, useRef } from 'react'
import { Heart, Sparkles, Play, ArrowRight, HeartHandshake } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'

const SITUATIONS = [
  { id: 'struggle', label: 'Struggling with something', emoji: '😔', color: '#f59e0b' },
  { id: 'lonely', label: 'Feeling alone', emoji: '😢', color: '#3b82f6' },
  { id: 'anxious', label: 'Anxiety or worry', emoji: '😰', color: '#ef4444' },
  { id: 'confused', label: 'Feeling confused', emoji: '😕', color: '#8b5cf6' },
  { id: 'hurt', label: 'Hurting emotionally', emoji: '💔', color: '#ec4899' },
  { id: 'faith', label: 'Faith questions', emoji: '✝️', color: '#10b981' },
  { id: 'thankful', label: 'Grateful for blessings', emoji: '🙏', color: '#c9a227' },
  { id: 'other', label: 'Just want to talk', emoji: '💬', color: '#6b7280' },
]

const EmotionalSupport = () => {
  const [mode, setMode] = useState('select')
  const [selectedSituation, setSelectedSituation] = useState(null)
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
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
    const token = localStorage.getItem('authToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const welcomePrompt = `You are a compassionate Christian companion. They're coming to you with: "${situationInfo.label}"

Write a warm, welcoming message (2-3 sentences) that:
- Acknowledges their situation with empathy
- Reassures them that God is with them and they're not alone
- Invites them to share more at their own pace

Be warm, pastoral, and reassuring. Don't use bullet points.`

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: welcomePrompt }],
          mode: 'emotionalSupport'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([{ role: 'companion', content: data.content }])
      }
    } catch (err) {
      console.error(err)
      setMessages([{ 
        role: 'companion', 
        content: `Friend, I'm so glad you're here. 💛\n\nYou don't have to carry this alone - God is with you, and I'm here to walk alongside you. Take your time, share as much or as little as you'd like. I'm listening.` 
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
      const conversationContext = messages.map(m => 
        `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`
      ).join('\n\n')

      const situationInfo = SITUATIONS.find(s => s.id === selectedSituation)
      const token = localStorage.getItem('authToken')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const prompt = `You are a compassionate Christian companion. They're sharing about: "${situationInfo.label}"

You are NOT a therapist - you're a faith companion who:
- Points them to God's love
- Reminds them of Biblical truths
- Prays with and for them

Previous conversation:
${conversationContext}

User just said: "${userMsg}"

Respond with empathy and gentle biblical encouragement. Keep it conversational.`

      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          mode: 'emotionalSupport'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { 
          role: 'companion', 
          content: data.content 
        }])
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { 
        role: 'companion', 
        content: "I'm here with you, friend." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const endSession = () => {
    setSessionComplete(true)
    setMessages(prev => [...prev, { 
      role: 'companion', 
      content: `Friend, thank you for opening up today. 💛\n\nGod is with you in this. You're never alone. I'm always here if you need to talk again. Take care!` 
    }])
  }

  const startNewSession = () => {
    setMode('select')
    setSelectedSituation(null)
    setMessages([])
    setSessionComplete(false)
  }

  const selectedSituationInfo = SITUATIONS.find(s => s.id === selectedSituation)

  return (
    <div className="support-page">
      <div className="page-header">
        <div className="header-icon">
          <HeartHandshake size={28} />
        </div>
        <div className="header-text">
          <h1>Faith Companion</h1>
          <p>A safe space to talk about what's on your heart</p>
        </div>
      </div>

      {mode === 'select' && (
        <div className="selection-card">
          <div className="selection-intro">
            <h2>What's on your heart today?</h2>
            <p>I'm here as your faith companion - someone who will listen, reassure you, and point you to God's love. You don't have to talk to a pastor or therapist.</p>
          </div>

          <div className="situation-grid">
            {SITUATIONS.map((situation) => (
              <button
                key={situation.id}
                className={`situation-btn ${selectedSituation === situation.id ? 'selected' : ''}`}
                onClick={() => setSelectedSituation(situation.id)}
                style={selectedSituation === situation.id ? { 
                  borderColor: situation.color, 
                  background: `${situation.color}15`
                } : {}}
              >
                <span className="situation-emoji">{situation.emoji}</span>
                <span className="situation-label">{situation.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={startCompanion} 
            className="btn-start"
            disabled={isLoading || !selectedSituation}
          >
            {isLoading ? 'Connecting...' : (
              <>
                <Play size={20} />
                Let's Talk
              </>
            )}
          </button>
        </div>
      )}

      {mode === 'companion' && (
        <div className="companion-wrapper">
          <div className="companion-main">
            <div className="status-bar">
              <div className="status-avatar" style={{ background: selectedSituationInfo?.color }}>
                {selectedSituationInfo?.emoji}
              </div>
              <div className="status-info">
                <span className="status-label">Talking about</span>
                <span className="status-topic">{selectedSituationInfo?.label}</span>
              </div>
              {messages.length > 2 && !sessionComplete && (
                <button onClick={endSession} className="btn-end-small">End Conversation</button>
              )}
            </div>

            <div className="chat-container">
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`msg-row ${msg.role}`}>
                    <div className="msg-avatar">
                      {msg.role === 'companion' ? '✝️' : '👤'}
                    </div>
                    <div className="msg-bubble">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="msg-row companion">
                    <div className="msg-avatar">✝️</div>
                    <div className="msg-bubble typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {!sessionComplete && (
                <div className="input-row">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Share what's on your heart..."
                    disabled={isLoading}
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={isLoading || !userMessage.trim()}
                    className="btn-send"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {sessionComplete && (
                <div className="action-row">
                  <button onClick={startNewSession} className="btn-new">
                    <Sparkles size={18} />
                    Talk About Something Else
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .support-page {
          padding: 2rem 3rem;
          max-width: 100%;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.2));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ec4899;
        }

        .header-text h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #f5f5f5;
          margin: 0;
        }

        .header-text p {
          color: #888;
          font-size: 1rem;
          margin: 0.25rem 0 0;
        }

        .selection-card {
          background: #141418;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .selection-intro {
          text-align: center;
          margin-bottom: 2rem;
        }

        .selection-intro h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f5f5f5;
          margin: 0 0 0.75rem;
        }

        .selection-intro p {
          color: #888;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .situation-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .situation-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .situation-btn:hover {
          background: rgba(236, 72, 153, 0.08);
          border-color: rgba(236, 72, 153, 0.3);
          transform: translateY(-2px);
        }

        .situation-btn.selected {
          border-width: 2px;
        }

        .situation-emoji {
          font-size: 2rem;
        }

        .situation-label {
          color: #ccc;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
        }

        .btn-start {
          display: block;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          padding: 1.125rem 2rem;
          background: linear-gradient(135deg, #ec4899, #be185d);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          transition: all 0.2s;
        }

        .btn-start:hover:not(:disabled) {
          background: linear-gradient(135deg, #f472b6, #ec4899);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.3);
        }

        .btn-start:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Companion */
        .companion-wrapper {
          display: flex;
          gap: 1.5rem;
        }

        .companion-main {
          flex: 1;
          max-width: 900px;
        }

        .status-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #141418;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          margin-bottom: 1rem;
        }

        .status-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .status-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .status-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-topic {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f5f5f5;
        }

        .btn-end-small {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #888;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-end-small:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f5f5f5;
        }

        .chat-container {
          background: #141418;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .messages-list {
          flex: 1;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: 450px;
          overflow-y: auto;
        }

        .msg-row {
          display: flex;
          gap: 1rem;
          max-width: 80%;
        }

        .msg-row.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .msg-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .msg-row.user .msg-avatar {
          background: rgba(236, 72, 153, 0.2);
        }

        .msg-row.companion .msg-avatar {
          background: rgba(16, 185, 129, 0.2);
        }

        .msg-bubble {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.125rem 1.5rem;
          border-radius: 18px;
          line-height: 1.65;
          color: #f5f5f5;
          font-size: 1rem;
        }

        .msg-row.user .msg-bubble {
          background: rgba(236, 72, 153, 0.15);
          border-bottom-right-radius: 6px;
        }

        .msg-row.companion .msg-bubble {
          border-bottom-left-radius: 6px;
        }

        .msg-bubble.typing {
          display: flex;
          gap: 0.375rem;
          padding: 1.125rem 1.75rem;
        }

        .msg-bubble.typing span {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .msg-bubble.typing span:nth-child(1) { animation-delay: 0s; }
        .msg-bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
        .msg-bubble.typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .input-row {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-row input {
          flex: 1;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          font-size: 1rem;
          color: #f5f5f5;
        }

        .input-row input:focus {
          outline: none;
          border-color: #ec4899;
        }

        .btn-send {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ec4899, #be185d);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-send:hover:not(:disabled) {
          background: linear-gradient(135deg, #f472b6, #ec4899);
        }

        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-row {
          padding: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .btn-new {
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #c9a227, #a88620);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 1100px) {
          .situation-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .support-page {
            padding: 1.5rem 2rem;
          }
        }

        @media (max-width: 768px) {
          .support-page {
            padding: 1rem;
          }
          
          .selection-card {
            padding: 1.5rem;
          }
          
          .msg-row {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  )
}

export default EmotionalSupport
