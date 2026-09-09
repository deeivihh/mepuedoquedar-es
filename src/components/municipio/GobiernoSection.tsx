"use client";

import { useMemo, useState } from "react";
import { EleccionesData, EleccionesPartido } from "@/types";
import { MdAccountBalance } from "react-icons/md";

import { getEleccionesSummary } from "@/lib/elecciones";
import Source from "./Source";

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
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 pb-6">
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
    return (
        <div className="lg:col-span-5 w-full p-6 sm:p-8 flex flex-col justify-start gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-title/15 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/60">
                    Representación en el Pleno
                </span>
                <span className="text-[11px] font-mono text-title/60">
                    {totalSeats > 0 ? `${totalSeats} ${totalSeats === 1 ? "escaño" : "escaños"} · ` : ""}
                    {partidos.length} {partidos.length === 1 ? "candidatura" : "candidaturas"}
                </span>
            </div>

            <div className="flex flex-col gap-2.5 w-full overflow-y-auto min-md:h-[450px] pr-1">
                {partidos.map((p) => {
                    const isHovered = Boolean(p.siglas && hoveredParty === p.siglas);
                    const isFaded = hoveredParty !== null && !isHovered;
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
                            className="group p-3.5 sm:p-4 bg-white/40 border border-title/20 transition-all duration-150 flex flex-col gap-2.5 hover:bg-white/75 hover:border-title/35 cursor-pointer shrink-0"
                            style={{ opacity: isFaded ? 0.35 : 1 }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-150 group-hover:scale-125"
                                        style={{ backgroundColor: p.color || "#1F3A2E" }}
                                        aria-hidden="true"
                                    />
                                    <div className="min-w-0 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span
                                                className="font-bold text-sm sm:text-base text-title tracking-wide"
                                                title={p.nombre || p.siglas}
                                            >
                                                {p.siglas}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-1.5 shrink-0">
                                    <span className="title-font text-lg sm:text-xl font-bold text-title leading-none">
                                        {concejales}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] text-title/60 font-medium">
                                        {concejales === 1 ? "concejal" : "concejales"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-title/70 font-mono">
                                    <span>
                                        {hasPct ? `${pctVal.toFixed(1)}% votos` : "—"}
                                        {p.votos ? ` · ${p.votos.toLocaleString("es-ES")} votos` : ""}
                                    </span>
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
        <section id="equipo-de-gobierno" className="relative">
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

            <div className="border border-title/20 bg-white/30">
                <div className="grid grid-cols-1 lg:grid-cols-9 divide-y lg:divide-y-0 lg:divide-x divide-title/15 items-stretch">
                    <div className="lg:col-span-4 flex flex-col divide-y divide-title/15">
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

            <Source href="https://infoelectoral.interior.gob.es">
                Ministerio del Interior
            </Source>
        </section>
    );
}
