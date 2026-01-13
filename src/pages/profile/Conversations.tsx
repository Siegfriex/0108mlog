/**
 * 대화 관리 페이지
 * 
 * PRD 경로: /profile/conversations
 * 대화 목록, 삭제, 내보내기 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConversationManager } from '../../components/profile/ConversationManager';
import { useAppContext } from '../../contexts';
import { deleteConversation, deleteAllConversations } from '../../services/firestore';
import { logError } from '../../utils/error';

/**
 * Conversations 컴포넌트
 */
export const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { timelineData, deleteTimelineEntry } = useAppContext();
  
  const conversations = timelineData;

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      deleteTimelineEntry(id);
    } catch (error) {
      logError('Conversations.handleDeleteConversation', error);
    }
  };

  const handleDeleteAllConversations = async () => {
    if (confirm('모든 대화를 삭제하시겠습니까?')) {
      try {
        await deleteAllConversations();
        // 모든 타임라인 엔트리 삭제
        conversations.forEach(entry => deleteTimelineEntry(entry.id));
      } catch (error) {
        logError('Conversations.handleDeleteAllConversations', error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 px-4 pt-2">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h3 className="font-bold text-slate-800">대화 관리</h3>
      </div>
      <ConversationManager
        conversations={conversations}
        onDeleteConversation={handleDeleteConversation}
        onDeleteAll={handleDeleteAllConversations}
      />
    </div>
  );
};
