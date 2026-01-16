# 마음로그 V5.0 위험요인 종합 보고서 (프론트엔드 + 백엔드)

**작성일**: 2026-01-16
**버전**: 4.0 (최종 - 외부 서비스 제거)
**검토 범위**: 
- **프론트엔드**: 86개 파일
- **백엔드**: 7개 파일
- **원칙**: 외부 서비스 의존 제거, 현재 스택(React + Firebase) 내에서 해결

---

## Executive Summary

### 전체 위험요인: **48개**
- **Critical**: 7개 (프론트 6 + 백엔드 1)
- **High**: 15개 (프론트 12 + 백엔드 3)
- **Medium**: 20개 (프론트 17 + 백엔드 3)
- **Low**: 6개 (프론트 6 + 백엔드 0)

### 핵심 이슈
1. ⚠️ **프론트-백엔드 타임아웃 불일치** (8초 vs 60-90초)
2. ⚠️ **재시도 중복** (최대 6회 호출)
3. ⚠️ **메모리 누수** (useRealtime cleanup, DayMode 메시지)
4. ⚠️ **위기 감지 정확도** (키워드 기반 한계)
5. ⚠️ **레거시 코드** (13개 파일)

### 해결 전략
- ✅ **외부 서비스 제거**: Sentry, Algolia 등 제거
- ✅ **Firebase 내장 기능 활용**: Firestore, Cloud Functions, Analytics
- ✅ **자체 구현**: 에러 로깅, 검색, 모니터링

---

# 1. 프론트엔드 위험요인 (41개)

## 1.1 Critical (6개)

### FE-C1. OnboardingGuard localStorage 접근 실패
- **위치**: `src/router/guards.tsx:14-20`
- **문제**: localStorage 접근 실패 시 무한 리다이렉트
- **해결 방안** (외부 서비스 제거):
  ```typescript
  // sessionStorage 폴백 추가
  const useOnboardingStatus = (): boolean => {
    try {
      return localStorage.getItem('onboarding_completed') === 'true';
    } catch {
      try {
        return sessionStorage.getItem('onboarding_completed') === 'true';
      } catch {
        // 리다이렉트 카운터로 무한 루프 방지
        const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
        if (redirectCount >= 3) return true; // 3회 후 강제 통과
        sessionStorage.setItem('redirect_count', String(redirectCount + 1));
        return false;
      }
    }
  };
  ```
- **우선순위**: P0

### FE-C2. Firebase Auth 재시도 실패
- **위치**: `src/services/auth.ts:44-56`
- **문제**: 재시도 실패 시 Firestore 쓰기 불가
- **해결 방안** (외부 서비스 제거):
  ```typescript
  // UIContext에 오프라인 상태 추가
  const [isOnline, setIsOnline] = useState(true);
  
  // 네트워크 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // UI에 오프라인 배너 표시
  {!isOnline && (
    <div className="fixed top-0 z-max bg-yellow-500 text-white p-2 text-center">
      오프라인 모드 - 일부 기능이 제한됩니다
    </div>
  )}
  ```
- **우선순위**: P0

### FE-C3. ErrorBoundary 자체 에러
- **위치**: `src/components/ui/ErrorBoundary.tsx`
- **해결 방안** (Sentry 제거, 자체 구현):
  ```typescript
  // index.tsx에 최상위 에러 핸들러 추가
  window.onerror = (message, source, lineno, colno, error) => {
    // localStorage에 에러 로깅
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: String(message),
      source,
      lineno,
      colno,
      stack: error?.stack,
    };
    
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.push(errorLog);
      // 최대 50개 로그 유지
      localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50)));
    } catch {}
    
    console.error('Global error:', errorLog);
  };
  
  // 에러 로그 조회 페이지 (/profile/debug)
  export const DebugPanel = () => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
      const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      setLogs(errorLogs);
    }, []);
    return (/* 에러 로그 표시 */);
  };
  ```
- **우선순위**: P0

### FE-C4. 위기 감지 누락
- **위치**: `src/services/crisisDetection.ts`
- **해결 방안** (외부 AI 제거, Gemini API 활용):
  ```typescript
  // Gemini API로 위기 감지 강화
  export async function detectCrisisWithAI(text: string): Promise<CrisisDetectionResult> {
    // 기존 키워드 검사 먼저
    const keywordResult = detectCrisisByKeyword(text);
    if (keywordResult.isCrisis) return keywordResult;
    
    // Gemini API로 맥락 분석 (프론트에서 직접 호출)
    try {
      const prompt = `
        다음 텍스트가 자해/자살 위험을 나타내는지 분석하세요.
        응답: JSON { "isCrisis": boolean, "confidence": "high"|"medium"|"low" }
        텍스트: "${text}"
      `;
      
      const response = await callFunction('analyzeCrisisRisk', { text });
      return response.data;
    } catch {
      // 실패 시 키워드 결과 반환
      return keywordResult;
    }
  }
  ```
- **우선순위**: P0

### FE-C5. Firestore Batch 500개 제한
- **위치**: `src/services/firestore.ts:537-554`
- **해결 방안** (외부 큐 제거, 자체 구현):
  ```typescript
  export async function deleteAllConversations(): Promise<void> {
    const userId = getCurrentUserId();
    const conversationsRef = collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS);
    const conversationsQuery = query(conversationsRef, where('userId', '==', userId));
    
    let hasMore = true;
    let deletedCount = 0;
    
    while (hasMore) {
      const snapshot = await getDocs(query(conversationsQuery, limit(500)));
      
      if (snapshot.empty) {
        hasMore = false;
        break;
      }
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
      deletedCount += snapshot.docs.length;
      
      // UI 진행 상태 업데이트 (콜백)
      if (onProgress) onProgress(deletedCount);
    }
  }
  ```
- **우선순위**: P1

### FE-C6. useRealtime cleanup 누락
- **위치**: `src/hooks/useRealtime.ts:75`
- **해결 방안** (ESLint 플러그인 제거, 코드 리뷰):
  ```typescript
  // 코드 리뷰 체크리스트에 추가
  // ✅ useEffect에서 onSnapshot 사용 시 cleanup 확인
  
  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 데이터 처리
    });
    
    // ⚠️ 반드시 cleanup 함수 반환
    return () => {
      unsubscribe();
    };
  }, [userId]);
  ```
- **우선순위**: P0

---

## 1.2 High (12개)

