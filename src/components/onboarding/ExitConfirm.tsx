/**
 * ExitConfirm 컴포넌트
 * 
 * 온보딩 종료 확인 다이얼로그
 * PRD 명세: Step 1에서 뒤로가기 시 종료 확인
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui';

/**
 * ExitConfirm Props 인터페이스
 */
export interface ExitConfirmProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ExitConfirm 컴포넌트
 * 
 * @component
 * @param {ExitConfirmProps} props - 컴포넌트 props
 * @returns {JSX.Element} ExitConfirm 컴포넌트
 */
export const ExitConfirm: React.FC<ExitConfirmProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop"
          />
          
          {/* 다이얼로그 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-modal flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
              {/* 아이콘 */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-orange-500" />
                </div>
              </div>

              {/* 제목 및 설명 */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  온보딩을 종료하시겠어요?
                </h3>
                <p className="text-sm text-slate-600">
                  지금 종료하면 설정이 저장되지 않아요.<br />
                  나중에 다시 시작할 수 있어요.
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="flex-1"
                >
                  계속하기
                </Button>
                <Button
                  onClick={onConfirm}
                  variant="secondary"
                  className="flex-1"
                >
                  종료하기
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
