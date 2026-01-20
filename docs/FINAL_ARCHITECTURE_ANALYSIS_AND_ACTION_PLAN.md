# 마음로그 V5.0 최종 아키텍처 분석 및 실행 계획

**작성일**: 2026-01-20  
**작성자**: Claude (Composer)  
**검증 방법**: 실제 코드베이스 직접 확인 (파일 시스템, grep, 코드베이스 검색)

---

## 📋 목차

1. [실행 요약](#실행-요약)
2. [아키텍처 위험요인 분석](#아키텍처-위험요인-분석)
3. [백엔드 GCP API 연동 플랜](#백엔드-gcp-api-연동-플랜)
4. [통합 우선순위 및 실행 계획](#통합-우선순위-및-실행-계획)
5. [예상 일정 및 리소스](#예상-일정-및-리소스)
6. [비용 분석](#비용-분석)

---

## 실행 요약

### 전체 현황

| 구분 | 항목 수 | 상태 |
|------|--------|------|
| **Critical 위험요인** | 2건 | 🔴 즉시 수정 필요 |
| **High 위험요인** | 2건 | 🟠 1주일 내 수정 |
| **Medium 위험요인** | 2건 | 🟡 1개월 내 수정 |
| **GCP API 연동** | 4개 Phase | 📅 18일 계획 |
| **총 작업량** | 10건 | ⏱️ 약 4주 |

### 핵심 발견사항

1. 🔴 **Critical**: Firestore messages 스키마와 rules 불일치로 저장 실패 가능성
2. 🔴 **Critical**: Functions 인증 없이 호출 가능 (비용/악용 리스크)
3. 🟠 **High**: 동의 체크 없이 대화 원문 저장 (프라이버시 리스크)
4. 🟠 **High**: FE/BE timeout 불일치로 중복 호출 발생
5. 🟡 **Medium**: 프롬프트 인젝션/페르소나 변조 가능성
6. 🟡 **Medium**: 위기 감지 Fail-safe 개선 필요

### 권장 실행 순서

```
Week 1: Critical 수정 (2건) + Phase 1 시작
Week 2: High 수정 (2건) + Phase 1 완료 + Phase 2 시작
Week 3: Phase 2-3 완료 + Phase 4 시작
Week 4: Phase 4 완료 + Medium 수정 (2건) + 통합 테스트
```

---

## 아키텍처 위험요인 분석

### Critical 1) Firestore Rules ↔ 메시지 스키마 불일치

**심각도**: 🔴 Critical  
**영향**: Day 체크인 저장 실패, 메시지 실시간 조회 불가

#### 문제 분석

**Rules 요구사항** (`firestore.rules:24-29`):
```javascript
match /messages/{messageId} {
  allow read: if isOwner(resource.data.userId);
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  // userId 필수!
}
```

**실제 저장 로직** (`src/services/firestore.ts:88-98`):
```typescript
batch.set(messageRef, {
  conversationId: conversationRef.id,
  role: message.role,
  content: message.content,
  timestamp: serverTimestamp(),
  // ❌ userId 필드 누락!
});
```

**타입 정의** (`src/types/firestore.ts:26-32`):
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

#### 수정 계획

**파일**: `src/services/firestore.ts:92-97`
```typescript
batch.set(messageRef, {
  userId, // ✅ 추가
  conversationId: conversationRef.id,
  role: message.role,
  content: message.content,
  timestamp: serverTimestamp(),
});
```

**파일**: `src/types/firestore.ts:26-32`
```typescript
export interface FirestoreChatMessage {
  id: string;
  userId: string; // ✅ 추가
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: FirestoreTimestamp;
  conversationId: string;
}
```

**예상 소요 시간**: 30분  
**테스트**: Day 체크인 저장 → 배치 커밋 성공 확인

---

### Critical 2) Callable Functions 인증 없이 호출 가능

**심각도**: 🔴 Critical  
**영향**: 외부에서 직접 호출 가능 → 비용 폭증/쿼터 소진

#### 문제 분석

**현재 코드** (`functions/src/api/gemini.ts:32`):
```typescript
const context = {
  requestId,
  userId: request.auth?.uid || "anonymous", // ⚠️ 인증 없어도 "anonymous"로 처리
  functionName: "generateDayModeResponse",
};

// ❌ request.auth 체크 없음
const {userMessage, history, persona} = request.data;
// 바로 Gemini 호출 진행
```

**영향**:
- 앱 외부에서 직접 Functions 호출 가능
- Gemini API 비용 폭증
- 쿼터 소진으로 정상 사용자 영향

#### 수정 계획

**파일**: `functions/src/api/gemini.ts` (모든 함수)

```typescript
export const generateDayModeResponse = onCall(
  {...},
  async (request) => {
    // ✅ 인증 체크 추가
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }
    
    return await measurePerformance(
      "generateDayModeResponse",
      request,
      async () => {
        const context = {
          requestId,
          userId: request.auth.uid, // ✅ "anonymous" 제거
          functionName: "generateDayModeResponse",
        };
        // ...
      }
    );
  }
);
```

**적용 대상 함수** (7개):
- `generateDayModeResponse`
- `generateNightModeLetter`
- `generateMonthlyNarrative`
- `generateHealingContent`
- `generateChatbotResponse`
- `generateMicroAction`
- `generateTimelineAnalysis`

**예상 소요 시간**: 1시간  
**테스트**: 인증 없는 호출 → `unauthenticated` 에러 확인

---

### High 3) 동의 체크 없이 대화 원문 저장

**심각도**: 🟠 High  
**영향**: 프라이버시 리스크, GDPR/개인정보보호법 위반 가능성

#### 문제 분석

**saveConversation()** (`src/services/firestore.ts:55-108`):
```typescript
export async function saveConversation(...): Promise<string> {
  try {
    const userId = getCurrentUserId();
    // ❌ canSaveConversation() 체크 없음
    // 바로 저장 진행
    await batch.commit();
  }
}
```

**saveDiaryEntry() 비교** (`src/services/firestore.ts:165-207`):
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

**불일치**: `saveDiaryEntry()`는 동의 체크 있음, `saveConversation()`은 없음

#### 수정 계획

**파일**: `src/services/firestore.ts:55-108`

```typescript
export async function saveConversation(...): Promise<string | null> {
  try {
    // ✅ 동의 확인 추가
    const hasConsent = await canSaveConversation();
    if (!hasConsent) {
      // 동의 없음: 대화 원문 저장 건너뛰기
      // 감정/태그만 저장 (또는 요약만 저장)
      return null;
    }
    
    const userId = getCurrentUserId();
    // ... 기존 저장 로직
  }
}
```

**예상 소요 시간**: 30분  
**테스트**: 동의 거부 상태 → 대화 원문 Firestore에 생성되지 않음 확인

---

### High 4) Timeout/Retry 정책 불일치

**심각도**: 🟠 High  
**영향**: 중복 호출로 비용 낭비, UX 불안정

#### 문제 분석

**FE Timeout** (`src/services/ai/gemini.ts:60`):
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

**BE Timeout** (`functions/src/api/gemini.ts:17-23`):
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

**문제 시나리오**:
1. FE에서 3초 타임아웃 → 폴백 처리
2. BE는 계속 실행 중 (30초)
3. FE 재시도 → 또 다른 BE 호출 시작
4. 결과: 동일 요청에 대해 여러 Gemini 호출 발생

#### 수정 계획

**권장안**: FE timeout을 15초로 상향 (BE 30초의 절반)

**파일**: `src/services/ai/gemini.ts` (모든 함수)

```typescript
const response = await callWithPolicy<DayModeResponse>(
  () => callFunction<{...}, DayModeResponse>('generateDayModeResponse', {...}),
  {
    timeout: 15000, // ✅ 3초 → 15초로 상향
    maxRetries: 1, // ✅ 2회 → 1회로 감소
    fallback: () => ({...}),
  }
);
```

**대안**: 서버에서 idempotency 키 추가 (구현 복잡도 높음)

**예상 소요 시간**: 30분  
**테스트**: 동일 입력 → 중복 Gemini 호출 횟수 감소 확인

---

### Medium 5) 프롬프트 인젝션/페르소나 변조 가능성

**심각도**: 🟡 Medium  
**영향**: 프롬프트 품질/안전성 저하

#### 문제 분석

**현재 코드** (`src/services/ai/gemini.ts:44-58`):
```typescript
export const generateDayModeResponse = async (
  userMessage: string,
  history: string[],
  persona: CoachPersona // ⚠️ 클라이언트에서 그대로 전달
): Promise<string> => {
  const response = await callWithPolicy<DayModeResponse>(
    () => callFunction<{
      persona: CoachPersona; // ⚠️ 검증 없이 전달
    }, DayModeResponse>('generateDayModeResponse', {
      persona, // ⚠️ 그대로 전달
    }),
  );
};
```

**BE 처리** (`functions/src/api/gemini.ts:40-49`):
```typescript
const {userMessage, history, persona} = request.data;

if (!userMessage || !persona) {
  throw new HttpsError("invalid-argument", "userMessage and persona are required");
}

// ❌ persona 검증 없음
const systemInstruction = getSystemInstruction(persona);
```

#### 수정 계획

**Phase 1**: `persona` 검증/정규화 추가

**파일**: `functions/src/api/gemini.ts`

```typescript
// ✅ persona 검증 함수 추가
function validatePersona(persona: any): CoachPersona {
  if (!persona || typeof persona !== 'object') {
    throw new HttpsError("invalid-argument", "Invalid persona");
  }
  
  // 허용된 필드만 추출
  return {
    name: sanitizeString(persona.name) || 'AI 동반자',
    mbti: ['INFJ', 'ENFP', 'INTJ', 'ENFJ'].includes(persona.mbti) 
      ? persona.mbti 
      : 'INFJ',
    tone: ['warm', 'professional', 'casual'].includes(persona.tone)
      ? persona.tone
      : 'warm',
    traits: Array.isArray(persona.traits) 
      ? persona.traits.slice(0, 5) // 최대 5개
      : [],
  };
}

// 함수 내부에서 사용
const validatedPersona = validatePersona(persona);
const systemInstruction = getSystemInstruction(validatedPersona);
```

**Phase 2**: 히스토리 토큰/글자 수 캡 추가

```typescript
// 히스토리 길이 제한 (토큰 기준 대략 3000자)
const MAX_HISTORY_LENGTH = 3000;
const sanitizedHistory = (history || [])
  .slice(-20)
  .map((h: string) => sanitizeUserInput(h))
  .join('')
  .slice(0, MAX_HISTORY_LENGTH)
  .split('\n')
  .filter(Boolean);
```

**예상 소요 시간**: 4시간  
**우선순위**: Critical/High 해결 후

---

### Medium 6) 위기 감지 Fail-safe 문제

**심각도**: 🟡 Medium  
**영향**: False negative 가능성 (위기 상황 놓침)

#### 문제 분석

**현재 코드** (`src/services/crisisDetection.ts:270-292`):
```typescript
async function detectCrisisWithGemini(message: string): Promise<GeminiCrisisResult> {
  try {
    // Gemini 호출
    const response = await generateChatbotResponse(prompt, [], defaultPersona);
    return result;
  } catch (error) {
    // P0 수정: Gemini 실패시 키워드 기반 폴백
    if (message) {
      const detectedCriticalKeywords = CRITICAL_FALLBACK_KEYWORDS.filter(...);
      if (detectedCriticalKeywords.length > 0) {
        return { isCrisis: true, severity: 'high', ... };
      }
    }
    
    // ⚠️ Critical 키워드 없으면 안전하게 false 반환
    return { isCrisis: false, severity: 'none' };
  }
}
```

**문제**: 키워드 없으면 `false` 반환 → 위기 상황 놓칠 수 있음

#### 수정 계획

**파일**: `src/services/crisisDetection.ts`

```typescript
async function detectCrisisWithGemini(
  message: string,
  emotion?: EmotionType,
  intensity?: number
): Promise<GeminiCrisisResult> {
  try {
    // Gemini 호출
    const response = await generateChatbotResponse(prompt, [], defaultPersona);
    return result;
  } catch (error) {
    // ✅ 보수적 정책: 키워드 없어도 감정 강도 높으면 위기로 판단
    if (message) {
      const detectedCriticalKeywords = CRITICAL_FALLBACK_KEYWORDS.filter(...);
      if (detectedCriticalKeywords.length > 0) {
        return { isCrisis: true, severity: 'high', ... };
      }
      
      // ✅ 추가: 키워드 없어도 감정 강도 9 이상이면 위기로 판단
      if (intensity && intensity >= 9 && 
          (emotion === EmotionType.SADNESS || emotion === EmotionType.ANXIETY)) {
        return {
          isCrisis: true,
          severity: 'medium',
          reason: '높은 감정 강도 감지 (Gemini 실패시 폴백)'
        };
      }
    }
    
    // 최후의 수단: false 반환
    return { isCrisis: false, severity: 'none' };
  }
}
```

**예상 소요 시간**: 2시간  
**우선순위**: Critical/High 해결 후

---

## 백엔드 GCP API 연동 플랜

### 현재 상태

| 탭 | 페이지 | 현재 상태 | 목표 |
|---|------|---------|-----|
| Content (4번) | ContentGallery | Gemini Grounding 사용 중 + MOCK_CONTENTS | Grounding 강화 |
| Content (4번) | ContentPoems | "곧 제공 예정" 플레이스홀더 | Custom Search API |
| Content (4번) | ContentMeditations | "곧 제공 예정" 플레이스홀더 | YouTube Data API |
| Content (4번) | ContentMusic | 목업 | YouTube Data API |
| Reports (3번) | WeeklyReport | Firestore 직접 쿼리 | BigQuery 배치 분석 |
| Reports (3번) | MonthlyReport | Firestore 직접 쿼리 | BigQuery 배치 분석 |

### Phase 1: YouTube Data API 연동 (5일)

#### 1.1 API 설정 및 Cloud Function 구현

**신규 파일**: `functions/src/api/youtube.ts`

```typescript
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getCachedOrFetch} from "../services/cacheService";

export const fetchYouTubeMeditations = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30,
    memory: "512MiB",
  },
  async (request) => {
    // ✅ 인증 체크 추가 (Critical 2 수정 반영)
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }
    
    const {mood, duration} = request.data;
    const query = `${mood} 명상 meditation mindfulness ${duration}분`;
    
    const cacheKey = `youtube_meditations_${mood}_${duration}`;
    
    return await getCachedOrFetch(cacheKey, async () => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoDuration=medium&` +
        `q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}&` +
        `maxResults=10&relevanceLanguage=ko`
      );
      
      if (!response.ok) {
        throw new HttpsError("internal", "YouTube API error");
      }
      
      const data = await response.json();
      return {videos: parseYouTubeResponse(data)};
    });
  }
);

export const fetchYouTubeMusic = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30,
    memory: "512MiB",
  },
  async (request) => {
    // ✅ 인증 체크 추가
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }
    
    const {mood} = request.data;
    const query = `${mood} healing music relaxing 힐링 음악`;
    
    const cacheKey = `youtube_music_${mood}`;
    
    return await getCachedOrFetch(cacheKey, async () => {
      // 유사 구현
    });
  }
);
```

**설정 필요**:
- GCP Console에서 YouTube Data API v3 활성화
- API 키 발급 후 `firebase functions:config:set youtube.api_key="KEY"`

#### 1.2 프론트엔드 연동

**수정 파일**: `src/pages/content/ContentMeditations.tsx`

```typescript
import {useMeditationVideos} from '../../hooks/useYouTubeAPI';

