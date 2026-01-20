/**
 * 콘텐츠 매개 대화 세션 페이지
 *
 * PRD 경로: /chat/bibliotherapy
 * Bibliotherapy 세션 화면 - 시/콘텐츠 기반 AI 대화
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, BookOpen } from 'lucide-react';
import { GlassCard, Button, LoadingSpinner } from '../../components/ui';
import { generateChatbotResponse } from '../../services/ai/gemini';
import { detectCrisis } from '../../services/crisisDetection';
import { saveConversation, upsertTimelineEntry } from '../../services/firestore';
import { useAppContext } from '../../contexts/AppContext';
import { EmotionType } from '../../../types';

/**
 * 콘텐츠 타입 (시집에서 전달)
 */
interface PoemContent {
  title: string;
  link: string;
  snippet: string;
  source: string;
  reason?: string;
}

/**
 * 메시지 타입
 */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * BibliotherapySession 컴포넌트
 */
export const BibliotherapySession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { persona, addTimelineEntry } = useAppContext();

  // 전달받은 콘텐츠 (시)
  const content = location.state?.content as PoemContent | undefined;
  const sessionType = location.state?.sessionType as string | undefined;

  // 메시지 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 스크롤 참조
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 콘텐츠가 없으면 돌아가기
  useEffect(() => {
    if (!content) {
      navigate('/content/poems');
    }
  }, [content, navigate]);

  // 초기 인사 메시지 생성
  useEffect(() => {
    if (content && messages.length === 0) {
      const greeting: Message = {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: `"${content.title}"을 선택해주셨군요.\n\n${content.snippet}\n\n이 글이 마음에 와닿으셨나요? 이 작품에 대해 어떤 생각이나 느낌이 드셨는지 자유롭게 나눠주세요.`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [content, messages.length]);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 위기 감지 및 처리
   */
  const handleCrisisCheck = useCallback(
    async (text: string) => {
      try {
        const result = await detectCrisis({ text });

        if (result.isCrisis && result.confidence === 'high') {
          // 심각한 위기 - 안전망으로 자동 이동
          navigate('/safety', { replace: true });
          return true;
        }

        if (result.isCrisis && result.confidence === 'medium') {
          // 중간 수준 - 안내 메시지 추가 후 계속
          const warningMessage: Message = {
            id: `warning-${Date.now()}`,
            role: 'assistant',
            content:
              '당신의 마음이 걱정됩니다. 지금 힘든 시간을 보내고 계시다면, 안전망에서 전문적인 도움을 받아보시는 것도 좋겠어요.\n\n[안전망 바로가기](/safety)',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, warningMessage]);
        }

        return false;
      } catch (error) {
        console.error('Crisis detection error:', error);
        return false;
      }
    },
    [navigate]
  );

  /**
   * 메시지 전송
   */
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 위기 감지
      const isCrisis = await handleCrisisCheck(userMessage.content);
      if (isCrisis) {
        setIsLoading(false);
        return;
      }

      // 대화 히스토리 구성 (콘텐츠 컨텍스트 포함)
      const contextMessage = content
        ? `[컨텍스트: 사용자가 "${content.title}"라는 작품을 선택했습니다. 출처: ${content.source}. 내용: ${content.snippet}]`
        : '';

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // 첫 메시지에 컨텍스트 추가
      if (history.length > 0) {
        history[0] = {
          role: history[0].role,
          content: contextMessage + '\n' + history[0].content,
        };
      }

      // AI 응답 생성
      const response = await generateChatbotResponse(userMessage.content, history, persona);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  /**
   * 대화 저장 및 종료
   */
  const handleSaveAndExit = async () => {
    if (messages.length <= 1) {
      navigate('/content/poems');
      return;
    }

    setIsSaving(true);

    try {
      const title = content?.title || 'Bibliotherapy 세션';

      // 대화 저장
      const savedId = await saveConversation({
        title: `[시] ${title}`,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        modeAtTime: 'day',
        contextTags: ['bibliotherapy', 'poem'],
      });

      setConversationId(savedId);

      // 타임라인 엔트리 추가
      await upsertTimelineEntry({
        date: new Date(),
        type: 'day',
        emotion: EmotionType.PEACE,
        intensity: 5,
        summary: `[시] ${title}`,
        detail: `Bibliotherapy 세션: ${content?.snippet?.slice(0, 100) || ''}...`,
        conversationId: savedId,
      });

      navigate('/content/poems');
    } catch (error) {
      console.error('Save error:', error);
      // 저장 실패해도 나가기
      navigate('/content/poems');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Enter 키로 전송 (Shift+Enter는 줄바꿈)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 콘텐츠가 없으면 로딩 표시
  if (!content) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAndExit}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="뒤로가기"
            disabled={isSaving}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-brand-primary" />
              Bibliotherapy
            </h1>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{content.title}</p>
          </div>
        </div>

        <Button
          onClick={handleSaveAndExit}
          variant="ghost"
          disabled={isSaving}
          className="text-sm"
        >
          {isSaving ? '저장 중...' : '저장 후 나가기'}
        </Button>
      </header>

      {/* 콘텐츠 정보 카드 */}
      <div className="px-4 pt-4">
        <GlassCard className="p-4 bg-brand-light/30">
          <h3 className="font-semibold text-slate-800 mb-1">{content.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">{content.snippet}</p>
          <p className="text-xs text-slate-400 mt-2">출처: {content.source}</p>
        </GlassCard>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-brand-primary text-white rounded-br-md'
                  : 'bg-white shadow-sm border border-slate-100 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이 작품에 대한 생각이나 느낌을 나눠주세요..."
            className="flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 min-h-[48px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-full transition-colors ${
              inputText.trim() && !isLoading
                ? 'bg-brand-primary text-white hover:bg-brand-dark'
                : 'bg-slate-100 text-slate-400'
            }`}
            aria-label="전송"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
