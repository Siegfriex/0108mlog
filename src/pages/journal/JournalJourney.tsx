/**
 * 감정 여정 시각화 페이지
 * 
 * PRD 경로: /journal/journey
 * Sankey Flow, Year in Pixels 시각화
 * 기존 JourneyView 컴포넌트 활용
 */

import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { JourneyView } from '../../components/journal/JourneyView';
import { TimelineEntry } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  timelineData: TimelineEntry[];
}

/**
 * JournalJourney Props 인터페이스
 */
interface JournalJourneyProps {}

/**
 * JournalJourney 컴포넌트
 * 
 * @component
 * @param {JournalJourneyProps} props - 컴포넌트 props
 * @returns {JSX.Element} JournalJourney 컴포넌트
 */
export const JournalJourney: React.FC<JournalJourneyProps> = () => {
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { timelineData } = context;

  return <JourneyView timelineData={timelineData} />;
};