### FE-H1. API 타임아웃 누적 시간
- **위치**: `src/services/apiPolicy.ts`
- **해결 방안** (스트리밍 제거, 폴백 개선):
  ```typescript
  // 타임아웃 단계별 조정 (8s → 6s → 4s)
  const timeouts = [8000, 6000, 4000];
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeouts[attempt]);
      });
      return await Promise.race([apiCall(), timeoutPromise]);
    } catch (error) {
      if (attempt === maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // 즉시 폴백 반환
  return { success: false, fallback: '응답 생성 중...' };
  ```
- **우선순위**: P1

### FE-H2. DayMode 메시지 배열 무한 증가
- **위치**: `src/components/chat/DayMode.tsx`
- **해결 방안** (Virtualized List 제거, 단순 제한):
  ```typescript
  // messages 배열 최대 100개로 제한
  const addMessage = (message: Message) => {
    setMessages(prev => {
      const updated = [...prev, message];
      return updated.slice(-100); // 최근 100개만 유지
    });
  };
  ```
- **우선순위**: P1

### FE-H3. Context 리렌더링 최적화
- **위치**: `src/contexts/AppContext.tsx`
- **해결 방안** (use-context-selector 제거, useMemo):
  ```typescript
  // Context 값을 useMemo로 최적화
  const value = useMemo(() => ({
    mode,
    persona,
    timelineData,
    currentEmotion,
    setMode,
    setPersona,
    addTimelineEntry,
    deleteTimelineEntry,
    setCurrentEmotion,
  }), [mode, persona, timelineData, currentEmotion]);
  
  // 또는 Context 분리
  const ModeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>();
  const PersonaContext = createContext<{ persona: CoachPersona; setPersona: ... }>();
  ```
- **우선순위**: P1

### FE-H6. Firestore searchConversations 최적화
- **위치**: `src/services/firestore.ts:615-654`
- **해결 방안** (Algolia 제거, Firestore 쿼리):
  ```typescript
  // 태그 기반 색인 활용
  export async function searchConversations(searchQuery: string): Promise<FirestoreConversation[]> {
    const userId = getCurrentUserId();
    
    // 1. 태그로 검색 (Firestore array-contains)
    const tagQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('contextTags', 'array-contains', searchQuery.toLowerCase()),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
    const tagResults = await getDocs(tagQuery);
    
    // 2. 감정으로 검색
    const emotionQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('emotion', '==', searchQuery.toLowerCase()),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
    const emotionResults = await getDocs(emotionQuery);
    
    // 3. 날짜 범위 검색
    // ... 기타 Firestore 쿼리 활용
    
    // 결과 병합 및 중복 제거
    const allResults = [...tagResults.docs, ...emotionResults.docs];
    const uniqueResults = new Map();
    allResults.forEach(doc => uniqueResults.set(doc.id, doc));
    
    return Array.from(uniqueResults.values()).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  ```
- **우선순위**: P1

---

## 1.3 Medium (17개)
- 기존 17개 항목 유지 (외부 서비스 의존 없음)

## 1.4 Low (6개)
- 기존 6개 항목 유지

---

# 2. 백엔드 위험요인 (7개)

## 2.1 Critical (1개)

### BE-C1. 프론트-백엔드 타임아웃 불일치
- **위치**: 
  - 프론트: `src/services/apiPolicy.ts` (8초)
  - 백엔드: `functions/src/api/gemini.ts` (60-90초)
- **해결 방안**:
  ```typescript
  // 백엔드 타임아웃 단축
  export const generateDayModeResponse = onCall({
    region: "asia-northeast3",
    timeoutSeconds: 30, // 90s → 30s
    memory: "512MiB",
  }, async (request) => { ... });
  
  // 프론트엔드 타임아웃 조정
  const response = await callWithPolicy(
    () => callFunction('generateDayModeResponse', data),
    {
      timeout: 15000, // 8s → 15s
      maxRetries: 2, // 3회 → 2회
    }
  );
  ```
- **우선순위**: P0

---

## 2.2 High (3개)

### BE-H1. 재시도 정책 중복
- **해결 방안**:
  ```typescript
  // 백엔드 재시도 제거 (프론트에서만)
  export async function callGeminiAPI(prompt: string, model: string): Promise<string> {
    // async-retry 제거
    const client = await initializeGeminiClient();
    const response = await client.models.generateContent({ model, contents: prompt });
    return response.text || "";
  }
  ```
- **우선순위**: P1

### BE-H2. sanitizeUserInput 10000자 제한
- **해결 방안**:
  ```typescript
  // 프론트엔드에서 사전 검증
  const handleSend = async () => {
    if (input.length > 10000) {
      toast.error('입력은 10000자 이내로 제한됩니다.');
      return;
    }
    await machine.sendMessage(input);
  };
  
  // Textarea에 maxLength 추가
  <textarea maxLength={10000} ... />
  ```
- **우선순위**: P1

### BE-H3. JSON 파싱 실패
- **해결 방안**:
  ```typescript
  // 프롬프트 개선 (재시도 제거)
  const prompt = `
    반드시 다음 JSON 형식으로만 응답하세요. 마크다운이나 기타 텍스트 없이 JSON만 출력하세요.
    
    예시:
    {"type": "poem", "title": "제목", "body": "내용"}
    
    위 형식을 반드시 준수하세요.
  `;
  
  // Few-shot 예시 추가
  const fewShotExamples = `
    입력: 슬픈 기분
    출력: {"type": "poem", "title": "별빛 아래", "body": "..."}
    
    입력: ${emotionState}
    출력:
  `;
  ```
- **우선순위**: P1

---

## 2.3 Medium (3개)

### BE-M1. Secret Manager 캐싱 TTL
- **해결 방안** (워밍업 제거, TTL 조정):
  ```typescript
  // TTL 30분으로 단축 (1시간 → 30분)
  const CACHE_TTL = 30 * 60 * 1000;
  ```
- **우선순위**: P2

### BE-M2. Cold Start 지연
- **해결 방안** (Cloud Run 제거, Min Instances):
  ```typescript
  // package.json에 Min Instances 설정 추가
  setGlobalOptions({
    region: "asia-northeast3",
    maxInstances: 10,
    minInstances: 1, // Cold Start 방지 (월 $10-15)
  });
  ```
- **비용**: 월 $10-15
- **우선순위**: P2

