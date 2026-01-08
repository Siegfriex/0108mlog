/**
 * 음악 페이지
 * 
 * PRD 경로: /content/music
 * 음악 콘텐츠 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';

/**
 * ContentMusic 컴포넌트
 */
export const ContentMusic: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/content')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">음악</h2>
      </div>
      <GlassCard className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">음악 기능은 곧 제공될 예정입니다.</p>
          <Button onClick={() => navigate('/content')} variant="primary">
            돌아가기
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
