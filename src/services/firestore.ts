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
  deleteDoc,
  writeBatch,
  getDoc,
  updateDoc,
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
  FirestoreTimelineEntry,
  FirestoreContentData,
  FirestoreGamificationData,
  XP_REWARDS,
  LEVEL_THRESHOLDS,
} from '../types/firestore';
import { EmotionType, CoachPersona } from '../../types';
import { canSaveConversation } from './consent';
import { logError } from '../utils/error';

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
    const hasConsent = await canSaveConversation();

    // 대화 문서 참조 생성
    const conversationRef = doc(collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS));

    if (!hasConsent) {
      // 동의 없음: 메시지 원문 저장 스킵, 메타데이터만 저장
      const redactedConversation = {
        userId,
        title: conversationData.title,
        createdAt: now as Timestamp,
        updatedAt: now as Timestamp,
        messageCount: conversationData.messages.length,
        modeAtTime: conversationData.modeAtTime,
        isRedacted: true,
        ...(conversationData.emotion !== undefined && { emotion: conversationData.emotion }),
        ...(conversationData.intensity !== undefined && { intensity: conversationData.intensity }),
        ...(conversationData.contextTags !== undefined && { contextTags: conversationData.contextTags }),
      };

      await setDoc(conversationRef, redactedConversation);
      return conversationRef.id;
    }

    // 동의 있음: 기존 로직 - 대화 + 메시지 모두 저장
    const conversation: Omit<FirestoreConversation, 'id'> = {
      userId,
      title: conversationData.title,
      createdAt: now as Timestamp,
      updatedAt: now as Timestamp,
      messageCount: conversationData.messages.length,
      modeAtTime: conversationData.modeAtTime,
      ...(conversationData.emotion !== undefined && { emotion: conversationData.emotion }),
      ...(conversationData.intensity !== undefined && { intensity: conversationData.intensity }),
      ...(conversationData.contextTags !== undefined && { contextTags: conversationData.contextTags }),
    };

    // Batch write로 대화와 메시지를 원자적으로 저장 (P0 수정: 부분 저장 방지)
    const batch = writeBatch(db);
    batch.set(conversationRef, conversation);

    // 메시지들 배치로 추가
    const messagesCollection = collection(db, FIRESTORE_COLLECTIONS.MESSAGES);
    conversationData.messages.forEach((message) => {
      const messageRef = doc(messagesCollection);
      batch.set(messageRef, {
        userId,
        conversationId: conversationRef.id,
        role: message.role,
        content: message.content,
        timestamp: serverTimestamp(),
      });
    });

    // 원자적 커밋 - 전체 성공 또는 전체 실패
    await batch.commit();

    return conversationRef.id;
  } catch (error) {
    logError('saveConversation', error);
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
    conversationTitle?: string; // P0 수정: N+1 쿼리 제거용
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
      ...(emotionData.contextTags !== undefined && { contextTags: emotionData.contextTags }),
      ...(emotionData.conversationId !== undefined && { conversationId: emotionData.conversationId }),
      ...(emotionData.conversationTitle !== undefined && { conversationTitle: emotionData.conversationTitle }), // P0 수정
      ...(emotionData.location !== undefined && { location: emotionData.location }),
    };

    const docRef = await addDoc(
      collection(db, FIRESTORE_COLLECTIONS.EMOTIONS),
      entry
    );

    return docRef.id;
  } catch (error) {
    logError('saveEmotionEntry', error);
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
      // 동의 없음: 일기 원문 저장 건너뛰기 (의도된 동작)
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
    logError('saveDiaryEntry', error);
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
    logError('saveMicroActionLog', error);
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
  dayModeStartTime?: string; // HH:mm 형식
  nightModeStartTime?: string; // HH:mm 형식
  predictiveNudgeEnabled?: boolean;
  snoozeUntil?: Date;
  persona?: CoachPersona;
}): Promise<void> {
  try {
    const userId = getCurrentUserId();
    const userProfileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);

    // 기존 프로필 확인
    const userProfileSnap = await getDoc(userProfileRef);

    // P1 수정: 깊은 병합 - undefined가 아닌 값만 덮어씀 (기존 값 보존)
    const existingPreferences = userProfileSnap.exists()
      ? userProfileSnap.data().preferences || {}
      : {};

    // undefined가 아닌 설정값만 새 객체에 포함
    const newPreferences: Record<string, unknown> = { ...existingPreferences };

    // 각 설정값이 명시적으로 제공된 경우에만 업데이트
    if (settings.reminderEnabled !== undefined) {
      newPreferences.reminderEnabled = settings.reminderEnabled;
    } else if (newPreferences.reminderEnabled === undefined) {
      newPreferences.reminderEnabled = true; // 기본값
    }

    if (settings.reminderTime !== undefined) {
      newPreferences.reminderTime = settings.reminderTime;
    } else if (newPreferences.reminderTime === undefined) {
      newPreferences.reminderTime = '09:00'; // 기본값
    }

    if (settings.language !== undefined) {
      newPreferences.language = settings.language;
    } else if (newPreferences.language === undefined) {
      newPreferences.language = 'ko'; // 기본값
    }

    if (settings.reminderFrequency !== undefined) {
      newPreferences.reminderFrequency = settings.reminderFrequency;
    }

    if (settings.autoDayNightMode !== undefined) {
      newPreferences.autoDayNightMode = settings.autoDayNightMode;
    }

    if (settings.dayModeStartTime !== undefined) {
      newPreferences.dayModeStartTime = settings.dayModeStartTime;
    }

    if (settings.nightModeStartTime !== undefined) {
      newPreferences.nightModeStartTime = settings.nightModeStartTime;
    }

    if (settings.predictiveNudgeEnabled !== undefined) {
      newPreferences.predictiveNudgeEnabled = settings.predictiveNudgeEnabled;
    }

    if (settings.snoozeUntil !== undefined) {
      newPreferences.snoozeUntil = Timestamp.fromDate(settings.snoozeUntil);
    }

    const updateData: Partial<FirestoreUserProfile> = {
      updatedAt: serverTimestamp() as Timestamp,
      ...(settings.persona && { persona: settings.persona }),
      preferences: newPreferences as FirestoreUserProfile['preferences'],
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
    logError('saveUserSettings', error);
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
    logError('getUserSettings', error);
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

      // P0 수정: N+1 쿼리 제거 - conversationTitle이 있으면 바로 사용 (추가 쿼리 불필요)
      if (latestEntry.conversationTitle) {
        return latestEntry.conversationTitle;
      }

      // 대화가 있지만 conversationTitle이 없는 경우 (기존 데이터 호환성)
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
    logError('getTodayDayModeSummary', error);
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
      logError(`saveOnboardingData (attempt ${attempt + 1}/${retries})`, error);
      
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
    logError('getRecentEmotionEntries', error);
    return [];
  }
}

