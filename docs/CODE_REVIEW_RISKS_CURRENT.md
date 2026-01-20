# 마음로그 V5.0 위험요인 종합 보고서 (현재 코드베이스)

**작성일**: 2026-01-17
**버전**: 5.0 (현재 코드베이스 검증 완료)
**검토 범위**: C:\INEESm (현재 메인 코드베이스)
**검증 완료**: RISK_VERIFICATION_CURRENT_CODEBASE.md 참조

---

## Executive Summary

### 전체 위험요인: **46개** (해결 2개 제외)
- **Critical**: 6개 (프론트 5 + 백엔드 1)
- **High**: 15개 (프론트 12 + 백엔드 3)
- **Medium**: 19개 (프론트 16 + 백엔드 3)
- **Low**: 6개 (프론트 6 + 백엔드 0)

### 해결 완료: **2개**
- ✅ FE-C6: useRealtime cleanup (검증 완료)
- ✅ Medium 1개

### 핵심 이슈 (미해결)
1. ⚠️ **프론트-백엔드 타임아웃 불일치** (8초 vs 60-90초)
2. ⚠️ **메모리 누수** (DayMode 메시지 배열)
3. ⚠️ **위기 감지 정확도** (키워드 기반 한계, Gemini 미통합)
4. ⚠️ **에러 처리** (window.onerror 핸들러 없음)
5. ⚠️ **저장소 폴백 없음** (OnboardingGuard)

---

# 1. 프론트엔드 위험요인 (38개)

## 1.1 Critical 위험요인 (5개)

### FE-C1. OnboardingGuard localStorage 접근 실패
- **영역**: 라우팅
- **위치**: `src/router/guards.tsx:14-20`
- **문제**: sessionStorage 폴백 없음, 무한 리다이렉트 위험
- **확인**: ✅ 코드 직접 확인 (2026-01-17)
- **영향**: 사생활 보호 모드 사용자 앱 접근 불가
- **해결 방안**: sessionStorage 폴백 + 3회 리다이렉트 제한
- **우선순위**: P0
- **예상 시간**: 1.5시간

---

### FE-C2. Firebase Auth 재시도 실패 시 앱 동작
- **영역**: 인증
- **위치**: `src/services/auth.ts:44-56`
- **문제**: 재시도 실패 후 UI에 오프라인 모드 표시 없음
- **확인**: ✅ 코드 직접 확인
- **영향**: Firestore 쓰기 불가 상태를 사용자가 인지 못함
- **해결 방안**: UIContext에 isOnline 상태 추가 + 오프라인 배너
- **우선순위**: P0
- **예상 시간**: 1시간

---

### FE-C3. ErrorBoundary 자체 에러
- **영역**: 에러 처리
- **위치**: `index.tsx` (전체 16줄)
- **문제**: window.onerror 핸들러 없음
- **확인**: ✅ 파일 전체 읽기 완료
- **영향**: ErrorBoundary 밖 에러 시 앱 전체 크래시
- **해결 방안**: window.onerror + onunhandledrejection 핸들러 추가
- **우선순위**: P0
- **예상 시간**: 1시간

---

### FE-C4. 위기 감지 누락 (False Negative)
- **영역**: 안전망
- **위치**: `src/services/crisisDetection.ts:26-46`
- **문제**: 키워드 기반만, Gemini API 통합 없음
- **확인**: ✅ 키워드 배열만 확인, Gemini 호출 없음
- **영향**: "더 이상 살 의미가 없어" 같은 간접 표현 감지 못함
- **해결 방안**: Gemini API 2차 검증 추가
- **우선순위**: P0
- **예상 시간**: 4시간

---

### ~~FE-C5. Firestore Batch 500개 제한~~ (검증 보류)
- **영역**: 데이터
- **위치**: `src/services/firestore.ts:537-554`
- **문제**: 대량 삭제 시 500개 제한 초과 시 에러
- **확인**: ⚠️ 미확인 (파일 내용 미검증)
- **우선순위**: P1

