/**
 * 개인정보 관리 페이지
 * 
 * PRD 경로: /profile/privacy
 * 개인정보 관리 화면
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../../components/ui';
import { Shield, Trash2, Download, ToggleLeft, ToggleRight } from 'lucide-react';
import { getConsentState, saveConsent } from '../../services/consent';
import { exportUserData, deleteAllUserData } from '../../services/firestore';
import { logError } from '../../utils/error';

/**
 * Privacy 컴포넌트
 */
export const Privacy: React.FC = () => {
  const navigate = useNavigate();
  const [conversationStorageConsent, setConversationStorageConsent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConsent = async () => {
      try {
        const consentState = await getConsentState();
        setConversationStorageConsent(consentState.conversationStorage);
      } catch (error) {
        console.error('Error loading consent:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsent();
  }, []);

  const handleToggleConsent = async () => {
    try {
      const newValue = !conversationStorageConsent;
      await saveConsent(newValue);
      setConversationStorageConsent(newValue);
      alert(newValue ? '대화 저장이 활성화되었습니다.' : '대화 저장이 비활성화되었습니다. 기존 대화는 유지되며, 새로운 대화는 저장되지 않습니다.');
    } catch (error) {
      console.error('Error saving consent:', error);
      alert('동의 설정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportUserData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maumlog-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('데이터 내보내기가 완료되었습니다.');
    } catch (error) {
      logError('Privacy.handleExportData', error);
      alert('데이터 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAllData = async () => {
    if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await deleteAllUserData();
        alert('모든 데이터가 삭제되었습니다.');
        // 프로필 페이지로 리다이렉트
        navigate('/profile');
      } catch (error) {
        logError('Privacy.handleDeleteAllData', error);
        alert('데이터 삭제 중 오류가 발생했습니다.');
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
        {/* 대화 저장 동의 설정 */}
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-slate-600" />
                <div>
                  <h3 className="font-bold text-slate-800">대화 저장</h3>
                  <p className="text-sm text-slate-600">대화와 일기 원문 저장 동의</p>
                </div>
              </div>
              {!loading && (
                <button
                  onClick={handleToggleConsent}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${conversationStorageConsent ? 'bg-brand-primary' : 'bg-slate-300'}
                  `}
                  aria-label={conversationStorageConsent ? '대화 저장 끄기' : '대화 저장 켜기'}
                >
                  <div
                    className={`
                      w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform
                      ${conversationStorageConsent ? 'translate-x-6' : 'translate-x-0.5'}
                    `}
                  />
                </button>
              )}
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              {conversationStorageConsent ? (
                <p>대화와 일기 원문이 저장됩니다. 감정 수치와 태그는 항상 저장됩니다.</p>
              ) : (
                <p>대화와 일기 원문 저장이 비활성화되었습니다. 기존 대화는 유지되며, 새로운 대화는 저장되지 않습니다.</p>
              )}
            </div>
          </div>
        </GlassCard>

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
