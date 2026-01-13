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

// ========================================
// 감정 색상 유틸리티
// ========================================

/** 감정 타입 */
export type EmotionType = 'joy' | 'peace' | 'anxiety' | 'sadness' | 'anger';

/** 모드 타입 */
export type ModeType = 'day' | 'night';

/**
 * 감정별 색상을 가져옵니다 (Day/Night 모드 지원)
 */
export const getEmotionColor = (
  emotion: EmotionType | null | undefined,
  mode: ModeType = 'day',
  shade: '100' | '400' | '600' = '400'
): string => {
  if (!emotion) {
    return getCSSVariable(`--color-emotion-${mode}-default` as CSSVariableName) || 
           (mode === 'day' ? '#99F6E4' : '#A78BFA');
  }
  
  return getCSSVariable(`--color-emotion-${mode}-${emotion}` as CSSVariableName) ||
         getCSSVariable(`--color-emotion-${emotion}-${shade}` as CSSVariableName) ||
         '#94A3B8';
};

/**
 * AmbientBackground용 감정 색상을 가져옵니다
 */
export const getAmbientEmotionColor = (
  emotion: EmotionType | null | undefined,
  mode: ModeType = 'day'
): string => {
  const varName = emotion
    ? `--color-emotion-${mode}-${emotion}`
    : `--color-emotion-${mode}-default`;
  
  return getCSSVariable(varName as CSSVariableName) || 
         (mode === 'day' ? '#99F6E4' : '#A78BFA');
};

/**
 * JourneyView용 감정 색상을 가져옵니다
 */
export const getJourneyEmotionColor = (emotion: EmotionType): string => {
  return getCSSVariable(`--color-emotion-journey-${emotion}` as CSSVariableName) || '#94A3B8';
};

/**
 * 모든 감정 색상 매핑을 가져옵니다 (JourneyView EMOTION_COLORS 대체)
 */
export const getEmotionColorMap = (): Record<string, string> => {
  return {
    JOY: getCSSVariable('--color-emotion-journey-joy' as CSSVariableName) || '#FFD700',
    PEACE: getCSSVariable('--color-emotion-journey-peace' as CSSVariableName) || '#87CEEB',
    ANXIETY: getCSSVariable('--color-emotion-journey-anxiety' as CSSVariableName) || '#FF6B6B',
    SADNESS: getCSSVariable('--color-emotion-journey-sadness' as CSSVariableName) || '#4A90E2',
    ANGER: getCSSVariable('--color-emotion-journey-anger' as CSSVariableName) || '#FF8C42',
  };
};

/**
 * 차트 색상을 가져옵니다 (Recharts용)
 */
export const getChartColors = () => {
  return {
    grid: getCSSVariable('--color-chart-grid' as CSSVariableName) || '#E2E8F0',
    axis: getCSSVariable('--color-chart-axis' as CSSVariableName) || '#94A3B8',
    line: getCSSVariable('--color-chart-line' as CSSVariableName) || '#2A8E9E',
    dot: getCSSVariable('--color-chart-dot' as CSSVariableName) || '#2A8E9E',
  };
};

/**
 * 파티클 색상 배열을 가져옵니다
 */
export const getParticleColors = (): string[] => {
  return [
    getCSSVariable('--color-particle-1' as CSSVariableName) || '#14b8a6',
    getCSSVariable('--color-particle-2' as CSSVariableName) || '#0d9488',
    getCSSVariable('--color-particle-3' as CSSVariableName) || '#2dd4bf',
    getCSSVariable('--color-particle-4' as CSSVariableName) || '#5eead4',
  ];
};

/**
 * 활성 감정 색상을 설정합니다
 */
export const setActiveEmotionColor = (emotion: EmotionType): void => {
  const shades = ['100', '400', '600'] as const;
  shades.forEach(shade => {
    const value = getCSSVariable(`--color-emotion-${emotion}-${shade}` as CSSVariableName);
    if (value) {
      setCSSVariable(`--color-emotion-active-${shade}` as CSSVariableName, value);
    }
  });
};
