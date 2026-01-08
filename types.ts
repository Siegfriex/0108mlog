export enum EmotionType {
  JOY = 'joy',
  PEACE = 'peace',
  ANXIETY = 'anxiety',
  SADNESS = 'sadness',
  ANGER = 'anger'
}

export interface EmotionData {
  id: string;
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
}

export interface MicroAction {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g. "3 min"
  type: 'breathing' | 'journaling' | 'exercise' | 'mindfulness';
}