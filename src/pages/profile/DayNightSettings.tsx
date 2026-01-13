/**
 * Day/Night 모드 설정 페이지
 * 
 * PRD 경로: /profile/daynight
 * Day/Night 모드 설정 화면
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, LoadingSpinner } from '../../components/ui';
import { Moon, Sun, Clock } from 'lucide-react';
import { saveUserSettings, getUserSettings } from '../../services/firestore';
import { motion } from 'framer-motion';

/**
 * DayNightSettings 컴포넌트
 */
export const DayNightSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [dayModeStart, setDayModeStart] = useState('06:00');
  const [nightModeStart, setNightModeStart] = useState('18:00');

  // 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await getUserSettings();
        
        if (settings) {
          setAutoMode(settings.autoDayNightMode ?? true);
          if (settings.dayModeStartTime) {
            setDayModeStart(settings.dayModeStartTime);
          }
          if (settings.nightModeStartTime) {
            setNightModeStart(settings.nightModeStartTime);
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
        autoDayNightMode: autoMode,
        dayModeStartTime: autoMode ? dayModeStart : undefined,
        nightModeStartTime: autoMode ? nightModeStart : undefined,
      });
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
        <h2 className="text-xl font-bold text-slate-800">Day/Night 모드 설정</h2>
      </div>

      <div className="space-y-4 max-w-2xl">
        <GlassCard className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-1">자동 모드 전환</h3>
                <p className="text-sm text-slate-600">시간대에 따라 자동으로 Day/Night 모드 전환</p>
              </div>
              <button
                onClick={() => setAutoMode(!autoMode)}
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${autoMode ? 'bg-brand-primary' : 'bg-slate-300'}
                `}
                aria-label={autoMode ? '자동 모드 끄기' : '자동 모드 켜기'}
              >
                <motion.div 
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                  animate={{ x: autoMode ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {autoMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun size={18} className="text-amber-500" />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Day Mode 시작 시간</h4>
                      <p className="text-xs text-slate-500">빠른 체크인 모드 시작 시간</p>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={dayModeStart}
                    onChange={(e) => setDayModeStart(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon size={18} className="text-indigo-500" />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Night Mode 시작 시간</h4>
                      <p className="text-xs text-slate-500">깊은 성찰 모드 시작 시간</p>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={nightModeStart}
                    onChange={(e) => setNightModeStart(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              <div className="flex-1 p-4 border border-slate-200 rounded-xl bg-gradient-to-br from-amber-50 to-white">
                <Sun size={24} className="text-amber-500 mb-2" />
                <h4 className="font-bold text-slate-800 mb-1">Day Mode</h4>
                <p className="text-xs text-slate-600 mb-2">빠른 체크인 (Woebot 스타일)</p>
                <p className="text-xs text-slate-500">3~5턴, 5분 이내</p>
              </div>
              <div className="flex-1 p-4 border border-slate-200 rounded-xl bg-gradient-to-br from-indigo-50 to-white">
                <Moon size={24} className="text-indigo-500 mb-2" />
                <h4 className="font-bold text-slate-800 mb-1">Night Mode</h4>
                <p className="text-xs text-slate-600 mb-2">깊은 성찰 (답다 스타일)</p>
                <p className="text-xs text-slate-500">일기 + AI 편지</p>
              </div>
            </div>
          </div>
        </GlassCard>

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

