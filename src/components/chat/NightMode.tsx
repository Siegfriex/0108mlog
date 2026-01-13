import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, CheckCircle, ArrowRight, Smile, Meh, Frown, CloudRain, Flame } from 'lucide-react';
import { GlassCard, Button, CelestialBackground } from '../ui';
import { VoicePlayer } from './VoicePlayer';
import { CoachPersona, TimelineEntry, EmotionType } from '../../../types';
import { useNightCheckinMachine } from '../../features/checkin/useNightCheckinMachine';

interface NightModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
  onCrisisDetected?: () => void;
  onEmotionChange?: (emotion: EmotionType | null) => void;
}

// 밤 모드용 감정 설정 (흰색/밝은 스타일)
const NIGHT_EMOTIONS = [
    { id: EmotionType.JOY, label: '기쁨', icon: <Smile size={40} strokeWidth={1.5} />, color: 'joy' },
    { id: EmotionType.PEACE, label: '평온', icon: <Meh size={40} strokeWidth={1.5} />, color: 'peace' },
    { id: EmotionType.ANXIETY, label: '불안', icon: <Frown size={40} strokeWidth={1.5} />, color: 'anxiety' },
    { id: EmotionType.SADNESS, label: '슬픔', icon: <CloudRain size={40} strokeWidth={1.5} />, color: 'sadness' },
    { id: EmotionType.ANGER, label: '분노', icon: <Flame size={40} strokeWidth={1.5} />, color: 'anger' },
];

/**
 * NightMode 컴포넌트
 * 
 * FEAT-001: 대화형 감정 체크인 (Night Mode)
 * PRD 플로우차트 2.2: Night Mode 체크인 플로우 구현
 * 
 * 상태 머신 기반 리팩토링
 */
