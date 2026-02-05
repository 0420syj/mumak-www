import type { MDXComponents } from 'mdx/types';
import { MDXRemote, type EvaluateOptions } from 'next-mdx-remote-client/rsc';
import { connection } from 'next/server';

import { Skeleton } from '@mumak/ui/components/skeleton';

interface MDXContentProps {
  source: string;
  components?: MDXComponents;
  options?: EvaluateOptions;
}

async function MDXContent({ source, components, options }: MDXContentProps) {
  // Shiki가 Date.now() 사용하므로 동적 렌더링 필요
  // Suspense로 감싸서 페이지 껍데기 먼저 표시, MDX는 스트리밍
  await connection();

  return <MDXRemote source={source} components={components} options={options} />;
}

function MDXContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export { MDXContent, MDXContentSkeleton };
