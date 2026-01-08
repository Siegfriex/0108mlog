/**
 * 대처 도구 페이지
 * 
 * PRD 경로: /safety/tools
 * 대처 도구 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { Wind, Anchor, HeartPulse } from 'lucide-react';

/**
 * CopingTools 컴포넌트
 */
export const CopingTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'breathing',
      title: '호흡 운동',
      icon: <Wind size={24} className="text-brand-primary" />,
      description: '4-7-8 호흡법으로 안정화하기',
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 그라운딩',
      icon: <Anchor size={24} className="text-brand-primary" />,
      description: '감각에 집중하여 현재 순간으로 돌아오기',
    },
    {
      id: 'relaxation',
      title: '이완 운동',
      icon: <HeartPulse size={24} className="text-brand-primary" />,
      description: '근육 이완 기법으로 긴장 완화하기',
    },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/safety')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">대처 도구</h2>
      </div>
      <div className="space-y-3">
        {tools.map(tool => (
          <GlassCard key={tool.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center">
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-1">{tool.title}</h3>
                <p className="text-sm text-slate-600">{tool.description}</p>
              </div>
              <Button variant="ghost" size="sm">
                시작하기
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
