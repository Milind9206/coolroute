import type { Metadata } from "next";
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
  return <RequireLocalSession><CoolRouteFormulas scenario={scenario} /></RequireLocalSession>;
}
