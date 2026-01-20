# 마음로그 V5.0 주석화 과정 중 발견된 위험요인 보고서

**작성일**: 2026-01-16
**버전**: 2.0 (최종)
**검토 범위**: Phase 1-7 전체 (30개 파일 + 레거시 13개 파일)

## Executive Summary

주석화 과정에서 총 **41개의 위험요인**을 식별했습니다:
- **Critical**: 6개 (+1)
- **High**: 12개
- **Medium**: 17개 (+2)
- **Low**: 6개 (+1)

주요 발견사항:
1. **네트워크 오류 처리**: 포괄적이나 재시도 로직으로 총 소요 시간 증가
2. **localStorage 의존성**: 사생활 보호 모드에서 동기화 실패 가능
3. **위기 감지 정확도**: 키워드 기반 한계로 오탐지/누락 위험
4. **메모리 누수 위험**: 일부 컴포넌트에서 cleanup 확인 필요
5. **상태 관리 복잡도**: Context 중첩 및 상태 머신 디버깅 어려움

---

## Critical 위험요인 (6개)

### 1. OnboardingGuard localStorage 접근 실패
- **위치**: `0108mlog-0109/src/router/guards.tsx:14-20`
- **문제**: localStorage 접근 실패 시 기본값 false → 무한 리다이렉트 가능
- **영향**: 사생활 보호 모드 사용자 앱 접근 불가
- **해결 방안**:
  - sessionStorage 폴백 추가
  - 쿠키 기반 대안 검토
  - 3회 리다이렉트 후 강제 통과 로직
- **우선순위**: P0

### 2. Firebase Auth 재시도 실패 시 앱 동작
- **위치**: `0108mlog-0109/src/services/auth.ts:44-56`
- **문제**: 3회 재시도 실패 시 Firestore 쓰기 불가, 앱은 계속 실행
- **영향**: 오프라인 모드로 동작, 데이터 동기화 실패
- **해결 방안**:
  - UI에 오프라인 모드 표시
  - localStorage 백업 강화
  - 재연결 시 자동 동기화
- **우선순위**: P0

### 3. ErrorBoundary 자체 에러
- **위치**: `0108mlog-0109/src/components/ui/ErrorBoundary.tsx:30-38`
- **문제**: ErrorBoundary 자체에서 에러 발생 시 캐치 불가
- **영향**: 앱 전체 크래시
- **해결 방안**:
  - 최상위 try-catch 추가
  - window.onerror 핸들러
  - Sentry 등 외부 에러 추적 서비스
- **우선순위**: P0

### 4. 위기 감지 누락 (False Negative)
- **위치**: `0108mlog-0109/src/services/crisisDetection.ts:26-46`
- **문제**: 키워드 미포함 표현 누락 (예: "더 이상 살 의미가 없어")
- **영향**: 심각한 위기 상황 감지 실패
- **해결 방안**:
  - Gemini API로 전체 문장 분석
  - 키워드 목록 정기 업데이트 (분기 1회)
  - 맥락 기반 분석 추가
- **우선순위**: P0

### 5. Firestore Batch 500개 제한
- **위치**: `0108mlog-0109/src/services/firestore.ts:537-554`
- **문제**: 대량 삭제 시 500개 제한 초과 시 에러
- **영향**: 데이터 삭제 실패
- **해결 방안**:
  - 여러 배치로 자동 분할
  - 백그라운드 큐 작업
  - 진행 상태 표시
- **우선순위**: P1

### 6. useRealtime cleanup 함수 누락 시 메모리 누수
- **위치**: `0108mlog-0109/src/hooks/useRealtime.ts:75`
- **문제**: onSnapshot unsubscribe 누락 시 리스너 누적
- **영향**: 메모리 누수, 앱 성능 저하
- **해결 방안**:
  - useEffect cleanup에서 반드시 unsubscribe() 호출
  - ESLint 규칙 추가 (exhaustive-deps)
  - 코드 리뷰 시 필수 확인
- **우선순위**: P0

---

## High 위험요인 (12개)

### 1. API 타임아웃 누적 시간
- **위치**: `0108mlog-0109/src/services/apiPolicy.ts:104-114`
- **문제**: 3회 재시도 시 최대 24초 소요 (8초 × 3)
- **영향**: 사용자 대기 시간 증가, UX 저하
- **해결 방안**:
  - 스트리밍 응답 도입
  - 타임아웃 단계별 조정 (8s → 5s → 3s)
  - 즉시 폴백 옵션 제공
