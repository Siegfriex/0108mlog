import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Smile, Frown, Meh, CloudRain, Flame, Send, Heart, MessageCircle } from 'lucide-react';
import { GlassCard, Button, Portal, XPFeedback } from '../ui';
import { EmotionSelectModal } from '../ui/EmotionSelectModal';
import { AIThinkingAnimation } from '../ui/AIThinkingAnimation';
import { SmartContextTag } from '../checkin';
import { QuickChip } from './QuickChip';
import { ActionFeedback } from '../actions/ActionFeedback';
import { EmotionType, CoachPersona, TimelineEntry } from '../../../types';
import { useDayCheckinMachine } from '../../features/checkin/useDayCheckinMachine';
import { useHaptics } from '../../hooks/useHaptics';

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
 * 최대 입력 길이 (백엔드 sanitizeUserInput과 일치)
 */
const MAX_INPUT_LENGTH = 10000;
const WARNING_THRESHOLD = 9000;

/**
 * DayMode 컴포넌트 Props 인터페이스
 */
interface DayModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
  setImmersive: (active: boolean) => void;
  onNavigateToReports?: () => void;
  onOpenSafety?: () => void;
  onCrisisDetected?: () => void;
  onEmotionChange?: (emotion: EmotionType | null) => void;
}

/**
 * DayMode 컴포넌트
 *
 * FEAT-001: 대화형 감정 체크인 (Day Mode)
 * PRD 플로우차트 2.1: Day Mode 체크인 플로우 구현
 *
 * 상태 머신 기반 리팩토링
 * P2 최적화: React.memo로 불필요한 리렌더 방지
 */
