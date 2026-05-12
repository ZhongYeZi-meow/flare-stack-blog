import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { createGuestbookEntryFn } from "@/features/guestbook/api/guestbook.public.api";
import { GUESTBOOK_KEYS, guestbookQuery } from "@/features/guestbook/queries";
import { ReactionPicker } from "@/features/reactions/components/reaction-picker";
import { authClient } from "@/lib/auth/auth.client";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/guestbook")({
  component: GuestbookPage,
  head: () => ({
    meta: [{ title: m.guestbook_title() }],
  }),
});

function GuestbookPage() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [offset, setOffset] = useState(0);

  const { data: result, isLoading } = useQuery(guestbookQuery(offset));
  const entries = result?.data?.entries ?? [];
  const total = result?.data?.total ?? 0;

  const createMutation = useMutation({
    mutationFn: (text: string) =>
      createGuestbookEntryFn({ data: { content: text } }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_KEYS.all });
    },
    onError: () => {
      toast.error("Failed to post message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate(content.trim());
  };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-0 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
          {m.guestbook_title()}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {m.guestbook_desc()}
        </p>
      </header>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex items-start gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="w-9 h-9 rounded-full mt-1 shrink-0"
              />
            )}
            <div className="flex-1 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={m.guestbook_placeholder()}
                maxLength={2000}
                rows={3}
                className="w-full resize-none rounded-lg border border-border/40 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    !content.trim() || createMutation.isPending
                  }
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
                >
                  {createMutation.isPending
                    ? m.guestbook_submitting()
                    : m.guestbook_submit()}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-12 rounded-lg border border-border/40 bg-muted/20 p-6 text-center">
          <p className="text-muted-foreground text-sm">
            {m.guestbook_login_hint()}
          </p>
        </div>
      )}

      <section className="space-y-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {m.guestbook_empty()}
          </div>
        ) : (
          entries.map((entry) => (
            <GuestbookEntry key={entry.id} entry={entry} />
          ))
        )}

        {entries.length < total && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setOffset(offset + 20)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {m.guestbook_load_more()}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function GuestbookEntry({
  entry,
}: {
  entry: {
    id: number;
    content: string;
    createdAt: unknown;
    user: { id: string | null; name: string | null; image: string | null } | null;
  };
}) {
  const date = new Date(
    typeof entry.createdAt === "number"
      ? entry.createdAt * 1000
      : String(entry.createdAt),
  );

  return (
    <div className="group flex gap-3">
      {entry.user?.image ? (
        <img
          src={entry.user.image}
          alt={entry.user.name ?? ""}
          className="w-9 h-9 rounded-full shrink-0 mt-0.5"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-muted shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {entry.user?.name ?? "Anonymous"}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
          {entry.content}
        </p>
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ReactionPicker targetType="guestbook" targetId={entry.id} />
        </div>
      </div>
    </div>
  );
}
