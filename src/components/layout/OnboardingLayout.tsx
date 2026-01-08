/**
 * 온보딩 레이아웃 컴포넌트
 * 
 * 온보딩 전용 레이아웃
 * 기존 App.tsx의 온보딩 렌더링 구조 보존
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingFlow } from '../onboarding';
import type { OnboardingData } from '../onboarding';
import { NoiseOverlay } from '../ui';

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

  /**
   * 온보딩 완료 핸들러
   * 
   * @param data 온보딩 데이터
   */
  const handleOnboardingComplete = (data: OnboardingData) => {
    // 온보딩 데이터 저장
    console.log('온보딩 완료:', data);
    localStorage.setItem('onboarding_completed', 'true');
    // 메인 화면으로 이동
    navigate('/chat');
  };

  /**
   * 온보딩 스킵 핸들러
   */
  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/chat');
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden font-sans bg-gradient-to-br from-brand-light via-white to-brand-secondary/20">
      <NoiseOverlay />
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleSkip}
      />
    </div>
  );
};
