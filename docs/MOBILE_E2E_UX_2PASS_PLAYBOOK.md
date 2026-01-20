---
title: "모바일 E2E UX 2-Pass 운영 플레이북"
version: "1.0"
lastUpdated: "2026-01-20"
---

## 목적
배포 웹(Production)을 기준으로 **1차(현상 캡처/이슈 도출) → 개선 적용 → 2차(재캡처/비교 검증)**를 반복 가능하게 운영합니다.

## 공통 전제(고정)
- **BASE_URL**: `https://iness-mlog.web.app`
- **Viewport**: 390x844
- **Mode**: `localStorage.mode_override = 'day'` (러너가 주입)
- **Onboarding**:
  - 온보딩 캡처 그룹: `onboarding_completed=false`
  - 메인 캡처 그룹: `onboarding_completed=true`
- **Consent Modal**: 러너가 로컬 스토리지에 revoked 상태를 주입하여 “첫 방문 동의 모달”로 인한 캡처 변동을 최소화

## Pass 1 — 현상 캡처(스냅샷 확보)
### 1) 캡처 실행
- 온보딩(6샷):

```bash
node e2e/mobile-audit/run-mobile-audit.mjs --runId=pass1-onboarding --onlyGroup=onboarding --headless=true
```

- 메인 탭(탭별 분할 권장):

```bash
node e2e/mobile-audit/run-mobile-audit.mjs --runId=pass1-chat --onlyTab=chat --headless=true
node e2e/mobile-audit/run-mobile-audit.mjs --runId=pass1-journal --onlyTab=journal --headless=true
node e2e/mobile-audit/run-mobile-audit.mjs --runId=pass1-reports --onlyTab=reports --headless=true
node e2e/mobile-audit/run-mobile-audit.mjs --runId=pass1-content --onlyTab=content --headless=true
node e2e/mobile-audit/run-mobile-audit.mjs --runId=pass1-profile --onlyTab=profile --headless=true
node e2e/mobile-audit/run-mobile-audit.mjs --runId=pass1-safety --onlyTab=safety --headless=true
```

### 2) 결과 수집(체크)
- 각 run 폴더: `mobile-audit/<runId>/`
  - `manifest.json`: 성공/실패/경고
  - `console.json`: 콘솔 에러/워닝
  - `network.json`: 실패 요청
  - `metrics.json`: 기본 UI 메트릭(타겟 요소 size/font)

### 3) 리포트 작성
- 템플릿 복제 후 작성:
  - `docs/MOBILE_E2E_UX_SCREEN_REPORT_TEMPLATE.md`
  - → `docs/MOBILE_E2E_UX_SCREEN_REPORT_YYYYMMDD.md`
- 각 화면 섹션에 최소:
  - **스크린샷 경로**
  - **P0~P3 이슈 테이블**
  - **재캡처 검증 기준**

## Pass 2 — 개선 검증(재캡처/비교)
### 1) 개선 적용
- P0/P1부터 코드 수정(컴포넌트 단위)
- 변경 후 최소 검증:

```bash
npm run build
```

### 2) 재캡처 실행(동일 조건 유지)
- Pass 1과 동일한 명령을 `runId=pass2-...`로 실행

### 3) 비교/판정(사람이 하는 체크 + 자동 체크 혼합)
- **사람이 하는 체크**: 스크린샷 Before/After 비교(레이아웃/가독성/터치/상태)
- **자동 체크**: `manifest.json`의 오류 감소, `console.json`/`network.json`의 실패 감소, `metrics.json`의 타겟 수치 개선(≥44px, ≥14~16px 등)

## 운영 팁(실패 줄이기)
- AI 응답/네트워크 의존 화면은 “**사용자 메시지 전송 직후**” 캡처를 기본으로 두고, “AI 응답 캡처”는 `strictWaits:false`로 운영
- 온보딩의 `다음`처럼 중복되는 버튼은 manifest에서 `index`를 지정해 안정화
- 탭별 실행으로 병렬 충돌(브라우저 인스턴스 과다) 방지

