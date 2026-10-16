"use client";

import Link from "next/link";
import { ArrowRight, Footprints } from "lucide-react";
import LanguageToggle from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

export default function NotFoundContent() {
  const { t } = useLanguage();
  return <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <div className="absolute right-6 top-6"><LanguageToggle compact /></div>
    <Footprints className="h-12 w-12 text-muted-foreground" aria-hidden />
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{t("Error 404 • Footpath Closed or Unmapped Segment")}</p>
    <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">{t("This route doesn't lead anywhere.")}</h1>
    <p className="max-w-md text-muted-foreground">{t("The page you wanted is either closed for the day or was never mapped. Let’s reroute you.")}</p>
    <div className="flex flex-wrap justify-center gap-3">
      <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">{t("Back to CoolRoute")} <ArrowRight className="h-4 w-4" /></Link>
      <Link href="/docs" className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-muted">{t("Math & proofs")}</Link>
    </div>
  </main>;
}
