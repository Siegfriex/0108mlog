# Backend Logging, Monitoring & API Documentation 작업 보고서

**작업 일자**: 2026-01-13
**작업자**: Claude Code (claude-opus-4-5-20251101)
**프로젝트**: INEESm Firebase Functions

---

## 1. 작업 개요

Firebase Cloud Functions 백엔드에 구조화된 로깅, 성능 모니터링, API 문서화 시스템을 구축했습니다.

### 1.1 작업 목표
- Cloud Logging과 호환되는 구조화된 JSON 로깅 시스템 구축
- 함수 실행 시간, Cold Start, 메모리 사용량 모니터링
- OpenAPI 3.0 스펙 및 API 문서 생성

### 1.2 영향받는 함수 (7개)
| 함수명 | 용도 | 모델 |
|--------|------|------|
| `generateDayModeResponse` | Day Mode 채팅 | gemini-3-pro |
| `generateNightModeLetter` | Night Mode 편지 | gemini-3-pro |
| `generateMonthlyNarrative` | 월간 회고록 | gemini-3-flash |
| `generateHealingContent` | 큐레이션 콘텐츠 | gemini-3-flash + Grounding |
| `generateChatbotResponse` | AI 챗봇 | gemini-3-pro |
| `generateMicroAction` | 마이크로 액션 | gemini-3-flash |
| `generateTimelineAnalysis` | 타임라인 분석 | gemini-3-flash |

---

## 2. 생성된 파일

### 2.1 `functions/src/utils/logger.ts` (신규)

**목적**: Cloud Logging 호환 구조화된 로깅 유틸리티

**주요 기능**:
```typescript
// 로그 컨텍스트 인터페이스
export interface LogContext {
  requestId?: string;
  userId?: string;
  functionName: string;
  [key: string]: unknown;
}

// 제공 함수
logDebug(context, message, data?)    // DEBUG 레벨
logInfo(context, message, data?)     // INFO 레벨
logWarn(context, message, data?)     // WARN 레벨
logError(context, error, data?)      // ERROR 레벨 (스택트레이스 포함)
logPerformance(context, operation, durationMs, metadata?)  // 성능 측정
logRequestStart(context, inputSummary?)   // 요청 시작
logRequestEnd(context, success, durationMs)  // 요청 완료
generateRequestId()  // UUID v4 요청 ID 생성
```

**로그 출력 형식**:
```json
{
  "severity": "INFO",
  "message": "Request started: generateDayModeResponse",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "functionName": "generateDayModeResponse",
  "timestamp": "2026-01-13T10:30:00.000Z",
  "data": { "event": "REQUEST_START" }
}
```

---

### 2.2 `functions/src/middleware/performance.ts` (신규)

**목적**: Callable Functions 성능 측정 래퍼

**주요 기능**:
```typescript
// 성능 측정 옵션
interface PerformanceOptions {
  logMemory?: boolean;      // 메모리 로깅 (기본: true)
  memoryThreshold?: number; // 메모리 경고 임계치 MB (기본: 400)
}

// 성능 측정 래퍼
async function measurePerformance<T>(
  functionName: string,
  request: CallableRequest,
  operation: () => Promise<T>,
  options?: PerformanceOptions
): Promise<T>

// Cold Start 감지
function checkColdStart(context: LogContext): boolean
```

**Cold Start 감지 원리**:
- 모듈 레벨 `isFirstInvocation` 플래그 사용
- 첫 번째 호출 시 `true` 반환 후 플래그 변경
- 이후 호출은 모두 `false` 반환 (Warm 상태)

---

### 2.3 `functions/src/utils/monitoring.ts` (신규)

**목적**: 메모리 사용량 및 환경 정보 모니터링

**주요 기능**:
```typescript
// 메모리 사용량 조회 (MB 단위)
interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers?: number;
}

getMemoryUsage(): MemoryUsage | null
logMemoryUsage(context, phase)  // phase: 'start' | 'end' | 'checkpoint'
isMemoryThresholdExceeded(thresholdMB): boolean
checkMemoryWarning(context, thresholdMB?)  // 기본 400MB

// 환경 정보
getEnvironmentInfo(): { nodeVersion, platform, arch, uptime, pid }
logEnvironmentInfo(context)  // 인스턴스당 한 번만 로깅
```

---

### 2.4 `functions/docs/openapi.yaml` (신규)

**목적**: OpenAPI 3.0 스펙 문서

**포함 내용**:
- 7개 API 엔드포인트 정의
- 요청/응답 스키마
- 공통 컴포넌트 (CoachPersona, ChatMessage, TimelineEntry 등)
- 에러 응답 정의

