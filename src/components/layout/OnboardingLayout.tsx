/**
 * 온보딩 레이아웃 컴포넌트
 * 
 * 온보딩 전용 레이아웃
 * 기존 App.tsx의 온보딩 렌더링 구조 보존
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingFlow } from '../onboarding';
import { NoiseOverlay } from '../ui';
import { OnboardingGNB } from './OnboardingGNB';

/**
 * OnboardingLayout Props 인터페이스
 */
interface OnboardingLayoutProps {}

/**
 * OnboardingLayout 컴포넌트
 * 
 * @component
 * @param {OnboardingLayoutProps} props - 컴포넌트 props
 * @returns {JSX.Element} OnboardingLayout 컴포넌트
 */
export const OnboardingLayout: React.FC<OnboardingLayoutProps> = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * 온보딩 완료 핸들러 (FE-C1 해결)
   * 
   * localStorage 우선, 실패 시 sessionStorage 폴백
   * 
   * @param data 온보딩 데이터
   */
  const handleOnboardingComplete = (data: {
    notificationPermission: 'granted' | 'denied' | 'default';
    locationPermission: 'granted' | 'denied' | 'default';
    initialEmotionState?: number;
    neededHelp?: string[];
    checkinGoal?: string;
    selectedGoal?: string;
    notificationTime?: string;
    notificationFrequency?: 'daily' | 'twice' | 'weekly';
  }) => {
    // 온보딩 데이터 저장
    console.log('온보딩 완료:', data);
    
    // localStorage 우선 저장
    try {
      localStorage.setItem('onboarding_completed', 'true');
    } catch (error) {
      console.warn('localStorage 저장 실패, sessionStorage 사용:', error);
      try {
        sessionStorage.setItem('onboarding_completed', 'true');
      } catch (sessionError) {
        console.error('sessionStorage 저장도 실패:', sessionError);
      }
    }
    
    // 리다이렉트 카운터 초기화
    try {
      sessionStorage.removeItem('onboarding_redirect_count');
    } catch (error) {
      console.warn('리다이렉트 카운터 초기화 실패:', error);
    }
    
    // 메인 화면으로 이동
    navigate('/chat');
  };

  /**
   * 온보딩 종료 핸들러
   */
  const handleExit = () => {
    // 종료 시 아무것도 저장하지 않고 앱 종료 (또는 홈으로 이동)
    // 실제로는 앱 종료 또는 홈 화면으로 이동
    navigate('/chat');
  };

  /**
   * 진행률 변경 핸들러
   */
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="relative w-full min-h-screen h-screen-dynamic overflow-hidden font-sans bg-gradient-to-br from-brand-light via-white to-brand-secondary/20">
      <NoiseOverlay />
      
      {/* 통합 GNB */}
      <OnboardingGNB onExit={handleExit} progress={currentStep} />
      
      {/* 메인 콘텐츠 - GNB 높이만큼 패딩 */}
      <main className="pt-[calc(var(--header-height)+var(--safe-top)+1.5rem)] pb-safe-bottom">
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onExit={handleExit}
          onStepChange={handleStepChange}
        />
      </main>
    </div>
  );
};