const DayModeComponent: React.FC<DayModeProps> = ({
  persona,
  onSave,
  setImmersive,
  onNavigateToReports,
  onOpenSafety,
  onCrisisDetected,
  onEmotionChange
}) => {
  const { triggerHaptic } = useHaptics();

  // XP 피드백 상태
  const [xpFeedback, setXPFeedback] = useState<{
    xpGained: number;
    leveledUp: boolean;
    newLevel: number;
  } | null>(null);

  // XP 획득 콜백
  const handleXPGained = useCallback((xpGained: number, leveledUp: boolean, newLevel: number) => {
    setXPFeedback({ xpGained, leveledUp, newLevel });
  }, []);

  // 상태 머신 훅 사용
  const machine = useDayCheckinMachine({
    persona,
    onCrisisDetected,
    onComplete: onSave,
    onEmotionChange,
    onXPGained: handleXPGained,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 현재 감정 설정
  const activeEmotionConfig = EMOTIONS_CONFIG.find(e => e.id === machine.emotion);

  /**
   * 메시지 목록 하단으로 스크롤
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [machine.messages, machine.isAIResponding]);

  // cleanup effect 제거 - setImmersive 호출이 컴포넌트 리마운트 유발
  // useEffect(() => {
  //   return () => {
  //     setImmersive(false);
  //   };
  // }, [setImmersive]);

  /**
   * 감정 선택 완료 후 채팅 시작
   */
  const handleEmotionComplete = () => {
    machine.confirmEmotion();
    triggerHaptic('medium');
  };

  /**
   * 감정 선택 핸들러
   */
  const handleEmotionSelect = (emotion: EmotionType) => {
    machine.selectEmotion(emotion);
    triggerHaptic('medium');
  };

  /**
   * 강도 변경 핸들러
   */
  const handleIntensityChange = (intensity: number) => {
    machine.changeIntensity(intensity);
    triggerHaptic('light');
  };

  /**
   * 퀵칩 클릭 핸들러
   */
  const handleQuickChipClick = (text: string) => {
    machine.updateInput(text);
    inputRef.current?.focus();
    triggerHaptic('light');
  };

  /**
   * 메시지 전송 핸들러
   */
  const handleSend = async () => {
    if (!machine.input.trim()) return;
    triggerHaptic('light');
    await machine.sendMessage(machine.input);
  };

  /**
   * 체크인 완료 및 저장 핸들러
   */
  const handleFinishAndSave = async () => {
    if (machine.isSaved || machine.isActionLoading) return;
    
    if (!machine.isTagSelecting && machine.tags.length === 0) {
      machine.showTagStep();
      return;
    }
    
    setImmersive(false);
    await machine.requestSave();
  };

  /**
   * 마이크로 액션 생성 핸들러
   */
  const handleGenerateAction = async () => {
    if (!machine.emotion) return;
    await machine.generateAction();
  };

  /**
   * 액션 피드백 완료 핸들러
   */
  const handleActionFeedbackComplete = async (before: number, after: number) => {
    await machine.completeActionFeedback(before, after);
  };

  // 채팅 가능한 상태 (먼저 정의 - showEmotionModal에서 사용)
  const showChat = machine.isChatting || machine.isAIResponding || machine.isTagSelecting || 
                   machine.isSaving || machine.isSaved || machine.isActionLoading || 
                   machine.isActionShowing || machine.isActionFeedback;
  
  // 감정 모달 표시 조건: 
  // 1. chatting 상태가 아니어야 함 (가장 중요!)
  // 2. 채팅 관련 상태가 아니어야 함
  // 3. 모달이 열려있거나 감정이 선택된 상태여야 함
  const showEmotionModal = !machine.isChatting && !showChat && (machine.isEmotionModalOpen || machine.isEmotionSelected);
  // 퀵칩 표시 여부
  const showQuickChips = machine.isChatting && machine.messages.length > 0 && !machine.isAIResponding;

  // setImmersive 호출은 완전히 제거 - 컴포넌트 리마운트를 유발함
  // 대신 showChat 상태에 따라 DayMode 자체가 fullscreen 레이아웃을 처리
  // MainLayout의 isImmersive와는 독립적으로 동작

  // 인사 메시지 추가 (채팅 시작 시)
  const displayMessages = showChat && machine.messages.length === 0 
    ? [{
        id: 'greeting',
        role: 'assistant' as const,
        content: `안녕하세요! ${persona.name}입니다. ${activeEmotionConfig?.label} 기분이시군요. 어떤 이야기를 나눠볼까요?`,
        timestamp: new Date()
      }]
    : machine.messages;

  return (
    <>
      {/* 감정 선택 모달 */}
      <EmotionSelectModal
        isOpen={showEmotionModal}
        selectedEmotion={machine.emotion}
        intensity={machine.intensity}
        onEmotionSelect={handleEmotionSelect}
        onIntensityChange={handleIntensityChange}
        onComplete={handleEmotionComplete}
        onClose={machine.closeEmotionModal}
      />

      {/* 채팅 인터페이스 - Portal로 body에 직접 렌더링하여 z-index 문제 해결 */}
      <Portal>
        <AnimatePresence>
          {showChat && (
            <motion.div
              data-testid="day-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-modal flex flex-col h-full w-full bg-gradient-to-b from-white/60 to-white/40 pt-safe-top pb-safe-bottom"
            >
            {/* 헤더 - 더 넓고 여유로운 디자인 */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="shrink-0 flex items-center justify-between px-8 py-6 sm:px-12 sm:py-8 border-b border-slate-200/30 bg-white/50 backdrop-blur-xl"
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
                      <span className="text-xs text-slate-500">강도: {machine.intensity}/10</span>
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{persona.name}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  machine.reset();
                  setImmersive(false);
                }}
                className="p-2 rounded-full hover:bg-white/60 transition-colors text-slate-600"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </motion.div>

            {/* 메시지 영역 - 더 여유로운 간격 */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-5 scrollbar-hide min-h-0">
              <div className="max-w-3xl mx-auto space-y-5">
              {displayMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    data-testid={msg.role === 'user' ? 'user-message' : 'ai-message'}
                    className={`
                      max-w-chat-bubble sm:max-w-chat-bubble-sm rounded-2xl px-5 py-4 shadow-lg
                      ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-brand-primary/25'
                        : 'bg-white/90 backdrop-blur-xl text-slate-900 border border-white/70 shadow-slate-300/30'
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm">
                          <MessageCircle size={13} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-brand-primary">{persona.name}</span>
                      </div>
                    )}
                    <p className={`text-base leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                      {msg.content}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
              
              {machine.isAIResponding && (
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
            </div>

            {/* 퀵칩 영역 - 더 넓은 간격 */}
            <AnimatePresence>
              {showQuickChips && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="shrink-0 px-6 sm:px-8 pb-3"
                >
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
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

            {/* 액션 카드 오버레이 - 더 여유로운 디자인 */}
            <AnimatePresence>
              {machine.isActionShowing && machine.action && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="shrink-0 px-6 py-5 sm:px-8 sm:py-6 border-t border-slate-200/30 bg-white/50 backdrop-blur-xl"
                >
                  <GlassCard className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={18} className="text-brand-primary" />
                          <h3 className="font-bold text-lg text-slate-800">오늘의 작은 실천</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{machine.action.description}</p>
                      </div>
                      <button 
                        onClick={machine.dismissAction}
                        className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                        aria-label="액션 카드 닫기"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={machine.startActionFeedback}
                      aria-label={`${machine.action.title} 시도해보기`}
                    >
                      시도해보기 ({machine.action.duration})
                    </Button>
                  </GlassCard>
                </motion.div>
              )}
              
              {/* Before/After 피드백 오버레이 */}
              {machine.isActionFeedback && machine.action && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="shrink-0 px-6 py-5 sm:px-8 sm:py-6 border-t border-slate-200/30 bg-white/50 backdrop-blur-xl"
                >
                  <ActionFeedback
                    actionTitle={machine.action.title}
                    onComplete={handleActionFeedbackComplete}
                    onSkip={machine.skipAction}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 태그 입력 단계 - 더 여유로운 디자인 */}
            {machine.isTagSelecting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="shrink-0 px-6 py-5 sm:px-8 sm:py-6 border-t border-slate-200/30 bg-white/50 backdrop-blur-xl"
              >
                <SmartContextTag
                  onTagsChange={machine.updateTags}
                  initialTags={machine.tags}
                  locationPermission="granted"
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleFinishAndSave}
                    variant="primary"
                    className="flex-1"
                    aria-label="체크인 완료 및 저장"
                  >
                    저장하기
                  </Button>
                  <Button
                    onClick={handleFinishAndSave}
                    variant="ghost"
                  >
                    스킵
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 입력 영역 - 더 여유로운 디자인 */}
            {machine.isChatting && !machine.isTagSelecting && (() => {
              const remaining = MAX_INPUT_LENGTH - machine.input.length;
              const showWarning = remaining <= MAX_INPUT_LENGTH - WARNING_THRESHOLD;
              const isMaxReached = remaining <= 0;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="shrink-0 px-6 py-5 sm:px-8 sm:py-6 border-t border-slate-200/30 bg-white/50 backdrop-blur-xl"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        maxLength={MAX_INPUT_LENGTH}
                        value={machine.input}
                        onChange={(e) => machine.updateInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="무엇이든 편하게 말씀해주세요..."
                        className="w-full px-5 py-4 pr-14 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/40 text-slate-800 placeholder-slate-400 transition-all text-base shadow-sm"
                        aria-label="메시지 입력"
                        aria-describedby={showWarning ? 'char-warning-day' : undefined}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!machine.input.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        aria-label="전송"
                      >
                        <Send size={18} />
                      </button>
                      {/* 글자 수 경고 - WCAG 접근성 */}
                      {showWarning && (
                        <p
                          id="char-warning-day"
                          role="status"
                          aria-live="polite"
                          className={`absolute -bottom-5 right-2 text-xs ${
                            isMaxReached ? 'text-status-error' : 'text-status-warning'
                          }`}
                        >
                          {isMaxReached ? '최대 글자 수에 도달했습니다' : `${remaining}자 남음`}
                        </p>
                      )}
                    </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* XP 획득 피드백 */}
      {xpFeedback && (
        <XPFeedback
          xpGained={xpFeedback.xpGained}
          leveledUp={xpFeedback.leveledUp}
          newLevel={xpFeedback.newLevel}
          onComplete={() => setXPFeedback(null)}
        />
      )}
    </>
  );
};

// P2 최적화: React.memo로 불필요한 리렌더 방지
// 깊은 비교를 위한 커스텀 비교 함수
export const DayMode = React.memo(DayModeComponent, (prevProps, nextProps) => {
  // persona는 객체이므로 깊은 비교
  const personaEqual = prevProps.persona.name === nextProps.persona.name &&
                       prevProps.persona.tone === nextProps.persona.tone &&
                       prevProps.persona.emoji === nextProps.persona.emoji;
  
  // 모든 props가 동일하면 리렌더링 방지
  return personaEqual &&
         prevProps.onSave === nextProps.onSave &&
         prevProps.setImmersive === nextProps.setImmersive &&
         prevProps.onNavigateToReports === nextProps.onNavigateToReports &&
         prevProps.onOpenSafety === nextProps.onOpenSafety &&
         prevProps.onCrisisDetected === nextProps.onCrisisDetected &&
         prevProps.onEmotionChange === nextProps.onEmotionChange;
});
