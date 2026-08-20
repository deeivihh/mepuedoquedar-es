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

export async function POST(request: NextRequest) {
    try {
        const body: any = await request.json();
        const { queries, cod_int } = body;

        if (!queries || !Array.isArray(queries) || !cod_int) {
            return NextResponse.json({ error: "queries and cod_int are required" }, { status: 400 });
        }

        const urlMap = new Map<string, { url: string; keys: string[] }>();
        for (const q of queries) {
            const nult = q.nult ?? 15;
            let tvParams = `&tv=19:${cod_int}`;
            if (q.tv) {
                const tvList = Array.isArray(q.tv) ? q.tv : [q.tv];
                for (const item of tvList) {
                    const cleanTv = String(item).replace(/^&?tv=/, "").trim();
                    if (cleanTv) {
                        tvParams += `&tv=${cleanTv}`;
                    }
                }
            }
            const url = `${INE_API}/${q.table}?nult=${nult}${tvParams}`;
            const existing = urlMap.get(url);
            if (existing) {
                existing.keys.push(q.key);
            } else {
                urlMap.set(url, { url, keys: [q.key] });
            }
        }

        const entries = Array.from(urlMap.values());
        console.log(`[INE Batch] Fetching ${entries.length} URLs for cod_int=${cod_int}`);

        const responses = await Promise.all(
            entries.map(async (e) => {
                const res = await cachedFetch(e.url);
                console.log(`[INE Batch] ${e.url} -> ${res?.length || 0} items`);
                return res;
            })
        );

        const results: Record<string, any[]> = {};
        for (let i = 0; i < entries.length; i++) {
            for (const key of entries[i].keys) {
                results[key] = responses[i];
            }
        }

        return NextResponse.json(results, {
            headers: {
                "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
            },
        });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
