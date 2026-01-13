/**
 * 성능 측정 미들웨어
 *
 * Firebase Callable Functions의 실행 시간 측정 및 로깅
 * Cold start 감지, 메모리 사용량 추적 포함
 */

import {CallableRequest} from "firebase-functions/v2/https";
import {
  logPerformance,
  logRequestStart,
  logRequestEnd,
  logError,
  generateRequestId,
  LogContext,
} from "../utils/logger";
import {logMemoryUsage} from "../utils/monitoring";

/**
 * 성능 측정 옵션
 */
interface PerformanceOptions {
  /** 메모리 사용량 로깅 활성화 */
  trackMemory?: boolean;
  /** 입력 데이터 요약 로깅 활성화 */
  logInput?: boolean;
  /** 입력 데이터 요약 생성 함수 */
  summarizeInput?: (data: unknown) => Record<string, unknown>;
}

/**
 * 성능 측정 래퍼 함수
 *
 * Callable Function을 래핑하여 실행 시간, 메모리 사용량 등을 측정합니다.
 *
 * @template T 반환 타입
 * @param functionName 함수 이름
 * @param request Callable 요청 객체
 * @param operation 실제 실행할 작업
 * @param options 측정 옵션 (선택)
 * @returns 작업 결과
 */
export async function measurePerformance<T>(
  functionName: string,
  request: CallableRequest,
  operation: () => Promise<T>,
  options: PerformanceOptions = {}
): Promise<T> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const userId = request.auth?.uid || "anonymous";

  const context: LogContext = {
    requestId,
    userId,
    functionName,
  };

  const {trackMemory = true, logInput = false, summarizeInput} = options;

  // 요청 시작 로깅
  const inputSummary =
    logInput && summarizeInput ? summarizeInput(request.data) : undefined;
  logRequestStart(context, inputSummary);

  // 시작 시점 메모리 사용량
  if (trackMemory) {
    logMemoryUsage(context, "start");
  }

  try {
    // 작업 실행
    const result = await operation();
    const durationMs = Date.now() - startTime;

    // 종료 시점 메모리 사용량
    if (trackMemory) {
      logMemoryUsage(context, "end");
    }

    // 성능 로그
    logPerformance(context, functionName, durationMs, {
      success: true,
    });

    // 요청 완료 로깅
    logRequestEnd(context, true, durationMs);

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    // 에러 로깅
    logError(context, error, {
      durationMs,
      phase: "execution",
    });

    // 성능 로그 (실패)
    logPerformance(context, functionName, durationMs, {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    // 요청 완료 로깅 (실패)
    logRequestEnd(context, false, durationMs);

    throw error;
  }
}

/**
 * 개별 작업 성능 측정
 *
 * 함수 내 특정 작업의 실행 시간을 측정합니다.
 *
 * @template T 반환 타입
 * @param context 로그 컨텍스트
 * @param operationName 작업 이름
 * @param operation 실행할 작업
 * @returns 작업 결과
 */
export async function measureOperation<T>(
  context: LogContext,
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const durationMs = Date.now() - startTime;

    logPerformance(context, operationName, durationMs, {
      success: true,
    });

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logPerformance(context, operationName, durationMs, {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Cold start 감지
 *
 * 인스턴스 초기화 여부를 판단하여 Cold start를 감지합니다.
 */
let isWarm = false;

/**
 * Cold start 여부 확인 및 표시
 *
 * @param context 로그 컨텍스트
 * @returns Cold start 여부
 */
export function checkColdStart(context: LogContext): boolean {
  if (!isWarm) {
    isWarm = true;
    logPerformance(context, "cold_start", 0, {
      type: "COLD_START",
      isFirstRequest: true,
    });
    return true;
  }
  return false;
}
