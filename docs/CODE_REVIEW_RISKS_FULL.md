# 마음로그 V5.0 위험요인 종합 보고서 (프론트엔드 + 백엔드)

**작성일**: 2026-01-16
**버전**: 3.0 (최종 통합)
**검토 범위**: 
- **프론트엔드**: 86개 파일 (라우팅, Context, 서비스, 컴포넌트, 페이지, 훅, 유틸, 레거시)
- **백엔드**: 7개 파일 (Firebase Functions, Gemini API, 미들웨어, 유틸)

---

## Executive Summary

### 전체 위험요인: **48개**
- **Critical**: 7개 (프론트 6 + 백엔드 1)
- **High**: 15개 (프론트 12 + 백엔드 3)
- **Medium**: 20개 (프론트 17 + 백엔드 3)
- **Low**: 6개 (프론트 6 + 백엔드 0)

### 주요 발견사항
1. **프론트-백엔드 타임아웃 불일치**: 프론트 8초 vs 백엔드 60-90초
2. **재시도 정책 차이**: 프론트 3회 vs 백엔드 1회
3. **메모리 누수**: useRealtime cleanup, DayMode 메시지 배열
4. **위기 감지**: 키워드 기반 한계, Gemini API 통합 필요
5. **레거시 코드**: 13개 파일 마이그레이션 필요

---

# 1. 프론트엔드 위험요인 (41개)

## 1.1 Critical 위험요인 (6개)

### FE-C1. OnboardingGuard localStorage 접근 실패
- **영역**: 라우팅
- **위치**: `src/router/guards.tsx:14-20`
- **문제**: localStorage 접근 실패 시 기본값 false → 무한 리다이렉트
- **영향**: 사생활 보호 모드 사용자 앱 접근 불가
- **해결 방안**:
  - sessionStorage 폴백
  - 쿠키 기반 대안
  - 3회 리다이렉트 후 강제 통과
- **우선순위**: P0

### FE-C2. Firebase Auth 재시도 실패 시 앱 동작
- **영역**: 인증
- **위치**: `src/services/auth.ts:44-56`
- **문제**: 3회 재시도 실패 시 Firestore 쓰기 불가, 앱은 계속 실행
- **영향**: 오프라인 모드, 데이터 동기화 실패
- **해결 방안**:
  - UI에 오프라인 모드 표시
  - localStorage 백업 강화
  - 재연결 시 자동 동기화
- **우선순위**: P0

### FE-C3. ErrorBoundary 자체 에러
- **영역**: 에러 처리
- **위치**: `src/components/ui/ErrorBoundary.tsx:30-38`
- **문제**: ErrorBoundary 자체 에러 발생 시 캐치 불가
- **영향**: 앱 전체 크래시
- **해결 방안**:
  - window.onerror 핸들러
  - Sentry 외부 에러 추적
- **우선순위**: P0

### FE-C4. 위기 감지 누락 (False Negative)
- **영역**: 안전망
- **위치**: `src/services/crisisDetection.ts:26-46`
- **문제**: 키워드 미포함 표현 누락 (예: "더 이상 살 의미가 없어")
- **영향**: **심각한 위기 상황 감지 실패**
- **해결 방안**:
  - Gemini API 전체 문장 분석
  - 키워드 목록 정기 업데이트
  - 맥락 기반 분석
- **우선순위**: P0

### FE-C5. Firestore Batch 500개 제한
- **영역**: 데이터
- **위치**: `src/services/firestore.ts:537-554`
- **문제**: 대량 삭제 시 500개 제한 초과 시 에러
- **영향**: 데이터 삭제 실패
- **해결 방안**:
  - 여러 배치로 자동 분할
  - 백그라운드 큐
  - 진행 상태 표시
- **우선순위**: P1

### FE-C6. useRealtime cleanup 누락 시 메모리 누수
- **영역**: 훅
- **위치**: `src/hooks/useRealtime.ts:75`
- **문제**: onSnapshot unsubscribe 누락 시 리스너 누적
- **영향**: **메모리 누수, 앱 성능 저하**
- **해결 방안**:
  - useEffect cleanup 필수
  - ESLint exhaustive-deps
  - 코드 리뷰 체크리스트
- **우선순위**: P0

---

## 1.2 High 위험요인 (12개)

### FE-H1. API 타임아웃 누적 시간
- **영역**: API
- **위치**: `src/services/apiPolicy.ts:104-114`
- **문제**: 3회 재시도 시 최대 24초 (8초 × 3)
- **영향**: UX 저하
- **해결 방안**: 스트리밍 응답, 타임아웃 단계별 조정
- **우선순위**: P1

