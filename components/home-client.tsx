"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import SculptureHero from "@/components/ui/liquid-sculpture-hero";
import { signOutLocal } from "@/lib/local-auth";
import { useLanguage } from "@/components/language-provider";

export default function HomeClient() {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-screen">
      <SculptureHero
        // Keep the hero's theme switch in sync with the rest of the app.
        theme={mounted ? (resolvedTheme === "light" ? "light" : "dark") : undefined}
        onThemeChange={setTheme}
        onSignOut={() => { signOutLocal(); router.replace("/"); }}
        brand="CoolRoute"
        eyebrow={t("A cooler way to get there")}
        headline={`${t("Walk in the")}\n${t("living shade.")}`}
        headlineAccent={t("living shade.")}
        body={t("Plan a walk around shade, sunlight and your comfort.")}
        primaryCta={{ label: t("Plan a walk"), href: "/planner" }}
        secondaryCta={null}
        backdropText="CoolRoute"
      />
    </main>
  );
}
