import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SmilePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReactionTargetType } from "@/lib/db/schema";
import { toggleReactionFn } from "../api/reactions.api";
import { REACTIONS_KEYS, reactionsQuery } from "../queries";
import { AVAILABLE_EMOJIS } from "../reactions.schema";

const EMOJI_LABELS: Record<string, string> = {
  "👍": "Thumbs up",
  "👎": "Thumbs down",
  "😄": "Laugh",
  "🎉": "Hooray",
  "❤️": "Heart",
  "🚀": "Rocket",
  "👀": "Eyes",
  "🤔": "Confused",
};

interface ReactionPickerProps {
  targetType: ReactionTargetType;
  targetId: number;
  className?: string;
}

export function ReactionPicker({
  targetType,
  targetId,
  className,
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const { data: result } = useQuery(reactionsQuery(targetType, targetId));
  const reactions = result?.data ?? [];

  const toggleMutation = useMutation({
    mutationFn: (emoji: string) =>
      toggleReactionFn({ data: { targetType, targetId, emoji } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REACTIONS_KEYS.target(targetType, targetId),
      });
    },
  });

  useEffect(() => {
    if (!showPicker) return;
    const handleClick = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showPicker]);

  const hasAnyReactions = reactions.length > 0;

  return (
    <div className={cn("flex items-center flex-wrap gap-1.5", className)}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => toggleMutation.mutate(r.emoji)}
          disabled={toggleMutation.isPending}
          title={`${EMOJI_LABELS[r.emoji] ?? r.emoji} — ${r.count}`}
          className={cn(
            "group inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm border transition-all duration-200",
            "hover:scale-105 active:scale-95",
            r.hasReacted
              ? "border-blue-400/60 bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:border-blue-500/40 dark:bg-blue-500/15 shadow-sm shadow-blue-500/10"
              : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40",
          )}
        >
          <span className="text-base leading-none">{r.emoji}</span>
          <span className="tabular-nums font-medium text-xs">{r.count}</span>
        </button>
      ))}

      <div className="relative" ref={pickerRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          title="Add reaction"
          className={cn(
            "inline-flex items-center justify-center rounded-full border transition-all duration-200",
            "hover:scale-105 active:scale-95",
            hasAnyReactions
              ? "w-8 h-8 border-dashed border-border/40 text-muted-foreground/60 hover:border-border hover:bg-muted/40 hover:text-muted-foreground"
              : "h-8 px-3 gap-1.5 border-border/40 text-muted-foreground/60 hover:border-border hover:bg-muted/40 hover:text-muted-foreground",
            showPicker && "border-border bg-muted/50 text-muted-foreground",
          )}
        >
          <SmilePlus size={16} strokeWidth={1.5} />
        </button>

        {showPicker && (
          <div
            className={cn(
              "absolute z-50 mt-2",
              "bg-popover/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl shadow-black/10",
              "p-1.5",
              "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150",
              "bottom-full left-0 mb-1",
            )}
          >
            <div className="flex items-center gap-0.5">
              {AVAILABLE_EMOJIS.map((emoji) => {
                const existing = reactions.find((r) => r.emoji === emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      toggleMutation.mutate(emoji);
                      setShowPicker(false);
                    }}
                    title={EMOJI_LABELS[emoji] ?? emoji}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-lg text-xl transition-all duration-150",
                      "hover:bg-blue-500/15 hover:scale-125",
                      "active:scale-100",
                      existing?.hasReacted &&
                        "bg-blue-500/10 ring-1 ring-blue-400/30",
                    )}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
