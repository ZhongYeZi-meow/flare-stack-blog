import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { GuestbookTable } from "@/lib/db/schema";

const coercedDate = z.union([z.date(), z.string().pipe(z.coerce.date())]);

export const GuestbookSelectSchema = createSelectSchema(GuestbookTable, {
  createdAt: coercedDate,
});
export const GuestbookInsertSchema = createInsertSchema(GuestbookTable);

export const GuestbookUserSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  image: z.string().nullable(),
});

export const GuestbookWithUserSchema = GuestbookSelectSchema.extend({
  user: GuestbookUserSchema.nullable(),
});

export const CreateGuestbookInputSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const GetGuestbookInputSchema = z.object({
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(20),
});

export const AdminGetGuestbookInputSchema = z.object({
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(20),
  status: z.enum(["published", "hidden"]).optional(),
});

export const UpdateGuestbookStatusInputSchema = z.object({
  id: z.number(),
  status: z.enum(["published", "hidden"]),
});

export const DeleteGuestbookInputSchema = z.object({
  id: z.number(),
});
