# 마음로그 V5.0 위험요인 해결 액션 플랜

**작성일**: 2026-01-16
**전략**: 프론트엔드 먼저 → 확정 → 백엔드 조정
**원칙**: 외부 서비스 없이 React + Firebase만 사용

---

# Phase 1: 프론트엔드 Critical 수정 (1주)

## Day 1: 메모리 누수 및 저장소 폴백 (4시간)

### Task 1.1: useRealtime cleanup 전체 검토 ✅
```bash
# 검색
rg "onSnapshot" src/ -A 5

# 확인 대상
src/hooks/useRealtime.ts
src/features/checkin/useDayCheckinMachine.ts
src/features/checkin/useNightCheckinMachine.ts
```

**체크리스트**:
- [ ] useEffect cleanup에서 unsubscribe() 호출 확인
- [ ] 없으면 추가
- [ ] 빌드 테스트

### Task 1.2: OnboardingGuard sessionStorage 폴백 ✅
**파일**: `src/router/guards.tsx`

```typescript
export const useOnboardingStatus = (): boolean => {
  try {
    return localStorage.getItem('onboarding_completed') === 'true';
  } catch {
    try {
      return sessionStorage.getItem('onboarding_completed') === 'true';
    } catch {
      const count = parseInt(sessionStorage.getItem('redirect_count') || '0');
      if (count >= 3) return true;
      sessionStorage.setItem('redirect_count', String(count + 1));
      return false;
    }
  }
};
```

**테스트**: 사생활 보호 모드에서 온보딩 진입 확인

---

## Day 2: 에러 처리 강화 (4시간)

### Task 2.1: window.onerror 핸들러 ✅
**파일**: `index.tsx`

```typescript
window.onerror = (msg, src, line, col, error) => {
  const log = {
    timestamp: new Date().toISOString(),
    message: String(msg),
    source: src,
    line, col,
    stack: error?.stack,
  };
  
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(log);
    localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50)));
  } catch {}
  
  console.error('Global error:', log);
};
```

### Task 2.2: DebugPanel 페이지 생성 ✅
**파일**: `src/pages/profile/DebugPanel.tsx` (신규)

```typescript
export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    setLogs(JSON.parse(localStorage.getItem('error_logs') || '[]'));
  }, []);
  
  return (
    <div className="p-4">
      <h2>에러 로그 ({logs.length})</h2>
      <button onClick={() => { localStorage.removeItem('error_logs'); setLogs([]); }}>
        지우기
      </button>
      {logs.map((log, i) => (
        <pre key={i} className="text-xs border p-2 mb-2">{JSON.stringify(log, null, 2)}</pre>
      ))}
    </div>
  );
};
```

**라우트 추가**: `src/router/routes.tsx`
```typescript
const DebugPanel = lazy(() => import('../pages/profile/DebugPanel').then(m => ({ default: m.DebugPanel })));
<Route path="profile/debug" element={<LoadingWrapper><DebugPanel /></LoadingWrapper>} />
```

---

## Day 3: 입력 검증 및 메시지 제한 (3시간)

### Task 3.1: 입력 길이 검증 ✅
**파일**: `src/components/chat/DayMode.tsx`, `NightMode.tsx`

```typescript
const MAX_INPUT_LENGTH = 10000;

// DayMode
<input
  maxLength={MAX_INPUT_LENGTH}
  value={input}
  onChange={(e) => machine.updateInput(e.target.value)}
/>

// NightMode
<textarea
  maxLength={MAX_INPUT_LENGTH}
  value={machine.diary}
  onChange={(e) => machine.updateDiary(e.target.value)}
/>
```

### Task 3.2: DayMode 메시지 배열 제한 ✅
**파일**: `src/features/checkin/useDayCheckinMachine.ts`

```typescript
// addMessage 함수 수정
const addMessage = (message: Message) => {
  setMessages(prev => [...prev, message].slice(-100)); // 최근 100개만
};
```

**테스트**: 100개 이상 메시지 입력 후 메모리 확인

---

## Day 4-5: 네트워크 및 오프라인 처리 (6시간)

### Task 4.1: UIContext에 isOnline 추가 ✅
**파일**: `src/contexts/UIContext.tsx`

```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine);

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
```

### Task 4.2: 오프라인 배너 UI ✅
**파일**: `src/components/layout/MainLayout.tsx`

```typescript
const { isOnline } = useUIContext();

{!isOnline && (
  <div className="fixed top-0 left-0 right-0 z-max bg-yellow-500 text-white text-center py-2 text-sm">
    ⚠️ 오프라인 모드 - 일부 기능이 제한됩니다
  </div>
)}
```

---

# Phase 2: 프론트엔드 High 수정 (2주)

## Week 1: 타임아웃 및 Context 최적화

### Task 5: 타임아웃 단계별 조정 (2시간)
**파일**: `src/services/apiPolicy.ts`

```typescript
export async function callWithPolicy<T>(apiCall: () => Promise<T>, options: ApiPolicyOptions = {}): Promise<ApiResponse<T>> {
  const timeouts = [
    options.timeout || 15000,  // 1차: 15초
    10000, // 2차: 10초
    5000,  // 3차: 5초
  ];
  
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeouts[attempt]);
      });
      return { success: true, data: await Promise.race([apiCall(), timeoutPromise]) };
    } catch (error) {
      if (attempt === 2 || !isNetworkError(error)) break;
      await new Promise(r => setTimeout(r, calculateBackoffDelay(attempt, 1000, 2)));
    }
  }
  
  if (fallback) return { success: false, fallback: await fallback(), _isMockData: true };
  return { success: false, error: 'All retries failed' };
}
```

