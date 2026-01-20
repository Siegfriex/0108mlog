import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

/**
 * NeonAreaChart Props 인터페이스
 */
interface NeonAreaChartProps {
  data: any[];
  dataKey: string;
  xKey: string;
  color?: string;
  height?: number;
}

/**
 * NeonAreaChart 컴포넌트
 * 
 * Neon Glow 효과가 적용된 Area Chart 컴포넌트
 * Reports 페이지에서 재사용 가능
 */
export const NeonAreaChart: React.FC<NeonAreaChartProps> = ({
  data,
  dataKey,
  xKey,
  color = 'rgb(255, 107, 157)',
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          {/* Glow 필터 */}
          <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 그라데이션 채우기 */}
          <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey={xKey} 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
        />
        <Tooltip 
          contentStyle={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '12px',
          }}
        />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={3}
          fill="url(#fillGradient)"
          filter="url(#glow)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
