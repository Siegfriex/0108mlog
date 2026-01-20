# Secret Manager 설정 스크립트
# 실행 방법: PowerShell에서 .\setup-secrets.ps1

Write-Host "🔐 Secret Manager 설정 시작..." -ForegroundColor Cyan

# 1. gcloud 인증 확인
Write-Host "`n1. gcloud 인증 확인 중..." -ForegroundColor Yellow
$authList = gcloud auth list 2>&1
if ($authList -match "No credentialed accounts" -or $LASTEXITCODE -ne 0) {
    Write-Host "❌ gcloud 인증이 필요합니다." -ForegroundColor Red
    Write-Host "다음 명령어를 실행하세요: gcloud auth login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ gcloud 인증 확인됨" -ForegroundColor Green

# 2. CSE_ID 저장
Write-Host "`n2. CSE_ID 저장 중..." -ForegroundColor Yellow
$cseId = "728e72197c5ad4ad9"
$null = $cseId | gcloud secrets create CSE_ID --data-file=- --project=iness-mlog --replication-policy="automatic" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CSE_ID 생성 완료" -ForegroundColor Green
} else {
    # 이미 존재하면 업데이트
    Write-Host "CSE_ID가 이미 존재합니다. 업데이트 중..." -ForegroundColor Yellow
    $updateResult = $cseId | gcloud secrets versions add CSE_ID --data-file=- --project=iness-mlog 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CSE_ID 업데이트 완료" -ForegroundColor Green
    } else {
        Write-Host "❌ CSE_ID 저장 실패: $updateResult" -ForegroundColor Red
    }
}

# 3. GOOGLE_API_KEY 저장 (Custom Search API용)
Write-Host "`n3. GOOGLE_API_KEY 저장 중 (Custom Search API용)..." -ForegroundColor Yellow
$googleKey = "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo"
$null = $googleKey | gcloud secrets create GOOGLE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GOOGLE_API_KEY 생성 완료" -ForegroundColor Green
} else {
    # 이미 존재하면 업데이트
    Write-Host "GOOGLE_API_KEY가 이미 존재합니다. 업데이트 중..." -ForegroundColor Yellow
    $updateResult = $googleKey | gcloud secrets versions add GOOGLE_API_KEY --data-file=- --project=iness-mlog 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GOOGLE_API_KEY 업데이트 완료" -ForegroundColor Green
    } else {
        Write-Host "❌ GOOGLE_API_KEY 저장 실패: $updateResult" -ForegroundColor Red
    }
}

# 4. YOUTUBE_API_KEY 저장 (YouTube Data API용)
Write-Host "`n4. YOUTUBE_API_KEY 저장 중 (YouTube Data API용)..." -ForegroundColor Yellow
$youtubeKey = "AIzaSyAvXcwh0L46lqPibIHIR8dun-8iJ8r6Xyo"
$null = $youtubeKey | gcloud secrets create YOUTUBE_API_KEY --data-file=- --project=iness-mlog --replication-policy="automatic" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YOUTUBE_API_KEY 생성 완료" -ForegroundColor Green
} else {
    # 이미 존재하면 업데이트
    Write-Host "YOUTUBE_API_KEY가 이미 존재합니다. 업데이트 중..." -ForegroundColor Yellow
    $updateResult = $youtubeKey | gcloud secrets versions add YOUTUBE_API_KEY --data-file=- --project=iness-mlog 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ YOUTUBE_API_KEY 업데이트 완료" -ForegroundColor Green
    } else {
        Write-Host "❌ YOUTUBE_API_KEY 저장 실패: $updateResult" -ForegroundColor Red
    }
}

# 5. 저장 확인
Write-Host "`n5. 저장된 Secret 확인 중..." -ForegroundColor Yellow
gcloud secrets list --project=iness-mlog --format="table(name,createTime)"

Write-Host "`n✅ Secret Manager 설정 완료!" -ForegroundColor Green
Write-Host "`n다음 단계: Functions 서비스 계정 권한 부여 및 배포" -ForegroundColor Cyan
Write-Host "  # 서비스 계정 권한 부여 (선택사항)" -ForegroundColor Gray
Write-Host "  # 스크립트 실행: .\setup-secrets-permissions.ps1" -ForegroundColor Gray
Write-Host "  cd functions" -ForegroundColor Gray
Write-Host "  npm run build" -ForegroundColor Gray
Write-Host "  npm run deploy" -ForegroundColor Gray
