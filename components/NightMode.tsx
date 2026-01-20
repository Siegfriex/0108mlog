import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, CheckCircle, ArrowRight, Smile, Meh, Frown, CloudRain, Flame, AlertTriangle, TrendingUp } from 'lucide-react';
// UI 컴포넌트 import 경로: 새로운 구조로 변경
import { GlassCard, Button, CelestialBackground, XPFeedback } from '../src/components/ui';
import { VoicePlayer } from './VoicePlayer';
import { generateNightModeLetter } from '../services/geminiService';
import { CoachPersona, TimelineEntry, EmotionType } from '../types';
import { saveDiaryEntry, addXP } from '../src/services/firestore';
import { detectCrisis } from '../src/services/crisisDetection';
import { XP_REWARDS } from '../src/types/firestore';

interface NightModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
  onEmotionChange?: (emotion: EmotionType | null) => void;
  onCrisisDetected?: () => void;
}

// 밤 모드용 감정 설정 (흰색/밝은 스타일)
const NIGHT_EMOTIONS = [
    { id: EmotionType.JOY, label: '기쁨', icon: <Smile size={40} strokeWidth={1.5} />, color: 'joy' },
    { id: EmotionType.PEACE, label: '평온', icon: <Meh size={40} strokeWidth={1.5} />, color: 'peace' },
    { id: EmotionType.ANXIETY, label: '불안', icon: <Frown size={40} strokeWidth={1.5} />, color: 'anxiety' },
    { id: EmotionType.SADNESS, label: '슬픔', icon: <CloudRain size={40} strokeWidth={1.5} />, color: 'sadness' },
    { id: EmotionType.ANGER, label: '분노', icon: <Flame size={40} strokeWidth={1.5} />, color: 'anger' },
];

