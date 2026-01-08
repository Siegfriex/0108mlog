
import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Brain, Heart, MessageSquare, GraduationCap, HeartHandshake, UserCog } from 'lucide-react';
// UI 컴포넌트 import 경로: 새로운 구조로 변경
import { GlassCard } from '../src/components/ui';
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

  const getRoleIcon = () => {
      switch(persona.role) {
          case 'mentor': return <GraduationCap size={40} strokeWidth={1.5} />;
          case 'counselor': return <HeartHandshake size={40} strokeWidth={1.5} />;
          default: return <Sparkles size={40} strokeWidth={1.5} />; // Friend
      }
  };

  return (
    <div className="h-full flex flex-col max-w-xl mx-auto px-4 py-6 overflow-y-auto scrollbar-hide">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserCog size={28} className="text-brand-primary" strokeWidth={1.5} /> Persona Setup
        </h2>
        <p className="text-slate-500 text-sm mt-1 ml-1">Customize your AI companion.</p>
      </header>

      <div className="space-y-6 pb-20">
        {/* Identity Card */}
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary to-brand-light rounded-[32px] blur-2xl opacity-40" />
            <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-[32px] p-8 flex flex-col items-center text-center">
                <motion.div 
                    key={persona.role}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center text-white shadow-xl shadow-brand-primary/30 mb-6"
                >
                    {getRoleIcon()}
                </motion.div>
                
                <div className="w-full space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Name</label>
                        <input 
                            type="text" 
                            value={persona.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="block w-full text-center text-3xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent focus:border-brand-secondary focus:outline-none transition-colors pb-2 placeholder:text-slate-300"
                        />
                    </div>
                    
                    <div className="flex justify-center gap-3">
                        <div className="relative group">
                            <select 
                                value={persona.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                className="appearance-none bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-light cursor-pointer shadow-sm hover:border-brand-primary/50 transition-all pr-8 capitalize"
                            >
                                <option value="friend">Friend</option>
                                <option value="mentor">Mentor</option>
                                <option value="counselor">Counselor</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <User size={14} />
                            </div>
                        </div>

                        <div className="relative group">
                            <select 
                                value={persona.mbti}
                                onChange={(e) => handleChange('mbti', e.target.value)}
                                className="appearance-none bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-light cursor-pointer shadow-sm hover:border-brand-primary/50 transition-all pr-8"
                            >
                                {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Brain size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Traits Sliders */}
        <GlassCard className="!p-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                Personality Traits
            </h3>
            
            <div className="space-y-10">
                {/* Warmth */}
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                        <span className="flex items-center gap-1"><Brain size={12}/> Logical</span>
                        <span className="text-brand-primary">{persona.traits.warmth}%</span>
                        <span className="flex items-center gap-1">Emotional <Heart size={12}/></span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={persona.traits.warmth}
                        onChange={(e) => handleTraitChange('warmth', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-primary"
                    />
                </div>

                {/* Directness */}
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                        <span className="flex items-center gap-1">Gentle</span>
                        <span className="text-brand-dark">{persona.traits.directness}%</span>
                        <span className="flex items-center gap-1">Direct <MessageSquare size={12}/></span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={persona.traits.directness}
                        onChange={(e) => handleTraitChange('directness', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-dark"
                    />
                </div>
            </div>
        </GlassCard>

        {/* Preview Context */}
        <div className="p-4 bg-brand-light border border-brand-secondary/30 rounded-2xl text-[11px] text-brand-dark/70 text-center font-medium leading-relaxed">
            Changes are applied immediately to all future conversations and letters.
        </div>
      </div>
    </div>
  );
};