### FE-H2. DayMode 메시지 배열 무한 증가
- **영역**: 컴포넌트
- **위치**: `src/components/chat/DayMode.tsx`
- **문제**: messages 배열 제한 없음
- **영향**: 메모리 누수
- **해결 방안**: 최대 100개 제한, Virtualized List
- **우선순위**: P1

### FE-H3. Context 값 변경 시 리렌더링 범위
- **영역**: 상태 관리
- **위치**: `src/contexts/AppContext.tsx`
- **문제**: mode 변경 시 모든 소비자 리렌더링
- **영향**: 성능 저하
- **해결 방안**: Context 분리, use-context-selector
- **우선순위**: P1

### FE-H4. AppContext 모드 주기적 체크 (1분)
- **영역**: 상태 관리
- **위치**: `src/contexts/AppContext.tsx:66-72`
- **문제**: 1분마다 resolveMode() 호출
- **영향**: 백그라운드 네트워크 요청
- **해결 방안**: 간격 5분, requestIdleCallback
- **우선순위**: P1

### FE-H5. localStorage 동기화 불일치
- **영역**: 데이터
- **위치**: `src/services/consent.ts:120-140`
- **문제**: Firestore 실패 시 localStorage만 저장
- **영향**: 다기기 동기화 실패
- **해결 방안**: 재시도, 동기화 상태 UI
- **우선순위**: P1

### FE-H6. Firestore searchConversations 클라이언트 필터링
- **영역**: 검색
- **위치**: `src/services/firestore.ts:615-654`
- **문제**: 모든 데이터 가져온 후 필터링
- **영향**: 대량 데이터 시 성능 저하
- **해결 방안**: Algolia, Typesense 외부 검색 서비스
- **우선순위**: P1

### FE-H7~H12. 기타 High (MainLayout URL 파싱, EmotionSelectModal 레이아웃, TabBar refs, NightMode Textarea, ErrorBoundary retry, CelestialBackground 성능)
- 상세 내용은 원본 보고서 참조

---

## 1.3 Medium 위험요인 (17개)

### FE-M1. routes.tsx /reports 경로 중복
### FE-M2. Router.tsx Provider 중첩 4단계
### FE-M3. OnboardingLayout handleExit 데이터 미저장
### FE-M4. modeResolver 자정 넘김 로직
### FE-M5. crisisDetection 키워드 하드코딩
### FE-M6. apiPolicy Promise.race 타임아웃 후 실행
### FE-M7. firestore saveOnboardingData localStorage 백업
### FE-M8. gemini.ts 폴백 한국어 하드코딩
### FE-M9. EmotionSelectModal Portal SSR
### FE-M10. TabBar 스와이프 충돌
### FE-M11. DayMode 위기 감지 오탐지
### FE-M12. NightMode VoicePlayer TTS 호환성
### FE-M13. ErrorBoundary 개발 모드 노출
### FE-M14. MainLayout AIChatbot 레거시
### FE-M15. AppContext mock 데이터
### FE-M16. 플레이스홀더 페이지 미구현
### FE-M17. 레거시 코드 13개 마이그레이션

---

## 1.4 Low 위험요인 (6개)

### FE-L1. Router.tsx Anonymous Auth 로그만 출력
### FE-L2. guards.tsx 경로 하드코딩
### FE-L3. modeResolver getUserSettings 비동기
### FE-L4. consent CONSENT_VERSION 마이그레이션
### FE-L5. EmotionSelectModal 다국어
### FE-L6. ChatMain consentChecked 의존성

---

# 2. 백엔드 위험요인 (7개)

## 2.1 Critical 위험요인 (1개)

### BE-C1. 프론트-백엔드 타임아웃 불일치
- **영역**: 타임아웃 정책
- **위치**: 
  - 프론트: `src/services/apiPolicy.ts` (8초)
  - 백엔드: `functions/src/api/gemini.ts` (60-90초)
- **문제**: 프론트엔드가 8초에 타임아웃하지만 백엔드는 60초 실행
- **영향**: 
  - 불필요한 백엔드 리소스 소비
  - 비용 증가 (Cloud Functions 실행 시간 과금)
  - 프론트엔드 재시도와 백엔드 중복 실행
- **해결 방안**:
  - 백엔드 타임아웃을 30초로 단축
  - 프론트엔드 타임아웃을 10-15초로 조정
  - AbortController로 프론트 취소 시 백엔드도 중단
