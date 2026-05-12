import { queryOptions } from "@tanstack/react-query";
import type { ReactionTargetType } from "@/lib/db/schema";
import {
  getBatchReactionsFn,
  getReactionsFn,
} from "../api/reactions.api";

export const REACTIONS_KEYS = {
  all: ["reactions"] as const,
  target: (type: string, id: number) => ["reactions", type, id] as const,
  batch: (type: string, ids: number[]) =>
    ["reactions", "batch", type, ids] as const,
};

export function reactionsQuery(
  targetType: ReactionTargetType,
  targetId: number,
) {
  return queryOptions({
    queryKey: REACTIONS_KEYS.target(targetType, targetId),
    queryFn: () => getReactionsFn({ data: { targetType, targetId } }),
  });
}

export function batchReactionsQuery(
  targetType: ReactionTargetType,
  targetIds: number[],
) {
  return queryOptions({
    queryKey: REACTIONS_KEYS.batch(targetType, targetIds),
    queryFn: () => getBatchReactionsFn({ data: { targetType, targetIds } }),
    enabled: targetIds.length > 0,
  });
}
