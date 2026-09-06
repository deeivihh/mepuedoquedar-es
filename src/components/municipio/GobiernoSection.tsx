"use client";

import { useMemo, useState } from "react";
import { EleccionesData, EleccionesPartido } from "@/types";
import { MdAccountBalance, MdCheckCircleOutline } from "react-icons/md";

import { getEleccionesSummary } from "@/lib/elecciones";

function Hemiciclo({
    majorityThreshold,
    totalSeats,
    seats,
    hoveredParty,
    hoveredPartyData,
    onHoverParty,
}: {
    majorityThreshold: number;
    totalSeats: number;
    seats: { x: number; y: number; party: EleccionesPartido; dotR: number; key: string }[];
    hoveredParty: string | null;
    hoveredPartyData: (EleccionesPartido & { color: string }) | null;
    onHoverParty: (siglas: string | null) => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center bg-white/20 pb-8">
            <div className="w-full max-w-[340px] aspect-[320/180] relative">
                <svg viewBox="0 0 320 180" className="w-full h-full overflow-visible">
                    {seats.map((seat) => {
                        const isHovered = Boolean(seat.party.siglas && hoveredParty === seat.party.siglas);
                        const isFaded = hoveredParty !== null && !isHovered;
                        return (
                            <circle
                                key={seat.key}
                                cx={seat.x}
                                cy={seat.y}
                                r={isHovered ? seat.dotR * 1.3 : seat.dotR}
                                fill={seat.party.color || "#1F3A2E"}
                                opacity={isFaded ? 0.25 : 1}
                                className="transition-[opacity,r] duration-150 cursor-pointer"
                                onMouseEnter={() => seat.party.siglas && onHoverParty(seat.party.siglas)}
                                onMouseLeave={() => onHoverParty(null)}
                            >
                                <title>{`${seat.party.siglas || "Candidatura"}: ${seat.party.concejales ?? 0} ${(seat.party.concejales ?? 0) === 1 ? "concejal" : "concejales"}`}</title>
                            </circle>
                        );
                    })}

                    <g className="pointer-events-none select-none">
                        {hoveredPartyData ? (
                            <>
                                <text
                                    x={160}
                                    y={122}
                                    textAnchor="middle"
                                    className="title-font text-3xl font-bold"
                                    fill={hoveredPartyData.color || "#1F3A2E"}
                                >
                                    {hoveredPartyData.concejales ?? 0}
                                </text>
                                <text
                                    x={160}
                                    y={140}
                                    textAnchor="middle"
                                    className="text-xs font-bold uppercase tracking-wider fill-title"
                                >
                                    {hoveredPartyData.siglas || ""}
                                </text>
                            </>
                        ) : (
                            <>
                                <text
                                    x={160}
                                    y={122}
                                    textAnchor="middle"
                                    className="title-font text-3xl font-bold fill-title"
                                >
                                    {totalSeats}
                                </text>
                                <text
                                    x={160}
                                    y={140}
                                    textAnchor="middle"
                                    className="text-[10px] font-bold uppercase tracking-widest fill-title/50"
                                >
                                    concejales
                                </text>
                            </>
                        )}
                    </g>
                </svg>
                <div className="w-full flex items-center justify-center">
                    <span className="text-[10px] font-mono text-title/60">
                        Mayoría en {majorityThreshold} escaños
                    </span>
                </div>
            </div>
        </div>
    );
}

function GobernabilidadCard({
    displayName,
    partyTag,
    leadPartyColor,
    badgeText,
    narrative,
}: {
    displayName: string;
    partyTag: string;
    leadPartyColor: string;
    badgeText: string;
    narrative: string;
}) {
    const sectionTitle = displayName.startsWith("Pleno") ? "Composición y Gobernabilidad" : "Alcaldía y Gobernabilidad";

    return (
        <div className="p-6 sm:p-8 flex flex-col justify-between gap-5 flex-1 bg-white/10">
            <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-title/60">
                    <MdAccountBalance className="text-text-2 text-base" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/60">
                        {sectionTitle}
                    </span>
                </div>
                <h3 className="title-font text-2xl sm:text-3xl font-semibold leading-tight text-title">
                    {displayName}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                    {partyTag && (
                        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-title bg-white/70 border border-title/20">
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: leadPartyColor }}
                                aria-hidden="true"
                            />
                            {partyTag}
                        </span>
                    )}
                    <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-title bg-bg-card border border-title/20 inline-flex items-center gap-1.5">
                        {badgeText}
                    </span>
                </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-title/75">
                {narrative}
            </p>
        </div>
    );
}

