/**
 * OnboardingFlow 컴포넌트
 * 
 * FEAT-011: 온보딩 플로우
 * PRD 플로우차트 1: 온보딩 플로우 구현
 * 
 * 6단계 온보딩 플로우:
 * 1. 환영 화면
 * 2. 권한 요청
 * 3. 초기 평가
 * 4. 목표 설정
 * 5. 개인화 설정
 * 6. 첫 체크인 가이드
 */

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from './WelcomeScreen';
import { PermissionRequest } from './PermissionRequest';
import { InitialAssessment } from './InitialAssessment';
import { GoalSetting } from './GoalSetting';
import { PersonalizationSetup } from './PersonalizationSetup';
import { TutorialGuide } from './TutorialGuide';
import { ExitConfirm } from './ExitConfirm';
import { saveOnboardingData } from '../../services/firestore';
import { useOnboardingMachine } from '../../features/onboarding/useOnboardingMachine';

/**
 * 온보딩 단계 타입 정의
 */
export type OnboardingStep = 'welcome' | 'permissions' | 'assessment' | 'goals' | 'personalization' | 'tutorial';

/**
 * 온보딩 데이터 인터페이스
 */
export interface OnboardingData {
  // 권한 상태
  notificationPermission: 'granted' | 'denied' | 'default';
  locationPermission: 'granted' | 'denied' | 'default';
  
  // 초기 평가
  initialEmotionState?: number; // 1-5
  neededHelp?: string[]; // 다중 선택
  checkinGoal?: string; // 단일 선택
  
  // 목표 설정
  selectedGoal?: string;
  
  // 개인화 설정
  notificationTime?: string; // HH:mm 형식
  notificationFrequency?: 'daily' | 'twice' | 'weekly';
}

/**
 * OnboardingFlow Props 인터페이스
 */
export interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onExit?: () => void;
}

/**
 * 온보딩 단계별 진행률 계산
 * 
 * @param step 현재 단계
 * @returns 진행률 (1-6)
 */
const getStepNumber = (step: OnboardingStep): number => {
  const stepMap: Record<OnboardingStep, number> = {
    welcome: 1,
    permissions: 2,
    assessment: 3,
    goals: 4,
    personalization: 5,
    tutorial: 6,
  };
  return stepMap[step];
};