### Task 6: Context 분리 (6시간)

**신규 파일**: `src/contexts/ModeContext.tsx`
```typescript
const ModeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>(undefined);

export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>('day');
  
  useEffect(() => {
    resolveMode().then(setModeState);
    const interval = setInterval(async () => {
      if (!getModeOverride()) setModeState(await resolveMode());
    }, 5 * 60 * 1000); // 5분
    return () => clearInterval(interval);
  }, []);
  
  const setMode = useCallback((newMode: Mode) => {
    setModeOverride(newMode);
    setModeState(newMode);
  }, []);
  
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};
```

**수정**: `src/contexts/AppContext.tsx` - mode 제거, persona/timeline만 관리
**수정**: `src/router/Router.tsx` - ModeProvider 추가

---

## Week 2: 검색 및 Batch 최적화

### Task 7: Firestore 검색 복합 쿼리 (8시간)
**파일**: `src/services/firestore.ts`

```typescript
export async function searchConversations(
  searchQuery: string,
  filters?: { emotion?: EmotionType; dateRange?: { start: Date; end: Date } }
): Promise<FirestoreConversation[]> {
  const userId = getCurrentUserId();
  const queries: Query[] = [];
  
  // 1. 태그 검색
  if (searchQuery) {
    queries.push(query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('contextTags', 'array-contains', searchQuery.toLowerCase()),
      orderBy('updatedAt', 'desc'),
      limit(20)
    ));
  }
  
  // 2. 감정 필터
  if (filters?.emotion) {
    queries.push(query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('emotion', '==', filters.emotion),
      orderBy('updatedAt', 'desc'),
      limit(20)
    ));
  }
  
  // 3. 날짜 범위
  if (filters?.dateRange) {
    queries.push(query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.end)),
      orderBy('createdAt', 'desc'),
      limit(20)
    ));
  }
  
  const results = await Promise.all(queries.map(q => getDocs(q)));
  const map = new Map();
  results.forEach(snap => snap.docs.forEach(doc => map.set(doc.id, { id: doc.id, ...doc.data() })));
  
  return Array.from(map.values()).filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
```

### Task 8: Batch 자동 분할 (3시간)
**파일**: `src/services/firestore.ts`

```typescript
export async function deleteAllConversations(
  onProgress?: (deleted: number) => void
): Promise<void> {
  const userId = getCurrentUserId();
  let totalDeleted = 0;
  
  while (true) {
    const snapshot = await getDocs(query(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      limit(500)
    ));
    
    if (snapshot.empty) break;
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    totalDeleted += snapshot.docs.length;
    onProgress?.(totalDeleted);
  }
}
```

**UI**: `src/pages/profile/Privacy.tsx`에 진행률 표시

---

# Phase 3: 프론트엔드 테스트 및 확정 (1주)

## Task 9: Critical Path 단위 테스트 (3일)

**파일**: `src/services/__tests__/`

```typescript
// crisisDetection.test.ts
describe('detectCrisisByKeyword', () => {
  it('detects crisis keywords', () => {
    expect(detectCrisisByKeyword('죽고 싶다').isCrisis).toBe(true);
  });
});

// guards.test.tsx
describe('OnboardingGuard', () => {
  it('uses sessionStorage fallback', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error(); });
    const status = useOnboardingStatus();
    // sessionStorage 확인
  });
});

// apiPolicy.test.ts
describe('callWithPolicy', () => {
  it('retries on network error', async () => {
    // 재시도 로직 테스트
  });
});
```

## Task 10: 통합 테스트 (2일)

**수동 테스트 체크리스트**:
- [ ] 온보딩 플로우 (localStorage 비활성화)
- [ ] Day Mode 100개 메시지 입력
- [ ] Night Mode 10000자 일기
- [ ] 위기 키워드 입력 시 SafetyMain
- [ ] 오프라인 모드 진입/복귀
- [ ] 대화 500개 이상 삭제
- [ ] 에러 발생 시 DebugPanel 확인

---

# Phase 4: 백엔드 조정 (3일)

## Task 11: 타임아웃 단축 (1시간)

**파일**: `functions/src/api/gemini.ts`

```typescript
export const generateDayModeResponse = onCall({
  timeoutSeconds: 30, // 90 → 30
  memory: "512MiB",
}, ...);

// 모든 7개 함수 동일 적용
```

## Task 12: 재시도 제거 (1시간)

**파일**: `functions/src/services/gemini.ts`

```typescript
export async function callGeminiAPI(prompt: string, model: string): Promise<string> {
  const client = await initializeGeminiClient();
  const response = await client.models.generateContent({ model, contents: prompt });
  return response.text || "";
}

// async-retry 제거
```

## Task 13: 배포 및 검증 (1일)

```bash
cd functions
npm run build
firebase deploy --only functions

# 로그 확인
firebase functions:log --only generateDayModeResponse

# 테스트
# 프론트에서 API 호출 → 30초 타임아웃 확인
```

---

# Phase 5: 추가 개선 (2주, 선택적)

## Task 14: 위기 감지 Gemini 통합 (1일)

**신규 Function**: `functions/src/api/gemini.ts`

