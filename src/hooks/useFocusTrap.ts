/**
 * 포커스 트랩 Hook
 * 
 * 모달 내부에서 포커스가 모달 밖으로 나가지 않도록 함
 * Tab 키로 포커스가 순환하도록 함
 */

import React, { useEffect, useRef } from 'react';

/**
 * useFocusTrap 옵션
 */
export interface UseFocusTrapOptions {
  /**
   * 활성화 여부
   */
  enabled?: boolean;
  
  /**
   * 포커스 트랩을 적용할 컨테이너 요소
   */
  containerRef?: React.RefObject<HTMLElement>;
  
  /**
   * 초기 포커스를 받을 요소 선택자
   */
  initialFocusSelector?: string;
  
  /**
   * 포커스 가능한 요소 선택자
   */
  focusableSelector?: string;
}

/**
 * 포커스 가능한 요소 선택자 (기본값)
 */
const DEFAULT_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * 포커스 가능한 요소 목록 가져오기
 */
function getFocusableElements(
  container: HTMLElement,
  selector: string = DEFAULT_FOCUSABLE_SELECTOR
): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(selector)
  ).filter((el) => {
    // 화면에 보이는 요소만 포함
    return el.offsetWidth > 0 && el.offsetHeight > 0;
  });
}

/**
 * useFocusTrap Hook
 * 
 * 모달 내부에서 포커스를 트랩하여 Tab 키로 순환하도록 함
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useFocusTrap({
 *   enabled: isOpen,
 *   containerRef,
 *   initialFocusSelector: '[data-autofocus]',
 * });
 * ```
 */
export function useFocusTrap({
  enabled = true,
  containerRef,
  initialFocusSelector,
  focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
}: UseFocusTrapOptions) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef?.current) return;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container, focusableSelector);

    if (focusableElements.length === 0) return;

    // 이전 활성 요소 저장
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // 초기 포커스 설정
    let initialFocusElement: HTMLElement | null = null;
    
    if (initialFocusSelector) {
      initialFocusElement = container.querySelector<HTMLElement>(initialFocusSelector);
    }
    
    if (!initialFocusElement) {
      initialFocusElement = focusableElements[0];
    }

    if (initialFocusElement) {
      initialFocusElement.focus();
    }

    /**
     * Tab 키 핸들러
     */
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container, focusableSelector);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentElement = document.activeElement as HTMLElement;

      // Shift + Tab (역방향)
      if (event.shiftKey) {
        if (currentElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (정방향)
        if (currentElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      
      // 포커스 복원 (선택사항)
      // previousActiveElementRef.current?.focus();
    };
  }, [enabled, containerRef, initialFocusSelector, focusableSelector]);

  return {
    previousActiveElement: previousActiveElementRef.current,
  };
}
