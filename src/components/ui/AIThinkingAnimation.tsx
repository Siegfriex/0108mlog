import React from 'react';
import { motion } from 'framer-motion';

/**
 * AI가 생각하는 중일 때 표시되는 귀여운 인터랙티브 애니메이션
 */
export const AIThinkingAnimation: React.FC = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* 회전하는 원형 아이콘 */}
      <motion.div
        className="relative w-8 h-8"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {/* 외부 원 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-brand-primary/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        {/* 내부 점 */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      {/* 생각하는 말풍선 애니메이션 */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-brand-primary rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* 텍스트 */}
      <motion.span
        className="text-xs text-slate-500 font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        생각 중...
      </motion.span>
    </div>
  );
};
