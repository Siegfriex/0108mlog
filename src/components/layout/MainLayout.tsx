/**
 * 메인 레이아웃 컴포넌트
 * 
 * GNB, TabBar, 메인 콘텐츠 영역 포함
 * 기존 App.tsx의 레이아웃 구조 보존
 */

import React, { useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Moon, Sun, Bot } from 'lucide-react';
import { TabBar, NoiseOverlay, SkipLink } from '../ui';
import { AIChatbot } from '../../../components/AIChatbot';
import { useAppContext } from '../../contexts';
import { useUIContext } from '../../contexts';
import { Mode } from '../../services/modeResolver';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

/**
 * MainLayout Props 인터페이스
 */
interface MainLayoutProps {}

/**
 * MainLayout 컴포넌트
 * 
 * @component
 * @param {MainLayoutProps} props - 컴포넌트 props
 * @returns {JSX.Element} MainLayout 컴포넌트
 */
export const MainLayout: React.FC<MainLayoutProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 모바일 최적화 훅
  const { isMobile, shouldDisableLayoutAnimations } = useMobileOptimization();

  // Context에서 상태 가져오기
  const { mode, persona, setMode: setModeContext } = useAppContext();
  const { showChatbot, isImmersive, isOnline, setShowChatbot, setIsImmersive } = useUIContext();
  
  // P2 최적화: useMemo로 URL 기반 탭 활성화 메모이제이션
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/chat')) return 'chat';
    if (path.startsWith('/journal')) return 'journal';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/content')) return 'content';
    if (path.startsWith('/profile')) return 'profile';
    return 'chat';
  }, [location.pathname]);

  // P2 최적화: useCallback으로 탭 변경 핸들러 메모이제이션
  const handleTabChange = useCallback((tab: string) => {
    switch (tab) {
      case 'chat':
        navigate('/chat');
        break;
      case 'journal':
        navigate('/journal');
        break;
      case 'reports':
        navigate('/reports/weekly');
        break;
      case 'content':
        navigate('/content');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  }, [navigate]);

  // P2 최적화: useCallback으로 모드 토글 핸들러 메모이제이션
  const toggleMode = useCallback(() => {
    const newMode: Mode = mode === 'day' ? 'night' : 'day';
    setModeContext(newMode);
  }, [mode, setModeContext]);

  return (
    <div className={`
      relative w-full h-screen-dynamic overflow-hidden font-sans transition-colors duration-700 flex flex-col items-center
      ${mode === 'day' ? 'text-slate-900 bg-brand-light' : 'text-white bg-slate-950'}
    `}>
      <SkipLink />
      
      {/* 오프라인 배너 (FE-C2 해결) */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-white text-center py-2 px-4 text-sm font-medium shadow-lg">
          ⚠️ 오프라인 모드 - 일부 기능이 제한됩니다. 네트워크 연결을 확인해주세요.
        </div>
      )}
      
      <NoiseOverlay />

      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-base overflow-hidden">
        <div 
          className={`
            absolute left-1/2 -translate-x-1/2 w-bg-overflow h-bg-overflow rounded-full blur-bg-lg opacity-40 transition-colors duration-1000 
            ${mode === 'day' ? 'bg-gradient-to-b from-brand-secondary to-transparent' : 'bg-gradient-to-b from-brand-dark to-transparent'}
          `}
          style={{ top: isMobile ? 'var(--offset-negative-sm)' : '0' }}
        />
        <div 
          className={`
            absolute w-bg-blob h-bg-blob rounded-full filter blur-bg-xl mix-blend-multiply opacity-30 animate-float 
            ${mode === 'day' ? 'bg-brand-accent' : 'bg-brand-primary/20'}
          `}
          style={{ 
            bottom: 'var(--offset-negative-md)',
            left: 'var(--offset-negative-sm)'
          }}
        />
      </div>

      {/* Global Navigation Bar (GNB) */}
      <div className={`
        fixed top-0 z-nav w-full flex justify-center
        ${isMobile ? 'pt-safe-top px-3' : 'pt-6 px-4'}
        ${shouldDisableLayoutAnimations ? '' : 'transition-all duration-500'}
        ${isImmersive ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}
      `}>
        <header className={`
          w-full flex items-center justify-between
          ${isMobile ? 'max-w-full' : 'max-w-2xl'}
        `}>
          {/* Brand - 모바일에서 텍스트 숨김 */}
          <div className="flex items-center gap-2 group cursor-pointer select-none">
            <div className={`
              ${isMobile ? 'w-9 h-9' : 'w-10 h-10'}
              rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm border
              ${shouldDisableLayoutAnimations ? '' : 'transition-all duration-300'}
              ${mode === 'day' ? 'bg-white/90 border-white/60 text-brand-primary' : 'bg-white/10 border-white/10 text-white'}
              group-hover:scale-105
            `}>
              <img
                src="/img/logo.png"
                alt="MaumLog Logo"
                className="w-full h-full object-contain p-1.5"
              />
            </div>
            {!isMobile && (
              <div className="flex flex-col">
                <span className={`font-en font-bold text-sm tracking-tight leading-none mb-0.5 ${mode === 'day' ? 'text-slate-900' : 'text-slate-100'}`}>MaumLog</span>
                <span className={`font-en text-xs font-bold tracking-widest uppercase opacity-50 ${mode === 'day' ? 'text-brand-dark' : 'text-slate-400'}`}>V5.0</span>
              </div>
            )}
          </div>

          {/* Tools */}
          <div className={`
            flex items-center gap-1 ${isMobile ? 'p-0.5' : 'p-1'} rounded-full backdrop-blur-xl border shadow-sm
            ${shouldDisableLayoutAnimations ? '' : 'transition-colors duration-500'}
            ${mode === 'day' ? 'bg-white/60 border-white/50' : 'bg-white/5 border-white/10'}
          `}>
            <IconButton onClick={() => setShowChatbot(true)} icon={<Bot size={isMobile ? 16 : 18} strokeWidth={2.5} />} label="AI Helper" mode={mode} aria-label="AI Helper" isMobile={isMobile} />
            <div className={`w-px ${isMobile ? 'h-2.5' : 'h-3'} mx-0.5 opacity-20 ${mode === 'day' ? 'bg-brand-dark' : 'bg-white'}`} />
            <IconButton onClick={toggleMode} icon={mode === 'day' ? <Moon size={isMobile ? 16 : 18} strokeWidth={2.5} /> : <Sun size={isMobile ? 16 : 18} strokeWidth={2.5} />} label="Theme" mode={mode} aria-label="테마 전환" isMobile={isMobile} />
          </div>
        </header>
      </div>

      {/* Main Stage - isImmersive 모드는 완전히 별도 렌더링 */}
      {isImmersive ? (
        // 풀스크린 모드: 모든 패딩/제약 제거
        <main id="main-content" className="fixed inset-0 z-content-base pt-safe-top pb-safe-bottom">
          <Outlet />
        </main>
      ) : (
        // 일반 모드: 카드형 레이아웃
        <main id="main-content" className={`
          relative z-content-base w-full flex-1 flex flex-col items-center
          ${shouldDisableLayoutAnimations ? '' : 'transition-all duration-700 ease-[0.22,1,0.36,1]'}
          ${isMobile
            ? 'px-3 pt-[calc(var(--header-height)+var(--safe-top))] pb-[calc(var(--dock-height)+var(--safe-bottom))]'
            : 'px-6 pt-28 pb-32'
          }
        `}>
          <div
            className={`
              w-full flex-1 flex flex-col overflow-hidden relative
              ${isMobile ? 'max-w-full' : 'max-w-2xl'}
              ${shouldDisableLayoutAnimations ? '' : 'transition-all duration-700'}
              rounded-xl shadow-2xl border backdrop-blur-lg
              ${mode === 'day' ? 'bg-white/40 border-white/60 shadow-brand-primary/10' : 'bg-white/5 border-white/10 shadow-black/50'}
            `}
          >
            {shouldDisableLayoutAnimations ? (
              <div className="flex-1 w-full h-full overflow-hidden">
                <Outlet />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 w-full h-full overflow-hidden"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      )}

      {/* Dock */}
      <div className={`
        fixed z-dock w-full flex justify-center
        ${isMobile ? 'bottom-0 pb-safe-bottom px-3' : 'bottom-6 px-4'}
        ${shouldDisableLayoutAnimations ? '' : 'transition-all duration-500'}
        ${isImmersive ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}>
        <div className={`
          w-full flex justify-center
          ${isMobile ? 'max-w-full' : 'max-w-2xl'}
        `}>
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} mode={mode} isMobile={isMobile} />
        </div>
      </div>

      {/* Safety 플로팅 버튼 */}
      {location.pathname !== '/safety' && !location.pathname.startsWith('/safety/') && (
        shouldDisableLayoutAnimations ? (
          <button
            onClick={() => navigate('/safety')}
            className={`
              fixed z-safety rounded-full flex items-center justify-center
              shadow-2xl backdrop-blur-xl border-2
              ${isMobile ? 'bottom-20 right-4 w-12 h-12' : 'bottom-24 right-6 w-14 h-14'}
              ${mode === 'day'
                ? 'bg-red-500/90 border-red-400 text-white active:bg-red-600'
                : 'bg-red-600/90 border-red-500 text-white active:bg-red-700'
              }
            `}
            aria-label="안전망"
          >
            <ShieldAlert size={isMobile ? 20 : 24} strokeWidth={2.5} />
          </button>
        ) : (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/safety')}
            className={`
              fixed bottom-24 right-6 z-safety
              w-14 h-14 rounded-full
              flex items-center justify-center
              shadow-2xl backdrop-blur-xl border-2
              transition-colors duration-300
              ${mode === 'day'
                ? 'bg-red-500/90 border-red-400 text-white hover:bg-red-600'
                : 'bg-red-600/90 border-red-500 text-white hover:bg-red-700'
              }
            `}
            aria-label="안전망"
          >
            <ShieldAlert size={24} strokeWidth={2.5} />
          </motion.button>
        )
      )}

      {/* Overlays */}
      <AnimatePresence>
        {showChatbot && <AIChatbot persona={persona} onClose={() => setShowChatbot(false)} />}
      </AnimatePresence>
    </div>
  );
};

// Icon Button 컴포넌트
interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  mode: 'day' | 'night';
  'aria-label': string;
}

const IconButton: React.FC<IconButtonProps & { isMobile?: boolean }> = ({ onClick, icon, label, mode, 'aria-label': ariaLabel, isMobile }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={ariaLabel}
    className={`
      ${isMobile ? 'w-9 h-9' : 'w-11 h-11'}
      rounded-full flex items-center justify-center transition-all duration-200
      active:scale-95
      ${mode === 'day' 
        ? 'text-slate-500 hover:bg-white hover:text-brand-primary hover:shadow-sm' 
        : 'text-slate-400 hover:bg-white/20 hover:text-white'
      }
    `}
  >
    {icon}
  </button>
);
