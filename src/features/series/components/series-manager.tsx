import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import {
  createSeriesFn,
  deleteSeriesFn,
  updateSeriesFn,
} from "@/features/series/api/series.api";
import {
  SERIES_KEYS,
  allSeriesWithPostCountQuery,
} from "@/features/series/queries";
import { m } from "@/paraglide/messages";

export function SeriesManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [seriesToDelete, setSeriesToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [seriesToEdit, setSeriesToEdit] = useState<{
    id: number;
    title: string;
    slug: string;
    description: string | null;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const queryClient = useQueryClient();

  const { data: seriesList = [], isLoading } = useQuery(
    allSeriesWithPostCountQuery,
  );

  const filteredSeries = useMemo(() => {
    return seriesList.filter(
      (s) =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [seriesList, searchTerm]);

  const stats = useMemo(() => {
    const active = seriesList.filter((s) => s.postCount > 0).length;
    return { total: seriesList.length, active, empty: seriesList.length - active };
  }, [seriesList]);

  const createMutation = useMutation({
    mutationFn: (data: { title: string; slug: string; description?: string }) =>
      createSeriesFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.admin });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.all });
      setIsCreating(false);
      toast.success(m.series_manager_created());
    },
    onError: () => {
      toast.error(m.series_manager_slug_exists());
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: number;
      title?: string;
      slug?: string;
      description?: string | null;
    }) => updateSeriesFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.admin });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.all });
      setSeriesToEdit(null);
      toast.success(m.series_manager_updated());
    },
    onError: () => {
      toast.error(m.series_manager_slug_exists());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSeriesFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.admin });
      queryClient.invalidateQueries({ queryKey: SERIES_KEYS.all });
      setSeriesToDelete(null);
      toast.success(m.series_manager_deleted());
    },
    onError: () => {
      toast.error(m.series_manager_delete_fail());
    },
  });

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/30">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            {m.series_manager_title()}
          </h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            {m.series_manager_subtitle()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors"
              size={14}
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={m.series_manager_search_placeholder()}
              className="pl-9 h-9 bg-transparent border-b border-border/50 rounded-none focus:border-foreground focus:ring-0 pr-0 transition-all font-mono text-xs"
            />
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="h-9 px-4 text-[10px] uppercase tracking-[0.2em] font-medium rounded-none gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            <BookOpen size={12} />
            {m.series_manager_new()}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: m.series_manager_stat_total(),
            value: stats.total,
            suffix: m.series_manager_stat_unit(),
          },
          {
            label: m.series_manager_stat_active(),
            value: stats.active,
            suffix: m.series_manager_stat_unit(),
          },
          {
            label: m.series_manager_stat_empty(),
            value: stats.empty,
            suffix: m.series_manager_stat_unit(),
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

      {/* Inline Create Form */}
      {isCreating && (
        <InlineSeriesCreateForm
          isSubmitting={createMutation.isPending}
          onCancel={() => setIsCreating(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border border-border/30 bg-background animate-pulse space-y-3"
            >
              <div className="h-4 w-32 bg-accent rounded" />
              <div className="h-3 w-24 bg-accent rounded" />
            </div>
          ))
        ) : filteredSeries.length > 0 ? (
          filteredSeries.map((series) => (
            <div
              key={series.id}
              className="p-4 border border-border/30 bg-background space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {seriesToEdit?.id === series.id ? (
                    <InlineSeriesEditForm
                      initialData={seriesToEdit}
                      isSubmitting={updateMutation.isPending}
                      onCancel={() => setSeriesToEdit(null)}
                      onSubmit={(data) =>
                        updateMutation.mutate({ id: series.id, ...data })
                      }
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-muted-foreground/50" />
                        <span className="font-medium text-foreground">
                          {series.title}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        /{series.slug}
                      </div>
                      {series.description && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-2">
                          {series.description}
                        </p>
                      )}
                    </>
                  )}
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {m.series_manager_mobile_created()}{" "}
                    {new Date(series.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-mono font-bold text-foreground">
                    {series.postCount}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    {m.series_manager_mobile_posts()}
                  </span>
                </div>
              </div>

              {seriesToEdit?.id !== series.id && (
                <div className="flex items-center justify-end gap-2 border-t border-border/30 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setSeriesToEdit({
                        id: series.id,
                        title: series.title,
                        slug: series.slug,
                        description: series.description,
                      })
                    }
                  >
                    [ {m.series_manager_edit()} ]
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-red-500"
                    onClick={() =>
                      setSeriesToDelete({ id: series.id, title: series.title })
                    }
                  >
                    [ {m.series_manager_delete()} ]
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center border border-border/30 bg-background text-muted-foreground">
            <span className="text-xs font-serif italic">
              {m.series_manager_no_match()}
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
                  {m.series_manager_col_title()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal">
                  {m.series_manager_col_slug()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal">
                  {m.series_manager_col_posts()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal hidden lg:table-cell">
                  {m.series_manager_col_created()}
                </th>
                <th className="px-6 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-normal text-right">
                  {m.series_manager_col_actions()}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6">
                      <div className="h-4 w-32 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-24 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-12 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6 hidden lg:table-cell">
                      <div className="h-4 w-24 bg-accent rounded-none" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-16 bg-accent rounded-none ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredSeries.length > 0 ? (
                filteredSeries.map((series) => (
                  <tr
                    key={series.id}
                    className="group hover:bg-muted/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium">
                      {seriesToEdit?.id === series.id ? (
                        <InlineSeriesEditForm
                          initialData={seriesToEdit}
                          isSubmitting={updateMutation.isPending}
                          onCancel={() => setSeriesToEdit(null)}
                          onSubmit={(data) =>
                            updateMutation.mutate({ id: series.id, ...data })
                          }
                        />
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <BookOpen
                              size={12}
                              className="text-muted-foreground/30"
                            />
                            <span className="text-foreground tracking-tight font-mono text-sm">
                              {series.title}
                            </span>
                          </div>
                          {series.description && (
                            <p className="text-[10px] text-muted-foreground/60 line-clamp-1 ml-5">
                              {series.description}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        /{series.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {series.postCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-muted-foreground/60 font-mono hidden lg:table-cell">
                      {new Date(series.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-none"
                          onClick={() =>
                            setSeriesToEdit({
                              id: series.id,
                              title: series.title,
                              slug: series.slug,
                              description: series.description,
                            })
                          }
                        >
                          [ {m.series_manager_edit()} ]
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-mono text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-none"
                          onClick={() =>
                            setSeriesToDelete({
                              id: series.id,
                              title: series.title,
                            })
                          }
                        >
                          [ {m.series_manager_delete()} ]
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center space-y-4">
                    <Search size={24} className="opacity-20 mx-auto" />
                    <div className="text-muted-foreground font-serif text-sm italic">
                      {m.series_manager_no_match()}
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="text-[10px] uppercase tracking-widest h-auto p-0 text-muted-foreground hover:text-foreground"
                    >
                      [ {m.series_manager_clear_search()} ]
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!seriesToDelete}
        onClose={() => setSeriesToDelete(null)}
        onConfirm={() =>
          seriesToDelete && deleteMutation.mutate(seriesToDelete.id)
        }
        title={m.series_manager_delete_title()}
        message={
          seriesToDelete
            ? m.series_manager_delete_desc({
                seriesTitle: seriesToDelete.title,
              })
            : ""
        }
        confirmLabel={m.series_manager_delete_confirm()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function InlineSeriesCreateForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: { title: string; slug: string; description?: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === toSlug(title)) {
      setSlug(toSlug(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border border-border/30 bg-muted/5 p-4 animate-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-emerald-500 font-bold">
          {">"}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {m.series_manager_inline_new()}
        </span>
      </div>
      <div className="flex flex-col md:flex-row items-start gap-3 pl-8">
        <input
          autoFocus
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={m.series_manager_inline_title_placeholder()}
          className="flex-1 w-full bg-transparent border-none outline-none font-mono text-sm"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={m.series_manager_inline_slug_placeholder()}
          className="flex-1 w-full bg-transparent border-none outline-none font-mono text-xs text-muted-foreground"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={m.series_manager_inline_desc_placeholder()}
          className="flex-1 w-full bg-transparent border-none outline-none font-mono text-xs text-muted-foreground"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={isSubmitting || !title.trim() || !slug.trim()}
          className="h-8 text-[10px] uppercase font-mono tracking-widest hover:text-emerald-500 hover:bg-emerald-500/10 rounded-none"
        >
          {isSubmitting
            ? m.series_manager_inline_creating()
            : `[ ${m.series_manager_inline_confirm()} ]`}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-8 text-[10px] uppercase font-mono tracking-widest text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-none"
        >
          [ {m.series_manager_inline_cancel()} ]
        </Button>
      </div>
    </form>
  );
}

function InlineSeriesEditForm({
  initialData,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  initialData: {
    title: string;
    slug: string;
    description: string | null;
  };
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: {
    title: string;
    slug: string;
    description: string | null;
  }) => void;
}) {
  const [title, setTitle] = useState(initialData.title);
  const [slug, setSlug] = useState(initialData.slug);
  const [description, setDescription] = useState(
    initialData.description ?? "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 animate-in fade-in duration-200"
    >
      <div className="flex flex-col gap-2">
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-7 py-0 text-sm border-0 border-b border-foreground rounded-none focus-visible:ring-0 px-1 bg-transparent"
        />
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-7 py-0 text-xs border-0 border-b border-border/50 rounded-none focus-visible:ring-0 px-1 bg-transparent text-muted-foreground"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={m.series_manager_inline_desc_placeholder()}
          className="h-7 py-0 text-xs border-0 border-b border-border/50 rounded-none focus-visible:ring-0 px-1 bg-transparent text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={isSubmitting || !title.trim() || !slug.trim()}
          className="h-6 w-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
        >
          <Check size={14} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onCancel}
          className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
        >
          <X size={14} />
        </Button>
      </div>
    </form>
  );
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
