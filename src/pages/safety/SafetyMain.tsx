/**
 * 안전망 메인 페이지
 * 
 * PRD 경로: /safety
 * 위기 상황 대응 플로우 3: 위기 상황 대응
 * 
 * SafetyCheck 단계: "지금 안전하신가요?" 확인 질문
 * - 30초 미응답 타임아웃 시 자동으로 NeedHelp로 전환
 * - returnTo 쿼리 파라미터로 원래 화면 복귀 (ReturnOriginal)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui';

/**
 * SafetyMain 컴포넌트
 */
export const SafetyMain: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/chat';
  
  const [safetyStatus, setSafetyStatus] = useState<'checking' | 'safe' | 'needHelp'>('checking');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 30초 타임아웃 설정
   */
  useEffect(() => {
    if (safetyStatus === 'checking') {
      timeoutRef.current = setTimeout(() => {
        // 30초 미응답 시 자동으로 NeedHelp로 전환
        setSafetyStatus('needHelp');
      }, 30000); // 30초
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [safetyStatus]);

  /**
   * 안전함 선택 핸들러
   */
  const handleSafe = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSafetyStatus('safe');
  };

  /**
   * 도움 필요 선택 핸들러
   */
  const handleNeedHelp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSafetyStatus('needHelp');
  };

  /**
   * 원래 화면으로 복귀
   */
  const handleReturnOriginal = () => {
    navigate(returnTo);
  };

  /**
   * 위기 지원으로 이동
   */
  const handleGoToCrisis = () => {
    navigate(`/safety/crisis?returnTo=${encodeURIComponent(returnTo)}`);
  };

  /**
   * 대처 도구로 이동
   */
  const handleGoToTools = () => {
    navigate(`/safety/tools?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {safetyStatus === 'checking' && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <ShieldAlert size={48} className="text-red-500" strokeWidth={1.5} />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                지금 안전하신가요?
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                즉시 도움이 필요하거나 위험한 상황이라면, 아래 버튼을 눌러주세요.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleNeedHelp}
                  className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 py-4 text-lg font-semibold"
                >
                  <AlertCircle size={20} className="mr-2" />
                  도움이 필요해요
                </Button>
                
                <Button
                  onClick={handleSafe}
                  variant="secondary"
                  className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 py-4 text-lg font-semibold"
                >
                  <CheckCircle size={20} className="mr-2" />
                  안전해요
                </Button>
              </div>

              <p className="text-xs text-slate-400 mt-6">
                30초 내에 응답이 없으면 자동으로 도움 화면으로 이동합니다.
              </p>
            </motion.div>
          )}

          {safetyStatus === 'safe' && (
            <motion.div
              key="safe"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                안전 확인됨
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                안전하시다니 다행입니다. 필요하시면 언제든지 안전망을 이용하실 수 있어요.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleReturnOriginal}
                  variant="primary"
                  className="w-full py-4 text-lg font-semibold"
                >
                  원래 화면으로 돌아가기
                  <ArrowRight size={20} className="ml-2" />
                </Button>
                
                <Button
                  onClick={handleGoToTools}
                  variant="ghost"
                  className="w-full py-3 text-slate-600"
                >
                  대처 도구 보기
                </Button>
              </div>
            </motion.div>
          )}

          {safetyStatus === 'needHelp' && (
            <motion.div
              key="needHelp"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={48} className="text-red-500" strokeWidth={1.5} />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                도움이 필요하시군요
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                전문가 상담이나 대처 도구를 통해 도움을 받으실 수 있어요.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleGoToCrisis}
                  className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 py-4 text-lg font-semibold"
                >
                  위기 지원 전화 연결
                  <ArrowRight size={20} className="ml-2" />
                </Button>
                
                <Button
                  onClick={handleGoToTools}
                  variant="secondary"
                  className="w-full border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-4 text-lg font-semibold"
                >
                  대처 도구 사용하기
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
