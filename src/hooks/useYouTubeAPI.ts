/**
 * YouTube API Hooks
 *
 * 명상 및 힐링 음악 영상 검색을 위한 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
}

interface YouTubeResponse {
  success: boolean;
  videos: Video[];
}

/**
 * 명상 영상 검색 Hook
 */
export const useMeditationVideos = (mood: string, duration?: string) => {
  const [data, setData] = useState<Video[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!mood) return;

    setIsLoading(true);
    setError(null);

    try {
      const fn = httpsCallable<{ mood: string; duration?: string }, YouTubeResponse>(
        functions,
        'fetchYouTubeMeditations'
      );
      const result = await fn({ mood, duration });
      setData(result.data.videos);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [mood, duration]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
};

/**
 * 힐링 음악 검색 Hook
 */
export const useMusicVideos = (mood: string) => {
  const [data, setData] = useState<Video[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!mood) return;

    setIsLoading(true);
    setError(null);

    try {
      const fn = httpsCallable<{ mood: string }, YouTubeResponse>(
        functions,
        'fetchYouTubeMusic'
      );
      const result = await fn({ mood });
      setData(result.data.videos);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [mood]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
};
