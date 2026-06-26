import React, { useMemo } from 'react';
import './BurningFlame.css';

interface BurningFlameProps {
  size?: 'sm' | 'md' | 'lg' | number;
  intensity?: number; // Scaling factor for speed
}

export const BurningFlame: React.FC<BurningFlameProps> = ({ size = 'md', intensity = 1 }) => {
  // Determine pixel size based on presets or number values
  const pixelSize = useMemo(() => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm': return 32;
      case 'lg': return 120;
      case 'md':
      default:
        return 64;
    }
  }, [size]);

  // Dynamically generate embers with varied speeds, offsets, and durations
  const embers = useMemo(() => {
    const count = size === 'sm' ? 4 : size === 'lg' ? 12 : 8;
    return Array.from({ length: count }).map((_, i) => {
      const left = 15 + Math.random() * 70; // 15% to 85%
      const sizePx = 1.5 + Math.random() * 3.5; // 1.5px to 5px
      const delay = Math.random() * 2; // up to 2s
      const duration = (1.2 + Math.random() * 1.5) / intensity; // scale speed with intensity
      const drift = -15 + Math.random() * 30; // drift left/right
      return {
        id: i,
        left: `${left}%`,
        size: `${sizePx}px`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        drift: `${drift}px`
      };
    });
  }, [size, intensity]);

  return (
    <div 
      className="burning-flame-container"
      style={{ 
        width: `${pixelSize}px`, 
        height: `${pixelSize * 1.25}px` // slightly taller than wide
      }}
    >
      {/* Ambient glow behind the fire */}
      <div className="flame-glow" />

      {/* Main flame structure */}
      <div className="flame-wrapper">
        <div className="flame-layer flame-outer" />
        <div className="flame-layer flame-middle" />
        <div className="flame-layer flame-inner" />
        <div className="flame-layer flame-core" />
      </div>

      {/* Sparkles/Embers rising */}
      <div className="flame-embers">
        {embers.map((ember) => (
          <span
            key={ember.id}
            className="flame-ember"
            style={{
              left: ember.left,
              width: ember.size,
              height: ember.size,
              animationDelay: ember.delay,
              animationDuration: ember.duration,
              '--ember-drift': ember.drift
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export default BurningFlame;
