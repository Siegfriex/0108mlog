/**
 * 네비게이션 가드
 * 
 * 인증, 온보딩 완료 등 라우트 보호 로직
 */

import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

/**
 * 온보딩 완료 여부 확인
 */
export const useOnboardingStatus = (): boolean => {
  try {
    return localStorage.getItem('onboarding_completed') === 'true';
  } catch {
    // localStorage 접근 실패 시 (예: 사생활 보호 모드) 기본값 반환
    return false;
  }
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
