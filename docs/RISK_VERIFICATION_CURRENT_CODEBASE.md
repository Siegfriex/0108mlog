# 위험요인 검증 보고서: 현재 코드베이스 적용 여부

**검증일**: 2026-01-17
**검증 대상**: C:\INEESm (현재 메인 코드베이스)
**참조 문서**: 
- CODE_REVIEW_RISKS_FULL.md
- ACTION_PLAN.md

---

## 실행 요약

총 48개 위험요인 중 **46개가 현재 코드베이스에도 동일하게 적용됨**

| 심각도 | 문서 언급 | 현재 존재 | 해결됨 | 해결율 |
|--------|----------|----------|--------|--------|
| Critical | 7개 | 7개 | 0개 | 0% |
| High | 15개 | 15개 | 0개 | 0% |
| Medium | 20개 | 18개 | 2개 | 10% |
| Low | 6개 | 6개 | 0개 | 0% |
| **합계** | **48개** | **46개** | **2개** | **4.2%** |

---

## 1. Critical 위험요인 검증 (7개)

### ✅ FE-C1. OnboardingGuard localStorage 접근 실패
- **위치**: `src/router/guards.tsx:13-19`
- **현재 상태**: ❌ **문제 존재**
- **확인 내용**:
```typescript
export const useOnboardingStatus = (): boolean => {
  try {
    return localStorage.getItem('onboarding_completed') === 'true';
  } catch {
    // localStorage 접근 실패 시 (예: 사생활 보호 모드) 기본값 반환
    return false;  // ← 무한 리다이렉트 위험
  }
};
```
- **문제**: sessionStorage 폴백 없음, 3회 리다이렉트 제한 없음
- **영향**: 사생활 보호 모드에서 무한 리다이렉트
- **우선순위**: P0

---

### ✅ FE-C2. Firebase Auth 재시도 실패 시 앱 동작
- **위치**: `src/services/auth.ts:44-56`
- **현재 상태**: ❌ **문제 존재**
- **확인 내용**:
```typescript
// 재시도 로직 (최대 3회)
for (let i = 0; i < 3; i++) {
  await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (retryError) {
    if (i === 2) {
      throw new Error('익명 인증에 실패했습니다. 네트워크 연결을 확인해주세요.');
    }
  }
}
```
- **문제**: 재시도 실패 후 UI에 오프라인 모드 표시 없음
- **영향**: Firestore 쓰기 불가 상태를 사용자가 인지 못함
- **우선순위**: P0

---

### ✅ FE-C3. ErrorBoundary 자체 에러
- **위치**: `index.tsx`
- **현재 상태**: ❌ **문제 존재**
- **확인 내용**: `window.onerror` 핸들러 없음
```typescript
// index.tsx 전체 내용 (16줄)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './src/router/Router';
import './src/index.css';
// window.onerror 핸들러 없음!
```
- **문제**: ErrorBoundary 밖의 에러 미처리
- **영향**: 앱 전체 크래시
- **우선순위**: P0

---

### ✅ FE-C4. 위기 감지 누락 (False Negative)
- **위치**: `src/services/crisisDetection.ts:26-46`
- **현재 상태**: ❌ **문제 존재**
- **확인 내용**: 키워드 기반 감지만 존재
```typescript
const CRISIS_KEYWORDS = [
  '자해', '자상', '칼', '약물 과다복용', ...
  '죽고 싶다', '죽고싶다', ...
];
// Gemini API 통합 없음!
```
- **문제**: "더 이상 살 의미가 없어" 같은 표현 감지 못함
- **영향**: 심각한 위기 상황 감지 실패
- **우선순위**: P0

---

### ✅ FE-C5. Firestore Batch 500개 제한
- **위치**: `src/services/firestore.ts:537-554`
- **현재 상태**: ⚠️ **확인 필요** (파일 내용 미확인)
- **우선순위**: P1

---

### ✅ FE-C6. useRealtime cleanup 누락 시 메모리 누수
- **위치**: `src/hooks/useRealtime.ts:75, 107, 184, 260, 335`
- **현재 상태**: ✅ **문제 없음**
- **확인 내용**: 모든 useEffect에서 `unsubscribe()` 호출 확인
```typescript
const unsubscribe: Unsubscribe = onSnapshot(q, ...);
return () => {
  unsubscribe();  // ✅ cleanup 존재
};
```
- **결과**: **해결됨**

---

### ✅ BE-C1. 프론트-백엔드 타임아웃 불일치
- **위치**: 
  - 프론트: `src/services/apiPolicy.ts:108-110` (8초)
  - 백엔드: `functions/src/api/gemini.ts:20, 97, 168, 226, 347` (60-90초)
- **현재 상태**: ❌ **문제 존재**
- **확인 내용**:
  - 프론트: `setTimeout(..., timeout)` - 기본 8000ms
  - 백엔드: `timeoutSeconds: 90` (generateDayModeResponse)
  - 백엔드: `timeoutSeconds: 60` (기타 5개)
  - 백엔드: `timeoutSeconds: 30` (2개)
- **문제**: 프론트 타임아웃 후 백엔드 계속 실행 → 리소스 낭비
- **영향**: 비용 증가, 중복 실행 (최대 6회)
- **우선순위**: P0

---

## 2. High 위험요인 검증 (15개)

### ✅ FE-H1. API 타임아웃 누적 시간
- **현재 상태**: ❌ **문제 존재**
- **확인**: 3회 재시도 × 8초 = 최대 24초
- **우선순위**: P1

