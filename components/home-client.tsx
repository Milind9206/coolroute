"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import SculptureHero from "@/components/ui/liquid-sculpture-hero";
import { signOutLocal } from "@/lib/local-auth";

export default function HomeClient() {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
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
        eyebrow="A cooler way to get there"
        headline={"Walk in the\nliving shade."}
        headlineAccent="living shade."
        body="Plan a walking route around shade, sunlight and your comfort."
        primaryCta={{ label: "Plan a walk", href: "/planner" }}
        secondaryCta={null}
        backdropText="COOL"
      />
    </main>
  );
}
