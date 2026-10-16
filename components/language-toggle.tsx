"use client";

import { useLanguage } from "@/components/language-provider";

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const next = language === "en" ? "hi" : "en";
  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      aria-label={t(next === "hi" ? "Switch language to Hindi" : "Switch language to English")}
      title={t(next === "hi" ? "Switch language to Hindi" : "Switch language to English")}
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
    >
      {compact ? (language === "en" ? "हिंदी" : "EN") : (language === "en" ? "हिंदी" : "English")}
    </button>
  );
}
