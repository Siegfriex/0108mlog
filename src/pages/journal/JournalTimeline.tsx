/**
 * 기록 타임라인 페이지
 * 
 * PRD 경로: /journal
 * 대화 타임라인 조회 화면
 * 기존 JournalView 컴포넌트 활용
 */

import React from 'react';
import { useOutletContext, useNavigate, Navigate } from 'react-router-dom';
import { JournalView } from '../../../components/JournalView';
import { TimelineEntry } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  timelineData: TimelineEntry[];
}

/**
 * JournalTimeline Props 인터페이스
 */
interface JournalTimelineProps {}

/**
 * JournalTimeline 컴포넌트
 * 
 * @component
 * @param {JournalTimelineProps} props - 컴포넌트 props
 * @returns {JSX.Element} JournalTimeline 컴포넌트
 */
export const JournalTimeline: React.FC<JournalTimelineProps> = () => {
  const context = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { timelineData } = context;

  // JournalView에 네비게이션 핸들러 전달
  const handleNavigateToJourney = () => {
    navigate('/journal/journey');
  };

  const handleNavigateToSearch = () => {
    navigate('/journal/search');
  };

  // JournalView는 내부적으로 상태를 관리하므로, 
  // 네비게이션은 컴포넌트 내부에서 직접 처리하도록 함
  // (기존 컴포넌트 구조 보존)
  return <JournalView timelineData={timelineData} />;
};
