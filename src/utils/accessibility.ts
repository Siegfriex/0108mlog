/**
 * 접근성 유틸리티 함수
 * WCAG 2.2 AA 준수를 위한 헬퍼 함수들
 *
 * 설치 필요: npm install -D polished
 */

/**
 * 색상 대비율 계산
 * WCAG 2.1 기준:
 * - 일반 텍스트: 4.5:1 이상
 * - 큰 텍스트 (18pt 이상 또는 14pt 굵게): 3:1 이상
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hexColor: string): number => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * HEX 색상을 RGB 배열로 변환
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * 색상 대비 검증
 */
export function checkContrast(foreground: string, background: string) {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 10) / 10,
    passAA: ratio >= 4.5,
    passAALarge: ratio >= 3.0,
    passAAA: ratio >= 7.0,
    passAAALarge: ratio >= 4.5,
  };
}

/**
 * 개발 환경에서 낮은 대비율 경고
 */
export function warnLowContrast(fg: string, bg: string, elementName: string): void {
  if (import.meta.env.DEV) {
    const { ratio, passAA } = checkContrast(fg, bg);
    if (!passAA) {
      console.warn(
        `[A11Y] 낮은 대비율 감지 (${ratio}:1) in ${elementName}. WCAG AA는 4.5:1 이상 필요.`,
        { foreground: fg, background: bg }
      );
    }
  }
}

/**
 * 스크린 리더 전용 텍스트를 위한 CSS 클래스
 * Tailwind의 sr-only와 동일
 */
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: 0,
};

/**
 * 포커스 트랩을 위한 포커스 가능한 요소 선택자
 */
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/**
 * 요소 내 포커스 가능한 요소들 가져오기
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
}

/**
 * ARIA 라이브 리전 공지 (스크린 리더용)
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // 스크린 리더가 읽은 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * prefers-reduced-motion 미디어 쿼리 확인
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 색상 대비가 WCAG AA를 통과하는지 확인하고
 * 실패 시 대체 색상 반환
 */
export function getAccessibleColor(
  foreground: string,
  background: string,
  fallback: string
): string {
  const { passAA } = checkContrast(foreground, background);
  return passAA ? foreground : fallback;
}
