/**
 * 대화 상세 페이지
 * 
 * PRD 경로: /journal/detail/:id
 * 개별 대화 스레드 상세 조회
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { useRealtimeMessages } from '../../hooks/useRealtime';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FIRESTORE_COLLECTIONS, FirestoreConversation } from '../../types/firestore';
import { logError } from '../../utils/error';

/**
 * ConversationDetail 컴포넌트
 */
export const ConversationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<FirestoreConversation | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 실시간 메시지 가져오기
  const { data: messages, loading: messagesLoading, error: messagesError } = useRealtimeMessages(id);

  // 대화 정보 가져오기
  useEffect(() => {
    const loadConversation = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const conversationRef = doc(db, FIRESTORE_COLLECTIONS.CONVERSATIONS, id);
        const conversationSnap = await getDoc(conversationRef);
        
        if (conversationSnap.exists()) {
          setConversation({
            id: conversationSnap.id,
            ...conversationSnap.data(),
          } as FirestoreConversation);
        }
      } catch (error) {
        logError('ConversationDetail.loadConversation', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [id]);

  if (loading || messagesLoading) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => navigate('/journal')} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-slate-800">대화 상세</h2>
        </div>
        <GlassCard className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">로딩 중...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!conversation || messagesError) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => navigate('/journal')} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-slate-800">대화 상세</h2>
        </div>
        <GlassCard className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">대화를 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/journal')} variant="primary">
              목록으로
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const conversationDate = conversation.createdAt instanceof Date 
    ? conversation.createdAt 
    : (conversation.createdAt as any)?.toDate?.() || new Date();

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/journal')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="뒤로 가기"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">대화 상세</h2>
      </div>
      <GlassCard className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-bold text-lg text-slate-800 mb-2">{conversation.title}</h3>
            <p className="text-sm text-slate-500">
              {conversationDate.toLocaleDateString('ko-KR')} · {messages.length}개 메시지
            </p>
          </div>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-brand-primary/10 ml-auto max-w-[80%]' 
                    : 'bg-slate-100 max-w-[80%]'
                }`}
              >
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  {message.role === 'user' ? '나' : 'AI'}
                </p>
                <p className="text-slate-700 whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
