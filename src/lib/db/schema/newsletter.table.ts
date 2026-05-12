import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id } from "./helper";

export const NewsletterSubscribersTable = sqliteTable("newsletter_subscribers", {
  id,
  email: text().notNull().unique(),
  name: text(),
  confirmed: integer({ mode: "boolean" }).default(false).notNull(),
  confirmToken: text("confirm_token"),
  createdAt,
});

export type NewsletterSubscriber = typeof NewsletterSubscribersTable.$inferSelect;