```typescript
export const analyzeCrisisRisk = onCall({
  timeoutSeconds: 15,
  memory: "256MiB",
}, async (request) => {
  const { text } = request.data;
  const prompt = `다음 텍스트가 자해/자살 위험을 나타내는지 분석. JSON만 출력: {"isCrisis": boolean, "confidence": "high"|"medium"|"low", "reason": "설명"}\n\n텍스트: "${text}"`;
  
  const response = await callGeminiAPI(prompt, "gemini-3-flash-preview");
  return JSON.parse(response.replace(/```json|```/g, '').trim());
});
```

**프론트 수정**: `src/services/crisisDetection.ts`

```typescript
export async function detectCrisis(params): Promise<CrisisDetectionResult> {
  const keywordResult = params.text ? detectCrisisByKeyword(params.text) : { isCrisis: false };
  if (keywordResult.isCrisis) return keywordResult;
  
  // Gemini API 분석
  if (params.text) {
    try {
      const aiResult = await callFunction('analyzeCrisisRisk', { text: params.text });
      if (aiResult.data?.isCrisis) return {
        isCrisis: true,
        reason: 'ai_analysis',
        confidence: aiResult.data.confidence,
        details: aiResult.data.reason,
      };
    } catch {}
  }
  
  // 기존 강도/패턴 검사
  // ...
}
```

## Task 15: 성능 메트릭 대시보드 (1일)

**파일**: `src/utils/performance.ts` (신규)

```typescript
export function measureAPICall(fnName: string, operation: () => Promise<any>) {
  const start = performance.now();
  return operation().then(
    result => {
      const duration = performance.now() - start;
      const metrics = JSON.parse(localStorage.getItem('api_metrics') || '{}');
      if (!metrics[fnName]) metrics[fnName] = [];
      metrics[fnName].push({ timestamp: Date.now(), duration, success: true });
      metrics[fnName] = metrics[fnName].slice(-100);
      localStorage.setItem('api_metrics', JSON.stringify(metrics));
      return result;
    },
    error => {
      const duration = performance.now() - start;
      const metrics = JSON.parse(localStorage.getItem('api_metrics') || '{}');
      if (!metrics[fnName]) metrics[fnName] = [];
      metrics[fnName].push({ timestamp: Date.now(), duration, success: false });
      metrics[fnName] = metrics[fnName].slice(-100);
      localStorage.setItem('api_metrics', JSON.stringify(metrics));
      throw error;
    }
  );
}
```

**페이지**: `src/pages/profile/Performance.tsx` (신규)

---

# 전체 타임라인

| Phase | 기간 | 작업 | 결과 |
|-------|------|------|------|
| **Phase 1** | Week 1 | 프론트 Critical 6개 | 메모리 누수, 저장소, 에러 처리 |
| **Phase 2** | Week 2-3 | 프론트 High 12개 | 타임아웃, Context, 검색, Batch |
| **Phase 3** | Week 4 | 프론트 테스트 | 단위/통합 테스트 |
| **Phase 4** | Week 5 (Day 1-3) | 백엔드 조정 | 타임아웃, 재시도 제거 |
| **Phase 5** | Week 5-6 | 추가 개선 | 위기 감지, 메트릭 |

**총 기간**: 5-6주
**비용**: $0 (Min Instances 제외)

---

# 체크리스트 (순서대로 실행)

## ✅ Week 1: Critical
- [ ] Task 1.1: useRealtime cleanup 검토
- [ ] Task 1.2: OnboardingGuard 폴백
- [ ] Task 2.1: window.onerror
- [ ] Task 2.2: DebugPanel 페이지
- [ ] Task 3.1: 입력 길이 검증
- [ ] Task 3.2: 메시지 100개 제한
- [ ] Task 4.1: isOnline Context
- [ ] Task 4.2: 오프라인 배너
- [ ] 빌드 테스트: `npm run build`
- [ ] 배포: Hosting

## ✅ Week 2-3: High
- [ ] Task 5: 타임아웃 단계별
- [ ] Task 6: Context 분리
- [ ] Task 7: Firestore 검색
- [ ] Task 8: Batch 분할
- [ ] MainLayout useMemo
- [ ] EmotionSelectModal 반응형
- [ ] NightMode maxHeight
- [ ] 빌드 테스트
- [ ] 배포

## ✅ Week 4: 테스트
- [ ] Task 9: 단위 테스트 (3일)
- [ ] Task 10: 통합 테스트 (2일)
- [ ] 커버리지 80% 이상

## ✅ Week 5 (Day 1-3): 백엔드
- [ ] Task 11: 타임아웃 30초
- [ ] Task 12: 재시도 제거
- [ ] Task 13: 배포 및 검증
- [ ] 로그 모니터링

## ✅ Week 5-6 (선택): 추가
- [ ] Task 14: 위기 감지 AI
- [ ] Task 15: 성능 대시보드
- [ ] Min Instances 설정
- [ ] 최종 테스트

---

# Phase 6: RAG 기반 기억 시스템 구축 (4주)

**작성일**: 2026-01-16
**전제 조건**: Phase 1-5 완료 (Critical/High 위험요인 해결)
**목표**: "나를 아는 AI 동반자" 핵심 가치 구현
**전략**: Firebase Vector Search 기반, 점진적 확장
**비용**: +$45-50/월 (기존 $45-155 → $90-205)

---

## Week 6: 스마트 컨텍스트 + Firestore 메모리 (1주)

