"use client";

import { useState } from "react";
import Image from "next/image";
import { WikipediaData } from "@/actions/wikipedia";
import { FaExternalLinkAlt, FaChevronDown, FaChevronUp, FaWikipediaW } from "react-icons/fa";
import Source from "./Source";

export { getMunicipioWikipedia } from "@/actions/wikipedia";

function WikipediaGallery({
    images,
    title,
}: {
    images: { url: string; description?: string }[];
    title: string;
}) {
    const [idx, setIdx] = useState(0);
    const hasMultiple = images.length > 1;
    const currentImg = images[idx] || images[0];

    if (!currentImg) return null;

    return (
        <section className="mt-2 flex flex-col gap-4">
            <div className={`flex max-md:flex-col ${hasMultiple ? "min-md:grid min-md:grid-cols-5" : ""} gap-4 items-stretch w-full`}>
                <div className={`${hasMultiple ? "min-md:col-span-3" : "w-full"} h-full w-full flex flex-col items-start justify-start`}>
                    <div className={`relative h-full ${hasMultiple ? "min-h-[300px]" : "min-h-[300px] md:min-h-[420px]"} w-full flex items-start justify-center overflow-hidden`}>
                        <Image src={currentImg.url} alt="" fill unoptimized sizes="100vw" className="absolute inset-0 w-full h-full object-cover max-md:scale-120 blur-xs opacity-80" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        <Image src={currentImg.url} alt={title} fill unoptimized sizes={hasMultiple ? "(max-width: 768px) 100vw, 60vw" : "100vw"} className="relative z-10 w-full h-full object-contain object-center border border-title/20" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    </div>
                </div>

                {hasMultiple && (
                    <div className="min-md:col-span-2 grid grid-cols-4 max-md:grid-cols-5 content-start self-start w-full h-full gap-2">
                        {images.map((item, i) => (
                            <button
                                key={item.url}
                                onClick={() => setIdx(i)}
                                title={item.description}
                                className={`relative w-full aspect-square overflow-hidden border transition-all ${i === idx ? "border-title opacity-100" : "border-title/20 opacity-50 hover:opacity-100"}`}
                            >
                                <Image src={item.url} alt={item.description || ""} fill unoptimized sizes="20vw" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {currentImg.description && (
                <div className="w-full flex max-w-2xl ml-auto">
                    <p className="text-xs text-black/70 w-full text-balance text-right">{currentImg.description}</p>
                </div>
            )}
        </section>
    );
}

export default function WikipediaSection({ data }: { data: WikipediaData | null }) {
    const [expanded, setExpanded] = useState(false);

    if (!data) return null;

    const paras = data.paragraphs || [];
    const visibleParas = expanded ? paras : paras.slice(0, 2);
    const images = data.images || [];

    return (
        <article className="flex flex-col gap-10 mt-2">
            <section className="flex flex-col gap-2">
                <div className="space-y-4">
                    {visibleParas.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
                </div>

                {paras.length > 2 && (
                    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-xs uppercase text-title/60 hover:text-text-2">
                        {expanded ? <>Menos <FaChevronUp size={10} /></> : <>Más <FaChevronDown size={10} /></>}
                    </button>
                )}
                <Source section="wikipedia" href={data.pageUrl}>Wikipedia</Source>
            </section>

            {images.length > 0 && <WikipediaGallery images={images} title={data.title} />}
        </article>
    );
}
