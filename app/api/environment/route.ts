import { NextRequest, NextResponse } from "next/server";

const FALLBACK = { temperatureC: 32, uvIndex: 5, source: "fallback" };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (
    !Number.isFinite(lat) || !Number.isFinite(lon) ||
    lat < -90 || lat > 90 || lon < -180 || lon > 180
  ) {
    return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "temperature_2m,uv_index",
      timezone: "auto",
    }).toString();

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Weather request failed (${response.status}).`);

    const weather = await response.json();
    const temperatureC = Number(weather.current?.temperature_2m);
    const uvIndex = Number(weather.current?.uv_index);
    if (!Number.isFinite(temperatureC) || !Number.isFinite(uvIndex)) {
      throw new Error("Weather response was incomplete.");
    }

    return NextResponse.json({
      temperatureC: Math.round(temperatureC),
      uvIndex: Math.round(uvIndex * 10) / 10,
      timezone: typeof weather.timezone === "string" ? weather.timezone : undefined,
      source: "open-meteo",
    });
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
