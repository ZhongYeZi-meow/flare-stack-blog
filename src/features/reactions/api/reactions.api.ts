import { createServerFn } from "@tanstack/react-start";
import {
  GetBatchReactionsInputSchema,
  GetReactionsInputSchema,
  ToggleReactionInputSchema,
} from "@/features/reactions/reactions.schema";
import * as ReactionService from "@/features/reactions/reactions.service";
import {
  authMiddleware,
  createRateLimitMiddleware,
  sessionMiddleware,
} from "@/lib/middlewares";

export const getReactionsFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetReactionsInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id;
    return await ReactionService.getReactions(context, data, userId);
  });

export const getBatchReactionsFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetBatchReactionsInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session?.user.id;
    return await ReactionService.getBatchReactions(context, data, userId);
  });

export const toggleReactionFn = createServerFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 30,
      interval: "1m",
      key: "reactions:toggle",
    }),
    authMiddleware,
  ])
  .inputValidator(ToggleReactionInputSchema)
  .handler(async ({ data, context }) => {
    return await ReactionService.toggleReaction(
      context,
      data,
      context.session.user.id,
    );
  });