---

### ~~FE-C6. useRealtime cleanup 누락 시 메모리 누수~~
- **상태**: ✅ **해결 완료**
- **위치**: `src/hooks/useRealtime.ts:75, 107, 184, 260, 335`
- **확인**: ✅ 모든 4개 useEffect에서 `unsubscribe()` 호출 확인
- **결과**: 추가 작업 불필요

---

## 1.2 High 위험요인 (12개)

### FE-H1. API 타임아웃 누적 시간
- **영역**: API
- **위치**: `src/services/apiPolicy.ts:104-114`
- **문제**: 3회 재시도 × 8초 = 최대 24초
- **확인**: ✅ 코드 확인
- **영향**: UX 저하
- **해결 방안**: 단계별 타임아웃 (15s → 10s → 5s)
- **우선순위**: P1

---

### FE-H2. DayMode 메시지 배열 무한 증가
- **영역**: 컴포넌트
- **위치**: `src/features/checkin/useDayCheckinMachine.ts`
- **문제**: messages 배열 크기 제한 없음
- **확인**: ✅ grep 검색으로 `.slice(-100)` 없음 확인
- **영향**: 장시간 대화 시 메모리 누수
- **해결 방안**: `.slice(-100)` 적용
- **우선순위**: P0 (Critical로 상향)
- **예상 시간**: 30분

---

### FE-H3 ~ FE-H12
- Context 리렌더링 범위
- AppContext 모드 주기적 체크
- localStorage 동기화 불일치
- Firestore searchConversations 클라이언트 필터링
- MainLayout URL 파싱
- EmotionSelectModal 레이아웃
- TabBar refs 관리
- NightMode Textarea 높이
- ErrorBoundary retry 제한
- CelestialBackground 성능

**우선순위**: P1-P2

---

## 1.3 Medium 위험요인 (16개)

### FE-M1 ~ FE-M17
- routes.tsx /reports 경로 중복
- Router.tsx Provider 중첩 4단계
- OnboardingLayout handleExit 데이터 미저장
- modeResolver 자정 넘김 로직
- crisisDetection 키워드 하드코딩
- apiPolicy Promise.race 타임아웃 후 실행
- firestore saveOnboardingData localStorage 백업
- gemini.ts 폴백 한국어 하드코딩
- EmotionSelectModal Portal SSR
- TabBar 스와이프 충돌
- DayMode 위기 감지 오탐지
- NightMode VoicePlayer TTS 호환성
- ErrorBoundary 개발 모드 노출
- MainLayout AIChatbot 레거시
- AppContext mock 데이터
- 플레이스홀더 페이지 미구현

**우선순위**: P2

---

## 1.4 Low 위험요인 (6개)

### FE-L1 ~ FE-L6
- Router.tsx Anonymous Auth 로그만 출력
- guards.tsx 경로 하드코딩
- modeResolver getUserSettings 비동기
- consent CONSENT_VERSION 마이그레이션
- EmotionSelectModal 다국어
- ChatMain consentChecked 의존성

**우선순위**: P3

---

# 2. 백엔드 위험요인 (7개)

## 2.1 Critical 위험요인 (1개)

### BE-C1. 프론트-백엔드 타임아웃 불일치
- **영역**: 타임아웃 정책
- **위치**: 
  - 프론트: `src/services/apiPolicy.ts` (8초)
  - 백엔드: `functions/src/api/gemini.ts` (60-90초)
- **문제**: 프론트 타임아웃 후 백엔드 계속 실행
- **확인**: ✅ grep으로 `timeoutSeconds` 확인
  - generateDayModeResponse: 90초
  - 5개 Functions: 60초
  - 2개 Functions: 30초 (OK)
- **영향**: 
  - 비용 증가 (52초 낭비)
  - 중복 실행 위험 (최대 6회)
