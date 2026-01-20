
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Shield, MessageSquare, ChevronRight, ArrowLeft, UserCog, Heart, Flower2, Sparkles, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// UI 컴포넌트 import 경로: 새로운 구조로 변경
import { GlassCard } from '../src/components/ui';
import { PersonaEditor } from './PersonaEditor';
// 대화 관리 컴포넌트 import: FEAT-017
import { ConversationManager } from '../src/components/profile/ConversationManager';
import { CoachPersona, TimelineEntry } from '../types';
import { useAppContext } from '../src/contexts';
import { useGamification } from '../src/hooks/useGamification';

interface ProfileViewProps {
  persona: CoachPersona;
  onUpdatePersona: (persona: CoachPersona) => void;
  conversations?: TimelineEntry[]; // 대화 목록 (FEAT-017)
  onDeleteConversation?: (id: string) => void;
  onDeleteAllConversations?: () => void;
}

type ProfileSubView = 'main' | 'persona' | 'settings' | 'privacy' | 'conversations';

export const ProfileView: React.FC<ProfileViewProps> = ({
  persona,
  onUpdatePersona,
  conversations = [],
  onDeleteConversation,
  onDeleteAllConversations,
}) => {
  const navigate = useNavigate();
  const { mode } = useAppContext();
  const [view, setView] = useState<ProfileSubView>('main');
  const { xp, level, blossomCount, xpProgress, loading: gamificationLoading } = useGamification();

  const menuItems = [
    { id: 'persona', label: 'AI 페르소나 설정', icon: <UserCog size={20} />, description: 'AI 동반자 커스터마이징' },
    { id: 'settings', label: '앱 설정', icon: <Settings size={20} />, description: '알림, 테마' },
    { id: 'privacy', label: '개인정보 및 데이터', icon: <Shield size={20} />, description: '데이터 관리 및 내보내기' },
    { id: 'conversations', label: '대화 관리', icon: <MessageSquare size={20} />, description: '기록 보기, 삭제' },
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
                    <h3 className="font-bold text-slate-800">프로필로 돌아가기</h3>
                </div>
                <PersonaEditor persona={persona} onUpdate={onUpdatePersona} />
            </div>
        );
      case 'settings':
        return <PlaceholderView title="앱 설정" onBack={() => setView('main')} />;
      case 'privacy':
        return <PlaceholderView title="개인정보 및 데이터" onBack={() => setView('main')} />;
      case 'conversations':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-4 pt-2">
              <button onClick={() => setView('main')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <h3 className="font-bold text-slate-800">Back to Profile</h3>
            </div>
            <ConversationManager
              conversations={conversations}
              onDeleteConversation={onDeleteConversation}
              onDeleteAll={onDeleteAllConversations}
            />
          </div>
        );
      default:
        return (
          <div className="px-4 py-6 max-w-xl mx-auto w-full h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <header className="mb-8 text-center pt-4">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-brand-primary/30">
                    <User size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>
                <div className="flex justify-center gap-2 mt-3">
                    <span
                      data-testid="current-level"
                      className="px-3 py-1 bg-brand-light text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider border border-brand-secondary"
                    >
                      {gamificationLoading ? '...' : `Level ${level}`}
                    </span>
                    <span
                      data-testid="current-xp"
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-100"
                    >
                      {gamificationLoading ? '...' : `${xp.toLocaleString()} XP`}
                    </span>
                </div>
                {/* XP 진행바 */}
                {!gamificationLoading && (
                  <div className="mt-4 px-8">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress.percent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      다음 레벨까지 {xpProgress.required - xpProgress.current} XP
                    </p>
                  </div>
                )}
            </header>

            {/* 벚꽃 정원 */}
            <GlassCard
              data-testid="blossom-garden"
              className="mb-6 !p-4 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flower2 size={20} className="text-pink-500" />
                  <h3 className="font-bold text-slate-800 text-sm">벚꽃 정원</h3>
                </div>
                <span
                  data-testid="blossom-count"
                  className="px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold"
                >
                  {gamificationLoading ? '...' : `${blossomCount}송이`}
                </span>
              </div>
              {/* 벚꽃 시각화 */}
              <div className="flex flex-wrap gap-1 justify-center min-h-[60px] items-center">
                {gamificationLoading ? (
                  <span className="text-slate-400 text-sm">로딩 중...</span>
                ) : blossomCount === 0 ? (
                  <div className="text-center py-4">
                    <Sparkles size={24} className="mx-auto text-pink-300 mb-2" />
                    <p className="text-xs text-slate-500">
                      감정을 기록하면 벚꽃이 피어나요
                    </p>
                  </div>
                ) : (
                  // 최대 30개까지 벚꽃 아이콘 표시
                  Array.from({ length: Math.min(blossomCount, 30) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.02, duration: 0.3 }}
                    >
                      <Flower2
                        size={16}
                        className={`
                          ${i % 3 === 0 ? 'text-pink-400' : i % 3 === 1 ? 'text-pink-300' : 'text-pink-500'}
                        `}
                        fill="currentColor"
                      />
                    </motion.div>
                  ))
                )}
                {blossomCount > 30 && (
                  <span className="text-xs text-pink-500 ml-2">+{blossomCount - 30}</span>
                )}
              </div>
            </GlassCard>

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
                
                {/* 이스터에그 카드 - 나이트모드 전용 (리디자인) */}
                {mode === 'night' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <GlassCard className="p-0 overflow-hidden relative group cursor-pointer border-purple-500/20 shadow-lg shadow-purple-900/10">
                      <button
                        onClick={() => navigate('/easter-egg/gate')}
                        className="w-full text-left p-6 relative z-10"
                      >
                        {/* 배경 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              <Moon size={18} className="text-purple-300" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Hidden Space</h3>
                              <p className="text-xs text-slate-500 mt-0.5">특별한 누군가를 위한 공간</p>
                            </div>
                          </div>
                          <Sparkles size={16} className="text-purple-300 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    </GlassCard>
                  </motion.div>
                )}
            </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
            <motion.div
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col overflow-hidden"
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
