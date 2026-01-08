import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sun, CheckCircle, Zap, ArrowRight, X } from 'lucide-react';
import { GlassCard, Button, LoadingSpinner } from './UI';
import { EmotionType, EmotionData, ChatMessage, CoachPersona, TimelineEntry, MicroAction } from '../types';
import { generateDayModeResponse, generateMicroAction } from '../services/geminiService';

const EMOTIONS: EmotionData[] = [
  { id: EmotionType.JOY, label: '기쁨', icon: '😊', color: 'joy', desc: '활력이 넘치는' },
  { id: EmotionType.PEACE, label: '평온', icon: '😌', color: 'peace', desc: '차분하고 안정된' },
  { id: EmotionType.ANXIETY, label: '불안', icon: '😰', color: 'anxiety', desc: '걱정이 많은' },
  { id: EmotionType.SADNESS, label: '슬픔', icon: '😢', color: 'sadness', desc: '가라앉은' },
  { id: EmotionType.ANGER, label: '분노', icon: '😡', color: 'anger', desc: '짜증나는' },
];

interface DayModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
}

export const DayMode: React.FC<DayModeProps> = ({ persona, onSave }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `좋은 아침이에요! 저는 ${persona.name}입니다. 오늘 지금 이 순간, 기분이 어떠신가요?`,
      timestamp: new Date()
    }
  ]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionCard, setActionCard] = useState<MicroAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedEmotion) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input || (selectedEmotion ? `${EMOTIONS.find(e => e.id === selectedEmotion)?.label} (강도: ${intensity})` : ''),
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
    const firstUserMsg = messages.find(m => m.role === 'user');
    const summaryText = firstUserMsg ? firstUserMsg.content.slice(0, 30) : '오늘의 대화';
    const detailText = messages.map(m => `[${m.role === 'user' ? '나' : persona.name}]: ${m.content}`).join('\n\n');

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
    setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: `기록이 저장되었습니다. 또 다른 이야기가 있으신가요?`,
        timestamp: new Date()
    }]);
    setSelectedEmotion(null);
    setIntensity(5);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto relative">
      <header className="flex items-center justify-between mb-6 px-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sun className="text-amber-500" /> 오늘의 마음
          </h1>
          <p className="text-slate-500 text-sm">감정을 체크하고 실용적인 조언을 얻으세요.</p>
        </div>
        <div className="flex items-center gap-2">
            {messages.length > 2 && !actionCard && !isActionLoading && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleFinishAndSave}
                    className="px-3 py-1 bg-peace-100 text-peace-700 rounded-full text-xs font-bold hover:bg-peace-200 transition-colors"
                >
                    기록 완료
                </motion.button>
            )}
            <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            DAY
            </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed shadow-sm
                ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-peace-400 to-peace-500 text-white rounded-tr-sm'
                  : 'bg-white/80 backdrop-blur-md text-slate-700 rounded-tl-sm border border-white/50'
                }
              `}
            >
              <div className="text-xs opacity-50 mb-1">{msg.role === 'assistant' ? persona.name : '나'}</div>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white/60 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-slate-500 animate-pulse">
               {persona.name}님이 생각하는 중...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Card Overlay */}
      <AnimatePresence>
        {(actionCard || isActionLoading) && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md"
            >
                {isActionLoading ? (
                    <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center">
                        <LoadingSpinner />
                        <p className="text-slate-600 font-medium mt-4">맞춤형 처방을 생성하고 있어요...</p>
                    </div>
                ) : actionCard ? (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative">
                            <button onClick={closeActionCard} className="absolute top-4 right-4 text-white/70 hover:text-white">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-2 mb-2 text-indigo-100 text-sm font-bold uppercase tracking-wider">
                                <Zap size={16} /> Micro Action
                            </div>
                            <h3 className="text-2xl font-bold">{actionCard.title}</h3>
                            <div className="mt-2 inline-block px-2 py-1 bg-white/20 rounded text-xs">
                                ⏱ {actionCard.duration}
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-600 leading-relaxed mb-6">
                                {actionCard.description}
                            </p>
                            <button 
                                onClick={closeActionCard}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                            >
                                시작하기 <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Container */}
      <div className="px-4 pb-2 space-y-4">
         {/* Intensity Slider */}
         {selectedEmotion && (
             <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40">
                 <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                     <span>Intensity</span>
                     <span className="text-peace-600 text-lg">{intensity}</span>
                 </div>
                 <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={intensity} 
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-peace-500"
                 />
             </div>
         )}

         {/* Emotion Chips */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => setSelectedEmotion(emotion.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap
                ${selectedEmotion === emotion.id
                  ? `bg-${emotion.color}-100 border-${emotion.color}-400 text-slate-800 shadow-md transform scale-105`
                  : 'bg-white/40 border-white/60 hover:bg-white/60 text-slate-600'
                }
              `}
            >
              <span>{emotion.icon}</span>
              <span className="text-sm font-medium">{emotion.label}</span>
            </button>
          ))}
         </div>

         {/* Input */}
         <GlassCard className="!p-2 !rounded-[24px]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="감정을 자유롭게 표현하세요..."
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-slate-700 placeholder:text-slate-400"
            />
            <Button 
                variant="primary" 
                onClick={handleSend} 
                disabled={isLoading}
                className="!rounded-full !w-10 !h-10 !p-0"
            >
              <Send size={18} />
            </Button>
          </div>
         </GlassCard>
      </div>
    </div>
  );
};