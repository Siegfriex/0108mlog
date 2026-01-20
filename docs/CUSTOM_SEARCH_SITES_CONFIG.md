# Custom Search API 사이트 설정 가이드

**작성일**: 2026-01-20  
**용도**: 마음로그 ContentPoems 페이지용 Programmable Search Engine 설정

---

## 📋 추천 사이트 주소 풀

### 🎯 Phase 1: 핵심 사이트 (필수)

#### 한국 시/문학 사이트

```
munhak.com/*
poem.co.kr/*
poetry.kr/*
koreapoem.com/*
```

**설명**:
- `munhak.com/*`: 한국 문학 종합 사이트
- `poem.co.kr/*`: 시 전문 사이트
- `poetry.kr/*`: 한국 시 전문
- `koreapoem.com/*`: 한국 시 모음

#### 영미 시/문학 사이트

```
poetryfoundation.org/*
poets.org/*
poetry.com/*
allpoetry.com/*
```

**설명**:
- `poetryfoundation.org/*`: Poetry Foundation (권위 있는 시 사이트)
- `poets.org/*`: Academy of American Poets
- `poetry.com/*`: Poetry.com
- `allpoetry.com/*`: All Poetry (커뮤니티 기반)

#### 명언/인용구 사이트

```
goodreads.com/quotes/*
brainyquote.com/*
quotefancy.com/*
azquotes.com/*
```

**설명**:
- `goodreads.com/quotes/*`: Goodreads 명언 섹션
- `brainyquote.com/*`: BrainyQuote (다양한 주제)
- `quotefancy.com/*`: Quote Fancy (시각적 명언)
- `azquotes.com/*`: AZ Quotes (주제별 명언)

---

### 🎯 Phase 2: 확장 사이트 (권장)

#### 심리/힐링 관련 사이트

```
psychologytoday.com/us/articles/*
verywellmind.com/*
healthline.com/health/mental-health/*
mindful.org/*
```

**설명**:
- `psychologytoday.com/us/articles/*`: 심리학 전문 기사
- `verywellmind.com/*`: 정신 건강 정보
- `healthline.com/health/mental-health/*`: 정신 건강 기사
- `mindful.org/*`: 마음챙김 전문

#### 한국어 힐링 콘텐츠

```
mindfulnesskorea.org/*
mindfulness.or.kr/*
```

**설명**:
- 한국어 마음챙김/명상 관련 콘텐츠

---

## 🔧 Programmable Search Engine 설정 방법

### 1. 기본 설정

**검색 엔진 이름**: `마음로그 시/문학/명언 검색`

**언어 설정**:
- 한국어
- 영어

**검색 모드**: "특정 사이트 또는 페이지 검색" 선택

### 2. 사이트 주소 입력 (단계별)

#### Step 1: 핵심 사이트 추가

```
munhak.com/*
poem.co.kr/*
poetry.kr/*
koreapoem.com/*
poetryfoundation.org/*
poets.org/*
poetry.com/*
allpoetry.com/*
goodreads.com/quotes/*
brainyquote.com/*
quotefancy.com/*
azquotes.com/*
```

#### Step 2: 확장 사이트 추가 (선택)

```
psychologytoday.com/us/articles/*
verywellmind.com/*
healthline.com/health/mental-health/*
mindful.org/*
mindfulnesskorea.org/*
mindfulness.or.kr/*
```

### 3. 검색 패턴 예시

**사용자 검색어 예시**:
- `슬픔 시` → 한국 시 사이트에서 검색
- `위로 poem` → 영미 시 사이트에서 검색
- `힘들 때 명언` → 명언 사이트에서 검색
- `불안 시` → 모든 사이트에서 검색

---

## 📝 최종 사이트 주소 풀 (복사용)

### 최소 구성 (12개 사이트)

```
munhak.com/*
poem.co.kr/*
poetry.kr/*
koreapoem.com/*
poetryfoundation.org/*
poets.org/*
poetry.com/*
allpoetry.com/*
goodreads.com/quotes/*
brainyquote.com/*
quotefancy.com/*
azquotes.com/*
```

### 권장 구성 (18개 사이트)

```
munhak.com/*
poem.co.kr/*
poetry.kr/*
koreapoem.com/*
poetryfoundation.org/*
poets.org/*
poetry.com/*
allpoetry.com/*
goodreads.com/quotes/*
brainyquote.com/*
quotefancy.com/*
azquotes.com/*
psychologytoday.com/us/articles/*
verywellmind.com/*
healthline.com/health/mental-health/*
mindful.org/*
mindfulnesskorea.org/*
mindfulness.or.kr/*
```

---

## 🎨 사이트별 특성 및 활용

### 한국 시 사이트

| 사이트 | 특성 | 활용 |
|--------|------|------|
| `munhak.com/*` | 한국 문학 종합 | 다양한 문학 작품 |
| `poem.co.kr/*` | 시 전문 | 현대 시 중심 |
| `poetry.kr/*` | 시 전문 | 한국 시 모음 |
| `koreapoem.com/*` | 한국 시 | 전통/현대 시 |

**검색 예시**: `슬픔`, `위로`, `힘듦`, `불안`

### 영미 시 사이트

| 사이트 | 특성 | 활용 |
|--------|------|------|
| `poetryfoundation.org/*` | 권위 있는 시 사이트 | 고전/현대 시 |
| `poets.org/*` | 미국 시인 협회 | 전문 시 작품 |
| `poetry.com/*` | 시 커뮤니티 | 다양한 시 |
| `allpoetry.com/*` | 시 커뮤니티 | 사용자 제작 시 |

