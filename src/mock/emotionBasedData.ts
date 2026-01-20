/**
 * 감정별 동적 목업 데이터
 *
 * 각 감정 상태(JOY, PEACE, ANXIETY, SADNESS, ANGER)에 맞는
 * 타임라인, 차트, 콘텐츠 데이터 제공
 */

import { EmotionType, TimelineEntry, ContentData } from 'types';

// ========================================
// 타입 정의
// ========================================

export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

export interface AreaDataPoint {
  name: string;
  positive: number;
  energy: number;
  stress: number;
}

export interface TrendDataPoint {
  day: string;
  score: number;
}

// ========================================
// 감정별 타임라인 데이터 (5개 케이스)
// ========================================

export const EMOTION_TIMELINE_DATA: Record<EmotionType, TimelineEntry[]> = {
  [EmotionType.JOY]: [
    {
      id: 'joy-1',
      date: new Date(),
      type: 'day',
      emotion: EmotionType.JOY,
      intensity: 9,
      summary: '승진 소식을 들었다!',
      detail: '열심히 노력한 보람이 있다. 동료들도 축하해줘서 더 기뻤다.',
      nuanceTags: ['#뿌듯한', '#감사한', '#행복한']
    },
    {
      id: 'joy-2',
      date: new Date(Date.now() - 86400000),
      type: 'night',
      emotion: EmotionType.JOY,
      intensity: 8,
      summary: '오랜만에 가족 모임',
      detail: '부모님 얼굴 보니까 마음이 따뜻해졌다.',
      nuanceTags: ['#따뜻한', '#편안한', '#그리웠던']
    },
    {
      id: 'joy-3',
      date: new Date(Date.now() - 172800000),
      type: 'day',
      emotion: EmotionType.JOY,
      intensity: 7,
      summary: '취미 생활의 즐거움',
      detail: '오랜만에 그림 그리는데 시간 가는 줄 몰랐다.',
      nuanceTags: ['#몰입', '#창작의기쁨', '#여유']
    },
    {
      id: 'joy-4',
      date: new Date(Date.now() - 259200000),
      type: 'day',
      emotion: EmotionType.JOY,
      intensity: 8,
      summary: '친구의 깜짝 선물',
      detail: '생각지도 못한 선물에 감동받았다.',
      nuanceTags: ['#감동', '#우정', '#놀라운']
    },
    {
      id: 'joy-5',
      date: new Date(Date.now() - 345600000),
      type: 'night',
      emotion: EmotionType.JOY,
      intensity: 6,
      summary: '맛있는 저녁 요리 성공',
      detail: '새로운 레시피 도전했는데 대성공!',
      nuanceTags: ['#성취감', '#맛있는', '#뿌듯']
    }
  ],

  [EmotionType.PEACE]: [
    {
      id: 'peace-1',
      date: new Date(),
      type: 'day',
      emotion: EmotionType.PEACE,
      intensity: 8,
      summary: '아침 명상으로 시작한 하루',
      detail: '10분 명상 후 마음이 고요해졌다.',
      nuanceTags: ['#고요한', '#평화로운', '#맑은']
    },
    {
      id: 'peace-2',
      date: new Date(Date.now() - 86400000),
      type: 'night',
      emotion: EmotionType.PEACE,
      intensity: 7,
      summary: '비 오는 날의 독서',
      detail: '창밖 빗소리 들으며 책 읽는 시간이 좋았다.',
      nuanceTags: ['#여유', '#차분한', '#아늑한']
    },
    {
      id: 'peace-3',
      date: new Date(Date.now() - 172800000),
      type: 'day',
      emotion: EmotionType.PEACE,
      intensity: 9,
      summary: '산책 중 발견한 풍경',
      detail: '노을이 지는 하늘이 너무 예뻤다.',
      nuanceTags: ['#감탄', '#자연', '#아름다운']
    },
    {
      id: 'peace-4',
      date: new Date(Date.now() - 259200000),
      type: 'day',
      emotion: EmotionType.PEACE,
      intensity: 6,
      summary: '카페에서의 여유',
      detail: '아무 생각 없이 커피 마시며 멍때리기.',
      nuanceTags: ['#릴렉스', '#여유', '#혼자만의시간']
    },
    {
      id: 'peace-5',
      date: new Date(Date.now() - 345600000),
      type: 'night',
      emotion: EmotionType.PEACE,
      intensity: 8,
      summary: '조용한 밤의 음악 감상',
      detail: '클래식 음악 들으며 하루를 마무리.',
      nuanceTags: ['#힐링', '#음악', '#평온']
    }
  ],

  [EmotionType.ANXIETY]: [
    {
      id: 'anxiety-1',
      date: new Date(),
      type: 'day',
      emotion: EmotionType.ANXIETY,
      intensity: 7,
      summary: '중요한 발표를 앞두고',
      detail: '준비는 했는데 계속 걱정이 된다.',
      nuanceTags: ['#긴장', '#떨리는', '#불안한']
    },
    {
      id: 'anxiety-2',
      date: new Date(Date.now() - 86400000),
      type: 'night',
      emotion: EmotionType.ANXIETY,
      intensity: 6,
      summary: '미래에 대한 막연한 걱정',
      detail: '잠이 오지 않고 생각이 많아진다.',
      nuanceTags: ['#불면', '#걱정', '#막막한']
    },
    {
      id: 'anxiety-3',
      date: new Date(Date.now() - 172800000),
      type: 'day',
      emotion: EmotionType.ANXIETY,
      intensity: 8,
      summary: '건강검진 결과 대기',
      detail: '결과 나올 때까지 마음이 불안하다.',
      nuanceTags: ['#초조', '#기다림', '#걱정']
    },
    {
      id: 'anxiety-4',
      date: new Date(Date.now() - 259200000),
      type: 'day',
      emotion: EmotionType.ANXIETY,
      intensity: 5,
      summary: '새로운 프로젝트 시작',
      detail: '잘 해낼 수 있을지 자신이 없다.',
      nuanceTags: ['#자신감부족', '#부담', '#두려움']
    },
    {
      id: 'anxiety-5',
      date: new Date(Date.now() - 345600000),
      type: 'night',
      emotion: EmotionType.ANXIETY,
      intensity: 6,
      summary: '인간관계 고민',
      detail: '오늘 한 말이 오해를 살까 걱정된다.',
      nuanceTags: ['#후회', '#걱정', '#예민']
    }
  ],

  [EmotionType.SADNESS]: [
    {
      id: 'sadness-1',
      date: new Date(),
      type: 'night',
      emotion: EmotionType.SADNESS,
      intensity: 7,
      summary: '그리운 사람이 생각나는 밤',
      detail: '옛 추억이 떠올라 마음이 아프다.',
      nuanceTags: ['#그리움', '#추억', '#아련한']
    },
    {
      id: 'sadness-2',
      date: new Date(Date.now() - 86400000),
      type: 'day',
      emotion: EmotionType.SADNESS,
      intensity: 6,
      summary: '비 오는 날의 우울',
      detail: '이유 없이 기분이 가라앉는다.',
      nuanceTags: ['#무기력', '#센치한', '#축처진']
    },
    {
      id: 'sadness-3',
      date: new Date(Date.now() - 172800000),
      type: 'night',
      emotion: EmotionType.SADNESS,
      intensity: 8,
      summary: '실패에 대한 자책',
      detail: '더 잘할 수 있었는데... 하는 후회가 밀려온다.',
      nuanceTags: ['#후회', '#자책', '#아쉬운']
    },
    {
      id: 'sadness-4',
      date: new Date(Date.now() - 259200000),
      type: 'day',
      emotion: EmotionType.SADNESS,
      intensity: 5,
      summary: '외로운 점심시간',
      detail: '혼자 밥 먹으니 쓸쓸하다.',
      nuanceTags: ['#외로움', '#쓸쓸한', '#고독']
    },
    {
      id: 'sadness-5',
      date: new Date(Date.now() - 345600000),
      type: 'night',
      emotion: EmotionType.SADNESS,
      intensity: 6,
      summary: '갑자기 밀려오는 공허함',
      detail: '잘 모르겠다. 그냥 마음이 텅 빈 느낌.',
      nuanceTags: ['#공허', '#무감각', '#혼란']
    }
  ],

  [EmotionType.ANGER]: [
    {
      id: 'anger-1',
      date: new Date(),
      type: 'day',
      emotion: EmotionType.ANGER,
      intensity: 8,
      summary: '불공정한 대우에 분노',
      detail: '노력한 만큼 인정받지 못해 화가 난다.',
      nuanceTags: ['#억울한', '#분한', '#화나는']
    },
    {
      id: 'anger-2',
      date: new Date(Date.now() - 86400000),
      type: 'night',
      emotion: EmotionType.ANGER,
      intensity: 6,
      summary: '약속을 어긴 친구',
      detail: '기대했던 만큼 실망이 크다.',
      nuanceTags: ['#배신감', '#실망', '#짜증']
    },
    {
      id: 'anger-3',
      date: new Date(Date.now() - 172800000),
      type: 'day',
      emotion: EmotionType.ANGER,
      intensity: 7,
      summary: '반복되는 실수에 짜증',
      detail: '같은 문제로 시간 낭비하는 게 답답하다.',
      nuanceTags: ['#답답', '#짜증', '#반복']
    },
    {
      id: 'anger-4',
      date: new Date(Date.now() - 259200000),
      type: 'day',
      emotion: EmotionType.ANGER,
      intensity: 5,
      summary: '교통 체증에 갇힌 아침',
      detail: '중요한 약속에 늦을 것 같아 조급하다.',
      nuanceTags: ['#조급', '#답답', '#스트레스']
    },
    {
      id: 'anger-5',
      date: new Date(Date.now() - 345600000),
      type: 'night',
      emotion: EmotionType.ANGER,
      intensity: 6,
      summary: '무례한 말에 상처',
      detail: '왜 그런 말을 했을까. 이해가 안 된다.',
      nuanceTags: ['#상처', '#분노', '#이해불가']
    }
  ]
};

