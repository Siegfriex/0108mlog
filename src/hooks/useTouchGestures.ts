import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * 터치 제스처 타입 정의
 */
export type TouchGesture = 'tap' | 'doubleTap' | 'longPress' | 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown' | 'pinch';

/**
 * 터치 제스처 이벤트 핸들러 타입
 */
export interface TouchGestureHandlers {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
}

/**
 * useTouchGestures 훅 옵션
 */
export interface UseTouchGesturesOptions {
  /**
   * 탭으로 인식할 최대 이동 거리 (px)
   */
  tapThreshold?: number;
  /**
   * 스와이프로 인식할 최소 이동 거리 (px)
   */
  swipeThreshold?: number;
  /**
   * 롱프레스로 인식할 최소 시간 (ms)
   */
  longPressDelay?: number;
  /**
   * 더블탭으로 인식할 최대 시간 간격 (ms)
   */
  doubleTapDelay?: number;
}

/**
 * useTouchGestures 훅
 * 
 * 터치 제스처를 감지하고 처리하는 커스텀 훅
 * 탭, 더블탭, 롱프레스, 스와이프, 핀치 제스처 지원
 */
export const useTouchGestures = (
  handlers: TouchGestureHandlers,
  options: UseTouchGesturesOptions = {}
) => {
  const {
    tapThreshold = 10,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 터치 시작 핸들러
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: now });
    setTouchEnd(null);

    // 롱프레스 타이머 시작
    if (handlers.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.();
      }, longPressDelay);
    }
  }, [handlers, longPressDelay]);

  /**
   * 터치 이동 핸들러
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    setTouchEnd({ x: touch.clientX, y: touch.clientY, time: now });

    // 롱프레스 타이머 취소 (이동 시)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /**
   * 터치 종료 핸들러
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // 롱프레스 타이머 취소
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStart) return;

    // touchEnd가 없으면 이벤트에서 직접 가져오기 (짧은 탭/제스처 처리)
    const touch = e.changedTouches[0];
    const endPos = touchEnd || {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = endPos.x - touchStart.x;
    const deltaY = endPos.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endPos.time - touchStart.time;

    // 탭 제스처 (작은 이동, 짧은 시간)
    if (distance < tapThreshold && duration < 300) {
      const now = Date.now();
      
      // 더블탭 체크
      if (lastTap && now - lastTap < doubleTapDelay) {
        handlers.onDoubleTap?.();
        setLastTap(null);
      } else {
        handlers.onTap?.();
        setLastTap(now);
      }
      return;
    }

    // 스와이프 제스처
    if (distance > swipeThreshold) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        // 수평 스와이프
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else {
        // 수직 스와이프
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }

    // 상태 초기화
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, tapThreshold, swipeThreshold, doubleTapDelay, lastTap, handlers]);

  /**
   * 정리 함수
   */
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
