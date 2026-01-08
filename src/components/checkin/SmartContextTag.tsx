/**
 * SmartContextTag 컴포넌트
 * 
 * FEAT-001 일부: 스마트 상황 태그 (GPS/시간대 기반)
 * PRD 명세: GPS/시간대 기반 자동 추천 태그 (0-3개 선택 가능)
 * 
 * 주요 기능:
 * - GPS 기반 위치 감지 및 태그 추천
 * - 시간대 기반 태그 추천
 * - 사용자 수동 태그 입력
 * - 최대 3개 태그 선택
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, X, Plus, Tag } from 'lucide-react';
import { Button } from '../ui';

/**
 * SmartContextTag Props 인터페이스
 */
export interface SmartContextTagProps {
  onTagsChange: (tags: string[]) => void;
  initialTags?: string[];
  locationPermission?: 'granted' | 'denied' | 'default';
}

/**
 * 위치 정보 인터페이스
 */
interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
  placeType?: 'home' | 'work' | 'other';
}

/**
 * 시간대 기반 태그 추천
 * 
 * @param hour 현재 시간 (0-23)
 * @param dayOfWeek 요일 (0-6, 일-토)
 * @returns 추천 태그 배열
 */
const getTimeBasedTags = (hour: number, dayOfWeek: number): string[] => {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const tags: string[] = [];

  // 시간대별 태그
  if (hour >= 6 && hour < 9) {
    tags.push('아침', '출근 전');
  } else if (hour >= 9 && hour < 12) {
    tags.push('오전', '업무');
    if (!isWeekend) tags.push('회의');
  } else if (hour >= 12 && hour < 14) {
    tags.push('점심', '식사');
  } else if (hour >= 14 && hour < 18) {
    tags.push('오후', '업무');
  } else if (hour >= 18 && hour < 22) {
    tags.push('저녁', '퇴근 후');
  } else {
    tags.push('밤', '휴식');
  }

  // 요일별 태그
  if (dayOfWeek === 1) tags.push('월요일');
  if (isWeekend) tags.push('주말');

  return tags.slice(0, 3); // 최대 3개
};

/**
 * 위치 기반 태그 추천 (간단한 추론)
 * 
 * @param location 위치 정보
 * @returns 추천 태그 배열
 */
const getLocationBasedTags = (location: LocationInfo | null): string[] => {
  if (!location) return [];

  const tags: string[] = [];

  // placeType 기반 태그
  if (location.placeType === 'work') {
    tags.push('회사', '업무', '동료');
  } else if (location.placeType === 'home') {
    tags.push('집', '홈', '가족');
  } else {
    tags.push('외출', '이동');
  }

  return tags.slice(0, 3); // 최대 3개
};

/**
 * 전체 태그 풀 (사용자 수동 입력용)
 */
const ALL_TAGS = [
  '출근', '퇴근', '회의', '업무', '점심', '저녁',
  '아침', '밤', '주말', '휴식', '운동', '독서',
  '가족', '친구', '혼자', '스트레스', '기쁨', '평온',
  '불안', '슬픔', '분노', '피곤', '에너지', '집중',
];

/**
 * SmartContextTag 컴포넌트
 * 
 * @component
 * @param {SmartContextTagProps} props - 컴포넌트 props
 * @returns {JSX.Element} SmartContextTag 컴포넌트
 */
