# 마음로그 V5.0 위험요인 해결 액션 플랜 (현재 코드베이스용)

**작성일**: 2026-01-17
**기준**: C:\INEESm (현재 메인 코드베이스)
**검증 완료**: RISK_VERIFICATION_CURRENT_CODEBASE.md 참조
**전략**: 프론트엔드 먼저 → 확정 → 백엔드 조정
**원칙**: 외부 서비스 없이 React + Firebase만 사용

---

## 실행 요약

| 구분 | 위험요인 수 | 해결 완료 | 미해결 | 해결율 |
|------|-----------|----------|--------|--------|
| Critical | 7개 | 1개 (FE-C6) | 6개 | 14% |
| High | 15개 | 0개 | 15개 | 0% |
| Medium | 20개 | 1개 | 19개 | 5% |
| Low | 6개 | 0개 | 6개 | 0% |
| **합계** | **48개** | **2개** | **46개** | **4.2%** |

**즉시 조치 필요 (P0)**: 6개 (예상 8.5시간)

---

# Phase 1: 프론트엔드 Critical 수정 (1주)

## Day 1: 에러 처리 및 메모리 누수 (4시간)

### ✅ Task 1.1: useRealtime cleanup 검증
**상태**: ✅ **이미 해결됨**
- 검증 완료: 모든 4개 useEffect에서 `unsubscribe()` 호출 확인
- 추가 작업 불필요

### Task 1.2: window.onerror 핸들러 추가 (1시간)
**파일**: `index.tsx`
**현재 상태**: ❌ 핸들러 없음 (16줄만 존재)

```typescript
// index.tsx 상단에 추가 (ReactDOM.createRoot 전)
import { auth } from './src/config/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './src/config/firebase';

// 전역 에러 핸들러
window.onerror = (message, source, lineno, colno, error) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: String(message),
    source: source || 'unknown',
    line: lineno,
    column: colno,
    stack: error?.stack || 'No stack trace',
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
  
  // localStorage에 로깅 (최근 50개만 유지)
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(errorLog);
    localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50)));
  } catch {}
  
  console.error('Global error:', errorLog);
  return false; // 기본 에러 처리 계속 진행
};

// 처리되지 않은 Promise rejection 핸들러
window.onunhandledrejection = (event) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: String(event.reason),
    type: 'unhandledrejection',
    promise: 'Promise rejection',
    url: window.location.href,
  };
  
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(errorLog);
    localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50)));
  } catch {}
  
  console.error('Unhandled promise rejection:', errorLog);
};
```

**테스트**: 
```bash
# 강제 에러 발생 테스트
throw new Error('Test error');
Promise.reject('Test rejection');
```

---

### Task 1.3: DayMode 메시지 배열 제한 (30분)
**파일**: `src/features/checkin/useDayCheckinMachine.ts`
**현재 상태**: ❌ 배열 크기 제한 없음

**수정 위치**: `addMessage` 함수 찾기
```typescript
// 기존
const addMessage = (message: Message) => {
  setMessages(prev => [...prev, message]);
};

// 수정
const addMessage = (message: Message) => {
  setMessages(prev => [...prev, message].slice(-100)); // 최근 100개만 유지
};
```

**검증**:
```bash
rg "addMessage|setMessages" src/features/checkin/useDayCheckinMachine.ts
```

---

## Day 2: 입력 검증 및 저장소 폴백 (3시간)

### Task 2.1: 입력 길이 검증 10000자 (30분)
**파일**: 
- `src/components/chat/DayMode.tsx`
- `src/components/chat/NightMode.tsx`

**현재 상태**: ❌ maxLength 속성 없음

**수정**:
```typescript
// DayMode.tsx - input 태그에 추가
const MAX_INPUT_LENGTH = 10000;

<input
  type="text"
  maxLength={MAX_INPUT_LENGTH}
  value={input}
  onChange={(e) => machine.updateInput(e.target.value)}
  placeholder="지금 어떤 기분이세요?"
  className="..."
/>

// 길이 경고 (선택사항)
{input.length > 9000 && (
  <p className="text-xs text-orange-500">
    {MAX_INPUT_LENGTH - input.length}자 남음
  </p>
)}
```

```typescript
// NightMode.tsx - textarea 태그에 추가
<textarea
  maxLength={MAX_INPUT_LENGTH}
  value={machine.diary}
  onChange={(e) => machine.updateDiary(e.target.value)}
  placeholder="오늘 하루를 돌아보며..."
  className="..."
/>
```

