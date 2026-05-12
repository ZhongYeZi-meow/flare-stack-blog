import { relations } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth.table";
import { createdAt, id } from "./helper";

export const REACTION_TARGET_TYPES = ["post", "comment", "guestbook"] as const;

export const ReactionsTable = sqliteTable(
  "reactions",
  {
    id,
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: REACTION_TARGET_TYPES }).notNull(),
    targetId: integer("target_id").notNull(),
    emoji: text().notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("reactions_unique_idx").on(
      table.userId,
      table.targetType,
      table.targetId,
      table.emoji,
    ),
    index("reactions_target_idx").on(table.targetType, table.targetId),
  ],
);

export const reactionsRelations = relations(ReactionsTable, ({ one }) => ({
  user: one(user, {
    fields: [ReactionsTable.userId],
    references: [user.id],
  }),
}));

export type Reaction = typeof ReactionsTable.$inferSelect;
export type ReactionTargetType = (typeof REACTION_TARGET_TYPES)[number];
