"use server";

import wiki from "wikipedia";

export interface WikipediaData {
    title: string;
    paragraphs: string[];
    images: string[];
    pageUrl: string;
}

const FORBIDDEN = /svg|\.png\?|icon|symbol|flag|bandera|escudo|coat|shield|logo|mapa|plano|locator|situaci|termino|cartograf|timeline|grafic|diagrama|grabado|pintura|cuadro|oleo|retrato|dibujo|moneda|sello|marmol|godo|arqueol|lapida|ceramica|batalla|guerra/i;

function clean(t = "") {
    return t.replace(/\[(?:\d+|nota\s*\d+|editar)\]|<[^>]+>/gi, "").replace(/\s+/g, " ").trim();
}

function split(t = ""): string[] {
    const c = clean(t);
    const s = c.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ"«])/).filter((x) => x.length > 15);
    const p: string[] = [];
    for (let i = 0; i < s.length; i += 2) p.push(s.slice(i, i + 2).join(" "));
    return p.length ? p : [c];
}

function hiRes(url = "") {
    const u = (url.startsWith("//") ? "https:" + url : url).split("?")[0];
    return u.replace(/\/thumb\/(.+)\/\d+px-([^/]+)$/i, "/thumb/$1/1280px-$2");
}

async function fetchPage(title: string): Promise<WikipediaData | null> {
    try {
        const page = await wiki.page(title, { autoSuggest: false });
        const [intro, summary, media] = await Promise.allSettled([page.intro(), page.summary(), page.media()]);
        const text = (intro.status === "fulfilled" && clean(intro.value)) || (summary.status === "fulfilled" && clean(summary.value?.extract)) || "";
        if (!text) return null;

        const items = media.status === "fulfilled" ? media.value?.items || [] : [];
        const seen = new Set<string>();
        const images: string[] = [];

        for (const item of items) {
            if (item.type !== "image") continue;
            const src = item.srcset?.[item.srcset.length - 1]?.src || item.srcset?.[0]?.src;
            if (!src || !/\.(jpe?g|webp)(\?|$)/i.test(src) || FORBIDDEN.test(`${src} ${item.title}`)) continue;
            const url = hiRes(src);
            if (seen.has(url)) continue;
            seen.add(url);
            images.push(url);
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
    try {
        wiki.setLang("es");
        const n = titleCase(name.trim());
        return (await fetchPage(n)) || (provincia ? await fetchPage(`${n} (${titleCase(provincia.trim())})`) : null);
    } catch {
        return null;
    }
}
