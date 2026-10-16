"use client";

import * as React from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { AlertTriangle, Info, MapPin, Satellite, Sun, SunDim } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/components/language-provider";
import {
  solarAt,
  type Alert as RouteAlert, type RouteStats,
} from "@/lib/routing-engine";

maplibregl.setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
);

const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Imagery: Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community",
      maxzoom: 19,
    },
  },
  layers: [{ id: "satellite", type: "raster", source: "satellite" }],
};

const NORMAL_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors", maxzoom: 19 },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

type FC = GeoJSON.FeatureCollection;
type MapData = { base: FC; cool: FC; points: FC };
type Place = { location: { lat: number; lon: number }; label: string; type?: string };
type RemoteRoute = { coords: [number, number][]; distanceMeters: number; timeSeconds: number };
type RemoteEvaluation = { sun: { altitude: number; azimuth: number }; baseline: RouteStats | null; cool: RouteStats | null; budgetMet: boolean; detourPct: number; alerts: RouteAlert[] };
const fmtHour = (h: number, language: "en" | "hi" = "en") => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  const ap = hh >= 12 ? "PM" : "AM";
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${language === "hi" ? ap === "AM" ? "पूर्वाह्न" : "अपराह्न" : ap}`;
};

function lineFc(r: RouteStats | null): FC {
  return {
    type: "FeatureCollection",
    features: r ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: r.coords } }] : [],
  };
}

function buildMapData(base: RouteStats | null, cool: RouteStats | null, startPlace: Place, endPlace: Place): MapData {
  const pts: GeoJSON.Feature[] = [];
  pts.push({ type: "Feature", properties: { kind: "start" }, geometry: { type: "Point", coordinates: [startPlace.location.lon, startPlace.location.lat] } });
  pts.push({ type: "Feature", properties: { kind: "end" }, geometry: { type: "Point", coordinates: [endPlace.location.lon, endPlace.location.lat] } });
  return { base: lineFc(base), cool: lineFc(cool), points: { type: "FeatureCollection", features: pts } };
}

function heatForRoute(route: RemoteRoute, hour: number, shadeMult: number, timeZone: string): RouteStats {
  const segmentLengths: number[] = [];
  for (let index = 1; index < route.coords.length; index++) {
    const [lon1, lat1] = route.coords[index - 1], [lon2, lat2] = route.coords[index];
    const phi1 = lat1 * Math.PI / 180, phi2 = lat2 * Math.PI / 180;
    const dPhi = phi2 - phi1, dLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
    segmentLengths.push(6_371_008.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
  const geometryLength = segmentLengths.reduce((sum, length) => sum + length, 0) || 1;
  let elapsedSeconds = 0;
  const segmentExposureSeconds = segmentLengths.reduce((sum, length, index) => {
    const [lon1, lat1] = route.coords[index], [lon2, lat2] = route.coords[index + 1];
    const phi1 = lat1 * Math.PI / 180, phi2 = lat2 * Math.PI / 180;
    const dLambda = (lon2 - lon1) * Math.PI / 180;
    const bearing = Math.atan2(Math.sin(dLambda) * Math.cos(phi2), Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda));
    const segmentWalkSeconds = route.timeSeconds * (length / geometryLength);
    const segmentMidpointHour = hour + (elapsedSeconds + segmentWalkSeconds / 2) / 3600;
    const sun = solarAt(segmentMidpointHour, (lat1 + lat2) / 2, (lon1 + lon2) / 2, timeZone);
    const canopy = Math.min(1, 0.25 * shadeMult);
    const buildingShade = sun.altitude <= 0 ? 1 : Math.min(1, (10 * Math.abs(Math.sin(sun.azimuth - bearing))) / (10 * Math.max(0.15, Math.tan(sun.altitude))));
    const shade = 1 - (1 - canopy) * (1 - buildingShade);
    elapsedSeconds += segmentWalkSeconds;
    return sum + segmentWalkSeconds * (1 - shade);
  }, 0);
  return {
    edgeIds: [], nodeIds: [], dist: route.distanceMeters,
    time: route.timeSeconds / 60,
    heat: segmentExposureSeconds / 60,
    uncertain: 0,
    coords: route.coords,
  };
}

function evaluateRealRoutes(routes: RemoteRoute[], hour: number, shade: number, budget: number, place: Place, timeZone: string): RemoteEvaluation {
  const candidates = routes.map((route) => heatForRoute(route, hour, shade, timeZone));
  const baseline = [...candidates].sort((a, b) => a.time - b.time)[0] ?? null;
  const reasonable = candidates.filter((route) => !baseline || route.dist <= baseline.dist * 1.6);
  const withinBudget = reasonable.filter((route) => route.heat <= budget);
  const pool = withinBudget.length ? withinBudget : reasonable.length ? reasonable : candidates;
  const cool = [...pool].sort((a, b) => a.heat - b.heat || a.time - b.time)[0] ?? null;
  const sun = solarAt(hour, place.location.lat, place.location.lon, timeZone);
  const alerts: RouteAlert[] = [];
  if (cool && cool.heat > budget) {
    const overBy = cool.heat - budget;
    const optionWord = reasonable.length === 1 ? "candidate" : "candidates";
    alerts.push({ level: "warn", code: "budget-unmet", message: `The lowest estimate among ${reasonable.length} ${optionWord} within 1.6× the fastest route distance is ${cool.heat.toFixed(2)} min of direct sun. That is ${overBy.toFixed(2)} min over your ${budget.toFixed(2)} min budget, so this route is shown as the closest available option. Try another departure time or adjust the budget.` });
  }
  if (cool && baseline && cool.coords.length === baseline.coords.length && cool.coords.every((point, index) => point[0] === baseline.coords[index][0] && point[1] === baseline.coords[index][1])) alerts.push({ level: "info", code: "same", message: "The available walking routes have the same geometry for this trip." });
  if (sun.altitude <= 0) alerts.push({ level: "info", code: "night", message: "The sun is below the horizon, so modeled sun exposure is zero." });
  return { sun, baseline, cool, budgetMet: !!cool && cool.heat <= budget, detourPct: baseline && cool ? (cool.dist / baseline.dist - 1) * 100 : 0, alerts };
}

function ensureLayers(map: maplibregl.Map, d: MapData) {
  if (map.getSource("base")) return;
  map.addSource("base", { type: "geojson", data: d.base });
  map.addSource("cool", { type: "geojson", data: d.cool });
  map.addSource("points", { type: "geojson", data: d.points });
  const round = { "line-cap": "round" as const, "line-join": "round" as const };
  map.addLayer({
    id: "base", type: "line", source: "base", layout: round,
    paint: { "line-width": 5, "line-color": "#1e3a8a" },
  });
  map.addLayer({
    id: "cool", type: "line", source: "cool", layout: round,
    paint: { "line-width": 5, "line-color": "#7dd3fc" },
  });
  map.addLayer({
    id: "cool-casing", type: "line", source: "cool", layout: round,
    paint: { "line-width": 8, "line-color": "#ffffff", "line-opacity": 0.9 },
  });
  map.moveLayer("cool-casing", "cool");
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
  const { t, language } = useLanguage();
  const minute = language === "hi" ? "मिनट" : "min";
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
            <Metric label={t("Distance")} value={`${(r.dist / 1000).toFixed(2)} km`} />
            <Metric label={t("Walk time")} value={`${r.time.toFixed(1)} ${minute}`} />
            <Metric label={t("Est. direct sun")} value={`${r.heat.toFixed(2)} ${minute}`} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("No route available.")}</p>
        )}
      </CardContent>
    </Card>
  );
}

function AlertItem({ a }: { a: RouteAlert }) {
  const { t, language } = useLanguage();
  if (a.code === "uncertain") return null;
  const Icon = a.level === "info" ? Info : AlertTriangle;
  const cls =
    a.level === "error" ? "border-red-500/50 text-red-600 dark:text-red-400"
    : a.level === "warn" ? "border-amber-500/50 text-amber-700 dark:text-amber-300"
    : "border-sky-500/40";
  const title = t(({ "budget-unmet": "Heat budget exceeded", detour: "Large detour", same: "Routes match", night: "Sun below horizon", "no-route": "No route" } as Record<string, string>)[a.code] ?? "Notice");
  const budget = a.message.match(/The lowest estimate among (\d+) candidates? within 1\.6× the fastest route distance is ([\d.]+) min of direct sun\. That is ([\d.]+) min over your ([\d.]+) min budget/);
  const message = language === "hi" && budget
    ? `${budget[1]} उपलब्ध विकल्पों में न्यूनतम अनुमानित सीधी धूप ${budget[2]} मिनट है। यह आपकी ${budget[4]} मिनट की सीमा से ${budget[3]} मिनट अधिक है। निकटतम उपलब्ध विकल्प दिखाया गया है। रवाना होने का समय बदलें या सीमा समायोजित करें।`
    : t(a.message);
  return (
    <Alert className={cls}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export default function CoolRoutePlanner() {
  const { t, language } = useLanguage();
  const [startPlace, setStartPlace] = React.useState<Place>({ location: { lat: 28.6285, lon: 77.215 }, label: "Connaught Place, New Delhi · start" });
  const [endPlace, setEndPlace] = React.useState<Place>({ location: { lat: 28.6285 + 4 * 0.0009, lon: 77.215 + 5 * 0.00102 }, label: "Connaught Place, New Delhi · destination" });
  const [hour, setHour] = React.useState(13);
  const [shadeMult, setShadeMult] = React.useState(1);
  const [budgetMin, setBudgetMin] = React.useState(3);
  const [stepFree, setStepFree] = React.useState(false);
  const [mapMode, setMapMode] = React.useState<"normal" | "satellite">("normal");
  const [searchStart, setSearchStart] = React.useState("");
  const [searchEnd, setSearchEnd] = React.useState("");
  const [startResults, setStartResults] = React.useState<Place[]>([]);
  const [endResults, setEndResults] = React.useState<Place[]>([]);
  const [activeEndpoint, setActiveEndpoint] = React.useState<"start" | "end">("start");
  const [searching, setSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState("");
  const [routeLoading, setRouteLoading] = React.useState(false);
  const [routeError, setRouteError] = React.useState("");
  const [remoteRoutes, setRemoteRoutes] = React.useState<RemoteRoute[]>([]);
  const [env, setEnv] = React.useState<{ temperatureC: number; uvIndex: number; source: string; timezone?: string; hourly?: { time: string; temperatureC: number; uvIndex: number }[] } | null>(null);

  const timeZone = env?.timezone ?? "Asia/Kolkata";
  const selectedWeather = React.useMemo(() => {
    if (!env?.hourly?.length) return env;
    const localDate = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const targetTime = hour * 60;
    const today = env.hourly.filter((item) => item.time.startsWith(localDate));
    const remainingToday = today.filter((item) => {
      const [, clock = "00:00"] = item.time.split("T");
      const [h, m] = clock.split(":").map(Number);
      return h * 60 + m >= targetTime;
    });
    const candidates = remainingToday.length ? remainingToday : today.length ? today : env.hourly;
    return candidates.reduce((best, item) => {
      const [, clock = "00:00"] = item.time.split("T");
      const [h, m] = clock.split(":").map(Number);
      const [, bestClock = "00:00"] = best.time.split("T");
      const [bestH, bestM] = bestClock.split(":").map(Number);
      return Math.abs(h * 60 + m - targetTime) < Math.abs(bestH * 60 + bestM - targetTime) ? item : best;
    });
  }, [env, hour, timeZone]);
  const ev = React.useMemo(() => evaluateRealRoutes(remoteRoutes, hour, shadeMult, budgetMin, startPlace, timeZone), [remoteRoutes, hour, shadeMult, budgetMin, startPlace, timeZone]);
  const data = React.useMemo(() => buildMapData(ev.baseline, ev.cool, startPlace, endPlace), [ev, startPlace, endPlace]);

  const mapEl = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const dataRef = React.useRef<MapData>(data);
  const mapPickRef = React.useRef<(place: Place) => void>(() => undefined);
  dataRef.current = data;

  mapPickRef.current = (place) => {
    if (activeEndpoint === "start") {
      setStartPlace(place);
      setSearchStart(place.label);
      setStartResults([]);
      setActiveEndpoint("end");
    } else {
      setEndPlace(place);
      setSearchEnd(place.label);
      setEndResults([]);
      setActiveEndpoint("start");
    }
    mapRef.current?.flyTo({ center: [place.location.lon, place.location.lat], zoom: 17, speed: 1.2 });
    setSearchError("");
  };

  // Request a real pedestrian route from OpenStreetMap routing data.
  React.useEffect(() => {
    const controller = new AbortController();
    setRouteLoading(true);
    setRouteError("");
    fetch("/api/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start: startPlace.location, end: endPlace.location }), signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not calculate a walking route.");
        setRemoteRoutes(result.routes as RemoteRoute[]);
      })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setRemoteRoutes([]); setRouteError(error instanceof Error ? error.message : "Could not calculate a walking route."); } })
      .finally(() => { if (!controller.signal.aborted) setRouteLoading(false); });
    return () => controller.abort();
  }, [startPlace, endPlace]);

  React.useEffect(() => {
    fetch(`/api/environment?lat=${startPlace.location.lat.toFixed(4)}&lon=${startPlace.location.lon.toFixed(4)}`)
      .then((r) => r.json()).then(setEnv).catch(() => setEnv(null));
  }, [startPlace]);

  // Create the map once
  React.useEffect(() => {
    if (!mapEl.current) return;
    const map = new maplibregl.Map({
      container: mapEl.current, style: NORMAL_STYLE,
      center: [startPlace.location.lon, startPlace.location.lat],
      zoom: 14,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("style.load", () => ensureLayers(map, dataRef.current));
    map.on("click", (event) => {
      const place = { location: { lat: event.lngLat.lat, lon: event.lngLat.lng }, label: `${event.lngLat.lat.toFixed(5)}, ${event.lngLat.lng.toFixed(5)}` };
      mapPickRef.current(place);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    mapRef.current?.setStyle(mapMode === "normal" ? NORMAL_STYLE : SATELLITE_STYLE);
  }, [mapMode]);

  // Push new data on every scenario change
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("base")) return;
    (map.getSource("base") as maplibregl.GeoJSONSource).setData(data.base);
    (map.getSource("cool") as maplibregl.GeoJSONSource).setData(data.cool);
    (map.getSource("points") as maplibregl.GeoJSONSource).setData(data.points);
  }, [data]);

  const b = ev.baseline, c = ev.cool;
  const exposureDifference = b && c ? b.heat - c.heat : 0;
  const dTime = b && c ? c.time - b.time : 0;

  async function searchPlaces(which: "start" | "end") {
    const query = which === "start" ? searchStart : searchEnd;
    setSearching(true);
    setSearchError("");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      if (!response.ok || !result.places?.length) throw new Error(result.error ?? "No matching places found.");
      (which === "start" ? setStartResults : setEndResults)(result.places);
      setActiveEndpoint(which);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Place search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <section id="planner" className="mx-auto w-full max-w-7xl scroll-mt-4 px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("Route planner")}</h2>
          <p className="text-sm text-muted-foreground">{t("Set your start and destination, then compare walking routes.")}</p>
        </div>
        {env && (
          <Badge variant="secondary" className="gap-1.5">
            <Sun className="h-3.5 w-3.5" />
            {selectedWeather?.temperatureC ?? env.temperatureC}°C · UV {selectedWeather?.uvIndex ?? env.uvIndex}{env.source === "fallback" ? ` (${t("estimate")})` : ""}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{t("Locations")}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className={`block space-y-1 rounded-lg p-2 text-sm ${activeEndpoint === "start" ? "bg-primary/5 ring-1 ring-primary/30" : ""}`}>
                  <span className="font-medium">{t("Search location")}</span>
                  <span className="flex items-center gap-2 rounded-md border border-input px-3"><MapPin className="h-4 w-4 shrink-0 text-indigo-500" /><input value={searchStart} onFocus={() => setActiveEndpoint("start")} onChange={(e) => setSearchStart(e.target.value)} className="h-11 min-w-0 flex-1 bg-transparent outline-none" placeholder={t("e.g. India Gate, New Delhi")} /></span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{t("Selected: ")}{startPlace.label.replace(" · start", ` · ${t("start")}`)}</span>
                  <button type="button" disabled={searching || !searchStart.trim()} onClick={() => void searchPlaces("start")} className="mt-2 min-h-10 rounded-md border px-3 text-sm disabled:opacity-50">{t(searching ? "Searching…" : "Search starting place")}</button>
                  {startResults.length > 0 && <div className="mt-2 max-h-48 space-y-1 overflow-auto rounded-md border p-1" role="listbox" aria-label={t("Starting place results")}>{startResults.map((place, index) => <button type="button" role="option" aria-selected={false} key={`${place.label}-${index}`} onClick={() => mapPickRef.current(place)} className="block min-h-11 w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"><span className="block font-medium">{place.label.split(",").slice(0, 2).join(",")}</span><span className="text-muted-foreground">{t(place.type ?? "Place")} · {t("click to pin and calculate")}</span></button>)}</div>}
                </label>
                <label className={`block space-y-1 rounded-lg p-2 text-sm ${activeEndpoint === "end" ? "bg-primary/5 ring-1 ring-primary/30" : ""}`}>
                  <span className="font-medium">{t("Destination location")}</span>
                  <span className="flex items-center gap-2 rounded-md border border-input px-3"><MapPin className="h-4 w-4 shrink-0 text-cyan-600" /><input value={searchEnd} onFocus={() => setActiveEndpoint("end")} onChange={(e) => setSearchEnd(e.target.value)} className="h-11 min-w-0 flex-1 bg-transparent outline-none" placeholder={t("e.g. Jantar Mantar, New Delhi")} /></span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{t("Selected: ")}{endPlace.label.replace(" · destination", ` · ${t("destination")}`)}</span>
                  <button type="button" disabled={searching || !searchEnd.trim()} onClick={() => void searchPlaces("end")} className="mt-2 min-h-10 rounded-md border px-3 text-sm disabled:opacity-50">{t(searching ? "Searching…" : "Search destination")}</button>
                  {endResults.length > 0 && <div className="mt-2 max-h-48 space-y-1 overflow-auto rounded-md border p-1" role="listbox" aria-label={t("Destination results")}>{endResults.map((place, index) => <button type="button" role="option" aria-selected={false} key={`${place.label}-${index}`} onClick={() => mapPickRef.current(place)} className="block min-h-11 w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"><span className="block font-medium">{place.label.split(",").slice(0, 2).join(",")}</span><span className="text-muted-foreground">{t(place.type ?? "Place")} · {t("click to pin and calculate")}</span></button>)}</div>}
                </label>
              <p className="text-xs text-muted-foreground">{t("Pick a search result, or choose an endpoint above and click any point on the map. Walking directions follow OpenStreetMap paths.")}</p>
                {searchError && <p aria-live="polite" className="text-xs text-muted-foreground">{searchError}</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{t("Scenario")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>{t("Time of day")}</span><span className="font-medium tabular-nums">{fmtHour(hour, language)}</span></div>
                <Slider min={6} max={19} step={0.25} value={[hour]} onValueChange={(v) => setHour(v[0])} aria-label={t("Time of day")} />
                <p className="mt-1 text-xs text-muted-foreground">{t("Sun altitude ")}{Math.max(0, Math.round(ev.sun.altitude * 180 / Math.PI))}°</p>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>{t("Shade availability")}</span><span className="font-medium tabular-nums">×{shadeMult.toFixed(2)}</span></div>
                <Slider min={0.3} max={1.5} step={0.05} value={[shadeMult]} onValueChange={(v) => setShadeMult(v[0])} aria-label={t("Shade availability multiplier")} />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>{t("Heat-exposure budget")}</span><span className="font-medium tabular-nums">{budgetMin.toFixed(2)} {language === "hi" ? "मिनट" : "min"}</span></div>
                <Slider min={0} max={15} step={0.25} value={[budgetMin]} onValueChange={(v) => setBudgetMin(v[0])} aria-label={t("Heat exposure budget in minutes")} />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>{t("Step-free access")} <span className="block text-xs text-muted-foreground">{t("Hard constraint: avoids stairs")}</span></span>
                <Switch checked={stepFree} onCheckedChange={setStepFree} />
              </label>
            </CardContent>
          </Card>

          <div className="space-y-2">{ev.alerts.map((a) => <AlertItem key={a.code} a={a} />)}</div>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex flex-wrap gap-2 border-b border-border bg-card p-3" aria-label={t("Map view")}>
              {([ ["normal", "Normal", SunDim], ["satellite", "Satellite", Satellite] ] as const).map(([mode, label, Icon]) => (
                <button key={mode} type="button" onClick={() => setMapMode(mode)} aria-pressed={mapMode === mode} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${mapMode === mode ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}><Icon className="h-4 w-4" />{t(label)}</button>
              ))}
            </div>
            <div ref={mapEl} className="h-[380px] w-full cursor-crosshair md:h-[480px] lg:h-[540px]" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{mapMode === "normal" ? `${t("Normal street view")} · © OpenStreetMap ${t("contributors")}` : t("Satellite imagery © Esri and contributors")}</span>
            <span>{t("Walking routes © OpenStreetMap · Valhalla")}</span>
          </div>
          <p aria-live="polite" className="text-sm text-muted-foreground">{routeLoading ? t("Calculating real walking routes…") : t(routeError)}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span><b style={{ color: "#1e3a8a" }}>━</b> {t("Fastest")}</span>
            <span><b style={{ color: "#7dd3fc" }}>━</b> {t("CoolRoute shade-aware route")}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <RouteCard title={t("Fastest walking route")} color="#1e3a8a" r={b} />
            <RouteCard title={t("CoolRoute")} color="#7dd3fc" r={c} />
          </div>

          {b && c && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">{t("Trade-offs")}</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                <div><div className="text-2xl font-semibold tabular-nums">{ev.detourPct >= 0 ? "+" : ""}{ev.detourPct.toFixed(0)}%</div><div className="text-muted-foreground">{t("distance added")}</div></div>
                <div><div className="text-2xl font-semibold tabular-nums">{dTime >= 0 ? "+" : ""}{dTime.toFixed(1)} {language === "hi" ? "मिनट" : "min"}</div><div className="text-muted-foreground">{t("time difference")}</div></div>
                <div><div className="text-2xl font-semibold tabular-nums">{Math.abs(exposureDifference).toFixed(2)} {language === "hi" ? "मिनट" : "min"}</div><div className="text-muted-foreground">{t(exposureDifference > 0.005 ? "sun exposure saved" : exposureDifference < -0.005 ? "more exposure on CoolRoute" : "same estimated exposure")}</div></div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm"><span>{t("See the formulas and assumptions behind this estimate.")}</span><Link href={`/formulas?time=${hour}&shade=${shadeMult}&budget=${budgetMin}&distance=${Math.round(c?.dist ?? 0)}&walkTime=${(c?.time ?? 0).toFixed(1)}&exposure=${(c?.heat ?? 0).toFixed(2)}&tz=${encodeURIComponent(timeZone)}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 font-medium text-primary-foreground"><Sun className="h-4 w-4" />{t("Formulas")}</Link></div>
          <p className="text-xs text-muted-foreground">{t("Heat exposure is a model estimate from solar position and shade assumptions. It is not a personal medical risk assessment.")}</p>
        </div>
      </div>
    </section>
  );
}
