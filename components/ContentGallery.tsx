
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Music, Quote, X, RefreshCw, MessageSquareQuote, 
  Link2, Lightbulb, Search, Globe, ExternalLink, Palette, 
  Feather, ArrowUpRight, Infinity as InfinityIcon, Activity,
  TrendingUp, Calendar
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip } from 'recharts';
import { Button } from './UI';
import { VoicePlayer } from './VoicePlayer';
import { ContentData, CoachPersona } from '../types';
import { generateHealingContent } from '../services/geminiService';

interface ContentGalleryProps {
  persona: CoachPersona;
}

const MOCK_CONTENTS: (ContentData & { commentary?: string })[] = [
  {
    id: '1',
    type: 'poem',
    title: '새벽의 위로',
    body: '어둠이 깊을수록\n별은 더 선명히 빛납니다.\n당신의 마음속 그림자도\n언젠가 빛날 별의 재료임을\n잊지 마세요.',
    author: '루나',
    tags: ['위로', '새벽', '희망'],
    createdAt: new Date(),
    commentary: '힘든 순간일수록 당신의 빛은 더 선명해질 거예요.'
  },
  {
    id: '2',
    type: 'meditation',
    title: '3분 호흡 명상',
    body: '편안한 자세로 앉아 눈을 감으세요.\n코로 깊게 숨을 들이마시며 4를 셉니다.\n잠시 숨을 멈추고 2를 셉니다.\n입으로 천천히 내뱉으며 6을 셉니다.\n지금 이 순간, 당신의 호흡에만 집중하세요.',
    author: '루나',
    tags: ['명상', '호흡', '안정'],
    createdAt: new Date(),
    commentary: '복잡한 생각은 잠시 내려두고 호흡에만 집중해보세요.'
  },
  {
    id: '3',
    type: 'quote',
    title: '오늘의 영감',
    body: '"당신이 할 수 있다고 믿든,\n할 수 없다고 믿든,\n당신은 옳다."\n- 헨리 포드',
    author: 'Henry Ford',
    tags: ['동기부여', '믿음', '시작'],
    createdAt: new Date(),
    commentary: '스스로를 믿는 힘이 가장 강력한 시작입니다.'
  },
  {
    id: '4',
    type: 'insight',
    title: '작은 성취의 힘',
    body: '심리학 연구에 따르면,\n아주 작은 목표를 달성하는 것만으로도\n우리 뇌는 도파민을 분비합니다.\n오늘 침대 정리를 하셨나요?\n그것만으로도 이미 성공적인 시작입니다.',
    author: 'Psych Today',
    tags: ['심리학', '습관', '뇌과학'],
    createdAt: new Date(),
    commentary: '거창한 목표보다 작은 실천이 우리를 바꿉니다.'
  }
];

const MOODS = [
  '지친 하루', '막막한 미래', '작은 기쁨', '휴식이 필요해', '불안한 마음', 
  '사랑받고 싶어', '영감이 필요해', '잠이 오지 않아', '누군가 그리워'
];

// Mock Data for the Insight Chart
const TREND_DATA = [
  { day: 'M', score: 3 },
  { day: 'T', score: 4 },
  { day: 'W', score: 3 },
  { day: 'T', score: 6 },
  { day: 'F', score: 5 },
  { day: 'S', score: 8 },
  { day: 'S', score: 7 },
];

