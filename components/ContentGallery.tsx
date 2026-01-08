import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Music, Quote, X, RefreshCw, Heart, MessageSquareQuote, Link2, Lightbulb } from 'lucide-react';
import { GlassCard, Button } from './UI';
import { VoicePlayer } from './VoicePlayer';
import { ContentData, CoachPersona } from '../types';
import { generateHealingContent } from '../services/geminiService';

interface ContentGalleryProps {
  persona: CoachPersona;
}

// Initial Mock Content
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
  }
];

const MOODS = [
  '지친 하루', '막막한 미래', '작은 기쁨', '휴식이 필요해', '불안한 마음', 
  '사랑받고 싶어', '영감이 필요해', '잠이 오지 않아', '누군가 그리워', 
  '자신감이 부족해', '축하받고 싶어', '혼자 있고 싶어'
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
      setSelectedId(newContent.id); // Auto-open newly generated content
    }
    setIsGenerating(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'poem': return <BookOpen size={20} />;
      case 'meditation': return <Music size={20} />;
      case 'quote': return <Quote size={20} />;
      case 'insight': return <Lightbulb size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'poem': return 'from-indigo-400 to-purple-400';
      case 'meditation': return 'from-teal-400 to-emerald-400';
      case 'quote': return 'from-amber-400 to-orange-400';
      case 'insight': return 'from-blue-400 to-cyan-400';
      default: return 'from-slate-400 to-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-4 py-6">
      <header className="mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-purple-500" /> Art Gallery
          </h2>
          <p className="text-slate-500 text-sm">당신의 마음을 위한 맞춤형 처방전입니다.</p>
        </div>
      </header>

      {/* Mood Selector & Generate */}
      <GlassCard className="!p-4 mb-6 !rounded-2xl">
          <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Heart size={12} /> 현재 기분은 어떤가요?
              </span>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-hide py-1">
                  {MOODS.map(mood => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                            ${selectedMood === mood 
                                ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300' 
                                : 'bg-white/50 text-slate-600 hover:bg-white border border-transparent'}
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
                className="w-full mt-2 text-sm"
              >
                <RefreshCw size={16} className="mr-2" /> 
                {selectedMood} 처방 받기
              </Button>
          </div>
      </GlassCard>

      {/* Content Scroller */}
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contents.map((content) => (
            <motion.div
              key={content.id}
              layoutId={`card-${content.id}`}
              onClick={() => setSelectedId(content.id)}
              className="cursor-pointer group"
            >
              <GlassCard className="h-64 flex flex-col justify-between hover:bg-white/70">
                <div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${getColor(content.type)} mb-4 shadow-lg`}>
                    {getIcon(content.type)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{content.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                    {content.body}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    {content.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-white/50 rounded-full text-slate-600">#{tag}</span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{content.author}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            {(() => {
              const selectedContent = contents.find(c => c.id === selectedId);
              if (!selectedContent) return null;
              
              return (
                <motion.div
                  layoutId={`card-${selectedId}`}
                  className="w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-2xl overflow-hidden relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`h-32 bg-gradient-to-r ${getColor(selectedContent.type)} opacity-80`} />
                  
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="p-8 -mt-10 relative">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-700 text-2xl">
                          {getIcon(selectedContent.type)}
                        </div>
                    </div>
                    
                    <div className="text-center mb-6">
                      <span className="uppercase tracking-widest text-xs font-bold text-slate-400 mb-2 block">
                        {selectedContent.type}
                      </span>
                      <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">
                        {selectedContent.title}
                      </h2>
                      <div className="flex justify-center mt-4">
                        <VoicePlayer text={selectedContent.body} />
                      </div>
                    </div>

                    <div className="prose prose-lg text-slate-600 text-center mx-auto mb-8 leading-loose whitespace-pre-line font-medium max-h-[30vh] overflow-y-auto scrollbar-hide">
                      {selectedContent.body}
                    </div>

                    {/* AI Commentary Section */}
                    {selectedContent.commentary && (
                      <div className="mb-8 p-4 bg-indigo-50 rounded-2xl flex gap-3 items-start">
                         <MessageSquareQuote className="text-indigo-400 shrink-0 mt-1" size={20} />
                         <div>
                            <p className="text-xs text-indigo-400 font-bold mb-1">{selectedContent.author}'s Note</p>
                            <p className="text-sm text-indigo-800 italic">{selectedContent.commentary}</p>
                         </div>
                      </div>
                    )}

                    {/* Grounding Links Section */}
                    {selectedContent.groundingLinks && selectedContent.groundingLinks.length > 0 && (
                      <div className="mb-8 border-t border-slate-100 pt-6">
                          <h4 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2 justify-center">
                              <Link2 size={14} /> Sources & Inspirations
                          </h4>
                          <div className="flex flex-col gap-2">
                              {selectedContent.groundingLinks.map((link, idx) => (
                                  <a 
                                    key={idx} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block p-3 bg-white/50 rounded-xl hover:bg-white transition-colors text-sm text-slate-600 truncate text-center border border-slate-100 hover:border-slate-300"
                                  >
                                      {link.title}
                                  </a>
                              ))}
                          </div>
                      </div>
                    )}

                    <div className="flex justify-center gap-2 mb-8 flex-wrap">
                        {selectedContent.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-500">#{tag}</span>
                        ))}
                    </div>

                    <div className="text-center border-t border-slate-100 pt-6">
                      <p className="text-sm text-slate-400">Curated by</p>
                      <p className="font-semibold text-slate-700">{selectedContent.author}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};