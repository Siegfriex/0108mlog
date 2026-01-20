/**
 * Day 체크인 머신 훅
 * 
 * 상태 머신과 사이드 이펙트를 관리하는 커스텀 훅
 */

import { useReducer, useCallback, useRef, useEffect } from 'react';
import {
  dayCheckinReducer,
  initialDayCheckinState,
  DayCheckinState,
  DayCheckinEvent,
  MachineMessage,
  getEmotionFromState,
  getIntensityFromState,
  getMessagesFromState,
  getTagsFromState,
  getInputFromState,
  getActionFromState,
  isIdle,
  isEmotionModalOpen,
  isEmotionSelected,
  isChatting,
  isAIResponding,
  isTagSelecting,
  isSaving,
  isSaved,
  isActionLoading,
  isActionShowing,
  isActionFeedback,
  isCompleted,
  isCrisisDetected,
  isError,
} from './dayMachine';
import { EmotionType, CoachPersona, TimelineEntry, MicroAction } from '../../../types';
import { generateDayModeResponse, generateMicroAction } from '../../services/ai/gemini';
import { saveConversation, saveEmotionEntry, saveMicroActionLog, getRecentEmotionEntries, addXP } from '../../services/firestore';
import { XP_REWARDS } from '../../types/firestore';
import { detectCrisis } from '../../services/crisisDetection';
import { recommendActionsByEmotion } from '../../data/microActions';

/**
 * useDayCheckinMachine 훅 옵션
 */
export interface UseDayCheckinMachineOptions {
  persona: CoachPersona;
  onCrisisDetected?: () => void;
  onComplete?: (entry: TimelineEntry) => void;
  onEmotionChange?: (emotion: EmotionType | null) => void;
  onXPGained?: (xpGained: number, leveledUp: boolean, newLevel: number) => void;
}

/**
 * Day 체크인 머신 훅
 */