- **우선순위**: P1

### 2. DayMode 메시지 배열 무한 증가
- **위치**: `0108mlog-0109/src/components/chat/DayMode.tsx`
- **문제**: messages 배열 제한 없음, 메모리 누수 가능
- **영향**: 장시간 대화 시 메모리 소모 증가
- **해결 방안**:
  - 최대 100개 메시지로 제한
  - 오래된 메시지 자동 제거
  - Virtualized List 도입
- **우선순위**: P1

### 3. Context 값 변경 시 리렌더링 범위
- **위치**: `0108mlog-0109/src/contexts/AppContext.tsx`
- **문제**: mode 변경 시 모든 소비자 리렌더링
- **영향**: 성능 저하
- **해결 방안**:
  - 상태별 Context 분리 (ModeContext, PersonaContext 등)
  - useMemo, useCallback 최적화
  - 선택적 구독 (use-context-selector)
- **우선순위**: P1

### 4. AppContext 모드 주기적 체크 (1분)
- **위치**: `0108mlog-0109/src/contexts/AppContext.tsx:66-72`
- **문제**: 1분마다 resolveMode() 호출, 성능 영향
- **영향**: 백그라운드 네트워크 요청 증가
- **해결 방안**:
  - 간격 조정 (5분)
  - requestIdleCallback 사용
  - override 시 완전 중지
- **우선순위**: P1

### 5. localStorage 동기화 불일치
- **위치**: `0108mlog-0109/src/services/consent.ts:120-140`
- **문제**: Firestore 저장 실패 시 localStorage만 저장
- **영향**: 다기기 동기화 실패
- **해결 방안**:
  - 재시도 로직 추가
  - 동기화 상태 UI 표시
  - 백그라운드 동기화 작업
- **우선순위**: P1

### 6. MainLayout URL 기반 탭 활성화
- **위치**: `0108mlog-0109/src/components/layout/MainLayout.tsx:39-47`
- **문제**: location.pathname 파싱으로 매 렌더링마다 실행
- **영향**: 불필요한 계산
- **해결 방안**:
  - useMemo로 최적화
  - 라우트 메타데이터 활용
- **우선순위**: P2

### 7. Firestore searchConversations 클라이언트 사이드 필터링
- **위치**: `0108mlog-0109/src/services/firestore.ts:615-654`
- **문제**: Firestore 전체 텍스트 검색 미지원, 모든 데이터 가져온 후 필터링
- **영향**: 대량 데이터 시 성능 저하
- **해결 방안**:
  - Algolia, Typesense 등 외부 검색 서비스
  - Firestore Extensions (Search with Algolia)
  - 태그 기반 색인
- **우선순위**: P1

### 8. EmotionSelectModal 2열 레이아웃 고정
- **위치**: `0108mlog-0109/src/components/ui/EmotionSelectModal.tsx:65`
- **문제**: columns=2 고정, 반응형 미지원
- **영향**: 대화면에서 레이아웃 비효율
- **해결 방안**:
  - useMediaQuery로 동적 열 수 조정
  - grid-cols-2 md:grid-cols-3 lg:grid-cols-5
- **우선순위**: P2

### 9. TabBar buttonRefs 배열 길이 고정
- **위치**: `0108mlog-0109/src/components/ui/TabBar.tsx:34`
- **문제**: 5개 고정, 탭 수 변경 시 수동 수정 필요
- **영향**: 유지보수성 저하
- **해결 방안**:
  - allTabs.length로 동적 할당
  - useRef<HTMLButtonElement[]>([])
- **우선순위**: P2

### 10. NightMode Textarea 높이 미설정
- **위치**: `0108mlog-0109/src/components/chat/NightMode.tsx`
- **문제**: 긴 일기 작성 시 레이아웃 깨짐 가능
- **영향**: UX 저하
- **해결 방안**:
  - maxHeight + overflow-y-auto
  - auto-resize textarea 라이브러리
- **우선순위**: P2

### 11. ErrorBoundary handleRetry 에러 재발
- **위치**: `0108mlog-0109/src/components/ui/ErrorBoundary.tsx:57-63`
- **문제**: 에러 원인 미해결 시 무한 루프 위험
- **영향**: 사용자 불편
- **해결 방안**:
  - 재시도 횟수 제한 (최대 3회)
  - 에러 원인 분석 로직
  - 강제 홈 이동
