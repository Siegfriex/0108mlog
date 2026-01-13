import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard 컴포넌트
 * 
 * 글래스모피즘 스타일의 카드 컴포넌트
 * PRD 디자인 시스템의 글래스모피즘 디자인 철학 반영
 * 레이어드 글래스 효과, 노이즈 텍스처, 스포트라이트 효과 지원
 */
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  intensity?: 'low' | 'medium' | 'high';
  enableSpotlight?: boolean;
  enableTilt?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  intensity = 'medium',
  enableSpotlight = false,
  enableTilt = false
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 스포트라이트 효과를 위한 마우스 위치 추적
    if (enableSpotlight) {
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    
    // 패럴랙스 틸트 효과를 위한 회전 각도 계산
    if (enableTilt) {
      const rotateX = ((e.clientY - centerY) / rect.height) * -10;
      const rotateY = ((e.clientX - centerX) / rect.width) * 10;
      setRotate({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      {...((enableSpotlight || enableTilt) && {
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
      })}
      whileHover={{ scale: onClick ? 1.005 : 1, y: onClick ? -2 : 0 }}
      whileTap={{ scale: onClick ? 0.99 : 1 }}
      style={{
        transform: enableTilt 
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` 
          : undefined,
        transformStyle: enableTilt ? 'preserve-3d' : undefined,
      }}
      className={`
        relative overflow-hidden
        ${bgStyle} ${blurStyle}
        border border-white/60
        shadow-brand
        rounded-lg
        p-8
        transition-all duration-300 ease-out
        group
        ${enableTilt ? 'will-change-transform' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* 노이즈 텍스처 */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 스포트라이트 효과 */}
      {enableSpotlight && (
        <div
          className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            left: `${mousePosition.x - 150}px`,
            top: `${mousePosition.y - 150}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* 상단 하이라이트 개선 */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60" />
      
      {/* 내부 그림자 (깊이감) */}
      <div className="absolute inset-0 shadow-inner pointer-events-none" style={{
        boxShadow: 'var(--shadow-xs)',
      }} />

      <div className="relative z-content-base">{children}</div>
    </motion.div>
  );
};
