# 버그 수정 보고서 - 2026-01-20

## 수정 완료된 문제

### 1. 감정 선택 후 반복 문제 ✅

**문제**: "대화 시작하기" 버튼을 눌러도 감정 선택 모달이 계속 표시됨

**원인**: `showEmotionModal` 조건이 채팅 상태를 고려하지 않음

**수정 위치**: `src/components/chat/DayMode.tsx` 177번 라인

**수정 내용**:
```typescript
// Before
const showEmotionModal = machine.isEmotionModalOpen || machine.isEmotionSelected;

// After
const showEmotionModal = (machine.isEmotionModalOpen || machine.isEmotionSelected) && !showChat;
```

**효과**: 채팅 중일 때는 감정 모달이 표시되지 않음

---

### 2. Day Mode 레이아웃 문제 ✅

**문제**: 화면이 위로 붕 떠있는 문제 (h-screen w-screen 사용)

**원인**: `fixed inset-0`와 `h-screen w-screen` 충돌

**수정 위치**: `src/components/chat/DayMode.tsx` 222번 라인

**수정 내용**:
```typescript
// Before
className="flex flex-col h-screen w-screen bg-gradient-to-b from-white/60 to-white/40"

// After
className="flex flex-col h-full w-full bg-gradient-to-b from-white/60 to-white/40"
```

**효과**: MainLayout의 `fixed inset-0` 컨테이너 내에서 올바르게 채움

---

### 3. Night Mode 레이아웃 문제 ✅

**문제**: Night Mode에서도 동일한 레이아웃 문제

**원인**: `h-full`이 부모 컨테이너 높이를 제대로 참조하지 않음

**수정 위치**: `src/components/chat/NightMode.tsx` 102번 라인

**수정 내용**:
```typescript
// Before
<div className="w-full max-w-4xl mx-auto h-full flex flex-col px-4 text-white relative overflow-hidden">

// After
<div className="w-full max-w-4xl mx-auto flex-1 flex flex-col px-4 text-white relative overflow-hidden">
```

**효과**: flex 컨테이너에서 올바르게 공간 차지

---

## API 엔드포인트 점검 결과

### Firebase Functions 배포 상태

**배포 완료**: ✅ (2026-01-20 방금 완료)

| 함수명 | 상태 | 리전 | 타임아웃 | 메모리 |
|--------|------|------|----------|--------|
| generateDayModeResponse | ✅ ACTIVE | asia-northeast3 | 30s | 512Mi |
| generateNightModeLetter | ✅ ACTIVE | asia-northeast3 | 30s | 512Mi |
| generateMonthlyNarrative | ✅ ACTIVE | asia-northeast3 | 30s | 512Mi |
| generateHealingContent | ✅ ACTIVE | asia-northeast3 | 30s | 1024Mi |
| generateChatbotResponse | ✅ ACTIVE | asia-northeast3 | 30s | 512Mi |
| generateMicroAction | ✅ ACTIVE | asia-northeast3 | 30s | 512Mi |
| generateTimelineAnalysis | ✅ ACTIVE | asia-northeast3 | 30s | 512Mi |

### 클라이언트 호출 확인

**파일**: `src/services/ai/gemini.ts`

모든 Functions가 올바르게 호출됨:
- ✅ `generateDayModeResponse` - Day Mode 채팅
- ✅ `generateNightModeLetter` - Night Mode 편지
- ✅ `generateMonthlyNarrative` - 월간 리포트
- ✅ `generateHealingContent` - 콘텐츠 큐레이션
- ✅ `generateChatbotResponse` - AI 챗봇
- ✅ `generateMicroAction` - 마이크로 액션
- ✅ `generateTimelineAnalysis` - 타임라인 분석

**호출 헬퍼**: `src/services/functions.ts`
- ✅ 리전: `asia-northeast3` (서울)
- ✅ 에러 처리: 정상
- ✅ 타임아웃: 정상

---

## 수정 파일 목록

1. `src/components/chat/DayMode.tsx`
   - 감정 모달 표시 조건 수정 (177번 라인)
   - 레이아웃 클래스 수정 (222번 라인)

2. `src/components/chat/NightMode.tsx`
   - 레이아웃 클래스 수정 (102번 라인)

---

## 테스트 필요 항목

- [ ] 감정 선택 후 "대화 시작하기" 클릭 시 모달이 사라지는지 확인
- [ ] Day Mode 채팅 화면이 올바르게 표시되는지 확인
- [ ] Night Mode 화면이 올바르게 표시되는지 확인
- [ ] 챗봇 기능 정상 작동 확인
- [ ] 모든 AI Functions 정상 호출 확인

---

## 배포 상태

- ✅ 빌드 성공 (6.08초)
- ⏳ Hosting 배포 대기

**배포 명령어**:
```bash
firebase deploy --only hosting
```

---

## 참고사항

- 모든 Functions는 최신 버전으로 배포 완료 (timeout 30초 통일)
- Auth 경쟁조건 문제는 이전에 해결 완료
- 레이아웃 문제는 `fixed inset-0` 컨테이너 내에서 `h-full`/`flex-1` 사용으로 해결
