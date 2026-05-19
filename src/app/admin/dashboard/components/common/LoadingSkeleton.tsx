export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-[var(--border-soft)]" />
        ))}
      </div>
      
      {/* Main Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[400px] rounded-2xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-[var(--border-soft)]" />
        <div className="h-[400px] rounded-2xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-[var(--border-soft)]" />
      </div>
      
      {/* Table Skeleton */}
      <div className="h-[500px] rounded-2xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-[var(--border-soft)]" />
    </div>
  );
}
