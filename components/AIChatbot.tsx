import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Sparkles } from 'lucide-react';
import { GlassCard, Button, LoadingSpinner } from './UI';
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
      content: `안녕하세요! 저는 ${persona.name}입니다. 무엇이든 물어보세요.`,
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

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await generateChatbotResponse(userMsg.content, history, persona);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              AI Counselor <Sparkles size={16} className="text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500">Powered by Gemini 3.0 Pro</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={24} className="text-slate-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed shadow-sm
                ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                }
              `}
            >
              {msg.role === 'assistant' && (
                <div className="text-xs font-bold mb-1 opacity-50 flex items-center gap-1">
                  {persona.name}
                </div>
              )}
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <GlassCard className="!p-2 !rounded-[24px] !bg-slate-50 !border-slate-200 !shadow-none">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="무엇이든 물어보세요..."
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-slate-700 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <Button 
                variant="primary" 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="!rounded-full !w-10 !h-10 !p-0 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-200"
            >
              <Send size={18} />
            </Button>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};