### Task 16: 패턴 분석 기반 프롬프트 개선 (Day 1-2)

**목표**: 기존 Firestore 데이터 활용해 "이해하는 것처럼" 보이는 효과

#### Task 16.1: 패턴 분석 서비스 생성 ✅
**파일**: `functions/src/services/memoryContext.ts` (신규)

```typescript
import { Firestore } from 'firebase-admin/firestore';

interface EmotionPattern {
  topEmotions: string[];
  topContexts: string[];
  weekdayPattern?: string;
  timePattern?: string;
}

export async function analyzeUserPatterns(
  db: Firestore,
  userId: string
): Promise<EmotionPattern> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const emotions = await db.collection('emotions')
    .where('userId', '==', userId)
    .where('timestamp', '>', sevenDaysAgo)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();
  
  const data = emotions.docs.map(d => d.data());
  
  // 빈도 분석
  const emotionCounts = countFrequency(data.map(e => e.emotion));
  const contextCounts = countFrequency(data.flatMap(e => e.contextTags || []));
  
  // 요일별 패턴 감지
  const weekdayMap = groupByWeekday(data);
  const weekdayPattern = detectWeekdayPattern(weekdayMap);
  
  return {
    topEmotions: Object.keys(emotionCounts).slice(0, 3),
    topContexts: Object.keys(contextCounts).slice(0, 5),
    weekdayPattern,
  };
}

function countFrequency(items: string[]): Record<string, number> {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function groupByWeekday(emotions: any[]): Map<number, any[]> {
  const map = new Map<number, any[]>();
  emotions.forEach(e => {
    const day = new Date(e.timestamp.toDate()).getDay();
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(e);
  });
  return map;
}

function detectWeekdayPattern(weekdayMap: Map<number, any[]>): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const patterns: string[] = [];
  
  weekdayMap.forEach((emotions, dayNum) => {
    const avgIntensity = emotions.reduce((sum, e) => sum + e.intensity, 0) / emotions.length;
    const dominantEmotion = Object.keys(countFrequency(emotions.map(e => e.emotion)))[0];
    
    if (avgIntensity >= 7) {
      patterns.push(`${days[dayNum]}요일에 주로 ${dominantEmotion} (강도 ${avgIntensity.toFixed(1)})`);
    }
  });
  
  return patterns.join(', ') || '특별한 패턴 없음';
}
```

**테스트**: 
- [ ] 월요일에 회의 관련 불안 패턴 감지 확인
- [ ] AI 응답에 패턴 언급 포함 여부
- [ ] 사용자 "맞아요" 반응률 측정

---

#### Task 16.2: Gemini 프롬프트 통합 ✅
**파일**: `functions/src/api/gemini.ts` (수정)

```typescript
import { analyzeUserPatterns } from '../services/memoryContext';

export const generateDayModeResponse = onCall(async (request) => {
  const { userMessage, history, persona, userId } = request.data;
  
  // 패턴 분석 추가
  const patterns = await analyzeUserPatterns(db, userId);
  
  const sanitizedMessage = sanitizeUserInput(userMessage);
  const sanitizedHistory = (history || []).slice(-20).map(h => sanitizeUserInput(h));
  
  const prompt = `
    ${getSystemInstruction(persona)}
    
    === 이 사용자에 대한 관찰 (최근 7일) ===
    주요 감정: ${patterns.topEmotions.join(', ')}
    자주 언급하는 상황: ${patterns.topContexts.join(', ')}
    패턴: ${patterns.weekdayPattern}
    
    === 최근 대화 (20개) ===
    ${sanitizedHistory.join("\\n")}
    
    === 현재 대화 ===
    사용자: "${sanitizedMessage}"
    
    응답 규칙:
    1. 위 패턴과 관련 있으면 자연스럽게 언급
    2. "지난주에도 비슷했던 것 같아" 같은 표현 사용
    3. 반복 패턴이 있으면 "혹시 또 X 때문이야?" 질문
  `;
  
  const response = await callGeminiAPI(prompt, "gemini-3-pro-preview", {
    temperature: 0.7,
    maxTokens: 500,
  });
  
  return { success: true, data: response };
});
```

**배포**:
```bash
cd functions
npm run build
firebase deploy --only functions:generateDayModeResponse
```

---

### Task 17: Firestore 텍스트 메모리 시스템 (Day 3-5)

**목표**: 대화 요약 저장으로 30일 장기 기억 구현

#### Task 17.1: Firestore 컬렉션 추가 ✅
**파일**: `src/types/firestore.ts` (수정)

```typescript
export const FIRESTORE_COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  EMOTIONS: 'emotions',
  DIARIES: 'diaries',
  USER_PROFILES: 'userProfiles',
  MICRO_ACTIONS: 'microActions',
  MICRO_ACTION_LOGS: 'microActionLogs',
  WEEKLY_REPORTS: 'weeklyReports',
  MONTHLY_REPORTS: 'monthlyReports',
  CONTENTS: 'contents',
  TIMELINE: 'timeline',
  MEMORIES: 'memories', // 👈 추가
} as const;

export interface FirestoreMemory {
  id: string;
  userId: string;
  conversationId: string;
  summary: string; // AI가 요약한 핵심 내용
  emotionTags: string[];
  contextTags: string[];
  importance: number; // 1-10
  createdAt: Timestamp;
  expiresAt: Timestamp; // 90일 후
}
```

---

