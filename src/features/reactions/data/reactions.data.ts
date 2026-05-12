import { and, count, eq, inArray } from "drizzle-orm";
import { ReactionsTable } from "@/lib/db/schema";
import type { ReactionTargetType } from "@/lib/db/schema";

export async function findUserReaction(
  db: DB,
  userId: string,
  targetType: ReactionTargetType,
  targetId: number,
  emoji: string,
) {
  return await db.query.ReactionsTable.findFirst({
    where: and(
      eq(ReactionsTable.userId, userId),
      eq(ReactionsTable.targetType, targetType),
      eq(ReactionsTable.targetId, targetId),
      eq(ReactionsTable.emoji, emoji),
    ),
  });
}

export async function insertReaction(
  db: DB,
  data: typeof ReactionsTable.$inferInsert,
) {
  const [reaction] = await db
    .insert(ReactionsTable)
    .values(data)
    .returning();
  return reaction;
}

export async function deleteReaction(db: DB, id: number) {
  await db.delete(ReactionsTable).where(eq(ReactionsTable.id, id));
}

export async function getReactionSummary(
  db: DB,
  targetType: ReactionTargetType,
  targetId: number,
  userId?: string,
) {
  const reactions = await db
    .select({
      emoji: ReactionsTable.emoji,
      count: count(),
    })
    .from(ReactionsTable)
    .where(
      and(
        eq(ReactionsTable.targetType, targetType),
        eq(ReactionsTable.targetId, targetId),
      ),
    )
    .groupBy(ReactionsTable.emoji);

  if (!userId) {
    return reactions.map((r) => ({
      emoji: r.emoji,
      count: r.count,
      hasReacted: false,
    }));
  }

  const userReactions = await db
    .select({ emoji: ReactionsTable.emoji })
    .from(ReactionsTable)
    .where(
      and(
        eq(ReactionsTable.userId, userId),
        eq(ReactionsTable.targetType, targetType),
        eq(ReactionsTable.targetId, targetId),
      ),
    );

  const userEmojiSet = new Set(userReactions.map((r) => r.emoji));

  return reactions.map((r) => ({
    emoji: r.emoji,
    count: r.count,
    hasReacted: userEmojiSet.has(r.emoji),
  }));
}

export async function getBatchReactionSummary(
  db: DB,
  targetType: ReactionTargetType,
  targetIds: number[],
  userId?: string,
) {
  if (targetIds.length === 0) return {};

  const reactions = await db
    .select({
      targetId: ReactionsTable.targetId,
      emoji: ReactionsTable.emoji,
      count: count(),
    })
    .from(ReactionsTable)
    .where(
      and(
        eq(ReactionsTable.targetType, targetType),
        inArray(ReactionsTable.targetId, targetIds),
      ),
    )
    .groupBy(ReactionsTable.targetId, ReactionsTable.emoji);

  let userReactionSet = new Set<string>();
  if (userId) {
    const userReactions = await db
      .select({
        targetId: ReactionsTable.targetId,
        emoji: ReactionsTable.emoji,
      })
      .from(ReactionsTable)
      .where(
        and(
          eq(ReactionsTable.userId, userId),
          eq(ReactionsTable.targetType, targetType),
          inArray(ReactionsTable.targetId, targetIds),
        ),
      );
    userReactionSet = new Set(
      userReactions.map((r) => `${r.targetId}:${r.emoji}`),
    );
  }

  const result: Record<
    number,
    Array<{ emoji: string; count: number; hasReacted: boolean }>
  > = {};

  for (const r of reactions) {
    if (!result[r.targetId]) result[r.targetId] = [];
    result[r.targetId].push({
      emoji: r.emoji,
      count: r.count,
      hasReacted: userReactionSet.has(`${r.targetId}:${r.emoji}`),
    });
  }

  return result;
}
