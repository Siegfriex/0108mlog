/**
 * Secret Manager 헬퍼 함수
 *
 * GEMINI_API_KEY를 Secret Manager에서 안전하게 읽어옵니다.
 */

import {SecretManagerServiceClient} from "@google-cloud/secret-manager";
import {logInfo, logError, logWarn, logPerformance, LogContext} from "../utils/logger";

const client = new SecretManagerServiceClient();
const PROJECT_ID = "iness-mlog";

const secretContext: LogContext = {
  functionName: "SecretManager",
};

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

  const startTime = Date.now();

  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/GEMINI_API_KEY/versions/latest`,
    });

    const durationMs = Date.now() - startTime;
    logPerformance(secretContext, "secret_manager_access", durationMs, {
      secretName: "GEMINI_API_KEY",
      success: true,
    });

    const apiKey = version.payload?.data?.toString().trim();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in Secret Manager");
    }

    // 캐시 업데이트
    cachedGeminiApiKey = apiKey;
    cacheTimestamp = now;

    logInfo(secretContext, "API key retrieved and cached successfully");
    return apiKey;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logError(secretContext, error, {
      operation: "accessSecretVersion",
      durationMs,
    });

    // 캐시된 키가 있으면 임시로 사용 (키 로테이션 중에도 서비스 지속)
    if (cachedGeminiApiKey) {
      logWarn(secretContext, "Using cached API key due to Secret Manager error");
      return cachedGeminiApiKey;
    }

    throw new Error("Failed to retrieve GEMINI_API_KEY from Secret Manager");
  }
}

let cachedGoogleApiKey: string | null = null;
let cachedGoogleApiKeyTimestamp = 0;

/**
 * Secret Manager에서 GOOGLE_API_KEY를 읽어옵니다.
 * TTL 기반 캐싱을 통해 성능 최적화 및 키 로테이션 대응
 *
 * @returns {Promise<string>} Google API 키 (Custom Search API용)
 * @throws {Error} API 키를 가져올 수 없는 경우
 */
export async function getGoogleApiKey(): Promise<string> {
  const now = Date.now();

  // 캐시가 유효하면 반환
  if (cachedGoogleApiKey && (now - cachedGoogleApiKeyTimestamp) < CACHE_TTL) {
    return cachedGoogleApiKey;
  }

  const startTime = Date.now();

  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/GOOGLE_API_KEY/versions/latest`,
    });

    const durationMs = Date.now() - startTime;
    logPerformance(secretContext, "secret_manager_access", durationMs, {
      secretName: "GOOGLE_API_KEY",
      success: true,
    });

    const apiKey = version.payload?.data?.toString().trim();
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY not found in Secret Manager");
    }

    // 캐시 업데이트
    cachedGoogleApiKey = apiKey;
    cachedGoogleApiKeyTimestamp = now;

    logInfo(secretContext, "Google API key retrieved and cached successfully");
    return apiKey;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logError(secretContext, error, {
      operation: "accessSecretVersion",
      durationMs,
      secretName: "GOOGLE_API_KEY",
    });

    // 캐시된 키가 있으면 임시로 사용 (키 로테이션 중에도 서비스 지속)
    if (cachedGoogleApiKey) {
      logWarn(secretContext, "Using cached Google API key due to Secret Manager error");
      return cachedGoogleApiKey;
    }

    throw new Error("Failed to retrieve GOOGLE_API_KEY from Secret Manager");
  }
}

let cachedCSEId: string | null = null;
let cachedCSEIdTimestamp = 0;

/**
 * Secret Manager에서 CSE_ID를 읽어옵니다.
 * TTL 기반 캐싱을 통해 성능 최적화
 *
 * @returns {Promise<string>} Custom Search Engine ID
 * @throws {Error} CSE_ID를 가져올 수 없는 경우
 */
export async function getCSEId(): Promise<string> {
  const now = Date.now();

  // 캐시가 유효하면 반환
  if (cachedCSEId && (now - cachedCSEIdTimestamp) < CACHE_TTL) {
    return cachedCSEId;
  }

  const startTime = Date.now();

  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/CSE_ID/versions/latest`,
    });

    const durationMs = Date.now() - startTime;
    logPerformance(secretContext, "secret_manager_access", durationMs, {
      secretName: "CSE_ID",
      success: true,
    });

    const cseId = version.payload?.data?.toString().trim();
    if (!cseId) {
      throw new Error("CSE_ID not found in Secret Manager");
    }

    // 캐시 업데이트
    cachedCSEId = cseId;
    cachedCSEIdTimestamp = now;

    logInfo(secretContext, "CSE_ID retrieved and cached successfully");
    return cseId;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logError(secretContext, error, {
      operation: "accessSecretVersion",
      durationMs,
      secretName: "CSE_ID",
    });

    // 캐시된 ID가 있으면 임시로 사용
    if (cachedCSEId) {
      logWarn(secretContext, "Using cached CSE_ID due to Secret Manager error");
      return cachedCSEId;
    }

    throw new Error("Failed to retrieve CSE_ID from Secret Manager");
  }
}

let cachedYouTubeApiKey: string | null = null;
let cachedYouTubeApiKeyTimestamp = 0;

/**
 * Secret Manager에서 YOUTUBE_API_KEY를 읽어옵니다.
 * TTL 기반 캐싱을 통해 성능 최적화 및 키 로테이션 대응
 *
 * @returns {Promise<string>} YouTube API 키
 * @throws {Error} API 키를 가져올 수 없는 경우
 */
export async function getYouTubeApiKey(): Promise<string> {
  const now = Date.now();

  // 캐시가 유효하면 반환
  if (cachedYouTubeApiKey && (now - cachedYouTubeApiKeyTimestamp) < CACHE_TTL) {
    return cachedYouTubeApiKey;
  }

  const startTime = Date.now();

  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/YOUTUBE_API_KEY/versions/latest`,
    });

    const durationMs = Date.now() - startTime;
    logPerformance(secretContext, "secret_manager_access", durationMs, {
      secretName: "YOUTUBE_API_KEY",
      success: true,
    });

    const apiKey = version.payload?.data?.toString().trim();
    if (!apiKey) {
      throw new Error("YOUTUBE_API_KEY not found in Secret Manager");
    }

    // 캐시 업데이트
    cachedYouTubeApiKey = apiKey;
    cachedYouTubeApiKeyTimestamp = now;

    logInfo(secretContext, "YouTube API key retrieved and cached successfully");
    return apiKey;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logError(secretContext, error, {
      operation: "accessSecretVersion",
      durationMs,
      secretName: "YOUTUBE_API_KEY",
    });

    // 캐시된 키가 있으면 임시로 사용 (키 로테이션 중에도 서비스 지속)
    if (cachedYouTubeApiKey) {
      logWarn(secretContext, "Using cached YouTube API key due to Secret Manager error");
      return cachedYouTubeApiKey;
    }

    throw new Error("Failed to retrieve YOUTUBE_API_KEY from Secret Manager");
  }
}
