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
