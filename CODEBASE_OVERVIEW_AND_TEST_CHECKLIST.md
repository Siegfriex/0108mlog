# 마음로그 V5.0 코드베이스 개요 및 테스트 체크리스트

**작성일**: 2026-01-17
**브랜치**: 0109
**상태**: 배포 직전 (테스트 대기)

---

## 1. 프로젝트 구조 요약

### 1.1 프론트엔드 (src/)

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── chat/           # Day/Night Mode 체크인
│   ├── journal/        # 기록/일기 조회
│   ├── reports/        # 주간/월간 리포트
│   ├── content/        # 큐레이션 콘텐츠
│   ├── profile/        # 사용자 설정
│   └── safety/         # 위기 지원
│
├── components/         # 재사용 컴포넌트
│   ├── chat/           # DayMode.tsx, NightMode.tsx
│   ├── ui/             # 공통 UI (Button, GlassCard, Modal...)
│   ├── safety/         # SafetyLayer.tsx
│   └── onboarding/     # 온보딩 플로우
│
├── services/           # 비즈니스 로직
│   ├── ai/gemini.ts    # Gemini API 래퍼
│   ├── crisisDetection.ts  # 위기 감지 알고리즘
│   ├── firestore.ts    # Firestore CRUD
│   └── apiPolicy.ts    # API 정책 (재시도/폴백)
│
├── features/           # 상태 머신
│   └── checkin/        # dayMachine, nightMachine
│
├── hooks/              # 커스텀 훅
│   ├── useDayCheckinMachine.ts
│   ├── useNightCheckinMachine.ts
│   └── useMobileOptimization.ts
│
├── contexts/           # 전역 상태
│   ├── AppContext.tsx  # 앱 상태 (mode, persona)
│   └── UIContext.tsx   # UI 상태 (isOnline 등)
│
└── router/             # 라우팅
    ├── routes.tsx      # 라우트 정의
    └── guards.tsx      # 가드 (온보딩 체크)
```

### 1.2 백엔드 (functions/)

```
functions/src/
├── index.ts            # 함수 export
├── api/
│   └── gemini.ts       # Callable Functions (7개)
│       ├── generateDayModeResponse
│       ├── generateNightModeLetter
│       ├── generateMonthlyNarrative
│       ├── generateHealingContent
│       ├── generateChatbotResponse
│       ├── generateMicroAction
│       └── generateEmotionTags
│
├── services/
│   └── gemini.ts       # Gemini API 호출 로직
│
├── middleware/
│   └── performance.ts  # 성능 측정
│
└── utils/
    ├── logger.ts       # 로깅
    └── monitoring.ts   # 모니터링
```

---

## 2. 핵심 기능 플로우

### 2.1 DayMode 체크인

```
감정 선택 → 강도 설정 → 위기 감지
     ↓
AI 대화 (generateDayModeResponse)
     ↓
마이크로 액션 (generateMicroAction)
     ↓
태그 입력 → 저장 (saveConversation)
```

### 2.2 NightMode 체크인

```
감정 선택 → 강도 설정 → 위기 감지
     ↓
일기 작성 (최대 10,000자)
     ↓
Gemini 분석 → 편지 생성 (generateNightModeLetter)
     ↓
음성 플레이어 → 저장 (saveDiaryEntry)
```

### 2.3 위기 감지 시스템

```
1단계: 키워드 감지 (즉시)
     ↓ 감지 시
2단계: Gemini 정밀 검증 (FE-C4)
     ↓ 확정 시