**스펙 요약**:
```yaml
openapi: 3.0.3
info:
  title: INEESm Firebase Functions API
  version: 1.0.0
servers:
  - url: https://asia-northeast3-iness-mlog.cloudfunctions.net
paths:
  /generateDayModeResponse: ...
  /generateNightModeLetter: ...
  /generateMonthlyNarrative: ...
  /generateHealingContent: ...
  /generateChatbotResponse: ...
  /generateMicroAction: ...
  /generateTimelineAnalysis: ...
```

---

### 2.5 `functions/docs/API.md` (신규)

**목적**: 개발자용 API 사용 가이드

**포함 내용**:
- API 개요 및 기본 정보
- 각 함수별 요청/응답 인터페이스
- 사용 예시 코드 (TypeScript)
- 에러 코드 표
- 성능 특성 (Cold Start, 응답 시간, Rate Limit)
- 로깅 및 모니터링 정보

---

## 3. 수정된 파일

### 3.1 `functions/src/config/secrets.ts`

**변경 내용**: `console.error/warn` 제거, 구조화된 로거 적용

**Before**:
```typescript
console.error("GEMINI_API_KEY is not configured");
console.warn("Using fallback API key from environment");
```

**After**:
```typescript
import {logInfo, logError, logWarn, logPerformance, LogContext} from "../utils/logger";

const secretContext: LogContext = {
  functionName: "SecretManager",
};

logError(secretContext, new Error("GEMINI_API_KEY is not configured"));
logWarn(secretContext, "Using fallback API key from environment");
logPerformance(secretContext, "secret_access", duration, { source: "SecretManager" });
```

---

### 3.2 `functions/src/services/gemini.ts`

**변경 내용**: Gemini API 호출 성능 측정 추가

**추가된 로깅**:
```typescript
import {logInfo, logError, logPerformance, LogContext} from "../utils/logger";

const geminiServiceContext: LogContext = {
  functionName: "GeminiService",
};

// 클라이언트 초기화 성능 측정
logPerformance(geminiServiceContext, "gemini_client_init", initDuration);

// API 호출 성능 측정
logPerformance(geminiServiceContext, "gemini_api_call", callDuration, {
  model,
  promptLength: prompt.length,
  responseLength: response.text?.length || 0,
});
```

---

### 3.3 `functions/src/api/gemini.ts`

**변경 내용**: 7개 함수 모두 성능 측정 래퍼 적용

**패턴 (모든 함수에 동일 적용)**:
```typescript
import {measurePerformance, checkColdStart} from "../middleware/performance";
import {logError, logInfo, generateRequestId} from "../utils/logger";
import {logMemoryUsage, logEnvironmentInfo} from "../utils/monitoring";

export const generateDayModeResponse = onCall(
  { region: "asia-northeast3", timeoutSeconds: 90, memory: "512MiB", maxInstances: 10 },
  async (request) => {
    return await measurePerformance("generateDayModeResponse", request, async () => {
      // 1. 요청 ID 및 컨텍스트 생성
      const requestId = generateRequestId();
      const context = {
        requestId,
        userId: request.auth?.uid || "anonymous",
        functionName: "generateDayModeResponse",
      };

      // 2. Cold Start 및 환경 정보 로깅 (인스턴스당 최초 1회)
      checkColdStart(context);
      logEnvironmentInfo(context);

      // 3. 시작 시 메모리 로깅
      logMemoryUsage(context, "start");

      try {
        // ... 기존 비즈니스 로직 ...

        logInfo(context, "Response generated successfully");
        return { success: true, data: response };
      } catch (error) {
        logError(context, error);
        return { success: false, error: "...", fallback: "..." };
      }
    });
  }
);
```

**적용된 함수 목록**:
1. `generateDayModeResponse`
2. `generateNightModeLetter`
3. `generateMonthlyNarrative`
4. `generateHealingContent`
5. `generateChatbotResponse`
6. `generateMicroAction`
7. `generateTimelineAnalysis`

---

## 4. 코드 품질 검증

### 4.1 린트 검증

**초기 에러**: 11개
**수정 후**: 0개

**주요 수정 사항**:
1. `gemini.ts:51` - 라인 길이 초과 (103자 > 100자 제한)
   ```typescript
   // Before
   const sanitizedHistory = (history || []).slice(-20).map((h: string) => sanitizeUserInput(h));

   // After
   const sanitizedHistory = (history || []).slice(-20).map(
     (h: string) => sanitizeUserInput(h)
   );
   ```

