import type { Locale } from "@/lib/i18n";
import { m } from "@/paraglide/messages";
import { EmailLayout } from "./EmailLayout";

interface NewsletterVerificationEmailProps {
  locale: Locale;
  code: string;
}

export const NewsletterVerificationEmail = ({
  locale,
  code,
}: NewsletterVerificationEmailProps) => {
  return (
    <EmailLayout
      locale={locale}
      previewText={m.newsletter_email_subject({}, { locale })}
    >
      <h1
        style={{
          fontFamily: '"Playfair Display", "Georgia", serif',
          fontSize: "20px",
          fontWeight: "500",
          color: "#1a1a1a",
          marginBottom: "24px",
          lineHeight: "1.4",
        }}
      >
        {m.newsletter_email_subject({}, { locale })}
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "#444",
          lineHeight: "1.6",
          marginBottom: "16px",
        }}
      >
        {m.newsletter_email_body({}, { locale })}
      </p>
      <div
        style={{
          marginBottom: "32px",
          textAlign: "center",
          padding: "24px",
          backgroundColor: "#f9f9f9",
          borderRadius: "4px",
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "32px",
            fontWeight: "700",
            letterSpacing: "0.3em",
            color: "#1a1a1a",
          }}
        >
          {code}
        </span>
      </div>
      <p style={{ fontSize: "12px", color: "#999", lineHeight: "1.6" }}>
        {m.newsletter_email_expiry({}, { locale })}
      </p>
      <p
        style={{
          fontSize: "12px",
          color: "#999",
          marginTop: "16px",
          fontStyle: "italic",
        }}
      >
        {m.newsletter_email_ignore({}, { locale })}
      </p>
    </EmailLayout>
  );
};
