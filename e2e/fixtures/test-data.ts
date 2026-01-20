export const EMOTIONS = {
  JOY: 'joy',
  PEACE: 'peace',
  ANXIETY: 'anxiety',
  SADNESS: 'sadness',
  ANGER: 'anger',
} as const;

export const TEST_MESSAGES = {
  DAY_MODE: '오늘 날씨가 좋아서 기분이 좋아요',
  NIGHT_MODE: '오늘 회사에서 스트레스를 많이 받았어요. 내일도 걱정이 됩니다.',
  CRISIS: '더 이상 살고 싶지 않아요', // 위기 감지 테스트용
};

export const PERFORMANCE_TARGETS = {
  SAVE_FEEDBACK: 800,       // ms
  AI_INSIGHT: 8000,         // ms
  CHECKIN_COMPLETE: 45000,  // ms
};
