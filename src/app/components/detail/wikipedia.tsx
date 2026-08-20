"use client";

import { useState } from "react";
import { WikipediaData } from "@/app/actions/wikipedia";
import { FaExternalLinkAlt, FaChevronDown, FaChevronUp, FaWikipediaW } from "react-icons/fa";

export { getMunicipioWikipedia } from "@/app/actions/wikipedia";

export default function Wikipedia({ data }: { data: WikipediaData | null }) {
    const [idx, setIdx] = useState(0);
    const [expanded, setExpanded] = useState(false);

    if (!data) return null;

    const images = data.images || [];
    const img = images[idx] || images[0];
    const paras = data.paragraphs || [];
    const visibleParas = expanded ? paras : paras.slice(0, 2);

    return (
        <article className="flex flex-col gap-8 p-6 md:p-8">
            <section className="flex flex-col gap-4">
                <header className="flex justify-between border-b pb-2 text-sm uppercase">
                    <FaWikipediaW size={20} />
                    {data.pageUrl && (
                        <a href={data.pageUrl} target="_blank" rel="noreferrer" title="Abrir en Wikipedia" className="flex items-center gap-2 font-semibold hover:text-black text-black/70">
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
                    <div className="flex max-md:flex-col min-md:grid min-md:grid-cols-5 gap-4 items-start w-full">
                        <div className="min-md:col-span-3 h-full w-full flex flex-col items-start justify-start">
                            <div className="relative h-full w-full flex items-start justify-center group">
                                <img
                                    src={img.url}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-50 blur-2xl max-md:scale-110"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                                <img
                                    src={img.url}
                                    alt={data.title}
                                    className="relative z-10 max-h-full max-w-full object-contain object-top border border-title/20"
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="min-md:col-span-2 grid grid-cols-4 max-md:grid-cols-5 content-start self-start w-full max-h-[440px] overflow-y-auto gap-2">
                                {images.map((item, i) => (
                                    <button key={i} onClick={() => setIdx(i)} title={item.description} className={`w-full aspect-square overflow-hidden border transition-all ${i === idx ? 'border-title opacity-100' : 'border-title/20 opacity-50 hover:opacity-100'}`}>
                                        <img
                                            src={item.url}
                                            alt={item.description || ""}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {img.description && (
                        <div className="w-full flex max-w-2xl ml-auto">
                            <p className="text-xs text-black/70 w-full text-balance text-right">{img.description}</p>
                        </div>
                    )}
                </section>
            )}
        </article>
    );
}
