import * as SunCalc from "suncalc";

export const COLS = 6;
export const ROWS = 5;
// South-west corner of the synthetic neighbourhood (near Connaught Place, Delhi).
export const ORIGIN = { lat: 28.6285, lon: 77.215 };
const DLAT = 0.0009; // ~100 m
const DLON = 0.00102; // ~100 m at this latitude
const RAD = Math.PI / 180;

export type GNode = {
  id: number; r: number; c: number; lat: number; lon: number;
  wait: number;  // crossing wait, seconds
  shade: number; // junction shade 0..1
};
export type GEdge = {
  id: string; a: number; b: number;
  len: number;      // metres
  canopy: number;   // tree shade 0..1
  height: number;   // building height, metres
  orient: number;   // street bearing, degrees (0 = N-S, 90 = E-W)
  slope: number;    // grade a -> b
  stepFree: boolean;
  closable?: boolean;
};
export type Graph = { nodes: GNode[]; edges: GEdge[]; start: number; end: number };

export type Scenario = {
  hour: number; shadeMult: number; budgetMin: number;
  stepFree: boolean; closed: boolean;
};
export type Sun = { altitude: number; azimuth: number }; // azimuth from north, clockwise

export type RouteStats = {
  edgeIds: string[]; nodeIds: number[];
  time: number; heat: number; dist: number; // minutes, minutes, metres
  uncertain: number; coords: [number, number][]; // [lon, lat]
};
export type Alert = { level: "info" | "warn" | "error"; code: string; message: string };
export type Evaluation = {
  sun: Sun; baseline: RouteStats | null; cool: RouteStats | null;
  budgetMet: boolean; detourPct: number; alerts: Alert[];
};

// ---------- Synthetic neighbourhood ----------
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildGraph(start = (ROWS - 1) * COLS, end = COLS - 1): Graph {
  const rnd = mulberry32(42);
  const nodes: GNode[] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const sunnyCorner = r === ROWS - 1 || c === COLS - 1;
      nodes.push({
        id: r * COLS + c, r, c,
        lat: ORIGIN.lat + (ROWS - 1 - r) * DLAT,
        lon: ORIGIN.lon + c * DLON,
        wait: 10 + rnd() * 40,
        shade: sunnyCorner ? rnd() * 0.15 : 0.2 + rnd() * 0.5,
      });
    }

  const edges: GEdge[] = [];
  const add = (a: number, b: number, vertical: boolean) => {
    const A = nodes[a];
    const sunny = vertical ? A.c === COLS - 1 : A.r === ROWS - 1; // bottom row + right column
    const avenue = !vertical && A.r === 2;
    const base = vertical ? 100 : 98;
    edges.push({
      id: `${a}-${b}`, a, b,
      len: base * (sunny ? 0.85 + rnd() * 0.1 : 1 + rnd() * 0.2),
      canopy: sunny ? 0.03 + rnd() * 0.09 : avenue ? 0.8 + rnd() * 0.1 : 0.25 + rnd() * 0.35,
      height: sunny ? 3 + rnd() * 5 : 8 + rnd() * 22,
      orient: vertical ? 0 : 90,
      slope: (rnd() - 0.5) * 0.08,
      stepFree: sunny || avenue ? true : rnd() > 0.12,
      closable: avenue && A.c === 2,
    });
  };
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const a = r * COLS + c;
      if (c < COLS - 1) add(a, a + 1, false);
      if (r < ROWS - 1) add(a, a + COLS, true);
    }
  return { nodes, edges, start, end };
}

// ---------- Solar geometry ----------
function localClockToUtc(hour: number, timeZone: string): Date {
  const now = new Date();
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(now);
  const part = (type: string) => Number(dateParts.find((item) => item.type === type)?.value);
  const wholeHour = Math.floor(hour);
  const minute = Math.round((hour - wholeHour) * 60);
  const targetAsUtc = Date.UTC(part("year"), part("month") - 1, part("day"), wholeHour, minute);
  let guess = targetAsUtc;

  // Resolve the local wall-clock time through the IANA zone, including DST.
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23",
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = formatter.formatToParts(new Date(guess));
    const value = (type: string) => Number(parts.find((item) => item.type === type)?.value);
    const representedAsUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
    guess += targetAsUtc - representedAsUtc;
  }
  return new Date(guess);
}

export function solarAt(hour: number, latitude = ORIGIN.lat, longitude = ORIGIN.lon, timeZone = "Asia/Kolkata"): Sun {
  let date: Date;
  try {
    date = localClockToUtc(hour, timeZone);
  } catch {
    date = localClockToUtc(hour, "UTC");
  }
  const p = SunCalc.getPosition(date, latitude, longitude);
  return { altitude: p.altitude, azimuth: (p.azimuth + Math.PI) % (2 * Math.PI) }; // suncalc measures from south
}

// ---------- Segment cost ----------
export function segmentCost(g: Graph, e: GEdge, dir: 1 | -1, sun: Sun, shadeMult: number) {
  const night = sun.altitude <= 0;
  const canopy = Math.min(1, e.canopy * shadeMult);
  const sBuilding = night
    ? 1
    : Math.min(1, (e.height * Math.abs(Math.sin(sun.azimuth - e.orient * RAD))) /
        (10 * Math.max(0.15, Math.tan(sun.altitude))));
  const shade = 1 - (1 - canopy) * (1 - sBuilding); // S_e(t)
  const grade = e.slope * dir;
  const v = 1.67 * Math.exp(-3.5 * Math.abs(grade + 0.05)); // Tobler
  const tSec = e.len / v;
  const effort = 1 + Math.max(0, grade * 5);
  const to = dir > 0 ? e.b : e.a;
  const n = g.nodes[to];
  const nodeShade = night ? 1 : Math.min(1, n.shade * shadeMult);
  const heatSec = tSec * (1 - shade) * effort + n.wait * (1 - nodeShade); // H_e(t)
  return { t: (tSec + n.wait) / 60, h: heatSec / 60, d: e.len, to, shade };
}