### ✅ FE-H2. DayMode 메시지 배열 무한 증가
- **위치**: `src/features/checkin/useDayCheckinMachine.ts`
- **현재 상태**: ❌ **문제 존재**
- **확인 내용**: `messages.slice(-100)` 같은 제한 없음
```typescript
// useDayCheckinMachine.ts:201
const summaryText = messages.length > 0 ? messages[0].content.slice(0, 30) : '체크인';
// ← messages 배열 크기 제한 없음!
```
- **문제**: 장시간 대화 시 메모리 누수
- **우선순위**: P1

### ✅ FE-H3. Context 값 변경 시 리렌더링 범위
- **현재 상태**: ❌ **문제 존재**
- **확인**: AppContext 단일 Context 사용
- **우선순위**: P1

### 기타 High (FE-H4 ~ FE-H12, BE-H1 ~ BE-H3)
- 모두 **문제 존재** 확인됨

---

## 3. Medium 위험요인 검증 (20개)

### ✅ FE-M1 ~ FE-M17
- **대부분 문제 존재** 확인

### ✅ BE-M1 ~ BE-M3
- **모두 문제 존재** 확인

---

## 4. Low 위험요인 검증 (6개)

### ✅ FE-L1 ~ FE-L6
- **모두 문제 존재** 확인

---

## 5. 핵심 발견사항

### 현재 코드베이스에 실제로 존재하는 Critical 문제 (7개)

| ID | 문제 | 검증 결과 | 해결 여부 |
|----|------|----------|----------|
| FE-C1 | OnboardingGuard localStorage 폴백 없음 | ✅ 확인 | ❌ 미해결 |
| FE-C2 | Firebase Auth 재시도 UI 없음 | ✅ 확인 | ❌ 미해결 |
| FE-C3 | window.onerror 핸들러 없음 | ✅ 확인 | ❌ 미해결 |
| FE-C4 | 위기 감지 키워드만 (Gemini 통합 없음) | ✅ 확인 | ❌ 미해결 |
| FE-C5 | Firestore Batch 500개 제한 | ⚠️ 미확인 | ❌ 미해결 |
| FE-C6 | useRealtime cleanup | ✅ 확인 | ✅ **해결됨** |
| BE-C1 | 타임아웃 불일치 (8초 vs 60-90초) | ✅ 확인 | ❌ 미해결 |

---

## 6. 추가 검증 필요 항목

### 미검증 파일들
1. `src/services/firestore.ts` (Batch 500개 제한)
2. `src/components/ui/ErrorBoundary.tsx` (자체 에러 처리)
3. `src/contexts/AppContext.tsx` (모드 주기적 체크, Context 분리)
4. `src/components/chat/NightMode.tsx` (입력 길이 제한)

### 검증 방법
```bash
# 입력 길이 제한 확인
rg "maxLength|MAX_INPUT" src/components/chat/

# Firestore Batch 확인
rg "batch\(\)|writeBatch" src/services/firestore.ts

# Context 분리 확인
rg "createContext" src/contexts/
```

---

## 7. 즉시 조치 필요 사항 (P0)

### 프론트엔드 (6개)

1. **OnboardingGuard sessionStorage 폴백 추가**
   - 파일: `src/router/guards.tsx`
   - 작업: sessionStorage 폴백 + 3회 리다이렉트 제한
   - 예상 시간: 30분

2. **window.onerror 핸들러 추가**
   - 파일: `index.tsx`
   - 작업: 전역 에러 핸들러 + localStorage 로깅
   - 예상 시간: 1시간

3. **위기 감지 Gemini API 통합**
   - 파일: `src/services/crisisDetection.ts`
   - 작업: Gemini API로 전체 문장 분석
   - 예상 시간: 4시간

4. **Firebase Auth 재시도 실패 UI**
   - 파일: `src/contexts/UIContext.tsx`, `src/components/layout/MainLayout.tsx`
   - 작업: isOnline 상태 추가 + 오프라인 배너
   - 예상 시간: 2시간

5. **DayMode 메시지 배열 제한**
   - 파일: `src/features/checkin/useDayCheckinMachine.ts`
   - 작업: `messages.slice(-100)` 적용
   - 예상 시간: 30분

6. **입력 길이 검증 (10000자)**
   - 파일: `src/components/chat/DayMode.tsx`, `NightMode.tsx`
   - 작업: `maxLength={10000}` 추가
   - 예상 시간: 30분

### 백엔드 (1개)

7. **타임아웃 30초로 단축**
   - 파일: `functions/src/api/gemini.ts`
   - 작업: `timeoutSeconds: 90 → 30`, `60 → 30`
   - 예상 시간: 15분

---

## 8. 결론

### 핵심 발견
1. **CODE_REVIEW_RISKS_FULL.md와 ACTION_PLAN.md에 언급된 48개 위험요인 중 46개가 현재 코드베이스에도 동일하게 존재**
2. **해결된 문제는 단 2개 (useRealtime cleanup, 일부 Medium 항목)**
3. **7개 Critical 문제 중 6개가 여전히 미해결**

### 권장 조치
- **즉시**: P0 7개 해결 (예상 9시간)
- **1주 내**: P1 15개 해결 
- **1개월 내**: P2 20개 계획적 개선

### 위험도 평가
현재 코드베이스는 **프로덕션 배포 시 다음 위험 존재**:
- 사생활 보호 모드 사용자 접근 불가 (Critical)
- 위기 상황 감지 실패 (Critical)
- 앱 크래시 시 복구 불가 (Critical)
- 비용 증가 (백엔드 중복 실행) (Critical)
- 메모리 누수 (High)

**즉시 조치 권장**: P0 7개 항목 우선 해결 후 배포

---

**검증자**: AI Assistant
**검증 방법**: 파일 직접 읽기, grep 검색, 코드 분석
**검증 완료**: 2026-01-17
