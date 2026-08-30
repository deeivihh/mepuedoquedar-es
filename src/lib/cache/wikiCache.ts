import type { WikipediaData } from "@/actions/wikipedia";

const WIKI_CACHE_TTL = 6 * 60 * 60 * 1000;
const wikiCache = new Map<string, { data: WikipediaData | null; ts: number }>();

export function getWikiCache(key: string): WikipediaData | null | undefined {
    const hit = wikiCache.get(key);
    if (hit && Date.now() - hit.ts < WIKI_CACHE_TTL) return hit.data;
    return undefined;
}

export function setWikiCache(key: string, data: WikipediaData | null): void {
    wikiCache.set(key, { data, ts: Date.now() });
}
