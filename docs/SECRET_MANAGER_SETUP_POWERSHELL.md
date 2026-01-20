# Secret Manager 설정 가이드 (PowerShell)

**작성일**: 2026-01-20  
**프로젝트**: iness-mlog  
**환경**: Windows PowerShell

---

## 🔐 Secret 저장 명령어 (PowerShell)

### 1. gcloud 인증 확인

먼저 gcloud 인증 상태를 확인하세요:

```powershell
gcloud auth list
```

인증이 안 되어 있으면:

```powershell
gcloud auth login
```

### 2. CSE_ID 저장

**신규 생성**:
```powershell
"728e72197c5ad4ad9" | gcloud secrets create CSE_ID --data-file=- --project=iness-mlog --replication-policy="automatic"
```

**이미 존재하는 경우 업데이트**:
```powershell
"728e72197c5ad4ad9" | gcloud secrets versions add CSE_ID --data-file=- --project=iness-mlog
```

**또는 한 번에 시도**:
```powershell
# 먼저 생성 시도
try {
    "728e72197c5ad4ad9" | gcloud secrets create CSE_ID --data-file=- --project=iness-mlog --replication-policy="automatic"
} catch {
    # 이미 존재하면 업데이트
    "728e72197c5ad4ad9" | gcloud secrets versions add CSE_ID --data-file=- --project=iness-mlog
}
```

### 3. GOOGLE_API_KEY 저장 (Custom Search API용)

**신규 생성**:
```powershell
"AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets create GOOGLE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic"
```

**이미 존재하는 경우 업데이트**:
```powershell
"AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets versions add GOOGLE_API_KEY --data-file=- --project=iness-mlog
```

**또는 한 번에 시도**:
```powershell
try {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets create GOOGLE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic"
} catch {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets versions add GOOGLE_API_KEY --data-file=- --project=iness-mlog
}
```

### 4. YOUTUBE_API_KEY 저장 (YouTube Data API용)

**신규 생성**:
```powershell
"AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets create YOUTUBE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic"
```

**이미 존재하는 경우 업데이트**:
```powershell
"AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets versions add YOUTUBE_API_KEY --data-file=- --project=iness-mlog
```

**또는 한 번에 시도**:
```powershell
try {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets create YOUTUBE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic"
} catch {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets versions add YOUTUBE_API_KEY --data-file=- --project=iness-mlog
}
```

---

## ✅ 저장 확인

### Secret 목록 확인

```powershell
gcloud secrets list --project=iness-mlog
```

### Secret 값 확인 (테스트용)

```powershell
# CSE_ID 확인
gcloud secrets versions access latest --secret="CSE_ID" --project=iness-mlog

# GOOGLE_API_KEY 확인 (Custom Search API용)
gcloud secrets versions access latest --secret="GOOGLE_API_KEY" --project=iness-mlog

# YOUTUBE_API_KEY 확인 (YouTube Data API용)
gcloud secrets versions access latest --secret="YOUTUBE_API_KEY" --project=iness-mlog
```

---

## 🔑 Functions 서비스 계정 권한 부여

```powershell
# 프로젝트 번호 가져오기
$PROJECT_NUMBER = gcloud projects describe iness-mlog --format="value(projectNumber)"
$SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# CSE_ID 권한 부여
gcloud secrets add-iam-policy-binding CSE_ID --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=iness-mlog

# GOOGLE_API_KEY 권한 부여
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=iness-mlog

# YOUTUBE_API_KEY 권한 부여
gcloud secrets add-iam-policy-binding YOUTUBE_API_KEY --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/secretmanager.secretAccessor" --project=iness-mlog

---

## 📝 일괄 실행 스크립트

다음 스크립트를 `setup-secrets.ps1`로 저장하고 실행하세요:

```powershell
# setup-secrets.ps1

Write-Host "🔐 Secret Manager 설정 시작..." -ForegroundColor Cyan

# gcloud 인증 확인
Write-Host "`n1. gcloud 인증 확인 중..." -ForegroundColor Yellow
$authStatus = gcloud auth list 2>&1
if ($authStatus -match "No credentialed accounts") {
    Write-Host "인증이 필요합니다. gcloud auth login을 실행하세요." -ForegroundColor Red
    exit 1
}

# CSE_ID 저장
Write-Host "`n2. CSE_ID 저장 중..." -ForegroundColor Yellow
try {
    "728e72197c5ad4ad9" | gcloud secrets create CSE_ID --data-file=- --project=iness-mlog --replication-policy="automatic" 2>&1 | Out-Null
    Write-Host "✅ CSE_ID 생성 완료" -ForegroundColor Green
} catch {
    "728e72197c5ad4ad9" | gcloud secrets versions add CSE_ID --data-file=- --project=iness-mlog 2>&1 | Out-Null
    Write-Host "✅ CSE_ID 업데이트 완료" -ForegroundColor Green
}

# GOOGLE_API_KEY 저장 (Custom Search API용)
Write-Host "`n3. GOOGLE_API_KEY 저장 중 (Custom Search API용)..." -ForegroundColor Yellow
try {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets create GOOGLE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic" 2>&1 | Out-Null
    Write-Host "✅ GOOGLE_API_KEY 생성 완료" -ForegroundColor Green
} catch {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets versions add GOOGLE_API_KEY --data-file=- --project=iness-mlog 2>&1 | Out-Null
    Write-Host "✅ GOOGLE_API_KEY 업데이트 완료" -ForegroundColor Green
}

# YOUTUBE_API_KEY 저장 (YouTube Data API용)
Write-Host "`n4. YOUTUBE_API_KEY 저장 중 (YouTube Data API용)..." -ForegroundColor Yellow
try {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets create YOUTUBE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic" 2>&1 | Out-Null
    Write-Host "✅ YOUTUBE_API_KEY 생성 완료" -ForegroundColor Green
} catch {
    "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo" | gcloud secrets versions add YOUTUBE_API_KEY --data-file=- --project=iness-mlog 2>&1 | Out-Null
    Write-Host "✅ YOUTUBE_API_KEY 업데이트 완료" -ForegroundColor Green
}

# 저장 확인
Write-Host "`n5. 저장된 Secret 확인 중..." -ForegroundColor Yellow
gcloud secrets list --project=iness-mlog

Write-Host "`n✅ Secret Manager 설정 완료!" -ForegroundColor Green
```

**실행 방법**:
```powershell
.\setup-secrets.ps1
```

---

## 🚨 문제 해결

### gcloud 인증 오류

```powershell
# 재인증
gcloud auth login

# 특정 계정 선택
gcloud config set account YOUR_EMAIL@gmail.com
```

### 권한 오류

```powershell
# 프로젝트 확인
gcloud config get-value project

# 프로젝트 설정
gcloud config set project iness-mlog
```

### Secret이 이미 존재하는 경우

에러 메시지: `Secret [CSE_ID] already exists`

해결: 업데이트 명령어 사용:
```powershell
"728e72197c5ad4ad9" | gcloud secrets versions add CSE_ID --data-file=- --project=iness-mlog
```

---

**작성 완료일**: 2026-01-20  
**다음 단계**: Secret 저장 후 Functions 배포
