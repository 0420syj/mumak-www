'use client';

import { useScrollDirection } from '@/src/shared/hooks';

interface SmartHeaderProps {
  children: React.ReactNode;
}

/**
 * 스크롤 방향에 따라 자동으로 숨기고 나타나는 헤더 래퍼
 *
 * - 스크롤 다운: 헤더가 위로 슬라이드하며 사라짐
 * - 스크롤 업: 헤더가 다시 나타남
 * - 상단 근처: 항상 표시
 */
export function SmartHeader({ children }: SmartHeaderProps) {
  const { isVisible, isAtTop } = useScrollDirection({ threshold: 50 });

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-transform duration-300 ease-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${isAtTop ? 'bg-background' : 'bg-background/95 backdrop-blur-sm shadow-sm'}
      `}
      data-visible={isVisible}
      data-at-top={isAtTop}
    >
      {children}
    </header>
  );
}

/**
 * 고정 헤더의 높이만큼 공간을 확보하는 Spacer 컴포넌트
 * 헤더가 fixed position이므로, 콘텐츠가 헤더 아래에서 시작하도록 함
 */
export function HeaderSpacer() {
  return <div className="h-16" aria-hidden="true" />;
}
