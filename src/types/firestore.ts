/**
 * Firestore 데이터 모델 정의
 * 
 * FEAT-002: 실시간 데이터 동기화
 * PRD 명세: Firestore 데이터 구조 정의
 * 
 * 주요 타입:
 * - ChatMessage: 채팅 메시지
 * - Conversation: 대화 스레드
 * - EmotionData: 감정 데이터
 * - DiaryData: 일기 데이터
 * - UserProfile: 사용자 프로필
 */

import { Timestamp } from 'firebase/firestore';
import { EmotionType, CoachPersona } from '../../../types';

/**
 * Firestore Timestamp를 Date로 변환하는 헬퍼 타입
 */
export type FirestoreTimestamp = Timestamp | Date;

/**
 * 채팅 메시지 (Firestore)
 */
export interface FirestoreChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: FirestoreTimestamp;
  conversationId: string;
}

/**
 * 대화 스레드 (Firestore)
 */
export interface FirestoreConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  messageCount: number;
  emotion?: EmotionType;
  intensity?: number;
  modeAtTime: 'day' | 'night';
  contextTags?: string[];
}

/**
 * 감정 데이터 (Firestore)
 */
export interface FirestoreEmotionData {
  id: string;
  userId: string;
  emotion: EmotionType;
  intensity: number; // 1-10
  timestamp: FirestoreTimestamp;
  modeAtTime: 'day' | 'night';
  contextTags?: string[];
  conversationId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    placeType?: 'home' | 'work' | 'other';
  };
}

/**
 * 일기 데이터 (Firestore)
 */
export interface FirestoreDiaryData {
  id: string;
  userId: string;
  date: FirestoreTimestamp;
  content: string; // 최대 500자
  emotion: EmotionType;
  intensity: number;
  dayModeSummary?: string; // Day Mode 요약 자동 인입
  letterContent?: string; // AI 편지 내용
  letterGeneratedAt?: FirestoreTimestamp;
  conversationId?: string;
}

/**
 * 사용자 프로필 (Firestore)
 */
export interface FirestoreUserProfile {
  id: string;
  userId: string;
  persona: CoachPersona;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  onboardingCompleted: boolean;
  preferences?: {
    reminderEnabled: boolean;
    reminderTime?: string; // HH:mm 형식
    reminderFrequency?: 'daily' | 'twice' | 'none'; // 하루 1회, 하루 2회, 없음
    language: 'ko' | 'en';
    autoDayNightMode?: boolean;
    predictiveNudgeEnabled?: boolean;
    snoozeUntil?: FirestoreTimestamp;
  };
}

/**
 * 마이크로 액션 실행 기록 (Firestore)
 */
export interface FirestoreMicroActionLog {
  id: string;
  userId: string;
  actionId: string;
  actionTitle: string;
  executedAt: FirestoreTimestamp;
  beforeIntensity?: number;
  afterIntensity?: number;
  completed: boolean;
  skipped: boolean;
}

/**
 * 주간 리포트 (Firestore)
 */
export interface FirestoreWeeklyReport {
  id: string;
  userId: string;
  weekStartDate: FirestoreTimestamp;
  weekEndDate: FirestoreTimestamp;
  patterns: string[]; // 관찰된 패턴
  nextWeekExperiment?: {
    title: string;
    reason: string;
    plan: {
      days: string[]; // 요일 배열
      time?: string;
      duration: string;
    };
    successCriteria: string;
  };
  createdAt: FirestoreTimestamp;
}

/**
 * 월간 리포트 (Firestore)
 */
export interface FirestoreMonthlyReport {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number;
  narrative: string; // 서사적 회고록
  observations: string[]; // 관찰 3개
  nextMonthExperiment?: {
    title: string;
    reason: string;
  };
  createdAt: FirestoreTimestamp;
}

/**
 * 콘텐츠 데이터 (Firestore)
 */
export interface FirestoreContentData {
  id: string;
  userId: string;
  type: 'poem' | 'meditation' | 'quote' | 'insight';
  title: string;
  body: string;
  author: string;
  tags: string[];
  createdAt: FirestoreTimestamp;
  groundingLinks?: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * 타임라인 엔트리 (Firestore)
 * 기존 TimelineEntry와 호환되는 Firestore 버전
 */
export interface FirestoreTimelineEntry {
  id: string;
  userId: string;
  date: FirestoreTimestamp;
  type: 'day' | 'night';
  emotion: EmotionType;
  intensity?: number;
  summary: string;
  detail: string;
  nuanceTags?: string[];
  conversationId?: string;
}

/**
 * Firestore 컬렉션 이름 상수
 */
export const FIRESTORE_COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  EMOTIONS: 'emotions',
  DIARIES: 'diaries',
  USER_PROFILES: 'userProfiles',
  MICRO_ACTIONS: 'microActions',
  WEEKLY_REPORTS: 'weeklyReports',
  MONTHLY_REPORTS: 'monthlyReports',
  CONTENTS: 'contents',
  TIMELINE: 'timeline',
} as const;
