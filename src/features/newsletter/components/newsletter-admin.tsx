import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { deleteNewsletterSubscriberFn } from "@/features/newsletter/api/newsletter.admin.api";
import {
  NEWSLETTER_KEYS,
  newsletterStatsQuery,
  newsletterSubscribersQuery,
} from "@/features/newsletter/queries";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

type FilterTab = "all" | "confirmed" | "pending";

export function NewsletterAdmin() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriberToDelete, setSubscriberToDelete] = useState<{
    id: number;
    email: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: stats } = useQuery(newsletterStatsQuery);
  const { data: subscribers = [], isLoading } = useQuery(
    newsletterSubscribersQuery(filter),
  );

  const filteredSubscribers = useMemo(() => {
    if (!searchTerm) return subscribers;
    const term = searchTerm.toLowerCase();
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(term) ||
        s.name?.toLowerCase().includes(term),
    );
  }, [subscribers, searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNewsletterSubscriberFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_KEYS.all });
      setSubscriberToDelete(null);
      toast.success(m.newsletter_admin_deleted());
    },
    onError: () => {
      toast.error(m.newsletter_admin_delete_fail());
    },
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: m.newsletter_admin_tab_all() },
    { key: "confirmed", label: m.newsletter_admin_tab_confirmed() },
    { key: "pending", label: m.newsletter_admin_tab_pending() },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/30">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            {m.newsletter_admin_title()}
          </h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            {m.newsletter_admin_subtitle()}
          </p>
        </div>

        <div className="relative group w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors"
            size={14}
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={m.newsletter_admin_search_placeholder()}
            className="pl-9 h-9 bg-transparent border-b border-border/50 rounded-none focus:border-foreground focus:ring-0 pr-0 transition-all font-mono text-xs"
          />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: m.newsletter_admin_stat_total(),
              value: stats.total,
              suffix: m.newsletter_admin_stat_unit(),
            },
            {
              label: m.newsletter_admin_stat_confirmed(),
              value: stats.confirmed,
              suffix: m.newsletter_admin_stat_unit(),
            },
            {
              label: m.newsletter_admin_stat_pending(),
              value: stats.pending,
              suffix: m.newsletter_admin_stat_unit(),
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 border border-border/30 bg-background/50 hover:bg-accent/5 transition-colors group"
            >
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-mono mb-2 group-hover:text-foreground transition-colors">
                {stat.label}
              </div>
              <div className="text-3xl font-serif text-foreground">
                {stat.value}
                <span className="text-xs text-muted-foreground ml-2 font-mono">
                  {stat.suffix}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "relative text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap font-mono",
              filter === tab.key
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {filter === tab.key ? `[ ${tab.label} ]` : tab.label}
          </button>
        ))}
      </nav>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border border-border/30 bg-background animate-pulse space-y-3"
            >
              <div className="h-4 w-40 bg-accent rounded" />
              <div className="h-3 w-20 bg-accent rounded" />
            </div>
          ))
        ) : filteredSubscribers.length > 0 ? (
          filteredSubscribers.map((sub) => (
            <div
              key={sub.id}
              className="p-4 border border-border/30 bg-background space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground/50" />
                    <span className="font-medium text-foreground text-sm">
                      {sub.email}
                    </span>
                  </div>
                  {sub.name && (
                    <p className="text-xs text-muted-foreground ml-5">
                      {sub.name}
                    </p>
                  )}
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 border",
                    sub.confirmed
                      ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900 dark:bg-emerald-950"
                      : "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:bg-amber-950",
                  )}
                >
                  {sub.confirmed
                    ? m.newsletter_admin_status_confirmed()
                    : m.newsletter_admin_status_pending()}
                </span>
              </div>
              <div className="flex items-center justify-end border-t border-border/30 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-red-500"
                  onClick={() =>
                    setSubscriberToDelete({ id: sub.id, email: sub.email })
                  }
                >
                  [ {m.newsletter_admin_delete()} ]
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border border-border/30 bg-background text-muted-foreground">
            <span className="text-xs font-serif italic">
              {m.newsletter_admin_no_match()}
            </span>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-background border border-border/30 rounded-none shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/30 bg-muted/5">
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal">
                  {m.newsletter_admin_col_email()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal">
                  {m.newsletter_admin_col_name()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal">
                  {m.newsletter_admin_col_status()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal hidden lg:table-cell">
                  {m.newsletter_admin_col_subscribed()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal text-right">
                  {m.newsletter_admin_col_actions()}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6">
                      <div className="h-4 w-40 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-20 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-16 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6 hidden lg:table-cell">
                      <div className="h-4 w-24 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-16 bg-accent rounded-none ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="group hover:bg-muted/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-muted-foreground/30" />
                        <span className="text-foreground tracking-tight font-mono text-sm">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {sub.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 border",
                          sub.confirmed
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900 dark:bg-emerald-950"
                            : "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:bg-amber-950",
                        )}
                      >
                        {sub.confirmed
                          ? m.newsletter_admin_status_confirmed()
                          : m.newsletter_admin_status_pending()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-muted-foreground/60 font-mono hidden lg:table-cell">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] font-mono text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-none"
                        onClick={() =>
                          setSubscriberToDelete({
                            id: sub.id,
                            email: sub.email,
                          })
                        }
                      >
                        [ {m.newsletter_admin_delete()} ]
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center space-y-4">
                    <Search size={24} className="opacity-20 mx-auto" />
                    <div className="text-muted-foreground font-serif text-sm italic">
                      {m.newsletter_admin_no_match()}
                    </div>
                    {searchTerm && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="text-[10px] uppercase tracking-widest h-auto p-0 text-muted-foreground hover:text-foreground"
                      >
                        [ {m.newsletter_admin_clear_search()} ]
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!subscriberToDelete}
        onClose={() => setSubscriberToDelete(null)}
        onConfirm={() =>
          subscriberToDelete &&
          deleteMutation.mutate(subscriberToDelete.id)
        }
        title={m.newsletter_admin_delete_title()}
        message={
          subscriberToDelete
            ? m.newsletter_admin_delete_desc({
                email: subscriberToDelete.email,
              })
            : ""
        }
        confirmLabel={m.newsletter_admin_delete_confirm()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
