import { createFileRoute } from "@tanstack/react-router";
import { NewsletterAdmin } from "@/features/newsletter/components/newsletter-admin";
import { newsletterStatsQuery } from "@/features/newsletter/queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/newsletter/")({
  ssr: false,
  component: NewsletterAdminRoute,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(newsletterStatsQuery);
    return {
      title: m.newsletter_admin_title(),
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

function NewsletterAdminRoute() {
  return <NewsletterAdmin />;
}
