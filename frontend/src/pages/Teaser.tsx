import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, Mic, BookOpen } from 'lucide-react'
import InteractiveCanvas from '../components/ui/InteractiveCanvas'

type TeaserStage = 'intro' | 'noise' | 'sanctuary' | 'features' | 'outro'

export const Teaser = () => {
  const [stage, setStage] = useState<TeaserStage>('intro')

  useEffect(() => {
    const sequence = [
      { next: 'noise', delay: 5000 },
      { next: 'sanctuary', delay: 4500 },
      { next: 'features', delay: 4500 },
      { next: 'outro', delay: 6500 },
      { next: 'intro', delay: 6000 } // Loop sequence infinitely
    ]

    let timerId: number
    let currentStep = 0

    const runNext = () => {
      const step = sequence[currentStep]
      timerId = window.setTimeout(() => {
        setStage(step.next as TeaserStage)
        currentStep = (currentStep + 1) % sequence.length
        runNext()
      }, step.delay)
    }

    runNext()

    return () => {
      clearTimeout(timerId)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center bg-[#060E1A] text-white select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background Interactive Particles */}
      <InteractiveCanvas />

      {/* Cinematic vignetting overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(6, 14, 26, 0.9) 100%)'
        }}
      />

      <AnimatePresence mode="wait">
        {/* STAGE 1: INTRO */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-6 z-20 text-center px-6"
          >
            <motion.span
              initial={{ letterSpacing: '0.1em', filter: 'blur(10px)', scale: 0.95 }}
              animate={{ letterSpacing: '0.3em', filter: 'blur(0px)', scale: 1 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="font-serif block text-6xl md:text-8xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5CE4D] to-white"
            >
              Aria
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 1.5, duration: 1.5 }}
              className="text-sm md:text-lg tracking-[0.2em] uppercase font-semibold text-gray-300"
            >
              Where faith meets intelligence.
            </motion.p>
          </motion.div>
        )}

        {/* STAGE 2: THE NOISE */}
        {stage === 'noise' && (
          <motion.div
            key="noise"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="z-20 flex flex-col items-center justify-center text-center px-8 max-w-2xl"
          >
            {/* Ambient visual chaos */}
            <div className="absolute inset-0 z-0 opacity-15 overflow-hidden flex flex-wrap gap-4 p-8 filter blur-sm">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{
                    x: [0, Math.random() * 40 - 20, 0],
                    y: [0, Math.random() * 40 - 20, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-xs font-mono text-gray-500"
                >
                  NOISE ALERTS FEED SOCIAL CHAT NEWS CHANNELS
                </motion.span>
              ))}
            </div>

            <motion.h2
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="font-serif text-3xl md:text-5xl italic font-semibold leading-snug text-gray-200 z-10"
            >
              In a world of constant digital noise...
            </motion.h2>
          </motion.div>
        )}

        {/* STAGE 3: THE SANCTUARY */}
        {stage === 'sanctuary' && (
          <motion.div
            key="sanctuary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="z-20 flex flex-col items-center text-center px-6 max-w-3xl gap-10"
          >
            {/* Large glowing sanctuary sphere */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                boxShadow: [
                  '0 0 50px rgba(245, 206, 77, 0.3)',
                  '0 0 90px rgba(34, 211, 238, 0.4)',
                  '0 0 50px rgba(245, 206, 77, 0.3)'
                ]
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#0D1C33] to-[#152A4A] border-2 border-rgba(245, 206, 77, 0.3) flex items-center justify-center"
            >
              <Sparkles size={40} className="text-[#F5CE4D] opacity-80" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="font-serif text-3xl md:text-5xl italic font-semibold leading-normal"
            >
              ...find your sanctuary of quiet reflection.
            </motion.h2>
          </motion.div>
        )}

        {/* STAGE 4: FEATURES SHOWCASE */}
        {stage === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="z-20 flex flex-col items-center justify-center px-6 max-w-6xl w-full"
          >
            <h3 className="text-xs tracking-[0.25em] uppercase text-gray-400 font-bold mb-10">
              NOURISH YOUR SOUL
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[
                {
                  title: 'Daily Devotion',
                  desc: 'Begin your mornings centered on Scripture.',
                  icon: <BookOpen size={24} className="text-[#F5CE4D]" />,
                  delay: 0.2
                },
                {
                  title: 'Empathetic AI',
                  desc: 'Share weights. Get Bible-rooted comfort.',
                  icon: <MessageSquare size={24} className="text-[#F5CE4D]" />,
                  delay: 0.4
                },
                {
                  title: 'Voice Guidance',
                  desc: 'Real-time call conversations on theology.',
                  icon: <Mic size={24} className="text-[#F5CE4D]" />,
                  delay: 0.6
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item.delay, duration: 0.6, ease: 'easeOut' }}
                  className="p-8 rounded-[24px] border border-white/5 flex flex-col gap-5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STAGE 5: OUTRO */}
        {stage === 'outro' && (
          <motion.div
            key="outro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-10 z-20 text-center px-6"
          >
            {/* Glowing mark */}
            <motion.div
              initial={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
              animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-24 h-24 flex items-center justify-center"
              style={{
                filter: 'drop-shadow(0 0 25px rgba(245, 206, 77, 0.5))'
              }}
            >
              <img src="/sanctuary-mark.png" className="w-full h-full object-contain" alt="Aria Logo" />
            </motion.div>

            <div>
              <span className="font-serif block text-5xl md:text-7xl font-bold italic mb-4">Aria</span>
              <p className="text-lg md:text-2xl text-gray-300 font-serif italic mb-2">
                A sanctuary in the digital noise.
              </p>
              <p className="text-xs tracking-[0.2em] uppercase text-[#F5CE4D] font-bold">
                Coming Soon. Be Still.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Teaser
