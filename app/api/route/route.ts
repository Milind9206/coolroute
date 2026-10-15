import { NextRequest, NextResponse } from "next/server";

function decodePolyline6(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lon = 0;
  while (index < encoded.length) {
    const read = () => {
      let result = 0, shift = 0, byte = 0;
      do {
        if (index >= encoded.length) throw new Error("Invalid route geometry.");
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      return result & 1 ? ~(result >> 1) : result >> 1;
    };
    lat += read();
    lon += read();
    points.push([lon / 1e6, lat / 1e6]);
  }
  return points;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, end } = body as { start?: { lat: number; lon: number }; end?: { lat: number; lon: number } };
    const valid = (point?: { lat: number; lon: number }) => point && Number.isFinite(point.lat) && Number.isFinite(point.lon) && Math.abs(point.lat) <= 90 && Math.abs(point.lon) <= 180;
    if (!valid(start) || !valid(end)) return NextResponse.json({ error: "Valid start and destination coordinates are required." }, { status: 400 });

    const response = await fetch("https://valhalla1.openstreetmap.de/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locations: [{ lat: start!.lat, lon: start!.lon, type: "break" }, { lat: end!.lat, lon: end!.lon, type: "break" }],
        costing: "pedestrian",
        units: "kilometers",
        alternates: 5,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.trip) {
      const detail = result.error ?? result.status_message ?? "No walkable route could be found between these points.";
      return NextResponse.json({ error: detail }, { status: response.status === 429 ? 429 : 422 });
    }

    const trips = [result.trip, ...(Array.isArray(result.alternates) ? result.alternates.map((alternate: { trip?: unknown }) => alternate.trip).filter(Boolean) : [])];
    const routes = trips.map((trip: { legs?: { shape?: string }[]; summary?: { length?: number; time?: number } }) => {
      const coords = (trip.legs ?? []).flatMap((leg) => leg.shape ? decodePolyline6(leg.shape) : []);
      return {
        coords,
        distanceMeters: Number(trip.summary?.length ?? 0) * 1000,
        timeSeconds: Number(trip.summary?.time ?? 0),
      };
    }).filter((route: { coords: [number, number][]; distanceMeters: number; timeSeconds: number }) => route.coords.length > 1 && route.distanceMeters > 0 && route.timeSeconds > 0);
    if (!routes.length) return NextResponse.json({ error: "The routing service returned no usable walking paths." }, { status: 502 });
    return NextResponse.json({ routes, source: "OpenStreetMap · Valhalla pedestrian routing" });
  } catch {
    return NextResponse.json({ error: "Real-world walking route service is unavailable. Please try again shortly." }, { status: 502 });
  }
}
