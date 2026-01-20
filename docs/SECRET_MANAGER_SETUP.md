# Secret Manager 설정 가이드

**작성일**: 2026-01-20  
**프로젝트**: iness-mlog

---

## 🔐 Secret 저장 명령어

### 1. CSE_ID 저장

```bash
echo -n "YOUR_CSE_ID_HERE" | gcloud secrets create CSE_ID \
  --data-file=- \
  --project=iness-mlog \
  --replication-policy="automatic"
```

**또는 이미 존재하는 경우 업데이트**:
```bash
echo -n "YOUR_CSE_ID_HERE" | gcloud secrets versions add CSE_ID \
  --data-file=- \
  --project=iness-mlog
```

### 2. GOOGLE_API_KEY 저장

```bash
echo -n "YOUR_GOOGLE_API_KEY_HERE" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- \
  --project=iness-mlog \
  --replication-policy="automatic"
```

**또는 이미 존재하는 경우 업데이트**:
```bash
echo -n "YOUR_GOOGLE_API_KEY_HERE" | gcloud secrets versions add GOOGLE_API_KEY \
  --data-file=- \
  --project=iness-mlog
```

---

## ✅ 저장 확인

### Secret 목록 확인

```bash
gcloud secrets list --project=iness-mlog
```

**예상 출력**:
```
NAME              CREATED              REPLICATION
CSE_ID            2026-01-20T...      automatic
GOOGLE_API_KEY    2026-01-20T...      automatic
GEMINI_API_KEY    2025-XX-XXT...      automatic
```

### Secret 값 확인 (테스트용)

```bash
# CSE_ID 확인
gcloud secrets versions access latest --secret="CSE_ID" --project=iness-mlog

# GOOGLE_API_KEY 확인 (마스킹됨)
gcloud secrets versions access latest --secret="GOOGLE_API_KEY" --project=iness-mlog
```

---

## 🔑 Functions 서비스 계정 권한 확인

### 현재 서비스 계정 확인

```bash
gcloud iam service-accounts list --project=iness-mlog
```

### Secret 접근 권한 부여

```bash
# Functions 기본 서비스 계정에 권한 부여
PROJECT_NUMBER=$(gcloud projects describe iness-mlog --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding CSE_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=iness-mlog

gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=iness-mlog
```

---

## 🧪 테스트

### 로컬 테스트

```bash
cd functions
npm run build
npm run serve
```

### 배포 후 테스트

```bash
# Functions 배포
cd functions
npm run deploy

# 로그 확인
firebase functions:log --only searchPoems
```

---

## 📝 저장된 Secret 정보

| Secret 이름 | 값 | 용도 |
|------------|-----|------|
| `CSE_ID` | `YOUR_CSE_ID_HERE` | Custom Search Engine ID |
| `GOOGLE_API_KEY` | `YOUR_GOOGLE_API_KEY_HERE` | Custom Search API 키 |
| `GEMINI_API_KEY` | (기존) | Gemini API 키 |

---

**작성 완료일**: 2026-01-20  
**다음 단계**: Functions 배포 및 테스트
