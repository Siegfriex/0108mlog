# MaumLog V5.0 프론트엔드 구조

## 최종 확정일: 2026-01-13

---

## 디렉토리 구조

```
src/
├── common/              # 공통 모듈 (상수, 유틸리티)
├── components/          # UI 컴포넌트
│   ├── actions/         # 마이크로 액션 컴포넌트
│   ├── chat/            # 채팅 관련 컴포넌트 (DayMode, NightMode)
│   ├── checkin/         # 체크인 컴포넌트
│   ├── consent/         # 동의 모달 컴포넌트
│   ├── journal/         # 저널 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트 (MainLayout)
│   ├── onboarding/      # 온보딩 플로우
│   ├── profile/         # 프로필 컴포넌트
│   ├── reports/         # 리포트 컴포넌트
│   ├── safety/          # 안전망 컴포넌트
│   └── ui/              # 공통 UI 컴포넌트
│       ├── Button.tsx
│       ├── EmotionOrb.tsx
│       ├── EmotionSelectModal.tsx
│       ├── ErrorBoundary.tsx
│       ├── GlassCard.tsx
│       ├── LoadingSpinner.tsx
│       ├── NoiseOverlay.tsx
│       ├── SkipLink.tsx
│       └── TabBar.tsx
├── config/              # 설정 파일
│   └── firebase.ts      # Firebase 초기화
├── contexts/            # React Context
│   ├── AppContext.tsx   # 앱 전역 상태
│   └── UIContext.tsx    # UI 상태
├── data/                # 정적 데이터
│   └── microActions.ts  # 마이크로 액션 데이터
├── design/              # 디자인 시스템
├── features/            # 기능별 모듈 (State Machine)
│   ├── checkin/         # 체크인 상태 머신
│   │   ├── dayMachine.ts
│   │   ├── nightMachine.ts
│   │   ├── useDayCheckinMachine.ts
│   │   └── useNightCheckinMachine.ts
│   └── onboarding/      # 온보딩 상태 머신
│       ├── onboardingMachine.ts
│       └── useOnboardingMachine.ts
├── hooks/               # 커스텀 훅
│   ├── useFocusRestore.ts
│   ├── useFocusTrap.ts
│   ├── useKeyboardNavigation.ts
│   ├── useRealtime.ts
│   └── useTouchGestures.ts
├── mock/                # 목업 데이터
├── pages/               # 페이지 컴포넌트
│   ├── chat/
│   │   ├── ChatMain.tsx
│   │   ├── PersonaSetup.tsx
│   │   └── BibliotherapySession.tsx
│   ├── content/
│   │   ├── ContentMain.tsx
│   │   ├── ContentPoems.tsx
│   │   ├── ContentMeditations.tsx
│   │   ├── ContentMusic.tsx
│   │   └── ContentImmersion.tsx
│   ├── journal/
│   │   ├── JournalTimeline.tsx
│   │   ├── JournalDiary.tsx
│   │   ├── JournalJourney.tsx
│   │   ├── JournalSearch.tsx
│   │   └── ConversationDetail.tsx
│   ├── profile/
│   │   ├── ProfileMain.tsx
│   │   ├── PersonaSettings.tsx
│   │   ├── DayNightSettings.tsx
│   │   ├── Settings.tsx
│   │   ├── Privacy.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   └── Conversations.tsx
│   ├── reports/
│   │   ├── WeeklyReport.tsx
│   │   ├── MonthlyReport.tsx
│   │   ├── MonthlyRetrospective.tsx
│   │   └── MonitorDashboard.tsx
│   └── safety/
│       ├── SafetyMain.tsx
│       ├── CrisisSupport.tsx
│       └── CopingTools.tsx
├── router/              # 라우팅
│   ├── Router.tsx
│   └── routes.tsx
├── services/            # 서비스 레이어
│   ├── ai/
│   │   └── gemini.ts    # Gemini API 래퍼
│   ├── apiPolicy.ts     # API 정책 (재시도, 폴백)
│   ├── consent.ts       # 동의 관리
│   ├── firestore.ts     # Firestore 서비스
│   ├── functions.ts     # Firebase Functions 호출
│   └── modeResolver.ts  # Day/Night 모드 결정
├── styles/              # 전역 스타일
│   └── index.css
├── test/                # 테스트 설정
├── types/               # 타입 정의
│   └── firestore.ts     # Firestore 타입
└── utils/               # 유틸리티
    ├── error.ts         # 에러 처리
    └── style/           # 스타일 유틸리티
```

