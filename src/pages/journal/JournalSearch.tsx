/**
 * 기록 검색 페이지
 * 
 * PRD 경로: /journal/search
 * 텍스트 기반 대화 검색
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { GlassCard, Button } from '../../components/ui';
import { searchConversations } from '../../services/firestore';
import { FirestoreConversation } from '../../types/firestore';
import { logError } from '../../utils/error';

/**
 * JournalSearch 컴포넌트
 */
export const JournalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FirestoreConversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchConversations(searchQuery, {
        limit: 50,
      });
      setSearchResults(results);
    } catch (error) {
      logError('JournalSearch.handleSearch', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/journal')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">검색</h2>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <Search 
            size={18} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="대화 내용 검색..."
            className="w-full pl-11 pr-4 py-3 bg-white/60 border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-slate-700 placeholder-slate-400"
          />
        </div>
        {isSearching ? (
          <GlassCard>
            <div className="text-center py-12 text-slate-400">
              <p>검색 중...</p>
            </div>
          </GlassCard>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((conversation) => (
              <GlassCard key={conversation.id} className="p-4 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate(`/journal/detail/${conversation.id}`)}>
                <h3 className="font-semibold text-slate-800 mb-1">{conversation.title}</h3>
                <p className="text-sm text-slate-600">
                  {conversation.messageCount}개 메시지 · {conversation.createdAt instanceof Date ? conversation.createdAt.toLocaleDateString('ko-KR') : '날짜 없음'}
                </p>
              </GlassCard>
            ))}
          </div>
        ) : searchQuery ? (
          <GlassCard>
            <div className="text-center py-12 text-slate-400">
              <p>검색 결과가 없습니다.</p>
            </div>
          </GlassCard>
        ) : (
          <GlassCard>
            <div className="text-center py-12 text-slate-400">
              <p>검색어를 입력하세요.</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
