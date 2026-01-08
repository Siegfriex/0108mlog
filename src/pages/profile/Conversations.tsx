/**
 * 대화 관리 페이지
 * 
 * PRD 경로: /profile/conversations
 * 대화 목록, 삭제, 내보내기 화면
 */

import React from 'react';
import { useNavigate, useOutletContext, Navigate } from 'react-router-dom';
import { ConversationManager } from '../../components/profile/ConversationManager';
import { TimelineEntry } from '../../../types';

/**
 * Outlet Context 타입
 */
interface OutletContext {
  timelineData: TimelineEntry[];
}

/**
 * Conversations 컴포넌트
 */
export const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return <Navigate to="/" replace />;
  }
  
  const { timelineData } = context;
  
  const conversations: TimelineEntry[] = timelineData;

  const handleDeleteConversation = (id: string) => {
    // TODO: Firestore 삭제 로직
    if (process.env.NODE_ENV === 'development') {
      console.log('Delete conversation:', id);
    }
  };

  const handleDeleteAllConversations = () => {
    if (confirm('모든 대화를 삭제하시겠습니까?')) {
      // TODO: Firestore 전체 삭제 로직
      if (process.env.NODE_ENV === 'development') {
        console.log('Delete all conversations');
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
