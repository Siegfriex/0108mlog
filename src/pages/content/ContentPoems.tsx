/**
 * 시집 페이지
 * 
 * PRD 경로: /content/poems
 * 시집 콘텐츠 화면
 */

import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {GlassCard, Button} from "../../components/ui";
import {usePoemSearch} from "../../hooks/useCustomSearch";
import {PoemCard} from "../../components/ui/PoemCard";

/**
 * ContentPoems 컴포넌트
 */
export const ContentPoems: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState("위로");
  const [selectedEmotion, setSelectedEmotion] = useState<string | undefined>();

  const {data: poems, isLoading, error} = usePoemSearch(
    selectedMood,
    selectedEmotion
  );

  const moods = ["위로", "격려", "희망", "평화", "힘", "사랑", "용기"];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate("/content")}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">시집</h2>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden">
        {/* Mood 선택기 */}
        <div className="flex gap-2 flex-wrap mb-4 pb-4 border-b border-slate-200">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                selectedMood === mood
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500">시를 찾고 있어요...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-2">
                검색 중 오류가 발생했습니다.
              </div>
              <div className="text-sm text-slate-600 mb-4">
                {error.message}
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                다시 시도
              </Button>
            </div>
          ) : poems && poems.length > 0 ? (
            <div className="space-y-3">
              {poems.map((poem, index) => (
                <PoemCard
                  key={`${poem.link}-${index}`}
                  title={poem.title}
                  link={poem.link}
                  snippet={poem.snippet}
                  source={poem.source}
                  reason={poem.reason}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              검색 결과가 없습니다.
              <br />
              <span className="text-sm">다른 감정으로 검색해보세요.</span>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
