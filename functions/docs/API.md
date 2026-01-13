# INEESm Firebase Functions API

## 개요

INEESm은 Gemini API 기반의 감정 일기 및 AI 코칭 서비스입니다.
모든 API는 Firebase Callable Functions로 구현되어 있으며, `asia-northeast3` (서울) 리전에서 실행됩니다.

### 기본 정보

- **Base URL**: `https://asia-northeast3-iness-mlog.cloudfunctions.net`
- **인증**: Firebase Authentication (Anonymous Auth 지원)
- **리전**: asia-northeast3 (서울)

---

## API 목록

| 함수명 | 용도 | 모델 | 타임아웃 | 메모리 |
|--------|------|------|----------|--------|
| `generateDayModeResponse` | Day Mode 채팅 | gemini-3-pro | 90s | 512MB |
| `generateNightModeLetter` | Night Mode 편지 | gemini-3-pro | 60s | 512MB |
| `generateMonthlyNarrative` | 월간 회고록 | gemini-3-flash | 60s | 512MB |
| `generateHealingContent` | 큐레이션 콘텐츠 | gemini-3-flash + Grounding | 60s | 1GB |
| `generateChatbotResponse` | AI 챗봇 | gemini-3-pro | 60s | 512MB |
| `generateMicroAction` | 마이크로 액션 | gemini-3-flash | 30s | 512MB |
| `generateTimelineAnalysis` | 타임라인 분석 | gemini-3-flash | 30s | 512MB |

---

## 1. generateDayModeResponse

### 설명
낮 시간대에 사용자의 감정을 빠르게 파악하고 실용적인 피드백을 제공합니다.

### 요청

```typescript
interface Request {
  userMessage: string;      // 필수: 사용자 메시지 (최대 10,000자)
  history?: string[];       // 선택: 이전 대화 기록 (최대 20개)
  persona: CoachPersona;    // 필수: 페르소나 설정
}
```

### 응답

```typescript
interface Response {
  success: boolean;
  data?: string;            // 성공 시: 생성된 응답
  error?: string;           // 실패 시: 에러 메시지
  fallback?: string;        // 실패 시: 폴백 메시지
}
```

### 사용 예시

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(app, 'asia-northeast3');
const generateDayModeResponse = httpsCallable(functions, 'generateDayModeResponse');

const result = await generateDayModeResponse({
  userMessage: "오늘 회의가 너무 힘들었어요",
  history: ["이전 메시지 1", "이전 메시지 2"],
  persona: {
    name: "마음이",
    role: "friend",
    mbti: "INFJ",
    traits: { warmth: 80, directness: 40 }
  }
});

console.log(result.data);
// { success: true, data: "힘든 회의 후에는 잠시 휴식이 필요해요..." }
```

---

## 2. generateNightModeLetter

### 설명
밤 시간대에 사용자의 일기를 읽고 하루를 정리해주는 따뜻한 편지를 작성합니다.

### 요청

```typescript
interface Request {
  diaryEntry: string;       // 필수: 사용자 일기 내용
  persona: CoachPersona;    // 필수: 페르소나 설정
}
```

### 응답

```typescript
interface Response {
  success: boolean;
  data?: string;            // 성공 시: 생성된 편지
  error?: string;
  fallback?: string;
}
```

---

## 3. generateMonthlyNarrative

### 설명
사용자의 한 달 감정 데이터를 바탕으로 서사적인 회고록을 작성합니다.

### 요청

```typescript
interface Request {
  summary?: string;         // 선택: 월간 감정 데이터 요약
}
```

---

## 4. generateHealingContent

### 설명
Google Search Grounding을 사용하여 사용자의 감정 상태에 맞는 콘텐츠를 생성합니다.

### 요청

```typescript
interface Request {
  emotionState: string;     // 필수: 현재 감정 상태
  persona: CoachPersona;    // 필수: 페르소나 설정
}
```

### 응답

```typescript
interface Response {
  success: boolean;
  data?: {
    id: string;
    type: 'poem' | 'meditation' | 'insight';
    title: string;
    body: string;
    author: string;
    tags: string[];
    createdAt: string;
    commentary: string;
    groundingLinks: Array<{ title: string; url: string }>;
  };
  error?: string;
  fallback?: null;
}
```

---

## 5. generateChatbotResponse

### 설명
사용자의 질문에 답하고, 고민을 들어주는 AI 챗봇 응답을 생성합니다.

### 요청

```typescript
interface Request {
  userMessage: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  persona: CoachPersona;
}
```

---

## 6. generateMicroAction

### 설명
5분 이내에 실행 가능한 마이크로 액션을 추천합니다.

### 요청

```typescript
interface Request {
  emotion: string;          // 필수: 현재 감정
  intensity: number;        // 필수: 감정 강도 (1-10)
  userContext?: string;     // 선택: 최근 대화 요약
}
```

### 응답

```typescript
interface Response {
  success: boolean;
  data?: MicroAction;
  error?: string;
  fallback?: MicroAction;   // 실패 시 기본 액션 제공
}

interface MicroAction {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'breathing' | 'journaling' | 'exercise' | 'mindfulness';
}
```

---

## 7. generateTimelineAnalysis

### 설명
감정 타임라인을 분석하여 패턴과 인사이트를 제공합니다.

### 요청

```typescript
interface Request {
  entries: Array<{
    date: string | Date;
    emotion: string;
    intensity?: number;
    summary?: string;
  }>;
}
```

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `invalid-argument` | 필수 파라미터 누락 또는 잘못된 형식 |
| `deadline-exceeded` | 요청 타임아웃 |
| `internal` | 내부 서버 오류 |
| `unavailable` | Gemini API 사용 불가 |
| `permission-denied` | 권한 없음 |

---

## 성능 특성

### Cold Start
- 첫 번째 요청 시 약 2-5초의 Cold Start 지연 발생
- 이후 요청은 Warm 상태에서 처리

### 예상 응답 시간
- `gemini-3-flash`: 1-3초
- `gemini-3-pro`: 2-5초
- Google Search Grounding 포함: 3-8초

### Rate Limit
- maxInstances: 5-10 (함수별 상이)
- 동시 요청 제한은 Firebase 플랜에 따름

---

## 로깅 및 모니터링

모든 함수는 다음 정보를 Cloud Logging에 기록합니다:

- `requestId`: 요청별 고유 ID
- `userId`: 사용자 ID
- `functionName`: 함수 이름
- `durationMs`: 실행 시간
- `memoryUsage`: 메모리 사용량

### 로그 조회

```bash
gcloud logging read "resource.type=cloud_function AND resource.labels.function_name=generateDayModeResponse" --project=iness-mlog
```
