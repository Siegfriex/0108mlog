/**
 * 위기 감지 알고리즘
 * 
 * FEAT-016: 안전망 시스템
 * PRD 플로우차트 3: 위기 상황 대응
 * 
 * 키워드/강도/패턴 기반 위기 신호 감지
 */

import { EmotionType } from '../../types';

/**
 * 위기 감지 결과
 */
export interface CrisisDetectionResult {
  isCrisis: boolean;
  reason: 'keyword' | 'intensity' | 'pattern' | 'none';
  confidence: 'high' | 'medium' | 'low';
  details?: string;
}

/**
 * 위기 키워드 목록 (자해/자살 관련)
 * 정기적으로 업데이트 필요 (분기 1회)
 */
const CRISIS_KEYWORDS = [
  // 자해 관련
  '자해', '자상', '칼', '약물 과다복용', '약물과다복용', '약물과다', '목매기', '손목', '약 먹고 싶다',
  '자해하고 싶다', '자해하고싶다', '자해하고 싶어', '자해하고싶어', '자해할까', '자해할까?',
  '상처', '피', '아프게', '고통', '참을 수 없어',
  
  // 자살 관련
  '죽고 싶다', '죽고싶다', '죽고 싶어', '죽고싶어', '죽고 싶어요', '죽고싶어요',
  '끝내고 싶다', '끝내고싶다', '끝내고 싶어', '끝내고싶어',
  '더 이상 못 살겠다', '더이상 못 살겠다', '못 살겠다', '못살겠다',
  '생명을 끊고 싶다', '생명을 끊고싶다', '생명 끊고 싶다',
  '자살하고 싶다', '자살하고싶다', '자살하고 싶어', '자살하고싶어',
  '자살할까', '자살할까?', '자살 생각', '자살생각',
  '죽음', '죽을래', '죽을래요', '죽고 싶어요',
  '끝', '끝내고 싶어요', '끝내고싶어요',
  
  // 위기 상황 표현
  '도와줘', '도와주세요', '구해줘', '구해주세요',
  '힘들어', '힘들어요', '버틸 수 없어', '버틸수없어',
  '포기하고 싶어', '포기하고싶어', '포기할래',
];

/**
 * 부정적 감정 타입
 */
const NEGATIVE_EMOTIONS: EmotionType[] = [
  EmotionType.ANXIETY,
  EmotionType.SADNESS,
  EmotionType.ANGER,
];

/**
 * 키워드 기반 위기 감지
 * 
 * @param text 분석할 텍스트
 * @returns {CrisisDetectionResult} 감지 결과
 */
export function detectCrisisByKeyword(text: string): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return { isCrisis: false, reason: 'none', confidence: 'low' };
  }

  const lowerText = text.toLowerCase();
  const normalizedText = lowerText.replace(/\s+/g, ''); // 공백 제거

  // 키워드 매칭 확인
  const matchedKeywords = CRISIS_KEYWORDS.filter(keyword => {
    const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, '');
    return normalizedText.includes(normalizedKeyword) || lowerText.includes(keyword.toLowerCase());
  });

  if (matchedKeywords.length > 0) {
    return {
      isCrisis: true,
      reason: 'keyword',
      confidence: matchedKeywords.length >= 2 ? 'high' : 'medium',
      details: `감지된 키워드: ${matchedKeywords.join(', ')}`,
    };
  }

  return { isCrisis: false, reason: 'none', confidence: 'low' };
}

/**
 * 강도 기반 위기 감지
 * 
 * @param emotion 감정 타입
 * @param intensity 강도 (1-10)
 * @returns {CrisisDetectionResult} 감지 결과
 */
export function detectCrisisByIntensity(
  emotion: EmotionType,
  intensity: number
): CrisisDetectionResult {
  // 부정적 감정 + 강도 9-10
  if (NEGATIVE_EMOTIONS.includes(emotion) && intensity >= 9) {
    return {
      isCrisis: true,
      reason: 'intensity',
      confidence: intensity === 10 ? 'high' : 'medium',
      details: `${emotion} 감정, 강도 ${intensity}`,
    };
  }

  return { isCrisis: false, reason: 'none', confidence: 'low' };
}

