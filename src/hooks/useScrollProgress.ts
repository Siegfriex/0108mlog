import { useState, useEffect, RefObject } from 'react';

/**
 * useScrollProgress Hook
 * 
 * 스크롤 컨테이너의 스크롤 진행 상태를 추적하는 커스텀 훅
 * Adaptive Blur 헤더 등 스크롤 기반 UI 효과에 사용
 * 
 * @param containerRef - 스크롤을 추적할 컨테이너의 ref
 * @returns scrollY - 현재 스크롤 위치 (px)
 * @returns scrollProgress - 스크롤 진행률 (0-100%)
 */
export function useScrollProgress(containerRef: RefObject<HTMLElement>) {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setScrollY(scrollTop);
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return { scrollY, scrollProgress };
}
