/**
 * 감정 차트 데이터 Hook
 *
 * Firestore emotions 데이터를 차트용으로 변환
 */

import { useMemo } from 'react';
import { useRealtimeEmotions } from './useRealtime';

/**
 * 요일 이름 (한글)
 */
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 트렌드 데이터 타입 (ContentGallery 차트용)
 */
export interface TrendDataPoint {
  day: string;
  score: number;
}

/**
 * 회복력 데이터 타입 (JournalView 차트용)
 */
export interface ResilienceDataPoint {
  day: number;
  score: number;
}

/**
 * 감정 트렌드 데이터 Hook (ContentGallery용)
 *
 * 최근 7일간 요일별 평균 intensity를 계산
 *
 * @param userId 사용자 ID
 * @returns 트렌드 데이터 및 로딩 상태
 */
export const useEmotionTrendData = (
  userId?: string
): {
  trendData: TrendDataPoint[];
  loading: boolean;
  error: Error | null;
} => {
  const { data: emotions, loading, error } = useRealtimeEmotions(userId);

  const trendData = useMemo(() => {
    // 기본 데이터 (모든 요일 0점으로 초기화)
    const dayScores: { [key: string]: { total: number; count: number } } = {};
    DAY_NAMES.forEach((day) => {
      dayScores[day] = { total: 0, count: 0 };
    });

    // 데이터가 없으면 빈 차트용 기본값 반환
    if (!emotions || emotions.length === 0) {
      return DAY_NAMES.map((day) => ({
        day,
        score: 0,
      }));
    }

    // 최근 7일 데이터만 필터링
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    emotions.forEach((emotion) => {
      const timestamp = emotion.timestamp;
      if (timestamp >= sevenDaysAgo) {
        const dayOfWeek = timestamp.getDay();
        const dayName = DAY_NAMES[dayOfWeek];
        dayScores[dayName].total += emotion.intensity;
        dayScores[dayName].count += 1;
      }
    });

    // 평균 계산 (데이터 없으면 0)
    return DAY_NAMES.map((day) => ({
      day,
      score:
        dayScores[day].count > 0
          ? Math.round(dayScores[day].total / dayScores[day].count)
          : 0,
    }));
  }, [emotions]);

  return { trendData, loading, error };
};

/**
 * 회복력 스코어 데이터 Hook (JournalView용)
 *
 * 최근 7일간 일별 평균 intensity를 "회복력 스코어"로 변환
 * - intensity가 높을수록(긍정적 감정) 회복력이 높다고 가정
 * - 스코어는 0-100 스케일로 정규화
 *
 * @param userId 사용자 ID
 * @returns 회복력 데이터 및 로딩 상태
 */
export const useResilienceData = (
  userId?: string
): {
  resilienceData: ResilienceDataPoint[];
  currentScore: number;
  weeklyChange: number;
  loading: boolean;
  error: Error | null;
} => {
  const { data: emotions, loading, error } = useRealtimeEmotions(userId);

  const { resilienceData, currentScore, weeklyChange } = useMemo(() => {
    const now = new Date();

    // 최근 7일 데이터 초기화
    const dayData: { [key: number]: { total: number; count: number } } = {};
    for (let i = 1; i <= 7; i++) {
      dayData[i] = { total: 0, count: 0 };
    }

    // 데이터가 없으면 기본값 반환
    if (!emotions || emotions.length === 0) {
      return {
        resilienceData: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          score: 50, // 기본 중간값
        })),
        currentScore: 50,
        weeklyChange: 0,
      };
    }

    // 최근 7일 데이터 집계
    emotions.forEach((emotion) => {
      const timestamp = emotion.timestamp;
      const daysAgo = Math.floor(
        (now.getTime() - timestamp.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysAgo >= 0 && daysAgo < 7) {
        const dayIndex = 7 - daysAgo; // 1=7일전, 7=오늘
        if (dayData[dayIndex]) {
          dayData[dayIndex].total += emotion.intensity;
          dayData[dayIndex].count += 1;
        }
      }
    });

    // 스코어 계산 (intensity 1-10을 0-100으로 스케일)
    const resilienceData: ResilienceDataPoint[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    for (let day = 1; day <= 7; day++) {
      const dayInfo = dayData[day];
      let score = 50; // 기본값

      if (dayInfo.count > 0) {
        const avgIntensity = dayInfo.total / dayInfo.count;
        // intensity 1-10을 0-100으로 변환
        score = Math.round((avgIntensity / 10) * 100);
        totalScore += score;
        scoreCount += 1;
      }

      resilienceData.push({ day, score });
    }

    // 현재 스코어 (오늘 기준)
    const currentDayScore = resilienceData[6]?.score || 50;

    // 주간 변화 계산 (첫날 대비 마지막날)
    const firstDayScore = resilienceData[0]?.score || 50;
    const lastDayScore = resilienceData[6]?.score || 50;
    const weeklyChange =
      firstDayScore > 0
        ? Math.round(((lastDayScore - firstDayScore) / firstDayScore) * 100)
        : 0;

    return {
      resilienceData,
      currentScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 50,
      weeklyChange,
    };
  }, [emotions]);

  return { resilienceData, currentScore, weeklyChange, loading, error };
};

