import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Star, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { GlassCard, Button } from './UI';
import { VoicePlayer } from './VoicePlayer';
import { generateNightModeLetter } from '../services/geminiService';
import { CoachPersona, TimelineEntry, EmotionType, EmotionData } from '../types';

interface NightModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
}

const EMOTIONS: EmotionData[] = [
    { id: EmotionType.JOY, label: '기쁨', icon: '😊', color: 'joy', desc: '활력이 넘치는' },
    { id: EmotionType.PEACE, label: '평온', icon: '😌', color: 'peace', desc: '차분하고 안정된' },
    { id: EmotionType.ANXIETY, label: '불안', icon: '😰', color: 'anxiety', desc: '걱정이 많은' },
    { id: EmotionType.SADNESS, label: '슬픔', icon: '😢', color: 'sadness', desc: '가라앉은' },
    { id: EmotionType.ANGER, label: '분노', icon: '😡', color: 'anger', desc: '짜증나는' },
];

export const NightMode: React.FC<NightModeProps> = ({ persona, onSave }) => {
  const [step, setStep] = useState<'emotion' | 'diary' | 'letter'>('emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [diary, setDiary] = useState('');
  const [letter, setLetter] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleNextStep = () => {
      if (step === 'emotion' && selectedEmotion) {
          setStep('diary');
      }
  };

  const handleAnalyze = async () => {
    if (!diary.trim()) return;
    setIsAnalyzing(true);
    
    const result = await generateNightModeLetter(diary, persona);
    setLetter(result);
    setStep('letter');
    setIsAnalyzing(false);

    const entry: TimelineEntry = {
        id: Date.now().toString(),
        date: new Date(),
        type: 'night',
        emotion: selectedEmotion || EmotionType.PEACE,
        intensity: intensity,
        summary: diary.slice(0, 40) + (diary.length > 40 ? '...' : ''),
        detail: `[감정]: ${selectedEmotion} (강도: ${intensity})\n[나의 일기]\n${diary}\n\n[${persona.name}의 답장]\n${result}`
    };
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
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 pb-24 relative">
      <header className="flex items-center justify-between mb-8 pt-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Moon className="text-purple-300" /> The Starlight
          </h1>
          <p className="text-purple-200/70 text-sm mt-1">
             {step === 'emotion' ? '오늘 하루, 어떤 감정이 가장 컸나요?' : 
              step === 'diary' ? '그 감정에 대해 이야기해주세요.' : 
              '당신을 위한 편지가 도착했습니다.'}
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 'emotion' && (
            <motion.div
                key="step-emotion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center gap-8"
            >
                <div className="grid grid-cols-2 gap-4">
                    {EMOTIONS.map((emotion) => (
                        <button
                            key={emotion.id}
                            onClick={() => setSelectedEmotion(emotion.id)}
                            className={`
                                p-6 rounded-3xl backdrop-blur-md border text-left transition-all
                                ${selectedEmotion === emotion.id 
                                    ? 'bg-white/20 border-white/60 shadow-lg scale-105 ring-2 ring-purple-300' 
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }
                            `}
                        >
                            <span className="text-4xl mb-2 block">{emotion.icon}</span>
                            <span className="text-white font-bold text-lg">{emotion.label}</span>
                        </button>
                    ))}
                </div>

                {selectedEmotion && (
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                         <div className="flex justify-between text-white font-bold mb-4">
                             <span>강도 (Intensity)</span>
                             <span>{intensity}</span>
                         </div>
                         <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={intensity} 
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                        />
                        <Button onClick={handleNextStep} className="w-full mt-6 bg-purple-500 hover:bg-purple-600 border-none text-white">
                            다음 <ArrowRight size={16} />
                        </Button>
                    </div>
                )}
            </motion.div>
        )}

        {step === 'diary' && (
             <motion.div
                key="step-diary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-6"
            >
                <GlassCard className="flex-1 !bg-white/10 !border-white/20">
                    <textarea
                    value={diary}
                    onChange={(e) => setDiary(e.target.value)}
                    placeholder="오늘 하루 어떤 일들이 있었나요? 감정을 자유롭게 표현해보세요..."
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-white placeholder:text-white/30 text-lg leading-relaxed"
                    />
                </GlassCard>

                <Button 
                    onClick={handleAnalyze} 
                    isLoading={isAnalyzing}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] border-none"
                >
                    <Sparkles className="w-5 h-5" />
                    편지 받기
                </Button>
            </motion.div>
        )}

        {step === 'letter' && (
            <motion.div
                key="step-letter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
            >
                <GlassCard className="h-full flex flex-col !bg-indigo-950/40 !border-indigo-400/30">
                    <div className="flex justify-between items-start mb-6 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xl">
                                {persona.role === 'mentor' ? '🧙‍♂️' : '🦋'}
                            </div>
                            <div>
                                <h3 className="text-white font-bold">From. {persona.name}</h3>
                                <span className="text-indigo-300 text-xs">AI {persona.role}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <VoicePlayer text={letter} />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="prose prose-invert prose-p:text-indigo-100 leading-8">
                            <p className="whitespace-pre-wrap">{letter}</p>
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 shrink-0">
                        <Button 
                            variant="ghost" 
                            onClick={reset}
                            className="w-full text-indigo-300 hover:text-white hover:bg-white/10"
                        >
                            새로운 기록 시작하기
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
                className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full shadow-xl"
             >
                 <CheckCircle className="text-green-400" size={20} />
                 <span className="text-white font-semibold">저장 완료</span>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};