- **우선순위**: P2

### 12. CelestialBackground 애니메이션 성능
- **위치**: `0108mlog-0109/src/components/ui/CelestialBackground.tsx`
- **문제**: 저사양 기기에서 프레임 드롭 가능
- **영향**: 성능 저하
- **해결 방안**:
  - CSS will-change 속성
  - transform: translate3d (GPU 가속)
  - intensity 레벨 조정
- **우선순위**: P2

---

## Medium 위험요인 (17개)

### 1. routes.tsx /reports 경로 중복
- **위치**: `0108mlog-0109/src/router/routes.tsx:77-81`
- **문제**: /reports와 /reports/weekly가 동일 컴포넌트
- **영향**: 라우트 혼란
- **해결 방안**: /reports는 Navigate로 리다이렉트
- **우선순위**: P2

### 2. Router.tsx Provider 중첩 깊이 4단계
- **위치**: `0108mlog-0109/src/router/Router.tsx:34-38`
- **문제**: ErrorBoundary > AppProvider > UIProvider > BrowserRouter
- **영향**: 성능 영향 최소, 리렌더링 최적화 필요
- **해결 방안**: 필요 시 Context 분리
- **우선순위**: P3

### 3. OnboardingLayout handleExit 데이터 미저장
- **위치**: `0108mlog-0109/src/components/layout/OnboardingLayout.tsx:45-49`
- **문제**: 종료 시 데이터 미저장으로 다시 온보딩 시작
- **영향**: 사용자 불편
- **해결 방안**: 진행 상태 임시 저장 또는 확인 대화상자
- **우선순위**: P2

### 4. modeResolver 자정 넘김 로직 복잡도
- **위치**: `0108mlog-0109/src/services/modeResolver.ts:42-53`
- **문제**: 22:00 ~ 06:00 범위 처리 복잡
- **영향**: 버그 가능성
- **해결 방안**: 단위 테스트 추가
- **우선순위**: P2

### 5. crisisDetection 키워드 하드코딩
- **위치**: `0108mlog-0109/src/services/crisisDetection.ts:26-46`
- **문제**: 46개 키워드 하드코딩, 다국어 미지원
- **영향**: 확장성 저하
- **해결 방안**: Firestore에 저장, 다국어 키워드 추가
- **우선순위**: P2

### 6. apiPolicy Promise.race 타임아웃 후 계속 실행
- **위치**: `0108mlog-0109/src/services/apiPolicy.ts:107-113`
- **문제**: 타임아웃 후에도 API 호출 계속됨
- **영향**: 리소스 낭비
- **해결 방안**: AbortController 사용
- **우선순위**: P2

### 7. firestore saveOnboardingData localStorage 백업
- **위치**: `0108mlog-0109/src/services/firestore.ts:450-451`
- **문제**: localStorage 접근 실패 시 백업 실패
- **영향**: 데이터 손실
- **해결 방안**: try-catch + 에러 로깅
- **우선순위**: P2

### 8. gemini.ts 폴백 메시지 한국어 하드코딩
- **위치**: `0108mlog-0109/src/services/ai/gemini.ts`
- **문제**: 다국어 지원 시 수정 필요
- **영향**: i18n 작업 시 누락 가능
- **해결 방안**: i18n 라이브러리 통합
- **우선순위**: P3

### 9. EmotionSelectModal Portal SSR 호환성
- **위치**: `0108mlog-0109/src/components/ui/EmotionSelectModal.tsx:84`
- **문제**: body 직접 마운트, SSR 환경에서 에러
- **영향**: Next.js 등 SSR 프레임워크 사용 불가
- **해결 방안**: typeof document !== 'undefined' 체크
- **우선순위**: P3 (현재 CSR만 사용)

### 10. TabBar 스와이프 제스처 스크롤 충돌
- **위치**: `0108mlog-0109/src/components/ui/TabBar.tsx:38-48`
- **문제**: 페이지 스크롤과 충돌 가능
- **영향**: 의도치 않은 탭 전환
- **해결 방안**: useTouchGestures threshold 조정
- **우선순위**: P2

