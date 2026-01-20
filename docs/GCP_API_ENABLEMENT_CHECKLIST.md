# GCP API 활성화 체크리스트

**작성일**: 2026-01-20  
**프로젝트**: iness-mlog  
**GCP 프로젝트 ID**: iness-mlog

---

## 📋 활성화 필요 API 목록

### 🔴 필수 활성화 (새로 추가 필요)

| API 이름 | API ID | 용도 | Phase | 활성화 방법 |
|---------|--------|------|-------|------------|
| **YouTube Data API v3** | `youtube.googleapis.com` | 명상/음악 비디오 검색 | Phase 1 | [활성화 링크](#youtube-data-api-v3) |
| **Custom Search API** | `customsearch.googleapis.com` | 시/문학 검색 | Phase 2 | [활성화 링크](#custom-search-api) |
| **BigQuery API** | `bigquery.googleapis.com` | 리포트 배치 분석 | Phase 4 | [활성화 링크](#bigquery-api) |
| **Cloud Scheduler API** | `cloudscheduler.googleapis.com` | 주간/월간 리포트 배치 | Phase 4 | [활성화 링크](#cloud-scheduler-api) |

### 🟡 확인 필요 (이미 활성화되어 있을 수 있음)

| API 이름 | API ID | 용도 | 확인 방법 |
|---------|--------|------|----------|
| **Secret Manager API** | `secretmanager.googleapis.com` | API 키 관리 | [확인 링크](#secret-manager-api) |
| **Cloud Functions API** | `cloudfunctions.googleapis.com` | Functions 배포/실행 | [확인 링크](#cloud-functions-api) |
| **Firestore API** | `firestore.googleapis.com` | 데이터베이스 | [확인 링크](#firestore-api) |
| **Firebase Authentication API** | `identitytoolkit.googleapis.com` | 사용자 인증 | [확인 링크](#firebase-authentication-api) |
| **Vertex AI API** | `aiplatform.googleapis.com` | Gemini API 호출 | [확인 링크](#vertex-ai-api) |
| **Generative AI API** | `generativelanguage.googleapis.com` | Gemini API 호출 (대안) | [확인 링크](#generative-ai-api) |

---

## 🔧 활성화 방법

### YouTube Data API v3

**활성화 링크**: 
```
https://console.cloud.google.com/apis/library/youtube.googleapis.com?project=iness-mlog
```

**또는 CLI**:
```bash
gcloud services enable youtube.googleapis.com --project=iness-mlog
```

**API 키 발급**:
1. GCP Console → APIs & Services → Credentials
2. "Create Credentials" → "API Key"
3. API 키 이름: `YouTube API Key`
4. API 제한 설정:
   - Application restrictions: HTTP referrers (웹 사이트)
   - API restrictions: YouTube Data API v3만 허용
5. Secret Manager에 저장:
   ```bash
   echo -n "YOUR_API_KEY" | gcloud secrets create YOUTUBE_API_KEY \
     --data-file=- \
     --project=iness-mlog \
     --replication-policy="automatic"
   ```

**할당량**:
- 무료 할당량: 10,000 units/일
- 예상 사용량: 3,000 units/일
- 비용: $0 (무료 할당량 내)

---

### Custom Search API

**활성화 링크**:
```
https://console.cloud.google.com/apis/library/customsearch.googleapis.com?project=iness-mlog
```

**또는 CLI**:
```bash
gcloud services enable customsearch.googleapis.com --project=iness-mlog
```

**Programmable Search Engine 설정**:
1. Programmable Search Engine 생성:
   ```
   https://programmablesearchengine.google.com/controlpanel/create
   ```
2. 검색 엔진 설정:
   - 이름: `마음로그 시/문학 검색`
   - 검색 사이트 제한:
     - `munhak.com` (한국 문학)
     - `poem.co.kr` (시 전문)
     - `poetryfoundation.org` (영미 시)
     - `goodreads.com/quotes` (명언)
   - 언어: 한국어, 영어
3. Search Engine ID (cx) 확인 및 저장
4. API 키 발급 (Google API Console에서)
5. Secret Manager에 저장:
   ```bash
   # Google API Key
   echo -n "YOUR_GOOGLE_API_KEY" | gcloud secrets create GOOGLE_API_KEY \
     --data-file=- \
     --project=iness-mlog \
     --replication-policy="automatic"
   
   # Search Engine ID (cx)
   echo -n "YOUR_CSE_ID" | gcloud secrets create CSE_ID \
     --data-file=- \
     --project=iness-mlog \
     --replication-policy="automatic"
   ```

**할당량**:
- 무료 할당량: 100 queries/일
- 예상 사용량: 50 queries/일
- 비용: $0 (무료 할당량 내)

---

### BigQuery API

**활성화 링크**:
```
https://console.cloud.google.com/apis/library/bigquery.googleapis.com?project=iness-mlog
```

**또는 CLI**:
```bash
gcloud services enable bigquery.googleapis.com --project=iness-mlog
```

**BigQuery 데이터셋 생성**:
```bash
# 데이터셋 생성
bq mk --dataset --location=asia-northeast3 \
  --description="마음로그 분석 데이터" \
  iness-mlog:maumlog_analytics

# 또는 GCP Console에서:
# BigQuery → 데이터셋 만들기
# 데이터셋 ID: maumlog_analytics
# 위치: asia-northeast3 (서울)
```

**테이블 생성** (선택사항 - 코드에서 자동 생성 가능):
```sql
-- _analytics 컬렉션용 테이블
CREATE TABLE `iness-mlog.maumlog_analytics._analytics` (
  userId STRING NOT NULL,
  type STRING NOT NULL,
  emotion STRING,
  intensity INT64,
  timestamp TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL
)
PARTITION BY DATE(timestamp)
CLUSTER BY userId, type;
```

**할당량**:
- 무료 할당량: 1TB/월 쿼리, 10GB 저장
- 예상 사용량: 100GB/월 쿼리, 1GB 저장
- 비용: $0 (무료 할당량 내)

---

### Cloud Scheduler API

**활성화 링크**:
```
https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com?project=iness-mlog
```

**또는 CLI**:
```bash
gcloud services enable cloudscheduler.googleapis.com --project=iness-mlog
```

**App Engine 앱 생성** (필수 - Scheduler 사용 전제조건):
```bash
# App Engine 앱 생성 (한 번만)
gcloud app create --region=asia-northeast3 --project=iness-mlog
```

**Scheduler 작업 생성** (코드 배포 후):
```bash
# 주간 리포트 생성 (매주 월요일 00:00 KST)
gcloud scheduler jobs create http generateWeeklyReports \
  --schedule="0 0 * * 1" \
  --time-zone="Asia/Seoul" \
  --uri="https://asia-northeast3-iness-mlog.cloudfunctions.net/generateWeeklyReports" \
  --http-method=POST \
  --oidc-service-account-email="YOUR_SERVICE_ACCOUNT@iness-mlog.iam.gserviceaccount.com" \
  --project=iness-mlog

# 월간 리포트 생성 (매월 1일 00:00 KST)
gcloud scheduler jobs create http generateMonthlyReports \
  --schedule="0 0 1 * *" \
  --time-zone="Asia/Seoul" \
  --uri="https://asia-northeast3-iness-mlog.cloudfunctions.net/generateMonthlyReports" \
  --http-method=POST \
  --oidc-service-account-email="YOUR_SERVICE_ACCOUNT@iness-mlog.iam.gserviceaccount.com" \
  --project=iness-mlog
```

**할당량**:
- 무료 할당량: 3 jobs/프로젝트
- 예상 사용량: 2 jobs (주간/월간)
- 비용: $0 (무료 할당량 내)

---

### Secret Manager API (확인 필요)

**확인 링크**:
```
https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=iness-mlog
```

**활성화 여부 확인**:
```bash
gcloud services list --enabled --project=iness-mlog | grep secretmanager
```

**활성화 (필요 시)**:
```bash
gcloud services enable secretmanager.googleapis.com --project=iness-mlog
```

**현재 사용 중인 Secret 확인**:
```bash
gcloud secrets list --project=iness-mlog
```

**예상 Secret 목록**:
- `GEMINI_API_KEY` (이미 존재)
- `YOUTUBE_API_KEY` (신규 생성 필요)
- `GOOGLE_API_KEY` (신규 생성 필요)
- `CSE_ID` (신규 생성 필요)

---

### Cloud Functions API (확인 필요)

**확인 링크**:
```
https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=iness-mlog
```

**활성화 여부 확인**:
```bash
gcloud services list --enabled --project=iness-mlog | grep cloudfunctions
```

**활성화 (필요 시)**:
```bash
gcloud services enable cloudfunctions.googleapis.com --project=iness-mlog
gcloud services enable cloudbuild.googleapis.com --project=iness-mlog  # Functions 빌드용
```

---

### Firestore API (확인 필요)

**확인 링크**:
```
https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=iness-mlog
```

**활성화 여부 확인**:
- Firebase Console → Firestore Database에서 확인
- 또는 CLI:
  ```bash
  gcloud services list --enabled --project=iness-mlog | grep firestore
  ```

**활성화 (필요 시)**:
```bash
gcloud services enable firestore.googleapis.com --project=iness-mlog
```

---

### Firebase Authentication API (확인 필요)

**확인 링크**:
```
https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=iness-mlog
```

**활성화 여부 확인**:
- Firebase Console → Authentication에서 확인
- 또는 CLI:
  ```bash
  gcloud services list --enabled --project=iness-mlog | grep identitytoolkit
  ```

**활성화 (필요 시)**:
```bash
gcloud services enable identitytoolkit.googleapis.com --project=iness-mlog
```

---

### Vertex AI API (확인 필요)

**확인 링크**:
```
https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=iness-mlog
```

**활성화 여부 확인**:
```bash
gcloud services list --enabled --project=iness-mlog | grep aiplatform
```

**활성화 (필요 시)**:
```bash
gcloud services enable aiplatform.googleapis.com --project=iness-mlog
```

**참고**: Gemini API는 Vertex AI 또는 Generative AI API를 통해 호출 가능합니다.

---

### Generative AI API (확인 필요 - Vertex AI 대안)

**확인 링크**:
```
https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=iness-mlog
```

**활성화 여부 확인**:
```bash
gcloud services list --enabled --project=iness-mlog | grep generativelanguage
```

**활성화 (필요 시)**:
```bash
gcloud services enable generativelanguage.googleapis.com --project=iness-mlog
```

**참고**: 현재 코드베이스에서 어떤 API를 사용하는지 확인 필요 (`functions/src/config/secrets.ts` 참조)

---

## 📝 일괄 활성화 스크립트

**모든 필수 API를 한 번에 활성화**:

```bash
#!/bin/bash
# GCP API 활성화 스크립트

PROJECT_ID="iness-mlog"

echo "🔴 필수 API 활성화 중..."

# YouTube Data API v3
gcloud services enable youtube.googleapis.com --project=$PROJECT_ID

# Custom Search API
gcloud services enable customsearch.googleapis.com --project=$PROJECT_ID

# BigQuery API
gcloud services enable bigquery.googleapis.com --project=$PROJECT_ID

# Cloud Scheduler API
gcloud services enable cloudscheduler.googleapis.com --project=$PROJECT_ID

# App Engine (Scheduler 전제조건)
gcloud app create --region=asia-northeast3 --project=$PROJECT_ID 2>/dev/null || echo "App Engine already exists"

echo "🟡 확인 필요 API 확인 중..."

# Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# Cloud Functions API
gcloud services enable cloudfunctions.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Firestore API
gcloud services enable firestore.googleapis.com --project=$PROJECT_ID

# Firebase Authentication API
gcloud services enable identitytoolkit.googleapis.com --project=$PROJECT_ID

# Vertex AI API
gcloud services enable aiplatform.googleapis.com --project=$PROJECT_ID

# Generative AI API
gcloud services enable generativelanguage.googleapis.com --project=$PROJECT_ID

echo "✅ API 활성화 완료!"
echo ""
echo "활성화된 API 목록:"
gcloud services list --enabled --project=$PROJECT_ID --filter="name:youtube.googleapis.com OR name:customsearch.googleapis.com OR name:bigquery.googleapis.com OR name:cloudscheduler.googleapis.com OR name:secretmanager.googleapis.com OR name:cloudfunctions.googleapis.com OR name:firestore.googleapis.com OR name:identitytoolkit.googleapis.com OR name:aiplatform.googleapis.com OR name:generativelanguage.googleapis.com"
```

**실행 방법**:
```bash
chmod +x enable-apis.sh
./enable-apis.sh
```

---

## ✅ 활성화 확인 체크리스트

### 필수 API 활성화 확인

- [ ] YouTube Data API v3 활성화 확인
- [ ] Custom Search API 활성화 확인
- [ ] BigQuery API 활성화 확인
- [ ] Cloud Scheduler API 활성화 확인
- [ ] App Engine 앱 생성 확인 (Scheduler 전제조건)

### 확인 필요 API 활성화 확인

- [ ] Secret Manager API 활성화 확인
- [ ] Cloud Functions API 활성화 확인
- [ ] Cloud Build API 활성화 확인 (Functions 빌드용)
- [ ] Firestore API 활성화 확인
- [ ] Firebase Authentication API 활성화 확인
- [ ] Vertex AI API 또는 Generative AI API 활성화 확인

### Secret Manager 설정 확인

- [ ] `GEMINI_API_KEY` 존재 확인
- [ ] `YOUTUBE_API_KEY` 생성 및 저장
- [ ] `GOOGLE_API_KEY` 생성 및 저장
- [ ] `CSE_ID` 생성 및 저장

### BigQuery 설정 확인

- [ ] `maumlog_analytics` 데이터셋 생성 확인
- [ ] BigQuery 권한 확인 (Functions 서비스 계정)

### Cloud Scheduler 설정 확인

- [ ] App Engine 앱 생성 확인
- [ ] 서비스 계정 권한 확인
- [ ] Scheduler 작업 생성 (코드 배포 후)

---

## 🔍 활성화 상태 확인 명령어

**모든 활성화된 API 목록 확인**:
```bash
gcloud services list --enabled --project=iness-mlog
```

**특정 API 활성화 여부 확인**:
```bash
gcloud services list --enabled --project=iness-mlog \
  --filter="name:youtube.googleapis.com"
```

**API 활성화 상태 요약**:
```bash
# 필수 API 확인
echo "=== 필수 API ==="
gcloud services list --enabled --project=iness-mlog \
  --filter="name:youtube.googleapis.com OR name:customsearch.googleapis.com OR name:bigquery.googleapis.com OR name:cloudscheduler.googleapis.com" \
  --format="table(name,title)"

# 확인 필요 API 확인
echo "=== 확인 필요 API ==="
gcloud services list --enabled --project=iness-mlog \
  --filter="name:secretmanager.googleapis.com OR name:cloudfunctions.googleapis.com OR name:firestore.googleapis.com OR name:identitytoolkit.googleapis.com OR name:aiplatform.googleapis.com OR name:generativelanguage.googleapis.com" \
  --format="table(name,title)"
```

---

## 📊 예상 비용

| API | 무료 할당량 | 예상 사용량 | 비용 |
|-----|-----------|-----------|-----|
| YouTube Data API | 10,000 units/일 | 3,000/일 | $0 |
| Custom Search API | 100 queries/일 | 50/일 | $0 |
| BigQuery | 1TB/월 쿼리, 10GB 저장 | 100GB/월, 1GB 저장 | $0 |
| Cloud Scheduler | 3 jobs/프로젝트 | 2 jobs | $0 |
| Secret Manager | 무제한 | - | $0 |
| Cloud Functions | 2M invocations/월 | 500K/월 | $0 |
| Firestore | 1GB 저장/일 | 500MB/일 | $0 |
| **총계** | | | **$0/월** |

**참고**: 모든 API가 무료 할당량 내에서 사용 가능합니다.

---

## 🚨 문제 해결

### API 활성화 실패 시

1. **권한 확인**:
   ```bash
   gcloud projects get-iam-policy iness-mlog \
     --flatten="bindings[].members" \
     --filter="bindings.members:YOUR_EMAIL"
   ```
   필요한 권한: `roles/serviceusage.serviceUsageAdmin`

2. **빌링 계정 확인**:
   ```bash
   gcloud billing accounts list
   gcloud billing projects link iness-mlog --billing-account=BILLING_ACCOUNT_ID
   ```

3. **할당량 확인**:
   - GCP Console → APIs & Services → Quotas
   - 각 API의 할당량 확인

### App Engine 생성 실패 시

- 이미 다른 리전에 App Engine 앱이 있는 경우:
  ```bash
  gcloud app describe --project=iness-mlog
  ```
- 리전 변경이 필요한 경우: GCP Console에서 확인

---

**작성 완료일**: 2026-01-20  
**다음 검토일**: API 활성화 완료 후
