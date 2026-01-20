/**
 * useGamification Hook
 *
 * 게이미피케이션 데이터 관리 훅
 * XP, 레벨, 벚꽃 정원 실시간 추적
 */

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  FIRESTORE_COLLECTIONS,
  FirestoreGamificationData,
  XP_REWARDS,
  LEVEL_THRESHOLDS,
} from '../types/firestore';
import {
  getOrInitializeGamification,
  addXP,
  calculateLevelFromXP,
  getXPProgress,
} from '../services/firestore';
import { useAuthUser } from './useAuthUser';

export interface GamificationState {
  xp: number;
  level: number;
  blossomCount: number;
  totalCheckIns: number;
  totalDiaries: number;
  totalMicroActions: number;
  xpProgress: {
    current: number;
    required: number;
    percent: number;
  };
  loading: boolean;
  error: Error | null;
}

export interface UseGamificationReturn extends GamificationState {
  awardCheckinXP: () => Promise<{ leveledUp: boolean; newLevel: number }>;
  awardDiaryXP: () => Promise<{ leveledUp: boolean; newLevel: number }>;
  awardMicroActionXP: () => Promise<{ leveledUp: boolean; newLevel: number }>;
  refetch: () => Promise<void>;
}

/**
 * 게이미피케이션 훅
 */
export function useGamification(): UseGamificationReturn {
  const { userId, loading: authLoading } = useAuthUser();

  const [state, setState] = useState<GamificationState>({
    xp: 0,
    level: 1,
    blossomCount: 0,
    totalCheckIns: 0,
    totalDiaries: 0,
    totalMicroActions: 0,
    xpProgress: { current: 0, required: 100, percent: 0 },
    loading: true,
    error: null,
  });

  // 실시간 구독
  useEffect(() => {
    if (authLoading || !userId) {
      setState(prev => ({ ...prev, loading: authLoading }));
      return;
    }

    // 초기 데이터 로드
    const loadInitialData = async () => {
      try {
        await getOrInitializeGamification();
      } catch (error) {
        console.error('Failed to initialize gamification:', error);
      }
    };

    loadInitialData();

    // 실시간 구독 설정
    const gamificationRef = doc(db, FIRESTORE_COLLECTIONS.GAMIFICATION, userId);

    const unsubscribe = onSnapshot(
      gamificationRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<FirestoreGamificationData, 'id'>;
          const xpProgress = getXPProgress(data.xp);

          setState({
            xp: data.xp,
            level: data.level,
            blossomCount: data.blossomCount || 0,
            totalCheckIns: data.totalCheckIns || 0,
            totalDiaries: data.totalDiaries || 0,
            totalMicroActions: data.totalMicroActions || 0,
            xpProgress,
            loading: false,
            error: null,
          });
        } else {
          // 문서가 없는 경우 기본값
          setState(prev => ({
            ...prev,
            loading: false,
          }));
        }
      },
      (error) => {
        console.error('Gamification subscription error:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
      }
    );

    return () => unsubscribe();
  }, [userId, authLoading]);

  // XP 부여 함수들
  const awardCheckinXP = useCallback(async () => {
    try {
      const result = await addXP(XP_REWARDS.CHECKIN, 'checkin');
      return { leveledUp: result.leveledUp, newLevel: result.newLevel };
    } catch (error) {
      console.error('Failed to award checkin XP:', error);
      throw error;
    }
  }, []);

  const awardDiaryXP = useCallback(async () => {
    try {
      const result = await addXP(XP_REWARDS.DIARY, 'diary');
      return { leveledUp: result.leveledUp, newLevel: result.newLevel };
    } catch (error) {
      console.error('Failed to award diary XP:', error);
      throw error;
    }
  }, []);

  const awardMicroActionXP = useCallback(async () => {
    try {
      const result = await addXP(XP_REWARDS.MICRO_ACTION, 'micro_action');
      return { leveledUp: result.leveledUp, newLevel: result.newLevel };
    } catch (error) {
      console.error('Failed to award micro action XP:', error);
      throw error;
    }
  }, []);

  // 수동 새로고침
  const refetch = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, loading: true }));
    try {
      await getOrInitializeGamification();
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, [userId]);

  return {
    ...state,
    awardCheckinXP,
    awardDiaryXP,
    awardMicroActionXP,
    refetch,
  };
}

// 레벨 계산 유틸리티 재export
export { calculateLevelFromXP, getXPProgress };