export const ContentMeditations: React.FC = () => {
  const {data: videos, isLoading, error} = useMeditationVideos(selectedMood);
  
  if (isLoading) return <MeditationSkeleton />;
  if (error) return <ErrorFallback onRetry={refetch} />;
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {videos.map(video => (
        <YouTubeCard key={video.id} video={video} />
      ))}
    </div>
  );
};
```

**신규 파일**: 
- `src/hooks/useYouTubeAPI.ts`
- `src/components/ui/YouTubeCard.tsx`

#### 1.3 캐싱 전략

**신규 파일**: `functions/src/services/cacheService.ts`

```typescript
import {db} from "../config/firebase";

export const getCachedOrFetch = async (
  cacheKey: string,
  fetchFn: () => Promise<any>,
  ttlHours: number = 24
): Promise<any> => {
  const cacheRef = db.collection('apiCache').doc(cacheKey);
  const cache = await cacheRef.get();
  
  if (cache.exists && cache.data().expiresAt > Date.now()) {
    return cache.data().data;
  }
  
  const freshData = await fetchFn();
  await cacheRef.set({
    data: freshData,
    expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return freshData;
};
```

**예상 소요 시간**: 5일

---

### Phase 2: Custom Search API 연동 (4일)

#### 2.1 Programmable Search Engine 설정

**GCP Console 작업**:
1. Programmable Search Engine 생성
2. 검색 사이트 제한:
   - `munhak.com` (한국 문학)
   - `poem.co.kr` (시 전문)
   - `poetryfoundation.org` (영미 시)
   - `goodreads.com/quotes` (명언)
3. Search Engine ID (cx) 저장

#### 2.2 Cloud Function 구현

**신규 파일**: `functions/src/api/customSearch.ts`

```typescript
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getCachedOrFetch} from "../services/cacheService";
import {refineWithGemini} from "../services/gemini";

export const searchPoems = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30,
    memory: "512MiB",
  },
  async (request) => {
    // ✅ 인증 체크 추가
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }
    
    const {mood, emotion} = request.data;
    const query = `${emotion} 시 poem ${mood}`;
    
    const cacheKey = `poems_${mood}_${emotion}`;
    
    return await getCachedOrFetch(cacheKey, async () => {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?` +
        `key=${process.env.GOOGLE_API_KEY}&cx=${process.env.CSE_ID}&` +
        `q=${encodeURIComponent(query)}&num=10&lr=lang_ko`
      );
      
      if (!response.ok) {
        throw new HttpsError("internal", "Custom Search API error");
      }
      
      const data = await response.json();
      
      // Gemini로 검색 결과 요약/정제
      const refinedPoems = await refineWithGemini(data.items, mood);
      return {poems: refinedPoems};
    });
  }
);
```

#### 2.3 프론트엔드 연동

**수정 파일**: `src/pages/content/ContentPoems.tsx`

```typescript
import {usePoemSearch} from '../../hooks/useCustomSearch';

export const ContentPoems: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState('위로');
  const {data: poems, isLoading} = usePoemSearch(selectedMood);
  
  return (
    <div className="space-y-4">
      <MoodSelector value={selectedMood} onChange={setSelectedMood} />
      {poems?.map(poem => <PoemCard key={poem.id} poem={poem} />)}
    </div>
  );
};
```

**예상 소요 시간**: 4일

---

### Phase 3: Gemini Grounding 강화 (2일)

#### 3.1 기존 generateHealingContent 개선

**수정 파일**: `functions/src/api/gemini.ts` (220-339행)

```typescript
export const generateHealingContent = onCall(
  {...},
  async (request) => {
    // ✅ 인증 체크 추가
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }
    
    const {emotionState, persona} = request.data;
    
    // ✅ persona 검증 추가 (Medium 5 수정 반영)
    const validatedPersona = validatePersona(persona);
    
    const prompt = getContentPrompt(emotionState, validatedPersona);
    
    const response = await callGeminiAPIWithResponse(
      prompt,
      "gemini-3-flash-preview",
      {
        tools: [{
          googleSearch: {
            dynamic_retrieval_config: {
              mode: "MODE_DYNAMIC",
              dynamic_threshold: 0.3
            }
          }
        }],
      }
    );
    
    // Grounding 메타데이터 상세 파싱
    const groundingLinks = response.candidates[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
      title: chunk.web?.title || 'Unknown',
      url: chunk.web?.uri || '',
      snippet: chunk.web?.snippet || ''
    })) || [];
    
    return {
      success: true,
      data: {
        ...contentData,
        groundingLinks,
      }
    };
  }
);
```

#### 3.2 콘텐츠 타입별 프롬프트 분리

**신규 파일**: `functions/src/prompts/contentPrompts.ts`

```typescript
export const POEM_PROMPT = (mood: string, persona: Persona) => `
Google Search로 "${mood}" 관련 최신 시/시인 검색 후:
1. 검색된 시의 스타일 참고
2. 새로운 창작시 작성 (표절 아님)
3. 출처와 영감받은 작품 명시
`;

export const MEDITATION_PROMPT = (mood: string) => `
Google Search로 "${mood}" 대응 명상 기법 검색 후:
1. 과학적 근거 있는 기법 선별
2. 5분 가이드 스크립트 작성
3. 참고 논문/기사 출처 명시
`;
```

**예상 소요 시간**: 2일

---

### Phase 4: BigQuery 리포트 연동 (5일)

#### 4.1 Firestore → BigQuery 익스포트 설정

**GCP Console 작업**:
1. BigQuery 데이터셋 생성: `maumlog_analytics`
2. Firestore Export 활성화 (Console → Firestore → Integrations)
3. 익스포트 대상 컬렉션: `emotions`, `conversations`, `actionLogs`

#### 4.2 주간 리포트 배치 Function

**신규 파일**: `functions/src/scheduled/weeklyReport.ts`

```typescript
import {onSchedule} from "firebase-functions/v2/scheduler";
import {BigQuery} from '@google-cloud/bigquery';

export const generateWeeklyReports = onSchedule(
  {
    schedule: 'every monday 00:00',
    timeZone: 'Asia/Seoul',
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async () => {
    const bigquery = new BigQuery();
    
    const query = `
      SELECT 
        userId,
        COUNT(*) as totalCheckins,
        AVG(intensity) as avgIntensity,
        APPROX_TOP_COUNT(emotion, 3) as topEmotions,
        COUNTIF(intensity >= 7) as highIntensityCount
      FROM \`${PROJECT_ID}.maumlog_analytics.emotions\`
      WHERE createdAt >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY userId
    `;
    
    const [rows] = await bigquery.query(query);
    
    // 각 사용자별 리포트 생성
    const batch = admin.firestore().batch();
    for (const row of rows) {
      const reportRef = admin.firestore()
        .collection('users').doc(row.userId)
        .collection('reports').doc(`week_${getWeekId()}`);
      
      batch.set(reportRef, {
        type: 'weekly',
        stats: row,
        insights: await generateInsightsWithGemini(row),
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`Generated ${rows.length} weekly reports`);
  }
);
```

#### 4.3 프론트엔드 연동

**수정 파일**: `src/pages/reports/WeeklyReport.tsx`

```typescript
export const WeeklyReport: React.FC = () => {
  const {data: report, isLoading} = useWeeklyReport();
  
  if (isLoading) return <ReportSkeleton />;
  if (!report) return <NoReportMessage />;
  
  return (
    <div className="space-y-6">
      <ReportHeader period={report.period} />
      <StatsGrid stats={report.stats} />
      <EmotionTrendChart data={report.emotionTrend} />
      <InsightsCard insights={report.insights} />
      <NextWeekSuggestions suggestions={report.suggestions} />
    </div>
  );
};
```

**예상 소요 시간**: 5일

---

### Phase 5: 통합 테스트 및 배포 (2일)

#### 5.1 테스트 케이스

| API | 테스트 케이스 | 예상 결과 |
|-----|------------|---------|
| YouTube | 유효한 mood 전송 | 10개 비디오 반환 |
| YouTube | API 키 오류 | graceful fallback |
| Custom Search | 시 검색 | 검색 결과 + Gemini 정제 |
| BigQuery | 주간 집계 | 사용자별 통계 |
| Gemini | Grounding 검색 | 출처 URL 포함 |

#### 5.2 배포 체크리스트

- [ ] 환경 변수 설정 (`firebase functions:config:set`)
- [ ] API 할당량 확인 (YouTube: 10,000 units/일)
- [ ] BigQuery 익스포트 활성화 확인
- [ ] Cloud Scheduler 트리거 확인
- [ ] 에러 모니터링 설정 (Cloud Logging)
- [ ] 비용 알림 설정 (Budget Alert $10/월)

**예상 소요 시간**: 2일

---

## 통합 우선순위 및 실행 계획

### Week 1: Critical 수정 + Phase 1 시작

**Day 1-2**: Critical 수정
- ✅ Critical 1: Firestore messages `userId` 추가 (30분)
- ✅ Critical 2: Functions 인증 강제 (1시간)
- ✅ 테스트 및 검증 (2시간)

**Day 3-5**: Phase 1 시작
- YouTube Data API 설정 및 Function 구현
- 프론트엔드 연동 시작

**예상 소요 시간**: 5일

---

### Week 2: High 수정 + Phase 1 완료 + Phase 2 시작

**Day 1**: High 수정
- ✅ High 3: `saveConversation()` 동의 체크 추가 (30분)
- ✅ High 4: Timeout 정책 정렬 (30분)
- ✅ 테스트 및 검증 (1시간)

**Day 2-3**: Phase 1 완료
- YouTube API 연동 완료
- 캐싱 전략 적용

**Day 4-5**: Phase 2 시작
- Custom Search API 설정
- Function 구현 시작

**예상 소요 시간**: 5일

---

### Week 3: Phase 2-3 완료 + Phase 4 시작

**Day 1-2**: Phase 2 완료
- Custom Search API 연동 완료
- 프론트엔드 연동 완료

**Day 3-4**: Phase 3 완료
- Gemini Grounding 강화
- 프롬프트 분리

**Day 5**: Phase 4 시작
- BigQuery 설정
- 익스포트 활성화

**예상 소요 시간**: 5일

---

### Week 4: Phase 4 완료 + Medium 수정 + 통합 테스트

**Day 1-3**: Phase 4 완료
- BigQuery 리포트 연동 완료
- 배치 Function 구현 완료

**Day 4**: Medium 수정
- ⚠️ Medium 5: 프롬프트 안전성 강화 (4시간)
- ⚠️ Medium 6: 위기 감지 Fail-safe 강화 (2시간)

**Day 5**: 통합 테스트 및 배포
- Phase 5: 통합 테스트
- 배포 체크리스트 완료

**예상 소요 시간**: 5일

---

## 예상 일정 및 리소스

### 전체 일정 요약

| Week | 주요 작업 | 예상 소요 시간 |
|------|---------|-------------|
| Week 1 | Critical 수정 (2건) + Phase 1 시작 | 5일 |
| Week 2 | High 수정 (2건) + Phase 1 완료 + Phase 2 시작 | 5일 |
| Week 3 | Phase 2-3 완료 + Phase 4 시작 | 5일 |
| Week 4 | Phase 4 완료 + Medium 수정 (2건) + 통합 테스트 | 5일 |
| **총계** | | **20일 (약 4주)** |

### 파일 변경 요약

#### 신규 파일 (Backend)

```
functions/src/
├── api/
│   ├── youtube.ts (YouTube Data API)
│   └── customSearch.ts (Custom Search API)
├── scheduled/
│   ├── weeklyReport.ts (주간 리포트)
│   └── monthlyReport.ts (월간 리포트)
├── prompts/
│   └── contentPrompts.ts (프롬프트 분리)
└── services/
    └── cacheService.ts (캐싱 유틸)
```

#### 신규 파일 (Frontend)

```
src/
├── hooks/
│   ├── useYouTubeAPI.ts
│   ├── useCustomSearch.ts
│   └── useReports.ts
└── components/ui/
    ├── YouTubeCard.tsx
    └── PoemCard.tsx
```

#### 수정 파일

```
functions/src/api/gemini.ts (Grounding 강화 + 인증 체크)
src/services/firestore.ts (userId 추가 + 동의 체크)
src/types/firestore.ts (userId 필드 추가)
src/services/ai/gemini.ts (timeout 조정)
src/services/crisisDetection.ts (Fail-safe 강화)
src/pages/content/ContentMeditations.tsx (YouTube 연동)
src/pages/content/ContentPoems.tsx (Custom Search 연동)
src/pages/content/ContentMusic.tsx (YouTube 연동)
src/pages/reports/WeeklyReport.tsx (BigQuery 연동)
src/pages/reports/MonthlyReport.tsx (BigQuery 연동)
```

---

## 비용 분석

### 예상 비용 (월간)

| 항목 | 무료 할당량 | 예상 사용량 | 비용 |
|-----|-----------|-----------|-----|
| YouTube Data API | 10,000 units/일 | 3,000/일 | $0 |
| Custom Search API | 100 queries/일 | 50/일 | $0 |
| BigQuery | 1TB/월 | 100GB | $0 |
| Gemini API | 무료 티어 | 50K chars/일 | ~$3 |
| Firebase Functions | 2M invocations/월 | 500K/월 | $0 |
| Firestore | 1GB 저장/일 | 500MB/일 | $0 |
| **총계** | | | **~$3/월** |

### 비용 최적화 전략

1. **캐싱**: YouTube/Custom Search 결과 24시간 캐싱
2. **배치 처리**: 리포트는 주간/월간 배치로 생성
3. **할당량 모니터링**: Cloud Monitoring으로 API 사용량 추적
4. **비용 알림**: Budget Alert $10/월 설정

---

## 결론 및 권장사항

### 즉시 조치 필요 (Critical)

1. ✅ **Firestore messages `userId` 추가** (30분)
   - 저장 실패 방지
   - 실시간 조회 정상화

2. ✅ **Functions 인증 강제** (1시간)
   - 외부 호출 차단
   - 비용 폭증 방지

### 1주일 내 조치 필요 (High)

3. ✅ **동의 체크 추가** (30분)
   - 프라이버시 보호
   - 법적 요구사항 준수

4. ✅ **Timeout 정책 정렬** (30분)
   - 중복 호출 방지
   - 비용 절감

### 1개월 내 조치 권장 (Medium)

5. ⚠️ **프롬프트 안전성 강화** (4시간)
   - 인젝션 방지
   - 품질 보장

6. ⚠️ **위기 감지 Fail-safe 강화** (2시간)
   - False negative 감소
   - 안전성 향상

### GCP API 연동 (4주 계획)

- **Week 1-2**: YouTube + Custom Search API
- **Week 3**: Gemini Grounding 강화
- **Week 4**: BigQuery 리포트 연동

**예상 총 비용**: ~$3/월

---

**작성 완료일**: 2026-01-20  
**다음 검토일**: 수정 완료 후  
**검증 방법**: 실제 코드베이스 직접 확인 (파일 시스템, grep, 코드베이스 검색)
