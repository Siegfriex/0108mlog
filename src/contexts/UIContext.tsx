/**
 * UI Context
 * 
 * 전역 UI 상태 관리 Context
 * isImmersive, showChatbot, showSafetyLayer, isOnline을 관리
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';

/**
 * UIContext 값 인터페이스
 */
interface UIContextValue {
  isImmersive: boolean;
  showChatbot: boolean;
  showSafetyLayer: boolean;
  isOnline: boolean;
  
  setIsImmersive: (active: boolean) => void;
  setShowChatbot: (show: boolean) => void;
  setShowSafetyLayer: (show: boolean) => void;
}

/**
 * UIContext 생성
 */
const UIContext = createContext<UIContextValue | undefined>(undefined);

/**
 * UIProvider Props
 */
interface UIProviderProps {
  children: ReactNode;
}

/**
 * UIProvider 컴포넌트
 * 
 * 전역 UI 상태를 관리하는 Provider
 */
export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [isImmersive, setIsImmersiveState] = useState(false);
  const [showChatbot, setShowChatbotState] = useState(false);
  const [showSafetyLayer, setShowSafetyLayerState] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  /**
   * 네트워크 상태 감지 (FE-C2 해결)
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ 네트워크 연결됨');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.warn('⚠️ 네트워크 끊김');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * 몰입 모드 설정
   */
  const setIsImmersive = useCallback((active: boolean) => {
    setIsImmersiveState(active);
  }, []);

  /**
   * 챗봇 표시 설정
   */
  const setShowChatbot = useCallback((show: boolean) => {
    setShowChatbotState(show);
  }, []);

  /**
   * 안전망 레이어 표시 설정
   */
  const setShowSafetyLayer = useCallback((show: boolean) => {
    setShowSafetyLayerState(show);
  }, []);

  const value: UIContextValue = useMemo(() => ({
    isImmersive,
    showChatbot,
    showSafetyLayer,
    isOnline,
    setIsImmersive,
    setShowChatbot,
    setShowSafetyLayer,
  }), [isImmersive, showChatbot, showSafetyLayer, isOnline, setIsImmersive, setShowChatbot, setShowSafetyLayer]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

/**
 * useUIContext Hook
 * 
 * UIContext를 사용하는 Hook
 * Provider 외부에서 사용 시 에러 발생
 */
export const useUIContext = (): UIContextValue => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};
