/**
 * 이스터에그 입구 페이지
 * 
 * Design System: High-End Glassmorphism
 * Dark Mode Only
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CelestialBackground, Button, GlassCard } from '../../components/ui';
import { Sparkles, ArrowLeft, Key } from 'lucide-react';

const CORRECT_BIRTHDATE = '741209';

/**
 * GatePage 컴포넌트
 */
export const GatePage: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  /**
   * 생년월일 검증 및 페이지 전환
   */
  const handleSubmit = () => {
    if (input === CORRECT_BIRTHDATE) {
      navigate('/easter-egg/letter');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInput('');
    }
  };

  /**
   * Enter 키 핸들러
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.length === 6) {
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#050505] text-white">
      {/* 배경 레이어 */}
      <CelestialBackground intensity="high" />
      {/* 노이즈 텍스처 - 외부 URL 제거, CSS로 대체 */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      ></div>
      
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-20 p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors group"
        aria-label="뒤로가기"
      >
        <ArrowLeft size={20} className="text-slate-300 group-hover:text-white transition-colors" />
      </button>

      {/* 메인 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: shake ? [1, 1.02, 0.98, 1.02, 1] : 1
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <GlassCard className="!bg-[#151520]/60 !border-white/10 !shadow-2xl !backdrop-blur-xl p-8 flex flex-col items-center gap-8 relative overflow-hidden">
          {/* 장식용 빛 */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="absolute -top-20 inset-x-0 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>

          {/* 아이콘 */}
          <div className="relative mt-4 pointer-events-none">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-30"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center relative z-10 backdrop-blur-md">
              <Key size={32} className="text-purple-200" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 text-yellow-200"
            >
              <Sparkles size={20} />
            </motion.div>
          </div>

          {/* 텍스트 */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 font-display tracking-tight">
              Secret Gate
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              특별한 순간을 위한 열쇠를 입력하세요
            </p>
          </div>

          {/* 입력 폼 */}
          <div className="w-full space-y-4 relative z-20">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur pointer-events-none"></div>
              <input
                type="tel"
                maxLength={6}
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="YYMMDD"
                className="relative w-full px-6 py-4 text-center text-2xl tracking-[0.5em] font-mono rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors z-10"
                aria-label="생년월일 입력"
                autoFocus
                autoComplete="off"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={input.length !== 6}
              className={`w-full py-4 rounded-xl text-base font-bold tracking-wide transition-all duration-300 relative z-10
                ${input.length === 6 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 text-white border-none' 
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed hover:bg-white/5'}
              `}
            >
              확인하기
            </Button>
          </div>

          {/* 에러 메시지 */}
          <div className="h-6 flex items-center justify-center relative z-20">
            <AnimatePresence>
              {shake && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
                >
                  올바른 열쇠가 아닙니다
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
