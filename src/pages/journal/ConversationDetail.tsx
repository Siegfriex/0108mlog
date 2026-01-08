/**
 * 대화 상세 페이지
 * 
 * PRD 경로: /journal/detail/:id
 * 개별 대화 스레드 상세 조회
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { TimelineEntry } from '../../../types';

/**
 * ConversationDetail 컴포넌트
 */
export const ConversationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: useRealtimeMessages hook으로 메시지 가져오기
  const conversation: TimelineEntry | null = null;

  if (!conversation) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => navigate('/journal')} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
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

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/journal')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">대화 상세</h2>
      </div>
      <GlassCard className="flex-1">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-2">
              {new Date(conversation.date).toLocaleDateString('ko-KR')}
            </p>
            <p className="text-slate-700">{conversation.summary}</p>
            <p className="text-slate-600 mt-2">{conversation.detail}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
