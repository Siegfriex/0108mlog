import React from 'react';
import { motion } from 'framer-motion';
import { Save, User, Sparkles, Brain, Heart, MessageSquare } from 'lucide-react';
import { GlassCard, Button } from './UI';
import { CoachPersona } from '../types';

interface PersonaEditorProps {
  persona: CoachPersona;
  onUpdate: (persona: CoachPersona) => void;
}

const MBTI_TYPES = [
  'ENFP', 'INFJ', 'ENTJ', 'ISFP', 'ESTJ', 'INTP', 'ESFJ', 'ISTJ'
];

export const PersonaEditor: React.FC<PersonaEditorProps> = ({ persona, onUpdate }) => {
  
  const handleChange = (key: keyof CoachPersona, value: any) => {
    onUpdate({ ...persona, [key]: value });
  };

  const handleTraitChange = (key: keyof typeof persona.traits, value: number) => {
    onUpdate({
      ...persona,
      traits: {
        ...persona.traits,
        [key]: value
      }
    });
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto px-4 py-6 overflow-y-auto scrollbar-hide">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="text-peace-500" /> AI Persona Setup
        </h2>
        <p className="text-slate-500 text-sm">나만의 AI 동반자를 설정하세요.</p>
      </header>

      <div className="space-y-6 pb-20">
        {/* Identity Card */}
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-peace-200 to-indigo-200 rounded-[32px] blur-xl opacity-50 animate-pulse" />
            <GlassCard className="!bg-white/60 relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-peace-400 to-indigo-500 flex items-center justify-center text-4xl shadow-xl mb-4">
                    {persona.role === 'mentor' ? '🧙‍♂️' : persona.role === 'friend' ? '😺' : '👩‍⚕️'}
                </div>
                <div className="w-full space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                        <input 
                            type="text" 
                            value={persona.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="block w-full text-center text-2xl font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-peace-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="flex justify-center gap-4">
                        <select 
                            value={persona.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className="bg-white/50 px-3 py-1 rounded-full text-sm text-slate-600 border-none focus:ring-2 focus:ring-peace-400 cursor-pointer"
                        >
                            <option value="friend">Friend</option>
                            <option value="mentor">Mentor</option>
                            <option value="counselor">Counselor</option>
                        </select>
                        <select 
                             value={persona.mbti}
                             onChange={(e) => handleChange('mbti', e.target.value)}
                             className="bg-white/50 px-3 py-1 rounded-full text-sm text-slate-600 border-none focus:ring-2 focus:ring-peace-400 cursor-pointer"
                        >
                            {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </GlassCard>
        </div>

        {/* Traits Sliders */}
        <GlassCard>
            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                <Brain size={20} className="text-slate-400" /> Personality Traits
            </h3>
            
            <div className="space-y-8">
                {/* Warmth */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1"><Brain size={14}/> Logical</span>
                        <span className="font-semibold text-peace-600">Warmth: {persona.traits.warmth}%</span>
                        <span className="text-slate-500 flex items-center gap-1">Emotional <Heart size={14}/></span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={persona.traits.warmth}
                        onChange={(e) => handleTraitChange('warmth', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-peace-500"
                    />
                </div>

                {/* Directness */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1">Gentle</span>
                        <span className="font-semibold text-indigo-600">Directness: {persona.traits.directness}%</span>
                        <span className="text-slate-500 flex items-center gap-1">Blunt <MessageSquare size={14}/></span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={persona.traits.directness}
                        onChange={(e) => handleTraitChange('directness', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
            </div>
        </GlassCard>

        {/* Preview Context */}
        <div className="p-4 bg-slate-100/50 rounded-2xl text-xs text-slate-500 text-center">
            설정하신 페르소나는 Day Mode 대화와 Night Mode 편지에 즉시 적용됩니다.
        </div>
      </div>
    </div>
  );
};