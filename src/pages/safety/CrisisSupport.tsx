/**
 * 위기 지원 페이지
 * 
 * PRD 경로: /safety/crisis
 * 위기 상황 대응 플로우 3: 위기 지원 화면
 * 
 * 상담전화 연결 및 전문가 연결 기능 제공
 */

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ShieldAlert, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '../../components/ui';

/**
 * CrisisSupport 컴포넌트
 */
export const CrisisSupport: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/chat';

  /**
   * 원래 화면으로 복귀
   */
  const handleReturnOriginal = () => {
    navigate(returnTo);
  };

  /**
   * 뒤로가기
   */
  const handleBack = () => {
    navigate('/safety?returnTo=' + encodeURIComponent(returnTo));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Warm Shield 스타일 메인 카드 */}
        <div className="p-8 rounded-[2.5rem] text-center bg-gradient-to-b from-rose-50/90 to-white/90 backdrop-blur-2xl border-2 border-rose-100 shadow-[0_20px_40px_-10px_rgba(244,63,94,0.2)]">
          {/* 아이콘 */}
          <div className="w-24 h-24 mx-auto bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6">
            <Heart size={48} className="fill-rose-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">혼자가 아니에요</h2>
          <p className="text-slate-600 mb-8">도움이 필요하시면 언제든 연락하세요</p>
          
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-rose-50 rounded-full text-rose-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">위기 지원</h1>
          </div>

          {/* 상담전화 목록 */}
          <div className="space-y-4 mb-6">
            <a
              href="tel:1577-0199"
              className="block w-full p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl hover:bg-rose-100 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Phone size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-rose-900 text-lg">정신건강 위기상담</h3>
                  <p className="text-rose-600/80 text-sm">24시간 전문 상담</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-rose-600">1577-0199</div>
            </a>

            <a
              href="tel:1393"
              className="block w-full p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl hover:bg-rose-100 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Phone size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-rose-900 text-lg">자살예방상담</h3>
                  <p className="text-rose-600/80 text-sm">당신은 혼자가 아닙니다</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-rose-600">1393</div>
            </a>

            <a
              href="tel:119"
              className="block w-full p-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl hover:from-rose-600 hover:to-rose-700 transition-all shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_30px_rgba(244,63,94,0.4)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ShieldAlert size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">긴급 상황</h3>
                    <p className="text-white/80 text-sm">즉시 위험한 상황</p>
                  </div>
                </div>
                <div className="text-4xl font-bold">119</div>
              </div>
            </a>
          </div>

          {/* 복귀 버튼 */}
          <div className="pt-4 border-t border-rose-100">
            <Button
              onClick={handleReturnOriginal}
              variant="ghost"
              className="w-full py-3 text-slate-600"
            >
              원래 화면으로 돌아가기
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
