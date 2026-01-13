/**
 * 에러 처리 유틸리티
 * 
 * 중앙화된 에러 처리 및 로깅 함수
 */

/**
 * 에러에서 메시지를 안전하게 추출
 * 
 * @param error 에러 객체 (unknown 타입)
 * @returns 에러 메시지 문자열
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}

/**
 * 에러를 안전하게 로깅
 * 
 * @param context 에러 발생 컨텍스트 (파일명, 함수명 등)
 * @param error 에러 객체 (unknown 타입)
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, message, error);
  }
  
  // TODO: Firebase Crashlytics 연동
  // if (typeof window !== 'undefined' && window.crashlytics) {
  //   window.crashlytics.recordError(error);
  // }
}

/**
 * 에러 객체를 Error 인스턴스로 변환
 * 
 * @param error 에러 객체 (unknown 타입)
 * @returns Error 인스턴스
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(getErrorMessage(error));
}
