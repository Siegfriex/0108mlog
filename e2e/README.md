# E2E 자동화 테스트

마음로그 V5.0의 End-to-End 자동화 테스트 스위트입니다.

## 빠른 시작

### 1. 설치

```bash
# 의존성 설치 (처음 한 번만)
npm install

# Playwright 브라우저 설치
npx playwright install --with-deps
```

### 2. 테스트 실행

```bash
# 전체 테스트 실행
npm run test:e2e

# UI 모드로 실행 (디버깅에 유용)
npm run test:e2e:ui

# 브라우저를 보면서 실행
npm run test:e2e:headed

# 특정 우선순위만 실행
npm run test:e2e:p0  # Critical 기능
npm run test:e2e:p1  # High 기능
npm run test:e2e:p2  # Medium 기능
```

### 3. 리포트 확인

```bash
# HTML 리포트 열기
npm run test:e2e:report
```

## 디렉토리 구조

```
e2e/
├── fixtures/          # 테스트 데이터 및 상수
│   └── test-data.ts
├── pages/            # Page Object Model
│   ├── BasePage.ts
│   ├── ChatPage.ts
│   ├── OnboardingPage.ts
│   ├── JournalPage.ts
│   └── ReportsPage.ts
├── helpers/          # 헬퍼 함수
│   ├── auth.ts
│   └── performance.ts
├── tests/            # 테스트 파일
│   ├── p0/          # P0 Critical 테스트 (9개)
│   │   ├── feat-001-checkin.spec.ts
│   │   ├── feat-002-realtime-sync.spec.ts
│   │   ├── feat-003-ai-persona.spec.ts
│   │   ├── feat-011-onboarding.spec.ts
│   │   ├── feat-012-persona-settings.spec.ts
│   │   ├── feat-013-bibliotherapy.spec.ts
│   │   ├── feat-015-journey-viz.spec.ts
│   │   ├── feat-016-monitor.spec.ts
│   │   └── feat-017-conversations.spec.ts
│   ├── p1/          # P1 High 테스트 (5개)
│   │   ├── feat-004-gamification.spec.ts
│   │   ├── feat-005-journal.spec.ts
│   │   ├── feat-006-search-filter.spec.ts
│   │   ├── feat-007-reports.spec.ts
│   │   ├── feat-009-micro-action.spec.ts
│   │   └── feat-014-immersion.spec.ts
│   └── p2/          # P2 Medium 테스트 (2개)
│       ├── feat-008-safety.spec.ts
│       └── feat-010-reminders.spec.ts
└── utils/            # 유틸리티
    ├── custom-reporter.ts
    └── test-helpers.ts
```

## 테스트 커버리지

### P0 Critical 기능 (9개)
- ✅ FEAT-001: Day/Night Mode 체크인
- ✅ FEAT-002: 실시간 데이터 동기화
- ✅ FEAT-003: AI 페르소나 기반 대화
- ✅ FEAT-011: 온보딩
- ✅ FEAT-012: AI 페르소나 설정
- ✅ FEAT-013: Bibliotherapy
- ✅ FEAT-015: 감정 여정 시각화
- ✅ FEAT-016: 실시간 모니터
- ✅ FEAT-017: 대화 저장/삭제

### P1 High 기능 (6개)
- ✅ FEAT-004: 게이미피케이션
- ✅ FEAT-005: 기록 관리
- ✅ FEAT-006: 기록 검색/필터
- ✅ FEAT-007: 주간/월간 리포트
- ✅ FEAT-009: 마이크로 액션
- ✅ FEAT-014: 감각적 몰입 및 사회적 연대

### P2 Medium 기능 (2개)
- ✅ FEAT-008: 안전망 시스템
- ✅ FEAT-010: 리마인드 설정

**총 테스트 수**: 17개 기능, 약 35+ 시나리오

## 성능 목표 검증

각 테스트는 다음 성능 목표를 검증합니다:

- 저장 피드백: P95 < 800ms
- AI 인사이트: P95 < 8초
- 체크인 완료: P95 < 45초
- 실시간 동기화: 지연 < 1초

## 트러블슈팅

### 타임아웃 오류
테스트가 타임아웃되는 경우, `playwright.config.ts`에서 타임아웃 증가:

```typescript
use: {
  timeout: 60000, // 60초로 증가
}
```

### Firebase 인증 오류
`e2e/helpers/auth.ts`의 대기 시간 조정:

```typescript
await page.waitForTimeout(3000); // 2000에서 증가
```

### 브라우저 설치 문제
```bash
npx playwright install chromium
```

## CI/CD

GitHub Actions 워크플로우가 설정되어 있습니다:
- `.github/workflows/e2e-tests.yml`
- Push 및 PR 시 자동 실행
- P0, P1 테스트 순차 실행
- 테스트 리포트 자동 업로드

## 참고 문서

- [E2E_VERIFICATION_PLAN.md](../docs/E2E_VERIFICATION_PLAN.md) - 검증 계획서
- [E2E_AUTOMATION_SETUP_GUIDE.md](../docs/E2E_AUTOMATION_SETUP_GUIDE.md) - 구축 가이드
- [PRD.md](../docs/PRD.md) - 제품 요구사항 명세서
