import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sun, Moon, Calendar, Archive } from 'lucide-react';
import { TimelineEntry, EmotionType } from '../types';
import { GlassCard } from './UI';

interface TimelineViewProps {
  data: TimelineEntry[];
}

const getEmotionColor = (emotion: EmotionType) => {
  switch (emotion) {
    case EmotionType.JOY: return 'bg-joy-400 border-joy-600';
    case EmotionType.PEACE: return 'bg-peace-400 border-peace-600';
    case EmotionType.ANXIETY: return 'bg-anxiety-400 border-anxiety-600';
    case EmotionType.SADNESS: return 'bg-sadness-400 border-sadness-600';
    case EmotionType.ANGER: return 'bg-anger-400 border-anger-600';
    default: return 'bg-slate-400';
  }
};

export const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 p-8 text-center">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/60">
                <Archive size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">No journal entries yet</h3>
            <p className="text-slate-500 max-w-xs leading-relaxed">
                Start by logging your first emotion!
            </p>
        </div>
    );
  }

  return (
    <div className="py-4 pl-4 pr-2">
       {/* Vertical Line */}
       <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-8 pb-12">
          {data.map((entry, index) => (
            <motion.div 
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 md:pl-12"
            >
                {/* Node Dot */}
                <div className={`
                    absolute -left-[9px] top-4 w-5 h-5 rounded-full border-2 border-white shadow-md z-10
                    ${getEmotionColor(entry.emotion)}
                `} />

                {/* Date Label (Desktop: Left side, Mobile: Top of card) */}
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Calendar size={12} />
                    {entry.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
                </div>

                {/* Content Card */}
                <GlassCard 
                    className="!p-5 cursor-pointer hover:bg-white/70 transition-colors"
                    onClick={() => toggleExpand(entry.id)}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                            <div className={`
                                p-2 rounded-xl text-white shadow-sm shrink-0
                                ${entry.type === 'day' ? 'bg-amber-400' : 'bg-indigo-500'}
                            `}>
                                {entry.type === 'day' ? <Sun size={18} /> : <Moon size={18} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">{entry.summary}</h4>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 mt-1 inline-block uppercase tracking-wider`}>
                                    {entry.emotion}
                                </span>
                            </div>
                        </div>
                        <button className="text-slate-400">
                            {expandedId === entry.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    <AnimatePresence>
                        {expandedId === entry.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {entry.detail}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassCard>
            </motion.div>
          ))}
       </div>
    </div>
  );
};