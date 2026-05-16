import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { renderToStaticMarkup } from "react-dom/server";
import { z } from "zod";
import { NewsletterVerificationEmail } from "@/features/email/templates/NewsletterVerificationEmail";
import { NewsletterSubscribersTable } from "@/lib/db/schema";
import { serverEnv } from "@/lib/env/server.env";
import { dbMiddleware } from "@/lib/middlewares";
import { m } from "@/paraglide/messages";

function generateCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

const CODE_TTL_MS = 10 * 60 * 1000;

export const subscribeFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      email: z.string().email(),
      name: z.string().max(50).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const existing =
      await context.db.query.NewsletterSubscribersTable?.findFirst({
        where: eq(NewsletterSubscribersTable.email, data.email),
      });

    if (existing?.confirmed) {
      return { success: true, alreadySubscribed: true };
    }

    const code = generateCode();
    const token = `${code}:${Date.now() + CODE_TTL_MS}`;

    if (existing) {
      await context.db
        .update(NewsletterSubscribersTable)
        .set({
          name: data.name ?? existing.name,
          confirmToken: token,
          confirmed: false,
        })
        .where(eq(NewsletterSubscribersTable.email, data.email));
    } else {
      await context.db.insert(NewsletterSubscribersTable).values({
        email: data.email,
        name: data.name ?? null,
        confirmed: false,
        confirmToken: token,
      });
    }

    const { LOCALE } = serverEnv(context.env);
    const emailHtml = renderToStaticMarkup(
      NewsletterVerificationEmail({ locale: LOCALE, code }),
    );

    await context.env.QUEUE.send({
      type: "EMAIL",
      data: {
        to: data.email,
        subject: m.newsletter_email_subject({}, { locale: LOCALE }),
        html: emailHtml,
      },
    });

    return { success: true, alreadySubscribed: false };
  });

export const confirmSubscriptionFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      email: z.string().email(),
      code: z.string().length(6),
    }),
  )
  .handler(async ({ data, context }) => {
    const subscriber =
      await context.db.query.NewsletterSubscribersTable?.findFirst({
        where: eq(NewsletterSubscribersTable.email, data.email),
      });

    if (!subscriber || !subscriber.confirmToken) {
      return { success: false, reason: "INVALID_CODE" as const };
    }

    if (subscriber.confirmed) {
      return { success: true };
    }

    const [storedCode, expiryStr] = subscriber.confirmToken.split(":");
    const expiry = Number(expiryStr);

    if (Date.now() > expiry) {
      return { success: false, reason: "CODE_EXPIRED" as const };
    }

    if (storedCode !== data.code) {
      return { success: false, reason: "INVALID_CODE" as const };
    }

    await context.db
      .update(NewsletterSubscribersTable)
      .set({ confirmed: true, confirmToken: null })
      .where(eq(NewsletterSubscribersTable.email, data.email));

    return { success: true };
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
