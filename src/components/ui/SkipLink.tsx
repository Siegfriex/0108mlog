/**
 * Skip Link 컴포넌트
 * 
 * 키보드 사용자가 메인 콘텐츠로 바로 이동할 수 있는 링크
 * 접근성 개선을 위한 컴포넌트
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * SkipLink Props
 */
export interface SkipLinkProps {
  /**
   * 스킵할 대상 요소의 ID
   */
  targetId?: string;
  
  /**
   * 링크 텍스트
   */
  label?: string;
  
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * SkipLink 컴포넌트
 * 
 * @example
 * ```tsx
 * <SkipLink targetId="main-content" label="메인 콘텐츠로 건너뛰기" />
 * ```
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = '메인 콘텐츠로 건너뛰기',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        sr-only focus:not-sr-only
        absolute top-4 left-4 z-max
        px-4 py-2 bg-brand-700 text-white rounded-lg
        font-bold text-sm
        focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2
        ${className}
      `}
      initial={{ opacity: 0, y: -10 }}
      whileFocus={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label}
    </motion.a>
  );
};
