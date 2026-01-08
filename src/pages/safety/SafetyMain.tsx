/**
 * 안전망 메인 페이지
 * 
 * PRD 경로: /safety
 * 안전망 메인 화면
 * 기존 SafetyLayer 컴포넌트 활용
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SafetyLayer } from '../../../components/SafetyLayer';

/**
 * SafetyMain Props 인터페이스
 */
interface SafetyMainProps {}

/**
 * SafetyMain 컴포넌트
 * 
 * @component
 * @param {SafetyMainProps} props - 컴포넌트 props
 * @returns {JSX.Element} SafetyMain 컴포넌트
 */
export const SafetyMain: React.FC<SafetyMainProps> = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    // 이전 페이지로 돌아가기 또는 메인으로 이동
    navigate(-1);
  };

  return <SafetyLayer onClose={handleClose} />;
};
