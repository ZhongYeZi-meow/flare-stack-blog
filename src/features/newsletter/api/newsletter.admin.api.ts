import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { NewsletterSubscribersTable } from "@/lib/db/schema";
import { dbMiddleware } from "@/lib/middlewares";

export const getNewsletterSubscribersFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(
    z
      .object({
        filter: z.enum(["all", "confirmed", "pending"]).optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    const filter = data?.filter ?? "all";

    let query = context.db
      .select({
        id: NewsletterSubscribersTable.id,
        email: NewsletterSubscribersTable.email,
        name: NewsletterSubscribersTable.name,
        confirmed: NewsletterSubscribersTable.confirmed,
        createdAt: NewsletterSubscribersTable.createdAt,
      })
      .from(NewsletterSubscribersTable);

    if (filter === "confirmed") {
      query = query.where(
        eq(NewsletterSubscribersTable.confirmed, true),
      ) as typeof query;
    } else if (filter === "pending") {
      query = query.where(
        eq(NewsletterSubscribersTable.confirmed, false),
      ) as typeof query;
    }

    return await query.orderBy(
      desc(NewsletterSubscribersTable.createdAt),
    );
  });

export const getNewsletterStatsFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const [totalResult] = await context.db
      .select({ count: count() })
      .from(NewsletterSubscribersTable);
    const [confirmedResult] = await context.db
      .select({ count: count() })
      .from(NewsletterSubscribersTable)
      .where(eq(NewsletterSubscribersTable.confirmed, true));

    const total = totalResult?.count ?? 0;
    const confirmed = confirmedResult?.count ?? 0;
    return { total, confirmed, pending: total - confirmed };
  });

export const deleteNewsletterSubscriberFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data, context }) => {
    await context.db
      .delete(NewsletterSubscribersTable)
      .where(eq(NewsletterSubscribersTable.id, data.id));
    return { success: true };
  });
