import { useState, useEffect, useRef } from 'react'
import { BookOpen, Sparkles, MessageCircle, Play, RefreshCw, Plus, Clock, ArrowRight, Heart, Search, Scroll } from 'lucide-react'
import { bibleService } from '../services/api'

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

// Detect input type from user input
const detectInputType = (input) => {
  const trimmed = input.trim().toLowerCase()
  
  // Check for verse pattern like "John 3:16" or "John 3:1-5"
  const versePattern = /^(\d?\s*[a-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/i
  const verseMatch = trimmed.match(versePattern)
  if (verseMatch) {
    return { type: 'verse', book: verseMatch[1].trim(), chapter: verseMatch[2], verse: verseMatch[3], endVerse: verseMatch[4] }
  }
  
  // Check for chapter pattern like "John 3" or "Psalm 23"
  const chapterPattern = /^(\d?\s*[a-z]+)\s+(\d+)$/i
  const chapterMatch = trimmed.match(chapterPattern)
  if (chapterMatch) {
    return { type: 'chapter', book: chapterMatch[1].trim(), chapter: chapterMatch[2] }
  }
  
  // Otherwise, treat as topic
  return { type: 'topic', topic: trimmed }
}

const BibleStudy = () => {
  const [mode, setMode] = useState('select') // select, study, pray
  const [userInput, setUserInput] = useState('')
  const [inputType, setInputType] = useState(null) // verse, chapter, topic
  const [studyContent, setStudyContent] = useState(null)
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [studyComplete, setStudyComplete] = useState(false)
  const [isPrayerMode, setIsPrayerMode] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Detect input type as user types
  const handleInputChange = (e) => {
    const value = e.target.value
    setUserInput(value)
    if (value.trim()) {
      setInputType(detectInputType(value))
    } else {
      setInputType(null)
    }
  }

  const startStudy = async () => {
    if (!userInput.trim()) return

    const typeInfo = detectInputType(userInput)
    setInputType(typeInfo)
    setIsLoading(true)

    try {
      let content = null

      if (typeInfo.type === 'verse') {
        // Try to get the verse
        try {
          const data = await bibleService.getChapter(typeInfo.book.toLowerCase().trim(), parseInt(typeInfo.chapter))
          const verseNum = parseInt(typeInfo.verse)
          const foundVerse = data.verses?.find(v => v.verse === verseNum)
          
          if (foundVerse) {
            content = {
              type: 'verse',
              reference: `${typeInfo.book} ${typeInfo.chapter}:${typeInfo.verse}`,
              text: foundVerse.text,
              book: typeInfo.book,
              chapter: parseInt(typeInfo.chapter),
              verse: verseNum
            }
          }
        } catch {
          console.log('Verse not found, falling back to topic')
        }
        
        // If verse not found, treat as topic
        if (!content) {
          content = {
            type: 'topic',
            topic: userInput.trim(),
            reference: null,
            text: null
          }
        }
      } else if (typeInfo.type === 'chapter') {
        // Get the whole chapter
        try {
          const data = await bibleService.getChapter(typeInfo.book.toLowerCase().trim(), parseInt(typeInfo.chapter))
          const chapterText = data.verses?.map(v => v.text).join(' ')
          
          content = {
            type: 'chapter',
            reference: `${typeInfo.book} ${typeInfo.chapter}`,
            text: chapterText,
            verses: data.verses,
            book: typeInfo.book,
            chapter: parseInt(typeInfo.chapter)
          }
        } catch {
          // Fall back to topic
          content = {
            type: 'topic',
            topic: userInput.trim(),
            reference: null,
            text: null
          }
        }
      } else {
        // Topic - let AI handle it
        content = {
          type: 'topic',
          topic: typeInfo.topic,
          reference: null,
          text: null
        }
      }

      setStudyContent(content)

      // For verses and chapters, use static welcome
      // For topics, generate AI welcome
      if (content.type === 'verse') {
        const welcomeMessage = `Hi friend! 👋 I'm so glad you're here to study God's Word with me today. We're looking at "${content.text}" (${content.reference}).\n\nTake a moment to read it slowly. What stands out to you? What's on your heart as you read this passage?`
        setMessages([
          { role: 'companion', content: welcomeMessage }
        ])
        setMode('study')
      } else if (content.type === 'chapter') {
        const welcomeMessage = `Hi friend! 👋 I'm so glad you're here to study God's Word with me today. We're diving into ${content.reference} - that's a whole chapter!\n\nThis passage has ${content.verses?.length || 0} verses. Feel free to read through it at your own pace. What catches your attention? What would you like to explore together?`
        setMessages([
          { role: 'companion', content: welcomeMessage }
        ])
        setMode('study')
      } else {
        // For topics, generate AI-powered welcome message
        setMode('study')
        setMessages([
          { role: 'companion', content: 'Let me prepare something special for your study topic...' }
        ])
        
        // Call AI to generate a personalized welcome
        try {
          const topicPrompt = `You are a warm, faith-filled Bible study companion. The user wants to explore the topic: "${content.topic}"

Write a brief, welcoming introduction (2-3 sentences) that:
- Expresses genuine excitement about exploring this topic together
- Briefly mentions why this topic is meaningful in Scripture
- Ends with an open question inviting them to share what aspect they'd like to explore

Be conversational, warm, and not preachy. Don't use bullet points.`

          // Get auth token
          const token = localStorage.getItem('authToken')
          const headers = { 'Content-Type': 'application/json' }
          if (token) headers['Authorization'] = `Bearer ${token}`

          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/ai/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              messages: [{ role: 'user', content: topicPrompt }],
              mode: 'bibleStudy'
            })
          })

          if (response.ok) {
            const data = await response.json()
            setMessages([{ role: 'companion', content: data.content }])
          }
        } catch (err) {
          console.error(err)
          // Fallback message
          setMessages([
            { role: 'companion', content: `Hi friend! 👋 I'm so glad you're here to study God's Word with me today. You want to explore: "${content.topic}"\n\nThis is a wonderful topic! The Bible has so much to say about it. What aspect would you like to start with?` }
          ])
        }
      }

    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!userMessage.trim()) return
    
    const userMsg = userMessage.trim()
    setUserMessage('')
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      // Get conversation context
      const conversationContext = messages.map(m => 
        `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`
      ).join('\n\n')

      // Build context about what we're studying
      let studyContext = ''
      if (studyContent?.type === 'verse') {
        studyContext = `Current study passage: "${studyContent.text}" (${studyContent.reference})`
      } else if (studyContent?.type === 'chapter') {
        studyContext = `Current study passage: ${studyContent.reference} (${studyContent.verses?.length} verses)`
      } else {
        studyContext = `Current study topic: "${studyContent?.topic}"`
      }

      // Get auth token
      const token = localStorage.getItem('authToken')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      // Create prompt for AI
      const prompt = `You are a warm, faith-filled Bible study companion having a conversation with a friend. 
      
${studyContext}

Previous conversation:
${conversationContext}

User just said: "${userMsg}"

Respond naturally and conversationally as a friend in faith would. 
- Ask follow-up questions about what they think and feel
- Share insights from Scripture when relevant
- If you agree with their interpretation, affirm them warmly
- If you see things differently, share your perspective respectfully
- Keep it conversational, not preachy
- Ask what they think, invite them to share more
- If it's a topic study, help them explore different aspects and verses related to the topic

Be genuine, warm, and supportive. Don't use bullet points or overly structured responses.`

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          mode: 'bibleStudy'
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
        content: "I'm here with you. Would you like to share more about what you're thinking?" 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const endStudy = () => {
    setIsPrayerMode(true)
    setMessages(prev => [...prev, { 
      role: 'companion', 
      content: `Thank you for sharing your heart with me today, friend. 💛\n\nBefore we close, let me pray for you...` 
    }])
    setMode('pray')
  }

  const finishPrayer = async () => {
    setStudyComplete(true)
    setIsLoading(true)

    // Get the conversation to include in the prayer request
    const conversationContext = messages.map(m => 
      `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`
    ).join('\n\n')

    // Get auth token
    const token = localStorage.getItem('authToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // Build context about what was studied
    let studyContext = ''
    if (studyContent?.type === 'verse') {
      studyContext = `They were studying: "${studyContent.text}" (${studyContent.reference})`
    } else if (studyContent?.type === 'chapter') {
      studyContext = `They were studying: ${studyContent.reference}`
    } else {
      studyContext = `They were studying the topic: "${studyContent?.topic}"`
    }

    const prayerPrompt = `You are a warm, faith-filled Bible study companion. The user just clicked "Receive Prayer" at the end of their study session.

${studyContext}

Here's what they shared during the study:
${conversationContext}

Write a heartfelt, personal prayer (3-4 sentences) that:
- Thanks God for the conversation and what was discussed
- Prays specifically for things they mentioned or struggled with
- Asks for wisdom and application of what they learned
- Ends with encouragement

Make it personal based on what they shared. Don't use bullet points. End with "Amen." and then add a brief closing message about completing the session.`

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [{ role: 'user', content: prayerPrompt }],
          mode: 'bibleStudy'
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
      // Fallback prayer
      setMessages(prev => [...prev, { 
        role: 'companion', 
        content: `Father, thank you for your Word and for this time together. I pray that what we've discussed would take root in this person's heart and bear fruit in their life. Give them wisdom to apply what they've learned and draw them closer to you each day. We love you Lord. Amen.\n\n📖 You've completed this study session! Come back anytime to continue growing in faith together. 💛` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewStudy = () => {
    setMode('select')
    setUserInput('')
    setInputType(null)
    setStudyContent(null)
    setMessages([])
    setStudyComplete(false)
    setIsPrayerMode(false)
  }

  // Get icon and label for input type
  const getInputTypeHint = () => {
    if (!inputType) return null
    
    if (inputType.type === 'verse') {
      return { icon: BookOpen, label: 'Verse', color: '#8b5cf6' }
    } else if (inputType.type === 'chapter') {
      return { icon: Scroll, label: 'Chapter', color: '#10b981' }
    } else {
      return { icon: Search, label: 'Topic', color: '#c9a227' }
    }
  }

  const hint = getInputTypeHint()

  return (
    <div className="page-container">
      <AnimatedBackground />
      
      <div className="page-content">
        {/* Hero - Only show when selecting */}
        {mode === 'select' && (
          <div className="hero-section">
            <div className="hero-icon">
              <Sparkles size={32} />
            </div>
            <h1>Bible Study Companion</h1>
            <p>Let's study God's Word together — verse, chapter, or any topic</p>
          </div>
        )}

        {/* Input Section */}
        {mode === 'select' && (
          <div className="input-card">
            <div className="card-header">
              <BookOpen size={20} />
              <h2>What would you like to study today?</h2>
            </div>
            
            <div className="input-wrapper">
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Try: John 3:16, Psalm 23, or 'God's love'"
                className="main-input"
                onKeyPress={(e) => e.key === 'Enter' && startStudy()}
              />
              
              {/* Input type hint */}
              {hint && (
                <div className="input-hint" style={{ borderColor: hint.color, color: hint.color }}>
                  <hint.icon size={14} />
                  <span>{hint.label}</span>
                </div>
              )}
            </div>

            {/* Examples */}
            <div className="examples">
              <span className="examples-label">Try:</span>
              <button onClick={() => { setUserInput('John 3:16'); setInputType(detectInputType('John 3:16')); }}>John 3:16</button>
              <button onClick={() => { setUserInput('Psalm 23'); setInputType(detectInputType('Psalm 23')); }}>Psalm 23</button>
              <button onClick={() => { setUserInput('Faith'); setInputType(detectInputType('Faith')); }}>Faith</button>
              <button onClick={() => { setUserInput('God\'s love'); setInputType(detectInputType('God\'s love')); }}>God's love</button>
              <button onClick={() => { setUserInput('Prayer'); setInputType(detectInputType('Prayer')); }}>Prayer</button>
            </div>

            <button 
              onClick={startStudy} 
              className="btn btn-primary btn-large" 
              disabled={isLoading || !userInput.trim()}
            >
              {isLoading ? 'Loading...' : (
                <>
                  <Play size={18} />
                  Begin Study
                </>
              )}
            </button>
          </div>
        )}

        {/* Study Mode */}
        {(mode === 'study' || mode === 'pray') && studyContent && (
          <div className="study-container">
            {/* Content Banner */}
            {studyContent.type !== 'topic' && (
              <div className="verse-banner">
                <span className="verse-ref">
                  {studyContent.type === 'chapter' && <Scroll size={14} />}
                  {studyContent.type === 'verse' && <BookOpen size={14} />}
                  {' '}{studyContent.reference}
                </span>
                {studyContent.text && (
                  <p className="verse-text">
                    {studyContent.type === 'verse' 
                      ? `"${studyContent.text}"`
                      : `${studyContent.verses?.slice(0, 3).map(v => v.text).join(' ')}...`
                    }
                  </p>
                )}
                {studyContent.type === 'topic' && (
                  <p className="topic-text">Exploring: {studyContent.topic}</p>
                )}
              </div>
            )}

            {studyContent.type === 'topic' && (
              <div className="topic-banner">
                <Search size={20} />
                <div>
                  <span className="topic-label">Exploring Topic</span>
                  <h3>{studyContent.topic}</h3>
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="chat-section">
              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'companion' ? '✝️' : '👤'}
                    </div>
                    <div className="message-content">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message companion">
                    <div className="message-avatar">✝️</div>
                    <div className="message-content typing">
                      <span>•</span><span>•</span><span>•</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {mode === 'study' && (
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

              {/* Actions */}
              {mode === 'study' && messages.length > 2 && !studyComplete && (
                <div className="study-actions">
                  <button onClick={endStudy} className="btn btn-gold">
                    <Heart size={18} />
                    End & Pray
                  </button>
                </div>
              )}

              {/* Prayer Mode */}
              {isPrayerMode && !studyComplete && (
                <div className="prayer-actions">
                  <button onClick={finishPrayer} className="btn btn-primary">
                    <Heart size={18} />
                    Receive Prayer
                  </button>
                </div>
              )}

              {/* Start New */}
              {studyComplete && (
                <div className="new-study">
                  <button onClick={startNewStudy} className="btn btn-outline">
                    <Plus size={18} />
                    Start New Study
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
          background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
          top: 20%;
          left: 10%;
        }

        .bg-orb.orb-2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #c9a227 0%, transparent 70%);
          bottom: 20%;
          right: 10%;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
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
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(201, 162, 39, 0.2));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a78bfa;
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
          margin-bottom: 1.25rem;
          color: #a78bfa;
        }

        .card-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 1rem;
        }

        .main-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 1rem;
          color: var(--text);
          transition: border-color 0.2s;
        }

        .main-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .main-input::placeholder {
          color: var(--text-muted);
        }

        .input-hint {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.65rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .examples {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .examples-label {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .examples button {
          padding: 0.35rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .examples button:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: #8b5cf6;
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
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
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

        /* Study Container */
        .study-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .verse-banner, .topic-banner {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(201, 162, 39, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
        }

        .topic-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: left;
        }

        .topic-banner svg {
          color: #c9a227;
        }

        .topic-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .topic-banner h3 {
          margin: 0;
          color: var(--text);
          font-size: 1.25rem;
        }

        .verse-ref {
          color: #a78bfa;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .verse-banner .verse-text {
          color: var(--text);
          font-size: 1rem;
          font-style: italic;
          line-height: 1.6;
          margin: 0;
        }

        .topic-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin: 0;
        }

        /* Chat Section */
        .chat-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          max-height: 60vh;
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
          background: rgba(201, 162, 39, 0.2);
        }

        .message.companion .message-avatar {
          background: rgba(139, 92, 246, 0.2);
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
          background: rgba(201, 162, 39, 0.15);
          border-bottom-right-radius: 4px;
        }

        .message.companion .message-content {
          border-bottom-left-radius: 4px;
        }

        .message-content.typing span {
          animation: blink 1.4s infinite;
          color: #a78bfa;
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
          border-color: #8b5cf6;
        }

        .send-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Study Actions */
        .study-actions, .prayer-actions, .new-study {
          padding: 1rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default BibleStudy