### 11. DayMode 위기 감지 오탐지
- **위치**: `0108mlog-0109/src/components/chat/DayMode.tsx`
- **문제**: "죽고 싶다"를 "죽고 싶다는 생각은 없어요"에서도 감지
- **영향**: 사용자 불편
- **해결 방안**: Gemini API 전체 문장 분석
- **우선순위**: P1

### 12. NightMode VoicePlayer TTS 브라우저 호환성
- **위치**: `0108mlog-0109/src/components/chat/NightMode.tsx`
- **문제**: Web Speech API 지원 확인 필요
- **영향**: 일부 브라우저에서 작동 안 함
- **해결 방안**: polyfill 또는 대체 UI
- **우선순위**: P2

### 13. ErrorBoundary 개발 모드 에러 노출
- **위치**: `0108mlog-0109/src/components/ui/ErrorBoundary.tsx:94-107`
- **문제**: process.env.NODE_ENV === 'development'
- **영향**: 프로덕션에서는 숨김 (의도된 동작)
- **해결 방안**: 개발 도구 패널 추가
- **우선순위**: P3

### 14. MainLayout AIChatbot 레거시 경로
- **위치**: `0108mlog-0109/src/components/layout/MainLayout.tsx:13`
- **문제**: components/AIChatbot.tsx (레거시)
- **영향**: 마이그레이션 불완전
- **해결 방안**: src/components/chat/AIChatbot.tsx로 이동
- **우선순위**: P2

### 15. AppContext timelineData INITIAL_TIMELINE mock
- **위치**: `0108mlog-0109/src/contexts/AppContext.tsx:53`
- **문제**: mock 데이터로 초기화
- **영향**: Firestore 연동 시 교체 필요
- **해결 방안**: Firestore에서 로드하는 로직 추가
- **우선순위**: P2

### 16. 플레이스홀더 페이지 미구현
- **위치**: 
  - `0108mlog-0109/src/pages/content/ContentPoems.tsx`
  - `0108mlog-0109/src/pages/content/ContentMeditations.tsx`
  - 기타 "곧 제공될 예정" 메시지 표시 페이지
- **문제**: 실제 기능 미구현
- **영향**: 사용자 기대치 미충족
- **해결 방안**: 우선순위에 따라 순차 구현
- **우선순위**: P2

### 17. 레거시 코드 마이그레이션 미완료
- **위치**: `0108mlog-0109/components/*.tsx` (13개 파일)
- **문제**: 
  - `components/AIChatbot.tsx` → MainLayout에서 사용 중
  - `components/ContentGallery.tsx` → ContentMain에서 사용 중
  - 기타 11개 레거시 파일
- **영향**: 코드베이스 이중 구조, 유지보수 복잡도 증가
- **해결 방안**: 
  - `src/components/`로 점진적 마이그레이션
  - import 경로 일괄 변경
  - 레거시 파일 삭제
- **우선순위**: P2

---

## Low 위험요인 (6개)

### 1. Router.tsx Anonymous Auth 로그만 출력
- **위치**: `0108mlog-0109/src/router/Router.tsx:28-30`
- **문제**: 실패 시 로그만 출력, 앱은 계속 실행
- **영향**: 오프라인 모드로 동작 (의도된 동작)
- **해결 방안**: UI에 오프라인 표시
- **우선순위**: P3

### 2. guards.tsx OnboardingGuard 경로 하드코딩
- **위치**: `0108mlog-0109/src/router/guards.tsx:31`
- **문제**: '/onboarding' 하드코딩
- **영향**: 라우트 변경 시 동기화 필요
- **해결 방안**: 상수로 관리
- **우선순위**: P3

### 3. modeResolver getUserSettings 비동기
- **위치**: `0108mlog-0109/src/services/modeResolver.ts:92-93`
- **문제**: 초기 로딩 시간 영향
- **영향**: 최소 (캐싱으로 완화 가능)
- **해결 방안**: localStorage 캐싱
- **우선순위**: P3

### 4. consent CONSENT_VERSION 마이그레이션
- **위치**: `0108mlog-0109/src/services/consent.ts:12`
- **문제**: 버전 업데이트 시 마이그레이션 필요
- **영향**: 향후 호환성
- **해결 방안**: 버전별 마이그레이션 로직
- **우선순위**: P3

### 5. EmotionSelectModal EMOTIONS_CONFIG 다국어
- **위치**: `0108mlog-0109/src/components/ui/EmotionSelectModal.tsx:14-19`
- **문제**: 한국어 하드코딩
- **영향**: 다국어 지원 시 수정 필요
- **해결 방안**: i18n 라이브러리 통합
- **우선순위**: P3

