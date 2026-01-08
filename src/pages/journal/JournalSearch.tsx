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

/**
 * JournalSearch 컴포넌트
 */
export const JournalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Firestore 검색 로직 구현
  const handleSearch = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Search:', searchQuery);
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
        <GlassCard>
          <div className="text-center py-12 text-slate-400">
            <p>검색 결과가 여기에 표시됩니다.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
