"use client";

import { useState, useEffect } from "react";
import { getMunicipioWikipedia, WikipediaData } from "@/app/actions/wikipedia";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function Wikipedia({
    lat,
    lon,
    name,
    provincia,
}: {
    lat: number;
    lon: number;
    name: string;
    provincia?: string;
}) {
    const [data, setData] = useState<WikipediaData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        if (!name) return;
        let cancelled = false;

        async function fetchWiki() {
            setIsLoading(true);
            try {
                const result = await getMunicipioWikipedia(lat, lon, name, provincia);
                if (!cancelled) {
                    setData(result);
                    setSelected(null);
                }
            } catch {
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchWiki();
        return () => { cancelled = true; };
    }, [lat, lon, name, provincia]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8 p-8 w-full animate-pulse">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-3">
                        {[100, 83, 91, 66, 78].map((w, i) => (
                            <div key={i} className="h-4 bg-title/10 rounded" style={{ width: `${w}%` }} />
                        ))}
                    </div>
                    <div className="w-full md:w-72 aspect-[4/3] shrink-0 bg-title/10 rounded-2xl" />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-video bg-title/10 rounded-xl" />
                    ))}
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <div className="h-5 w-40 bg-title/10 rounded" />
                        <div className="space-y-2">
                            {[100, 87, 73].map((w, j) => (
                                <div key={j} className="h-4 bg-title/10 rounded" style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const galleryImages = data.allImages.filter(img => img !== data.mainImage);
    const displayImage = selected ?? data.mainImage;
    const hasSections = data.sections.length > 0;

    return (
        <article className="flex flex-col w-full gap-0 p-8">
            <section className="flex flex-col md:flex-row gap-8 items-start mb-10">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-baseline justify-between mb-2 border-b border-title/10 pb-2">
                        <h2 className="text-xl font-semibold text-title">Introducción</h2>
                        {data.pageUrl && (
                            <a
                                href={data.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-title/50 hover:text-title transition-colors"
                            >
                                Wikipedia <FaExternalLinkAlt size={9} className="opacity-60" />
                            </a>
                        )}
                    </div>
                    <p className="text-title/75 leading-relaxed text-pretty">
                        {data.summary}
                    </p>
                </div>

                {displayImage && (
                    <div className="w-full md:w-72 aspect-[4/3] shrink-0 rounded-2xl overflow-hidden border border-title/10 shadow-sm bg-title/5">
                        <img
                            src={displayImage}
                            alt={data.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                )}
            </section>
            {galleryImages.length > 0 && (
                <section className="mb-10">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {data.mainImage && (
                            <button
                                onClick={() => setSelected(data.mainImage!)}
                                className={`aspect-video rounded-xl overflow-hidden border transition-all ${selected === data.mainImage || selected === null ? "border-title/40 ring-2 ring-title/20" : "border-title/10 hover:border-title/30"}`}
                            >
                                <img src={data.mainImage} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
                            </button>
                        )}
                        {galleryImages.slice(0, 11).map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelected(img)}
                                className={`aspect-video rounded-xl overflow-hidden border transition-all ${selected === img ? "border-title/40 ring-2 ring-title/20" : "border-title/10 hover:border-title/30"}`}
                            >
                                <img src={img} alt={`${data.title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            </button>
                        ))}
                    </div>
                </section>
            )}
            {hasSections && (
                <div className="flex flex-col gap-10">
                    {data.sections.map((section, idx) => (
                        <section key={section.title}>
                            <div className="flex items-baseline justify-between mb-3 border-b border-title/10 pb-2">
                                <h2 className="text-xl font-semibold text-title capitalize">
                                    {idx + 2}. {section.title}
                                </h2>
                            </div>
                            <p className="text-title/75 leading-relaxed whitespace-pre-line text-pretty">
                                {section.text}
                            </p>
                        </section>
                    ))}
                </div>
            )}
            {data.pageUrl && (
                <footer className="border-t border-title/10 pt-6 mt-10">
                    <p className="text-xs text-title/40">
                        Información extraída de{" "}
                        <a
                            href={data.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-title/60 hover:text-title underline underline-offset-2 transition-colors"
                        >
                            Wikipedia
                        </a>
                        {" "}bajo licencia{" "}
                        <a
                            href="https://creativecommons.org/licenses/by-sa/4.0/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-title/60 hover:text-title underline underline-offset-2 transition-colors"
                        >
                            CC BY-SA 4.0
                        </a>.
                    </p>
                </footer>
            )}
        </article>
    );
}
