/**
 * ConversationManager 컴포넌트
 * 
 * FEAT-017: 대화 저장/삭제 관리
 * PRD 명세: 대화 목록 조회, 개별 메시지 삭제, 대화 스레드 삭제, 전체 대화 삭제
 * 
 * 주요 기능:
 * - 대화 목록 조회 (타임라인/리스트 뷰)
 * - 개별 메시지 삭제
 * - 대화 스레드 삭제 (소프트 삭제, 30일 복구 기간)
 * - 전체 대화 삭제
 * - 대화 내보내기 (JSON/CSV)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, Calendar, List, Grid, ArrowLeft, MoreVertical, X } from 'lucide-react';
import { GlassCard, Button } from '../ui';
import { TimelineEntry } from '../../../types';

/**
 * ConversationManager Props 인터페이스
 */
export interface ConversationManagerProps {
  conversations: TimelineEntry[];
  onDeleteConversation?: (id: string) => void;
  onDeleteAll?: () => void;
  onExport?: (format: 'json' | 'csv') => void;
}

/**
 * 뷰 타입 정의
 */
type ViewType = 'timeline' | 'list';

/**
 * ConversationManager 컴포넌트
 * 
 * @component
 * @param {ConversationManagerProps} props - 컴포넌트 props
 * @returns {JSX.Element} ConversationManager 컴포넌트
 */
export const ConversationManager: React.FC<ConversationManagerProps> = ({
  conversations,
  onDeleteConversation,
  onDeleteAll,
  onExport,
}) => {
  const [viewType, setViewType] = useState<ViewType>('timeline');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  /**
   * 대화 삭제 확인 처리
   */
  const handleDeleteConfirm = () => {
    if (conversationToDelete && onDeleteConversation) {
      onDeleteConversation(conversationToDelete);
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
    }
  };

  /**
   * 전체 삭제 확인 처리
   */
  const handleDeleteAllConfirm = () => {
    if (onDeleteAll) {
      onDeleteAll();
      setShowDeleteConfirm(false);
    }
  };

  /**
   * 대화 내보내기 처리
   */
  const handleExport = (format: 'json' | 'csv') => {
    if (onExport) {
      onExport(format);
    } else {
      // 기본 내보내기 로직
      if (format === 'json') {
        const dataStr = JSON.stringify(conversations, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `maumlog-conversations-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      } else if (format === 'csv') {
        const csvHeader = 'Date,Emotion,Intensity,Summary\n';
        const csvRows = conversations.map(c => 
          `${new Date(c.date).toISOString()},${c.emotion},${c.intensity || 0},"${c.summary || ''}"`
        ).join('\n');
        const csvContent = csvHeader + csvRows;
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `maumlog-conversations-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            대화 관리
          </h2>
          <p className="text-sm text-slate-500">
            {conversations.length}개의 대화 기록
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewType(viewType === 'timeline' ? 'list' : 'timeline')}
            variant="ghost"
            className="!px-3"
          >
            {viewType === 'timeline' ? <List size={18} /> : <Grid size={18} />}
          </Button>
          <Button
            onClick={() => handleExport('json')}
            variant="ghost"
            className="!px-3"
            aria-label="JSON 내보내기"
          >
            <Download size={18} />
          </Button>
        </div>
      </div>

      {/* 대화 목록 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
        {conversations.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12 text-slate-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>아직 저장된 대화가 없어요</p>
            </div>
          </GlassCard>
        ) : (
          conversations.map(conversation => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <GlassCard className="!p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-brand-primary bg-brand-light px-2 py-1 rounded-md">
                        {conversation.emotion}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(conversation.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-1">{conversation.summary}</p>
                    {conversation.nuanceTags && conversation.nuanceTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.nuanceTags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setConversationToDelete(conversation.id);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="대화 삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* 전체 삭제 버튼 */}
      {conversations.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <Button
            onClick={() => {
              setConversationToDelete('all');
              setShowDeleteConfirm(true);
            }}
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={18} className="mr-2" />
            전체 대화 삭제
          </Button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteConfirm(false);
              setConversationToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                대화 삭제 확인
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {conversationToDelete === 'all'
                  ? '모든 대화를 삭제하시겠어요? 삭제된 대화는 30일간 복구 가능합니다.'
                  : '이 대화를 삭제하시겠어요? 삭제된 대화는 30일간 복구 가능합니다.'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConversationToDelete(null);
                  }}
                  variant="ghost"
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={conversationToDelete === 'all' ? handleDeleteAllConfirm : handleDeleteConfirm}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  삭제
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
