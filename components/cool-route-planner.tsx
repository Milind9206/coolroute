"use client";

import * as React from "react";
import type * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { AlertTriangle, Info, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  buildGraph, evaluate, segmentCost, solarAt,
  type Alert as RouteAlert, type Graph, type RouteStats, type Scenario,
} from "@/lib/routing-engine";

const STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
const STYLE_DARK = "https://tiles.openfreemap.org/styles/dark";

type FC = GeoJSON.FeatureCollection;
type MapData = { edges: FC; base: FC; cool: FC; points: FC };
const EMPTY: FC = { type: "FeatureCollection", features: [] };

const fmtHour = (h: number) => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  const ap = hh >= 12 ? "PM" : "AM";
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${ap}`;
};

function lineFc(r: RouteStats | null): FC {
  return {
    type: "FeatureCollection",
    features: r ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: r.coords } }] : [],
  };
}

function buildMapData(g: Graph, sc: Scenario, base: RouteStats | null, cool: RouteStats | null): MapData {
  const sun = solarAt(sc.hour);
  const edges: FC = {
    type: "FeatureCollection",
    features: g.edges.map((e) => {
      const a = g.nodes[e.a], b = g.nodes[e.b];
      return {
        type: "Feature",
        properties: {
          shade: segmentCost(g, e, 1, sun, sc.shadeMult).shade,
          missing: e.missing,
          closed: !!(sc.closed && e.closable),
        },
        geometry: { type: "LineString", coordinates: [[a.lon, a.lat], [b.lon, b.lat]] },
      };
    }),
  };
  const pts: GeoJSON.Feature[] = [];
  const S = g.nodes[g.start], T = g.nodes[g.end];
  pts.push({ type: "Feature", properties: { kind: "start" }, geometry: { type: "Point", coordinates: [S.lon, S.lat] } });
  pts.push({ type: "Feature", properties: { kind: "end" }, geometry: { type: "Point", coordinates: [T.lon, T.lat] } });
  for (const e of g.edges) {
    if (e.stepFree) continue;
    const a = g.nodes[e.a], b = g.nodes[e.b];
    pts.push({ type: "Feature", properties: { kind: "stairs" }, geometry: { type: "Point", coordinates: [(a.lon + b.lon) / 2, (a.lat + b.lat) / 2] } });
  }
  return { edges, base: lineFc(base), cool: lineFc(cool), points: { type: "FeatureCollection", features: pts } };
}

function ensureLayers(map: maplibregl.Map, d: MapData) {
  if (map.getSource("edges")) return;
  map.addSource("edges", { type: "geojson", data: d.edges });
  map.addSource("base", { type: "geojson", data: d.base });
  map.addSource("cool", { type: "geojson", data: d.cool });
  map.addSource("points", { type: "geojson", data: d.points });
  const round = { "line-cap": "round" as const, "line-join": "round" as const };
  map.addLayer({
    id: "edges", type: "line", source: "edges", layout: round,
    paint: {
      "line-width": 6, "line-opacity": 0.85,
      "line-color": ["interpolate", ["linear"], ["get", "shade"], 0, "#f59e0b", 0.5, "#a3b84a", 1, "#15803d"],
    },
  });
  map.addLayer({
    id: "edges-missing", type: "line", source: "edges", filter: ["==", ["get", "missing"], true],
    paint: { "line-width": 4, "line-color": "#facc15", "line-dasharray": [2, 2] },
  });
  map.addLayer({
    id: "edges-closed", type: "line", source: "edges", filter: ["==", ["get", "closed"], true],
    paint: { "line-width": 6, "line-color": "#ef4444", "line-dasharray": [0.5, 2] },
  });
  map.addLayer({
    id: "base", type: "line", source: "base", layout: round,
    paint: { "line-width": 4, "line-color": "#6366f1", "line-offset": -3 },
  });
  map.addLayer({
    id: "cool", type: "line", source: "cool", layout: round,
    paint: { "line-width": 4, "line-color": "#06b6d4", "line-offset": 3 },
  });
  map.addLayer({
    id: "points", type: "circle", source: "points",
    paint: {
      "circle-radius": ["match", ["get", "kind"], "stairs", 4, 8],
      "circle-color": ["match", ["get", "kind"], "start", "#6366f1", "end", "#06b6d4", "#111827"],
      "circle-stroke-width": 2, "circle-stroke-color": "#ffffff",
    },
  });
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function RouteCard({ title, color, r }: { title: string; color: string; r: RouteStats | null }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: color }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {r ? (
          <>
            <Metric label="Distance" value={`${Math.round(r.dist)} m`} />
            <Metric label="Walk time" value={`${r.time.toFixed(1)} min`} />
            <Metric label="Sun exposure" value={`${r.heat.toFixed(1)} min`} />
            <Metric label="Uncertain segments" value={String(r.uncertain)} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No route available.</p>
        )}
      </CardContent>
    </Card>
  );
}

function AlertItem({ a }: { a: RouteAlert }) {
  const Icon = a.level === "info" ? Info : AlertTriangle;
  const cls =
    a.level === "error" ? "border-red-500/50 text-red-600 dark:text-red-400"
    : a.level === "warn" ? "border-amber-500/50 text-amber-700 dark:text-amber-300"
    : "border-sky-500/40";
  const title = { "budget-unmet": "Heat budget cannot be met", detour: "Large detour", uncertain: "Uncertain shade data", same: "Routes match", night: "Sun below horizon", "no-route": "No route" }[a.code] ?? "Notice";
  return (
    <Alert className={cls}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{a.message}</AlertDescription>
    </Alert>
  );
}

export default function CoolRoutePlanner() {
  const { resolvedTheme } = useTheme();
  const graph = React.useMemo(() => buildGraph(), []);
  const [hour, setHour] = React.useState(13);
  const [shadeMult, setShadeMult] = React.useState(1);
  const [budgetMin, setBudgetMin] = React.useState(3);
  const [stepFree, setStepFree] = React.useState(false);
  const [closed, setClosed] = React.useState(false);
  const [env, setEnv] = React.useState<{ temperatureC: number; uvIndex: number; source: string } | null>(null);

  const sc: Scenario = { hour, shadeMult, budgetMin, stepFree, closed };
  const ev = React.useMemo(() => evaluate(graph, sc), [graph, hour, shadeMult, budgetMin, stepFree, closed]); // eslint-disable-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => buildMapData(graph, sc, ev.baseline, ev.cool), [graph, ev]); // eslint-disable-line react-hooks/exhaustive-deps

  const mapEl = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const dataRef = React.useRef<MapData>(data);
  const styleRef = React.useRef<string>("");
  dataRef.current = data;

  // Ambient conditions via the server-side proxy
  React.useEffect(() => {
    const n = graph.nodes[graph.start];
    fetch(`/api/environment?lat=${n.lat.toFixed(4)}&lon=${n.lon.toFixed(4)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Environment request failed");
        return r.json();
      })
      .then((result) => {
        if (typeof result.temperatureC !== "number" || typeof result.uvIndex !== "number") {
          throw new Error("Environment response was incomplete");
        }
        setEnv(result);
      })
      .catch(() => setEnv(null));
  }, [graph]);

  // Create the map once
  React.useEffect(() => {
    if (!mapEl.current) return;
    let cancelled = false;
    let map: maplibregl.Map | null = null;

    const initialize = async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !mapEl.current) return;

      maplibre.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

      const style = resolvedTheme === "light" ? STYLE_LIGHT : STYLE_DARK;
      styleRef.current = style;
      const lons = graph.nodes.map((n) => n.lon), lats = graph.nodes.map((n) => n.lat);
      map = new maplibre.Map({
        container: mapEl.current, style,
        bounds: [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
        fitBoundsOptions: { padding: 50 },
        attributionControl: { compact: true },
      });
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
      map.on("style.load", () => { if (map) ensureLayers(map, dataRef.current); });
      mapRef.current = map;
    };

    void initialize().catch(() => { mapRef.current = null; });
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [graph]); // eslint-disable-line react-hooks/exhaustive-deps

  // Night mode sync: liberty <-> dark
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !resolvedTheme) return;
    const style = resolvedTheme === "light" ? STYLE_LIGHT : STYLE_DARK;
    if (style !== styleRef.current) { styleRef.current = style; map.setStyle(style); }
  }, [resolvedTheme]);

  // Push new data on every scenario change
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("edges")) return;
    (map.getSource("edges") as maplibregl.GeoJSONSource).setData(data.edges);
    (map.getSource("base") as maplibregl.GeoJSONSource).setData(data.base);
    (map.getSource("cool") as maplibregl.GeoJSONSource).setData(data.cool);
    (map.getSource("points") as maplibregl.GeoJSONSource).setData(data.points);
  }, [data]);

  const b = ev.baseline, c = ev.cool;
  const saved = b && c ? b.heat - c.heat : 0;
  const dTime = b && c ? c.time - b.time : 0;

  return (
    <section id="planner" className="mx-auto w-full max-w-7xl scroll-mt-4 px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Route planner</h2>
          <p className="text-sm text-muted-foreground">Synthetic neighbourhood near Connaught Place, Delhi. Change a control and both routes update.</p>
        </div>
        {env && (
          <Badge variant="secondary" className="gap-1.5">
            <Sun className="h-3.5 w-3.5" />
            {env.temperatureC}°C · UV {env.uvIndex}{env.source === "fallback" ? " (estimate)" : ""}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Scenario</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>Time of day</span><span className="font-medium tabular-nums">{fmtHour(hour)}</span></div>
                <Slider min={6} max={19} step={0.25} value={[hour]} onValueChange={(v) => setHour(v[0])} aria-label="Time of day" />
                <p className="mt-1 text-xs text-muted-foreground">Sun altitude {Math.max(0, Math.round(ev.sun.altitude * 180 / Math.PI))}°</p>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>Shade availability</span><span className="font-medium tabular-nums">×{shadeMult.toFixed(2)}</span></div>
                <Slider min={0.3} max={1.5} step={0.05} value={[shadeMult]} onValueChange={(v) => setShadeMult(v[0])} aria-label="Shade availability multiplier" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>Heat-exposure budget</span><span className="font-medium tabular-nums">{budgetMin.toFixed(2)} min</span></div>
                <Slider min={0} max={15} step={0.25} value={[budgetMin]} onValueChange={(v) => setBudgetMin(v[0])} aria-label="Heat exposure budget in minutes" />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Step-free access <span className="block text-xs text-muted-foreground">Hard constraint: avoids stairs</span></span>
                <Switch checked={stepFree} onCheckedChange={setStepFree} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Close shaded avenue <span className="block text-xs text-muted-foreground">Simulates a closed footpath</span></span>
                <Switch checked={closed} onCheckedChange={setClosed} />
              </label>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {ev.alerts
              .filter((a) => a.code !== "budget-unmet" && a.code !== "uncertain")
              .map((a) => <AlertItem key={a.code} a={a} />)}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <div ref={mapEl} className="h-[380px] w-full md:h-[480px] lg:h-[540px]" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span><b style={{ color: "#6366f1" }}>━</b> Shortest</span>
            <span><b style={{ color: "#06b6d4" }}>━</b> CoolRoute</span>
            <span><b style={{ color: "#f59e0b" }}>━</b> sunny to <b style={{ color: "#15803d" }}>━</b> shaded</span>
            <span><b style={{ color: "#facc15" }}>╍</b> missing data</span>
            <span><b style={{ color: "#ef4444" }}>┈</b> closed</span>
            <span>● stairs</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <RouteCard title="Shortest route" color="#6366f1" r={b} />
            <RouteCard title="CoolRoute" color="#06b6d4" r={c} />
          </div>

          {b && c && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Trade-offs</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                <div><div className="text-2xl font-semibold tabular-nums">{ev.detourPct >= 0 ? "+" : ""}{ev.detourPct.toFixed(0)}%</div><div className="text-muted-foreground">distance added</div></div>
                <div><div className="text-2xl font-semibold tabular-nums">{dTime >= 0 ? "+" : ""}{dTime.toFixed(1)} min</div><div className="text-muted-foreground">time difference</div></div>
                <div><div className="text-2xl font-semibold tabular-nums">{saved.toFixed(1)} min</div><div className="text-muted-foreground">sun exposure saved</div></div>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground">
            Modelled sun exposure is an estimate from simplified street geometry, tree canopy and solar position. It is not a measurement
            and not a personal medical risk assessment. Dashed yellow segments have missing shade data (assumed 30% canopy).
          </p>
        </div>
      </div>
    </section>
  );
}

