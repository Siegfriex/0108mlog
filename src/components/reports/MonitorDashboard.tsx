/**
 * MonitorDashboard 컴포넌트
 * 
 * FEAT-016: 실시간 모니터
 * PRD 명세: Youper 스타일의 실시간 감정 모니터링 및 인사이트 제공
 * 
 * 주요 기능:
 * - 실시간 감정 추이 차트
 * - 패턴 알림 (이상 패턴 감지)
 * - 인사이트 카드
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle, Lightbulb, Zap } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GlassCard, LoadingSpinner } from '../ui';
import { TimelineEntry, EmotionType } from '../../../types';

/**
 * MonitorDashboard Props 인터페이스
 */
export interface MonitorDashboardProps {
  timelineData: TimelineEntry[];
}

/**
 * 실시간 모니터 데이터 인터페이스
 */
interface MonitorData {
  timestamp: Date;
  emotion: EmotionType;
  intensity: number;
}

/**
 * MonitorDashboard 컴포넌트
 * 
 * @component
 * @param {MonitorDashboardProps} props - 컴포넌트 props
 * @returns {JSX.Element} MonitorDashboard 컴포넌트
 */
export const MonitorDashboard: React.FC<MonitorDashboardProps> = ({ timelineData }) => {
  const [isLoading, setIsLoading] = useState(true);

  // 실시간 차트 데이터 생성 (최근 7일)
  const chartData = useMemo(() => {
    const last7Days = timelineData
      .filter(entry => {
        const daysDiff = (new Date().getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return last7Days.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      intensity: entry.intensity || 0,
      emotion: entry.emotion,
    }));
  }, [timelineData]);

  // 패턴 분석
  const patterns = useMemo(() => {
    if (timelineData.length < 3) return [];

    const anxietyCount = timelineData.filter(e => e.emotion === EmotionType.ANXIETY).length;
    const highIntensityCount = timelineData.filter(e => (e.intensity || 0) >= 8).length;

    const alerts: Array<{ type: 'warning' | 'info'; message: string; icon: React.ReactNode }> = [];

    if (anxietyCount > timelineData.length * 0.4) {
      alerts.push({
        type: 'warning',
        message: '최근 불안한 감정이 자주 기록되고 있어요',
        icon: <AlertCircle size={20} />,
      });
    }

    if (highIntensityCount > timelineData.length * 0.3) {
      alerts.push({
        type: 'info',
        message: '강도가 높은 감정이 자주 나타나고 있어요',
        icon: <TrendingUp size={20} />,
      });
    }

    return alerts;
  }, [timelineData]);

  useEffect(() => {
    // 시뮬레이션: 데이터 로딩
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Activity size={28} className="text-brand-primary" />
          실시간 모니터
        </h2>
        <p className="text-sm text-slate-500">
          당신의 감정 패턴을 실시간으로 추적하고 있어요
        </p>
      </div>

      {/* 실시간 차트 */}
      <GlassCard>
        <h3 className="text-lg font-bold text-slate-900 mb-4">감정 추이 (최근 7일)</h3>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p>아직 충분한 데이터가 없어요</p>
          </div>
        ) : (
          <div className="min-h-48">
            <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="#2A8E9E"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2A8E9E' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      {/* 패턴 알림 */}
      {patterns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">패턴 알림</h3>
          {patterns.map((pattern, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className={`
                  ${pattern.type === 'warning' 
                    ? 'border-orange-200 bg-orange-50/50' 
                    : 'border-blue-200 bg-blue-50/50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${pattern.type === 'warning' ? 'text-orange-600 bg-orange-100' : 'text-blue-600 bg-blue-100'}
                  `}>
                    {pattern.icon}
                  </div>
                  <p className="text-sm text-slate-700 flex-1">{pattern.message}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* 인사이트 카드 */}
      <GlassCard>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Lightbulb size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-2">오늘의 인사이트</h3>
            <p className="text-sm text-slate-600">
              {timelineData.length > 0
                ? `지금까지 ${timelineData.length}개의 감정 기록을 남기셨네요. 계속 기록하면 더 정확한 패턴을 발견할 수 있어요.`
                : '감정을 기록하기 시작하면 인사이트를 제공해드릴게요.'}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
