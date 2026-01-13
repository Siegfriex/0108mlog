/**
 * Night 체크인 머신 훅
 * 
 * 상태 머신과 사이드 이펙트를 관리하는 커스텀 훅
 */

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  nightCheckinReducer,
  initialNightCheckinState,
  NightCheckinState,
  NightCheckinEvent,
  getEmotionFromState,
  getIntensityFromState,
  getDiaryFromState,
  getLetterFromState,
  getDayModeSummaryFromState,
  getCurrentStep,
  isIdle,
  isEmotionStep,
  isDiaryStep,
  isAnalyzing,
  isLetterStep,
  isSaving,
  isSaved,
  isCrisisDetected,
  isError,
} from './nightMachine';
import { EmotionType, CoachPersona, TimelineEntry } from '../../../types';
import { generateNightModeLetter } from '../../services/ai/gemini';
import { saveDiaryEntry, getTodayDayModeSummary, getRecentEmotionEntries } from '../../services/firestore';
import { detectCrisis } from '../../services/crisisDetection';

/**
 * useNightCheckinMachine 훅 옵션
 */
export interface UseNightCheckinMachineOptions {
  persona: CoachPersona;
  onCrisisDetected?: () => void;
  onComplete?: (entry: TimelineEntry) => void;
  onEmotionChange?: (emotion: EmotionType | null) => void;
}

/**
 * Night 체크인 머신 훅
 */
