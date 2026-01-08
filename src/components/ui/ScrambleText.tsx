import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ScrambleText 컴포넌트 Props
 */
export interface ScrambleTextProps {
  /**
   * 표시할 텍스트
   */
  text: string;
  /**
   * 스크램블 애니메이션 지속 시간 (ms)
   */
  duration?: number;
  /**
   * 스크램블에 사용할 문자 집합
   */
  characters?: string;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
  /**
   * 자동 시작 여부
   */
  autoStart?: boolean;
}

/**
 * ScrambleText 컴포넌트
 * 
 * 텍스트가 무작위 문자로 스크램블되다가 최종 텍스트로 변환되는 애니메이션 효과
 * 로딩, 전환, 강조 등의 상황에서 사용
 */
export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  duration = 1000,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
  className = '',
  autoStart = true,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isScrambling, setIsScrambling] = useState(false);

  /**
   * 스크램블 애니메이션 시작
   * requestAnimationFrame을 사용하여 성능 최적화
   */
  const startScramble = () => {
    setIsScrambling(true);
    setDisplayText('');
    
    const startTime = performance.now();
    const framesPerChar = 3;
    const totalFrames = text.length * framesPerChar;
    const frameDuration = duration / totalFrames;
    
    let animationFrameId: number;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const frame = Math.floor(elapsed / frameDuration);
      
      if (frame >= totalFrames) {
        setDisplayText(text);
        setIsScrambling(false);
        return;
      }
      
      const fixedChars = Math.floor(frame / framesPerChar);
      const scrambled = text
        .split('')
        .map((char, i) => {
          if (i < fixedChars) return char;
          if (char === ' ') return ' ';
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');
      
      setDisplayText(scrambled);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  };

  /**
   * 텍스트 변경 시 자동 시작
   */
  useEffect(() => {
    if (autoStart && text) {
      const cleanup = startScramble();
      return cleanup;
    }
  }, [text, autoStart]);

  return (
    <motion.span
      className={className}
      animate={{ 
        opacity: isScrambling ? [1, 0.8, 1] : 1 
      }}
      transition={{ 
        duration: 0.1, 
        repeat: isScrambling ? Infinity : 0 
      }}
    >
      {displayText || text}
    </motion.span>
  );
};
