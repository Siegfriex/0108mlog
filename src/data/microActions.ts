/**
 * 마이크로 액션 라이브러리
 * 
 * FEAT-009: 마이크로 액션 시스템
 * PRD 명세: 초기 마이크로 액션 라이브러리 (v0.1, 30개)
 * 
 * 카테고리:
 * - breath: 호흡/짧은 이완
 * - movement: 몸 움직임
 * - cognitive: 인지 전환
 * - relationship: 관계/환경
 * - environment: 환경 정리
 */

import { MicroAction } from '../../types';

/**
 * 마이크로 액션 라이브러리 (30개)
 * PRD 부록 1.17 참조
 */
export const MICRO_ACTIONS: MicroAction[] = [
  // Breath 카테고리 (7개)
  {
    id: 'MA-001',
    title: '2분 박스 호흡',
    description: '4초 들이마시기 → 4초 멈춤 → 4초 내쉬기 → 4초 멈춤. 4번 반복.',
    duration: '2 min',
    type: 'breathing',
  },
  {
    id: 'MA-002',
    title: '4-6 호흡(긴 내쉬기)',
    description: '4초 들이마시고 6초 내쉬기. 8번 반복.',
    duration: '2 min',
    type: 'breathing',
  },
  {
    id: 'MA-003',
    title: '긴 내쉬기 10번',
    description: '숨을 편하게 들이마신 뒤, 내쉬는 호흡을 "조금 더 길게" 10번.',
    duration: '2 min',
    type: 'breathing',
  },
  {
    id: 'MA-004',
    title: '5-4-3-2-1 감각 체크',
    description: '보이는 것 5개, 만져지는 것 4개, 들리는 것 3개, 냄새 2개, 맛 1개를 조용히 확인.',
    duration: '3 min',
    type: 'breathing',
  },
  {
    id: 'MA-005',
    title: '손을 가슴에(자기 체크)',
    description: '한 손을 가슴에 두고 "지금 이 순간"에 집중하며 호흡 10번.',
    duration: '2 min',
    type: 'breathing',
  },
  {
    id: 'MA-006',
    title: '1분 바디 스캔 + 1분 호흡',
    description: '머리→어깨→가슴→배→다리 순서로 긴장 부위를 찾고, 마지막 1분은 호흡만.',
    duration: '2 min',
    type: 'breathing',
  },
  {
    id: 'MA-007',
    title: '3문장 마음 정리',
    description: '"지금 느끼는 감정은 ___.", "몸은 ___.", "다음에 필요한 건 ___." 3문장만 작성.',
    duration: '3 min',
    type: 'breathing',
  },
  
  // Movement 카테고리 (6개)
  {
    id: 'MA-008',
    title: '어깨/목 풀기(3분)',
    description: '어깨를 10번 돌리고, 목을 좌/우 천천히 10초씩. 마지막에 깊게 기지개.',
    duration: '3 min',
    type: 'exercise',
  },
  {
    id: 'MA-009',
    title: '3분 걷기',
    description: '집/사무실에서라도 3분만 천천히 걷기. 걸으며 발바닥 감각에 집중.',
    duration: '3 min',
    type: 'exercise',
  },
  {
    id: 'MA-010',
    title: '전신 기지개 2분',
    description: '팔을 머리 위로 올려 10초 유지 → 옆구리 늘리기 좌/우 → 몸통 비틀기.',
    duration: '2 min',
    type: 'exercise',
  },
  {
    id: 'MA-011',
    title: '손목/등 스트레칭',
    description: '손목을 가볍게 풀고, 등(견갑)을 30초씩 늘리기.',
    duration: '2 min',
    type: 'exercise',
  },
  {
    id: 'MA-012',
    title: '제자리 걷기(4분)',
    description: '1분 제자리 걷기 + 30초 쉬기 × 2세트. 숨이 너무 차지 않게.',
    duration: '4 min',
    type: 'exercise',
  },
  {
    id: 'MA-013',
    title: '물 한 잔 + 자세 리셋',
    description: '물 한 잔 마시고, 의자에 앉아 골반/등/목을 곧게 30초 유지.',
    duration: '3 min',
    type: 'exercise',
  },
  
  // Cognitive 카테고리 (8개)
  {
    id: 'MA-014',
    title: '감정 이름 붙이기',
    description: '"나는 지금 ___을 느낀다" 한 줄 + 이유(한 줄)만.',
    duration: '2 min',
    type: 'journaling',
  },
  {
    id: 'MA-015',
    title: '오늘 잘한 것 1개',
    description: '오늘 내가 한 "작은 성공" 1가지만 적기.',
    duration: '2 min',
    type: 'journaling',
  },
  {
    id: 'MA-016',
    title: '감사 1줄',
    description: '감사한 것 1개를 1줄로 적기(사람/상황/나 자신).',
    duration: '2 min',
    type: 'journaling',
  },
  {
    id: 'MA-017',
    title: '다음 "가장 작은 한 걸음"',
    description: '지금 해야 할 일/목표가 있다면 "5분 안에 가능한 1단계"를 적고, 시작 버튼만 누르기(실행은 선택).',
    duration: '3 min',
    type: 'journaling',
  },
  {
    id: 'MA-018',
    title: '머릿속 비우기 3줄',
    description: '떠오르는 생각을 3줄로 적고, 마지막 줄에 "지금은 여기까지"라고 마무리.',
    duration: '3 min',
    type: 'journaling',
  },
  {
    id: 'MA-019',
    title: '걱정 타임박스',
    description: '걱정을 2분 동안 적고, 마지막 1분은 "다음에 할 수 있는 1개"만 적기.',
    duration: '3 min',
    type: 'journaling',
  },
  {
    id: 'MA-020',
    title: '오늘의 우선순위 1개',
    description: '오늘 가장 중요한 것 1개만 정하고, 나머지는 잠시 내려놓기.',
    duration: '2 min',
    type: 'journaling',
  },
  {
    id: 'MA-021',
    title: '하루 마무리 한 줄',
    description: '"오늘의 나에게 한 줄"을 쓰기.',
    duration: '2 min',
    type: 'journaling',
  },
  
  // Relationship 카테고리 (4개)
  {
    id: 'MA-022',
    title: '고마움 메시지 1개',
    description: '고마운 사람에게 짧게 "고마웠어" 한 문장 보내기(길게 X).',
    duration: '2 min',
    type: 'mindfulness',
  },
  {
    id: 'MA-023',
    title: '나에게 응원 한 줄',
    description: '"나는 지금도 충분히 하고 있어"처럼 나에게 한 문장.',
    duration: '2 min',
    type: 'mindfulness',
  },
  {
    id: 'MA-024',
    title: '안부 한 줄(가벼운 연결)',
    description: '부담 없는 안부 1줄 보내기(답을 기대하지 않기).',
    duration: '3 min',
    type: 'mindfulness',
  },
  {
    id: 'MA-025',
    title: '미소/표정 풀기',
    description: '턱/미간 힘을 풀고, 어깨를 내리며 10초 미소.',
    duration: '2 min',
    type: 'mindfulness',
  },
  
  // Environment 카테고리 (5개)
  {
    id: 'MA-026',
    title: '책상 위 2분 정리',
    description: '눈에 보이는 3가지만 제자리로. 끝나면 "완료"만 누르기.',
    duration: '2 min',
    type: 'mindfulness',
  },
  {
    id: 'MA-027',
    title: '창문 열기 + 공기 바꾸기',
    description: '창문을 열고 10번 천천히 호흡. 창문이 없다면 자리에서 몸을 펴기.',
    duration: '2 min',
    type: 'mindfulness',
  },
  {
    id: 'MA-028',
    title: '빛/소리 세팅',
    description: '화면 밝기/조명 조정, 불필요한 알림 끄기(10분만).',
    duration: '3 min',
    type: 'mindfulness',
  },
  {
    id: 'MA-029',
    title: '내일을 위한 1분 준비',
    description: '내일의 첫 할 일 1개를 적고(1분), 필요한 것 1가지만 꺼내두기(2분).',
    duration: '3 min',
    type: 'journaling',
  },
  {
    id: 'MA-030',
    title: '좋아하는 음악 1곡',
    description: '좋아하는 음악 1곡을 들으며 호흡/몸 감각만 느끼기.',
    duration: '3 min',
    type: 'mindfulness',
  },
];

