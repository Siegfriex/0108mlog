# PRD 플로우 노드 → 코드 매핑표

**작성일**: 2025-01-15  
**목적**: PRD 플로우차트의 각 노드를 실제 코드 위치와 매핑하여 구현 상태 파악

---

## 플로우 1: 온보딩

| PRD 노드 | 현재 코드 위치 | 구현 상태 | 문제점/개선 필요 |
|---|---|---|---|
| **CheckFirstVisit** | `src/router/guards.tsx` - `useOnboardingStatus()` | ✅ 구현됨 | localStorage 기반, Firestore 동기화 없음 |
| **OnboardingStart** | `src/components/layout/OnboardingLayout.tsx` | ✅ 구현됨 | - |
| **Step1 (환영 화면)** | `src/components/onboarding/WelcomeScreen.tsx` | ⚠️ 부분 구현 | **스킵 버튼 존재** (PRD: 스킵 불가) |
| **ExitConfirm** | 없음 | ❌ 미구현 | 첫 단계 뒤로가기 시 종료 확인 모달 필요 |
| **Step2 (권한 요청)** | `src/components/onboarding/PermissionRequest.tsx` | ✅ 구현됨 | - |
| **NotifPermission/LocationPermission** | `src/components/onboarding/PermissionRequest.tsx` | ✅ 구현됨 | 에러 처리 경로 부족 |
| **Step3 (초기 평가)** | `src/components/onboarding/InitialAssessment.tsx` | ✅ 구현됨 | - |
| **Step4 (목표 설정)** | `src/components/onboarding/GoalSetting.tsx` | ✅ 구현됨 | - |
| **Step5 (개인화 설정)** | `src/components/onboarding/PersonalizationSetup.tsx` | ✅ 구현됨 | - |
| **Step6 (튜토리얼)** | `src/components/onboarding/TutorialGuide.tsx` | ✅ 구현됨 | - |
| **ErrorHandler** | 없음 | ❌ 미구현 | 네트워크 오류/권한 오류/저장 실패 처리 없음 |
| **Retry** | 없음 | ❌ 미구현 | 재시도 로직 없음 |

**핵심 이슈**:
- `WelcomeScreen`에 `onSkip` prop이 전달되어 스킵 가능 (PRD 위반)
- 첫 단계 뒤로가기 시 종료 확인 모달 없음
- 에러 처리 경로 전혀 없음

---

## 플로우 2: 대화형 일일 감정 체크인

### Day Mode

