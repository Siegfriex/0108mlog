/**
 * YouTube API Callable Functions
 *
 * 명상 및 힐링 음악 검색을 위한 YouTube Data API 통합
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getYouTubeApiKey} from "../config/secrets";
import {getCachedOrFetch} from "../services/cacheService";

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

/**
 * 명상 영상 검색
 */
export const fetchYouTubeMeditations = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30,
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "인증이 필요합니다.");
    }

    const {mood, duration} = request.data;
    const apiKey = await getYouTubeApiKey();
    const cacheKey = `youtube:meditation:${mood}:${duration || "any"}`;

    return getCachedOrFetch(
      cacheKey,
      async () => {
        const query = `${mood} 명상 meditation ${duration ? duration + "분" : ""}`;
        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        searchUrl.searchParams.set("part", "snippet");
        searchUrl.searchParams.set("type", "video");
        searchUrl.searchParams.set("videoDuration", "medium");
        searchUrl.searchParams.set("q", query);
        searchUrl.searchParams.set("key", apiKey);
        searchUrl.searchParams.set("maxResults", "10");
        searchUrl.searchParams.set("relevanceLanguage", "ko");

        const response = await fetch(searchUrl.toString());

        if (!response.ok) {
          throw new HttpsError("internal", "YouTube API 실패");
        }

        const data = await response.json();
        const videos: YouTubeVideo[] = (data.items || []).map((item: YouTubeSearchItem) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        return {
          success: true,
          videos,
        };
      },
      24 * 60 * 60 * 1000 // 24시간 TTL
    );
  }
);

/**
 * 힐링 음악 검색
 */
export const fetchYouTubeMusic = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30,
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "인증이 필요합니다.");
    }

    const {mood} = request.data;
    const apiKey = await getYouTubeApiKey();
    const cacheKey = `youtube:music:${mood}`;

    return getCachedOrFetch(
      cacheKey,
      async () => {
        const query = `${mood} healing music relaxing 힐링 음악`;
        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        searchUrl.searchParams.set("part", "snippet");
        searchUrl.searchParams.set("type", "video");
        searchUrl.searchParams.set("q", query);
        searchUrl.searchParams.set("key", apiKey);
        searchUrl.searchParams.set("maxResults", "10");
        searchUrl.searchParams.set("relevanceLanguage", "ko");

        const response = await fetch(searchUrl.toString());

        if (!response.ok) {
          throw new HttpsError("internal", "YouTube API 실패");
        }

        const data = await response.json();
        const videos: YouTubeVideo[] = (data.items || []).map((item: YouTubeSearchItem) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        return {
          success: true,
          videos,
        };
      },
      24 * 60 * 60 * 1000 // 24시간 TTL
    );
  }
);
