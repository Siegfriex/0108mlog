/**
 * Night 체크인 상태 머신 테스트
 * 
 * STATE_MACHINE_TEST_PLAN.md 기반 테스트 케이스 구현
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  nightCheckinReducer,
  initialNightCheckinState,
  NightCheckinState,
  NightCheckinEvent,
  getEmotionFromState,
  getIntensityFromState,
  getDiaryFromState,
  getLetterFromState,
  getDayModeSummaryFromState,
  getCurrentStep,
  isIdle,
  isEmotionStep,
  isDiaryStep,
  isAnalyzing,
  isLetterStep,
  isSaving,
  isSaved,
  isCrisisDetected,
  isError,
} from '../nightMachine';
import { EmotionType } from '../../../../types';

describe('Night 체크인 상태 머신', () => {
  let state: NightCheckinState;

  beforeEach(() => {
    state = initialNightCheckinState;
  });

  describe('1. 초기 상태', () => {
    it('초기 상태는 idle이어야 한다', () => {
      expect(isIdle(state)).toBe(true);
      expect(state.type).toBe('idle');
    });
  });

  describe('2. 감정 선택 단계', () => {
    it('idle → emotion_step (시작)', () => {
      state = nightCheckinReducer(state, { type: 'START' });
      
      expect(isEmotionStep(state)).toBe(true);
      expect(getCurrentStep(state)).toBe('emotion');
      expect(getEmotionFromState(state)).toBeNull();
      expect(getIntensityFromState(state)).toBe(5);
    });

    it('감정 선택', () => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
      
      expect(getEmotionFromState(state)).toBe(EmotionType.PEACE);
    });

    it('강도 변경', () => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.SADNESS });
      state = nightCheckinReducer(state, { type: 'CHANGE_INTENSITY', intensity: 7 });
      
      expect(getIntensityFromState(state)).toBe(7);
    });

    it('감정 선택 없이 다음 단계 전환 불가', () => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      
      // 감정 없이는 전환되지 않음
      expect(isEmotionStep(state)).toBe(true);
    });
  });

  describe('3. 일기 작성 단계', () => {
    beforeEach(() => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
    });

    it('emotion_step → diary_step', () => {
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      
      expect(isDiaryStep(state)).toBe(true);
      expect(getCurrentStep(state)).toBe('diary');
      expect(getDiaryFromState(state)).toBe('');
    });

    it('Day Mode 요약 전달', () => {
      state = nightCheckinReducer(state, { 
        type: 'NEXT_TO_DIARY', 
        dayModeSummary: '오늘 기쁨과 평온을 느꼈습니다' 
      });
      
      expect(getDayModeSummaryFromState(state)).toBe('오늘 기쁨과 평온을 느꼈습니다');
    });

    it('일기 내용 업데이트', () => {
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      state = nightCheckinReducer(state, { type: 'UPDATE_DIARY', diary: '오늘 하루는...' });
      
      expect(getDiaryFromState(state)).toBe('오늘 하루는...');
    });
  });

  describe('4. 분석 및 편지 생성', () => {
    beforeEach(() => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      state = nightCheckinReducer(state, { type: 'UPDATE_DIARY', diary: '오늘 하루 정말 좋았다' });
    });

    it('diary_step → analyzing', () => {
      state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
      
      expect(isAnalyzing(state)).toBe(true);
      expect(getCurrentStep(state)).toBe('diary');
    });

    it('analyzing → letter_step (성공)', () => {
      state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
      state = nightCheckinReducer(state, { 
        type: 'LETTER_SUCCESS', 
        letter: '오늘 하루도 수고하셨어요.' 
      });
      
      expect(isLetterStep(state)).toBe(true);
      expect(getCurrentStep(state)).toBe('letter');
      expect(getLetterFromState(state)).toBe('오늘 하루도 수고하셨어요.');
    });

    it('analyzing → letter_step (에러 시 폴백 메시지)', () => {
      state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
      state = nightCheckinReducer(state, { type: 'LETTER_ERROR', error: '연결 실패' });
      
      expect(isLetterStep(state)).toBe(true);
      expect(getLetterFromState(state)).toContain('수고하셨어요');
    });
  });

  describe('5. 저장 플로우', () => {
    beforeEach(() => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      state = nightCheckinReducer(state, { type: 'UPDATE_DIARY', diary: '오늘 하루' });
      state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
      state = nightCheckinReducer(state, { type: 'LETTER_SUCCESS', letter: '편지 내용' });
    });

    it('letter_step → saved (저장 성공)', () => {
      state = nightCheckinReducer(state, { type: 'SAVE_SUCCESS' });
      
      expect(isSaved(state)).toBe(true);
      expect(getCurrentStep(state)).toBe('letter');
    });

    it('저장 재시도', () => {
      state = nightCheckinReducer(state, { type: 'SAVE_RETRY', retryCount: 1 });
      
      expect(isSaving(state)).toBe(true);
      expect((state as any).retryCount).toBe(1);
    });

    it('저장 실패 시 에러 상태', () => {
      state = nightCheckinReducer(state, { type: 'SAVE_ERROR', error: '저장 실패' });
      
      expect(isError(state)).toBe(true);
    });
  });

  describe('6. 위기 감지', () => {
    beforeEach(() => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.SADNESS });
    });

    it('emotion_step에서 위기 감지', () => {
      const prevState = state;
      state = nightCheckinReducer(state, { type: 'CRISIS_DETECTED' });
      
      expect(isCrisisDetected(state)).toBe(true);
      expect((state as any).returnState).toEqual(prevState);
    });

    it('diary_step에서 위기 감지', () => {
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      state = nightCheckinReducer(state, { type: 'UPDATE_DIARY', diary: '힘든 하루였다' });
      
      const prevState = state;
      state = nightCheckinReducer(state, { type: 'CRISIS_DETECTED' });
      
      expect(isCrisisDetected(state)).toBe(true);
      expect((state as any).returnState).toEqual(prevState);
    });

    it('위기 처리 후 원래 상태로 복귀', () => {
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      state = nightCheckinReducer(state, { type: 'CRISIS_DETECTED' });
      state = nightCheckinReducer(state, { type: 'CRISIS_HANDLED' });
      
      expect(isDiaryStep(state)).toBe(true);
    });

    it('idle 상태에서는 위기 감지 불가', () => {
      state = initialNightCheckinState;
      state = nightCheckinReducer(state, { type: 'CRISIS_DETECTED' });
      
      expect(isIdle(state)).toBe(true);
    });
  });

  describe('7. 리셋', () => {
    it('어떤 상태에서도 RESET으로 idle 복귀', () => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      state = nightCheckinReducer(state, { type: 'RESET' });
      
      expect(isIdle(state)).toBe(true);
    });

    it('saved 상태에서 RESET', () => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
      state = nightCheckinReducer(state, { type: 'LETTER_SUCCESS', letter: '편지' });
      state = nightCheckinReducer(state, { type: 'SAVE_SUCCESS' });
      state = nightCheckinReducer(state, { type: 'RESET' });
      
      expect(isIdle(state)).toBe(true);
    });
  });

  describe('8. 잘못된 전환 방지', () => {
    it('idle에서 UPDATE_DIARY 무시', () => {
      state = nightCheckinReducer(state, { type: 'UPDATE_DIARY', diary: 'test' });
      expect(isIdle(state)).toBe(true);
    });

    it('emotion_step에서 ANALYZE_DIARY 무시', () => {
      state = nightCheckinReducer(state, { type: 'START' });
      state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
      
      expect(isEmotionStep(state)).toBe(true);
    });
  });

  describe('9. getCurrentStep 헬퍼 함수', () => {
    it('각 상태에 맞는 단계 반환', () => {
      expect(getCurrentStep(initialNightCheckinState)).toBe('emotion');
      
      state = nightCheckinReducer(state, { type: 'START' });
      expect(getCurrentStep(state)).toBe('emotion');
      
      state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY' });
      expect(getCurrentStep(state)).toBe('diary');
      
      state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
      state = nightCheckinReducer(state, { type: 'LETTER_SUCCESS', letter: 'test' });
      expect(getCurrentStep(state)).toBe('letter');
    });
  });
});
