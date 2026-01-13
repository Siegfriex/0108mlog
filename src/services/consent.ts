/**
 * 동의 관리 서비스
 * 
 * 대화/일기 원문 저장 동의 상태 관리
 * Privacy-first 모델: 동의 없어도 감정 수치/태그는 저장 가능
 */

import { collection, doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from './auth';

const CONSENT_VERSION = '1.0';
const CONSENT_STORAGE_KEY = 'consent_conversation_storage';

/**
 * 동의 상태 인터페이스
 */
export interface ConsentState {
  conversationStorage: boolean;
  consentedAt?: Date;
  revokedAt?: Date;
}

/**
 * 로컬 스토리지에서 동의 상태 가져오기
 */
function getConsentFromLocalStorage(): ConsentState | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {
      conversationStorage: parsed.conversationStorage ?? false,
      consentedAt: parsed.consentedAt ? new Date(parsed.consentedAt) : undefined,
      revokedAt: parsed.revokedAt ? new Date(parsed.revokedAt) : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * 로컬 스토리지에 동의 상태 저장
 */
function saveConsentToLocalStorage(state: ConsentState): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      conversationStorage: state.conversationStorage,
      consentedAt: state.consentedAt?.toISOString(),
      revokedAt: state.revokedAt?.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save consent to localStorage:', error);
  }
}

/**
 * 현재 동의 상태 가져오기
 * 
 * @returns {Promise<ConsentState>} 동의 상태
 */
export async function getConsentState(): Promise<ConsentState> {
  const user = getCurrentUser();
  if (!user) {
    // 사용자가 없으면 로컬 스토리지에서만 확인
    return getConsentFromLocalStorage() || { conversationStorage: false };
  }

  try {
    // Firestore에서 동의 상태 확인
    const consentRef = doc(db, 'users', user.uid, 'consentLogs', 'conversation_storage');
    const consentSnap = await getDoc(consentRef);

    if (consentSnap.exists()) {
      const data = consentSnap.data();
      const state: ConsentState = {
        conversationStorage: data.isConsented ?? false,
        consentedAt: data.consentedAt?.toDate(),
        revokedAt: data.revokedAt?.toDate(),
      };
      
      // 로컬 스토리지 동기화
      saveConsentToLocalStorage(state);
      return state;
    }

    // Firestore에 없으면 로컬 스토리지 확인
    const localState = getConsentFromLocalStorage();
    if (localState) {
      return localState;
    }

    return { conversationStorage: false };
  } catch (error) {
    console.error('Error getting consent state:', error);
    // 에러 시 로컬 스토리지에서 확인
    return getConsentFromLocalStorage() || { conversationStorage: false };
  }
}

/**
 * 동의 저장
 * 
 * @param consented 동의 여부
 * @returns {Promise<void>}
 */
export async function saveConsent(consented: boolean): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to save consent');
  }

  const now = new Date();
  const state: ConsentState = {
    conversationStorage: consented,
    consentedAt: consented ? now : undefined,
    revokedAt: consented ? undefined : now,
  };

  try {
    // Firestore에 저장
    const consentRef = doc(db, 'users', user.uid, 'consentLogs', 'conversation_storage');
    await setDoc(consentRef, {
      userId: user.uid,
      consentType: 'conversation_storage',
      version: CONSENT_VERSION,
      isConsented: consented,
      consentedAt: consented ? serverTimestamp() : null,
      revokedAt: consented ? null : serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 로컬 스토리지에도 저장
    saveConsentToLocalStorage(state);
  } catch (error) {
    console.error('Error saving consent:', error);
    // Firestore 저장 실패해도 로컬 스토리지는 저장
    saveConsentToLocalStorage(state);
    throw error;
  }
}

/**
 * 대화/일기 원문 저장 가능 여부 확인
 * 
 * @returns {Promise<boolean>} 저장 가능 여부
 */
export async function canSaveConversation(): Promise<boolean> {
  const state = await getConsentState();
  return state.conversationStorage;
}