/**
 * 대화 삭제
 * 
 * @param conversationId 삭제할 대화 ID
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const userId = getCurrentUserId();
    
    // 대화 문서 확인 및 소유권 검증
    const conversationRef = doc(db, FIRESTORE_COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationSnap.data() as FirestoreConversation;
    if (conversationData.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own conversations');
    }
    
    // 배치로 대화와 관련 메시지 모두 삭제
    const batch = writeBatch(db);
    
    // 대화 삭제
    batch.delete(conversationRef);
    
    // 관련 메시지 삭제
    const messagesRef = collection(db, FIRESTORE_COLLECTIONS.MESSAGES);
    const messagesQuery = query(
      messagesRef,
      where('conversationId', '==', conversationId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    
    messagesSnapshot.forEach((messageDoc) => {
      batch.delete(messageDoc.ref);
    });

    // 관련 타임라인 엔트리도 삭제
    const timelineRef = collection(db, FIRESTORE_COLLECTIONS.TIMELINE);
    const timelineQuery = query(
      timelineRef,
      where('conversationId', '==', conversationId)
    );
    const timelineSnapshot = await getDocs(timelineQuery);

    timelineSnapshot.forEach((timelineDoc) => {
      batch.delete(timelineDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    logError('deleteConversation', error);
    throw error;
  }
}

/**
 * 모든 대화 삭제
 * 
 * @returns {Promise<void>}
 */
