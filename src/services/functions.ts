/**
 * Firebase Functions 클라이언트 서비스
 * 
 * Firebase Callable Functions를 호출하기 위한 헬퍼 함수
 */

import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import app from '../config/firebase';

/**
 * Firebase Functions 인스턴스
 * 리전: asia-northeast3 (서울)
 */
const functionsInstance: Functions = getFunctions(app, 'asia-northeast3');

/**
 * Firebase Callable Function 호출 헬퍼
 * 
 * @template TRequest 요청 데이터 타입
 * @template TResponse 응답 데이터 타입
 * @param functionName 호출할 함수 이름
 * @param data 요청 데이터
 * @returns {Promise<TResponse>} 함수 응답 데이터
 * @throws {Error} 함수 호출 실패 시
 */
export async function callFunction<TRequest, TResponse>(
  functionName: string,
  data: TRequest
): Promise<TResponse> {

  try {
    // Callable Functions는 result.data에 직접 응답을 반환
    // Functions에서 { success: true, data: ... } 형태로 반환하므로
    // result.data가 이미 { success, data, error, fallback } 구조임
    const callable = httpsCallable<TRequest, TResponse>(functionsInstance, functionName);
    const result = await callable(data);
    return result.data as TResponse;
  } catch (error: any) {
    console.error(`Error calling function ${functionName}:`, error);
    
    // Firebase Functions 에러 처리
    if (error.code === 'functions/unauthenticated') {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.code === 'functions/permission-denied') {
      throw new Error('권한이 없습니다.');
    } else if (error.code === 'functions/invalid-argument') {
      throw new Error('잘못된 요청입니다.');
    } else if (error.code === 'functions/deadline-exceeded') {
      throw new Error('요청 시간이 초과되었습니다.');
    }
    
    throw error;
  }
}
