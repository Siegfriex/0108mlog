import React, { useState, useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Button 컴포넌트
 * 
 * 다양한 variant를 지원하는 버튼 컴포넌트
 * PRD 디자인 시스템의 버튼 스타일 반영
 * 포커스 스타일 및 파동 효과 지원
 */
export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  isLoading?: boolean;
  children?: React.ReactNode;
  'aria-label'?: string; // 접근성을 위한 라벨 (아이콘만 있는 버튼 등에 필수)
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  onClick,
  'aria-label': ariaLabel,
  ...props 
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const variants = {
    // 기본: 부드러운 그림자가 있는 브랜드 틸 색상
    primary: 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 border border-transparent hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98]',
    // 보조: 브랜드 틸 외곽선
    secondary: 'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-light',
    // 고스트: 미묘한 스타일
    ghost: 'bg-transparent text-slate-500 hover:bg-brand-light/50 hover:text-brand-primary',
    // 글래스: 틸 테두리 힌트가 있는 흰색 글래스
    glass: 'bg-white/40 backdrop-blur-xl border border-white/60 text-slate-800 hover:bg-white/60 shadow-glass hover:border-brand-primary/30'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;
      
      setRipples(prev => [...prev, { x, y, id }]);
      
      // 파동 효과 제거 (애니메이션 완료 후)
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 600);
    }
    
    onClick?.(e);
  };

  // aria-label이 없고 children도 없거나 텍스트가 없는 경우 기본값 설정
  const effectiveAriaLabel = ariaLabel || (typeof children === 'string' ? children : undefined);

  return (
    <motion.button
      ref={buttonRef}
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
      disabled={isLoading || props.disabled}
      onClick={handleClick}
      aria-label={effectiveAriaLabel}
      whileHover={!isLoading && !props.disabled ? { scale: 1.02 } : {}}
      whileTap={!isLoading && !props.disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* 파동 효과 */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
          animate={{ width: 200, height: 200, x: '-50%', y: '-50%', opacity: [0.3, 0] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      
      {/* 로딩 스피너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isLoading ? 1 : 0, scale: isLoading ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      </motion.div>
      
      {/* 버튼 텍스트 */}
      <motion.span
        animate={{ opacity: isLoading ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};
