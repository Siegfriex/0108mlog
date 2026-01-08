
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, MessageCircle } from 'lucide-react';
import { TimelineEntry, EmotionType } from '../types';
import { EmotionCalendar } from './EmotionCalendar';
import { GlassCard, Button } from './UI';

interface TimelineViewProps {
  data: TimelineEntry[];
}

// Helper to get nuanced tags based on emotion if none exist
const getMockTags = (emotion: EmotionType) => {
    switch(emotion) {
        case EmotionType.JOY: return ['#설레는', '#뿌듯한', '#기대되는'];
        case EmotionType.PEACE: return ['#잔잔한', '#여유로운', '#평범한'];
        case EmotionType.ANXIETY: return ['#걱정되는', '#긴장된', '#두려운'];
        case EmotionType.SADNESS: return ['#우울한', '#지친', '#외로운'];
        case EmotionType.ANGER: return ['#답답한', '#짜증나는', '#화난'];
        default: return ['#일상', '#기록'];
    }
};

const EmotionBlobLarge = ({ type }: { type: EmotionType }) => {
     const styles = {
        [EmotionType.JOY]: 'bg-[#FFD954] text-amber-900',
        [EmotionType.PEACE]: 'bg-[#A3E635] text-lime-900',
        [EmotionType.ANXIETY]: 'bg-[#FB923C] text-orange-900',
        [EmotionType.SADNESS]: 'bg-[#818CF8] text-indigo-900',
        [EmotionType.ANGER]: 'bg-[#F87171] text-red-900',
    };
    const faces = {
        [EmotionType.JOY]: '◡‿◡',
        [EmotionType.PEACE]: '•ᴗ•',
        [EmotionType.ANXIETY]: '⊙﹏⊙',
        [EmotionType.SADNESS]: 'ㅠ_ㅠ',
        [EmotionType.ANGER]: '`Д´',
    };

    return (
        <div className={`w-14 h-14 ${styles[type]} rounded-[35%] flex items-center justify-center text-xl font-mono shadow-md`}>
            {faces[type]}
        </div>
    );
}

export const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);

  useEffect(() => {
    // Find entry for selected date
    const entry = data.find(e => {
        const d = new Date(e.date);
        return d.getDate() === selectedDate.getDate() && 
               d.getMonth() === selectedDate.getMonth() && 
               d.getFullYear() === selectedDate.getFullYear();
    });
    setSelectedEntry(entry || null);
  }, [selectedDate, data]);

  return (
    <div className="flex flex-col h-full w-full relative bg-white md:bg-transparent rounded-t-[32px] md:rounded-none overflow-hidden">
        {/* Main Calendar Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pt-6 pb-48">
             <EmotionCalendar 
                data={data} 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate} 
             />
             
             {/* Empty State / Prompt */}
             {!selectedEntry && (
                 <div className="mt-12 text-center">
                     <p className="text-slate-400 text-sm mb-4">아직 기록되지 않은 날이에요.</p>
                     <Button variant="secondary" className="mx-auto rounded-full !px-6 !py-3 text-xs">
                         오늘의 감정 기록하기
                     </Button>
                 </div>
             )}
        </div>

        {/* Bottom Detail Card (Fixed/Sticky) */}
        <AnimatePresence mode="wait">
            {selectedEntry && (
                <motion.div
                    key={selectedEntry.id}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12 z-10"
                >
                    <div className="bg-white rounded-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border border-slate-100 p-6">
                        {/* Date Header */}
                        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <span>{selectedEntry.date.getDate()}일</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>
                                {selectedEntry.date.toLocaleDateString('ko-KR', { weekday: 'long' })}
                            </span>
                        </div>

                        {/* Content Row */}
                        <div className="flex items-start gap-5 mb-6">
                            {/* Avatar */}
                            <div className="shrink-0 pt-1">
                                <EmotionBlobLarge type={selectedEntry.emotion} />
                            </div>
                            
                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
                                    {selectedEntry.summary || "감정 기록"}
                                </h3>
                                
                                {/* Nuance Tags */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(selectedEntry.nuanceTags || getMockTags(selectedEntry.emotion)).map(tag => (
                                        <span key={tag} className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                    {selectedEntry.detail.split('\n')[0]}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                             <button className="flex-1 py-3.5 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                                 <MessageCircle size={16} />
                                 AI 답장 보기
                             </button>
                             <button className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                                 리스트 보기
                             </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};
