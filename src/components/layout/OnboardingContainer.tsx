/**
 * OnboardingContainer 컴포넌트
 * 
 * 온보딩 화면 전용 통합 컨테이너
 * 일관된 너비와 레이아웃 제공
 */

import React from 'react';

export interface OnboardingContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',   // 384px
  md: 'max-w-md',   // 448px
  lg: 'max-w-lg',   // 512px
  xl: 'max-w-xl',   // 576px
};

/**
 * OnboardingContainer 컴포넌트
 * 
 * 온보딩 화면의 일관된 컨테이너 너비와 레이아웃 제공
 * 기본값: max-w-lg (512px)
 * 
 * @component
 * @param {OnboardingContainerProps} props - 컴포넌트 props
 * @returns {JSX.Element} OnboardingContainer 컴포넌트
 */
export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  maxWidth = 'lg',
  className = '',
}) => {
  return (
    <div className={`
      w-full ${maxWidthMap[maxWidth]} mx-auto
      flex flex-col justify-center min-h-0 flex-1
      ${className}
    `}>
      {children}
    </div>
  );
};
