/**
 * XP Feedback Component
 *
 * 게이미피케이션 XP 획득/레벨업 피드백 컴포넌트
 * data-testid="xp-gained" 포함 (e2e 테스트 호환)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Award, TrendingUp } from 'lucide-react';

export interface XPFeedbackProps {
  /**
   * 획득한 XP 양 (표시할 때만 값 전달)
   */
  xpGained?: number;
  /**
   * 레벨업 여부
   */
  leveledUp?: boolean;
  /**
   * 새로운 레벨 (leveledUp이 true일 때)
   */
  newLevel?: number;
  /**
   * 표시 시간 (ms)
   */
  duration?: number;
  /**
   * 피드백 종료 시 콜백
   */
  onComplete?: () => void;
}

export const XPFeedback: React.FC<XPFeedbackProps> = ({
  xpGained,
  leveledUp = false,
  newLevel,
  duration = 3000,
  onComplete,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (xpGained !== undefined && xpGained > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [xpGained, duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="xp-gained"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
        >
          {/* XP 획득 배지 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-lg shadow-orange-500/30"
          >
            <TrendingUp size={18} />
            <span className="font-bold text-lg">+{xpGained} XP</span>
            <Sparkles size={16} />
          </motion.div>

          {/* 레벨업 축하 */}
          {leveledUp && newLevel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl shadow-lg shadow-purple-500/40"
            >
              <Award size={24} className="text-yellow-300" />
              <div className="text-center">
                <p className="text-xs font-medium opacity-90">축하합니다!</p>
                <p className="font-bold text-lg">Level {newLevel} 달성!</p>
              </div>
              <Sparkles size={20} className="text-yellow-300" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPFeedback;
