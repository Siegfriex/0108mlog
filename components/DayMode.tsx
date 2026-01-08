
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Smile, Frown, Meh, CloudRain, Flame, ArrowUp, Send, Heart, MessageCircle } from 'lucide-react';
// UI 컴포넌트 import 경로: 새로운 구조로 변경
import { GlassCard, Button, EmotionOrb } from '../src/components/ui';
import { EmotionSelectModal } from '../src/components/ui/EmotionSelectModal';
import { AIThinkingAnimation } from '../src/components/ui/AIThinkingAnimation';
// 스마트 태그 컴포넌트 import: FEAT-001 일부
import { SmartContextTag } from '../src/components/checkin';
import { QuickChip } from '../src/components/chat/QuickChip';
import { ActionFeedback } from '../src/components/actions/ActionFeedback';
import { EmotionType, ChatMessage, CoachPersona, TimelineEntry, MicroAction } from '../types';
import { generateDayModeResponse, generateMicroAction } from '../services/geminiService';
import { recommendActionsByEmotion, getActionById } from '../src/data/microActions';
import { saveConversation, saveEmotionEntry, saveMicroActionLog } from '../src/services/firestore';
import { useHaptics } from '../src/hooks/useHaptics';

/**
 * 감정 설정 구성
 * PRD 명세에 따른 5가지 감정 타입 (JOY, PEACE, ANXIETY, SADNESS, ANGER)
 */
const EMOTIONS_CONFIG = [
  { id: EmotionType.JOY, label: '완전 최고', icon: <Smile size={36} strokeWidth={2} />, color: 'text-amber-500', bgGradient: 'from-amber-200/40 via-yellow-100/40 to-orange-100/40' },
  { id: EmotionType.PEACE, label: '괜찮아요', icon: <Meh size={36} strokeWidth={2} />, color: 'text-brand-primary', bgGradient: 'from-brand-secondary/40 via-teal-100/40 to-cyan-100/40' },
  { id: EmotionType.ANXIETY, label: '조금 불안해요', icon: <Frown size={36} strokeWidth={2} />, color: 'text-orange-500', bgGradient: 'from-orange-200/40 via-red-100/40 to-amber-100/40' },
  { id: EmotionType.SADNESS, label: '우울해요', icon: <CloudRain size={36} strokeWidth={2} />, color: 'text-indigo-500', bgGradient: 'from-indigo-200/40 via-purple-100/40 to-slate-100/40' },
  { id: EmotionType.ANGER, label: '화가 나요', icon: <Flame size={36} strokeWidth={2} />, color: 'text-rose-500', bgGradient: 'from-rose-200/40 via-red-100/40 to-orange-100/40' },
];

/**
 * 퀵칩 메시지 옵션
 */
const QUICK_CHIPS = [
  { id: '1', text: '오늘 하루는 어땠어요?', emotion: null },
  { id: '2', text: '무엇이 기분에 영향을 줬나요?', emotion: null },
  { id: '3', text: '지금 가장 필요한 건 뭐예요?', emotion: null },
];

/**
 * DayMode 컴포넌트 Props 인터페이스
 */
interface DayModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
  setImmersive: (active: boolean) => void;
  onNavigateToReports?: () => void;
  onOpenSafety?: () => void;
  onEmotionChange?: (emotion: EmotionType | null) => void;
}

/**
 * DayMode 컴포넌트
 * 
 * FEAT-001: 대화형 감정 체크인 (Day Mode)
 * PRD 플로우차트 2.1: Day Mode 체크인 플로우 구현
 */
