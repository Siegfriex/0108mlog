import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Book, BarChart2, Layers, User } from 'lucide-react';

/**
 * TabBar 컴포넌트
 * 
 * 하단 네비게이션 탭 바
 * PRD의 5개 주요 탭 (채팅, 기록, 리포트, 콘텐츠, 프로필) 지원
 */
export interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode?: 'day' | 'night';
}

export const TabBar: React.FC<TabBarProps> = ({ 
  activeTab, 
  onTabChange, 
  mode = 'day' 
}) => {
  const allTabs = [
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={22} strokeWidth={2.5} /> },
    { id: 'journal', label: 'Log', icon: <Book size={22} strokeWidth={2.5} /> },
    { id: 'reports', label: 'Stats', icon: <BarChart2 size={22} strokeWidth={2.5} /> },
    { id: 'content', label: 'Feed', icon: <Layers size={22} strokeWidth={2.5} /> },
    { id: 'profile', label: 'Me', icon: <User size={22} strokeWidth={2.5} /> },
  ];

  return (
    <nav 
      className={`
        flex items-center justify-between px-6 py-3 gap-2
        backdrop-blur-2xl border
        rounded-xl shadow-2xl
        w-auto min-w-[320px] max-w-full transition-colors duration-500
        ${mode === 'day' 
          ? 'bg-white/80 border-white/60 shadow-brand-primary/10 ring-1 ring-white/50' 
          : 'bg-slate-900/80 border-white/10 shadow-black/50 ring-1 ring-white/10'
        }
      `}
      role="navigation"
      aria-label="메인 네비게이션"
    >
      {allTabs.map(tab => {
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileTap={{ scale: 0.9 }}
            className={`
              relative group flex flex-col items-center justify-center
              w-10 h-10 rounded-xl
              transition-all duration-300
              ${isActive 
                ? mode === 'day' 
                  ? 'text-brand-primary bg-brand-light shadow-sm' 
                  : 'text-brand-secondary bg-white/20'
                : mode === 'day' 
                  ? 'text-slate-400 hover:text-brand-dark' 
                  : 'text-slate-500 hover:text-slate-300'
              }
            `}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.icon}
            
            {/* Active Indicator Dot */}
            {isActive && (
              <motion.div 
                layoutId="activeTabDot"
                className={`absolute -bottom-2 w-1 h-1 rounded-full ${mode === 'day' ? 'bg-brand-primary' : 'bg-brand-secondary'}`}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};