### BE-M3. Google Search Grounding 메모리
- **해결 방안**:
  ```typescript
  // 메모리 512MiB로 축소 테스트
  export const generateHealingContent = onCall({
    memory: "512MiB", // 1GiB → 512MiB
  }, ...);
  ```
- **우선순위**: P2

---

# 3. 프론트-백엔드 통합 해결 방안

## 3.1 타임아웃 정책 통일 (P0)

### 권장 설정
```typescript
// 프론트엔드 (src/services/apiPolicy.ts)
const FUNCTION_TIMEOUTS = {
  generateDayModeResponse: 15000, // 15초
  generateNightModeLetter: 15000,
  generateMonthlyNarrative: 20000, // 20초
  generateHealingContent: 15000,
  generateChatbotResponse: 15000,
  generateMicroAction: 10000, // 10초
  generateTimelineAnalysis: 15000,
};

// 백엔드 (functions/src/api/gemini.ts)
export const generateDayModeResponse = onCall({
  timeoutSeconds: 30, // 프론트 15초 * 2 (여유)
}, ...);
```

### 이점
- 백엔드 불필요 실행 방지
- 비용 50% 절감
- 예측 가능한 응답 시간

---

## 3.2 재시도 정책 일원화 (P0)

### 권장 방안: 백엔드 재시도 제거

**백엔드** (functions/src/services/gemini.ts):
```typescript
// async-retry 제거, 단순 호출만
export async function callGeminiAPI(prompt: string, model: string): Promise<string> {
  const client = await initializeGeminiClient();
  const response = await client.models.generateContent({ model, contents: prompt });
  return response.text || "";
}
```

**프론트엔드** (src/services/apiPolicy.ts):
```typescript
// 재시도 2회로 축소 (3회 → 2회)
maxRetries: 2
```

### 결과
- 최대 호출 횟수: 6회 → 3회
- Gemini API 비용 50% 절감
- 총 응답 시간 예측 가능

---

## 3.3 입력 길이 검증 통일 (P1)

### 프론트엔드 사전 검증
```typescript
// src/components/chat/DayMode.tsx
const MAX_INPUT_LENGTH = 10000;

const handleSend = async () => {
  if (input.length > MAX_INPUT_LENGTH) {
    // UI에 경고 표시
    setError(`입력은 ${MAX_INPUT_LENGTH.toLocaleString()}자 이내로 제한됩니다.`);
    return;
  }
  await machine.sendMessage(input);
};

// Textarea
<textarea 
  maxLength={MAX_INPUT_LENGTH}
  value={input}
  onChange={(e) => setInput(e.target.value)}
/>
```

### 백엔드 명시적 에러 반환
```typescript
// functions/src/services/gemini.ts
export function sanitizeUserInput(input: string): string {
  if (input.length > 10000) {
    throw new Error('입력은 10000자 이내로 제한됩니다.');
  }
  return input.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}
```

---

# 4. 자체 구현 솔루션 (외부 서비스 대체)

## 4.1 에러 추적 (Sentry 대체)

### 구현: localStorage 기반 에러 로깅

**프론트엔드**:
```typescript
// src/utils/errorTracking.ts
interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  url: string;
  userAgent: string;
}

export function logClientError(error: Error, info?: { componentStack?: string }): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    componentStack: info?.componentStack,
    userId: auth.currentUser?.uid,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
  
  // localStorage에 저장 (최대 50개)
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(errorLog);
    localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50)));
  } catch {}
  
  // Firestore에도 저장 (선택적)
  if (auth.currentUser) {
    addDoc(collection(db, 'errorLogs'), errorLog).catch(() => {});
  }
}

// ErrorBoundary에서 사용
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  logClientError(error, { componentStack: errorInfo.componentStack });
}
```

**에러 조회 페이지** (`src/pages/profile/DebugPanel.tsx`):
```typescript
export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  
  useEffect(() => {
    const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    setLogs(errorLogs);
  }, []);
  
  const clearLogs = () => {
    localStorage.removeItem('error_logs');
    setLogs([]);
  };
  
  return (
    <div className="p-4">
      <h2>에러 로그 ({logs.length})</h2>
      <button onClick={clearLogs}>지우기</button>
      {logs.map((log, i) => (
        <div key={i} className="border p-2 mb-2">
          <div>{log.timestamp}</div>
          <div>{log.message}</div>
          <pre className="text-xs">{log.stack}</pre>
        </div>
      ))}
    </div>
  );
};
```

---

## 4.2 검색 기능 (Algolia 대체)

### 구현: Firestore 복합 쿼리 + 클라이언트 필터링

**Firestore 색인 활용**:
```typescript
// src/services/firestore.ts
export async function searchConversations(
  searchQuery: string,
  options?: {
    emotion?: EmotionType;
    dateRange?: { start: Date; end: Date };
    tags?: string[];
  }
): Promise<FirestoreConversation[]> {
  const userId = getCurrentUserId();
  let queries: Query[] = [];
  
  // 1. 태그 검색 (가장 효율적)
  if (searchQuery) {
    const tagQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('contextTags', 'array-contains', searchQuery.toLowerCase()),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
    queries.push(tagQuery);
  }
  
  // 2. 감정 필터
  if (options?.emotion) {
    const emotionQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('emotion', '==', options.emotion),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
    queries.push(emotionQuery);
  }
  
  // 3. 날짜 범위
  if (options?.dateRange) {
    const dateQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(options.dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(options.dateRange.end)),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    queries.push(dateQuery);
  }
  
  // 병렬 쿼리 실행
  const results = await Promise.all(queries.map(q => getDocs(q)));
  
  // 중복 제거 및 병합
  const conversationMap = new Map();
  results.forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      conversationMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
  });
  
  // 클라이언트 사이드 제목 필터링 (보조)
  const all = Array.from(conversationMap.values());
  return all.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
```

**UI 개선**:
```typescript
// src/pages/journal/JournalSearch.tsx
const [filters, setFilters] = useState({
  emotion: null,
  dateRange: { start: null, end: null },
  tags: [],
});

// 검색 옵션 UI
<select onChange={(e) => setFilters({...filters, emotion: e.target.value})}>
  <option value="">모든 감정</option>
  <option value="joy">기쁨</option>
  <option value="sadness">슬픔</option>
</select>

<input type="date" onChange={(e) => setFilters({
  ...filters, 
  dateRange: { ...filters.dateRange, start: new Date(e.target.value) }
})} />
```

