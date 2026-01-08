/**
 * 실시간 모니터 대시보드 페이지
 * 
 * PRD 경로: /reports/monitor
 * 실시간 감정 모니터링 대시보드
 * 기존 MonitorDashboard 컴포넌트 활용
 */

import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { MonitorDashboard } from '../../components/reports/MonitorDashboard';
import { TimelineEntry } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  timelineData: TimelineEntry[];
}

/**
 * MonitorDashboardPage Props 인터페이스
 */
interface MonitorDashboardPageProps {}

/**
 * MonitorDashboardPage 컴포넌트
 * 
 * @component
 * @param {MonitorDashboardPageProps} props - 컴포넌트 props
 * @returns {JSX.Element} MonitorDashboardPage 컴포넌트
 */
export const MonitorDashboardPage: React.FC<MonitorDashboardPageProps> = () => {
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { timelineData } = context;

  return <MonitorDashboard timelineData={timelineData} />;
};
