import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Smile, Frown, Meh, CloudRain, Flame, ArrowUp } from 'lucide-react';
import { GlassCard, Button } from './UI';
import { EmotionType, ChatMessage, CoachPersona, TimelineEntry, MicroAction } from '../types';
import { generateDayModeResponse, generateMicroAction } from '../services/geminiService';

const EMOTIONS_CONFIG = [
  { id: EmotionType.JOY, label: 'Super Awesome', icon: <Smile size={36} strokeWidth={2} />, color: 'text-amber-500', bgGradient: 'from-amber-200/40 via-yellow-100/40 to-orange-100/40' },
  { id: EmotionType.PEACE, label: 'Pretty Good', icon: <Meh size={36} strokeWidth={2} />, color: 'text-sky-500', bgGradient: 'from-sky-200/40 via-blue-100/40 to-indigo-100/40' },
  { id: EmotionType.ANXIETY, label: 'A bit Anxious', icon: <Frown size={36} strokeWidth={2} />, color: 'text-orange-500', bgGradient: 'from-orange-200/40 via-red-100/40 to-amber-100/40' },
  { id: EmotionType.SADNESS, label: 'Feeling Blue', icon: <CloudRain size={36} strokeWidth={2} />, color: 'text-indigo-500', bgGradient: 'from-indigo-200/40 via-purple-100/40 to-slate-100/40' },
  { id: EmotionType.ANGER, label: 'Frustrated', icon: <Flame size={36} strokeWidth={2} />, color: 'text-rose-500', bgGradient: 'from-rose-200/40 via-red-100/40 to-orange-100/40' },
];

interface DayModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
  setImmersive: (active: boolean) => void;
}

