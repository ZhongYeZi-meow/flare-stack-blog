import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { seriesWithPostsQuery } from "@/features/series/queries";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

interface SeriesNavProps {
  seriesId: number;
  currentPostId: number;
}

export function SeriesNav({ seriesId, currentPostId }: SeriesNavProps) {
  const { data: series } = useQuery(seriesWithPostsQuery(seriesId));

  if (!series || series.posts.length <= 1) return null;

  return (
    <div className="fuwari-card-base p-5 fuwari-onload-animation" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={16} className="text-(--fuwari-primary)" />
        <h3 className="text-sm font-semibold fuwari-text-75">
          {m.series_toc_title()}
        </h3>
        <span className="text-xs fuwari-text-30">({series.posts.length})</span>
      </div>
      <ol className="space-y-1.5">
        {series.posts.map((post, idx) => {
          const isCurrent = post.id === currentPostId;
          return (
            <li key={post.id} className="flex items-start gap-2">
              <span
                className={cn(
                  "text-xs font-mono mt-0.5 shrink-0 w-5 text-right",
                  isCurrent ? "text-(--fuwari-primary) font-bold" : "fuwari-text-30",
                )}
              >
                {idx + 1}.
              </span>
              {isCurrent ? (
                <span className="text-sm font-medium text-(--fuwari-primary) flex items-center gap-1">
                  <ChevronRight size={12} />
                  {post.title}
                </span>
              ) : (
                <Link
                  to="/post/$slug"
                  params={{ slug: post.slug }}
                  className="text-sm fuwari-text-50 hover:text-(--fuwari-primary) transition-colors"
                >
                  {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
