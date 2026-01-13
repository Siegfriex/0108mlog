import React, { useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useFocusRestore } from '../../hooks/useFocusRestore';
import { Portal } from './Portal';

/**
 * MobileSheet 컴포넌트 Props
 */
export interface MobileSheetProps {
  /**
   * 시트 열림 여부
   */
  isOpen: boolean;
  /**
   * 시트 닫기 핸들러
   */
  onClose: () => void;
  /**
   * 시트 제목
   */
  title?: string;
  /**
   * 시트 내용
   */
  children: React.ReactNode;
  /**
   * 시트 높이 (기본: 80%)
   */
  height?: string;
  /**
   * 드래그로 닫기 임계값 (기본: 150px)
   */
  closeThreshold?: number;
}

/**
 * MobileSheet 컴포넌트
 * 
 * 모바일 환경에서 하단에서 올라오는 시트 컴포넌트
 * 모달, 설정, 상세 정보 등을 표시하는 데 사용
 * 드래그로 닫기 지원
 */
export const MobileSheet: React.FC<MobileSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = '80%',
  closeThreshold = 150,
}) => {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, closeThreshold], [1, 0.5]);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 포커스 트랩 적용
  useFocusTrap({
    enabled: isOpen,
    containerRef: sheetRef,
    initialFocusSelector: title ? 'h2' : undefined,
  });

  // 포커스 복원 적용
  useFocusRestore({
    shouldRestore: !isOpen,
  });

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // 드래그 거리가 임계값을 넘거나 속도가 빠르면 닫기
    if (info.offset.y > closeThreshold || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-modal-backdrop"
              style={{ opacity }}
            />

            {/* 시트 */}
            <motion.div
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-modal bg-white rounded-t-3xl shadow-2xl pb-safe-bottom touch-none"
              style={{ y, height }}
            >
              {/* 드래그 핸들 바 */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
              </div>

              {/* 헤더 */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="닫기"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
              )}

              {/* 내용 */}
              <div className="overflow-y-auto px-6 py-4" style={{ height: 'calc(100% - var(--dock-height))' }}>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
};
