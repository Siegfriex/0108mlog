/**
 * Day 체크인 상태 머신 테스트
 * 
 * STATE_MACHINE_TEST_PLAN.md 기반 테스트 케이스 구현
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  dayCheckinReducer,
  initialDayCheckinState,
  DayCheckinState,
  DayCheckinEvent,
  getEmotionFromState,
  getIntensityFromState,
  getMessagesFromState,
  getTagsFromState,
  isIdle,
  isEmotionModalOpen,
  isEmotionSelected,
  isChatting,
  isAIResponding,
  isSaving,
  isSaved,
  isCompleted,
  isCrisisDetected,
  isError,
} from '../dayMachine';
import { EmotionType } from '../../../../types';

describe('Day 체크인 상태 머신', () => {
  let state: DayCheckinState;

  beforeEach(() => {
    state = initialDayCheckinState;
  });

  describe('1. 초기 상태', () => {
    it('초기 상태는 idle이어야 한다', () => {
      expect(isIdle(state)).toBe(true);
      expect(state.type).toBe('idle');
    });
  });

  describe('2. 감정 선택 플로우', () => {
    it('idle → emotion_modal_open 전환', () => {
      const event: DayCheckinEvent = { type: 'OPEN_EMOTION_MODAL' };
      state = dayCheckinReducer(state, event);
      
      expect(isEmotionModalOpen(state)).toBe(true);
      expect(state.type).toBe('emotion_modal_open');
    });

    it('emotion_modal_open → emotion_selected (감정 선택)', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      
      expect(isEmotionSelected(state)).toBe(true);
      expect(getEmotionFromState(state)).toBe(EmotionType.JOY);
      expect(getIntensityFromState(state)).toBe(5); // 기본값
    });

    it('감정 강도 변경', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
      state = dayCheckinReducer(state, { type: 'CHANGE_INTENSITY', intensity: 8 });
      
      expect(getIntensityFromState(state)).toBe(8);
    });

    it('감정 재선택', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      state = dayCheckinReducer(state, { type: 'CHANGE_INTENSITY', intensity: 7 });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.ANXIETY });
      
      expect(getEmotionFromState(state)).toBe(EmotionType.ANXIETY);
      expect(getIntensityFromState(state)).toBe(7); // 강도 유지
    });

    it('emotion_selected → chatting (확인)', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
      
      expect(isChatting(state)).toBe(true);
      expect(getMessagesFromState(state)).toEqual([]);
    });
  });

  describe('3. 채팅 플로우', () => {
    beforeEach(() => {
      // 채팅 상태로 진입
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
    });

    it('메시지 전송 시 ai_responding 상태로 전환', () => {
      state = dayCheckinReducer(state, { type: 'SEND_MESSAGE', message: '오늘 기분이 좋아요!' });
      
      expect(isAIResponding(state)).toBe(true);
      expect(getMessagesFromState(state).length).toBe(1);
      expect(getMessagesFromState(state)[0].role).toBe('user');
    });

    it('AI 응답 성공 시 chatting 상태로 복귀', () => {
      state = dayCheckinReducer(state, { type: 'SEND_MESSAGE', message: '오늘 기분이 좋아요!' });
      state = dayCheckinReducer(state, { type: 'AI_RESPONSE_SUCCESS', response: '좋은 하루네요!' });
      
      expect(isChatting(state)).toBe(true);
      expect(getMessagesFromState(state).length).toBe(2);
      expect(getMessagesFromState(state)[1].role).toBe('assistant');
    });

    it('AI 응답 에러 시 에러 메시지와 함께 chatting 복귀', () => {
      state = dayCheckinReducer(state, { type: 'SEND_MESSAGE', message: '오늘 기분이 좋아요!' });
      state = dayCheckinReducer(state, { type: 'AI_RESPONSE_ERROR', error: '연결 실패' });
      
      expect(isChatting(state)).toBe(true);
      expect(getMessagesFromState(state).length).toBe(2);
      expect(getMessagesFromState(state)[1].content).toContain('연결');
    });
  });

  describe('4. 저장 플로우', () => {
    beforeEach(() => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
    });

    it('chatting → saving → saved', () => {
      state = dayCheckinReducer(state, { type: 'REQUEST_SAVE' });
      expect(isSaving(state)).toBe(true);
      
      state = dayCheckinReducer(state, { type: 'SAVE_SUCCESS' });
      expect(isSaved(state)).toBe(true);
    });

    it('저장 실패 시 에러 상태', () => {
      state = dayCheckinReducer(state, { type: 'REQUEST_SAVE' });
      state = dayCheckinReducer(state, { type: 'SAVE_ERROR', error: '저장 실패' });
      
      expect(isError(state)).toBe(true);
    });

    it('저장 재시도', () => {
      state = dayCheckinReducer(state, { type: 'REQUEST_SAVE' });
      state = dayCheckinReducer(state, { type: 'SAVE_RETRY', retryCount: 1 });
      
      expect(isSaving(state)).toBe(true);
      expect((state as any).retryCount).toBe(1);
    });
  });

  describe('5. 위기 감지', () => {
    it('chatting 상태에서 위기 감지', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.ANXIETY });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
      
      const prevState = state;
      state = dayCheckinReducer(state, { type: 'CRISIS_DETECTED' });
      
      expect(isCrisisDetected(state)).toBe(true);
      expect((state as any).returnState).toEqual(prevState);
    });

    it('위기 처리 후 원래 상태로 복귀', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.ANXIETY });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
      
      state = dayCheckinReducer(state, { type: 'CRISIS_DETECTED' });
      state = dayCheckinReducer(state, { type: 'CRISIS_HANDLED' });
      
      expect(isChatting(state)).toBe(true);
    });

    it('idle 상태에서는 위기 감지 불가', () => {
      state = dayCheckinReducer(state, { type: 'CRISIS_DETECTED' });
      expect(isIdle(state)).toBe(true);
    });
  });

  describe('6. 리셋', () => {
    it('어떤 상태에서도 RESET으로 idle 복귀', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
      state = dayCheckinReducer(state, { type: 'RESET' });
      
      expect(isIdle(state)).toBe(true);
    });

    it('에러 상태에서 RESET', () => {
      state = { type: 'error', error: 'test error' };
      state = dayCheckinReducer(state, { type: 'RESET' });
      
      expect(isIdle(state)).toBe(true);
    });
  });

  describe('7. 완료 플로우', () => {
    it('saved → completed', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
      state = dayCheckinReducer(state, { type: 'REQUEST_SAVE' });
      state = dayCheckinReducer(state, { type: 'SAVE_SUCCESS' });
      state = dayCheckinReducer(state, { type: 'COMPLETE' });
      
      expect(isCompleted(state)).toBe(true);
    });
  });

  describe('8. 잘못된 전환 방지', () => {
    it('idle에서 SEND_MESSAGE 무시', () => {
      state = dayCheckinReducer(state, { type: 'SEND_MESSAGE', message: 'test' });
      expect(isIdle(state)).toBe(true);
    });

    it('chatting에서 SELECT_EMOTION 무시', () => {
      state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
      state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
      
      state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.ANXIETY });
      expect(getEmotionFromState(state)).toBe(EmotionType.JOY);
    });
  });
});