#### Task 17.2: 메모리 서비스 구현 ✅
**파일**: `functions/src/services/memoryService.ts` (신규)

```typescript
import { Firestore } from 'firebase-admin/firestore';
import { callGeminiAPI } from './gemini';

export async function summarizeAndSaveMemory(
  db: Firestore,
  userId: string,
  conversationId: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  // 1. Gemini로 대화 요약
  const summaryPrompt = `
    다음 대화에서 기억해야 할 핵심 정보만 추출하세요.
    
    대화:
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    출력 형식 (JSON):
    {
      "summary": "1-2문장으로 핵심 요약",
      "emotionTags": ["감정1", "감정2"],
      "contextTags": ["상황1", "상황2"],
      "importance": 1-10 (숫자)
    }
    
    중요도 기준:
    - 위기/고민/중요한 결정: 9-10
    - 일상적 스트레스: 5-7
    - 평범한 대화: 1-4
  `;
  
  const response = await callGeminiAPI(summaryPrompt, 'gemini-3-flash-preview');
  const cleaned = response.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  
  // 2. Firestore 저장
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  await db.collection('memories').add({
    userId,
    conversationId,
    summary: parsed.summary,
    emotionTags: parsed.emotionTags,
    contextTags: parsed.contextTags,
    importance: parsed.importance,
    createdAt: Firestore.Timestamp.now(),
    expiresAt: Firestore.Timestamp.fromDate(expiresAt),
  });
}

export async function getRelevantMemories(
  db: Firestore,
  userId: string,
  limit: number = 5
): Promise<string[]> {
  // 최근 30일, 중요도 높은 순
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const memories = await db.collection('memories')
    .where('userId', '==', userId)
    .where('createdAt', '>', Firestore.Timestamp.fromDate(thirtyDaysAgo))
    .orderBy('createdAt', 'desc')
    .orderBy('importance', 'desc')
    .limit(limit)
    .get();
  
  return memories.docs.map(d => d.data().summary);
}
```

---

#### Task 17.3: 프롬프트 통합 ✅
**파일**: `functions/src/api/gemini.ts` (수정)

```typescript
import { getRelevantMemories, summarizeAndSaveMemory } from '../services/memoryService';

export const generateDayModeResponse = onCall(async (request) => {
  const { userMessage, history, persona, userId, conversationId } = request.data;
  
  // 1. 관련 기억 가져오기 (최근 30일, 중요도 높은 순 5개)
  const memories = await getRelevantMemories(db, userId, 5);
  
  // 2. 패턴 분석
  const patterns = await analyzeUserPatterns(db, userId);
  
  const sanitizedMessage = sanitizeUserInput(userMessage);
  const sanitizedHistory = (history || []).slice(-20).map(h => sanitizeUserInput(h));
  
  const prompt = `
    ${getSystemInstruction(persona)}
    
    === 장기 기억 (최근 30일) ===
    ${memories.map((m, i) => `${i+1}. ${m}`).join('\n')}
    
    === 패턴 관찰 (최근 7일) ===
    ${patterns.weekdayPattern}
    
    === 최근 대화 (20개) ===
    ${sanitizedHistory.join("\\n")}
    
    === 현재 ===
    사용자: "${sanitizedMessage}"
    
    응답 시:
    - 장기 기억에서 관련 내용 찾아 "지난달에도 비슷한 얘기 했던 거 기억나?" 
    - 패턴이 반복되면 "또 그 패턴인가봐" 언급
  `;
  
  const response = await callGeminiAPI(prompt, "gemini-3-pro-preview");
  
  // 3. 대화 종료 후 요약 저장 (백그라운드)
  if (history && history.length >= 5) {
    summarizeAndSaveMemory(db, userId, conversationId, history).catch(console.error);
  }
  
  return { success: true, data: response };
});
```

**테스트**:
- [ ] 5개 이상 대화 후 memories 컬렉션에 저장 확인
- [ ] 30일 전 대화 참조 여부
- [ ] "지난달에 X 했었잖아" 응답 확인

**비용**: 월 $10 (요약 생성 비용)

---

## Week 7-8: Firebase Vector Search 구현 (2주)

### Task 18: Vector Embedding 시스템 (Week 7)

**목표**: 시맨틱 검색으로 관련 기억만 정확히 가져오기

#### Task 18.1: Gemini Embedding API 연동 ✅
**파일**: `functions/src/services/embeddingService.ts` (신규)

```typescript
import { GoogleGenAI } from "@google/genai";

export async function generateEmbedding(
  text: string,
  client: GoogleGenAI
): Promise<number[]> {
  const result = await client.models.embedContent({
    model: 'gemini-embedding-001',
    content: text.substring(0, 10000),
    config: {
      outputDimensionality: 768, // Firestore 권장
    },
  });
  
  return result.embedding.values;
}
```

---

#### Task 18.2: Firestore 타입 업데이트 ✅
**파일**: `src/types/firestore.ts` (수정)

```typescript
export interface FirestoreMemory {
  id: string;
  userId: string;
  conversationId: string;
  summary: string;
  embedding: number[]; // 👈 추가: 768차원 벡터
  emotionTags: string[];
  contextTags: string[];
  importance: number;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
```

---

#### Task 18.3: 임베딩 생성 로직 추가 ✅
**파일**: `functions/src/services/memoryService.ts` (수정)

