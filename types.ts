import React from 'react';

export enum EmotionType {
  JOY = 'joy',
  PEACE = 'peace',
  ANXIETY = 'anxiety',
  SADNESS = 'sadness',
  ANGER = 'anger'
}

export interface EmotionData {
  id: EmotionType;
  label: string;
  icon: string;
  color: string;
  desc: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface CoachPersona {
  name: string;
  role: 'friend' | 'mentor' | 'counselor';
  mbti: string;
  traits: {
    warmth: number;      // 0-100 (Logical <-> Emotional)
    directness: number;  // 0-100 (Indirect <-> Direct)
  };
}

export interface MonthlyReport {
  month: string;
  narrative: string;
  data: { name: string; value: number; fill: string }[];
}

export type ContentType = 'poem' | 'meditation' | 'quote' | 'insight';

export interface ContentData {
  id: string;
  type: ContentType;
  title: string;
  body: string;
  author: string; // Could be AI Persona name or a famous author
  tags: string[];
  createdAt: Date;
  groundingLinks?: { title: string; url: string }[];
}

export interface TimelineEntry {
  id: string;
  date: Date;
  type: 'day' | 'night';
  emotion: EmotionType;
  intensity?: number; // 1-10
  summary: string; // Short summary of the chat or diary
  detail: string;  // Full chat log or letter content
  nuanceTags?: string[]; // e.g., ['#설레는', '#뿌듯한'] - detailed emotional nuances
}

export interface MicroAction {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g. "3 min"
  type: 'breathing' | 'journaling' | 'exercise' | 'mindfulness';
}

export interface TherapyTool {
  id: string;
  title: string;
  description: string;
  // Fix: React namespace error
  icon: React.ReactNode;
  duration: string;
  category: 'CBT' | 'Mindfulness' | 'Breathwork' | 'Somatic';
}

/**
 * MBTI 타입 정의 (16가지)
 */
export type MBTIType =
  | 'ENFP' | 'ENFJ' | 'ENTP' | 'ENTJ'
  | 'INFP' | 'INFJ' | 'INTP' | 'INTJ'
  | 'ESFP' | 'ESFJ' | 'ESTP' | 'ESTJ'
  | 'ISFP' | 'ISFJ' | 'ISTP' | 'ISTJ';

/**
 * CoachPersona 확장 버전 (PRD 명세 완전 구현, Phase 1용)
 *
 * PRD 참조: 라인 6306-6349
 */
export interface CoachPersonaExtended {
  id: string;
  userId: string;
  name: string;
  mbtiType: MBTIType;
  personality: {
    warmth: number;      // 0-100 (논리적 <-> 감정적)
    directness: number;  // 0-100 (간접적 <-> 직접적)
    humor: number;       // 0-100 (진지함 <-> 유머러스)
    expertise: number;   // 0-100 (친근함 <-> 전문성)
  };
  speechStyle: 'formal' | 'informal';
  relationship: 'friend' | 'mentor' | 'counselor';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CoachPersona → CoachPersonaExtended 변환 유틸리티
 *
 * 기존 간소화 버전을 확장 버전으로 변환
 * 기본값으로 누락 필드 채움
 */
export function toExtendedPersona(
  basic: CoachPersona,
  userId: string
): CoachPersonaExtended {
  return {
    id: `persona_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    userId,
    name: basic.name,
    mbtiType: basic.mbti as MBTIType,
    personality: {
      warmth: basic.traits.warmth,
      directness: basic.traits.directness,
      humor: 50,       // 기본값: 중간
      expertise: 50,   // 기본값: 중간
    },
    speechStyle: 'informal', // 기본값: 반말
    relationship: basic.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * CoachPersonaExtended → CoachPersona 변환 유틸리티
 *
 * 확장 버전을 간소화 버전으로 변환 (하위 호환)
 */
export function toBasicPersona(extended: CoachPersonaExtended): CoachPersona {
  return {
    name: extended.name,
    role: extended.relationship,
    mbti: extended.mbtiType,
    traits: {
      warmth: extended.personality.warmth,
      directness: extended.personality.directness,
    },
  };
}