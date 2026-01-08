/**
 * WelcomeScreen 컴포넌트
 * 
 * 온보딩 1단계: 환영 화면
 * PRD 명세: 벚꽃 일러스트 + 제품명 + 슬로건
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui';

/**
 * WelcomeScreen Props 인터페이스
 */
export interface WelcomeScreenProps {
  onNext: () => void;
  onSkip?: () => void;
}

/**
 * WelcomeScreen 컴포넌트
 * 
 * @component
 * @param {WelcomeScreenProps} props - 컴포넌트 props
 * @returns {JSX.Element} WelcomeScreen 컴포넌트
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, onSkip }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center space-y-8">
      {/* 벚꽃 일러스트 (아이콘으로 대체) */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex justify-center mb-8"
      >
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-brand-accent via-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/30">
          <Sparkles size={80} className="text-white" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* 제품명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          MaumLog
        </h1>
        <p className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-6">
          V5.0
        </p>
      </motion.div>

      {/* 슬로건 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <p className="text-lg text-slate-700 font-medium leading-relaxed">
          30초 대화로 정리하고,
        </p>
        <p className="text-lg text-slate-700 font-medium leading-relaxed">
          바로 오늘 1개 실천으로
        </p>
        <p className="text-lg text-slate-700 font-medium leading-relaxed">
          연결하는 자가관리 코치
        </p>
      </motion.div>

      {/* 시작하기 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-8"
      >
        <Button
          onClick={onNext}
          variant="primary"
          className="w-full max-w-[200px] h-14 text-lg font-bold shadow-xl shadow-brand-primary/30"
        >
          시작하기
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </motion.div>

      {/* 스킵 옵션 (선택적) */}
      {onSkip && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onSkip}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          나중에 하기
        </motion.button>
      )}
    </div>
  );
};
