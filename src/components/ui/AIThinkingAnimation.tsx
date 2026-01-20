import React from 'react';
import { motion } from 'framer-motion';

/**
 * AI가 생각하는 중일 때 표시되는 심플한 애니메이션
 */
export const AIThinkingAnimation: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {/* 회전하는 원형 아이콘 */}
      <motion.div
        className="w-3 h-3 rounded-full border-2 border-brand-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* 텍스트 */}
      <span className="text-xs text-slate-500 font-medium">
        생각 중...
      </span>
    </div>
  );
};
