import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth.table";
import { createdAt, id } from "./helper";

export const GUESTBOOK_STATUSES = ["published", "hidden"] as const;

export const GuestbookTable = sqliteTable(
  "guestbook",
  {
    id,
    content: text().notNull(),
    status: text("status", { enum: GUESTBOOK_STATUSES })
      .notNull()
      .default("published"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    index("guestbook_created_idx").on(table.createdAt),
    index("guestbook_user_idx").on(table.userId),
    index("guestbook_status_idx").on(table.status, table.createdAt),
  ],
);

export const guestbookRelations = relations(GuestbookTable, ({ one }) => ({
  user: one(user, {
    fields: [GuestbookTable.userId],
    references: [user.id],
  }),
}));

export type GuestbookEntry = typeof GuestbookTable.$inferSelect;
export type GuestbookStatus = (typeof GUESTBOOK_STATUSES)[number];
