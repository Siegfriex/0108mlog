import React from 'react';
import { motion } from 'framer-motion';
import { EmotionType } from '../../../types';

/**
 * EmotionOrb 컴포넌트
 * 
 * 원형 구체 형태의 감정 선택 UI
 * 선택 시 펄스 효과 및 글로우 효과 제공
 */
export interface EmotionOrbProps {
  emotion: EmotionType;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgGradient: string;
  isSelected: boolean;
  onClick: () => void;
}

export const EmotionOrb: React.FC<EmotionOrbProps> = ({
  emotion,
  icon,
  label,
  color,
  bgGradient,
  isSelected,
  onClick,
}) => {
  const emotionId = `emotion-orb-${emotion}`;

  return (
    <motion.button
      id={emotionId}
      onClick={onClick}
      aria-label={`${label} 감정 선택`}
      aria-pressed={isSelected}
      aria-describedby={`${emotionId}-description`}
      tabIndex={0}
      className={`
        relative overflow-hidden rounded-full
        w-20 h-20 sm:w-24 sm:h-24
        flex flex-col items-center justify-center gap-1
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        transition-all duration-300
        ${isSelected 
          ? `bg-gradient-to-br ${bgGradient} border-2 border-brand-primary shadow-lg` 
          : 'bg-white/50 border border-white/60 hover:bg-white/70'
        }
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 펄스 효과 (선택 시) */}
      {isSelected && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${bgGradient} opacity-50`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${bgGradient} opacity-30`}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </>
      )}

      {/* 글로우 효과 (선택 시) */}
      {isSelected && (
        <motion.div
          className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-br ${bgGradient}`}
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* 아이콘 */}
      <div className={`${color} relative z-content-base flex justify-center`}>
        {icon}
      </div>

      {/* 라벨 */}
      <p 
        id={`${emotionId}-description`}
        className={`text-xs font-medium relative z-content-base ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}
      >
        {label}
      </p>
    </motion.button>
  );
};