/**
 * OnboardingFlow 메인 컴포넌트
 * 
 * @component
 * @param {OnboardingFlowProps} props - 컴포넌트 props
 * @returns {JSX.Element} OnboardingFlow 컴포넌트
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onExit }) => {
  const {
    currentStep,
    data: onboardingData,
    next,
    back,
    updateData,
    complete,
    requestExit,
    confirmExit,
    cancelExit,
    retrySave,
    send,
    isSaving,
    isCompleted,
    isExitConfirm,
    error: saveError,
  } = useOnboardingMachine();

  /**
   * 저장 처리 (상태 머신의 saving 상태에서 실행)
   */
  useEffect(() => {
    if (isSaving) {
      const performSave = async () => {
        try {
          // Firestore에 온보딩 데이터 저장 (재시도 로직 포함)
          await saveOnboardingData(onboardingData, 3);
          
          // 로컬 스토리지에 온보딩 완료 플래그 저장 (백업)
          localStorage.setItem('onboarding_completed', 'true');
          localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
          
          // 상태 머신에 저장 성공 알림
          send({ type: 'SAVE_SUCCESS' });
        } catch (error) {
          console.error('Failed to save onboarding data:', error);
          const errorMessage = error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.';
          
          // 상태 머신에 저장 실패 알림
          send({ type: 'SAVE_ERROR', error: errorMessage });
        }
      };
      
      performSave();
    }
  }, [isSaving, onboardingData, send]);

  /**
   * 완료 상태 처리
   */
  useEffect(() => {
    if (isCompleted) {
      // 로컬 스토리지에 온보딩 완료 플래그 저장 (백업)
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
      
      // 완료 콜백 호출
      onComplete(onboardingData);
    }
  }, [isCompleted, onboardingData, onComplete]);

  /**
   * 종료 확인
   */
  const handleExitConfirm = useCallback(() => {
    confirmExit();
    if (onExit) {
      onExit();
    }
  }, [confirmExit, onExit]);

  /**
   * 종료 취소
   */
  const handleExitCancel = useCallback(() => {
    cancelExit();
  }, [cancelExit]);

  /**
   * 다음 단계로 이동
   * 
   * @param step 다음 단계
   */
  const handleNext = useCallback((step?: OnboardingStep) => {
    if (step) {
      // 특정 단계로 이동하는 경우는 직접 send 이벤트 사용
      // 현재는 next()만 사용하므로 step 파라미터는 무시
      next();
    } else {
      next();
    }
  }, [next]);

  /**
   * 이전 단계로 이동
   * Step 1 (welcome)에서 뒤로가기 시 종료 확인 다이얼로그 표시
   */
  const handleBack = useCallback(() => {
    if (currentStep === 'welcome') {
      // Step 1에서 뒤로가기 시 종료 확인
      requestExit();
    } else {
      back();
    }
  }, [currentStep, back, requestExit]);

  /**
   * 재시도 처리
   */
  const handleRetry = useCallback(() => {
    retrySave();
  }, [retrySave]);

  const stepNumber = currentStep ? getStepNumber(currentStep) : 1;

  /**
   * 브라우저 뒤로가기 버튼 처리
   * Step 1에서 뒤로가기 시 종료 확인 다이얼로그 표시
   */
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (currentStep === 'welcome') {
        event.preventDefault();
        requestExit();
        // 히스토리 복원
        window.history.pushState(null, '', window.location.href);
      }
    };

    // 히스토리 스택에 현재 상태 추가
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep, requestExit]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20">
      {/* 종료 확인 다이얼로그 */}
      <ExitConfirm
        isOpen={isExitConfirm}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />

      {/* 저장 에러 표시 */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-toast bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg max-w-md"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">{saveError}</p>
            <button
              onClick={handleRetry}
              className="text-sm font-semibold text-red-600 hover:text-red-800 underline"
            >
              재시도
            </button>
          </div>
        </motion.div>
      )}

      {/* 진행률 표시 (개선) */}
      <motion.div 
        className="absolute top-8 left-1/2 -translate-x-1/2 z-content-base"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/80">
          <span className="text-sm font-bold text-brand-primary min-w-progress">{stepNumber}/6</span>
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(stepNumber / 6) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <motion.div
                key={step}
                className={`w-1.5 h-1.5 rounded-full ${
                  step <= stepNumber ? 'bg-brand-primary' : 'bg-slate-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: step <= stepNumber ? 1 : 0.8 }}
                transition={{ delay: step * 0.05, duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* 단계별 컴포넌트 렌더링 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex flex-col items-center justify-center px-4"
        >
          {currentStep === 'welcome' && (
            <WelcomeScreen
              onNext={next}
              onExit={requestExit}
            />
          )}
          
          {currentStep === 'permissions' && (
            <PermissionRequest
              data={onboardingData}
              onUpdate={updateData}
              onNext={next}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 'assessment' && (
            <InitialAssessment
              data={onboardingData}
              onUpdate={updateData}
              onNext={next}
              onBack={handleBack}
              onSkip={next}
            />
          )}
          
          {currentStep === 'goals' && (
            <GoalSetting
              data={onboardingData}
              onUpdate={updateData}
              onNext={next}
              onBack={handleBack}
              onSkip={next}
            />
          )}
          
          {currentStep === 'personalization' && (
            <PersonalizationSetup
              data={onboardingData}
              onUpdate={updateData}
              onNext={next}
              onBack={handleBack}
              onSkip={next}
            />
          )}
          
          {currentStep === 'tutorial' && (
            <TutorialGuide
              onComplete={complete}
              onBack={handleBack}
              onSkip={complete}
            />
          )}
          
          {/* 저장 중 표시 */}
          {isSaving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-loading"
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-slate-700">저장 중...</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
