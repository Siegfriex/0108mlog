# 상태 머신 테스트 계획

**작성일**: 2026-01-13  
**대상**: `src/features/checkin/dayMachine.ts`, `src/features/checkin/nightMachine.ts`

---

## 1. 테스트 프레임워크 설정

### 1.1 필요한 패키지

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

### 1.2 Vitest 설정 (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

---

## 2. Day 체크인 상태 머신 테스트

### 2.1 상태 전환 테스트

#### 테스트 케이스 1: 기본 플로우
```typescript
describe('Day Checkin Machine - 기본 플로우', () => {
  it('idle → emotion_modal_open → emotion_selected → chatting', () => {
    let state = initialDayCheckinState;
    
    // 1. 감정 모달 열기
    state = dayCheckinReducer(state, { type: 'OPEN_EMOTION_MODAL' });
    expect(state.type).toBe('emotion_modal_open');
    
    // 2. 감정 선택
    state = dayCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.JOY });
    expect(state.type).toBe('emotion_selected');
    expect(state.emotion).toBe(EmotionType.JOY);
    expect(state.intensity).toBe(5);
    
    // 3. 강도 변경
    state = dayCheckinReducer(state, { type: 'CHANGE_INTENSITY', intensity: 7 });
    expect(state.type).toBe('emotion_selected');
    expect(state.intensity).toBe(7);
    
    // 4. 감정 확인 (채팅 시작)
    state = dayCheckinReducer(state, { type: 'CONFIRM_EMOTION' });
    expect(state.type).toBe('chatting');
    expect(state.messages).toEqual([]);
    expect(state.input).toBe('');
  });
});
```

#### 테스트 케이스 2: 채팅 플로우
```typescript
describe('Day Checkin Machine - 채팅 플로우', () => {
  it('메시지 전송 → AI 응답 → 태그 선택 → 저장', () => {
    const chattingState: DayCheckinState = {
      type: 'chatting',
      emotion: EmotionType.JOY,
      intensity: 7,
      messages: [],
      input: '안녕하세요'
    };
    
    let state = chattingState;
    
    // 1. 메시지 전송
    state = dayCheckinReducer(state, { type: 'SEND_MESSAGE', message: '안녕하세요' });
    expect(state.type).toBe('ai_responding');
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe('user');
    expect(state.messages[0].content).toBe('안녕하세요');
    
    // 2. AI 응답 성공
    state = dayCheckinReducer(state, { type: 'AI_RESPONSE_SUCCESS', response: '안녕하세요!' });
    expect(state.type).toBe('chatting');
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1].role).toBe('assistant');
    expect(state.messages[1].content).toBe('안녕하세요!');
    
    // 3. 태그 단계 표시
    state = dayCheckinReducer(state, { type: 'SHOW_TAG_STEP' });
    expect(state.type).toBe('tag_selecting');
    expect(state.tags).toEqual([]);
    
    // 4. 태그 업데이트
    state = dayCheckinReducer(state, { type: 'UPDATE_TAGS', tags: ['일상', '업무'] });
    expect(state.type).toBe('tag_selecting');
    expect(state.tags).toEqual(['일상', '업무']);
    
    // 5. 저장 요청
    state = dayCheckinReducer(state, { type: 'REQUEST_SAVE' });
    expect(state.type).toBe('saving');
    expect(state.retryCount).toBe(0);
    
    // 6. 저장 성공
    state = dayCheckinReducer(state, { type: 'SAVE_SUCCESS' });
    expect(state.type).toBe('saved');
  });
});
```

### 2.2 에러 케이스 테스트

