import type { SocialPlatform } from "@/features/config/utils/social-platforms";
import {
  resolveSocialHref,
  SOCIAL_PLATFORMS,
} from "@/features/config/utils/social-platforms";
import type { AboutPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";

export function AboutPage({
  author,
  description,
  subtitle,
  social,
  sections,
}: AboutPageProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className="fuwari-card-base p-6 md:p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-56 fuwari-onload-animation bg-linear-to-br from-(--fuwari-primary)/5 to-transparent"
        style={{ animationDelay: "150ms" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold fuwari-text-90 z-10 transition-colors">
          {m.nav_about()}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm fuwari-text-50 z-10 text-center max-w-md">
            {subtitle}
          </p>
        )}
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
          style={{
            animationDelay: `${300 + Math.max(sections.length, 1) * 150}ms`,
          }}
        >
          <h2 className="text-xl font-bold fuwari-text-90 mb-4 transition-colors">
            Social
          </h2>
          <div className="flex flex-wrap gap-2">
            {social
              .filter((item) => item.url && !item.hidden)
              .map((item, idx) => {
                const platform = item.platform as SocialPlatform;
                const preset =
                  platform !== "custom" ? SOCIAL_PLATFORMS[platform] : null;
                const Icon = preset?.icon;
                const label = preset?.label ?? item.label ?? item.platform;
                const href = resolveSocialHref(platform, item.url);

                return (
                  <a
                    key={`${item.platform}-${idx}`}
                    href={href}
                    target={
                      platform === "email" || platform === "qq"
                        ? undefined
                        : "_blank"
                    }
                    rel={
                      platform === "email" || platform === "qq"
                        ? undefined
                        : "me noreferrer"
                    }
                    aria-label={label}
                    className="fuwari-btn-regular rounded-lg h-10 w-10 active:scale-90 hover:text-(--fuwari-primary) transition-colors"
                  >
                    {Icon ? (
                      <Icon size={20} strokeWidth={1.5} />
                    ) : item.icon ? (
                      <img src={item.icon} alt={label} className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-medium">
                        {label.slice(0, 2)}
                      </span>
                    )}
                  </a>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
