/**
 * Firebase 설정 파일
 * 
 * FEAT-002: 실시간 데이터 동기화
 * PRD 명세: Firestore 실시간 동기화, Cloud Functions 연동
 * 
 * 주요 기능:
 * - Firebase 초기화
 * - Firestore 인스턴스 생성
 * - Auth 인스턴스 생성
 * - Storage 인스턴스 생성
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

/**
 * Firebase 설정 인터페이스
 */
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Firebase 설정
 * 
 * 참고: Firebase 설정(apiKey 등)은 클라이언트에 노출되어도 안전합니다.
 * 보안은 Firestore Security Rules와 Firebase Auth로 관리됩니다.
 */
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyB_v7uSj5TB1v022nPVOog0hOOOZFe_ULU",
  authDomain: "iness-mlog.firebaseapp.com",
  projectId: "iness-mlog",
  storageBucket: "iness-mlog.firebasestorage.app",
  messagingSenderId: "580215226160",
  appId: "1:580215226160:web:797c71ccd9d2c3a336d2f5",
};

/**
 * Firebase 앱 인스턴스
 */
let app: FirebaseApp;

// Firebase 설정 검증
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please check firebase.ts');
}

// 이미 초기화된 앱이 있으면 재사용, 없으면 새로 초기화
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

/**
 * Firestore 인스턴스
 */
export const db: Firestore = getFirestore(app);

/**
 * Auth 인스턴스
 */
export const auth: Auth = getAuth(app);

/**
 * Storage 인스턴스
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Functions 인스턴스
 * 리전: asia-northeast3 (서울)
 */
export const functions: Functions = getFunctions(app, 'asia-northeast3');

/**
 * Firebase 앱 인스턴스 내보내기
 */
export default app;
