'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollProgressOptions {
  /** 콘텐츠 영역의 ref (지정하지 않으면 전체 문서 기준) */
  contentRef?: React.RefObject<HTMLElement | null>;
}

/**
 * 페이지 또는 특정 콘텐츠 영역의 스크롤 진행률을 계산하는 훅
 *
 * @returns progress - 0 ~ 100 사이의 진행률 값
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}): number {
  const { contentRef } = options;
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;

    let scrollHeight: number;
    let offsetTop = 0;

    if (contentRef?.current) {
      const rect = contentRef.current.getBoundingClientRect();
      scrollHeight = contentRef.current.scrollHeight;
      offsetTop = rect.top + scrollTop;
    } else {
      scrollHeight = document.documentElement.scrollHeight;
    }

    const scrollableHeight = scrollHeight - windowHeight;

    if (scrollableHeight <= 0) {
      setProgress(100);
      ticking.current = false;
      return;
    }

    const adjustedScrollTop = scrollTop - offsetTop;
    const adjustedScrollableHeight = scrollableHeight - offsetTop;

    const currentProgress = Math.min(100, Math.max(0, (adjustedScrollTop / adjustedScrollableHeight) * 100));

    setProgress(currentProgress);
    ticking.current = false;
  }, [contentRef]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(calculateProgress);
      }
    };

    calculateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [calculateProgress]);

  return progress;
}