### 6. ChatMain consentChecked 상태 의존성
- **위치**: `0108mlog-0109/src/pages/chat/ChatMain.tsx:38-59`
- **문제**: useEffect 의존성 배열에 consentChecked
- **영향**: 중복 체크 가능성 (의도된 동작이지만 주의 필요)
- **해결 방안**: useRef로 변경 또는 once 플래그 사용
- **우선순위**: P3

---

## 개선 제안 (우선순위별)

### P0 (즉시 해결 필요)
1. ✅ **OnboardingGuard localStorage 폴백**: sessionStorage + 쿠키 대안
2. ✅ **Firebase Auth 재시도 실패 UI**: 오프라인 모드 표시
3. ✅ **ErrorBoundary 최상위 핸들러**: window.onerror + Sentry
4. ✅ **위기 감지 Gemini API 통합**: 문장 전체 분석
5. ✅ **Firestore Batch 자동 분할**: 500개 제한 처리

### P1 (중요, 빠른 시일 내 해결)
1. **API 타임아웃 최적화**: 스트리밍 응답 도입
2. **DayMode 메시지 제한**: 최대 100개
3. **Context 분리**: ModeContext, PersonaContext 등
4. **검색 서비스 통합**: Algolia 또는 Typesense
5. **위기 감지 정확도 향상**: 키워드 목록 정기 업데이트

### P2 (일반, 계획적 개선)
1. **routes.tsx 리다이렉트 정리**
2. **OnboardingLayout 진행 상태 저장**
3. **modeResolver 단위 테스트**
4. **crisisDetection Firestore 관리**
5. **레거시 코드 마이그레이션**

### P3 (낮음, 향후 고려)
1. **다국어 지원 (i18n)**
2. **SSR 호환성 (Next.js)**
3. **개발 도구 패널**
4. **버전별 마이그레이션 로직**

---

## 아키텍처 개선 권장사항

### 1. 에러 추적 서비스 통합
- **도구**: Sentry, LogRocket, Rollbar
- **이점**: 실시간 에러 모니터링, 사용자 영향 분석
- **우선순위**: P0

### 2. 상태 관리 리팩토링
- **현재**: Context + XState
- **제안**: Zustand 또는 Jotai로 단순화
- **이점**: 성능 향상, 디버깅 용이
- **우선순위**: P1

### 3. 검색 인프라 구축
- **현재**: 클라이언트 사이드 필터링
- **제안**: Algolia 또는 Typesense
- **이점**: 전체 텍스트 검색, 성능 향상
- **우선순위**: P1

### 4. AI 응답 스트리밍
- **현재**: 일괄 응답 (8초 타임아웃)
- **제안**: SSE 또는 WebSocket 스트리밍
- **이점**: 즉각적인 피드백, UX 향상
- **우선순위**: P1

### 5. 오프라인 우선 아키텍처
- **현재**: 온라인 의존적
- **제안**: Service Worker + IndexedDB
- **이점**: 오프라인 작동, 동기화 자동화
- **우선순위**: P2

---

## 테스트 커버리지 권장사항

현재 주석화된 파일들에 대한 테스트 우선순위:

### Critical Path (P0)
1. **auth.ts**: ensureAnonymousAuth() 재시도 로직
2. **crisisDetection.ts**: 위기 감지 알고리즘
3. **guards.tsx**: OnboardingGuard 리다이렉트
4. **apiPolicy.ts**: 재시도 및 폴백 로직
5. **firestore.ts**: Batch 작업

### High Priority (P1)
1. **modeResolver.ts**: 자정 넘김 시간 계산
2. **DayMode/NightMode**: 상태 머신 플로우
3. **AppContext**: 모드 주기적 체크
4. **EmotionSelectModal**: 키보드 네비게이션
5. **TabBar**: 터치 제스처

### Medium Priority (P2)
1. **ErrorBoundary**: 에러 복구 로직
2. **consent.ts**: 동의 상태 동기화
3. **MainLayout**: 탭 활성화 로직

---

## 모니터링 메트릭 제안

### 성능 메트릭
- **API 응답 시간**: 평균, P95, P99
- **재시도 횟수**: 네트워크 오류 빈도
- **메모리 사용량**: DayMode 메시지 배열
- **렌더링 성능**: Context 변경 시 리렌더링 횟수