// ========================================
// 감정별 레이더 차트 데이터
// ========================================

export const EMOTION_RADAR_DATA: Record<EmotionType, RadarDataPoint[]> = {
  [EmotionType.JOY]: [
    { subject: '자기돌봄', A: 130, fullMark: 150 },
    { subject: '사회관계', A: 140, fullMark: 150 },
    { subject: '업무', A: 110, fullMark: 150 },
    { subject: '수면', A: 120, fullMark: 150 },
    { subject: '마음챙김', A: 100, fullMark: 150 },
    { subject: '신체활동', A: 115, fullMark: 150 },
  ],
  [EmotionType.PEACE]: [
    { subject: '자기돌봄', A: 140, fullMark: 150 },
    { subject: '사회관계', A: 100, fullMark: 150 },
    { subject: '업무', A: 95, fullMark: 150 },
    { subject: '수면', A: 135, fullMark: 150 },
    { subject: '마음챙김', A: 145, fullMark: 150 },
    { subject: '신체활동', A: 90, fullMark: 150 },
  ],
  [EmotionType.ANXIETY]: [
    { subject: '자기돌봄', A: 60, fullMark: 150 },
    { subject: '사회관계', A: 75, fullMark: 150 },
    { subject: '업무', A: 110, fullMark: 150 },
    { subject: '수면', A: 50, fullMark: 150 },
    { subject: '마음챙김', A: 45, fullMark: 150 },
    { subject: '신체활동', A: 55, fullMark: 150 },
  ],
  [EmotionType.SADNESS]: [
    { subject: '자기돌봄', A: 55, fullMark: 150 },
    { subject: '사회관계', A: 50, fullMark: 150 },
    { subject: '업무', A: 70, fullMark: 150 },
    { subject: '수면', A: 85, fullMark: 150 },
    { subject: '마음챙김', A: 60, fullMark: 150 },
    { subject: '신체활동', A: 40, fullMark: 150 },
  ],
  [EmotionType.ANGER]: [
    { subject: '자기돌봄', A: 50, fullMark: 150 },
    { subject: '사회관계', A: 60, fullMark: 150 },
    { subject: '업무', A: 95, fullMark: 150 },
    { subject: '수면', A: 55, fullMark: 150 },
    { subject: '마음챙김', A: 35, fullMark: 150 },
    { subject: '신체활동', A: 80, fullMark: 150 },
  ],
};

