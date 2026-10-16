import { NextRequest, NextResponse } from "next/server";

const FALLBACK = { temperatureC: 32, uvIndex: 5, source: "fallback", hourly: [] };

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
      hourly: "temperature_2m,uv_index",
      forecast_days: "2",
      timezone: "auto",
    }).toString();

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Weather request failed (${response.status}).`);

    const weather = await response.json();
    const times: unknown[] = weather.hourly?.time ?? [];
    const temperatures: unknown[] = weather.hourly?.temperature_2m ?? [];
    const uvValues: unknown[] = weather.hourly?.uv_index ?? [];
    const hourly = times.flatMap((time, index) => {
      const temperatureC = Number(temperatures[index]);
      const uvIndex = Number(uvValues[index]);
      if (typeof time !== "string" || !Number.isFinite(temperatureC) || !Number.isFinite(uvIndex)) return [];
      return [{ time, temperatureC: Math.round(temperatureC), uvIndex: Math.round(uvIndex * 10) / 10 }];
    });
    if (hourly.length === 0) {
      throw new Error("Weather response was incomplete.");
    }

    return NextResponse.json({
      ...hourly[0],
      hourly,
      timezone: typeof weather.timezone === "string" ? weather.timezone : undefined,
      source: "open-meteo",
    });
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
