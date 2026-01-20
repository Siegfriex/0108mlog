/**
 * 채팅 메인 페이지
 * 
 * PRD 경로: /chat
 * Day Mode와 Night Mode를 통합한 채팅 메인 화면
 * 기존 DayMode와 NightMode 컴포넌트 활용
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayMode } from '../../components/chat/DayMode';
import { NightMode } from '../../components/chat/NightMode';
import { ConsentModal } from '../../components/consent/ConsentModal';
import { ReminderBadge } from '../../components/ui';
import { getConsentState } from '../../services/consent';
import { TimelineEntry } from '../../../types';
import { useAppContext } from '../../contexts';
import { useUIContext } from '../../contexts';
import { saveEmotionEntry } from '../../services/firestore';
import { logError } from '../../utils/error';

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
  const navigate = useNavigate();
  const { mode, persona, addTimelineEntry, timelineData } = useAppContext();
  const { setIsImmersive } = useUIContext();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // 마지막 체크인 시간 계산
  const lastCheckinTime = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return null;
    // 가장 최근 타임라인 엔트리의 날짜
    const sorted = [...timelineData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0]?.date || null;
  }, [timelineData]);
  
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
  
  const handleSaveEntry = useCallback(async (entry: TimelineEntry) => {
    try {
      await saveEmotionEntry({
        emotion: entry.emotion,
        intensity: entry.intensity,
        contextTags: entry.nuanceTags,
        modeAtTime: mode,
      });
      // Context 업데이트
      addTimelineEntry(entry);
    } catch (error) {
      logError('ChatMain.handleSaveEntry', error);
      // 에러 토스트 표시 (추후 구현)
    }
  }, [mode, addTimelineEntry]);

  const handleNavigateToReports = useCallback(() => {
    navigate('/reports/weekly');
  }, [navigate]);

  const handleOpenSafety = useCallback(() => {
    navigate('/safety?returnTo=' + encodeURIComponent('/chat'));
  }, [navigate]);

  /**
   * 위기 감지 핸들러
   * 위기 감지 시 Safety 화면으로 자동 전환 (PRD: < 10초, 페이드 인 0.3초)
   */
  const handleCrisisDetected = useCallback(() => {
    // 현재 경로를 returnTo로 전달
    navigate('/safety?returnTo=' + encodeURIComponent('/chat'));
  }, [navigate]);

  const handleConsentComplete = useCallback(() => {
    setShowConsentModal(false);
  }, []);

  const handleConsentSkip = useCallback(() => {
    setShowConsentModal(false);
  }, []);

  return (
    <>
      <ConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsentComplete}
        onSkip={handleConsentSkip}
      />
      {/* 인앱 리마인드 배지 (FEAT-010) - Day Mode에서만 표시 */}
      {mode === 'day' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <ReminderBadge
            lastCheckinTime={lastCheckinTime}
          />
        </div>
      )}
      {mode === 'day'
        ? <DayMode 
            key="day-mode-singleton"
            persona={persona} 
            onSave={handleSaveEntry} 
            setImmersive={setIsImmersive}
            onNavigateToReports={handleNavigateToReports}
            onOpenSafety={handleOpenSafety}
            onCrisisDetected={handleCrisisDetected}
          /> 
        : <NightMode 
            key="night-mode-singleton"
            persona={persona} 
            onSave={handleSaveEntry}
            onCrisisDetected={handleCrisisDetected}
          />}
    </>
  );
};
