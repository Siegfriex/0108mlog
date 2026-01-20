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

        if (!mood) {
          throw new HttpsError("invalid-argument", "mood is required");
        }

        const searchEmotion = emotion || "위로";
        const query = `${searchEmotion} 시 poem ${mood}`;
        const cacheKey = `poems:${mood}:${searchEmotion}`;

        return await getCachedOrFetch(
          cacheKey,
          async () => {
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

검색어: ${searchEmotion} ${mood}
결과: ${JSON.stringify(searchResults.slice(0, 5), null, 2)}

JSON 형식으로만 응답:
[
  {"index": 0, "reason": "추천 이유"},
  {"index": 1, "reason": "추천 이유"}
]
                  `;

                  const curationResponse = await callGeminiAPI(
                    curationPrompt,
                    "gemini-3-flash-preview"
                  );

                  // JSON 추출 (```json ... ``` 제거)
                  const responseText = curationResponse || "";
                  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                  if (jsonMatch) {
                    try {
                      const curation = JSON.parse(jsonMatch[0]) as Array<{index: number; reason: string}>;
                      curatedResults = searchResults.map((item: any, idx: number) => {
                        const curationItem = curation.find((c) => c.index === idx);
                        return {
                          ...item,
                          reason: curationItem?.reason || "마음에 위로가 될 수 있는 작품입니다.",
                        };
                      });
                    } catch {
                      // JSON 파싱 실패 시 기본값 사용
                      curatedResults = searchResults.map((item: any) => ({
                        ...item,
                        reason: "마음에 위로가 될 수 있는 작품입니다.",
                      }));
                    }
                  }
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
                  totalResults: data.searchInformation?.totalResults || "0",
                },
              };
            } catch (error) {
              logError(context, error, {phase: "custom_search"});
              throw error;
            }
          },
          24 * 60 * 60 * 1000
        ); // 24시간 TTL
      }
    );
  }
);
