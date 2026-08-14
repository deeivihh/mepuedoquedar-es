"use server";

import wiki from "wikipedia";

export interface WikiSection {
    title: string;
    text: string;
}

export interface WikipediaData {
    title: string;
    summary: string;
    description?: string;
    mainImage?: string;
    allImages: string[];
    sections: WikiSection[];
    pageUrl?: string;
}

function toTitleCase(text: string): string {
    const lowerWords = new Set([
        "de", "del", "la", "las", "los", "el", "en", "y", "e", "a", "al",
    ]);
    return text
        .toLowerCase()
        .split(" ")
        .map((word, i) =>
            i === 0 || !lowerWords.has(word)
                ? word.charAt(0).toUpperCase() + word.slice(1)
                : word
        )
        .join(" ");
}

function filterImages(images: any[]): string[] {
    return (images || [])
        .map((img: any) => img.url)
        .filter((url: string) => {
            if (!url) return false;
            const lower = url.toLowerCase();
            if (
                lower.includes("icon") ||
                lower.includes("symbol") ||
                lower.includes("arrow") ||
                lower.includes("aiga_") ||
                lower.includes("flag") ||
                lower.includes("coat") ||
                lower.includes("escudo") ||
                lower.includes("bandera") ||
                lower.endsWith(".svg")
            ) return false;
            return /\.(jpe?g|png|webp)(\?|$)/i.test(url);
        });
}

const IGNORED_SECTIONS = new Set([
    "referencias", "notas", "véase también", "ver también",
    "enlaces externos", "bibliografía", "fuentes", "notas y referencias",
    "notas al pie", "galería", "galería de imágenes",
]);

function parseContentSections(content: string): WikiSection[] {
    const lines = content.split("\n");
    const sections: WikiSection[] = [];

    let currentTitle = "";
    let currentLines: string[] = [];

    const flush = () => {
        if (!currentTitle) return;
        const text = currentLines.join("\n").trim();
        if (
            text.length > 80 &&
            !IGNORED_SECTIONS.has(currentTitle.toLowerCase())
        ) {
            sections.push({ title: currentTitle, text });
        }
    };

    for (const line of lines) {
        const match = line.match(/^={2,3}\s*(.+?)\s*={2,3}$/);
        if (match) {
            flush();
            currentTitle = match[1].trim();
            currentLines = [];
        } else {
            currentLines.push(line);
        }
    }
    flush();

    return sections.slice(0, 10);
}

async function tryFetch(title: string): Promise<WikipediaData | null> {
    try {
        const page = await wiki.page(title, { autoSuggest: false });
        const [summaryRes, imagesRes, contentRes] = await Promise.allSettled([
            page.summary(),
            page.images(),
            page.content(),
        ]);

        if (summaryRes.status === "rejected" || !summaryRes.value?.extract) return null;

        const summary = summaryRes.value;
        const images = imagesRes.status === "fulfilled" ? imagesRes.value : [];
        const content = contentRes.status === "fulfilled" ? contentRes.value : "";

        const allImages = filterImages(images).slice(0, 12);
        const sections = parseContentSections(content);

        return {
            title: summary.title,
            summary: summary.extract,
            description: summary.description || "",
            mainImage:
                summary.originalimage?.source ||
                summary.thumbnail?.source ||
                allImages[0],
            allImages,
            sections,
            pageUrl: summary.content_urls?.desktop?.page,
        };
    } catch {
        return null;
    }
}

export async function getMunicipioWikipedia(
    lat: number,
    lon: number,
    name: string,
    provincia?: string,
): Promise<WikipediaData | null> {
    if (!name) return null;

    try {
        wiki.setLang("es");

        const normalName = toTitleCase(name.trim());
        const prov = provincia ? toTitleCase(provincia.trim()) : "";

        const direct = await tryFetch(normalName);
        if (direct) return direct;

        if (prov) {
            const disambig = await tryFetch(`${normalName} (${prov})`);
            if (disambig) return disambig;
        }

        return null;
    } catch (err) {
        console.error("[Wikipedia] Error:", err);
        return null;
    }
}
