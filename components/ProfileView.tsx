
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Shield, MessageSquare, ChevronRight, ArrowLeft, UserCog } from 'lucide-react';
import { GlassCard } from './UI';
import { PersonaEditor } from './PersonaEditor';
import { CoachPersona } from '../types';

interface ProfileViewProps {
  persona: CoachPersona;
  onUpdatePersona: (persona: CoachPersona) => void;
}

type ProfileSubView = 'main' | 'persona' | 'settings' | 'privacy' | 'conversations';

export const ProfileView: React.FC<ProfileViewProps> = ({ persona, onUpdatePersona }) => {
  const [view, setView] = useState<ProfileSubView>('main');

  const menuItems = [
    { id: 'persona', label: 'AI Persona Setup', icon: <UserCog size={20} />, description: 'Customize your AI companion' },
    { id: 'settings', label: 'App Settings', icon: <Settings size={20} />, description: 'Notifications, Theme' },
    { id: 'privacy', label: 'Privacy & Data', icon: <Shield size={20} />, description: 'Manage your data & export' },
    { id: 'conversations', label: 'Manage Conversations', icon: <MessageSquare size={20} />, description: 'View history, delete logs' },
  ];

  const renderContent = () => {
    switch (view) {
      case 'persona':
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 px-4 pt-2">
                    <button onClick={() => setView('main')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h3 className="font-bold text-slate-800">Back to Profile</h3>
                </div>
                <PersonaEditor persona={persona} onUpdate={onUpdatePersona} />
            </div>
        );
      case 'settings':
        return <PlaceholderView title="App Settings" onBack={() => setView('main')} />;
      case 'privacy':
        return <PlaceholderView title="Privacy & Data" onBack={() => setView('main')} />;
      case 'conversations':
        return <PlaceholderView title="Manage Conversations" onBack={() => setView('main')} />;
      default:
        return (
          <div className="px-4 py-6 max-w-xl mx-auto w-full h-full overflow-y-auto scrollbar-hide">
            <header className="mb-8 text-center pt-4">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-brand-primary/30">
                    <User size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>
                <div className="flex justify-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-brand-light text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider border border-brand-secondary">Level 5</span>
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-100">1,250 XP</span>
                </div>
            </header>

            <div className="space-y-4 pb-24">
                {menuItems.map((item) => (
                    <GlassCard 
                        key={item.id} 
                        className="!p-0 flex items-center cursor-pointer hover:bg-white/80 transition-colors group"
                        onClick={() => setView(item.id as ProfileSubView)}
                    >
                        <div className="p-5 flex items-center w-full">
                            <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary mr-4 shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm">{item.label}</h4>
                                <p className="text-slate-500 text-xs">{item.description}</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-primary transition-colors" />
                        </div>
                    </GlassCard>
                ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full">
        <AnimatePresence mode="wait">
            <motion.div
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
    </div>
  );
};

const PlaceholderView: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <div className="h-full flex flex-col px-4 pt-2">
        <div className="flex items-center gap-2 mb-8 py-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50 pb-20">
            <Settings size={48} strokeWidth={1} className="mb-4" />
            <p className="text-sm font-medium">Coming Soon in Phase 1</p>
        </div>
    </div>
);