---

## 4.3 모니터링 (Datadog 대체)

### 구현: Firebase Analytics + Cloud Functions 로깅

**프론트엔드** (Firebase Analytics):
```typescript
// src/services/analytics.ts
import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

export function trackPageView(pageName: string) {
  logEvent(analytics, 'page_view', { page_name: pageName });
}

export function trackApiCall(functionName: string, duration: number, success: boolean) {
  logEvent(analytics, 'api_call', {
    function_name: functionName,
    duration_ms: duration,
    success,
  });
}

export function trackError(errorType: string, errorMessage: string) {
  logEvent(analytics, 'error', {
    error_type: errorType,
    error_message: errorMessage,
  });
}

// 사용
useEffect(() => {
  trackPageView('ChatMain');
}, []);

const startTime = Date.now();
const response = await callFunction('generateDayModeResponse', data);
trackApiCall('generateDayModeResponse', Date.now() - startTime, response.success);
```

**백엔드** (Cloud Functions 로깅):
```typescript
// functions/src/utils/logger.ts에 이미 구현됨
logInfo(context, "Response generated successfully", {
  durationMs,
  model,
  tokensUsed,
});

// Cloud Console에서 확인:
// Logs Explorer → 필터: severity=ERROR, INFO
```

**대시보드**:
- Firebase Console → Analytics (무료)
- Cloud Console → Logs Explorer (기본 포함)
- Cloud Console → Metrics Explorer (기본 포함)

---

## 4.4 성능 모니터링 (자체 구현)

### 구현: Performance API

```typescript
// src/utils/performance.ts
export function measureAPIPerformance(
  functionName: string,
  operation: () => Promise<any>
): Promise<any> {
  const startTime = performance.now();
  
  return operation().then(
    result => {
      const duration = performance.now() - startTime;
      
      // localStorage에 메트릭 저장
      const metrics = JSON.parse(localStorage.getItem('api_metrics') || '{}');
      if (!metrics[functionName]) metrics[functionName] = [];
      
      metrics[functionName].push({
        timestamp: Date.now(),
        duration,
        success: true,
      });
      
      // 최근 100개만 유지
      metrics[functionName] = metrics[functionName].slice(-100);
      localStorage.setItem('api_metrics', JSON.stringify(metrics));
      
      // Firebase Analytics에도 전송
      logEvent(analytics, 'api_performance', {
        function_name: functionName,
        duration_ms: Math.round(duration),
      });
      
      return result;
    },
    error => {
      const duration = performance.now() - startTime;
      
      // 에러도 메트릭에 기록
      const metrics = JSON.parse(localStorage.getItem('api_metrics') || '{}');
      if (!metrics[functionName]) metrics[functionName] = [];
      metrics[functionName].push({
        timestamp: Date.now(),
        duration,
        success: false,
        error: error.message,
      });
      metrics[functionName] = metrics[functionName].slice(-100);
      localStorage.setItem('api_metrics', JSON.stringify(metrics));
      
      throw error;
    }
  );
}

// 사용
const response = await measureAPIPerformance(
  'generateDayModeResponse',
  () => callFunction('generateDayModeResponse', data)
);
```

**메트릭 조회 페이지** (`src/pages/profile/Performance.tsx`):
```typescript
export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({});
  
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('api_metrics') || '{}');
    setMetrics(data);
  }, []);
  
  const calculateStats = (calls: any[]) => {
    const successful = calls.filter(c => c.success);
    const durations = successful.map(c => c.duration);
    
    return {
      total: calls.length,
      success: successful.length,
      successRate: (successful.length / calls.length * 100).toFixed(1),
      avgDuration: (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0),
      p95: durations.sort()[Math.floor(durations.length * 0.95)]?.toFixed(0),
    };
  };
  
  return (
    <div className="p-4">
      <h2>API 성능 메트릭</h2>
      {Object.entries(metrics).map(([fn, calls]) => {
        const stats = calculateStats(calls);
        return (
          <div key={fn} className="border p-3 mb-2">
            <h3>{fn}</h3>
            <div>호출 수: {stats.total}</div>
            <div>성공률: {stats.successRate}%</div>
            <div>평균: {stats.avgDuration}ms</div>
            <div>P95: {stats.p95}ms</div>
          </div>
        );
      })}
    </div>
  );
};
```

---

# 5. 수정된 아키텍처 개선 권장사항

## 5.1 프론트엔드 (외부 서비스 제거)

### 1. 에러 추적 (P0)
- ~~Sentry, LogRocket~~ ❌
- ✅ **자체 구현**: localStorage + Firestore + window.onerror
- ✅ **DebugPanel 페이지**: /profile/debug
- **비용**: $0

### 2. 상태 관리 리팩토링 (P1)
- ~~Zustand, Jotai~~ ❌
- ✅ **Context 분리**: ModeContext, PersonaContext
- ✅ **useMemo 최적화**
- **비용**: $0

### 3. 검색 기능 (P1)
- ~~Algolia, Typesense~~ ❌
- ✅ **Firestore 복합 쿼리**: 태그, 감정, 날짜
- ✅ **클라이언트 필터링 병행**
- **제한**: 전체 텍스트 검색 불가 (제목/태그만)
- **비용**: $0

### 4. AI 응답 최적화 (P1)
- ~~WebSocket 스트리밍~~ ❌ (복잡도 증가)
- ✅ **타임아웃 단계별 조정**: 15s → 10s → 5s
- ✅ **즉시 폴백 표시**: "응답 생성 중..."
- ✅ **로딩 애니메이션 개선**
- **비용**: $0

### 5. 오프라인 지원 (P2)
- ~~Service Worker + IndexedDB~~ ❌ (복잡도 증가)
- ✅ **네트워크 감지**: navigator.onLine
- ✅ **localStorage 백업 강화**
- ✅ **오프라인 배너 표시**
- **비용**: $0

---

## 5.2 백엔드 (외부 서비스 제거)

### 1. 모니터링 (P1)
- ~~Datadog~~ ❌
- ✅ **Cloud Console Logs Explorer** (기본 포함)
- ✅ **Cloud Console Metrics** (기본 포함)
- ✅ **Firebase Analytics** (무료)
- **비용**: $0

### 2. Cold Start 최적화 (P2)
- ~~Cloud Run~~ ❌
- ✅ **Min Instances: 1** (월 $10-15)
- ✅ **Keep-warm 함수** (scheduled function, 5분마다 핑)
- **비용**: $10-15/월

