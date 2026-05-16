import { Link } from "@tanstack/react-router";
import { ChevronDown, Clock, Eye, FileText, List, Pencil } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useViewCounts } from "@/features/pageview/queries";
import type { PostWithToc } from "@/features/posts/schema/posts.schema";
import { ReactionPicker } from "@/features/reactions/components/reaction-picker";
import type { PostPageProps } from "@/features/theme/contract/pages";
import { FuwariCommentSection } from "@/features/theme/themes/fuwari/components/comments/view/comment-section";
import { ContentRenderer } from "@/features/theme/themes/fuwari/components/content/content-renderer";
import { authClient } from "@/lib/auth/auth-client";
import { m } from "@/paraglide/messages";
import { PostMeta } from "./components/post-meta";
import { PostPasswordGate } from "./components/post-password-gate";
import { PostSummary } from "./components/post-summary";
import { PostNavigation } from "./components/post-navigation";
import { ReadingProgress } from "./components/reading-progress";
import { SeriesNav } from "./components/series-nav";
import { RelatedPosts, RelatedPostsSkeleton } from "./components/related-posts";
import { ShareButtons } from "./components/share-buttons";
import TableOfContents from "./components/table-of-contents";

export function PostPage({ post: initialPost, commentsEnabled = true }: PostPageProps) {
  const [post, setPost] = useState<Exclude<PostWithToc, null>>(initialPost);
  const { data: session } = authClient.useSession();
  const { data: viewCounts } = useViewCounts([post.slug]);
  const viewCount = viewCounts?.[post.slug] ?? 0;
  const wordCount = post.readTimeInMinutes * 300;

  return (
    <div className="relative flex flex-col rounded-(--fuwari-radius-large) py-1 md:py-0 md:bg-transparent gap-4 mb-4 w-full">
      <ReadingProgress />
      {/* Table Of Contents (Desktop Floating Right) */}
      <div
        className="hidden 2xl:block absolute top-0 h-full pl-4"
        style={{
          right: "calc(var(--fuwari-toc-width) * -1)",
          width: "var(--fuwari-toc-width)",
        }}
      >
        <TableOfContents headers={post.toc} />
      </div>

      {/* Mobile TOC (Collapsible) */}
      {post.toc.length > 0 && <MobileToc headers={post.toc} />}

      {/* Main Post Container */}
      <div className="fuwari-card-base z-10 px-6 md:px-9 pt-6 pb-4 relative w-full fuwari-onload-animation">
        {/* Word count and reading time */}
        <div className="flex flex-row flex-wrap fuwari-text-30 gap-5 mb-3 transition">
          <div className="flex flex-row items-center">
            <div className="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 fuwari-text-50 flex items-center justify-center mr-2">
              <FileText strokeWidth={1.5} size={16} />
            </div>
            <div className="text-sm">
              {m.post_word_count({ count: wordCount })}
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div className="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 fuwari-text-50 flex items-center justify-center mr-2">
              <Clock strokeWidth={1.5} size={16} />
            </div>
            <div className="text-sm">
              {m.read_time({ count: post.readTimeInMinutes })}
            </div>
          </div>
          {viewCount > 0 && (
            <div className="flex flex-row items-center">
              <div className="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 fuwari-text-50 flex items-center justify-center mr-2">
                <Eye strokeWidth={1.5} size={16} />
              </div>
              <div className="text-sm">
                {m.post_views({ count: viewCount })}
              </div>
            </div>
          )}
          {session?.user.role === "admin" && (
            <Link
              to="/admin/posts/edit/$id"
              params={{ id: String(post.id) }}
              className="flex flex-row items-center fuwari-text-30 hover:fuwari-text-90 transition animate-in fade-in duration-500"
            >
              <div className="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 fuwari-text-50 flex items-center justify-center mr-2">
                <Pencil strokeWidth={1.5} size={16} />
              </div>
              <div className="text-sm">{m.post_edit()}</div>
            </Link>
          )}
        </div>

        {/* Title */}
        <div className="relative">
          <h1
            className="transition w-full block font-bold mb-3
              text-3xl md:text-[2.25rem]/[2.75rem]
              fuwari-text-90
              md:before:w-1 before:h-5 before:rounded-md before:bg-(--fuwari-primary)
              before:absolute before:top-3 before:-left-4.5"
            style={{ viewTransitionName: `post-title-${post.slug}` }}
          >
            {post.title}
          </h1>
        </div>

        {/* Metadata */}
        <div>
          <PostMeta post={post} className="mb-5" />
        </div>

        {/* Summary */}
        <PostSummary summary={post.summary} />

        {post.isPasswordProtected && !post.contentJson ? (
          <PostPasswordGate post={post} onUnlocked={setPost} />
        ) : (
          <>
            {/* Markdown Content */}
            <HeadingAnchorContent content={post.contentJson} />

            {/* End of Content Notice */}
            <div className="my-8 flex items-center justify-center w-full">
              <div className="h-px w-full bg-linear-to-r from-transparent via-(--fuwari-meta-divider) to-transparent opacity-20" />
              <span className="mx-4 text-sm font-mono tracking-widest text-(--fuwari-meta-divider) opacity-50 whitespace-nowrap">
                END
              </span>
              <div className="h-px w-full bg-linear-to-r from-(--fuwari-meta-divider) via-transparent to-transparent opacity-20" />
            </div>
          </>
        )}
      </div>

      {/* Prev/Next buttons (Mock implementation for layout, actual data would come from the server in an ideal setup) */}
      <div
        className="hidden flex-col md:flex-row justify-between gap-4 overflow-hidden w-full fuwari-onload-animation"
        style={{ animationDelay: "150ms" }}
      >
        {/* Note: the backend schema doesn't currently provide prev/next slugs in PostWithToc. Using placeholder layouts to match Fuwari exactly. */}
      </div>

      {/* Series Navigation */}
      {post.seriesId && (
        <SeriesNav seriesId={post.seriesId} currentPostId={post.id} />
      )}

      {/* Related Posts */}
      <Suspense fallback={<RelatedPostsSkeleton />}>
        <RelatedPosts slug={post.slug} />
      </Suspense>

      {/* Reactions & Share */}
      <div
        className="fuwari-card-base p-6 fuwari-onload-animation flex items-center justify-between gap-4 flex-wrap"
        style={{ animationDelay: "400ms" }}
      >
        <ReactionPicker targetType="post" targetId={post.id} />
        <ShareButtons title={post.title} />
      </div>

      {/* Comments Section */}
      {commentsEnabled && !post.commentDisabled && (
        <div
          className="fuwari-card-base p-6 fuwari-onload-animation"
          style={{ animationDelay: "450ms" }}
        >
          <FuwariCommentSection postId={post.id} />
        </div>
      )}

      {/* Previous / Next Navigation */}
      <div className="fuwari-onload-animation" style={{ animationDelay: "500ms" }}>
        <PostNavigation
          publishedAt={post.publishedAt}
          postId={post.id}
        />
      </div>
    </div>
  );
}

