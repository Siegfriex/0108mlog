/**
 * OnboardingGNB 컴포넌트
 * 
 * 온보딩 화면 전용 Global Navigation Bar
 * 진행률 표시 통합, 로고 및 종료 버튼 포함
 */

import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export interface OnboardingGNBProps {
  onExit?: () => void;
  progress?: number; // 1-6
}

/**
 * OnboardingGNB 컴포넌트
 * 
 * 온보딩 화면의 상단 네비게이션 바
 * 진행률 표시, 로고, 종료 버튼 포함
 * max-w-lg 컨테이너로 일관성 확보
 * 
 * @component
 * @param {OnboardingGNBProps} props - 컴포넌트 props
 * @returns {JSX.Element} OnboardingGNB 컴포넌트
 */
export const OnboardingGNB: React.FC<OnboardingGNBProps> = ({
  onExit,
  progress = 1,
}) => {
  const progressPercentage = Math.round((progress / 6) * 100);

  return (
    <header className="fixed top-0 z-nav w-full flex justify-center pt-safe-top px-6 sm:px-8">
      <div className="w-full max-w-lg flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">M</span>
          </div>
        </div>

        {/* 진행률 표시 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-full shadow-sm border border-white/80 max-w-xs"
        >
          <span className="text-xs font-bold text-brand-primary min-w-[2rem] text-right">
            {progress}/6
          </span>
          <div className="flex-1 max-w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <motion.div
                key={step}
                className={`w-1.5 h-1.5 rounded-full ${
                  step <= progress ? 'bg-brand-primary' : 'bg-slate-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: step <= progress ? 1 : 0.8 }}
                transition={{ delay: step * 0.05, duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>

        {/* 종료 버튼 */}
        {onExit && (
          <button
            onClick={onExit}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            aria-label="종료"
          >
            <X size={18} className="text-slate-600" />
          </button>
        )}
      </div>
    </header>
  );
};
