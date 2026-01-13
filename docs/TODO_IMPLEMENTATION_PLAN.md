# TODO 구현 계획서

**작성 일자**: 2026-01-13  
**프로젝트**: INEESm  
**상태**: 진행 중

---

## 개요

본 문서는 코드베이스 내 남아있는 TODO 주석을 정리하고, 각 항목의 구현 우선순위와 계획을 제시합니다.

---

## 완료된 TODO 항목

다음 TODO 항목들은 이미 구현이 완료되었습니다:

### Phase 4: 문서화 및 TODO 구현 (완료)

| 파일 | 라인 | 내용 | 상태 |
|------|------|------|------|
| `src/pages/chat/ChatMain.tsx` | 74 | Firestore 저장 로직 추가 | ✅ 완료 |
| `src/pages/profile/ProfileMain.tsx` | 48 | Firestore 업데이트 로직 추가 | ✅ 완료 |
| `src/pages/profile/ProfileMain.tsx` | 52 | Firestore 삭제 로직 추가 | ✅ 완료 |
| `src/pages/profile/ProfileMain.tsx` | 59 | Firestore 전체 삭제 로직 추가 | ✅ 완료 |
| `src/pages/profile/Conversations.tsx` | 36 | Firestore 삭제 로직 | ✅ 완료 |
| `src/pages/profile/Conversations.tsx` | 44 | Firestore 전체 삭제 로직 | ✅ 완료 |
| `src/pages/chat/PersonaSetup.tsx` | 23 | Firestore 저장 | ✅ 완료 |
| `src/pages/profile/PersonaSettings.tsx` | 34 | Firestore 저장 | ✅ 완료 |
| `src/pages/journal/JournalSearch.tsx` | 20 | Firestore 검색 로직 구현 | ✅ 완료 |
| `src/pages/profile/Privacy.tsx` | 50 | 데이터 내보내기 로직 | ✅ 완료 |
| `src/pages/profile/Privacy.tsx` | 58 | 전체 데이터 삭제 로직 | ✅ 완료 |
| `src/pages/journal/ConversationDetail.tsx` | 20 | useRealtimeMessages hook으로 메시지 가져오기 | ✅ 완료 |

**구현된 함수**:
- `src/services/firestore.ts`:
  - `deleteConversation(conversationId: string): Promise<void>`
  - `deleteAllConversations(): Promise<void>`
  - `searchConversations(searchQuery: string, options?): Promise<FirestoreConversation[]>`
  - `updateUserPersona(persona: CoachPersona): Promise<void>`
  - `exportUserData(): Promise<Blob>`
  - `deleteAllUserData(): Promise<void>`

---

## 남아있는 TODO 항목

### 우선순위: 높음

#### 1. Firebase Crashlytics 연동

**위치**: `src/utils/error.ts:39`

**현재 상태**:
```typescript
// TODO: Firebase Crashlytics 연동
// if (typeof window !== 'undefined' && window.crashlytics) {
//   window.crashlytics.recordError(error);
// }
```

**구현 계획**:
1. Firebase Crashlytics SDK 설치
   ```bash
   npm install @firebase/crashlytics
   ```
2. Firebase 초기화 파일에 Crashlytics 추가 (`src/config/firebase.ts`)
3. `logError` 함수에서 Crashlytics에 에러 기록
4. 개발 환경에서는 비활성화, 프로덕션에서만 활성화

**예상 작업 시간**: 2-3시간  
**의존성**: Firebase 프로젝트 설정 완료 필요

