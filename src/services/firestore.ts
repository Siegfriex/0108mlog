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
  query,
  where,
  orderBy,
  limit,
  getDocs,
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
import { EmotionType, CoachPersona } from '../../types';
import { getDoc, updateDoc } from 'firebase/firestore';
import { canSaveConversation } from './consent';

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
): Promise<string | null> {
  try {
    // 동의 확인: 동의 없으면 원문 저장 건너뛰기
    const hasConsent = await canSaveConversation();
    if (!hasConsent) {
      console.log('Conversation storage consent not granted. Skipping diary content storage.');
      return null;
    }

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

/**
 * 오늘의 Day Mode 체크인 요약 가져오기
 * 
 * @returns {Promise<string | null>} 오늘의 Day Mode 요약 또는 null
 */
export async function getTodayDayModeSummary(): Promise<string | null> {
  try {
    const userId = getCurrentUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = Timestamp.fromDate(today);
    const todayEnd = Timestamp.fromDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));

    const emotionsRef = collection(db, FIRESTORE_COLLECTIONS.EMOTIONS);
    const q = query(
      emotionsRef,
      where('userId', '==', userId),
      where('modeAtTime', '==', 'day'),
      where('timestamp', '>=', todayStart),
      where('timestamp', '<', todayEnd),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const latestEntry = querySnapshot.docs[0].data() as FirestoreEmotionData;
      
      // 대화가 있으면 대화 요약 생성, 없으면 감정/태그 기반 요약
      if (latestEntry.conversationId) {
        const conversationsRef = collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS);
        const conversationDoc = await getDoc(doc(conversationsRef, latestEntry.conversationId));
        
        if (conversationDoc.exists()) {
          const conversation = conversationDoc.data() as FirestoreConversation;
          // 대화 제목이나 첫 메시지 요약 반환
          return conversation.title || `오늘 ${latestEntry.emotion} 감정을 느꼈어요.`;
        }
      }
      
      // 태그 기반 요약 생성
      if (latestEntry.contextTags && latestEntry.contextTags.length > 0) {
        return `오늘 ${latestEntry.contextTags.join(', ')} 상황에서 ${latestEntry.emotion} 감정을 느꼈어요.`;
      }
      
      // 기본 요약
      return `오늘 ${latestEntry.emotion} 감정을 느꼈어요.`;
    }

    return null;
  } catch (error) {
    console.error('Error getting today day mode summary:', error);
    return null;
  }
}

/**
 * 온보딩 데이터 저장
 * 
 * @param onboardingData 온보딩 데이터
 * @param retries 재시도 횟수 (기본값: 3)
 * @returns {Promise<void>}
 */
export async function saveOnboardingData(
  onboardingData: {
    notificationPermission: 'granted' | 'denied' | 'default';
    locationPermission: 'granted' | 'denied' | 'default';
    initialEmotionState?: number;
    neededHelp?: string[];
    checkinGoal?: string;
    selectedGoal?: string;
    notificationTime?: string;
    notificationFrequency?: 'daily' | 'twice' | 'weekly';
  },
  retries: number = 3
): Promise<void> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const userId = getCurrentUserId();
      const userProfileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
      
      // 기존 프로필 확인
      const userProfileSnap = await getDoc(userProfileRef);
      
      const updateData: Partial<FirestoreUserProfile> = {
        updatedAt: serverTimestamp() as Timestamp,
        onboardingCompleted: true,
        preferences: {
          ...(userProfileSnap.exists() ? userProfileSnap.data().preferences : {}),
          reminderEnabled: onboardingData.notificationPermission === 'granted',
          reminderTime: onboardingData.notificationTime || '09:00',
          reminderFrequency: onboardingData.notificationFrequency === 'twice' 
            ? 'twice' 
            : onboardingData.notificationFrequency === 'weekly' 
            ? 'none' 
            : 'daily',
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
          onboardingCompleted: true,
          ...updateData,
        });
      }

      // 온보딩 데이터를 로컬 스토리지에도 저장 (백업)
      localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
      
      return; // 성공 시 함수 종료
    } catch (error) {
      lastError = error as Error;
      console.error(`Error saving onboarding data (attempt ${attempt + 1}/${retries}):`, error);
      
      // 마지막 시도가 아니면 지수 백오프 대기
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1초, 2초, 4초...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 모든 재시도 실패 시 에러 throw
  throw new Error(`Failed to save onboarding data after ${retries} attempts: ${lastError?.message}`);
}

/**
 * 최근 감정 기록 가져오기 (패턴 감지용)
 * 
 * @param days 가져올 일수 (기본값: 7일)
 * @returns {Promise<Array<{emotion: EmotionType; intensity: number; timestamp: Date}>>} 감정 기록 배열
 */
export async function getRecentEmotionEntries(
  days: number = 7
): Promise<Array<{ emotion: EmotionType; intensity: number; timestamp: Date }>> {
  try {
    const userId = getCurrentUserId();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

    const emotionsRef = collection(db, FIRESTORE_COLLECTIONS.EMOTIONS);
    const q = query(
      emotionsRef,
      where('userId', '==', userId),
      where('timestamp', '>=', cutoffTimestamp),
      orderBy('timestamp', 'desc'),
      limit(30) // 최대 30개
    );

    const querySnapshot = await getDocs(q);
    const entries: Array<{ emotion: EmotionType; intensity: number; timestamp: Date }> = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreEmotionData;
      entries.push({
        emotion: data.emotion,
        intensity: data.intensity,
        timestamp: (data.timestamp as Timestamp).toDate(),
      });
    });

    return entries;
  } catch (error) {
    console.error('Error getting recent emotion entries:', error);
    return [];
  }
}
