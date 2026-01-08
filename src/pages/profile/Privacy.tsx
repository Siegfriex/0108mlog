/**
 * 개인정보 관리 페이지
 * 
 * PRD 경로: /profile/privacy
 * 개인정보 관리 화면
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { Shield, Trash2, Download } from 'lucide-react';

/**
 * Privacy 컴포넌트
 */
export const Privacy: React.FC = () => {
  const navigate = useNavigate();

  const handleExportData = () => {
    // TODO: 데이터 내보내기 로직
    if (process.env.NODE_ENV === 'development') {
      console.log('Export data');
    }
  };

  const handleDeleteAllData = () => {
    if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // TODO: 전체 데이터 삭제 로직
      if (process.env.NODE_ENV === 'development') {
        console.log('Delete all data');
      }
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">개인정보 관리</h2>
      </div>
      <div className="space-y-4">
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-800">데이터 내보내기</h3>
                <p className="text-sm text-slate-600">모든 데이터를 JSON/CSV 형식으로 내보내기</p>
              </div>
            </div>
            <Button onClick={handleExportData} variant="secondary" className="w-full">
              <Download size={18} className="mr-2" />
              데이터 내보내기
            </Button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 size={20} className="text-red-500" />
              <div>
                <h3 className="font-bold text-slate-800">전체 데이터 삭제</h3>
                <p className="text-sm text-slate-600">모든 대화 및 기록을 영구적으로 삭제합니다.</p>
              </div>
            </div>
            <Button onClick={handleDeleteAllData} variant="ghost" className="w-full text-red-600 hover:bg-red-50">
              <Trash2 size={18} className="mr-2" />
              전체 데이터 삭제
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
