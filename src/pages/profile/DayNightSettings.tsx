/**
 * Day/Night 모드 설정 페이지
 * 
 * PRD 경로: /profile/daynight
 * Day/Night 모드 설정 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { Moon, Sun } from 'lucide-react';

/**
 * DayNightSettings 컴포넌트
 */
export const DayNightSettings: React.FC = () => {
  const navigate = useNavigate();
  const [autoMode, setAutoMode] = React.useState(true);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">Day/Night 모드 설정</h2>
      </div>
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 mb-1">자동 모드 전환</h3>
            <p className="text-sm text-slate-600">시간대에 따라 자동으로 Day/Night 모드 전환</p>
          </div>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`
              w-12 h-6 rounded-full transition-colors
              ${autoMode ? 'bg-brand-primary' : 'bg-slate-300'}
            `}
          >
            <div className={`
              w-5 h-5 bg-white rounded-full transition-transform
              ${autoMode ? 'translate-x-6' : 'translate-x-1'}
            `} />
          </button>
        </div>
        <div className="flex gap-4 pt-4">
          <div className="flex-1 p-4 border border-slate-200 rounded-xl">
            <Sun size={24} className="text-amber-500 mb-2" />
            <h4 className="font-bold text-slate-800 mb-1">Day Mode</h4>
            <p className="text-xs text-slate-600">빠른 체크인 (Woebot 스타일)</p>
          </div>
          <div className="flex-1 p-4 border border-slate-200 rounded-xl">
            <Moon size={24} className="text-indigo-500 mb-2" />
            <h4 className="font-bold text-slate-800 mb-1">Night Mode</h4>
            <p className="text-xs text-slate-600">깊은 성찰 (답다 스타일)</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
