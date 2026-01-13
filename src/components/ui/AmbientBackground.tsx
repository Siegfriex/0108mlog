import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EmotionType } from '../../../types';
import { getAmbientEmotionColor, type ModeType } from '../../utils/style';

/**
 * AmbientBackground 컴포넌트
 * 
 * 감정에 반응하는 배경 구체 시스템
 * 3개의 구체가 감정에 따라 색상과 움직임이 변화
 * 
 * CSS 변수 기반 색상 시스템 사용
 */
export interface AmbientBackgroundProps {
  /** 현재 감정 (emotion 또는 currentEmotion 둘 다 지원) */
  emotion?: EmotionType | null;
  currentEmotion?: EmotionType | null;
  /** 감정 강도 (1-10, 애니메이션 속도에 영향) */
  intensity?: number;
  mode?: ModeType;
}

/** 감정 타입 매핑 (EmotionType enum → string) */
const emotionToString = (em: EmotionType): 'joy' | 'peace' | 'anxiety' | 'sadness' | 'anger' => {
  switch (em) {
    case EmotionType.JOY: return 'joy';
    case EmotionType.PEACE: return 'peace';
    case EmotionType.ANXIETY: return 'anxiety';
    case EmotionType.SADNESS: return 'sadness';
    case EmotionType.ANGER: return 'anger';
    default: return 'peace';
  }
};

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ 
  emotion,
  currentEmotion,
  intensity = 5,
  mode = 'day' 
}) => {
  // emotion 또는 currentEmotion 둘 다 지원 (하위 호환성)
  const activeEmotion = emotion ?? currentEmotion;
  
  // 강도에 따른 애니메이션 속도 조절 (1-10 → 0.5-1.5 배속)
  const speedMultiplier = 0.5 + (intensity / 10);
  
  // CSS 변수 기반 감정 색상 (메모이제이션)
  const emotionColor = useMemo(() => {
    const emotionStr = activeEmotion ? emotionToString(activeEmotion) : null;
    // emotionStr을 EmotionType으로 변환
    const emotionType = emotionStr as 'joy' | 'peace' | 'anxiety' | 'sadness' | 'anger' | null;
    // mode를 ModeType으로 명시적 변환
    const modeType: ModeType = mode as ModeType;
    return getAmbientEmotionColor(emotionType, modeType);
  }, [activeEmotion, mode]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-base">
      {/* 구체 1: 상단 왼쪽 */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-40"
        style={{
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${emotionColor}40, transparent)`,
          top: '-10%',
          left: '-5%',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8 / speedMultiplier,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 구체 2: 중앙 오른쪽 */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-30"
        style={{
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${emotionColor}30, transparent)`,
          top: '50%',
          right: '-5%',
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10 / speedMultiplier,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* 구체 3: 하단 중앙 */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-25"
        style={{
          width: '350px',
          height: '350px',
          background: `radial-gradient(circle, ${emotionColor}25, transparent)`,
          bottom: '-10%',
          left: '50%',
        }}
        animate={{
          x: [0, 25, 0],
          y: [0, -15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12 / speedMultiplier,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
};
