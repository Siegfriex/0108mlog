/**
 * App Context
 * 
 * 전역 앱 상태 관리 Context
 * mode, persona, timelineData, currentEmotion을 관리
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { CoachPersona, TimelineEntry, EmotionType } from '../../types';
import { DEFAULT_PERSONA } from '../../constants';
import { resolveMode, setModeOverride, getModeOverride, Mode, getInitialMode } from '../services/modeResolver';
import { TIME_CONSTANTS } from '../../constants';
import { ensureAnonymousAuth } from '../services/auth';
import { useRealtimeTimeline } from '../hooks/useRealtime';
import { useAuthUser } from '../hooks/useAuthUser';
import { upsertTimelineEntry, deleteTimelineEntryById } from '../services/firestore';

/**
 * AppContext 값 인터페이스
 */
interface AppContextValue {
  // 상태
  mode: Mode;
  persona: CoachPersona;
  timelineData: TimelineEntry[];
  currentEmotion: EmotionType | null;
  
  // 액션
  setMode: (mode: Mode) => void;
  setPersona: (persona: CoachPersona) => void;
  addTimelineEntry: (entry: TimelineEntry) => void;
  deleteTimelineEntry: (id: string) => void;
  setCurrentEmotion: (emotion: EmotionType | null) => void;
}

/**
 * AppContext 생성
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * AppProvider Props
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider 컴포넌트
 * 
 * 전역 앱 상태를 관리하는 Provider
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 초기값: Firestore 접근 없이 localStorage + 시간 기반으로 설정
  const [mode, setModeState] = useState<Mode>(getInitialMode());
  const [persona, setPersona] = useState<CoachPersona>(DEFAULT_PERSONA);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>(null);
  const [isSettingsSynced, setIsSettingsSynced] = useState(false);

  // Auth 상태 구독
  const { userId } = useAuthUser();

  // Firestore 실시간 타임라인 데이터 (userId가 있을 때만 구독)
  const { data: firestoreTimeline, loading: timelineLoading } = useRealtimeTimeline({
    userId: userId ?? undefined,
    orderByField: 'date',
    orderDirection: 'desc',
    limitCount: 50,
  });

  // 로컬 optimistic 업데이트용 상태 (Firestore 데이터와 병합)
  const [localTimelineUpdates, setLocalTimelineUpdates] = useState<TimelineEntry[]>([]);

  // 실제 표시될 타임라인: Firestore + 로컬 업데이트 병합
  const timelineData = useMemo(() => {
    // Firestore 데이터가 로딩 중이거나 비어있으면 로컬 업데이트만 표시
    if (!firestoreTimeline || firestoreTimeline.length === 0) {
      return localTimelineUpdates;
    }
    // Firestore 데이터가 있으면 로컬 업데이트 제거 (이미 동기화됨)
    return firestoreTimeline;
  }, [firestoreTimeline, localTimelineUpdates]);

  // Auth 완료 후 Firestore 동기화
  useEffect(() => {
    const syncSettings = async () => {
      try {
        // Auth 대기 (Router에서 이미 완료되었지만 안전장치)
        await ensureAnonymousAuth();
        
        // Firestore에서 설정 로드
        const resolvedMode = await resolveMode();
        
        // 수동 override가 없으면 적용
        if (!getModeOverride()) {
          setModeState(resolvedMode);
        }
        
        setIsSettingsSynced(true);
      } catch (error) {
        console.error('Failed to sync settings from Firestore:', error);
        // 에러 발생해도 계속 진행 (초기값 유지)
        setIsSettingsSynced(true);
      }
    };

    syncSettings();
  }, []);

  // 주기적 모드 체크 (설정 동기화 후에만)
  useEffect(() => {
    if (!isSettingsSynced) return;

    const interval = setInterval(async () => {
      const override = getModeOverride();
      if (!override) {
        try {
          const resolvedMode = await resolveMode();
          setModeState(resolvedMode);
        } catch (error) {
          console.error('Failed to update mode:', error);
        }
      }
    }, TIME_CONSTANTS.MODE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isSettingsSynced]);

  /**
   * 모드 설정 (수동 override 포함)
   */
  const setMode = useCallback((newMode: Mode) => {
    setModeOverride(newMode);
    setModeState(newMode);
  }, []);

  /**
   * 페르소나 설정
   */
  const setPersonaHandler = useCallback((newPersona: CoachPersona) => {
    setPersona(newPersona);
  }, []);

  /**
   * 타임라인 엔트리 추가 (Firestore 저장 + Optimistic UI)
   */
  const addTimelineEntry = useCallback(async (entry: TimelineEntry) => {
    // Optimistic 업데이트: 즉시 UI에 반영
    setLocalTimelineUpdates(prev => [entry, ...prev]);

    // Firestore에 저장 (백그라운드)
    try {
      await upsertTimelineEntry({
        date: entry.date,
        type: entry.type,
        emotion: entry.emotion,
        intensity: entry.intensity,
        summary: entry.summary,
        detail: entry.detail,
        nuanceTags: entry.nuanceTags,
        conversationId: entry.id, // entry.id를 conversationId로 사용
      });
      // 성공 시 로컬 업데이트 제거 (Firestore에서 실시간으로 반영됨)
      setLocalTimelineUpdates(prev => prev.filter(e => e.id !== entry.id));
    } catch (error) {
      console.error('Failed to save timeline entry:', error);
      // 실패 시 로컬 업데이트 유지 (사용자에게 보여줌)
    }
  }, []);

  /**
   * 타임라인 엔트리 삭제 (Firestore 삭제)
   */
  const deleteTimelineEntry = useCallback(async (id: string) => {
    // Optimistic 업데이트: 즉시 UI에서 제거
    setLocalTimelineUpdates(prev => prev.filter(entry => entry.id !== id));

    // Firestore에서 삭제
    try {
      await deleteTimelineEntryById(id);
    } catch (error) {
      console.error('Failed to delete timeline entry:', error);
    }
  }, []);

  /**
   * 현재 감정 설정
   */
  const setCurrentEmotionHandler = useCallback((emotion: EmotionType | null) => {
    setCurrentEmotion(emotion);
  }, []);

  const value: AppContextValue = useMemo(() => ({
    mode,
    persona,
    timelineData,
    currentEmotion,
    setMode,
    setPersona: setPersonaHandler,
    addTimelineEntry,
    deleteTimelineEntry,
    setCurrentEmotion: setCurrentEmotionHandler,
  }), [mode, persona, timelineData, currentEmotion, setMode, setPersonaHandler, addTimelineEntry, deleteTimelineEntry, setCurrentEmotionHandler]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * useAppContext Hook
 * 
 * AppContext를 사용하는 Hook
 * Provider 외부에서 사용 시 에러 발생
 */
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
