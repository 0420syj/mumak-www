export function SpotifySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border w-full max-w-sm animate-pulse">
      <div className="w-16 h-16 shrink-0 rounded-md bg-muted" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-4 w-full max-w-40 bg-muted rounded" />
        <div className="h-3 w-full max-w-32 bg-muted rounded" />
      </div>
    </div>
  );
}