// ========================================
// 감정별 Area 차트 데이터 (주간 트렌드)
// ========================================

export const EMOTION_AREA_DATA: Record<EmotionType, AreaDataPoint[]> = {
  [EmotionType.JOY]: [
    { name: '1주차', positive: 70, energy: 65, stress: 15 },
    { name: '2주차', positive: 75, energy: 70, stress: 12 },
    { name: '3주차', positive: 80, energy: 72, stress: 10 },
    { name: '4주차', positive: 85, energy: 78, stress: 8 },
  ],
  [EmotionType.PEACE]: [
    { name: '1주차', positive: 60, energy: 50, stress: 20 },
    { name: '2주차', positive: 65, energy: 55, stress: 18 },
    { name: '3주차', positive: 70, energy: 52, stress: 15 },
    { name: '4주차', positive: 72, energy: 55, stress: 12 },
  ],
  [EmotionType.ANXIETY]: [
    { name: '1주차', positive: 35, energy: 60, stress: 70 },
    { name: '2주차', positive: 30, energy: 55, stress: 75 },
    { name: '3주차', positive: 40, energy: 50, stress: 65 },
    { name: '4주차', positive: 45, energy: 52, stress: 60 },
  ],
  [EmotionType.SADNESS]: [
    { name: '1주차', positive: 30, energy: 35, stress: 45 },
    { name: '2주차', positive: 28, energy: 30, stress: 50 },
    { name: '3주차', positive: 35, energy: 38, stress: 42 },
    { name: '4주차', positive: 40, energy: 42, stress: 38 },
  ],
  [EmotionType.ANGER]: [
    { name: '1주차', positive: 35, energy: 70, stress: 65 },
    { name: '2주차', positive: 30, energy: 75, stress: 70 },
    { name: '3주차', positive: 38, energy: 68, stress: 60 },
    { name: '4주차', positive: 42, energy: 65, stress: 55 },
  ],
};

