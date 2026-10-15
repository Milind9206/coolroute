import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length > 160) return NextResponse.json({ error: "A place query is required." }, { status: 400 });

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "5", addressdetails: "1" }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "CoolRoute/0.1 (local route planner)" }, next: { revalidate: 60 } });
    if (!response.ok) return NextResponse.json({ error: "Place search is unavailable." }, { status: 502 });
    const results = await response.json();
    const places = results.map((match: { lat: string; lon: string; display_name: string; type?: string }) => ({
      location: { lat: Number(match.lat), lon: Number(match.lon) },
      label: match.display_name,
      type: match.type ?? "place",
    })).filter((place: { location: { lat: number; lon: number } }) => Number.isFinite(place.location.lat) && Number.isFinite(place.location.lon));
    if (!places.length) return NextResponse.json({ error: "Place not found." }, { status: 404 });
    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ error: "Place search is unavailable." }, { status: 502 });
  }
}