### 오류 메트릭
- **위기 감지**: 오탐지/누락 비율
- **localStorage 실패**: 사생활 보호 모드 사용자
- **Firebase Auth 실패**: 네트워크 오류 빈도
- **ErrorBoundary 트리거**: 에러 발생 빈도

### 사용자 경험 메트릭
- **온보딩 완료율**: OnboardingGuard 통과율
- **대화 저장 성공률**: Firestore 쓰기 성공률
- **AI 응답 만족도**: 타임아웃 대비 성공률

---

## 결론

주석화 과정에서 **41개의 위험요인**을 식별했으며, 이 중 **6개는 Critical**, **12개는 High** 우선순위입니다.

주요 권장 사항:
1. ✅ **에러 추적 서비스** 즉시 통합 (Sentry)
2. ✅ **위기 감지 알고리즘** Gemini API 기반 개선
3. ✅ **localStorage 폴백** 다중 전략 구현
4. ✅ **검색 인프라** 외부 서비스 통합
5. ✅ **테스트 커버리지** Critical Path 우선 작성

다음 단계:
- ✅ **Phase 1-7 주석화 완료**
- Critical 위험요인 즉시 수정 (P0 6개)
- 단위 테스트 작성 시작 (Critical Path 우선)
- 에러 추적 서비스 통합 (Sentry)
- 레거시 코드 마이그레이션 계획 수립

---

## 주석화 완료 상세 (Phase 4-6)

### Phase 4: 페이지 컴포넌트 (28개)

#### Chat (3개)
- ✅ `ChatMain.tsx` - mode 기반 DayMode/NightMode 렌더링, 동의 모달
- ✅ `PersonaSetup.tsx` - PersonaEditor 레거시 사용
- ✅ `BibliotherapySession.tsx` - 플레이스홀더

#### Journal (5개)
- ✅ `JournalTimeline.tsx` - JournalView 레거시, timelineData Context
- ✅ `ConversationDetail.tsx` - useParams로 ID 추출
- ✅ `JournalDiary.tsx` - 플레이스홀더
- ✅ `JournalSearch.tsx` - searchConversations (클라이언트 사이드)
- ✅ `JournalJourney.tsx` - JourneyView, Sankey/YearInPixels

#### Reports (4개)
- ✅ `WeeklyReport.tsx` - ReportView 레거시
- ✅ `MonthlyReport.tsx` - ReportView 레거시
- ✅ `MonthlyRetrospective.tsx` - generateMonthlyNarrative 호출
- ✅ `MonitorDashboard.tsx` - 실시간 감정 추적

#### Content (5개)
- ✅ `ContentMain.tsx` - ContentGallery 레거시, generateHealingContent
- ✅ `ContentPoems.tsx` - 플레이스홀더
- ✅ `ContentMeditations.tsx` - 플레이스홀더
- ✅ `ContentMusic.tsx` - 플레이스홀더
- ✅ `ContentImmersion.tsx` - 플레이스홀더

#### Profile (7개)
- ✅ `ProfileMain.tsx` - ProfileView 레거시
- ✅ `PersonaSettings.tsx` - PersonaEditor, updateUserPersona
- ✅ `DayNightSettings.tsx` - 자동 모드 토글, 시작 시간 설정
- ✅ `Settings.tsx` - 리마인드 설정, saveUserSettings
- ✅ `Privacy.tsx` - 동의 관리, 데이터 내보내기/삭제
- ✅ `PrivacyPolicy.tsx` - 정책 전문 표시
- ✅ `Conversations.tsx` - ConversationManager, deleteConversation

#### Safety (3개)
- ✅ `SafetyMain.tsx` - SafetyCheck, 30초 타임아웃, returnTo
- ✅ `CrisisSupport.tsx` - 상담전화 연결 (1577-0199)
- ✅ `CopingTools.tsx` - 호흡/그라운딩/이완

#### 기타 (1개)
- ✅ `NotFound.tsx` - 404 페이지

### Phase 5: 커스텀 훅 (7개) + 유틸리티 (8개)