// ========================================
// 감정별 일간 트렌드 데이터
// ========================================

export const EMOTION_TREND_DATA: Record<EmotionType, TrendDataPoint[]> = {
  [EmotionType.JOY]: [
    { day: '월', score: 7 },
    { day: '화', score: 8 },
    { day: '수', score: 7 },
    { day: '목', score: 9 },
    { day: '금', score: 8 },
    { day: '토', score: 9 },
    { day: '일', score: 8 },
  ],
  [EmotionType.PEACE]: [
    { day: '월', score: 6 },
    { day: '화', score: 7 },
    { day: '수', score: 7 },
    { day: '목', score: 6 },
    { day: '금', score: 7 },
    { day: '토', score: 8 },
    { day: '일', score: 8 },
  ],
  [EmotionType.ANXIETY]: [
    { day: '월', score: 4 },
    { day: '화', score: 3 },
    { day: '수', score: 5 },
    { day: '목', score: 4 },
    { day: '금', score: 3 },
    { day: '토', score: 5 },
    { day: '일', score: 4 },
  ],
  [EmotionType.SADNESS]: [
    { day: '월', score: 3 },
    { day: '화', score: 4 },
    { day: '수', score: 3 },
    { day: '목', score: 4 },
    { day: '금', score: 5 },
    { day: '토', score: 4 },
    { day: '일', score: 3 },
  ],
  [EmotionType.ANGER]: [
    { day: '월', score: 4 },
    { day: '화', score: 3 },
    { day: '수', score: 4 },
    { day: '목', score: 5 },
    { day: '금', score: 4 },
    { day: '토', score: 6 },
    { day: '일', score: 5 },
  ],
};

