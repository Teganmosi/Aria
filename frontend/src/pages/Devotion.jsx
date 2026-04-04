import { useState, useEffect, useRef } from 'react'
import { Sun, Sparkles, Play, ArrowRight, Heart, Clock, MessageCircle } from 'lucide-react'
import { API_BASE_URL } from '../services/api'

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
    <div className="page-bg">
      <div className="bg-orb orb-1" style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }} />
      <div className="bg-orb orb-2" style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }} />
    </div>
  )
}

const DURATION_OPTIONS = [
  { id: 5, label: '5 min', desc: 'Quick devotional' },
  { id: 10, label: '10 min', desc: 'Short & sweet' },
  { id: 15, label: '15 min', desc: 'Standard time' },
  { id: 30, label: '30 min', desc: 'Deep time' },
]

const Devotion = () => {
  const [mode, setMode] = useState('select') // select, duration, day, teaching, pray, complete
  const [duration, setDuration] = useState(null)
  const [dayPlan, setDayPlan] = useState('')
  // eslint-disable-next-line no-unused-vars
  const [teaching, setTeaching] = useState({})
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

  // Step 1: Select duration
  const selectDuration = (mins) => {
    setDuration(mins)
    setMode('day')
  }

  // Step 2: Submit day plan and get AI-generated teaching
  const submitDayPlan = async () => {
    if (!dayPlan.trim()) return

    setIsLoading(true)
    setMode('teaching')

    const token = localStorage.getItem('authToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // Ask AI to generate a teaching based on their day
    const teachingPrompt = `The user wants a ${duration}-minute morning devotion. Here's what their day looks like:

"${dayPlan}"

Generate a personalized devotional teaching that:
1. **TOPIC**: A clear, specific topic/lesson relevant to their day (2-4 words)
2. **VERSE**: A powerful Bible verse that applies to their day
3. **ADDITIONAL VERSES**: 1-2 more verses that reinforce this topic
4. **TEACHING**: A brief, warm teaching (2-3 paragraphs) that connects their day's activities/challenges to God's Word

Format:
---
**TOPIC:** [Topic name]

**MAIN VERSE:** [Book Chapter:Verse - "Verse text"]

**MORE LIGHT:** 
- [Book Chapter:Verse - "Verse text"]
- [Book Chapter:Verse - "Verse text"]

**DEVOTION:**
[Your teaching here - warm, personal, applicable to their day]
---`

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: teachingPrompt }],
          mode: 'devotion'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTeaching(data.content)
        
        // Also set up the message for the chat
        setMessages([
          { role: 'companion', content: `Here's what God has for you today! 💛\n\n${data.content}\n\nTake your time to reflect on this. What resonates with you?` }
        ])
      }
    } catch (err) {
      console.error(err)
      setTeaching(`**TOPIC:** Trust in God's Plan\n\n**MAIN VERSE:** Proverbs 3:5-6 - "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways acknowledge him, and he will make your paths straight."\n\n**MORE LIGHT:** \n- Psalm 32:8 - "I will instruct you and teach you in the way you should go"\n- Isaiah 40:31 - "They who wait for the Lord shall renew their strength"\n\n**DEVOTION:**\nDear friend, as you go through your day, remember that God is with you. Whatever challenges or plans you face, trust Him to guide your steps. He knows every detail of your day and wants to walk with you through it. ${dayPlan.includes('stress') || dayPlan.includes('worried') ? 'When worry tries to creep in, remember: You can cast your cares on Him because He cares for you.' : 'As you navigate your plans, keep your heart open to His guidance. He may have surprises along the way!'} May this devotion bless your day!`)
      
      setMessages([
        { role: 'companion', content: `Here's what God has for you today! 💛\n\n**TOPIC:** Trust in God's Plan\n\n**MAIN VERSE:** Proverbs 3:5-6 - "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways acknowledge him, and he will make your paths straight."\n\n**DEVOTION:**\nDear friend, as you go through your day, remember that God is with you. Whatever challenges or plans you face, trust Him to guide your steps. He knows every detail of your day and wants to walk with you through it.\n\nTake your time to reflect on this. What resonates with you?` }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Continue conversation or end with prayer
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

      const token = localStorage.getItem('authToken')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const prompt = `You are a warm, faith-filled daily devotion companion. 

User's day: "${dayPlan}"

Previous conversation:
${conversationContext}

User just said: "${userMsg}"

Respond with warmth:
- Acknowledge what they shared
- Offer spiritual insight
- Ask a simple follow-up question
- Keep it conversational and brief

Don't use bullet points.`

      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          mode: 'devotion'
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
        content: "I'm here with you. What else is on your heart?" 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Step 4: End with personalized prayer
  const endWithPrayer = async () => {
    setMode('pray')
    setIsLoading(true)

    const token = localStorage.getItem('authToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // Get conversation context for prayer
    const conversationContext = messages.map(m => 
      `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`
    ).join('\n\n')

    const prayerPrompt = `Generate a heartfelt, personal prayer for the user's day.

Here's what their day looks like:
"${dayPlan}"

Here's what they shared during our devotion:
${conversationContext}

Write a prayer (3-5 sentences) that:
- Thanks God for this devotion time
- Prays specifically for their day based on what they shared
- Asks for God's presence and guidance throughout their day
- Ends with "Amen."

After the prayer, add a brief warm closing (1 sentence).`

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: prayerPrompt }],
          mode: 'devotion'
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
        content: `Father, thank you for this time in your Word. I pray that as I go through my day - ${dayPlan} - you would be with me every step. Give me the strength, wisdom, and peace I need. Help me to live out what you've taught me today. In Jesus' name, Amen.\n\nGo in peace, friend! God bless your day! 💛`
      }])
    } finally {
      setIsLoading(false)
      setMode('complete')
    }
  }

  const startNewDevotion = () => {
    setMode('select')
    setDuration(null)
    setDayPlan('')
    setTeaching(null)
    setMessages([])
  }

  return (
    <div className="page-container">
      <AnimatedBackground />
      
      <div className="page-content">
        {/* Hero */}
        {(mode === 'select' || mode === 'day') && (
          <div className="hero-section">
            <div className="hero-icon">
              <Sun size={32} />
            </div>
            <h1>Daily Devotion</h1>
            <p>Let's spend time with God together</p>
          </div>
        )}

        {/* Step 1: Duration Selection */}
        {mode === 'select' && (
          <div className="input-card">
            <div className="card-header">
              <Clock size={20} />
              <h2>How much time do you have?</h2>
            </div>
            
            <div className="duration-grid">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className="duration-btn"
                  onClick={() => selectDuration(opt.id)}
                >
                  <span className="duration-label">{opt.label}</span>
                  <span className="duration-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Day Plan Input */}
        {mode === 'day' && (
          <div className="input-card">
            <div className="card-header">
              <MessageCircle size={20} />
              <h2>Tell me about your day</h2>
            </div>
            
            <p className="prompt-text">
              What's on your mind? What do you have planned? Any challenges you're facing?
            </p>
            
            <textarea
              value={dayPlan}
              onChange={(e) => setDayPlan(e.target.value)}
              placeholder="e.g., I have a big meeting today, I'm feeling nervous about..."
              rows={5}
            />

            <button 
              onClick={submitDayPlan} 
              className="btn btn-primary btn-large" 
              disabled={isLoading || !dayPlan.trim()}
            >
              {isLoading ? 'Preparing your devotion...' : (
                <>
                  <Sparkles size={18} />
                  Get My Devotion
                </>
              )}
            </button>
          </div>
        )}

        {/* Teaching & Discussion */}
        {(mode === 'teaching' || mode === 'pray' || mode === 'complete') && (
          <div className="companion-container">
            {/* Chat */}
            <div className="chat-section">
              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'companion' ? '☀️' : '👤'}
                    </div>
                    <div className="message-content">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message companion">
                    <div className="message-avatar">☀️</div>
                    <div className="message-content typing">
                      <span>•</span><span>•</span><span>•</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input - only in teaching mode */}
              {mode === 'teaching' && (
                <div className="input-area">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Share your thoughts..."
                    disabled={isLoading}
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={isLoading || !userMessage.trim()}
                    className="send-btn"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {/* Prayer Button */}
              {mode === 'teaching' && messages.length > 1 && (
                <div className="prayer-actions">
                  <button onClick={endWithPrayer} className="btn btn-gold">
                    <Heart size={18} />
                    End with Prayer
                  </button>
                </div>
              )}

              {/* Start New */}
              {mode === 'complete' && (
                <div className="new-devotion">
                  <button onClick={startNewDevotion} className="btn btn-outline">
                    <Sparkles size={18} />
                    New Devotion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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

        .page-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
        }

        .bg-orb.orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
          top: 20%;
          left: 10%;
        }

        .bg-orb.orb-2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
          bottom: 20%;
          right: 10%;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .hero-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
          margin: 0 auto 1.25rem;
        }

        .hero-section h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.5rem;
        }

        .hero-section p {
          color: var(--text-muted);
          font-size: 1.05rem;
          margin: 0;
        }

        .input-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: #f59e0b;
        }

        .card-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .prompt-text {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0 0 1rem;
          line-height: 1.5;
        }

        .duration-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .duration-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .duration-btn:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .duration-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
        }

        .duration-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        textarea {
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.95rem;
          resize: none;
          font-family: inherit;
          color: var(--text);
          margin-bottom: 1rem;
        }

        textarea:focus {
          outline: none;
          border-color: #f59e0b;
        }

        textarea::placeholder {
          color: var(--text-muted);
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-large {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }

        .btn-gold {
          background: linear-gradient(135deg, #c9a227, #a88620);
          color: white;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Chat Section */
        .companion-container {
          display: flex;
          flex-direction: column;
        }

        .chat-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          max-width: 90%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.companion {
          align-self: flex-start;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: rgba(245, 158, 11, 0.2);
        }

        .message.companion .message-avatar {
          background: rgba(251, 191, 36, 0.2);
        }

        .message-content {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem 1.25rem;
          border-radius: 16px;
          line-height: 1.6;
          color: var(--text);
          font-size: 0.95rem;
        }

        .message.user .message-content {
          background: rgba(245, 158, 11, 0.15);
          border-bottom-right-radius: 4px;
        }

        .message.companion .message-content {
          border-bottom-left-radius: 4px;
        }

        .message-content.typing span {
          animation: blink 1.4s infinite;
          color: #f59e0b;
        }

        .message-content.typing span:nth-child(2) { animation-delay: 0.2s; }
        .message-content.typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        /* Input Area */
        .input-area {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .input-area input {
          flex: 1;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 0.95rem;
          color: var(--text);
        }

        .input-area input:focus {
          outline: none;
          border-color: #f59e0b;
        }

        .send-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Actions */
        .prayer-actions, .new-devotion {
          padding: 1rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        @media (max-width: 640px) {
          .duration-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Devotion
