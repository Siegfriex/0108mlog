import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Sparkles } from 'lucide-react';
// UI 컴포넌트 import 경로: 새로운 구조로 변경
import { GlassCard, Button, LoadingSpinner } from '../src/components/ui';
import { ChatMessage, CoachPersona } from '../types';
import { generateChatbotResponse } from '../services/geminiService';

interface AIChatbotProps {
  persona: CoachPersona;
  onClose: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ persona, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm ${persona.name}. How can I support you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await generateChatbotResponse(userMsg.content, history, persona);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chatbot response error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#F8FAFC] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Bot size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              AI Counselor <Sparkles size={12} className="text-amber-500" fill="currentColor" />
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Powered by Gemini 3.0</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/50 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`
                max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
                ${msg.role === 'user'
                  ? 'bg-slate-800 text-white rounded-[20px] rounded-br-sm shadow-lg shadow-slate-200'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-[20px] rounded-tl-sm'
                }
              `}
            >
              {msg.content}
            </div>
            {msg.role === 'assistant' && (
                <span className="text-[10px] text-slate-400 font-bold px-2 mt-1.5">{persona.name}</span>
            )}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-[20px] rounded-tl-sm shadow-sm flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 pb-8">
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all text-sm text-slate-700 placeholder:text-slate-400"
              disabled={isLoading}
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
    </motion.div>
  );
};