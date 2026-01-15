'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollDirectionOptions {
  /** 스크롤 임계값 (px). 이 값 이하에서는 항상 헤더 표시 */
  threshold?: number;
  /** 초기 표시 상태 */
  initialVisible?: boolean;
}

interface ScrollState {
  /** 헤더 표시 여부 */
  isVisible: boolean;
  /** 현재 스크롤 위치가 상단인지 (threshold 이하) */
  isAtTop: boolean;
}

/**
 * 스크롤 방향에 따라 헤더 표시 여부를 결정하는 훅
 *
 * - 상단(threshold 이내): 항상 표시
 * - 아래로 스크롤: 숨김
 * - 위로 스크롤: 표시
 */
export function useScrollDirection(options: UseScrollDirectionOptions = {}): ScrollState {
  const { threshold = 50, initialVisible = true } = options;

  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollState = useCallback(() => {
    const currentScrollY = window.scrollY;
    const atTop = currentScrollY < threshold;

    setIsAtTop(atTop);

    // 상단 threshold 내에서는 항상 표시
    if (atTop) {
      setIsVisible(true);
      lastScrollY.current = currentScrollY;
      ticking.current = false;
      return;
    }

    // 스크롤 방향 감지 (최소 5px 이상 이동해야 방향 변경 인식)
    const scrollDiff = currentScrollY - lastScrollY.current;
    if (Math.abs(scrollDiff) > 5) {
      const isScrollingUp = scrollDiff < 0;
      setIsVisible(isScrollingUp);
      lastScrollY.current = currentScrollY;
    }

    ticking.current = false;
  }, [threshold]);

  useEffect(() => {
    const handleScroll = () => {
      // requestAnimationFrame으로 성능 최적화
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateScrollState);
      }
    };

    // 초기 스크롤 위치 설정
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < threshold);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, updateScrollState]);

  return { isVisible, isAtTop };
}
