
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Map as MapIcon, ChevronRight, X, Brain, 
  Wind, PenTool, Activity, Sparkles, HeartPulse, ArrowRight 
} from 'lucide-react';
import { TimelineView } from './TimelineView';
import { TimelineEntry, TherapyTool } from '../types';
import { GlassCard, Button } from './UI';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface JournalViewProps {
  timelineData: TimelineEntry[];
}

// Mock Data for "Resilience Score" visualization (Youper-style growth tracking)
const RESILIENCE_DATA = [
    { day: 1, score: 65 }, { day: 2, score: 68 }, { day: 3, score: 62 },
    { day: 4, score: 70 }, { day: 5, score: 75 }, { day: 6, score: 72 },
    { day: 7, score: 78 },
];

const SUGGESTED_TOOLS: TherapyTool[] = [
    {
        id: 'cbt-1',
        title: 'Thought Challenge',
        description: 'Identify and reframe negative thought patterns.',
        icon: <Brain size={20} />,
        duration: '5 min',
        category: 'CBT'
    },
    {
        id: 'breath-1',
        title: 'Box Breathing',
        description: 'Regulate your nervous system instantly.',
        icon: <Wind size={20} />,
        duration: '2 min',
        category: 'Breathwork'
    },
    {
        id: 'journal-1',
        title: 'Gratitude Log',
        description: 'Shift focus to positive aspects of your day.',
        icon: <PenTool size={20} />,
        duration: '3 min',
        category: 'Mindfulness'
    }
];

export const JournalView: React.FC<JournalViewProps> = ({ timelineData }) => {
  const [showMemoryLane, setShowMemoryLane] = useState(false);

  return (
    <div className="h-full w-full relative overflow-hidden flex">
       {/* 
         Main Content: "The Growth Dashboard" (Youper Inspired)
         Focuses on "Here & Now" + "Growth", not just history.
       */}
       <motion.div 
         className={`flex-1 h-full overflow-y-auto scrollbar-hide p-6 transition-all duration-500 ${showMemoryLane ? 'opacity-50 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
       >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
              <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles className="text-brand-primary" size={24} />
                      Emotional Growth
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">Your journey to resilience.</p>
              </div>
              
              {/* Sidebar Trigger (The "Pickup" Button) */}
              <button 
                onClick={() => setShowMemoryLane(true)}
                className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-brand-primary"
              >
                  <span className="text-xs font-bold uppercase tracking-wider">Memory Lane</span>
                  <MapIcon size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
          </div>

          <div className="space-y-8 max-w-xl mx-auto">
              {/* 1. The "Youper" Check-in Hero */}
              <GlassCard className="!p-8 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border-brand-secondary/30">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-secondary to-brand-primary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity" />
                  
                  <div className="relative z-10">
                      <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <HeartPulse size={24} strokeWidth={2} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">How are you feeling right now?</h2>
                      <p className="text-slate-500 mb-6 leading-relaxed">
                          Just like a physical workout, a quick emotional check-in builds mental strength. Let's process your thoughts together.
                      </p>
                      <Button variant="primary" className="w-full !py-4 shadow-brand-primary/20">
                          Start Check-in <ArrowRight size={18} />
                      </Button>
                  </div>
              </GlassCard>

              {/* 2. Resilience Tracker (Visualizing Growth) */}
              <div>
                  <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                          <Activity size={18} className="text-brand-primary" /> Resilience Score
                      </h3>
                      <span className="text-xs font-bold text-brand-primary bg-brand-light px-2 py-1 rounded-md">+12% this week</span>
                  </div>
                  <div className="h-40 w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={RESILIENCE_DATA}>
                              <defs>
                                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#2A8E9E" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#2A8E9E" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                              <Area 
                                  type="monotone" 
                                  dataKey="score" 
                                  stroke="#2A8E9E" 
                                  strokeWidth={3} 
                                  fill="url(#colorScore)" 
                                  animationDuration={2000}
                              />
                          </AreaChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-4 left-6">
                          <span className="text-3xl font-bold text-slate-800">78</span>
                          <span className="text-xs text-slate-400 font-medium ml-1">/ 100</span>
                      </div>
                  </div>
              </div>

              {/* 3. Personalized Techniques (The "Match" System) */}
              <div>
                  <h3 className="font-bold text-slate-700 mb-4 px-2">Recommended Tools</h3>
                  <div className="grid gap-3">
                      {SUGGESTED_TOOLS.map(tool => (
                          <div 
                            key={tool.id}
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-brand-secondary hover:shadow-md transition-all cursor-pointer group"
                          >
                              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                  {tool.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-1">
                                      <h4 className="font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{tool.title}</h4>
                                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{tool.duration}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                              </div>
                              <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-primary" />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
       </motion.div>

       {/* 
         Sidebar: "Memory Lane" (The Hidden Map)
         Revealed only when requested. Contains the Timeline/Calendar.
       */}
       <AnimatePresence>
           {showMemoryLane && (
               <>
                   {/* Backdrop */}
                   <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       onClick={() => setShowMemoryLane(false)}
                       className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-20"
                   />
                   
                   {/* Sidebar Panel */}
                   <motion.div
                       initial={{ x: '100%' }}
                       animate={{ x: 0 }}
                       exit={{ x: '100%' }}
                       transition={{ type: "spring", stiffness: 300, damping: 30 }}
                       className="absolute top-0 right-0 h-full w-full md:w-[480px] bg-[#F8FAFC] z-30 shadow-2xl flex flex-col"
                   >
                       <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
                           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                               <MapIcon size={20} className="text-brand-primary" /> Memory Lane
                           </h2>
                           <button 
                               onClick={() => setShowMemoryLane(false)}
                               className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                           >
                               <X size={20} />
                           </button>
                       </div>
                       
                       <div className="flex-1 overflow-hidden">
                           <TimelineView data={timelineData} />
                       </div>
                   </motion.div>
               </>
           )}
       </AnimatePresence>
    </div>
  );
};
