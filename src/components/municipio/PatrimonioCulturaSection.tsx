"use client";

import { useState } from "react";
import Source from "./Source";
import { MdArrowOutward, MdLocationOn } from "react-icons/md";
import { FaLandmark, FaBook, FaTheaterMasks } from "react-icons/fa";
import { GiCastle } from "react-icons/gi";
import { SiGooglemaps } from "react-icons/si";

interface Monumento {
    nombre: string;
    tipomonumento?: string;
    periodohistorico?: string;
    identificadorbieninterescultural?: string;
    coordenadas?: string | { latitud?: string; longitud?: string; lat?: string; lon?: string };
}

interface Museo {
    nombreentidad: string;
    localidad?: string;
    enlace_al_contenido?: string;
}

interface Teatro {
    sala: string;
    direccion?: string;
    email?: string;
    municipio?: string;
}

interface Biblioteca {
    nombre_entidad: string;
    tipo?: string;
    localidad?: string;
    enlace_contenido?: string;
}

function parseCoordinates(raw: unknown): { lat: string; lon: string } | null {
    if (!raw) return null;
    if (typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        const lat = obj.latitud ?? obj.lat;
        const lon = obj.longitud ?? obj.lon;
        if (lat && lon) return { lat: String(lat), lon: String(lon) };
    }
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            const lat = parsed.latitud ?? parsed.lat;
            const lon = parsed.longitud ?? parsed.lon;
            if (lat && lon) return { lat: String(lat), lon: String(lon) };
        } catch { }
        const parts = raw.split(",").map((s) => s.trim());
        if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
            return { lat: parts[0], lon: parts[1] };
        }
    }
    return null;
}

