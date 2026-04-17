import { Skeleton } from "../ui/Skeleton";

export function SkeletonPR() {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        
        <div className="flex-1 space-y-2">
          
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>

          <Skeleton className="h-4 w-3/4" />

          <div className="flex gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>

        </div>

        <Skeleton className="h-14 w-14 rounded-full" />

      </div>
    </div>
  );
}