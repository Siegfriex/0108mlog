import React, { useState, useMemo } from 'react';
import { TimelineView } from './TimelineView';
import { TimelineEntry, EmotionType } from '../types';
import { Search, History, SlidersHorizontal, SearchX, X } from 'lucide-react';
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
      const query = searchQuery.toLowerCase();
      
      // Match against both English and Korean date formats to support diverse search inputs
      const dateStringEn = entry.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase();
      const dateStringKo = entry.date.toLocaleDateString('ko-KR', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase();
      
      const matchesSearch = 
        entry.summary.toLowerCase().includes(query) ||
        entry.detail.toLowerCase().includes(query) ||
        dateStringEn.includes(query) ||
        dateStringKo.includes(query);
      
      const matchesFilter = filterEmotion === 'ALL' || entry.emotion === filterEmotion;

      return matchesSearch && matchesFilter;
    });
  }, [timelineData, searchQuery, filterEmotion]);

  const hasActiveFilters = searchQuery.length > 0 || filterEmotion !== 'ALL';

  return (
    <div className="h-full flex flex-col w-full max-w-3xl mx-auto px-4 md:px-0 py-4 md:py-6">
      <header className="mb-6 flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-end px-2">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <History size={28} className="text-indigo-500" strokeWidth={1.5} /> Memory Lane
                </h2>
                <p className="text-slate-500 text-sm mt-1 ml-1">Your emotional journey.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setIsSearchOpen(!isSearchOpen);
                        if (!isSearchOpen) setIsFilterOpen(false);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border
                        ${isSearchOpen 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    <Search size={18} />
                </button>
                <button 
                    onClick={() => {
                        setIsFilterOpen(!isFilterOpen);
                        if (!isFilterOpen) setIsSearchOpen(false);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border
                        ${isFilterOpen 
                            ? 'bg-indigo-500 text-white border-indigo-500' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    <SlidersHorizontal size={18} />
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
                    className="overflow-hidden px-1"
                >
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search memories (e.g. 'joy', '월요일')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm shadow-sm transition-all"
                            autoFocus
                        />
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                            >
                                <X size={14} />
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
                    className="overflow-hidden px-1"
                >
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setFilterEmotion('ALL')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border
                                ${filterEmotion === 'ALL' 
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            All
                        </button>
                        {Object.values(EmotionType).map((emotion) => (
                            <button
                                key={emotion}
                                onClick={() => setFilterEmotion(emotion)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize whitespace-nowrap border
                                    ${filterEmotion === emotion 
                                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {emotion}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </header>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 -mx-2 px-2">
         {filteredData.length > 0 ? (
             <TimelineView data={filteredData} />
         ) : hasActiveFilters ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <SearchX size={32} strokeWidth={1.5} className="text-slate-300"/>
                 </div>
                 <p className="text-sm font-medium text-slate-600">No memories found.</p>
                 <button
                    onClick={() => {setSearchQuery(''); setFilterEmotion('ALL');}}
                    className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                 >
                    Clear filters
                 </button>
             </div>
         ) : (
             <TimelineView data={[]} />
         )}
      </div>
    </div>
  );
};