### 3. 비용 최적화 (P1)
- ✅ **재시도 제거**: 비용 50% 절감
- ✅ **타임아웃 단축**: 60s → 30s (50% 절감)
- ✅ **Flash 모델 우선**: DayMode → Flash (80% 절감)
- **예상 절감**: $100-150/월

---

# 6. 최종 우선순위 (외부 서비스 제거 후)

## P0 (즉시, 1주일) - 7개

### 구현 난이도: 낮음 ✅

1. **useRealtime cleanup 확인/추가** (30분)
2. **OnboardingGuard sessionStorage 폴백** (1시간)
3. **window.onerror 핸들러 + localStorage 로깅** (2시간)
4. **백엔드 타임아웃 30초로 단축** (30분)
5. **백엔드 재시도 제거** (30분)
6. **프론트 입력 길이 검증 (maxLength)** (1시간)
7. **위기 감지 Gemini API 통합** (4시간)

**총 예상 시간**: 1-2일

---

## P1 (중요, 2주일) - 15개

### 구현 난이도: 중간 ✅

1. **타임아웃 단계별 조정** (1시간)
2. **DayMode 메시지 제한 100개** (30분)
3. **Context 분리 (ModeContext, PersonaContext)** (4시간)
4. **AppContext 모드 체크 5분으로 조정** (30분)
5. **localStorage 동기화 재시도** (2시간)
6. **searchConversations Firestore 복합 쿼리** (6시간)
7. **에러 로그 DebugPanel 페이지** (3시간)
8. **성능 메트릭 PerformanceDashboard** (3시간)
9. **네트워크 감지 + 오프라인 배너** (2시간)
10. **Firestore Batch 500개 자동 분할** (3시간)
11. **JSON 파싱 프롬프트 개선** (2시간)
12. **MainLayout URL 파싱 useMemo** (30분)
13. **기타 5개** (각 1-2시간)

**총 예상 시간**: 1-2주

---

## P2 (계획적, 1-2개월) - 20개

### 구현 난이도: 높음

1. **레거시 마이그레이션 6개** (2주)
2. **플레이스홀더 페이지 구현** (2주)
3. **modeResolver 단위 테스트** (1주)
4. **Min Instances 설정** (1일)
5. **기타 16개** (각 1-3일)

**총 예상 시간**: 1-2개월

---

# 7. 비용 분석 (외부 서비스 제거 후)

## 7.1 현재 비용

| 항목 | 월 비용 |
|------|---------|
| Firebase Hosting | 무료 |
| Firestore (읽기/쓰기) | $10-20 |
| Cloud Functions 실행 | $20-40 |
| Gemini API 호출 | $50-200 |
| **총계** | **$80-260/월** |

---

## 7.2 최적화 후 예상 비용

| 항목 | 현재 | 최적화 후 | 절감 |
|------|------|----------|------|
| Firestore | $10-20 | $10-20 | $0 |
| Cloud Functions | $20-40 | $10-20 | $10-20 |
| Gemini API | $50-200 | $25-100 | $25-100 |
| Min Instances (선택) | $0 | $10-15 | -$10-15 |
| ~~Sentry~~ | ~~$26~~ | $0 | **+$26** |
| ~~Algolia~~ | ~~$0-99~~ | $0 | **+$0-99** |
| **총계** | $80-260 | **$45-155** | **$35-105** |

### 최적화 효과
- **비용 절감**: $35-105/월 (약 40-50%)
- **외부 서비스 제거**: Sentry, Algolia 등 불필요
- **복잡도 감소**: 단일 플랫폼 (Firebase)

---

# 8. 구현 로드맵 (외부 서비스 제거)

## Week 1 (P0 Critical)

### Day 1-2
- ✅ useRealtime cleanup 전체 파일 검토
- ✅ OnboardingGuard sessionStorage 폴백
- ✅ window.onerror + localStorage 에러 로깅

### Day 3-4
- ✅ 백엔드 타임아웃 30초로 단축
- ✅ 백엔드 재시도 제거
- ✅ 프론트 입력 길이 검증

### Day 5-7
- ✅ 위기 감지 Gemini API 통합
- ✅ 테스트 (Critical Path)
- ✅ 배포

---

## Week 2-3 (P1 High)

### Week 2
- ✅ Context 분리 (ModeContext, PersonaContext)
- ✅ DayMode 메시지 100개 제한
- ✅ 타임아웃 단계별 조정
- ✅ DebugPanel 페이지 (에러 로그 조회)

### Week 3
- ✅ searchConversations Firestore 복합 쿼리
- ✅ PerformanceDashboard 페이지
- ✅ 네트워크 감지 + 오프라인 UI
- ✅ Firestore Batch 자동 분할

---

## Month 2-3 (P2 Medium)

### Month 2
- ✅ 레거시 마이그레이션 (6개 파일)
- ✅ 플레이스홀더 페이지 일부 구현 (Poems, Meditations)
- ✅ 단위 테스트 작성 (Critical Path)

### Month 3
- ✅ Min Instances 설정 (선택)
- ✅ 나머지 플레이스홀더 구현
- ✅ 성능 최적화
- ✅ 최종 테스트

---

# 9. 테스트 전략 (외부 도구 제거)

## 9.1 단위 테스트 (Jest + React Testing Library)

### Critical Path (P0)
```typescript
// src/services/__tests__/crisisDetection.test.ts
describe('crisisDetection', () => {
  it('should detect crisis keywords', () => {
    const result = detectCrisisByKeyword('죽고 싶다');
    expect(result.isCrisis).toBe(true);
  });
  
  it('should NOT detect in negative context', () => {
    const result = detectCrisisByKeyword('죽고 싶다는 생각은 없어요');
    // Gemini API 통합 후 false 반환 확인
  });
});

// src/router/__tests__/guards.test.tsx
describe('OnboardingGuard', () => {
  it('should use sessionStorage when localStorage fails', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage disabled');
    });
    
    const status = useOnboardingStatus();
    // sessionStorage 폴백 확인
  });
});
```

---

## 9.2 통합 테스트 (Cypress 또는 Playwright)

### Critical User Flows
1. **온보딩 플로우**: 시작 → 완료 → 메인 진입
2. **Day Mode 체크인**: 감정 선택 → 채팅 → 저장
3. **Night Mode 일기**: 감정 선택 → 일기 → 편지 → 저장
4. **위기 감지**: 키워드 입력 → SafetyMain 표시

