import { useMutation } from "@tanstack/react-query";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { subscribeFn } from "../api/newsletter.api";

export function NewsletterWidget({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (email: string) => subscribeFn({ data: { email } }),
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
    },
  });

  if (submitted) {
    return (
      <div className={cn("fuwari-card-base p-6 text-center", className)}>
        <Mail size={32} className="mx-auto mb-3 text-(--fuwari-primary)" />
        <p className="text-sm fuwari-text-75 font-medium">
          {m.newsletter_success()}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("fuwari-card-base p-6", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Mail size={18} className="text-(--fuwari-primary)" />
        <h3 className="text-sm font-semibold fuwari-text-75">
          {m.newsletter_title()}
        </h3>
      </div>
      <p className="text-xs fuwari-text-50 mb-4">
        {m.newsletter_desc()}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) mutation.mutate(email);
        }}
        className="flex gap-2"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={m.newsletter_placeholder()}
          required
          className="flex-1 h-9 rounded-lg border border-border/50 bg-muted/20 px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-(--fuwari-primary)/50"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-9 px-4 rounded-lg bg-(--fuwari-primary) text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send size={14} />
          {m.newsletter_subscribe()}
        </button>
      </form>
    </div>
  );
}
