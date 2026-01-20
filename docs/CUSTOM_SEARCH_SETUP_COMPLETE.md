# Custom Search API 설정 완료 가이드

**작성일**: 2026-01-20  
**Search Engine ID**: `728e72197c5ad4ad9`  
**상태**: ✅ Search Engine 생성 완료

---

## 📋 완료된 작업

- ✅ Programmable Search Engine 생성 완료
- ✅ Search Engine ID (cx): `728e72197c5ad4ad9`
- ✅ 사이트 설정 완료 (12-18개 사이트)

---

## 🔧 다음 단계: Google API Key 발급 및 저장

### 1. Google API Key 발급

**방법 1: GCP Console에서 발급**

1. GCP Console 접속:
   ```
   https://console.cloud.google.com/apis/credentials?project=iness-mlog
   ```

2. "사용자 인증 정보 만들기" → "API 키" 클릭

3. API 키 이름: `Custom Search API Key`

4. API 제한 설정:
   - **애플리케이션 제한사항**: 
     - HTTP 리퍼러(웹사이트) 선택
     - 허용된 리퍼러에 다음 추가:
       ```
       https://iness-mlog.web.app/*
       https://iness-mlog.firebaseapp.com/*
       https://asia-northeast3-iness-mlog.cloudfunctions.net/*
       ```
   
   - **API 제한사항**:
     - "키 제한" 선택
     - "Custom Search API"만 선택

5. "만들기" 클릭

6. API 키 복사 (한 번만 표시되므로 안전하게 보관)

**방법 2: CLI로 발급** (고급)

```bash
# API 키 생성 (제한 없음 - 나중에 Console에서 제한 설정 필요)
gcloud alpha services api-keys create \
  --display-name="Custom Search API Key" \
  --project=iness-mlog
```

---

### 2. Secret Manager에 저장

#### CSE_ID 저장 (이미 생성됨)

```bash
# Search Engine ID 저장
echo -n "728e72197c5ad4ad9" | gcloud secrets create CSE_ID \
  --data-file=- \
  --project=iness-mlog \
  --replication-policy="automatic"
```

**또는 이미 존재하는 경우 업데이트**:
```bash
echo -n "728e72197c5ad4ad9" | gcloud secrets versions add CSE_ID \
  --data-file=- \
  --project=iness-mlog
```

#### GOOGLE_API_KEY 저장

```bash
# Google API Key 저장 (위에서 발급한 키 사용)
echo -n "YOUR_GOOGLE_API_KEY_HERE" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- \
  --project=iness-mlog \
  --replication-policy="automatic"
```

**주의**: `YOUR_GOOGLE_API_KEY_HERE`를 실제 발급받은 API 키로 교체하세요.

---

### 3. Secret 확인

```bash
# 저장된 Secret 목록 확인
gcloud secrets list --project=iness-mlog

# 특정 Secret 값 확인 (테스트용)
gcloud secrets versions access latest --secret="CSE_ID" --project=iness-mlog
gcloud secrets versions access latest --secret="GOOGLE_API_KEY" --project=iness-mlog
```

---

## 💻 Functions 코드 구현

### 3.1 Secret Manager에서 읽기 (기존 방식)

**신규 파일**: `functions/src/config/secrets.ts` (확장)

```typescript
// 기존 getGeminiApiKey() 함수 아래에 추가

/**
 * Secret Manager에서 CSE_ID를 읽어옵니다.
 */
export async function getCSEId(): Promise<string> {
  const startTime = Date.now();
  
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/CSE_ID/versions/latest`,
    });
    
    const cseId = version.payload?.data?.toString();
    if (!cseId) {
      throw new Error("CSE_ID not found in Secret Manager");
    }
    
    logInfo(secretContext, "CSE_ID retrieved successfully");
    return cseId;
  } catch (error) {
    logError(secretContext, error, {
      operation: "accessSecretVersion",
      secretName: "CSE_ID",
    });
    throw new Error("Failed to retrieve CSE_ID from Secret Manager");
  }
}

/**
 * Secret Manager에서 GOOGLE_API_KEY를 읽어옵니다.
 */
