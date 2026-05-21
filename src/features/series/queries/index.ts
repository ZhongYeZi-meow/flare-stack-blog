import { queryOptions } from "@tanstack/react-query";
import {
  getAllSeriesFn,
  getAllSeriesWithPostCountFn,
  getSeriesWithPostsFn,
} from "../api/series.api";

export const SERIES_KEYS = {
  all: ["series"] as const,
  admin: ["series", "admin"] as const,
  detail: (id: number) => ["series", id] as const,
};

export const allSeriesQuery = queryOptions({
  queryKey: SERIES_KEYS.all,
  queryFn: () => getAllSeriesFn(),
});

export const allSeriesWithPostCountQuery = queryOptions({
  queryKey: SERIES_KEYS.admin,
  queryFn: () => getAllSeriesWithPostCountFn(),
});

export function seriesWithPostsQuery(seriesId: number) {
  return queryOptions({
    queryKey: SERIES_KEYS.detail(seriesId),
    queryFn: () => getSeriesWithPostsFn({ data: { seriesId } }),
    enabled: seriesId > 0,
  });
}
