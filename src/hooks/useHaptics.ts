import { useCallback } from 'react';

/**
 * 햅틱 피드백 타입
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

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
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      warning: [20, 50, 20, 50, 20],
      error: [30, 50, 30, 50, 30],
    };

    const pattern = patterns[type];
    // 타입 안정성을 위한 타입 단언
    (navigator as any).vibrate(pattern);
  }, []);

  return {
    triggerHaptic,
  };
};
