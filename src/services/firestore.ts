/**
 * Firestore 서비스 레이어
 * 
 * Firestore 데이터 쓰기 작업을 담당하는 서비스
 */

import {
  collection,
  addDoc,
  setDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import {
  FIRESTORE_COLLECTIONS,
  FirestoreConversation,
  FirestoreEmotionData,
  FirestoreDiaryData,
  FirestoreMicroActionLog,
  FirestoreUserProfile,
} from '../types/firestore';
import { EmotionType, CoachPersona } from '../../../types';
import { getDoc, updateDoc } from 'firebase/firestore';

/**
 * 현재 사용자 ID 가져오기
 */
function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to save data');
  }
  return user.uid;
}

/**
 * 대화 저장
 * 
 * @param conversationData 대화 데이터
 * @returns {Promise<string>} 생성된 대화 ID
 */
export async function saveConversation(
  conversationData: {
    title: string;
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    emotion?: EmotionType;
    intensity?: number;
    modeAtTime: 'day' | 'night';
    contextTags?: string[];
  }
): Promise<string> {
  try {
    const userId = getCurrentUserId();
    const now = serverTimestamp();

    const conversation: Omit<FirestoreConversation, 'id'> = {
      userId,
      title: conversationData.title,
      createdAt: now as Timestamp,
      updatedAt: now as Timestamp,
      messageCount: conversationData.messages.length,
      emotion: conversationData.emotion,
      intensity: conversationData.intensity,
      modeAtTime: conversationData.modeAtTime,
      contextTags: conversationData.contextTags,
    };

    const docRef = await addDoc(
      collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS),
      conversation
    );

    // 메시지 저장
    const messagesCollection = collection(db, FIRESTORE_COLLECTIONS.MESSAGES);
    for (const message of conversationData.messages) {
      await addDoc(messagesCollection, {
        conversationId: docRef.id,
        role: message.role,
        content: message.content,
        timestamp: serverTimestamp(),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

/**
 * 감정 기록 저장
 * 
 * @param emotionData 감정 데이터
 * @returns {Promise<string>} 생성된 감정 기록 ID
 */
export async function saveEmotionEntry(
  emotionData: {
    emotion: EmotionType;
    intensity: number;
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
): Promise<string> {
  try {
    const userId = getCurrentUserId();

    const entry: Omit<FirestoreEmotionData, 'id'> = {
      userId,
      emotion: emotionData.emotion,
      intensity: emotionData.intensity,
      timestamp: serverTimestamp() as Timestamp,
      modeAtTime: emotionData.modeAtTime,
      contextTags: emotionData.contextTags,
      conversationId: emotionData.conversationId,
      location: emotionData.location,
    };

    const docRef = await addDoc(
      collection(db, FIRESTORE_COLLECTIONS.EMOTIONS),
      entry
    );

    return docRef.id;
  } catch (error) {
    console.error('Error saving emotion entry:', error);
    throw error;
  }
}

/**
 * 일기 저장
 * 
 * @param diaryData 일기 데이터
 * @returns {Promise<string>} 생성된 일기 ID
 */
export async function saveDiaryEntry(
  diaryData: {
    content: string;
    emotion: EmotionType;
    intensity: number;
    dayModeSummary?: string;
    letterContent?: string;
    conversationId?: string;
  }
): Promise<string> {
  try {
    const userId = getCurrentUserId();

    const entry: Omit<FirestoreDiaryData, 'id'> = {
      userId,
      date: serverTimestamp() as Timestamp,
      content: diaryData.content,
      emotion: diaryData.emotion,
      intensity: diaryData.intensity,
      dayModeSummary: diaryData.dayModeSummary,
      letterContent: diaryData.letterContent,
      letterGeneratedAt: diaryData.letterContent ? (serverTimestamp() as Timestamp) : undefined,
      conversationId: diaryData.conversationId,
    };

    const docRef = await addDoc(
      collection(db, FIRESTORE_COLLECTIONS.DIARIES),
      entry
    );

    return docRef.id;
  } catch (error) {
    console.error('Error saving diary entry:', error);
    throw error;
  }
}

/**
 * 마이크로 액션 로그 저장
 * 
 * @param actionLogData 마이크로 액션 로그 데이터
 * @returns {Promise<string>} 생성된 로그 ID
 */
export async function saveMicroActionLog(
  actionLogData: {
    actionId: string;
    actionTitle: string;
    beforeIntensity?: number;
    afterIntensity?: number;
    completed: boolean;
    skipped: boolean;
  }
): Promise<string> {
  try {
    const userId = getCurrentUserId();

    const log: Omit<FirestoreMicroActionLog, 'id'> = {
      userId,
      actionId: actionLogData.actionId,
      actionTitle: actionLogData.actionTitle,
      executedAt: serverTimestamp() as Timestamp,
      beforeIntensity: actionLogData.beforeIntensity,
      afterIntensity: actionLogData.afterIntensity,
      completed: actionLogData.completed,
      skipped: actionLogData.skipped,
    };

    const docRef = await addDoc(
      collection(db, FIRESTORE_COLLECTIONS.MICRO_ACTIONS),
      log
    );

    return docRef.id;
  } catch (error) {
    console.error('Error saving micro action log:', error);
    throw error;
  }
}

/**
 * 사용자 설정 저장/업데이트
 * 
 * @param settings 사용자 설정 데이터
 * @returns {Promise<void>}
 */
export async function saveUserSettings(settings: {
  reminderEnabled?: boolean;
  reminderTime?: string; // HH:mm 형식
  reminderFrequency?: 'daily' | 'twice' | 'none'; // 하루 1회, 하루 2회, 없음
  language?: 'ko' | 'en';
  autoDayNightMode?: boolean;
  predictiveNudgeEnabled?: boolean;
  snoozeUntil?: Date;
}): Promise<void> {
  try {
    const userId = getCurrentUserId();
    const userProfileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);

    // 기존 프로필 확인
    const userProfileSnap = await getDoc(userProfileRef);
    
    const updateData: Partial<FirestoreUserProfile> = {
      updatedAt: serverTimestamp() as Timestamp,
      preferences: {
        ...(userProfileSnap.exists() ? userProfileSnap.data().preferences : {}),
        reminderEnabled: settings.reminderEnabled ?? userProfileSnap.data()?.preferences?.reminderEnabled ?? true,
        reminderTime: settings.reminderTime ?? userProfileSnap.data()?.preferences?.reminderTime ?? '09:00',
        language: settings.language ?? userProfileSnap.data()?.preferences?.language ?? 'ko',
        ...(settings.reminderFrequency && { reminderFrequency: settings.reminderFrequency }),
        ...(settings.autoDayNightMode !== undefined && { autoDayNightMode: settings.autoDayNightMode }),
        ...(settings.predictiveNudgeEnabled !== undefined && { predictiveNudgeEnabled: settings.predictiveNudgeEnabled }),
        ...(settings.snoozeUntil && { snoozeUntil: Timestamp.fromDate(settings.snoozeUntil) }),
      },
    };

    if (userProfileSnap.exists()) {
      await updateDoc(userProfileRef, updateData);
    } else {
      // 프로필이 없으면 생성
      await setDoc(userProfileRef, {
        userId,
        persona: {
          name: 'AI 동반자',
          mbti: 'INFJ',
          tone: 'warm',
          traits: [],
        },
        createdAt: serverTimestamp() as Timestamp,
        onboardingCompleted: false,
        ...updateData,
      });
    }
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
}

/**
 * 사용자 설정 불러오기
 * 
 * @returns {Promise<FirestoreUserProfile['preferences'] | null>} 사용자 설정 또는 null
 */
export async function getUserSettings(): Promise<FirestoreUserProfile['preferences'] | null> {
  try {
    const userId = getCurrentUserId();
    const userProfileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (userProfileSnap.exists()) {
      return userProfileSnap.data().preferences || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
}
