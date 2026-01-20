/**
 * App Context
 * 
 * 전역 앱 상태 관리 Context
 * mode, persona, timelineData, currentEmotion을 관리
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CoachPersona, TimelineEntry, EmotionType } from '../../types';
import { DEFAULT_PERSONA } from '../../constants';
import { INITIAL_TIMELINE } from '../mock/data';
import { resolveMode, setModeOverride, getModeOverride, Mode, getInitialMode } from '../services/modeResolver';
import { TIME_CONSTANTS } from '../../constants';
import { ensureAnonymousAuth } from '../services/auth';

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
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>(INITIAL_TIMELINE);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>(null);
  const [isSettingsSynced, setIsSettingsSynced] = useState(false);

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
   * 타임라인 엔트리 추가
   */
  const addTimelineEntry = useCallback((entry: TimelineEntry) => {
    setTimelineData(prev => [entry, ...prev]);
  }, []);

  /**
   * 타임라인 엔트리 삭제
   */
  const deleteTimelineEntry = useCallback((id: string) => {
    setTimelineData(prev => prev.filter(entry => entry.id !== id));
  }, []);

  /**
   * 현재 감정 설정
   */
  const setCurrentEmotionHandler = useCallback((emotion: EmotionType | null) => {
    setCurrentEmotion(emotion);
  }, []);

  const value: AppContextValue = {
    mode,
    persona,
    timelineData,
    currentEmotion,
    setMode,
    setPersona: setPersonaHandler,
    addTimelineEntry,
    deleteTimelineEntry,
    setCurrentEmotion: setCurrentEmotionHandler,
  };

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
