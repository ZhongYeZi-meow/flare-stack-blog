import type { JSONContent } from "@tiptap/react";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./helper";

export const POST_STATUSES = ["draft", "published"] as const;

export const PostsTable = sqliteTable(
  "posts",
  {
    id,
    title: text().notNull(),
    summary: text(),
    readTimeInMinutes: integer("read_time_in_minutes").default(1).notNull(),
    slug: text().notNull().unique(),

    contentJson: text("content_json", { mode: "json" }).$type<JSONContent>(),
    publicContentJson: text("public_content_json", {
      mode: "json",
    }).$type<JSONContent>(),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    pinnedAt: integer("pinned_at", { mode: "timestamp" }),
    accessPassword: text("access_password"),
    commentDisabled: integer("comment_disabled", { mode: "boolean" })
      .default(false)
      .notNull(),
    seriesId: integer("series_id").references(() => SeriesTable.id, {
      onDelete: "set null",
    }),
    seriesOrder: integer("series_order").default(0).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("published_at_idx").on(table.publishedAt, table.status),
    index("created_at_idx").on(table.createdAt),
  ],
);

export const SeriesTable = sqliteTable("series", {
  id,
  title: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  createdAt,
  updatedAt,
});

export const TagsTable = sqliteTable("tags", {
  id,
  name: text().notNull().unique(),
  createdAt,
});

export const PostTagsTable = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => PostsTable.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => TagsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_tag_idx").on(table.tagId),
  ],
);

// ==================== relations ====================
export const postsRelations = relations(PostsTable, ({ many, one }) => ({
  postTags: many(PostTagsTable),
  series: one(SeriesTable, {
    fields: [PostsTable.seriesId],
    references: [SeriesTable.id],
  }),
}));

export const seriesRelations = relations(SeriesTable, ({ many }) => ({
  posts: many(PostsTable),
}));

export const tagsRelations = relations(TagsTable, ({ many }) => ({
  postTags: many(PostTagsTable),
}));

export const postTagsRelations = relations(PostTagsTable, ({ one }) => ({
  post: one(PostsTable, {
    fields: [PostTagsTable.postId],
    references: [PostsTable.id],
  }),
  tag: one(TagsTable, {
    fields: [PostTagsTable.tagId],
    references: [TagsTable.id],
  }),
}));

// ==================== types ====================
export type Tag = typeof TagsTable.$inferSelect;
export type Series = typeof SeriesTable.$inferSelect;
export type Post = typeof PostsTable.$inferSelect;
export type PostStatus = (typeof POST_STATUSES)[number];
