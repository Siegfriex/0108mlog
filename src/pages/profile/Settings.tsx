/**
 * 설정 페이지
 * 
 * PRD 경로: /profile/settings
 * 앱 설정 관리 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { Bell, Moon, Sun, Globe } from 'lucide-react';

/**
 * Settings 컴포넌트
 */
export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [language, setLanguage] = React.useState('ko');

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">설정</h2>
      </div>
      <div className="space-y-4">
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-slate-600" />
                <div>
                  <h3 className="font-bold text-slate-800">알림</h3>
                  <p className="text-sm text-slate-600">체크인 리마인드 알림</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`
                  w-12 h-6 rounded-full transition-colors
                  ${notificationsEnabled ? 'bg-brand-primary' : 'bg-slate-300'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full transition-transform
                  ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-slate-600" />
                <div>
                  <h3 className="font-bold text-slate-800">언어</h3>
                  <p className="text-sm text-slate-600">앱 언어 설정</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
