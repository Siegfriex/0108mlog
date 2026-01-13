/**
 * JourneyView 컴포넌트
 * 
 * FEAT-015: 감정 여정 시각화
 * PRD 명세: Sankey Flow, Year in Pixels, Timeline View
 * 
 * 주요 기능:
 * - Sankey Flow: 감정 전환 플로우 시각화
 * - Year in Pixels: 일별 감정 색상 매핑
 * - Timeline View: 시간순 감정 변화
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Grid3x3, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard, Button } from '../ui';
import { TimelineEntry, EmotionType } from '../../../types';
import { getEmotionColorMap } from '../../utils/style';

/**
 * JourneyView Props 인터페이스
 */
export interface JourneyViewProps {
  timelineData: TimelineEntry[];
}

/**
 * 시각화 타입 정의
 */
type VisualizationType = 'sankey' | 'pixels' | 'timeline';

/**
 * 감정 색상 매핑 (CSS 변수 기반)
 * 초기값: 하드코딩 → 런타임에 CSS 변수로 업데이트
 */
const getEmotionColors = (): Record<EmotionType, string> => {
  const colorMap = getEmotionColorMap();
  return {
    [EmotionType.JOY]: colorMap.JOY || '#FFD700',
    [EmotionType.PEACE]: colorMap.PEACE || '#87CEEB',
    [EmotionType.ANXIETY]: colorMap.ANXIETY || '#FF6B6B',
    [EmotionType.SADNESS]: colorMap.SADNESS || '#4A90E2',
    [EmotionType.ANGER]: colorMap.ANGER || '#FF8C42',
  };
};

/**
 * 감정 전환 데이터 생성 (Sankey Flow용)
 * 
 * @param data 타임라인 데이터
 * @returns Sankey Flow 데이터
 */
const generateSankeyData = (data: TimelineEntry[], emotionColors: Record<EmotionType, string>) => {
  if (data.length < 2) return { nodes: [], links: [] };

  const nodes = Object.values(EmotionType).map(emotion => ({
    id: emotion,
    name: emotion,
    color: emotionColors[emotion],
  }));

  const transitions: Record<string, Record<string, number>> = {};
  
  // 감정 전환 추적
  for (let i = 0; i < data.length - 1; i++) {
    const from = data[i].emotion;
    const to = data[i + 1].emotion;
    const key = `${from}-${to}`;
    
    if (!transitions[from]) {
      transitions[from] = {};
    }
    transitions[from][to] = (transitions[from][to] || 0) + 1;
  }

  const links: Array<{ source: string; target: string; value: number }> = [];
  
  Object.entries(transitions).forEach(([source, targets]) => {
    Object.entries(targets).forEach(([target, value]) => {
      if (value > 0) {
        links.push({ source, target, value });
      }
    });
  });

  return { nodes, links };
};

/**
 * Year in Pixels 데이터 생성
 * 
 * @param data 타임라인 데이터
 * @returns Year in Pixels 데이터
 */
const generatePixelsData = (data: TimelineEntry[]) => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);
  const days: Array<{ date: Date; emotion: EmotionType | null; intensity: number }> = [];

  // 1년치 날짜 생성
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const entry = data.find(e => {
      const entryDate = new Date(e.date).toISOString().split('T')[0];
      return entryDate === dateStr;
    });

    days.push({
      date: new Date(d),
      emotion: entry?.emotion || null,
      intensity: entry?.intensity || 0,
    });
  }

  return days;
};

/**
 * JourneyView 컴포넌트
 * 
 * @component
 * @param {JourneyViewProps} props - 컴포넌트 props
 * @returns {JSX.Element} JourneyView 컴포넌트
 */
