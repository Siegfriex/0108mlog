/**
 * 채팅 메인 페이지
 * 
 * PRD 경로: /chat
 * Day Mode와 Night Mode를 통합한 채팅 메인 화면
 * 기존 DayMode와 NightMode 컴포넌트 활용
 */

import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Navigate } from 'react-router-dom';
import { DayMode } from '../../components/chat/DayMode';
import { NightMode } from '../../components/chat/NightMode';
import { ConsentModal } from '../../components/consent/ConsentModal';
import { getConsentState } from '../../services/consent';
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
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { mode, persona, setIsImmersive, timelineData, setPersona } = context;
  
  // 첫 방문 시 동의 모달 표시
  useEffect(() => {
    const checkConsent = async () => {
      if (consentChecked) return;
      
      try {
        const consentState = await getConsentState();
        // 동의 상태가 명확하지 않으면 (null이거나 consentedAt이 없으면) 모달 표시
        if (!consentState.consentedAt && !consentState.revokedAt) {
          setShowConsentModal(true);
        }
        setConsentChecked(true);
      } catch (error) {
        console.error('Error checking consent:', error);
        setConsentChecked(true);
      }
    };

    checkConsent();
  }, [consentChecked]);
  
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
    navigate('/safety?returnTo=' + encodeURIComponent('/chat'));
  };

  /**
   * 위기 감지 핸들러
   * 위기 감지 시 Safety 화면으로 자동 전환 (PRD: < 10초, 페이드 인 0.3초)
   */
  const handleCrisisDetected = () => {
    // 현재 경로를 returnTo로 전달
    navigate('/safety?returnTo=' + encodeURIComponent('/chat'));
  };

  const handleConsentComplete = () => {
    setShowConsentModal(false);
  };

  const handleConsentSkip = () => {
    setShowConsentModal(false);
  };

  return (
    <>
      <ConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsentComplete}
        onSkip={handleConsentSkip}
      />
      {mode === 'day' 
        ? <DayMode 
            persona={persona} 
            onSave={handleSaveEntry} 
            setImmersive={setIsImmersive}
            onNavigateToReports={handleNavigateToReports}
            onOpenSafety={handleOpenSafety}
            onCrisisDetected={handleCrisisDetected}
          /> 
        : <NightMode 
            persona={persona} 
            onSave={handleSaveEntry}
            onCrisisDetected={handleCrisisDetected}
          />}
    </>
  );
};
