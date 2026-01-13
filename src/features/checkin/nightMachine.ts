/**
 * Night 체크인 상태 머신
 * 
 * FEAT-001: 대화형 감정 체크인 (Night Mode)
 * PRD 플로우차트 2.2: Night Mode 체크인 플로우 구현
 * 
 * TypeScript Discriminated Union + reducer 기반 FSM
 */

import { EmotionType } from '../../../types';

/**
 * Night 체크인 상태 타입
 */
export type NightCheckinState =
  | { type: 'idle' }
  | { type: 'emotion_step'; emotion: EmotionType | null; intensity: number }
  | { type: 'diary_step'; emotion: EmotionType; intensity: number; diary: string; dayModeSummary?: string }
  | { type: 'analyzing'; emotion: EmotionType; intensity: number; diary: string; dayModeSummary?: string }
  | { type: 'letter_step'; emotion: EmotionType; intensity: number; diary: string; letter: string; dayModeSummary?: string }
  | { type: 'saving'; emotion: EmotionType; intensity: number; diary: string; letter: string; dayModeSummary?: string; retryCount: number }
  | { type: 'saved'; emotion: EmotionType; intensity: number; diary: string; letter: string; dayModeSummary?: string }
  | { type: 'crisis_detected'; returnState: NightCheckinState }
  | { type: 'error'; error: string };

/**
 * Night 체크인 이벤트 타입
 */
export type NightCheckinEvent =
  | { type: 'START' }
  | { type: 'SELECT_EMOTION'; emotion: EmotionType }
  | { type: 'CHANGE_INTENSITY'; intensity: number }
  | { type: 'NEXT_TO_DIARY'; dayModeSummary?: string }
  | { type: 'UPDATE_DIARY'; diary: string }
  | { type: 'ANALYZE_DIARY' }
  | { type: 'LETTER_SUCCESS'; letter: string }
  | { type: 'LETTER_ERROR'; error: string }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_RETRY'; retryCount: number }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'CRISIS_DETECTED' }
  | { type: 'CRISIS_HANDLED' }
  | { type: 'RESET' };

/**
 * 초기 상태
 */
export const initialNightCheckinState: NightCheckinState = { type: 'idle' };

/**
 * 상태 전환 함수
 */