/**
 * 레이더 차트 데이터 타입 (ReportView용)
 */
export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

/**
 * Area 차트 데이터 타입 (ReportView용)
 */
export interface AreaDataPoint {
  name: string;
  positive: number;
  stress: number;
}

/**
 * 레이더 차트 데이터 Hook (ReportView용)
 *
 * 감정 데이터를 기반으로 Life Balance 레이더 차트 데이터 생성
 *
 * @param userId 사용자 ID
 * @returns 레이더 차트 데이터
 */
export const useRadarChartData = (
  userId?: string
): {
  radarData: RadarDataPoint[];
  loading: boolean;
  error: Error | null;
} => {
  const { data: emotions, loading, error } = useRealtimeEmotions(userId);

  const radarData = useMemo(() => {
    // 기본 밸런스 영역과 초기값
    const balanceScores: { [key: string]: { score: number; count: number } } = {
      자기돌봄: { score: 0, count: 0 },
      사회관계: { score: 0, count: 0 },
      업무: { score: 0, count: 0 },
      수면: { score: 0, count: 0 },
      마음챙김: { score: 0, count: 0 },
      신체활동: { score: 0, count: 0 },
    };

    // 키워드 매핑
    const keywordMap: { [key: string]: string[] } = {
      자기돌봄: ['휴식', '쉬', '여유', '힐링', '케어', '돌봄', '목욕', '스파'],
      사회관계: ['친구', '가족', '만남', '대화', '사람', '동료', '모임', '연락'],
      업무: ['일', '업무', '회의', '프로젝트', '공부', '과제', '시험', '발표'],
      수면: ['잠', '수면', '꿈', '밤', '새벽', '피곤', '졸림', 'night'],
      마음챙김: ['명상', '호흡', '집중', '평온', '차분', '마음', '감사', '걷기'],
      신체활동: ['운동', '헬스', '산책', '조깅', '요가', '스트레칭', '체육', '등산'],
    };

    // 데이터가 없으면 기본값 반환
    if (!emotions || emotions.length === 0) {
      return Object.keys(balanceScores).map((subject) => ({
        subject,
        A: 60 + Math.random() * 20, // 60-80 범위 랜덤
        fullMark: 150,
      }));
    }

    // 최근 30일 데이터 필터링
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 감정 데이터 분석
    emotions.forEach((emotion) => {
      if (emotion.timestamp < thirtyDaysAgo) return;

      const summary = (emotion.summary || '').toLowerCase();
      const tags = (emotion.tags || []).map((t: string) => t.toLowerCase());
      const combinedText = [summary, ...tags].join(' ');

      // 각 영역별 키워드 매칭
      Object.entries(keywordMap).forEach(([area, keywords]) => {
        const hasMatch = keywords.some((kw) => combinedText.includes(kw));
        if (hasMatch) {
          const intensityScore = emotion.intensity * 10; // 1-10 → 10-100
          balanceScores[area].score += intensityScore;
          balanceScores[area].count += 1;
        }
      });

      // 감정 타입에 따른 추가 스코어
      if (emotion.emotionType === 'peace') {
        balanceScores['마음챙김'].score += 50;
        balanceScores['마음챙김'].count += 1;
      }
      if (emotion.emotionType === 'joy') {
        balanceScores['자기돌봄'].score += 50;
        balanceScores['자기돌봄'].count += 1;
      }
      if (emotion.mode === 'night') {
        balanceScores['수면'].score += 50;
        balanceScores['수면'].count += 1;
      }
    });

    // 최종 스코어 계산 (평균)
    return Object.keys(balanceScores).map((subject) => {
      const { score, count } = balanceScores[subject];
      // 데이터가 있으면 평균, 없으면 기본값 60-80 랜덤
      const finalScore = count > 0
        ? Math.min(140, Math.max(40, score / count))
        : 60 + Math.random() * 20;

      return {
        subject,
        A: Math.round(finalScore),
        fullMark: 150,
      };
    });
  }, [emotions]);

  return { radarData, loading, error };
};

