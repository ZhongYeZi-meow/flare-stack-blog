import * as ReactionRepo from "@/features/reactions/data/reactions.data";
import type {
  GetBatchReactionsInputSchema,
  GetReactionsInputSchema,
  ToggleReactionInputSchema,
} from "@/features/reactions/reactions.schema";
import { ok } from "@/lib/errors";
import type { z } from "zod";

export async function toggleReaction(
  context: DbContext,
  data: z.infer<typeof ToggleReactionInputSchema>,
  userId: string,
) {
  const existing = await ReactionRepo.findUserReaction(
    context.db,
    userId,
    data.targetType,
    data.targetId,
    data.emoji,
  );

  if (existing) {
    await ReactionRepo.deleteReaction(context.db, existing.id);
    return ok({ action: "removed" as const });
  }

  await ReactionRepo.insertReaction(context.db, {
    userId,
    targetType: data.targetType,
    targetId: data.targetId,
    emoji: data.emoji,
  });
  return ok({ action: "added" as const });
}

export async function getReactions(
  context: DbContext,
  data: z.infer<typeof GetReactionsInputSchema>,
  userId?: string,
) {
  const summary = await ReactionRepo.getReactionSummary(
    context.db,
    data.targetType,
    data.targetId,
    userId,
  );
  return ok(summary);
}

export async function getBatchReactions(
  context: DbContext,
  data: z.infer<typeof GetBatchReactionsInputSchema>,
  userId?: string,
) {
  const summary = await ReactionRepo.getBatchReactionSummary(
    context.db,
    data.targetType,
    data.targetIds,
    userId,
  );
  return ok(summary);
}
