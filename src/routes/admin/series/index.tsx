import { createFileRoute } from "@tanstack/react-router";
import { SeriesManager } from "@/features/series/components/series-manager";
import { allSeriesWithPostCountQuery } from "@/features/series/queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/series/")({
  ssr: "data-only",
  component: SeriesManagerRoute,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(allSeriesWithPostCountQuery);
    return {
      title: m.series_manager_title(),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
    ],
  }),
});

function SeriesManagerRoute() {
  return <SeriesManager />;
}
