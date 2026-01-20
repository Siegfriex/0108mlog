# E2E 자동화 테스트 구축 완료 가이드

**작성일**: 2026-01-20  
**버전**: 1.0  
**기준**: E2E_VERIFICATION_PLAN.md

---

## 구축 완료 항목

### 1. 인프라 설정 ✅

- **Playwright 설정**: `playwright.config.ts` 생성
  - Production URL: `https://iness-mlog.web.app`
  - Local dev server: `http://localhost:3000`
  - 테스트 프로젝트: Chromium (Desktop), Mobile (iPhone 14 Pro)
  - 리포터: HTML, JSON, JUnit

- **package.json 스크립트** 추가:
  ```bash
  npm run test:e2e          # 전체 E2E 테스트 실행
  npm run test:e2e:ui       # UI 모드로 테스트 실행
  npm run test:e2e:headed   # 브라우저 보이는 모드
  npm run test:e2e:p0       # P0 Critical 테스트만
  npm run test:e2e:p1       # P1 High 테스트만
  npm run test:e2e:p2       # P2 Medium 테스트만
  npm run test:e2e:report   # 리포트 보기
  ```

### 2. 공통 인프라 ✅

**디렉토리 구조**:
```
e2e/
├── fixtures/          # 테스트 데이터
│   └── test-data.ts
├── pages/            # Page Object Model
│   ├── BasePage.ts
│   └── ChatPage.ts
├── helpers/          # 헬퍼 함수
│   ├── auth.ts
│   └── performance.ts
├── tests/            # 테스트 파일
│   ├── p0/          # P0 Critical (9개)
│   ├── p1/          # P1 High (6개)
│   └── p2/          # P2 Medium (2개)
└── utils/            # 유틸리티
    └── custom-reporter.ts
```

**Page Object Model**:
- `BasePage`: 기본 페이지 클래스
- `ChatPage`: 채팅 화면 페이지 객체

**헬퍼 함수**:
- `ensureAuthenticated()`: Firebase 익명 인증 확인
- `skipOnboarding()`: 온보딩 스킵
- `measurePerformance()`: 성능 측정
- `waitForSave()`: 저장 대기 및 성능 측정

**테스트 픽스처**:
- `EMOTIONS`: 감정 타입 상수
- `TEST_MESSAGES`: 테스트 메시지
- `PERFORMANCE_TARGETS`: 성능 목표값

### 3. P0 기능 테스트 (9개) ✅

| 파일 | 기능 | 시나리오 수 |
|------|------|------------|
| `feat-001-checkin.spec.ts` | Day/Night Mode 체크인 | 4개 |
| `feat-002-realtime-sync.spec.ts` | 실시간 데이터 동기화 | 2개 |
| `feat-003-ai-persona.spec.ts` | AI 페르소나 기반 대화 | 2개 |
| `feat-011-onboarding.spec.ts` | 온보딩 | 2개 |
| `feat-012-persona-settings.spec.ts` | AI 페르소나 설정 | 1개 |
| `feat-013-bibliotherapy.spec.ts` | Bibliotherapy | 1개 |
| `feat-015-journey-viz.spec.ts` | 감정 여정 시각화 | 2개 |
| `feat-016-monitor.spec.ts` | 실시간 모니터 | 1개 |
| `feat-017-conversations.spec.ts` | 대화 저장/삭제 | 1개 |

### 4. P1 기능 테스트 (6개) ✅

| 파일 | 기능 | 시나리오 수 |
|------|------|------------|
| `feat-004-gamification.spec.ts` | 게이미피케이션 | 2개 |
| `feat-005-journal.spec.ts` | 기록 관리 | 2개 |
| `feat-006-search-filter.spec.ts` | 기록 검색/필터 | 2개 |
| `feat-007-reports.spec.ts` | 주간/월간 리포트 | 2개 |
| `feat-009-micro-action.spec.ts` | 마이크로 액션 | 2개 |
| `feat-014-immersion.spec.ts` | 감각적 몰입 및 사회적 연대 | 2개 |

### 5. P2 기능 테스트 (2개) ✅

| 파일 | 기능 | 시나리오 수 |
|------|------|------------|
| `feat-008-safety.spec.ts` | 안전망 시스템 | 2개 |
| `feat-010-reminders.spec.ts` | 리마인드 설정 | 2개 |

### 6. data-testid 속성 추가 ✅

다음 컴포넌트에 `data-testid` 추가:
- `DayMode.tsx`: `data-testid="day-mode"`
- `NightMode.tsx`: `data-testid="night-mode"`
- `EmotionSelectModal.tsx`: 
  - `data-testid="emotion-modal"`
  - `data-testid="emotion-{id}"` (각 감정 버튼)
  - `data-testid="intensity-slider"`

