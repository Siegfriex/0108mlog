import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';

/**
 * MagneticButton 컴포넌트
 * 
 * 마우스 커서를 따라 움직이는 자석 효과가 있는 버튼
 * 마우스가 가까이 오면 버튼이 커서를 향해 살짝 이동
 */
export interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number; // 자석 강도 (0.1 ~ 0.3)
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  ariaLabel?: string; // 접근성을 위한 라벨
  ariaPressed?: boolean; // 토글 버튼일 경우 사용
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.2,
  className = '',
  onClick,
  disabled = false,
  variant = 'primary',
  ariaLabel,
  ariaPressed,
}) => {
  const { triggerHaptic } = useHaptics();
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  /**
   * 마우스 이동 핸들러
   * 버튼 중심과 마우스 위치의 차이를 계산하여 자석 효과 적용
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    
    const { clientX, clientY } = e;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;
    
    setPosition({ x, y });
  };

  /**
   * 마우스가 버튼을 벗어날 때 원래 위치로 복귀
   */
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const variants = {
    primary: 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 border border-transparent hover:bg-brand-dark',
    secondary: 'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-light',
    ghost: 'bg-transparent text-slate-500 hover:bg-brand-light/50 hover:text-brand-primary',
    glass: 'bg-white/40 backdrop-blur-xl border border-white/60 text-slate-800 hover:bg-white/60 shadow-glass hover:border-brand-primary/30'
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      triggerHaptic('light');
      onClick();
    }
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      whileFocus={!disabled ? { scale: 1.05 } : {}}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={`
        relative overflow-hidden
        px-8 py-4 rounded-full font-bold text-sm tracking-wide
        flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};
