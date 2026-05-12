CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  email text NOT NULL,
  name text,
  confirmed integer NOT NULL DEFAULT 0,
  confirm_token text,
  created_at integer DEFAULT (unixepoch()) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_unique ON newsletter_subscribers(email);