export function nightCheckinReducer(
  state: NightCheckinState,
  event: NightCheckinEvent
): NightCheckinState {
  // 위기 감지는 모든 상태에서 가능 (idle, saved, error 제외)
  if (event.type === 'CRISIS_DETECTED' && state.type !== 'idle' && state.type !== 'saved' && state.type !== 'error') {
    return { type: 'crisis_detected', returnState: state };
  }

  // 위기 처리 후 복귀
  if (state.type === 'crisis_detected' && event.type === 'CRISIS_HANDLED') {
    return state.returnState;
  }

  // 리셋은 모든 상태에서 가능
  if (event.type === 'RESET') {
    return { type: 'idle' };
  }

  switch (state.type) {
    case 'idle':
      if (event.type === 'START') {
        return { type: 'emotion_step', emotion: null, intensity: 5 };
      }
      break;

    case 'emotion_step':
      if (event.type === 'SELECT_EMOTION') {
        return { type: 'emotion_step', emotion: event.emotion, intensity: state.intensity };
      }
      if (event.type === 'CHANGE_INTENSITY') {
        return { type: 'emotion_step', emotion: state.emotion, intensity: event.intensity };
      }
      if (event.type === 'NEXT_TO_DIARY' && state.emotion) {
        return { 
          type: 'diary_step', 
          emotion: state.emotion, 
          intensity: state.intensity,
          diary: '',
          dayModeSummary: event.dayModeSummary
        };
      }
      break;

    case 'diary_step':
      if (event.type === 'UPDATE_DIARY') {
        return { ...state, diary: event.diary };
      }
      if (event.type === 'ANALYZE_DIARY') {
        return { 
          type: 'analyzing', 
          emotion: state.emotion, 
          intensity: state.intensity,
          diary: state.diary,
          dayModeSummary: state.dayModeSummary
        };
      }
      break;

    case 'analyzing':
      if (event.type === 'LETTER_SUCCESS') {
        return { 
          type: 'letter_step', 
          emotion: state.emotion, 
          intensity: state.intensity,
          diary: state.diary,
          letter: event.letter,
          dayModeSummary: state.dayModeSummary
        };
      }
      if (event.type === 'LETTER_ERROR') {
        // 에러 시에도 폴백 메시지로 진행
        return { 
          type: 'letter_step', 
          emotion: state.emotion, 
          intensity: state.intensity,
          diary: state.diary,
          letter: '오늘 하루도 수고하셨어요. 내일도 함께 걸어가요.',
          dayModeSummary: state.dayModeSummary
        };
      }
      break;

    case 'letter_step':
      // letter_step에서 자동으로 저장 시작
      if (event.type === 'SAVE_SUCCESS') {
        return { 
          type: 'saved', 
          emotion: state.emotion, 
          intensity: state.intensity,
          diary: state.diary,
          letter: state.letter,
          dayModeSummary: state.dayModeSummary
        };
      }
      if (event.type === 'SAVE_RETRY') {
        return { 
          type: 'saving', 
          emotion: state.emotion, 
          intensity: state.intensity,
          diary: state.diary,
          letter: state.letter,
          dayModeSummary: state.dayModeSummary,
          retryCount: event.retryCount
        };
      }
      if (event.type === 'SAVE_ERROR') {
        return { type: 'error', error: event.error };
      }
      break;

    case 'saving':
      if (event.type === 'SAVE_SUCCESS') {
        return { 
          type: 'saved', 
          emotion: state.emotion, 
          intensity: state.intensity,
          diary: state.diary,
          letter: state.letter,
          dayModeSummary: state.dayModeSummary
        };
      }
      if (event.type === 'SAVE_RETRY') {
        return { ...state, retryCount: event.retryCount };
      }
      if (event.type === 'SAVE_ERROR') {
        return { type: 'error', error: event.error };
      }
      break;

    case 'saved':
      if (event.type === 'RESET') {
        return { type: 'idle' };
      }
      break;

    case 'error':
      // 에러 상태에서는 리셋만 가능 (상단에서 처리)
      break;
  }

  // 기본적으로 상태 유지
  return state;
}

/**
 * 상태에서 데이터 추출 헬퍼 함수들
 */
export function getEmotionFromState(state: NightCheckinState): EmotionType | null {
  if ('emotion' in state) {
    return state.emotion;
  }
  return null;
}

export function getIntensityFromState(state: NightCheckinState): number {
  if ('intensity' in state) {
    return state.intensity;
  }
  return 5;
}

export function getDiaryFromState(state: NightCheckinState): string {
  if ('diary' in state) {
    return state.diary;
  }
  return '';
}

export function getLetterFromState(state: NightCheckinState): string {
  if ('letter' in state) {
    return state.letter;
  }
  return '';
}

export function getDayModeSummaryFromState(state: NightCheckinState): string | undefined {
  if ('dayModeSummary' in state) {
    return state.dayModeSummary;
  }
  return undefined;
}

/**
 * 상태 타입 체크 헬퍼 함수들
 */
export const isIdle = (state: NightCheckinState): boolean => state.type === 'idle';
export const isEmotionStep = (state: NightCheckinState): boolean => state.type === 'emotion_step';
export const isDiaryStep = (state: NightCheckinState): boolean => state.type === 'diary_step';
export const isAnalyzing = (state: NightCheckinState): boolean => state.type === 'analyzing';
export const isLetterStep = (state: NightCheckinState): boolean => state.type === 'letter_step';
export const isSaving = (state: NightCheckinState): boolean => state.type === 'saving';
export const isSaved = (state: NightCheckinState): boolean => state.type === 'saved';
export const isCrisisDetected = (state: NightCheckinState): boolean => state.type === 'crisis_detected';
export const isError = (state: NightCheckinState): boolean => state.type === 'error';

/**
 * 현재 단계 문자열 반환
 */
export function getCurrentStep(state: NightCheckinState): 'emotion' | 'diary' | 'letter' {
  switch (state.type) {
    case 'idle':
    case 'emotion_step':
    case 'crisis_detected':
      return 'emotion';
    case 'diary_step':
    case 'analyzing':
      return 'diary';
    case 'letter_step':
    case 'saving':
    case 'saved':
    case 'error':
      return 'letter';
    default:
      return 'emotion';
  }
}