#### Hooks (7개)
- ✅ `useRealtime.ts` - Firestore onSnapshot, **CRITICAL: cleanup 필수**
- ✅ `useHaptics.ts` - Vibration API, 6종 패턴
- ✅ `useTouchGestures.ts` - tap/swipe/longPress/pinch
- ✅ `useKeyboardNavigation.ts` - 화살표/Home/End/Enter
- ✅ `useFocusTrap.ts` - 모달 포커스 제한
- ✅ `useFocusRestore.ts` - 이전 포커스 복원
- ✅ `useMobileOptimization.ts` - 디바이스 타입 감지

#### Utils (8개)
- ✅ `error.ts` - logError, getErrorMessage, Sentry 권장
- ✅ `firestore.ts` - toDate, toTimestamp 변환
- ✅ `index.ts` - Utils 배럴 export
- ✅ `style/zIndexManager.ts` - 전역 z-index 레이어 맵
- ✅ `style/cssVariables.ts` - CSS 변수 동적 제어
- ✅ `style/units.ts` - spacing, rem/px 변환
- ✅ `style/theme.ts` - day/night/system 모드
- ✅ `style/index.ts` - 스타일 유틸 배럴 export

### Phase 6: 레거시 코드 (13개)

#### 사용 중 (6개) - P1 마이그레이션 필요
- ✅ `AIChatbot.tsx` - MainLayout에서 사용, generateChatbotResponse
- ✅ `ContentGallery.tsx` - ContentMain에서 사용, generateHealingContent
- ✅ `JournalView.tsx` - JournalTimeline에서 사용
- ✅ `ReportView.tsx` - WeeklyReport/MonthlyReport에서 사용
- ✅ `ProfileView.tsx` - ProfileMain에서 사용
- ✅ `PersonaEditor.tsx` - PersonaSetup/PersonaSettings에서 사용

#### 대체됨 (7개) - P2 삭제 가능
- ✅ `DayMode.tsx` - src/components/chat/DayMode.tsx로 대체
- ✅ `NightMode.tsx` - src/components/chat/NightMode.tsx로 대체
- ✅ `SafetyLayer.tsx` - 미사용 (확인 필요)
- ✅ `TimelineView.tsx` - JournalView에서만 사용
- ✅ `EmotionCalendar.tsx` - JournalView에서만 사용
- ✅ `VoicePlayer.tsx` - src/components/chat/VoicePlayer.tsx로 대체
- ✅ `UI.tsx` - src/components/ui로 대체

### 레거시 코드 마이그레이션 계획

**단계 1: 사용 중인 파일 마이그레이션 (P1)**
1. `components/AIChatbot.tsx` → `src/components/chat/AIChatbot.tsx`
   - MainLayout import 경로 변경
2. `components/ContentGallery.tsx` → `src/components/content/ContentGallery.tsx`
   - ContentMain import 경로 변경
3. `components/JournalView.tsx` → `src/components/journal/JournalView.tsx`
4. `components/ReportView.tsx` → `src/components/reports/ReportView.tsx`
5. `components/ProfileView.tsx` → `src/components/profile/ProfileView.tsx`
6. `components/PersonaEditor.tsx` → `src/components/profile/PersonaEditor.tsx`

**단계 2: 대체된 파일 삭제 (P2)**
1. `components/DayMode.tsx` - 삭제
2. `components/NightMode.tsx` - 삭제
3. `components/VoicePlayer.tsx` - 삭제 (src/components/chat/VoicePlayer.tsx 사용)
4. `components/UI.tsx` - 삭제
5. `components/SafetyLayer.tsx` - 사용 위치 확인 후 삭제
6. `components/TimelineView.tsx` - JournalView 마이그레이션 후 삭제
7. `components/EmotionCalendar.tsx` - JournalView 마이그레이션 후 삭제

**마이그레이션 체크리스트**:
- [ ] import 경로 전체 검색 (`components/` → `src/components/`)
- [ ] 각 파일 이동 및 경로 수정
- [ ] 빌드 테스트 (`npm run build`)
- [ ] 런타임 테스트 (모든 페이지 확인)
- [ ] 레거시 파일 삭제
- [ ] Git commit

---

**검토자**: AI Assistant
**검토 방법**: 파일 시스템 직접 확인, 코드 분석, PRD 명세 대조
**검증 범위**: Phase 1-7 전체 (30개 핵심 + 28개 페이지 + 15개 훅/유틸 + 13개 레거시)
**주석화 완료**: ✅ **86개 파일 완료**
**위험요인 식별**: 41개 (Critical 6, High 12, Medium 17, Low 6)
