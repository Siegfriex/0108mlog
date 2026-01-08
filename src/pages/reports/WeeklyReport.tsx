/**
 * 주간 리포트 페이지
 * 
 * PRD 경로: /reports/weekly
 * 주간 리포트 화면
 * 기존 ReportView 컴포넌트 활용
 */

import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { ReportView } from '../../../components/ReportView';
import { TimelineEntry } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  timelineData: TimelineEntry[];
}

/**
 * WeeklyReport Props 인터페이스
 */
interface WeeklyReportProps {}

/**
 * WeeklyReport 컴포넌트
 * 
 * @component
 * @param {WeeklyReportProps} props - 컴포넌트 props
 * @returns {JSX.Element} WeeklyReport 컴포넌트
 */
export const WeeklyReport: React.FC<WeeklyReportProps> = () => {
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { timelineData } = context;

  return <ReportView timelineData={timelineData} />;
};