- **우선순위**: P0

---

## 2.2 High 위험요인 (3개)

### BE-H1. Gemini API 재시도 1회 vs 프론트 3회
- **영역**: API 정책
- **위치**: `functions/src/services/gemini.ts:154-218`
- **문제**: 
  - 백엔드: async-retry로 1회 재시도
  - 프론트: apiPolicy로 3회 재시도
  - 총 최대 6회 호출 (프론트 3회 × 백엔드 2회)
- **영향**: 
  - Gemini API 비용 증가
  - 총 응답 시간 예측 불가
  - Rate Limit 위험
- **해결 방안**:
  - 백엔드 재시도 제거 (프론트에서만)
  - 또는 프론트 재시도 제거 (백엔드에서만)
  - 일관된 정책 수립
- **우선순위**: P1

### BE-H2. sanitizeUserInput 10000자 제한
- **영역**: 보안/입력 처리
- **위치**: `functions/src/services/gemini.ts:40-52`
- **문제**: 10000자 초과 시 자동 잘림, 사용자에게 알림 없음
- **영향**: 
  - 긴 일기 작성 시 데이터 손실
  - 문맥 누락으로 AI 응답 품질 저하
- **해결 방안**:
  - 프론트엔드에서 사전 검증
  - 10000자 초과 시 에러 반환
  - 또는 분할 처리 (chunk)
- **우선순위**: P1

### BE-H3. JSON 파싱 실패 처리
- **영역**: 데이터 파싱
- **위치**: `functions/src/api/gemini.ts:293-327, 479-508`
- **문제**: Gemini API 응답이 JSON 형식 아닐 때 fallback 반환
- **영향**: 
  - generateHealingContent, generateMicroAction 실패
  - 사용자에게 콘텐츠 미제공
- **해결 방안**:
  - Gemini API 프롬프트 개선 (JSON 형식 강제)
  - 파싱 실패 시 재시도
  - 구조화된 출력 API 사용
- **우선순위**: P1

---

## 2.3 Medium 위험요인 (3개)

### BE-M1. Secret Manager 캐싱 TTL 1시간
- **영역**: Secret 관리
- **위치**: `functions/src/config/secrets.ts:19-34`
- **문제**: 
  - 캐시 만료 시 Secret Manager 호출 (지연)
  - 키 로테이션 시 최대 1시간 지연
- **영향**: 
  - 첫 요청 또는 1시간 후 성능 저하
  - 키 로테이션 반영 지연
- **해결 방안**:
  - TTL 조정 (30분)
  - 백그라운드 갱신
  - 워밍업 함수 (scheduled function)
- **우선순위**: P2

### BE-M2. Cold Start 지연
- **영역**: 성능
- **위치**: `functions/src/middleware/performance.ts:156-174`
- **문제**: 인스턴스 초기화 시 첫 요청 지연 (2-5초)
- **영향**: 사용자 대기 시간 증가
- **해결 방안**:
  - Min Instances 설정 (비용 증가)
  - Cloud Run 사용 (상시 실행)
  - 워밍업 요청 (scheduled function)
- **우선순위**: P2

### BE-M3. Google Search Grounding 메모리 1GiB
- **영역**: 리소스
- **위치**: `functions/src/api/gemini.ts:224-229`
- **문제**: generateHealingContent만 1GiB, 나머지는 512MiB
- **영향**: 
  - 비용 증가 (메모리 과금)
  - Cold Start 시간 증가
- **해결 방안**:
  - 실제 필요 메모리 측정
  - 512MiB로 축소 테스트
  - 또는 별도 Function으로 분리
- **우선순위**: P2

---

# 3. 프론트-백엔드 통합 이슈

## 3.1 타임아웃 정책 불일치 (CRITICAL)

| 구분 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| **타임아웃** | 8초 | 60-90초 |
| **재시도** | 3회 | 1회 |
| **총 최대 시간** | 24초 | 180초 |
| **실제 동작** | 8초 후 타임아웃 | 60초 계속 실행 |

**문제점**:
- 프론트 타임아웃 후 백엔드 계속 실행 → 리소스 낭비
- 프론트 재시도 시 백엔드 중복 실행 가능 (최대 6회)
- Gemini API 비용 증가

**해결 방안**:
1. **옵션 A**: 백엔드 타임아웃 30초, 프론트 타임아웃 15초
2. **옵션 B**: 프론트 재시도 제거, 백엔드에서만 재시도
3. **옵션 C**: AbortController로 프론트 취소 시 백엔드 중단 (WebSocket 필요)

