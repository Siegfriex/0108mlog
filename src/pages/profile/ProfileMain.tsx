/**
 * 프로필 메인 페이지
 * 
 * PRD 경로: /profile
 * 프로필 메인 화면
 * 기존 ProfileView 컴포넌트 활용
 */

import React from 'react';
import { ProfileView } from '../../../components/ProfileView';
import { CoachPersona } from '../../../types';
import { useAppContext } from '../../contexts';
import { saveUserSettings } from '../../services/firestore';
import { deleteConversation, deleteAllConversations } from '../../services/firestore';
import { logError } from '../../utils/error';

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
  const { persona, setPersona, timelineData, deleteTimelineEntry } = useAppContext();
  
  const conversations = timelineData;

  const handleUpdatePersona = async (newPersona: CoachPersona) => {
    try {
      await saveUserSettings({ persona: newPersona });
      setPersona(newPersona);
    } catch (error) {
      logError('ProfileMain.handleUpdatePersona', error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      deleteTimelineEntry(id);
    } catch (error) {
      logError('ProfileMain.handleDeleteConversation', error);
    }
  };

  const handleDeleteAllConversations = async () => {
    try {
      await deleteAllConversations();
      // 모든 타임라인 엔트리 삭제
      conversations.forEach(entry => deleteTimelineEntry(entry.id));
    } catch (error) {
      logError('ProfileMain.handleDeleteAllConversations', error);
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
