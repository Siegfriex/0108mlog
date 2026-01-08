/**
 * 디자인 토큰 시스템
 * 
 * PRD 명세와 현재 프론트엔드 구현을 반영한 디자인 토큰 정의
 * 참고: 현재 프론트엔드의 Teal 색상 시스템을 유지하며, PRD의 핑크 기반 색상은 향후 마이그레이션을 위해 주석으로 표시
 */

// 브랜드 색상 (현재 구현: Teal 기반)
export const brandColors = {
  // 현재 구현 색상 (Teal 기반) - 50-900 단계 확장
  50: '#F0FDFA',   // Teal 50 - 매우 밝은 배경
  100: '#CCFBF1',  // Teal 100
  200: '#99F6E4',  // Teal 200 - 현재 secondary
  300: '#5EEAD4',  // Teal 300
  400: '#2DD4BF',  // Teal 400
  500: '#14B8A6',  // Teal 500
  600: '#2A8E9E',  // Muted Teal - 현재 primary
  700: '#0D9488',  // Teal 700
  800: '#115E59',  // Teal 800 - 현재 dark
  900: '#134E4A',  // Teal 900 - 매우 어두운 색상
  
  // 기본 별칭 (하위 호환성 유지)
  primary: '#2A8E9E',      // Muted Teal - 현재 사용 중
  secondary: '#99F6E4',    // Teal 200 - 현재 사용 중
  accent: '#FDA4AF',       // Soft Pink - 현재 사용 중
  dark: '#115E59',         // Teal 800 - 현재 사용 중
  light: '#F0FDFA',        // Teal 50 - 현재 사용 중
  
  // PRD 명세 색상 (향후 마이그레이션 고려)
  // primary: '#FF6B9D',   // 핑크, 벚꽃 컨셉 (PRD)
  // secondary: '#87CEEB', // 하늘색, 평온 (PRD)
  // accent: '#90EE90',    // 연두색, 성장 (PRD)
} as const;

// 밤 모드 전용 색상
export const nightModeColors = {
  background: {
    primary: '#0F172A',    // Slate 900 - 매우 어두운 배경
    secondary: '#1E293B',   // Slate 800
    tertiary: '#334155',    // Slate 700
  },
  text: {
    primary: '#F1F5F9',     // Slate 100 - 밝은 텍스트
    secondary: '#CBD5E1',  // Slate 300
    muted: '#94A3B8',      // Slate 400
  },
  accent: {
    purple: '#A78BFA',     // Purple 400 - 밤 모드 액센트
    indigo: '#818CF8',     // Indigo 400
    cyan: '#22D3EE',       // Cyan 400
  },
} as const;

// 감정별 색상 (PRD와 일치)
export const emotionColors = {
  joy: {
    100: '#FFF9C4',
    400: '#FFD700',
    600: '#FFA000',
  },
  peace: {
    100: '#E1F5FE',
    400: '#4FC3F7',
    600: '#039BE5',
  },
  anxiety: {
    100: '#FBE9E7',
    400: '#FF8A65',
    600: '#F4511E',
  },
  sadness: {
    100: '#F3E5F5',
    400: '#BA68C8',
    600: '#8E24AA',
  },
  anger: {
    100: '#FFEBEE',
    400: '#EF5350',
    600: '#C62828',
  },
} as const;

// 상태 색상 (PRD 명세)
export const statusColors = {
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
} as const;

// 중성 색상 (PRD 명세)
export const neutralColors = {
  background: {
    white: '#FFFFFF',
    gray: '#F5F5F5',
  },
  text: {
    black: '#000000',
    gray: '#666666',
    lightGray: '#999999',
  },
  border: {
    light: '#E0E0E0',
  },
} as const;

// 간격 시스템 (PRD 명세: 4px 단위)
export const spacing = {
  xs: '4px',      // 매우 작은 간격
  sm: '8px',      // 작은 간격
  md: '16px',     // 기본 간격
  lg: '24px',     // 중간 간격
  xl: '32px',     // 큰 간격
  xxl: '48px',    // 매우 큰 간격
} as const;

