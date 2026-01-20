# 로직/알고리즘/엔드포인트 맵 검증 보고서

**작성일**: 2026-01-20  
**검증자**: Claude (Composer)  
**검증 방법**: 실제 코드베이스 직접 확인 (파일 시스템, grep, 코드베이스 검색)

---

## 실행 요약

### 전체 검증 결과
- **제시된 위험요인 6건 중 6건 확인됨** (100% 타당성 검증 완료)
- **Critical 2건**: 모두 실제 문제 존재 확인
- **High 2건**: 모두 실제 문제 존재 확인
- **Medium 2건**: 모두 실제 문제 존재 확인

### 주요 발견사항
1. ✅ **Critical 1**: Firestore messages 스키마와 rules 불일치 - **실제 문제 확인**
2. ✅ **Critical 2**: Callable Functions 인증 없이 호출 가능 - **실제 문제 확인**
3. ✅ **High 3**: saveConversation()에 동의 체크 없음 - **실제 문제 확인**
4. ✅ **High 4**: FE/BE timeout 불일치 (3초 vs 30초) - **실제 문제 확인**
5. ✅ **Medium 5**: persona 검증 없음 - **실제 문제 확인**
6. ✅ **Medium 6**: 위기 감지 폴백 false negative 가능성 - **실제 문제 확인**

---

## 1. userId 생성/전파 흐름 검증

### 1.1 FE 생성 로직
**파일**: `src/services/auth.ts:27-80`

**검증 결과**: ✅ **정확함**

```typescript
// 실제 코드 확인
export async function ensureAnonymousAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (authPromise) {
    return authPromise; // 경쟁조건 방지
  }
  authPromise = (async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } finally {
      authPromise = null;
    }
  })();
  return authPromise;
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: 제시된 설명과 일치. 경쟁조건 방지 로직도 확인됨.

### 1.2 FE 저장/조회 로직
**파일**: `src/services/firestore.ts:41-47`

**검증 결과**: ✅ **정확함**

```typescript
// 실제 코드 확인
function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to save data');
  }
  return user.uid;
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: `auth.currentUser.uid`를 직접 사용하는 것으로 확인됨.

### 1.3 BE Functions에서의 userId
**파일**: `functions/src/api/gemini.ts:32, 109, 180, 238, 359, 432, 541`

**검증 결과**: ✅ **정확함** (하지만 문제 있음 - Critical 2 참조)

```typescript
// 실제 코드 확인
const context = {
  requestId,
  userId: request.auth?.uid || "anonymous", // ⚠️ 인증 없어도 "anonymous"로 처리
  functionName: "generateDayModeResponse",
};
```

**검증 방법**: grep으로 `request.auth` 패턴 검색  
**결과**: 제시된 설명과 일치. `request.auth`가 없으면 "anonymous"로 처리하는 것으로 확인됨.

---

## 2. 컨텍스트 저장 위치 검증

### 2.1 메모리(세션 내)
**파일**: `src/features/checkin/useDayCheckinMachine.ts`

**검증 결과**: ✅ **정확함**

- Day: `useDayCheckinMachine`에서 메시지 히스토리 관리 확인
- Night: `useNightCheckinMachine` 존재 확인 (파일 시그니처 확인)

**검증 방법**: 코드베이스 검색  
**결과**: 제시된 설명과 일치.

### 2.2 localStorage/sessionStorage
**검증 결과**: ✅ **정확함**

- `consent.ts:13`: `consent_conversation_storage` 키 사용 확인
- `firestore.ts:504`: `onboarding_data` 저장 확인

**검증 방법**: grep으로 키워드 검색  
**결과**: 제시된 설명과 일치.

### 2.3 Firestore(영구 저장)
**검증 결과**: ✅ **정확함**

- `src/types/firestore.ts`: 모든 컬렉션 타입 정의 확인
- `FIRESTORE_COLLECTIONS` 상수 확인

**검증 방법**: 파일 직접 읽기  
**결과**: 제시된 설명과 일치.

---

## 3. AI 호출 흐름 검증

### 3.1 FE 래퍼
**파일**: `src/services/ai/gemini.ts`

**검증 결과**: ✅ **정확함**

