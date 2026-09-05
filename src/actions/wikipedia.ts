"use server";

import wiki from "wikipedia";
import { getWikiCache, setWikiCache } from "@/lib/cache/wikiCache";

export interface WikipediaImage {
    url: string;
    description: string;
}

export interface WikipediaData {
    title: string;
    paragraphs: string[];
    images: WikipediaImage[];
    pageUrl: string;
}

const FORBIDDEN = /svg|\.png\?|icon|symbol|flag|bandera|escudo|coat|shield|logo|mapa|plano|locator|situaci|termino|cartograf|timeline|grafic|diagrama|grabado|pintura|cuadro|oleo|retrato|dibujo|moneda|sello|marmol|godo|arqueol|lapida|ceramica|batalla|guerra/i;

const clean = (t = "") => t.replace(/\[(?:\d+|nota\s*\d+|editar)\]|<[^>]+>/gi, "").replace(/\s+/g, " ").trim();

function split(t = ""): string[] {
    const c = clean(t);
    const s = c.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ"«])/).filter((x) => x.length > 15);
    const p: string[] = [];
    for (let i = 0; i < s.length; i += 2) p.push(s.slice(i, i + 2).join(" "));
    return p.length ? p : [c];
}

const hiRes = (url = "") => {
    const u = (url.startsWith("//") ? "https:" + url : url).split("?")[0];
    return u.replace(/\/thumb\/(.+)\/\d+px-([^/]+)$/i, "/thumb/$1/960px-$2");
};

async function fetchPage(title: string, provincia?: string): Promise<WikipediaData | null> {
    try {
        const page = await wiki.page(title, { autoSuggest: false });
        const [intro, summary, media] = await Promise.allSettled([page.intro(), page.summary(), page.media()]);
        const sum = summary.status === "fulfilled" ? summary.value : null;
        const raw = `${sum?.description || ""} ${sum?.extract || ""} ${intro.status === "fulfilled" ? intro.value : ""}`;
        if (sum?.type === "disambiguation" || /puede referirse a|desambiguaci[oó]n/i.test(raw) || !/\b(municipio|concejo|t[eé]rmino municipal|ayuntamiento)\b/i.test(raw)) return null;

        if (provincia) {
            const normRaw = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normProv = provincia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!normRaw.includes(normProv) && !normRaw.includes("castilla y leon")) return null;
        }

        const text = (intro.status === "fulfilled" && clean(intro.value)) || (sum?.extract && clean(sum.extract)) || "";
        if (!text) return null;

        const items = media.status === "fulfilled" ? media.value?.items || [] : [];
        const seen = new Set<string>();
        const images: WikipediaImage[] = [];

        for (const item of items) {
            if (item.type !== "image") continue;
            const src = item.srcset?.[item.srcset.length - 1]?.src || item.srcset?.[0]?.src;
            if (!src || !/\.(jpe?g|webp)(\?|$)/i.test(src) || FORBIDDEN.test(`${src} ${item.title}`)) continue;
            const url = hiRes(src);
            if (seen.has(url)) continue;
            seen.add(url);
            const caption = clean(item.caption?.text || item.caption?.html);
            const desc = (item.title || "").replace(/^(?:archivo|file):/i, "").replace(/\.[^.]+$/i, "").replace(/_/g, " ").trim();
            images.push({ url, description: caption || desc });
        }

        return {
            title: page.title || title,
            paragraphs: split(text),
            images: images.slice(0, 20),
            pageUrl: page.fullurl || `https://es.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        };
    } catch {
        return null;
    }
}

function titleCase(t: string) {
    const skip = new Set(["de", "del", "la", "las", "los", "el", "en", "y", "e", "a", "al"]);
    return t.toLowerCase().split(" ").map((w, i) => (i === 0 || !skip.has(w) ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

export async function getMunicipioWikipedia(lat: number, lon: number, name: string, provincia?: string): Promise<WikipediaData | null> {
    if (!name) return null;
    const cacheKey = `${name}|${provincia || ""}`;
    const cached = getWikiCache(cacheKey);
    if (cached !== undefined) return cached;

    try {
        wiki.setLang("es");
        wiki.setUserAgent("MePuedoQuedar/1.0 (https://mepuedoquedar.es; info@mepuedoquedar.es)");
        const n = titleCase(name.trim());
        const prov = provincia ? titleCase(provincia.trim()) : "";
        const candidates = prov ? [`${n} (${prov})`, n, `${n} (España)`, `${n} (municipio)`] : [n, `${n} (España)`, `${n} (municipio)`];

        const results = await Promise.all(candidates.map((t) => fetchPage(t, prov).catch(() => null)));
        const found = results.find((r) => r !== null) ?? null;
        if (found) {
            setWikiCache(cacheKey, found);
            return found;
        }

        const searchRes = await wiki.search(`${n} ${prov} municipio`, { limit: 3 });
        const cSet = new Set(candidates);
        const searchCandidates = (searchRes.results || []).map((r) => r.title).filter((t): t is string => !!t && !cSet.has(t));

        if (searchCandidates.length) {
            const searchResults = await Promise.all(searchCandidates.map((t) => fetchPage(t, prov).catch(() => null)));
            const searchFound = searchResults.find((r) => r !== null) ?? null;
            setWikiCache(cacheKey, searchFound);
            return searchFound;
        }

        setWikiCache(cacheKey, null);
        return null;
    } catch {
        return null;
    }
}