---

### Task 2.2: OnboardingGuard sessionStorage 폴백 (1.5시간)
**파일**: `src/router/guards.tsx`
**현재 상태**: ❌ 폴백 없음, 무한 리다이렉트 위험

**수정**:
```typescript
export const useOnboardingStatus = (): boolean => {
  // 1차: localStorage 시도
  try {
    return localStorage.getItem('onboarding_completed') === 'true';
  } catch {
    // 2차: sessionStorage 폴백
    try {
      return sessionStorage.getItem('onboarding_completed') === 'true';
    } catch {
      // 3차: 무한 리다이렉트 방지 (3회 제한)
      try {
        const count = parseInt(sessionStorage.getItem('redirect_count') || '0');
        if (count >= 3) {
          console.warn('리다이렉트 3회 초과, 강제 통과');
          return true; // 3회 후 강제 통과
        }
        sessionStorage.setItem('redirect_count', String(count + 1));
      } catch {
        // 아무것도 못하면 기본값
      }
      return false;
    }
  }
};
```

**OnboardingLayout 수정**:
```typescript
// src/components/layout/OnboardingLayout.tsx
// handleOnboardingComplete 함수 내부

const handleOnboardingComplete = (data: OnboardingData) => {
  // localStorage 우선, 실패 시 sessionStorage
  try {
    localStorage.setItem('onboarding_completed', 'true');
  } catch {
    try {
      sessionStorage.setItem('onboarding_completed', 'true');
    } catch {
      console.error('저장소에 온보딩 완료 저장 실패');
    }
  }
  
  // 리다이렉트 카운터 초기화
  try {
    sessionStorage.removeItem('redirect_count');
  } catch {}
  
  // 기존 로직 계속
  setIsOnboardingCompleted(true);
};
```

**테스트**: 사생활 보호 모드에서 온보딩 진행 확인

---

### Task 2.3: Firebase Auth 재시도 실패 UI (1시간)
**파일**: 
- `src/contexts/UIContext.tsx`
- `src/components/layout/MainLayout.tsx`

**UIContext 수정**:
```typescript
// src/contexts/UIContext.tsx
import { useState, useEffect, createContext, useContext } from 'react';

interface UIContextType {
  isOnline: boolean;
  // ... 기존 필드
}

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('네트워크 연결됨');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('네트워크 끊김');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <UIContext.Provider value={{ isOnline, /* ... */ }}>
      {children}
    </UIContext.Provider>
  );
};
```

**MainLayout 수정**:
```typescript
// src/components/layout/MainLayout.tsx
import { useUIContext } from '../../contexts/UIContext';

export const MainLayout: React.FC = () => {
  const { isOnline } = useUIContext();
  
  return (
    <div className="relative w-full h-[100dvh]">
      {/* 오프라인 배너 */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-white text-center py-2 text-sm font-medium">
          ⚠️ 오프라인 모드 - 일부 기능이 제한됩니다
        </div>
      )}
      
      {/* 기존 레이아웃 */}
      {children}
    </div>
  );
};
```

---

## Day 3-4: 위기 감지 Gemini API 통합 (4시간)

### Task 3: 위기 감지 정확도 향상
**파일**: `src/services/crisisDetection.ts`
**현재 상태**: ❌ 키워드 기반만

**기존 함수 유지 + Gemini API 추가**:
```typescript
// src/services/crisisDetection.ts
import { generateChatbotResponse } from './functions';

/**
 * Gemini API를 사용한 정밀 위기 감지
 * 키워드 감지 이후 2차 검증용
 */
async function detectCrisisWithGemini(message: string): Promise<{
  isCrisis: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
}> {
  try {
    const prompt = `다음 메시지가 자해/자살 위험을 나타내는지 분석해주세요.

메시지: "${message}"

응답 형식 (JSON):
{
  "isCrisis": true/false,
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "reason": "판단 이유 (한 줄)"
}

기준:
- none: 위기 신호 없음
- low: 막연한 불안, 피로
- medium: 구체적 부정 감정, 희망 없음 표현
- high: 자해/자살 간접 암시
- critical: 자해/자살 직접적 의도 또는 계획

