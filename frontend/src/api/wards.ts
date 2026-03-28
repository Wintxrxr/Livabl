import type {
  Neighborhood,
  NeighborhoodsResponse,
  SearchResponse,
} from "../types";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// ─── Load from local GeoJSON ──────────────────────────────────────────────────
async function loadFromGeoJSON(): Promise<Neighborhood[]> {
  const res = await fetch("/data/wards_score.geojson");
  if (!res.ok) throw new Error(`Failed to load GeoJSON: ${res.status}`);
  const geojson = await res.json();

  return geojson.features
    .filter((f: any) => f.properties?.Ward_Name && f.geometry)
    .map((f: any, i: number) => {
      const p = f.properties;

      // Calculate centroid for pin placement
      const coords =
        f.geometry.type === "Polygon"
          ? f.geometry.coordinates[0]
          : f.geometry.coordinates[0][0];
      const lats = coords.map((c: number[]) => c[1]);
      const lngs = coords.map((c: number[]) => c[0]);
      const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const lng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      const n = (v: any) => (v != null ? Math.round(v * 100) : 0);
      const overall = n(p.livability_score);

      return {
        id: String(p.ward_id ?? i),
        name: p.Ward_Name,
        city: "Delhi",
        region: "Delhi NCR",
        area_km2: 0,
        score: overall,
        breakdown: {
          safety: overall,
          walkability: n(p.pollution_score),
          transit: overall,
          schools: n(p.school_score),
          greenery: n(p.pollution_score),
          noise: n(p.pollution_score),
        },
        coordinates: { lat, lng },
      } as Neighborhood;
    });
}

// ─── Load from real API ───────────────────────────────────────────────────────
async function loadFromAPI(): Promise<Neighborhood[]> {
  const res = await fetch(`${API_BASE}/wards`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  // Get coordinates from GeoJSON since API doesn't return geometry
  const local = await loadFromGeoJSON();
  const coordMap = new Map(
    local.map((w) => [w.name.toLowerCase(), w.coordinates]),
  );

  return data.map((w: any) => {
    const coords = coordMap.get(w.name?.toLowerCase()) ?? {
      lat: 28.6139,
      lng: 77.209,
    };
    const score = Math.round(w.score ?? 0);
    return {
      id: String(w.id),
      name: w.name ?? `Ward ${w.id}`,
      city: w.city ?? "Delhi",
      region: "Delhi NCR",
      area_km2: 0,
      score,
      breakdown: {
        safety: score,
        walkability: score,
        transit: score,
        schools: score,
        greenery: score,
        noise: score,
      },
      coordinates: coords,
    } as Neighborhood;
  });
}

// ─── Public functions ─────────────────────────────────────────────────────────
export async function getNeighborhoods(): Promise<NeighborhoodsResponse> {
  try {
    const neighborhoods = API_BASE
      ? await loadFromAPI()
      : await loadFromGeoJSON();
    return { neighborhoods, total: neighborhoods.length };
  } catch (err) {
    console.warn("[Livabl] Falling back to local GeoJSON:", err);
    const neighborhoods = await loadFromGeoJSON();
    return { neighborhoods, total: neighborhoods.length };
  }
}

export async function searchNeighborhoods(
  query: string,
): Promise<SearchResponse> {
  const { neighborhoods } = await getNeighborhoods();
  const q = query.toLowerCase();
  const results = neighborhoods.filter((n) => n.name.toLowerCase().includes(q));
  return { query, results };
}

export async function getNeighborhood(
  id: string,
): Promise<Neighborhood | null> {
  const { neighborhoods } = await getNeighborhoods();
  return neighborhoods.find((n) => n.id === id) ?? null;
}
