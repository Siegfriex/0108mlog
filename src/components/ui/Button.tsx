import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Button 컴포넌트
 * 
 * 다양한 variant를 지원하는 버튼 컴포넌트
 * PRD 디자인 시스템의 버튼 스타일 반영
 */
export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    // Primary: Solid Brand Teal with soft shadow
    primary: 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 border border-transparent hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98]',
    // Secondary: Outline / Stroke Brand Teal
    secondary: 'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-light',
    // Ghost: Subtle
    ghost: 'bg-transparent text-slate-500 hover:bg-brand-light/50 hover:text-brand-primary',
    // Glass: White glass with Teal border hint
    glass: 'bg-white/40 backdrop-blur-xl border border-white/60 text-slate-800 hover:bg-white/60 shadow-glass hover:border-brand-primary/30'
  };

  return (
    <motion.button
      className={`
        px-8 py-4 rounded-full font-bold text-sm tracking-wide
        flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
};
