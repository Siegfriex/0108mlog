/**
 * 실시간 동기화 Hook
 * 
 * FEAT-002: 실시간 데이터 동기화
 * PRD 명세: Firestore onSnapshot 리스너를 통한 실시간 UI 업데이트
 * 
 * 주요 기능:
 * - Firestore 실시간 리스너 설정
 * - 데이터 변경 시 자동 업데이트
 * - 에러 처리 및 재연결 로직
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { FIRESTORE_COLLECTIONS } from '../types/firestore';
import { TimelineEntry, EmotionType } from '../../types';
import { toDate } from '../utils/firestore';

/**
 * useRealtime Hook 옵션
 */
export interface UseRealtimeOptions {
  userId?: string;
  limitCount?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * 실시간 타임라인 데이터 Hook
 * 기존 props 인터페이스와 호환되도록 설계
 * 
 * @param options Hook 옵션
 * @returns 타임라인 데이터 및 로딩 상태
 */
export const useRealtimeTimeline = (
  options: UseRealtimeOptions = {}
): {
  data: TimelineEntry[];
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options.userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.TIMELINE),
      where('userId', '==', options.userId),
      orderBy(
        options.orderByField || 'date',
        options.orderDirection || 'desc'
      ),
      limit(options.limitCount || 50)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const entries: TimelineEntry[] = snapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
              id: doc.id,
              date: toDate(docData.date),
              type: docData.type || 'conversation',
              emotion: (docData.emotion as EmotionType) || EmotionType.PEACE,
              intensity: docData.intensity ?? 0,
              summary: docData.summary || '',
              detail: docData.detail || '',
              nuanceTags: docData.nuanceTags || [],
            };
          });
          setData(entries);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('데이터 변환 오류'));
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [options.userId, options.orderByField, options.orderDirection, options.limitCount]);

  return { data, loading, error };
};

/**
 * 실시간 감정 데이터 Hook
 * 
 * @param userId 사용자 ID
 * @returns 감정 데이터 및 로딩 상태
 */
export const useRealtimeEmotions = (
  userId?: string
): {
  data: Array<{
    id: string;
    emotion: EmotionType;
    intensity: number;
    timestamp: Date;
  }>;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<
    Array<{
      id: string;
      emotion: EmotionType;
      intensity: number;
      timestamp: Date;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.EMOTIONS),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const emotions = snapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
              id: doc.id,
              emotion: (docData.emotion as EmotionType) || EmotionType.PEACE,
              intensity: docData.intensity ?? 0,
              timestamp: toDate(docData.timestamp),
            };
          });
          setData(emotions);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('데이터 변환 오류'));
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { data, loading, error };
};

/**
 * 실시간 대화 데이터 Hook
 * 
 * @param conversationId 대화 ID
 * @returns 메시지 데이터 및 로딩 상태
 */
export const useRealtimeMessages = (
  conversationId?: string
): {
  data: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<
    Array<{
      id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: Date;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    if (!conversationId || !userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.MESSAGES),
      where('userId', '==', userId),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const messages = snapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
              id: doc.id,
              role: docData.role || 'user',
              content: docData.content || '',
              timestamp: toDate(docData.timestamp),
            };
          });
          setData(messages);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('데이터 변환 오류'));
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId, auth.currentUser?.uid]);

  return { data, loading, error };
};

/**
 * 범용 실시간 데이터 Hook
 * 
 * @param collectionName 컬렉션 이름
 * @param options 쿼리 옵션
 * @returns 데이터 및 로딩 상태
 */
export const useRealtime = <T extends DocumentData>(
  collectionName: string,
  options: UseRealtimeOptions = {}
): {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!options.userId) {
      setLoading(false);
      return;
    }

    const constraints = [
      where('userId', '==', options.userId),
      orderBy(
        options.orderByField || 'createdAt',
        options.orderDirection || 'desc'
      ),
    ];

    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(items);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('데이터 변환 오류'));
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [
    collectionName,
    options.userId,
    options.orderByField,
    options.orderDirection,
    options.limitCount,
    refetchTrigger,
  ]);

  return { data, loading, error, refetch };
};

/**
 * 실시간 콘텐츠 데이터 Hook
 *
 * @param userId 사용자 ID
 * @returns 콘텐츠 데이터 및 로딩 상태
 */
export const useRealtimeContents = (
  userId?: string
): {
  data: Array<{
    id: string;
    type: 'poem' | 'meditation' | 'quote' | 'insight';
    title: string;
    body: string;
    author: string;
    tags: string[];
    createdAt: Date;
    commentary?: string;
    groundingLinks?: Array<{ title: string; url: string }>;
  }>;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<
    Array<{
      id: string;
      type: 'poem' | 'meditation' | 'quote' | 'insight';
      title: string;
      body: string;
      author: string;
      tags: string[];
      createdAt: Date;
      commentary?: string;
      groundingLinks?: Array<{ title: string; url: string }>;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.CONTENTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const contents = snapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
              id: doc.id,
              type: docData.type || 'insight',
              title: docData.title || '',
              body: docData.body || '',
              author: docData.author || '',
              tags: docData.tags || [],
              createdAt: toDate(docData.createdAt),
              commentary: docData.commentary,
              groundingLinks: docData.groundingLinks,
            };
          });
          setData(contents);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('데이터 변환 오류'));
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { data, loading, error };
};
