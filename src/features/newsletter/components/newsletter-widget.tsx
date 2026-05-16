import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, Mail, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { newsletterEnabledQuery } from "@/features/config/queries";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { confirmSubscriptionFn, subscribeFn } from "../api/newsletter.api";

type Step = "email" | "code" | "done";

const RESEND_COOLDOWN = 60;

export function NewsletterWidget({ className }: { className?: string }) {
  const { data: enabled } = useQuery(newsletterEnabledQuery);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const sendMutation = useMutation({
    mutationFn: (email: string) => subscribeFn({ data: { email } }),
    onSuccess: (result) => {
      if (result.alreadySubscribed) {
        setStep("done");
      } else {
        setStep("code");
        startCountdown();
      }
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (params: { email: string; code: string }) =>
      confirmSubscriptionFn({ data: params }),
    onSuccess: (result) => {
      if (result.success) {
        setStep("done");
      }
    },
  });

  if (!enabled) return null;

  if (step === "done") {
    return (
      <div className={cn("fuwari-card-base p-6 text-center", className)}>
        <CheckCircle
          size={32}
          className="mx-auto mb-3 text-(--fuwari-primary)"
        />
        <p className="text-sm fuwari-text-75 font-medium">
          {m.newsletter_success()}
        </p>
      </div>
    );
  }

  if (step === "code") {
    const errorReason = confirmMutation.data?.success === false
      ? confirmMutation.data.reason
      : null;

    return (
      <div className={cn("fuwari-card-base p-6", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Mail size={18} className="text-(--fuwari-primary)" />
          <h3 className="text-sm font-semibold fuwari-text-75">
            {m.newsletter_title()}
          </h3>
        </div>
        <p className="text-xs fuwari-text-50 mb-4">
          {m.newsletter_code_sent()}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) {
              confirmMutation.mutate({ email, code });
            }
          }}
          className="space-y-3"
        >
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder={m.newsletter_code_placeholder()}
            className="w-full h-9 rounded-lg border border-border/50 bg-muted/20 px-3 text-sm text-center tracking-widest font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-(--fuwari-primary)/50"
          />

          {errorReason && (
            <p className="text-xs text-destructive">
              {errorReason === "CODE_EXPIRED"
                ? m.newsletter_code_expired()
                : m.newsletter_code_invalid()}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={countdown > 0 || sendMutation.isPending}
              onClick={() => sendMutation.mutate(email)}
              className="flex-1 h-9 rounded-lg border border-border/50 text-sm fuwari-text-50 hover:bg-muted/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {sendMutation.isPending ? (
                <Loader2 size={14} className="mx-auto animate-spin" />
              ) : countdown > 0 ? (
                m.newsletter_resend_countdown({ seconds: String(countdown) })
              ) : (
                m.newsletter_resend()
              )}
            </button>
            <button
              type="submit"
              disabled={code.length !== 6 || confirmMutation.isPending}
              className="flex-1 h-9 rounded-lg bg-(--fuwari-primary) text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {confirmMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                m.newsletter_verify()
              )}
            </button>
          </div>
        </form>
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
      <p className="text-xs fuwari-text-50 mb-4">{m.newsletter_desc()}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) sendMutation.mutate(email);
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
          disabled={sendMutation.isPending}
          className="h-9 px-4 rounded-lg bg-(--fuwari-primary) text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {sendMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Send size={14} />
              {m.newsletter_subscribe()}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
