/**
 * 채팅 메인 페이지
 * 
 * PRD 경로: /chat
 * Day Mode와 Night Mode를 통합한 채팅 메인 화면
 * 기존 DayMode와 NightMode 컴포넌트 활용
 */

import React from 'react';
import { useOutletContext, useNavigate, Navigate } from 'react-router-dom';
import { DayMode } from '../../../components/DayMode';
import { NightMode } from '../../../components/NightMode';
import { CoachPersona, TimelineEntry } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  mode: 'day' | 'night';
  persona: CoachPersona;
  setIsImmersive: (active: boolean) => void;
  timelineData: TimelineEntry[];
  setPersona: (persona: CoachPersona) => void;
}

/**
 * ChatMain Props 인터페이스
 */
interface ChatMainProps {}

/**
 * ChatMain 컴포넌트
 * 
 * @component
 * @param {ChatMainProps} props - 컴포넌트 props
 * @returns {JSX.Element} ChatMain 컴포넌트
 */
export const ChatMain: React.FC<ChatMainProps> = () => {
  const context = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { mode, persona, setIsImmersive, timelineData, setPersona } = context;
  
  const handleSaveEntry = (entry: TimelineEntry) => {
    // TODO: Firestore 저장 로직 추가
    // timelineData는 상위에서 관리하므로 여기서는 로그만
    if (process.env.NODE_ENV === 'development') {
      console.log('Save entry:', entry);
    }
  };

  const handleNavigateToReports = () => {
    navigate('/reports/weekly');
  };

  const handleOpenSafety = () => {
    navigate('/safety');
  };

  return mode === 'day' 
    ? <DayMode 
        persona={persona} 
        onSave={handleSaveEntry} 
        setImmersive={setIsImmersive}
        onNavigateToReports={handleNavigateToReports}
        onOpenSafety={handleOpenSafety}
      /> 
    : <NightMode persona={persona} onSave={handleSaveEntry} />;
};
