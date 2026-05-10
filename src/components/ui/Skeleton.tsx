'use client';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ background: 'var(--bg-elevated)', ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="surface-card p-4 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function GridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-3`}>
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 5 }).map((_, c) => (
        <div key={c} className="min-w-[280px] flex-shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex-1 min-h-[300px] p-2 rounded-xl space-y-2" style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-subtle)' }}>
            {Array.from({ length: c % 2 === 0 ? 3 : 2 }).map((_, i) => (
              <div key={i} className="surface-card p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
                <Skeleton className="h-2 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="surface-card overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: i === rows - 1 ? 'none' : '1px solid var(--border-subtle)' }}>
          <Skeleton className="h-3 flex-1 max-w-[180px]" />
          <Skeleton className="h-3 flex-1 max-w-[140px]" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
