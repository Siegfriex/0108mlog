/**
 * CSS 변수 접근 유틸리티
 * 
 * CSS 변수를 JavaScript에서 동적으로 읽고 쓰기 위한 유틸리티
 */

// 타입 정의
export type CSSVariableName = `--${string}`;

/**
 * CSS 변수 값을 가져옵니다
 */
export const getCSSVariable = (
  name: CSSVariableName,
  element: HTMLElement = document.documentElement
): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(element).getPropertyValue(name).trim();
};

/**
 * CSS 변수 값을 설정합니다
 */
export const setCSSVariable = (
  name: CSSVariableName,
  value: string,
  element: HTMLElement = document.documentElement
): void => {
  if (typeof window === 'undefined') return;
  element.style.setProperty(name, value);
};

/**
 * CSS 변수를 숫자로 파싱합니다
 */
export const getCSSVariableAsNumber = (
  name: CSSVariableName,
  element?: HTMLElement
): number => {
  const value = getCSSVariable(name, element);
  return parseFloat(value) || 0;
};

/**
 * rem 값을 px로 변환합니다
 */
export const remToPx = (rem: number): number => {
  if (typeof window === 'undefined') return rem * 16;
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return rem * rootFontSize;
};

/**
 * px 값을 rem으로 변환합니다
 */
export const pxToRem = (px: number): number => {
  if (typeof window === 'undefined') return px / 16;
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return px / rootFontSize;
};

/**
 * vw 값을 px로 변환합니다
 */
export const vwToPx = (vw: number): number => {
  if (typeof window === 'undefined') return 0;
  return (vw / 100) * window.innerWidth;
};

/**
 * vh 값을 px로 변환합니다
 */
export const vhToPx = (vh: number): number => {
  if (typeof window === 'undefined') return 0;
  return (vh / 100) * window.innerHeight;
};

/**
 * CSS 변수 일괄 설정
 */
export const setCSSVariables = (
  variables: Record<string, string>,
  element: HTMLElement = document.documentElement
): void => {
  if (typeof window === 'undefined') return;
  
  Object.entries(variables).forEach(([name, value]) => {
    element.style.setProperty(name, value);
  });
};

/**
 * CSS 변수 일괄 가져오기
 */
export const getCSSVariables = (
  names: CSSVariableName[],
  element?: HTMLElement
): Record<string, string> => {
  return names.reduce((acc, name) => {
    acc[name] = getCSSVariable(name, element);
    return acc;
  }, {} as Record<string, string>);
};