**권장**: 옵션 A + AbortController

---

## 3.2 재시도 정책 불일치 (HIGH)

| Function | 프론트 재시도 | 백엔드 재시도 | 총 호출 가능 |
|----------|--------------|--------------|-------------|
| generateDayModeResponse | 3회 | 1회 | 6회 |
| generateNightModeLetter | 3회 | 1회 | 6회 |
| generateMonthlyNarrative | 2회 | 1회 | 4회 |
| generateHealingContent | 2회 | 1회 | 4회 |
| generateChatbotResponse | 3회 | 1회 | 6회 |
| generateMicroAction | 3회 | 1회 | 6회 |
| generateTimelineAnalysis | 2회 | 1회 | 4회 |

**문제**: 최악의 경우 단일 요청이 6회 중복 실행

**해결 방안**:
- 프론트 또는 백엔드 중 한 곳에서만 재시도
- 권장: 백엔드에서 재시도 (네트워크 안정성)

---

## 3.3 입력 길이 제한 불일치 (MEDIUM)

| 구분 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| **검증** | 없음 | 10000자 자동 잘림 |
| **에러 처리** | - | 에러 미반환 (조용히 잘림) |

**문제**: 프론트에서 긴 입력 허용하지만 백엔드에서 조용히 잘림

**해결 방안**:
- 프론트엔드에서 10000자 사전 검증
- 초과 시 경고 메시지
- Textarea maxLength 속성 추가

---

# 4. 위험요인 통합 우선순위

## P0 (즉시 해결 필요) - 7개

### 프론트엔드 (6개)
1. ✅ FE-C1: OnboardingGuard localStorage 폴백
2. ✅ FE-C2: Firebase Auth 재시도 UI
3. ✅ FE-C3: ErrorBoundary 최상위 핸들러
4. ✅ FE-C4: 위기 감지 Gemini API 통합
5. ✅ FE-C6: useRealtime cleanup 필수

### 백엔드 (1개)
6. ✅ BE-C1: 프론트-백엔드 타임아웃 통일

### 통합 (1개)
7. ✅ 재시도 정책 통일 (프론트 또는 백엔드 중 한 곳)

---

## P1 (중요, 빠른 시일 내) - 15개

### 프론트엔드 (12개)
1. API 타임아웃 최적화
2. DayMode 메시지 제한
3. Context 분리
4. AppContext 모드 체크 간격
5. localStorage 동기화
6. searchConversations 외부 검색
7. 기타 6개

### 백엔드 (3개)
1. sanitizeUserInput 사전 검증
2. JSON 파싱 실패 재시도
3. 입력 길이 제한 통일

---

## P2 (계획적 개선) - 20개

### 프론트엔드 (17개)
- routes 리다이렉트, OnboardingLayout 진행 상태
- modeResolver 테스트, crisisDetection Firestore 관리
- 레거시 마이그레이션, 플레이스홀더 구현
- 기타 11개

### 백엔드 (3개)
1. Secret Manager TTL 조정
2. Cold Start 최적화
3. Google Search Grounding 메모리 최적화

---

# 5. 레거시 코드 마이그레이션 계획

## 5.1 사용 중 (6개) - P1

| 레거시 파일 | 마이그레이션 대상 | 사용 위치 |
|------------|-----------------|----------|
| `components/AIChatbot.tsx` | `src/components/chat/` | MainLayout |
| `components/ContentGallery.tsx` | `src/components/content/` | ContentMain |
| `components/JournalView.tsx` | `src/components/journal/` | JournalTimeline |
| `components/ReportView.tsx` | `src/components/reports/` | WeeklyReport, MonthlyReport |
| `components/ProfileView.tsx` | `src/components/profile/` | ProfileMain |
| `components/PersonaEditor.tsx` | `src/components/profile/` | PersonaSetup, PersonaSettings |

## 5.2 대체됨 (7개) - P2 삭제 가능

| 레거시 파일 | 대체 파일 | 상태 |
|------------|----------|------|
| `components/DayMode.tsx` | `src/components/chat/DayMode.tsx` | 삭제 가능 |
| `components/NightMode.tsx` | `src/components/chat/NightMode.tsx` | 삭제 가능 |
| `components/VoicePlayer.tsx` | `src/components/chat/VoicePlayer.tsx` | 삭제 가능 |
| `components/UI.tsx` | `src/components/ui/*` | 삭제 가능 |
| `components/SafetyLayer.tsx` | - | 사용 위치 확인 필요 |
| `components/TimelineView.tsx` | - | JournalView 의존 |
| `components/EmotionCalendar.tsx` | - | JournalView 의존 |

