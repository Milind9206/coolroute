import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator, Sun } from "lucide-react";
import RequireLocalSession from "@/components/require-local-session";
import CoolRouteFormulas from "@/components/cool-route-formulas";

export const metadata: Metadata = {
  title: "Route formulas",
  description: "See how CoolRoute models walking time, shade and heat exposure.",
};

export default async function FormulasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const number = (key: string, fallback: number) => {
    const raw = params[key];
    const value = Number(Array.isArray(raw) ? raw[0] : raw);
    return Number.isFinite(value) ? value : fallback;
  };
  const timezoneParam = params.tz;
  const timezone = (Array.isArray(timezoneParam) ? timezoneParam[0] : timezoneParam) || "Asia/Kolkata";
  const scenario = { hour: number("time", 13), shade: number("shade", 1), budget: number("budget", 3), distance: number("distance", 0), walkTime: number("walkTime", 0), exposure: number("exposure", 0), timezone };
  return <RequireLocalSession><main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 md:px-8"><header className="mb-10 flex items-center justify-between"><Link href="/planner" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold hover:bg-muted"><ArrowLeft className="h-4 w-4" />Back to planner</Link><span className="flex items-center gap-2 text-sm text-muted-foreground"><Calculator className="h-4 w-4" />CoolRoute model</span></header><div className="mb-8"><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">How the route is calculated</h1><p className="mt-2 text-muted-foreground">Real pedestrian paths, distances and travel times with modeled shade exposure for the selected route.</p></div><CoolRouteFormulas scenario={scenario} /><p className="mt-8 rounded-xl border border-border p-4 text-sm text-muted-foreground"><Sun className="mr-2 inline h-4 w-4" />Walking paths use OpenStreetMap pedestrian data through Valhalla. Exposure is estimated from solar position and simplified shade assumptions, not measured tree or building data.</p></main></RequireLocalSession>;
}
