/**
 * 콘텐츠 메인 페이지
 * 
 * PRD 경로: /content
 * 콘텐츠 큐레이션 메인 화면
 * 기존 ContentGallery 컴포넌트 활용
 */

import React from 'react';
import { ContentGallery } from '../../../components/ContentGallery';
import { useAppContext } from '../../contexts';

/**
 * ContentMain Props 인터페이스
 */
interface ContentMainProps {}

/**
 * ContentMain 컴포넌트
 * 
 * @component
 * @param {ContentMainProps} props - 컴포넌트 props
 * @returns {JSX.Element} ContentMain 컴포넌트
 */
export const ContentMain: React.FC<ContentMainProps> = () => {
  const { persona } = useAppContext();

  return <ContentGallery persona={persona} />;
};
