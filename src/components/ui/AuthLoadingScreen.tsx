import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Auth 초기화 로딩 화면
 * 
 * Anonymous Auth 완료를 기다리는 동안 표시
 */
export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* 로고 */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-accent via-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/30">
          <Sparkles size={40} className="text-white" strokeWidth={1.5} />
        </div>
        
        {/* 로딩 스피너 */}
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        
        {/* 메시지 */}
        <p className="text-sm font-medium text-slate-700">마음로그 시작하는 중...</p>
      </motion.div>
    </div>
  );
};
