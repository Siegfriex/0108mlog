# GCP API 통합 + 리스크 보완 플랜 평가 보고서

**작성일**: 2026-01-20  
**평가자**: Claude (Composer)  
**평가 방법**: 실제 코드베이스와 비교 분석

---

## 📊 평가 요약

| 평가 항목 | 점수 | 평가 |
|---------|------|------|
| **전체 타당성** | 9/10 | ✅ 매우 우수 |
| **코드베이스 일치성** | 8/10 | ⚠️ 일부 조정 필요 |
| **구현 가능성** | 9/10 | ✅ 높음 |
| **보안 강화** | 10/10 | ✅ 우수 |
| **비용 최적화** | 9/10 | ✅ 우수 |
| **문서화 품질** | 9/10 | ✅ 우수 |

**종합 평가**: ✅ **매우 우수한 플랜** (일부 기술적 조정 필요)

---

## 1. Phase 0: 기반 리스크 고정 평가

### 1.1 Firestore Rules - 실제 저장/조회 스키마 정합

**평가**: ✅ **완벽함**

**플랜 제안**:
- `saveConversation()`에 `userId` 필드 추가
- `FirestoreChatMessage` 타입에 `userId` 추가
- `useRealtimeMessages` 쿼리에 `where('userId','==',uid)` 추가
- `firestore.indexes.json`에 복합 인덱스 추가

**현재 코드베이스 상태**:
- ✅ `saveConversation()`: `userId` 누락 확인됨
- ✅ `FirestoreChatMessage` 타입: `userId` 없음
- ✅ `useRealtimeMessages`: `conversationId`만 사용
- ✅ `firestore.indexes.json`: `messages(userId, conversationId, timestamp)` 인덱스 없음

**평가 결과**: 
- **타당성**: 100% ✅
- **구현 가능성**: 높음 ✅
- **우선순위**: Critical (즉시 필요)

**개선 제안**:
```typescript
// useRealtimeMessages 쿼리 수정 (플랜보다 더 구체적)
const q = query(
  collection(db, FIRESTORE_COLLECTIONS.MESSAGES),
  where('conversationId', '==', conversationId),
  where('userId', '==', getCurrentUserId()), // ✅ 추가
  orderBy('timestamp', 'asc')
);
```

---

### 1.2 원문 저장 동의 강제 적용

**평가**: ✅ **우수함** (이전 플랜보다 더 구체적)

**플랜 제안**:
- `saveConversation()`에 `hasContentConsent` 파라미터 추가
- 동의 없으면 `content` 필드 제외하고 메타데이터만 저장

**현재 코드베이스 상태**:
- ✅ `saveDiaryEntry()`: 동의 체크 있음 (`canSaveConversation()`)
- ❌ `saveConversation()`: 동의 체크 없음

**평가 결과**:
- **타당성**: 100% ✅
- **구현 가능성**: 높음 ✅
- **접근 방식**: 이전 플랜보다 더 실용적 (메타데이터는 저장)

**개선 제안**:
```typescript
// 플랜의 접근 방식이 좋지만, 함수 시그니처는 기존과 호환 유지
export async function saveConversation(...): Promise<string | null> {
  const hasConsent = await canSaveConversation();
  
  // 동의 없으면 null 반환 (이전 플랜 방식)
  // 또는 메타데이터만 저장 (플랜 방식)
  // → 플랜 방식이 더 나음 (데이터 손실 방지)
}
```

---

### 1.3 Functions 보안/비용 보호

**평가**: ✅ **매우 우수함** (이전 플랜에 비해 대폭 강화)

**플랜 제안**:
1. 인증 필수화 (`request.auth` 체크)
2. App Check 강제 (선택)
3. 레이트리밋 체크
4. Idempotency 체크 (중복 호출 방지)

**현재 코드베이스 상태**:
- ❌ 인증 체크 없음 (`request.auth?.uid || "anonymous"`)
- ❌ App Check 없음 (`enforceAppCheck` 사용 안 함)
- ❌ 레이트리밋 없음
- ❌ Idempotency 없음

**평가 결과**:
- **타당성**: 100% ✅
- **보안 강화**: 매우 우수 ✅
- **비용 절감**: 레이트리밋 + Idempotency로 중복 호출 방지

**기술적 검토**:

#### 1.3.1 Secret Manager 방식

**플랜 제안**: `defineSecret` 사용
```typescript
const YOUTUBE_API_KEY = defineSecret('YOUTUBE_API_KEY');
```

**현재 코드베이스**: 직접 `SecretManagerServiceClient` 사용
```typescript
// functions/src/config/secrets.ts
const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({...});
```

