/**
 * Onboarding 상태 머신 Hook
 * 
 * OnboardingFlow 컴포넌트에서 사용하는 상태 머신 Hook
 */

import { useReducer, useCallback, useMemo } from 'react';
import {
  onboardingReducer,
  createInitialState,
  OnboardingState,
  OnboardingEvent,
  OnboardingStep,
} from './onboardingMachine';
import { OnboardingData } from '../../components/onboarding/OnboardingFlow';

/**
 * useOnboardingMachine 반환 타입
 */
export interface UseOnboardingMachineReturn {
  state: OnboardingState;
  currentStep: OnboardingStep | null;
  data: OnboardingData;
  send: (event: OnboardingEvent) => void;
  next: () => void;
  back: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  complete: () => void;
  requestExit: () => void;
  confirmExit: () => void;
  cancelExit: () => void;
  retrySave: () => void;
  isSaving: boolean;
  isCompleted: boolean;
  isExitConfirm: boolean;
  error: string | null;
}

/**
 * 현재 단계에서 데이터 가져오기
 */
const getDataFromState = (state: OnboardingState): OnboardingData => {
  if (state.type === 'welcome') {
    return {
      notificationPermission: 'default',
      locationPermission: 'default',
    };
  }
  if ('data' in state) {
    return state.data;
  }
  return {
    notificationPermission: 'default',
    locationPermission: 'default',
  };
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
 * useOnboardingMachine Hook
 */
export function useOnboardingMachine(): UseOnboardingMachineReturn {
  const [state, send] = useReducer(onboardingReducer, createInitialState());

  const currentStep = useMemo(() => getCurrentStep(state), [state]);
  const data = useMemo(() => getDataFromState(state), [state]);
  const isSaving = state.type === 'saving';
  const isCompleted = state.type === 'completed';
  const isExitConfirm = state.type === 'exit_confirm';
  const error = state.type === 'error' ? state.error : null;

  const next = useCallback(() => {
    send({ type: 'NEXT' });
  }, []);

  const back = useCallback(() => {
    send({ type: 'BACK' });
  }, []);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    send({ type: 'UPDATE_DATA', updates });
  }, []);

  const complete = useCallback(() => {
    send({ type: 'COMPLETE' });
  }, []);

  const requestExit = useCallback(() => {
    send({ type: 'EXIT_REQUEST' });
  }, []);

  const confirmExit = useCallback(() => {
    send({ type: 'EXIT_CONFIRM' });
  }, []);

  const cancelExit = useCallback(() => {
    send({ type: 'EXIT_CANCEL' });
  }, []);

  const retrySave = useCallback(() => {
    send({ type: 'RETRY_SAVE' });
  }, []);

  return {
    state,
    currentStep,
    data,
    send,
    next,
    back,
    updateData,
    complete,
    requestExit,
    confirmExit,
    cancelExit,
    retrySave,
    isSaving,
    isCompleted,
    isExitConfirm,
    error,
  };
}
