/**
 * 설정 페이지
 * 
 * PRD 경로: /profile/settings
 * 앱 설정 관리 화면
 * FEAT-010: 리마인드 설정 (FRD-005)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, LoadingSpinner } from '../../components/ui';
import { Bell, Globe, Clock, Zap, Pause, Download, Loader2, Sparkles, Moon } from 'lucide-react';
import { saveUserSettings, getUserSettings, exportAllUserData } from '../../services/firestore';
import { FirestoreUserProfile } from '../../types/firestore';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts';

/**
 * Settings 컴포넌트
 */
export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // 설정 상태
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'twice' | 'none'>('daily');
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [predictiveNudgeEnabled, setPredictiveNudgeEnabled] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<Date | null>(null);

  // 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await getUserSettings();
        
        if (settings) {
          setReminderEnabled(settings.reminderEnabled ?? true);
          setReminderTime(settings.reminderTime ?? '09:00');
          setReminderFrequency(settings.reminderFrequency ?? 'daily');
          setLanguage(settings.language ?? 'ko');
          setPredictiveNudgeEnabled(settings.predictiveNudgeEnabled ?? false);
          if (settings.snoozeUntil) {
            const snoozeDate = settings.snoozeUntil instanceof Date 
              ? settings.snoozeUntil 
              : settings.snoozeUntil instanceof Timestamp
              ? settings.snoozeUntil.toDate()
              : new Date(settings.snoozeUntil);
            setSnoozeUntil(snoozeDate);
          }
        }
      } catch (error) {
        console.error('설정 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 설정 저장
  const handleSave = async () => {
    try {
      setSaving(true);
      await saveUserSettings({
        reminderEnabled,
        reminderTime,
        reminderFrequency,
        language,
        predictiveNudgeEnabled,
        snoozeUntil: snoozeUntil || undefined,
      });
      
      // 저장 성공 피드백
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 스누즈 설정 (24시간)
  const handleSnooze = async () => {
    const snoozeDate = new Date();
    snoozeDate.setHours(snoozeDate.getHours() + 24);
    setSnoozeUntil(snoozeDate);
    await saveUserSettings({
      snoozeUntil: snoozeDate,
    });
    alert('알림이 24시간 동안 일시중지되었습니다.');
  };

  // 스누즈 해제
  const handleUnsnooze = async () => {
    setSnoozeUntil(null);
    await saveUserSettings({
      snoozeUntil: undefined,
    });
  };

  // 데이터 내보내기
  const handleExportData = async () => {
    try {
      setExporting(true);
      const data = await exportAllUserData();

      // JSON 파일로 다운로드
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `maumlog_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('데이터가 성공적으로 내보내졌습니다.');
    } catch (error) {
      console.error('데이터 내보내기 오류:', error);
      alert('데이터 내보내기 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">설정</h2>
      </div>

      <div className="space-y-3 max-w-2xl">
        {/* 알림 설정 */}
        <motion.div
          data-testid="setting-notification"
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-glass hover:shadow-floating transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
              <Bell size={20} className="text-brand-primary" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">알림</h3>
              <p className="text-sm text-slate-600">체크인 리마인드 알림</p>
            </div>
          </div>
          <button
            onClick={() => setReminderEnabled(!reminderEnabled)}
            className={`
              w-12 h-6 rounded-full transition-colors relative
              ${reminderEnabled ? 'bg-brand-primary' : 'bg-slate-300'}
            `}
            aria-label={reminderEnabled ? '알림 끄기' : '알림 켜기'}
          >
            <motion.div 
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
              animate={{ x: reminderEnabled ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>
        
        {reminderEnabled && (
          <GlassCard className="p-6">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-slate-200"
              >
                {/* 알림 시간 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-slate-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">알림 시간</h4>
                      <p className="text-xs text-slate-500">매일 알림을 받을 시간</p>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>

                {/* 알림 빈도 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-slate-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">알림 빈도</h4>
                      <p className="text-xs text-slate-500">하루에 받을 알림 횟수</p>
                    </div>
                  </div>
                  <select
                    value={reminderFrequency}
                    onChange={(e) => setReminderFrequency(e.target.value as 'daily' | 'twice' | 'none')}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  >
                    <option value="daily">하루 1회</option>
                    <option value="twice">하루 2회</option>
                    <option value="none">없음</option>
                  </select>
                </div>

                {/* 스누즈 */}
                {snoozeUntil && snoozeUntil > new Date() ? (
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <Pause size={16} className="text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">알림 일시중지 중</p>
                        <p className="text-xs text-amber-700">
                          {snoozeUntil.toLocaleString('ko-KR', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}까지
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleUnsnooze}
                      className="px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                    >
                      해제
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSnooze}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                  >
                    <Pause size={16} />
                    <span>24시간 일시중지</span>
                  </button>
                )}
              </motion.div>
            </div>
          </GlassCard>
        )}

        {/* 예측 넛지 설정 */}
        <motion.div
          data-testid="setting-predictive-nudge"
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-glass hover:shadow-floating transition-all"
        >
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 mb-1">예측 넛지</h3>
            <p className="text-sm text-slate-600 mb-2">
              반복 패턴 시간대에 예방 코칭을 제안합니다
            </p>
            <p className="text-xs text-slate-500">
              예: "보통 이 시간쯤 마음이 무거워지곤 하셨어요. 미리 '따뜻한 차 마시기'로 예방해볼까요?"
            </p>
          </div>
          <button
            onClick={() => setPredictiveNudgeEnabled(!predictiveNudgeEnabled)}
            className={`
              w-12 h-6 rounded-full transition-colors relative ml-4
              ${predictiveNudgeEnabled ? 'bg-brand-primary' : 'bg-slate-300'}
            `}
            aria-label={predictiveNudgeEnabled ? '예측 넛지 끄기' : '예측 넛지 켜기'}
          >
            <motion.div 
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
              animate={{ x: predictiveNudgeEnabled ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>

        {/* 언어 설정 */}
        <motion.div
          data-testid="setting-language"
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-glass hover:shadow-floating transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
              <Globe size={20} className="text-brand-primary" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">언어</h3>
              <p className="text-sm text-slate-600">앱 언어 설정</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </motion.div>

        {/* 데이터 내보내기 */}
        <motion.div
          data-testid="setting-export"
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-glass hover:shadow-floating transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
              <Download size={20} className="text-brand-primary" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">데이터 내보내기</h3>
              <p className="text-sm text-slate-600">나의 모든 데이터를 JSON 파일로 다운로드</p>
            </div>
          </div>
          <Button
            onClick={handleExportData}
            variant="ghost"
            disabled={exporting}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                내보내는 중...
              </>
            ) : (
              '내보내기'
            )}
          </Button>
        </motion.div>

        {/* 이스터에그 카드 - 나이트모드 전용 (리디자인) */}
        {mode === 'night' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-0 overflow-hidden relative group cursor-pointer border-purple-500/20 shadow-lg shadow-purple-900/10">
              <button
                onClick={() => navigate('/easter-egg/gate')}
                className="w-full text-left p-6 relative z-10"
              >
                {/* 배경 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Moon size={18} className="text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-wide">Hidden Space</h3>
                      <p className="text-xs text-slate-500 mt-0.5">특별한 누군가를 위한 공간</p>
                    </div>
                  </div>
                  <Sparkles size={16} className="text-purple-300 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </GlassCard>
          </motion.div>
        )}

        {/* 저장 버튼 */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            variant="primary"
            className="w-full"
            disabled={saving}
          >
            {saving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
};
