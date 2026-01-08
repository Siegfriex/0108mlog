import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, ArrowRight, X, Sparkles, Sliders, Smile, Frown, Meh, CloudRain, Flame } from 'lucide-react';
import { GlassCard, Button, LoadingSpinner } from './UI';
import { EmotionType, ChatMessage, CoachPersona, TimelineEntry, MicroAction } from '../types';
import { generateDayModeResponse, generateMicroAction } from '../services/geminiService';

// Updated Emotions using Lucide Icons
const EMOTIONS_CONFIG = [
  { id: EmotionType.JOY, label: 'Super Awesome', icon: <Smile size={32} strokeWidth={1.5} />, color: 'joy' },
  { id: EmotionType.PEACE, label: 'Pretty Good', icon: <Meh size={32} strokeWidth={1.5} />, color: 'peace' },
  { id: EmotionType.ANXIETY, label: 'A bit Anxious', icon: <Frown size={32} strokeWidth={1.5} />, color: 'anxiety' },
  { id: EmotionType.SADNESS, label: 'Feeling Blue', icon: <CloudRain size={32} strokeWidth={1.5} />, color: 'sadness' },
  { id: EmotionType.ANGER, label: 'Frustrated', icon: <Flame size={32} strokeWidth={1.5} />, color: 'anger' },
];

interface DayModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
}

export const DayMode: React.FC<DayModeProps> = ({ persona, onSave }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionCard, setActionCard] = useState<MicroAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const startCheckIn = () => {
    if(!selectedEmotion) return;
    setHasStarted(true);
    const initialMsg: ChatMessage = {
        id: 'init',
        role: 'assistant',
        content: `I noticed you're feeling ${EMOTIONS_CONFIG.find(e => e.id === selectedEmotion)?.label} today. What's on your mind?`,
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
    
    // Generate Micro Action
    setIsActionLoading(true);
    const action = await generateMicroAction(emotionToSave, intensity, detailText);
    setIsActionLoading(false);
    
    if (action) {
      setActionCard(action);
    }
  };

  const closeActionCard = () => {
    setActionCard(null);
    setHasStarted(false);
    setMessages([]);
    setSelectedEmotion(null);
    setIntensity(5);
  };

  if (!hasStarted) {
      // Dashboard / Initial Selection View
      return (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-xl mx-auto py-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                  <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/60 shadow-sm">
                     <Smile size={32} strokeWidth={1.5} className="text-slate-700" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">How are you?</h1>
                  <p className="text-slate-500 text-sm">Check in with yourself today.</p>
              </motion.div>

              {/* Central Emotion Card */}
              <GlassCard className="w-full !p-8 flex flex-col items-center gap-8 shadow-2xl">
                  <div className="w-full text-center">
                      <div className={`text-slate-800 mb-4 transition-transform duration-300 transform ${selectedEmotion ? 'scale-110' : ''} flex justify-center`}>
                          {selectedEmotion ? EMOTIONS_CONFIG.find(e => e.id === selectedEmotion)?.icon : <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-dashed animate-spin-slow" />}
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">
                          {selectedEmotion ? EMOTIONS_CONFIG.find(e => e.id === selectedEmotion)?.label : 'Select Mood'}
                      </h2>
                      {selectedEmotion && (
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Intensity</span>
                              <span className="text-xs font-bold text-slate-800">{intensity}</span>
                          </div>
                      )}
                  </div>

                  {/* Slider UI */}
                  <div className="w-full px-4">
                      {/* Emotion Slider */}
                      <input 
                          type="range" 
                          min="0" 
                          max="4" 
                          step="1"
                          value={selectedEmotion ? EMOTIONS_CONFIG.findIndex(e => e.id === selectedEmotion) : 2}
                          onChange={(e) => setSelectedEmotion(EMOTIONS_CONFIG[Number(e.target.value)].id)}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-800 mb-8"
                      />
                      
                      {selectedEmotion && (
                          <div className="space-y-3 animate-fadeIn">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span>Mild</span>
                                  <span>Intense</span>
                              </div>
                              <input 
                                  type="range" 
                                  min="1" 
                                  max="10" 
                                  value={intensity} 
                                  onChange={(e) => setIntensity(Number(e.target.value))}
                                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
                              />
                          </div>
                      )}
                  </div>

                  <Button 
                      onClick={startCheckIn} 
                      disabled={!selectedEmotion}
                      className="w-full !rounded-xl !py-4"
                  >
                      CONTINUE
                  </Button>
              </GlassCard>
          </div>
      )
  }

  // Chat Interface
  return (
    <div className="h-full flex flex-col items-center w-full max-w-3xl mx-auto">
      <GlassCard className="flex-1 w-full flex flex-col !p-0 overflow-hidden shadow-2xl relative bg-white/80">
          
          {/* Header */}
          <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center shrink-0 z-10">
             <button onClick={() => setHasStarted(false)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                 <X size={20} className="text-slate-500" />
             </button>
             <div className="text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Reflection</span>
                 <h3 className="text-sm font-bold text-slate-800">{EMOTIONS_CONFIG.find(e => e.id === selectedEmotion)?.label}</h3>
             </div>
             {messages.length > 2 ? (
                 <button onClick={handleFinishAndSave} className="text-xs font-bold text-white bg-slate-900 px-4 py-1.5 rounded-full hover:bg-slate-800 transition-colors">
                     DONE
                 </button>
             ) : <div className="w-8" />}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide bg-slate-50/50">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
                    ${msg.role === 'user'
                      ? 'bg-slate-800 text-white rounded-[20px] rounded-br-sm shadow-lg shadow-slate-200'
                      : 'bg-white text-slate-700 rounded-[20px] rounded-tl-sm border border-slate-200/60'
                    }
                  `}
                >
                  {msg.content}
                </div>
                {msg.role === 'assistant' && (
                    <span className="text-[10px] text-slate-400 font-bold px-2 flex items-center gap-1">
                        <Sparkles size={10} /> {persona.name}
                    </span>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white px-4 py-3 rounded-[20px] rounded-tl-sm shadow-sm flex gap-1.5 border border-slate-100">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area (Pill Shape) */}
          <div className="p-4 bg-white border-t border-slate-100">
             <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Share your thoughts..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all text-sm text-slate-700 placeholder:text-slate-400"
                  autoFocus
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-2 w-9 h-9 bg-slate-900 rounded-full text-white shadow-sm flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  <Send size={16} />
                </button>
             </div>
          </div>

          {/* Action Card Overlay */}
          <AnimatePresence>
            {(actionCard || isActionLoading) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/90 backdrop-blur-md"
                >
                    {isActionLoading ? (
                        <div className="flex flex-col items-center">
                            <LoadingSpinner />
                            <p className="text-slate-500 text-sm font-medium mt-4 animate-pulse">Designing your ritual...</p>
                        </div>
                    ) : actionCard ? (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="h-28 bg-slate-900 relative p-6 flex flex-col justify-end">
                                <button onClick={closeActionCard} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                                <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Micro Action</div>
                                <h3 className="text-white text-xl font-bold">{actionCard.title}</h3>
                            </div>
                            <div className="p-8">
                                <div className="flex gap-2 mb-6">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wide">{actionCard.type}</span>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wide">{actionCard.duration}</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-8 text-sm font-medium">
                                    {actionCard.description}
                                </p>
                                <Button onClick={closeActionCard} className="w-full">
                                    Start Now <ArrowRight size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    ) : null}
                </motion.div>
            )}
          </AnimatePresence>
      </GlassCard>
    </div>
  );
};