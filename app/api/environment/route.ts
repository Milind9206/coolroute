const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get("lat");
  const rawLon = searchParams.get("lon");
  if (!rawLat?.trim() || !rawLon?.trim()) {
    return jsonError("Valid lat and lon query parameters are required.", 400);
  }

  const lat = Number(rawLat);
  const lon = Number(rawLon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return jsonError("Valid lat and lon query parameters are required.", 400);
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return jsonError("Coordinates are outside the valid latitude or longitude range.", 400);
  }

  const url = new URL(OPEN_METEO_URL);
  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,uv_index",
    temperature_unit: "celsius",
  }).toString();

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 900 },
    });
    if (!response.ok) {
      return jsonError("The weather service is temporarily unavailable.", 502);
    }

    const payload = await response.json();
    const temperatureC = payload?.current?.temperature_2m;
    const uvIndex = payload?.current?.uv_index;
    if (!Number.isFinite(temperatureC) || !Number.isFinite(uvIndex)) {
      return jsonError("The weather service returned incomplete data.", 502);
    }

    return Response.json({
      temperatureC: Math.round(temperatureC * 10) / 10,
      uvIndex: Math.round(uvIndex * 10) / 10,
      source: "open-meteo",
    });
  } catch {
    return jsonError("Could not reach the weather service.", 502);
  }
}