export function useDayCheckinMachine(options: UseDayCheckinMachineOptions) {
  const { persona, onCrisisDetected, onComplete, onEmotionChange, onXPGained } = options;
  
  const [state, dispatch] = useReducer(dayCheckinReducer, initialDayCheckinState);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 이벤트 디스패치
   */
  const send = useCallback((event: DayCheckinEvent) => {
    dispatch(event);
  }, []);

  /**
   * 감정 모달 열기
   */
  const openEmotionModal = useCallback(() => {
    send({ type: 'OPEN_EMOTION_MODAL' });
  }, [send]);

  /**
   * 감정 모달 닫기 (다른 탭으로 이동 시)
   */
  const closeEmotionModal = useCallback(() => {
    send({ type: 'CLOSE_EMOTION_MODAL' });
  }, [send]);

  /**
   * 감정 선택 (위기 감지 포함)
   */
  const selectEmotion = useCallback(async (emotion: EmotionType) => {
    send({ type: 'SELECT_EMOTION', emotion });
    onEmotionChange?.(emotion);
    
    // 위기 감지: 강도 기반
    const intensity = getIntensityFromState(state);
    const crisisResult = await detectCrisis({ emotion, intensity });
    
    if (crisisResult.isCrisis) {
      send({ type: 'CRISIS_DETECTED' });
      onCrisisDetected?.();
    }
  }, [send, state, onCrisisDetected, onEmotionChange]);

  /**
   * 강도 변경 (위기 감지 포함)
   */
  const changeIntensity = useCallback(async (intensity: number) => {
    send({ type: 'CHANGE_INTENSITY', intensity });
    
    // 위기 감지: 강도 기반
    const emotion = getEmotionFromState(state);
    if (emotion) {
      const crisisResult = await detectCrisis({ emotion, intensity });
      
      if (crisisResult.isCrisis) {
        send({ type: 'CRISIS_DETECTED' });
        onCrisisDetected?.();
      }
    }
  }, [send, state, onCrisisDetected]);

  /**
   * 감정 선택 확인 (채팅 시작)
   */
  const confirmEmotion = useCallback(() => {
    send({ type: 'CONFIRM_EMOTION' });
    onEmotionChange?.(getEmotionFromState(state));
  }, [send, state, onEmotionChange]);

  /**
   * 입력 업데이트
   */
  const updateInput = useCallback((input: string) => {
    send({ type: 'UPDATE_INPUT', input });
  }, [send]);

  /**
   * 메시지 전송 (AI 응답 생성)
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // 위기 감지: 키워드 기반 + Gemini 2차 검증 (FE-C4)
    const crisisResult = await detectCrisis({ text: message });
    if (crisisResult.isCrisis) {
      send({ type: 'CRISIS_DETECTED' });
      onCrisisDetected?.();
      return;
    }

    send({ type: 'SEND_MESSAGE', message });

    const messages = getMessagesFromState(state);
    const history = messages.map(m => `${m.role === 'user' ? '사용자' : persona.name}: ${m.content}`);

    try {
      const response = await generateDayModeResponse(message, history, persona);
      send({ type: 'AI_RESPONSE_SUCCESS', response });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '연결에 문제가 발생했습니다.';
      send({ type: 'AI_RESPONSE_ERROR', error: errorMessage });
    }
  }, [send, state, persona, onCrisisDetected]);

  /**
   * 태그 단계 표시
   */
  const showTagStep = useCallback(() => {
    send({ type: 'SHOW_TAG_STEP' });
  }, [send]);

  /**
   * 태그 업데이트
   */
  const updateTags = useCallback((tags: string[]) => {
    send({ type: 'UPDATE_TAGS', tags });
  }, [send]);

  /**
   * 저장 요청 (재시도 포함, 위기 감지 포함)
   */
  const requestSave = useCallback(async () => {
    const emotion = getEmotionFromState(state);
    const intensity = getIntensityFromState(state);
    const messages = getMessagesFromState(state);
    const tags = getTagsFromState(state);

    if (!emotion) return;

    const detailText = messages.map(m => `[${m.role === 'user' ? '나' : persona.name}]: ${m.content}`).join('\n\n');

    // 위기 감지: 종합 (키워드 + 강도 + 패턴 + Gemini)
    const recentEntries = await getRecentEmotionEntries(7);
    const crisisResult = await detectCrisis({
      text: detailText,
      emotion,
      intensity,
      recentEntries,
    });
    
    if (crisisResult.isCrisis) {
      send({ type: 'CRISIS_DETECTED' });
      onCrisisDetected?.();
      return;
    }

    send({ type: 'REQUEST_SAVE' });

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        const summaryText = messages.length > 0 ? messages[0].content.slice(0, 30) : '체크인';
        
        const conversationId = await saveConversation({
          title: summaryText,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          emotion,
          intensity,
          modeAtTime: 'day',
          contextTags: tags.length > 0 ? tags : undefined,
        });

        await saveEmotionEntry({
          emotion,
          intensity,
          modeAtTime: 'day',
          contextTags: tags.length > 0 ? tags : undefined,
          conversationId: conversationId || undefined,
        });

        // XP 부여 (게이미피케이션)
        try {
          const xpResult = await addXP(XP_REWARDS.CHECKIN, 'checkin');
          onXPGained?.(XP_REWARDS.CHECKIN, xpResult.leveledUp, xpResult.newLevel);
        } catch (xpError) {
          console.warn('XP 부여 실패:', xpError);
          // XP 부여 실패해도 체크인 성공으로 처리
        }

        send({ type: 'SAVE_SUCCESS' });

        // TimelineEntry 생성 및 콜백 (conversationId 사용하여 삭제 시 orphan 방지)
        const entry: TimelineEntry = {
          id: conversationId || Date.now().toString(),
          date: new Date(),
          type: 'day',
          emotion,
          intensity,
          summary: summaryText,
          detail: detailText,
          nuanceTags: tags
        };
        onComplete?.(entry);
        
        return;
      } catch (error: unknown) {
        retryCount++;
        const errorMessage = error instanceof Error ? error.message : '저장 실패';

        if (retryCount <= maxRetries) {
          const delay = Math.pow(2, retryCount - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          send({ type: 'SAVE_RETRY', retryCount });
        } else {
          send({ type: 'SAVE_ERROR', error: errorMessage });
        }
      }
    }
  }, [state, send, persona, onCrisisDetected, onComplete, onXPGained]);

  /**
   * 마이크로 액션 생성
   */
  const generateAction = useCallback(async () => {
    const emotion = getEmotionFromState(state);
    const intensity = getIntensityFromState(state);
    const messages = getMessagesFromState(state);

    if (!emotion) return;

    send({ type: 'GENERATE_ACTION' });

    try {
      const recommendedActions = recommendActionsByEmotion(emotion, intensity);
      let action: MicroAction;

      if (recommendedActions.length > 0) {
        action = recommendedActions[0];
      } else {
        action = await generateMicroAction(
          emotion, 
          intensity, 
          messages.map(m => m.content).join(' ')
        );
      }

      send({ 
        type: 'ACTION_LOADED', 
        actionId: action.id,
        actionTitle: action.title,
        actionDescription: action.description,
        actionDuration: action.duration
      });
    } catch (error) {
      send({ type: 'ACTION_LOAD_ERROR' });
    }
  }, [state, send]);

  /**
   * 액션 피드백 시작
   */
  const startActionFeedback = useCallback(() => {
    send({ type: 'START_ACTION_FEEDBACK' });
  }, [send]);

  /**
   * 액션 피드백 완료
   */
  const completeActionFeedback = useCallback(async (before: number, after: number) => {
    const action = getActionFromState(state);
    
    if (action) {
      try {
        await saveMicroActionLog({
          actionId: action.id,
          actionTitle: action.title,
          beforeIntensity: before,
          afterIntensity: after,
          completed: true,
          skipped: false,
        });
      } catch (error) {
        console.error('Error saving micro action log:', error);
      }
    }
    
    send({ type: 'COMPLETE_ACTION_FEEDBACK', before, after });
  }, [state, send]);

  /**
   * 액션 스킵
   */
  const skipAction = useCallback(() => {
    send({ type: 'SKIP_ACTION' });
  }, [send]);

  /**
   * 액션 닫기
   */
  const dismissAction = useCallback(() => {
    send({ type: 'DISMISS_ACTION' });
  }, [send]);

  /**
   * 위기 처리 완료
   */
  const handleCrisisHandled = useCallback(() => {
    send({ type: 'CRISIS_HANDLED' });
  }, [send]);

  /**
   * 완료
   */
  const complete = useCallback(() => {
    send({ type: 'COMPLETE' });
  }, [send]);

  /**
   * 리셋
   */
  const reset = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    send({ type: 'RESET' });
  }, [send]);

  /**
   * 클린업
   */
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  /**
   * 자동 모달 열기 로직은 제거 - 초기 상태가 emotion_modal_open이므로 불필요
   * 이전에는 idle 상태에서 자동으로 모달을 열었지만, 
   * 이제는 initialDayCheckinState를 emotion_modal_open으로 설정하여 처음부터 모달이 열려있음
   */

  return {
    // 상태
    state,
    
    // 상태 타입 체크
    isIdle: isIdle(state),
    isEmotionModalOpen: isEmotionModalOpen(state),
    isEmotionSelected: isEmotionSelected(state),
    isChatting: isChatting(state),
    isAIResponding: isAIResponding(state),
    isTagSelecting: isTagSelecting(state),
    isSaving: isSaving(state),
    isSaved: isSaved(state),
    isActionLoading: isActionLoading(state),
    isActionShowing: isActionShowing(state),
    isActionFeedback: isActionFeedback(state),
    isCompleted: isCompleted(state),
    isCrisisDetected: isCrisisDetected(state),
    isError: isError(state),
    
    // 상태 데이터 추출
    emotion: getEmotionFromState(state),
    intensity: getIntensityFromState(state),
    messages: getMessagesFromState(state),
    tags: getTagsFromState(state),
    input: getInputFromState(state),
    action: getActionFromState(state),
    
    // 액션
    openEmotionModal,
    closeEmotionModal,
    selectEmotion,
    changeIntensity,
    confirmEmotion,
    updateInput,
    sendMessage,
    showTagStep,
    updateTags,
    requestSave,
    generateAction,
    startActionFeedback,
    completeActionFeedback,
    skipAction,
    dismissAction,
    handleCrisisHandled,
    complete,
    reset,
  };
}
