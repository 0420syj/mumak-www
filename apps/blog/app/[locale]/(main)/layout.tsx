import { Suspense } from 'react';

import { Footer, FooterSkeleton } from '@/src/widgets/footer';
import { HeaderSpacer, Navigation, NavigationSkeleton, SmartHeader } from '@/src/widgets/header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:border focus:border-border focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <div className="min-h-screen flex flex-col">
        <SmartHeader>
          <Suspense fallback={<NavigationSkeleton />}>
            <Navigation />
          </Suspense>
        </SmartHeader>
        <HeaderSpacer />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Suspense fallback={<FooterSkeleton />}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
}
