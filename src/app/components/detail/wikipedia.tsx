"use client";

import { useState, useEffect } from "react";
import { getMunicipioWikipedia, WikipediaData } from "@/app/actions/wikipedia";
import { FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaWikipediaW } from "react-icons/fa";

export default function Wikipedia({ lat, lon, name, provincia }: { lat: number; lon: number; name: string; provincia?: string }) {
    const [data, setData] = useState<WikipediaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [idx, setIdx] = useState(0);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!name) return;
        setLoading(true);
        getMunicipioWikipedia(lat, lon, name, provincia).then((d) => {
            setData(d);
            setIdx(0);
            setExpanded(false);
            setLoading(false);
        });
    }, [lat, lon, name, provincia]);

    if (loading) return (
        <div className="flex flex-col gap-6 p-6 md:p-8 animate-pulse">
            <div className="h-4 w-full bg-black/5 rounded" />
            <div className="h-4 w-full bg-black/5 rounded" />
            <div className="h-4 w-full bg-black/5 rounded" />
            <div className="h-4 w-full bg-black/5 rounded" />
            <div className="h-4 w-full bg-black/5 rounded" />
            <div className="h-4 w-full bg-black/5 rounded" />
            <div className="grid grid-cols-5 gap-4 w-full h-[420px]">
                <div className="col-span-3 h-full w-full bg-black/5 mt-4" />
                <div className="col-span-2 h-full w-full mt-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="h-20 w-20 bg-black/5" />
                        <div className="h-20 w-20 bg-black/5" />
                        <div className="h-20 w-20 bg-black/5" />
                        <div className="h-20 w-20 bg-black/5" />
                        <div className="h-20 w-20 bg-black/5" />
                        <div className="h-20 w-20 bg-black/5" />
                        <div className="h-20 w-20 bg-black/5" />
                        <div className="h-20 w-20 bg-black/5" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!data) return null;

    const images = data.images || [];
    const img = images[idx] || images[0];
    const paras = data.paragraphs || [];
    const visibleParas = expanded ? paras : paras.slice(0, 2);

    const nav = (d: number) => setIdx((p) => (p + d + images.length) % images.length);

    return (
        <article className="flex flex-col gap-8 p-6 md:p-8">
            <section className="flex flex-col gap-4">
                <header className="flex justify-between border-b pb-2 text-sm uppercase">
                    <FaWikipediaW size={20} />
                    {data.pageUrl && (
                        <a href={data.pageUrl} target="_blank" rel="noreferrer" title="Abrir en Wikipedia" className="flex items-center gap-2 font-semibold hover:text-black text-black/80">
                            <FaExternalLinkAlt size={15} className="mb-0.5" />
                        </a>
                    )}
                </header>

                <div className="space-y-4">
                    {visibleParas.map((p, i) => <p key={i}>{p}</p>)}
                </div>

                {paras.length > 2 && (
                    <button onClick={() => setExpanded(!expanded)} className="text-xs flex gap-2 items-center justify-start uppercase text-black/60 hover:text-black">
                        {expanded ? <>Menos <FaChevronUp size={10} className="mb-0.5" /></> : <>Más <FaChevronDown size={10} className="mb-0.5" /></>}
                    </button>
                )}
            </section>

            {img && (
                <section className="flex flex-col gap-4 mt-6">
                    <div className="flex gap-4 max-md:flex-col">
                        <div className="h-[440px] flex-1 flex flex-col items-center justify-center">
                            <div className="relative h-full w-full flex items-center justify-center group bg-bg-card/20">
                                <img src={img.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl" />
                                <img src={img.url} alt={img.description || data.title} className="relative z-10 h-full w-full object-contain" loading="lazy" />
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 overflow-x-auto">
                                {images.map((item, i) => (
                                    <button key={i} onClick={() => setIdx(i)} title={item.description} className={`w-20 h-20 overflow-hidden border-2 transition-all ${i === idx ? 'border-title opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                        <img src={item.url} alt={item.description || ""} className="w-full h-full object-cover" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {img.description && (
                        <div className="w-full flex justify-center items-center max-w-xl mt-2">
                            <p className="text-xs text-black/60 w-full text-balance">{img.description}</p>
                        </div>
                    )}
                </section>
            )}
        </article>
    );
}