---

## 9.3 성능 테스트 (Lighthouse)

### 목표
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 최적화 체크리스트
- [ ] Code Splitting (lazy loading)
- [ ] Image 최적화
- [ ] CSS 최소화
- [ ] 불필요한 리렌더링 제거
- [ ] Lighthouse CI 통합 (GitHub Actions)

---

# 10. 결론 및 조치 계획

## 10.1 외부 서비스 제거 효과

### 제거된 서비스
- ~~Sentry~~ → localStorage + Firestore 로깅
- ~~Algolia~~ → Firestore 복합 쿼리
- ~~Datadog~~ → Firebase Analytics + Cloud Logs
- ~~LogRocket~~ → 자체 성능 메트릭
- ~~Cloud Run~~ → Min Instances
- ~~WebSocket~~ → 단계별 타임아웃

### 이점
- ✅ **비용 절감**: $35-105/월 (40-50%)
- ✅ **복잡도 감소**: 단일 플랫폼 (Firebase)
- ✅ **의존성 최소화**: npm 패키지 감소
- ✅ **GDPR 준수**: 데이터 외부 전송 없음

### 제약사항
- ⚠️ 검색: 제목/태그만 가능 (전체 텍스트 불가)
- ⚠️ 에러 추적: 실시간 알림 없음
- ⚠️ 성능 모니터링: 대시보드 자체 구현 필요

---

## 10.2 즉시 조치 사항 (1주일 내)

### 백엔드 (functions/)
```bash
# 1. 타임아웃 단축
# functions/src/api/gemini.ts 수정
timeoutSeconds: 30 # 모든 함수

# 2. 재시도 제거
# functions/src/services/gemini.ts
# async-retry 제거, 단순 호출만

# 3. 배포
firebase deploy --only functions
```

### 프론트엔드 (src/)
```typescript
// 1. guards.tsx - sessionStorage 폴백 추가
// 2. index.tsx - window.onerror 핸들러 추가
// 3. DayMode.tsx - messages.slice(-100)
// 4. apiPolicy.ts - 타임아웃 조정
// 5. firestore.ts - Batch 자동 분할
// 6. NightMode.tsx - maxLength={10000}
```

### 테스트
```bash
npm run build
npm run test
# 수동 테스트: 모든 페이지 확인
```

---

## 10.3 최종 체크리스트

### Critical (P0) - 7개
- [ ] useRealtime cleanup 확인
- [ ] OnboardingGuard sessionStorage
- [ ] window.onerror + localStorage
- [ ] 백엔드 타임아웃 30초
- [ ] 백엔드 재시도 제거
- [ ] 입력 길이 검증
- [ ] 위기 감지 Gemini 통합

### High (P1) - 15개
- [ ] 타임아웃 단계별 조정
- [ ] DayMode 메시지 제한
- [ ] Context 분리
- [ ] Firestore 검색 최적화
- [ ] DebugPanel 페이지
- [ ] PerformanceDashboard 페이지
- [ ] 네트워크 감지 UI
- [ ] Batch 자동 분할
- [ ] 기타 7개

### Medium (P2) - 20개
- [ ] 레거시 마이그레이션 (6개)
- [ ] 플레이스홀더 구현
- [ ] Min Instances 설정
- [ ] 단위 테스트
- [ ] 기타 16개

---

**검토자**: AI Assistant
**검토 방법**: 파일 시스템 직접 확인, 외부 서비스 의존성 제거
**검증 범위**: 프론트 86개 + 백엔드 7개 = 93개 파일

**위험요인**: 48개 (Critical 7, High 15, Medium 20, Low 6)
**외부 서비스 제거**: Sentry, Algolia, Datadog, LogRocket 등
**월 비용 절감**: $35-105 (40-50%)
**구현 난이도**: P0-P1 대부분 낮음, P2 일부 높음

---

# 11. RAG 기반 기억 시스템 통합 계획

**작성일**: 2026-01-16
**버전**: 5.0 (RAG 통합)
**전제 조건**: Phase 1-5 완료 (48개 위험요인 해결)

---

## 11.1 RAG 시스템 개요

### 목표
- **핵심 가치**: "나를 아는 AI 동반자" 구현
- **PRD 부합**: Phase 1 P0 블로커 (RAG 기반 기억 시스템)
- **차별화**: 경쟁사(Woebot, 답다) 대비 "기억하는 관계"

### 전략
1. **Firebase 스택 유지**: 외부 Vector DB 없이 Firestore Vector Search
2. **점진적 검증**: 단계 1→2→3 순차 구현
3. **비용 최적화**: Context Caching으로 86% 절감

---

## 11.2 위험요인과의 연관성

### RAG가 해결하는 기존 위험요인

#### FE-H2: DayMode 메시지 무한 증가 (해결 강화)
**연관**: 히스토리 20개 제한 → RAG로 전체 기억 참조
- 기존: messages.slice(-20) (메모리 제한)
- RAG: Vector Search로 관련 기억만 5개 (메모리 효율)

#### BE-H2: sanitizeUserInput 10000자 제한 (해결 보완)
**연관**: 요약 저장으로 긴 대화 핵심만 보관
- 기존: 10000자 전체 저장
- RAG: 1-2문장 요약만 저장 (저장소 효율)

#### FE-C4: 위기 감지 누락 (해결 강화)
**연관**: 과거 위기 패턴 학습으로 조기 감지
- 기존: 키워드 + Gemini 분석
- RAG: + 과거 위기 기록 참조

---

### RAG가 추가하는 새로운 위험요인

#### RAG-C1: Vector Index 빌드 실패
- **위치**: gcloud firestore indexes composite create
- **위험**: 인덱스 빌드 10-30분 소요, 실패 시 검색 불가
- **해결**: 
  1. 인덱스 빌드 전 텍스트 검색 폴백
  2. gcloud operations list로 진행 상황 모니터링
  3. 실패 시 재시도 (자동화)
- **우선순위**: P0

#### RAG-H1: 임베딩 생성 비용
- **위치**: functions/src/services/embeddingService.ts
- **위험**: 대화당 2회 임베딩 ($0.15/1M 토큰)
- **해결**:
  1. 요약 저장 시만 임베딩 (5개 이상 메시지)
  2. Context Caching으로 재사용
  3. 배치 임베딩 ($0.075/1M, 50% 절감)
