/**
 * PersonalizationSetup 컴포넌트
 * 
 * 온보딩 5단계: 개인화 설정
 * PRD 명세: 알림 시간 설정 (기본값: 오전 9시), 알림 빈도 설정 (기본값: 하루 1회)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Bell } from 'lucide-react';
import { Button } from '../ui';
import { OnboardingData } from './OnboardingFlow';

/**
 * PersonalizationSetup Props 인터페이스
 */
export interface PersonalizationSetupProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * 알림 빈도 옵션
 */
const FREQUENCY_OPTIONS: Array<{ value: 'daily' | 'twice' | 'weekly'; label: string; description: string }> = [
  { value: 'daily', label: '하루 1회', description: '매일 같은 시간에 알림을 받아요' },
  { value: 'twice', label: '하루 2회', description: '오전과 오후에 알림을 받아요' },
  { value: 'weekly', label: '주 1회', description: '일주일에 한 번 알림을 받아요' },
];

/**
 * 시간 옵션 생성 (오전 6시 ~ 오후 10시, 1시간 간격)
 */
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    options.push(timeString);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

/**
 * PersonalizationSetup 컴포넌트
 * 
 * @component
 * @param {PersonalizationSetupProps} props - 컴포넌트 props
 * @returns {JSX.Element} PersonalizationSetup 컴포넌트
 */
export const PersonalizationSetup: React.FC<PersonalizationSetupProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  onSkip,
}) => {
  const [notificationTime, setNotificationTime] = useState<string>(
    data.notificationTime || '09:00'
  );
  const [notificationFrequency, setNotificationFrequency] = useState<'daily' | 'twice' | 'weekly'>(
    data.notificationFrequency || 'daily'
  );

  /**
   * 알림 시간 변경 처리
   */
  const handleTimeChange = (time: string) => {
    setNotificationTime(time);
    onUpdate({ notificationTime: time });
  };

  /**
   * 알림 빈도 변경 처리
   */
  const handleFrequencyChange = (frequency: 'daily' | 'twice' | 'weekly') => {
    setNotificationFrequency(frequency);
    onUpdate({ notificationFrequency: frequency });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 flex flex-col justify-center min-h-0 flex-1">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          개인화 설정
        </h2>
        <p className="text-sm text-slate-500">
          알림 시간과 빈도를 설정해주세요
        </p>
      </div>

      {/* 알림 시간 설정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">알림 시간</h3>
            <p className="text-xs text-slate-500">체크인 알림을 받을 시간을 선택해주세요</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
          {TIME_OPTIONS.map(time => (
            <button
              key={time}
              onClick={() => handleTimeChange(time)}
              className={`
                px-3 sm:px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-300
                ${notificationTime === time
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-brand-light'
                }
              `}
            >
              {time}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 알림 빈도 설정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">알림 빈도</h3>
            <p className="text-xs text-slate-500">얼마나 자주 알림을 받을지 선택해주세요</p>
          </div>
        </div>
        <div className="space-y-2">
          {FREQUENCY_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleFrequencyChange(option.value)}
              className={`
                w-full p-4 rounded-xl text-left
                transition-all duration-300
                ${notificationFrequency === option.value
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                  : 'bg-slate-50 text-slate-700 hover:bg-brand-light'
                }
              `}
            >
              <div className="font-bold text-sm mb-1">{option.label}</div>
              <div className={`
                text-xs
                ${notificationFrequency === option.value ? 'text-white/80' : 'text-slate-500'}
              `}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

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