/**
 * Area 차트 데이터 Hook (ReportView용)
 *
 * 주간 감정 트렌드 데이터 생성
 * positive: 긍정 감정 (JOY, PEACE) 빈도
 * stress: 부정 감정 (ANXIETY, SADNESS, ANGER) 빈도
 *
 * @param userId 사용자 ID
 * @returns Area 차트 데이터
 */
export const useAreaChartData = (
  userId?: string
): {
  areaData: AreaDataPoint[];
  loading: boolean;
  error: Error | null;
} => {
  const { data: emotions, loading, error } = useRealtimeEmotions(userId);

  const areaData = useMemo(() => {
    const now = new Date();

    // 최근 4주 데이터 초기화
    const weeklyData: { [week: string]: { positive: number; stress: number } } = {
      '1주차': { positive: 0, stress: 0 },
      '2주차': { positive: 0, stress: 0 },
      '3주차': { positive: 0, stress: 0 },
      '4주차': { positive: 0, stress: 0 },
    };

    // 데이터가 없으면 기본값 반환
    if (!emotions || emotions.length === 0) {
      return Object.entries(weeklyData).map(([name, data]) => ({
        name,
        positive: 30 + Math.random() * 20,
        stress: 15 + Math.random() * 15,
      }));
    }

    // 긍정/부정 감정 분류
    const positiveTypes = ['joy', 'peace'];
    const stressTypes = ['anxiety', 'sadness', 'anger'];

    // 감정 데이터 분석
    emotions.forEach((emotion) => {
      const daysAgo = Math.floor(
        (now.getTime() - emotion.timestamp.getTime()) / (24 * 60 * 60 * 1000)
      );

      // 주차 결정 (0-6일: 4주차, 7-13일: 3주차, 14-20일: 2주차, 21-27일: 1주차)
      let weekKey: string;
      if (daysAgo < 7) {
        weekKey = '4주차';
      } else if (daysAgo < 14) {
        weekKey = '3주차';
      } else if (daysAgo < 21) {
        weekKey = '2주차';
      } else if (daysAgo < 28) {
        weekKey = '1주차';
      } else {
        return; // 28일 이전 데이터는 무시
      }

      const emotionType = emotion.emotionType?.toLowerCase();
      const intensityScore = emotion.intensity * 5; // 1-10 → 5-50

      if (positiveTypes.includes(emotionType)) {
        weeklyData[weekKey].positive += intensityScore;
      } else if (stressTypes.includes(emotionType)) {
        weeklyData[weekKey].stress += intensityScore;
      }
    });

    // 결과 변환
    return Object.entries(weeklyData).map(([name, data]) => ({
      name,
      positive: Math.round(Math.max(10, data.positive)),
      stress: Math.round(Math.max(5, data.stress)),
    }));
  }, [emotions]);

  return { areaData, loading, error };
};

/**
 * 개인화 인사이트 데이터 타입
 */
export interface PersonalizedInsight {
  id: string;
  emotion: string;
  title: string;
  description: string;
  activities: string[];
  percentage: number;
}

/**
 * 개인화 인사이트 Hook (ReportView용)
 *
 * 사용자의 최근 감정 패턴을 분석하여 맞춤 인사이트 제공
 *
 * @param userId 사용자 ID
 * @returns 개인화된 인사이트 데이터
 */
