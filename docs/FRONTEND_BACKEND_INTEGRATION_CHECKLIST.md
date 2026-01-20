# 프론트-백엔드 통합 실행 체크리스트

**작성일**: 2026-01-16
**목적**: 순차 실행 시 위협요인 방지

---

## 🔴 Critical 조치 사항

### 1. 타임아웃 조정 연기 (필수!)

**변경**:
- **Before**: 프론트 Week 2 Day 1-2에 타임아웃 15초로 조정
- **After**: Week 5-6으로 연기 (백엔드 완료 후)

**이유**:
- Week 2 조정 시: 프론트 15초, 백엔드 60초 (3주간 불일치)
- 프론트 타임아웃 → 백엔드는 60초 계속 실행 (45초 낭비)
- 사용자 경험 최악, 비용 증가

**실행**:
```markdown
프론트 Week 2 Day 1-2:
- Task 13-14 스킵
- Context 분리 사전 준비로 대체

프론트-백 동시 조정 (Week 5-6):
- 백엔드 Day 5-6: 타임아웃 30초 배포
- 프론트 재배포: 타임아웃 15초로 조정
- 동시 적용으로 불일치 제거
```

---

### 2. Firestore Rules 사전 배포 (필수!)

**시점**: 프론트 Week 1 Day 4

**이유**:
- storage.ts가 userSettings, errorLogs 컬렉션에 쓰기
- Rules 없으면 Permission denied
- 동기화 실패 (localStorage만 저장)

**실행**:
```bash
# Week 1 Day 4 추가
firebase deploy --only firestore:rules
```

**Rules 내용**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Week 1 추가
    match /userSettings/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /errorLogs/{logId} {
      allow create: if request.auth != null;
      allow read, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

### 3. Context 분리 28개 페이지 전체 확인 (필수!)

**시점**: 프론트 Week 2 Day 5 (Context 분리 완료 후)

**이유**:
- 50개 파일 중 1개라도 누락 시
- 해당 페이지 접근 시 런타임 에러
- "useModeContext must be used within ModeProvider"

**체크리스트**: 위 프론트 플랜 Step 6 참조 (28개 페이지)

---

## 🟡 High 조치 사항

### 4. Week 3 Firestore 인덱스 배포 타이밍

**권장**: 금요일 저녁 배포
```
금요일 오후: firebase deploy --only firestore:indexes
주말: 인덱스 빌드 (10-30분)
월요일: 확인 후 프론트 배포
```

**폴백 로직**: Task 16.1에 이미 포함됨

---

### 5. Week 1-4 백엔드 워밍업 (선택)

사용자 테스트 빈도 낮으면 Functions 콜드 스타트

**대응**:
```bash
# Cloud Scheduler (선택)
gcloud scheduler jobs create http warm-up \
  --schedule="*/30 * * * *" \
  --uri="https://.../generateDayModeResponse" \
  --message-body='{"data":{"userMessage":"test",...}}'
```

비용: +$5/월

---

## 📋 단계별 체크리스트

### Week 1 배포 전
- [ ] Firestore Rules에 userSettings 추가
- [ ] Firestore Rules에 errorLogs 추가
- [ ] Rules 배포: `firebase deploy --only firestore:rules`
- [ ] Rules Simulator 테스트
- [ ] DebugPanel 라우트 추가 확인

### Week 2 시작 전
- [ ] Task 13-14 연기 확정
- [ ] Week 2 Day 1-2 대체 작업 계획
- [ ] 50개 파일 목록 사전 작성

### Week 2 배포 전 (Context 분리)
- [ ] 28개 페이지 전체 수동 확인 완료
- [ ] 타입 에러 0개
- [ ] 점진적 배포 (4단계)

### Week 3 인덱스 배포
- [ ] 금요일 저녁 배포
- [ ] 인덱스 폴백 로직 구현
- [ ] 월요일 확인

### Week 4 완료 시
- [ ] 프론트 Emulator 연동 확인
- [ ] 백엔드 개발자 인수인계
- [ ] 프론트 변경사항 문서 공유

### Week 5 시작 전
- [ ] 프론트 Week 4 완료 확인
- [ ] 프론트 타임아웃 설정 확인 (조정 안 됐는지)
- [ ] 백엔드 Gemini 분석 (Task 0.2-0.3)

---

## 📊 통합 타임라인

```
Week 0 (프론트): 준비 + Rules 사전 확인
Week 1 (프론트): Critical (타임아웃 제외) + Rules 배포
Week 2-3 (프론트): High (Context, 검색) - 타임아웃 스킵
Week 4 (프론트): 테스트 + 레거시
---- 프론트 완료, 백엔드 시작 ----
Week 5 Day 0-1 (백엔드): 사전 분석 + 타임아웃 조정
Week 5 Day 2-3 (백엔드): Logging + JSON
Week 5 Day 4 (백엔드): Emulator
Week 5 Day 5 (백엔드): Canary
Week 5 Day 6 (백엔드): 문서
---- 백엔드 완료, 타임아웃 통합 ----
Week 6 Day 1-2 (프론트): 타임아웃 15초로 조정 + 재배포
Week 6 Day 3 (통합): 모니터링
```

**총 기간**: 6주 (기존 5주 + 통합 조정 3일)

---

## 위협요인 해소 확인

- ✅ 타임아웃 불일치: 동시 조정으로 해소
- ✅ Firestore Rules: Week 1에 사전 배포
- ✅ Context 누락: 28개 페이지 전체 확인
- ✅ 인덱스 빌드: 금요일 배포 + 폴백
- ✅ 백엔드 Logging: Week 1 선택적 배포 가능
