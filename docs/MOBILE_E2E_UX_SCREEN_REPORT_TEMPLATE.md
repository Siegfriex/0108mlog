---
title: "모바일 E2E UX Screen Report"
version: "1.0"
lastUpdated: "2026-01-20"
scope:
  baseUrl: "https://iness-mlog.web.app"
  viewport: "390x844"
  theme: "Day (mode_override=day)"
artifacts:
  screenshotRoot: "mobile-audit/<runId>/"
  manifest: "mobile-audit/<runId>/manifest.json"
  console: "mobile-audit/<runId>/console.json"
  network: "mobile-audit/<runId>/network.json"
  metrics: "mobile-audit/<runId>/metrics.json"
---

## 실행 요약
- **캡처 런 ID**: `<runId>`
- **캡처 시각**: `<startedAt> ~ <finishedAt>`
- **총 화면 수**: `<N>` (성공 `<ok>` / 실패 `<fail>`)
- **콘솔 에러**: `<count>` (Top 3: `<...>`)
- **네트워크 실패**: `<count>` (Top 3: `<...>`)

## 읽는 법(스코어링/우선순위)
- **P0(Critical)**: 플로우 차단/데이터 손실/접근성 심각(조작 불가, 내용 확인 불가)
- **P1(High)**: 핵심 UX 저하(가독성/탭 전환/입력/피드백/스크롤) 또는 브랜드 일관성 붕괴
- **P2(Medium)**: 완성도/일관성 개선(간격/타이포/그림자/모션 등)
- **P3(Low)**: 선택적 개선(미세한 폴리시, 애니메이션 미세 조정)

## 화면별 리포트(필수 템플릿)

### [TAB] - [SCREEN NAME]
- **URL**: `<baseUrl><path>`
- **스크린샷**: `mobile-audit/<runId>/<tab>/<file>.png`
- **런타임 메타**: `manifest.json`의 `screens[].ok/error/warnings` 참조

#### 1) 현재 상태 요약(1~3문장)
- `<현재 사용자에게 보이는 핵심 상태를 요약>`

#### 2) 정량 체크(가능한 것만, 근거는 metrics.json)
- **Touch target(권장 ≥44px)**:
  - `<element>`: `<w>x<h>` px (PASS/FAIL)
- **Typography(권장 본문 ≥14~16px)**:
  - `<element>`: font-size `<n>px` (PASS/FAIL)
- **Safe-area / 키보드 겹침**:
  - `<관찰>` (PASS/FAIL)

#### 3) 이슈 리스트(P0~P3)
| Priority | 영역 | 문제(증상) | 사용자 영향 | 재현 조건 | 개선안(UX) | 코드 타겟(후보) | 검증 기준(재캡처) |
|---|---|---|---|---|---|---|---|
| P? | Layout | … | … | … | … | `src/...` | … |

#### 4) 디자인 개선안(체크리스트)
- **Layout**: spacing(좌우/상하), max-width, 스크롤 영역, sticky/header/footer, safe-area
- **Typography**: 크기/줄간격/컬러 대비/위계(h1~caption)
- **Interactive**: 버튼 크기·간격·disabled/active/press feedback, focus-visible
- **Color**: 대비(4.5:1), 브랜드 토큰 일관성, 감정 컬러 일관성
- **Motion**: 전환/로딩/모달 표시/리스트 모션의 과도함/부족함
- **State**: Empty/Loading/Error/Offline 상태, 재시도 UX, 토스트/피드백

#### 5) 개선 코드(필요 시)
> 기존 코드 인용은 CODE REFERENCES 포맷을 사용하고, “새 제안”은 markdown code block으로 작성.

#### 6) 테스트 플랜(재캡처)
- [ ] 동일 run 설정(동일 viewport/동일 baseUrl)에서 재캡처
- [ ] 해당 화면에서 `P0/P1` 이슈가 스크린샷 기준으로 해결됐는지 확인
- [ ] 콘솔/네트워크 오류 변화 확인

---

## 탭별 묶음 요약(선택)
### Onboarding
- **Top P0/P1**: …
- **공통 패턴**: …

### Chat
- **Top P0/P1**: …
- **공통 패턴**: …

### Journal / Reports / Content / Profile / Safety
- 동일 포맷

---

## 우선순위 로드맵(권장)
- **P0**: `<1~n>` (예상시간 `<x>`)
- **P1**: `<1~n>` (예상시간 `<x>`)
- **P2**: `<1~n>` (예상시간 `<x>`)
- **P3**: `<1~n>` (예상시간 `<x>`)