// 타이포그래피 시스템 (PRD 명세)
export const typography = {
  fontFamily: {
    body: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    code: '"Consolas", "Monaco", monospace',
  },
  fontSize: {
    xs: '12px',   // 작은 텍스트 (라벨, 캡션)
    sm: '14px',   // 본문 (기본)
    base: '16px', // 본문 (강조)
    lg: '20px',   // 소제목
    xl: '24px',   // 제목
    '2xl': '32px', // 대제목
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  lineHeight: {
    base: 1.5,    // 기본 (예: 14px → 21px)
    tight: 1.2,   // 제목 (예: 24px → 28.8px)
  },
} as const;

// 그림자 시스템
export const shadows = {
  glass: '0 20px 40px -10px rgba(42, 142, 158, 0.15)',
  'glass-hover': '0 25px 50px -12px rgba(42, 142, 158, 0.25)',
  glow: '0 0 20px rgba(42, 142, 158, 0.4)',
  floating: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
  brand: '0 8px 32px rgba(42, 142, 158, 0.05)',
} as const;

// 애니메이션 타이밍
export const animation = {
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  easing: {
    default: 'ease-out',
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Border Radius
export const borderRadius = {
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '36px',
  full: '9999px',
} as const;

// Z-index 레이어
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  overlay: 9999,
} as const;

// Breakpoints (Tailwind 기본값)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// 감정별 그라디언트
export const emotionGradients = {
  joy: {
    light: 'from-amber-100 via-yellow-50 to-orange-50',
    medium: 'from-amber-200 via-yellow-100 to-orange-100',
    dark: 'from-amber-400 via-yellow-300 to-orange-300',
  },
  peace: {
    light: 'from-teal-50 via-cyan-50 to-blue-50',
    medium: 'from-teal-100 via-cyan-100 to-blue-100',
    dark: 'from-teal-300 via-cyan-300 to-blue-300',
  },
  anxiety: {
    light: 'from-orange-50 via-red-50 to-amber-50',
    medium: 'from-orange-100 via-red-100 to-amber-100',
    dark: 'from-orange-300 via-red-300 to-amber-300',
  },
  sadness: {
    light: 'from-indigo-50 via-purple-50 to-slate-50',
    medium: 'from-indigo-100 via-purple-100 to-slate-100',
    dark: 'from-indigo-300 via-purple-300 to-slate-300',
  },
  anger: {
    light: 'from-rose-50 via-red-50 to-orange-50',
    medium: 'from-rose-100 via-red-100 to-orange-100',
    dark: 'from-rose-300 via-red-300 to-orange-300',
  },
} as const;

// 시간대별 테마
export const timeBasedThemes = {
  dawn: {
    // 새벽 (04:00-07:00)
    background: 'from-purple-50 via-pink-50 to-orange-50',
    accent: '#F472B6', // Pink 400
    mood: 'peaceful',
  },
  morning: {
    // 아침 (07:00-12:00)
    background: 'from-blue-50 via-cyan-50 to-teal-50',
    accent: '#2A8E9E', // Brand Primary
    mood: 'energetic',
  },
  afternoon: {
    // 오후 (12:00-17:00)
    background: 'from-yellow-50 via-amber-50 to-orange-50',
    accent: '#FCD34D', // Amber 300
    mood: 'active',
  },
  evening: {
    // 저녁 (17:00-20:00)
    background: 'from-orange-50 via-rose-50 to-pink-50',
    accent: '#FDA4AF', // Brand Accent
    mood: 'calm',
  },
  night: {
    // 밤 (20:00-04:00)
    background: 'from-indigo-950 via-purple-950 to-slate-950',
    accent: '#A78BFA', // Purple 400
    mood: 'reflective',
  },
} as const;
