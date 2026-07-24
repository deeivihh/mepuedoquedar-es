import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dataset_id: string }> }
) {
  const { dataset_id } = await params;
  const query = request.nextUrl.searchParams.toString();
  const url = `${BASE_URL}/${dataset_id}/records${query ? `?${query}` : ""}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
