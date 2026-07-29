// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react'
import { Sun, Sparkles, Heart, RefreshCw, Check, Send, Volume2, VolumeX } from 'lucide-react'
import { aiService, devotionService, ttsService } from '../services/api'
import { useAuthStore } from '../store/auth-store'
import { AnimatedBackground } from '../components/ui/SharedComponents'

const DURATION_OPTIONS = [
  { id: 5, label: '5 min', desc: 'A quick moment of peace' },
  { id: 10, label: '10 min', desc: 'Short morning reflection' },
  { id: 15, label: '15 min', desc: 'Standard sanctuary time' },
  { id: 30, label: '30 min', desc: 'Deep spiritual immersion' },
]

export const Devotion = () => {
  const [mode, setMode] = useState('select') // select, day, teaching, complete
  const [duration, setDuration] = useState(null)
  const [dayPlan, setDayPlan] = useState('')
  const [messages, setMessages] = useState<{role:string;content:string}[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [devotionId, setDevotionId] = useState(null)
  const [teachingPlaying, setTeachingPlaying] = useState(false)
  const { user } = useAuthStore()
  const messagesEndRef = useRef(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const FRONTEND_VOICE_MAP = {
    alloy: 'Osagie',
    ash: 'Jude',
    ballad: 'Femi',
    coral: 'Adaora',
    echo: 'Umar',
    sage: 'Osagie',
    stella: 'Wura',
    verse: 'Idera',
  }

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const selectDuration = (mins) => {
    setDuration(mins)
    setMode('day')
  }

  const submitDayPlan = async () => {
    if (!dayPlan.trim()) return
    setIsLoading(true)
    setMode('teaching')

    const teachingPrompt = `The user wants a ${duration}-minute morning devotion based on this day plan: "${dayPlan}".
    Generate a warm, personalized teaching with a MAIN VERSE, TOPIC, and DEVOTION text.
    Format with beautiful typography in mind. No bullet points.`

    try {
      const devotion = await devotionService.scheduleDevotion(
        new Date().toISOString(),
        dayPlan
      )
      setDevotionId(devotion.id)

      const response = await aiService.generate(
        [{ role: 'user', content: teachingPrompt }],
        'devotion'
      )

      const aiResponse = `Good morning! ☀️ I've prepared a special reflection for your day.\n\n${response.content}\n\nHow does this speak to your heart as you look ahead to your day?`
      setMessages([{ role: 'assistant', content: aiResponse }])

      await devotionService.createMessage(devotion.id, 'assistant', aiResponse)

    } catch (err) {
      setMessages([
        { role: 'assistant', content: `Good morning! ☀️ Let's focus on Trusting God's Plan today.\n\n**MAIN VERSE:** Proverbs 3:5-6 — "Trust in the Lord with all your heart..."\n\nWhatever your day holds, know that He is walking beside you. How are you feeling about your plans today?` }
      ])
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
      if (devotionId) {
        await devotionService.createMessage(devotionId, 'user', userMsg)
      }

      const response = await aiService.generate(
        [...messages, { role: 'user', content: userMsg }],
        'devotion'
      )

      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])

      if (devotionId) {
        await devotionService.createMessage(devotionId, 'assistant', response.content)
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm with you in spirit. Tell me more about what you're thinking." }])
    } finally {
      setIsLoading(false)
    }
  }

  const endWithPrayer = async () => {
    setIsLoading(true)
    const prayerPrompt = `Write a 3-sentence personal closing prayer for the user's day: "${dayPlan}". End with "Amen." and a warm sign-off.`

    try {
      const response = await aiService.generate(
        [...messages, { role: 'user', content: prayerPrompt }],
        'devotion'
      )
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])

      if (devotionId) {
        await devotionService.createMessage(devotionId, 'assistant', response.content)
        await devotionService.completeDevotion(devotionId)
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Father, bless this day and every task within it. May your peace lead the way. Amen.\n\nGo in grace, friend! 💛` }])
    } finally {
      setIsLoading(false)
      setMode('complete')
    }
  }

  const toggleTeachingAudio = useCallback(async (text: string) => {
    if (teachingPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setTeachingPlaying(false)
      return
    }
    
    try {
      const userVoice = user?.aria_voice || 'verse'
      const voice = FRONTEND_VOICE_MAP[userVoice] || 'Idera'
      const url = await ttsService.getSpeechUrl(text, voice)
      
      const audio = new Audio(url)
      audioRef.current = audio
      
      audio.onended = () => {
        setTeachingPlaying(false)
      }
      audio.onerror = () => {
        setTeachingPlaying(false)
      }
      
      await audio.play()
      setTeachingPlaying(true)
    } catch (err) {
      console.error("Teaching TTS playback error:", err)
      setTeachingPlaying(false)
    }
  }, [teachingPlaying, user?.aria_voice])

  return (
    <div className="min-h-full relative flex flex-col overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header style={{ padding: '2.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 500 }}>Morning Reflection</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Center your heart before the day begins.</p>
        </div>
        {mode !== 'select' && (
          <button
            onClick={() => { setMode('select'); setMessages([]); setDayPlan(''); }}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
            NEW SESSION
          </button>
        )}
      </header>

      {/* Content Stage */}
      <div style={{ flex: 1, padding: '0 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, overflowY: 'auto' }}>

        {mode === 'select' && (
          <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
            <div style={{ padding: '3rem', borderRadius: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-main)' }}>
              <Sun size={48} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
              <h2 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '2rem' }}>How much time shall we spend?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => selectDuration(opt.id)}
                    style={{ padding: '1.5rem', borderRadius: '24px', background: 'var(--input-bg)', border: '1px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'day' && (
          <div style={{ maxWidth: '700px', width: '100%' }}>
            <div style={{ padding: '3rem', borderRadius: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Sparkles size={32} color="#f59e0b" />
                <h2 className="font-serif" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>What does your day look like?</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>Share your plans, worries, or hopes for the day ahead. Aria will prepare a personalized teaching for you.</p>
              <textarea
                value={dayPlan}
                onChange={(e) => setDayPlan(e.target.value)}
                placeholder="e.g., I have a busy day of meetings, I'm hoping to find peace during my commute..."
                rows={5}
                style={{ width: '100%', padding: '1.5rem', borderRadius: '20px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none', resize: 'none' }}
              />
              <button
                onClick={submitDayPlan}
                disabled={isLoading || !dayPlan.trim()}
                style={{ marginTop: '2rem', width: '100%', padding: '1.25rem', borderRadius: '3rem', border: 'none', background: 'var(--brand-solid)', color: 'var(--bg-main)', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
              >
                {isLoading ? <RefreshCw className="spinning" size={20} /> : <Sparkles size={20} />}
                {isLoading ? 'PREPARING DEVOTION...' : 'CREATE MY DEVOTION'}
              </button>
            </div>
          </div>
        )}

        {(mode === 'teaching' || mode === 'complete') && (
          <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '14rem' }}>
            {messages.map((msg, i) => {
              // First assistant message = structured teaching card
              if (i === 0 && msg.role === 'assistant') {
                return (
                  <div key={i} style={{ background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-main)', overflow: 'hidden' }}>
                    {/* Card header */}
                    <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Sun size={28} color="#f59e0b" />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>MORNING TEACHING</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{duration} min devotion · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTeachingAudio(msg.content)}
                        title={teachingPlaying ? 'Stop' : 'Listen to teaching'}
                        style={{
                          background: teachingPlaying ? '#f59e0b' : 'var(--input-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '50%',
                          width: 44, height: 44,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                        }}
                      >
                        {teachingPlaying
                          ? <VolumeX size={18} color="white" />
                          : <Volume2 size={18} color="var(--text-secondary)" />}
                      </button>
                    </div>
                    {/* Teaching body */}
                    <div style={{ padding: '2.5rem' }}>
                      <p style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        lineHeight: 1.85,
                        color: 'var(--text-main)',
                        fontFamily: "'Playfair Display', serif",
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )
              }

              // Subsequent messages = chat bubbles
              return (
                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{
                    padding: '1.5rem 2rem',
                    borderRadius: '2rem',
                    background: msg.role === 'user' ? 'var(--brand-solid)' : 'var(--bg-card)',
                    color: msg.role === 'user' ? 'var(--bg-main)' : 'var(--text-main)',
                    boxShadow: msg.role === 'assistant' ? 'var(--shadow-main)' : 'none',
                    border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }} className={msg.role === 'assistant' ? 'font-serif' : ''}>
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '1rem' }}>Aria is reflecting...</div>
            )}

            {mode === 'complete' && (
              <div style={{ textAlign: 'center', padding: '3rem', borderRadius: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Check size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h3 className="font-serif" style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Rest in His Peace</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Your morning devotion is complete. Go in grace.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Floating Input (only in teaching mode) */}
      {mode === 'teaching' && (
        <div style={{ position: 'fixed', bottom: '3rem', left: 'auto', right: 'auto', padding: '0 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 100, width: '100%' }}>
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '850px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Reflect on this teaching..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  width: '100%', padding: '1.5rem 2rem', background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)', borderRadius: '24px',
                  fontSize: '1.1rem', color: 'var(--text-main)', outline: 'none', boxShadow: 'var(--shadow-lg)',
                  backdropFilter: 'blur(20px)'
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'var(--brand-solid)', border: 'none', color: 'var(--bg-main)',
                  width: '44px', height: '44px', borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Send size={18} />
              </button>
            </div>
            {messages.length > 1 && (
              <button
                onClick={endWithPrayer}
                style={{ background: '#f59e0b', color: 'white', padding: '0 2rem', borderRadius: '24px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-main)' }}
              >
                <Heart size={20} />
                PRAYER
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spinning 1.5s linear infinite; }
      `}</style>
    </div>
  )
}

export default Devotion