JSON만 반환:`;

    const response = await generateChatbotResponse({
      userMessage: prompt,
      history: [],
      persona: {
        name: '분석기',
        role: 'coach',
        mbti: 'INFJ',
        traits: { warmth: 50, directness: 50 }
      }
    });
    
    // JSON 파싱
    const result = JSON.parse(response);
    return result;
  } catch (error) {
    console.error('Gemini 위기 감지 실패:', error);
    // 파싱 실패 시 안전하게 false 반환
    return { isCrisis: false, severity: 'none' };
  }
}

/**
 * 통합 위기 감지 (키워드 + Gemini)
 */
export async function detectCrisis(
  message: string,
  intensity: number
): Promise<{
  level: 'none' | 'low' | 'medium' | 'high';
  shouldIntervene: boolean;
  reason: string;
}> {
  // 1단계: 키워드 기반 빠른 감지
  const keywordResult = detectCrisisKeywords(message);
  
  // 키워드 감지 시 Gemini로 2차 검증
  if (keywordResult.level !== 'none') {
    const geminiResult = await detectCrisisWithGemini(message);
    
    // Gemini가 critical 또는 high면 즉시 개입
    if (geminiResult.severity === 'critical' || geminiResult.severity === 'high') {
      return {
        level: 'high',
        shouldIntervene: true,
        reason: geminiResult.reason || '심각한 위기 신호 감지'
      };
    }
    
    // Gemini가 medium이고 강도도 높으면 개입
    if (geminiResult.severity === 'medium' && intensity >= 8) {
      return {
        level: 'medium',
        shouldIntervene: true,
        reason: geminiResult.reason || '위기 신호 + 높은 감정 강도'
      };
    }
    
    // 키워드 오탐지 (Gemini가 none 또는 low)
    if (geminiResult.severity === 'none' || geminiResult.severity === 'low') {
      return {
        level: 'low',
        shouldIntervene: false,
        reason: '위기 신호 미확인'
      };
    }
  }
  
  // 키워드 미감지 + 강도 9-10 → Gemini로 검증
  if (intensity >= 9) {
    const geminiResult = await detectCrisisWithGemini(message);
    
    if (geminiResult.severity === 'critical' || geminiResult.severity === 'high') {
      return {
        level: 'high',
        shouldIntervene: true,
        reason: geminiResult.reason || '간접적 위기 신호 감지'
      };
    }
  }
  
  // 기존 로직
  return keywordResult;
}
```

**주의사항**:
- Gemini API 호출 시간 증가 (2-3초)
- 타임아웃 처리 필수
- 오프라인 시 키워드 기반만 사용

---

## Day 5: DebugPanel 및 ErrorBoundary (2시간)

### Task 4.1: DebugPanel 페이지 생성
**신규 파일**: `src/pages/profile/DebugPanel.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from '../../components/ui';

interface ErrorLog {
  timestamp: string;
  message: string;
  source?: string;
  line?: number;
  column?: number;
  stack?: string;
  url?: string;
  userAgent?: string;
  type?: string;
}

export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  
  useEffect(() => {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      setLogs(storedLogs.reverse()); // 최신순
    } catch {
      setLogs([]);
    }
  }, []);
  
  const handleClearAll = () => {
    localStorage.removeItem('error_logs');
    setLogs([]);
  };
  
  const handleCopyLog = (log: ErrorLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    alert('클립보드에 복사되었습니다');
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">에러 로그 ({logs.length})</h1>
        <Button onClick={handleClearAll} variant="secondary">
          전체 지우기
        </Button>
      </div>
      
      {logs.length === 0 ? (
        <GlassCard className="p-8 text-center text-gray-500">
          에러 로그가 없습니다
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <GlassCard key={index} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-500">{log.timestamp}</p>
                <button
                  onClick={() => handleCopyLog(log)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  복사
                </button>
              </div>
              <p className="font-mono text-sm text-red-600 mb-2">{log.message}</p>
              {log.source && (
                <p className="text-xs text-gray-600">
                  {log.source}:{log.line}:{log.column}
                </p>
              )}
              {log.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    스택 추적 보기
                  </summary>
                  <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-x-auto">
                    {log.stack}
                  </pre>
                </details>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
```

**라우트 추가**: `src/router/routes.tsx`
```typescript
const DebugPanel = lazy(() => import('../pages/profile/DebugPanel').then(m => ({ default: m.DebugPanel })));

// Profile 라우트 그룹에 추가
<Route path="profile/debug" element={<LoadingWrapper><DebugPanel /></LoadingWrapper>} />
```