**참고 문서**:
- [Firebase Crashlytics 문서](https://firebase.google.com/docs/crashlytics/get-started?platform=web)

---

### 우선순위: 중간

#### 2. 자세히 보기 페이지 구현

**위치**: `src/components/consent/ConsentModal.tsx:172`

**현재 상태**:
```typescript
// TODO: 자세히 보기 페이지로 이동
window.open('/profile/privacy', '_blank');
```

**구현 계획**:
1. 개인정보 처리방침 상세 페이지 생성 (`src/pages/profile/PrivacyPolicy.tsx`)
2. 라우트 추가 (`src/router/routes.tsx`)
3. ConsentModal에서 라우팅으로 변경 (새 창 대신)
4. 개인정보 처리방침 내용 작성 (법적 요구사항 반영)

**예상 작업 시간**: 4-6시간  
**의존성**: 법무팀 검토 필요 (개인정보 처리방침 내용)

**구현 예시**:
```typescript
const handleViewDetails = () => {
  navigate('/profile/privacy/policy');
};
```

---

### 우선순위: 낮음 (향후 확장)

#### 3. Firebase Auth 연동

**위치**: `src/router/guards.tsx:42`

**현재 상태**:
```typescript
// TODO: Firebase Auth 연동 시 구현
// const user = useAuth();
// if (!user) return <Navigate to="/login" replace />;
```

**구현 계획**:
1. 현재는 Anonymous Auth만 사용 중
2. 향후 이메일/소셜 로그인 추가 시 구현
3. `useAuth` Hook 생성 (`src/hooks/useAuth.ts`)
4. AuthGuard 컴포넌트 활성화
5. 로그인 페이지 생성 (`src/pages/auth/Login.tsx`)

**예상 작업 시간**: 8-12시간  
**의존성**: 인증 전략 수립 필요 (이메일, Google, Apple 등)

**참고**:
- 현재 `ensureAnonymousAuth()`로 Anonymous Auth 사용 중
- 실제 사용자 인증이 필요할 때까지 보류 가능

---

#### 4. 프리미엄 구독 확인 로직

**위치**: `src/router/guards.tsx:52`

**현재 상태**:
```typescript
// TODO: 프리미엄 구독 확인 로직 구현
// const isPremium = usePremiumStatus();
// if (!isPremium) return <Navigate to="/profile/subscribe" replace />;
```

**구현 계획**:
1. 프리미엄 구독 모델 설계 (Firestore 또는 Stripe 연동)
2. `usePremiumStatus` Hook 생성 (`src/hooks/usePremiumStatus.ts`)
3. PremiumGuard 컴포넌트 활성화
4. 구독 페이지 생성 (`src/pages/profile/Subscribe.tsx`)
5. 결제 시스템 연동 (Stripe, Google Play Billing 등)

**예상 작업 시간**: 16-24시간  
**의존성**: 
- 비즈니스 모델 확정 필요
- 결제 시스템 선택 및 연동
- 법적 요구사항 검토 (구독 약관 등)

**참고**:
- 현재는 무료 서비스로 운영 중
- 프리미엄 기능이 필요할 때까지 보류 가능

---

## 구현 우선순위 매트릭스

| TODO 항목 | 우선순위 | 복잡도 | 비즈니스 영향 | 예상 작업 시간 |
|-----------|----------|--------|---------------|----------------|
| Firebase Crashlytics 연동 | 높음 | 낮음 | 높음 (에러 추적) | 2-3시간 |
| 자세히 보기 페이지 | 중간 | 중간 | 중간 (법적 요구) | 4-6시간 |
| Firebase Auth 연동 | 낮음 | 높음 | 낮음 (현재 불필요) | 8-12시간 |
| 프리미엄 구독 확인 | 낮음 | 높음 | 낮음 (향후 기능) | 16-24시간 |

---

## 다음 단계

### 즉시 구현 권장
1. **Firebase Crashlytics 연동** - 프로덕션 에러 추적을 위해 필수

### 단기 계획 (1-2주)
2. **자세히 보기 페이지** - 개인정보 처리방침 법적 요구사항 충족

### 중장기 계획 (향후)
3. **Firebase Auth 연동** - 실제 사용자 인증 필요 시
4. **프리미엄 구독 확인** - 프리미엄 기능 출시 시

---

## TODO 주석 관리 가이드

### TODO 주석 작성 규칙
- **형식**: `// TODO: [간단한 설명]`
- **위치**: 구현이 필요한 코드 바로 위 또는 옆
- **내용**: 무엇을 해야 하는지 명확히 기술

### TODO 주석 제거 시점
- 구현 완료 시 즉시 제거
- 또는 이슈 트래커로 이관 후 제거

### 이슈 트래커 연동 권장
- GitHub Issues, Jira 등에 이슈 생성
- TODO 주석에 이슈 번호 링크 추가
- 예: `// TODO: #123 Firebase Crashlytics 연동`

---

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-01-13 | 초기 문서 작성, 완료된 TODO 12개 정리, 남은 TODO 4개 정리 | Claude Code |

---

## 참고 자료

- [Firebase Crashlytics 문서](https://firebase.google.com/docs/crashlytics/get-started?platform=web)
- [Firebase Authentication 문서](https://firebase.google.com/docs/auth)
- [개인정보 보호법](https://www.law.go.kr/법령/개인정보보호법) (한국)
- [Stripe 결제 연동 가이드](https://stripe.com/docs/payments)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2026-01-13
