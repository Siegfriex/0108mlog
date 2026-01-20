/**
 * 메인 라우터 설정
 * 
 * React Router v6 기반 라우팅 시스템
 * PRD 명세: 모든 사이트맵 경로를 라우트로 구현
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { OnboardingLayout } from '../components/layout/OnboardingLayout';
import { routes } from './routes';
import { OnboardingGuard } from './guards';
import { ErrorBoundary } from '../components/ui';
import { AuthLoadingScreen } from '../components/ui/AuthLoadingScreen';
import { ensureAnonymousAuth } from '../services/auth';
import { AppProvider, UIProvider } from '../contexts';

/**
 * 메인 라우터 컴포넌트
 * 
 * Auth 완료를 보장하고 AppContext 초기화
 * 
 * @component
 * @returns {JSX.Element} Router 컴포넌트
 */
export const AppRouter: React.FC = () => {
  const [authReady, setAuthReady] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // Anonymous Auth 완료 대기
  useEffect(() => {
    ensureAnonymousAuth()
      .then(() => {
        setAuthReady(true);
      })
      .catch((error) => {
        console.error('Failed to bootstrap anonymous auth:', error);
        // 에러 발생 시 2초 후 강제 진행 (오프라인 대응)
        setTimeout(() => setAuthReady(true), 2000);
      });
  }, []);

  // 500ms 후에도 Auth 미완료면 로딩 화면 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authReady) {
        setShowLoading(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [authReady]);

  // Auth 완료 전이고 로딩 표시 조건이면
  if (!authReady && showLoading) {
    return <AuthLoadingScreen />;
  }

  // Auth 완료 또는 500ms 이내 완료 예상
  return (
    <ErrorBoundary>
      <AppProvider>
        <UIProvider>
          <BrowserRouter>
            <OnboardingGuard>
              <Routes>
                {/* 온보딩 라우트 */}
                <Route path="/onboarding" element={<OnboardingLayout />} />
                
                {/* 메인 앱 라우트 */}
                <Route path="/*" element={<MainLayout />}>
                  {/* 중첩 라우트는 routes.tsx에서 정의 */}
                  {routes}
                </Route>
                
                {/* 기본 리다이렉트 */}
                <Route path="/" element={<Navigate to="/chat" replace />} />
              </Routes>
            </OnboardingGuard>
          </BrowserRouter>
        </UIProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};