export const DayMode: React.FC<DayModeProps> = ({ persona, onSave, setImmersive, onNavigateToReports, onOpenSafety, onEmotionChange }) => {
  const { triggerHaptic } = useHaptics();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionCard, setActionCard] = useState<MicroAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showActionFeedback, setShowActionFeedback] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [showTagStep, setShowTagStep] = useState(false);
  const [showEmotionModal, setShowEmotionModal] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showQuickChips, setShowQuickChips] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 메시지 목록 하단으로 스크롤
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  /**
   * 감정 선택 완료 후 채팅 시작
   */
  const handleEmotionComplete = () => {
    setShowEmotionModal(false);
    onEmotionChange?.(selectedEmotion);
    
    setTimeout(() => {
      setShowChat(true);
      setHasStarted(true);
      
      const greetingMsg: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: `안녕하세요! ${persona.name}입니다. ${activeEmotionConfig?.label} 기분이시군요. 어떤 이야기를 나눠볼까요?`,
        timestamp: new Date()
      };
      setMessages([greetingMsg]);
    }, 500);
  };

  useEffect(() => {
    return () => {
      setImmersive(false);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [setImmersive]);

  const activeEmotionConfig = EMOTIONS_CONFIG.find(e => e.id === selectedEmotion);

  /**
   * 감정 선택 핸들러
   */
  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
    triggerHaptic('medium');
  };

  /**
   * 퀵칩 클릭 핸들러
   */
  const handleQuickChipClick = (text: string) => {
    setInput(text);
    setShowQuickChips(false);
    inputRef.current?.focus();
    triggerHaptic('light');
  };

  /**
   * 메시지 전송 핸들러
   */
  const handleSend = async () => {
    if (!input.trim()) return;

    triggerHaptic('light');
    setShowQuickChips(false);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => `${m.role === 'user' ? '사용자' : persona.name}: ${m.content}`);
    
    const timeoutPromise = new Promise<string>((resolve) => {
      timeoutIdRef.current = setTimeout(() => {
        resolve('분석에 시간이 걸리고 있어요. 잠시 후 다시 시도해주세요.');
      }, 8000);
    });

    try {
      const responsePromise = generateDayModeResponse(userMsg.content, history, persona);
      const response = await Promise.race([responsePromise, timeoutPromise]);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI 응답 생성 오류:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      setIsLoading(false);
    }
  };

  /**
   * 체크인 완료 및 저장 핸들러
   */
  const handleFinishAndSave = async () => {
    if (isSaved || isActionLoading) return;
    
    if (!showTagStep && contextTags.length === 0) {
      setShowTagStep(true);
      return;
    }
    
    setIsSaved(true);
    setImmersive(false);

    const emotionToSave = selectedEmotion || EmotionType.PEACE;
    const summaryText = messages.length > 1 ? messages[1].content.slice(0, 30) : '체크인';
    const detailText = messages.map(m => `[${m.role === 'user' ? '나' : persona.name}]: ${m.content}`).join('\n\n');

    const entry: TimelineEntry = {
      id: Date.now().toString(),
      date: new Date(),
      type: 'day',
      emotion: emotionToSave,
      intensity,
      summary: summaryText,
      detail: detailText,
      nuanceTags: contextTags
    };

    try {
      const conversationId = await saveConversation({
        title: summaryText,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        emotion: emotionToSave,
        intensity,
        modeAtTime: 'day',
        contextTags: contextTags.length > 0 ? contextTags : undefined,
      });

      await saveEmotionEntry({
        emotion: emotionToSave,
        intensity,
        modeAtTime: 'day',
        contextTags: contextTags.length > 0 ? contextTags : undefined,
        conversationId,
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }

    onSave(entry);
  };

  /**
   * 마이크로 액션 생성 핸들러
   */
  const handleGenerateAction = async () => {
    if (!selectedEmotion) return;
    setIsActionLoading(true);
    
    const recommendedActions = recommendActionsByEmotion(selectedEmotion, intensity);
    const selectedAction = recommendedActions[0];
    
    const action = selectedAction || await generateMicroAction(selectedEmotion, intensity, messages.map(m => m.content).join(' '));
    
    setActionCard(action);
    setIsActionLoading(false);
  };

  /**
   * 액션 피드백 완료 핸들러
   */
  const handleActionFeedbackComplete = async (before: number, after: number) => {
    if (actionCard) {
      try {
        await saveMicroActionLog({
          actionId: actionCard.id,
          actionTitle: actionCard.title,
          beforeIntensity: before,
          afterIntensity: after,
          completed: true,
          skipped: false,
        });
      } catch (error) {
        console.error('Error saving micro action log:', error);
      }
    }
    
    setShowActionFeedback(false);
    setActionCard(null);
  };

  return (
    <>
      {/* 감정 선택 모달 */}
      <EmotionSelectModal
        isOpen={showEmotionModal}
        selectedEmotion={selectedEmotion}
        intensity={intensity}
        onEmotionSelect={handleEmotionSelect}
        onIntensityChange={(val) => {
          setIntensity(val);
          triggerHaptic('light');
        }}
        onComplete={handleEmotionComplete}
      />

      {/* 채팅 인터페이스 */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full w-full"
          >
            {/* 헤더 - 개선된 디자인 */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/50 bg-white/30 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                {activeEmotionConfig && (
                  <motion.div 
                    className={`${activeEmotionConfig.color} p-2 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {activeEmotionConfig.icon}
                  </motion.div>
                )}
                <div>
                  <h2 className="font-bold text-lg text-slate-800">{activeEmotionConfig?.label || '감정 체크인'}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Heart size={12} className="text-rose-400 fill-rose-400" />
                      <span className="text-xs text-slate-500">강도: {intensity}/10</span>
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{persona.name}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setImmersive(false)}
                className="p-2 rounded-full hover:bg-white/60 transition-colors text-slate-600"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </motion.div>

            {/* 메시지 영역 - 개선된 디자인 */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide min-h-0">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    className={`
                      max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-brand-primary/20' 
                        : 'bg-white/80 backdrop-blur-md text-slate-900 border border-white/60 shadow-slate-200/50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                          <MessageCircle size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-brand-primary">{persona.name}</span>
                      </div>
                    )}
                    <p className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                      {msg.content}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-3">
                    <AIThinkingAnimation />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 퀵칩 영역 */}
            <AnimatePresence>
              {showQuickChips && messages.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-4 sm:px-6 pb-2"
                >
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {QUICK_CHIPS.map((chip) => (
                      <QuickChip
                        key={chip.id}
                        text={chip.text}
                        onClick={() => handleQuickChipClick(chip.text)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 액션 카드 오버레이 */}
            <AnimatePresence>
              {actionCard && !isSaved && !showActionFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-4 sm:p-6 border-t border-slate-200/50 bg-white/30 backdrop-blur-md"
                >
                  <GlassCard className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={18} className="text-brand-primary" />
                          <h3 className="font-bold text-lg text-slate-800">오늘의 작은 실천</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{actionCard.description}</p>
                      </div>
                      <button 
                        onClick={() => setActionCard(null)}
                        className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                        aria-label="액션 카드 닫기"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => setShowActionFeedback(true)}
                    >
                      시도해보기 ({actionCard.duration})
                    </Button>
                  </GlassCard>
                </motion.div>
              )}
              
              {/* Before/After 피드백 오버레이 */}
              {showActionFeedback && actionCard && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-4 sm:p-6 border-t border-slate-200/50 bg-white/30 backdrop-blur-md"
                >
                  <ActionFeedback
                    actionTitle={actionCard.title}
                    onComplete={handleActionFeedbackComplete}
                    onSkip={() => {
                      setShowActionFeedback(false);
                      setActionCard(null);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 태그 입력 단계 */}
            {showTagStep && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 border-t border-slate-200/50 bg-white/40 backdrop-blur-md"
              >
                <SmartContextTag
                  onTagsChange={(tags) => setContextTags(tags)}
                  initialTags={contextTags}
                  locationPermission="granted"
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      setShowTagStep(false);
                      handleFinishAndSave();
                    }}
                    variant="primary"
                    className="flex-1"
                  >
                    저장하기
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTagStep(false);
                      handleFinishAndSave();
                    }}
                    variant="ghost"
                  >
                    스킵
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 입력 영역 - 개선된 디자인 */}
            {!showTagStep && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 border-t border-slate-200/50 bg-white/40 backdrop-blur-md"
              >
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setShowQuickChips(false);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      onFocus={() => setShowQuickChips(false)}
                      placeholder="무엇이든 편하게 말씀해주세요..."
                      className="w-full px-4 py-3 pr-12 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 text-slate-800 placeholder-slate-400 transition-all"
                      aria-label="메시지 입력"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-primary text-white hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                      aria-label="전송"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
                
                {/* 완료 및 액션 버튼 */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleFinishAndSave}
                    variant="secondary"
                    className="flex-1"
                    disabled={isSaved}
                    aria-label="체크인 완료 및 저장"
                  >
                    {isSaved ? '저장 완료 ✓' : '대화 마무리'}
                  </Button>
                  <Button 
                    onClick={handleGenerateAction}
                    variant="ghost"
                    isLoading={isActionLoading}
                    className="px-4"
                    aria-label="마이크로 액션 생성"
                    title="오늘의 작은 실천 추천받기"
                  >
                    <Sparkles size={18} className={isActionLoading ? 'animate-pulse' : ''} />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
