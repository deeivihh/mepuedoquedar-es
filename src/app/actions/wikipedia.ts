"use server";

import wiki from "wikipedia";

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

function clean(t = "") {
    return t.replace(/\[(?:\d+|nota\s*\d+|editar)\]|<[^>]+>/gi, "").replace(/\s+/g, " ").trim();
}

function parseHtmlCaptions(html = "") {
    const map = new Map<string, string>();
    if (!html) return map;
    const norm = (t: string) => decodeURIComponent(t || "").toLowerCase().replace(/^(?:archivo|file):/i, "").replace(/_/g, " ").trim();

    for (const m of html.matchAll(/href=["'][^"']*\/(?:Archivo|File):([^"']+)["'][^>]*title=["']([^"']+)["']/gi)) {
        const file = norm(m[1]);
        const titleAttr = clean(m[2]);
        if (file && titleAttr && !titleAttr.startsWith("Archivo:") && !titleAttr.startsWith("File:") && !map.has(file)) {
            map.set(file, titleAttr);
        }
    }

    for (const m of html.matchAll(/title=["']([^"']+)["'][^>]*href=["'][^"']*\/(?:Archivo|File):([^"']+)["']/gi)) {
        const file = norm(m[2]);
        const titleAttr = clean(m[1]);
        if (file && titleAttr && !titleAttr.startsWith("Archivo:") && !titleAttr.startsWith("File:") && !map.has(file)) {
            map.set(file, titleAttr);
        }
    }

    for (const m of html.matchAll(/(?:Archivo|File):([^"'>\s]+)[\s\S]*?<(?:figcaption|div class=["']gallerytext["'])>([\s\S]*?)<\/(?:figcaption|div)>/gi)) {
        const file = norm(m[1]);
        const caption = clean(m[2]);
        if (file && caption && !map.has(file)) {
            map.set(file, caption);
        }
    }

    return map;
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

async function fetchPage(title: string, provincia?: string): Promise<WikipediaData | null> {
    try {
        const page = await wiki.page(title, { autoSuggest: false });
        const [intro, summary, media, htmlRes] = await Promise.allSettled([
            page.intro(),
            page.summary(),
            page.media(),
            page.html(),
        ]);
        const sum = summary.status === "fulfilled" ? summary.value : null;
        const raw = `${sum?.description || ""} ${sum?.extract || ""} ${intro.status === "fulfilled" ? intro.value : ""}`;
        if (sum?.type === "disambiguation" || /puede referirse a|desambiguaci[oó]n/i.test(raw) || !/\b(municipio|concejo|t[eé]rmino municipal|ayuntamiento)\b/i.test(raw)) return null;

        if (provincia) {
            const normalizedRaw = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedProv = provincia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!normalizedRaw.includes(normalizedProv) && !normalizedRaw.includes("castilla y leon")) {
                return null;
            }
        }

        const text = (intro.status === "fulfilled" && clean(intro.value)) || (sum?.extract && clean(sum.extract)) || "";
        if (!text) return null;

        const html = htmlRes.status === "fulfilled" ? htmlRes.value : "";
        const htmlCaptions = parseHtmlCaptions(html);

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

            const key = (item.title || "").toLowerCase().replace(/^(?:archivo|file):/i, "").replace(/_/g, " ").trim();
            const mediaCaption = clean(item.caption?.text || item.caption?.html);
            const htmlCaption = htmlCaptions.get(key);
            const fileTitle = (item.title || "").replace(/^(?:archivo|file):/i, "").replace(/\.[^.]+$/i, "").replace(/_/g, " ").trim();

            images.push({
                url,
                description: mediaCaption || htmlCaption || fileTitle,
            });
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
        const prov = provincia ? titleCase(provincia.trim()) : "";
        const candidates = prov 
            ? [`${n} (${prov})`, n, `${n} (España)`, `${n} (municipio)`]
            : [n, `${n} (España)`, `${n} (municipio)`];

        for (const title of candidates) {
            const data = await fetchPage(title, prov);
            if (data) return data;
        }

        const searchRes = await wiki.search(`${n} ${prov} municipio`, { limit: 3 });
        for (const item of searchRes.results || []) {
            if (item.title && !candidates.includes(item.title)) {
                const data = await fetchPage(item.title, prov);
                if (data) return data;
            }
        }
        return null;
    } catch {
        return null;
    }
}
