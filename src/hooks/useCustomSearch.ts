/**
 * Custom Search API Hook
 *
 * 시/문학 검색을 위한 Hook
 */

import {useState, useEffect} from "react";
import {callFunction} from "../services/functions";

export interface PoemResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  reason?: string;
}

interface SearchPoemsResponse {
  success: boolean;
  data?: {
    poems: PoemResult[];
    query: string;
    totalResults: string;
  };
  error?: string;
}

/**
 * 시/문학 검색 Hook
 *
 * @param mood 감정/상황 (예: "위로", "격려", "희망")
 * @param emotion 감정 타입 (선택, 기본값: "위로")
 * @returns 검색 결과, 로딩 상태, 에러
 */
export const usePoemSearch = (mood: string, emotion?: string) => {
  const [data, setData] = useState<PoemResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const searchPoems = async () => {
      if (!mood) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await callFunction<{
          mood: string;
          emotion?: string;
        }, SearchPoemsResponse>("searchPoems", {
          mood,
          emotion: emotion || "위로",
        });

        if (response.success && response.data) {
          setData(response.data.poems);
        } else {
          throw new Error(response.error || "검색 실패");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("검색 중 오류 발생"));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    searchPoems();
  }, [mood, emotion]);

  return {data, isLoading, error};
};
