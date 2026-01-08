/**
 * Gemini API 서비스 래퍼
 * 
 * 기존 인터페이스를 유지하면서 Firebase Functions를 통해 Gemini API를 호출합니다.
 * 이 파일은 하위 호환성을 위해 유지되며, 내부적으로는 Firebase Functions를 호출합니다.
 */

import { callFunction } from '../src/services/functions';
import { CoachPersona, ContentData, MicroAction, EmotionType, TimelineEntry } from '../types';

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
  try {
    const response = await callFunction<{
      userMessage: string;
      history: string[];
      persona: CoachPersona;
    }, DayModeResponse>('generateDayModeResponse', {
      userMessage,
      history,
      persona,
    });

    if (response.success && response.data) {
      return response.data;
    }

    return response.fallback || '응답을 생성할 수 없습니다.';
  } catch (error) {
    console.error('generateDayModeResponse error:', error);
    return '잠시 연결이 불안정합니다.';
  }
};

/**
 * Night Mode 편지 생성
 */
export const generateNightModeLetter = async (
  diaryEntry: string,
  persona: CoachPersona
): Promise<string> => {
  try {
    const response = await callFunction<{
      diaryEntry: string;
      persona: CoachPersona;
    }, NightModeResponse>('generateNightModeLetter', {
      diaryEntry,
      persona,
    });

    if (response.success && response.data) {
      return response.data;
    }

    return response.fallback || '편지를 작성하는 중 오류가 발생했습니다.';
  } catch (error) {
    console.error('generateNightModeLetter error:', error);
    return '지금은 편지를 쓸 수 없는 상태예요.';
  }
};

/**
 * 월간 회고록 생성
 */
export const generateMonthlyNarrative = async (summary?: string): Promise<string> => {
  try {
    const response = await callFunction<{ summary?: string }, DayModeResponse>(
      'generateMonthlyNarrative',
      { summary }
    );

    if (response.success && response.data) {
      return response.data;
    }

    return response.fallback || '리포트를 생성할 수 없습니다.';
  } catch (error) {
    console.error('generateMonthlyNarrative error:', error);
    return '리포트를 불러오는 중 오류가 발생했습니다.';
  }
};

/**
 * 큐레이션 콘텐츠 생성
 */
export const generateHealingContent = async (
  emotionState: string,
  persona: CoachPersona
): Promise<ContentData | null> => {
  try {
    const response = await callFunction<{
      emotionState: string;
      persona: CoachPersona;
    }, HealingContentResponse>('generateHealingContent', {
      emotionState,
      persona,
    });

    if (response.success && response.data) {
      return response.data as ContentData;
    }

    return null;
  } catch (error) {
    console.error('generateHealingContent error:', error);
    return null;
  }
};

/**
 * AI 챗봇 응답 생성
 */
export const generateChatbotResponse = async (
  userMessage: string,
  history: { role: string; content: string }[],
  persona: CoachPersona
): Promise<string> => {
  try {
    const response = await callFunction<{
      userMessage: string;
      history: { role: string; content: string }[];
      persona: CoachPersona;
    }, DayModeResponse>('generateChatbotResponse', {
      userMessage,
      history,
      persona,
    });

    if (response.success && response.data) {
      return response.data;
    }

    return response.fallback || '응답을 생성할 수 없습니다.';
  } catch (error) {
    console.error('generateChatbotResponse error:', error);
    return '연결에 문제가 발생했습니다.';
  }
};

/**
 * 마이크로 액션 생성
 */
export const generateMicroAction = async (
  emotion: EmotionType,
  intensity: number,
  userContext: string
): Promise<MicroAction | null> => {
  try {
    const response = await callFunction<{
      emotion: EmotionType;
      intensity: number;
      userContext: string;
    }, MicroActionResponse>('generateMicroAction', {
      emotion,
      intensity,
      userContext,
    });

    if (response.success && response.data) {
      return response.data;
    }

    if (response.fallback) {
      return response.fallback;
    }

    return null;
  } catch (error) {
    console.error('generateMicroAction error:', error);
    // Fallback action
    return {
      id: 'fallback',
      title: '심호흡 하기',
      description: '편안한 자세로 눈을 감고 3번 깊게 숨을 들이마시고 내쉬세요.',
      duration: '1 min',
      type: 'breathing',
    };
  }
};

/**
 * 타임라인 분석
 */
export const generateTimelineAnalysis = async (entries: TimelineEntry[]): Promise<string> => {
  try {
    const response = await callFunction<{ entries: TimelineEntry[] }, DayModeResponse>(
      'generateTimelineAnalysis',
      { entries }
    );

    if (response.success && response.data) {
      return response.data;
    }

    return response.fallback || 'Analysis unavailable.';
  } catch (error) {
    console.error('generateTimelineAnalysis error:', error);
    return '분석 중 오류가 발생했습니다.';
  }
};
