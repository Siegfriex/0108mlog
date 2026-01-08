import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sun, Moon, Clock, ArrowRight, BookX } from 'lucide-react';
import { TimelineEntry, EmotionType } from '../types';

interface TimelineViewProps {
  data: TimelineEntry[];
}

const getEmotionColor = (emotion: EmotionType) => {
  switch (emotion) {
    case EmotionType.JOY: return 'bg-yellow-400 border-yellow-200 shadow-yellow-200';
    case EmotionType.PEACE: return 'bg-sky-400 border-sky-200 shadow-sky-200';
    case EmotionType.ANXIETY: return 'bg-orange-400 border-orange-200 shadow-orange-200';
    case EmotionType.SADNESS: return 'bg-purple-400 border-purple-200 shadow-purple-200';
    case EmotionType.ANGER: return 'bg-red-400 border-red-200 shadow-red-200';
    default: return 'bg-slate-400 border-slate-200';
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
            <div className="w-24 h-24 bg-slate-50/50 backdrop-blur-sm rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <BookX size={40} strokeWidth={1.5} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No journal entries yet</h3>
            <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
                Start by logging your first emotion!
            </p>
        </div>
    );
  }

  return (
    <div className="py-2">
       {/* Vertical Line Container */}
       <div className="relative border-l-2 border-slate-100 ml-3 md:ml-4 space-y-6 pb-12">
          {data.map((entry, index) => (
            <motion.div 
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-6 md:pl-8 group"
            >
                {/* Node Dot */}
                <div className={`
                    absolute -left-[7px] top-6 w-4 h-4 rounded-full border-[3px] border-white shadow-md z-10 transition-transform duration-300 group-hover:scale-125
                    ${getEmotionColor(entry.emotion)}
                `} />

                {/* Content Card */}
                <div 
                    className={`
                        relative overflow-hidden rounded-[24px] p-5 cursor-pointer transition-all duration-300
                        bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5
                        ${expandedId === entry.id ? 'ring-2 ring-indigo-50 shadow-md' : ''}
                    `}
                    onClick={() => toggleExpand(entry.id)}
                >
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                            {/* Icon Box */}
                            <div className={`
                                w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5
                                ${entry.type === 'day' 
                                    ? 'bg-gradient-to-br from-amber-300 to-orange-400' 
                                    : 'bg-gradient-to-br from-indigo-400 to-purple-500'}
                            `}>
                                {entry.type === 'day' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                                        ${entry.type === 'day' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}
                                    `}>
                                        {entry.emotion}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <Clock size={10} />
                                        {entry.date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight truncate pr-2">{entry.summary}</h4>
                            </div>
                        </div>
                        
                        <div className={`
                            p-1.5 rounded-full bg-slate-50 text-slate-400 transition-transform duration-300 shrink-0
                            ${expandedId === entry.id ? 'rotate-180 bg-slate-100 text-slate-600' : ''}
                        `}>
                            <ChevronDown size={16} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedId === entry.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 pt-4 border-t border-slate-50 text-sm text-slate-600 leading-relaxed font-medium">
                                    {entry.detail}
                                    <div className="mt-4 flex justify-end">
                                        <button className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-full">
                                            Read Full Entry <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
          ))}
       </div>
    </div>
  );
};