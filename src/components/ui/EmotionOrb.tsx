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
      className="relative group"
      whileHover={{ y: -6, scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* 배경 글로우 효과 */}
      <div className={`absolute inset-0 ${bgGradient} blur-2xl opacity-20 group-hover:opacity-50 transition-opacity`} />
      
      {/* Gemstone 버튼 */}
      <div className={`
        relative w-24 h-24 rounded-[28px]
        bg-gradient-to-br from-white/90 to-white/40
        border-2
        ${isSelected 
          ? 'border-brand-primary/50 shadow-neon-lg' 
          : 'border-white/60 shadow-lg'
        }
        flex flex-col items-center justify-center gap-1
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        transition-all duration-300
      `}>
        {/* Specular Highlight */}
        <div className="absolute top-3 left-3 w-12 h-6 bg-white/50 rounded-full blur-[3px] rotate-[-18deg]" />
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
      </div>
    </motion.button>
  );
};