#### 테스트 케이스 3: AI 응답 에러
```typescript
describe('Day Checkin Machine - 에러 케이스', () => {
  it('AI 응답 에러 시 채팅 상태로 복귀', () => {
    const aiRespondingState: DayCheckinState = {
      type: 'ai_responding',
      emotion: EmotionType.JOY,
      intensity: 7,
      messages: [{ id: '1', role: 'user', content: '테스트', timestamp: new Date() }]
    };
    
    const state = dayCheckinReducer(aiRespondingState, { 
      type: 'AI_RESPONSE_ERROR', 
      error: '연결 오류' 
    });
    
    expect(state.type).toBe('chatting');
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1].role).toBe('assistant');
    expect(state.messages[1].content).toContain('연결 오류');
  });
  
  it('저장 실패 시 에러 상태로 전환', () => {
    const savingState: DayCheckinState = {
      type: 'saving',
      emotion: EmotionType.JOY,
      intensity: 7,
      messages: [],
      tags: [],
      retryCount: 3
    };
    
    const state = dayCheckinReducer(savingState, { 
      type: 'SAVE_ERROR', 
      error: '저장 실패' 
    });
    
    expect(state.type).toBe('error');
    expect(state.error).toBe('저장 실패');
  });
});
```

### 2.3 위기 감지 테스트

#### 테스트 케이스 4: 위기 감지
```typescript
describe('Day Checkin Machine - 위기 감지', () => {
  it('위기 감지 시 crisis_detected 상태로 전환', () => {
    const chattingState: DayCheckinState = {
      type: 'chatting',
      emotion: EmotionType.SADNESS,
      intensity: 10,
      messages: [],
      input: ''
    };
    
    const state = dayCheckinReducer(chattingState, { type: 'CRISIS_DETECTED' });
    
    expect(state.type).toBe('crisis_detected');
    expect(state.returnState).toEqual(chattingState);
  });
  
  it('위기 처리 후 원래 상태로 복귀', () => {
    const returnState: DayCheckinState = {
      type: 'chatting',
      emotion: EmotionType.SADNESS,
      intensity: 10,
      messages: [],
      input: ''
    };
    
    const crisisState: DayCheckinState = {
      type: 'crisis_detected',
      returnState
    };
    
    const state = dayCheckinReducer(crisisState, { type: 'CRISIS_HANDLED' });
    
    expect(state).toEqual(returnState);
  });
});
```

### 2.4 액션 플로우 테스트

#### 테스트 케이스 5: 마이크로 액션 플로우
```typescript
describe('Day Checkin Machine - 액션 플로우', () => {
  it('액션 생성 → 표시 → 피드백 → 완료', () => {
    const chattingState: DayCheckinState = {
      type: 'chatting',
      emotion: EmotionType.JOY,
      intensity: 7,
      messages: [],
      input: ''
    };
    
    let state = chattingState;
    
    // 1. 액션 생성 시작
    state = dayCheckinReducer(state, { type: 'GENERATE_ACTION' });
    expect(state.type).toBe('action_loading');
    
    // 2. 액션 로드 성공
    state = dayCheckinReducer(state, {
      type: 'ACTION_LOADED',
      actionId: 'action-1',
      actionTitle: '심호흡',
      actionDescription: '3번 깊게 숨을 들이마시고 내쉬세요',
      actionDuration: '1 min'
    });
    expect(state.type).toBe('action_showing');
    expect(state.actionTitle).toBe('심호흡');
    
    // 3. 피드백 시작
    state = dayCheckinReducer(state, { type: 'START_ACTION_FEEDBACK' });
    expect(state.type).toBe('action_feedback');
    
    // 4. 피드백 완료
    state = dayCheckinReducer(state, { type: 'COMPLETE_ACTION_FEEDBACK', before: 7, after: 5 });
    expect(state.type).toBe('chatting');
  });
});
```

---

## 3. Night 체크인 상태 머신 테스트

### 3.1 상태 전환 테스트

