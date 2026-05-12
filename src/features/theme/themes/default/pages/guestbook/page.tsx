import { User as UserIcon } from "lucide-react";
import { useState } from "react";
import type { GuestbookPageProps } from "@/features/theme/contract/pages";
import { ReactionPicker } from "@/features/reactions/components/reaction-picker";
import { m } from "@/paraglide/messages";

export function GuestbookPage({
  entries,
  isLoggedIn,
  onSubmit,
  isSubmitting,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: GuestbookPageProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit(content.trim());
    setContent("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-20 px-6 md:px-0">
      <header className="py-12 md:py-20 space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
          {m.guestbook_title()}
        </h1>
        <p className="max-w-xl text-base md:text-lg font-light text-muted-foreground leading-relaxed">
          {m.guestbook_desc()}
        </p>
      </header>

      <div className="mb-8">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={m.guestbook_placeholder()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground/40 border border-border/40 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? m.guestbook_submitting() : m.guestbook_submit()}
            </button>
          </form>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground/60 font-mono">
            {m.guestbook_login_hint()}
          </div>
        )}
      </div>

      <div className="min-h-50">
        {entries.length > 0 ? (
          <div className="space-y-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex gap-3 py-4 border-b border-border/20 last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted/50 shrink-0 flex items-center justify-center">
                  {entry.user.image ? (
                    <img
                      src={entry.user.image}
                      alt={entry.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={14} className="text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-medium text-sm text-foreground">
                      {entry.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground/40 font-mono">
                      {new Date(entry.createdAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entry.content}
                  </p>
                  <div className="mt-2">
                    <ReactionPicker
                      targetType={entry.reactionTarget.type}
                      targetId={entry.reactionTarget.id}
                    />
                  </div>
                </div>
              </div>
            ))}

            {hasMore && onLoadMore && (
              <div className="pt-6 text-center">
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? "..." : m.guestbook_load_more()}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-muted-foreground/50">
              {m.guestbook_empty()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
