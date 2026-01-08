/**
 * 목업 데이터
 * 
 * 개발 및 프로토타이핑을 위한 목업 데이터
 * 프로덕션 전 실제 API 연동 필요
 */

// 타입 import 경로: 루트 기준 상대 경로
import { TimelineEntry, EmotionType, ContentData } from 'types';

// 타임라인 목업 데이터
export const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    id: 'mock-1',
    date: new Date(),
    type: 'day',
    emotion: EmotionType.JOY,
    intensity: 8,
    summary: '오랜만에 친구들과의 브런치',
    detail: '정말 오랜만에 고등학교 친구들을 만났다...',
    nuanceTags: ['#행복한', '#신나는', '#반가운']
  },
  {
    id: 'mock-2',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    type: 'night',
    emotion: EmotionType.ANXIETY,
    intensity: 6,
    summary: '내일 발표가 걱정된다',
    detail: '준비는 다 했는데 실수할까봐...',
    nuanceTags: ['#떨리는', '#불안한', '#압박감']
  },
  {
    id: 'mock-3',
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    type: 'day',
    emotion: EmotionType.PEACE,
    intensity: 7,
    summary: '한강 산책',
    detail: '바람이 시원했다.',
    nuanceTags: ['#상쾌한', '#여유로운']
  },
  {
    id: 'mock-4',
    date: new Date(new Date().setDate(new Date().getDate() - 6)),
    type: 'night',
    emotion: EmotionType.SADNESS,
    intensity: 5,
    summary: '비오는 날의 우울',
    detail: '그냥 아무 이유 없이 축 처진다.',
    nuanceTags: ['#무기력한', '#센치한']
  },
];

// 회복력 데이터 (JournalView용)
export const RESILIENCE_DATA = [
  { day: 1, score: 65 },
  { day: 2, score: 68 },
  { day: 3, score: 72 },
  { day: 4, score: 70 },
  { day: 5, score: 75 },
  { day: 6, score: 78 },
  { day: 7, score: 80 },
];

// 레이더 차트 데이터 (ReportView용)
export const RADAR_DATA = [
  { subject: 'Self-Care', A: 120, fullMark: 150 },
  { subject: 'Social', A: 98, fullMark: 150 },
  { subject: 'Work', A: 86, fullMark: 150 },
  { subject: 'Sleep', A: 99, fullMark: 150 },
  { subject: 'Mindfulness', A: 85, fullMark: 150 },
  { subject: 'Physical', A: 65, fullMark: 150 },
];

// Area 차트 데이터 (ReportView용)
export const AREA_DATA = [
  { name: 'Wk 1', positive: 40, energy: 24, stress: 24 },
  { name: 'Wk 2', positive: 50, energy: 35, stress: 20 },
  { name: 'Wk 3', positive: 35, energy: 60, stress: 45 },
  { name: 'Wk 4', positive: 65, energy: 45, stress: 15 },
];

// 콘텐츠 갤러리 목업 데이터 (ContentGallery용)
export const MOCK_CONTENTS: (ContentData & { commentary?: string })[] = [
  {
    id: '1',
    type: 'poem',
    title: '새벽의 위로',
    body: '어둠이 깊을수록\n별은 더 선명히 빛납니다.\n당신의 마음속 그림자도\n언젠가 빛날 별의 재료임을\n잊지 마세요.',
    author: '루나',
    tags: ['위로', '새벽', '희망'],
    createdAt: new Date(),
    commentary: '힘든 순간일수록 당신의 빛은 더 선명해질 거예요.'
  },
  {
    id: '2',
    type: 'meditation',
    title: '3분 호흡 명상',
    body: '편안한 자세로 앉아 눈을 감으세요.\n코로 깊게 숨을 들이마시며 4를 셉니다.\n잠시 숨을 멈추고 2를 셉니다.\n입으로 천천히 내뱉으며 6을 셉니다.\n지금 이 순간, 당신의 호흡에만 집중하세요.',
    author: '루나',
    tags: ['명상', '호흡', '안정'],
    createdAt: new Date(),
    commentary: '복잡한 생각은 잠시 내려두고 호흡에만 집중해보세요.'
  },
  {
    id: '3',
    type: 'quote',
    title: '오늘의 영감',
    body: '"당신이 할 수 있다고 믿든,\n할 수 없다고 믿든,\n당신은 옳다."\n- 헨리 포드',
    author: 'Henry Ford',
    tags: ['동기부여', '믿음', '시작'],
    createdAt: new Date(),
    commentary: '스스로를 믿는 힘이 가장 강력한 시작입니다.'
  },
  {
    id: '4',
    type: 'insight',
    title: '작은 성취의 힘',
    body: '심리학 연구에 따르면,\n아주 작은 목표를 달성하는 것만으로도\n우리 뇌는 도파민을 분비합니다.\n오늘 침대 정리를 하셨나요?\n그것만으로도 이미 성공적인 시작입니다.',
    author: 'Psych Today',
    tags: ['심리학', '습관', '뇌과학'],
    createdAt: new Date(),
    commentary: '거창한 목표보다 작은 실천이 우리를 바꿉니다.'
  }
];

// 트렌드 데이터 (ContentGallery용)
export const TREND_DATA = [
  { day: 'M', score: 3 },
  { day: 'T', score: 4 },
  { day: 'W', score: 3 },
  { day: 'T', score: 6 },
  { day: 'F', score: 5 },
  { day: 'S', score: 8 },
  { day: 'S', score: 7 },
];

// 기분 태그 목업 데이터
export const MOODS = [
  '지친 하루', '막막한 미래', '작은 기쁨', '휴식이 필요해', '불안한 마음', 
  '사랑받고 싶어', '영감이 필요해', '잠이 오지 않아', '누군가 그리워'
];
