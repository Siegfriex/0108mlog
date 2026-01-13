/**
 * Vitest 테스트 설정 파일
 * 
 * 전역 설정 및 모의(mock) 구성
 */

import '@testing-library/jest-dom';

// 전역 모의 객체 설정
globalThis.window = globalThis.window || {};

// CSS 변수 모의
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      const cssVars: Record<string, string> = {
        '--color-brand-primary': '#2A8E9E',
        '--color-emotion-day-joy': '#FCD34D',
        '--color-emotion-day-peace': '#2A8E9E',
        '--color-emotion-day-anxiety': '#FDA4AF',
        '--color-emotion-day-sadness': '#94A3B8',
        '--color-emotion-day-anger': '#F87171',
        '--color-emotion-night-joy': '#FBBF24',
        '--color-emotion-night-peace': '#818CF8',
        '--duration-normal': '300ms',
      };
      return cssVars[prop] || '';
    },
  }),
});

// Console 경고 필터링 (테스트 중 불필요한 경고 억제)
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  // React 관련 경고 필터링
  if (typeof args[0] === 'string' && args[0].includes('React')) {
    return;
  }
  originalWarn.apply(console, args);
};