**검색 예시**: `sadness`, `comfort`, `anxiety`, `hope`

### 명언 사이트

| 사이트 | 특성 | 활용 |
|--------|------|------|
| `goodreads.com/quotes/*` | 책 인용구 | 문학적 명언 |
| `brainyquote.com/*` | 종합 명언 | 다양한 주제 |
| `quotefancy.com/*` | 시각적 명언 | 이미지 포함 |
| `azquotes.com/*` | 주제별 명언 | 분류된 명언 |

**검색 예시**: `힘들 때`, `위로`, `격려`, `희망`

### 심리/힐링 사이트 (확장)

| 사이트 | 특성 | 활용 |
|--------|------|------|
| `psychologytoday.com/us/articles/*` | 심리학 전문 | 심리 기사 |
| `verywellmind.com/*` | 정신 건강 | 건강 정보 |
| `healthline.com/health/mental-health/*` | 정신 건강 | 의학적 정보 |
| `mindful.org/*` | 마음챙김 | 명상 콘텐츠 |

**검색 예시**: `불안 관리`, `스트레스`, `명상`, `마음챙김`

---

## ⚙️ 설정 시 주의사항

### 1. 와일드카드 사용

- `*.example.com`: 전체 도메인 (모든 서브도메인 포함)
- `example.com/*`: 전체 사이트 (모든 페이지)
- `example.com/docs/*`: 특정 디렉토리만
- `example.com/page.html`: 특정 페이지만

### 2. 검색 품질 최적화

**권장 사이트 수**: 12-20개
- 너무 적으면: 검색 결과 부족
- 너무 많으면: 검색 품질 저하

**사이트 선택 기준**:
- ✅ 신뢰할 수 있는 사이트
- ✅ 정기적으로 업데이트되는 사이트
- ✅ 저작권 문제 없는 사이트
- ❌ 광고가 많은 사이트 제외
- ❌ 스팸성 사이트 제외

### 3. 언어 설정

**권장 설정**:
- 한국어: 한국 시 사이트용
- 영어: 영미 시/명언 사이트용

**검색 결과 언어 필터링**:
- Custom Search API의 `lr=lang_ko` 파라미터 사용
- 또는 `lr=lang_en` 파라미터 사용

---

## 🔍 검색 쿼리 예시

### 감정별 검색 쿼리

| 감정 | 한국어 쿼리 | 영어 쿼리 |
|------|-----------|----------|
| 슬픔 | `슬픔 시` | `sadness poem` |
| 불안 | `불안 시` | `anxiety poem` |
| 분노 | `분노 시` | `anger poem` |
| 기쁨 | `기쁨 시` | `joy poem` |
| 위로 | `위로 시` | `comfort poem` |
| 희망 | `희망 시` | `hope poem` |

### 상황별 검색 쿼리

| 상황 | 쿼리 예시 |
|------|----------|
| 힘들 때 | `힘들 때 명언`, `힘듦 시` |
| 위로가 필요할 때 | `위로 시`, `comfort poem` |
| 격려가 필요할 때 | `격려 명언`, `encouragement quote` |
| 불안할 때 | `불안 시`, `anxiety poem` |

---

## 📊 사이트 검증 체크리스트

각 사이트 추가 전 확인:

- [ ] 사이트 접근 가능 여부 확인
- [ ] 검색 결과 품질 확인
- [ ] 저작권 정책 확인
- [ ] 업데이트 빈도 확인
- [ ] 광고/스팸 여부 확인

---

## 🚀 빠른 시작 가이드

### 1단계: Programmable Search Engine 생성

1. https://programmablesearchengine.google.com/controlpanel/create 접속
2. 검색 엔진 이름: `마음로그 시/문학 검색`
3. 검색할 사이트: "특정 사이트 또는 페이지 검색" 선택

### 2단계: 사이트 주소 입력

**최소 구성 (12개)**:
```
munhak.com/*
poem.co.kr/*
poetry.kr/*
koreapoem.com/*
poetryfoundation.org/*
poets.org/*
poetry.com/*
allpoetry.com/*
goodreads.com/quotes/*
brainyquote.com/*
quotefancy.com/*
azquotes.com/*
```

각 사이트를 한 줄씩 입력하고 "추가" 버튼 클릭

### 3단계: 설정 완료

1. "만들기" 클릭
2. Search Engine ID (cx) 확인 및 저장
3. Secret Manager에 저장:
   ```bash
   echo -n "YOUR_CSE_ID" | gcloud secrets create CSE_ID \
     --data-file=- \
     --project=iness-mlog \
     --replication-policy="automatic"
   ```

---

## ✅ 생성 완료된 Search Engine 정보

**Search Engine ID (cx)**: `728e72197c5ad4ad9`

**다음 단계**:
1. Google API Key 발급 (Custom Search API용)
2. Secret Manager에 저장
3. Functions 코드 구현

---

## 📝 코드에서 사용 예시

```typescript
// functions/src/api/customSearch.ts
const query = `${emotion} 시 poem ${mood}`;

const response = await fetch(
  `https://www.googleapis.com/customsearch/v1?` +
  `key=${GOOGLE_API_KEY.value()}&cx=${CSE_ID.value()}&` +
  `q=${encodeURIComponent(query)}&num=10&lr=lang_ko`
);
```

**파라미터 설명**:
- `q`: 검색 쿼리 (`${emotion} 시 poem ${mood}`)
- `num`: 결과 개수 (최대 10개)
- `lr`: 언어 제한 (`lang_ko`: 한국어, `lang_en`: 영어)

---

**작성 완료일**: 2026-01-20  
**다음 단계**: Programmable Search Engine 생성 및 테스트