// ---------- Search ----------
type Adj = [GEdge, 1 | -1][][];
type Label = { node: number; t: number; h: number; d: number; prev: Label | null; edge: GEdge | null };
type Ctx = { g: Graph; sc: Scenario; sun: Sun; adj: Adj };

function buildAdj(g: Graph, sc: Scenario): Adj {
  const adj: Adj = g.nodes.map(() => []);
  for (const e of g.edges) {
    if (sc.closed && e.closable) continue;
    if (sc.stepFree && !e.stepFree) continue; // hard constraint
    adj[e.a].push([e, 1]);
    adj[e.b].push([e, -1]);
  }
  return adj;
}

/** Plain Dijkstra minimising distance or heat. */
function dijkstra(ctx: Ctx, key: "d" | "h"): Label | null {
  const { g, sc, sun, adj } = ctx;
  const best = new Map<number, number>();
  const open: Label[] = [{ node: g.start, t: 0, h: 0, d: 0, prev: null, edge: null }];
  best.set(g.start, 0);
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i][key] < open[bi][key]) bi = i;
    const l = open.splice(bi, 1)[0];
    if (l[key] > (best.get(l.node) ?? Infinity)) continue;
    if (l.node === g.end) return l;
    for (const [e, dir] of adj[l.node]) {
      const x = segmentCost(g, e, dir, sun, sc.shadeMult);
      const n: Label = { node: x.to, t: l.t + x.t, h: l.h + x.h, d: l.d + x.d, prev: l, edge: e };
      if (n[key] < (best.get(x.to) ?? Infinity)) { best.set(x.to, n[key]); open.push(n); }
    }
  }
  return null;
}

/** Resource-constrained shortest path: min time s.t. heat <= budget (Pareto labels). */
function constrained(ctx: Ctx): Label | null {
  const { g, sc, sun, adj } = ctx;
  const front: [number, number][][] = g.nodes.map(() => []);
  const open: Label[] = [{ node: g.start, t: 0, h: 0, d: 0, prev: null, edge: null }];
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i].t < open[bi].t) bi = i;
    const l = open.splice(bi, 1)[0];
    if (l.node === g.end) return l;
    for (const [e, dir] of adj[l.node]) {
      const x = segmentCost(g, e, dir, sun, sc.shadeMult);
      const n: Label = { node: x.to, t: l.t + x.t, h: l.h + x.h, d: l.d + x.d, prev: l, edge: e };
      if (n.h > sc.budgetMin) continue; // resource constraint
      const f = front[x.to];
      if (f.some(([t, h]) => t <= n.t && h <= n.h)) continue; // dominated
      front[x.to] = f.filter(([t, h]) => !(n.t <= t && n.h <= h));
      front[x.to].push([n.t, n.h]);
      open.push(n);
    }
  }
  return null;
}

function toStats(g: Graph, l: Label): RouteStats {
  const edges: GEdge[] = [], nodeIds: number[] = [];
  for (let c: Label | null = l; c; c = c.prev) { nodeIds.unshift(c.node); if (c.edge) edges.unshift(c.edge); }
  return {
    edgeIds: edges.map((e) => e.id), nodeIds, time: l.t, heat: l.h, dist: l.d,
    uncertain: 0,
    coords: nodeIds.map((i) => [g.nodes[i].lon, g.nodes[i].lat] as [number, number]),
  };
}

// ---------- Public API ----------
export function evaluate(g: Graph, sc: Scenario): Evaluation {
  const sun = solarAt(sc.hour);
  const ctx: Ctx = { g, sc, sun, adj: buildAdj(g, sc) };
  const alerts: Alert[] = [];

  const b = dijkstra(ctx, "d");
  if (!b) {
    alerts.push({ level: "error", code: "no-route", message: "No walkable route exists with the current closure and step-free settings." });
    return { sun, baseline: null, cool: null, budgetMet: false, detourPct: 0, alerts };
  }
  const baseline = toStats(g, b);

  let cool: RouteStats;
  let budgetMet = true;
  const c = constrained(ctx);
  if (c) cool = toStats(g, c);
  else {
    budgetMet = false;
    cool = toStats(g, dijkstra(ctx, "h")!);
    alerts.push({
      level: "error", code: "budget-unmet",
      message: `No route fits a ${sc.budgetMin}-minute heat budget. Showing the lowest-exposure route (${cool.heat.toFixed(1)} min).`,
    });
  }

  const detourPct = (cool.dist / baseline.dist - 1) * 100;
  if (detourPct > 25)
    alerts.push({ level: "warn", code: "detour", message: `The cooler route adds ${detourPct.toFixed(0)}% distance, which is a large detour.` });
  if (budgetMet && cool.edgeIds.join() === baseline.edgeIds.join())
    alerts.push({ level: "info", code: "same", message: "The shortest route already fits your budget, so CoolRoute matches it. Lower the budget to see a cooler alternative." });
  if (sun.altitude <= 0)
    alerts.push({ level: "info", code: "night", message: "The sun is below the horizon, so modelled sun exposure is zero." });

  return { sun, baseline, cool, budgetMet, detourPct, alerts };
}
