import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReactionTargetType } from "@/lib/db/schema";
import { toggleReactionFn } from "../api/reactions.api";
import { REACTIONS_KEYS, reactionsQuery } from "../queries";
import { AVAILABLE_EMOJIS } from "../reactions.schema";

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

  return (
    <div className={cn("flex items-center flex-wrap gap-1.5", className)}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => toggleMutation.mutate(r.emoji)}
          disabled={toggleMutation.isPending}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
            r.hasReacted
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border/40 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50",
          )}
        >
          <span>{r.emoji}</span>
          <span className="tabular-nums">{r.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-border/40 text-muted-foreground hover:border-border hover:bg-muted/50 transition-colors text-sm"
          aria-label="Add reaction"
        >
          +
        </button>

        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1 min-w-[160px]">
              {AVAILABLE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    toggleMutation.mutate(emoji);
                    setShowPicker(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted/50 transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