export const NightMode: React.FC<NightModeProps> = ({ persona, onSave, onEmotionChange, onCrisisDetected }) => {
  const [step, setStep] = useState<'emotion' | 'diary' | 'letter'>('emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [diary, setDiary] = useState('');
  const [letter, setLetter] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCrisisWarning, setShowCrisisWarning] = useState(false);
  const [xpFeedback, setXPFeedback] = useState<{
    xpGained: number;
    leveledUp: boolean;
    newLevel: number;
  } | null>(null);

  const handleNextStep = () => {
      if (step === 'emotion' && selectedEmotion) {
          setStep('diary');
      }
  };

  const handleAnalyze = async () => {
    if (!diary.trim()) return;
    setIsAnalyzing(true);

    // 위기 감지 (키워드 + Gemini 2차 검증)
    const emotionToSave = selectedEmotion || EmotionType.PEACE;
    try {
      const crisisResult = await detectCrisis({
        text: diary,
        emotion: emotionToSave,
        intensity,
      });

      if (crisisResult.isCrisis) {
        setIsAnalyzing(false);

        if (crisisResult.confidence === 'high') {
          // HIGH 신뢰도 → Safety 화면으로 자동 이동
          onCrisisDetected?.();
          return;
        } else if (crisisResult.confidence === 'medium') {
          // MEDIUM 신뢰도 → 경고 표시 후 계속 진행 가능
          setShowCrisisWarning(true);
          setTimeout(() => setShowCrisisWarning(false), 5000);
        }
      }
    } catch (error) {
      console.error('위기 감지 오류:', error);
      // 위기 감지 실패해도 진행
    }

    const result = await generateNightModeLetter(diary, persona);
    setLetter(result);
    setStep('letter');
    setIsAnalyzing(false);

    const entry: TimelineEntry = {
        id: Date.now().toString(),
        date: new Date(),
        type: 'night',
        emotion: emotionToSave,
        intensity: intensity,
        summary: diary.slice(0, 40) + (diary.length > 40 ? '...' : ''),
        detail: `[감정]: ${emotionToSave} (강도: ${intensity})\n[나의 일기]\n${diary}\n\n[${persona.name}의 답장]\n${result}`
    };

    // Firestore에 일기 저장
    try {
      await saveDiaryEntry({
        content: diary,
        emotion: emotionToSave,
        intensity,
        letterContent: result,
      });

      // XP 부여 (게이미피케이션)
      try {
        const xpResult = await addXP(XP_REWARDS.DIARY, 'diary');
        setXPFeedback({
          xpGained: XP_REWARDS.DIARY,
          leveledUp: xpResult.leveledUp,
          newLevel: xpResult.newLevel,
        });
      } catch (xpError) {
        console.warn('XP 부여 실패:', xpError);
      }
    } catch (error) {
      console.error('일기 저장 오류:', error);
      // 에러가 발생해도 로컬 상태는 저장
    }

    onSave(entry);

    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const reset = () => {
      setStep('emotion');
      setDiary('');
      setLetter('');
      setSelectedEmotion(null);
      setIntensity(5);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col px-4 text-white relative overflow-hidden">
      {/* 천체 배경 */}
      <CelestialBackground intensity="medium" />
      
      {/* Title */}
      <div className="py-6 shrink-0 text-center">
          <h2 className="text-2xl font-sans font-bold flex items-center justify-center gap-2 mb-2 drop-shadow-md">
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
                            onClick={() => {
                              setSelectedEmotion(emotion.id);
                              onEmotionChange?.(emotion.id);
                            }}
                            className={`
                                aspect-square p-6 rounded-[32px] backdrop-blur-md border text-left transition-all duration-300 flex flex-col justify-center items-center gap-4 group
                                ${selectedEmotion === emotion.id 
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

                {selectedEmotion && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 w-full"
                    >
                         <div className="flex justify-between text-white font-bold mb-6">
                             <span className="text-xs uppercase tracking-wider text-purple-200">감정 깊이</span>
                             <span className="text-xl">{intensity}</span>
                         </div>
                         <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={intensity} 
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-300"
                        />
                        <Button onClick={handleNextStep} className="w-full mt-8 py-4 bg-purple-500 hover:bg-purple-600 border-none text-white font-bold text-lg shadow-xl shadow-purple-900/40">
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
                <GlassCard className="flex-1 !bg-black/20 !border-white/10 !rounded-[40px] overflow-hidden min-h-[400px] shadow-2xl backdrop-blur-md">
                    <textarea
                    value={diary}
                    onChange={(e) => setDiary(e.target.value)}
                    placeholder="오늘 하루를 기록해보세요..."
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-white placeholder:text-white/20 text-xl leading-relaxed p-4 font-sans"
                    autoFocus
                    />
                </GlassCard>

                <Button 
                    onClick={handleAnalyze} 
                    isLoading={isAnalyzing}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg border-none text-lg font-bold rounded-[24px]"
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
                <GlassCard className="h-full flex flex-col !bg-indigo-950/60 !border-white/10 !rounded-[40px] !p-8 shadow-2xl backdrop-blur-xl">
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
                            <VoicePlayer text={letter} />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                        <div className="prose prose-lg prose-invert prose-p:text-indigo-100 prose-p:leading-loose prose-p:font-light font-sans">
                            <p className="whitespace-pre-wrap">{letter}</p>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5 shrink-0">
                        <Button 
                            variant="ghost" 
                            onClick={reset}
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
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 bg-emerald-500/90 backdrop-blur-xl text-white rounded-full shadow-2xl border border-white/20"
             >
                 <CheckCircle size={20} />
                 <span className="font-bold text-sm">저장되었습니다</span>
             </motion.div>
        )}
        {showCrisisWarning && (
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 px-6 py-4 bg-amber-500/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/20 max-w-sm"
             >
                 <div className="flex items-center gap-2">
                   <AlertTriangle size={20} />
                   <span className="font-bold text-sm">당신의 마음이 걱정됩니다</span>
                 </div>
                 <p className="text-xs text-center opacity-90">
                   힘든 시간을 보내고 계시다면, 안전망에서 전문적인 도움을 받아보세요.
                 </p>
                 <button
                   onClick={() => onCrisisDetected?.()}
                   className="mt-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold hover:bg-white/30 transition-colors"
                 >
                   안전망 바로가기
                 </button>
             </motion.div>
        )}
      </AnimatePresence>

      {/* XP 획득 피드백 */}
      {xpFeedback && (
        <XPFeedback
          xpGained={xpFeedback.xpGained}
          leveledUp={xpFeedback.leveledUp}
          newLevel={xpFeedback.newLevel}
          onComplete={() => setXPFeedback(null)}
        />
      )}
    </div>
  );
};