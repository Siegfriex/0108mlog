/**
 * Day 체크인 상태 머신
 * 
 * FEAT-001: 대화형 감정 체크인 (Day Mode)
 * PRD 플로우차트 2.1: Day Mode 체크인 플로우 구현
 * 
 * TypeScript Discriminated Union + reducer 기반 FSM
 * 채팅 인터페이스와 통합된 플로우
 */

import { EmotionType } from '../../../types';

/**
 * 채팅 메시지 타입 (상태 머신용)
 */
export interface MachineMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Day 체크인 상태 타입
 */
export type DayCheckinState =
  | { type: 'idle' }
  | { type: 'emotion_modal_open' }
  | { 
      type: 'emotion_selected'; 
      emotion: EmotionType; 
      intensity: number;
    }
  | { 
      type: 'chatting'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
      input: string;
    }
  | { 
      type: 'ai_responding'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
    }
  | { 
      type: 'tag_selecting'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
      tags: string[];
    }
  | { 
      type: 'saving'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
      tags: string[];
      retryCount: number;
    }
  | { 
      type: 'saved'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
      tags: string[];
    }
  | { 
      type: 'action_loading'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
      tags: string[];
    }
  | { 
      type: 'action_showing'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
      tags: string[];
      actionId: string;
      actionTitle: string;
      actionDescription: string;
      actionDuration: string;
    }
  | { 
      type: 'action_feedback'; 
      emotion: EmotionType; 
      intensity: number;
      messages: MachineMessage[];
      tags: string[];
      actionId: string;
      actionTitle: string;
    }
  | { type: 'completed' }
  | { type: 'crisis_detected'; returnState: DayCheckinState }
  | { type: 'error'; error: string };

/**
 * Day 체크인 이벤트 타입
 */
