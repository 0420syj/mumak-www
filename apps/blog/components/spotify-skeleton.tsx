import { Skeleton } from '@mumak/ui/components/skeleton';

export function SpotifySkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4 w-full max-w-sm">
      <Skeleton className="size-16 shrink-0 rounded-md" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-full max-w-40 rounded" />
        <Skeleton className="h-3 w-full max-w-32 rounded" />
      </div>
    </div>
  );
}