// ========================================
// 감정별 추천 콘텐츠
// ========================================

export const EMOTION_CONTENTS: Record<EmotionType, (ContentData & { commentary?: string })[]> = {
  [EmotionType.JOY]: [
    {
      id: 'joy-content-1',
      type: 'poem',
      title: '행복을 담아',
      body: '오늘의 기쁨을\n작은 병에 담아두세요.\n힘든 날이 오면\n꺼내어 마시면 됩니다.\n당신의 미소가\n최고의 보약입니다.',
      author: '루나',
      tags: ['기쁨', '감사', '긍정'],
      createdAt: new Date(),
      commentary: '이 행복한 순간을 오래 기억하세요.'
    },
    {
      id: 'joy-content-2',
      type: 'insight',
      title: '감사 일기의 힘',
      body: '매일 세 가지 감사한 일을 적는 것만으로도 행복 지수가 25% 높아진다는 연구 결과가 있습니다. 오늘의 기쁨을 기록해보세요.',
      author: 'Positive Psychology',
      tags: ['감사', '습관', '행복'],
      createdAt: new Date(),
      commentary: '기쁜 순간을 기록하면 더 오래 남아요.'
    },
    {
      id: 'joy-content-3',
      type: 'meditation',
      title: '기쁨 확장 명상',
      body: '편안히 앉아 눈을 감으세요.\n지금 느끼는 기쁨을 가슴에 모아보세요.\n그 따뜻함이 온몸으로 퍼져나가는 것을 느끼세요.\n이 에너지를 소중한 사람들에게 보내세요.',
      author: '루나',
      tags: ['명상', '기쁨', '나눔'],
      createdAt: new Date(),
      commentary: '기쁨은 나눌수록 커집니다.'
    },
  ],

  [EmotionType.PEACE]: [
    {
      id: 'peace-content-1',
      type: 'poem',
      title: '고요한 마음',
      body: '물결 없는 호수처럼\n마음이 잔잔해지면\n그 안에 비친 하늘이\n더 선명하게 보입니다.\n지금 이 순간의 평화를\n오래 간직하세요.',
      author: '루나',
      tags: ['평화', '고요', '마음'],
      createdAt: new Date(),
      commentary: '이 평온함 속에서 쉬어가세요.'
    },
    {
      id: 'peace-content-2',
      type: 'meditation',
      title: '호흡 명상',
      body: '천천히 숨을 들이쉬세요...\n4초간 멈추고...\n천천히 내쉬세요...\n모든 긴장이 빠져나갑니다.\n이 고요함 속에 머물러보세요.',
      author: '루나',
      tags: ['명상', '호흡', '이완'],
      createdAt: new Date(),
      commentary: '호흡에 집중하면 마음이 가라앉아요.'
    },
    {
      id: 'peace-content-3',
      type: 'quote',
      title: '오늘의 지혜',
      body: '"평화는 미소에서 시작됩니다."\n- 마더 테레사',
      author: 'Mother Teresa',
      tags: ['평화', '미소', '지혜'],
      createdAt: new Date(),
      commentary: '작은 미소가 평화를 퍼뜨립니다.'
    },
  ],

  [EmotionType.ANXIETY]: [
    {
      id: 'anxiety-content-1',
      type: 'meditation',
      title: '그라운딩 명상',
      body: '발바닥이 바닥에 닿는 감각을 느껴보세요.\n숨을 깊이 들이마시고...\n천천히 내쉬면서 긴장을 내려놓으세요.\n지금 이 순간, 당신은 안전합니다.\n걱정은 잠시 내려놓아도 괜찮아요.',
      author: '루나',
      tags: ['불안해소', '그라운딩', '호흡'],
      createdAt: new Date(),
      commentary: '지금 이 순간에 집중해보세요.'
    },
    {
      id: 'anxiety-content-2',
      type: 'insight',
      title: '5-4-3-2-1 기법',
      body: '불안할 때 시도해보세요:\n5가지 보이는 것\n4가지 만질 수 있는 것\n3가지 들리는 것\n2가지 냄새 맡을 수 있는 것\n1가지 맛볼 수 있는 것\n\n감각에 집중하면 불안이 줄어듭니다.',
      author: 'CBT Therapy',
      tags: ['불안관리', '기법', '감각'],
      createdAt: new Date(),
      commentary: '감각에 집중하면 생각이 멈춰요.'
    },
    {
      id: 'anxiety-content-3',
      type: 'poem',
      title: '걱정아, 잠시만',
      body: '모든 걱정을\n작은 풍선에 담아\n하늘로 보내세요.\n지금 해결할 수 없는 것은\n내일의 나에게 맡겨도 됩니다.',
      author: '루나',
      tags: ['걱정', '내려놓음', '위로'],
      createdAt: new Date(),
      commentary: '지금은 쉬어도 괜찮아요.'
    },
  ],

  [EmotionType.SADNESS]: [
    {
      id: 'sadness-content-1',
      type: 'poem',
      title: '괜찮아, 울어도 돼',
      body: '눈물은 약함이 아닙니다.\n마음이 스스로를 치유하는\n자연스러운 방법이에요.\n충분히 울고 나면\n조금 가벼워질 거예요.',
      author: '루나',
      tags: ['위로', '눈물', '치유'],
      createdAt: new Date(),
      commentary: '감정을 표현하는 건 용기예요.'
    },
    {
      id: 'sadness-content-2',
      type: 'insight',
      title: '슬픔의 파도',
      body: '슬픔은 파도와 같습니다. 밀려왔다가 다시 빠져나갑니다. 지금 이 감정도 영원하지 않습니다. 파도가 지나가듯, 이 순간도 지나갈 거예요.',
      author: 'Psychology Today',
      tags: ['슬픔', '감정', '지나감'],
      createdAt: new Date(),
      commentary: '이 순간도 지나가요.'
    },
    {
      id: 'sadness-content-3',
      type: 'meditation',
      title: '자기 위로 명상',
      body: '손을 가슴에 올려보세요.\n그 따뜻함을 느끼며...\n"지금 힘들어도 괜찮아"\n"나는 나를 돌볼 수 있어"\n스스로에게 말해주세요.',
      author: '루나',
      tags: ['자기위로', '명상', '따뜻함'],
      createdAt: new Date(),
      commentary: '당신 곁에 있어요.'
    },
  ],

  [EmotionType.ANGER]: [
    {
      id: 'anger-content-1',
      type: 'meditation',
      title: '분노 진정 호흡',
      body: '코로 4초간 숨을 들이마시세요.\n7초간 멈추고...\n입으로 8초간 천천히 내쉬세요.\n화가 조금씩 빠져나가는 것을 느끼세요.\n3번 반복해보세요.',
      author: '루나',
      tags: ['분노관리', '호흡', '진정'],
      createdAt: new Date(),
      commentary: '호흡이 감정을 가라앉혀줘요.'
    },
    {
      id: 'anger-content-2',
      type: 'insight',
      title: '분노 아래의 감정',
      body: '분노는 종종 다른 감정의 가면입니다. 상처, 두려움, 실망이 분노로 표현되기도 합니다. 화가 날 때, 그 아래 어떤 감정이 있는지 들여다보세요.',
      author: 'Emotional Intelligence',
      tags: ['분노', '감정이해', '자기인식'],
      createdAt: new Date(),
      commentary: '진짜 감정을 찾아보세요.'
    },
    {
      id: 'anger-content-3',
      type: 'poem',
      title: '분노의 에너지',
      body: '분노는 나쁜 감정이 아닙니다.\n경계를 지키려는\n당신의 마음입니다.\n다만 그 에너지를\n어디에 쓸지\n현명하게 선택하세요.',
      author: '루나',
      tags: ['분노', '에너지', '경계'],
      createdAt: new Date(),
      commentary: '분노도 당신을 지키는 감정이에요.'
    },
  ],
};

