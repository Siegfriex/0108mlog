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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from './WelcomeScreen';
import { PermissionRequest } from './PermissionRequest';
import { InitialAssessment } from './InitialAssessment';
import { GoalSetting } from './GoalSetting';
import { PersonalizationSetup } from './PersonalizationSetup';
import { TutorialGuide } from './TutorialGuide';

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
  onSkip?: () => void;
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
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    notificationPermission: 'default',
    locationPermission: 'default',
  });

  /**
   * 온보딩 완료 처리
   * 로컬 스토리지에 완료 플래그 저장 및 콜백 호출
   */
  const handleComplete = () => {
    // 로컬 스토리지에 온보딩 완료 플래그 저장
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
    
    // 완료 콜백 호출
    onComplete(onboardingData);
  };

  /**
   * 다음 단계로 이동
   * 
   * @param step 다음 단계
   */
  const handleNext = (step?: OnboardingStep) => {
    const steps: OnboardingStep[] = ['welcome', 'permissions', 'assessment', 'goals', 'personalization', 'tutorial'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (step) {
      setCurrentStep(step);
    } else if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  /**
   * 이전 단계로 이동
   */
  const handleBack = () => {
    const steps: OnboardingStep[] = ['welcome', 'permissions', 'assessment', 'goals', 'personalization', 'tutorial'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  /**
   * 온보딩 데이터 업데이트
   * 
   * @param updates 업데이트할 데이터
   */
  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const stepNumber = getStepNumber(currentStep);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20">
      {/* 진행률 표시 (개선) */}
      <motion.div 
        className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/80">
          <span className="text-sm font-bold text-brand-primary min-w-[2rem]">{stepNumber}/6</span>
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
              onNext={() => handleNext('permissions')}
              onSkip={onSkip}
            />
          )}
          
          {currentStep === 'permissions' && (
            <PermissionRequest
              data={onboardingData}
              onUpdate={updateData}
              onNext={() => handleNext('assessment')}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 'assessment' && (
            <InitialAssessment
              data={onboardingData}
              onUpdate={updateData}
              onNext={() => handleNext('goals')}
              onBack={handleBack}
              onSkip={() => handleNext('goals')}
            />
          )}
          
          {currentStep === 'goals' && (
            <GoalSetting
              data={onboardingData}
              onUpdate={updateData}
              onNext={() => handleNext('personalization')}
              onBack={handleBack}
              onSkip={() => handleNext('personalization')}
            />
          )}
          
          {currentStep === 'personalization' && (
            <PersonalizationSetup
              data={onboardingData}
              onUpdate={updateData}
              onNext={() => handleNext('tutorial')}
              onBack={handleBack}
              onSkip={() => handleNext('tutorial')}
            />
          )}
          
          {currentStep === 'tutorial' && (
            <TutorialGuide
              onComplete={handleComplete}
              onBack={handleBack}
              onSkip={handleComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
