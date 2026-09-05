import { NextRequest, NextResponse } from "next/server";
import { getDistance } from "geolib";
import { Site } from "@/types";

const BASE_URL = "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/registro-de-municipios-de-castilla-y-leon/records";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const eq = searchParams.get("eq");
  const eq_by = searchParams.get("eq_by") || "cod_ine";
  const search = searchParams.get("search");
  const search_by = searchParams.get("search_by") || "municipio";
  const limit = searchParams.get("limit") || "10";
  const random = searchParams.get("random");
  const offsetParam = searchParams.get("offset");
  const userLat = searchParams.get("lat");
  const userLon = searchParams.get("lon");

  const offset = random === "true" ? Math.floor(Math.random() * 2200) : (offsetParam ? parseInt(offsetParam, 10) : 0);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("where", `search(${search_by}, "${search}")`);
  if (eq) queryParams.set("where", `${eq_by} = ${eq}`);
  queryParams.set("limit", limit);
  queryParams.set("offset", offset.toString());

  const res = await fetch(`${BASE_URL}?${queryParams.toString()}`, { headers: { Accept: "application/json" } });
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch from JCyL" }, { status: res.status });

  const data: { results: Site[] } = await res.json();

  if (userLat && userLon && data.results) {
    const lat = parseFloat(userLat);
    const lon = parseFloat(userLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      data.results = data.results.map((record: Site) => {
        const pos = record.posicion;
        if (pos?.lat != null && pos?.lon != null) {
          return { ...record, distance: getDistance({ latitude: lat, longitude: lon }, { latitude: pos.lat, longitude: pos.lon }) };
        }
        return record;
      });
      data.results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
  }

  return NextResponse.json(data, { status: res.status });
}