// ========================================
// 감정별 폴백 응답 메시지
// ========================================

export const EMOTION_FALLBACK_MESSAGES: Record<EmotionType, string[]> = {
  [EmotionType.JOY]: [
    '그 기쁨이 오래 이어지길 바라요.',
    '행복한 순간을 함께 나눠줘서 고마워요.',
    '당신의 미소가 느껴져요.',
    '이 좋은 에너지를 간직하세요.',
    '기쁜 마음, 정말 소중해요.',
  ],
  [EmotionType.PEACE]: [
    '평온한 마음이 느껴져요.',
    '이 고요함을 즐겨보세요.',
    '당신의 평화가 주변에도 퍼져나가요.',
    '이 순간을 충분히 느껴보세요.',
    '여유로운 시간이네요.',
  ],
  [EmotionType.ANXIETY]: [
    '괜찮아요, 천천히 숨을 쉬어보세요.',
    '지금 이 순간, 당신은 안전해요.',
    '걱정은 잠시 내려놓아도 돼요.',
    '함께 있을게요.',
    '한 걸음씩, 천천히 가요.',
  ],
  [EmotionType.SADNESS]: [
    '슬퍼도 괜찮아요.',
    '당신 곁에 있어요.',
    '충분히 느껴도 돼요.',
    '이 순간도 지나갈 거예요.',
    '당신은 혼자가 아니에요.',
  ],
  [EmotionType.ANGER]: [
    '화가 나는 것도 자연스러운 감정이에요.',
    '잠시 숨을 고르고 가요.',
    '그 마음, 충분히 이해해요.',
    '함께 정리해볼까요?',
    '당신의 감정은 소중해요.',
  ],
};

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 현재 감정에 맞는 타임라인 데이터 반환
 */
