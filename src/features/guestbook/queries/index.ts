import { queryOptions } from "@tanstack/react-query";
import type { GuestbookStatus } from "@/lib/db/schema";
import { adminGetGuestbookFn } from "../api/guestbook.admin.api";
import { getGuestbookEntriesFn } from "../api/guestbook.public.api";

export const GUESTBOOK_KEYS = {
  all: ["guestbook"] as const,
  public: (offset: number) => ["guestbook", "public", offset] as const,
  admin: ["guestbook", "admin"] as const,
};

export function guestbookQuery(offset = 0, limit = 20) {
  return queryOptions({
    queryKey: GUESTBOOK_KEYS.public(offset),
    queryFn: () => getGuestbookEntriesFn({ data: { offset, limit } }),
  });
}

export function adminGuestbookQuery(
  options: {
    offset?: number;
    limit?: number;
    status?: GuestbookStatus;
  } = {},
) {
  return queryOptions({
    queryKey: [...GUESTBOOK_KEYS.admin, options],
    queryFn: () => adminGetGuestbookFn({ data: options }),
  });
}
