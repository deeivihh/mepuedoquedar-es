"use client";

import { useState } from "react";
import Source from "./Source";
import { MdLocalHospital, MdPhone, MdLocationOn } from "react-icons/md";
import { FaUserMd } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";

interface Hospital {
    nombre_del_centro: string;
    telefono?: string;
    posicion?: string;
    finalidad_asistencial?: string;
    localidad?: string;
}

interface CentroSalud {
    nombre_del_centro: string;
    direccion?: string;
    telefono?: string;
    finalidad_asistencial?: string;
    localidad?: string;
}

function parseSpecialties(raw?: string): string[] {
    if (!raw) return [];
    return raw
        .split("#")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
}

function parseCoords(pos?: string): { lat: string; lon: string } | null {
    if (!pos) return null;
    const parts = pos.split(",").map((s) => s.trim());
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
        return { lat: parts[0], lon: parts[1] };
    }
    return null;
}

export default function SanidadSection({ data }: { data: any }) {
    const hospitales: Hospital[] = data?.datos?.sanidad?.hospitales?.detalles ?? [];
    const centrosSalud: CentroSalud[] = data?.datos?.sanidad?.centrosSalud?.detalles ?? [];

    const [expandedHospitals, setExpandedHospitals] = useState<Record<number, boolean>>({});

    if (hospitales.length === 0 && centrosSalud.length === 0) return null;

    const toggleHospital = (idx: number) => {
        setExpandedHospitals((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <section id="atencion-sanitaria" className="relative">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">
                        Atención sanitaria
                    </h2>
                </div>
            </div>

            <div className="border border-title/20 bg-white/30 flex flex-col divide-y divide-title/15">
                {hospitales.length > 0 && (
                    <div className="p-5 sm:p-7 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-2">
                                Hospital de referencia
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {hospitales.map((h, idx) => {
                                const specialties = parseSpecialties(h.finalidad_asistencial);
                                const isExpanded = Boolean(expandedHospitals[idx]);
                                const visibleSpecialties = isExpanded ? specialties : specialties.slice(0, 12);
                                const coords = parseCoords(h.posicion);

                                return (
                                    <div
                                        key={`${h.nombre_del_centro}-${idx}`}
                                        className="p-5 bg-white/45 border border-title/25 flex flex-col gap-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2.5 bg-text-2 text-text-3 shrink-0">
                                                    <MdLocalHospital size={22} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="title-font text-xl font-bold text-title">
                                                        {h.nombre_del_centro}
                                                    </h3>
                                                    {h.localidad && (
                                                        <span className="text-xs text-title/65">
                                                            {h.localidad}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-start">
                                                {coords && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Ver en Google Maps"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/70 border border-title/20 hover:bg-white text-title transition-colors"
                                                    >
                                                        <SiGooglemaps size={13} className="text-text-2" />
                                                        <span>Cómo llegar</span>
                                                    </a>
                                                )}
                                                {h.telefono && (
                                                    <a
                                                        href={`tel:${h.telefono.replace(/\s+/g, "")}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-text-2 text-text-3 hover:opacity-90 active:scale-[0.97] transition-all"
                                                    >
                                                        <MdPhone size={14} />
                                                        <span>{h.telefono}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {specialties.length > 0 && (
                                            <div className="flex flex-col gap-2 pt-2 border-t border-title/10">
                                                <span className="text-[11px] font-semibold text-title/75">
                                                    Especialidades y servicios ({specialties.length})
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {visibleSpecialties.map((spec) => (
                                                        <span
                                                            key={spec}
                                                            className="px-2 py-0.5 text-[11px] font-medium bg-white/70 border border-title/15 text-title/85"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>

                                                {specialties.length > 12 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleHospital(idx)}
                                                        className="self-start mt-1 text-xs font-bold text-text-2 hover:underline cursor-pointer"
                                                    >
                                                        {isExpanded
                                                            ? "Mostrar menos especialidades"
                                                            : `Ver las ${specialties.length} especialidades`}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {centrosSalud.length > 0 && (
                    <div className="p-5 sm:p-7 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/65">
                                Atención primaria y consultorios ({centrosSalud.length})
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {centrosSalud.map((cs, idx) => {
                                const services = parseSpecialties(cs.finalidad_asistencial);

                                return (
                                    <div
                                        key={`${cs.nombre_del_centro}-${idx}`}
                                        className="p-4 bg-white/40 border border-title/20 flex flex-col justify-between gap-3 hover:bg-white/60 transition-[background-color,border-color] duration-150"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 text-text-2 text-xs font-semibold">
                                                <FaUserMd size={13} />
                                                <span>Atención primaria</span>
                                            </div>

                                            <h3 className="title-font text-base font-semibold leading-snug text-title mt-0.5">
                                                {cs.nombre_del_centro}
                                            </h3>

                                            {cs.direccion && (
                                                <p className="text-xs text-title/70 flex items-center gap-1 mt-0.5">
                                                    <MdLocationOn size={13} className="text-text-2 shrink-0" />
                                                    <span>{cs.direccion}</span>
                                                </p>
                                            )}

                                            {services.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-2">
                                                    {services.map((serv) => (
                                                        <span
                                                            key={serv}
                                                            className="px-2 py-0.5 text-[10px] font-medium bg-white/70 border border-title/15 text-title/80"
                                                        >
                                                            {serv}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {cs.telefono && (
                                            <div className="pt-2 border-t border-title/10 flex justify-between items-center">
                                                <a
                                                    href={`tel:${cs.telefono.replace(/\s+/g, "")}`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-text-2 hover:underline"
                                                >
                                                    <MdPhone size={13} />
                                                    <span>{cs.telefono}</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Source href="https://datosabiertos.jcyl.es/">
                Registro de centros sanitarios de la Junta de Castilla y León
            </Source>
        </section>
    );
}