export async function deleteAllConversations(): Promise<void> {
  try {
    const userId = getCurrentUserId();

    // 사용자의 모든 대화 조회
    const conversationsRef = collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS);
    const conversationsQuery = query(
      conversationsRef,
      where('userId', '==', userId)
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);

    // 배치로 모든 대화와 관련 메시지 삭제
    const batch = writeBatch(db);
    const conversationIds: string[] = [];

    conversationsSnapshot.forEach((conversationDoc) => {
      batch.delete(conversationDoc.ref);
      conversationIds.push(conversationDoc.id);
    });

    // P1 수정: 루프 쿼리 대신 청크 기반 'in' 쿼리로 최적화
    // Firestore 'in' 연산자는 최대 10개까지만 지원
    const messagesRef = collection(db, FIRESTORE_COLLECTIONS.MESSAGES);

    if (conversationIds.length > 0) {
      // 10개씩 청크로 분할하여 처리
      const chunkSize = 10;
      for (let i = 0; i < conversationIds.length; i += chunkSize) {
        const chunk = conversationIds.slice(i, i + chunkSize);
        const messagesQuery = query(
          messagesRef,
          where('conversationId', 'in', chunk)
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        messagesSnapshot.forEach((messageDoc) => {
          batch.delete(messageDoc.ref);
        });
      }
    }

    await batch.commit();
  } catch (error) {
    logError('deleteAllConversations', error);
    throw error;
  }
}

/**
 * 대화 검색
 * 
 * @param searchQuery 검색어
 * @param options 검색 옵션
 * @returns {Promise<FirestoreConversation[]>} 검색 결과
 */
export async function searchConversations(
  searchQuery: string,
  options?: {
    userId?: string;
    limit?: number;
  }
): Promise<FirestoreConversation[]> {
  try {
    const userId = options?.userId || getCurrentUserId();
    const limitCount = options?.limit || 50;
    
    // Firestore는 전체 텍스트 검색을 지원하지 않으므로,
    // 제목으로만 검색 (실제 구현 시 Algolia 등 외부 검색 서비스 고려)
    const conversationsRef = collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS);
    const conversationsQuery = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(conversationsQuery);
    const results: FirestoreConversation[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<FirestoreConversation, 'id'>;
      // 클라이언트 사이드 필터링 (제목에 검색어 포함)
      if (data.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({
          id: doc.id,
          ...data,
        });
      }
    });
    
    return results;
  } catch (error) {
    logError('searchConversations', error);
    return [];
  }
}

/**
 * 사용자 페르소나 업데이트
 * 
 * @param persona 업데이트할 페르소나
 * @returns {Promise<void>}
 */
export async function updateUserPersona(persona: CoachPersona): Promise<void> {
  try {
    await saveUserSettings({ persona });
  } catch (error) {
    logError('updateUserPersona', error);
    throw error;
  }
}

/**
 * 모든 사용자 데이터 삭제
 * 
 * @returns {Promise<void>}
 */
export async function deleteAllUserData(): Promise<void> {
  try {
    const userId = getCurrentUserId();
    
    // 배치로 모든 데이터 삭제
    const batch = writeBatch(db);
    
    // 대화 및 메시지 삭제
    await deleteAllConversations();
    
    // 감정 데이터 삭제
    const emotionsRef = collection(db, FIRESTORE_COLLECTIONS.EMOTIONS);
    const emotionsQuery = query(
      emotionsRef,
      where('userId', '==', userId)
    );
    const emotionsSnapshot = await getDocs(emotionsQuery);
    emotionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 일기 데이터 삭제
    const diariesRef = collection(db, FIRESTORE_COLLECTIONS.DIARIES);
    const diariesQuery = query(
      diariesRef,
      where('userId', '==', userId)
    );
    const diariesSnapshot = await getDocs(diariesQuery);
    diariesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 마이크로 액션 로그 삭제
    const actionLogsRef = collection(db, FIRESTORE_COLLECTIONS.MICRO_ACTION_LOGS);
    const actionLogsQuery = query(
      actionLogsRef,
      where('userId', '==', userId)
    );
    const actionLogsSnapshot = await getDocs(actionLogsQuery);
    actionLogsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 프로필 삭제 (선택적 - 사용자 계정은 유지)
    // const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
    // batch.delete(profileRef);
    
    await batch.commit();
  } catch (error) {
    logError('deleteAllUserData', error);
    throw error;
  }
}

