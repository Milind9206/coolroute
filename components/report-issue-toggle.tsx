"use client";

import * as React from "react";
import { CheckCircle2, Flag, LoaderCircle, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const CATEGORIES = ["Bug", "Map or route", "Weather data", "Accessibility", "Other"] as const;

export default function ReportIssueToggle() {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("Bug");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/issues?page=${encodeURIComponent(window.location.pathname)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, description }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "We couldn't save your report.");
      setSent(true);
    } catch (reason) {
      setError(t(reason instanceof Error ? reason.message : "We couldn't save your report."));
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    window.setTimeout(() => {
      setSent(false);
      setError("");
      setTitle("");
      setDescription("");
    }, 200);
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30">
      <Flag className="h-4 w-4" />{t("Report issue")}
    </button>
    {open && <div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="report-issue-title" className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><h2 id="report-issue-title" className="text-xl font-semibold">{t("Report an issue")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("Tell us what went wrong and we’ll review it.")}</p></div>
          <button type="button" onClick={close} aria-label={t("Close")} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        {sent ? <div role="status" className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5 shrink-0" /><p>{t("Thanks. Your issue report has been saved.")}</p></div> : <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">{t("Category")}
            <select value={category} onChange={(event) => setCategory(event.target.value as (typeof CATEGORIES)[number])} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {CATEGORIES.map((item) => <option key={item} value={item}>{t(item)}</option>)}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium">{t("Short title")}
            <input required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("What is the issue?")} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="block space-y-2 text-sm font-medium">{t("Details")}
            <textarea required minLength={10} maxLength={4000} rows={5} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t("Describe what happened and what you expected.")} className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 font-medium text-primary-foreground disabled:opacity-60">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}{t(busy ? "Saving…" : "Send report")}
          </button>
        </form>}
      </section>
    </div>}
  </>;
}
