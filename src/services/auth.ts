/**
 * Firebase Auth 서비스
 * 
 * Anonymous Auth 자동 부트스트랩 및 인증 상태 관리
 */

import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logError } from '../utils/error';

/**
 * Anonymous Auth 자동 부트스트랩
 * 
 * 앱 시작 시 자동으로 익명 인증을 수행하여 Firestore 쓰기 전제 조건을 충족합니다.
 * 이미 인증된 사용자가 있으면 재인증하지 않습니다.
 * 
 * @returns {Promise<User>} 인증된 사용자 객체
 * @throws {Error} 인증 실패 시
 */
export async function ensureAnonymousAuth(): Promise<User> {
  // 이미 인증된 사용자가 있으면 반환
  if (auth.currentUser) {
    return auth.currentUser;
  }

  try {
    // 익명 인증 수행
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error: unknown) {
    logError('ensureAnonymousAuth', error);
    
    // 네트워크 오류 등 재시도 가능한 오류 처리
    const errorCode = (error && typeof error === 'object' && 'code' in error) 
      ? String(error.code) 
      : '';
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorCode === 'auth/network-request-failed' || 
        errorCode === 'auth/internal-error' ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ERR_CONNECTION_REFUSED')) {
      // 재시도 로직 (최대 3회)
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 지수 백오프
        try {
          const userCredential = await signInAnonymously(auth);
          return userCredential.user;
        } catch (retryError) {
          if (i === 2) {
            throw new Error('익명 인증에 실패했습니다. 네트워크 연결을 확인해주세요.');
          }
        }
      }
    }
    
    throw new Error('익명 인증에 실패했습니다.');
  }
}

/**
 * 인증 상태 변경 리스너
 * 
 * @param callback 인증 상태 변경 시 호출될 콜백 함수
 * @returns {() => void} 리스너 해제 함수
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * 현재 인증된 사용자 가져오기
 * 
 * @returns {User | null} 현재 인증된 사용자 또는 null
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
