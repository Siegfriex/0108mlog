/**
 * ReminderBadge Component
 *
 * FEAT-010: 죄책감 없는 리마인드
 * PRD 명세: 인앱 리마인드 카드/배지
 *
 * 압박 방지 카피 가이드:
 * - "지금 아니어도 괜찮다", "부담 없이" 같은 선택권/자율성 강조
 * - "왜 안 했나요", "연속 기록이 끊겼어요" 같은 죄책감 유발 금지
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Sparkles, Heart } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getUserSettings } from '../../services/firestore';

export interface ReminderBadgeProps {
  /**
   * 체크인 완료 시 호출
   */
  onCheckinClick?: () => void;
  /**
   * 마지막 체크인 시간 (없으면 오늘 첫 체크인)
   */
  lastCheckinTime?: Date | null;
  /**
   * 사용자 이름 (선택적)
   */
  userName?: string;
}

/**
 * PRD 리마인드 메시지 샘플 (압박 방지 카피)
 */
const REMINDER_MESSAGES = [
  { text: '오늘 기분은 어떠세요? 부담 없이 한 줄만', icon: <Heart size={18} /> },
  { text: '지금 아니어도 괜찮아요. 언제든 여기 있을게요', icon: <Sparkles size={18} /> },
  { text: '오늘 하루도 수고하셨어요', icon: <Heart size={18} /> },
  { text: '잠깐, 나만의 시간을 가져볼까요?', icon: <Clock size={18} /> },
  { text: '당신의 감정이 소중해요', icon: <Heart size={18} /> },
];

/**
 * ReminderBadge Component
 */
export const ReminderBadge: React.FC<ReminderBadgeProps> = ({
  onCheckinClick,
  lastCheckinTime,
  userName,
}) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [settings, setSettings] = useState<{
    reminderEnabled: boolean;
    reminderTime: string;
    snoozeUntil?: Date;
  } | null>(null);

  // 랜덤 메시지 선택 (세션당 고정)
  const reminderMessage = useMemo(() => {
    const index = Math.floor(Math.random() * REMINDER_MESSAGES.length);
    return REMINDER_MESSAGES[index];
  }, []);

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getUserSettings();
        if (userSettings) {
          setSettings({
            reminderEnabled: userSettings.reminderEnabled ?? true,
            reminderTime: userSettings.reminderTime ?? '09:00',
            snoozeUntil: userSettings.snoozeUntil
              ? userSettings.snoozeUntil instanceof Date
                ? userSettings.snoozeUntil
                : new Date(userSettings.snoozeUntil as unknown as string)
              : undefined,
          });
        } else {
          // 기본값
          setSettings({
            reminderEnabled: true,
            reminderTime: '09:00',
          });
        }
      } catch (error) {
        console.error('Failed to load reminder settings:', error);
        // 기본값으로 설정
        setSettings({
          reminderEnabled: true,
          reminderTime: '09:00',
        });
      }
    };

    loadSettings();
  }, []);

  // 리마인더 표시 여부 결정
  useEffect(() => {
    if (!settings || dismissed) {
      setVisible(false);
      return;
    }

    // 리마인더가 비활성화된 경우
    if (!settings.reminderEnabled) {
      setVisible(false);
      return;
    }

    // 스누즈 중인 경우
    if (settings.snoozeUntil && new Date() < settings.snoozeUntil) {
      setVisible(false);
      return;
    }

    // 오늘 이미 체크인한 경우 리마인더 숨김
    if (lastCheckinTime) {
      const today = new Date();
      const checkinDate = new Date(lastCheckinTime);
      const isSameDay =
        today.getFullYear() === checkinDate.getFullYear() &&
        today.getMonth() === checkinDate.getMonth() &&
        today.getDate() === checkinDate.getDate();

      if (isSameDay) {
        setVisible(false);
        return;
      }
    }

    // 리마인더 시간 확인 (설정된 시간 이후에만 표시)
    const now = new Date();
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // 리마인더 시간이 지났고, 현재 시간이 리마인더 시간 + 12시간 이내인 경우
    const twelveHoursLater = new Date(reminderTime);
    twelveHoursLater.setHours(twelveHoursLater.getHours() + 12);

    if (now >= reminderTime && now <= twelveHoursLater) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [settings, lastCheckinTime, dismissed]);

  // 닫기 핸들러
  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  // 체크인 클릭 핸들러
  const handleCheckinClick = () => {
    onCheckinClick?.();
    setDismissed(true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="mb-4"
        >
          <GlassCard className="!p-4 bg-gradient-to-r from-brand-light to-purple-50 border-brand-secondary/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                {reminderMessage.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {userName ? `${userName}님, ` : ''}
                  {reminderMessage.text}
                </p>
                <button
                  onClick={handleCheckinClick}
                  className="text-xs text-brand-primary font-bold hover:underline"
                >
                  체크인 시작하기
                </button>
              </div>

              <button
                onClick={handleDismiss}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReminderBadge;