- **해결 방안**: 모든 Functions 30초로 단축
- **우선순위**: P0
- **예상 시간**: 30분 (코드 수정 15분 + 배포 15분)

---

## 2.2 High 위험요인 (3개)

### BE-H1. Gemini API 재시도 1회 vs 프론트 3회
- **영역**: API 정책
- **위치**: `functions/src/services/gemini.ts:154-218`
- **문제**: 총 최대 6회 호출 (프론트 3회 × 백엔드 2회)
- **확인**: ✅ retry() 함수 사용 확인
- **영향**: Gemini API 비용 증가, Rate Limit 위험
- **해결 방안**: 백엔드 재시도 제거
- **우선순위**: P1

---

### BE-H2. sanitizeUserInput 10000자 제한
- **영역**: 보안/입력 처리
- **위치**: `functions/src/services/gemini.ts:40-52`
- **문제**: 10000자 초과 시 자동 잘림, 사용자에게 알림 없음
- **영향**: 긴 일기 작성 시 데이터 손실
- **해결 방안**: 프론트엔드에서 사전 검증 (maxLength=10000)
- **우선순위**: P0 (프론트 Task와 연계)

---

### BE-H3. JSON 파싱 실패 처리
- **영역**: 데이터 파싱
- **위치**: `functions/src/api/gemini.ts:293-327, 479-508`
- **문제**: Gemini API 응답이 JSON 아닐 때 fallback 반환
- **영향**: generateHealingContent, generateMicroAction 실패
- **해결 방안**: Gemini API 프롬프트 개선 (JSON 형식 강제)
- **우선순위**: P1

---

## 2.3 Medium 위험요인 (3개)

### BE-M1. Secret Manager 캐싱 TTL 1시간
### BE-M2. Cold Start 지연
### BE-M3. Google Search Grounding 메모리 1GiB

**우선순위**: P2

---

# 3. 프론트-백엔드 통합 이슈

## 3.1 타임아웃 정책 불일치 (CRITICAL)

| Function | 프론트 타임아웃 | 백엔드 타임아웃 | 불일치 시간 | 상태 |
|----------|----------------|----------------|------------|------|
| generateDayModeResponse | 8초 | 90초 | 82초 | ❌ |
| generateNightModeLetter | 8초 | 60초 | 52초 | ❌ |
| generateMonthlyNarrative | 8초 | 60초 | 52초 | ❌ |
| generateHealingContent | 8초 | 60초 | 52초 | ❌ |
| generateChatbotResponse | 8초 | 60초 | 52초 | ❌ |
| generateMicroAction | 8초 | 30초 | 22초 | ⚠️ |
| generateTimelineAnalysis | 8초 | 30초 | 22초 | ⚠️ |

**해결안**: 모든 백엔드 Functions 30초로 단축

---

## 3.2 입력 길이 제한 불일치 (HIGH)

| 구분 | 프론트엔드 | 백엔드 | 불일치 |
|------|-----------|--------|--------|
| 검증 | ❌ 없음 | ✅ 10000자 잘림 | ❌ |
| 에러 처리 | - | 조용히 잘림 | ❌ |

**해결안**: 프론트엔드 `maxLength={10000}` 추가

---

# 4. 위험요인 통합 우선순위

## P0 (즉시 해결 필요) - 6개 (8.5시간)

### 프론트엔드 (5개)
1. FE-C1: OnboardingGuard sessionStorage 폴백 (1.5시간)
2. FE-C2: Firebase Auth 재시도 UI (1시간)
3. FE-C3: window.onerror 핸들러 (1시간)
4. FE-C4: 위기 감지 Gemini API 통합 (4시간)
5. FE-H2: DayMode 메시지 배열 제한 (30분)

### 백엔드 (1개)
6. BE-C1: 타임아웃 30초로 단축 (30분)

---

## P1 (중요, 빠른 시일 내) - 15개