#### 테스트 케이스 6: Night Mode 기본 플로우
```typescript
describe('Night Checkin Machine - 기본 플로우', () => {
  it('idle → emotion → diary → analyzing → letter → saving → saved', () => {
    let state = initialNightCheckinState;
    
    // 1. 시작
    state = nightCheckinReducer(state, { type: 'START' });
    expect(state.type).toBe('emotion');
    
    // 2. 감정 선택
    state = nightCheckinReducer(state, { type: 'SELECT_EMOTION', emotion: EmotionType.PEACE });
    expect(state.type).toBe('emotion');
    expect(state.emotion).toBe(EmotionType.PEACE);
    
    // 3. 강도 변경
    state = nightCheckinReducer(state, { type: 'CHANGE_INTENSITY', intensity: 6 });
    expect(state.intensity).toBe(6);
    
    // 4. 일기 단계로 이동
    state = nightCheckinReducer(state, { type: 'NEXT_TO_DIARY', dayModeSummary: '오늘 하루 요약' });
    expect(state.type).toBe('diary');
    expect(state.dayModeSummary).toBe('오늘 하루 요약');
    
    // 5. 일기 작성
    state = nightCheckinReducer(state, { type: 'UPDATE_DIARY', diary: '오늘은 평온한 하루였다.' });
    expect(state.type).toBe('diary');
    expect(state.diary).toBe('오늘은 평온한 하루였다.');
    
    // 6. 분석 시작
    state = nightCheckinReducer(state, { type: 'ANALYZE_DIARY' });
    expect(state.type).toBe('analyzing');
    
    // 7. 편지 생성 성공
    state = nightCheckinReducer(state, { type: 'LETTER_SUCCESS', letter: '당신을 위한 편지...' });
    expect(state.type).toBe('letter');
    expect(state.letter).toBe('당신을 위한 편지...');
    
    // 8. 저장 성공
    state = nightCheckinReducer(state, { type: 'SAVE_SUCCESS' });
    expect(state.type).toBe('saved');
  });
});
```

---

## 4. 헬퍼 함수 테스트

### 4.1 데이터 추출 함수 테스트

```typescript
describe('Day Checkin Machine - 헬퍼 함수', () => {
  it('상태에서 감정 추출', () => {
    const state: DayCheckinState = {
      type: 'chatting',
      emotion: EmotionType.JOY,
      intensity: 7,
      messages: [],
      input: ''
    };
    
    expect(getEmotionFromState(state)).toBe(EmotionType.JOY);
  });
  
  it('상태에서 강도 추출', () => {
    const state: DayCheckinState = {
      type: 'chatting',
      emotion: EmotionType.JOY,
      intensity: 8,
      messages: [],
      input: ''
    };
    
    expect(getIntensityFromState(state)).toBe(8);
  });
  
  it('상태 타입 체크 함수들', () => {
    const chattingState: DayCheckinState = {
      type: 'chatting',
      emotion: EmotionType.JOY,
      intensity: 7,
      messages: [],
      input: ''
    };
    
    expect(isChatting(chattingState)).toBe(true);
    expect(isIdle(chattingState)).toBe(false);
    expect(isAIResponding(chattingState)).toBe(false);
  });
});
```

---

## 5. 테스트 실행 방법

### 5.1 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# Watch 모드
npm run test:watch

# 커버리지 포함
npm run test:coverage
```

### 5.2 테스트 커버리지 목표

- **함수 커버리지**: 100%
- **라인 커버리지**: 90% 이상
- **브랜치 커버리지**: 85% 이상

---

## 6. 구현 우선순위

1. **Phase 1**: 기본 상태 전환 테스트 (Day/Night)
2. **Phase 2**: 에러 케이스 테스트
3. **Phase 3**: 위기 감지 테스트
4. **Phase 4**: 액션 플로우 테스트
5. **Phase 5**: 헬퍼 함수 테스트

---

## 7. 참고

- 테스트 파일 위치: `src/features/checkin/__tests__/`
- 테스트 파일 명명: `*.test.ts` 또는 `*.spec.ts`
- Mock 데이터: `src/test/mocks/`
