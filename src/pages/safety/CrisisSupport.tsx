/**
 * 위기 지원 페이지
 * 
 * PRD 경로: /safety/crisis
 * 위기 지원 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { Phone, ShieldAlert } from 'lucide-react';

/**
 * CrisisSupport 컴포넌트
 */
export const CrisisSupport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/safety')} 
          className="p-2 hover:bg-red-50 rounded-full text-red-600 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">위기 지원</h2>
      </div>
      <div className="space-y-4">
        <GlassCard className="border-red-200 bg-red-50/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert size={24} className="text-red-600" />
              <h3 className="font-bold text-slate-800">지금 안전하신가요?</h3>
            </div>
            <p className="text-sm text-slate-600">
              도움이 필요하시다면 아래 연락처로 연락하세요.
            </p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="space-y-3">
            <a 
              href="tel:1577-0199" 
              className="block w-full p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-red-600" />
                <div>
                  <h4 className="font-bold text-slate-800">정신건강 위기상담</h4>
                  <p className="text-sm text-slate-600">1577-0199</p>
                </div>
              </div>
            </a>
            <a 
              href="tel:1393" 
              className="block w-full p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-red-600" />
                <div>
                  <h4 className="font-bold text-slate-800">자살예방상담</h4>
                  <p className="text-sm text-slate-600">1393</p>
                </div>
              </div>
            </a>
            <a 
              href="tel:119" 
              className="block w-full p-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Phone size={20} />
                <div>
                  <h4 className="font-bold">긴급 상황</h4>
                  <p className="text-sm opacity-90">119 / 112</p>
                </div>
              </div>
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
