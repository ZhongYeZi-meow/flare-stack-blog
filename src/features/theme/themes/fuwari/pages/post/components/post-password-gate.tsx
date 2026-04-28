import { Lock } from "lucide-react";
import { useState } from "react";
import { PostWithTocSchema } from "@/features/posts/schema/posts.schema";
import type { PostWithToc } from "@/features/posts/schema/posts.schema";
import { m } from "@/paraglide/messages";

interface PostPasswordGateProps {
  post: Exclude<PostWithToc, null>;
  onUnlocked: (unlockedPost: Exclude<PostWithToc, null>) => void;
}

export function PostPasswordGate({ post, onUnlocked }: PostPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/post/${post.slug}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError(m.post_password_incorrect());
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        post?: unknown;
      };

      if (data.success && data.post) {
        const parsed = PostWithTocSchema.parse(data.post);
        if (parsed) {
          onUnlocked(parsed);
        } else {
          setError(m.post_password_incorrect());
        }
      } else {
        setError(m.post_password_incorrect());
      }
    } catch {
      setError(m.post_password_incorrect());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Gradient fade overlay */}
      <div className="h-24 bg-gradient-to-b from-transparent to-(--fuwari-card-bg, var(--background))" />

      {/* Password prompt */}
      <div className="flex flex-col items-center pb-10 pt-2 px-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 mb-4">
          <Lock size={20} className="fuwari-text-50" />
        </div>
        <p className="text-sm fuwari-text-50 mb-6 text-center max-w-sm">
          {m.post_password_protected_desc()}
        </p>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-sm">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            placeholder={m.post_password_input_placeholder()}
            className="flex-1 px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm fuwari-text-75 placeholder:fuwari-text-30 focus:outline-none focus:ring-2 focus:ring-(--fuwari-primary)/50 transition"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="px-5 py-2 rounded-lg bg-(--fuwari-primary) text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? "..." : m.post_password_submit()}
          </button>
        </form>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
