import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { ReactionsTable } from "@/lib/db/schema";

const coercedDate = z.union([z.date(), z.string().pipe(z.coerce.date())]);

export const ReactionSelectSchema = createSelectSchema(ReactionsTable, {
  createdAt: coercedDate,
});
export const ReactionInsertSchema = createInsertSchema(ReactionsTable);

export const AVAILABLE_EMOJIS = [
  "👍",
  "👎",
  "😄",
  "🎉",
  "❤️",
  "🚀",
  "👀",
  "🤔",
] as const;

export const ToggleReactionInputSchema = z.object({
  targetType: z.enum(["post", "comment", "guestbook"]),
  targetId: z.number(),
  emoji: z.string().min(1).max(10),
});

export const GetReactionsInputSchema = z.object({
  targetType: z.enum(["post", "comment", "guestbook"]),
  targetId: z.number(),
});

export const GetBatchReactionsInputSchema = z.object({
  targetType: z.enum(["post", "comment", "guestbook"]),
  targetIds: z.array(z.number()),
});

export const ReactionSummarySchema = z.object({
  emoji: z.string(),
  count: z.number(),
  hasReacted: z.boolean(),
});

export type ReactionSummary = z.infer<typeof ReactionSummarySchema>;
