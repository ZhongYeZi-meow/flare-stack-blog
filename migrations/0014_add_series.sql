CREATE TABLE IF NOT EXISTS series (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at integer DEFAULT (unixepoch()) NOT NULL,
  updated_at integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS series_slug_unique ON series(slug);

ALTER TABLE posts ADD COLUMN series_id integer REFERENCES series(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN series_order integer NOT NULL DEFAULT 0;
