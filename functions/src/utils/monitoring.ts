/**
 * 모니터링 유틸리티
 *
 * 메모리 사용량, 리소스 상태 등 시스템 메트릭 수집
 */

import {logPerformance, LogContext} from "./logger";

/**
 * 메모리 사용량 정보
 */
interface MemoryUsage {
  /** Heap 사용량 (MB) */
  heapUsed: number;
  /** Heap 전체 크기 (MB) */
  heapTotal: number;
  /** 외부 메모리 (MB) */
  external: number;
  /** RSS (Resident Set Size) (MB) */
  rss: number;
  /** Array Buffers (MB) */
  arrayBuffers?: number;
}

/**
 * 메모리 사용량을 MB 단위로 변환
 *
 * @param bytes 바이트 값
 * @returns MB 단위 값 (소수점 2자리)
 */
function bytesToMB(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

/**
 * 현재 메모리 사용량 조회
 *
 * @returns 메모리 사용량 정보 또는 null (사용 불가 시)
 */
export function getMemoryUsage(): MemoryUsage | null {
  if (typeof process === "undefined" || !process.memoryUsage) {
    return null;
  }

  const memUsage = process.memoryUsage();

  return {
    heapUsed: bytesToMB(memUsage.heapUsed),
    heapTotal: bytesToMB(memUsage.heapTotal),
    external: bytesToMB(memUsage.external),
    rss: bytesToMB(memUsage.rss),
    arrayBuffers: memUsage.arrayBuffers ?
      bytesToMB(memUsage.arrayBuffers) :
      undefined,
  };
}

/**
 * 메모리 사용량 로깅
 *
 * @param context 로그 컨텍스트
 * @param phase 측정 시점 (start, end, checkpoint 등)
 */
export function logMemoryUsage(
  context: LogContext,
  phase: "start" | "end" | "checkpoint" = "checkpoint"
): void {
  const memUsage = getMemoryUsage();

  if (!memUsage) {
    return;
  }

  logPerformance(context, `memory_usage_${phase}`, 0, {
    type: "MEMORY",
    phase,
    heapUsedMB: memUsage.heapUsed,
    heapTotalMB: memUsage.heapTotal,
    externalMB: memUsage.external,
    rssMB: memUsage.rss,
    arrayBuffersMB: memUsage.arrayBuffers,
  });
}

/**
 * 메모리 사용량 임계치 확인
 *
 * @param thresholdMB 임계치 (MB)
 * @returns 임계치 초과 여부
 */
export function isMemoryThresholdExceeded(thresholdMB: number): boolean {
  const memUsage = getMemoryUsage();

  if (!memUsage) {
    return false;
  }

  return memUsage.heapUsed > thresholdMB;
}

/**
 * 메모리 경고 로깅
 *
 * 임계치를 초과한 경우 경고 로그를 남깁니다.
 *
 * @param context 로그 컨텍스트
 * @param thresholdMB 임계치 (MB), 기본값: 400MB
 */
export function checkMemoryWarning(
  context: LogContext,
  thresholdMB = 400
): void {
  const memUsage = getMemoryUsage();

  if (!memUsage) {
    return;
  }

  if (memUsage.heapUsed > thresholdMB) {
    logPerformance(context, "memory_warning", 0, {
      type: "MEMORY_WARNING",
      severity: "WARN",
      thresholdMB,
      currentHeapUsedMB: memUsage.heapUsed,
      heapTotalMB: memUsage.heapTotal,
      rssMB: memUsage.rss,
    });
  }
}

/**
 * 실행 환경 정보 수집
 *
 * @returns 환경 정보 객체
 */
export function getEnvironmentInfo(): Record<string, unknown> {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    pid: process.pid,
  };
}

/** 환경 정보 로깅 여부 (인스턴스당 한 번만) */
let environmentLogged = false;

/**
 * 환경 정보 로깅 (인스턴스 시작 시 한 번만)
 *
 * @param context 로그 컨텍스트
 */
export function logEnvironmentInfo(context: LogContext): void {
  if (environmentLogged) {
    return;
  }

  environmentLogged = true;

  const envInfo = getEnvironmentInfo();

  logPerformance(context, "environment_info", 0, {
    type: "ENVIRONMENT",
    ...envInfo,
  });
}
