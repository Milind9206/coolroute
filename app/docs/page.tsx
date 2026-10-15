import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Math & Graph Architecture",
  description:
    "How CoolRoute models streets as a graph, computes solar shade, walking effort and heat exposure, and solves the heat-budget constrained shortest path.",
  keywords: ["Tobler hiking function", "constrained Dijkstra", "solar geometry", "heat exposure", "resource-constrained shortest path"],
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "CoolRoute: Math & Graph Architecture",
    description: "The models behind shade-aware, budget-constrained walking routes.",
    url: "/docs",
  },
  robots: { index: true, follow: true },
};

function Formula({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to planner
      </Link>

      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Math &amp; graph architecture</h1>
        <p className="text-muted-foreground">
          How CoolRoute turns streets, sun position and slope into a route that respects a heat-exposure budget.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">1. Graph model</h2>
        <p>
          The neighbourhood is a graph G = (V, E). Nodes V are junctions and crossings, each with a crossing wait time
          (seconds) and a junction shade value. Edges E are street segments with length, tree canopy share C, building
          height H, street orientation θ, slope grade and a step-free flag.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">2. Walking effort (Tobler)</h2>
        <Formula>{`v = 1.67 · exp(−3.5 · |grade + 0.05|)      (m/s)
t = length / v
M_effort = 1 + max(0, grade · 5)`}</Formula>
        <p>Uphill segments take longer and add an effort multiplier to heat. Downhill segments are not given a bonus beyond speed.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">3. Solar geometry and shade</h2>
        <p>Solar altitude α and azimuth φ come from SunCalc for the chosen time of day. Building shadow and combined shade:</p>
        <Formula>{`S_building(t) = min(1, H · |sin(φ_sun − θ)| / (10 · max(0.15, tan α)))
S(t) = 1 − (1 − C) · (1 − S_building(t))`}</Formula>
        <p>
          Trees and buildings are treated as independent shade sources. The 0.15 floor on tan α stops the shadow length
          from blowing up when the sun is low. When the sun is below the horizon, exposure is zero.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">4. Heat exposure cost</h2>
        <Formula>{`H_e(t) = t_e · (1 − S_e(t)) · M_effort + W_v · (1 − S_v(t))`}</Formula>
        <p>
          The first term is time spent in direct sun, scaled by effort. The second is the crossing wait W_v at the
          destination junction, scaled by its shade S_v. Costs are reported in minutes of modelled sun exposure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">5. Constrained shortest path</h2>
        <p>
          The CoolRoute minimises walking time subject to total heat exposure being at most the user&apos;s budget B. This is a
          resource-constrained shortest path problem. Each node keeps a Pareto set of (time, heat) labels. A label is
          discarded if its heat exceeds B or if another label at the same node is no worse in both time and heat. The first
          label to reach the destination, taken in order of increasing time, is optimal.
        </p>
        <Formula>{`minimise   Σ t_e
subject to Σ H_e ≤ B
           (and every edge step-free, if requested)`}</Formula>
        <p>
          If no label reaches the destination, the budget is infeasible. CoolRoute then shows the route with the lowest
          total heat and raises a banner, instead of failing silently.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">6. Uncertainty and limits</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Shade is estimated from the demo network’s simplified tree canopy and building geometry.</li>
          <li>A detour above 25% added distance raises a warning.</li>
          <li>Step-free access is a hard constraint: stairs are removed from the graph, not penalised.</li>
          <li>
            Results are modelled estimates from simplified geometry. They are not a personal medical risk assessment or health
            advice.
          </li>
        </ul>
      </section>
    </main>
  );
}
