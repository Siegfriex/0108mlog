/**
 * Rate Limit 서비스
 *
 * Bucket + Counter 기반 레이트 리밋 구현
 * Firestore를 사용하여 분산 환경에서도 동작
 */

import {getFirestore, Timestamp, FieldValue, Firestore} from "firebase-admin/firestore";

// Lazy initialization to avoid Firebase Admin not initialized error
let db: Firestore | null = null;
function getDb(): Firestore {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

interface RateLimitOptions {
  maxCalls: number;
  windowMinutes: number;
}

/**
 * 레이트 리밋 체크
 *
 * @param userId 사용자 ID
 * @param functionName 함수 이름
 * @param options 레이트 리밋 옵션
 * @returns {Promise<boolean>} true = 제한됨, false = 허용됨
 */
export const checkRateLimit = async (
  userId: string,
  functionName: string,
  options: RateLimitOptions
): Promise<boolean> => {
  const now = Date.now();
  const bucketId = Math.floor(now / (options.windowMinutes * 60 * 1000));
  const docId = `${userId}:${functionName}:${bucketId}`;
  const firestore = getDb();
  const cacheRef = firestore.collection("_rateLimit").doc(docId);

  try {
    return await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(cacheRef);

      if (!doc.exists) {
        transaction.set(cacheRef, {
          count: 1,
          expiresAt: Timestamp.fromMillis(now + options.windowMinutes * 60 * 1000),
        });
        return false; // 허용
      }

      const currentCount = doc.data()?.count || 0;
      if (currentCount >= options.maxCalls) {
        return true; // 제한됨
      }

      transaction.update(cacheRef, {count: FieldValue.increment(1)});
      return false; // 허용
    });
  } catch {
    // 에러 발생 시 허용 (안전한 폴백)
    return false;
  }
};

/**
 * 레이트 리밋 설정 프리셋
 */
export const RATE_LIMIT_PRESETS = {
  /** 일반 API 호출: 분당 30회 */
  STANDARD: {maxCalls: 30, windowMinutes: 1},
  /** LLM 호출: 분당 10회 */
  LLM: {maxCalls: 10, windowMinutes: 1},
  /** 검색 API: 분당 20회 */
  SEARCH: {maxCalls: 20, windowMinutes: 1},
  /** 민감 작업: 시간당 5회 */
  SENSITIVE: {maxCalls: 5, windowMinutes: 60},
} as const;