export const ContentGallery: React.FC<ContentGalleryProps> = ({ persona }) => {
  const [contents, setContents] = useState<(ContentData & { commentary?: string })[]>(MOCK_CONTENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('지친 하루');
  
  // Infinite Scroll Refs
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchContent = async (append: boolean = false) => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    const newContent = await generateHealingContent(selectedMood, persona);
    
    if (newContent) {
      setContents(prev => append ? [...prev, newContent] : [newContent, ...prev]);
      if (!append) setSelectedId(newContent.id);
    }
    setIsGenerating(false);
  };

  const handleManualGenerate = () => fetchContent(false);

  const handleLoadMore = useCallback(() => {
      fetchContent(true);
  }, [isGenerating, selectedMood, persona]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isGenerating) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [handleLoadMore, isGenerating]);


  const getIcon = (type: string) => {
    switch (type) {
      case 'poem': return <Feather size={20} strokeWidth={2} />;
      case 'meditation': return <Music size={20} strokeWidth={2} />;
      case 'quote': return <Quote size={20} strokeWidth={2} />;
      case 'insight': return <Lightbulb size={20} strokeWidth={2} />;
      default: return <Sparkles size={20} strokeWidth={2} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'poem': return 'from-orange-100 to-rose-100 text-rose-600';
      case 'meditation': return 'from-teal-100 to-emerald-100 text-teal-600';
      case 'quote': return 'from-blue-100 to-indigo-100 text-indigo-600';
      case 'insight': return 'from-violet-100 to-purple-100 text-purple-600';
      default: return 'from-slate-100 to-gray-200 text-slate-600';
    }
  };

  // Get current month name
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="h-full flex flex-col max-w-full mx-auto relative bg-[#FDFDFD]" ref={scrollContainerRef}>
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4">
        
        {/* 1. Header & Insight Section (MindDoc Style) */}
        <div className="mb-10 relative">
            <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    Insight
                 </h2>
                 <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <Calendar size={14} /> {monthName} 2024
                 </span>
            </div>

            {/* Main Insight Card with Chart */}
            <div className="relative bg-[#FFFBF7] rounded-[40px] p-6 shadow-xl shadow-orange-100/50 border border-orange-50 overflow-visible mb-8">
                 {/* Floating Bubble */}
                 <motion.div 
                    initial={{ scale: 0, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF8E6E] text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-orange-300/40 z-20 flex items-center gap-2"
                 >
                    <span className="text-xl">🙂</span>
                    <span className="text-sm font-bold">Your mood is improving</span>
                    {/* Speech Bubble Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FF8E6E] rotate-45" />
                 </motion.div>

                 <div className="h-48 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TREND_DATA}>
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#818CF8" />
                                    <stop offset="100%" stopColor="#F472B6" />
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }} 
                                dy={10}
                            />
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="url(#lineGradient)" 
                                strokeWidth={4} 
                                dot={{ r: 0 }} 
                                activeDot={{ r: 6, fill: '#F472B6', stroke: '#fff', strokeWidth: 2 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="mt-4 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Weekly Pattern</p>
                        <h3 className="text-slate-700 font-bold text-lg">Stable Flow</h3>
                    </div>
                    <div className="flex gap-4 text-center">
                        <div>
                            <span className="block text-xl font-bold text-slate-800">21</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Answers</span>
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-slate-800">5</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Notes</span>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Google Grounding Generator (Redesigned as 'Explore' Card) */}
            <div className="bg-white rounded-[32px] p-1 shadow-lg border border-slate-100 flex items-center gap-1 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 p-4 flex-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
                         <Globe size={12} /> Grounded AI
                    </span>
                    <h4 className="font-bold text-slate-700 text-sm">Discover Healing Content</h4>
                </div>
                <div className="relative z-10 pr-2">
                     <Button 
                        variant="primary" 
                        onClick={handleManualGenerate} 
                        isLoading={isGenerating}
                        className="!rounded-2xl !py-3 !px-5 bg-slate-900 text-white shadow-md text-xs"
                    >
                        {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                        <span className="ml-2">Generate</span>
                    </Button>
                </div>
            </div>
            
            {/* Quick Mood Selector for Generator */}
            <div className="flex overflow-x-auto gap-2 mt-4 pb-2 scrollbar-hide">
                 {MOODS.map(mood => (
                    <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`
                            whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300
                            ${selectedMood === mood 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}
                        `}
                    >
                        {mood}
                    </button>
                 ))}
            </div>
        </div>

        {/* 2. Content Feed (Asymmetrical Grid) */}
        <div>
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-slate-800">For You</h3>
                <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">See All</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pb-24">
                {contents.map((content, idx) => {
                    // Feature the first item visually
                    const isFeatured = idx === 0;
                    return (
                        <GalleryItem 
                            key={content.id} 
                            content={content} 
                            getColor={getColor} 
                            getIcon={getIcon} 
                            isFeatured={isFeatured}
                            onClick={() => setSelectedId(content.id)} 
                        />
                    );
                })}

                {/* Loader */}
                <div ref={loaderRef} className="col-span-2 flex justify-center py-8">
                     {isGenerating ? (
                         <div className="flex flex-col items-center gap-2">
                             <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                         </div>
                     ) : (
                         <div className="flex flex-col items-center gap-1 opacity-40">
                             <InfinityIcon size={16} className="text-slate-400" />
                         </div>
                     )}
                </div>
            </div>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                onClick={() => setSelectedId(null)}
            />

            {/* Expanded Card */}
            {(() => {
              const selectedContent = contents.find(c => c.id === selectedId);
              if (!selectedContent) return null;
              
              const colorClasses = getColor(selectedContent.type); // e.g., 'from-orange-100 to-rose-100 text-rose-600'
              // Extract bg-gradient part approx for the header
              const bgGradient = colorClasses.split(' ').slice(0, 2).join(' '); // 'from-orange-100 to-rose-100'

              return (
                <motion.div
                  layoutId={`card-container-${selectedId}`}
                  className="w-full h-full md:w-[600px] md:h-[85vh] bg-white md:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                   {/* Header Image Area */}
                   <motion.div 
                        layoutId={`card-bg-${selectedId}`}
                        className={`h-56 shrink-0 bg-gradient-to-br ${bgGradient} relative p-8 flex flex-col justify-between`}
                   >
                       <div className="absolute inset-0 bg-white/30 mix-blend-overlay" />
                       <div className="relative z-10 flex justify-between items-start">
                           <button 
                                onClick={() => setSelectedId(null)}
                                className="w-10 h-10 rounded-full bg-white/60 text-slate-800 flex items-center justify-center backdrop-blur-md hover:bg-white transition-colors"
                           >
                               <X size={20} />
                           </button>
                           <span className="px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-slate-800 text-[10px] font-bold uppercase tracking-widest border border-white/40">
                                {selectedContent.type}
                           </span>
                       </div>
                       <div className="relative z-10">
                            <motion.h2 
                                layoutId={`card-title-${selectedId}`}
                                className="text-3xl font-serif font-bold text-slate-800 leading-tight mb-2"
                            >
                                {selectedContent.title}
                            </motion.h2>
                            <p className="text-slate-600/80 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                By {selectedContent.author} <span className="w-1 h-1 rounded-full bg-slate-400" /> {selectedContent.tags[0]}
                            </p>
                       </div>
                   </motion.div>

                   {/* Scrollable Content */}
                   <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 space-y-8 scrollbar-hide bg-white relative">
                        <div className="flex justify-center -mt-14 mb-4 relative z-20">
                             <VoicePlayer text={selectedContent.body} />
                        </div>

                        <div className="prose prose-lg text-slate-600 leading-loose whitespace-pre-line font-medium text-center mx-auto">
                            {selectedContent.body}
                        </div>

                        {selectedContent.commentary && (
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                                    <MessageSquareQuote size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1">Curator's Note</h4>
                                    <p className="text-sm text-slate-600 italic leading-relaxed">{selectedContent.commentary}</p>
                                </div>
                            </div>
                        )}

                        {selectedContent.groundingLinks && selectedContent.groundingLinks.length > 0 && (
                            <div className="border-t border-slate-100 pt-8">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                                    <Globe size={14} /> Sources
                                </h4>
                                <div className="space-y-3">
                                    {selectedContent.groundingLinks.map((link, idx) => (
                                        <a 
                                            key={idx} 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                                <Link2 size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{link.title}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{link.url}</p>
                                            </div>
                                            <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                   </div>
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for individual items (MindDoc Card Style)
const GalleryItem: React.FC<{ 
    content: ContentData; 
    getColor: (t: string) => string; 
    getIcon: (t: string) => React.ReactNode; 
    onClick: () => void; 
    isFeatured?: boolean;
}> = ({ content, getColor, getIcon, onClick, isFeatured }) => {
    const colorClasses = getColor(content.type); // "from-x to-y text-z"
    // We need to parse this string to apply different classes to bg and text
    // Simple heuristic: Background is gradient, Text is text color class
    const bgGradient = colorClasses.split(' ').slice(0, 2).join(' '); // 'from-orange-100 to-rose-100'
    const textColor = colorClasses.split(' ').pop(); // 'text-rose-600'

    return (
        <motion.div
            layoutId={`card-container-${content.id}`}
            onClick={onClick}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                relative cursor-pointer group overflow-hidden
                bg-white rounded-[32px] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)]
                border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300
                flex flex-col justify-between
                ${isFeatured ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-[4/5]'}
            `}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} opacity-50 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`} />
            
            <div className="p-5 flex flex-col justify-between h-full relative z-10">
                <div className="flex justify-between items-start">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center 
                        bg-slate-50 ${textColor}
                    `}>
                        {getIcon(content.type)}
                    </div>
                </div>

                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                        {content.type}
                    </span>
                    <motion.h3 
                        layoutId={`card-title-${content.id}`}
                        className={`font-serif font-bold text-slate-800 leading-tight ${isFeatured ? 'text-2xl max-w-[80%]' : 'text-lg line-clamp-3'}`}
                    >
                        {content.title}
                    </motion.h3>
                    
                    {isFeatured && (
                         <p className="text-sm text-slate-500 mt-2 line-clamp-2 max-w-[90%]">
                             {content.commentary || content.body.slice(0, 50)}
                         </p>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <ArrowUpRight size={12} /> Open
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
