import { Github, Globe, MessageCircle } from "lucide-react";
import type { AboutPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  qq: MessageCircle,
};

export function AboutPage({ author, description, social, sections }: AboutPageProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className="fuwari-card-base p-6 md:p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-56 fuwari-onload-animation bg-linear-to-br from-(--fuwari-primary)/5 to-transparent"
        style={{ animationDelay: "150ms" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold fuwari-text-90 mb-4 z-10 transition-colors">
          {m.nav_about()}
        </h1>
        <p className="fuwari-text-50 text-center max-w-xl z-10 transition-colors">
          {description}
        </p>
      </div>

      {sections.length > 0 ? (
        sections.map((section, idx) => (
          <div
            key={idx}
            className="fuwari-card-base p-6 md:p-8 fuwari-onload-animation"
            style={{ animationDelay: `${300 + idx * 150}ms` }}
          >
            {section.title && (
              <h2 className="text-xl font-bold fuwari-text-90 mb-4 transition-colors">
                {section.title}
              </h2>
            )}
            <div className="fuwari-text-75 leading-relaxed whitespace-pre-wrap">
              {section.content}
            </div>
          </div>
        ))
      ) : (
        <div
          className="fuwari-card-base p-6 md:p-8 fuwari-onload-animation"
          style={{ animationDelay: "300ms" }}
        >
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg fuwari-text-75 leading-relaxed">
              {m.home_intro_prefix()}
              <span className="font-semibold fuwari-text-90">{author}</span>
              {m.home_intro_separator()}
              {description}
            </p>
          </div>
        </div>
      )}

      {social && social.length > 0 && (
        <div
          className="fuwari-card-base p-6 md:p-8 fuwari-onload-animation"
          style={{ animationDelay: `${300 + Math.max(sections.length, 1) * 150}ms` }}
        >
          <h2 className="text-xl font-bold fuwari-text-90 mb-4 transition-colors">
            Social
          </h2>
          <div className="flex flex-wrap gap-3">
            {social.map((item, idx) => {
              const Icon =
                PLATFORM_ICONS[item.platform?.toLowerCase()] ?? Globe;
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-(--fuwari-btn-regular-bg) text-(--fuwari-btn-content) hover:bg-(--fuwari-btn-regular-bg-hover) active:bg-(--fuwari-btn-regular-bg-active) active:scale-95 transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {item.label ?? item.platform}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