| PRD 노드 | 현재 코드 위치 | 구현 상태 | 문제점/개선 필요 |
|---|---|---|---|
| **EntryPoint** | `src/pages/chat/ChatMain.tsx` | ✅ 구현됨 | 알림/위젯 진입 경로 없음 |
| **ModeCheck** | `src/pages/chat/ChatMain.tsx` (line 64) | ⚠️ 부분 구현 | **자동 모드 전환 로직 없음** (시간대 기반) |
| **DayMode** | `components/DayMode.tsx` | ✅ 구현됨 | - |
| **DayGreeting** | `components/DayMode.tsx` (line 100-106) | ✅ 구현됨 | - |
| **EmotionSelect** | `src/components/ui/EmotionSelectModal.tsx` | ✅ 구현됨 | 자유 입력(NLP) 경로 없음 |
| **ChipSelect** | `components/DayMode.tsx` (line 124-127) | ✅ 구현됨 | - |
| **FreeInput/NLPProcess** | 없음 | ❌ 미구현 | 자연어 입력 → 감정 파싱 없음 |
| **IntensitySelect** | `components/DayMode.tsx` (line 62) | ✅ 구현됨 | - |
| **SmartTagCheck** | `src/components/checkin/SmartContextTag.tsx` | ✅ 구현됨 | - |
| **TagRecommend** | `src/components/checkin/SmartContextTag.tsx` | ✅ 구현됨 | - |
| **MemoCheck/MemoInput** | 없음 | ❌ 미구현 | 한 줄 메모 입력 단계 없음 |
| **SaveProcess** | `components/DayMode.tsx` (line 200-251) | ⚠️ 부분 구현 | **재시도 로직 없음** (최대 3회) |
| **Validation** | 없음 | ❌ 미구현 | 입력 검증 단계 없음 |
| **FirestoreSave** | `components/DayMode.tsx` (line 227-245) | ✅ 구현됨 | 오프라인 처리 없음 |
| **SaveRetry** | 없음 | ❌ 미구현 | 재시도 로직 없음 |
| **ImmediateFeedback** | `components/DayMode.tsx` (line 100-106) | ✅ 구현됨 | - |
| **AsyncInsight** | `components/DayMode.tsx` (line 168) | ✅ 구현됨 | - |
| **InsightCheck** | `components/DayMode.tsx` (line 161-169) | ⚠️ 부분 구현 | **8초 타임아웃만 있음, 재시도/백오프 없음** |
| **InsightTimeout** | `components/DayMode.tsx` (line 163) | ⚠️ 부분 구현 | 폴백 메시지만, 재시도 옵션 없음 |
| **InsightRetry** | 없음 | ❌ 미구현 | 재시도 로직 없음 |
| **ActionRecommend** | `components/DayMode.tsx` (line 256-267) | ✅ 구현됨 | - |
| **ActionCard** | `components/DayMode.tsx` (line 65) | ✅ 구현됨 | - |
| **ActionChoice** | `src/components/actions/ActionFeedback.tsx` | ✅ 구현됨 | "내일로" 옵션 없음 |
| **MicroCoach** | 없음 | ❌ 미구현 | 2턴 마이크로 코치 없음 |
| **XPGain/LevelCheck** | 없음 | ❌ 미구현 | XP/레벨업 시스템 없음 |
| **OfflineMode** | 없음 | ❌ 미구현 | IndexedDB 오프라인 큐 없음 |
| **CrisisDetect** | 없음 | ❌ 미구현 | 위기 감지 알고리즘 없음 |

### Night Mode

| PRD 노드 | 현재 코드 위치 | 구현 상태 | 문제점/개선 필요 |
|---|---|---|---|
| **NightMode** | `components/NightMode.tsx` | ✅ 구현됨 | - |
| **NightGreeting** | `components/NightMode.tsx` (line 95-103) | ✅ 구현됨 | - |
| **NightEmotionSelect** | `components/NightMode.tsx` (line 107-160) | ✅ 구현됨 | - |
| **NightIntensity** | `components/NightMode.tsx` (line 143-154) | ✅ 구현됨 | - |
| **DaySummaryCheck** | 없음 | ❌ 미구현 | Day Mode 요약 자동 인입 없음 |
| **AutoFill** | 없음 | ❌ 미구현 | Day Mode 요약 자동 인입 없음 |
| **DiaryWrite** | `components/NightMode.tsx` (line 163-189) | ✅ 구현됨 | - |
| **NightSave** | `components/NightMode.tsx` (line 41-78) | ⚠️ 부분 구현 | **타임아웃/재시도/폴백 없음** |
| **LetterGenerate** | `components/NightMode.tsx` (line 45) | ✅ 구현됨 | - |
| **LetterShow** | `components/NightMode.tsx` (line 192-231) | ✅ 구현됨 | - |
| **UserReaction** | 없음 | ❌ 미구현 | 피드백 수집 없음 |

**핵심 이슈**:
- ModeResolver가 시간대 기반 자동 전환을 하지 않음
- Day Mode: 메모 입력, 재시도, 오프라인, 위기 감지 없음
- Night Mode: Day 요약 자동 인입, 타임아웃/재시도, 피드백 수집 없음

---

## 플로우 3: 위기 상황 대응