---

# Phase 2: 백엔드 Critical 수정 (2일)

## Day 6: 타임아웃 통일 (30분)

### Task 5: Functions 타임아웃 조정
**파일**: `functions/src/api/gemini.ts`
**현재 상태**: 
- generateDayModeResponse: 90초
- 기타 5개: 60초
- 2개: 30초 (이미 OK)

**수정**:
```typescript
// 라인 20
export const generateDayModeResponse = onCall({
  region: "asia-northeast3",
  timeoutSeconds: 30, // 90 → 30
  memory: "512MiB",
  maxInstances: 10,
}, async (request) => { /* 기존 */ });

// 라인 97
export const generateNightModeLetter = onCall({
  region: "asia-northeast3",
  timeoutSeconds: 30, // 60 → 30
  memory: "512MiB",
  maxInstances: 5,
}, async (request) => { /* 기존 */ });

// 라인 168
export const generateMonthlyNarrative = onCall({
  region: "asia-northeast3",
  timeoutSeconds: 30, // 60 → 30
  memory: "512MiB",
  maxInstances: 3,
}, async (request) => { /* 기존 */ });

// 라인 226
export const generateHealingContent = onCall({
  region: "asia-northeast3",
  timeoutSeconds: 30, // 60 → 30
  memory: "512MiB", // 1GiB는 유지 (Google Search 필요)
  maxInstances: 5,
}, async (request) => { /* 기존 */ });

// 라인 347
export const generateChatbotResponse = onCall({
  region: "asia-northeast3",
  timeoutSeconds: 30, // 60 → 30
  memory: "512MiB",
  maxInstances: 10,
}, async (request) => { /* 기존 */ });

// 라인 420, 529는 이미 30초이므로 유지
```

**빌드 & 배포**:
```bash
cd functions
npm run build
firebase deploy --only functions
```

---

# 검증 및 모니터링

## 프론트엔드 검증

```bash
# 1. 빌드 테스트
npm run build

# 2. Linter 확인
npm run lint

# 3. 타입 체크
npx tsc --noEmit

# 4. 로컬 테스트
npm run dev
```

**수동 테스트**:
1. 사생활 보호 모드에서 온보딩 (3회 리다이렉트 테스트)
2. 10000자 초과 입력 (막힘 확인)
3. 네트워크 끊기 (오프라인 배너 확인)
4. 강제 에러 발생 (window.onerror 로깅 확인)
5. `/profile/debug`에서 에러 로그 확인
6. 위기 키워드 입력 → Gemini 분석 확인

## 백엔드 검증

```bash
# 1. Functions 로그 모니터링
firebase functions:log --only generateDayModeResponse

# 2. 타임아웃 발생 확인
gcloud logging read "resource.type=cloud_function AND textPayload:timeout" --limit 50

# 3. 평균 응답 시간 확인 (30초 이내여야 함)
gcloud logging read \
  "resource.type=cloud_function AND jsonPayload.callDuration" \
  --format json --limit 1000 | \
  jq -r '.[] | .jsonPayload.callDuration' | \
  awk '{sum+=$1; count++} END {print "평균:", sum/count "ms"}'
```

---

# 완료 체크리스트

## Critical (P0) - 6개

- [ ] FE-C1: OnboardingGuard sessionStorage 폴백
- [ ] FE-C2: Firebase Auth 재시도 UI (오프라인 배너)
- [ ] FE-C3: window.onerror 핸들러
- [ ] FE-C4: 위기 감지 Gemini API 통합
- [ ] FE-H2: DayMode 메시지 배열 제한
- [ ] BE-C1: 백엔드 타임아웃 30초로 단축

## High (P1) - 추후 진행

- [ ] API 타임아웃 단계별 조정 (8s → 15s, 10s, 5s)
- [ ] Context 분리 (AppContext → ModeContext + UIContext)
- [ ] localStorage 동기화 불일치 해결
- [ ] searchConversations 외부 검색 서비스
- [ ] 백엔드 재시도 제거
- [ ] JSON 파싱 실패 처리

---

**예상 소요 시간**: 8.5시간
**권장 일정**: 2일 (프론트 1.5일 + 백엔드 0.5일)
**배포 순서**: 프론트엔드 먼저 → 검증 → 백엔드

**다음 단계**: High 위험요인 15개 해결 (별도 플랜)
