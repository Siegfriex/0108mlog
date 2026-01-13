import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Button, EmotionOrb } from './index';
import { EmotionType } from '../../../types';
import { Smile, Meh, Frown, CloudRain, Flame } from 'lucide-react';

/**
 * 감정 설정 구성
 */
const EMOTIONS_CONFIG = [
  { id: EmotionType.JOY, label: '완전 최고', icon: <Smile size={36} strokeWidth={2} />, color: 'text-amber-500', bgGradient: 'from-amber-200/40 via-yellow-100/40 to-orange-100/40' },
  { id: EmotionType.PEACE, label: '괜찮아요', icon: <Meh size={36} strokeWidth={2} />, color: 'text-brand-primary', bgGradient: 'from-brand-secondary/40 via-teal-100/40 to-cyan-100/40' },
  { id: EmotionType.ANXIETY, label: '조금 불안해요', icon: <Frown size={36} strokeWidth={2} />, color: 'text-orange-500', bgGradient: 'from-orange-200/40 via-red-100/40 to-amber-100/40' },
  { id: EmotionType.SADNESS, label: '우울해요', icon: <CloudRain size={36} strokeWidth={2} />, color: 'text-indigo-500', bgGradient: 'from-indigo-200/40 via-purple-100/40 to-slate-100/40' },
  { id: EmotionType.ANGER, label: '화가 나요', icon: <Flame size={36} strokeWidth={2} />, color: 'text-rose-500', bgGradient: 'from-rose-200/40 via-red-100/40 to-orange-100/40' },
];

export interface EmotionSelectModalProps {
  isOpen: boolean;
  selectedEmotion: EmotionType | null;
  intensity: number;
  onEmotionSelect: (emotion: EmotionType) => void;
  onIntensityChange: (intensity: number) => void;
  onComplete: () => void;
}

/**
 * 감정 선택 모달 컴포넌트
 * 글래스모피즘 스타일의 중앙 모달로 감정과 강도 선택
 */
export const EmotionSelectModal: React.FC<EmotionSelectModalProps> = ({
  isOpen,
  selectedEmotion,
  intensity,
  onEmotionSelect,
  onIntensityChange,
  onComplete,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-modal flex items-center justify-center p-4"
          >
            {/* 글래스모피즘 모달 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.5
              }}
              className="w-full max-w-md"
            >
              <GlassCard 
                intensity="high" 
                enableSpotlight={true}
                enableTilt={true}
                className="p-8 relative overflow-hidden"
              >
                {/* 배경 그라데이션 효과 */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-transparent pointer-events-none" />
                
                <div className="relative z-content-base">
                  {/* 헤더 */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      오늘 기분이 어떠신가요?
                    </h2>
                    <p className="text-sm text-slate-600">
                      감정을 선택하고 강도를 조절해주세요
                    </p>
                  </motion.div>

                  {/* 감정 선택 그리드 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-4 mb-8"
                  >
                    {EMOTIONS_CONFIG.map((emotion) => {
                      const isSelected = selectedEmotion === emotion.id;
                      return (
                        <motion.div
                          key={emotion.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <EmotionOrb
                            emotion={emotion.id}
                            icon={emotion.icon}
                            label={emotion.label}
                            color={emotion.color}
                            bgGradient={emotion.bgGradient}
                            isSelected={isSelected}
                            onClick={() => onEmotionSelect(emotion.id)}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* 강도 슬라이더 */}
                  {selectedEmotion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="mb-8"
                    >
                      <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">
                        강도: <span className="text-brand-primary text-xl font-bold">{intensity}</span>/10
                      </label>
                      <div className="relative px-2">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={intensity}
                          onChange={(e) => onIntensityChange(Number(e.target.value))}
                          className="slider w-full h-3 rounded-full appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium">
                          <span>약함</span>
                          <span>보통</span>
                          <span>강함</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 시작 버튼 */}
                  {selectedEmotion && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={onComplete}
                        variant="primary"
                        className="w-full h-12 text-base font-semibold shadow-lg shadow-brand-primary/30"
                      >
                        대화 시작하기
                      </Button>
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
