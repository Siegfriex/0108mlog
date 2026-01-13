/**
 * 메인 레이아웃 컴포넌트
 * 
 * GNB, TabBar, 메인 콘텐츠 영역 포함
 * 기존 App.tsx의 레이아웃 구조 보존
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Moon, Sun, Bot } from 'lucide-react';
import { TabBar, NoiseOverlay } from '../ui';
import { AIChatbot } from '../../../components/AIChatbot';
import { CoachPersona } from '../../../types';
import { DEFAULT_PERSONA, TIME_CONSTANTS } from '../../../constants';
import { INITIAL_TIMELINE } from '../../mock/data';
import { resolveMode, setModeOverride, getModeOverride, Mode } from '../../services/modeResolver';

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
  
  const [mode, setMode] = useState<Mode>('day');
  const [persona, setPersona] = useState<CoachPersona>(DEFAULT_PERSONA);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [timelineData] = useState(INITIAL_TIMELINE);
  
  // 모드 초기화 및 주기적 업데이트
  useEffect(() => {
    const initializeMode = async () => {
      const resolvedMode = await resolveMode();
      setMode(resolvedMode);
    };

    initializeMode();

    // 수동 override가 없으면 주기적으로 모드 확인 (1분마다)
    const interval = setInterval(async () => {
      const override = getModeOverride();
      if (!override) {
        const resolvedMode = await resolveMode();
        setMode(resolvedMode);
      }
    }, TIME_CONSTANTS.MODE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);
  
  // URL 기반 탭 활성화
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/chat')) return 'chat';
    if (path.startsWith('/journal')) return 'journal';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/content')) return 'content';
    if (path.startsWith('/profile')) return 'profile';
    return 'chat';
  };
  
  const activeTab = getActiveTab();
  
  // 탭 변경 핸들러
  const handleTabChange = (tab: string) => {
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
  };
  
  // 모드 토글 핸들러 (수동 override 설정)
  const toggleMode = () => {
    const newMode: Mode = mode === 'day' ? 'night' : 'day';
    setModeOverride(newMode);
    setMode(newMode);
  };

  return (
    <div className={`
      relative w-full h-screen-dynamic overflow-hidden font-sans transition-colors duration-700 flex flex-col items-center
      ${mode === 'day' ? 'text-slate-900 bg-brand-light' : 'text-white bg-slate-950'}
    `}>
      <NoiseOverlay />

      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-base overflow-hidden">
        <div 
          className={`
            absolute left-1/2 -translate-x-1/2 w-bg-overflow h-bg-overflow rounded-full blur-bg-lg opacity-40 transition-colors duration-1000 
            ${mode === 'day' ? 'bg-gradient-to-b from-brand-secondary to-transparent' : 'bg-gradient-to-b from-brand-dark to-transparent'}
          `}
          style={{ top: 'var(--offset-negative-sm)' }}
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
        fixed top-0 z-nav w-full flex justify-center pt-6 px-4 transition-all duration-500
        ${isImmersive ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}
      `}>
        <header className="w-full max-w-2xl flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 group cursor-pointer select-none">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm border transition-all duration-300
              ${mode === 'day' ? 'bg-white/90 border-white/60 text-brand-primary' : 'bg-white/10 border-white/10 text-white'}
              group-hover:scale-105
            `}>
              <span className="font-extrabold text-lg tracking-tighter">M.</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-sm tracking-tight leading-none mb-0.5 ${mode === 'day' ? 'text-slate-900' : 'text-slate-100'}`}>MaumLog</span>
              <span className={`text-xs font-bold tracking-widest uppercase opacity-50 ${mode === 'day' ? 'text-brand-dark' : 'text-slate-400'}`}>V5.0</span>
            </div>
          </div>

          {/* Tools */}
          <div className={`
            flex items-center gap-1 p-1 rounded-full backdrop-blur-xl border shadow-sm transition-colors duration-500
            ${mode === 'day' ? 'bg-white/60 border-white/50' : 'bg-white/5 border-white/10'}
          `}>
            <IconButton onClick={() => setShowChatbot(true)} icon={<Bot size={18} strokeWidth={2.5} />} label="AI Helper" mode={mode} />
            <div className={`w-px h-3 mx-0.5 opacity-20 ${mode === 'day' ? 'bg-brand-dark' : 'bg-white'}`} />
            <IconButton onClick={toggleMode} icon={mode === 'day' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />} label="Theme" mode={mode} />
          </div>
        </header>
      </div>

      {/* Main Stage */}
      <main className={`
        relative z-content-base w-full h-full flex flex-col items-center
        transition-all duration-700 ease-[0.22, 1, 0.36, 1]
        ${isImmersive ? 'px-0 py-0' : 'px-4 pt-24 pb-28'}
      `}>
        <motion.div
          layout
          className={`
            w-full h-full max-w-2xl flex flex-col overflow-hidden transition-all duration-700 relative
            ${isImmersive 
              ? 'rounded-none shadow-none bg-transparent' 
              : `rounded-xl shadow-2xl border backdrop-blur-lg
                 ${mode === 'day' ? 'bg-white/40 border-white/60 shadow-brand-primary/10' : 'bg-white/5 border-white/10 shadow-black/50'}`
            }
          `}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full h-full overflow-hidden"
            >
              <Outlet context={{ mode, persona, setIsImmersive, timelineData, setPersona }} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Dock */}
      <div className={`
        fixed bottom-6 z-dock w-full flex justify-center px-4 transition-all duration-500
        ${isImmersive ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}>
        <div className="w-full max-w-2xl flex justify-center">
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} mode={mode} />
        </div>
      </div>

      {/* Safety 플로팅 버튼 */}
      {location.pathname !== '/safety' && !location.pathname.startsWith('/safety/') && (
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
      )}

      {/* Overlays */}
      <AnimatePresence>
        {showChatbot && <AIChatbot persona={persona} onClose={() => setShowChatbot(false)} />}
      </AnimatePresence>
    </div>
  );
};

// Icon Button 컴포넌트
const IconButton = ({ onClick, icon, label, mode }: { onClick: () => void; icon: React.ReactNode; label: string; mode: 'day' | 'night' }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`
      w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200
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
