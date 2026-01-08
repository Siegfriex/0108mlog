import React, { useState, useMemo } from 'react';
import { TimelineView } from './TimelineView';
import { TimelineEntry, EmotionType } from '../types';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalViewProps {
  timelineData: TimelineEntry[];
}

export const JournalView: React.FC<JournalViewProps> = ({ timelineData }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmotion, setFilterEmotion] = useState<EmotionType | 'ALL'>('ALL');

  const filteredData = useMemo(() => {
    return timelineData.filter(entry => {
      // Search Logic
      const matchesSearch = 
        entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.detail.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter Logic
      const matchesFilter = filterEmotion === 'ALL' || entry.emotion === filterEmotion;

      return matchesSearch && matchesFilter;
    });
  }, [timelineData, searchQuery, filterEmotion]);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-4 py-6">
      <header className="mb-4 flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">📖</span> Memory Lane
                </h2>
                <p className="text-slate-500 text-sm">당신의 감정 여정을 되돌아보세요.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setIsSearchOpen(!isSearchOpen);
                        setIsFilterOpen(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-peace-100 text-peace-600' : 'bg-white/50 hover:bg-white text-slate-600'}`}
                >
                    <Search size={20} />
                </button>
                <button 
                    onClick={() => {
                        setIsFilterOpen(!isFilterOpen);
                        setIsSearchOpen(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${isFilterOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-white/50 hover:bg-white text-slate-600'}`}
                >
                    <Filter size={20} />
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="기억 검색 (키워드 입력)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-peace-300 transition-all"
                            autoFocus
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Filter Options */}
        <AnimatePresence>
            {isFilterOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setFilterEmotion('ALL')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap
                                ${filterEmotion === 'ALL' ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                            All
                        </button>
                        {Object.values(EmotionType).map((emotion) => (
                            <button
                                key={emotion}
                                onClick={() => setFilterEmotion(emotion)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors capitalize whitespace-nowrap
                                    ${filterEmotion === emotion 
                                        ? 'bg-indigo-500 text-white shadow-md' 
                                        : 'bg-white border border-slate-200 text-slate-600'}`}
                            >
                                {emotion}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </header>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
         <TimelineView data={filteredData} />
      </div>
    </div>
  );
};