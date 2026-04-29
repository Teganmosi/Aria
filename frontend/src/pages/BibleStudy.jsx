import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { BookOpen, Sparkles, MessageCircle, Play, RefreshCw, Plus, Clock, ArrowRight, Heart, Search, Scroll, X, Quote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { bibleService, aiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
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
  const { user } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState('select') // select, study, pray
  const [userInput, setUserInput] = useState('')
  const [inputType, setInputType] = useState(null)
  const [studyContent, setStudyContent] = useState(null)
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [studyComplete, setStudyComplete] = useState(false)
  const [isPrayerMode, setIsPrayerMode] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (location.state?.selectedText && mode === 'select') {
      const { book, chapter, selectedText } = location.state
      handleSelectionStudy(book, chapter, selectedText)
      // Clear location state
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleSelectionStudy = async (book, chapter, text) => {
    setIsLoading(true)
    const content = {
      type: 'selection',
      reference: `${book} ${chapter}`,
      text: text,
      book: book,
      chapter: chapter
    }
    setStudyContent(content)
    setMode('study')

    try {
      const session = await bibleService.createStudySession(book, chapter, [], text)
      setSessionId(session.id)
      
      const initialMsg = `Welcome! 🕊️ I see you've selected a specific passage from ${book} ${chapter}: "${text}". It's a beautiful selection. What speaks to your heart about these specific words?`
      setMessages([{ role: 'companion', content: initialMsg }])
      await bibleService.createStudyMessage(session.id, 'assistant', initialMsg)
    } catch (err) {
      console.error('Failed to start selection study', err)
    } finally {
      setIsLoading(false)
    }
  }

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

      // Create session in database
      try {
        const session = await bibleService.createStudySession(
          content.book || content.topic || "Unknown",
          content.chapter || 0,
          (content.verse ? [content.verse] : []),
          content.text || content.topic || ""
        )
        setSessionId(session.id)

        let initialMsg = ""
        if (content.type === 'verse') {
          initialMsg = `Welcome to our study! 🕊️ We're looking at ${content.reference}: "${content.text}". What strikes you most about these words?`
        } else if (content.type === 'chapter') {
          initialMsg = `Let's dive into ${content.reference} together. It's a powerful chapter with ${content.verses?.length || 0} verses. Is there a specific part you'd like to reflect on first?`
        } else {
          try {
            const topicPrompt = `Welcome the user to a Bible study on "${content.topic}". Be warm, faith-filled, and ask what specifically they'd like to explore in scripture about this topic. 2 sentences maximum.`
            const response = await aiService.generate([{ role: 'user', content: topicPrompt }], 'bibleStudy')
            initialMsg = response.content
          } catch {
            initialMsg = `Hello! I'm so glad we're exploring "${content.topic}" together today. Where should we begin our reflection?`
          }
        }
        
        setMessages([{ role: 'companion', content: initialMsg }])
        // Save initial message to DB
        await bibleService.createStudyMessage(session.id, 'assistant', initialMsg)

      } catch (dbErr) {
        console.error('Failed to create study session in DB', dbErr)
        // Fallback for UI if DB fails
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
      let studyContext = (studyContent?.type === 'verse' || studyContent?.type === 'selection') 
        ? `Studying: "${studyContent.text}" (${studyContent.reference})` 
        : `Studying: ${studyContent?.reference || studyContent?.topic}`
      const prompt = `You are a warm, supportive Bible study companion. ${studyContext}. Previous conversation: ${conversationContext}. User just said: "${userMsg}". Respond as a friend in faith, sharing scriptural depth and inviting more reflection. Keep it conversational and warm. No bullet points.`
      const response = await aiService.generate([{ role: 'user', content: prompt }], 'bibleStudy')
      
      const aiResponse = response.content
      setMessages(prev => [...prev, { role: 'companion', content: aiResponse }])
      
      // Save to DB
      if (sessionId) {
        await bibleService.createStudyMessage(sessionId, 'user', userMsg)
        await bibleService.createStudyMessage(sessionId, 'assistant', aiResponse)
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
    const studyContext = studyContent?.reference || studyContent?.topic
    const prayerPrompt = `Write a heartfelt closing prayer for a Bible study session on ${studyContext}. Reference the conversation: ${conversationContext}. 3-4 sentences. End with "Amen."`
    try {
      const response = await aiService.generate([{ role: 'user', content: prayerPrompt }], 'bibleStudy')
      const aiResponse = response.content
      setMessages(prev => [...prev, { role: 'companion', content: aiResponse }])
      
      if (sessionId) {
        await bibleService.createStudyMessage(sessionId, 'assistant', aiResponse)
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

  let progressPercent = '30%';
  if (messages.length > 5) {
    progressPercent = '90%';
  } else if (messages.length > 2) {
    progressPercent = '60%';
  }

  return (
    <div className="study-page">
      <AnimatedBackground />

      <div className="study-content-wrapper">
        <AnimatePresence mode="wait">
          {mode === 'select' ? (
            <motion.div
              key="select-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="selection-view"
            >
              <div className="hero-branding">
                <div className="sparkle-icon"><Sparkles size={32} /></div>
                <h1 className="font-serif">Bible Study</h1>
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
            </motion.div>
          ) : (
            <motion.div
              key="session-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="revamped-session"
            >
              {/* Minimalist Top Nav */}
              <div className="session-nav">
                <div className="session-info">
                  <div className="study-badge">
                    {studyContent?.type === 'topic' ? <Search size={14} /> : <BookOpen size={14} />}
                    <span>{studyContent?.type?.toUpperCase()} STUDY</span>
                  </div>
                  <h2 className="session-title font-serif">{studyContent?.reference || studyContent?.topic}</h2>
                </div>
                <button className="exit-btn" onClick={() => setMode('select')}>
                  <X size={20} />
                  <span>EXIT SANCTUARY</span>
                </button>
              </div>

              <div className="study-layout">
                {/* Left Column: Scripture Insight */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="content-sidebar"
                >
                  <div className="scripture-card glass-panel">
                    <div className="card-texture"></div>
                    <Quote size={24} className="quote-icon" />
                    {studyContent?.text ? (
                      <div className="scripture-content">
                        <p className="scripture-text font-serif italic">"{studyContent.text}"</p>
                        <p className="scripture-ref">— {studyContent.reference}</p>
                      </div>
                    ) : (
                      <div className="topic-content">
                        <p className="topic-label">EXPLORING</p>
                        <h3 className="font-serif italic">"{studyContent?.topic}"</h3>
                        <p className="topic-desc">Seeking wisdom and scriptural truth regarding this journey of faith.</p>
                      </div>
                    )}

                    <div className="study-actions">
                      <p className="action-label">QUICK CONTEMPLATION</p>
                      <div className="action-btns">
                        <button onClick={() => { setUserMessage("Summarize the key theological message here."); }} className="action-pill">
                          <Sparkles size={14} /> THEOLOGICAL SUMMARY
                        </button>
                        <button onClick={() => { setUserMessage("How can I apply this to my life practically?"); }} className="action-pill">
                          <Heart size={14} /> PRACTICAL APPLICATION
                        </button>
                        <button onClick={() => { setUserMessage("Describe the historical context of this scripture."); }} className="action-pill">
                          <Clock size={14} /> HISTORICAL CONTEXT
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Card */}
                  <div className="progress-mini-card glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>REFLECTION PROGRESS</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--brand-accent)' }}>{progressPercent}</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        animate={{ width: progressPercent }}
                        transition={{ type: 'spring', stiffness: 50 }}
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column: Conversation */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="chat-interface"
                >
                  <div className="messages-flow">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`revamped-msg ${msg.role}`}
                        >
                          <div className="msg-avatar">
                            {msg.role === 'companion' ? (
                              <div className="aria-avatar"><Sparkles size={16} /></div>
                            ) : (
                              <div className="user-avatar">{user?.full_name?.charAt(0) || 'U'}</div>
                            )}
                          </div>
                          <div className="msg-bubble-wrap">
                            <div className="msg-header">
                              <span className="msg-author">{msg.role === 'companion' ? 'ARIA' : 'YOU'}</span>
                            </div>
                            <div className="msg-content-bubble">
                              {msg.content}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="revamped-msg companion loading"
                      >
                        <div className="msg-avatar">
                          <div className="aria-avatar spinning"><RefreshCw size={16} /></div>
                        </div>
                        <div className="msg-bubble-wrap">
                          <div className="msg-content-bubble typing">
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Fixed bottom input bar */}
                  <div className="floating-input-area">
                    <div className="input-outer glass-panel">
                      <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Share your reflection or ask Aria..."
                        disabled={isLoading}
                      />
                      <div className="input-btns">
                        <button onClick={sendMessage} disabled={isLoading || !userMessage.trim()} className="send-circle">
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="footer-controls">
                      {mode === 'study' && messages.length > 1 && !studyComplete && (
                        <button onClick={endStudy} className="complete-btn">
                          <Heart size={16} /> COMPLETE & PRAY
                        </button>
                      )}
                      {isPrayerMode && !studyComplete && (
                        <button onClick={finishPrayer} className="final-prayer-btn">
                          <Sparkles size={16} /> RECEIVE CLOSING PRAYER
                        </button>
                      )}
                      {studyComplete && (
                        <button onClick={() => setMode('select')} className="start-new-btn">
                          <Plus size={16} /> NEW JOURNEY
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .study-page {
          min-height: 100vh;
          background: var(--bg-main);
          position: relative;
          color: var(--text-main);
          overflow: hidden;
        }

        .study-content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }

        /* Revamped Session Layout */
        .revamped-session {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 1.5rem;
        }

        .session-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .study-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-alt);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          color: var(--brand-accent);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .session-title {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-main);
        }

        .exit-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          padding: 0.6rem 1.2rem;
          border-radius: 50px;
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .study-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 2rem;
          flex: 1;
          height: calc(100vh - 160px);
          min-height: 0;
        }

        @media (max-width: 900px) {
          .study-layout { grid-template-columns: 1fr; }
          .content-sidebar { display: none; }
        }

        /* Sidebar Content */
        .content-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
          overflow-y: auto;
        }

        .scripture-card {
          padding: 2.5rem;
          border-radius: 32px;
          position: relative;
          overflow: hidden;
          background: var(--bg-card);
        }

        .card-texture {
          position: absolute;
          inset: 0;
          background: url('https://www.transparenttextures.com/patterns/natural-paper.png');
          opacity: 0.05;
          pointer-events: none;
        }

        .quote-icon {
          color: var(--brand-accent);
          margin-bottom: 1.5rem;
          opacity: 0.4;
        }

        .scripture-text {
          font-size: 1.4rem;
          line-height: 1.5;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .scripture-ref {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--brand-accent);
          letter-spacing: 0.1em;
        }

        .topic-label {
          font-size: 0.6rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .topic-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-top: 1rem;
        }

        .study-actions {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .action-label {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .action-btns {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-pill {
          background: var(--bg-alt);
          border: 1px solid var(--border-color);
          padding: 0.8rem 1.2rem;
          border-radius: 14px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .action-pill:hover {
          background: var(--bg-hover);
          color: var(--text-main);
          border-color: var(--brand-accent);
          transform: translateX(5px);
        }

        .progress-mini-card {
          padding: 1.5rem;
          border-radius: 20px;
        }

        .progress-bar {
          height: 6px;
          background: var(--bg-alt);
          border-radius: 3px;
        }

        .progress-fill {
          height: 100%;
          background: var(--brand-accent);
          border-radius: 3px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Chat Interface */
        .chat-interface {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border-radius: 32px;
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .messages-flow {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          scroll-behavior: smooth;
        }

        .messages-flow::-webkit-scrollbar { width: 6px; }
        .messages-flow::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }

        .revamped-msg {
          display: flex;
          gap: 1rem;
          max-width: 85%;
        }

        .revamped-msg.companion { align-self: flex-start; }
        .revamped-msg.user { align-self: flex-end; flex-direction: row-reverse; }

        .aria-avatar {
          width: 36px; height: 36px; background: var(--brand-solid); color: white;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }

        .user-avatar {
          width: 36px; height: 36px; background: var(--bg-alt); color: var(--text-main);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; border: 1px solid var(--border-color);
        }

        .msg-bubble-wrap { display: flex; flex-direction: column; gap: 0.4rem; max-width: 100%; }
        .revamped-msg.user .msg-bubble-wrap { align-items: flex-end; }

        .msg-author { font-size: 0.6rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; }
        
        .msg-content-bubble {
          padding: 1rem 1.5rem;
          border-radius: 20px;
          line-height: 1.6;
          font-size: 1rem;
        }

        .companion .msg-content-bubble { 
          background: var(--bg-alt); 
          color: var(--text-main); 
          border-top-left-radius: 4px; 
          font-family: 'Playfair Display', serif;
        }
        .user .msg-content-bubble { 
          background: var(--brand-solid); 
          color: white; 
          border-top-right-radius: 4px; 
        }

        /* Floating Input */
        .floating-input-area {
          padding: 1.5rem 2rem;
          background: var(--bg-card);
          border-top: 1px solid var(--border-color);
        }

        .input-outer {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.5rem 0.5rem 1.5rem;
          border-radius: 100px;
        }

        .input-outer input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 1rem;
          outline: none;
        }

        .send-circle {
          width: 44px; height: 44px; background: var(--brand-solid); color: white; 
          border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .send-circle:hover:not(:disabled) { transform: scale(1.05); }

        .footer-controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .complete-btn, .final-prayer-btn, .start-new-btn {
          background: var(--bg-alt); border: 1px solid var(--border-color); padding: 0.6rem 1.2rem;
          border-radius: 50px; color: var(--text-main); font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: all 0.2s;
        }
        .final-prayer-btn { background: var(--brand-solid); border: none; color: white; }

        .complete-btn:hover { border-color: var(--brand-accent); color: var(--brand-accent); }

        .typing { display: flex; gap: 0.4rem; padding: 0.75rem 0; }
        .typing span { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spinning 1.5s linear infinite; }

        /* Legacy compatibility */
        .hero-branding {
          text-align: center;
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-branding h1 { font-size: 3.5rem; margin: 1rem 0; }
        .hero-branding p { font-size: 1.25rem; color: var(--text-secondary); }
        .sparkle-icon { 
          width: 64px; height: 64px; background: var(--bg-card); border-radius: 20px;
          display: flex; align-items: center; justify-content: center; color: var(--brand-accent);
          margin: 0 auto; box-shadow: var(--shadow-main);
        }
        .input-panel {
          width: 100%; padding: 3rem; border-radius: 40px; display: flex; flex-direction: column; gap: 1.5rem;
        }
        .panel-header { display: flex; align-items: center; justify-content: center; gap: 0.75rem; font-size: 1.25rem; }
        .search-field { position: relative; width: 100%; }
        .sanctuary-input {
          width: 100%; padding: 1.5rem 2rem; border-radius: 100px; border: 1px solid var(--border-color);
          background: var(--bg-hover); color: var(--text-main); font-size: 1.1rem; outline: none; transition: border-color 0.2s;
        }
        .type-hint {
          position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .example-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }
        .tag-label { color: var(--text-muted); font-size: 0.9rem; align-self: center; }
        .tag-btn { padding: 0.5rem 1.25rem; border-radius: 100px; border: none; cursor: pointer; font-size: 0.9rem; color: var(--text-secondary); }
        .begin-button {
          margin-top: 1rem; padding: 1.5rem; border-radius: 100px; border: none;
          background: var(--brand-solid); color: white; font-size: 1.1rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 1rem;
        }
      `}</style>
    </div>
  )
}

export default BibleStudy
