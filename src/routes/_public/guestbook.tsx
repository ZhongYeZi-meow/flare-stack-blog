import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import theme from "@theme";
import type { GuestbookEntryView } from "@/features/theme/contract/pages";
import { createGuestbookEntryFn } from "@/features/guestbook/api/guestbook.public.api";
import { GUESTBOOK_KEYS, guestbookQuery } from "@/features/guestbook/queries";
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
  const [offset, setOffset] = useState(0);

  const { data: result } = useQuery(guestbookQuery(offset));
  const rawEntries = result?.data?.entries ?? [];
  const total = result?.data?.total ?? 0;

  const entries: GuestbookEntryView[] = rawEntries.map((e) => ({
    id: e.id,
    content: e.content,
    createdAt: typeof e.createdAt === "number" ? e.createdAt : 0,
    user: {
      name: e.user?.name ?? "Anonymous",
      image: e.user?.image ?? null,
    },
    reactionTarget: { type: "guestbook" as const, id: e.id },
  }));

  const createMutation = useMutation({
    mutationFn: (text: string) =>
      createGuestbookEntryFn({ data: { content: text } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_KEYS.all });
    },
    onError: () => {
      toast.error("Failed to post message");
    },
  });

  const handleSubmit = async (content: string) => {
    await createMutation.mutateAsync(content);
  };

  const hasMore = entries.length < total;
  const handleLoadMore = () => setOffset(offset + 20);

  return (
    <theme.GuestbookPage
      entries={entries}
      isLoggedIn={!!session?.user}
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
    />
  );
}
