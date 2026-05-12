import type { ReactionTargetType } from "@/lib/db/schema";

export interface GuestbookPageProps {
  entries: Array<GuestbookEntryView>;
  isLoggedIn: boolean;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export interface GuestbookEntryView {
  id: number;
  content: string;
  createdAt: number;
  user: {
    name: string;
    image: string | null;
  };
  reactionTarget: {
    type: ReactionTargetType;
    id: number;
  };
}
