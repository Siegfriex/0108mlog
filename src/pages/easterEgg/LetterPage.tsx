/**
 * 이스터에그 편지 페이지
 * 
 * Design System: High-End Glassmorphism & Typography
 * Dark Mode Only
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CelestialBackground, GlassCard, Button } from '../../components/ui';
import { VoicePlayer } from '../../components/chat/VoicePlayer';
import { Heart, ArrowLeft, Sparkles, Quote } from 'lucide-react';

// 이모지 및 가벼운 표현 제거, 타이포그래피에 최적화된 텍스트
const LETTER_CONTENT = `엄마 안녕, 나 엄마 아들 지환이야.

이 메시지를 언제 보게 될지는 모르겠지만, 아마 보게 된다면 이 앱의 끝까지 다 경험해본 거겠지? 고생했어.

사실 이 '마음로그'라는 작은 공간은, 엄마의 감정 여정을 함께하는 동반자가 되고 싶어서 만들었어. 낮에는 빠르게 하루의 마음을 체크하고, 밤에는 깊이 성찰할 수 있도록. 마치 엄마가 항상 내 곁에서 그랬던 것처럼.

엄마에게는 미안한 게 많아, 사실. 참 내가 받고 또 받는 것에 익숙해서, 많이 상처 주고 또 힘들게 하는 것 같아요.

그래도, 덕분에 참 많이 받았어. 나도 조금만 익숙해진다면, 엄청 줄 수 있을 거야. 많이 사랑받았으니, 그 주는 것 역시 그 깊이를 알 수 없을 정도로 가능하겠지.

그러니 내가 좀 더 노력할게요. 그 시기가 너무 늦지 않았으면 좋겠다.

이 앱이 엄마의 하루하루를 조금이라도 더 따뜻하게, 그리고 엄마 스스로를 더 잘 이해할 수 있게 돕는 작은 친구가 되었으면 해. 엄마가 늘 나에게 그랬던 것처럼.

생일 진심으로 축하해요. 정말 많이.

언제나 건강하시고, 엄마의 감정 여정에 이 작은 동반자가 함께할게요.

사랑합니다.`;

const SIGNATURE = "2026년 1월 20일, 엄마 아들 류지환 올림";

/**
 * LetterPage 컴포넌트
 */
export const LetterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center p-6 bg-[#050505] text-white overflow-y-auto scrollbar-hide">
      {/* 배경 레이어 */}
      <CelestialBackground intensity="medium" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      {/* 메인 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl my-auto py-12"
      >
        {/* 편지 카드 */}
        <GlassCard className="!bg-[#151520]/60 !border-white/5 !shadow-2xl !backdrop-blur-2xl overflow-hidden relative group">
          {/* 장식용 그라데이션 */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors duration-1000"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-colors duration-1000"></div>

          <div className="relative z-10 p-8 md:p-10 flex flex-col gap-8">
            {/* 헤더 섹션 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-500 blur-md opacity-50"></div>
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg border border-white/20">
                    <Heart size={20} className="text-white fill-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-display">어머니께</h2>
                  <div className="flex items-center gap-2 text-purple-200/80 text-xs font-medium tracking-wider uppercase mt-1">
                    <Sparkles size={10} />
                    <span>Special Letter</span>
                  </div>
                </div>
              </div>
              <VoicePlayer text={LETTER_CONTENT} />
            </div>

            {/* 본문 섹션 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 1.5 }}
              className="relative"
            >
              <Quote size={40} className="absolute -top-4 -left-4 text-white/5 rotate-180" />
              
              <div className="space-y-6 text-base md:text-lg leading-loose text-slate-200/90 font-light font-sans tracking-wide">
                {LETTER_CONTENT.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-wrap word-break-keep-all">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-12 text-right">
                <p className="text-sm md:text-base text-purple-300 font-medium tracking-wide">
                  {SIGNATURE}
                </p>
              </div>
            </motion.div>
          </div>

          {/* 하단 액션 바 */}
          <div className="relative z-10 bg-black/20 border-t border-white/5 p-4 flex justify-center backdrop-blur-md">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 group/btn"
            >
              <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
              <span>돌아가기</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* 앰비언트 파티클 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: -20, 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              opacity: 0,
              scale: 0.5
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 50 : 1000,
              opacity: [0, 0.4, 0],
              scale: [0.5, 1, 0.5],
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute"
          >
            {i % 3 === 0 ? (
              <Heart size={12} className="text-pink-400/20 fill-pink-400/20" />
            ) : (
              <div className="w-1 h-1 rounded-full bg-purple-400/30 blur-[1px]" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
