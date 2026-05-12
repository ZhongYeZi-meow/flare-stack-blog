import { Skeleton } from "@/components/ui/skeleton";

export function PostsPageSkeleton() {
  return (
    <div className="w-full space-y-4 fuwari-onload-animation">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="fuwari-card-base p-5 space-y-3"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-18 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