SafetyLayer 표시 + 위기 지원 리소스
```

---

## 3. 기술 스택

| 영역 | 기술 |
|------|------|
| **프론트엔드** | React 19, TypeScript, Vite 6, Tailwind CSS |
| **상태관리** | Context API + 상태 머신 패턴 |
| **애니메이션** | Framer Motion |
| **차트** | Recharts |
| **백엔드** | Firebase Functions (Node.js) |
| **AI** | Gemini API (gemini-3-pro-preview) |
| **DB** | Firestore |
| **인증** | Firebase Authentication |

---

## 4. P0/P1 해결 현황

### 4.1 완료된 항목 (7개)

| ID | 분류 | 항목 | 파일 |
|----|------|------|------|
| FE-C1 | Critical | sessionStorage 폴백 | guards.tsx |
| FE-C2 | Critical | isOnline 상태 | UIContext.tsx |
| FE-C3 | Critical | window.onerror 핸들러 | index.tsx |
| FE-C4 | Critical | Gemini 위기 감지 통합 | crisisDetection.ts |
| FE-H2 | High | 메시지 배열 제한 100개 | dayMachine.ts |
| BE-C1 | Critical | 타임아웃 30초 | functions/gemini.ts |
| FE-H13 | High | CoachPersona 타입 확장 | types.ts |

### 4.2 자동 검증 완료 (9개)

| # | 검증 항목 | 파일:라인 |
|---|----------|----------|
| 1 | window.onerror | index.tsx:10 |
| 2 | sessionStorage 폴백 | guards.tsx:29,37,44 |
| 3 | maxLength 10000 | DayMode.tsx:38, NightMode.tsx:29 |
| 4 | slice(-100) | dayMachine.ts:215,260 |
| 5 | isOnline | UIContext.tsx |
| 6 | detectCrisisWithGemini | crisisDetection.ts:216 |
| 7 | await detectCrisis | useDayCheckinMachine.ts, useNightCheckinMachine.ts |
| 8 | 타임아웃 30초 | gemini.ts (7개 함수) |
| 9 | 함수 시그니처 | crisisDetection.ts:246 |

---

## 5. 테스트 체크리스트

### 5.1 수동 테스트 (필수 7개)

| # | 테스트 | 방법 | 예상 결과 | 상태 |
|---|--------|------|----------|------|
| 1 | **사생활 보호 모드** | Chrome 시크릿 모드 → 온보딩 3회 리다이렉트 | 3회 후 강제 통과 | ⬜ |
| 2 | **10000자 입력 제한** | DayMode/NightMode에서 10000자+ 입력 | 입력 막힘 | ⬜ |
| 3 | **오프라인 배너** | F12 → Network → Offline 체크 | 배너 표시 | ⬜ |
| 4 | **전역 에러 핸들러** | Console에서 `throw new Error('Test')` | localStorage에 로그 저장 | ⬜ |
| 5 | **위기 감지 Gemini** | "더 이상 살 의미가 없어" 입력 | SafetyLayer 표시 | ⬜ |
| 6 | **메시지 배열 제한** | 100개+ 메시지 전송 → Memory 확인 | 100개 이하 유지 | ⬜ |
| 7 | **백엔드 타임아웃** | AI 응답 시간 측정 | < 30초 | ⬜ |

### 5.2 기능 테스트 (권장)

| # | 기능 | 테스트 방법 | 상태 |
|---|------|------------|------|
| 1 | Day 체크인 전체 플로우 | 감정→대화→마이크로액션→저장 | ⬜ |
| 2 | Night 체크인 전체 플로우 | 감정→일기→편지 생성→저장 | ⬜ |
| 3 | 페르소나 설정 | 이름/MBTI/특성 변경 | ⬜ |
| 4 | 타임라인 조회 | 기록 목록 표시 | ⬜ |
| 5 | 콘텐츠 큐레이션 | 시/명상/음악 생성 | ⬜ |
| 6 | 월간 리포트 | 월간 통계 표시 | ⬜ |

### 5.3 UI/UX 테스트 (권장)

| # | 항목 | 테스트 방법 | 상태 |
|---|------|------------|------|
| 1 | 모바일 반응형 | Chrome DevTools → Mobile 뷰 | ⬜ |
| 2 | 키보드 네비게이션 | Tab 키로 이동 | ⬜ |
| 3 | 다크 모드 | Night Mode UI 확인 | ⬜ |
| 4 | 로딩 상태 | AI 응답 대기 중 스피너 | ⬜ |
| 5 | 에러 상태 | 네트워크 끊김 시 UI | ⬜ |

### 5.4 보안 테스트 (권장)

| # | 항목 | 테스트 방법 | 상태 |
|---|------|------------|------|
| 1 | XSS 방지 | `<script>alert(1)</script>` 입력 | ⬜ |
| 2 | 입력 검증 | 특수문자, 이모지 입력 | ⬜ |
| 3 | 인증 상태 | 로그아웃 후 보호된 페이지 접근 | ⬜ |

---

## 6. 배포 체크리스트

### 6.1 배포 전 확인

- [x] P0 6개 완료
- [x] P1 1개 완료
- [x] TypeScript 에러 0개
- [x] 프론트엔드 빌드 성공
- [x] 백엔드 빌드 성공
- [x] 자동 검증 9/9 통과
- [ ] **수동 테스트 7/7 통과**

### 6.2 배포 명령어

```bash
# 프론트엔드만
firebase deploy --only hosting

# 백엔드만
firebase deploy --only functions

# 전체
firebase deploy
```

### 6.3 배포 후 확인

- [ ] 프로덕션 URL 접속 확인
- [ ] 기본 플로우 테스트
- [ ] 24시간 모니터링 시작

---

## 7. 알려진 이슈

### 7.1 해결된 이슈

| 이슈 | 해결 방법 | 커밋 |
|------|----------|------|
| TypeScript TS2554 | 함수 시그니처 수정 | dab4525 |
| 타임아웃 불일치 | 모든 함수 30초로 통일 | 0aa5eb4 |
| 위기 감지 오탐지 | Gemini 2차 검증 추가 | 4467c40 |

### 7.2 미해결 이슈 (P2)

| 이슈 | 우선순위 | 비고 |
|------|----------|------|
| ESLint 미설정 | P2 | 프로젝트에 설정 필요 |
| Gemini 캐싱 | P2 | 동일 메시지 반복 호출 최적화 |
| 접근성 개선 | P2 | ARIA 레이블 추가 |

---

## 8. 테스트 환경

### 8.1 로컬 개발 서버

```
URL: http://localhost:3000
상태: ✅ 실행 중
```

### 8.2 테스트 계정

```
# Firebase 인증 사용
# 구글/이메일 로그인 지원
```

### 8.3 브라우저

- Chrome (권장)
- Firefox
- Safari
- Edge

---

## 9. 문서 목록

| 파일 | 내용 |
|------|------|
| `EXECUTION_LOG.txt` | 실행 로그 |
| `P0_EXECUTION_COMPLETE_REPORT.md` | P0 완료 보고서 |
| `TEST_RESULTS.txt` | 테스트 결과 |
| `FINAL_AUDIT_REPORT_UPDATED.md` | 감사 보고서 (보완판) |
| `STATUS_REPORT_20260117.md` | 현재 상태 보고서 |
| `CODEBASE_OVERVIEW_AND_TEST_CHECKLIST.md` | 본 문서 |

---

## 10. 요약

### 현재 상태
- **코드**: ✅ 완료 (P0 6개 + P1 1개)
- **빌드**: ✅ 성공 (프론트 + 백엔드)
- **검증**: ✅ 자동 9/9 통과
- **테스트**: ⬜ 수동 7개 대기
- **배포**: ⬜ 대기

### 다음 단계
1. **수동 테스트 7개 실행** (localhost:3000)
2. **테스트 결과 기록**
3. **배포** (firebase deploy)

---

**작성자**: Claude Opus 4.5
**생성 시점**: 2026-01-17
