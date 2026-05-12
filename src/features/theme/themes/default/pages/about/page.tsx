import { ArrowUpRight } from "lucide-react";
import type { AboutPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";

export function AboutPage({ author, description, social, sections }: AboutPageProps) {
  return (
    <div className="w-full max-w-3xl mx-auto pb-20 px-6 md:px-0">
      <header className="py-12 md:py-20 space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
          {m.nav_about()}
        </h1>
        <p className="max-w-xl text-base md:text-lg font-light text-muted-foreground leading-relaxed">
          {description}
        </p>
      </header>

      {sections.length > 0 ? (
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <section key={idx} className="border-b border-border/20 pb-10 last:border-b-0">
              {section.title && (
                <h2 className="text-lg font-medium text-foreground mb-4">
                  {section.title}
                </h2>
              )}
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              {m.home_intro_prefix()}
              <span className="font-semibold text-foreground">{author}</span>
              {m.home_intro_separator()}
              {description}
            </p>
          </div>
        </section>
      )}

      {social && social.length > 0 && (
        <section className="mt-20 pt-10 border-t border-border/40">
          <h2 className="text-sm font-medium text-foreground mb-6">Social</h2>
          <div className="flex flex-wrap gap-4">
            {social.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
              >
                <span>{item.label ?? item.platform}</span>
                <ArrowUpRight
                  size={14}
                  className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
