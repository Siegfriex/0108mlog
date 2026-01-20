import { useState, useEffect } from 'react';

/**
 * useMobileOptimization 훅
 * 
 * 모바일 환경 감지 및 성능 최적화를 위한 커스텀 훅
 * 디바이스 타입, 화면 크기, 성능 설정 등을 제공
 */
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersLowData, setPrefersLowData] = useState(false);

  useEffect(() => {
    /**
     * 디바이스 타입 감지
     */
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent || navigator.vendor || '';
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      
      // 실제 모바일 디바이스이거나 화면 크기가 작은 경우 모바일로 판단
      setIsMobile(isMobileDevice || width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    /**
     * 접근성 설정 확인
     * P1 수정: 이벤트 핸들러를 변수에 저장하여 cleanup 시 제거
     */
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');

    // 핸들러를 변수에 저장 (cleanup용)
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    const dataHandler = (e: MediaQueryListEvent) => setPrefersLowData(e.matches);

    // 초기값 설정
    setPrefersReducedMotion(motionQuery.matches);
    setPrefersLowData(dataQuery.matches);

    // 이벤트 리스너 등록
    motionQuery.addEventListener('change', motionHandler);
    dataQuery.addEventListener('change', dataHandler);

    checkDevice();

    window.addEventListener('resize', checkDevice);

    // P1 수정: 모든 이벤트 리스너 cleanup
    return () => {
      window.removeEventListener('resize', checkDevice);
      motionQuery.removeEventListener('change', motionHandler);
      dataQuery.removeEventListener('change', dataHandler);
    };
  }, []);

  /**
   * 성능 최적화 설정
   */
  const shouldReduceAnimations = prefersReducedMotion || isMobile;
  const shouldDisableParallax = isMobile || prefersReducedMotion;
  const shouldDisableSpotlight = isMobile || prefersReducedMotion;

  // 레이아웃 애니메이션만 비활성화 (UI 피드백은 유지)
  const shouldDisableLayoutAnimations = isMobile || prefersReducedMotion;

  // 모바일 전용 클래스 문자열
  const mobileLayoutClass = isMobile ? 'mobile-layout' : '';

  // 하드웨어 동시성 기반 성능 판단 (기본값: false, 향후 확장 가능)
  const isLowPerformance = false;

  return {
    isMobile,
    isTablet,
    isTouchDevice,
    isLowPerformance,
    prefersReducedMotion,
    prefersLowData,
    shouldReduceAnimations,
    shouldDisableParallax,
    shouldDisableSpotlight,
    // 신규 추가
    shouldDisableLayoutAnimations,
    mobileLayoutClass,
    // 최적화 설정 (하위 호환성 유지)
    optimizationSettings: {
      reduceAnimations: shouldReduceAnimations,
      reduceDataUsage: prefersLowData,
      imageQuality: prefersLowData ? 'low' : 'high',
      enableLazyLoading: isMobile || prefersLowData,
    },
  };
};
