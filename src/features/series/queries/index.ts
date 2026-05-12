import { queryOptions } from "@tanstack/react-query";
import { getAllSeriesFn, getSeriesWithPostsFn } from "../api/series.api";

export const SERIES_KEYS = {
  all: ["series"] as const,
  detail: (id: number) => ["series", id] as const,
};

export const allSeriesQuery = queryOptions({
  queryKey: SERIES_KEYS.all,
  queryFn: () => getAllSeriesFn(),
});

export function seriesWithPostsQuery(seriesId: number) {
  return queryOptions({
    queryKey: SERIES_KEYS.detail(seriesId),
    queryFn: () => getSeriesWithPostsFn({ data: { seriesId } }),
    enabled: seriesId > 0,
  });
}
