/**
 * 키보드 네비게이션 Hook
 * 
 * 화살표 키, Tab 키 등을 사용한 네비게이션 지원
 * 감정 선택 그리드, 모달 등에서 사용
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * useKeyboardNavigation 옵션
 */
export interface UseKeyboardNavigationOptions {
  /**
   * 네비게이션 가능한 요소의 개수
   */
  itemCount: number;
  
  /**
   * 현재 선택된 인덱스
   */
  selectedIndex: number;
  
  /**
   * 선택 변경 콜백
   */
  onSelectChange: (index: number) => void;
  
  /**
   * Enter 키 눌렀을 때 콜백
   */
  onEnter?: (index: number) => void;
  
  /**
   * Escape 키 눌렀을 때 콜백
   */
  onEscape?: () => void;
  
  /**
   * 활성화 여부
   */
  enabled?: boolean;
  
  /**
   * 가로 방향 네비게이션 (기본: true)
   */
  horizontal?: boolean;
  
  /**
   * 세로 방향 네비게이션 (기본: true)
   */
  vertical?: boolean;
  
  /**
   * 그리드 열 개수 (그리드 레이아웃인 경우)
   */
  columns?: number;
  
  /**
   * 루프 여부 (마지막에서 첫 번째로, 첫 번째에서 마지막으로)
   */
  loop?: boolean;
}

/**
 * useKeyboardNavigation Hook
 * 
 * @example
 * ```tsx
 * const { selectedIndex, setSelectedIndex } = useKeyboardNavigation({
 *   itemCount: emotions.length,
 *   selectedIndex: currentIndex,
 *   onSelectChange: setCurrentIndex,
 *   onEnter: (index) => handleSelect(emotions[index]),
 *   columns: 3,
 *   loop: true,
 * });
 * ```
 */
export function useKeyboardNavigation({
  itemCount,
  selectedIndex,
  onSelectChange,
  onEnter,
  onEscape,
  enabled = true,
  horizontal = true,
  vertical = true,
  columns,
  loop = false,
}: UseKeyboardNavigationOptions) {
  const containerRef = useRef<HTMLElement | null>(null);

  /**
   * 다음 인덱스 계산 (가로 방향)
   */
  const getNextIndex = useCallback((current: number): number => {
    if (current >= itemCount - 1) {
      return loop ? 0 : current;
    }
    return current + 1;
  }, [itemCount, loop]);

  /**
   * 이전 인덱스 계산 (가로 방향)
   */
  const getPreviousIndex = useCallback((current: number): number => {
    if (current <= 0) {
      return loop ? itemCount - 1 : current;
    }
    return current - 1;
  }, [itemCount, loop]);

  /**
   * 위 인덱스 계산 (세로 방향 또는 그리드)
   */
  const getUpIndex = useCallback((current: number): number => {
    if (columns) {
      // 그리드 레이아웃
      const newIndex = current - columns;
      if (newIndex < 0) {
        return loop ? current + (Math.ceil(itemCount / columns) - 1) * columns : current;
      }
      return newIndex >= itemCount ? current : newIndex;
    } else {
      // 리스트 레이아웃
      return getPreviousIndex(current);
    }
  }, [columns, itemCount, getPreviousIndex, loop]);

  /**
   * 아래 인덱스 계산 (세로 방향 또는 그리드)
   */
  const getDownIndex = useCallback((current: number): number => {
    if (columns) {
      // 그리드 레이아웃
      const newIndex = current + columns;
      if (newIndex >= itemCount) {
        return loop ? current % columns : current;
      }
      return newIndex;
    } else {
      // 리스트 레이아웃
      return getNextIndex(current);
    }
  }, [columns, itemCount, getNextIndex, loop]);

  /**
   * 키보드 이벤트 핸들러
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'ArrowRight':
        if (horizontal) {
          event.preventDefault();
          const nextIndex = getNextIndex(selectedIndex);
          if (nextIndex !== selectedIndex) {
            onSelectChange(nextIndex);
          }
        }
        break;

      case 'ArrowLeft':
        if (horizontal) {
          event.preventDefault();
          const prevIndex = getPreviousIndex(selectedIndex);
          if (prevIndex !== selectedIndex) {
            onSelectChange(prevIndex);
          }
        }
        break;

      case 'ArrowDown':
        if (vertical) {
          event.preventDefault();
          const downIndex = getDownIndex(selectedIndex);
          if (downIndex !== selectedIndex) {
            onSelectChange(downIndex);
          }
        }
        break;

      case 'ArrowUp':
        if (vertical) {
          event.preventDefault();
          const upIndex = getUpIndex(selectedIndex);
          if (upIndex !== selectedIndex) {
            onSelectChange(upIndex);
          }
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.(selectedIndex);
        break;

      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      case 'Home':
        event.preventDefault();
        onSelectChange(0);
        break;

      case 'End':
        event.preventDefault();
        onSelectChange(itemCount - 1);
        break;

      default:
        break;
    }
  }, [
    enabled,
    horizontal,
    vertical,
    selectedIndex,
    getNextIndex,
    getPreviousIndex,
    getUpIndex,
    getDownIndex,
    onSelectChange,
    onEnter,
    onEscape,
    itemCount,
  ]);

  /**
   * 키보드 이벤트 리스너 등록
   */
  useEffect(() => {
    if (!enabled) return;

    const element = containerRef.current || document;
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    containerRef,
    selectedIndex,
  };
}