```typescript
import { generateEmbedding } from './embeddingService';
import { initializeGeminiClient } from './gemini';

export async function summarizeAndSaveMemory(
  db: Firestore,
  userId: string,
  conversationId: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  // 1. 요약 생성 (기존)
  const summaryPrompt = `...`;
  const response = await callGeminiAPI(summaryPrompt, 'gemini-3-flash-preview');
  const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
  
  // 2. 임베딩 생성 (추가)
  const geminiClient = await initializeGeminiClient();
  const embedding = await generateEmbedding(parsed.summary, geminiClient);
  
  // 3. Firestore 저장
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  await db.collection('memories').add({
    userId,
    conversationId,
    summary: parsed.summary,
    embedding, // 👈 벡터 저장
    emotionTags: parsed.emotionTags,
    contextTags: parsed.contextTags,
    importance: parsed.importance,
    createdAt: Firestore.Timestamp.now(),
    expiresAt: Firestore.Timestamp.fromDate(expiresAt),
  });
}
```

---

#### Task 18.4: Vector Index 생성 (gcloud CLI) ✅

```bash
# Firestore Vector Index 생성
gcloud firestore indexes composite create \
  --collection-group=memories \
  --query-scope=COLLECTION \
  --field-config field-path=userId,order=ASCENDING \
  --field-config field-path=embedding,vector-config='{"dimension":"768","flat": "{}"}' \
  --database=(default)

# 인덱스 빌드 완료까지 대기 (10-30분)
gcloud firestore operations list --database=(default)
```

**테스트**:
- [ ] 임베딩 생성 성공 확인
- [ ] Firestore에 768차원 벡터 저장 확인
- [ ] gcloud 인덱스 빌드 완료 확인

---

### Task 19: Vector Search 통합 (Week 8)

**목표**: 의미 기반 검색으로 정확도 85% 달성

#### Task 19.1: Vector Search 함수 구현 ✅
**파일**: `functions/src/services/memoryService.ts` (추가)

```typescript
import { FieldPath } from 'firebase-admin/firestore';

export async function searchMemoriesWithVector(
  db: Firestore,
  userId: string,
  queryText: string,
  geminiClient: GoogleGenAI,
  limit: number = 5
): Promise<Array<{ summary: string; score: number }>> {
  // 1. 쿼리 임베딩 생성
  const queryEmbedding = await generateEmbedding(queryText, geminiClient);
  
  // 2. Firestore Vector Search
  const vectorQuery = db.collection('memories')
    .where('userId', '==', userId)
    .where('expiresAt', '>', Firestore.Timestamp.now());
  
  // findNearest는 서버 사이드 SDK만 지원
  const results = await vectorQuery.findNearest(
    'embedding',
    queryEmbedding,
    {
      limit,
      distanceMeasure: 'COSINE',
    }
  ).get();
  
  return results.docs.map(doc => ({
    summary: doc.data().summary,
    score: doc.data()._distance || 0,
  }));
}
```

---

#### Task 19.2: Gemini 프롬프트 통합 ✅
**파일**: `functions/src/api/gemini.ts` (수정)

```typescript
import { searchMemoriesWithVector } from '../services/memoryService';

export const generateDayModeResponse = onCall(async (request) => {
  const { userMessage, history, persona, userId } = request.data;
  
  const geminiClient = await initializeGeminiClient();
  
  // Vector Search로 관련 기억 검색
  const relevantMemories = await searchMemoriesWithVector(
    db,
    userId,
    userMessage,
    geminiClient,
    5
  );
  
  const patterns = await analyzeUserPatterns(db, userId);
  
  const sanitizedMessage = sanitizeUserInput(userMessage);
  const sanitizedHistory = (history || []).slice(-20).map(h => sanitizeUserInput(h));
  
  const prompt = `
    ${getSystemInstruction(persona)}
    
    === 관련 기억 (유사도 기반) ===
    ${relevantMemories.map((m, i) => 
      `${i+1}. ${m.summary} (관련도: ${(1-m.score).toFixed(2)})`
    ).join('\n')}
    
    === 패턴 ===
    ${patterns.weekdayPattern}
    
    === 최근 대화 ===
    ${sanitizedHistory.join("\\n")}
    
    사용자: "${sanitizedMessage}"
  `;
  
  const response = await callGeminiAPI(prompt, "gemini-3-pro-preview");
  
  // 대화 요약 저장 (백그라운드)
  if (history && history.length >= 5) {
    summarizeAndSaveMemory(db, userId, request.data.conversationId, history).catch(console.error);
  }
  
  return { success: true, data: response };
});
```

**테스트**:
- [ ] "발표" 키워드로 과거 발표 관련 기억 검색 확인
- [ ] 유사도 점수 0.7 이상만 반환 확인
- [ ] 사용자 "맞아요" 반응률 60% 이상

**비용**: 월 $15 (임베딩 생성 비용)

---

## Week 9-10: 하이브리드 검색 + Context Caching (2주)

### Task 20: Firestore Security Rules 추가 (Day 1)