export default function PatrimonioCulturaSection({ data }: { data: any }) {
    const monumentos: Monumento[] = data?.datos?.cultura?.monumentos?.detalles ?? [];
    const museos: Museo[] = data?.datos?.ocio?.museos?.detalles ?? [];
    const teatros: Teatro[] = data?.datos?.ocio?.teatros?.detalles ?? [];
    const bibliotecas: Biblioteca[] = data?.datos?.ocio?.bibiliotecas?.detalles ?? [];

    const tabs = [
        { id: "monumentos", label: "Monumentos", count: monumentos.length, icon: GiCastle },
        { id: "museos", label: "Museos", count: museos.length, icon: FaLandmark },
        { id: "teatros", label: "Teatros y auditorios", count: teatros.length, icon: FaTheaterMasks },
        { id: "bibliotecas", label: "Bibliotecas", count: bibliotecas.length, icon: FaBook },
    ].filter((t) => t.count > 0);

    const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "monumentos");
    const [showAllMonuments, setShowAllMonuments] = useState(false);

    if (tabs.length === 0) return null;

    const visibleMonumentos = showAllMonuments ? monumentos : monumentos.slice(0, 6);

    return (
        <section id="patrimonio-y-cultura" className="relative">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">
                        Patrimonio y cultura
                    </h2>
                </div>
            </div>

            <div className="border border-title/20 bg-white/30">
                {tabs.length > 1 && (
                    <div className="flex flex-wrap border-b border-title/15 bg-white/20 p-2 gap-1.5">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-[background-color,color,transform] active:scale-[0.98] ${isActive
                                        ? "bg-text-2 text-text-3 shadow-xs"
                                        : "bg-white/40 text-title/70 hover:bg-white/80 hover:text-title"
                                        }`}
                                >
                                    <Icon className="text-sm shrink-0" />
                                    <span>{tab.label}</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-title/10 text-title"}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="p-5 sm:p-7">
                    {activeTab === "monumentos" && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {visibleMonumentos.map((m) => {
                                    const coords = parseCoordinates(m.coordenadas);
                                    const isBic = Boolean(m.identificadorbieninterescultural && m.identificadorbieninterescultural.trim());

                                    return (
                                        <div
                                            key={`${m.nombre}_${m.identificadorbieninterescultural || m.tipomonumento || ""}`}
                                            className="p-4 bg-white/40 border border-title/20 flex flex-col justify-between gap-3 hover:bg-white/60 transition-[background-color,border-color] duration-150"
                                        >
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="title-font text-base font-semibold leading-snug text-title">
                                                        {m.nombre}
                                                    </h3>
                                                    {coords && (
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Ver en Google Maps"
                                                            className="p-1.5 text-title/60 hover:text-text-2 hover:bg-white/80 rounded transition-colors shrink-0"
                                                        >
                                                            <SiGooglemaps size={14} />
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                    {m.tipomonumento && (
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-title/10 text-title tracking-wider">
                                                            {m.tipomonumento}
                                                        </span>
                                                    )}
                                                    {m.periodohistorico && (
                                                        <span className="px-2 py-0.5 text-[10px] font-medium bg-white/80 border border-title/15 text-title/80">
                                                            {m.periodohistorico}
                                                        </span>
                                                    )}
                                                    {isBic && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-text-2 text-text-3">
                                                            BIC
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {monumentos.length > 6 && (
                                <div className="flex justify-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAllMonuments((v) => !v)}
                                        className="self-start mt-1 text-xs font-bold text-text-2 hover:underline cursor-pointer"
                                    >
                                        {showAllMonuments ? "Ver menos monumentos" : `Ver los ${monumentos.length} monumentos`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "museos" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {museos.map((m) => {
                                const url = m.enlace_al_contenido || `https://www.google.com/search?q=${encodeURIComponent(m.nombreentidad + " " + (m.localidad || ""))}`;
                                return (
                                    <a
                                        key={m.enlace_al_contenido || `${m.nombreentidad}_${m.localidad || ""}`}
                                        title={`Abrir información de ${m.nombreentidad}`}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-4 bg-white/40 border border-title/20 flex flex-col justify-between gap-3 hover:bg-white/60 hover:border-title/40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-text-2 text-xs font-semibold">
                                                    <FaLandmark size={12} />
                                                    <span>Museo o centro cultural</span>
                                                </div>
                                                <span className="flex items-center justify-center text-title/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                                    <MdArrowOutward size={14} aria-hidden="true" />
                                                </span>
                                            </div>
                                            <h3 className="title-font text-base font-semibold leading-snug text-title mt-1">
                                                {m.nombreentidad}
                                            </h3>
                                            {m.localidad && (
                                                <p className="text-xs text-title/60 flex items-center gap-1 mt-1">
                                                    <MdLocationOn size={13} className="text-text-2 shrink-0" />
                                                    {m.localidad}
                                                </p>
                                            )}
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === "teatros" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {teatros.map((t) => (
                                <div
                                    key={`${t.sala}_${t.direccion || t.email || ""}`}
                                    className="p-4 bg-white/40 border border-title/20 flex flex-col justify-between gap-3 hover:bg-white/60 transition-[background-color,border-color] duration-150"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-text-2 text-xs font-semibold">
                                            <FaTheaterMasks size={13} />
                                            <span>Red de teatros y espacios escénicos</span>
                                        </div>
                                        <h3 className="title-font text-base font-semibold leading-snug text-title mt-1">
                                            {t.sala}
                                        </h3>
                                        {t.direccion && (
                                            <p className="text-xs text-title/70 flex items-center gap-1 mt-1">
                                                <MdLocationOn size={13} className="text-text-2 shrink-0" />
                                                {t.direccion}
                                            </p>
                                        )}
                                    </div>
                                    {t.email && (
                                        <a
                                            href={`mailto:${t.email}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-2 hover:underline self-start"
                                        >
                                            <span>{t.email}</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "bibliotecas" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {bibliotecas.map((b) => {
                                const url = b.enlace_contenido || `https://www.google.com/search?q=${encodeURIComponent(b.nombre_entidad + " " + (b.localidad || ""))}`;
                                return (
                                    <a
                                        key={b.enlace_contenido || `${b.nombre_entidad}_${b.localidad || ""}`}
                                        title={`Abrir información de ${b.nombre_entidad}`}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-4 bg-white/40 border border-title/20 flex flex-col justify-between gap-3 hover:bg-white/60 hover:border-title/40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-text-2 text-xs font-semibold">
                                                    <FaBook size={12} />
                                                    <span>{b.tipo || "Biblioteca pública"}</span>
                                                </div>
                                                <span className="flex items-center justify-center text-title/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                                    <MdArrowOutward size={14} aria-hidden="true" />
                                                </span>
                                            </div>
                                            <h3 className="title-font text-base font-semibold leading-snug text-title mt-1">
                                                {b.nombre_entidad}
                                            </h3>
                                            {b.localidad && (
                                                <p className="text-xs text-title/60 flex items-center gap-1 mt-1">
                                                    <MdLocationOn size={13} className="text-text-2 shrink-0" />
                                                    {b.localidad}
                                                </p>
                                            )}
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Source href="https://datosabiertos.jcyl.es/">
                Patrimonio cultural, museos y bibliotecas de la Junta de Castilla y León
            </Source>
        </section>
    );
}
