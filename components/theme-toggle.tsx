"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      aria-label={t(isDark ? "Switch to light mode" : "Switch to dark mode")}
      title={t(isDark ? "Light mode" : "Dark mode")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}