function GruposPoliticosList({
    partidos,
    hoveredParty,
    onHoverParty,
    totalSeats,
}: {
    partidos: (EleccionesPartido & { color: string })[];
    hoveredParty: string | null;
    onHoverParty: (siglas: string | null) => void;
    totalSeats: number;
}) {
    const isGrid = partidos.length >= 5;

    return (
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-2">
            <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1" : "flex flex-col gap-4 flex-1 justify-between"}>
                {partidos.map((p, i) => {
                    const isHovered = Boolean(p.siglas && hoveredParty === p.siglas);
                    const isFaded = hoveredParty !== null && !isHovered;
                    const isOddLast = isGrid && partidos.length % 2 === 1 && i === partidos.length - 1;
                    const concejales = p.concejales ?? 0;
                    const pctVal = typeof p.pct === "number" ? p.pct : (p.pct ? parseFloat(p.pct) : undefined);
                    const hasPct = pctVal !== undefined && !Number.isNaN(pctVal);
                    const pctPleno = totalSeats > 0 ? ((concejales / totalSeats) * 100) : 0;
                    const barWidth = hasPct ? pctVal : pctPleno;

                    return (
                        <div
                            key={p.siglas}
                            onMouseEnter={() => p.siglas && onHoverParty(p.siglas)}
                            onMouseLeave={() => onHoverParty(null)}
                            className={`p-3 sm:p-3.5 bg-white/40 border border-title/15 transition-colors duration-150 flex flex-col justify-center gap-2 hover:bg-white/70 cursor-pointer ${isGrid ? (isOddLast ? "sm:col-span-2" : "") : "flex-1"
                                }`}
                            style={{ opacity: isFaded ? 0.4 : 1 }}
                        >
                            <div className="flex items-start justify-between h-full gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: p.color || "#1F3A2E" }}
                                        aria-hidden="true"
                                    />
                                    <span className="font-bold text-sm sm:text-base text-title tracking-wide truncate">
                                        {p.siglas}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 shrink-0">
                                    <span className="title-font text-lg sm:text-xl font-bold text-title">
                                        {concejales}
                                    </span>
                                    <span className="text-[11px] text-title/60">
                                        {concejales === 1 ? "concejal" : "concejales"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-title/70 font-mono">
                                    <span>{hasPct ? `${pctVal.toFixed(1)}% votos` : "—"}</span>
                                    <span>{totalSeats > 0 ? `${pctPleno.toFixed(0)}% pleno` : "—"}</span>
                                </div>
                                <div className="w-full h-1.5 bg-title/10 overflow-hidden">
                                    <div
                                        className="h-full transition-[width] duration-300"
                                        style={{
                                            width: `${Math.min(100, Math.max(0, barWidth))}%`,
                                            backgroundColor: p.color || "#1F3A2E",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function GobiernoSection({ data }: { data: any }) {
    const elecciones: EleccionesData | undefined = data?.mas?.elecciones;
    const [hoveredParty, setHoveredParty] = useState<string | null>(null);

    const summary = useMemo(() => getEleccionesSummary(elecciones), [elecciones]);

    const hoveredPartyData = useMemo(() => {
        if (!hoveredParty || !summary?.partidos) return null;
        return summary.partidos.find((p) => p.siglas === hoveredParty) || null;
    }, [hoveredParty, summary]);

    if (!summary) {
        return null;
    }

    return (
        <section className="py-14 sm:py-12 relative">
            <div className="mb-8 flex flex-col gap-2">
                <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">
                    Equipo de gobierno
                </h2>
                {summary.legislatura && (
                    <span className="pl-0.5 text-xs font-mono uppercase tracking-widest text-title/60">
                        Mandato {summary.legislatura}
                    </span>
                )}
            </div>

            <div className="border-y border-title/20 bg-bg-card">
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-title/15 items-stretch">
                    <div className="lg:col-span-6 flex flex-col divide-y divide-title/15">
                        <Hemiciclo
                            majorityThreshold={summary.majorityThreshold}
                            totalSeats={summary.totalSeats}
                            seats={summary.seats}
                            hoveredParty={hoveredParty}
                            hoveredPartyData={hoveredPartyData}
                            onHoverParty={setHoveredParty}
                        />

                        <GobernabilidadCard
                            displayName={summary.displayName}
                            partyTag={summary.partyTag}
                            leadPartyColor={summary.leadPartyColor}
                            badgeText={summary.badgeText}
                            narrative={summary.narrative}
                        />
                    </div>

                    <GruposPoliticosList
                        partidos={summary.partidos}
                        hoveredParty={hoveredParty}
                        onHoverParty={setHoveredParty}
                        totalSeats={summary.totalSeats}
                    />
                </div>
            </div>

            <p className="mt-3 px-0.5 gap-1 flex items-center text-[10px] text-title/50 group relative w-fit">
                <span>Fuente:</span>
                <a target="_blank" rel="noopener noreferrer" className="group-hover:text-text-2 transition-colors duration-150" href="https://infoelectoral.interior.gob.es">Ministerio del Interior</a>
            </p>
        </section>
    );
}
