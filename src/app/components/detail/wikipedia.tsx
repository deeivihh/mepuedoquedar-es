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
            <div className="h-4 w-1/4 bg-black/5 rounded" />
            <div className="h-4 w-full bg-black/5 rounded" />
            <div className="h-[400px] bg-black/5 rounded-2xl mt-4" />
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
                <header className="flex justify-between border-b pb-2 text-xs uppercase">
                    <FaWikipediaW size={20} />
                    {data.pageUrl && (
                        <a href={data.pageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                            Leer más <FaExternalLinkAlt size={10} />
                        </a>
                    )}
                </header>

                <div className="space-y-4">
                    {visibleParas.map((p, i) => <p key={i}>{p}</p>)}
                </div>

                {paras.length > 2 && (
                    <button onClick={() => setExpanded(!expanded)} className="text-xs uppercase tracking-widest text-black/40 hover:text-black flex items-center gap-2 self-start transition">
                        {expanded ? <>Menos <FaChevronUp size={10} /></> : <>Más <FaChevronDown size={10} /></>}
                    </button>
                )}
            </section>

            {img && (
                <section className="flex flex-col gap-4">
                    <div className="relative h-[400px] rounded-xl overflow-hidden bg-black/5 group">
                        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-105" />
                        <img src={img} alt={data.title} className="relative z-10 w-full h-full object-contain" loading="lazy" />

                        {images.length > 1 && (
                            <>
                                <button onClick={() => nav(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm"><FaChevronLeft size={12} /></button>
                                <button onClick={() => nav(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm"><FaChevronRight size={12} /></button>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                            {images.map((url, i) => (
                                <button key={i} onClick={() => setIdx(i)} className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </article>
    );
}
