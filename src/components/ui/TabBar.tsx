import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Book, BarChart2, Layers, User } from 'lucide-react';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useHaptics } from '../../hooks/useHaptics';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

/**
 * TabBar 컴포넌트
 * 
 * 하단 네비게이션 탭 바
 * PRD의 5개 주요 탭 (채팅, 기록, 리포트, 콘텐츠, 프로필) 지원
 * 키보드 네비게이션 지원: 화살표 키, Home/End, Enter/Space
 */
export interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode?: 'day' | 'night';
  isMobile?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  mode = 'day',
  isMobile: isMobileProp,
}) => {
  const { shouldReduceAnimations, isMobile: isMobileDetected } = useMobileOptimization();
  const isMobile = isMobileProp ?? isMobileDetected;
  const disableAnimations = isMobile || shouldReduceAnimations;
  const allTabs = [
    { id: 'chat', label: '채팅', icon: <MessageCircle size={22} strokeWidth={2.5} /> },
    { id: 'journal', label: '기록', icon: <Book size={22} strokeWidth={2.5} /> },
    { id: 'reports', label: '통계', icon: <BarChart2 size={22} strokeWidth={2.5} /> },
    { id: 'content', label: '콘텐츠', icon: <Layers size={22} strokeWidth={2.5} /> },
    { id: 'profile', label: '나', icon: <User size={22} strokeWidth={2.5} /> },
  ];

  const activeIndex = allTabs.findIndex(tab => tab.id === activeTab);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { triggerHaptic } = useHaptics();

  // 터치 제스처 핸들러
  const handleSwipeLeft = () => {
    const nextIndex = activeIndex < allTabs.length - 1 ? activeIndex + 1 : 0;
    onTabChange(allTabs[nextIndex].id);
    triggerHaptic('light');
  };

  const handleSwipeRight = () => {
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : allTabs.length - 1;
    onTabChange(allTabs[prevIndex].id);
    triggerHaptic('light');
  };

  // 터치 제스처 통합
  const touchGestures = useTouchGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  // 키보드 네비게이션 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = index > 0 ? index - 1 : allTabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = index < allTabs.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = allTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onTabChange(allTabs[index].id);
        return;
      default:
        return;
    }

    // 포커스 이동
    buttonRefs.current[newIndex]?.focus();
    onTabChange(allTabs[newIndex].id);
  };

  return (
    <nav
      {...touchGestures}
      className={`
        relative flex items-center justify-between gap-2 pb-safe-bottom
        backdrop-blur-2xl border rounded-xl shadow-2xl
        ${isMobile
          ? 'px-3 py-2.5 w-full min-w-0'
          : 'px-6 py-3 w-auto min-w-80 max-w-full'
        }
        ${disableAnimations ? '' : 'transition-colors duration-500'}
        ${mode === 'day'
          ? 'bg-white/80 border-white/60 shadow-brand-primary/10 ring-1 ring-white/50'
          : 'bg-slate-900/80 border-white/10 shadow-black/50 ring-1 ring-white/10'
        }
      `}
      role="navigation"
      aria-label="메인 네비게이션"
    >
      {/* 유동적 배경 (젤리처럼 이동) - 모바일에서 비활성화 */}
      {!disableAnimations && allTabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        if (!isActive) return null;

        return (
          <motion.div
            key={`background-${tab.id}`}
            layoutId="activeTabBackground"
            className={`
              absolute inset-0 rounded-xl
              ${mode === 'day'
                ? 'bg-brand-light/50'
                : 'bg-white/10'
              }
            `}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              left: `${index * (100 / allTabs.length)}%`,
              width: `${100 / allTabs.length}%`,
            }}
          />
        );
      })}
      
      {allTabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        // 모바일: 일반 버튼 사용
        if (disableAnimations) {
          return (
            <button
              key={tab.id}
              ref={(el) => { buttonRefs.current[index] = el; }}
              onClick={() => {
                onTabChange(tab.id);
                triggerHaptic('light');
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={isActive ? 0 : -1}
              className={`
                relative z-content-base group flex flex-col items-center justify-center
                ${isMobile ? 'w-10 h-10' : 'w-11 h-11'} rounded-xl
                focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
                active:scale-95
                ${isActive
                  ? mode === 'day'
                    ? 'text-brand-primary bg-brand-light/50'
                    : 'text-brand-secondary bg-white/10'
                  : mode === 'day'
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }
              `}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon}
              {/* 활성 탭 표시 점 */}
              {isActive && (
                <div className={`absolute -bottom-1.5 w-1 h-1 rounded-full ${mode === 'day' ? 'bg-brand-primary' : 'bg-brand-secondary'}`} />
              )}
            </button>
          );
        }

        // 데스크탑: motion 버튼 사용
        return (
          <motion.button
            key={tab.id}
            ref={(el) => { buttonRefs.current[index] = el; }}
            onClick={() => {
              onTabChange(tab.id);
              triggerHaptic('light');
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            whileTap={{ scale: 0.9 }}
            tabIndex={isActive ? 0 : -1}
            className={`
              relative z-content-base group flex flex-col items-center justify-center
              w-11 h-11 rounded-xl
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
              ${isActive
                ? mode === 'day'
                  ? 'text-brand-primary shadow-sm'
                  : 'text-brand-secondary'
                : mode === 'day'
                  ? 'text-slate-400 hover:text-brand-dark'
                  : 'text-slate-500 hover:text-slate-300'
              }
            `}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {tab.icon}

            {/* 활성 탭 표시 점 */}
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
