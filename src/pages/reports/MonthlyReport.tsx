/**
 * 월간 리포트 페이지
 * 
 * PRD 경로: /reports/monthly
 * 월간 리포트 화면
 */

import React from 'react';
import { ReportView } from '../../../components/ReportView';
import { useAppContext } from '../../contexts';

/**
 * MonthlyReport 컴포넌트
 */
export const MonthlyReport: React.FC = () => {
  const { timelineData } = useAppContext();

  return <ReportView timelineData={timelineData} />;
};
