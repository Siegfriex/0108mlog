/**
 * ActionFeedback 컴포넌트
 * 
 * FEAT-009 일부: Before/After 피드백
 * PRD 명세: 액션 시작 전/후 강도 입력 및 변화 시각화
 * 
 * 주요 기능:
 * - 액션 시작 전 강도 입력 (Before)
 * - 액션 완료 후 강도 입력 (After)
 * - 강도 변화 시각화
 * - 5초 리체크 옵션
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '../ui';

/**
 * ActionFeedback Props 인터페이스
 */
export interface ActionFeedbackProps {
  actionTitle: string;
  onComplete: (before: number, after: number) => void;
  onSkip?: () => void;
}

/**
 * ActionFeedback 컴포넌트
 * 
 * @component
 * @param {ActionFeedbackProps} props - 컴포넌트 props
 * @returns {JSX.Element} ActionFeedback 컴포넌트
 */
export const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  actionTitle,
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<'before' | 'after' | 'result'>('before');
  const [beforeIntensity, setBeforeIntensity] = useState<number | null>(null);
  const [afterIntensity, setAfterIntensity] = useState<number | null>(null);

  /**
   * Before 강도 선택 완료
   */
  const handleBeforeComplete = (intensity: number) => {
    setBeforeIntensity(intensity);
    setStep('after');
  };

  /**
   * After 강도 선택 완료
   */
  const handleAfterComplete = (intensity: number) => {
    setAfterIntensity(intensity);
    setStep('result');
  };

  /**
   * 5초 리체크 처리
   */
  const handleRecheck = () => {
    setStep('after');
    setAfterIntensity(null);
  };

  /**
   * 완료 처리
   */
  const handleFinalComplete = () => {
    if (beforeIntensity !== null && afterIntensity !== null) {
      onComplete(beforeIntensity, afterIntensity);
    }
  };

  /**
   * 강도 변화 계산
   */
  const getIntensityChange = () => {
    if (beforeIntensity === null || afterIntensity === null) return null;
    return afterIntensity - beforeIntensity;
  };

  const change = getIntensityChange();

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {/* Before 단계 */}
        {step === 'before' && (
          <motion.div
            key="before"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              액션 시작 전
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              지금 감정 강도는 어느 정도인가요?
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-slate-500">강도</span>
                <span className="text-xl font-bold text-brand-primary">
                  {beforeIntensity !== null ? beforeIntensity : '-'}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={beforeIntensity || 5}
                onChange={(e) => setBeforeIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
              <Button
                onClick={() => handleBeforeComplete(beforeIntensity || 5)}
                variant="primary"
                className="w-full"
              >
                다음 단계로
              </Button>
              {onSkip && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  className="w-full"
                >
                  스킵
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* After 단계 */}
        {step === 'after' && (
          <motion.div
            key="after"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              액션 완료 후
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {actionTitle}를 완료한 후 감정 강도는 어느 정도인가요?
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-slate-500">강도</span>
                <span className="text-xl font-bold text-brand-primary">
                  {afterIntensity !== null ? afterIntensity : '-'}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={afterIntensity || beforeIntensity || 5}
                onChange={(e) => setAfterIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
              <Button
                onClick={() => handleAfterComplete(afterIntensity || beforeIntensity || 5)}
                variant="primary"
                className="w-full"
              >
                결과 보기
              </Button>
              <Button
                onClick={handleRecheck}
                variant="ghost"
                className="w-full"
              >
                <RotateCcw size={16} className="mr-2" />
                5초 후 다시 체크
              </Button>
            </div>
          </motion.div>
        )}

        {/* Result 단계 */}
        {step === 'result' && change !== null && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">
              변화 결과
            </h3>
            
            {/* 강도 변화 시각화 */}
            <div className="flex items-center justify-center gap-4 my-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700 mb-1">
                  {beforeIntensity}
                </div>
                <div className="text-xs text-slate-500">Before</div>
              </div>
              
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full
                ${change > 0 
                  ? 'bg-green-100 text-green-700' 
                  : change < 0 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-slate-100 text-slate-700'
                }
              `}>
                {change > 0 ? (
                  <TrendingUp size={24} />
                ) : change < 0 ? (
                  <TrendingDown size={24} />
                ) : (
                  <Minus size={24} />
                )}
                <span className="text-xl font-bold">
                  {change > 0 ? `+${change}` : change}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700 mb-1">
                  {afterIntensity}
                </div>
                <div className="text-xs text-slate-500">After</div>
              </div>
            </div>

            {/* 변화 메시지 */}
            <div className="text-center mb-6">
              {change > 0 ? (
                <p className="text-sm text-green-700 font-medium">
                  감정 강도가 {change}점 상승했어요
                </p>
              ) : change < 0 ? (
                <p className="text-sm text-blue-700 font-medium">
                  감정 강도가 {Math.abs(change)}점 하락했어요
                </p>
              ) : (
                <p className="text-sm text-slate-600 font-medium">
                  감정 강도가 유지되었어요
                </p>
              )}
            </div>

            {/* 완료 버튼 */}
            <Button
              onClick={handleFinalComplete}
              variant="primary"
              className="w-full"
            >
              <CheckCircle size={18} className="mr-2" />
              완료
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