**평가**:
- ✅ `defineSecret`이 더 간단하고 Firebase Functions v2 표준
- ⚠️ 기존 코드 마이그레이션 필요
- ✅ 권장: 점진적 마이그레이션 (새 함수는 `defineSecret`, 기존은 유지)

#### 1.3.2 Rate Limit 구현

**플랜 제안**: Firestore `_rateLimit` 컬렉션 사용

**평가**:
- ✅ 구현 간단하고 효과적
- ⚠️ Firestore 읽기/쓰기 비용 발생 (하지만 레이트리밋으로 절감 효과 큼)
- ✅ 대안: Redis/Memorystore 고려 가능 (향후 확장 시)

**개선 제안**:
```typescript
// TTL 기반 자동 정리 추가
await cacheRef.set({
  calls: [...calls, now],
  expiresAt: Timestamp.fromMillis(now + options.windowSeconds * 1000)
}, { merge: true });
```

#### 1.3.3 Idempotency 구현

**플랜 제안**: `requestId` 기반 캐싱

**평가**:
- ✅ 매우 우수한 아이디어
- ✅ 중복 호출 방지로 비용 절감
- ⚠️ 구현 복잡도: 중간 (캐시 키 관리 필요)

**개선 제안**:
```typescript
// 캐시 키 생성 개선
const idempotencyKey = `idempotency:${userId}:${functionName}:${hashRequestData(request.data)}`;

// TTL 설정 (예: 1시간)
await cacheRef.set({
  result: cached,
  expiresAt: Timestamp.fromMillis(Date.now() + 60 * 60 * 1000)
});
```

#### 1.3.4 App Check

**플랜 제안**: `enforceAppCheck: true` (선택)

**평가**:
- ✅ 보안 강화에 도움
- ⚠️ 설정 복잡도: 높음 (App Check 설정 필요)
- ✅ 권장: Phase 0 이후 단계적으로 도입

---

### 1.4 LLM timeout/retry 정책 정렬

**평가**: ✅ **우수함**

**플랜 제안**:
- FE timeout: 3초 → 20초
- 재시도: 2회로 축소

**현재 코드베이스 상태**:
- FE: 3초 timeout, 2회 재시도
- BE: 30초 timeout

**평가 결과**:
- **타당성**: 100% ✅
- **권장값**: 20초는 적절함 (BE 30초의 2/3)

**개선 제안**:
```typescript
// LLM 전용 설정 분리 (플랜 제안 좋음)
const LLM_CALL_CONFIG = {
  timeout: 20000,      // 20초
  maxRetries: 1,       // 플랜은 2회, 하지만 Idempotency 있으면 1회도 가능
  retryDelay: 1000,
};
```

---

## 2. Phase 1-4: GCP API 연동 평가

### 2.1 Phase 1: YouTube Data API 연동

**평가**: ✅ **우수함**

**플랜 제안**:
- `defineSecret` 사용
- 캐싱 전략 (24시간 TTL)
- 인증 체크 포함

**평가 결과**:
- **타당성**: 100% ✅
- **구현 가능성**: 높음 ✅
- **캐싱 전략**: 적절함 ✅

**개선 제안**:
```typescript
// 캐시 키에 userId 포함 (사용자별 캐싱)
const cacheKey = `youtube:meditation:${userId}:${mood}:${duration}`;
```

---

### 2.2 Phase 2: Custom Search API 연동

**평가**: ✅ **우수함**

**플랜 제안**:
- 시/문학 검색
- Gemini로 큐레이션 설명 생성
- 원문 복사 금지 (메타데이터만)

**평가 결과**:
- **타당성**: 100% ✅
- **저작권 고려**: 우수함 ✅
- **구현 가능성**: 높음 ✅

**개선 제안**:
```typescript
// 큐레이션 프롬프트 개선
const curationPrompt = `
다음 시/문학 검색 결과에 대해 각각 한 줄 추천 이유를 작성해주세요.
중요: 원문을 복사하지 말고, 작품의 특징과 감상 포인트만 설명하세요.
검색어: ${emotion} ${mood}
결과: ${JSON.stringify(searchResults.slice(0, 5))}
JSON 형식으로만 응답: [{"index": 0, "reason": "추천 이유"}]
`;
```

---

### 2.3 Phase 3: Gemini Grounding 강화

**평가**: ✅ **우수함**

**플랜 제안**:
- 프롬프트 구조화
- Grounding 메타데이터 방어적 파싱
- JSON 파싱 실패 시 fallback

**평가 결과**:
- **타당성**: 100% ✅
- **에러 처리**: 우수함 ✅
- **구현 가능성**: 높음 ✅

