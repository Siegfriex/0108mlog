import { useCallback } from 'react';

/**
 * 햅틱 피드백 타입
 */
export type HapticType = 'subtle' | 'gentle' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * useHaptics 훅
 * 
 * 모바일 디바이스의 햅틱 피드백을 제공하는 커스텀 훅
 * Vibration API를 사용하여 다양한 햅틱 패턴 제공
 */
export const useHaptics = () => {
  /**
   * 햅틱 피드백 트리거
   */
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Vibration API 지원 확인
    if (!('vibrate' in navigator)) {
      return;
    }

    const patterns: Record<HapticType, number | number[]> = {
      subtle: 10,    // 아주 가벼운 터치
      gentle: 15,    // 부드러운 터치
      light: 20,     // 기존 light
      medium: 40,    // 기존 medium
      heavy: 80,     // 기존 heavy
      success: [20, 10, 20],  // 짧은 진동 패턴
      error: [40, 20, 40, 20, 40],  // 강한 진동 패턴
      warning: [30, 15, 30],  // 경고 패턴
    };

    const pattern = patterns[type];
    // 타입 안정성을 위한 타입 단언
    (navigator as any).vibrate(pattern);
  }, []);

  return {
    triggerHaptic,
  };
};
