/**
 * API 캐싱 서비스
 *
 * Firestore를 사용한 TTL 기반 캐싱
 */

import {getFirestore, Timestamp, Firestore} from "firebase-admin/firestore";
import {logInfo, logError, LogContext} from "../utils/logger";

const CACHE_COLLECTION = "_apiCache";

// Lazy initialization to avoid Firebase Admin not initialized error
let db: Firestore | null = null;
function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

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
    const cacheRef = getDb().collection(CACHE_COLLECTION).doc(cacheKey);
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

    logInfo(context, "Cache saved", {cacheKey, ttlMs});
    return freshData;
  } catch (error) {
    logError(context, error, {operation: "getCachedOrFetch"});
    // 캐시 오류 시에도 데이터는 반환
    return await fetchFn();
  }
}
