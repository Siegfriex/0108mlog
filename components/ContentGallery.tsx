import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, Quote, X, RefreshCw, MessageSquareQuote, Link2, Lightbulb, Search, Globe, ExternalLink, Palette, Feather, ArrowUpRight } from 'lucide-react';
import { Button, LoadingSpinner } from './UI';
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

export const ContentGallery: React.FC<ContentGalleryProps> = ({ persona }) => {
  const [contents, setContents] = useState<(ContentData & { commentary?: string })[]>(MOCK_CONTENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('지친 하루');

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newContent = await generateHealingContent(selectedMood, persona);
    if (newContent) {
      setContents(prev => [newContent, ...prev]);
      setSelectedId(newContent.id);
    }
    setIsGenerating(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'poem': return <Feather size={24} strokeWidth={1.5} />;
      case 'meditation': return <Music size={24} strokeWidth={1.5} />;
      case 'quote': return <Quote size={24} strokeWidth={1.5} />;
      case 'insight': return <Lightbulb size={24} strokeWidth={1.5} />;
      default: return <Sparkles size={24} strokeWidth={1.5} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'poem': return 'from-rose-400 to-orange-400';
      case 'meditation': return 'from-teal-400 to-emerald-500';
      case 'quote': return 'from-indigo-400 to-blue-500';
      case 'insight': return 'from-violet-400 to-purple-500';
      default: return 'from-slate-400 to-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col max-w-full mx-auto py-6 relative">
      <header className="px-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Palette size={28} className="text-purple-500" strokeWidth={1.5} /> Art Gallery
          </h2>
          <p className="text-slate-500 text-sm mt-1 ml-1">Curated healing content for you.</p>
        </div>
      </header>

      {/* Generator Section */}
      <div className="px-6 mb-8">
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 relative overflow-hidden group shadow-lg transition-all hover:bg-white/80">
          <div className="absolute top-0 right-0 p-3 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500">
             <Globe size={180} />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1.5 mb-3 uppercase tracking-widest">
                <Search size={12} /> Google Grounded
            </span>
            <h3 className="text-lg font-bold text-slate-800 mb-3">What do you need right now?</h3>
            <div className="flex flex-wrap gap-2 mb-5">
                {MOODS.map(mood => (
                    <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border
                        ${selectedMood === mood 
                            ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                            : 'bg-white/80 border-slate-200 text-slate-500 hover:border-slate-300'}
                    `}
                    >
                        {mood}
                    </button>
                ))}
            </div>
            <Button 
                variant="primary" 
                onClick={handleGenerate} 
                isLoading={isGenerating}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white border-none shadow-lg shadow-slate-200 rounded-xl"
            >
                {isGenerating ? `Curating with ${persona.name}...` : <><RefreshCw size={16} /> Generate</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-24">
        {contents.map((content) => (
            <motion.div
              key={content.id}
              layoutId={`card-container-${content.id}`}
              onClick={() => setSelectedId(content.id)}
              whileHover={{ scale: 0.98, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square relative cursor-pointer group
                bg-white/80 backdrop-blur-md rounded-[32px] overflow-hidden
                shadow-glass border border-white/50
                flex flex-col
              `}
            >
                {/* Background Gradient */}
                <motion.div 
                    layoutId={`card-bg-${content.id}`}
                    className={`absolute inset-0 bg-gradient-to-br ${getColor(content.type)} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} 
                />
                
                <div className="relative z-10 flex-1 p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className={`
                            w-10 h-10 rounded-2xl flex items-center justify-center 
                            bg-white/50 backdrop-blur-sm text-slate-700 shadow-sm
                            border border-white/40
                        `}>
                            {getIcon(content.type)}
                        </div>
                        <ArrowUpRight size={20} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>

                    <div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                            {content.type}
                         </span>
                         <motion.h3 
                            layoutId={`card-title-${content.id}`}
                            className="text-lg font-serif font-bold text-slate-800 leading-tight line-clamp-2"
                         >
                            {content.title}
                         </motion.h3>
                    </div>
                </div>
            </motion.div>
        ))}
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
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                onClick={() => setSelectedId(null)}
            />

            {/* Expanded Card */}
            {(() => {
              const selectedContent = contents.find(c => c.id === selectedId);
              if (!selectedContent) return null;
              
              return (
                <motion.div
                  layoutId={`card-container-${selectedId}`}
                  className="w-full h-full md:w-[600px] md:h-[85vh] bg-[#FDFDFD] md:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                   {/* Header Image Area */}
                   <motion.div 
                        layoutId={`card-bg-${selectedId}`}
                        className={`h-48 md:h-64 shrink-0 bg-gradient-to-br ${getColor(selectedContent.type)} relative p-8 flex flex-col justify-between`}
                   >
                       <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                       <div className="relative z-10 flex justify-between items-start">
                           <button 
                                onClick={() => setSelectedId(null)}
                                className="w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/30 transition-colors"
                           >
                               <X size={20} />
                           </button>
                           <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                                {selectedContent.type}
                           </span>
                       </div>
                       <div className="relative z-10 text-white">
                            <motion.h2 
                                layoutId={`card-title-${selectedId}`}
                                className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2"
                            >
                                {selectedContent.title}
                            </motion.h2>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                By {selectedContent.author} <span className="w-1 h-1 rounded-full bg-white/60" /> {selectedContent.tags[0]}
                            </p>
                       </div>
                   </motion.div>

                   {/* Scrollable Content */}
                   <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 space-y-8 scrollbar-hide bg-white">
                        <div className="flex justify-center -mt-4 mb-4">
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
                   
                   {/* Bottom Padding for scroll */}
                   <div className="h-6 shrink-0 bg-white" />
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};