/**
 * 네비게이션 가드
 * 
 * 인증, 온보딩 완료 등 라우트 보호 로직
 */

import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

/**
 * 온보딩 완료 여부 확인 (FE-C1 해결)
 * 
 * 3단계 폴백:
 * 1. localStorage (우선)
 * 2. sessionStorage (폴백)
 * 3. 리다이렉트 카운터 (무한 루프 방지)
 */
export const useOnboardingStatus = (): boolean => {
  // 1단계: localStorage 시도
  try {
    const completed = localStorage.getItem('onboarding_completed');
    if (completed === 'true') return true;
  } catch (error) {
    console.warn('localStorage 접근 실패, sessionStorage로 폴백:', error);
  }
  
  // 2단계: sessionStorage 폴백
  try {
    const completed = sessionStorage.getItem('onboarding_completed');
    if (completed === 'true') return true;
  } catch (error) {
    console.warn('sessionStorage 접근 실패, 리다이렉트 카운터 확인:', error);
  }
  
  // 3단계: 무한 리다이렉트 방지 (3회 제한)
  try {
    const redirectCount = parseInt(sessionStorage.getItem('onboarding_redirect_count') || '0');
    if (redirectCount >= 3) {
      console.warn('온보딩 리다이렉트 3회 초과, 강제 통과');
      // 강제 통과 (더 이상 리다이렉트하지 않음)
      return true;
    }
    // 카운터 증가
    sessionStorage.setItem('onboarding_redirect_count', String(redirectCount + 1));
  } catch (error) {
    // sessionStorage도 실패하면 어쩔 수 없이 false
    console.error('리다이렉트 카운터 접근 실패:', error);
  }
  
  return false;
};

/**
 * 온보딩 가드 컴포넌트
 * 온보딩 미완료 시 온보딩으로 리다이렉트
 */
export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isOnboardingCompleted = useOnboardingStatus();
  
  // 온보딩 페이지가 아니고 온보딩이 완료되지 않았다면 온보딩으로 리다이렉트
  if (!isOnboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

/**
 * 인증 가드 컴포넌트 (향후 확장용)
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: Firebase Auth 연동 시 구현
  // const user = useAuth();
  // if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/**
 * 프리미엄 기능 가드 컴포넌트 (향후 확장용)
 */
export const PremiumGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: 프리미엄 구독 확인 로직 구현
  // const isPremium = usePremiumStatus();
  // if (!isPremium) return <Navigate to="/profile/subscribe" replace />;
  return <>{children}</>;
};
