/**
 * Onboarding 상태 머신
 * 
 * FEAT-011: 온보딩 플로우
 * PRD 플로우차트 1: 온보딩 플로우 구현
 * 
 * TypeScript Discriminated Union + reducer 기반 FSM
 * 6단계 온보딩 플로우 관리
 */

import { OnboardingData } from '../../components/onboarding/OnboardingFlow';

/**
 * Onboarding 단계 타입
 */
export type OnboardingStep = 'welcome' | 'permissions' | 'assessment' | 'goals' | 'personalization' | 'tutorial';

/**
 * Onboarding 상태 타입
 */
export type OnboardingState =
  | { type: 'welcome' }
  | { type: 'permissions'; data: OnboardingData }
  | { type: 'assessment'; data: OnboardingData }
  | { type: 'goals'; data: OnboardingData }
  | { type: 'personalization'; data: OnboardingData }
  | { type: 'tutorial'; data: OnboardingData }
  | { type: 'saving'; data: OnboardingData; retryCount: number }
  | { type: 'completed'; data: OnboardingData }
  | { type: 'exit_confirm'; returnState: OnboardingState }
  | { type: 'error'; error: string; returnState: OnboardingState };

/**
 * Onboarding 이벤트 타입
 */
export type OnboardingEvent =
  | { type: 'NEXT'; step?: OnboardingStep }
  | { type: 'BACK' }
  | { type: 'UPDATE_DATA'; updates: Partial<OnboardingData> }
  | { type: 'COMPLETE' }
  | { type: 'EXIT_REQUEST' }
  | { type: 'EXIT_CONFIRM' }
  | { type: 'EXIT_CANCEL' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'RETRY_SAVE' };

/**
 * 초기 상태
 */
const INITIAL_DATA: OnboardingData = {
  notificationPermission: 'default',
  locationPermission: 'default',
};

/**
 * 단계 순서
 */
const STEP_ORDER: OnboardingStep[] = ['welcome', 'permissions', 'assessment', 'goals', 'personalization', 'tutorial'];

/**
 * 다음 단계 가져오기
 */
const getNextStep = (currentStep: OnboardingStep): OnboardingStep | null => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex < STEP_ORDER.length - 1) {
    return STEP_ORDER[currentIndex + 1];
  }
  return null;
};

/**
 * 이전 단계 가져오기
 */
const getPreviousStep = (currentStep: OnboardingStep): OnboardingStep | null => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex > 0) {
    return STEP_ORDER[currentIndex - 1];
  }
  return null;
};

/**
 * 현재 단계 가져오기
 */
const getCurrentStep = (state: OnboardingState): OnboardingStep | null => {
  if (state.type === 'welcome') return 'welcome';
  if (state.type === 'permissions') return 'permissions';
  if (state.type === 'assessment') return 'assessment';
  if (state.type === 'goals') return 'goals';
  if (state.type === 'personalization') return 'personalization';
  if (state.type === 'tutorial') return 'tutorial';
  return null;
};

/**
 * Onboarding 상태 머신 Reducer
 */
export function onboardingReducer(
  state: OnboardingState,
  event: OnboardingEvent
): OnboardingState {
  switch (state.type) {
    case 'welcome':
      switch (event.type) {
        case 'NEXT':
          return { type: 'permissions', data: INITIAL_DATA };
        case 'EXIT_REQUEST':
          return { type: 'exit_confirm', returnState: state };
        default:
          return state;
      }

    case 'permissions':
      switch (event.type) {
        case 'NEXT':
          return { type: 'assessment', data: state.data };
        case 'BACK':
          return { type: 'welcome' };
        case 'UPDATE_DATA':
          return { type: 'permissions', data: { ...state.data, ...event.updates } };
        default:
          return state;
      }

    case 'assessment':
      switch (event.type) {
        case 'NEXT':
          return { type: 'goals', data: state.data };
        case 'BACK':
          return { type: 'permissions', data: state.data };
        case 'UPDATE_DATA':
          return { type: 'assessment', data: { ...state.data, ...event.updates } };
        default:
          return state;
      }

    case 'goals':
      switch (event.type) {
        case 'NEXT':
          return { type: 'personalization', data: state.data };
        case 'BACK':
          return { type: 'assessment', data: state.data };
        case 'UPDATE_DATA':
          return { type: 'goals', data: { ...state.data, ...event.updates } };
        default:
          return state;
      }

    case 'personalization':
      switch (event.type) {
        case 'NEXT':
          return { type: 'tutorial', data: state.data };
        case 'BACK':
          return { type: 'goals', data: state.data };
        case 'UPDATE_DATA':
          return { type: 'personalization', data: { ...state.data, ...event.updates } };
        default:
          return state;
      }

    case 'tutorial':
      switch (event.type) {
        case 'COMPLETE':
          return { type: 'saving', data: state.data, retryCount: 0 };
        case 'BACK':
          return { type: 'personalization', data: state.data };
        default:
          return state;
      }

    case 'saving':
      switch (event.type) {
        case 'SAVE_SUCCESS':
          return { type: 'completed', data: state.data };
        case 'SAVE_ERROR':
          return { type: 'error', error: event.error, returnState: { type: 'tutorial', data: state.data } };
        case 'RETRY_SAVE':
          return { type: 'saving', data: state.data, retryCount: state.retryCount + 1 };
        default:
          return state;
      }

    case 'exit_confirm':
      switch (event.type) {
        case 'EXIT_CONFIRM':
          return state.returnState;
        case 'EXIT_CANCEL':
          return state.returnState;
        default:
          return state;
      }

    case 'error':
      switch (event.type) {
        case 'RETRY_SAVE':
          return { type: 'saving', data: state.returnState.type !== 'welcome' ? (state.returnState as any).data : INITIAL_DATA, retryCount: 0 };
        case 'BACK':
          return state.returnState;
        default:
          return state;
      }

    case 'completed':
      // 완료 상태에서는 더 이상 상태 변경 불가
      return state;

    default:
      return state;
  }
}

/**
 * 초기 상태 생성
 */
export function createInitialState(): OnboardingState {
  return { type: 'welcome' };
}
