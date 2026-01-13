/**
 * 스타일 유틸리티 배럴 export
 */

// CSS 변수 유틸리티
export {
  getCSSVariable,
  setCSSVariable,
  getCSSVariableAsNumber,
  setCSSVariables,
  getCSSVariables,
  remToPx,
  pxToRem,
  vwToPx,
  vhToPx,
  type CSSVariableName,
} from './cssVariables';

// Z-Index 관리
export {
  TAB_Z_INDEX,
  COMMON_Z_INDEX,
  Z_INDEX_RANGES,
  getTabBaseZIndex,
  getTabComponentZIndex,
  getZIndexFromCSS,
  updateActiveTabZIndex,
  isInZIndexCategory,
  getZIndexClass,
  getTabContentStyle,
  type TabId,
  type ZIndexCategory,
} from './zIndexManager';

// 단위 유틸리티
export {
  getSpacing,
  getSpacingPx,
  getSafeViewportHeight,
  getContentHeight,
  getResponsiveValue,
  clamp,
  fluidValue,
  toRem,
  getViewportInfo,
} from './units';

// 테마 유틸리티
export {
  getSystemColorScheme,
  setThemeMode,
  getTimeBasedTheme,
  setEmotionTheme,
  onColorSchemeChange,
  toggleThemeMode,
  type ThemeMode,
  type ColorScheme,
} from './theme';
