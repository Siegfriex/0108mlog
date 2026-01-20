/**
 * OnboardingSection 컴포넌트
 * 
 * 온보딩 화면 전용 통합 스페이싱 시스템
 * 일관된 간격과 정렬 제공
 */

import React from 'react';

export interface OnboardingSectionProps {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  align?: 'start' | 'center';
  className?: string;
}

const spacingMap = {
  tight: 'space-y-4',
  normal: 'space-y-6',
  loose: 'space-y-8',
};

const alignMap = {
  start: 'items-start text-left',
  center: 'items-center text-center',
};

/**
 * OnboardingSection 컴포넌트
 * 
 * 온보딩 화면의 일관된 스페이싱과 정렬 제공
 * 
 * @component
 * @param {OnboardingSectionProps} props - 컴포넌트 props
 * @returns {JSX.Element} OnboardingSection 컴포넌트
 */
export const OnboardingSection: React.FC<OnboardingSectionProps> = ({
  children,
  spacing = 'normal',
  align = 'center',
  className = '',
}) => {
  return (
    <div className={`
      flex flex-col ${spacingMap[spacing]} ${alignMap[align]}
      ${className}
    `}>
      {children}
    </div>
  );
};
