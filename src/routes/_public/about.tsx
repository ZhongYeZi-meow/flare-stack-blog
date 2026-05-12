import { createFileRoute, useRouteContext } from "@tanstack/react-router";
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
    <div className="max-w-3xl mx-auto px-6 md:px-0 py-12">
      <header className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          {m.nav_about()}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {siteConfig.description}
        </p>
      </header>

      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            {m.home_intro_prefix()}
            <span className="font-semibold text-foreground">
              {siteConfig.author}
            </span>
            {m.home_intro_separator()}
            {siteConfig.description}
          </p>
        </div>
      </section>

      {siteConfig.social && siteConfig.social.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border/40">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground mb-6">
            Social
          </h2>
          <div className="flex flex-wrap gap-4">
            {siteConfig.social.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label ?? item.platform}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