export async function getGoogleApiKey(): Promise<string> {
  const startTime = Date.now();
  
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/GOOGLE_API_KEY/versions/latest`,
    });
    
    const apiKey = version.payload?.data?.toString();
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY not found in Secret Manager");
    }
    
    logInfo(secretContext, "GOOGLE_API_KEY retrieved successfully");
    return apiKey;
  } catch (error) {
    logError(secretContext, error, {
      operation: "accessSecretVersion",
      secretName: "GOOGLE_API_KEY",
    });
    throw new Error("Failed to retrieve GOOGLE_API_KEY from Secret Manager");
  }
}
```

### 3.2 Custom Search Function 구현

**신규 파일**: `functions/src/api/customSearch.ts`

```typescript
/**
 * Custom Search API Callable Functions
 *
 * 시/문학/명언 검색을 위한 Custom Search API 통합
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getCachedOrFetch} from "../services/cacheService";
import {getCSEId, getGoogleApiKey} from "../config/secrets";
import {callGeminiAPI} from "../services/gemini";
import {measurePerformance} from "../middleware/performance";
import {logError, logInfo, generateRequestId} from "../utils/logger";

/**
 * 시/문학 검색
 */
export const searchPoems = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30,
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    return await measurePerformance(
      "searchPoems",
      request,
      async () => {
        // ✅ 인증 체크
        if (!request.auth) {
          throw new HttpsError("unauthenticated", "Authentication required");
        }

        const requestId = generateRequestId();
        const context = {
          requestId,
          userId: request.auth.uid,
          functionName: "searchPoems",
        };

        const {mood, emotion} = request.data;

        if (!mood || !emotion) {
          throw new HttpsError("invalid-argument", "mood and emotion are required");
        }

        const query = `${emotion} 시 poem ${mood}`;
        const cacheKey = `poems:${mood}:${emotion}`;

        return await getCachedOrFetch(cacheKey, async () => {
          try {
            // Secret Manager에서 키 가져오기
            const [googleApiKey, cseId] = await Promise.all([
              getGoogleApiKey(),
              getCSEId(),
            ]);

            // Custom Search API 호출
            const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
            searchUrl.searchParams.set("key", googleApiKey);
            searchUrl.searchParams.set("cx", cseId);
            searchUrl.searchParams.set("q", query);
            searchUrl.searchParams.set("num", "10");
            searchUrl.searchParams.set("lr", "lang_ko"); // 한국어 우선

            logInfo(context, `Searching: ${query}`);

            const response = await fetch(searchUrl.toString());

            if (!response.ok) {
              const errorText = await response.text();
              logError(context, new Error(`Custom Search API error: ${errorText}`), {
                status: response.status,
              });
              throw new HttpsError("internal", "Custom Search API 호출 실패");
            }

            const data = await response.json();

            // 검색 결과 파싱
            const searchResults = (data.items || []).map((item: any) => ({
              title: item.title || "",
              link: item.link || "",
              snippet: item.snippet?.substring(0, 150) || "",
              source: new URL(item.link).hostname,
            }));

            // Gemini로 큐레이션 설명 생성 (선택)
            let curatedResults = searchResults;
            if (searchResults.length > 0) {
              try {
                const curationPrompt = `
다음 시/문학 검색 결과에 대해 각각 한 줄 추천 이유를 작성해주세요.
중요: 원문을 복사하지 말고, 작품의 특징과 감상 포인트만 설명하세요.

검색어: ${emotion} ${mood}
결과: ${JSON.stringify(searchResults.slice(0, 5), null, 2)}

JSON 형식으로만 응답:
[
  {"index": 0, "reason": "추천 이유"},
  {"index": 1, "reason": "추천 이유"}
]
                `;

                const curationResponse = await callGeminiAPI(curationPrompt, "gemini-3-flash-preview");
                const curation = JSON.parse(curationResponse);

                curatedResults = searchResults.map((item: any, idx: number) => ({
                  ...item,
                  reason: curation[idx]?.reason || "마음에 위로가 될 수 있는 작품입니다.",
                }));
              } catch (error) {
                logError(context, error, {phase: "gemini_curation"});
                // Gemini 실패해도 검색 결과는 반환
              }
            }

            logInfo(context, `Found ${curatedResults.length} results`);

            return {
              success: true,
              data: {
                poems: curatedResults,
                query,
                totalResults: data.searchInformation?.totalResults || 0,
              },
            };
          } catch (error) {
            logError(context, error, {phase: "custom_search"});
            throw error;
          }
        }, 24 * 60 * 60 * 1000); // 24시간 TTL
      }
    );
  }
);
```

### 3.3 Cache Service 구현

**신규 파일**: `functions/src/services/cacheService.ts`

```typescript
/**
 * API 캐싱 서비스
 *
 * Firestore를 사용한 TTL 기반 캐싱
 */

import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {logInfo, logError, LogContext} from "../utils/logger";

const db = getFirestore();
const CACHE_COLLECTION = "_apiCache";

/**
 * 캐시된 데이터 가져오기 또는 새로 가져오기
 *
 * @param cacheKey 캐시 키
 * @param fetchFn 데이터를 가져오는 함수
 * @param ttlMs TTL (밀리초), 기본값: 24시간
 * @returns 캐시된 데이터 또는 새로 가져온 데이터
 */
export async function getCachedOrFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 24 * 60 * 60 * 1000
): Promise<T> {
  const context: LogContext = {
    functionName: "CacheService",
    requestId: cacheKey,
  };

  try {
    const cacheRef = db.collection(CACHE_COLLECTION).doc(cacheKey);
    const cacheDoc = await cacheRef.get();

    // 캐시가 있고 유효하면 반환
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const expiresAt = cacheData?.expiresAt as Timestamp;

      if (expiresAt && expiresAt.toMillis() > Date.now()) {
        logInfo(context, "Cache hit", {cacheKey});
        return cacheData?.data as T;
      }

      logInfo(context, "Cache expired", {cacheKey});
    }

    // 캐시가 없거나 만료되었으면 새로 가져오기
    logInfo(context, "Cache miss, fetching fresh data", {cacheKey});
    const freshData = await fetchFn();

    // 캐시 저장
    await cacheRef.set({
      data: freshData,
      expiresAt: Timestamp.fromMillis(Date.now() + ttlMs),
      createdAt: Timestamp.now(),
    });

    return freshData;
  } catch (error) {
    logError(context, error, {operation: "getCachedOrFetch"});
    // 캐시 오류 시에도 데이터는 반환
    return await fetchFn();
  }
}
```

### 3.4 Functions Index에 Export 추가

**수정 파일**: `functions/src/index.ts`

```typescript
// 기존 export 아래에 추가
export {
  searchPoems,
} from "./api/customSearch";
```

---

## 🎨 프론트엔드 구현

### 4.1 Hook 구현

**신규 파일**: `src/hooks/useCustomSearch.ts`

```typescript
/**
 * Custom Search API Hook
 *
 * 시/문학 검색을 위한 Hook
 */

import {useState, useEffect} from "react";
import {callFunction} from "../services/functions";

interface PoemResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  reason?: string;
}

interface SearchPoemsResponse {
  success: boolean;
  data?: {
    poems: PoemResult[];
    query: string;
    totalResults: string;
  };
  error?: string;
}

export const usePoemSearch = (mood: string, emotion?: string) => {
  const [data, setData] = useState<PoemResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const searchPoems = async () => {
      if (!mood) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await callFunction<{
          mood: string;
          emotion?: string;
        }, SearchPoemsResponse>("searchPoems", {
          mood,
          emotion: emotion || "위로",
        });

        if (response.success && response.data) {
          setData(response.data.poems);
        } else {
          throw new Error(response.error || "검색 실패");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("검색 중 오류 발생"));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    searchPoems();
  }, [mood, emotion]);

  return {data, isLoading, error};
};
```

### 4.2 컴포넌트 구현

**신규 파일**: `src/components/ui/PoemCard.tsx`

```typescript
/**
 * 시/문학 카드 컴포넌트
 */

import React from "react";
import {ExternalLink} from "lucide-react";

interface PoemCardProps {
  title: string;
  link: string;
  snippet: string;
  source: string;
  reason?: string;
}

export const PoemCard: React.FC<PoemCardProps> = ({
  title,
  link,
  snippet,
  source,
  reason,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">
          {title}
        </h3>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-blue-600 hover:text-blue-800"
        >
          <ExternalLink size={18} />
        </a>
      </div>
      
      <p className="text-sm text-gray-600 mb-2 line-clamp-3">
        {snippet}
      </p>
      
      {reason && (
        <p className="text-xs text-gray-500 italic mb-2">
          💡 {reason}
        </p>
      )}
      
      <p className="text-xs text-gray-400">
        출처: {source}
      </p>
    </div>
  );
};
```

### 4.3 페이지 연동

**수정 파일**: `src/pages/content/ContentPoems.tsx`

```typescript
import React, {useState} from "react";
import {usePoemSearch} from "../../hooks/useCustomSearch";
import {PoemCard} from "../../components/ui/PoemCard";

export const ContentPoems: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState("위로");
  const [selectedEmotion, setSelectedEmotion] = useState<string | undefined>();

  const {data: poems, isLoading, error} = usePoemSearch(
    selectedMood,
    selectedEmotion
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">시를 찾고 있어요...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-2">검색 중 오류가 발생했습니다.</div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mood 선택기 */}
      <div className="flex gap-2 flex-wrap">
        {["위로", "격려", "희망", "평화", "힘"].map((mood) => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedMood === mood
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* 검색 결과 */}
      {poems && poems.length > 0 ? (
        <div className="space-y-3">
          {poems.map((poem, index) => (
            <PoemCard
              key={`${poem.link}-${index}`}
              title={poem.title}
              link={poem.link}
              snippet={poem.snippet}
              source={poem.source}
              reason={poem.reason}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
};
```

---

## ✅ 설정 완료 체크리스트

### Secret Manager 설정

- [ ] `CSE_ID` Secret 생성 및 저장 (`728e72197c5ad4ad9`)
- [ ] `GOOGLE_API_KEY` Secret 생성 및 저장
- [ ] Secret 접근 권한 확인 (Functions 서비스 계정)

### Functions 코드

- [ ] `functions/src/config/secrets.ts`에 `getCSEId()`, `getGoogleApiKey()` 추가
- [ ] `functions/src/services/cacheService.ts` 생성
- [ ] `functions/src/api/customSearch.ts` 생성
- [ ] `functions/src/index.ts`에 `searchPoems` export 추가

### 프론트엔드 코드

- [ ] `src/hooks/useCustomSearch.ts` 생성
- [ ] `src/components/ui/PoemCard.tsx` 생성
- [ ] `src/pages/content/ContentPoems.tsx` 수정

### 테스트

- [ ] Functions 배포
- [ ] 프론트엔드에서 검색 테스트
- [ ] 캐싱 동작 확인
- [ ] 에러 처리 확인

---

## 🧪 테스트 방법

### 1. Functions 로컬 테스트

```bash
cd functions
npm run build
npm run serve

# 다른 터미널에서
curl -X POST http://localhost:5001/iness-mlog/asia-northeast3/searchPoems \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "mood": "위로",
      "emotion": "슬픔"
    }
  }'
```

### 2. 배포 후 테스트

```bash
# Functions 배포
cd functions
npm run deploy

# 프론트엔드에서 ContentPoems 페이지 접속하여 테스트
```

---

## 📝 참고사항

### 제공된 스크립트 사용 안 함

Google에서 제공한 다음 스크립트는 **사용하지 않습니다**:
```html
<script async src="https://cse.google.com/cse.js?cx=728e72197c5ad4ad9"></script>
<div class="gcse-search"></div>
```

**이유**:
- 마음로그는 Firebase Functions를 통해 Custom Search API를 호출합니다
- 프론트엔드에서 직접 Google 스크립트를 로드하지 않습니다
- 보안 및 비용 관리 목적

### 대신 사용하는 방법

1. 프론트엔드 → `usePoemSearch` Hook 호출
2. Hook → `callFunction("searchPoems", {...})` 호출
3. Functions → Custom Search API 호출
4. Functions → 결과 반환
5. 프론트엔드 → `PoemCard` 컴포넌트로 표시

---

**작성 완료일**: 2026-01-20  
**다음 단계**: Google API Key 발급 및 Secret Manager 저장
