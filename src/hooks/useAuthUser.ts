/**
 * 인증 사용자 상태 Hook
 *
 * Firebase Auth onAuthStateChanged 기반 사용자 정보 제공
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * useAuthUser Hook
 *
 * Firebase Auth 상태를 실시간으로 추적
 *
 * @returns {Object} { user, userId, loading, isAuthenticated }
 */
export const useAuthUser = (): {
  user: User | null;
  userId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userId: user?.uid ?? null,
    loading,
    isAuthenticated: !!user,
  };
};