---

## 핵심 아키텍처

### 1. 상태 관리

| 레이어 | 기술 | 용도 |
|--------|------|------|
| **전역 상태** | React Context | AppContext (mode, persona), UIContext (chatbot, immersive) |
| **복잡한 상태** | XState (State Machine) | 온보딩, 체크인 플로우 |
| **서버 상태** | Firebase Firestore | 실시간 데이터 동기화 |

### 2. 컴포넌트 구조

```
pages/          → 라우트별 진입점 (데이터 페칭)
  ↓
components/     → 재사용 가능한 UI 조각
  ↓
ui/             → 원자적 UI 요소 (Button, Card, Modal)
```

### 3. 서비스 레이어

```
pages → services/ai/gemini.ts → services/functions.ts → Firebase Functions
                              ↘ services/apiPolicy.ts (재시도/폴백)
```

---

## 접근성 (A11y)

| 기능 | 파일 | 설명 |
|------|------|------|
| **Skip Link** | `components/ui/SkipLink.tsx` | 메인 콘텐츠로 바로가기 |
| **Focus Trap** | `hooks/useFocusTrap.ts` | 모달 포커스 가두기 |
| **Focus Restore** | `hooks/useFocusRestore.ts` | 모달 닫힘 시 포커스 복원 |
| **Keyboard Navigation** | `hooks/useKeyboardNavigation.ts` | 그리드 키보드 탐색 |
| **ARIA Labels** | 모든 인터랙티브 요소 | 스크린 리더 지원 |

---

## 수정된 파일 (2026-01-13)

| 파일 | 수정 내용 |
|------|----------|
| `src/config/firebase.ts` | Crashlytics 제거 (웹 미지원) |
| `src/utils/error.ts` | Crashlytics 의존성 제거 |
| `src/services/firestore.ts` | persona, dayModeStartTime 타입 추가 |
| `src/services/ai/gemini.ts` | 반환 타입 수정 (fallback?.fallback) |
| `src/services/apiPolicy.ts` | 제네릭 타입 단언 추가 |
| `src/types/firestore.ts` | MICRO_ACTION_LOGS 상수 추가 |
| `src/router/routes.tsx` | MonitorDashboardPage 이름 수정 |
| `src/hooks/useFocusTrap.ts` | React import 추가 |
| `src/hooks/useTouchGestures.ts` | React import 추가 |
| `components/ReportView.tsx` | recharts 불필요한 import 제거 |
| `App.tsx` | setImmersive → setIsImmersive |
| `firestore.rules` | consent 권한 규칙 추가 |

---

## 빌드 정보

- **빌드 도구**: Vite 6.4.1
- **번들 크기** (gzip):
  - `index.js`: 106.81 KB
  - `firebase.js`: 95.54 KB
  - `recharts.js`: 114.93 KB
  - `framer-motion.js`: 40.22 KB
  - `react-vendor.js`: 11.43 KB
- **총 빌드 시간**: ~7초

---

## 배포 URL

- **프로덕션**: https://iness-mlog.web.app
- **Firebase Console**: https://console.firebase.google.com/project/iness-mlog

---

## 남은 TypeScript 오류 (비차단)

다음 오류들은 빌드에 영향을 주지 않으나, 향후 정리 권장:

1. `ErrorBoundary.tsx` - 클래스 컴포넌트 타입 (React 18 호환)
2. `JourneyView.tsx` - unknown 타입 맵핑
3. `useRealtime.ts` - Firestore 쿼리 제약 타입
4. `nightMachine.ts` - 이벤트 타입 비교
5. `mock/data.ts` - 모듈 경로

---

**문서 작성자**: Claude Opus 4.5
**최종 검증**: 빌드 성공, 배포 완료
