import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adjacentPostsQuery } from "@/features/posts/queries";
import { m } from "@/paraglide/messages";

interface PostNavigationProps {
  publishedAt: Date | string | null;
  postId: number;
}

export function PostNavigation({ publishedAt, postId }: PostNavigationProps) {
  const pubStr = publishedAt instanceof Date
    ? publishedAt.toISOString()
    : publishedAt ?? new Date().toISOString();
  const { data } = useQuery(adjacentPostsQuery(pubStr, postId));

  if (!data || (!data.prev && !data.next)) return null;

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.prev ? (
        <Link
          to="/post/$slug"
          params={{ slug: data.prev.slug }}
          className="fuwari-card-base group p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <ChevronLeft
            size={20}
            className="shrink-0 text-muted-foreground group-hover:text-(--fuwari-primary) transition-colors"
          />
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground mb-1">
              {m.post_nav_prev()}
            </div>
            <div className="text-sm font-medium truncate fuwari-text-75 group-hover:text-(--fuwari-primary) transition-colors">
              {data.prev.title}
            </div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {data.next ? (
        <Link
          to="/post/$slug"
          params={{ slug: data.next.slug }}
          className="fuwari-card-base group p-4 flex items-center justify-end gap-3 text-right hover:shadow-md transition-shadow"
        >
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground mb-1">
              {m.post_nav_next()}
            </div>
            <div className="text-sm font-medium truncate fuwari-text-75 group-hover:text-(--fuwari-primary) transition-colors">
              {data.next.title}
            </div>
          </div>
          <ChevronRight
            size={20}
            className="shrink-0 text-muted-foreground group-hover:text-(--fuwari-primary) transition-colors"
          />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
