import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets";
const DATASET_ID = "registro-de-municipios-de-castilla-y-leon";

export async function GET(
  request: NextRequest,
) {
  const search = request.nextUrl.searchParams.get("search");
  const limit = request.nextUrl.searchParams.get("limit") || "10";
  const random = request.nextUrl.searchParams.get("random");
  const offsetParam = request.nextUrl.searchParams.get("offset");

  let offset = offsetParam ? parseInt(offsetParam, 10) : 0;
  if (random === "true") {
    // selecciona municipios aleatorios sin repetir
    offset = Math.floor(Math.random() * 2200);
  }

  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.set("where", `search(municipio, "${search}")`);
  }
  queryParams.set("limit", limit);
  queryParams.set("offset", offset.toString());

  const url = `${BASE_URL}/${DATASET_ID}/records?${queryParams.toString()}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
