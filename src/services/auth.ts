/**
 * Firebase Auth 서비스
 * 
 * Anonymous Auth 자동 부트스트랩 및 인증 상태 관리
 */

import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logError } from '../utils/error';

/**
 * P0 수정: 경쟁조건 방지를 위한 Promise 락
 * 동시에 여러 곳에서 ensureAnonymousAuth() 호출 시 단일 인증만 수행
 */
let authPromise: Promise<User> | null = null;

/**
 * Anonymous Auth 자동 부트스트랩
 *
 * 앱 시작 시 자동으로 익명 인증을 수행하여 Firestore 쓰기 전제 조건을 충족합니다.
 * 이미 인증된 사용자가 있으면 재인증하지 않습니다.
 * P0 수정: 경쟁조건 방지 - 동시 호출 시 단일 인증만 수행
 *
 * @returns {Promise<User>} 인증된 사용자 객체
 * @throws {Error} 인증 실패 시
 */
export async function ensureAnonymousAuth(): Promise<User> {
  // 이미 인증된 사용자가 있으면 반환
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // P0 수정: 이미 인증 진행 중이면 해당 Promise 반환 (경쟁조건 방지)
  if (authPromise) {
    return authPromise;
  }

  // 새 인증 시작
  authPromise = (async () => {
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
    } finally {
      // P0 수정: 완료 후 락 해제 (성공/실패 모두)
      authPromise = null;
    }
  })();

  return authPromise;
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
