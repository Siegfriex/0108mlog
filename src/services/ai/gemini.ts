/**
 * Gemini API 서비스 래퍼
 * 
 * 기존 인터페이스를 유지하면서 Firebase Functions를 통해 Gemini API를 호출합니다.
 * 이 파일은 하위 호환성을 위해 유지되며, 내부적으로는 Firebase Functions를 호출합니다.
 */

import { callFunction } from '../functions';
import { callWithPolicy } from '../apiPolicy';
import { CoachPersona, ContentData, MicroAction, EmotionType, TimelineEntry } from '../../../types';

// 타입 정의
interface DayModeResponse {
  success: boolean;
  data?: string;
  error?: string;
  fallback?: string;
}

interface NightModeResponse {
  success: boolean;
  data?: string;
  error?: string;
  fallback?: string;
}

interface HealingContentResponse {
  success: boolean;
  data?: ContentData;
  error?: string;
  fallback?: null;
}

interface MicroActionResponse {
  success: boolean;
  data?: MicroAction;
  error?: string;
  fallback?: MicroAction;
}

/**
 * Day Mode 채팅 응답 생성
 */
export const generateDayModeResponse = async (
  userMessage: string,
  history: string[],
  persona: CoachPersona
): Promise<string> => {
  const response = await callWithPolicy<DayModeResponse>(
    () => callFunction<{
      userMessage: string;
      history: string[];
      persona: CoachPersona;
    }, DayModeResponse>('generateDayModeResponse', {
      userMessage,
      history,
      persona,
    }),
    {
      timeout: 3000,
      maxRetries: 2,
      fallback: () => ({
        success: false,
        fallback: '당신의 마음을 천천히 느껴보고 있어요. 조금만 기다려주세요.',
      }),
    }
  );

  if (response.success && response.data) {
    return response.data.data || response.data.fallback || '지금 이 순간, 함께 있어요.';
  }

  return response.fallback?.fallback || response.error || '마음이 닿을 때까지 곁에 있을게요.';
};

/**
 * Night Mode 편지 생성
 */
export const generateNightModeLetter = async (
  diaryEntry: string,
  persona: CoachPersona
): Promise<string> => {
  const response = await callWithPolicy<NightModeResponse>(
    () => callFunction<{
      diaryEntry: string;
      persona: CoachPersona;
    }, NightModeResponse>('generateNightModeLetter', {
      diaryEntry,
      persona,
    }),
    {
      timeout: 3000,
      maxRetries: 2,
      fallback: () => ({
        success: false,
        fallback: '오늘 하루의 이야기를 담아 편지를 쓰고 있어요...',
      }),
    }
  );

  if (response.success && response.data) {
    return response.data.data || response.data.fallback || '당신의 하루를 위한 편지가 도착했어요.';
  }

  return response.fallback?.fallback || response.error || '별빛 아래, 당신만을 위한 편지를 준비하고 있어요.';
};

/**
 * 월간 회고록 생성
 */
export const generateMonthlyNarrative = async (summary?: string): Promise<string> => {
  const response = await callWithPolicy<DayModeResponse>(
    () => callFunction<{ summary?: string }, DayModeResponse>(
      'generateMonthlyNarrative',
      { summary }
    ),
    {
      timeout: 10000,
      maxRetries: 2,
      fallback: () => ({
        success: false,
        fallback: '리포트를 생성하는 중 시간이 걸리고 있어요. 잠시 후 다시 시도해주세요.',
      }),
    }
  );

  if (response.success && response.data) {
    return response.data.data || response.data.fallback || '리포트를 생성할 수 없습니다.';
  }

  return response.fallback?.fallback || response.error || '리포트를 불러오는 중 오류가 발생했습니다.';
};

/**
 * 큐레이션 콘텐츠 생성
 */
export const generateHealingContent = async (
  emotionState: string,
  persona: CoachPersona
): Promise<ContentData | null> => {
  const response = await callWithPolicy<HealingContentResponse>(
    () => callFunction<{
      emotionState: string;
      persona: CoachPersona;
    }, HealingContentResponse>('generateHealingContent', {
      emotionState,
      persona,
    }),
    {
      timeout: 3000,
      maxRetries: 2,
      fallback: () => ({
        success: false,
        fallback: null,
      }),
    }
  );

  if (response.success && response.data) {
    return response.data.data || null;
  }

  return null;
};

/**
 * AI 챗봇 응답 생성
 */
export const generateChatbotResponse = async (
  userMessage: string,
  history: { role: string; content: string }[],
  persona: CoachPersona
): Promise<string> => {
  const response = await callWithPolicy<DayModeResponse>(
    () => callFunction<{
      userMessage: string;
      history: { role: string; content: string }[];
      persona: CoachPersona;
    }, DayModeResponse>('generateChatbotResponse', {
      userMessage,
      history,
      persona,
    }),
    {
      timeout: 3000,
      maxRetries: 2,
      fallback: () => ({
        success: false,
        fallback: '당신의 이야기에 귀 기울이고 있어요.',
      }),
    }
  );

  if (response.success && response.data) {
    return response.data.data || response.data.fallback || '함께 생각해볼게요.';
  }

  return response.fallback?.fallback || response.error || '잠시 쉬어가도 괜찮아요.';
};

/**
 * 마이크로 액션 생성
 */
export const generateMicroAction = async (
  emotion: EmotionType,
  intensity: number,
  userContext: string
): Promise<MicroAction | null> => {
  const fallbackAction: MicroAction = {
    id: 'fallback',
    title: '심호흡 하기',
    description: '편안한 자세로 눈을 감고 3번 깊게 숨을 들이마시고 내쉬세요.',
    duration: '1 min',
    type: 'breathing',
  };

  const response = await callWithPolicy<MicroActionResponse>(
    () => callFunction<{
      emotion: EmotionType;
      intensity: number;
      userContext: string;
    }, MicroActionResponse>('generateMicroAction', {
      emotion,
      intensity,
      userContext,
    }),
    {
      timeout: 3000,
      maxRetries: 2,
      fallback: () => ({
        success: false,
        fallback: fallbackAction,
      }),
    }
  );

  if (response.success && response.data) {
    return response.data.data || response.data.fallback || fallbackAction;
  }

  return response.fallback?.fallback || fallbackAction;
};

/**
 * 타임라인 분석
 */
export const generateTimelineAnalysis = async (entries: TimelineEntry[]): Promise<string> => {
  const response = await callWithPolicy<DayModeResponse>(
    () => callFunction<{ entries: TimelineEntry[] }, DayModeResponse>(
      'generateTimelineAnalysis',
      { entries }
    ),
    {
      timeout: 10000,
      maxRetries: 2,
      fallback: () => ({
        success: false,
        fallback: '분석 중 시간이 걸리고 있어요. 잠시 후 다시 시도해주세요.',
      }),
    }
  );

  if (response.success && response.data) {
    return response.data.data || response.data.fallback || 'Analysis unavailable.';
  }

  return response.fallback?.fallback || response.error || '분석 중 오류가 발생했습니다.';
};