export const usePersonalizedInsights = (
  userId?: string
): {
  insights: PersonalizedInsight[];
  dominantEmotion: string;
  loading: boolean;
  error: Error | null;
} => {
  const { data: emotions, loading, error } = useRealtimeEmotions(userId);

  const { insights, dominantEmotion } = useMemo(() => {
    // 감정별 활동 추천 매핑
    const emotionActivities: { [key: string]: { name: string; activities: string[] } } = {
      joy: {
        name: '기쁨',
        activities: [
          '친구와 대화하기 (82%)',
          '좋아하는 음악 듣기 (76%)',
          '운동하기 (69%)',
          '취미 활동 (64%)',
          '감사 일지 쓰기 (58%)',
        ],
      },
      peace: {
        name: '평온',
        activities: [
          '명상하기 (74%)',
          '가벼운 산책 (68%)',
          '독서하기 (61%)',
          '따뜻한 차 마시기 (55%)',
          '자연 감상 (49%)',
        ],
      },
      anxiety: {
        name: '불안',
        activities: [
          '박스 호흡법 (72%)',
          '명상 (65%)',
          '가벼운 스트레칭 (58%)',
          '일기 쓰기 (51%)',
          '긍정적 자기대화 (44%)',
        ],
      },
      sadness: {
        name: '슬픔',
        activities: [
          '일기 쓰기 (68%)',
          '부드러운 음악 듣기 (54%)',
          '가벼운 산책 (47%)',
          '따뜻한 차 마시기 (42%)',
          '명상 (38%)',
        ],
      },
      anger: {
        name: '분노',
        activities: [
          '운동하기 (71%)',
          '심호흡 (63%)',
          '산책하기 (56%)',
          '일기 쓰기 (48%)',
          '음악 듣기 (41%)',
        ],
      },
    };

    // 기본 인사이트
    const defaultInsights: PersonalizedInsight[] = [
      {
        id: 'insight-1',
        emotion: '슬픔',
        title: '나와 같은 기분을 가진 사람들은',
        description: '이번 주 우울한 기분을 경험한 사람들의 73%가 이런 활동들을 했어요',
        activities: emotionActivities.sadness.activities,
        percentage: 73,
      },
      {
        id: 'insight-2',
        emotion: '불안',
        title: '나와 같은 기분을 가진 사람들은',
        description: '불안한 감정을 느낀 사람들의 81%가 이런 방법으로 마음을 진정시켰어요',
        activities: emotionActivities.anxiety.activities,
        percentage: 81,
      },
    ];

    if (!emotions || emotions.length === 0) {
      return { insights: defaultInsights, dominantEmotion: 'sadness' };
    }

    // 최근 7일 데이터에서 주요 감정 분석
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const emotionCounts: { [key: string]: number } = {};
    emotions.forEach((emotion) => {
      if (emotion.timestamp >= sevenDaysAgo) {
        const type = emotion.emotionType?.toLowerCase() || 'peace';
        emotionCounts[type] = (emotionCounts[type] || 0) + 1;
      }
    });

    // 가장 많이 나타난 감정 찾기
    let dominant = 'peace';
    let maxCount = 0;
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        dominant = emotion;
        maxCount = count;
      }
    });

    // 두 번째로 많은 감정 찾기
    let secondary = dominant === 'peace' ? 'anxiety' : 'peace';
    let secondMaxCount = 0;
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (emotion !== dominant && count > secondMaxCount) {
        secondary = emotion;
        secondMaxCount = count;
      }
    });

    // 인사이트 생성
    const dominantInfo = emotionActivities[dominant] || emotionActivities.peace;
    const secondaryInfo = emotionActivities[secondary] || emotionActivities.anxiety;

    const personalizedInsights: PersonalizedInsight[] = [
      {
        id: 'insight-user-1',
        emotion: dominantInfo.name,
        title: '나와 같은 기분을 가진 사람들은',
        description: `이번 주 ${dominantInfo.name} 감정을 경험한 사람들이 자주 하는 활동이에요`,
        activities: dominantInfo.activities,
        percentage: Math.round(65 + Math.random() * 20), // 65-85%
      },
      {
        id: 'insight-user-2',
        emotion: secondaryInfo.name,
        title: '나와 같은 기분을 가진 사람들은',
        description: `${secondaryInfo.name} 감정을 느낄 때 효과적인 활동들이에요`,
        activities: secondaryInfo.activities,
        percentage: Math.round(70 + Math.random() * 15), // 70-85%
      },
    ];

    return { insights: personalizedInsights, dominantEmotion: dominant };
  }, [emotions]);

  return { insights, dominantEmotion, loading, error };
};