export function useNightCheckinMachine(options: UseNightCheckinMachineOptions) {
  const { persona, onCrisisDetected, onComplete, onEmotionChange } = options;
  
  const [state, dispatch] = useReducer(nightCheckinReducer, initialNightCheckinState);
  const saveCompletedRef = useRef(false);

  /**
   * 이벤트 디스패치
   */
  const send = useCallback((event: NightCheckinEvent) => {
    dispatch(event);
  }, []);

  /**
   * 체크인 시작
   */
  const start = useCallback(() => {
    send({ type: 'START' });
  }, [send]);

  /**
   * 감정 선택 (위기 감지 포함)
   */
  const selectEmotion = useCallback(async (emotion: EmotionType) => {
    send({ type: 'SELECT_EMOTION', emotion });
    onEmotionChange?.(emotion);
    
    // 위기 감지: 강도 기반
    const intensity = getIntensityFromState(state);
    const crisisResult = detectCrisis({ emotion, intensity });
    
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
      const crisisResult = detectCrisis({ emotion, intensity });
      
      if (crisisResult.isCrisis) {
        send({ type: 'CRISIS_DETECTED' });
        onCrisisDetected?.();
      }
    }
  }, [send, state, onCrisisDetected]);

  /**
   * 다음 단계로 (일기 작성)
   */
  const nextToDiary = useCallback(async () => {
    // Day Mode 요약 자동 조회
    let dayModeSummary: string | undefined;
    try {
      dayModeSummary = await getTodayDayModeSummary() ?? undefined;
    } catch (error) {
      console.warn('Day Mode 요약 조회 실패:', error);
    }
    
    send({ type: 'NEXT_TO_DIARY', dayModeSummary });
  }, [send]);

  /**
   * 일기 업데이트 (위기 감지 포함)
   */
  const updateDiary = useCallback(async (diary: string) => {
    send({ type: 'UPDATE_DIARY', diary });
    
    // 실시간 위기 감지: 키워드 기반 (일정 길이 이상일 때만)
    if (diary.length > 10) {
      const crisisResult = detectCrisis({ text: diary });
      
      if (crisisResult.isCrisis) {
        send({ type: 'CRISIS_DETECTED' });
        onCrisisDetected?.();
      }
    }
  }, [send, onCrisisDetected]);

  /**
   * 일기 분석 및 편지 생성 (위기 감지 포함)
   */
  const analyzeDiary = useCallback(async () => {
    const diary = getDiaryFromState(state);
    const emotion = getEmotionFromState(state);
    const intensity = getIntensityFromState(state);
    
    if (!diary.trim() || !emotion) return;

    // 위기 감지: 키워드 기반
    const crisisResult = detectCrisis({ text: diary });
    if (crisisResult.isCrisis) {
      send({ type: 'CRISIS_DETECTED' });
      onCrisisDetected?.();
      return;
    }

    send({ type: 'ANALYZE_DIARY' });

    try {
      const letter = await generateNightModeLetter(diary, persona);
      send({ type: 'LETTER_SUCCESS', letter });

      // 종합 위기 감지 (키워드 + 강도 + 패턴)
      const recentEntries = await getRecentEmotionEntries(7);
      const finalCrisisResult = detectCrisis({
        text: diary,
        emotion,
        intensity,
        recentEntries,
      });
      
      if (finalCrisisResult.isCrisis) {
        send({ type: 'CRISIS_DETECTED' });
        onCrisisDetected?.();
        return;
      }

      // 저장 처리
      await saveDiaryAndNotify(letter);
    } catch (error: any) {
      console.error('Letter generation error:', error);
      send({ type: 'LETTER_ERROR', error: error.message || '편지 생성 실패' });
    }
  }, [state, persona, send, onCrisisDetected]);

  /**
   * 저장 및 완료 알림
   */
  const saveDiaryAndNotify = useCallback(async (letter: string) => {
    if (saveCompletedRef.current) return;
    
    const emotion = getEmotionFromState(state);
    const intensity = getIntensityFromState(state);
    const diary = getDiaryFromState(state);
    const dayModeSummary = getDayModeSummaryFromState(state);
    
    if (!emotion) return;

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        await saveDiaryEntry({
          content: diary,
          emotion,
          intensity,
          letterContent: letter,
          dayModeSummary,
        });

        saveCompletedRef.current = true;
        send({ type: 'SAVE_SUCCESS' });

        // TimelineEntry 생성 및 콜백
        const entry: TimelineEntry = {
          id: Date.now().toString(),
          date: new Date(),
          type: 'night',
          emotion,
          intensity,
          summary: diary.slice(0, 40) + (diary.length > 40 ? '...' : ''),
          detail: `[감정]: ${emotion} (강도: ${intensity})\n[나의 일기]\n${diary}\n\n[${persona.name}의 답장]\n${letter}`
        };
        onComplete?.(entry);
        
        return;
      } catch (error: any) {
        retryCount++;

        if (retryCount <= maxRetries) {
          const delay = Math.pow(2, retryCount - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          send({ type: 'SAVE_RETRY', retryCount });
        } else {
          send({ type: 'SAVE_ERROR', error: error.message || '저장 실패' });
        }
      }
    }
  }, [state, persona, send, onComplete]);

  /**
   * 위기 처리 완료
   */
  const handleCrisisHandled = useCallback(() => {
    send({ type: 'CRISIS_HANDLED' });
  }, [send]);

  /**
   * 리셋
   */
  const reset = useCallback(() => {
    saveCompletedRef.current = false;
    send({ type: 'RESET' });
  }, [send]);

  /**
   * 자동으로 시작 (idle 상태에서)
   */
  useEffect(() => {
    if (isIdle(state)) {
      start();
    }
  }, []);

  // letter_step 상태로 전환 시 자동 저장 시작
  useEffect(() => {
    if (isLetterStep(state) && !saveCompletedRef.current) {
      const letter = getLetterFromState(state);
      if (letter) {
        saveDiaryAndNotify(letter);
      }
    }
  }, [state.type]);

  return {
    // 상태
    state,
    currentStep: getCurrentStep(state),
    
    // 상태 타입 체크
    isIdle: isIdle(state),
    isEmotionStep: isEmotionStep(state),
    isDiaryStep: isDiaryStep(state),
    isAnalyzing: isAnalyzing(state),
    isLetterStep: isLetterStep(state),
    isSaving: isSaving(state),
    isSaved: isSaved(state),
    isCrisisDetected: isCrisisDetected(state),
    isError: isError(state),
    
    // 상태 데이터 추출
    emotion: getEmotionFromState(state),
    intensity: getIntensityFromState(state),
    diary: getDiaryFromState(state),
    letter: getLetterFromState(state),
    dayModeSummary: getDayModeSummaryFromState(state),
    
    // 액션
    start,
    selectEmotion,
    changeIntensity,
    nextToDiary,
    updateDiary,
    analyzeDiary,
    handleCrisisHandled,
    reset,
  };
}
