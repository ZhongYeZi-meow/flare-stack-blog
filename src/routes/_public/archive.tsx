import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { m } from "@/paraglide/messages";
import { archivePostsQuery } from "@/features/posts/queries";

export const Route = createFileRoute("/_public/archive")({
  component: ArchivePage,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(archivePostsQuery),
  head: () => ({
    meta: [{ title: m.nav_archive() }],
  }),
});

interface ArchivePost {
  id: number;
  title: string;
  slug: string;
  publishedAt: string | null;
}

function ArchivePage() {
  const { data: posts } = useSuspenseQuery(archivePostsQuery);

  const grouped = (posts as ArchivePost[]).reduce<
    Record<string, ArchivePost[]>
  >((acc, post) => {
    const year = post.publishedAt
      ? new Date(post.publishedAt).getFullYear().toString()
      : "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full fuwari-onload-animation">
      <div className="fuwari-card-base p-6 md:p-8 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold fuwari-text-90 mb-2">
          {m.nav_archive()}
        </h1>
        <p className="fuwari-text-50 text-sm">
          {m.archive_total({ count: (posts as ArchivePost[]).length })}
        </p>
      </div>

      <div className="space-y-6">
        {years.map((year) => (
          <div key={year} className="fuwari-card-base p-6 md:p-8">
            <h2 className="text-xl font-bold fuwari-text-75 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-(--fuwari-primary)" />
              {year}
              <span className="text-sm font-normal fuwari-text-30 ml-2">
                ({grouped[year].length})
              </span>
            </h2>

            <div className="relative ml-3 border-l-2 border-(--fuwari-primary)/20 pl-6 space-y-4">
              {grouped[year].map((post) => {
                const date = post.publishedAt
                  ? new Date(post.publishedAt)
                  : null;
                return (
                  <div key={post.id} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-(--fuwari-primary)/40 group-hover:bg-(--fuwari-primary) transition-colors border-2 border-white dark:border-gray-800" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                      {date && (
                        <time className="text-xs fuwari-text-30 font-mono shrink-0">
                          {`${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`}
                        </time>
                      )}
                      <Link
                        to="/post/$slug"
                        params={{ slug: post.slug }}
                        className="text-sm fuwari-text-75 hover:text-(--fuwari-primary) transition-colors font-medium"
                      >
                        {post.title}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
