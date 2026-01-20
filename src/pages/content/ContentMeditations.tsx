/**
 * 명상 페이지
 *
 * PRD 경로: /content/meditations
 * YouTube 명상 영상 검색 및 표시
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { GlassCard, LoadingSpinner, YouTubeCard } from '../../components/ui';
import { useMeditationVideos } from '../../hooks/useYouTubeAPI';

const MOOD_OPTIONS = [
  { value: '평온', label: '평온' },
  { value: '불안', label: '불안 해소' },
  { value: '스트레스', label: '스트레스 완화' },
  { value: '수면', label: '수면 유도' },
  { value: '집중', label: '집중력 향상' },
];

const DURATION_OPTIONS = [
  { value: '', label: '전체' },
  { value: '5', label: '5분' },
  { value: '10', label: '10분' },
  { value: '15', label: '15분' },
  { value: '30', label: '30분' },
];

/**
 * ContentMeditations 컴포넌트
 */
export const ContentMeditations: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState('평온');
  const [selectedDuration, setSelectedDuration] = useState('');

  const { data: videos, isLoading, error, refetch } = useMeditationVideos(
    selectedMood,
    selectedDuration || undefined
  );

  return (
    <div className="h-full flex flex-col p-6 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate('/content')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">명상</h2>
        <button
          onClick={() => refetch()}
          className="ml-auto p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="새로고침"
          disabled={isLoading}
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 필터 영역 */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-2 block">분위기</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMood(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedMood === option.value
                    ? 'bg-brand-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-2 block">시간</label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDuration(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedDuration === option.value
                    ? 'bg-brand-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <GlassCard className="p-6 text-center">
            <p className="text-slate-600 mb-4">영상을 불러오는 중 오류가 발생했습니다.</p>
            <button
              onClick={() => refetch()}
              className="text-brand-primary hover:underline"
            >
              다시 시도
            </button>
          </GlassCard>
        )}

        {!isLoading && !error && videos && videos.length === 0 && (
          <GlassCard className="p-6 text-center">
            <p className="text-slate-600">검색 결과가 없습니다.</p>
          </GlassCard>
        )}

        {!isLoading && !error && videos && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((video) => (
              <YouTubeCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