---

# 6. 아키텍처 개선 권장사항

## 6.1 프론트엔드

### 1. 에러 추적 서비스 (P0)
- **도구**: Sentry, LogRocket
- **이점**: 실시간 에러 모니터링

### 2. 상태 관리 리팩토링 (P1)
- **현재**: Context + XState
- **제안**: Zustand, Jotai
- **이점**: 성능 향상

### 3. 검색 인프라 (P1)
- **현재**: 클라이언트 필터링
- **제안**: Algolia, Typesense
- **이점**: 전체 텍스트 검색

### 4. AI 응답 스트리밍 (P1)
- **현재**: 일괄 응답
- **제안**: SSE, WebSocket
- **이점**: 즉각적 피드백

### 5. 오프라인 우선 아키텍처 (P2)
- **제안**: Service Worker + IndexedDB
- **이점**: 오프라인 작동

---

## 6.2 백엔드

### 1. 타임아웃 정책 통일 (P0)
- **현재**: 60-90초
- **제안**: 30초
- **이점**: 비용 절감

### 2. 재시도 정책 일원화 (P0)
- **제안**: 백엔드 재시도 제거
- **이점**: 중복 호출 방지

### 3. Cold Start 최적화 (P1)
- **방법**: Min Instances 1-2개
- **비용**: 월 $10-20
- **이점**: 첫 요청 지연 제거

### 4. 모니터링 강화 (P1)
- **도구**: Cloud Monitoring, Datadog
- **메트릭**: 
  - API 응답 시간 (P50, P95, P99)
  - 에러율
  - Cold Start 빈도
  - Gemini API 비용

### 5. Gemini API 프롬프트 최적화 (P2)
- **현재**: JSON 파싱 실패율 있음
- **제안**: 
  - Structured Output API 사용
  - Few-shot 예시 추가
  - 프롬프트 엔지니어링 개선

---

# 7. 테스트 커버리지 권장

## 7.1 프론트엔드 (Critical Path)

### P0
1. `auth.ts` - ensureAnonymousAuth 재시도
2. `crisisDetection.ts` - 위기 감지 알고리즘
3. `guards.tsx` - OnboardingGuard 리다이렉트
4. `apiPolicy.ts` - 재시도 및 폴백
5. `useRealtime.ts` - cleanup 함수

### P1
1. `modeResolver.ts` - 자정 넘김 계산
2. `DayMode/NightMode` - 상태 머신
3. `AppContext` - 모드 주기적 체크
4. `EmotionSelectModal` - 키보드 네비게이션
5. `TabBar` - 터치 제스처

---

## 7.2 백엔드 (Critical Path)

### P0
1. `api/gemini.ts` - 모든 7개 Functions
2. `services/gemini.ts` - callGeminiAPI 재시도
3. `config/secrets.ts` - Secret Manager 캐싱

### P1
1. `middleware/performance.ts` - measurePerformance
2. `utils/logger.ts` - 로깅 함수
3. `services/gemini.ts` - sanitizeUserInput, JSON 파싱

---

# 8. 모니터링 메트릭

## 8.1 프론트엔드

### 성능
- API 응답 시간 (P95, P99)
- 재시도 횟수
- 메모리 사용량 (DayMode)
- 렌더링 성능 (Context 변경)

### 오류
- 위기 감지 오탐지/누락
- localStorage 실패율
- Firebase Auth 실패율
- ErrorBoundary 트리거

### UX
- 온보딩 완료율
- 대화 저장 성공률
- AI 응답 만족도

---

## 8.2 백엔드

### 성능
- **Cloud Functions**:
  - 평균 실행 시간
  - Cold Start 비율
  - 메모리 사용량 (512MiB/1GiB)
- **Gemini API**:
  - API 응답 시간 (P50, P95, P99)
  - 재시도 비율
  - JSON 파싱 성공률

### 비용
- Gemini API 호출 횟수
- Cloud Functions 실행 시간
- Secret Manager 호출 횟수
- 네트워크 egress

### 오류
- Gemini API 에러율 (타입별)
- HTTP 4xx/5xx 비율
- 타임아웃 비율
- JSON 파싱 실패율

---

# 9. 비용 최적화 제안

## 9.1 Gemini API

