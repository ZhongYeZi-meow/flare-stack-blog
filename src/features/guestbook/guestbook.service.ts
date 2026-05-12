import * as GuestbookRepo from "@/features/guestbook/data/guestbook.data";
import type {
  AdminGetGuestbookInputSchema,
  CreateGuestbookInputSchema,
  DeleteGuestbookInputSchema,
  GetGuestbookInputSchema,
  UpdateGuestbookStatusInputSchema,
} from "@/features/guestbook/guestbook.schema";
import { err, ok } from "@/lib/errors";
import type { z } from "zod";

export async function getPublicEntries(
  context: DbContext,
  data: z.infer<typeof GetGuestbookInputSchema>,
) {
  const [entries, total] = await Promise.all([
    GuestbookRepo.getPublicGuestbookEntries(context.db, data),
    GuestbookRepo.getPublicGuestbookCount(context.db),
  ]);
  return ok({ entries, total });
}

export async function createEntry(
  context: DbContext,
  data: z.infer<typeof CreateGuestbookInputSchema>,
  userId: string,
) {
  const entry = await GuestbookRepo.insertGuestbookEntry(context.db, {
    content: data.content,
    userId,
  });
  return ok(entry);
}

export async function getAllEntries(
  context: DbContext,
  data: z.infer<typeof AdminGetGuestbookInputSchema>,
) {
  const [entries, total] = await Promise.all([
    GuestbookRepo.getAllGuestbookEntries(context.db, data),
    GuestbookRepo.getAllGuestbookCount(context.db, {
      status: data.status,
    }),
  ]);
  return ok({ entries, total });
}

export async function updateStatus(
  context: DbContext,
  data: z.infer<typeof UpdateGuestbookStatusInputSchema>,
) {
  const entry = await GuestbookRepo.updateGuestbookStatus(
    context.db,
    data.id,
    data.status,
  );
  if (!entry) return err({ reason: "not_found" as const });
  return ok(entry);
}

export async function deleteEntry(
  context: DbContext,
  data: z.infer<typeof DeleteGuestbookInputSchema>,
) {
  await GuestbookRepo.deleteGuestbookEntry(context.db, data.id);
  return ok(null);
}
