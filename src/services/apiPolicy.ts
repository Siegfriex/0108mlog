/**
 * API 정책 중앙화 서비스
 * 
 * 네트워크 오류 감지, 타임아웃, 재시도, 백오프, 폴백 메커니즘 통합 관리
 */

import { TIME_CONSTANTS } from '../../constants';

export interface ApiPolicyOptions {
  timeout?: number; // 타임아웃 시간 (ms), 기본값: TIME_CONSTANTS.API_TIMEOUT
  maxRetries?: number; // 최대 재시도 횟수, 기본값: TIME_CONSTANTS.MAX_RETRIES
  retryDelay?: number; // 초기 재시도 지연 시간 (ms), 기본값: 1000
  backoffMultiplier?: number; // 백오프 배수, 기본값: 2
  fallback?: () => unknown; // 폴백 함수
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: T;
  _isMockData?: boolean; // Mock 데이터 플래그
}

/**
 * 네트워크 오류 패턴 감지
 */
function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = (error && typeof error === 'object' && 'code' in error) 
    ? String(error.code) 
    : '';

  // 네트워크 오류 패턴
  const networkErrorPatterns = [
    'Failed to fetch',
    'ECONNREFUSED',
    'ERR_CONNECTION_REFUSED',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_TIMED_OUT',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'network',
    'timeout',
    'NetworkError',
  ];

  // Firebase Functions 오류 코드
  const firebaseErrorCodes = [
    'functions/deadline-exceeded',
    'functions/unavailable',
    'functions/internal',
  ];

  const lowerMessage = errorMessage.toLowerCase();
  const lowerCode = errorCode.toLowerCase();

  return (
    networkErrorPatterns.some(pattern => 
      lowerMessage.includes(pattern.toLowerCase()) || 
      lowerCode.includes(pattern.toLowerCase())
    ) ||
    firebaseErrorCodes.some(code => lowerCode === code)
  );
}

/**
 * 지수 백오프 계산
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  multiplier: number
): number {
  return baseDelay * Math.pow(multiplier, attempt);
}

/**
 * API 호출 래퍼 (재시도/백오프/타임아웃/폴백 포함)
 * 
 * @template T 응답 타입
 * @param apiCall API 호출 함수
 * @param options 정책 옵션
 * @returns {Promise<ApiResponse<T>>} API 응답
 */
export async function callWithPolicy<T>(
  apiCall: () => Promise<T>,
  options: ApiPolicyOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = TIME_CONSTANTS.API_TIMEOUT,
    maxRetries = TIME_CONSTANTS.MAX_RETRIES,
    retryDelay = 1000,
    backoffMultiplier = 2,
    fallback,
  } = options;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 타임아웃과 API 호출을 경쟁
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, timeout);
      });

      const result = await Promise.race([apiCall(), timeoutPromise]);

      // 성공 시 응답 반환
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      lastError = error;

      // 네트워크 오류가 아니면 즉시 실패
      if (!isNetworkError(error)) {
        const errorMessage = error instanceof Error ? error.message : 'API call failed';
        
        // 폴백이 있으면 사용
        if (fallback) {
          try {
            const fallbackResult = await Promise.resolve(fallback());
            return {
              success: false,
              error: errorMessage,
              fallback: fallbackResult as T,
              _isMockData: true,
            };
          } catch (fallbackError) {
            return {
              success: false,
              error: errorMessage,
            };
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      // 마지막 시도면 중단
      if (attempt === maxRetries) {
        break;
      }

      // 백오프 지연
      const delay = calculateBackoffDelay(attempt, retryDelay, backoffMultiplier);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 모든 재시도 실패 시 폴백 사용
  const finalErrorMessage = lastError instanceof Error 
    ? lastError.message 
    : 'All retries failed';
    
  if (fallback) {
    try {
      const fallbackResult = await Promise.resolve(fallback());
      return {
        success: false,
        error: finalErrorMessage,
        fallback: fallbackResult as T,
        _isMockData: true,
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: finalErrorMessage,
      };
    }
  }

  return {
    success: false,
    error: finalErrorMessage,
  };
}
