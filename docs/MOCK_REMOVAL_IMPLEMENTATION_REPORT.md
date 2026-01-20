# Mock 데이터 제거 및 실제 구현 리포트

**작성일:** 2026-01-20
**작성자:** Claude Code Agent

---

## Task 0: 현황 스냅샷

### 1. Mock 사용 파일 목록

| 파일 경로 | 사용하는 Mock 데이터 | 상태 |
|-----------|---------------------|------|
| `App.tsx` | `INITIAL_TIMELINE` | Phase 0에서 제거 예정 |
| `src/contexts/AppContext.tsx` | `INITIAL_TIMELINE` | Phase 0에서 제거 예정 |
| `components/ContentGallery.tsx` | `MOCK_CONTENTS`, `MOODS`, `TREND_DATA` | Phase 0에서 제거 예정 |
| `components/JournalView.tsx` | `RESILIENCE_DATA` | Phase 0에서 제거 예정 |
| `components/ReportView.tsx` | `RADAR_DATA`, `AREA_DATA`, `SADNESS_ACTIVITIES`, `COMMUNITY_INSIGHTS` | Phase 1에서 제거 예정 |

### 2. Firestore 컬렉션 및 userId 필드 정합

| 컬렉션 | userId 필드 | 인덱스 | 상태 |
|--------|------------|--------|------|
| `conversations` | ✅ 있음 | ✅ userId+updatedAt | 정상 |
| `messages` | ✅ 있음 | ✅ userId+conversationId+timestamp | 정상 |
| `emotions` | ✅ 있음 | ✅ userId+timestamp, userId+modeAtTime+timestamp | 정상 |
| `diaries` | ✅ 있음 | ✅ userId+date | 정상 |
| `contents` | ✅ 있음 | ✅ userId+createdAt | 정상 |
| `timeline` | ✅ 있음 | ✅ userId+date | 정상 |
| `userProfiles` | ✅ 있음 | - | 정상 |
| `weeklyReports` | ✅ 있음 | ✅ userId+weekStartDate | 정상 |
| `monthlyReports` | ✅ 있음 | ✅ userId+year+month | 정상 |

### 3. 현재 빌드 상태

```
Frontend Build: ✅ 성공 (7.16s)
Functions Build: ✅ 성공
```

### 4. Mock Import 검색 결과 (작업 전)

```
$ grep -r "from .*mock" --include="*.tsx" --include="*.ts"

App.tsx:20:import { INITIAL_TIMELINE } from './src/mock/data';
components/ContentGallery.tsx:22:import { MOCK_CONTENTS, MOODS, TREND_DATA } from '../src/mock/data';
components/JournalView.tsx:23:import { RESILIENCE_DATA } from '../src/mock/data';
components/ReportView.tsx:16:import { RADAR_DATA, AREA_DATA } from '../src/mock/data';
components/ReportView.tsx:17:import { SADNESS_ACTIVITIES, COMMUNITY_INSIGHTS } from '../src/mock/insightData';
src/contexts/AppContext.tsx:11:import { INITIAL_TIMELINE } from '../mock/data';
```

---

## Mock 제거 전략

**선택된 방식: Option B (단계적 제거)**

- **Phase 0:** AppContext, ContentGallery, JournalView에서 Mock 제거
- **Phase 1:** ReportView Mock 제거 (Task 6에서 처리)

**이유:**
- ReportView의 RADAR_DATA, AREA_DATA는 BigQuery 연동 또는 감정 데이터 집계 로직이 필요
- SADNESS_ACTIVITIES, COMMUNITY_INSIGHTS는 사용자 데이터 기반 추천 시스템 구현 필요
- 이를 Phase 1에서 처리하면 빌드 안정성 유지 가능

---

## Phase 0 구현 체크리스트

### Task 1: 타임라인 실데이터 전환

- [ ] `upsertTimelineEntry()` 함수 추가 (firestore.ts)
- [ ] `deleteTimelineEntryById()` 함수 추가 (firestore.ts)
- [ ] Day 체크인 시 timeline 생성 로직 연동
- [ ] Night 체크인 시 timeline 생성 로직 연동
- [ ] `useAuthUser` 훅 생성
- [ ] AppContext에서 INITIAL_TIMELINE 제거
- [ ] AppContext에서 useRealtimeTimeline 사용
- [ ] 대화 삭제 시 timeline 동기 삭제

