import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

interface ShareButtonsProps {
  title: string;
  className?: string;
}

export function ShareButtons({ title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const shareToTwitter = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={shareToTwitter}
        title={m.share_twitter()}
        className="fuwari-btn-regular rounded-lg h-9 w-9 active:scale-90 hover:text-(--fuwari-primary) transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      <button
        onClick={handleCopyLink}
        title={m.share_copy_link()}
        className={cn(
          "fuwari-btn-regular rounded-lg h-9 w-9 active:scale-90 transition-colors",
          copied
            ? "text-green-500"
            : "hover:text-(--fuwari-primary)",
        )}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>

      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNativeShare}
          title={m.share_more()}
          className="fuwari-btn-regular rounded-lg h-9 w-9 active:scale-90 hover:text-(--fuwari-primary) transition-colors"
        >
          <Share2 size={16} />
        </button>
      )}
    </div>
  );
}
