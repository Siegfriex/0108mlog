/**
 * 구조화된 로깅 유틸리티
 *
 * Cloud Logging과 호환되는 JSON 형식의 구조화된 로그 생성
 * 요청 추적, 성능 측정, 에러 로깅을 위한 표준화된 인터페이스 제공
 */

import * as logger from "firebase-functions/logger";

/**
 * 로그 컨텍스트 인터페이스
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  functionName: string;
  [key: string]: unknown;
}

/**
 * 로그 심각도 레벨
 */
export type LogSeverity = "DEBUG" | "INFO" | "WARN" | "ERROR";

/**
 * 구조화된 로그 엔트리 인터페이스
 */
interface StructuredLog {
  severity: LogSeverity;
  message: string;
  requestId?: string;
  userId?: string;
  functionName: string;
  timestamp: string;
  data?: unknown;
  [key: string]: unknown;
}

/**
 * 구조화된 로그 엔트리 생성
 */
function createLogEntry(
  severity: LogSeverity,
  context: LogContext,
  message: string,
  data?: unknown
): StructuredLog {
  return {
    severity,
    message,
    requestId: context.requestId,
    userId: context.userId,
    functionName: context.functionName,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * DEBUG 레벨 로그
 *
 * @param context 로그 컨텍스트
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택)
 */
export function logDebug(
  context: LogContext,
  message: string,
  data?: unknown
): void {
  const entry = createLogEntry("DEBUG", context, message, data);
  logger.debug(JSON.stringify(entry));
}

/**
 * INFO 레벨 로그
 *
 * @param context 로그 컨텍스트
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택)
 */
export function logInfo(
  context: LogContext,
  message: string,
  data?: unknown
): void {
  const entry = createLogEntry("INFO", context, message, data);
  logger.info(JSON.stringify(entry));
}

/**
 * WARN 레벨 로그
 *
 * @param context 로그 컨텍스트
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택)
 */
export function logWarn(
  context: LogContext,
  message: string,
  data?: unknown
): void {
  const entry = createLogEntry("WARN", context, message, data);
  logger.warn(JSON.stringify(entry));
}

/**
 * ERROR 레벨 로그
 *
 * @param context 로그 컨텍스트
 * @param error 에러 객체 또는 메시지
 * @param data 추가 데이터 (선택)
 */
export function logError(
  context: LogContext,
  error: Error | unknown,
  data?: unknown
): void {
  const errorObj =
    error instanceof Error ?
      {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      } :
      {errorMessage: String(error)};

  const entry: StructuredLog = {
    severity: "ERROR",
    message: errorObj.errorMessage,
    requestId: context.requestId,
    userId: context.userId,
    functionName: context.functionName,
    timestamp: new Date().toISOString(),
    ...errorObj,
    data,
  };

  logger.error(JSON.stringify(entry));
}

/**
 * 성능 측정 로그
 *
 * @param context 로그 컨텍스트
 * @param operation 측정 대상 작업명
 * @param durationMs 소요 시간 (밀리초)
 * @param metadata 추가 메타데이터 (선택)
 */
export function logPerformance(
  context: LogContext,
  operation: string,
  durationMs: number,
  metadata?: Record<string, unknown>
): void {
  const entry: StructuredLog = {
    severity: "INFO",
    message: `Performance: ${operation}`,
    type: "PERFORMANCE",
    operation,
    durationMs,
    requestId: context.requestId,
    userId: context.userId,
    functionName: context.functionName,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  logger.info(JSON.stringify(entry));
}

/**
 * 요청 시작 로그
 *
 * @param context 로그 컨텍스트
 * @param inputSummary 입력 데이터 요약 (선택)
 */
export function logRequestStart(
  context: LogContext,
  inputSummary?: Record<string, unknown>
): void {
  logInfo(context, `Request started: ${context.functionName}`, {
    event: "REQUEST_START",
    input: inputSummary,
  });
}

/**
 * 요청 완료 로그
 *
 * @param context 로그 컨텍스트
 * @param success 성공 여부
 * @param durationMs 총 소요 시간 (밀리초)
 */
export function logRequestEnd(
  context: LogContext,
  success: boolean,
  durationMs: number
): void {
  logInfo(context, `Request completed: ${context.functionName}`, {
    event: "REQUEST_END",
    success,
    durationMs,
  });
}

/**
 * 고유한 요청 ID 생성
 *
 * @returns UUID v4 형식의 요청 ID
 */
export function generateRequestId(): string {
  // crypto.randomUUID()가 없는 환경을 위한 폴백
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 간단한 UUID v4 생성
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default {
  logDebug,
  logInfo,
  logWarn,
  logError,
  logPerformance,
  logRequestStart,
  logRequestEnd,
  generateRequestId,
};
