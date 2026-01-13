/**
 * 동의 모달 컴포넌트
 * 
 * 대화/일기 원문 저장 동의를 요청하는 모달
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Check } from 'lucide-react';
import { Button } from '../ui';
import { saveConsent } from '../../services/consent';

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
  onSkip: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onConsent, onSkip }) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConsent = async () => {
    if (!isAgreed) return;

    try {
      setIsSaving(true);
      await saveConsent(true);
      onConsent();
    } catch (error) {
      console.error('Failed to save consent:', error);
      alert('동의 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    try {
      await saveConsent(false);
      onSkip();
    } catch (error) {
      console.error('Failed to save consent skip:', error);
      // 스킵 실패해도 진행
      onSkip();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-consent-backdrop bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-consent-modal flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <Shield size={24} className="text-brand-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">대화 저장에 동의하시겠습니까?</h2>
                </div>
              </div>

              {/* 본문 */}
              <div className="space-y-4 mb-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  대화와 일기 원문을 저장하면 더 나은 경험을 제공할 수 있습니다.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-1">📋 저장 목적</h3>
                    <p className="text-xs text-slate-600">
                      체크인/리포트/액션 추천, AI 인사이트 생성
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-1">⏰ 보관기간</h3>
                    <p className="text-xs text-slate-600">
                      영구 (삭제 요청 시까지)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-1">🗑️ 삭제 권한</h3>
                    <p className="text-xs text-slate-600">
                      언제든 개별 메시지/대화/전체 삭제 가능
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="pt-0.5">
                    <Shield size={16} className="text-amber-600" />
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    동의 없이도 기본 기능은 사용 가능하나, 대화 저장 기능은 사용할 수 없습니다.
                    감정 수치와 태그는 동의 없이도 저장됩니다.
                  </p>
                </div>

                {/* 체크박스 */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${isAgreed
                          ? 'bg-brand-primary border-brand-primary'
                          : 'border-slate-300 group-hover:border-brand-primary/50'
                        }
                      `}
                    >
                      {isAgreed && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <span className="text-sm text-slate-700 leading-relaxed">
                    위 내용을 확인했으며, 대화 저장에 동의합니다.
                  </span>
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button
                  onClick={handleConsent}
                  variant="primary"
                  className="flex-1"
                  disabled={!isAgreed || isSaving}
                >
                  {isSaving ? '저장 중...' : '동의하고 시작하기'}
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="px-6"
                >
                  나중에
                </Button>
              </div>

              {/* 링크 */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    // TODO: 자세히 보기 페이지로 이동
                    window.open('/profile/privacy', '_blank');
                  }}
                  className="text-xs text-slate-500 hover:text-brand-primary transition-colors underline"
                >
                  자세히 보기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
