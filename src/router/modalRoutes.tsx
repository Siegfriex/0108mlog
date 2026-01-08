/**
 * 모달 라우팅
 * 
 * 모달을 쿼리 파라미터 또는 별도 라우트로 관리
 * 예: /profile?modal=settings 또는 /profile/settings (모달)
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * 모달 타입 정의
 */
export type ModalType = 
  | 'settings' 
  | 'persona' 
  | 'privacy' 
  | 'conversations'
  | 'crisis'
  | 'tools'
  | null;

/**
 * 모달 라우팅 훅
 * 
 * @returns {[ModalType, (modal: ModalType) => void]} 모달 상태와 설정 함수
 */
export const useModalRoute = (): [ModalType, (modal: ModalType) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const modal = (searchParams.get('modal') as ModalType) || null;
  
  const setModal = (newModal: ModalType) => {
    if (newModal) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('modal', newModal);
      setSearchParams(newParams, { replace: true });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('modal');
      setSearchParams(newParams, { replace: true });
    }
  };
  
  return [modal, setModal];
};

/**
 * 모달 닫기 핸들러 생성
 */
export const useModalClose = (): () => void => {
  const [, setModal] = useModalRoute();
  return () => setModal(null);
};
