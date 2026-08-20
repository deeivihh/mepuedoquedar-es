"use server";

const INE_API = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA";

const INE_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Accept: "application/json",
};

const CACHE_TTL = 6 * 60 * 60 * 1000;
const cache = new Map<string, { data: any[]; ts: number }>();
const inflight = new Map<string, Promise<any[]>>();

async function cachedFetch(url: string): Promise<any[]> {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
        return hit.data;
    }

    const existing = inflight.get(url);
    if (existing) return existing;
    const promise = (async () => {
        const response = await fetch(url, { headers: INE_HEADERS });
        if (!response.ok) {
            const text = await response.text();
            console.warn(url, response.status, text);
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

export async function safeFetch(url: string, headers?: HeadersInit): Promise<any[]> {
    const response = await fetch(url, headers ? { headers } : undefined);
    if (!response.ok) {
        const text = await response.text();
        console.warn(url, response.status, text);
        return [];
    }
    return response.json();
}

export async function fetchINE(table: string, cod_int: number | string, nult: number | string = 15, tv?: string | string[]) {
    if (!table || !cod_int) {
        throw new Error("Table and cod_int are required");
    }
    let tvParams = `&tv=19:${cod_int}`;
    if (tv) {
        const tvList = Array.isArray(tv) ? tv : [tv];
        for (const item of tvList) {
            const cleanTv = String(item).replace(/^&?tv=/, "").trim();
            if (cleanTv) {
                tvParams += `&tv=${cleanTv}`;
            }
        }
    }
    const url = `${INE_API}/${table}?nult=${nult}${tvParams}`;
    return cachedFetch(url);
}