### Task 2: ContentGallery Mock 제거

- [ ] `saveContentToFirestore()` 함수 추가
- [ ] ContentGallery에서 contents 컬렉션 실시간 로드
- [ ] 생성된 콘텐츠 Firestore 저장
- [ ] MOCK_CONTENTS import 제거

### Task 3: 차트 데이터 Mock 제거

- [ ] `useEmotionChartData` 훅 생성
- [ ] ContentGallery TREND_DATA 대체
- [ ] JournalView RESILIENCE_DATA 대체

### Task 4: Mock 파일 정리

- [ ] Phase 0 완료 후 남은 mock 의존성 확인
- [ ] ReportView 제외 모든 mock import 제거 확인

---

## Phase 1 구현 체크리스트

### Task 5: Bibliotherapy 세션 구현

- [ ] PoemCard onClick 지원 추가
- [ ] ContentPoems navigate 연동
- [ ] BibliotherapySession 채팅 UI 구현
- [ ] AI 호출 연동 (generateChatbotResponse 사용)
- [ ] 위기 감지 연동
- [ ] 대화 저장 연동

### Task 6: ReportView 실데이터화

- [ ] weeklyReports/monthlyReports Firestore 조회 구현
- [ ] RADAR_DATA 대체 (감정 데이터 집계)
- [ ] AREA_DATA 대체 (주간 추세 계산)
- [ ] SADNESS_ACTIVITIES 대체 (감정별 추천 시스템)
- [ ] COMMUNITY_INSIGHTS 대체 또는 플레이스홀더
- [ ] src/mock/* 완전 삭제

### Task 7: 위기 감지 자동 전환 표준화

- [ ] Day/Night/Bibliotherapy 모든 모드에서 동일 규칙 적용
- [ ] high/critical → /safety 자동 이동
- [ ] medium → 안내 토스트 + CTA
- [ ] window.location.href → navigate 변경

---

## Phase 2 구현 체크리스트

### Task 8: 감정 기록 내보내기

- [ ] DataExport.tsx 페이지 생성
- [ ] 라우트 추가
- [ ] exportUserData() 수정 (diaries orderBy 버그 수정)
- [ ] JSON/CSV 다운로드 구현

### Task 9: 게이미피케이션 기초

- [ ] XP/레벨 계산 로직 구현
- [ ] userProfiles.xp, userProfiles.level 필드 추가
- [ ] 체크인/액션 완료 시 XP 적립
- [ ] UI 표시

### Task 10: 리마인드 설정

- [ ] 알림 설정 UI 구현
- [ ] userProfiles.preferences 저장
- [ ] FCM 연동 코드 + 문서 (플레이스홀더)

---

## 작업 후 검증 명령

```bash
# Frontend 빌드
npm run build

# Functions 빌드
npm --prefix functions run build

# Mock import 검색 (Phase 0 완료 후)
grep -r "from .*mock" --include="*.tsx" --include="*.ts" src/ components/ App.tsx

# 예상 결과 (Phase 0 완료 후):
# components/ReportView.tsx만 남아야 함
```

---

## 변경 파일 요약 (작업 후 업데이트)

| 파일 | 변경 내용 | 상태 |
|------|----------|------|
| `src/services/firestore.ts` | timeline 쓰기/삭제 함수 추가 | 진행중 |
| `src/hooks/useAuthUser.ts` | 신규 생성 | 진행중 |
| `src/hooks/useEmotionChartData.ts` | 신규 생성 | 대기 |
| `src/contexts/AppContext.tsx` | Mock 제거, 실시간 데이터 사용 | 대기 |
| `components/ContentGallery.tsx` | Mock 제거, Firestore 연동 | 대기 |
| `components/JournalView.tsx` | Mock 제거, 차트 데이터 훅 사용 | 대기 |
| `src/pages/chat/BibliotherapySession.tsx` | 실제 구현 | Phase 1 |
| `components/ReportView.tsx` | Mock 제거 | Phase 1 |

---

*이 문서는 작업 진행에 따라 업데이트됩니다.*