export const getTimelineForEmotion = (emotion: EmotionType | null): TimelineEntry[] => {
  if (!emotion) return EMOTION_TIMELINE_DATA[EmotionType.PEACE];
  return EMOTION_TIMELINE_DATA[emotion] || EMOTION_TIMELINE_DATA[EmotionType.PEACE];
};

/**
 * 현재 감정에 맞는 레이더 데이터 반환
 */
export const getRadarDataForEmotion = (emotion: EmotionType | null): RadarDataPoint[] => {
  if (!emotion) return EMOTION_RADAR_DATA[EmotionType.PEACE];
  return EMOTION_RADAR_DATA[emotion] || EMOTION_RADAR_DATA[EmotionType.PEACE];
};

/**
 * 현재 감정에 맞는 Area 차트 데이터 반환
 */
export const getAreaDataForEmotion = (emotion: EmotionType | null): AreaDataPoint[] => {
  if (!emotion) return EMOTION_AREA_DATA[EmotionType.PEACE];
  return EMOTION_AREA_DATA[emotion] || EMOTION_AREA_DATA[EmotionType.PEACE];
};

/**
 * 현재 감정에 맞는 콘텐츠 반환
 */
export const getContentsForEmotion = (emotion: EmotionType | null): (ContentData & { commentary?: string })[] => {
  if (!emotion) return EMOTION_CONTENTS[EmotionType.PEACE];
  return EMOTION_CONTENTS[emotion] || EMOTION_CONTENTS[EmotionType.PEACE];
};

/**
 * 현재 감정에 맞는 폴백 메시지 반환 (랜덤)
 */
export const getFallbackMessageForEmotion = (emotion: EmotionType | null): string => {
  const messages = emotion
    ? EMOTION_FALLBACK_MESSAGES[emotion]
    : EMOTION_FALLBACK_MESSAGES[EmotionType.PEACE];
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * 현재 감정에 맞는 트렌드 데이터 반환
 */
export const getTrendDataForEmotion = (emotion: EmotionType | null): TrendDataPoint[] => {
  if (!emotion) return EMOTION_TREND_DATA[EmotionType.PEACE];
  return EMOTION_TREND_DATA[emotion] || EMOTION_TREND_DATA[EmotionType.PEACE];
};
