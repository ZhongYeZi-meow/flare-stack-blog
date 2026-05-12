import { Link } from "@tanstack/react-router";
import { LogIn, MessageCircle, Send, User as UserIcon } from "lucide-react";
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
    <div className="flex flex-col gap-4 w-full">
      <div
        className="fuwari-card-base p-6 md:p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-56 fuwari-onload-animation bg-linear-to-br from-(--fuwari-primary)/5 to-transparent"
        style={{ animationDelay: "150ms" }}
      >
        <MessageCircle className="w-10 h-10 fuwari-text-30 mb-3" strokeWidth={1.5} />
        <h1 className="text-3xl md:text-4xl font-bold fuwari-text-90 mb-4 z-10 transition-colors">
          {m.guestbook_title()}
        </h1>
        <p className="fuwari-text-50 text-center max-w-xl z-10 transition-colors">
          {m.guestbook_desc()}
        </p>
      </div>

      <div
        className="fuwari-card-base p-6 md:p-8 fuwari-onload-animation"
        style={{ animationDelay: "300ms" }}
      >
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={m.guestbook_placeholder()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-(--fuwari-btn-regular-bg) text-(--fuwari-btn-content) placeholder:fuwari-text-30 border-none outline-none focus:ring-2 focus:ring-(--fuwari-primary)/30 transition-all"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="fuwari-btn-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? m.guestbook_submitting() : m.guestbook_submit()}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center py-6">
            <Link
              to="/login"
              className="fuwari-btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              {m.guestbook_login_hint()}
            </Link>
          </div>
        )}
      </div>

      <div
        className="fuwari-card-base p-6 md:p-8 fuwari-onload-animation flex-1"
        style={{ animationDelay: "450ms" }}
      >
        {entries.length > 0 ? (
          <div className="flex flex-col gap-4">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="flex gap-3 p-4 rounded-xl bg-(--fuwari-btn-regular-bg)/50 fuwari-onload-animation"
                style={{ animationDelay: `${500 + i * 50}ms` }}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-(--fuwari-btn-regular-bg) shrink-0 flex items-center justify-center">
                  {entry.user.image ? (
                    <img
                      src={entry.user.image}
                      alt={entry.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={16} className="fuwari-text-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-sm fuwari-text-90">
                      {entry.user.name}
                    </span>
                    <span className="text-xs fuwari-text-30">
                      {new Date(entry.createdAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm fuwari-text-75 leading-relaxed break-words">
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
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="mx-auto px-6 py-2 rounded-xl text-sm font-medium bg-(--fuwari-btn-regular-bg) text-(--fuwari-btn-content) hover:bg-(--fuwari-btn-regular-bg-hover) active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoadingMore ? "..." : m.guestbook_load_more()}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 fuwari-text-30 transition-colors">
            <MessageCircle className="w-12 h-12 mb-3" strokeWidth={1} />
            <p className="text-lg">{m.guestbook_empty()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
