import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AboutSection } from "@/features/config/config.schema";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/about/")({
  ssr: false,
  component: RouteComponent,
  loader: () => ({
    title: m.admin_about_title(),
  }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title }],
  }),
});

function RouteComponent() {
  const { settings, saveSettings, isLoading } = useSystemSetting();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [subtitle, setSubtitle] = useState("");
  const [showSocial, setShowSocial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.pages?.about) {
      setSections(settings.pages.about.sections ?? []);
      setSubtitle(settings.pages.about.subtitle ?? "");
      setShowSocial(settings.pages.about.showSocial ?? true);
    }
  }, [settings]);

  const addSection = () => {
    setSections((prev) => [...prev, { title: "", content: "" }]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSection = (
    index: number,
    field: keyof AboutSection,
    value: string,
  ) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await saveSettings({
        data: {
          ...settings,
          pages: {
            ...settings.pages,
            about: { subtitle, showSocial, sections },
          },
        },
      });
      toast.success(m.admin_about_save_success());
    } catch {
      toast.error(m.admin_about_save_error());
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-5 border-b border-border/30">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground">
            {m.admin_about_title()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {m.admin_about_desc()}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="hidden sm:flex h-11 px-8 rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all font-mono text-[11px] uppercase tracking-[0.2em] font-medium disabled:opacity-50 shadow-lg shadow-foreground/5"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin mr-3" />
          ) : (
            <Check size={14} className="mr-3" />
          )}
          {isSaving ? m.admin_about_saving() : m.admin_about_save()}
        </Button>
      </div>

      <div className="border border-border/30 bg-background/50 overflow-hidden">
        <div className="p-6 space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground block">
            {m.admin_about_subtitle_label()}
          </label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={m.admin_about_subtitle_ph()}
            className="border-border/30"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {m.admin_about_subtitle_hint()}
          </p>
        </div>
      </div>

      <div className="border border-border/30 bg-background/50 overflow-hidden">
        <div className="p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={showSocial}
              onCheckedChange={(checked) => setShowSocial(checked === true)}
            />
            <div>
              <span className="text-sm font-medium text-foreground">
                {m.admin_about_show_social()}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {m.admin_about_show_social_hint()}
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-6">
        {sections.length === 0 && (
          <div className="border border-dashed border-border/50 p-12 text-center text-muted-foreground text-sm">
            {m.admin_about_empty_hint()}
          </div>
        )}

        {sections.map((section, index) => (
          <div
            key={index}
            className="border border-border/30 bg-background/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
                    {m.admin_about_section_title_label()}
                  </label>
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      updateSection(index, "title", e.target.value)
                    }
                    placeholder={m.admin_about_section_title_ph()}
                    className="border-border/30"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(index)}
                  className="text-muted-foreground hover:text-destructive mt-6"
                >
                  <Trash2 size={14} />
                  <span className="ml-1 text-xs">
                    {m.admin_about_remove_section()}
                  </span>
                </Button>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
                  {m.admin_about_section_content_label()}
                </label>
                <Textarea
                  value={section.content}
                  onChange={(e) =>
                    updateSection(index, "content", e.target.value)
                  }
                  placeholder={m.admin_about_section_content_ph()}
                  className="min-h-[120px] border-border/30 resize-y"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addSection}
          className="w-full border-dashed border-border/50 h-12 font-mono text-xs uppercase tracking-widest hover:border-foreground/30"
        >
          <Plus size={14} className="mr-2" />
          {m.admin_about_add_section()}
        </Button>
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-8 right-6 z-50 sm:hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-14 w-14 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-2xl flex items-center justify-center p-0"
        >
          {isSaving ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Check size={24} />
          )}
        </Button>
      </div>
    </div>
  );
}
