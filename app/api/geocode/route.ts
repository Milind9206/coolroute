const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return Response.json({ error: "Enter at least two characters to search." }, { status: 400 });
  }
  if (query.length > 160) {
    return Response.json({ error: "Search text must be 160 characters or fewer." }, { status: 400 });
  }

  const url = new URL(NOMINATIM_URL);
  url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "5", addressdetails: "1" }).toString();

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "CoolRoute/0.1 OpenStreetMap place search",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return Response.json({ error: "OpenStreetMap search is temporarily unavailable. Please try again shortly." }, { status: 502 });
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return Response.json({ error: "OpenStreetMap returned an unexpected search response." }, { status: 502 });
    }

    const results = payload.flatMap((place) => {
      if (
        typeof place?.place_id !== "number" ||
        typeof place?.display_name !== "string" ||
        typeof place?.lat !== "string" ||
        typeof place?.lon !== "string" ||
        !Number.isFinite(Number(place.lat)) ||
        !Number.isFinite(Number(place.lon))
      ) return [];
      return [{ place_id: place.place_id, display_name: place.display_name, lat: place.lat, lon: place.lon }];
    });

    return Response.json({ results }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch {
    return Response.json({ error: "Could not reach OpenStreetMap search. Check your internet connection and try again." }, { status: 502 });
  }
}
