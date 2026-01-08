/**
 * 월간 회고록 페이지
 * 
 * PRD 경로: /reports/monthly-retrospective
 * 서사적 회고록 모달 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, LoadingSpinner } from '../../components/ui';
import { generateMonthlyNarrative } from '../../../services/geminiService';

/**
 * MonthlyRetrospective 컴포넌트
 */
export const MonthlyRetrospective: React.FC = () => {
  const navigate = useNavigate();
  const [narrative, setNarrative] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchNarrative = async () => {
      const text = await generateMonthlyNarrative();
      setNarrative(text);
      setLoading(false);
    };
    fetchNarrative();
  }, []);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/reports/monthly')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">월간 회고록</h2>
      </div>
      <GlassCard className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="prose prose-p:text-slate-600 prose-p:leading-loose prose-p:font-medium max-h-full overflow-y-auto pr-2 scrollbar-hide">
            <p>{narrative}</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
