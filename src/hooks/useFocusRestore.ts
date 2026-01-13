/**
 * 포커스 복원 Hook
 * 
 * 모달이 닫힐 때 이전 포커스 위치로 복원
 */

import { useEffect, useRef } from 'react';

/**
 * useFocusRestore 옵션
 */
export interface UseFocusRestoreOptions {
  /**
   * 활성화 여부 (모달이 열려있을 때 false, 닫힐 때 true)
   */
  shouldRestore: boolean;
  
  /**
   * 복원할 포커스 요소 (없으면 자동으로 이전 활성 요소 사용)
   */
  restoreElement?: HTMLElement | null;
}

/**
 * useFocusRestore Hook
 * 
 * 모달이 닫힐 때 포커스를 이전 위치로 복원
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * useFocusRestore({
 *   shouldRestore: !isOpen,
 * });
 * ```
 */
export function useFocusRestore({
  shouldRestore,
  restoreElement,
}: UseFocusRestoreOptions) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const hasRestoredRef = useRef(false);

  // 모달이 열릴 때 현재 활성 요소 저장
  useEffect(() => {
    if (!shouldRestore) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      hasRestoredRef.current = false;
    }
  }, [shouldRestore]);

  // 모달이 닫힐 때 포커스 복원
  useEffect(() => {
    if (shouldRestore && !hasRestoredRef.current) {
      const elementToRestore = restoreElement || previousActiveElementRef.current;
      
      if (elementToRestore && typeof elementToRestore.focus === 'function') {
        // 약간의 지연을 두어 모달 애니메이션이 완료된 후 포커스 복원
        setTimeout(() => {
          elementToRestore.focus();
          hasRestoredRef.current = true;
        }, 100);
      }
    }
  }, [shouldRestore, restoreElement]);
}
