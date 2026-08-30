import { NextRequest, NextResponse } from "next/server";
import { getDistance } from "geolib";
import { Site } from "@/types";

const BASE_URL =
  "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets";
const DATASET_ID = "registro-de-municipios-de-castilla-y-leon";

export async function GET(
  request: NextRequest,
) {
  const eq = request.nextUrl.searchParams.get("eq");
  const eq_by = request.nextUrl.searchParams.get("eq_by") || "cod_ine";

  const search = request.nextUrl.searchParams.get("search");
  const search_by = request.nextUrl.searchParams.get("search_by") || "municipio";
  const limit = request.nextUrl.searchParams.get("limit") || "10";
  const random = request.nextUrl.searchParams.get("random");
  const offsetParam = request.nextUrl.searchParams.get("offset");

  const userLat = request.nextUrl.searchParams.get("lat");
  const userLon = request.nextUrl.searchParams.get("lon");

  let offset = offsetParam ? parseInt(offsetParam, 10) : 0;
  if (random === "true") {
    // selecciona municipios aleatorios sin repetir
    offset = Math.floor(Math.random() * 2200);
  }

  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.set("where", `search(${search_by}, "${search}")`);
  }
  if (eq) {
    queryParams.set("where", `${eq_by} = ${eq}`);
  }
  queryParams.set("limit", limit);
  queryParams.set("offset", offset.toString());

  const url = `${BASE_URL}/${DATASET_ID}/records?${queryParams.toString()}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data: { results: Site[] } = await res.json();

  if (userLat && userLon && data.results) {
    const lat = parseFloat(userLat);
    const lon = parseFloat(userLon);

    if (!isNaN(lat) && !isNaN(lon)) {
      data.results = data.results.map((record: Site) => {
        const pos = record.posicion;
        if (pos?.lat != null && pos?.lon != null) {
          const distance = getDistance(
            { latitude: lat, longitude: lon },
            { latitude: pos.lat, longitude: pos.lon }
          );
          return { ...record, distance };
        }
        return record;
      });

      data.results.sort((a: Site, b: Site) =>
        (a.distance ?? Infinity) - (b.distance ?? Infinity)
      );
    }
  }

  return NextResponse.json(data, { status: res.status });
}
