CREATE TABLE `guestbook` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `content` text NOT NULL,
  `status` text DEFAULT 'published' NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE cascade,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX `guestbook_created_idx` ON `guestbook` (`created_at`);
CREATE INDEX `guestbook_user_idx` ON `guestbook` (`user_id`);
CREATE INDEX `guestbook_status_idx` ON `guestbook` (`status`, `created_at`);

CREATE TABLE `reactions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE cascade,
  `target_type` text NOT NULL,
  `target_id` integer NOT NULL,
  `emoji` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

CREATE UNIQUE INDEX `reactions_unique_idx` ON `reactions` (`user_id`, `target_type`, `target_id`, `emoji`);
CREATE INDEX `reactions_target_idx` ON `reactions` (`target_type`, `target_id`);