**개선 제안**:
```typescript
// JSON 파싱 fallback 개선
try {
  parsedContent = JSON.parse(extractJSON(responseText));
} catch (e) {
  logError(context, e, { phase: "json_parsing" });
  // 구조화된 fallback
  parsedContent = {
    type: 'text',
    content: responseText.substring(0, 500), // 최대 500자
    _parseError: true,
    _originalLength: responseText.length
  };
}
```

---

### 2.4 Phase 4: BigQuery 리포트 연동

**평가**: ⚠️ **부분 수정 필요**

**플랜 제안**:
- `_analytics` 컬렉션 신규 생성
- 원문(content) 적재 금지
- Scheduled Functions로 리포트 생성

**현재 코드베이스/PRD 상태**:
- PRD에는 BigQuery 직접 익스포트 언급 (`analytics.emotions` 테이블)
- 플랜은 `_analytics` 컬렉션 제안

**평가 결과**:
- **타당성**: 90% ✅ (접근 방식 차이)
- **구현 가능성**: 높음 ✅
- **개선 필요**: PRD와의 정합성 확인

**개선 제안**:

#### 옵션 A: 플랜 방식 (권장)
```typescript
// _analytics 컬렉션에 메타데이터만 저장
await db.collection('_analytics').add({
  userId,
  type: 'emotion',
  emotion: emotionData.primaryEmotion,
  intensity: emotionData.intensity,
  timestamp: serverTimestamp(),
  // content 필드 없음 ✅
});
```

**장점**:
- 원문 저장 완전 차단
- Firestore → BigQuery Export 간단
- 프라이버시 보호 강화

**단점**:
- 이중 저장 (emotions + _analytics)
- 데이터 일관성 관리 필요

#### 옵션 B: PRD 방식
```typescript
// 기존 emotions 컬렉션 사용, BigQuery Export 설정
// Firestore → BigQuery Export 활성화
// emotions 컬렉션만 익스포트 (content 필드 제외)
```

**장점**:
- 단일 소스 (emotions)
- 데이터 일관성 유지

**단점**:
- Export 설정 복잡
- content 필드 제외 로직 필요

**권장**: **옵션 A (플랜 방식)** - 프라이버시 보호 우선

---

## 3. 기술적 이슈 및 개선 제안

### 3.1 Secret Manager 마이그레이션

**현재 상태**:
```typescript
// functions/src/config/secrets.ts
const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({...});
```

**플랜 제안**:
```typescript
const YOUTUBE_API_KEY = defineSecret('YOUTUBE_API_KEY');
```

**권장 마이그레이션 전략**:
1. **단계 1**: 새 함수는 `defineSecret` 사용
2. **단계 2**: 기존 함수는 점진적 마이그레이션
3. **단계 3**: 완전 마이그레이션 후 `secrets.ts` 제거

---

### 3.2 Firestore 인덱스 추가

**플랜 제안**:
```json
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "userId", "mode": "ASCENDING" },
    { "fieldPath": "conversationId", "mode": "ASCENDING" },
    { "fieldPath": "timestamp", "mode": "ASCENDING" }
  ]
}
```

**현재 상태**: `firestore.indexes.json`에 없음

**평가**: ✅ **필수 추가**

---

### 3.3 useRealtimeMessages 쿼리 수정

**현재 코드**:
```typescript
const q = query(
  collection(db, FIRESTORE_COLLECTIONS.MESSAGES),
  where('conversationId', '==', conversationId),
  orderBy('timestamp', 'asc')
);
```

**플랜 제안**: `where('userId','==',uid)` 추가

**평가**: ✅ **필수 수정** (Rules와 일치)

**개선 제안**:
```typescript
// userId는 getCurrentUserId()로 가져오기
const userId = getCurrentUserId();
const q = query(
  collection(db, FIRESTORE_COLLECTIONS.MESSAGES),
  where('conversationId', '==', conversationId),
  where('userId', '==', userId), // ✅ 추가
  orderBy('timestamp', 'asc')
);
```

---

## 4. 일정 및 리소스 평가

### 4.1 일정 평가

**플랜 제안**: 21일 (약 4주)

| Phase | 플랜 일정 | 평가 | 실제 예상 |
|-------|----------|------|----------|
| Phase 0 | 4일 | ✅ 적절 | 3-4일 |
| Phase 1 | 4일 | ✅ 적절 | 4-5일 |
| Phase 2 | 4일 | ✅ 적절 | 3-4일 |
| Phase 3 | 2일 | ✅ 적절 | 2일 |
| Phase 4 | 5일 | ⚠️ 낙관적 | 6-7일 |
| Phase 5 | 2일 | ✅ 적절 | 2일 |
| **총계** | **21일** | | **22-24일** |

