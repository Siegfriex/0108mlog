# Secret Manager 권한 부여 스크립트
# Functions 서비스 계정에 Secret 접근 권한 부여
# 실행 방법: PowerShell에서 .\setup-secrets-permissions.ps1

Write-Host "🔑 Secret Manager 권한 부여 시작..." -ForegroundColor Cyan

# 프로젝트 정보 확인
Write-Host "`n1. 프로젝트 정보 확인 중..." -ForegroundColor Yellow
$PROJECT_ID = "iness-mlog"
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 프로젝트 정보를 가져올 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host "프로젝트 ID: $PROJECT_ID" -ForegroundColor Gray
Write-Host "프로젝트 번호: $PROJECT_NUMBER" -ForegroundColor Gray

# 사용 가능한 서비스 계정 확인
Write-Host "`n2. 사용 가능한 서비스 계정 확인 중..." -ForegroundColor Yellow
Write-Host "`n다음 서비스 계정 중 하나를 사용합니다:" -ForegroundColor Cyan
Write-Host "  - App Engine 기본: ${PROJECT_ID}@appspot.gserviceaccount.com" -ForegroundColor Gray
Write-Host "  - Functions 전용: functions-service-account@${PROJECT_ID}.iam.gserviceaccount.com" -ForegroundColor Gray
Write-Host "  - Compute Engine: ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" -ForegroundColor Gray

# App Engine 기본 서비스 계정 사용 (Firebase Functions 기본)
$SERVICE_ACCOUNT = "${PROJECT_ID}@appspot.gserviceaccount.com"
Write-Host "`n사용할 서비스 계정: $SERVICE_ACCOUNT" -ForegroundColor Green

# CSE_ID 권한 부여
Write-Host "`n3. CSE_ID 권한 부여 중..." -ForegroundColor Yellow
$result = gcloud secrets add-iam-policy-binding CSE_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/secretmanager.secretAccessor" `
  --project=$PROJECT_ID 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CSE_ID 권한 부여 완료" -ForegroundColor Green
} else {
    if ($result -match "already has") {
        Write-Host "ℹ️ CSE_ID 권한이 이미 부여되어 있습니다." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ CSE_ID 권한 부여 실패: $result" -ForegroundColor Yellow
    }
}

# GOOGLE_API_KEY 권한 부여
Write-Host "`n4. GOOGLE_API_KEY 권한 부여 중..." -ForegroundColor Yellow
$result = gcloud secrets add-iam-policy-binding GOOGLE_API_KEY `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/secretmanager.secretAccessor" `
  --project=$PROJECT_ID 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GOOGLE_API_KEY 권한 부여 완료" -ForegroundColor Green
} else {
    if ($result -match "already has") {
        Write-Host "ℹ️ GOOGLE_API_KEY 권한이 이미 부여되어 있습니다." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ GOOGLE_API_KEY 권한 부여 실패: $result" -ForegroundColor Yellow
    }
}

# YOUTUBE_API_KEY 권한 부여
Write-Host "`n5. YOUTUBE_API_KEY 권한 부여 중..." -ForegroundColor Yellow
$result = gcloud secrets add-iam-policy-binding YOUTUBE_API_KEY `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/secretmanager.secretAccessor" `
  --project=$PROJECT_ID 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YOUTUBE_API_KEY 권한 부여 완료" -ForegroundColor Green
} else {
    if ($result -match "already has") {
        Write-Host "ℹ️ YOUTUBE_API_KEY 권한이 이미 부여되어 있습니다." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ YOUTUBE_API_KEY 권한 부여 실패: $result" -ForegroundColor Yellow
    }
}

# GEMINI_API_KEY 권한 부여 (이미 존재할 수 있음)
Write-Host "`n6. GEMINI_API_KEY 권한 부여 중..." -ForegroundColor Yellow
$result = gcloud secrets add-iam-policy-binding GEMINI_API_KEY `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/secretmanager.secretAccessor" `
  --project=$PROJECT_ID 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GEMINI_API_KEY 권한 부여 완료" -ForegroundColor Green
} else {
    if ($result -match "already has") {
        Write-Host "ℹ️ GEMINI_API_KEY 권한이 이미 부여되어 있습니다." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ GEMINI_API_KEY 권한 부여 실패: $result" -ForegroundColor Yellow
    }
}

# 권한 확인
Write-Host "`n7. 권한 확인 중..." -ForegroundColor Yellow
Write-Host "`n각 Secret의 권한을 확인하려면:" -ForegroundColor Cyan
Write-Host "  gcloud secrets get-iam-policy CSE_ID --project=$PROJECT_ID" -ForegroundColor Gray
Write-Host "  gcloud secrets get-iam-policy GOOGLE_API_KEY --project=$PROJECT_ID" -ForegroundColor Gray
Write-Host "  gcloud secrets get-iam-policy YOUTUBE_API_KEY --project=$PROJECT_ID" -ForegroundColor Gray

Write-Host "`n✅ Secret Manager 권한 부여 완료!" -ForegroundColor Green
Write-Host "`n다음 단계: Functions 배포" -ForegroundColor Cyan
Write-Host "  cd functions" -ForegroundColor Gray
Write-Host "  npm run build" -ForegroundColor Gray
Write-Host "  npm run deploy" -ForegroundColor Gray