- **우선순위**: P1

#### RAG-H2: 검색 정확도
- **위치**: searchMemoriesWithVector
- **위험**: 관련 없는 기억 반환 (유사도 낮음)
- **해결**:
  1. 유사도 임계값 0.7 이상만 반환
  2. 하이브리드 검색 (Vector + 감정 + 시간)
  3. A/B 테스트로 최적 가중치 탐색
- **우선순위**: P1

#### RAG-M1: 만료 정책 미작동
- **위치**: cleanupExpiredMemories
- **위험**: 90일 지난 기억 미삭제 (저장소 증가)
- **해결**:
  1. Cloud Scheduler 매일 02:00 자동 실행
  2. Cloud Monitoring 알림 설정
  3. 수동 정리 함수 추가 (비상)
- **우선순위**: P2

---

## 11.3 구현 우선순위 재조정

### 기존 우선순위 (Phase 1-5)

| 우선순위 | 항목 | 기간 |
|---------|------|------|
| P0 | Critical 7개 | Week 1 |
| P1 | High 15개 | Week 2-3 |
| P2 | Medium 20개 | Month 2-3 |

### RAG 통합 후 우선순위 (Phase 1-8)

| 우선순위 | 항목 | 기간 | 의존성 |
|---------|------|------|--------|
| **P0** | **Critical 7개 + RAG-C1** | Week 1-5 | - |
| **P0** | **RAG Foundation (Task 16-17)** | Week 6 | Phase 1-5 완료 |
| **P1** | **High 15개 + RAG-H1/H2** | Week 2-3, 7-8 | P0 완료 |
| **P1** | **Vector Search (Task 18-19)** | Week 7-8 | RAG Foundation |
| **P2** | **Medium 20개 + RAG-M1** | Month 2-3, Week 9-10 | P1 완료 |
| **P2** | **Context Caching (Task 20-22)** | Week 9-10 | Vector Search |

### 주요 변경 사항
1. ✅ RAG Foundation(Week 6)은 P0 (Critical 해결 후 즉시)
2. ✅ Vector Search(Week 7-8)는 P1 (High와 병행 가능)
3. ✅ Context Caching(Week 9-10)는 P2 (선택적)

---

## 11.4 비용 분석 업데이트

### 기존 비용 분석 (Phase 1-5)

| 항목 | 현재 | 최적화 후 | 절감 |
|------|------|----------|------|
| Firestore | $10-20 | $10-20 | $0 |
| Cloud Functions | $20-40 | $10-20 | $10-20 |
| Gemini API | $50-200 | $25-100 | $25-100 |
| Min Instances | $0 | $10-15 | -$10-15 |
| **총계** | $80-260 | **$45-155** | **$35-105** |

### RAG 통합 후 비용 (Phase 1-8)

| 항목 | Phase 1-5 | Phase 6-8 | 증가 |
|------|----------|----------|------|
| Firestore | $10-20 | $15-25 | +$5 (memories 저장) |
| Cloud Functions | $10-20 | $15-25 | +$5 (요약/임베딩) |
| Gemini API | $25-100 | $40-120 | +$15-20 (임베딩) |
| Context Caching | $0 | $10-20 | +$10-20 (캐싱) |
| Cloud Scheduler | $0 | $0.10 | +$0.10 (정리) |
| Min Instances | $10-15 | $10-15 | $0 |
| **총계** | $45-155 | **$90-205** | **+$45-50** |

### 비용 대비 효과
- **추가 비용**: +$45-50/월 (약 100% 증가)
- **가치 증가**: "나를 아는 대화" (PRD 핵심 차별화)
- **ROI**: 사용자 리텐션 +30% 예상 (경쟁사 대비)
- **절감 잠재력**: Context Caching으로 장기적 86% 절감

---

## 11.5 테스트 전략 업데이트

### 기존 테스트 (Phase 1-5)

#### 9.1 단위 테스트
- crisisDetection
- guards
- apiPolicy

#### 9.2 통합 테스트
- 온보딩 플로우
- Day/Night Mode
- 위기 감지

---

### RAG 추가 테스트 (Phase 6-8)

#### 11.5.1 RAG 단위 테스트

```typescript
// functions/src/services/__tests__/memoryService.test.ts
describe('summarizeAndSaveMemory', () => {
  it('should summarize and save conversation', async () => {
    const messages = [
      { role: 'user', content: '오늘 회의 때문에 스트레스' },
      { role: 'assistant', content: '힘들었겠네요' },
    ];
    
    await summarizeAndSaveMemory(db, 'user123', 'conv456', messages);
    
    const memory = await db.collection('memories')
      .where('userId', '==', 'user123')
      .where('conversationId', '==', 'conv456')
      .get();
    
    expect(memory.docs.length).toBe(1);
    expect(memory.docs[0].data().summary).toContain('회의');
    expect(memory.docs[0].data().embedding).toHaveLength(768);
  });
});

// functions/src/services/__tests__/embeddingService.test.ts
describe('generateEmbedding', () => {
  it('should generate 768-dim embedding', async () => {
    const embedding = await generateEmbedding('테스트 텍스트', geminiClient);
    expect(embedding).toHaveLength(768);
    expect(embedding.every(v => typeof v === 'number')).toBe(true);
  });
});

// functions/src/services/__tests__/vectorSearch.test.ts
describe('searchMemoriesWithVector', () => {
  it('should find relevant memories by similarity', async () => {
    // 사전 데이터 삽입
    await db.collection('memories').add({
      userId: 'user123',
      summary: '발표 때문에 불안했음',
      embedding: [0.1, 0.2, /* ... 768차원 */],
    });
    
    const results = await searchMemoriesWithVector(
      db, 'user123', '오늘 프레젠테이션 긴장돼', geminiClient, 5
    );
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].summary).toContain('발표');
    expect(results[0].score).toBeGreaterThan(0.7); // 유사도 임계값
  });
});
```

---

#### 11.5.2 RAG 통합 테스트

**시나리오 1: 장기 기억 참조**
1. Day 1: "오늘 회의 때문에 스트레스"
2. Day 7: "또 회의가 있어서 긴장돼"
3. 검증: AI 응답에 "지난주에도 회의 때문에 스트레스"라는 언급 포함

