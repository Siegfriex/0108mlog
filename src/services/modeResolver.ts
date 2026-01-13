/**
 * Day/Night Mode Resolver
 * 
 * 시간대, 사용자 설정, 수동 override를 기반으로 현재 모드를 결정
 */

import { getUserSettings } from './firestore';

export type Mode = 'day' | 'night';

interface ModeSettings {
  autoDayNightMode: boolean;
  dayModeStartTime?: string; // HH:mm 형식
  nightModeStartTime?: string; // HH:mm 형식
}

/**
 * 현재 시간을 HH:mm 형식으로 반환
 */
function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 시간 문자열(HH:mm)을 분 단위로 변환
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 현재 시간이 지정된 시간 범위 내에 있는지 확인
 * 
 * @param startTime 시작 시간 (HH:mm)
 * @param endTime 종료 시간 (HH:mm)
 * @returns 범위 내에 있으면 true
 */
function isTimeInRange(startTime: string, endTime: string): boolean {
  const currentMinutes = timeToMinutes(getCurrentTimeString());
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // 자정을 넘어가는 경우 처리 (예: 22:00 ~ 06:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * 자동 모드 기반으로 현재 모드 결정
 * 
 * @param settings 사용자 설정
 * @returns 'day' 또는 'night'
 */
function resolveAutoMode(settings: ModeSettings): Mode {
  const dayStart = settings.dayModeStartTime || '06:00';
  const nightStart = settings.nightModeStartTime || '18:00';

  // Day Mode 시간대: dayStart ~ nightStart
  if (isTimeInRange(dayStart, nightStart)) {
    return 'day';
  }

  // Night Mode 시간대: nightStart ~ dayStart
  return 'night';
}

/**
 * 현재 모드 결정
 * 
 * 우선순위:
 * 1. 로컬 스토리지의 수동 override (있는 경우)
 * 2. 자동 모드 설정 (autoDayNightMode가 true인 경우)
 * 3. 기본값: 'day'
 * 
 * @returns {Promise<Mode>} 현재 모드
 */
export async function resolveMode(): Promise<Mode> {
  // 1. 수동 override 확인
  const manualOverride = localStorage.getItem('mode_override') as Mode | null;
  if (manualOverride === 'day' || manualOverride === 'night') {
    return manualOverride;
  }

  try {
    // 2. 사용자 설정 확인
    const settings = await getUserSettings();
    
    if (settings?.autoDayNightMode !== false) {
      // 자동 모드 활성화 (기본값도 true)
      return resolveAutoMode({
        autoDayNightMode: settings?.autoDayNightMode ?? true,
        dayModeStartTime: settings?.dayModeStartTime,
        nightModeStartTime: settings?.nightModeStartTime,
      });
    }

    // 자동 모드 비활성화 시 기본값 반환
    return 'day';
  } catch (error) {
    console.error('Error resolving mode:', error);
    // 에러 시 기본값 반환
    return 'day';
  }
}

/**
 * 수동 모드 override 설정
 * 
 * @param mode 설정할 모드
 */
export function setModeOverride(mode: Mode | null): void {
  if (mode === null) {
    localStorage.removeItem('mode_override');
  } else {
    localStorage.setItem('mode_override', mode);
  }
}

/**
 * 현재 수동 override 모드 가져오기
 * 
 * @returns 현재 override 모드 또는 null
 */
export function getModeOverride(): Mode | null {
  const override = localStorage.getItem('mode_override');
  if (override === 'day' || override === 'night') {
    return override;
  }
  return null;
}
