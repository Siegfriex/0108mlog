/**
 * 단위 변환 및 계산 유틸리티
 */

import { getCSSVariable, getCSSVariableAsNumber } from './cssVariables';

type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Spacing 토큰 값을 가져옵니다
 */
export const getSpacing = (size: SpacingSize): string => {
  return getCSSVariable(`--spacing-${size}` as `--${string}`);
};

/**
 * Spacing 토큰을 px 숫자로 가져옵니다
 */
export const getSpacingPx = (size: SpacingSize): number => {
  const value = getSpacing(size);
  // rem to px 변환
  if (value.endsWith('rem')) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return parseFloat(value) * rootFontSize;
  }
  return parseFloat(value) || 0;
};

/**
 * Safe viewport height를 계산합니다
 */
export const getSafeViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const vh = window.innerHeight;
  const safeTop = getCSSVariableAsNumber('--safe-top' as `--${string}`);
  const safeBottom = getCSSVariableAsNumber('--safe-bottom' as `--${string}`);
  
  return vh - safeTop - safeBottom;
};

/**
 * Content area height를 계산합니다 (헤더, 독 제외)
 */
export const getContentHeight = (): number => {
  const safeVh = getSafeViewportHeight();
  const headerHeight = getCSSVariableAsNumber('--header-height' as `--${string}`) || 64;
  const dockHeight = getCSSVariableAsNumber('--dock-height' as `--${string}`) || 80;
  
  return safeVh - headerHeight - dockHeight;
};

/**
 * 반응형 값을 계산합니다
 */
export const getResponsiveValue = <T>(
  values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T },
  defaultValue: T
): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  const width = window.innerWidth;
  
  if (width >= 1280 && values.xl !== undefined) return values.xl;
  if (width >= 1024 && values.lg !== undefined) return values.lg;
  if (width >= 768 && values.md !== undefined) return values.md;
  if (width >= 640 && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  
  return defaultValue;
};

/**
 * clamp 함수 (CSS clamp와 동일)
 */
export const clamp = (min: number, preferred: number, max: number): number => {
  return Math.min(Math.max(preferred, min), max);
};

/**
 * 동적 단위 계산 (fluid typography 등)
 */
export const fluidValue = (
  minValue: number,
  maxValue: number,
  minViewport: number = 375,
  maxViewport: number = 1280
): string => {
  const slope = (maxValue - minValue) / (maxViewport - minViewport);
  const yIntercept = minValue - slope * minViewport;
  
  return `clamp(${minValue}px, ${yIntercept.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw, ${maxValue}px)`;
};

/**
 * px 값을 rem 문자열로 변환합니다
 */
export const toRem = (px: number): string => {
  return `${px / 16}rem`;
};

/**
 * 현재 뷰포트 정보를 가져옵니다
 */
export const getViewportInfo = () => {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      safeTop: 0,
      safeBottom: 0,
      safeLeft: 0,
      safeRight: 0,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    safeTop: getCSSVariableAsNumber('--safe-top' as `--${string}`),
    safeBottom: getCSSVariableAsNumber('--safe-bottom' as `--${string}`),
    safeLeft: getCSSVariableAsNumber('--safe-left' as `--${string}`),
    safeRight: getCSSVariableAsNumber('--safe-right' as `--${string}`),
  };
};
