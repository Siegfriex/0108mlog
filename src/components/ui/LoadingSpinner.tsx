import React from 'react';

/**
 * LoadingSpinner 컴포넌트
 * 
 * 로딩 상태를 표시하는 스피너 컴포넌트
 */
export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-slate-200 rounded-full border-t-brand-primary animate-spin" />
  </div>
);
