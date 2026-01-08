/**
 * GoalSetting 컴포넌트
 * 
 * 온보딩 4단계: 목표 설정
 * PRD 명세: 목표 카드 선택 (기본값: "일상 자기관리")
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Target, Heart, Brain, Zap } from 'lucide-react';
import { Button } from '../ui';
import { OnboardingData } from './OnboardingFlow';

/**
 * GoalSetting Props 인터페이스
 */
export interface GoalSettingProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * 목표 카드 옵션
 */
const GOAL_CARDS = [
  {
    id: 'pattern',
    title: '감정 패턴 이해',
    description: '나의 감정 변화를 추적하고 패턴을 발견해요',
    icon: <Brain size={32} />,
    color: 'from-purple-100 to-purple-200',
    textColor: 'text-purple-700',
  },
  {
    id: 'daily',
    title: '일상 자기관리',
    description: '매일 작은 실천으로 나를 돌보는 습관을 만들어요',
    icon: <Heart size={32} />,
    color: 'from-brand-secondary to-brand-primary',
    textColor: 'text-brand-dark',
    isDefault: true,
  },
  {
    id: 'stress',
    title: '스트레스 관리',
    description: '일상의 스트레스를 효과적으로 관리하고 완화해요',
    icon: <Zap size={32} />,
    color: 'from-orange-100 to-orange-200',
    textColor: 'text-orange-700',
  },
];

/**
 * GoalSetting 컴포넌트
 * 
 * @component
 * @param {GoalSettingProps} props - 컴포넌트 props
 * @returns {JSX.Element} GoalSetting 컴포넌트
 */
export const GoalSetting: React.FC<GoalSettingProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  onSkip,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string>(
    data.selectedGoal || GOAL_CARDS.find(c => c.isDefault)?.id || 'daily'
  );

  /**
   * 목표 선택 처리
   */
  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    onUpdate({ selectedGoal: goalId });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          목표 설정
        </h2>
        <p className="text-sm text-slate-500">
          어떤 목표로 시작하시겠어요?
        </p>
      </div>

      {/* 목표 카드 그리드 */}
      <div className="space-y-4">
        {GOAL_CARDS.map((card, index) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleGoalSelect(card.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full p-6 rounded-2xl text-left
              transition-all duration-300
              ${selectedGoal === card.id
                ? 'bg-gradient-to-br ' + card.color + ' border-2 border-brand-primary shadow-xl'
                : 'bg-white/80 border border-white/60 hover:bg-white/90'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center shrink-0
                ${selectedGoal === card.id ? card.textColor : 'text-slate-400'}
                ${selectedGoal === card.id ? 'bg-white/80' : 'bg-slate-50'}
              `}>
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className={`
                  font-bold text-lg mb-1
                  ${selectedGoal === card.id ? card.textColor : 'text-slate-900'}
                `}>
                  {card.title}
                </h3>
                <p className={`
                  text-sm
                  ${selectedGoal === card.id ? card.textColor + '/80' : 'text-slate-600'}
                `}>
                  {card.description}
                </p>
                {card.isDefault && (
                  <span className="inline-block mt-2 px-2 py-1 bg-white/60 rounded-md text-xs font-bold text-slate-600">
                    기본 추천
                  </span>
                )}
              </div>
              {selectedGoal === card.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center"
                >
                  <Target size={16} className="text-white" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onBack}
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
          onClick={onNext}
          variant="primary"
          className="flex-1"
        >
          다음
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
