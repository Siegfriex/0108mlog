/**
 * 프로필 메인 페이지
 * 
 * PRD 경로: /profile
 * 프로필 메인 화면
 * 기존 ProfileView 컴포넌트 활용
 */

import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { ProfileView } from '../../../components/ProfileView';
import { CoachPersona, TimelineEntry } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  persona: CoachPersona;
  setPersona: (persona: CoachPersona) => void;
  timelineData: TimelineEntry[];
}

/**
 * ProfileMain Props 인터페이스
 */
interface ProfileMainProps {}

/**
 * ProfileMain 컴포넌트
 * 
 * @component
 * @param {ProfileMainProps} props - 컴포넌트 props
 * @returns {JSX.Element} ProfileMain 컴포넌트
 */
export const ProfileMain: React.FC<ProfileMainProps> = () => {
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { persona, setPersona, timelineData } = context;
  
  const conversations: TimelineEntry[] = timelineData;

  const handleUpdatePersona = (newPersona: CoachPersona) => {
    setPersona(newPersona);
    // TODO: Firestore 업데이트 로직 추가
  };

  const handleDeleteConversation = (id: string) => {
    // TODO: Firestore 삭제 로직 추가
    if (process.env.NODE_ENV === 'development') {
      console.log('Delete conversation:', id);
    }
  };

  const handleDeleteAllConversations = () => {
    // TODO: Firestore 전체 삭제 로직 추가
    if (process.env.NODE_ENV === 'development') {
      console.log('Delete all conversations');
    }
  };

  return (
    <ProfileView 
      persona={persona} 
      onUpdatePersona={handleUpdatePersona}
      conversations={conversations}
      onDeleteConversation={handleDeleteConversation}
      onDeleteAllConversations={handleDeleteAllConversations}
    />
  );
};
