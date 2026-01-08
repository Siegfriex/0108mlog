/**
 * 인사이트 목업 데이터
 * 
 * 감정별 맞춤 액티비티 및 커뮤니티 인사이트
 */

export interface InsightActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  image?: string;
  tags: string[];
  effectiveness: number; // 1-10
}

export interface CommunityInsight {
  id: string;
  emotion: string;
  title: string;
  description: string;
  activities: string[];
  percentage: number; // 같은 기분을 가진 사람들의 비율
}

// 우울한 기분에 맞는 액티비티
export const SADNESS_ACTIVITIES: InsightActivity[] = [
  {
    id: 'sad-1',
    title: '부드러운 명상 음악 듣기',
    description: '감정을 억누르지 않고 그대로 느끼며, 부드러운 음악과 함께 호흡에 집중하세요.',
    category: 'Mindfulness',
    duration: '10분',
    tags: ['명상', '음악', '호흡'],
    effectiveness: 8
  },
  {
    id: 'sad-2',
    title: '따뜻한 차 한 잔과 함께 일기 쓰기',
    description: '오늘의 감정을 있는 그대로 기록하고, 왜 이런 기분이 들었는지 탐색해보세요.',
    category: 'Journaling',
    duration: '15분',
    tags: ['일기', '자기탐구', '감정기록'],
    effectiveness: 9
  },
  {
    id: 'sad-3',
    title: '가벼운 산책',
    description: '밖으로 나가 신선한 공기를 마시고, 자연의 소리에 귀 기울여보세요.',
    category: 'Movement',
    duration: '20분',
    tags: ['산책', '자연', '운동'],
    effectiveness: 7
  },
  {
    id: 'sad-4',
    title: '위로가 되는 영화나 책',
    description: '슬픔을 다루는 작품을 통해 자신의 감정을 이해하고 위로받아보세요.',
    category: 'Content',
    duration: '30분+',
    tags: ['영화', '독서', '위로'],
    effectiveness: 8
  },
  {
    id: 'sad-5',
    title: '따뜻한 목욕',
    description: '따뜻한 물에 몸을 담그며 긴장을 풀고, 몸과 마음의 피로를 씻어내세요.',
    category: 'Self-Care',
    duration: '20분',
    tags: ['목욕', '휴식', '셀프케어'],
    effectiveness: 7
  }
];

// 커뮤니티 인사이트
export const COMMUNITY_INSIGHTS: CommunityInsight[] = [
  {
    id: 'comm-1',
    emotion: '슬픔',
    title: '나와 같은 기분을 가진 사람들은',
    description: '이번 주 우울한 기분을 경험한 사람들의 73%가 이런 활동들을 했어요',
    activities: [
      '일기 쓰기 (68%)',
      '부드러운 음악 듣기 (54%)',
      '가벼운 산책 (47%)',
      '따뜻한 차 마시기 (42%)',
      '명상 (38%)'
    ],
    percentage: 73
  },
  {
    id: 'comm-2',
    emotion: '불안',
    title: '나와 같은 기분을 가진 사람들은',
    description: '불안한 감정을 느낀 사람들의 81%가 이런 방법으로 마음을 진정시켰어요',
    activities: [
      '박스 호흡법 (72%)',
      '명상 (65%)',
      '가벼운 스트레칭 (58%)',
      '일기 쓰기 (51%)',
      '긍정적 자기대화 (44%)'
    ],
    percentage: 81
  },
  {
    id: 'comm-3',
    emotion: '기쁨',
    title: '나와 같은 기분을 가진 사람들은',
    description: '행복한 감정을 느낀 사람들의 89%가 이런 활동으로 기분을 더욱 좋게 만들었어요',
    activities: [
      '친구와 대화하기 (82%)',
      '좋아하는 음악 듣기 (76%)',
      '운동하기 (69%)',
      '취미 활동 (64%)',
      '감사 일지 쓰기 (58%)'
    ],
    percentage: 89
  }
];
