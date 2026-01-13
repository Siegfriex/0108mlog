/**
 * 대처 도구 페이지
 * 
 * PRD 경로: /safety/tools
 * 위기 상황 대응 플로우 3: 대처 도구 화면
 * 
 * 호흡 운동, 그라운딩, 이완 운동 등 대처 도구 제공
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Anchor, HeartPulse, ArrowLeft, X } from 'lucide-react';
import { Button } from '../../components/ui';

/**
 * CopingTools 컴포넌트
 */
export const CopingTools: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/chat';
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

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

  /**
   * 도구 선택
   */
  const handleSelectTool = (toolId: string) => {
    setSelectedTool(toolId);
  };

  /**
   * 도구 닫기
   */
  const handleCloseTool = () => {
    setSelectedTool(null);
  };

  /**
   * 호흡 운동 가이드
   */
  const BreathingGuide = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleCloseTool}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-indigo-900">박스 호흡법</h3>
          <button
            onClick={handleCloseTool}
            className="p-2 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Wind size={48} className="text-indigo-600" />
            </div>
            <p className="text-slate-600 leading-relaxed">
              천천히 따라해보세요. 각 단계를 4초씩 유지합니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-xl">
              <div className="text-sm font-semibold text-indigo-900 mb-2">1. 숨 들이쉬기 (4초)</div>
              <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500"
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl">
              <div className="text-sm font-semibold text-indigo-900 mb-2">2. 숨 참기 (4초)</div>
              <div className="h-2 bg-indigo-200 rounded-full">
                <motion.div
                  className="h-full bg-indigo-500"
                  animate={{ width: '100%' }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl">
              <div className="text-sm font-semibold text-indigo-900 mb-2">3. 숨 내쉬기 (4초)</div>
              <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 ml-auto"
                  animate={{ width: ['100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl">
              <div className="text-sm font-semibold text-indigo-900 mb-2">4. 숨 참기 (4초)</div>
              <div className="h-2 bg-indigo-200 rounded-full">
                <motion.div
                  className="h-full bg-indigo-500"
                  animate={{ width: '0%' }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            자율신경계를 안정시켜 불안을 완화하는 데 도움이 됩니다.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );

  /**
   * 그라운딩 가이드
   */
  const GroundingGuide = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleCloseTool}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-emerald-900">5-4-3-2-1 그라운딩</h3>
          <button
            onClick={handleCloseTool}
            className="p-2 hover:bg-emerald-50 rounded-full text-emerald-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Anchor size={48} className="text-emerald-600" />
            </div>
            <p className="text-slate-600 leading-relaxed">
              현재 순간에 집중하여 불안을 줄이는 기법입니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="text-lg font-bold text-emerald-900 mb-2">5가지 보기</div>
              <p className="text-sm text-slate-600">주변에서 볼 수 있는 5가지를 찾아보세요.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="text-lg font-bold text-emerald-900 mb-2">4가지 느끼기</div>
              <p className="text-sm text-slate-600">만질 수 있는 4가지를 찾아보세요.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="text-lg font-bold text-emerald-900 mb-2">3가지 듣기</div>
              <p className="text-sm text-slate-600">들리는 소리 3가지를 찾아보세요.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="text-lg font-bold text-emerald-900 mb-2">2가지 냄새 맡기</div>
              <p className="text-sm text-slate-600">냄새를 맡을 수 있는 2가지를 찾아보세요.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="text-lg font-bold text-emerald-900 mb-2">1가지 맛보기</div>
              <p className="text-sm text-slate-600">맛볼 수 있는 1가지를 찾아보세요.</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            현재 순간에 집중하여 불안에서 벗어나세요.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">대처 도구</h1>
          </div>

          {/* 도구 목록 */}
          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleSelectTool('breathing')}
              className="w-full p-6 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Wind size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-indigo-900 mb-1">박스 호흡법</h3>
                  <p className="text-indigo-600/80 text-sm leading-relaxed">
                    숨 들이쉬기-참기-내쉬기-참기를 4초씩 반복하여 자율신경계를 안정시킵니다.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectTool('grounding')}
              className="w-full p-6 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl hover:bg-emerald-50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Anchor size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 mb-1">5-4-3-2-1 그라운딩</h3>
                  <p className="text-emerald-600/80 text-sm leading-relaxed">
                    보기-느끼기-듣기-냄새맡기-맛보기를 통해 현재 순간에 집중합니다.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* 복귀 버튼 */}
          <div className="pt-4 border-t border-slate-100">
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

      {/* 도구 가이드 모달 */}
      <AnimatePresence>
        {selectedTool === 'breathing' && <BreathingGuide />}
        {selectedTool === 'grounding' && <GroundingGuide />}
      </AnimatePresence>
    </div>
  );
};