export const JourneyView: React.FC<JourneyViewProps> = ({ timelineData }) => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('timeline');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // CSS 변수 기반 감정 색상
  const emotionColors = useMemo(() => getEmotionColors(), []);

  // Sankey Flow 데이터
  const sankeyData = useMemo(() => generateSankeyData(timelineData, emotionColors), [timelineData, emotionColors]);

  // Year in Pixels 데이터
  const pixelsData = useMemo(() => generatePixelsData(timelineData), [timelineData]);

  return (
    <div className="w-full h-full flex flex-col p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          감정 여정 시각화
        </h2>
        <p className="text-sm text-slate-500">
          나의 감정 변화를 다양한 방식으로 확인해보세요
        </p>
      </div>

      {/* 시각화 타입 선택 */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setVisualizationType('timeline')}
          variant={visualizationType === 'timeline' ? 'primary' : 'ghost'}
          className="flex-1"
        >
          <Clock size={18} className="mr-2" />
          타임라인
        </Button>
        <Button
          onClick={() => setVisualizationType('pixels')}
          variant={visualizationType === 'pixels' ? 'primary' : 'ghost'}
          className="flex-1"
        >
          <Grid3x3 size={18} className="mr-2" />
          Year in Pixels
        </Button>
        <Button
          onClick={() => setVisualizationType('sankey')}
          variant={visualizationType === 'sankey' ? 'primary' : 'ghost'}
          className="flex-1"
        >
          <BarChart2 size={18} className="mr-2" />
          Sankey Flow
        </Button>
      </div>

      {/* 시각화 콘텐츠 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {visualizationType === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TimelineVisualization data={timelineData} emotionColors={emotionColors} />
            </motion.div>
          )}

          {visualizationType === 'pixels' && (
            <motion.div
              key="pixels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <YearInPixelsVisualization data={pixelsData} emotionColors={emotionColors} />
            </motion.div>
          )}

          {visualizationType === 'sankey' && (
            <motion.div
              key="sankey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SankeyFlowVisualization data={sankeyData} emotionColors={emotionColors} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Timeline Visualization 컴포넌트
 */
const TimelineVisualization: React.FC<{ 
  data: TimelineEntry[];
  emotionColors: Record<EmotionType, string>;
}> = ({ data, emotionColors }) => {
  return (
    <GlassCard>
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>아직 기록된 감정이 없어요</p>
          </div>
        ) : (
          data.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: emotionColors[entry.emotion] }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    {new Date(entry.date).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-xs text-slate-500">
                    강도: {entry.intensity || 0}/10
                  </span>
                </div>
                <p className="text-sm text-slate-600">{entry.summary}</p>
                {entry.nuanceTags && entry.nuanceTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.nuanceTags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-brand-light text-brand-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

/**
 * Year in Pixels Visualization 컴포넌트
 */
const YearInPixelsVisualization: React.FC<{ 
  data: Array<{ date: Date; emotion: EmotionType | null; intensity: number }>;
  emotionColors: Record<EmotionType, string>;
}> = ({ data, emotionColors }) => {
  // 월별로 그룹화
  const months = useMemo(() => {
    const grouped: Record<number, typeof data> = {};
    data.forEach(day => {
      const month = day.date.getMonth();
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(day);
    });
    return grouped;
  }, [data]);

  return (
    <GlassCard>
      <div className="space-y-6">
        {Object.entries(months).map(([month, days]) => (
          <div key={month}>
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              {parseInt(month) + 1}월
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-sm
                    ${day.emotion
                      ? 'opacity-80 hover:opacity-100 cursor-pointer transition-opacity'
                      : 'bg-slate-100 opacity-30'
                    }
                  `}
                  style={{
                    backgroundColor: day.emotion ? emotionColors[day.emotion] : undefined,
                  }}
                  title={day.emotion ? `${day.date.toLocaleDateString('ko-KR')}: ${day.emotion}` : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

/**
 * Sankey Flow Visualization 컴포넌트
 * 
 * 참고: Recharts에는 Sankey 차트가 없으므로 간단한 플로우 다이어그램으로 구현
 */
const SankeyFlowVisualization: React.FC<{ 
  data: { 
    nodes: Array<{ id: string; name: string; color: string }>; 
    links: Array<{ source: string; target: string; value: number }>; 
  };
  emotionColors: Record<EmotionType, string>;
}> = ({ data, emotionColors }) => {
  if (data.links.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-12 text-slate-400">
          <BarChart2 size={48} className="mx-auto mb-4 opacity-50" />
          <p>감정 전환 데이터가 부족해요</p>
          <p className="text-xs mt-2">더 많은 기록을 남기면 패턴을 확인할 수 있어요</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="space-y-6">
        {/* 노드 표시 */}
        <div className="flex flex-wrap gap-3 justify-center">
          {data.nodes.map(node => (
            <div
              key={node.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: node.color + '20', border: `2px solid ${node.color}` }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: node.color }}
              />
              <span className="text-sm font-medium text-slate-900">{node.name}</span>
            </div>
          ))}
        </div>

        {/* 링크 표시 */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-700">감정 전환 패턴</h4>
          {data.links
            .sort((a, b) => b.value - a.value)
            .map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/50"
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: emotionColors[link.source as EmotionType] }}
                />
                <span className="text-sm text-slate-600">{link.source}</span>
                <div className="flex-1 h-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full relative">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(link.value / Math.max(...data.links.map(l => l.value))) * 100}%`,
                      backgroundColor: emotionColors[link.source as EmotionType],
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">{link.value}회</span>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: emotionColors[link.target as EmotionType] }}
                />
                <span className="text-sm text-slate-600">{link.target}</span>
              </div>
            ))}
        </div>
      </div>
    </GlassCard>
  );
};