function HeadingAnchorContent({ content }: { content: typeof import("@tiptap/react").JSONContent | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      const heading = (e.target as HTMLElement).closest("h1[id], h2[id], h3[id], h4[id]");
      if (heading) {
        const id = heading.getAttribute("id");
        if (id) {
          const url = `${window.location.origin}${window.location.pathname}#${id}`;
          navigator.clipboard.writeText(url);
          window.history.replaceState(null, "", `#${id}`);
        }
      }
    };
    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, []);

  return (
    <div ref={ref} className="mb-6 prose dark:prose-invert prose-base max-w-none! fuwari-custom-md">
      <ContentRenderer content={content} />
    </div>
  );
}

function MobileToc({ headers }: { headers: Array<{ id: string; text: string; level: number }> }) {
  const [open, setOpen] = useState(false);
  const minDepth = Math.min(...headers.map(h => h.level));

  return (
    <div className="2xl:hidden fuwari-card-base p-4 fuwari-onload-animation" style={{ animationDelay: "50ms" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full text-sm font-medium fuwari-text-75"
      >
        <List size={16} className="text-(--fuwari-primary)" />
        <span>{m.post_toc_title()}</span>
        <ChevronDown size={16} className={cn("ml-auto transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <nav className="mt-3 pl-2 border-l-2 border-(--fuwari-primary)/20 space-y-1.5 max-h-64 overflow-y-auto">
          {headers.filter(h => h.level < minDepth + 3).map(h => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                }
                setOpen(false);
              }}
              className="block text-sm fuwari-text-50 hover:text-(--fuwari-primary) transition-colors"
              style={{ paddingLeft: `${(h.level - minDepth) * 12}px` }}
            >
              {h.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
