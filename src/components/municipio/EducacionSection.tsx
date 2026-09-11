"use client";

import { useState } from "react";
import Source from "./Source";
import { MdArrowOutward, MdPhone } from "react-icons/md";
import { FaGraduationCap, FaSchool } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";

interface CentroDocente {
    denominacion_especifica?: string;
    denominacion_generica?: string;
    denominacion_generica_breve?: string;
    naturaleza?: string;
    web?: string;
    telefono?: string;
    localizacion?: string;
    municipio?: string;
}

interface OfertaFP {
    centro_educativo?: string;
    familia_profesional?: string;
    nivel_educativo?: string;
    modalidad?: string;
    tipo_ensenanza?: string;
    localidad?: string;
}

function parseLocation(loc?: string): { lat: string; lon: string } | null {
    if (!loc) return null;
    const parts = loc.split(",").map((s) => s.trim());
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
        return { lat: parts[0], lon: parts[1] };
    }
    return null;
}

export default function EducacionSection({ data }: { data: any }) {
    const centros: CentroDocente[] = data?.datos?.educacion?.centrosDocentes?.detalles ?? [];
    const fpOfertas: OfertaFP[] = data?.datos?.educacion?.ofertaFP?.detalles ?? [];

    const tabs = [
        { id: "centros", label: "Centros educativos", count: centros.length, icon: FaSchool },
        { id: "fp", label: "Formación Profesional", count: fpOfertas.length, icon: FaGraduationCap },
    ].filter((t) => t.count > 0);

    const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "centros");
    const [filterNaturaleza, setFilterNaturaleza] = useState<string>("todos");
    const [filterFP, setFilterFP] = useState<string>("todos");

    if (tabs.length === 0) return null;

    const filteredCentros = centros.filter((c) => {
        if (filterNaturaleza === "todos") return true;
        return c.naturaleza?.toUpperCase() === filterNaturaleza.toUpperCase();
    });

    const filteredFP = fpOfertas.filter((fp) => {
        if (filterFP === "todos") return true;
        return fp.nivel_educativo?.toLowerCase() === filterFP.toLowerCase();
    });

    const availableLevels = Array.from(
        new Set(fpOfertas.map((fp) => fp.nivel_educativo).filter(Boolean))
    ) as string[];

    return (
        <section id="educacion-y-formacion" className="relative">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">
                        Educación y formación
                    </h2>
                </div>
            </div>

            <div className="border border-title/20 bg-white/30">
                {tabs.length > 1 && (
                    <div className="flex flex-wrap items-center justify-between border-b border-title/15 bg-white/20 p-2 gap-2">
                        <div className="flex flex-wrap gap-1.5">
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

                        {activeTab === "centros" && centros.length > 4 && (
                            <div className="flex items-center gap-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFilterNaturaleza("todos")}
                                    className={`px-2.5 py-1 font-medium transition-colors ${filterNaturaleza === "todos" ? "bg-title/15 text-title font-bold" : "text-title/60 hover:text-title"}`}
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterNaturaleza("PÚBLICO")}
                                    className={`px-2.5 py-1 font-medium transition-colors ${filterNaturaleza === "PÚBLICO" ? "bg-title/15 text-title font-bold" : "text-title/60 hover:text-title"}`}
                                >
                                    Públicos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterNaturaleza("PRIVADO")}
                                    className={`px-2.5 py-1 font-medium transition-colors ${filterNaturaleza === "PRIVADO" ? "bg-title/15 text-title font-bold" : "text-title/60 hover:text-title"}`}
                                >
                                    Privados / Concertados
                                </button>
                            </div>
                        )}

                        {activeTab === "fp" && availableLevels.length > 1 && (
                            <div className="flex items-center gap-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFilterFP("todos")}
                                    className={`px-2.5 py-1 font-medium transition-colors ${filterFP === "todos" ? "bg-title/15 text-title font-bold" : "text-title/60 hover:text-title"}`}
                                >
                                    Todos
                                </button>
                                {availableLevels.map((lvl) => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setFilterFP(lvl)}
                                        className={`px-2.5 py-1 font-medium transition-colors ${filterFP.toLowerCase() === lvl.toLowerCase() ? "bg-title/15 text-title font-bold" : "text-title/60 hover:text-title"}`}
                                    >
                                        {lvl.replace(/^Grado\s+/i, "")}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="p-5 sm:p-7">
                    {activeTab === "centros" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredCentros.map((c, idx) => {
                                const isPublic = c.naturaleza?.toUpperCase() === "PÚBLICO";
                                const coords = parseLocation(c.localizacion);
                                const displayName = c.denominacion_especifica || c.denominacion_generica || "Centro docente";

                                return (
                                    <div
                                        key={`${displayName}-${idx}`}
                                        className="p-4 bg-white/40 border border-title/20 flex flex-col justify-between gap-3 hover:bg-white/60 transition-[background-color,border-color] duration-150"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="title-font text-base font-semibold leading-snug text-title">
                                                    {displayName}
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
                                                {c.denominacion_generica_breve && (
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-title/10 text-title tracking-wider">
                                                        {c.denominacion_generica_breve}
                                                    </span>
                                                )}
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isPublic
                                                            ? "bg-text-2/15 text-text-2 border border-text-2/20"
                                                            : "bg-title/15 text-title border border-title/20"
                                                        }`}
                                                >
                                                    {isPublic ? "Público" : "Concertado / Privado"}
                                                </span>
                                            </div>

                                            {c.denominacion_generica && c.denominacion_generica !== c.denominacion_especifica && (
                                                <p className="text-xs text-title/60 mt-0.5 line-clamp-1">
                                                    {c.denominacion_generica}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-title/10 text-xs">
                                            {c.telefono ? (
                                                <a
                                                    href={`tel:${c.telefono.replace(/\s+/g, "")}`}
                                                    className="inline-flex items-center gap-1.5 text-title/80 hover:text-text-2 font-mono transition-colors"
                                                >
                                                    <MdPhone size={13} className="text-text-2" />
                                                    <span>{c.telefono}</span>
                                                </a>
                                            ) : <span />}

                                            {c.web ? (
                                                <a
                                                    href={c.web}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 font-semibold text-text-2 hover:underline"
                                                >
                                                    <span>Sitio web</span>
                                                    <MdArrowOutward size={13} />
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === "fp" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredFP.map((fp, idx) => (
                                <div
                                    key={`${fp.familia_profesional}-${fp.nivel_educativo}-${idx}`}
                                    className="p-4 bg-white/40 border border-title/20 flex flex-col justify-between gap-3 hover:bg-white/60 transition-[background-color,border-color] duration-150"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-text-2/15 text-text-2 border border-text-2/20 uppercase tracking-wider">
                                                {fp.nivel_educativo || "Ciclo Formativo"}
                                            </span>
                                            {fp.modalidad && (
                                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/80 border border-title/20 text-title">
                                                    {fp.modalidad}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="title-font text-base font-semibold leading-snug text-title">
                                            {fp.familia_profesional || "Formación Profesional"}
                                        </h3>

                                        {fp.centro_educativo && (
                                            <p className="text-xs text-title/70 font-medium">
                                                {fp.centro_educativo}
                                            </p>
                                        )}
                                    </div>

                                    {fp.tipo_ensenanza && (
                                        <div className="pt-2 border-t border-title/10 text-[11px] text-title/60 flex items-center justify-between">
                                            <span>Enseñanza</span>
                                            <span className="font-semibold text-title">{fp.tipo_ensenanza}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Source href="https://datosabiertos.jcyl.es/">
                Directorio de centros docentes y oferta de FP de la Junta de Castilla y León
            </Source>
        </section>
    );
}