/**
 * 타임라인 엔트리 생성/업데이트
 *
 * @param entry 타임라인 엔트리 데이터
 * @param entryId 기존 엔트리 ID (업데이트 시)
 * @returns {Promise<string>} 생성/업데이트된 엔트리 ID
 */
export async function upsertTimelineEntry(
  entry: {
    date: Date;
    type: 'day' | 'night';
    emotion: EmotionType;
    intensity?: number;
    summary?: string;
    detail?: string;
    nuanceTags?: string[];
    conversationId?: string;
    isRedacted?: boolean;
  },
  entryId?: string
): Promise<string> {
  try {
    const userId = getCurrentUserId();

    const timelineData: Omit<FirestoreTimelineEntry, 'id'> = {
      userId,
      date: Timestamp.fromDate(entry.date),
      type: entry.type,
      emotion: entry.emotion,
      intensity: entry.intensity ?? 5,
      summary: entry.summary ?? '',
      detail: entry.detail ?? '',
      nuanceTags: entry.nuanceTags ?? [],
      ...(entry.conversationId && { conversationId: entry.conversationId }),
    };

    if (entryId) {
      // 기존 엔트리 업데이트
      const entryRef = doc(db, FIRESTORE_COLLECTIONS.TIMELINE, entryId);
      await setDoc(entryRef, timelineData, { merge: true });
      return entryId;
    } else {
      // 새 엔트리 생성
      const timelineRef = collection(db, FIRESTORE_COLLECTIONS.TIMELINE);
      const docRef = await addDoc(timelineRef, timelineData);
      return docRef.id;
    }
  } catch (error) {
    logError('upsertTimelineEntry', error);
    throw error;
  }
}

/**
 * 타임라인 엔트리 삭제
 *
 * @param entryId 삭제할 타임라인 엔트리 ID
 * @returns {Promise<void>}
 */
export async function deleteTimelineEntryById(entryId: string): Promise<void> {
  try {
    const userId = getCurrentUserId();
    const entryRef = doc(db, FIRESTORE_COLLECTIONS.TIMELINE, entryId);

    // 소유권 확인
    const entrySnap = await getDoc(entryRef);
    if (!entrySnap.exists()) {
      return; // 이미 삭제됨
    }

    const entryData = entrySnap.data();
    if (entryData.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own timeline entries');
    }

    await deleteDoc(entryRef);
  } catch (error) {
    logError('deleteTimelineEntryById', error);
    throw error;
  }
}

/**
 * conversationId로 타임라인 엔트리 찾기 및 삭제
 *
 * @param conversationId 대화 ID
 * @returns {Promise<void>}
 */
