/**
 * InitialAssessment 컴포넌트
 * 
 * 온보딩 3단계: 초기 평가
 * PRD 명세: 3개 질문 (감정 상태, 필요한 도움, 체크인 목표)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Smile, Frown, Meh } from 'lucide-react';
import { Button } from '../ui';
import { OnboardingData } from './OnboardingFlow';
import { OnboardingContainer } from '../layout/OnboardingContainer';
import { OnboardingSection } from './OnboardingSection';

/**
 * InitialAssessment Props 인터페이스
 */
export interface InitialAssessmentProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * 질문 1: 감정 상태 옵션 (5점 척도)
 */
const EMOTION_OPTIONS = [
  { value: 1, label: '매우 나쁨', icon: <Frown size={36} />, color: 'text-red-500' },
  { value: 2, label: '나쁨', icon: <Frown size={36} />, color: 'text-orange-500' },
  { value: 3, label: '보통', icon: <Meh size={36} />, color: 'text-yellow-500' },
  { value: 4, label: '좋음', icon: <Smile size={36} />, color: 'text-blue-500' },
  { value: 5, label: '매우 좋음', icon: <Smile size={36} />, color: 'text-green-500' },
];

/**
 * 질문 2: 필요한 도움 옵션 (다중 선택)
 */
const HELP_OPTIONS = [
  '감정 패턴 이해',
  '스트레스 관리',
  '수면 개선',
  '자존감 향상',
  '일상 자기관리',
  '대인관계 개선',
];

/**
 * 질문 3: 체크인 목표 옵션 (단일 선택)
 */
const GOAL_OPTIONS = [
  '감정을 더 잘 이해하고 싶어요',
  '일상에서 작은 실천을 하고 싶어요',
  '스트레스를 효과적으로 관리하고 싶어요',
  '더 나은 나를 만들어가고 싶어요',
];

/**
 * InitialAssessment 컴포넌트
 * 
 * @component
 * @param {InitialAssessmentProps} props - 컴포넌트 props
 * @returns {JSX.Element} InitialAssessment 컴포넌트
 */
export const InitialAssessment: React.FC<InitialAssessmentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  onSkip,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<1 | 2 | 3>(1);
  const [emotionState, setEmotionState] = useState<number | undefined>(data.initialEmotionState);
  const [neededHelp, setNeededHelp] = useState<string[]>(data.neededHelp || []);
  const [checkinGoal, setCheckinGoal] = useState<string | undefined>(data.checkinGoal);

  /**
   * 질문 1 완료 처리
   */
  const handleQuestion1Complete = (value: number) => {
    setEmotionState(value);
    onUpdate({ initialEmotionState: value });
    setTimeout(() => setCurrentQuestion(2), 300);
  };

  /**
   * 질문 2 완료 처리
   */
  const handleQuestion2Toggle = (option: string) => {
    const updated = neededHelp.includes(option)
      ? neededHelp.filter(h => h !== option)
      : [...neededHelp, option];
    setNeededHelp(updated);
    onUpdate({ neededHelp: updated });
  };

  /**
   * 질문 3 완료 처리
   */
  const handleQuestion3Select = (goal: string) => {
    setCheckinGoal(goal);
    onUpdate({ checkinGoal: goal });
  };

  /**
   * 다음 질문으로 이동
   */
  const handleNextQuestion = () => {
    if (currentQuestion < 3) {
      setCurrentQuestion((currentQuestion + 1) as 1 | 2 | 3);
    } else {
      onNext();
    }
  };

  return (
    <OnboardingContainer maxWidth="lg">
      <OnboardingSection spacing="normal" align="center">
        {/* 헤더 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            초기 평가
          </h2>
          <p className="text-base text-slate-500">
            {currentQuestion}/3
          </p>
        </div>

      <AnimatePresence mode="wait">
        {/* 질문 1: 감정 상태 */}
        {currentQuestion === 1 && (
          <motion.div
            key="question1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                요즘 감정 상태는 어떠신가요?
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {EMOTION_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleQuestion1Complete(option.value)}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex flex-col items-center gap-2 sm:gap-3 p-5 sm:p-6 rounded-xl
                    transition-all duration-300
                    ${emotionState === option.value
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                      : 'bg-white/80 border border-white/60 hover:bg-brand-light'
                    }
                  `}
                >
                  <div className={emotionState === option.value ? 'text-white' : option.color}>
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 질문 2: 필요한 도움 */}
        {currentQuestion === 2 && (
          <motion.div
            key="question2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                어떤 도움이 필요하신가요?
              </h3>
              <p className="text-base text-slate-500">여러 개 선택 가능해요</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {HELP_OPTIONS.map((option, index) => (
                <motion.button
                  key={option}
                  onClick={() => handleQuestion2Toggle(option)}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-4 rounded-xl text-left
                    transition-all duration-300
                    ${neededHelp.includes(option)
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                      : 'bg-white/80 border border-white/60 hover:bg-brand-light'
                    }
                  `}
                >
                  <span className="text-sm font-medium">{option}</span>
                </motion.button>
              ))}
            </div>
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              className="w-full"
              disabled={neededHelp.length === 0}
            >
              다음
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* 질문 3: 체크인 목표 */}
        {currentQuestion === 3 && (
          <motion.div
            key="question3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                체크인 목표는 무엇인가요?
              </h3>
            </div>
            <div className="space-y-3">
              {GOAL_OPTIONS.map((goal, index) => (
                <motion.button
                  key={goal}
                  onClick={() => handleQuestion3Select(goal)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full p-4 rounded-xl text-left
                    transition-all duration-300
                    ${checkinGoal === goal
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                      : 'bg-white/80 border border-white/60 hover:bg-brand-light'
                    }
                  `}
                >
                  <span className="text-sm font-medium">{goal}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={currentQuestion === 1 ? onBack : () => setCurrentQuestion((currentQuestion - 1) as 1 | 2 | 3)}
            variant="ghost"
            className="flex-1"
          >
            <ArrowLeft size={18} className="mr-2" />
            뒤로
          </Button>
          {currentQuestion === 3 ? (
            <>
              <Button
                onClick={onSkip}
                variant="ghost"
                className="flex-1"
              >
                스킵
              </Button>
              <Button
                onClick={onNext}
                variant="primary"
                className="flex-1"
                disabled={!checkinGoal}
              >
                다음
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              className="flex-1"
              disabled={currentQuestion === 1 && !emotionState}
            >
              다음
              <ArrowRight size={18} className="ml-2" />
            </Button>
          )}
        </div>
      </OnboardingSection>
    </OnboardingContainer>
  );
};
