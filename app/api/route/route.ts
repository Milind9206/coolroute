type ValhallaTrip = {
  summary?: { length?: number; time?: number };
  legs?: Array<{ shape?: string; summary?: { length?: number; time?: number } }>;
};

function decodePolyline6(value: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lon = 0;
  while (index < value.length) {
    const read = () => {
      let result = 0, shift = 0, byte = 0;
      do {
        if (index >= value.length) throw new Error("Invalid route geometry");
        byte = value.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      return result & 1 ? ~(result >> 1) : result >> 1;
    };
    lat += read(); lon += read();
    points.push([lon / 1e6, lat / 1e6]);
  }
  return points;
}

function normalizeTrip(trip: ValhallaTrip) {
  const legs = trip.legs ?? [];
  const coordinates = legs.flatMap((leg) => leg.shape ? decodePolyline6(leg.shape) : []);
  const lengthKm = trip.summary?.length ?? legs.reduce((sum, leg) => sum + (leg.summary?.length ?? 0), 0);
  const durationSeconds = trip.summary?.time ?? legs.reduce((sum, leg) => sum + (leg.summary?.time ?? 0), 0);
  if (coordinates.length < 2 || !Number.isFinite(lengthKm) || !Number.isFinite(durationSeconds)) return null;
  return { coordinates, distanceMeters: lengthKm * 1000, durationSeconds };
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Send valid start and end coordinates." }, { status: 400 }); }
  const value = body as { start?: { lat?: number; lon?: number }; end?: { lat?: number; lon?: number }; longDistance?: boolean };
  const validPoint = (p?: { lat?: number; lon?: number }) => p && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat!) <= 90 && Math.abs(p.lon!) <= 180;
  if (!validPoint(value.start) || !validPoint(value.end)) return Response.json({ error: "Select a valid start and destination on the map." }, { status: 400 });
  const dLat = (value.end!.lat! - value.start!.lat!) * Math.PI / 180;
  const dLon = (value.end!.lon! - value.start!.lon!) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(value.start!.lat! * Math.PI / 180) * Math.cos(value.end!.lat! * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const directDistance = 2 * 6371000 * Math.asin(Math.sqrt(a));
  if (directDistance < 5) return Response.json({ error: "Choose two points at least five metres apart." }, { status: 400 });
  const maxDistance = value.longDistance ? 300_000 : 100_000;
  if (directDistance > maxDistance) {
    return Response.json({ error: value.longDistance ? "This route is over 300 km. Choose closer points; the public walking router has a practical range limit." : "This route is over 100 km. Turn on Long-distance walk to request routes up to 300 km." }, { status: 400 });
  }

  try {
    const response = await fetch("https://valhalla1.openstreetmap.de/route", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "X-Client-Id": "coolroute-local-demo" },
      body: JSON.stringify({
        locations: [
          { lat: value.start!.lat, lon: value.start!.lon, type: "break" },
          { lat: value.end!.lat, lon: value.end!.lon, type: "break" },
        ],
        costing: "pedestrian",
        costing_options: { pedestrian: { walking_speed: 4.8 } },
        units: "kilometers",
        alternates: 2,
        directions_options: { units: "kilometers", narrative: false },
      }),
      signal: AbortSignal.timeout(value.longDistance ? 60000 : 20000),
    });
    const payload = await response.json() as { trip?: ValhallaTrip; alternates?: Array<{ trip?: ValhallaTrip }>; error?: string; status_message?: string };
    if (!response.ok || !payload.trip) {
      return Response.json({ error: payload.status_message || payload.error || "The walking route service could not find a route." }, { status: 502 });
    }
    const routes = [payload.trip, ...(payload.alternates ?? []).map((item) => item.trip).filter((trip): trip is ValhallaTrip => !!trip)]
      .map(normalizeTrip).filter((route): route is NonNullable<typeof route> => !!route);
    if (!routes.length) return Response.json({ error: "The walking route service returned no usable route geometry." }, { status: 502 });
    return Response.json({ routes }, { headers: { "Cache-Control": "private, max-age=20" } });
  } catch {
    return Response.json({ error: "Could not reach the public walking route service. Check your internet connection and try again." }, { status: 502 });
  }
}