| PRD 노드 | 현재 코드 위치 | 구현 상태 | 문제점/개선 필요 |
|---|---|---|---|
| **TriggerType** | 없음 | ❌ 미구현 | 위기 감지 트리거 없음 |
| **KeywordDetect** | 없음 | ❌ 미구현 | 키워드 감지 알고리즘 없음 |
| **IntensityCheck** | 없음 | ❌ 미구현 | 강도 임계값 체크 없음 |
| **UserRequest** | `components/SafetyLayer.tsx` (line 13) | ✅ 구현됨 | 수동 접근만 가능 |
| **CrisisConfirm** | 없음 | ❌ 미구현 | 위기 신호 확인 로직 없음 |
| **AutoSwitch** | 없음 | ❌ 미구현 | 자동 전환 없음 |
| **SafetyScreen** | `src/pages/safety/SafetyMain.tsx` | ⚠️ 부분 구현 | 오버레이 구조, PRD 라우트 구조와 불일치 |
| **SafetyCheck** | `components/SafetyLayer.tsx` (line 108-135) | ✅ 구현됨 | **30초 타임아웃 없음** |
| **SafeConfirm** | `components/SafetyLayer.tsx` | ⚠️ 부분 구현 | ReturnOriginal 복귀 경로 없음 |
| **NeedHelp** | `components/SafetyLayer.tsx` (line 120-124) | ✅ 구현됨 | - |
| **CopingTools** | `components/SafetyLayer.tsx` (line 73-105) | ✅ 구현됨 | - |
| **HotlineSelect** | `components/SafetyLayer.tsx` (line 18-71) | ✅ 구현됨 | - |
| **ReturnOriginal** | 없음 | ❌ 미구현 | returnTo 기반 복귀 없음 |
| **OfflineTools** | 없음 | ❌ 미구현 | 오프라인 대처 도구 번들 없음 |

**핵심 이슈**:
- 위기 감지 알고리즘 전혀 없음
- 자동 전환 없음
- Safety 라우트가 오버레이 구조로 되어 있어 PRD의 페이지 구조와 불일치
- ReturnOriginal 복귀 경로 없음

---

## 공통/인프라

| PRD 요구사항 | 현재 코드 위치 | 구현 상태 | 문제점/개선 필요 |
|---|---|---|---|
| **Anonymous Auth** | 없음 | ❌ 미구현 | Firestore 쓰기 전제 조건 미충족 |
| **Consent Gate** | 없음 | ❌ 미구현 | 대화/일기 저장 동의 게이트 없음 |
| **API Retry/Backoff** | 없음 | ❌ 미구현 | 중앙화된 재시도/백오프 정책 없음 |
| **Network Error Detection** | 없음 | ❌ 미구현 | 네트워크 오류 패턴 감지 없음 |
| **CSS Variables** | 없음 | ❌ 미구현 | CSS 변수 파일 없음 |
| **Z-index System** | `src/design/tokens.ts` (line 176-186) | ⚠️ 정의만 있음 | **실제 사용 0%** (하드코딩) |
| **Unit Standardization** | 없음 | ❌ 미구현 | rem 기반 단위 시스템 없음 |

---

## 구현 상태 요약

### ✅ 완전 구현 (약 40%)
- 온보딩 기본 플로우 (6단계)
- Day/Night Mode 기본 UI
- Safety 기본 UI

### ⚠️ 부분 구현 (약 30%)
- 온보딩: 스킵 정책, 에러 처리 부족
- Day Mode: 타임아웃만 있고 재시도 없음
- Night Mode: Day 요약 자동 인입 없음
- Safety: 자동 전환, 복귀 경로 없음

### ❌ 미구현 (약 30%)
- 위기 감지 알고리즘
- 오프라인 처리 (IndexedDB)
- 재시도/백오프 정책
- Anonymous Auth
- Consent Gate
- CSS 변수 시스템
- Z-index 표준화

---

## 우선순위별 개선 계획

### Critical (즉시 필요)
1. Anonymous Auth 부트스트랩
2. Consent Gate
3. 위기 감지 알고리즘
4. CSS 변수 시스템

### High (1차 스프린트)
5. ModeResolver (시간대 기반)
6. API Retry/Backoff 정책
7. 온보딩 ExitConfirm
8. Day Mode: 재시도, 메모 입력
9. Night Mode: Day 요약 자동 인입, 타임아웃/재시도
10. Safety: ReturnOriginal 복귀

### Medium (2차 스프린트)
11. 오프라인 처리 (IndexedDB)
12. Z-index 마이그레이션
13. 단위 표준화 (rem)
14. XP/레벨업 시스템
15. MicroCoach
