# Secret Manager 설정 안내

**작성일**: 2026-01-20

---

## ⚠️ 중요 안내

gcloud 명령어는 **인증이 필요**하며, 비대화형 환경에서는 자동 실행이 제한됩니다.

다음 중 하나의 방법으로 Secret을 저장하세요:

---

## 방법 1: PowerShell 스크립트 실행 (권장)

프로젝트 루트에 `setup-secrets.ps1` 파일이 생성되었습니다.

**실행 전 확인**:
1. gcloud 인증 확인:
   ```powershell
   gcloud auth list
   ```

2. 인증이 안 되어 있으면:
   ```powershell
   gcloud auth login
   ```

3. 스크립트 실행:
   ```powershell
   .\setup-secrets.ps1
   ```

---

## 방법 2: 수동 명령어 실행

### CSE_ID 저장

**신규 생성**:
```powershell
"YOUR_CSE_ID_HERE" | gcloud secrets create CSE_ID --data-file=- --project=iness-mlog --replication-policy="automatic"
```

**이미 존재하는 경우 업데이트**:
```powershell
"YOUR_CSE_ID_HERE" | gcloud secrets versions add CSE_ID --data-file=- --project=iness-mlog
```

### GOOGLE_API_KEY 저장 (Custom Search API용)

**신규 생성**:
```powershell
"YOUR_GOOGLE_API_KEY_HERE" | gcloud secrets create GOOGLE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic"
```

**이미 존재하는 경우 업데이트**:
```powershell
"YOUR_GOOGLE_API_KEY_HERE" | gcloud secrets versions add GOOGLE_API_KEY --data-file=- --project=iness-mlog
```

### YOUTUBE_API_KEY 저장 (YouTube Data API용)

**신규 생성**:
```powershell
"YOUR_GOOGLE_API_KEY_HERE" | gcloud secrets create YOUTUBE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic"
```

**이미 존재하는 경우 업데이트**:
```powershell
"YOUR_GOOGLE_API_KEY_HERE" | gcloud secrets versions add YOUTUBE_API_KEY --data-file=- --project=iness-mlog
```

---

## 방법 3: GCP Console에서 직접 설정

1. GCP Console 접속:
   ```
   https://console.cloud.google.com/security/secret-manager?project=iness-mlog
   ```

2. "비밀 만들기" 클릭

3. **CSE_ID**:
   - 이름: `CSE_ID`
   - 비밀 값: `YOUR_CSE_ID_HERE`
   - 만들기 클릭

4. **GOOGLE_API_KEY** (Custom Search API용):
   - 이름: `GOOGLE_API_KEY`
   - 비밀 값: `YOUR_GOOGLE_API_KEY_HERE`
   - 만들기 클릭

5. **YOUTUBE_API_KEY** (YouTube Data API용):
   - 이름: `YOUTUBE_API_KEY`
   - 비밀 값: `YOUR_GOOGLE_API_KEY_HERE`
   - 만들기 클릭

---

## ✅ 저장 확인

```powershell
gcloud secrets list --project=iness-mlog
```

**예상 출력**:
```
NAME              CREATED              REPLICATION
CSE_ID            2026-01-20T...      automatic
GOOGLE_API_KEY    2026-01-20T...      automatic
GEMINI_API_KEY    2025-XX-XXT...      automatic
```

---

## 🔑 Functions 서비스 계정 권한 부여

Secret 저장 후, Functions가 접근할 수 있도록 권한을 부여하세요:

**방법 1: 스크립트 실행 (권장)**
```powershell
.\setup-secrets-permissions.ps1
```

**방법 2: 수동 명령어 실행**
```powershell
# 프로젝트 번호 가져오기
$PROJECT_NUMBER = gcloud projects describe iness-mlog --format="value(projectNumber)"
$SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# CSE_ID 권한 부여
gcloud secrets add-iam-policy-binding CSE_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/secretmanager.secretAccessor" `
  --project=iness-mlog

# GOOGLE_API_KEY 권한 부여
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/secretmanager.secretAccessor" `
  --project=iness-mlog

# YOUTUBE_API_KEY 권한 부여
gcloud secrets add-iam-policy-binding YOUTUBE_API_KEY `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/secretmanager.secretAccessor" `
  --project=iness-mlog
```

---

## 📝 저장된 정보 요약

| Secret 이름 | 값 | 용도 | 사용 함수 |
|------------|-----|------|----------|
| `CSE_ID` | `YOUR_CSE_ID_HERE` | Custom Search Engine ID | `searchPoems` |
| `GOOGLE_API_KEY` | `YOUR_GOOGLE_API_KEY_HERE` | Custom Search API 키 | `searchPoems` |
| `YOUTUBE_API_KEY` | `YOUR_GOOGLE_API_KEY_HERE` | YouTube Data API 키 | `fetchYouTubeMeditations`, `fetchYouTubeMusic` |

---

## 🚀 다음 단계

Secret 저장 완료 후:

1. **Functions 빌드 및 배포**:
   ```powershell
   cd functions
   npm run build
   npm run deploy
   ```

2. **프론트엔드 테스트**:
   - `/content/poems` 페이지 접속
   - 감정 선택하여 검색 테스트

---

**작성 완료일**: 2026-01-20
