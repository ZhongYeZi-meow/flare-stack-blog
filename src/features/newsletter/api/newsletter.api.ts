import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { NewsletterSubscribersTable } from "@/lib/db/schema";
import { dbMiddleware } from "@/lib/middlewares";

export const subscribeFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      email: z.string().email(),
      name: z.string().max(50).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const existing = await context.db.query.NewsletterSubscribersTable?.findFirst({
      where: eq(NewsletterSubscribersTable.email, data.email),
    });

    if (existing) {
      return { success: true, alreadySubscribed: true };
    }

    const token = crypto.randomUUID();
    await context.db.insert(NewsletterSubscribersTable).values({
      email: data.email,
      name: data.name ?? null,
      confirmed: true,
      confirmToken: token,
    });

    return { success: true, alreadySubscribed: false };
  });

export const unsubscribeNewsletterFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    await context.db
      .delete(NewsletterSubscribersTable)
      .where(eq(NewsletterSubscribersTable.email, data.email));
    return { success: true };
  });