2. `monitoring.ts:153` - JSDoc 주석 누락
   ```typescript
   // Before
   /**
    * 환경 정보 로깅 (인스턴스 시작 시 한 번만)
    */
   let environmentLogged = false;

   export function logEnvironmentInfo(...) { ... }

   // After
   /** 환경 정보 로깅 여부 (인스턴스당 한 번만) */
   let environmentLogged = false;

   /**
    * 환경 정보 로깅 (인스턴스 시작 시 한 번만)
    */
   export function logEnvironmentInfo(...) { ... }
   ```

### 4.2 빌드 검증

```bash
npm run build --prefix "C:/INEESm/functions"
# 결과: 성공 (에러 없음)
```

---

## 5. Cloud Logging 활용 가이드

### 5.1 로그 조회 명령어

```bash
# 특정 함수 로그 조회
gcloud logging read "resource.type=cloud_function AND resource.labels.function_name=generateDayModeResponse" \
  --project=iness-mlog \
  --limit=50

# 요청 ID로 추적
gcloud logging read "jsonPayload.requestId=550e8400-e29b-41d4-a716-446655440000" \
  --project=iness-mlog

# 에러만 조회
gcloud logging read "severity=ERROR AND resource.type=cloud_function" \
  --project=iness-mlog \
  --limit=20

# 성능 메트릭 조회
gcloud logging read "jsonPayload.type=PERFORMANCE" \
  --project=iness-mlog \
  --limit=100

# Cold Start 조회
gcloud logging read "jsonPayload.coldStart=true" \
  --project=iness-mlog

# 메모리 경고 조회
gcloud logging read "jsonPayload.type=MEMORY_WARNING" \
  --project=iness-mlog
```

### 5.2 로그 기반 메트릭 생성 (권장)

Cloud Console에서 다음 메트릭을 생성하면 대시보드에서 시각화 가능:

1. **함수별 평균 응답 시간**
   - 필터: `jsonPayload.type="PERFORMANCE"`
   - 필드: `jsonPayload.durationMs`

2. **Cold Start 비율**
   - 필터: `jsonPayload.coldStart=true`

3. **메모리 사용량 추이**
   - 필터: `jsonPayload.type="MEMORY"`
   - 필드: `jsonPayload.heapUsedMB`

---

## 6. 파일 구조

```
functions/
├── src/
│   ├── api/
│   │   └── gemini.ts          # [수정] 7개 함수 모니터링 적용
│   ├── config/
│   │   └── secrets.ts         # [수정] 구조화된 로깅 적용
│   ├── middleware/
│   │   └── performance.ts     # [신규] 성능 측정 미들웨어
│   ├── services/
│   │   └── gemini.ts          # [수정] API 호출 성능 측정
│   └── utils/
│       ├── logger.ts          # [신규] 구조화된 로깅 유틸리티
│       └── monitoring.ts      # [신규] 메모리/환경 모니터링
├── docs/
│   ├── API.md                 # [신규] API 사용 가이드
│   ├── openapi.yaml           # [신규] OpenAPI 3.0 스펙
│   └── WORK_REPORT.md         # [신규] 본 보고서
└── package.json
```

---

## 7. 배포 방법

```bash
# 전체 함수 배포
firebase deploy --only functions --project iness-mlog

# 특정 함수만 배포
firebase deploy --only functions:generateDayModeResponse --project iness-mlog
```

---

## 8. 향후 권장 작업

1. **Cloud Monitoring 대시보드 구성**
   - 함수별 호출 수, 응답 시간, 에러율 시각화

2. **알림 정책 설정**
   - 에러율 임계치 초과 시 알림
   - 메모리 경고 발생 시 알림

3. **로그 기반 메트릭 생성**
   - 위 5.2 섹션 참조

4. **정기적인 성능 리뷰**
   - Cold Start 빈도 분석
   - 함수별 평균 응답 시간 추이

---

## 9. 변경 사항 요약

| 구분 | 파일 | 변경 유형 | 라인 수 |
|------|------|----------|---------|
| 로깅 | `utils/logger.ts` | 신규 | 235 |
| 성능 | `middleware/performance.ts` | 신규 | ~80 |
| 모니터링 | `utils/monitoring.ts` | 신규 | 167 |
| 시크릿 | `config/secrets.ts` | 수정 | ~20 |
| 서비스 | `services/gemini.ts` | 수정 | ~30 |
| API | `api/gemini.ts` | 수정 | ~200 |
| 문서 | `docs/openapi.yaml` | 신규 | 512 |
| 문서 | `docs/API.md` | 신규 | 277 |

**총 신규 코드**: 약 1,200줄
**총 수정 코드**: 약 250줄

---

*보고서 작성: Claude Code*
*최종 업데이트: 2026-01-13*
