import { NextRequest, NextResponse } from "next/server";

const INE_API = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA";

const INE_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Accept: "application/json",
};

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas
const cache = new Map<string, { data: any[]; ts: number }>();
const inflight = new Map<string, Promise<any[]>>();

async function cachedFetch(url: string): Promise<any[]> {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

    const existing = inflight.get(url);
    if (existing) return existing;

    const promise = (async () => {
        const response = await fetch(url, { headers: INE_HEADERS });
        if (!response.ok) {
            console.warn(`INE API error: ${url} → ${response.status}`);
            return [];
        }
        const data: any[] = await response.json();
        cache.set(url, { data, ts: Date.now() });
        return data;
    })();

    inflight.set(url, promise);
    try {
        return await promise;
    } finally {
        inflight.delete(url);
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const table = searchParams.get("table");
    const cod_int = searchParams.get("cod_int");
    const nult = searchParams.get("nult") || "15";

    if (!table || !cod_int) {
        return NextResponse.json({ error: "table and cod_int are required" }, { status: 400 });
    }

    const url = `${INE_API}/${table}?nult=${nult}&tv=19:${cod_int}`;
    const data = await cachedFetch(url);

    return NextResponse.json(data, {
        headers: {
            "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
        },
    });
}
