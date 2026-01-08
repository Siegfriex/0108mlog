
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Smile, Frown, Meh, CloudRain, Flame, ArrowUp } from 'lucide-react';
// UI 컴포넌트 import 경로: 새로운 구조로 변경
import { GlassCard, Button } from '../src/components/ui';
// 스마트 태그 컴포넌트 import: FEAT-001 일부
import { SmartContextTag } from '../src/components/checkin';
import { QuickChip } from '../src/components/chat/QuickChip';
import { ActionFeedback } from '../src/components/actions/ActionFeedback';
import { EmotionType, ChatMessage, CoachPersona, TimelineEntry, MicroAction } from '../types';
import { generateDayModeResponse, generateMicroAction } from '../services/geminiService';
import { recommendActionsByEmotion, getActionById } from '../src/data/microActions';
import { saveConversation, saveEmotionEntry, saveMicroActionLog } from '../src/services/firestore';

/**
 * 감정 설정 구성
 * PRD 명세에 따른 5가지 감정 타입 (JOY, PEACE, ANXIETY, SADNESS, ANGER)
 */
const EMOTIONS_CONFIG = [
  { id: EmotionType.JOY, label: 'Super Awesome', icon: <Smile size={36} strokeWidth={2} />, color: 'text-amber-500', bgGradient: 'from-amber-200/40 via-yellow-100/40 to-orange-100/40' },
  { id: EmotionType.PEACE, label: 'Pretty Good', icon: <Meh size={36} strokeWidth={2} />, color: 'text-brand-primary', bgGradient: 'from-brand-secondary/40 via-teal-100/40 to-cyan-100/40' },
  { id: EmotionType.ANXIETY, label: 'A bit Anxious', icon: <Frown size={36} strokeWidth={2} />, color: 'text-orange-500', bgGradient: 'from-orange-200/40 via-red-100/40 to-amber-100/40' },
  { id: EmotionType.SADNESS, label: 'Feeling Blue', icon: <CloudRain size={36} strokeWidth={2} />, color: 'text-indigo-500', bgGradient: 'from-indigo-200/40 via-purple-100/40 to-slate-100/40' },
  { id: EmotionType.ANGER, label: 'Frustrated', icon: <Flame size={36} strokeWidth={2} />, color: 'text-rose-500', bgGradient: 'from-rose-200/40 via-red-100/40 to-orange-100/40' },
];

/**
 * DayMode 컴포넌트 Props 인터페이스
 * 
 * @interface DayModeProps
 * @property {CoachPersona} persona - AI 코치 페르소나 설정
 * @property {(entry: TimelineEntry) => void} onSave - 타임라인 엔트리 저장 콜백
 * @property {(active: boolean) => void} setImmersive - 몰입 모드 설정 콜백
 */
interface DayModeProps {
  persona: CoachPersona;
  onSave: (entry: TimelineEntry) => void;
  setImmersive: (active: boolean) => void;
  onNavigateToReports?: () => void;
  onOpenSafety?: () => void;
}

/**
 * DayMode 컴포넌트
 * 
 * FEAT-001: 대화형 감정 체크인 (Day Mode)
 * PRD 플로우차트 2.1: Day Mode 체크인 플로우 구현
 * 
 * 주요 기능:
 * - 감정 선택 (5가지 감정 타입)
 * - 강도 조절 (1-10)
 * - 대화형 AI 피드백
 * - 마이크로 액션 제안
 * 
 * @component
 * @param {DayModeProps} props - 컴포넌트 props
 * @returns {JSX.Element} DayMode 컴포넌트
 */
