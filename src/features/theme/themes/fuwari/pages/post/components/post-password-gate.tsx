import { Lock } from "lucide-react";
import { useState } from "react";
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

      const data = await res.json();

      if (data.success && data.post) {
        onUnlocked(data.post);
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
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 mb-6">
        <Lock size={28} className="fuwari-text-50" />
      </div>
      <h2 className="text-2xl font-bold fuwari-text-90 mb-2">
        {m.post_password_protected_title()}
      </h2>
      <p className="text-sm fuwari-text-50 mb-8 text-center max-w-sm">
        {m.post_password_protected_desc()}
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError("");
          }}
          placeholder={m.post_password_input_placeholder()}
          className="w-full px-4 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm fuwari-text-75 placeholder:fuwari-text-30 focus:outline-none focus:ring-2 focus:ring-(--fuwari-primary)/50 transition"
          autoFocus
        />
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full px-4 py-2.5 rounded-lg bg-(--fuwari-primary) text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : m.post_password_submit()}
        </button>
      </form>
    </div>
  );
}