**파일**: `firestore.rules` (수정)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // memories 컬렉션 규칙 추가
    match /memories/{memoryId} {
      allow read: if request.auth != null 
        && request.auth.uid == resource.data.userId
        && resource.data.expiresAt > request.time;
      
      allow write: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
      
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

**배포**:
```bash
firebase deploy --only firestore:rules
```

---

### Task 21: 만료 정책 자동화 (Day 2-3)

**목표**: 90일 이후 자동 정리

#### Task 21.1: Cloud Scheduler 설정 ✅

```bash
# Cloud Scheduler 작업 생성 (매일 02:00 UTC)
gcloud scheduler jobs create http cleanup-expired-memories \
  --schedule="0 2 * * *" \
  --uri="https://asia-northeast3-iiness-mlog.cloudfunctions.net/cleanupExpiredMemories" \
  --http-method=POST \
  --oidc-service-account-email="iiness-mlog@appspot.gserviceaccount.com"
```

---

#### Task 21.2: Cleanup Function 구현 ✅
**파일**: `functions/src/api/cleanup.ts` (신규)

```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

export const cleanupExpiredMemories = onSchedule({
  schedule: '0 2 * * *', // 매일 02:00 UTC
  timeZone: 'Asia/Seoul',
  region: 'asia-northeast3',
}, async (event) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  
  const expiredQuery = db.collection('memories')
    .where('expiresAt', '<', now)
    .limit(500);
  
  let totalDeleted = 0;
  let hasMore = true;
  
  while (hasMore) {
    const snapshot = await expiredQuery.get();
    
    if (snapshot.empty) {
      hasMore = false;
      break;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    totalDeleted += snapshot.docs.length;
  }
  
  console.log(`Deleted ${totalDeleted} expired memories`);
});
```

---

#### Task 21.3: functions/src/index.ts 업데이트 ✅

```typescript
// Gemini API Functions
export {
  generateDayModeResponse,
  generateNightModeLetter,
  generateMonthlyNarrative,
  generateHealingContent,
  generateChatbotResponse,
  generateMicroAction,
  generateTimelineAnalysis,
} from "./api/gemini";

// Cleanup Functions
export {
  cleanupExpiredMemories,
} from "./api/cleanup";
```

**배포**:
```bash
firebase deploy --only functions:cleanupExpiredMemories
```

---

### Task 22: Gemini 1.5 Context Caching (Day 4-7)

**목표**: 비용 86% 절감, 100개 이상 기억 캐싱

#### Task 22.1: Context Caching 서비스 구현 ✅
**파일**: `functions/src/services/contextCaching.ts` (신규)

```typescript
import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from "./gemini";

interface CachedContextInfo {
  name: string;
  createdAt: Date;
  ttl: number;
}

const userContextCache = new Map<string, CachedContextInfo>();

export async function getOrCreateCachedContext(
  geminiClient: GoogleGenAI,
  userId: string,
  memories: string[],
  patterns: string,
  persona: any
): Promise<string> {
  // 1. 캐시 확인 (1시간 TTL)
  const cached = userContextCache.get(userId);
  if (cached && Date.now() - cached.createdAt.getTime() < cached.ttl) {
    return cached.name;
  }
  
  // 2. 새 캐시 생성
  const cachedContext = await geminiClient.models.createCachedContext({
    model: 'gemini-1.5-pro',
    systemInstruction: getSystemInstruction(persona),
    contents: [{
      role: 'user',
      parts: [{
        text: `
          === 사용자 프로필 ===
          ID: ${userId}
          페르소나: ${persona.name}
          
          === 장기 기억 (최근 30일, ${memories.length}개) ===
          ${memories.join('\n\n')}
          
          === 감정 패턴 ===
          ${patterns}
          
          이 정보를 바탕으로 대화하세요.
        `
      }]
    }],
    ttl: '3600s', // 1시간
  });
  
  // 3. 캐시 저장
  userContextCache.set(userId, {
    name: cachedContext.name,
    createdAt: new Date(),
    ttl: 3600 * 1000,
  });
  
  return cachedContext.name;
}

export async function generateResponseWithCache(
  geminiClient: GoogleGenAI,
  cachedContextName: string,
  userMessage: string,
  recentHistory: string[]
): Promise<string> {
  const response = await geminiClient.models.generateContent({
    model: 'gemini-1.5-pro',
    cachedContext: cachedContextName,
    contents: `
      === 최근 대화 (10개) ===
      ${recentHistory.join('\n')}
      
      === 현재 ===
      사용자: "${userMessage}"
      
      응답:
    `,
  });
  
  return response.text || '';
}
```

---

#### Task 22.2: Gemini API 통합 ✅
**파일**: `functions/src/api/gemini.ts` (수정)

```typescript
import { getOrCreateCachedContext, generateResponseWithCache } from '../services/contextCaching';

export const generateDayModeResponse = onCall(async (request) => {
  const { userMessage, history, persona, userId } = request.data;
  
  const geminiClient = await initializeGeminiClient();
  
  // 1. 모든 기억 가져오기 (최대 100개)
  const allMemories = await db.collection('memories')
    .where('userId', '==', userId)
    .orderBy('importance', 'desc')
    .limit(100)
    .get();
  
  const memorySummaries = allMemories.docs.map(d => d.data().summary);
  
  const patterns = await analyzeUserPatterns(db, userId);
  
  // 2. Cached Context 생성/재사용
  const cachedContextName = await getOrCreateCachedContext(
    geminiClient,
    userId,
    memorySummaries,
    patterns.weekdayPattern,
    persona
  );
  
  // 3. 캐시된 컨텍스트로 응답 생성
  const sanitizedHistory = (history || []).slice(-10).map(h => sanitizeUserInput(h));
  const response = await generateResponseWithCache(
    geminiClient,
    cachedContextName,
    sanitizeUserInput(userMessage),
    sanitizedHistory
  );
  
  // 4. 대화 요약 저장 (백그라운드)
  if (history && history.length >= 5) {
    summarizeAndSaveMemory(db, userId, request.data.conversationId, history).catch(console.error);
  }
  
  return { success: true, data: response };
});
```

**테스트**:
- [ ] 첫 대화: 캐시 생성 확인
- [ ] 1시간 이내 재대화: 캐시 재사용 확인
- [ ] 비용: 첫 대화 vs 재대화 비용 비교

**비용**: 
- 첫 대화: ~$0.05 (100K 토큰 캐싱)
- 재대화: ~$0.005 (캐시 재사용)
- **월 총비용: $20** (1000명 기준)

---

# 전체 타임라인 (업데이트)

| Phase | 기간 | 작업 | 비용 | 결과 |
|-------|------|------|------|------|
| **Phase 1** | Week 1 | 프론트 Critical 6개 | $0 | 메모리 누수, 저장소, 에러 처리 |
| **Phase 2** | Week 2-3 | 프론트 High 12개 | $0 | 타임아웃, Context, 검색 |
| **Phase 3** | Week 4 | 프론트 테스트 | $0 | 단위/통합 테스트 |
| **Phase 4** | Week 5 (Day 1-3) | 백엔드 조정 | $0 | 타임아웃, 재시도 |
| **Phase 5** | Week 5-6 | 추가 개선 | $10-15 | 위기 감지, 메트릭 |
| **Phase 6** | Week 6 | 스마트 컨텍스트 + Firestore 메모리 | $10 | "이해하는" 효과 70% |
| **Phase 7** | Week 7-8 | Firebase Vector Search | $15 | RAG 정확도 85% |
| **Phase 8** | Week 9-10 | 하이브리드 + Context Caching | $20 | RAG 정확도 95%, 비용 86% 절감 |

**총 기간**: 10주 (2.5개월)
**총 비용**: $55-70/월 (기존 $45-155 대비 +$10-15, RAG 가치 고려 시 합리적)

---

# 체크리스트 (순서대로 실행) - 업데이트

## ✅ Week 1: Critical
- [ ] Task 1.1: useRealtime cleanup 검토
- [ ] Task 1.2: OnboardingGuard 폴백
- [ ] Task 2.1: window.onerror
- [ ] Task 2.2: DebugPanel 페이지
- [ ] Task 3.1: 입력 길이 검증
- [ ] Task 3.2: 메시지 100개 제한
- [ ] Task 4.1: isOnline Context
- [ ] Task 4.2: 오프라인 배너
- [ ] 빌드 테스트: `npm run build`
- [ ] 배포: Hosting

## ✅ Week 2-3: High
- [ ] Task 5: 타임아웃 단계별
- [ ] Task 6: Context 분리
- [ ] Task 7: Firestore 검색
- [ ] Task 8: Batch 분할
- [ ] MainLayout useMemo
- [ ] EmotionSelectModal 반응형
- [ ] NightMode maxHeight
- [ ] 빌드 테스트
- [ ] 배포

## ✅ Week 4: 테스트
- [ ] Task 9: 단위 테스트 (3일)
- [ ] Task 10: 통합 테스트 (2일)
- [ ] 커버리지 80% 이상

## ✅ Week 5 (Day 1-3): 백엔드
- [ ] Task 11: 타임아웃 30초
- [ ] Task 12: 재시도 제거
- [ ] Task 13: 배포 및 검증
- [ ] 로그 모니터링

## ✅ Week 5-6: 추가 개선
- [ ] Task 14: 위기 감지 AI
- [ ] Task 15: 성능 대시보드
- [ ] Min Instances 설정
- [ ] 최종 테스트

## ✅ Week 6: RAG Foundation
- [ ] Task 16.1: memoryContext.ts 구현
- [ ] Task 16.2: Gemini 프롬프트 통합 (패턴)
- [ ] Task 17.1: FIRESTORE_COLLECTIONS.MEMORIES 추가
- [ ] Task 17.2: memoryService.ts 구현
- [ ] Task 17.3: Gemini 프롬프트 통합 (장기 기억)
- [ ] 배포 및 테스트
- [ ] 사용자 피드백 수집

## ✅ Week 7-8: Vector Search
- [ ] Task 18.1: embeddingService.ts 구현
- [ ] Task 18.2: FirestoreMemory.embedding 추가
- [ ] Task 18.3: 임베딩 생성 로직
- [ ] Task 18.4: gcloud Vector Index 생성
- [ ] Task 19.1: searchMemoriesWithVector 구현
- [ ] Task 19.2: Gemini 프롬프트 통합 (Vector Search)
- [ ] 배포 및 테스트
- [ ] 검색 정확도 측정

## ✅ Week 9-10: 최적화
- [ ] Task 20: Firestore Security Rules
- [ ] Task 21.1: Cloud Scheduler 설정
- [ ] Task 21.2: cleanupExpiredMemories 구현
- [ ] Task 21.3: functions/src/index.ts 업데이트
- [ ] Task 22.1: contextCaching.ts 구현
- [ ] Task 22.2: Context Caching 통합
- [ ] 최종 배포 및 검증
- [ ] 비용 모니터링

---

**문서 버전**: 2.0 (RAG 통합)
**최종 업데이트**: 2026-01-16
**총 Task 수**: 22개 (기존 15개 + RAG 7개)
**예상 완료**: 2026년 3월 말