export const NightMode: React.FC<NightModeProps> = ({ persona, onSave, onCrisisDetected, onEmotionChange }) => {
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  // 상태 머신 훅 사용
  const machine = useNightCheckinMachine({
    persona,
    onCrisisDetected,
    onComplete: (entry) => {
      onSave(entry);
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 3000);
    },
    onEmotionChange,
  });

  // 현재 단계 (상태 머신에서 추출)
  const step = machine.currentStep;

  /**
   * 다음 단계로 이동
   */
  const handleNextStep = async () => {
    if (step === 'emotion' && machine.emotion) {
      await machine.nextToDiary();
    }
  };

  /**
   * 일기 분석 및 편지 생성
   */
  const handleAnalyze = async () => {
    if (!machine.diary.trim()) return;
    await machine.analyzeDiary();
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col px-4 text-white relative overflow-hidden">
      {/* 천체 배경 */}
      <CelestialBackground intensity="medium" />
      
      {/* Title */}
      <div className="py-6 shrink-0 text-center">
          <h2 className="text-2xl font-serif font-bold flex items-center justify-center gap-2 mb-2 drop-shadow-md">
            <span className="text-purple-300"><Star size={20} fill="currentColor" /></span>
            {step === 'emotion' ? '저녁 성찰' : step === 'diary' ? '나의 이야기' : '당신을 위한 편지'}
          </h2>
          <p className="text-white/60 text-sm font-medium">
             {step === 'emotion' ? '오늘 하루 기분은 어떠셨나요?' : 
              step === 'diary' ? '모두 털어놓으세요. 밤이 듣고 있어요.' : 
              `${persona.name}의 메시지`}
          </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'emotion' && (
            <motion.div
                key="step-emotion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col justify-center items-center gap-8 max-w-2xl mx-auto w-full"
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                    {NIGHT_EMOTIONS.map((emotion) => (
                        <button
                            key={emotion.id}
                            onClick={() => machine.selectEmotion(emotion.id)}
                            className={`
                                aspect-square p-6 rounded-lg backdrop-blur-md border text-left transition-all duration-300 flex flex-col justify-center items-center gap-4 group
                                ${machine.emotion === emotion.id 
                                    ? 'bg-white/20 border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.1)] scale-105 ring-1 ring-white/50' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }
                            `}
                        >
                            <span className="text-white/80 group-hover:scale-110 transition-transform duration-300">{emotion.icon}</span>
                            <span className="text-white/90 font-medium text-lg tracking-wide">{emotion.label}</span>
                        </button>
                    ))}
                </div>

                {machine.emotion && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl rounded-lg p-8 border border-white/10 w-full"
                    >
                         <div className="flex justify-between text-white font-bold mb-6">
                             <span className="text-xs uppercase tracking-wider text-purple-200">감정 깊이</span>
                             <span className="text-xl">{machine.intensity}</span>
                         </div>
                         <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={machine.intensity} 
                            onChange={(e) => machine.changeIntensity(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-300"
                        />
                        <Button 
                          onClick={handleNextStep} 
                          className="w-full mt-8 py-4 bg-purple-500 hover:bg-purple-600 border-none text-white font-bold text-lg shadow-xl shadow-purple-900/40"
                        >
                            계속하기 <ArrowRight size={20} />
                        </Button>
                    </motion.div>
                )}
            </motion.div>
        )}

        {step === 'diary' && (
             <motion.div
                key="step-diary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col gap-6 w-full max-w-3xl mx-auto pb-10"
            >
                {/* Day Mode 요약 표시 */}
                {machine.dayModeSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-500/20 backdrop-blur-md rounded-lg p-4 border border-purple-300/20"
                  >
                    <p className="text-purple-200 text-sm font-medium mb-1">오늘 낮의 기록</p>
                    <p className="text-white/80 text-sm">{machine.dayModeSummary}</p>
                  </motion.div>
                )}

                <GlassCard className="flex-1 !bg-black/20 !border-white/10 !rounded-2xl overflow-hidden min-h-[25rem] shadow-2xl backdrop-blur-md">
                    <textarea
                      value={machine.diary}
                      onChange={(e) => machine.updateDiary(e.target.value)}
                      placeholder="오늘 하루를 기록해보세요..."
                      className="w-full h-full bg-transparent resize-none focus:outline-none text-white placeholder:text-white/20 text-xl leading-relaxed p-4 font-serif"
                      autoFocus
                    />
                </GlassCard>

                <Button 
                    onClick={handleAnalyze} 
                    isLoading={machine.isAnalyzing}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg border-none text-lg font-bold rounded-xl"
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    별에게 보내기
                </Button>
            </motion.div>
        )}

        {step === 'letter' && (
            <motion.div
                key="step-letter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col h-full overflow-hidden pb-10 w-full max-w-3xl mx-auto"
            >
                <GlassCard className="h-full flex flex-col !bg-indigo-950/60 !border-white/10 !rounded-2xl !p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex justify-between items-start mb-8 shrink-0 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-indigo-500/50 flex items-center justify-center shadow-lg border border-white/10">
                                <Sparkles size={24} className="text-purple-200" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">보낸이. {persona.name}</h3>
                                <span className="text-indigo-300 text-xs font-medium uppercase tracking-wider">인공지능 {persona.role}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <VoicePlayer text={machine.letter} />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                        <div className="prose prose-lg prose-invert prose-p:text-indigo-100 prose-p:leading-loose prose-p:font-light font-serif">
                            <p className="whitespace-pre-wrap">{machine.letter}</p>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5 shrink-0">
                        <Button 
                            variant="ghost" 
                            onClick={machine.reset}
                            className="w-full text-indigo-300 hover:text-white hover:bg-white/5 py-4 text-base"
                        >
                            새 기록 시작하기
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveConfirm && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-popover flex items-center gap-3 px-6 py-3 bg-emerald-500/90 backdrop-blur-xl text-white rounded-full shadow-2xl border border-white/20"
             >
                 <CheckCircle size={20} />
                 <span className="font-bold text-sm">저장되었습니다</span>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
