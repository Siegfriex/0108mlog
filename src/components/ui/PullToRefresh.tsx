import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

/**
 * PullToRefresh 컴포넌트 Props
 */
export interface PullToRefreshProps {
  /**
   * 새로고침 핸들러
   */
  onRefresh: () => Promise<void>;
  /**
   * 새로고침 트리거 임계값 (px)
   */
  threshold?: number;
  /**
   * 자식 요소
   */
  children: React.ReactNode;
}

/**
 * PullToRefresh 컴포넌트
 * 
 * 당겨서 새로고침 기능을 제공하는 컴포넌트
 * 모바일 환경에서 사용자 친화적인 새로고침 인터페이스 제공
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  threshold = 80,
  children,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const rotate = useTransform(y, [0, threshold], [0, 360]);
  const shouldRefresh = useTransform(y, (val) => val >= threshold);
  const [refreshText, setRefreshText] = useState('당겨서 새로고침');
  const containerRef = useRef<HTMLDivElement>(null);

  // shouldRefresh 값 변경 감지하여 텍스트 업데이트
  React.useEffect(() => {
    const unsubscribe = shouldRefresh.on('change', (latest) => {
      setRefreshText(latest ? '놓으면 새로고침' : '당겨서 새로고침');
    });
    return unsubscribe;
  }, [shouldRefresh]);

  const handleDragEnd = async () => {
    const currentY = y.get();
    if (currentY >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    y.set(0);
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* 새로고침 인디케이터 */}
      <motion.div
        style={{ y, opacity, rotate }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 pt-4"
      >
        <RefreshCw size={24} className="text-brand-primary" />
        <span className="text-sm text-brand-primary font-medium">
          {refreshText}
        </span>
      </motion.div>

      {/* 콘텐츠 */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
