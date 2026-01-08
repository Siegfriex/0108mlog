/**
 * 메인 라우터 설정
 * 
 * React Router v6 기반 라우팅 시스템
 * PRD 명세: 모든 사이트맵 경로를 라우트로 구현
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { OnboardingLayout } from '../components/layout/OnboardingLayout';
import { routes } from './routes';
import { OnboardingGuard } from './guards';

/**
 * 메인 라우터 컴포넌트
 * 
 * @component
 * @returns {JSX.Element} Router 컴포넌트
 */
export const AppRouter: React.FC = () => {
  return (
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
  );
};
