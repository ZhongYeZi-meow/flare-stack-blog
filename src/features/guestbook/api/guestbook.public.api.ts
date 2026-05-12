import { createServerFn } from "@tanstack/react-start";
import {
  CreateGuestbookInputSchema,
  GetGuestbookInputSchema,
} from "@/features/guestbook/guestbook.schema";
import * as GuestbookService from "@/features/guestbook/guestbook.service";
import {
  authMiddleware,
  createRateLimitMiddleware,
  sessionMiddleware,
  turnstileMiddleware,
} from "@/lib/middlewares";

export const getGuestbookEntriesFn = createServerFn()
  .middleware([sessionMiddleware])
  .inputValidator(GetGuestbookInputSchema)
  .handler(async ({ data, context }) => {
    return await GuestbookService.getPublicEntries(context, data);
  });

export const createGuestbookEntryFn = createServerFn({
  method: "POST",
})
  .middleware([
    createRateLimitMiddleware({
      capacity: 5,
      interval: "1m",
      key: "guestbook:create",
    }),
    turnstileMiddleware,
    authMiddleware,
  ])
  .inputValidator(CreateGuestbookInputSchema)
  .handler(async ({ data, context }) => {
    return await GuestbookService.createEntry(
      context,
      data,
      context.session.user.id,
    );
  });
