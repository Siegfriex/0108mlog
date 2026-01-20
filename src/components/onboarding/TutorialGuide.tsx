/**
 * TutorialGuide 컴포넌트
 * 
 * 온보딩 6단계: 첫 체크인 가이드
 * PRD 명세: 인터랙티브 튜토리얼 (3단계)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MessageCircle, Sparkles, Target, CheckCircle } from 'lucide-react';
import { Button } from '../ui';
import { OnboardingContainer } from '../layout/OnboardingContainer';
import { OnboardingSection } from './OnboardingSection';

/**
 * TutorialGuide Props 인터페이스
 */
export interface TutorialGuideProps {
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * 튜토리얼 단계 데이터
 */
const TUTORIAL_STEPS = [
  {
    id: 1,
    title: '대화로 감정을 입력해보세요',
    description: 'AI 코치와 자연스러운 대화로 오늘의 감정을 공유해요',
    icon: <MessageCircle size={48} />,
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 2,
    title: 'AI가 오늘의 피드백을 제공합니다',
    description: '당신의 감정을 분석하고 맞춤형 인사이트를 제공해요',
    icon: <Sparkles size={48} />,
    color: 'from-purple-100 to-purple-200',
  },
  {
    id: 3,
    title: '작은 액션 1개로 시작하세요',
    description: '오늘 바로 실천할 수 있는 작은 액션을 제안해드려요',
    icon: <Target size={48} />,
    color: 'from-brand-secondary to-brand-primary',
  },
];

/**
 * TutorialGuide 컴포넌트
 * 
 * @component
 * @param {TutorialGuideProps} props - 컴포넌트 props
 * @returns {JSX.Element} TutorialGuide 컴포넌트
 */
export const TutorialGuide: React.FC<TutorialGuideProps> = ({
  onComplete,
  onBack,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  /**
   * 다음 단계로 이동
   */
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  /**
   * 이전 단계로 이동
   */
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const currentTutorial = TUTORIAL_STEPS[currentStep];

  return (
    <OnboardingContainer maxWidth="lg">
      <OnboardingSection spacing="normal" align="center">
        {/* 헤더 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            첫 체크인 가이드
          </h2>
          <p className="text-sm text-slate-500">
            {currentStep + 1}/{TUTORIAL_STEPS.length}
          </p>
        </div>

      {/* 튜토리얼 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-xl"
        >
          {/* 아이콘 */}
          <div className={`
            w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${currentTutorial.color}
            flex items-center justify-center text-white
            shadow-lg
          `}>
            <div className="scale-90 sm:scale-100">
              {currentTutorial.icon}
            </div>
          </div>

          {/* 제목 및 설명 */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {currentTutorial.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentTutorial.description}
            </p>
          </div>

          {/* 단계 인디케이터 */}
          <div className="flex justify-center gap-2 mt-8">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentStep
                    ? 'bg-brand-primary w-8'
                    : 'bg-slate-300'
                  }
                `}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="flex-1"
          >
            <ArrowLeft size={18} className="mr-2" />
            뒤로
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="flex-1"
          >
            스킵
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            className="flex-1"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              <>
                시작하기
                <CheckCircle size={18} className="ml-2" />
              </>
            ) : (
              <>
                다음
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </OnboardingSection>
    </OnboardingContainer>
  );
};
