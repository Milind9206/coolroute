"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import SculptureHero from "@/components/ui/liquid-sculpture-hero";
import CoolRoutePlanner from "@/components/cool-route-planner";
import { DEMO_ACCESS_KEY } from "@/lib/demo-access";

export default function HomeClient() {
  const { resolvedTheme, setTheme } = useTheme();
  const [plannerOpen, setPlannerOpen] = React.useState(false);
  React.useEffect(() => {
    if (!plannerOpen) return;
    window.history.replaceState(null, "", "#planner");
    requestAnimationFrame(() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [plannerOpen]);

  const signOut = () => {
    window.sessionStorage.removeItem(DEMO_ACCESS_KEY);
    window.location.assign("/login");
  };

  return (
    <main>
      <SculptureHero
        // Until mounted, the hero uses its own default (dark) to avoid a hydration mismatch.
        theme={resolvedTheme === "light" ? "light" : resolvedTheme === "dark" ? "dark" : undefined}
        onThemeChange={setTheme}
        authenticated
        onSignOut={signOut}
        onOpenPlanner={() => setPlannerOpen(true)}
        showPrimaryCta={false}
        belowContent={!plannerOpen && (
          <div
            id="planner-entry"
            className={`hero-reveal hero-delay-4 flex flex-col items-center px-6 text-center ${resolvedTheme === "light" ? "text-[#10201a]" : "text-white"}`}
          >
            <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.22em] ${resolvedTheme === "light" ? "text-emerald-800" : "text-emerald-300"}`}>CoolRoute planner</p>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">Ready to plan a cooler walk?</h2>
            <p className={`mt-5 max-w-lg text-base leading-relaxed ${resolvedTheme === "light" ? "text-black/65" : "text-white/70"}`}>Open the map to choose your start and destination, compare shade estimates, and find a route that fits your heat budget.</p>
            <button
              type="button"
              onClick={() => setPlannerOpen(true)}
              className={`mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition hover:scale-[1.03] ${resolvedTheme === "light" ? "bg-emerald-800 text-white hover:bg-emerald-700" : "bg-emerald-300 text-black hover:bg-emerald-200"}`}
            >
              Open Route Planner <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      />
      {plannerOpen && (
        <>
          <CoolRoutePlanner />
          <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
            CoolRoute is a modelling demo. Sun exposure values are estimates, not medical advice.
          </footer>
        </>
      )}
    </main>
  );
}