/**
 * 카테고리별 액션 필터링
 * 
 * @param category 카테고리 타입
 * @returns 해당 카테고리의 액션 배열
 */
export const getActionsByCategory = (category: MicroAction['type']): MicroAction[] => {
  return MICRO_ACTIONS.filter(action => action.type === category);
};

/**
 * ID로 액션 찾기
 * 
 * @param id 액션 ID (예: 'MA-001')
 * @returns 해당 액션 또는 undefined
 */
export const getActionById = (id: string): MicroAction | undefined => {
  return MICRO_ACTIONS.find(action => action.id === id);
};

/**
 * 강도 기반 액션 추천
 * PRD 명세: 강도 우선 규칙
 * 
 * @param intensity 감정 강도 (1-10)
 * @returns 추천 액션 배열
 */
export const recommendActionsByIntensity = (intensity: number): MicroAction[] => {
  if (intensity >= 8) {
    // 강도 8~10: breath 우선
    return getActionsByCategory('breathing').slice(0, 3);
  } else if (intensity >= 5) {
    // 강도 5~7: movement 또는 breath 우선
    return [
      ...getActionsByCategory('breathing').slice(0, 2),
      ...getActionsByCategory('exercise').slice(0, 2),
    ];
  } else {
    // 강도 1~4: cognitive 또는 environment 우선
    return [
      ...getActionsByCategory('journaling').slice(0, 2),
      ...getActionsByCategory('mindfulness').slice(0, 2),
    ];
  }
};

/**
 * 감정별 액션 추천 보정
 * PRD 명세: 감정별 보정 규칙
 * 
 * @param emotion 감정 타입
 * @param intensity 감정 강도
 * @returns 추천 액션 배열
 */
export const recommendActionsByEmotion = (
  emotion: string,
  intensity: number
): MicroAction[] => {
  const baseActions = recommendActionsByIntensity(intensity);
  
  // 감정별 보정
  if (emotion === 'JOY' || emotion === 'PEACE') {
    // 기쁨/평온: relationship/cognitive 비중↑
    return [
      ...getActionsByCategory('mindfulness').slice(0, 2),
      ...getActionsByCategory('journaling').slice(0, 2),
      ...baseActions.slice(0, 1),
    ];
  } else if (emotion === 'ANXIETY' || emotion === 'SADNESS') {
    // 불안/슬픔: cognitive/environment 비중↑
    return [
      ...getActionsByCategory('journaling').slice(0, 2),
      ...getActionsByCategory('mindfulness').slice(0, 2),
      ...baseActions.slice(0, 1),
    ];
  }
  
  return baseActions;
};
