
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayMode } from './components/DayMode';
import { NightMode } from './components/NightMode';
import { ReportView } from './components/ReportView';
import { JournalView } from './components/JournalView'; 
import { ProfileView } from './components/ProfileView';
import { ContentGallery } from './components/ContentGallery';
import { AIChatbot } from './components/AIChatbot';
import { SafetyLayer } from './components/SafetyLayer';
// UI 컴포넌트 import 경로: 새로운 구조로 변경
import { TabBar, NoiseOverlay, AmbientBackground, CelestialBackground, ErrorBoundary } from './src/components/ui';
// 온보딩 플로우 import: FEAT-011
import { OnboardingFlow } from './src/components/onboarding';
import type { OnboardingData } from './src/components/onboarding';
import { CoachPersona, TimelineEntry, EmotionType } from './types';
import { ShieldAlert, Moon, Sun, Bot } from 'lucide-react';
// 목업 데이터 import: 중앙화된 목업 데이터 사용
import { INITIAL_TIMELINE } from './src/mock/data';
// 모바일 최적화 훅
import { useMobileOptimization } from './src/hooks/useMobileOptimization';

/**
 * 기본 AI 페르소나 설정
 * PRD 명세: FEAT-012 AI 페르소나 설정
 */
const DEFAULT_PERSONA: CoachPersona = {
  name: '루나',
  role: 'friend',
  mbti: 'ENFP',
  traits: { warmth: 80, directness: 40 }
};