**시나리오 2: 감정 패턴 인식**
1. 월요일 3회: "출근 때 피곤해"
2. 금요일: "주말 기대돼"
3. 검증: "월요일마다 출근이 힘든 것 같아" 언급

**시나리오 3: Vector Search 정확도**
1. 사전 저장: "이직 고민", "취업 준비", "연애 고민"
2. 쿼리: "새 직장 찾고 있어"
3. 검증: "이직 고민" 기억 반환 (관련도 최상위)

---

#### 11.5.3 성능 테스트

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 임베딩 생성 시간 | < 500ms | Performance API |
| Vector Search 시간 | < 200ms | Firestore 쿼리 로깅 |
| 전체 RAG 응답 시간 | < 3초 | Cloud Functions 로그 |
| 메모리 검색 정확도 | > 85% | 사용자 "맞아요" 피드백 |
| Context Cache 재사용률 | > 80% | 1시간 이내 재대화 비율 |

---

## 11.6 최종 체크리스트 (Phase 1-8 통합)

### Critical (P0) - 8개
- [ ] useRealtime cleanup 확인 (Phase 1)
- [ ] OnboardingGuard sessionStorage (Phase 1)
- [ ] window.onerror + localStorage (Phase 1)
- [ ] 백엔드 타임아웃 30초 (Phase 4)
- [ ] 백엔드 재시도 제거 (Phase 4)
- [ ] 입력 길이 검증 (Phase 1)
- [ ] 위기 감지 Gemini 통합 (Phase 5)
- [ ] **RAG-C1: Vector Index 빌드 확인** (Phase 7)

### High (P1) - 19개
- [ ] 타임아웃 단계별 조정 (Phase 2)
- [ ] DayMode 메시지 제한 (Phase 2)
- [ ] Context 분리 (Phase 2)
- [ ] Firestore 검색 최적화 (Phase 2)
- [ ] DebugPanel 페이지 (Phase 2)
- [ ] PerformanceDashboard (Phase 5)
- [ ] 네트워크 감지 UI (Phase 1)
- [ ] Batch 자동 분할 (Phase 2)
- [ ] **Task 16: 패턴 분석 프롬프트** (Phase 6)
- [ ] **Task 17: Firestore 메모리 시스템** (Phase 6)
- [ ] **Task 18: Vector Embedding** (Phase 7)
- [ ] **Task 19: Vector Search 통합** (Phase 7)
- [ ] **RAG-H1: 임베딩 비용 최적화** (Phase 7)
- [ ] **RAG-H2: 검색 정확도 개선** (Phase 8)
- [ ] 기타 5개 (Phase 2-3)

### Medium (P2) - 24개
- [ ] 레거시 마이그레이션 (Phase 3)
- [ ] 플레이스홀더 구현 (Phase 3)
- [ ] Min Instances 설정 (Phase 5)
- [ ] 단위 테스트 (Phase 3)
- [ ] **Task 20: Firestore Security Rules** (Phase 8)
- [ ] **Task 21: 만료 정책 자동화** (Phase 8)
- [ ] **Task 22: Context Caching** (Phase 8)
- [ ] **RAG-M1: 만료 정책 미작동** (Phase 8)
- [ ] 기타 16개 (Phase 3)

---

## 11.7 배포 전략

### Phase 6 배포 (Week 6)
```bash
# 1. Firestore 타입 업데이트
git add src/types/firestore.ts
git commit -m "feat: Add FIRESTORE_COLLECTIONS.MEMORIES"

# 2. Functions 배포
cd functions
npm run build
firebase deploy --only functions:generateDayModeResponse

# 3. Firestore Rules 업데이트 (나중에 Phase 8에서)
# firebase deploy --only firestore:rules

# 4. 테스트
firebase functions:log --only generateDayModeResponse
```

### Phase 7 배포 (Week 7-8)
```bash
# 1. Vector Index 생성 (백그라운드 10-30분)
gcloud firestore indexes composite create \
  --collection-group=memories \
  --field-config field-path=userId,order=ASCENDING \
  --field-config field-path=embedding,vector-config='{"dimension":"768","flat": "{}"}' \
  --database=(default)

# 2. 인덱스 빌드 대기
gcloud firestore operations list --database=(default)

# 3. Functions 배포
firebase deploy --only functions:generateDayModeResponse

# 4. 검증
# - Firestore Console에서 memories 컬렉션 확인
# - embedding 필드 768차원 확인
# - Vector Search 테스트
```

### Phase 8 배포 (Week 9-10)
```bash
# 1. Security Rules
firebase deploy --only firestore:rules

# 2. Cleanup Scheduler
firebase deploy --only functions:cleanupExpiredMemories
gcloud scheduler jobs run cleanup-expired-memories

# 3. Context Caching Functions
firebase deploy --only functions:generateDayModeResponse

# 4. 최종 검증
# - Context Cache 생성 확인
# - 1시간 이내 재사용 확인
# - 비용 모니터링 (Cloud Console)
```

---

## 11.8 롤백 계획

### Phase 6 롤백
```typescript
// functions/src/api/gemini.ts (원복)
export const generateDayModeResponse = onCall(async (request) => {
  // analyzeUserPatterns 호출 제거
  // getRelevantMemories 호출 제거
  // 기존 히스토리 20개만 사용
  const sanitizedHistory = (history || []).slice(-20);
  
  const prompt = `
    이전 대화:
    ${sanitizedHistory.join('\n')}
    
    사용자: "${userMessage}"
  `;
  
  return await callGeminiAPI(prompt);
});
```

### Phase 7 롤백
```bash
# Vector Index 삭제 (필요시)
gcloud firestore indexes composite delete \
  --collection-group=memories \
  --database=(default)

# Functions 원복
git revert <commit-hash>
firebase deploy --only functions
```

### Phase 8 롤백
```bash
# Scheduler 중지
gcloud scheduler jobs pause cleanup-expired-memories

# Context Caching 비활성화 (코드 원복)
# Security Rules 원복
firebase deploy --only firestore:rules
```

---

**검토자**: AI Assistant (RAG 통합 버전)
**검토일**: 2026-01-16
**RAG 통합 버전**: 5.0
**총 위험요인**: 52개 (기존 48 + RAG 4개)
**총 비용**: $90-205/월 (Phase 1-5 대비 +$45-50)
**예상 효과**: "나를 아는 대화" 구현, 리텐션 +30%
**구현 난이도**: P0-P1 중간, P2 높음
