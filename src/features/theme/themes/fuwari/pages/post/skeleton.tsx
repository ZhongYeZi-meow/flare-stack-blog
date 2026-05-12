import { Skeleton } from "@/components/ui/skeleton";

export function PostPageSkeleton() {
  return (
    <div className="w-full fuwari-onload-animation">
      <div className="fuwari-card-base px-6 md:px-9 pt-6 pb-8 space-y-4">
        {/* Meta row */}
        <div className="flex gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Title */}
        <Skeleton className="h-9 w-4/5" />

        {/* Post meta */}
        <div className="flex gap-3 items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Content lines */}
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full rounded-lg mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
