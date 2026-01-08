import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayMode } from './components/DayMode';
import { NightMode } from './components/NightMode';
import { ReportView } from './components/ReportView';
import { JournalView } from './components/JournalView'; 
import { PersonaEditor } from './components/PersonaEditor';
import { ContentGallery } from './components/ContentGallery';
import { AIChatbot } from './components/AIChatbot';
import { TabBar } from './components/UI';
import { CoachPersona, TimelineEntry, EmotionType } from './types';
import { ShieldAlert, Moon, Sun, Bot } from 'lucide-react';

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

// Rich Initial Mock Data for Memory Lane
const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    id: 'mock-1',
    date: new Date(),
    type: 'day',
    emotion: EmotionType.JOY,
    intensity: 8,
    summary: '오랜만에 친구들과의 브런치',
    detail: '정말 오랜만에 고등학교 친구들을 만났다. 예전처럼 웃고 떠들다 보니 스트레스가 다 날아가는 기분이었다. 맛있는 팬케이크와 커피, 그리고 끊이지 않는 수다. 이런 게 행복이지.'
  },
  {
    id: 'mock-2',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    type: 'night',
    emotion: EmotionType.PEACE,
    intensity: 7,
    summary: '하루를 마무리하며 느낀 평온함',
    detail: '오늘은 특별한 일은 없었지만, 저녁에 마신 차 한 잔이 정말 좋았다. 창밖으로 들리는 빗소리와 따뜻한 페퍼민트 티. 루나가 써준 편지에서 "소소한 행복이 진짜 행복"이라는 말이 와닿았다.'
  },
  {
    id: 'mock-3',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    type: 'day',
    emotion: EmotionType.ANXIETY,
    intensity: 6,
    summary: '중요한 프로젝트 발표 전 긴장감',
    detail: '발표 준비가 덜 된 것 같아서 너무 불안했다. 심장이 계속 두근거리고 손에 땀이 났다. 루나와의 대화를 통해 내가 통제할 수 있는 부분(대본 숙지)에만 집중하기로 했다. 호흡법이 도움이 됐다.'
  },
  {
    id: 'mock-4',
    date: new Date(new Date().setDate(new Date().getDate() - 4)),
    type: 'night',
    emotion: EmotionType.SADNESS,
    intensity: 5,
    summary: '괜스레 우울해지는 밤',
    detail: '이유 없이 눈물이 날 것 같은 밤이었다. 옛날 사진첩을 보다가 그리운 얼굴들을 봐서 그런가. 시간이 너무 빠르게 흐르는 것 같아 무섭기도 하다. 오늘은 일찍 잠자리에 들어야겠다.'
  },
  {
    id: 'mock-5',
    date: new Date(new Date().setDate(new Date().getDate() - 7)),
    type: 'day',
    emotion: EmotionType.ANGER,
    intensity: 9,
    summary: '무례한 동료 때문에 폭발 직전',
    detail: '회의 시간에 내 아이디어를 가로채려는 동료 때문에 너무 화가 났다. 바로 반박하고 싶었지만 꾹 참았다. 점심시간에 산책하면서 화를 식혔다. 내일은 차분하게 내 입장을 정리해서 메일을 보내야지.'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat'); // Default to Chat
  const [mode, setMode] = useState<'day' | 'night'>('day');
  const [persona, setPersona] = useState<CoachPersona>(DEFAULT_PERSONA);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>(INITIAL_TIMELINE);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleSaveEntry = (entry: TimelineEntry) => {
    setTimelineData(prev => [entry, ...prev]);
  };

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
    <div className={`min-h-screen w-full relative transition-colors duration-1000 overflow-x-hidden font-sans ${mode === 'day' ? 'text-slate-800' : 'text-white'}`}>
      
      {/* 1. Global Background (Tone Lowered) */}
      <div className={`fixed inset-0 z-0 transition-all duration-1000 ${mode === 'day' ? 'bg-[#EEF1F6]' : 'bg-[#1a1b2e]'}`}>
        {mode === 'day' ? (
             <>
                {/* Muted Pastel Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D4D8F0] rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
                    <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[#E0D4F0] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#D4E0F0] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
                </div>
             </>
        ) : (
            <>
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                     <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-indigo-950 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow" />
                     <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-950 rounded-full mix-blend-screen filter blur-[120px] opacity-60" />
                </div>
                {/* Subtle Stars */}
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute bg-white/40 rounded-full animate-pulse" 
                         style={{
                             width: Math.random() * 2 + 'px', 
                             height: Math.random() * 2 + 'px',
                             top: Math.random() * 100 + '%', 
                             left: Math.random() * 100 + '%',
                             animationDelay: Math.random() * 5 + 's',
                             opacity: Math.random() * 0.5
                         }} 
                    />
                ))}
            </>
        )}
      </div>

      {/* 2. Unified Header (Stroke Icons Only) */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 z-40 pointer-events-none">
           <div className="pointer-events-auto flex items-center gap-3">
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-md border
                    ${mode === 'day' ? 'bg-white/80 border-white/40 text-slate-700' : 'bg-white/5 border-white/10 text-white'}
                 `}
               >
                   <span className="font-bold text-lg tracking-tighter">M</span>
               </motion.div>
           </div>

           <div className="pointer-events-auto flex items-center gap-3">
               {/* Safety */}
               <button 
                onClick={() => setShowSafetyModal(true)}
                className={`p-2.5 rounded-full transition-colors shadow-sm backdrop-blur-md border
                    ${mode === 'day' ? 'bg-white/60 border-white/40 text-red-400 hover:bg-white' : 'bg-white/5 border-white/10 text-red-300 hover:bg-white/10'}
                `}
               >
                   <ShieldAlert size={20} strokeWidth={2} />
               </button>

               {/* AI Bot */}
               <button
                onClick={() => setShowChatbot(true)}
                className={`p-2.5 rounded-full transition-colors shadow-sm backdrop-blur-md border
                    ${mode === 'day' ? 'bg-white/60 border-white/40 text-indigo-500 hover:bg-white' : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10'}
                `}
               >
                   <Bot size={20} strokeWidth={2} />
               </button>

               {/* Mode Switcher */}
               <button 
                onClick={toggleMode}
                className={`p-2.5 rounded-full transition-all duration-500 shadow-sm backdrop-blur-md border
                    ${mode === 'day' ? 'bg-slate-800 border-slate-700 text-yellow-300' : 'bg-white border-white text-slate-900'}
                `}
               >
                   {mode === 'day' ? <Moon size={20} strokeWidth={2} /> : <Sun size={20} strokeWidth={2} />}
               </button>
           </div>
      </header>

      {/* 3. Main Stage */}
      <main className="relative z-10 pt-24 pb-32 px-4 md:px-8 w-full max-w-5xl mx-auto min-h-screen flex flex-col">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab + mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex-1 flex flex-col"
                >
                    {renderContent()}
                </motion.div>
             </AnimatePresence>
      </main>

      {/* 4. Floating Tab Bar (Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[400px] px-6">
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
                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
                onClick={() => setShowSafetyModal(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl border border-white/20" 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Emergency Support</h3>
                    <p className="text-slate-500 mb-8 text-sm leading-relaxed">You are not alone.</p>
                    <div className="space-y-3">
                        <a href="tel:1577-0199" className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-50 text-slate-700 font-semibold rounded-2xl hover:bg-slate-100 transition-colors text-sm">
                            📞 1577-0199 (Crisis Counseling)
                        </a>
                        <a href="tel:1393" className="flex items-center justify-center gap-3 w-full py-3.5 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200 text-sm">
                            📞 1393 (Suicide Prevention)
                        </a>
                    </div>
                    <button 
                        onClick={() => setShowSafetyModal(false)}
                        className="mt-8 text-slate-400 hover:text-slate-600 text-xs font-medium"
                    >
                        CLOSE
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;