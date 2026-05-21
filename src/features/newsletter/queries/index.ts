import { queryOptions } from "@tanstack/react-query";
import {
  getNewsletterStatsFn,
  getNewsletterSubscribersFn,
} from "../api/newsletter.admin.api";

export const NEWSLETTER_KEYS = {
  all: ["newsletter"] as const,
  stats: ["newsletter", "stats"] as const,
  subscribers: (filter: string) =>
    ["newsletter", "subscribers", filter] as const,
};

export const newsletterStatsQuery = queryOptions({
  queryKey: NEWSLETTER_KEYS.stats,
  queryFn: () => getNewsletterStatsFn(),
});

export function newsletterSubscribersQuery(
  filter: "all" | "confirmed" | "pending" = "all",
) {
  return queryOptions({
    queryKey: NEWSLETTER_KEYS.subscribers(filter),
    queryFn: () => getNewsletterSubscribersFn({ data: { filter } }),
  });
}
