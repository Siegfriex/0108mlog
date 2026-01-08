import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayMode } from './components/DayMode';
import { NightMode } from './components/NightMode';
import { ReportView } from './components/ReportView';
import { JournalView } from './components/JournalView'; 
import { PersonaEditor } from './components/PersonaEditor';
import { ContentGallery } from './components/ContentGallery';
import { AIChatbot } from './components/AIChatbot'; // New Import
import { TabBar } from './components/UI';
import { CoachPersona, TimelineEntry, EmotionType } from './types';
import { ShieldAlert, MessageCircle } from 'lucide-react'; // Added MessageCircle

// Default Persona
const DEFAULT_PERSONA: CoachPersona = {
  name: '루나',
  role: 'friend',
  mbti: 'ENFP',
  traits: {
    warmth: 80,
    directness: 40
  }
};

// Initial Mock Data
const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    id: 'mock-1',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    type: 'night',
    emotion: EmotionType.PEACE,
    intensity: 7,
    summary: '하루를 마무리하며 느낀 평온함',
    detail: '오늘은 특별한 일은 없었지만, 저녁에 마신 차 한 잔이 정말 좋았다. 루나가 써준 편지에서 "소소한 행복이 진짜 행복"이라는 말이 와닿았다.'
  },
  {
    id: 'mock-2',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    type: 'day',
    emotion: EmotionType.ANXIETY,
    intensity: 6,
    summary: '중요한 프로젝트 발표 전 긴장감',
    detail: '발표 준비가 덜 된 것 같아서 너무 불안했다. 루나와의 대화를 통해 내가 할 수 있는 부분에 집중하기로 했다.'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat'); // Default to Chat
  const [mode, setMode] = useState<'day' | 'night'>('day');
  const [persona, setPersona] = useState<CoachPersona>(DEFAULT_PERSONA);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>(INITIAL_TIMELINE);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // Chatbot State

  const handleSaveEntry = (entry: TimelineEntry) => {
    setTimelineData(prev => [entry, ...prev]);
  };

  const bgGradient = mode === 'day'
    ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
    : 'bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900';

  const toggleMode = () => {
    setMode(prev => prev === 'day' ? 'night' : 'day');
  };

  const renderContent = () => {
    if (activeTab === 'chat') {
      return mode === 'day' 
        ? <DayMode persona={persona} onSave={handleSaveEntry} /> 
        : <NightMode persona={persona} onSave={handleSaveEntry} />;
    }
    if (activeTab === 'journal') {
        return <JournalView timelineData={timelineData} />;
    }
    if (activeTab === 'content') {
      return <ContentGallery persona={persona} />;
    }
    if (activeTab === 'reports') {
      return <ReportView timelineData={timelineData} />;
    }
    if (activeTab === 'profile') {
      return <PersonaEditor persona={persona} onUpdate={setPersona} />;
    }
    return null;
  };

  return (
    <div className={`min-h-screen relative transition-colors duration-1000 ${bgGradient}`}>
      {/* Ambient Background Animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {mode === 'day' ? (
             <>
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-300/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[120px] animate-float" />
             </>
        ) : (
            <>
                <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full animate-ping" />
                <div className="absolute top-40 right-40 w-1 h-1 bg-white rounded-full animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
            </>
        )}
      </div>

      {/* Main Container */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Navigation / Mode Toggle */}
        <header className="p-4 flex justify-between items-center max-w-6xl mx-auto w-full">
           <div className="font-bold text-lg tracking-tight" style={{ color: mode === 'day' ? '#334155' : 'white' }}>
               MaumLog
           </div>
           {activeTab === 'chat' && (
               <button 
                onClick={toggleMode}
                className={`
                    px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300
                    ${mode === 'day' 
                        ? 'bg-white/60 border-white/40 text-slate-700 shadow-glass' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }
                `}
               >
                   {mode === 'day' ? 'Switch to Night 🌙' : 'Switch to Day ☀️'}
               </button>
           )}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab + mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    {renderContent()}
                </motion.div>
             </AnimatePresence>
        </main>

        {/* Floating Chatbot Button (Left Side) */}
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChatbot(true)}
            className="fixed bottom-24 left-4 z-50 p-4 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-2xl transition-all"
            aria-label="AI Chatbot"
        >
            <MessageCircle size={28} />
        </motion.button>

        {/* Floating Safety Button (Right Side) */}
        <button
            onClick={() => setShowSafetyModal(true)}
            className="fixed bottom-24 right-4 z-50 p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            aria-label="Safety Help"
        >
            <ShieldAlert size={24} />
        </button>

        {/* Bottom Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* AI Chatbot Overlay */}
      <AnimatePresence>
        {showChatbot && (
          <AIChatbot 
            persona={persona} 
            onClose={() => setShowChatbot(false)} 
          />
        )}
      </AnimatePresence>

      {/* Safety Modal */}
      <AnimatePresence>
        {showSafetyModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                onClick={() => setShowSafetyModal(false)}
            >
                <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center" onClick={e => e.stopPropagation()}>
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">도움이 필요하신가요?</h3>
                    <p className="text-slate-600 mb-6">혼자라고 느끼지 마세요. 언제든 도움을 요청할 수 있습니다.</p>
                    <div className="space-y-3">
                        <button className="w-full py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200">
                            1577-0199 (정신건강 위기상담)
                        </button>
                        <button className="w-full py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200">
                            1393 (자살예방상담)
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowSafetyModal(false)}
                        className="mt-6 text-slate-400 hover:text-slate-600"
                    >
                        닫기
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;