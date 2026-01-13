/**
 * 상수 정의
 * 
 * 앱 전역에서 사용하는 상수값들
 */

import { CoachPersona } from './types';

/**
 * 기본 AI 페르소나 설정
 * PRD 명세: FEAT-012 AI 페르소나 설정
 */
export const DEFAULT_PERSONA: CoachPersona = {
  name: '루나',
  role: 'friend',
  mbti: 'ENFP',
  traits: { warmth: 80, directness: 40 }
};

/**
 * 시간 관련 상수 (밀리초)
 */
export const TIME_CONSTANTS = {
  MODE_CHECK_INTERVAL: 60 * 1000, // 1분
  LOADING_DELAY: 500,
  API_TIMEOUT: 8000,
  MAX_RETRIES: 3,
  DAYS_IN_WEEK: 7,
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
} as const;

/**
 * 임계값 상수
 */
export const THRESHOLDS = {
  ANXIETY_RATIO: 0.4,
  HIGH_INTENSITY_RATIO: 0.3,
  HIGH_INTENSITY_VALUE: 8,
  MIN_DATA_POINTS_FOR_PATTERN: 3,
} as const;