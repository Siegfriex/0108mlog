import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard 컴포넌트
 * 
 * 글래스모피즘 스타일의 카드 컴포넌트
 * PRD 디자인 시스템의 글래스모피즘 디자인 철학 반영
 */
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  intensity = 'medium' 
}) => {
  const bgStyle = intensity === 'low' 
    ? 'bg-white/40' 
    : intensity === 'high' 
    ? 'bg-white/95' 
    : 'bg-white/70';
  
  const blurStyle = intensity === 'low' 
    ? 'backdrop-blur-md' 
    : intensity === 'high' 
    ? 'backdrop-blur-3xl' 
    : 'backdrop-blur-xl';

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.005 : 1, y: onClick ? -2 : 0 }}
      whileTap={{ scale: onClick ? 0.99 : 1 }}
      className={`
        relative overflow-hidden
        ${bgStyle} ${blurStyle}
        border border-white/60
        shadow-brand
        rounded-lg
        p-8
        transition-all duration-300 ease-out
        group
        ${className}
      `}
      onClick={onClick}
    >
      {/* Crisp Highlight for Vector feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/80 opacity-50" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
