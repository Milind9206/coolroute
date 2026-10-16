"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LanguageToggle from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

function Formula({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed"><code>{children}</code></pre>;
}

export default function DocsContent() {
  const { t } = useLanguage();
  return <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
    <div className="flex items-center justify-between"><Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />{t("Back to planner")}</Link><LanguageToggle compact /></div>
    <header className="space-y-3"><h1 className="text-4xl font-semibold tracking-tight">{t("Math & graph architecture")}</h1><p className="text-muted-foreground">{t("How CoolRoute turns streets, sun position and slope into a route that respects a heat-exposure budget.")}</p></header>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{t("1. Graph model")}</h2><p>{t("The neighbourhood is a graph G = (V, E). Nodes V are junctions and crossings, each with a crossing wait time (seconds) and a junction shade value. Edges E are street segments with length, tree canopy share C, building height H, street orientation θ, slope grade and a step-free flag.")}</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{t("2. Walking effort (Tobler)")}</h2><Formula>{["v = 1.67 · exp(−3.5 · |grade + 0.05|)      (m/s)", "t = length / v", "M_effort = 1 + max(0, grade · 5)"].join("\n")}</Formula><p>{t("Uphill segments take longer and add an effort multiplier to heat. Downhill segments are not given a bonus beyond speed.")}</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{t("3. Solar geometry and shade")}</h2><p>{t("Solar altitude α and azimuth φ come from SunCalc for the chosen time of day. Building shadow and combined shade:")}</p><Formula>{["S_building(t) = min(1, H · |sin(φ_sun − θ)| / (10 · max(0.15, tan α)))", "S(t) = 1 − (1 − C) · (1 − S_building(t))"].join("\n")}</Formula><p>{t("Trees and buildings are treated as independent shade sources. The 0.15 floor on tan α stops the shadow length from blowing up when the sun is low. When the sun is below the horizon, exposure is zero.")}</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{t("4. Heat exposure cost")}</h2><Formula>{"H_e(t) = t_e · (1 − S_e(t)) · M_effort + W_v · (1 − S_v(t))"}</Formula><p>{t("The first term is time spent in direct sun, scaled by effort. The second is the crossing wait W_v at the destination junction, scaled by its shade S_v. Costs are reported in minutes of modelled sun exposure.")}</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{t("5. Constrained shortest path")}</h2><p>{t("The CoolRoute minimises walking time subject to total heat exposure being at most the user's budget B. This is a resource-constrained shortest path problem. Each node keeps a Pareto set of (time, heat) labels. A label is discarded if its heat exceeds B or if another label at the same node is no worse in both time and heat. The first label to reach the destination, taken in order of increasing time, is optimal.")}</p><Formula>{["minimise   Σ t_e", "subject to Σ H_e ≤ B", "           (and every edge step-free, if requested)"].join("\n")}</Formula><p>{t("If no label reaches the destination, the budget is infeasible. CoolRoute then shows the route with the lowest total heat and raises a banner, instead of failing silently.")}</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{t("6. Uncertainty and limits")}</h2><ul className="list-disc space-y-1 pl-6"><li>{t("Shade is estimated from the demo network’s simplified tree canopy and building geometry.")}</li><li>{t("A detour above 25% added distance raises a warning.")}</li><li>{t("Step-free access is a hard constraint: stairs are removed from the graph, not penalised.")}</li><li>{t("Results are modelled estimates from simplified geometry. They are not a personal medical risk assessment or health advice.")}</li></ul></section>
  </main>;
}
