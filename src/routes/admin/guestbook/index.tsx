import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  adminDeleteGuestbookFn,
  adminUpdateGuestbookStatusFn,
} from "@/features/guestbook/api/guestbook.admin.api";
import {
  adminGuestbookQuery,
  GUESTBOOK_KEYS,
} from "@/features/guestbook/queries";
import type { GuestbookStatus } from "@/lib/db/schema";
import { m } from "@/paraglide/messages";

const searchSchema = z.object({
  status: z
    .enum(["published", "hidden", "ALL"])
    .optional()
    .default("ALL")
    .catch("ALL"),
  page: z.number().optional().default(1).catch(1),
});

export const Route = createFileRoute("/admin/guestbook/")({
  ssr: false,
  validateSearch: searchSchema,
  component: GuestbookAdminPage,
  loader: () => ({
    title: m.admin_sidebar_guestbook(),
  }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title }],
  }),
});

function GuestbookAdminPage() {
  const { status, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const limit = 20;
  const offset = (page - 1) * limit;
  const queryStatus: GuestbookStatus | undefined =
    status === "ALL" ? undefined : status;

  const { data: result, isLoading } = useQuery(
    adminGuestbookQuery({ offset, limit, status: queryStatus }),
  );
  const entries = result?.data?.entries ?? [];
  const total = result?.data?.total ?? 0;

  const updateStatusMutation = useMutation({
    mutationFn: (params: { id: number; status: GuestbookStatus }) =>
      adminUpdateGuestbookStatusFn({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_KEYS.all });
      toast.success("Status updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteGuestbookFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_KEYS.all });
      toast.success("Entry deleted");
    },
  });

  const handleStatusChange = (newStatus: string) => {
    navigate({ search: (prev) => ({ ...prev, status: newStatus as any, page: 1 }) });
  };

  const tabs = [
    { key: "ALL", label: "全部" },
    { key: "published", label: "已发布" },
    { key: "hidden", label: "已隐藏" },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">
            {m.admin_sidebar_guestbook()}
          </h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            GUESTBOOK MANAGEMENT
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={`relative text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap font-mono ${
                status === tab.key
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === tab.key ? `[ ${tab.label} ]` : tab.label}
            </button>
          ))}
        </nav>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              暂无留言
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/30 bg-card"
                >
                  {entry.user?.image ? (
                    <img
                      src={entry.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {entry.user?.name ?? "Anonymous"}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          entry.status === "published"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-orange-500/10 text-orange-600"
                        }`}
                      >
                        {entry.status}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(
                          typeof entry.createdAt === "number"
                            ? entry.createdAt * 1000
                            : String(entry.createdAt),
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {entry.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {entry.status === "published" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: entry.id,
                            status: "hidden",
                          })
                        }
                        title="Hide"
                      >
                        <EyeOff size={14} />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: entry.id,
                            status: "published",
                          })
                        }
                        title="Publish"
                      >
                        <Eye size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(entry.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: page - 1 }) })
              }
            >
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
