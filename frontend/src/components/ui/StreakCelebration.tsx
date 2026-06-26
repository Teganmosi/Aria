import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';
import BurningFlame from './BurningFlame';
import './StreakCelebration.css';

interface StreakCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
}

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  isOpen,
  onClose,
  streakCount
}) => {
  // Determine motivational heading based on streak count
  const heading = useMemo(() => {
    if (streakCount <= 1) return 'FAITH IGNITED!';
    if (streakCount <= 3) return 'FLAME KEPT ALIVE!';
    if (streakCount <= 7) return 'SPIRIT ON FIRE!';
    return 'UNSTOPPABLE FAITH!';
  }, [streakCount]);

  const subtitle = useMemo(() => {
    if (streakCount <= 1) return "You've taken the first step today. Let's keep walking in faith.";
    if (streakCount <= 3) return "Consistency builds character. Keep shining your light!";
    if (streakCount <= 7) return "A full week of walking with God! Your dedication is inspiring.";
    return "Your commitment to spiritual growth is burning brighter than ever!";
  }, [streakCount]);

  // Exploding background particles
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24 + (Math.random() * 15 - 7.5);
      const velocity = 80 + Math.random() * 120;
      const size = 4 + Math.random() * 8;
      const color = ['#F5CE4D', '#F97316', '#EF4444', '#EC4899', '#38BDF8'][i % 5];
      const delay = Math.random() * 0.2;
      return {
        id: i,
        x: Math.cos((angle * Math.PI) / 180) * velocity,
        y: Math.sin((angle * Math.PI) / 180) * velocity,
        size,
        color,
        delay
      };
    });
  }, [isOpen]); // Re-generate only when opening

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="streak-celebration-overlay">
          {/* Backdrop mask */}
          <motion.div
            className="streak-celebration-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="streak-celebration-modal glass-panel"
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0, 
              transition: { type: 'spring', damping: 15, stiffness: 120 } 
            }}
            exit={{ scale: 0.7, opacity: 0, y: 50, transition: { duration: 0.25 } }}
          >
            {/* Ambient background rays */}
            <div className="celebration-rays" />

            {/* Particle explosion elements */}
            <div className="particles-container">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="celebration-particle"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    scale: [0, 1.2, 0.4, 0],
                    opacity: [1, 1, 0.8, 0],
                    transition: {
                      duration: 1.4,
                      ease: 'easeOut',
                      delay: p.delay
                    }
                  }}
                  style={{
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    borderRadius: '50%',
                    position: 'absolute'
                  }}
                />
              ))}
            </div>

            {/* Core burning fire flame */}
            <div className="celebration-flame-wrapper">
              <BurningFlame size="lg" intensity={1.5} />
            </div>

            {/* Content info */}
            <div className="celebration-content">
              <span className="celebration-badge">
                <Sparkles size={14} className="animate-pulse" />
                DAILY STREAK
              </span>

              <h2 className="celebration-heading">{heading}</h2>

              <div className="celebration-counter-container">
                <span className="celebration-number">{streakCount}</span>
                <span className="celebration-days-label">DAYS</span>
              </div>

              <p className="celebration-subtitle">{subtitle}</p>

              <div className="celebration-stats-highlight">
                <Trophy size={18} color="var(--brand-accent)" />
                <span>Keep the fire burning tomorrow!</span>
              </div>

              <motion.button
                className="celebration-close-btn"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                Praise God
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StreakCelebration;