export async function deleteTimelineEntryByConversationId(conversationId: string): Promise<void> {
  try {
    const userId = getCurrentUserId();

    const timelineRef = collection(db, FIRESTORE_COLLECTIONS.TIMELINE);
    const q = query(
      timelineRef,
      where('userId', '==', userId),
      where('conversationId', '==', conversationId)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    if (!snapshot.empty) {
      await batch.commit();
    }
  } catch (error) {
    logError('deleteTimelineEntryByConversationId', error);
    // 타임라인 삭제 실패는 무시 (대화 삭제는 성공해야 함)
  }
}

/**
 * 콘텐츠 Firestore 저장
 *
 * @param content 콘텐츠 데이터
 * @returns {Promise<string>} 생성된 콘텐츠 ID
 */
export async function saveContentToFirestore(
  content: {
    type: 'poem' | 'meditation' | 'quote' | 'insight';
    title: string;
    body: string;
    author: string;
    tags: string[];
    groundingLinks?: Array<{ title: string; url: string }>;
  }
): Promise<string> {
  try {
    const userId = getCurrentUserId();

    const contentData: Omit<FirestoreContentData, 'id'> = {
      userId,
      type: content.type,
      title: content.title,
      body: content.body,
      author: content.author,
      tags: content.tags,
      createdAt: serverTimestamp() as Timestamp,
      ...(content.groundingLinks && { groundingLinks: content.groundingLinks }),
    };

    const contentsRef = collection(db, FIRESTORE_COLLECTIONS.CONTENTS);
    const docRef = await addDoc(contentsRef, contentData);
    return docRef.id;
  } catch (error) {
    logError('saveContentToFirestore', error);
    throw error;
  }
}

/**
 * 사용자 콘텐츠 조회
 *
 * @param limitCount 조회할 최대 개수
 * @returns {Promise<FirestoreContentData[]>}
 */
export async function getUserContents(limitCount: number = 50): Promise<FirestoreContentData[]> {
  try {
    const userId = getCurrentUserId();

    const contentsRef = collection(db, FIRESTORE_COLLECTIONS.CONTENTS);
    const q = query(
      contentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const contents: FirestoreContentData[] = [];

    snapshot.forEach((doc) => {
      contents.push({
        id: doc.id,
        ...doc.data(),
      } as FirestoreContentData);
    });

    return contents;
  } catch (error) {
    logError('getUserContents', error);
    return [];
  }
}

/**
 * 사용자 데이터 내보내기 (Blob 버전)
 *
 * @returns {Promise<Blob>} JSON 데이터 Blob
 */
export async function exportUserData(): Promise<Blob> {
  try {
    const userId = getCurrentUserId();

    // 모든 사용자 데이터 수집
    const data: {
      conversations: FirestoreConversation[];
      emotions: FirestoreEmotionData[];
      diaries: FirestoreDiaryData[];
      profile: FirestoreUserProfile | null;
    } = {
      conversations: [],
      emotions: [],
      diaries: [],
      profile: null,
    };

    // 대화 데이터
    const conversationsRef = collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS);
    const conversationsQuery = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    conversationsSnapshot.forEach((doc) => {
      data.conversations.push({
        id: doc.id,
        ...doc.data(),
      } as FirestoreConversation);
    });

    // 감정 데이터
    const emotionsRef = collection(db, FIRESTORE_COLLECTIONS.EMOTIONS);
    const emotionsQuery = query(
      emotionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const emotionsSnapshot = await getDocs(emotionsQuery);
    emotionsSnapshot.forEach((doc) => {
      data.emotions.push(doc.data() as FirestoreEmotionData);
    });

    // 일기 데이터
    const diariesRef = collection(db, FIRESTORE_COLLECTIONS.DIARIES);
    const diariesQuery = query(
      diariesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const diariesSnapshot = await getDocs(diariesQuery);
    diariesSnapshot.forEach((doc) => {
      data.diaries.push(doc.data() as FirestoreDiaryData);
    });

    // 프로필 데이터
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      data.profile = {
        userId,
        ...profileSnap.data(),
      } as FirestoreUserProfile;
    }

    // JSON으로 변환하여 Blob 생성
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  } catch (error) {
    logError('exportUserData', error);
    throw error;
  }
}

/**
 * 사용자 전체 데이터 내보내기 (GDPR 준수)
 *
 * 사용자의 모든 데이터를 JSON 형식으로 수집하여 반환
 * (타임라인, 콘텐츠, 액션 로그 포함)
 *
 * @returns {Promise<object>} 사용자 데이터 객체
 */
export async function exportAllUserData(): Promise<{
  exportedAt: string;
  profile: object | null;
  conversations: object[];
  emotions: object[];
  diaries: object[];
  timeline: object[];
  contents: object[];
  actionLogs: object[];
}> {
  try {
    const userId = getCurrentUserId();
    const exportData: {
      exportedAt: string;
      profile: object | null;
      conversations: object[];
      emotions: object[];
      diaries: object[];
      timeline: object[];
      contents: object[];
      actionLogs: object[];
    } = {
      exportedAt: new Date().toISOString(),
      profile: null,
      conversations: [],
      emotions: [],
      diaries: [],
      timeline: [],
      contents: [],
      actionLogs: [],
    };

    // 프로필 데이터
    try {
      const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        exportData.profile = { id: profileSnap.id, ...profileSnap.data() };
      }
    } catch (err) {
      console.warn('프로필 내보내기 실패:', err);
    }

    // 대화 데이터
    try {
      const conversationsRef = collection(db, FIRESTORE_COLLECTIONS.CONVERSATIONS);
      const conversationsQuery = query(
        conversationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      conversationsSnapshot.forEach((doc) => {
        exportData.conversations.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn('대화 내보내기 실패:', err);
    }

    // 감정 데이터
    try {
      const emotionsRef = collection(db, FIRESTORE_COLLECTIONS.EMOTIONS);
      const emotionsQuery = query(
        emotionsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const emotionsSnapshot = await getDocs(emotionsQuery);
      emotionsSnapshot.forEach((doc) => {
        exportData.emotions.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn('감정 데이터 내보내기 실패:', err);
    }

    // 일기 데이터
    try {
      const diariesRef = collection(db, FIRESTORE_COLLECTIONS.DIARIES);
      const diariesQuery = query(
        diariesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const diariesSnapshot = await getDocs(diariesQuery);
      diariesSnapshot.forEach((doc) => {
        exportData.diaries.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn('일기 내보내기 실패:', err);
    }

    // 타임라인 데이터
    try {
      const timelineRef = collection(db, FIRESTORE_COLLECTIONS.TIMELINE);
      const timelineQuery = query(
        timelineRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const timelineSnapshot = await getDocs(timelineQuery);
      timelineSnapshot.forEach((doc) => {
        exportData.timeline.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn('타임라인 내보내기 실패:', err);
    }

    // 콘텐츠 데이터
    try {
      const contentsRef = collection(db, FIRESTORE_COLLECTIONS.CONTENTS);
      const contentsQuery = query(
        contentsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const contentsSnapshot = await getDocs(contentsQuery);
      contentsSnapshot.forEach((doc) => {
        exportData.contents.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn('콘텐츠 내보내기 실패:', err);
    }

    // 마이크로 액션 로그
    try {
      const actionLogsRef = collection(db, FIRESTORE_COLLECTIONS.MICRO_ACTION_LOGS);
      const actionLogsQuery = query(
        actionLogsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const actionLogsSnapshot = await getDocs(actionLogsQuery);
      actionLogsSnapshot.forEach((doc) => {
        exportData.actionLogs.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn('액션 로그 내보내기 실패:', err);
    }

    return exportData;
  } catch (error) {
    logError('exportAllUserData', error);
    throw error;
  }
}

// ============================================================================
// 게이미피케이션 기능 (FEAT-004)
// ============================================================================

/**
 * XP로부터 레벨 계산
 * @param xp 현재 XP
 * @returns 레벨 번호 (1-10)
 */
export function calculateLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * 다음 레벨까지 필요한 XP 계산
 * @param currentXP 현재 XP
 * @returns { current: 현재 레벨 내 XP, required: 다음 레벨까지 필요한 총 XP, percent: 진행률 }
 */
export function getXPProgress(currentXP: number): {
  current: number;
  required: number;
  percent: number;
} {
  const level = calculateLevelFromXP(currentXP);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const current = currentXP - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percent = Math.min(100, (current / required) * 100);

  return { current, required, percent };
}

/**
 * 사용자 게이미피케이션 데이터 가져오기
 * @returns {Promise<FirestoreGamificationData | null>}
 */
export async function getGamificationData(): Promise<FirestoreGamificationData | null> {
  try {
    const userId = getCurrentUserId();
    const gamificationRef = doc(db, FIRESTORE_COLLECTIONS.GAMIFICATION, userId);
    const gamificationSnap = await getDoc(gamificationRef);

    if (!gamificationSnap.exists()) {
      return null;
    }

    return {
      id: gamificationSnap.id,
      ...gamificationSnap.data(),
    } as FirestoreGamificationData;
  } catch (error) {
    logError('getGamificationData', error);
    return null;
  }
}

/**
 * 게이미피케이션 데이터 초기화 (신규 사용자)
 * @returns {Promise<FirestoreGamificationData>}
 */
export async function initializeGamification(): Promise<FirestoreGamificationData> {
  try {
    const userId = getCurrentUserId();
    const now = serverTimestamp();

    const initialData: Omit<FirestoreGamificationData, 'id'> = {
      userId,
      xp: 0,
      level: 1,
      blossomCount: 0,
      totalCheckIns: 0,
      totalDiaries: 0,
      totalMicroActions: 0,
      createdAt: now as Timestamp,
      updatedAt: now as Timestamp,
    };

    const gamificationRef = doc(db, FIRESTORE_COLLECTIONS.GAMIFICATION, userId);
    await setDoc(gamificationRef, initialData);

    return {
      id: userId,
      ...initialData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  } catch (error) {
    logError('initializeGamification', error);
    throw error;
  }
}

/**
 * XP 추가 및 레벨업 확인
 * @param amount XP 양
 * @param reason XP 획득 사유
 * @returns {Promise<{ newXP: number; newLevel: number; leveledUp: boolean; blossomAdded: boolean }>}
 */
export async function addXP(
  amount: number,
  reason: 'checkin' | 'diary' | 'micro_action' | 'streak_bonus' | 'level_up'
): Promise<{
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  blossomAdded: boolean;
}> {
  try {
    const userId = getCurrentUserId();
    const gamificationRef = doc(db, FIRESTORE_COLLECTIONS.GAMIFICATION, userId);

    // 현재 데이터 가져오기
    let gamificationSnap = await getDoc(gamificationRef);

    // 데이터가 없으면 초기화
    if (!gamificationSnap.exists()) {
      await initializeGamification();
      gamificationSnap = await getDoc(gamificationRef);
    }

    const currentData = gamificationSnap.data() as Omit<FirestoreGamificationData, 'id'>;
    const oldLevel = currentData.level;
    const newXP = currentData.xp + amount;
    const newLevel = calculateLevelFromXP(newXP);
    const leveledUp = newLevel > oldLevel;

    // 벚꽃 추가 조건: 체크인 또는 일기 작성 시
    const blossomAdded = reason === 'checkin' || reason === 'diary';

    // 통계 업데이트
    const updates: Partial<FirestoreGamificationData> = {
      xp: newXP,
      level: newLevel,
      updatedAt: serverTimestamp() as Timestamp,
      lastActivityDate: serverTimestamp() as Timestamp,
    };

    if (blossomAdded) {
      updates.blossomCount = (currentData.blossomCount || 0) + 1;
    }

    // 이유별 카운터 업데이트
    if (reason === 'checkin') {
      updates.totalCheckIns = (currentData.totalCheckIns || 0) + 1;
    } else if (reason === 'diary') {
      updates.totalDiaries = (currentData.totalDiaries || 0) + 1;
    } else if (reason === 'micro_action') {
      updates.totalMicroActions = (currentData.totalMicroActions || 0) + 1;
    }

    await updateDoc(gamificationRef, updates);

    // XP 로그 저장
    const xpLogRef = collection(db, FIRESTORE_COLLECTIONS.XP_LOGS);
    await addDoc(xpLogRef, {
      userId,
      amount,
      reason,
      timestamp: serverTimestamp(),
    });

    return {
      newXP,
      newLevel,
      leveledUp,
      blossomAdded,
    };
  } catch (error) {
    logError('addXP', error);
    throw error;
  }
}

/**
 * 게이미피케이션 데이터 가져오기 또는 초기화
 * @returns {Promise<FirestoreGamificationData>}
 */
export async function getOrInitializeGamification(): Promise<FirestoreGamificationData> {
  const data = await getGamificationData();
  if (data) {
    return data;
  }
  return initializeGamification();
}