export type DayCheckinEvent =
  | { type: 'OPEN_EMOTION_MODAL' }
  | { type: 'SELECT_EMOTION'; emotion: EmotionType }
  | { type: 'CHANGE_INTENSITY'; intensity: number }
  | { type: 'CONFIRM_EMOTION' }
  | { type: 'UPDATE_INPUT'; input: string }
  | { type: 'SEND_MESSAGE'; message: string }
  | { type: 'AI_RESPONSE_SUCCESS'; response: string }
  | { type: 'AI_RESPONSE_ERROR'; error: string }
  | { type: 'SHOW_TAG_STEP' }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'REQUEST_SAVE' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_RETRY'; retryCount: number }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'GENERATE_ACTION' }
  | { type: 'ACTION_LOADED'; actionId: string; actionTitle: string; actionDescription: string; actionDuration: string }
  | { type: 'ACTION_LOAD_ERROR' }
  | { type: 'START_ACTION_FEEDBACK' }
  | { type: 'COMPLETE_ACTION_FEEDBACK'; before: number; after: number }
  | { type: 'SKIP_ACTION' }
  | { type: 'DISMISS_ACTION' }
  | { type: 'CRISIS_DETECTED' }
  | { type: 'CRISIS_HANDLED' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
  | { type: 'CLOSE_EMOTION_MODAL' }; // 감정 모달 닫기 (탭 이동 등)

/**
 * 초기 상태
 * emotion_modal_open으로 시작하여 자동으로 모달을 표시
 */
export const initialDayCheckinState: DayCheckinState = { type: 'emotion_modal_open' };

/**
 * 상태 전환 함수
 */
export function dayCheckinReducer(
  state: DayCheckinState,
  event: DayCheckinEvent
): DayCheckinState {
  // 위기 감지는 모든 상태에서 가능 (idle, completed, error 제외)
  if (event.type === 'CRISIS_DETECTED' && state.type !== 'idle' && state.type !== 'completed' && state.type !== 'error') {
    return { type: 'crisis_detected', returnState: state };
  }

  // 위기 처리 후 복귀
  if (state.type === 'crisis_detected' && event.type === 'CRISIS_HANDLED') {
    return state.returnState;
  }

  // 리셋은 모든 상태에서 가능
  if (event.type === 'RESET') {
    return { type: 'emotion_modal_open' }; // idle 대신 emotion_modal_open으로
  }

  switch (state.type) {
    case 'idle':
      if (event.type === 'OPEN_EMOTION_MODAL') {
        return { type: 'emotion_modal_open' };
      }
      break;

    case 'emotion_modal_open':
      if (event.type === 'SELECT_EMOTION') {
        return { 
          type: 'emotion_selected', 
          emotion: event.emotion, 
          intensity: 5 
        };
      }
      // 모달 닫기 (다른 탭으로 이동 시)
      if (event.type === 'CLOSE_EMOTION_MODAL') {
        return { type: 'idle' };
      }
      break;

    case 'emotion_selected':
      if (event.type === 'CHANGE_INTENSITY') {
        return { 
          type: 'emotion_selected', 
          emotion: state.emotion, 
          intensity: event.intensity 
        };
      }
      if (event.type === 'SELECT_EMOTION') {
        return { 
          type: 'emotion_selected', 
          emotion: event.emotion, 
          intensity: state.intensity 
        };
      }
      if (event.type === 'CONFIRM_EMOTION') {
        return { 
          type: 'chatting', 
          emotion: state.emotion, 
          intensity: state.intensity,
          messages: [],
          input: ''
        };
      }
      // 모달 닫기 (다른 탭으로 이동 시)
      if (event.type === 'CLOSE_EMOTION_MODAL') {
        return { type: 'idle' };
      }
      break;

    case 'chatting':
      if (event.type === 'UPDATE_INPUT') {
        return { ...state, input: event.input };
      }
      if (event.type === 'SEND_MESSAGE') {
        const userMessage: MachineMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: event.message,
          timestamp: new Date()
        };
        return { 
          type: 'ai_responding', 
          emotion: state.emotion, 
          intensity: state.intensity,
          messages: [...state.messages, userMessage].slice(-100) // 최근 100개만 유지 (FE-H2)
        };
      }
      if (event.type === 'SHOW_TAG_STEP') {
        return {
          type: 'tag_selecting',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: []
        };
      }
      if (event.type === 'REQUEST_SAVE') {
        return {
          type: 'saving',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: [],
          retryCount: 0
        };
      }
      if (event.type === 'GENERATE_ACTION') {
        return {
          type: 'action_loading',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: []
        };
      }
      break;

    case 'ai_responding':
      if (event.type === 'AI_RESPONSE_SUCCESS') {
        const aiMessage: MachineMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: event.response,
          timestamp: new Date()
        };
        return { 
          type: 'chatting', 
          emotion: state.emotion, 
          intensity: state.intensity,
          messages: [...state.messages, aiMessage].slice(-100), // 최근 100개만 유지 (FE-H2)
          input: ''
        };
      }
      if (event.type === 'AI_RESPONSE_ERROR') {
        const errorMessage: MachineMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: event.error || '연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date()
        };
        return { 
          type: 'chatting', 
          emotion: state.emotion, 
          intensity: state.intensity,
          messages: [...state.messages, errorMessage],
          input: ''
        };
      }
      break;

    case 'tag_selecting':
      if (event.type === 'UPDATE_TAGS') {
        return { ...state, tags: event.tags };
      }
      if (event.type === 'REQUEST_SAVE') {
        return {
          type: 'saving',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: state.tags,
          retryCount: 0
        };
      }
      break;

    case 'saving':
      if (event.type === 'SAVE_SUCCESS') {
        return {
          type: 'saved',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: state.tags
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
      if (event.type === 'GENERATE_ACTION') {
        return {
          type: 'action_loading',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: state.tags
        };
      }
      if (event.type === 'COMPLETE') {
        return { type: 'completed' };
      }
      break;

    case 'action_loading':
      if (event.type === 'ACTION_LOADED') {
        return {
          type: 'action_showing',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: state.tags,
          actionId: event.actionId,
          actionTitle: event.actionTitle,
          actionDescription: event.actionDescription,
          actionDuration: event.actionDuration
        };
      }
      if (event.type === 'ACTION_LOAD_ERROR') {
        return {
          type: 'chatting',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          input: ''
        };
      }
      break;

    case 'action_showing':
      if (event.type === 'START_ACTION_FEEDBACK') {
        return {
          type: 'action_feedback',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          tags: state.tags,
          actionId: state.actionId,
          actionTitle: state.actionTitle
        };
      }
      if (event.type === 'DISMISS_ACTION') {
        return {
          type: 'chatting',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          input: ''
        };
      }
      break;

    case 'action_feedback':
      if (event.type === 'COMPLETE_ACTION_FEEDBACK') {
        return {
          type: 'chatting',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          input: ''
        };
      }
      if (event.type === 'SKIP_ACTION') {
        return {
          type: 'chatting',
          emotion: state.emotion,
          intensity: state.intensity,
          messages: state.messages,
          input: ''
        };
      }
      break;

    case 'completed':
      // 완료 상태에서는 리셋만 가능 (상단에서 처리)
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
export function getEmotionFromState(state: DayCheckinState): EmotionType | null {
  if ('emotion' in state) {
    return state.emotion;
  }
  return null;
}

export function getIntensityFromState(state: DayCheckinState): number {
  if ('intensity' in state) {
    return state.intensity;
  }
  return 5;
}

export function getMessagesFromState(state: DayCheckinState): MachineMessage[] {
  if ('messages' in state) {
    return state.messages;
  }
  return [];
}

export function getTagsFromState(state: DayCheckinState): string[] {
  if ('tags' in state) {
    return state.tags;
  }
  return [];
}

export function getInputFromState(state: DayCheckinState): string {
  if ('input' in state) {
    return state.input;
  }
  return '';
}

export function getActionFromState(state: DayCheckinState): { id: string; title: string; description: string; duration: string } | null {
  if (state.type === 'action_showing' || state.type === 'action_feedback') {
    return {
      id: state.actionId,
      title: state.actionTitle,
      description: 'actionDescription' in state ? state.actionDescription : '',
      duration: 'actionDuration' in state ? state.actionDuration : ''
    };
  }
  return null;
}

/**
 * 상태 타입 체크 헬퍼 함수들
 */
export const isIdle = (state: DayCheckinState): boolean => state.type === 'idle';
export const isEmotionModalOpen = (state: DayCheckinState): boolean => state.type === 'emotion_modal_open';
export const isEmotionSelected = (state: DayCheckinState): boolean => state.type === 'emotion_selected';
export const isChatting = (state: DayCheckinState): boolean => state.type === 'chatting';
export const isAIResponding = (state: DayCheckinState): boolean => state.type === 'ai_responding';
export const isTagSelecting = (state: DayCheckinState): boolean => state.type === 'tag_selecting';
export const isSaving = (state: DayCheckinState): boolean => state.type === 'saving';
export const isSaved = (state: DayCheckinState): boolean => state.type === 'saved';
export const isActionLoading = (state: DayCheckinState): boolean => state.type === 'action_loading';
export const isActionShowing = (state: DayCheckinState): boolean => state.type === 'action_showing';
export const isActionFeedback = (state: DayCheckinState): boolean => state.type === 'action_feedback';
export const isCompleted = (state: DayCheckinState): boolean => state.type === 'completed';
export const isCrisisDetected = (state: DayCheckinState): boolean => state.type === 'crisis_detected';
export const isError = (state: DayCheckinState): boolean => state.type === 'error';
