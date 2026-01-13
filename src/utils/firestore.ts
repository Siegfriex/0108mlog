/**
 * Firestore 유틸리티 함수
 * 
 * Firestore 데이터 변환 및 헬퍼 함수
 */

import { Timestamp } from 'firebase/firestore';

/**
 * 다양한 타입의 값을 Date 객체로 변환
 * 
 * @param value 변환할 값 (Timestamp, Date, string, number 등)
 * @returns Date 객체
 */
export function toDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  // 기본값: 현재 시간
  return new Date();
}