export const DayMode: React.FC<DayModeProps> = ({ persona, onSave, setImmersive, onNavigateToReports, onOpenSafety }) => {
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
  const [contextTags, setContextTags] = useState<string[]>([]); // 스마트 태그 상태
  const [showTagStep, setShowTagStep] = useState(false); // 태그 입력 단계 표시 여부
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 메시지 목록 하단으로 스크롤
   * 새로운 메시지 추가 시 자동 스크롤
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  /**
   * 컴포넌트 언마운트 시 몰입 모드 해제 및 타이머 정리
   */
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
   * 체크인 시작 핸들러
   * 선택된 감정을 기반으로 초기 AI 메시지 생성
   */
  const startCheckIn = () => {
    if(!selectedEmotion) return;
    setHasStarted(true);
    const initialMsg: ChatMessage = {
        id: 'init',
        role: 'assistant',
        content: `I noticed you're feeling ${activeEmotionConfig?.label} today. What's on your mind?`,
        timestamp: new Date()
    };
    setMessages([initialMsg]);
  };

  /**
   * 메시지 전송 핸들러
   * 사용자 입력을 처리하고 AI 응답 생성
   * PRD 요구사항: 타임아웃 8초, 폴백 메시지 제공
   * 
   * @async
   * @function handleSend
   */
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => `${m.role === '사용자' ? '사용자' : persona.name}: ${m.content}`);
    
    // 타임아웃 처리 (8초) - 메모리 누수 방지
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
      // 타이머 정리
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      setIsLoading(false);
    }
  };

  /**
   * 체크인 완료 및 저장 핸들러
   * 타임라인 엔트리 생성 및 저장
   * PRD 명세: 스마트 태그는 저장 전에 입력받음 (선택사항)
   * 
   * @async
   * @function handleFinishAndSave
   */
  const handleFinishAndSave = async () => {
    if (isSaved || isActionLoading) return;
    
    // 태그 입력 단계가 아직 표시되지 않았다면 먼저 태그 입력 화면 표시
    if (!showTagStep && contextTags.length === 0) {
      setShowTagStep(true);
      return;
    }
    
    setIsSaved(true);
    setImmersive(false);

    const emotionToSave = selectedEmotion || EmotionType.PEACE;
    const summaryText = messages.length > 1 ? messages[1].content.slice(0, 30) : 'Check-in';
    const detailText = messages.map(m => `[${m.role === 'user' ? 'Me' : persona.name}]: ${m.content}`).join('\n\n');

    const entry: TimelineEntry = {
      id: Date.now().toString(),
      date: new Date(),
      type: 'day',
      emotion: emotionToSave,
      intensity,
      summary: summaryText,
      detail: detailText,
      nuanceTags: contextTags // 스마트 태그 저장
    };

    // Firestore에 저장
    try {
      // 대화 저장
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

      // 감정 기록 저장
      await saveEmotionEntry({
        emotion: emotionToSave,
        intensity,
        modeAtTime: 'day',
        contextTags: contextTags.length > 0 ? contextTags : undefined,
        conversationId,
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      // 에러가 발생해도 로컬 상태는 저장
    }

    onSave(entry);
  };

  /**
   * 마이크로 액션 생성 핸들러
   * FEAT-009: 마이크로 액션 제안 기능
   * 라이브러리 기반 추천 우선, 필요시 AI 생성
   * 
   * @async
   * @function handleGenerateAction
   */
  const handleGenerateAction = async () => {
    if (!selectedEmotion) return;
    setIsActionLoading(true);
    
    // 라이브러리에서 추천 액션 가져오기
    const recommendedActions = recommendActionsByEmotion(selectedEmotion, intensity);
    const selectedAction = recommendedActions[0]; // 첫 번째 추천 액션 사용
    
    // 라이브러리에 액션이 있으면 사용, 없으면 AI 생성
    const action = selectedAction || await generateMicroAction(selectedEmotion, intensity, messages.map(m => m.content).join(' '));
    
    setActionCard(action);
    setIsActionLoading(false);
  };

  /**
   * 액션 피드백 완료 핸들러
   * Before/After 강도 변화 저장
   * 
   * @async
   * @function handleActionFeedbackComplete
   */
  const handleActionFeedbackComplete = async (before: number, after: number) => {
    // Firestore에 마이크로 액션 로그 저장
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

  // 감정 선택 화면
  if (!hasStarted) {
    return (
      <div className="pt-8 sm:pt-[15vh] px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Check In</h1>
        <p className="text-sm sm:text-base text-slate-600 mb-8">How are you feeling right now?</p>
        
        {/* QuickChip 컴포넌트 추가 */}
        <QuickChip 
          className="mb-6"
          onCheckIn={() => {
            // 이미 체크인 화면이므로 아무 동작 없음
          }}
          onWeeklySummary={() => {
            // 리포트 화면으로 이동
            onNavigateToReports?.();
          }}
          onTodayAction={() => {
            // 마이크로 액션 생성
            handleGenerateAction();
          }}
          onSafety={() => {
            // 안전망 화면 열기
            onOpenSafety?.();
          }}
        />
        
        {/* 감정 선택 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {EMOTIONS_CONFIG.map(emotion => (
            <motion.button
              key={emotion.id}
              onClick={() => setSelectedEmotion(emotion.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative overflow-hidden rounded-2xl p-6
                ${selectedEmotion === emotion.id 
                  ? `bg-gradient-to-br ${emotion.bgGradient} border-2 border-brand-primary shadow-lg` 
                  : 'bg-white/50 border border-white/60 hover:bg-white/70'
                }
                transition-all duration-300
              `}
            >
              <div className={`${emotion.color} mb-2 flex justify-center`}>
                {emotion.icon}
              </div>
              <p className={`text-sm font-medium ${selectedEmotion === emotion.id ? 'text-slate-900' : 'text-slate-600'}`}>
                {emotion.label}
              </p>
            </motion.button>
          ))}
        </div>

        {/* 강도 슬라이더 */}
        {selectedEmotion && (
          <GlassCard className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-4">
              Intensity: {intensity}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </GlassCard>
        )}

        {/* 시작 버튼 */}
        {selectedEmotion && (
          <Button 
            onClick={startCheckIn}
            className="w-full"
            variant="primary"
          >
            Start Check-in
          </Button>
        )}
      </div>
    );
  }

  // 채팅 인터페이스
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          {activeEmotionConfig && (
            <div className={`${activeEmotionConfig.color}`}>
              {activeEmotionConfig.icon}
            </div>
          )}
          <div>
            <h2 className="font-bold text-lg">{activeEmotionConfig?.label}</h2>
            <p className="text-xs text-slate-500">Intensity: {intensity}/10</p>
          </div>
        </div>
        <button
          onClick={() => setImmersive(false)}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3
              ${msg.role === 'user' 
                ? 'bg-brand-primary text-white' 
                : 'bg-white/60 text-slate-900'
              }
            `}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/60 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 액션 카드 오버레이 */}
      <AnimatePresence>
        {actionCard && !isSaved && !showActionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t border-white/20"
          >
            <GlassCard>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg mb-1">{actionCard.title}</h3>
                  <p className="text-sm text-slate-600">{actionCard.description}</p>
                </div>
                <button 
                  onClick={() => setActionCard(null)}
                  aria-label="액션 카드 닫기"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => {
                  // 액션 시작 시 Before/After 피드백 표시
                  setShowActionFeedback(true);
                }}
              >
                Try This ({actionCard.duration})
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
            className="p-4 border-t border-white/20"
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

      {/* 태그 입력 단계 (체크인 완료 전) */}
      {showTagStep && (
        <div className="p-4 border-t border-white/20 bg-white/40 backdrop-blur-md">
          <SmartContextTag
            onTagsChange={(tags) => {
              setContextTags(tags);
            }}
            initialTags={contextTags}
            locationPermission="granted" // 실제로는 온보딩 데이터에서 가져와야 함
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
        </div>
      )}

      {/* 입력 영역 */}
      {!showTagStep && (
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell me more..."
              className="flex-1 px-4 py-3 rounded-full bg-white/60 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              aria-label="메시지 입력"
            />
            <Button onClick={handleSend} variant="primary" aria-label="전송">
              <ArrowUp size={20} />
            </Button>
          </div>
          
          {/* 완료 및 액션 버튼 */}
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={handleFinishAndSave}
              variant="secondary"
              className="flex-1"
              disabled={isSaved}
              aria-label="체크인 완료 및 저장"
            >
              {isSaved ? 'Saved!' : 'Finish & Save'}
            </Button>
            <Button 
              onClick={handleGenerateAction}
              variant="ghost"
              isLoading={isActionLoading}
              aria-label="마이크로 액션 생성"
            >
              <Sparkles size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