const App: React.FC = () => {
  // 모바일 최적화 훅
  const { isMobile, shouldReduceAnimations } = useMobileOptimization();
  
  // 온보딩 완료 여부 확인 (FEAT-011)
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('onboarding_completed') === 'true';
  });
  
  const [activeTab, setActiveTab] = useState('chat');
  const [mode, setMode] = useState<'day' | 'night'>('day');
  const [persona, setPersona] = useState<CoachPersona>(DEFAULT_PERSONA);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>(INITIAL_TIMELINE);
  const [showSafetyLayer, setShowSafetyLayer] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>(null);

  /**
   * 온보딩 완료 핸들러
   * 온보딩 데이터를 저장하고 메인 화면으로 전환
   * 
   * @param data 온보딩 데이터
   */
  const handleOnboardingComplete = (data: OnboardingData) => {
    // 온보딩 데이터 저장 (추후 Firestore 연동 시 사용)
    console.log('온보딩 완료:', data);
    setIsOnboardingCompleted(true);
  };

  const handleSaveEntry = (entry: TimelineEntry) => {
    setTimelineData(prev => [entry, ...prev]);
  };

  const toggleMode = () => setMode(prev => prev === 'day' ? 'night' : 'day');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return mode === 'day' 
          ? <DayMode 
              persona={persona} 
              onSave={handleSaveEntry} 
              setImmersive={setImmersive}
              onNavigateToReports={() => setActiveTab('reports')}
              onOpenSafety={() => setShowSafetyLayer(true)}
              onEmotionChange={setCurrentEmotion}
            /> 
          : <NightMode persona={persona} onSave={handleSaveEntry} onEmotionChange={setCurrentEmotion} />;
      case 'journal': return <JournalView timelineData={timelineData} />;
      case 'content': return <ContentGallery persona={persona} />;
      case 'reports': return <ReportView timelineData={timelineData} />;
      case 'profile': return (
        <ProfileView 
          persona={persona} 
          onUpdatePersona={setPersona}
          conversations={timelineData}
          onDeleteConversation={(id) => {
            setTimelineData(prev => prev.filter(entry => entry.id !== id));
          }}
          onDeleteAllConversations={() => {
            setTimelineData([]);
          }}
        />
      );
      default: return null;
    }
  };

  // 온보딩 미완료 시 온보딩 화면 표시
  if (!isOnboardingCompleted) {
    return (
      <div className="relative w-full h-[100dvh] overflow-hidden font-sans bg-gradient-to-br from-brand-light via-white to-brand-secondary/20">
        <NoiseOverlay />
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={() => setIsOnboardingCompleted(true)}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`
        relative w-full h-[100dvh] overflow-hidden font-sans transition-colors duration-700 flex flex-col items-center pt-safe-top
        ${mode === 'day' ? 'text-slate-900 bg-[#F5F9FA]' : 'text-white bg-[#050505]'}
      `}>
      <NoiseOverlay />

      {/* Ambient 배경: 감정 반응 구체 시스템 (낮 모드) */}
      {mode === 'day' && (
        <AmbientBackground emotion={currentEmotion || undefined} intensity={5} mode={mode} />
      )}

      {/* 천체 배경: 별, 달, 오로라 효과 (밤 모드) */}
      {mode === 'night' && (
        <CelestialBackground intensity="medium" />
      )}

      {/* 2. Global Navigation Bar (GNB) - Strictly Constrained Width */}
      <div className={`
          fixed top-0 z-50 w-full flex justify-center pt-6 px-4 transition-all duration-500
          ${isImmersive ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}
      `}>
          <header className="w-full max-w-2xl flex items-center justify-between">
              {/* Brand: Absolute Left */}
              <div className="flex items-center gap-3 group cursor-pointer select-none">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm border transition-all duration-300
                      ${mode === 'day' ? 'bg-white/90 border-white/60 text-brand-primary' : 'bg-white/10 border-white/10 text-white'}
                      group-hover:scale-105
                  `}>
                      <span className="font-extrabold text-lg tracking-tighter">M.</span>
                  </div>
                  <div className="flex flex-col">
                      <span className={`font-bold text-sm tracking-tight leading-none mb-0.5 ${mode === 'day' ? 'text-slate-900' : 'text-slate-100'}`}>MaumLog</span>
                      <span className={`text-[9px] font-bold tracking-widest uppercase opacity-50 ${mode === 'day' ? 'text-brand-dark' : 'text-slate-400'}`}>V5.0</span>
                  </div>
              </div>

              {/* Tools: Absolute Right */}
              <div className={`
                  flex items-center gap-1 p-1 rounded-full backdrop-blur-xl border shadow-sm transition-colors duration-500
                  ${mode === 'day' ? 'bg-white/60 border-white/50' : 'bg-white/5 border-white/10'}
              `}>
                  <IconButton onClick={() => setShowSafetyLayer(true)} icon={<ShieldAlert size={18} strokeWidth={2.5} />} label="Safety" mode={mode} />
                  <IconButton onClick={() => setShowChatbot(true)} icon={<Bot size={18} strokeWidth={2.5} />} label="AI Helper" mode={mode} />
                  <div className={`w-[1px] h-3 mx-0.5 opacity-20 ${mode === 'day' ? 'bg-brand-dark' : 'bg-white'}`} />
                  <IconButton onClick={toggleMode} icon={mode === 'day' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />} label="Theme" mode={mode} />
              </div>
          </header>
      </div>

      {/* 3. Main Stage - Layout Sync with GNB (max-w-2xl) */}
      <main className={`
        relative z-10 w-full h-full flex flex-col items-center
        transition-all duration-700 ease-[0.22, 1, 0.36, 1]
        ${isImmersive ? 'px-0 py-0' : 'px-4 pt-24 pb-28'}
      `}>
         <motion.div
            layout
            className={`
               w-full h-full max-w-2xl flex flex-col overflow-hidden transition-all duration-700 relative
               ${isImmersive 
                 ? 'rounded-none shadow-none bg-transparent' 
                 : `rounded-[36px] shadow-2xl border backdrop-blur-lg
                    ${mode === 'day' ? 'bg-white/40 border-white/60 shadow-brand-primary/10' : 'bg-white/5 border-white/10 shadow-black/50'}`
               }
            `}
         >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab + mode}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 w-full h-full overflow-hidden"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
         </motion.div>
      </main>

      {/* 4. Dock - Unified Width & Unlocked */}
      <div className={`
          fixed bottom-6 z-50 w-full flex justify-center px-4 transition-all duration-500
          ${isImmersive ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}>
          <div className="w-full max-w-2xl flex justify-center">
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} mode={mode} />
          </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showChatbot && <AIChatbot persona={persona} onClose={() => setShowChatbot(false)} />}
        {showSafetyLayer && <SafetyLayer onClose={() => setShowSafetyLayer(false)} />}
      </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

// Refined Icon Button
const IconButton = ({ onClick, icon, label, mode }: any) => (
    <button
        onClick={onClick}
        title={label}
        className={`
            w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
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

export default App;
