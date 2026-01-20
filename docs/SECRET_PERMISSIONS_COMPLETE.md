# Secret Manager 권한 부여 완료 보고서

**작성일**: 2026-01-20  
**프로젝트**: iness-mlog

---

## ✅ 완료된 작업

### 1. Secret 저장 완료

| Secret 이름 | 상태 | 최종 버전 |
|------------|------|----------|
| `CSE_ID` | 저장 완료 | 버전 2 |
| `GOOGLE_API_KEY` | 저장 완료 | 버전 2 |
| `YOUTUBE_API_KEY` | 저장 완료 | 버전 2 |
| `GEMINI_API_KEY` | 기존 존재 | - |

### 2. 서비스 계정 권한 부여 완료

**사용된 서비스 계정**: `iness-mlog@appspot.gserviceaccount.com`  
(App Engine 기본 서비스 계정 - Firebase Functions 기본)

**권한 부여 완료된 Secret**:
- ✅ `CSE_ID`
- ✅ `GOOGLE_API_KEY`
- ✅ `YOUTUBE_API_KEY`
- ✅ `GEMINI_API_KEY`

**부여된 역할**: `roles/secretmanager.secretAccessor`

---

## 📋 사용 가능한 서비스 계정 목록

프로젝트에서 확인된 서비스 계정:

1. **App Engine 기본** (사용 중)
   - `iness-mlog@appspot.gserviceaccount.com`
   - Firebase Functions 기본 서비스 계정

2. **Functions 전용**
   - `functions-service-account@iness-mlog.iam.gserviceaccount.com`
   - Cloud Functions 전용 서비스 계정

3. **Compute Engine 기본**
   - `580215226160-compute@developer.gserviceaccount.com`
   - Compute Engine 기본 서비스 계정

4. **기타**
   - `scheduler-service-account@iness-mlog.iam.gserviceaccount.com`
   - `firebase-adminsdk-fbsvc@iness-mlog.iam.gserviceaccount.com`

---

## 🔍 권한 확인 방법

### 개별 Secret 권한 확인

```powershell
# CSE_ID 권한 확인
gcloud secrets get-iam-policy CSE_ID --project=iness-mlog

# GOOGLE_API_KEY 권한 확인
gcloud secrets get-iam-policy GOOGLE_API_KEY --project=iness-mlog

# YOUTUBE_API_KEY 권한 확인
gcloud secrets get-iam-policy YOUTUBE_API_KEY --project=iness-mlog

# GEMINI_API_KEY 권한 확인
gcloud secrets get-iam-policy GEMINI_API_KEY --project=iness-mlog
```

### 모든 Secret 목록 확인

```powershell
gcloud secrets list --project=iness-mlog
```

---

## 🚀 다음 단계

### 1. Functions 배포

```powershell
cd functions
npm run build
npm run deploy
```

### 2. 배포 후 테스트

**Custom Search API 테스트**:
- 프론트엔드: `/content/poems` 페이지 접속
- 감정 선택하여 시 검색 테스트

**YouTube API 테스트**:
- 프론트엔드: `/content/meditations` 또는 `/content/music` 페이지 접속
- 명상/힐링 음악 검색 테스트

### 3. Functions 로그 확인

```powershell
# 실시간 로그 확인
firebase functions:log

# 특정 함수 로그 확인
firebase functions:log --only searchPoems
firebase functions:log --only fetchYouTubeMeditations
```

---

## 🔧 문제 해결

### Secret 접근 오류 발생 시

1. **권한 확인**:
   ```powershell
   gcloud secrets get-iam-policy SECRET_NAME --project=iness-mlog
   ```

2. **서비스 계정 확인**:
   ```powershell
   gcloud iam service-accounts list --project=iness-mlog
   ```

3. **수동 권한 부여**:
   ```powershell
   $SERVICE_ACCOUNT = "iness-mlog@appspot.gserviceaccount.com"
   gcloud secrets add-iam-policy-binding SECRET_NAME `
     --member="serviceAccount:$SERVICE_ACCOUNT" `
     --role="roles/secretmanager.secretAccessor" `
     --project=iness-mlog
   ```

### Functions 배포 오류 발생 시

1. **빌드 확인**:
   ```powershell
   cd functions
   npm run build
   ```

2. **의존성 확인**:
   ```powershell
   npm install
   ```

3. **Firebase CLI 확인**:
   ```powershell
   firebase --version
   firebase login
   ```

---

## 📝 참고 사항

### Secret Manager 비용

- Secret 저장: 무료
- Secret 버전: 무료 (최대 10개 버전)
- Secret 접근: 무료
- **총 비용**: $0/월

### 보안 모범 사례

1. ✅ Secret은 절대 코드에 하드코딩하지 않음
2. ✅ Secret Manager 사용으로 중앙 관리
3. ✅ 서비스 계정별 최소 권한 부여
4. ✅ Secret 버전 관리로 롤백 가능
5. ✅ TTL 기반 캐싱으로 성능 최적화

---

**작성 완료일**: 2026-01-20  
**검증 상태**: ✅ 완료
