"use client";

import * as React from "react";
import { Check, Clock3, Footprints, Sun } from "lucide-react";
import { marketingContent } from "@/lib/marketing-content";

type RouteKey = "fastest" | "cool";

export function RouteComparison() {
  const [selected, setSelected] = React.useState<RouteKey>("cool");
  const routes = marketingContent.comparison.routes;

  return <div className="mt-12">
    <div className="mx-auto mb-8 flex w-fit items-center rounded-full border border-[#0B3B4F]/10 bg-white p-1.5 shadow-sm" role="group" aria-label="Highlight a sample route">
      {(["fastest", "cool"] as const).map((key) => <button key={key} type="button" aria-pressed={selected === key} onClick={() => setSelected(key)} className={`min-h-11 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E8E] ${selected === key ? "bg-[#0B3B4F] text-white shadow-sm" : "text-[#0B3B4F]/65 hover:text-[#0B3B4F]"}`}>
        {routes[key].name}
      </button>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      {(["fastest", "cool"] as const).map((key) => {
        const route = routes[key];
        const active = selected === key;
        const cool = key === "cool";
        return <article key={key} aria-current={active ? "true" : undefined} className={`relative overflow-hidden rounded-[24px] border p-6 transition duration-300 sm:p-8 ${active ? "border-[#0F9E8E]/45 bg-white shadow-[0_22px_60px_rgba(11,59,79,0.10)] lg:-translate-y-1" : "border-[#0B3B4F]/10 bg-white/60"}`}>
          <div className="flex items-start justify-between gap-4">
            <div><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${cool ? "bg-[#0F9E8E]" : "bg-[#F5A623]"}`} /><p className="text-sm font-semibold text-[#0B3B4F]/65">{cool ? "Shade-aware option" : "Direct option"}</p></div><h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#0B3B4F] font-heading">{route.name}</h3></div>
            {active && <span className="grid h-9 w-9 place-items-center rounded-full bg-[#D8F5EC] text-[#0F766E]" aria-label="Highlighted"><Check size={18} /></span>}
          </div>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#0B3B4F]/65">{route.note}</p>
          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-[#0B3B4F]/10 py-5">
            <Metric icon={<Clock3 size={16} />} label="Time" value={route.time} />
            <Metric icon={<Sun size={16} />} label="Direct sun" value={route.exposure} />
            <Metric icon={<Footprints size={16} />} label="Distance" value={route.distance} />
          </div>
          <div className={`mt-5 rounded-2xl px-4 py-3 text-xs leading-5 ${cool ? "bg-[#E8F7F2] text-[#0B665E]" : "bg-[#FFF6E5] text-[#78521A]"}`}>
            {cool ? "More modeled shade, with a small time trade-off." : "A shorter sample path with more direct sun exposure."}
          </div>
          <p className="mt-4 text-[11px] text-[#0B3B4F]/50">Sample values for design demonstration only.</p>
        </article>;
      })}
    </div>
    <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-[#0B3B4F]/55">Shade and sun exposure are modeled estimates that depend on available map data, location, and selected time. They are not a guarantee of on-street conditions.</p>
  </div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div><div className="flex items-center gap-1.5 text-[#0F766E]">{icon}<span className="text-[11px] font-medium text-[#0B3B4F]/55">{label}</span></div><p className="mt-1.5 text-lg font-semibold tracking-tight text-[#0B3B4F]">{value}</p></div>;
}