export const DayMode: React.FC<DayModeProps> = ({ persona, onSave, setImmersive }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionCard, setActionCard] = useState<MicroAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  useEffect(() => {
    return () => setImmersive(false);
  }, [setImmersive]);

  const activeEmotionConfig = EMOTIONS_CONFIG.find(e => e.id === selectedEmotion);

  const startCheckIn = () => {
    if(!selectedEmotion) return;
    setHasStarted(true);
    const initialMsg: ChatMessage = {
        id: 'init',
        role: 'assistant',
        content: `I noticed you're feeling ${activeEmotionConfig?.label} today. What's on your mind?`,
        timestamp: new Date()
    };
    setMessages([initialMsg]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => `${m.role === 'user' ? '사용자' : persona.name}: ${m.content}`);
    const response = await generateDayModeResponse(userMsg.content, history, persona);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleFinishAndSave = async () => {
    if (isSaved || isActionLoading) return;
    setIsSaved(true);
    setImmersive(false);

    const emotionToSave = selectedEmotion || EmotionType.PEACE;
    const summaryText = messages.length > 1 ? messages[1].content.slice(0, 30) : 'Check-in';
    const detailText = messages.map(m => `[${m.role === 'user' ? 'Me' : persona.name}]: ${m.content}`).join('\n\n');

    const entry: TimelineEntry = {
      id: Date.now().toString(),
      date: new Date(),
      type: 'day',
      emotion: emotionToSave,
      intensity: intensity,
      summary: summaryText,
      detail: detailText
    };

    onSave(entry);
    
    setIsActionLoading(true);
    try {
        const action = await generateMicroAction(emotionToSave, intensity, detailText);
        if (action) {
          setActionCard(action);
        } else {
          closeActionCard();
        }
    } catch (e) {
        console.error("Failed to generate action", e);
        closeActionCard();
    } finally {
        setIsActionLoading(false);
    }
  };

  const closeActionCard = () => {
    setActionCard(null);
    setHasStarted(false);
    setMessages([]);
    setSelectedEmotion(null);
    setIntensity(5);
    setIsSaved(false);
    setImmersive(false);
  };

  // --- Initial Mood Screen (Scrolling enabled for mobile) ---
  if (!hasStarted) {
      return (
          <div className="h-full w-full flex flex-col items-center pt-8 sm:pt-[15vh] px-4 sm:px-6 relative overflow-y-auto scrollbar-hide">
              {/* Dynamic Gradient Background for Mood */}
              <motion.div 
                animate={{ 
                    background: selectedEmotion 
                        ? `radial-gradient(circle at 50% 30%, ${activeEmotionConfig?.bgGradient?.split(' ')[1]}, transparent 60%)`
                        : 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.0), transparent)'
                }}
                className="absolute inset-0 z-0 blur-[100px] opacity-50 transition-colors duration-1000 pointer-events-none"
              />

              <div className="relative z-10 w-full max-w-md flex flex-col gap-6 sm:gap-8 pb-10">
                <div className="text-center space-y-1 sm:space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tighter">Check In</h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">How are you feeling right now?</p>
                </div>

                <GlassCard className="!p-6 sm:!p-8 shadow-2xl !bg-white/70 !backdrop-blur-2xl border-white/70">
                    <div className="flex flex-col items-center gap-6 sm:gap-8">
                        {/* Icon */}
                        <div className="h-20 sm:h-24 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedEmotion || 'empty'}
                                    initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`${activeEmotionConfig?.color || 'text-slate-300'}`}
                                >
                                    {selectedEmotion ? activeEmotionConfig?.icon : <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-4 border-slate-200 border-dashed animate-spin-slow" />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 h-8 tracking-tight">
                            {selectedEmotion ? activeEmotionConfig?.label : 'Select Mood'}
                        </h2>

                        {/* Slider */}
                        <div className="w-full relative h-12 sm:h-14">
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 bg-slate-100 rounded-full" />
                            <div className="flex justify-between relative z-0 pt-4 sm:pt-5 px-1">
                                {EMOTIONS_CONFIG.map((e, idx) => (
                                    <div 
                                        key={e.id}
                                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${selectedEmotion === e.id ? 'bg-slate-800 scale-125' : 'bg-slate-300'}`}
                                    />
                                ))}
                            </div>
                             <input 
                              type="range" 
                              min="0" 
                              max="4" 
                              step="1"
                              value={selectedEmotion ? EMOTIONS_CONFIG.findIndex(e => e.id === selectedEmotion) : 2}
                              onChange={(e) => setSelectedEmotion(EMOTIONS_CONFIG[Number(e.target.value)].id)}
                              className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                          />
                        </div>

                        {/* Intensity */}
                        <AnimatePresence>
                            {selectedEmotion && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full space-y-4 pt-4 border-t border-slate-200/50"
                                >
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                        <span>Mild</span>
                                        <span>Intensity: {intensity}</span>
                                        <span>Intense</span>
                                    </div>
                                    <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden flex items-center">
                                        <motion.div 
                                            className="h-full bg-slate-800" 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(intensity / 10) * 100}%` }}
                                        />
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="10" 
                                            value={intensity} 
                                            onChange={(e) => setIntensity(Number(e.target.value))}
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button 
                            onClick={startCheckIn} 
                            disabled={!selectedEmotion}
                            className="w-full bg-slate-900 text-white !rounded-xl !py-3.5 sm:!py-4 text-sm sm:text-base shadow-xl"
                        >
                            Start Chat
                        </Button>
                    </div>
                </GlassCard>
              </div>
          </div>
      )
  }

  // --- Chat Interface ---
  return (
    <div className="h-full flex flex-col w-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide relative w-full">
        {/* Chat Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/20 mb-4 sticky top-0 z-20 backdrop-blur-sm -mx-4 px-6 pt-2">
             <button 
                onClick={() => {
                  setHasStarted(false);
                  setImmersive(false);
                }} 
                className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors group"
             >
                 <X size={20} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
             </button>
             
             <div className="text-center bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
                 <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    {activeEmotionConfig?.icon && React.cloneElement(activeEmotionConfig.icon as React.ReactElement, { size: 14 })}
                    {activeEmotionConfig?.label}
                 </h3>
             </div>
             
             <div className="w-8" />
        </div>

        <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
            <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
                <div
                className={`
                    max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm backdrop-blur-md
                    ${msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-[20px] rounded-br-sm shadow-xl shadow-slate-900/10'
                    : 'bg-white/80 border border-white/50 text-slate-700 rounded-[20px] rounded-tl-sm shadow-sm'
                    }
                `}
                >
                {msg.content}
                </div>
                {msg.role === 'assistant' && (
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-slate-400 font-bold px-3 flex items-center gap-1"
                    >
                        <Sparkles size={10} className="text-amber-400" /> {persona.name}
                    </motion.span>
                )}
            </motion.div>
            ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full px-2">
             <div className="bg-white/60 px-5 py-4 rounded-[20px] rounded-tl-sm shadow-sm flex items-center gap-1.5 border border-white/50">
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
             </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-24" /> {/* Spacer for bottom input */}
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-6 left-0 right-0 px-4 z-30 flex justify-center w-full">
         <motion.div 
            layout
            className="flex items-end gap-2 bg-white/90 border border-white/60 shadow-2xl rounded-[32px] p-2 w-full max-w-2xl backdrop-blur-xl transition-all"
         >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setImmersive(true)}
              onBlur={() => { if(!input.trim()) setImmersive(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Share your thoughts..."
              className="flex-1 bg-transparent border-none rounded-[24px] pl-6 py-4 focus:outline-none focus:ring-0 text-[16px] text-slate-700 placeholder:text-slate-400 min-h-[56px]"
              autoFocus={false}
            />
            <div className="flex flex-col gap-1 pb-1 pr-1">
                {messages.length > 0 && !isSaved && (
                     <motion.button 
                     onClick={handleFinishAndSave}
                     disabled={isLoading}
                     className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-100"
                     title="Finish & Save"
                 >
                     <Sparkles size={18} strokeWidth={2.5} />
                 </motion.button>
                )}
                
                <motion.button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="w-10 h-10 bg-slate-900 rounded-full text-white shadow-lg flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
                >
                    <ArrowUp size={20} strokeWidth={2.5} />
                </motion.button>
            </div>
         </motion.div>
      </div>

      {/* Action Card Overlay */}
      <AnimatePresence>
        {(actionCard || isActionLoading) && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/90 backdrop-blur-xl"
            >
               {isActionLoading ? <div className="animate-spin w-10 h-10 border-4 border-slate-200 rounded-full border-t-indigo-500"/> : (
                   <GlassCard className="w-full max-w-sm !p-8 shadow-2xl">
                       <h3 className="text-2xl font-bold mb-4">{actionCard?.title}</h3>
                       <p className="mb-6 text-slate-600">{actionCard?.description}</p>
                       <Button onClick={closeActionCard} className="w-full bg-slate-900 text-white">Done</Button>
                   </GlassCard>
               )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};