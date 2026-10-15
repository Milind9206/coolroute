"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import SculptureHero from "@/components/ui/liquid-sculpture-hero";
import CoolRoutePlanner from "@/components/cool-route-planner";

export default function HomeClient() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <main>
      <SculptureHero
        // Until mounted, the hero uses its own default (dark) to avoid a hydration mismatch.
        theme={mounted ? (resolvedTheme === "light" ? "light" : "dark") : undefined}
        onThemeChange={setTheme}
      />
      <CoolRoutePlanner />
      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        CoolRoute is a modelling demo. Sun exposure values are estimates, not medical advice.
      </footer>
    </main>
  );
}