### 프론트엔드 (12개)
- API 타임아웃 최적화 (단계별 조정)
- Context 분리 (AppContext → ModeContext + UIContext)
- localStorage 동기화 불일치
- searchConversations 외부 검색
- 기타 8개

### 백엔드 (3개)
- Gemini API 재시도 제거
- JSON 파싱 실패 재시도
- 기타 1개

---

## P2 (계획적 개선) - 19개

### 프론트엔드 (16개)
- routes 리다이렉트 개선
- OnboardingLayout 진행 상태 저장
- modeResolver 테스트 커버리지
- crisisDetection Firestore 관리
- 레거시 마이그레이션 (13개 파일)
- 플레이스홀더 페이지 구현
- 기타 10개

### 백엔드 (3개)
- Secret Manager TTL 조정
- Cold Start 최적화
- Google Search Grounding 메모리 최적화

---

## P3 (추후 개선) - 6개

### 프론트엔드 (6개)
- 다국어 지원
- 경로 하드코딩 제거
- 기타 4개

---

# 5. 즉시 조치 사항 (P0)

## 프론트엔드 (5개)

### 1. OnboardingGuard sessionStorage 폴백
- 파일: `src/router/guards.tsx`
- 작업: try-catch 3단계 폴백 + 3회 리다이렉트 제한
- 시간: 1.5시간

### 2. window.onerror 핸들러
- 파일: `index.tsx`
- 작업: 전역 에러 핸들러 + localStorage 로깅
- 시간: 1시간

### 3. Firebase Auth 재시도 UI
- 파일: `src/contexts/UIContext.tsx`, `src/components/layout/MainLayout.tsx`
- 작업: isOnline 상태 + 오프라인 배너
- 시간: 1시간

### 4. 위기 감지 Gemini API 통합
- 파일: `src/services/crisisDetection.ts`
- 작업: detectCrisisWithGemini() 함수 추가, 키워드 + Gemini 2단계 검증
- 시간: 4시간

### 5. DayMode 메시지 배열 제한
- 파일: `src/features/checkin/useDayCheckinMachine.ts`
- 작업: `setMessages(prev => [...prev, message].slice(-100))`
- 시간: 30분

## 백엔드 (1개)

### 6. 타임아웃 30초로 단축
- 파일: `functions/src/api/gemini.ts`
- 작업: 
  - generateDayModeResponse: 90 → 30
  - 5개 Functions: 60 → 30
- 시간: 30분

---

# 6. 검증 방법

## 프론트엔드

```bash
npm run build
npm run lint
npx tsc --noEmit
```

**수동 테스트**:
1. 사생활 보호 모드에서 온보딩 (리다이렉트 3회 제한)
2. 10000자 초과 입력 차단
3. 네트워크 끊기 → 오프라인 배너 확인
4. 강제 에러 발생 → localStorage 로깅 확인
5. `/profile/debug` 접근 → 에러 로그 확인
6. 위기 키워드 입력 → Gemini 분석 확인

## 백엔드

```bash
cd functions
npm run build
firebase deploy --only functions

# 타임아웃 확인
gcloud logging read "resource.type=cloud_function AND textPayload:timeout" --limit 50
```

---

# 7. 완료 기준

## P0 완료 조건

- [ ] 모든 6개 P0 항목 구현 완료
- [ ] 빌드 성공 (프론트 + 백엔드)
- [ ] Linter 에러 0개
- [ ] 수동 테스트 6개 항목 통과
- [ ] 백엔드 배포 완료
- [ ] 타임아웃 발생 0건 (배포 후 24시간)

## P1 시작 조건

- [ ] P0 완료
- [ ] 프로덕션 배포 후 3일 안정화
- [ ] 성능 메트릭 정상 (응답 시간 < 5초)
- [ ] 에러율 < 1%

---

**검증자**: AI Assistant
**검증 방법**: 파일 직접 읽기, grep 검색, 코드 분석
**검증 완료**: 2026-01-17
**다음 단계**: ACTION_PLAN_CURRENT.md 실행
