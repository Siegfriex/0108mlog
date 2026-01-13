import React from 'react';
import { motion } from 'framer-motion';

/**
 * CelestialBackground 컴포넌트
 * 
 * 밤 모드용 천체 배경
 * 별, 달, 오로라 효과 제공
 */
export interface CelestialBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
}

export const CelestialBackground: React.FC<CelestialBackgroundProps> = ({ 
  intensity = 'medium' 
}) => {
  const starCount = intensity === 'low' ? 20 : intensity === 'high' ? 60 : 40;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-base">
      {/* 별들 */}
      {Array.from({ length: starCount }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = Math.random() * 3 + 2;

        return (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* 달 */}
      <motion.div
        className="absolute rounded-full blur-xl"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)',
          top: '10%',
          right: '15%',
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 오로라 효과 */}
      <motion.div
        className="absolute w-full h-full"
        style={{
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 100%)',
          top: 0,
          left: 0,
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
