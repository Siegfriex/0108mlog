/**
 * 404 페이지
 * 
 * PRD 경로: /* (catch-all)
 * 존재하지 않는 경로 접근 시 표시
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../components/ui';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * NotFound 컴포넌트
 */
export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <GlassCard className="max-w-md w-full text-center">
        <div className="space-y-6 py-8">
          <div className="text-6xl font-bold text-slate-300">404</div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">페이지를 찾을 수 없습니다</h2>
            <p className="text-slate-600">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="ghost">
              <ArrowLeft size={18} className="mr-2" />
              이전 페이지
            </Button>
            <Button onClick={() => navigate('/chat')} variant="primary">
              <Home size={18} className="mr-2" />
              홈으로
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
