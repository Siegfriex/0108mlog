/**
 * QuickChip 컴포넌트
 * 
 * FEAT-001 일부: 퀵칩 (상단 고정)
 * PRD 명세: "오늘 체크인" / "이번 주 요약" / "오늘 1개" / "안전 도움"
 * 
 * 주요 기능:
 * - 빠른 진입을 위한 퀵액션 칩
 * - 가로 스크롤 가능한 칩 리스트
 * - 기존 Button/GlassCard 스타일 재사용
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, BarChart2, Sparkles, ShieldAlert } from 'lucide-react';

/**
 * QuickChip Props 인터페이스
 */
export interface QuickChipProps {
  className?: string;
  text?: string; // 텍스트만 전달하는 경우
  onClick?: () => void; // 텍스트 기반 클릭 핸들러
  onCheckIn?: () => void;
  onWeeklySummary?: () => void;
  onTodayAction?: () => void;
  onSafety?: () => void;
}

/**
 * QuickChip 컴포넌트
 * 
 * @component
 * @param {QuickChipProps} props - 컴포넌트 props
 * @returns {JSX.Element} QuickChip 컴포넌트
 */
export const QuickChip: React.FC<QuickChipProps> = ({
  className = '',
  text,
  onClick,
  onCheckIn,
  onWeeklySummary,
  onTodayAction,
  onSafety,
}) => {
  // 텍스트만 전달된 경우 (DayMode에서 사용)
  if (text && onClick) {
    return (
      <motion.button
        data-testid="quick-chip"
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full
          bg-white/80 backdrop-blur-sm border border-slate-200/60
          text-slate-700 hover:text-brand-primary hover:border-brand-primary/50
          font-medium text-xs
          whitespace-nowrap
          shadow-sm hover:shadow-md
          transition-all duration-300
          min-w-fit
          h-10
        `}
      >
        <span>{text}</span>
      </motion.button>
    );
  }

  // 전체 칩 리스트 렌더링 (기존 방식)
  const chips = [
    {
      id: 'checkin',
      label: '오늘 체크인',
      icon: <MessageCircle size={16} strokeWidth={2} />,
      onClick: onCheckIn,
      color: 'bg-brand-primary',
    },
    {
      id: 'summary',
      label: '이번 주 요약',
      icon: <BarChart2 size={16} strokeWidth={2} />,
      onClick: onWeeklySummary,
      color: 'bg-brand-secondary',
    },
    {
      id: 'action',
      label: '오늘 1개',
      icon: <Sparkles size={16} strokeWidth={2} />,
      onClick: onTodayAction,
      color: 'bg-brand-accent',
    },
    {
      id: 'safety',
      label: '안전 도움',
      icon: <ShieldAlert size={16} strokeWidth={2} />,
      onClick: onSafety,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide pb-2 ${className}`}>
      {chips.map((chip) => (
        <motion.button
          key={chip.id}
          onClick={chip.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full
            ${chip.color} text-white
            font-bold text-xs
            whitespace-nowrap
            shadow-sm hover:shadow-md
            transition-all duration-300
            min-w-24
            h-12
          `}
        >
          {chip.icon}
          <span>{chip.label}</span>
        </motion.button>
      ))}
    </div>
  );
};
