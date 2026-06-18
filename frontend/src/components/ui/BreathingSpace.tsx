import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Play, Pause } from 'lucide-react'

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'
type Category = 'peace' | 'rest' | 'strength'

interface Scripture {
  text: string
  reference: string
}

const SCRIPTURES: Record<Category, Scripture[]> = {
  peace: [
    { text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you.", reference: "John 14:27" },
    { text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds.", reference: "Philippians 4:7" },
    { text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.", reference: "Isaiah 26:3" }
  ],
  rest: [
    { text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", reference: "Matthew 11:28" },
    { text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.", reference: "Psalm 23:2-3" },
    { text: "My presence shall go with thee, and I will give thee rest.", reference: "Exodus 33:14" }
  ],
  strength: [
    { text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", reference: "2 Timothy 1:7" },
    { text: "The Lord is my strength and my shield; my heart trusted in him, and I am helped.", reference: "Psalm 28:7" },
    { text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.", reference: "Isaiah 40:31" }
  ]
}

export const BreathingSpace = () => {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [counter, setCounter] = useState(4)
  const [category, setCategory] = useState<Category>('peace')
  const [scriptureIndex, setScriptureIndex] = useState(0)

  // Rotate scripture when changing category or periodically
  useEffect(() => {
    setScriptureIndex(0)
  }, [category])

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          // Switch phase
          setPhase((currentPhase) => {
            switch (currentPhase) {
              case 'inhale':
                return 'hold-in'
              case 'hold-in':
                return 'exhale'
              case 'exhale':
                return 'hold-out'
              case 'hold-out':
                // Move to next scripture when completing a full cycle
                setScriptureIndex((idx) => (idx + 1) % SCRIPTURES[category].length)
                return 'inhale'
            }
          })
          return 4 // Reset countdown
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, category])

  const currentScripture = SCRIPTURES[category][scriptureIndex]

  // Determine breathing instruction and circle scale
  let instructionText = 'Be still'
  let circleScale = 1.0
  let glowColor = 'rgba(245, 206, 77, 0.4)'

  if (isActive) {
    switch (phase) {
      case 'inhale':
        instructionText = 'Inhale deeply'
        circleScale = 1.45
        glowColor = 'rgba(245, 206, 77, 0.6)'
        break
      case 'hold-in':
        instructionText = 'Hold and absorb'
        circleScale = 1.45
        glowColor = 'rgba(34, 211, 238, 0.5)'
        break
      case 'exhale':
        instructionText = 'Exhale noise'
        circleScale = 0.95
        glowColor = 'rgba(99, 102, 241, 0.4)'
        break
      case 'hold-out':
        instructionText = 'Rest in silence'
        circleScale = 0.95
        glowColor = 'rgba(245, 206, 77, 0.2)'
        break
    }
  }

  const handleStartStop = () => {
    if (isActive) {
      setIsActive(false)
      setPhase('inhale')
      setCounter(4)
    } else {
      setIsActive(true)
    }
  }

  return (
    <div
      className="glass-panel w-full rounded-[32px] p-8 md:p-12 border border-[var(--border-color)] overflow-hidden flex flex-col md:flex-row items-center gap-12 relative"
      style={{
        background: 'var(--gradient-card)',
        boxShadow: 'var(--shadow-main)',
        minHeight: '480px'
      }}
    >
      {/* Decorative Orbs inside widget */}
      <div
        className="absolute w-[240px] h-[240px] rounded-full blur-[80px] pointer-events-none opacity-[0.12] dark:opacity-[0.08]"
        style={{
          background: glowColor,
          top: '-40px',
          right: '-40px',
          transition: 'background 1s ease'
        }}
      />

      {/* Left Column: Animation Canvas */}
      <div className="flex flex-col items-center justify-center shrink-0 w-[260px] h-[260px] relative">
        {/* Breathing Circle Container */}
        <motion.div
          animate={{
            scale: circleScale,
            boxShadow: `0 0 60px ${glowColor}`
          }}
          transition={{
            duration: isActive ? 4 : 0.8,
            ease: isActive ? 'linear' : 'easeInOut'
          }}
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center relative cursor-pointer"
          style={{
            background: 'var(--bg-main)',
            border: '2px solid var(--border-color)',
            willChange: 'transform'
          }}
          onClick={handleStartStop}
        >
          {/* Animated Morphing Ripple */}
          <motion.div
            animate={isActive ? {
              borderRadius: ['50%', '42% 58% 70% 30% / 45% 45% 55% 55%', '70% 30% 52% 48% / 60% 40% 60% 40%', '50%'],
            } : { borderRadius: '50%' }}
            transition={isActive ? {
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            } : {}}
            className="absolute inset-0 border border-[var(--brand-accent)] opacity-40 pointer-events-none scale-[1.08]"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={instructionText + (isActive ? counter : '')}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-center flex flex-col items-center gap-1 z-10 px-4"
            >
              <span
                className="font-serif"
                style={{
                  fontStyle: 'italic',
                  fontSize: isActive ? '1rem' : '1.15rem',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}
              >
                {instructionText}
              </span>
              {isActive && (
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--brand-accent)'
                  }}
                >
                  {counter}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Play / Stop Button Overlay */}
        <button
          onClick={handleStartStop}
          className="absolute -bottom-2 bg-[var(--brand-solid)] text-[var(--bg-main)] w-10 h-10 rounded-full border-none flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} style={{ marginLeft: '2px' }} fill="currentColor" />}
        </button>
      </div>

      {/* Right Column: Interaction & Scripture Panel */}
      <div className="flex-1 flex flex-col h-full w-full justify-between gap-8 z-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'peace', label: 'Peace', icon: <Sparkles size={13} /> },
              { id: 'rest', label: 'Rest', icon: <Heart size={13} /> },
              { id: 'strength', label: 'Strength', icon: <Sparkles size={13} /> }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as Category)}
                className="btn-base"
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '2rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  border: category === cat.id ? '1px solid transparent' : '1px solid var(--border-color)',
                  background: category === cat.id ? 'var(--brand-solid)' : 'transparent',
                  color: category === cat.id ? 'var(--bg-main)' : 'var(--text-secondary)',
                  fontWeight: 600
                }}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ minHeight: '130px' }} className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScripture.text}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col gap-3"
              >
                <p
                  className="font-serif leading-[1.65]"
                  style={{
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                    color: 'var(--text-main)',
                    margin: 0
                  }}
                >
                  &ldquo;{currentScripture.text}&rdquo;
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--brand-accent)',
                    fontWeight: 700,
                    margin: 0
                  }}
                >
                  — {currentScripture.reference}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          {!isActive
            ? "Click the center sphere or the play button to start a guided box-breathing cycle designed to help you slow down, sync your breath, and digest the Word of God."
            : "Follow the countdown. Let your lungs inflate as the circle expands, hold your focus as it remains still, and let go of stress on contraction."}
        </p>
      </div>
    </div>
  )
}

export default BreathingSpace
