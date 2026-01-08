/**
 * Secret Manager 헬퍼 함수
 *
 * GEMINI_API_KEY를 Secret Manager에서 안전하게 읽어옵니다.
 */

import {SecretManagerServiceClient} from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();
const PROJECT_ID = "iness-mlog";

let cachedGeminiApiKey: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1시간

/**
 * Secret Manager에서 GEMINI_API_KEY를 읽어옵니다.
 * TTL 기반 캐싱을 통해 성능 최적화 및 키 로테이션 대응
 *
 * @returns {Promise<string>} Gemini API 키
 * @throws {Error} API 키를 가져올 수 없는 경우
 */
export async function getGeminiApiKey(): Promise<string> {
  const now = Date.now();

  // 캐시가 유효하면 반환
  if (cachedGeminiApiKey && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedGeminiApiKey;
  }

  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/GEMINI_API_KEY/versions/latest`,
    });

    const apiKey = version.payload?.data?.toString();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in Secret Manager");
    }

    // 캐시 업데이트
    cachedGeminiApiKey = apiKey;
    cacheTimestamp = now;
    return apiKey;
  } catch (error) {
    console.error("Error accessing GEMINI_API_KEY:", error);

    // 캐시된 키가 있으면 임시로 사용 (키 로테이션 중에도 서비스 지속)
    if (cachedGeminiApiKey) {
      console.warn("Using cached API key due to Secret Manager error");
      return cachedGeminiApiKey;
    }

    throw new Error("Failed to retrieve GEMINI_API_KEY from Secret Manager");
  }
}
