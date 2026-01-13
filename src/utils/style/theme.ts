/**
 * 테마 관리 유틸리티
 */

import { setCSSVariables } from './cssVariables';

export type ThemeMode = 'day' | 'night';
export type ColorScheme = 'light' | 'dark' | 'system';

/**
 * 현재 테마 모드를 감지합니다
 */
export const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 테마 모드를 설정합니다
 */
export const setThemeMode = (mode: ThemeMode): void => {
  if (typeof document === 'undefined') return;
  
  document.documentElement.setAttribute('data-theme', mode);
  
  if (mode === 'night') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * 시간 기반 테마를 반환합니다
 */
export const getTimeBasedTheme = (): ThemeMode => {
  const hour = new Date().getHours();
  // 20:00 ~ 04:00 = night
  return (hour >= 20 || hour < 4) ? 'night' : 'day';
};

/**
 * 감정에 따른 색상 변수를 설정합니다
 */
export const setEmotionTheme = (emotion: string): void => {
  const emotionColors: Record<string, Record<string, string>> = {
    joy: {
      '--color-emotion-active-100': 'var(--color-emotion-joy-100)',
      '--color-emotion-active-400': 'var(--color-emotion-joy-400)',
      '--color-emotion-active-600': 'var(--color-emotion-joy-600)',
    },
    peace: {
      '--color-emotion-active-100': 'var(--color-emotion-peace-100)',
      '--color-emotion-active-400': 'var(--color-emotion-peace-400)',
      '--color-emotion-active-600': 'var(--color-emotion-peace-600)',
    },
    anxiety: {
      '--color-emotion-active-100': 'var(--color-emotion-anxiety-100)',
      '--color-emotion-active-400': 'var(--color-emotion-anxiety-400)',
      '--color-emotion-active-600': 'var(--color-emotion-anxiety-600)',
    },
    sadness: {
      '--color-emotion-active-100': 'var(--color-emotion-sadness-100)',
      '--color-emotion-active-400': 'var(--color-emotion-sadness-400)',
      '--color-emotion-active-600': 'var(--color-emotion-sadness-600)',
    },
    anger: {
      '--color-emotion-active-100': 'var(--color-emotion-anger-100)',
      '--color-emotion-active-400': 'var(--color-emotion-anger-400)',
      '--color-emotion-active-600': 'var(--color-emotion-anger-600)',
    },
  };
  
  const colors = emotionColors[emotion];
  if (colors) {
    setCSSVariables(colors);
  }
};

/**
 * 테마 변경 리스너를 등록합니다
 */
export const onColorSchemeChange = (callback: (scheme: 'light' | 'dark') => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
};

/**
 * 테마를 토글합니다
 */
export const toggleThemeMode = (): ThemeMode => {
  if (typeof document === 'undefined') return 'day';
  
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme: ThemeMode = currentTheme === 'night' ? 'day' : 'night';
  
  setThemeMode(newTheme);
  return newTheme;
};
