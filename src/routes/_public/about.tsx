import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import theme from "@theme";
import { aboutPageQuery } from "@/features/config/queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/about")({
  component: AboutPage,
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(aboutPageQuery);
  },
  head: () => ({
    meta: [
      {
        title: m.nav_about(),
      },
    ],
  }),
});

function AboutPage() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const { data: aboutConfig } = useSuspenseQuery(aboutPageQuery);

  return (
    <theme.AboutPage
      author={siteConfig.author}
      description={siteConfig.description}
      subtitle={aboutConfig.subtitle}
      social={aboutConfig.showSocial ? (siteConfig.social ?? []) : []}
      sections={aboutConfig.sections}
    />
  );
}
