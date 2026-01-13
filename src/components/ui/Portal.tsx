/**
 * Portal 컴포넌트
 *
 * React Portal을 사용하여 컴포넌트를 DOM 트리 외부(document.body)에 렌더링합니다.
 * 모달, 툴팁 등 부모의 overflow: hidden 영향을 받지 않아야 하는 요소에 사용합니다.
 *
 * 특징:
 * - SSR 안전 (useEffect 내에서 DOM 조작)
 * - 컨테이너 자동 생성 (index.html 수정 불필요)
 * - React Context는 논리적 트리 기준으로 동작하므로 Portal 내부에서도 Context 접근 가능
 */

import { createPortal } from 'react-dom';
import { ReactNode, useEffect, useState } from 'react';

/**
 * Portal Props 인터페이스
 */
interface PortalProps {
  /** 포털 내부에 렌더링할 자식 요소 */
  children: ReactNode;
  /** 포털 컨테이너 ID (기본값: 'portal-root') */
  containerId?: string;
}

/**
 * Portal 컴포넌트
 *
 * @param props - Portal props
 * @returns 포털로 렌더링된 자식 요소 또는 null
 *
 * @example
 * ```tsx
 * <Portal>
 *   <AnimatePresence>
 *     {isOpen && <ModalContent />}
 *   </AnimatePresence>
 * </Portal>
 * ```
 */
export const Portal = ({ children, containerId = 'portal-root' }: PortalProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // 기존 컨테이너 확인
    let el = document.getElementById(containerId);

    // 컨테이너가 없으면 생성
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      document.body.appendChild(el);
    }

    setContainer(el);

    // 클린업: 컴포넌트 언마운트 시 빈 컨테이너 제거하지 않음
    // (다른 Portal이 같은 컨테이너를 사용할 수 있음)
  }, [containerId]);

  // 컨테이너가 준비되지 않으면 렌더링하지 않음
  if (!container) return null;

  return createPortal(children, container);
};