```typescript
// 실제 코드 확인
export const generateDayModeResponse = async (
  userMessage: string,
  history: string[],
  persona: CoachPersona
): Promise<string> => {
  const response = await callWithPolicy<DayModeResponse>(
    () => callFunction<{...}, DayModeResponse>('generateDayModeResponse', {...}),
    {
      timeout: 3000, // ⚠️ 3초
      maxRetries: 2,
      fallback: () => ({...}),
    }
  );
  // ...
};
```

**검증 방법**: 파일 직접 읽기  
**결과**: 제시된 설명과 일치. `callFunction`을 통해 호출하는 것으로 확인됨.

### 3.2 호출 공통
**파일**: `src/services/functions.ts:27-57`

**검증 결과**: ✅ **정확함**

```typescript
// 실제 코드 확인
export async function callFunction<TRequest, TResponse>(
  functionName: string,
  data: TRequest
): Promise<TResponse> {
  const callable = httpsCallable<TRequest, TResponse>(functionsInstance, functionName);
  const result = await callable(data);
  return result.data as TResponse;
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: 제시된 설명과 일치.

### 3.3 BE 엔드포인트
**파일**: `functions/src/index.ts`, `functions/src/api/gemini.ts`

**검증 결과**: ✅ **정확함**

**확인된 함수들**:
- `generateDayModeResponse` ✅
- `generateNightModeLetter` ✅
- `generateMonthlyNarrative` ✅
- `generateHealingContent` ✅
- `generateChatbotResponse` ✅
- `generateMicroAction` ✅
- `generateTimelineAnalysis` ✅

**검증 방법**: 파일 직접 읽기  
**결과**: 제시된 설명과 일치. 모든 함수가 `functions/src/index.ts`에서 export됨.

---

## 4. 잠재 위험요인 검증

### Critical 1) Firestore Rules ↔ 메시지 스키마 불일치

**검증 결과**: ✅ **실제 문제 확인됨**

#### Rules 요구사항
**파일**: `firestore.rules:24-29`

```javascript
match /messages/{messageId} {
  allow read: if isOwner(resource.data.userId);
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if isOwner(resource.data.userId);
  allow delete: if isOwner(resource.data.userId);
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: `messages` 문서에 `userId` 필드가 **필수**로 요구됨.

#### 실제 저장 로직
**파일**: `src/services/firestore.ts:88-98`

```typescript
// 메시지들 배치로 추가
const messagesCollection = collection(db, FIRESTORE_COLLECTIONS.MESSAGES);
conversationData.messages.forEach((message) => {
  const messageRef = doc(messagesCollection);
  batch.set(messageRef, {
    conversationId: conversationRef.id,
    role: message.role,
    content: message.content,
    timestamp: serverTimestamp(),
    // ❌ userId 필드 없음!
  });
});
```

**검증 방법**: 파일 직접 읽기  
**결과**: 메시지 저장 시 `userId` 필드가 **누락**됨.

#### 타입 정의
**파일**: `src/types/firestore.ts:26-32`

```typescript
export interface FirestoreChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: FirestoreTimestamp;
  conversationId: string;
  // ❌ userId 필드 없음!
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: 타입 정의에도 `userId` 필드가 **없음**.

#### 영향 분석
**파일**: `src/hooks/useRealtime.ts:226-230`

```typescript
const q = query(
  collection(db, FIRESTORE_COLLECTIONS.MESSAGES),
  where('conversationId', '==', conversationId),
  orderBy('timestamp', 'asc')
);
```

**검증 방법**: 파일 직접 읽기  
**결과**: `useRealtimeMessages`는 `conversationId`로만 쿼리하므로, rules의 `userId` 체크와 충돌할 가능성 있음.

**최종 판정**: ✅ **Critical 문제 확인됨**
- Rules는 `userId` 필수 요구
- 실제 저장 로직은 `userId` 누락
- 배치 커밋 시 rules 위반으로 실패 가능성 높음
- `useRealtimeMessages`도 rules 위반 가능성 있음

---

### Critical 2) Callable Functions 인증 없이 호출 가능

**검증 결과**: ✅ **실제 문제 확인됨**

#### Functions 코드 확인
**파일**: `functions/src/api/gemini.ts:32, 109, 180, 238, 359, 432, 541`

```typescript
const context = {
  requestId,
  userId: request.auth?.uid || "anonymous", // ⚠️ 인증 없어도 "anonymous"로 처리
  functionName: "generateDayModeResponse",
};
```

**검증 방법**: grep으로 `request.auth` 패턴 검색  
**결과**: 모든 함수에서 `request.auth`가 없어도 "anonymous"로 처리하며 계속 진행됨.

#### 인증 체크 부재 확인
**파일**: `functions/src/api/gemini.ts:24-88` (generateDayModeResponse 예시)

```typescript
export const generateDayModeResponse = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30,
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    return await measurePerformance(
      "generateDayModeResponse",
      request,
      async () => {
        // ❌ request.auth 체크 없음
        const {userMessage, history, persona} = request.data;
        // 바로 Gemini 호출 진행
      }
    );
  }
);
```

**검증 방법**: 파일 직접 읽기  
**결과**: 인증 체크 없이 바로 데이터 처리 및 Gemini 호출 진행.

**최종 판정**: ✅ **Critical 문제 확인됨**
- 인증 없이도 함수 호출 가능
- 외부에서 직접 호출 시 비용 폭증/쿼터 소진 위험
- 악의적 호출 방지 메커니즘 없음

---

### High 3) 동의 체크 없이 대화 원문 저장

**검증 결과**: ✅ **실제 문제 확인됨**

#### saveConversation() 확인
**파일**: `src/services/firestore.ts:55-108`

```typescript
export async function saveConversation(
  conversationData: {...}
): Promise<string> {
  try {
    const userId = getCurrentUserId();
    // ❌ canSaveConversation() 체크 없음
    // 바로 저장 진행
    const batch = writeBatch(db);
    // ...
    await batch.commit();
    return conversationRef.id;
  } catch (error) {
    logError('saveConversation', error);
    throw error;
  }
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: `saveConversation()`에 동의 체크가 **없음**.

#### saveDiaryEntry() 비교
**파일**: `src/services/firestore.ts:165-207`

```typescript
export async function saveDiaryEntry(...): Promise<string | null> {
  try {
    // ✅ 동의 확인: 동의 없으면 원문 저장 건너뛰기
    const hasConsent = await canSaveConversation();
    if (!hasConsent) {
      return null; // 동의 없음: 일기 원문 저장 건너뛰기
    }
    // ...
  }
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: `saveDiaryEntry()`는 동의 체크가 **있음**. `saveConversation()`과 불일치.

#### canSaveConversation() 함수 확인
**파일**: `src/services/consent.ts:148-151`

```typescript
export async function canSaveConversation(): Promise<boolean> {
  const state = await getConsentState();
  return state.conversationStorage;
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: 동의 체크 함수는 존재하지만 `saveConversation()`에서 사용되지 않음.

**최종 판정**: ✅ **High 문제 확인됨**
- `saveConversation()`에 동의 체크 없음
- `saveDiaryEntry()`는 동의 체크 있음 (불일치)
- 동의 없이도 대화 원문 저장 가능 (프라이버시 리스크)

---

### High 4) Timeout/Retry 정책 불일치

**검증 결과**: ✅ **실제 문제 확인됨**

#### FE Timeout 설정
**파일**: `src/services/ai/gemini.ts:60, 92, 118, 150, 185, 228, 254`

```typescript
const response = await callWithPolicy<DayModeResponse>(
  () => callFunction<{...}, DayModeResponse>('generateDayModeResponse', {...}),
  {
    timeout: 3000, // ⚠️ 3초
    maxRetries: 2,
    fallback: () => ({...}),
  }
);
```

**검증 방법**: 파일 직접 읽기  
**결과**: FE는 `timeout: 3000ms` (3초)로 설정됨.

#### BE Timeout 설정
**파일**: `functions/src/api/gemini.ts:17-23`

```typescript
export const generateDayModeResponse = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30, // ⚠️ 30초
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    // ...
  }
);
```

**검증 방법**: 파일 직접 읽기  
**결과**: BE는 `timeoutSeconds: 30` (30초)로 설정됨.

#### API Policy 확인
**파일**: `src/services/apiPolicy.ts:90-122`

```typescript
export async function callWithPolicy<T>(
  apiCall: () => Promise<T>,
  options: ApiPolicyOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = TIME_CONSTANTS.API_TIMEOUT, // 기본값 확인 필요
    maxRetries = TIME_CONSTANTS.MAX_RETRIES,
    // ...
  } = options;
  
  // 타임아웃과 API 호출을 경쟁
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);
  });
  
  const result = await Promise.race([
    apiCall().finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    }),
    timeoutPromise
  ]);
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: FE는 3초 타임아웃으로 폴백 처리하지만, BE는 계속 실행됨.

**최종 판정**: ✅ **High 문제 확인됨**
- FE: 3초 타임아웃 → 폴백 처리
- BE: 30초 타임아웃 → 계속 실행
- FE 재시도마다 BE에서 실제 Gemini 호출 발생 가능
- 중복 호출로 인한 비용 낭비 및 UX 불안정

---

### Medium 5) 프롬프트 인젝션/페르소나 변조 가능성

**검증 결과**: ✅ **실제 문제 확인됨**

#### Persona 전달 확인
**파일**: `src/services/ai/gemini.ts:44-58`

```typescript
export const generateDayModeResponse = async (
  userMessage: string,
  history: string[],
  persona: CoachPersona // ⚠️ 클라이언트에서 그대로 전달
): Promise<string> => {
  const response = await callWithPolicy<DayModeResponse>(
    () => callFunction<{
      userMessage: string;
      history: string[];
      persona: CoachPersona; // ⚠️ 그대로 전달
    }, DayModeResponse>('generateDayModeResponse', {
      userMessage,
      history,
      persona, // ⚠️ 검증 없이 전달
    }),
    // ...
  );
};
```

**검증 방법**: 파일 직접 읽기  
**결과**: `persona`가 클라이언트에서 그대로 전달됨.

#### BE에서의 Persona 처리
**파일**: `functions/src/api/gemini.ts:40-49`

```typescript
const {userMessage, history, persona} = request.data;

if (!userMessage || !persona) {
  throw new HttpsError("invalid-argument", "userMessage and persona are required");
}

// ❌ persona 검증 없음
const systemInstruction = getSystemInstruction(persona);
```

**검증 방법**: 파일 직접 읽기  
**결과**: `persona` 존재 여부만 체크하고, 내용 검증은 없음.

#### sanitizeUserInput 확인
**파일**: `functions/src/api/gemini.ts:50`

```typescript
const sanitizedMessage = sanitizeUserInput(userMessage);
const sanitizedHistory = (history || []).slice(-20).map(
  (h: string) => sanitizeUserInput(h)
);
```

**검증 방법**: 파일 직접 읽기  
**결과**: `userMessage`와 `history`는 sanitize되지만, `persona`는 sanitize되지 않음.

**최종 판정**: ✅ **Medium 문제 확인됨**
- `persona`가 클라이언트에서 그대로 전달됨
- BE에서 `persona` 검증/정규화 없음
- 앱 외부에서 호출 시 프롬프트 품질/안전성 저하 가능

---

### Medium 6) 위기 감지 Fail-safe 문제

**검증 결과**: ✅ **실제 문제 확인됨**

#### 위기 감지 로직 확인
**파일**: `src/services/crisisDetection.ts:270-292`

```typescript
async function detectCrisisWithGemini(message: string): Promise<GeminiCrisisResult> {
  try {
    // Gemini 호출
    const response = await generateChatbotResponse(prompt, [], defaultPersona);
    // JSON 파싱 및 반환
    return result;
  } catch (error) {
    console.error('Gemini 위기 감지 실패:', error);

    // P0 수정: Gemini 실패시 키워드 기반 폴백
    if (message) {
      const normalizedText = message.toLowerCase().replace(/\s+/g, '');
      const detectedCriticalKeywords = CRITICAL_FALLBACK_KEYWORDS.filter(keyword =>
        normalizedText.includes(keyword.replace(/\s+/g, ''))
      );

      if (detectedCriticalKeywords.length > 0) {
        return {
          isCrisis: true,
          severity: 'high',
          reason: `키워드 폴백 감지: ${detectedCriticalKeywords.join(', ')}`
        };
      }
    }

    // ⚠️ Critical 키워드 없으면 안전하게 false 반환
    return { isCrisis: false, severity: 'none' };
  }
}
```

**검증 방법**: 파일 직접 읽기  
**결과**: Gemini 실패 시 Critical 키워드만 체크하고, 없으면 `false` 반환.

#### Critical 키워드 목록 확인
**파일**: `src/services/crisisDetection.ts:36-39`

```typescript
const CRITICAL_FALLBACK_KEYWORDS = [
  '자살', '죽고싶', '죽을', '자해', '손목', '목숨',
  '약물과다', '극단적', '더이상못', '살기싫', '끝내고싶'
];
```

**검증 방법**: 파일 직접 읽기  
**결과**: Critical 키워드 목록은 있지만, 모든 위기 상황을 커버하지 못할 수 있음.

**최종 판정**: ✅ **Medium 문제 확인됨**
- Gemini 실패 시 Critical 키워드만 체크
- 키워드 없으면 `false` 반환 (false negative 가능성)
- 더 보수적인 정책 필요 (예: 키워드 없어도 감정 강도 높으면 위기로 판단)

---

## 5. 개선안 타당성 검증

### 개선안 1) Firestore messages 스키마와 rules 일치

**제안 내용**: 메시지 문서에 `userId` 추가

**검증 결과**: ✅ **타당함**

**현재 상태**:
- Rules: `userId` 필수 요구
- 저장 로직: `userId` 누락
- 타입 정의: `userId` 없음

**수정 필요 위치**:
1. `src/services/firestore.ts:92-97` - `batch.set()`에 `userId` 추가
2. `src/types/firestore.ts:26-32` - `FirestoreChatMessage`에 `userId` 필드 추가

**완료 기준**: ✅ **명확함**
- Day 체크인 저장 시 배치 커밋 성공
- `useRealtimeMessages` 정상 수신

---

### 개선안 2) 동의 없으면 원문 저장 강제

**제안 내용**: `saveConversation()`에 `canSaveConversation()` 체크 추가

**검증 결과**: ✅ **타당함**

**현재 상태**:
- `saveDiaryEntry()`: 동의 체크 있음 ✅
- `saveConversation()`: 동의 체크 없음 ❌

**수정 필요 위치**:
- `src/services/firestore.ts:55-108` - `saveConversation()` 시작부에 동의 체크 추가

**완료 기준**: ✅ **명확함**
- 동의 거부 상태에서 대화 원문이 Firestore에 생성되지 않음
- 동의 승인 상태에서만 원문 저장됨

---

### 개선안 3) Functions 보호: 인증 강제

**제안 내용**: 각 `onCall` 함수에 `request.auth` 필수화

**검증 결과**: ✅ **타당함**

**현재 상태**:
- 모든 함수에서 `request.auth` 체크 없음
- `request.auth?.uid || "anonymous"`로 처리

**수정 필요 위치**:
- `functions/src/api/gemini.ts` - 각 함수 시작부에 인증 체크 추가

**예시 수정 코드**:
```typescript
export const generateDayModeResponse = onCall(
  {...},
  async (request) => {
    // ✅ 추가 필요
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }
    
    return await measurePerformance(...);
  }
);
```

**완료 기준**: ✅ **명확함**
- 인증 없는 외부 호출이 `unauthenticated`로 차단
- 정상 앱 플로우에서는 익명 Auth 후 호출 성공

---

### 개선안 4) 프롬프트/컨텍스트 안전성 강화

**제안 내용**: 
- 페르소나를 서버에서 userProfiles 기반으로 로드
- 히스토리 토큰/글자 수 캡
- 시스템 인스트럭션 분리

**검증 결과**: ⚠️ **부분 타당함**

**현재 상태**:
- `persona`가 클라이언트에서 그대로 전달됨
- 히스토리는 `slice(-20)`으로만 제한 (토큰/글자 수 제한 없음)
- 시스템 인스트럭션이 프롬프트 문자열에 포함됨

**수정 필요 위치**:
1. `functions/src/api/gemini.ts` - `persona` 검증/정규화 추가
2. `functions/src/api/gemini.ts` - 히스토리 토큰/글자 수 캡 추가
3. `functions/src/services/gemini.ts` - 시스템 인스트럭션 분리 (구현 복잡도 높음)

**완료 기준**: ✅ **명확함**
- 변조된 `persona` 입력으로도 서버가 거부/정규화
- 히스토리 과다 입력에도 안정적으로 응답

**우선순위**: Medium (Critical/High 해결 후)

---

### 개선안 5) Timeout/Retry 정책 정렬

**제안 내용**: 
- FE timeout을 10~20초로 상향
- 또는 FE 재시도 제거, 서버에서 idempotency 고려

**검증 결과**: ✅ **타당함**

**현재 상태**:
- FE: 3초 timeout, 2회 재시도
- BE: 30초 timeout

**수정 필요 위치**:
1. `src/services/ai/gemini.ts` - timeout 값 조정
2. 또는 `functions/src/api/gemini.ts` - idempotency 키 추가

**완료 기준**: ✅ **명확함**
- 동일 입력에서 중복 Gemini 호출 횟수 감소
- 폴백 노출 빈도 감소

**권장안**: FE timeout을 15초로 상향 (BE 30초의 절반)

---

## 6. 최종 제언

### 우선순위별 수정 계획

#### Phase 1: Critical 수정 (즉시)
1. ✅ **Critical 1**: `saveConversation()`에 `userId` 추가
   - `src/services/firestore.ts:92-97`
   - `src/types/firestore.ts:26-32`
   - 예상 소요 시간: 30분

2. ✅ **Critical 2**: Functions 인증 강제
   - `functions/src/api/gemini.ts` 모든 함수에 인증 체크 추가
   - 예상 소요 시간: 1시간

#### Phase 2: High 수정 (1주일 내)
3. ✅ **High 3**: `saveConversation()`에 동의 체크 추가
   - `src/services/firestore.ts:55-108`
   - 예상 소요 시간: 30분

4. ✅ **High 4**: Timeout 정책 정렬
   - `src/services/ai/gemini.ts` timeout 값 조정 (3초 → 15초)
   - 예상 소요 시간: 30분

#### Phase 3: Medium 수정 (1개월 내)
5. ⚠️ **Medium 5**: 프롬프트 안전성 강화
   - `persona` 검증/정규화 추가
   - 히스토리 토큰/글자 수 캡 추가
   - 예상 소요 시간: 4시간

6. ⚠️ **Medium 6**: 위기 감지 Fail-safe 강화
   - 키워드 없어도 감정 강도 높으면 위기로 판단
   - 예상 소요 시간: 2시간

---

### 검증 완료 요약

| 위험요인 | 심각도 | 검증 결과 | 타당성 |
|---------|--------|----------|--------|
| Firestore Rules 불일치 | Critical | ✅ 확인됨 | 100% 타당 |
| Functions 인증 없음 | Critical | ✅ 확인됨 | 100% 타당 |
| 동의 체크 없음 | High | ✅ 확인됨 | 100% 타당 |
| Timeout 불일치 | High | ✅ 확인됨 | 100% 타당 |
| 프롬프트 인젝션 | Medium | ✅ 확인됨 | 100% 타당 |
| 위기 감지 Fail-safe | Medium | ✅ 확인됨 | 100% 타당 |

**전체 검증 완료율**: 6/6 (100%)

---

### 추가 권장사항

1. **테스트 계획**
   - Critical 1 수정 후: Day 체크인 저장 테스트
   - Critical 2 수정 후: 인증 없는 호출 차단 테스트
   - High 3 수정 후: 동의 거부 상태에서 저장 테스트

2. **모니터링**
   - Functions 호출 로그에서 인증 실패율 모니터링
   - Gemini API 호출 중복률 모니터링
   - 위기 감지 false negative율 모니터링

3. **문서화**
   - 수정 완료 후 아키텍처 문서 업데이트
   - 보안 정책 문서 업데이트

---

**검증 완료일**: 2026-01-20  
**검증 방법**: 실제 코드베이스 직접 확인 (파일 시스템, grep, 코드베이스 검색)  
**검증 도구**: `read_file`, `grep`, `codebase_search`, `glob_file_search`