**평가 결과**: 
- **전체적으로 현실적** ✅
- **Phase 4는 여유 있게 계획 권장** ⚠️

---

### 4.2 비용 평가

**플랜 제안**: ~$3/월

| 항목 | 플랜 예상 | 평가 |
|-----|----------|------|
| YouTube Data API | $0 | ✅ 무료 할당량 내 |
| Custom Search API | $0 | ✅ 무료 할당량 내 |
| BigQuery | $0 | ✅ 무료 할당량 내 |
| Gemini API | ~$3 | ✅ 합리적 |
| Cloud Functions | $0 | ✅ 무료 할당량 내 |
| **총계** | **~$3** | ✅ **합리적** |

**평가 결과**: ✅ **비용 예상이 합리적**

**추가 고려사항**:
- Firestore 읽기/쓰기 비용 (레이트리밋 캐시용)
- BigQuery 스토리지 비용 (장기 운영 시)

---

## 5. 종합 평가 및 권장사항

### 5.1 강점

1. ✅ **보안 강화**: 인증 + 레이트리밋 + Idempotency
2. ✅ **프라이버시 보호**: 동의 체크 + 원문 저장 차단
3. ✅ **비용 최적화**: 캐싱 + 레이트리밋 + Idempotency
4. ✅ **구현 가능성**: 높음
5. ✅ **문서화**: 상세하고 명확함

### 5.2 개선 필요 사항

1. ⚠️ **Secret Manager 마이그레이션**: 점진적 접근 권장
2. ⚠️ **Phase 4 일정**: 여유 있게 계획 (6-7일)
3. ⚠️ **App Check**: 선택사항이지만 단계적 도입 권장
4. ⚠️ **BigQuery 방식**: PRD와의 정합성 확인 필요

### 5.3 우선순위 조정 제안

**즉시 실행 (Week 1)**:
1. ✅ Phase 0.1: Firestore Rules 정합 (1일)
2. ✅ Phase 0.2: 동의 체크 추가 (1일)
3. ✅ Phase 0.3: Functions 인증 강제 (1일)
4. ✅ Phase 0.4: Timeout 정책 정렬 (0.5일)

**단계적 실행 (Week 2-3)**:
5. ✅ Phase 1: YouTube API 연동 (4일)
6. ✅ Phase 2: Custom Search API 연동 (4일)
7. ✅ Phase 3: Gemini Grounding 강화 (2일)

**확장 기능 (Week 4)**:
8. ⚠️ Phase 0.3 확장: 레이트리밋 + Idempotency (2일)
9. ⚠️ Phase 4: BigQuery 리포트 연동 (6-7일)

**선택 기능 (향후)**:
10. ⚠️ App Check 도입
11. ⚠️ Redis/Memorystore 마이그레이션 (레이트리밋)

---

## 6. 최종 권장사항

### 6.1 즉시 수정 필요

1. ✅ **Firestore messages `userId` 추가** (Critical)
2. ✅ **Functions 인증 강제** (Critical)
3. ✅ **동의 체크 추가** (High)
4. ✅ **Timeout 정책 정렬** (High)

### 6.2 단계적 구현 권장

1. ✅ **Phase 1-3**: GCP API 연동 (우선)
2. ⚠️ **레이트리밋 + Idempotency**: Phase 0.3 확장 (중요하지만 Phase 1-3 후)
3. ⚠️ **Phase 4**: BigQuery 리포트 (여유 있게 계획)

### 6.3 기술적 선택

1. ✅ **Secret Manager**: `defineSecret` 사용 (새 함수부터)
2. ✅ **BigQuery**: `_analytics` 컬렉션 방식 (플랜 방식 권장)
3. ⚠️ **App Check**: 선택사항 (보안 강화 시 도입)

---

## 7. 결론

### 종합 평가: ✅ **매우 우수한 플랜**

**점수**: 9/10

**강점**:
- 보안 강화 방안 구체적
- 프라이버시 보호 우선
- 비용 최적화 전략 명확
- 구현 가능성 높음

**개선 필요**:
- Secret Manager 마이그레이션 전략
- Phase 4 일정 여유
- BigQuery 방식 PRD 정합성 확인

**권장 실행 순서**:
1. Phase 0 (Critical/High) → 즉시
2. Phase 1-3 (GCP API) → Week 2-3
3. Phase 0.3 확장 (레이트리밋) → Week 4
4. Phase 4 (BigQuery) → Week 4-5

---

**평가 완료일**: 2026-01-20  
**평가 방법**: 실제 코드베이스 직접 확인 (파일 시스템, grep, 코드베이스 검색)  
**평가 도구**: `read_file`, `grep`, `codebase_search`, `glob_file_search`
