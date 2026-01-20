/**
 * PermissionRequest 컴포넌트
 * 
 * 온보딩 2단계: 권한 요청
 * PRD 명세: 알림 권한 (선택), 위치 권한 (명시적 동의 필수)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, MapPin, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui';
import { OnboardingData } from './OnboardingFlow';

/**
 * PermissionRequest Props 인터페이스
 */
export interface PermissionRequestProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * PermissionRequest 컴포넌트
 * 
 * @component
 * @param {PermissionRequestProps} props - 컴포넌트 props
 * @returns {JSX.Element} PermissionRequest 컴포넌트
 */
export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [locationStatus, setLocationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    // 현재 권한 상태 확인
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission as 'default' | 'granted' | 'denied');
    }
    
    if (navigator.geolocation) {
      // 위치 권한은 직접 확인 불가능하므로 기본값 유지
      setLocationStatus('default');
    }
  }, []);

  /**
   * 알림 권한 요청
   */
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission as 'granted' | 'denied');
        onUpdate({ notificationPermission: permission as 'granted' | 'denied' });
      } catch (error) {
        console.error('알림 권한 요청 실패:', error);
        setNotificationStatus('denied');
        onUpdate({ notificationPermission: 'denied' });
      }
    }
  };

  /**
   * 위치 권한 요청
   */
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationStatus('granted');
          onUpdate({ locationPermission: 'granted' });
        },
        () => {
          setLocationStatus('denied');
          onUpdate({ locationPermission: 'denied' });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('denied');
      onUpdate({ locationPermission: 'denied' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 flex flex-col justify-center min-h-0 flex-1">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          권한 설정
        </h2>
        <p className="text-sm text-slate-500">
          더 나은 경험을 위해 권한이 필요해요
        </p>
      </div>

      {/* 알림 권한 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/60 shadow-lg"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary shrink-0">
            <Bell size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-1">알림 권한</h3>
            <p className="text-sm text-slate-600 mb-4">
              매일 체크인을 도와드릴게요
            </p>
            {notificationStatus === 'granted' ? (
              <div className="flex items-center gap-2 text-sm text-brand-primary">
                <CheckCircle size={16} />
                <span className="font-medium">권한 허용됨</span>
              </div>
            ) : (
              <Button
                onClick={requestNotificationPermission}
                variant="secondary"
                className="w-full"
                disabled={notificationStatus === 'denied'}
              >
                {notificationStatus === 'denied' ? '권한 거부됨' : '알림 허용하기'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 위치 권한 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/60 shadow-lg"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary shrink-0">
            <MapPin size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-1">위치 권한</h3>
            <p className="text-sm text-slate-600 mb-4">
              스마트 상황 태그를 위해 위치 정보가 필요해요
            </p>
            {locationStatus === 'granted' ? (
              <div className="flex items-center gap-2 text-sm text-brand-primary">
                <CheckCircle size={16} />
                <span className="font-medium">권한 허용됨</span>
              </div>
            ) : (
              <Button
                onClick={requestLocationPermission}
                variant="secondary"
                className="w-full"
                disabled={locationStatus === 'denied'}
              >
                {locationStatus === 'denied' ? '권한 거부됨' : '위치 허용하기'}
              </Button>
            )}
            {locationStatus === 'denied' && (
              <p className="text-xs text-slate-400 mt-2">
                스마트 태그 기능이 제한됩니다
              </p>
            )}
          </div>
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
