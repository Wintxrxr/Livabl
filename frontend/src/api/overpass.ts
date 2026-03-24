export interface OsmPolygon {
  id: string;
  name: string;
  score: number;
  pollution_score: number;
  hospital_score: number;
  school_score: number;
  coordinates: [number, number][][];
}

export async function fetchNeighbourhoodBoundaries(): Promise<OsmPolygon[]> {
  try {
    const res = await fetch("/data/wards_score.geojson");
    if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
    const geojson = await res.json();
    return parseWardsGeoJSON(geojson);
  } catch (err) {
    console.warn("[Wards] Failed to load ward data:", err);
    return [];
  }
}

function parseWardsGeoJSON(geojson: any): OsmPolygon[] {
  const results: OsmPolygon[] = [];

  for (const feature of geojson.features) {
    const props = feature.properties;
    const name = props?.Ward_Name;
    const geometry = feature.geometry;
    if (!name || !geometry) continue;

    const flip = (ring: number[][]): [number, number][] =>
      ring.map(([lng, lat]) => [lat, lng] as [number, number]);

    let coordinates: [number, number][][] = [];

    if (geometry.type === "Polygon") {
      coordinates = geometry.coordinates.map(flip);
    } else if (geometry.type === "MultiPolygon") {
      coordinates = geometry.coordinates.map((poly: number[][][]) =>
        flip(poly[0]),
      );
    }

    if (coordinates.length === 0) continue;

    results.push({
      id: `ward-${props.ward_id ?? name}`,
      name,
      score: Math.round((props.livability_score ?? 0) * 100),
      pollution_score: Math.round((props.pollution_score ?? 0) * 100),
      hospital_score: Math.round((props.hospital_score ?? 0) * 100),
      school_score: Math.round((props.school_score ?? 0) * 100),
      coordinates,
    });
  }

  console.log(`[Wards] Loaded ${results.length} Delhi wards`);
  return results;
}