**추가 작업 필요**:
- 온보딩 관련 컴포넌트
- 타임라인 및 기록 관리 컴포넌트
- 리포트 컴포넌트
- 기타 UI 요소들

### 7. CI/CD 통합 ✅

**파일**: `.github/workflows/e2e-tests.yml`

- GitHub Actions 워크플로우 생성
- Push 및 PR 시 자동 실행
- P0, P1 테스트 순차 실행
- 테스트 리포트 아티팩트 업로드

### 8. 리포팅 및 모니터링 ✅

**파일**: `e2e/utils/custom-reporter.ts`

- 커스텀 리포터 구현
- JSON 형식 결과 저장 (`e2e-summary.json`)
- 통과/실패 통계 자동 집계

---

## 사용 방법

### 로컬 개발 환경에서 테스트 실행

1. **Playwright 설치**:
```bash
npm install
npx playwright install --with-deps
```

2. **전체 테스트 실행**:
```bash
npm run test:e2e
```

3. **UI 모드로 테스트 (디버깅)**:
```bash
npm run test:e2e:ui
```

4. **특정 우선순위 테스트만**:
```bash
npm run test:e2e:p0  # Critical 테스트만
npm run test:e2e:p1  # High 테스트만
npm run test:e2e:p2  # Medium 테스트만
```

5. **리포트 확인**:
```bash
npm run test:e2e:report
```

### Production 환경 테스트

기본적으로 `https://iness-mlog.web.app`를 대상으로 테스트합니다.

로컬 dev 서버 테스트가 필요한 경우:
```bash
# 1. Dev 서버 실행
npm run dev

# 2. 다른 터미널에서 테스트 실행
npm run test:e2e
```

---

## 다음 단계

### 1. 나머지 컴포넌트에 data-testid 추가

다음 컴포넌트들에 `data-testid` 속성을 추가해야 합니다:

**온보딩 컴포넌트**:
- `OnboardingFlow.tsx`
- `WelcomeScreen.tsx`
- `InitialAssessment.tsx`
- `GoalSetting.tsx`
- `PersonalizationSettings.tsx`
- `TutorialGuide.tsx`

**기록 관리 컴포넌트**:
- `JournalTimeline.tsx`
- `ConversationCard.tsx`
- `JournalSearch.tsx`

**리포트 컴포넌트**:
- `WeeklyReport.tsx`
- `MonthlyReport.tsx`
- `MonthlyRetrospective.tsx`
- `MonitorDashboard.tsx`

**기타 UI 컴포넌트**:
- 모든 버튼, 입력 필드, 모달에 적절한 `data-testid` 추가

### 2. 테스트 실행 및 디버깅

```bash
# UI 모드로 테스트를 하나씩 실행하며 디버깅
npm run test:e2e:ui

# 실패하는 테스트 확인
npm run test:e2e:p0 -- --reporter=list
```

### 3. 스크린샷 및 비디오 확인

테스트 실패 시 자동으로 생성되는 스크린샷과 비디오를 확인:
- `test-results/` 디렉토리
- `e2e-report/` 디렉토리

### 4. 성능 목표 검증

각 테스트의 성능 목표 달성 여부 확인:
- 저장 피드백: P95 < 800ms
- AI 응답: P95 < 8초
- 체크인 완료: P95 < 45초

### 5. CI/CD 파이프라인 활성화

1. GitHub Repository에 코드 푸시
2. Actions 탭에서 워크플로우 확인
3. PR 생성 시 자동 테스트 실행 확인

---

## 검증 기준

각 테스트는 다음 기준으로 검증합니다:

1. **UI 요소 존재 및 가시성**: 모든 필수 UI 요소가 표시되는지
2. **성능 목표 달성**: 저장 < 800ms, AI 응답 < 8초
3. **플로우차트 순서 일치**: PRD 플로우차트와 실제 흐름 일치
4. **에러 처리 적절성**: 네트워크 오류 등 예외 상황 처리
5. **네트워크 오류 복구**: 오프라인 모드 및 재연결 시나리오
6. **접근성**: ARIA 레이블 및 키보드 네비게이션

---

## 트러블슈팅

### Playwright 브라우저 설치 문제
```bash
npx playwright install chromium
npx playwright install webkit
npx playwright install firefox
```

### 타임아웃 오류
`playwright.config.ts`에서 타임아웃 증가:
```typescript
use: {
  timeout: 30000, // 기본값에서 증가
}
```

### Firebase 인증 오류
`e2e/helpers/auth.ts`의 대기 시간 조정:
```typescript
await page.waitForTimeout(3000); // 2000에서 증가
```

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-20 | 초안 작성 및 구축 완료 |
