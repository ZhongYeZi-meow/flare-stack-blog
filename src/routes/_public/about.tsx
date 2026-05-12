import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import theme from "@theme";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/about")({
  component: AboutPage,
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

  return (
    <theme.AboutPage
      author={siteConfig.author}
      description={siteConfig.description}
      social={siteConfig.social ?? []}
    />
  );
}
