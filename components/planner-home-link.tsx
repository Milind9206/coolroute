"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function PlannerHomeLink() {
  const { t } = useLanguage();
  return <Link href="/" aria-label={t("Back to home")} className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"><ArrowLeft className="h-5 w-5" aria-hidden /><Image src="/coolroute-logo.svg" alt="CoolRoute" width={180} height={45} className="h-8 w-auto dark:brightness-0 dark:invert" /><span className="sr-only">{t(" — back to home")}</span></Link>;
}
