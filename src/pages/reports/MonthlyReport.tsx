/**
 * 월간 리포트 페이지
 * 
 * PRD 경로: /reports/monthly
 * 월간 리포트 화면
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
 * MonthlyReport 컴포넌트
 */
export const MonthlyReport: React.FC = () => {
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { timelineData } = context;

  return <ReportView timelineData={timelineData} />;
};