/**
 * 패턴 기반 위기 감지
 * 
 * @param recentEntries 최근 감정 기록 (최신순)
 * @returns {CrisisDetectionResult} 감지 결과
 */
export function detectCrisisByPattern(
  recentEntries: Array<{
    emotion: EmotionType;
    intensity: number;
    timestamp: Date;
  }>
): CrisisDetectionResult {
  if (recentEntries.length === 0) {
    return { isCrisis: false, reason: 'none', confidence: 'low' };
  }

  // 연속 3일 이상 부정적 감정 강도 8 이상
  const negativeHighIntensityDays = recentEntries.filter(entry => {
    const isNegative = NEGATIVE_EMOTIONS.includes(entry.emotion);
    const isHighIntensity = entry.intensity >= 8;
    return isNegative && isHighIntensity;
  });

  // 날짜별로 그룹화 (같은 날 여러 기록은 1일로 카운트)
  const uniqueDays = new Set<string>();
  negativeHighIntensityDays.forEach(entry => {
    const dateKey = entry.timestamp.toISOString().split('T')[0];
    uniqueDays.add(dateKey);
  });

  if (uniqueDays.size >= 3) {
    return {
      isCrisis: true,
      reason: 'pattern',
      confidence: uniqueDays.size >= 5 ? 'high' : 'medium',
      details: `연속 ${uniqueDays.size}일간 부정적 감정 강도 8 이상`,
    };
  }

  // 급격한 감정 변화 (강도 3 이하 → 9 이상, 1일 내)
  if (recentEntries.length >= 2) {
    const latest = recentEntries[0];
    const previous = recentEntries[1];
    
    const timeDiff = latest.timestamp.getTime() - previous.timestamp.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      const intensityChange = latest.intensity - previous.intensity;
      if (previous.intensity <= 3 && latest.intensity >= 9 && intensityChange >= 6) {
        return {
          isCrisis: true,
          reason: 'pattern',
          confidence: 'medium',
          details: `급격한 감정 변화: 강도 ${previous.intensity} → ${latest.intensity}`,
        };
      }
    }
  }

  // 장기간 부정적 감정 지속 (7일 이상 강도 7 이상)
  const negativeModerateIntensityDays = recentEntries.filter(entry => {
    const isNegative = NEGATIVE_EMOTIONS.includes(entry.emotion);
    const isModerateIntensity = entry.intensity >= 7;
    return isNegative && isModerateIntensity;
  });

  const uniqueModerateDays = new Set<string>();
  negativeModerateIntensityDays.forEach(entry => {
    const dateKey = entry.timestamp.toISOString().split('T')[0];
    uniqueModerateDays.add(dateKey);
  });

  if (uniqueModerateDays.size >= 7) {
    return {
      isCrisis: true,
      reason: 'pattern',
      confidence: 'medium',
      details: `${uniqueModerateDays.size}일간 부정적 감정 강도 7 이상 지속`,
    };
  }

  return { isCrisis: false, reason: 'none', confidence: 'low' };
}

/**
 * 종합 위기 감지
 * 
 * @param params 감지 파라미터
 * @returns {CrisisDetectionResult} 감지 결과
 */
export function detectCrisis(params: {
  text?: string;
  emotion?: EmotionType;
  intensity?: number;
  recentEntries?: Array<{
    emotion: EmotionType;
    intensity: number;
    timestamp: Date;
  }>;
}): CrisisDetectionResult {
  const { text, emotion, intensity, recentEntries = [] } = params;

  // 1. 키워드 감지 (최우선)
  if (text) {
    const keywordResult = detectCrisisByKeyword(text);
    if (keywordResult.isCrisis) {
      return keywordResult;
    }
  }

  // 2. 강도 감지
  if (emotion && intensity !== undefined) {
    const intensityResult = detectCrisisByIntensity(emotion, intensity);
    if (intensityResult.isCrisis) {
      return intensityResult;
    }
  }

  // 3. 패턴 감지
  if (recentEntries.length > 0) {
    const patternResult = detectCrisisByPattern(recentEntries);
    if (patternResult.isCrisis) {
      return patternResult;
    }
  }

  return { isCrisis: false, reason: 'none', confidence: 'low' };
}
