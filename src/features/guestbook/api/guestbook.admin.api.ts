import { createServerFn } from "@tanstack/react-start";
import {
  AdminGetGuestbookInputSchema,
  DeleteGuestbookInputSchema,
  UpdateGuestbookStatusInputSchema,
} from "@/features/guestbook/guestbook.schema";
import * as GuestbookService from "@/features/guestbook/guestbook.service";
import { adminMiddleware } from "@/lib/middlewares";

export const adminGetGuestbookFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(AdminGetGuestbookInputSchema)
  .handler(async ({ data, context }) => {
    return await GuestbookService.getAllEntries(context, data);
  });

export const adminUpdateGuestbookStatusFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .inputValidator(UpdateGuestbookStatusInputSchema)
  .handler(async ({ data, context }) => {
    return await GuestbookService.updateStatus(context, data);
  });

export const adminDeleteGuestbookFn = createServerFn({
  method: "POST",
})
  .middleware([adminMiddleware])
  .inputValidator(DeleteGuestbookInputSchema)
  .handler(async ({ data, context }) => {
    return await GuestbookService.deleteEntry(context, data);
  });
