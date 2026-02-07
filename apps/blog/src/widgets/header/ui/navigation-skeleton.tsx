import { Skeleton } from '@mumak/ui/components/skeleton';

function NavigationSkeleton() {
  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="md:hidden size-8 rounded-md" />
            <Skeleton className="h-7 w-20 rounded" />
            <div className="hidden md:flex items-center gap-4">
              <Skeleton className="h-8 w-14 rounded-md" />
              <Skeleton className="h-8 w-14 rounded-md" />
              <Skeleton className="h-8 w-14 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export { NavigationSkeleton };
