import { useState, useEffect, useRef } from 'react'
import { BookOpen, Sparkles, MessageCircle, Play, RefreshCw, Plus, Clock, ArrowRight, Heart, Search, Scroll, X } from 'lucide-react'
import { bibleService } from '../services/api'
import { AnimatedBackground } from './LandingPage'

// Detect input type from user input
const detectInputType = (input) => {
  const trimmed = input.trim().toLowerCase()
  const versePattern = /^(\d?\s*[a-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/i
  const verseMatch = trimmed.match(versePattern)
  if (verseMatch) {
    return { type: 'verse', book: verseMatch[1].trim(), chapter: verseMatch[2], verse: verseMatch[3], endVerse: verseMatch[4] }
  }
  const chapterPattern = /^(\d?\s*[a-z]+)\s+(\d+)$/i
  const chapterMatch = trimmed.match(chapterPattern)
  if (chapterMatch) {
    return { type: 'chapter', book: chapterMatch[1].trim(), chapter: chapterMatch[2] }
  }
  return { type: 'topic', topic: trimmed }
}

const BibleStudy = () => {
  const [mode, setMode] = useState('select') // select, study, pray
  const [userInput, setUserInput] = useState('')
  const [inputType, setInputType] = useState(null)
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
        } catch { }
        if (!content) content = { type: 'topic', topic: userInput.trim(), reference: null, text: null }
      } else if (typeInfo.type === 'chapter') {
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
          content = { type: 'topic', topic: userInput.trim(), reference: null, text: null }
        }
      } else {
        content = { type: 'topic', topic: typeInfo.topic, reference: null, text: null }
      }

      setStudyContent(content)
      setMode('study')

      if (content.type === 'verse') {
        setMessages([{ role: 'companion', content: `Welcome to our study! 🕊️ We're looking at ${content.reference}: "${content.text}". What strikes you most about these words?` }])
      } else if (content.type === 'chapter') {
        setMessages([{ role: 'companion', content: `Let's dive into ${content.reference} together. It's a powerful chapter with ${content.verses?.length || 0} verses. Is there a specific part you'd like to reflect on first?` }])
      } else {
        try {
          const topicPrompt = `Welcome the user to a Bible study on "${content.topic}". Be warm, faith-filled, and ask what specifically they'd like to explore in scripture about this topic. 2 sentences maximum.`
          const token = localStorage.getItem('authToken')
          const headers = { 'Content-Type': 'application/json' }
          if (token) headers['Authorization'] = `Bearer ${token}`
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/ai/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ messages: [{ role: 'user', content: topicPrompt }], mode: 'bibleStudy' })
          })
          if (response.ok) {
            const data = await response.json()
            setMessages([{ role: 'companion', content: data.content }])
          }
        } catch {
          setMessages([{ role: 'companion', content: `Hello! I'm so glad we're exploring "${content.topic}" together today. Where should we begin our reflection?` }])
        }
      }
    } catch (err) {
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
      const conversationContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`).join('\n\n')
      let studyContext = studyContent?.type === 'verse' ? `Studying: "${studyContent.text}" (${studyContent.reference})` : `Studying: ${studyContent?.reference || studyContent?.topic}`
      const token = localStorage.getItem('authToken')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const prompt = `You are a warm, supportive Bible study companion. ${studyContext}. Previous conversation: ${conversationContext}. User just said: "${userMsg}". Respond as a friend in faith, sharing scriptural depth and invting more reflection. Keep it conversational and warm. No bullet points.`
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], mode: 'bibleStudy' })
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'companion', content: data.content }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'companion', content: "I'm reflecting on what you said. Could you share a bit more of your heart on this?" }])
    } finally {
      setIsLoading(false)
    }
  }

  const endStudy = () => {
    setIsPrayerMode(true)
    setMessages(prev => [...prev, { role: 'companion', content: `It has been such a blessing studying with you. 💛 May I offer a closing prayer for our time today?` }])
    setMode('pray')
  }

  const finishPrayer = async () => {
    setStudyComplete(true)
    setIsLoading(true)
    const conversationContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content}`).join('\n\n')
    const token = localStorage.getItem('authToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const studyContext = studyContent?.reference || studyContent?.topic
    const prayerPrompt = `Write a heartfelt closing prayer for a Bible study session on ${studyContext}. Reference the conversation: ${conversationContext}. 3-4 sentences. End with "Amen."`
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: [{ role: 'user', content: prayerPrompt }], mode: 'bibleStudy' })
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'companion', content: data.content }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'companion', content: `Heavenly Father, thank you for this time of study. Bless the seeds sown today and let them grow in this heart. Amen. 🌿` }])
    } finally {
      setIsLoading(false)
    }
  }

  const hint = (() => {
    if (!inputType) return null
    if (inputType.type === 'verse') return { icon: BookOpen, label: 'Scripture Verse', color: 'var(--brand-accent)' }
    if (inputType.type === 'chapter') return { icon: Scroll, label: 'Full Chapter', color: '#10b981' }
    return { icon: Search, label: 'Theological Topic', color: 'var(--text-muted)' }
  })()

  return (
    <div className="study-page">
      <AnimatedBackground />

      <div className="study-content-wrapper">
        {mode === 'select' && (
          <div className="selection-view">
            <div className="hero-branding">
              <div className="sparkle-icon"><Sparkles size={32} /></div>
              <h1 className="font-serif">Study Sanctuary</h1>
              <p>Guided reflections through the wisdom of the Word.</p>
            </div>

            <div className="input-panel glass-panel">
              <div className="panel-header">
                <BookOpen size={20} color="var(--brand-accent)" />
                <span className="font-serif">What shall we explore today?</span>
              </div>

              <div className="search-field">
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Reference a verse, chapter, or topic..."
                  className="sanctuary-input"
                  onKeyPress={(e) => e.key === 'Enter' && startStudy()}
                />
                {hint && (
                  <div className="type-hint" style={{ color: hint.color }}>
                    <hint.icon size={14} />
                    <span>{hint.label}</span>
                  </div>
                )}
              </div>

              <div className="example-tags">
                <span className="tag-label">Inspirations:</span>
                {['Romans 8:28', 'Psalm 23', 'Faith', 'God\'s Love', 'Forgiveness'].map(ex => (
                  <button key={ex} className="tag-btn glass-panel" onClick={() => { setUserInput(ex); setInputType(detectInputType(ex)); }}>{ex}</button>
                ))}
              </div>

              <button
                onClick={startStudy}
                className="begin-button"
                disabled={isLoading || !userInput.trim()}
              >
                {isLoading ? <RefreshCw className="spinning" size={20} /> : <Play size={20} />}
                <span>{isLoading ? 'Preparing Sanctuary...' : 'Begin Study'}</span>
              </button>
            </div>
          </div>
        )}

        {(mode === 'study' || mode === 'pray') && studyContent && (
          <div className="session-view">
            {/* Header Banner */}
            <div className="session-banner glass-panel">
              <div className="banner-info">
                {studyContent.type === 'topic' ? <Search size={22} color="var(--brand-accent)" /> : <BookOpen size={22} color="var(--brand-accent)" />}
                <div>
                  <h2 className="font-serif">{studyContent.reference || studyContent.topic}</h2>
                  <p>{studyContent.type === 'verse' ? 'Deep Reflection' : studyContent.type === 'chapter' ? 'Chapter Study' : 'Theological Exploration'}</p>
                </div>
              </div>
              <button className="close-session" onClick={() => setMode('select')}><X size={20} /></button>
            </div>

            {/* Scriptural Context for Verses */}
            {studyContent.text && (
              <div className="scripture-focus glass-panel">
                <p className="font-serif italic">"{studyContent.text}"</p>
              </div>
            )}

            {/* Consultation Chat */}
            <div className="study-chat-container">
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`msg-row ${msg.role}`}>
                    <div className={`msg-bubble ${msg.role === 'companion' ? 'glass-panel font-serif' : 'user-bubble'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="msg-row companion">
                    <div className="msg-bubble glass-panel typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-controls">
                {mode === 'study' && (
                  <div className="input-bar glass-panel">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Share your thoughts or questions..."
                      disabled={isLoading}
                    />
                    <button onClick={sendMessage} disabled={isLoading || !userMessage.trim()} className="send-btn">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}

                {mode === 'study' && messages.length > 2 && !studyComplete && (
                  <button onClick={endStudy} className="end-session-btn glass-panel font-serif">
                    <Heart size={18} color="var(--brand-accent)" />
                    <span>Complete Reflection & Pray</span>
                  </button>
                )}

                {isPrayerMode && !studyComplete && (
                  <button onClick={finishPrayer} className="prayer-button font-serif">
                    <Sparkles size={20} />
                    <span>Receive Closing Prayer</span>
                  </button>
                )}

                {studyComplete && (
                  <button onClick={() => setMode('select')} className="new-start-btn glass-panel font-serif">
                    <Plus size={18} />
                    <span>Start New Journey</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .study-page {
          min-height: 100vh;
          background: var(--bg-main);
          position: relative;
          color: var(--text-main);
        }

        .study-content-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 4rem 1.5rem;
          position: relative;
          z-index: 10;
        }

        /* Selection View */
        .selection-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
          text-align: center;
        }

        .hero-branding h1 { font-size: 3.5rem; margin: 1rem 0; }
        .hero-branding p { font-size: 1.25rem; color: var(--text-secondary); }
        .sparkle-icon { 
          width: 64px; height: 64px; background: var(--bg-card); border-radius: 20px;
          display: flex; align-items: center; justify-content: center; color: var(--brand-accent);
          margin: 0 auto; box-shadow: var(--shadow-main);
        }

        .input-panel {
          width: 100%;
          padding: 3rem;
          border-radius: 40px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-header { display: flex; align-items: center; justify-content: center; gap: 0.75rem; font-size: 1.25rem; }

        .search-field { position: relative; width: 100%; }
        .sanctuary-input {
          width: 100%; padding: 1.5rem 2rem; border-radius: 100px; border: 1px solid var(--border-color);
          background: var(--bg-hover); color: var(--text-main); font-size: 1.1rem; outline: none; transition: border-color 0.2s;
        }
        .sanctuary-input:focus { border-color: var(--brand-accent); }

        .type-hint {
          position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em;
        }

        .example-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }
        .tag-label { color: var(--text-muted); font-size: 0.9rem; align-self: center; }
        .tag-btn { padding: 0.5rem 1.25rem; border-radius: 100px; border: none; cursor: pointer; font-size: 0.9rem; color: var(--text-secondary); }
        .tag-btn:hover { color: var(--text-main); background: var(--bg-card); }

        .begin-button {
          margin-top: 1rem; padding: 1.5rem; border-radius: 100px; border: none;
          background: var(--brand-solid); color: white; font-size: 1.1rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 1rem;
          transition: transform 0.2s;
        }
        .begin-button:hover { transform: scale(1.02); }
        .begin-button:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Session View */
        .session-view { display: flex; flexDirection: column; gap: 1.5rem; }

        .session-banner {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 2rem; border-radius: 24px;
        }
        .banner-info { display: flex; align-items: center; gap: 1.25rem; text-align: left; }
        .banner-info h2 { margin: 0; font-size: 1.5rem; }
        .banner-info p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; }

        .close-session {
          background: var(--bg-hover); border: none; width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary);
        }

        .scripture-focus { padding: 2.5rem; border-radius: 32px; text-align: center; }
        .scripture-focus p { font-size: 1.5rem; line-height: 1.6; margin: 0; color: var(--text-main); }

        .study-chat-container { display: flex; flex-direction: column; gap: 2rem; min-height: 400px; }
        .messages-list { display: flex; flex-direction: column; gap: 1.5rem; }

        .msg-row { display: flex; width: 100%; }
        .msg-row.companion { justify-content: flex-start; }
        .msg-row.user { justify-content: flex-end; }

        .msg-bubble { max-width: 85%; padding: 1.5rem; border-radius: 24px; line-height: 1.6; font-size: 1.1rem; }
        .msg-row.companion .msg-bubble { border-top-left-radius: 4px; color: var(--text-main); }
        .msg-row.user .msg-bubble { 
          background: var(--brand-solid); color: white; border-top-right-radius: 4px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .chat-controls { display: flex; flex-direction: column; gap: 1rem; align-items: center; margin-top: 1rem; }

        .input-bar {
          width: 100%; display: flex; align-items: center; padding: 0.5rem 0.5rem 0.5rem 2rem; border-radius: 100px;
        }
        .input-bar input {
          flex: 1; background: none; border: none; outline: none; color: var(--text-main); font-size: 1.1rem;
        }
        .send-btn {
          width: 50px; height: 50px; background: var(--brand-solid); border: none; border-radius: 50%;
          color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }

        .end-session-btn, .new-start-btn {
          padding: 1rem 2rem; border-radius: 100px; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 0.75rem; font-weight: 600; color: var(--text-main);
          font-size: 1rem;
        }

        .prayer-button {
          background: var(--brand-solid); color: white; border: none; border-radius: 100px;
          padding: 1.25rem 3rem; font-weight: 700; font-size: 1.1rem; cursor: pointer;
          display: flex; align-items: center; gap: 1rem; box-shadow: 0 15px 30px rgba(201, 162, 39, 0.2);
        }

        .typing-indicator { display: flex; gap: 0.4rem; padding: 1rem 1.5rem; }
        .typing-indicator span { 
          width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spinning 1.5s linear infinite; }
      `}</style>
    </div>
  )
}

export default BibleStudy
