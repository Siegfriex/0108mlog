/**
 * Z-Index 관리 시스템
 * 
 * 탭별 레이어 관리 및 동적 z-index 계산
 */

import { getCSSVariableAsNumber, setCSSVariable } from './cssVariables';
import type { CSSProperties } from 'react';

// 탭 ID 타입
export type TabId = 'chat' | 'journal' | 'reports' | 'content' | 'profile';

// Z-Index 레이어 카테고리
export type ZIndexCategory =
  | 'bg'       // 배경 (0-9)
  | 'content'  // 컨텐츠 (10-49)
  | 'nav'      // 네비게이션 (50-99)
  | 'overlay'  // 오버레이 (100-999)
  | 'modal'    // 모달 (1000-1999)
  | 'critical'; // 크리티컬 (2000+)

// 탭별 기본 Z-Index
export const TAB_Z_INDEX: Record<TabId, number> = {
  chat: 10,
  journal: 15,
  reports: 20,
  content: 25,
  profile: 30,
} as const;

// 레이어별 Z-Index 범위
export const Z_INDEX_RANGES = {
  bg: { min: 0, max: 9 },
  content: { min: 10, max: 49 },
  nav: { min: 50, max: 99 },
  overlay: { min: 100, max: 999 },
  modal: { min: 1000, max: 1999 },
  critical: { min: 2000, max: 9999 },
} as const;

// 공통 레이어
export const COMMON_Z_INDEX = {
  below: -1,
  base: 0,
  above: 1,
  nav: 50,
  header: 50,
  dock: 50,
  fab: 60,
  sticky: 70,
  safety: 200,
  loading: 300,
  toast: 400,
  dropdown: 1000,
  popover: 1010,
  tooltip: 1020,
  modalBackdrop: 1040,
  modal: 1050,
  sheet: 1060,
  consentBackdrop: 2000,
  consentModal: 2001,
  emergency: 9000,
  max: 9999,
} as const;

/**
 * 현재 활성 탭의 기본 Z-Index를 반환합니다
 */
export const getTabBaseZIndex = (tabId: TabId): number => {
  return TAB_Z_INDEX[tabId] ?? 10;
};

/**
 * 탭 내 컴포넌트의 Z-Index를 계산합니다
 * @param tabId 탭 ID
 * @param offset 탭 기본 Z-Index로부터의 오프셋 (0-4)
 */
export const getTabComponentZIndex = (tabId: TabId, offset: number = 0): number => {
  const base = getTabBaseZIndex(tabId);
  return Math.min(base + offset, base + 4); // 최대 +4까지
};

/**
 * CSS 변수에서 Z-Index를 가져옵니다
 */
export const getZIndexFromCSS = (layer: string): number => {
  return getCSSVariableAsNumber(`--z-${layer}` as `--${string}`);
};

/**
 * 활성 탭에 따라 CSS 변수를 업데이트합니다
 */
export const updateActiveTabZIndex = (activeTabId: TabId): void => {
  setCSSVariable('--z-active-tab', String(getTabBaseZIndex(activeTabId)));
  setCSSVariable('--z-active-tab-content', String(getTabComponentZIndex(activeTabId, 1)));
};

/**
 * Z-Index가 특정 카테고리에 속하는지 확인합니다
 */
export const isInZIndexCategory = (zIndex: number, category: ZIndexCategory): boolean => {
  const range = Z_INDEX_RANGES[category];
  return zIndex >= range.min && zIndex <= range.max;
};

/**
 * Tailwind 클래스용 Z-Index 문자열을 반환합니다
 */
export const getZIndexClass = (layer: keyof typeof COMMON_Z_INDEX): string => {
  // CSS 변수 기반 클래스 사용
  const layerMap: Record<string, string> = {
    nav: 'z-nav',
    dock: 'z-dock',
    modal: 'z-modal',
    modalBackdrop: 'z-modal-backdrop',
    tooltip: 'z-tooltip',
    overlay: 'z-overlay-base',
    safety: 'z-safety',
    toast: 'z-toast',
    loading: 'z-loading',
    sheet: 'z-sheet',
    consentBackdrop: 'z-consent-backdrop',
    consentModal: 'z-consent-modal',
    emergency: 'z-emergency',
    max: 'z-max',
  };
  
  return layerMap[layer] || `z-[${COMMON_Z_INDEX[layer]}]`;
};

/**
 * 탭 컨텐츠용 인라인 스타일을 생성합니다
 */
export const getTabContentStyle = (tabId: TabId, isActive: boolean = true): CSSProperties => {
  return {
    zIndex: isActive
      ? `var(--z-tab-${tabId}-content)`
      : `var(--z-tab-${tabId})`,
  };
};