export const SmartContextTag: React.FC<SmartContextTagProps> = ({
  onTagsChange,
  initialTags = [],
  locationPermission = 'default',
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');

  /**
   * GPS 위치 감지 및 태그 추천
   */
  useEffect(() => {
    const fetchLocationAndRecommendTags = async () => {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();

      // 시간대 기반 태그 추천
      const timeTags = getTimeBasedTags(hour, dayOfWeek);
      setRecommendedTags(timeTags);

      // GPS 위치 감지 (권한이 있는 경우)
      if (locationPermission === 'granted' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationInfo: LocationInfo = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              // 간단한 추론: 실제로는 역지오코딩 API 사용 필요
              placeType: hour >= 9 && hour < 18 && dayOfWeek >= 1 && dayOfWeek <= 5 ? 'work' : 'other',
            };
            setLocation(locationInfo);

            // 위치 기반 태그 추가
            const locationTags = getLocationBasedTags(locationInfo);
            setRecommendedTags(prev => [...prev, ...locationTags].slice(0, 3));
          },
          (error) => {
            console.warn('위치 감지 실패:', error);
            // 위치 감지 실패 시 시간대 태그만 사용
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      }
    };

    fetchLocationAndRecommendTags();
  }, [locationPermission]);

  /**
   * 태그 선택/해제 처리
   */
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // 태그 제거
      const updated = selectedTags.filter(t => t !== tag);
      setSelectedTags(updated);
      onTagsChange(updated);
    } else if (selectedTags.length < 3) {
      // 태그 추가 (최대 3개)
      const updated = [...selectedTags, tag];
      setSelectedTags(updated);
      onTagsChange(updated);
    }
  };

  /**
   * 수동 태그 추가 처리
   */
  const handleManualAdd = () => {
    if (manualInput.trim() && selectedTags.length < 3 && !selectedTags.includes(manualInput.trim())) {
      const updated = [...selectedTags, manualInput.trim()];
      setSelectedTags(updated);
      onTagsChange(updated);
      setManualInput('');
      setShowManualInput(false);
    }
  };

  /**
   * 태그 제거 처리
   */
  const handleTagRemove = (tag: string) => {
    const updated = selectedTags.filter(t => t !== tag);
    setSelectedTags(updated);
    onTagsChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">
            상황 태그
          </h3>
          <p className="text-xs text-slate-500">
            오늘은 어떤 상황이었나요? (선택사항, 최대 3개)
          </p>
        </div>
        {selectedTags.length > 0 && (
          <span className="text-xs font-bold text-brand-primary">
            {selectedTags.length}/3
          </span>
        )}
      </div>

      {/* 선택된 태그 표시 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <motion.div
              key={tag}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-full text-sm font-medium"
            >
              <Tag size={14} />
              <span>{tag}</span>
              <button
                onClick={() => handleTagRemove(tag)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                aria-label={`${tag} 태그 제거`}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* 추천 태그 */}
      {recommendedTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500">
              추천 태그
            </span>
            {location && (
              <>
                <span className="text-slate-300">•</span>
                <MapPin size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500">
                  위치 기반
                </span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedTags
              .filter(tag => !selectedTags.includes(tag))
              .map(tag => (
                <motion.button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={selectedTags.length >= 3}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-300
                    ${selectedTags.length >= 3
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white/80 border border-white/60 text-slate-700 hover:bg-brand-light hover:border-brand-primary/30'
                    }
                  `}
                >
                  {tag}
                </motion.button>
              ))}
          </div>
        </div>
      )}

      {/* 수동 태그 입력 */}
      {selectedTags.length < 3 && (
        <div>
          {showManualInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
                placeholder="태그 입력 (최대 10자)"
                maxLength={10}
                className="flex-1 px-3 py-2 rounded-lg bg-white/80 border border-white/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
              />
              <Button
                onClick={handleManualAdd}
                variant="primary"
                disabled={!manualInput.trim()}
                className="!px-4 !py-2"
              >
                추가
              </Button>
              <Button
                onClick={() => {
                  setShowManualInput(false);
                  setManualInput('');
                }}
                variant="ghost"
                className="!px-4 !py-2"
              >
                취소
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowManualInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-brand-primary transition-colors"
            >
              <Plus size={14} />
              <span>직접 입력하기</span>
            </button>
          )}
        </div>
      )}

      {/* 태그 풀 (선택적) */}
      {selectedTags.length < 3 && !showManualInput && (
        <details className="text-xs">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-600 mb-2">
            더 많은 태그 보기
          </summary>
          <div className="flex flex-wrap gap-2 mt-2">
            {ALL_TAGS
              .filter(tag => !selectedTags.includes(tag) && !recommendedTags.includes(tag))
              .slice(0, 12)
              .map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  disabled={selectedTags.length >= 3}
                  className={`
                    px-2 py-1 rounded-md text-xs
                    transition-all duration-300
                    ${selectedTags.length >= 3
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-600 hover:bg-brand-light hover:text-brand-primary'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
          </div>
        </details>
      )}
    </div>
  );
};
