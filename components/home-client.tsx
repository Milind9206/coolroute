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
        eyebrow="SHADE FIRST. COMFORT ALWAYS."
        headline={"Find a\ncooler route."}
        headlineAccent="cooler route."
        body="Choose where you’re going. CoolRoute compares walking paths to help you spend less time in direct sun."
        primaryCta={{ label: "Plan a walk", href: "/planner" }}
        secondaryCta={null}
        backdropText="CoolRoute"
      />
    </main>
  );
}