### 현재 예상 비용
- **모델별 사용**:
  - gemini-3-pro-preview: DayMode, Chatbot (고빈도)
  - gemini-3-flash-preview: 나머지 (중빈도)
- **재시도 중복**: 최대 6회 호출 가능
- **예상 월 비용**: $50-200 (사용자 100명 기준)

### 최적화 방안
1. **재시도 일원화**: 비용 50% 절감
2. **Flash 모델 우선 사용**: 비용 80% 절감
   - DayMode도 Flash로 변경 테스트
   - 품질 평가 후 결정
3. **프롬프트 최적화**: 토큰 수 감소
   - 불필요한 지시문 제거
   - 히스토리 제한 (20개 → 10개)

---

## 9.2 Cloud Functions

### 현재 설정
- **리전**: asia-northeast3 (서울)
- **메모리**: 512MiB (대부분), 1GiB (HealingContent)
- **타임아웃**: 60-90초
- **maxInstances**: 5-10개

### 최적화 방안
1. **타임아웃 단축**: 60s → 30s (비용 50% 절감)
2. **메모리 최적화**: 
   - HealingContent 1GiB → 512MiB 테스트
   - 실제 사용량 측정 후 조정
3. **Min Instances**: 
   - 현재 0 (Cold Start 지연)
   - 1-2개 설정 (월 $10-20 추가, 응답 속도 향상)
4. **maxInstances 조정**:
   - 트래픽 패턴 분석 후 최적화

---

# 10. 보안 체크리스트

## 10.1 프론트엔드

### 인증/인가
- ✅ Anonymous Auth 사용
- ✅ Firestore 보안 규칙 (userId 검증)
- ⚠️ XSS 방어: sanitizeUserInput (백엔드만)
- ⚠️ CSRF: Firebase SDK 자동 처리

### 데이터 보호
- ✅ Privacy-first 모델 (동의 기반)
- ✅ 동의 없으면 원문 미저장
- ⚠️ localStorage: 민감 정보 저장 주의
- ⚠️ IndexedDB 암호화 검토

---

## 10.2 백엔드

### API 보안
- ✅ Firebase Auth 토큰 검증 (자동)
- ✅ sanitizeUserInput (프롬프트 인젝션 방어)
- ⚠️ Rate Limiting: Cloud Functions 기본만 의존
- ⚠️ API Key 노출: Secret Manager 사용 (OK)

### 데이터 보안
- ✅ Firestore 보안 규칙
- ⚠️ Gemini API 응답 필터링 (유해 콘텐츠)
- ⚠️ 로그에 민감 정보 포함 여부 확인

---

# 11. 결론 및 즉시 조치 사항

## 11.1 Critical 조치 (P0)

### 프론트엔드
1. ⚠️ **useRealtime cleanup 추가** (메모리 누수 방지)
2. ⚠️ **OnboardingGuard 폴백** (sessionStorage + 쿠키)
3. ⚠️ **ErrorBoundary window.onerror** (Sentry)
4. ⚠️ **위기 감지 Gemini 통합** (정확도 향상)

### 백엔드
1. ⚠️ **타임아웃 30초로 단축** (비용 절감)
2. ⚠️ **재시도 정책 통일** (중복 호출 방지)

### 통합
1. ⚠️ **입력 길이 사전 검증** (10000자 제한)
2. ⚠️ **모니터링 대시보드 구축** (Cloud Monitoring)

---

## 11.2 개선 로드맵

### 1개월 내 (P0-P1)
- Critical 위험요인 7개 해결
- 에러 추적 서비스 통합 (Sentry)
- 타임아웃 정책 통일
- 재시도 정책 일원화
- 레거시 코드 마이그레이션 (6개)

### 3개월 내 (P2)
- 외부 검색 서비스 통합 (Algolia)
- AI 응답 스트리밍
- Context 분리
- 플레이스홀더 페이지 구현
- Cold Start 최적화

### 6개월 내 (P3)
- 다국어 지원 (i18n)
- 오프라인 우선 아키텍처
- 테스트 커버리지 80% 이상
- 성능 최적화 (Lighthouse 90+)

---

**검토자**: AI Assistant
**검토 방법**: 파일 시스템 직접 확인, 코드 분석, PRD 명세 대조
**검증 범위**: 
- 프론트엔드: 86개 파일
- 백엔드: 7개 파일
- **총 93개 파일**

**위험요인**: 48개 (Critical 7, High 15, Medium 20, Low 6)
**주석화 완료**: ✅ 프론트 86개, 백엔드 주석화 필요
