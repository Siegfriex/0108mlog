
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayMode } from './components/DayMode';
import { NightMode } from './components/NightMode';
import { ReportView } from './components/ReportView';
import { JournalView } from './components/JournalView'; 
import { ProfileView } from './components/ProfileView';
import { ContentGallery } from './components/ContentGallery';
import { AIChatbot } from './components/AIChatbot';
import { SafetyLayer } from './components/SafetyLayer';
import { TabBar, NoiseOverlay } from './components/UI';
import { CoachPersona, TimelineEntry, EmotionType } from './types';
import { ShieldAlert, Moon, Sun, Bot } from 'lucide-react';

const DEFAULT_PERSONA: CoachPersona = {
  name: '루나',
  role: 'friend',
  mbti: 'ENFP',
  traits: { warmth: 80, directness: 40 }
};

// More extensive mock data for Calendar View
const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    id: 'mock-1',
    date: new Date(),
    type: 'day',
    emotion: EmotionType.JOY,
    intensity: 8,
    summary: '오랜만에 친구들과의 브런치',
    detail: '정말 오랜만에 고등학교 친구들을 만났다...',
    nuanceTags: ['#행복한', '#신나는', '#반가운']
  },
  {
    id: 'mock-2',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    type: 'night',
    emotion: EmotionType.ANXIETY,
    intensity: 6,
    summary: '내일 발표가 걱정된다',
    detail: '준비는 다 했는데 실수할까봐...',
    nuanceTags: ['#떨리는', '#불안한', '#압박감']
  },
  {
    id: 'mock-3',
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    type: 'day',
    emotion: EmotionType.PEACE,
    intensity: 7,
    summary: '한강 산책',
    detail: '바람이 시원했다.',
    nuanceTags: ['#상쾌한', '#여유로운']
  },
  {
    id: 'mock-4',
    date: new Date(new Date().setDate(new Date().getDate() - 6)),
    type: 'night',
    emotion: EmotionType.SADNESS,
    intensity: 5,
    summary: '비오는 날의 우울',
    detail: '그냥 아무 이유 없이 축 처진다.',
    nuanceTags: ['#무기력한', '#센치한']
  },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [mode, setMode] = useState<'day' | 'night'>('day');
  const [persona, setPersona] = useState<CoachPersona>(DEFAULT_PERSONA);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>(INITIAL_TIMELINE);
  const [showSafetyLayer, setShowSafetyLayer] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);

  const handleSaveEntry = (entry: TimelineEntry) => {
    setTimelineData(prev => [entry, ...prev]);
  };

  const toggleMode = () => setMode(prev => prev === 'day' ? 'night' : 'day');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return mode === 'day' 
          ? <DayMode persona={persona} onSave={handleSaveEntry} setImmersive={setIsImmersive} /> 
          : <NightMode persona={persona} onSave={handleSaveEntry} />;
      case 'journal': return <JournalView timelineData={timelineData} />;
      case 'content': return <ContentGallery persona={persona} />;
      case 'reports': return <ReportView timelineData={timelineData} />;
      case 'profile': return <ProfileView persona={persona} onUpdatePersona={setPersona} />;
      default: return null;
    }
  };

  return (
    <div className={`
      relative w-full h-[100dvh] overflow-hidden font-sans transition-colors duration-700 flex flex-col items-center
      ${mode === 'day' ? 'text-slate-900 bg-[#F5F9FA]' : 'text-white bg-[#050505]'}
    `}>
      <NoiseOverlay />

      {/* 1. Background Atmosphere (Stable & Subtle - Teal Theme) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Main Top Gradient */}
          <div className={`
            absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-[100%] blur-[100px] opacity-40 transition-colors duration-1000 
            ${mode === 'day' ? 'bg-gradient-to-b from-brand-secondary to-transparent' : 'bg-gradient-to-b from-brand-dark to-transparent'}
          `} />
          {/* Bottom Floating Orb - Complimentary Color (Soft Pink/Peach) */}
          <div className={`
            absolute bottom-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full filter blur-[120px] mix-blend-multiply opacity-30 animate-float 
            ${mode === 'day' ? 'bg-brand-accent' : 'bg-brand-primary/20'}
          `} />
      </div>

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
