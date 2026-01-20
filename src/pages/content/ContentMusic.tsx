/**
 * 음악 페이지
 *
 * PRD 경로: /content/music
 * YouTube 힐링 음악 검색 및 표시
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { GlassCard, LoadingSpinner, YouTubeCard } from '../../components/ui';
import { useMusicVideos } from '../../hooks/useYouTubeAPI';

const MOOD_OPTIONS = [
  { value: '평온', label: '평온' },
  { value: '우울', label: '우울할 때' },
  { value: '행복', label: '기분 좋을 때' },
  { value: '집중', label: '집중' },
  { value: '수면', label: '수면' },
  { value: '자연', label: '자연 소리' },
  { value: '피아노', label: '피아노' },
];

/**
 * ContentMusic 컴포넌트
 */
export const ContentMusic: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState('평온');

  const { data: videos, isLoading, error, refetch } = useMusicVideos(selectedMood);

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
        <h2 className="text-xl font-bold text-slate-800">힐링 음악</h2>
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
      <div className="mb-4">
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
