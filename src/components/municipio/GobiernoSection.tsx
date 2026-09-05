"use client";

import { useMemo, useState } from "react";
import { EleccionesData, EleccionesPartido } from "@/types";
import { MdAccountBalance, MdCheckCircleOutline } from "react-icons/md";

function formatPersonName(rawName?: string): string {
    if (!rawName) return "";
    const lowercaseExceptions = new Set(["de", "del", "la", "las", "el", "los", "y", "i"]);
    return rawName
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((word, index) => {
            if (index > 0 && lowercaseExceptions.has(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}

const DEFAULT_PARTY_COLORS: Record<string, string> = {
    PP: "#0157A4",
    PSOE: "#E30613",
    VOX: "#63BE21",
    PODEMOS: "#6B2D82",
    "PODEMOS-IU": "#6B2D82",
    "PODEMOS-IU-AV": "#6B2D82",
    "UNIDAS PODEMOS": "#6B2D82",
    IU: "#9E1B32",
    "I.U.": "#9E1B32",
    CS: "#EB6109",
    "C'S": "#EB6109",
    CIUDADANOS: "#EB6109",
    SUMAR: "#E51C55",
    XAV: "#F0B400",
    "POR ÁVILA": "#F0B400",
    UPL: "#7A1F3D",
    SY: "#009543",
    "SORIA YA": "#009543",
    TLP: "#AB4A8C",
    "TOMA LA PALABRA": "#AB4A8C",
    VB: "#7B1FA2",
    "VÍA BURGALESA": "#7B1FA2",
    DCD: "#0288D1",
    "DECIDE BURGOS": "#0288D1",
    "EV-PCAS-TC": "#C2185B",
    PCAS: "#C2185B",
    "3E": "#546E7A",
    EQUO: "#689F38",
    PCTE: "#B71C1C",
    "ESCAÑOS EN BLANCO": "#78909C",
    PACMA: "#00A055",
    ERC: "#FFB232",
    JUNTS: "#00C3B2",
    "EAJ-PNV": "#008035",
    PNV: "#008035",
    "EH BILDU": "#00A39C",
    BILDU: "#00A39C",
    BNG: "#8ACBEF",
    CC: "#FFE000",
};

const PALETTE = [
    "#0157A4",
    "#E30613",
    "#63BE21",
    "#6B2D82",
    "#EB6109",
    "#00897B",
    "#F0B400",
    "#D81B60",
    "#3949AB",
    "#7CB342",
    "#00ACC1",
    "#8E24AA",
    "#FB8C00",
    "#546E7A",
];

function getPartyColor(siglas?: string, nombre?: string, colorProp?: string, index: number = 0): string {
    if (colorProp && colorProp.trim()) return colorProp;
    const cleanSiglas = siglas?.trim().toUpperCase();
    if (cleanSiglas && DEFAULT_PARTY_COLORS[cleanSiglas]) {
        return DEFAULT_PARTY_COLORS[cleanSiglas];
    }
    const cleanNombre = nombre?.trim().toUpperCase();
    if (cleanNombre && DEFAULT_PARTY_COLORS[cleanNombre]) {
        return DEFAULT_PARTY_COLORS[cleanNombre];
    }
    if (cleanSiglas || cleanNombre) {
        for (const [key, color] of Object.entries(DEFAULT_PARTY_COLORS)) {
            if (cleanSiglas && cleanSiglas.includes(key)) return color;
            if (cleanNombre && cleanNombre.includes(key)) return color;
        }
    }
    return PALETTE[index % PALETTE.length];
}

export default function GobiernoSection({ data }: { data: any }) {
    const elecciones: EleccionesData | undefined = data?.mas?.elecciones;
    const [hoveredParty, setHoveredParty] = useState<string | null>(null);

    const partidos = useMemo(() => {
        if (!elecciones?.partidos || !Array.isArray(elecciones.partidos)) return [];
        const mayorSiglas = elecciones.alcaldia?.partido?.toUpperCase();

        const conRepresentacion = elecciones.partidos.filter((p) => (p?.concejales || 0) > 0);
        const sourcePartidos = conRepresentacion.length > 0 ? conRepresentacion : elecciones.partidos;

        return [...sourcePartidos]
            .sort((a, b) => {
                const aSiglas = a?.siglas ? a.siglas.toUpperCase() : "";
                const bSiglas = b?.siglas ? b.siglas.toUpperCase() : "";
                const aIsMayor = Boolean(mayorSiglas && aSiglas === mayorSiglas);
                const bIsMayor = Boolean(mayorSiglas && bSiglas === mayorSiglas);
                if (aIsMayor && !bIsMayor) return -1;
                if (!aIsMayor && bIsMayor) return 1;
                const aConcejales = a?.concejales || 0;
                const bConcejales = b?.concejales || 0;
                const aPct = typeof a?.pct === "number" ? a.pct : 0;
                const bPct = typeof b?.pct === "number" ? b.pct : 0;
                return bConcejales - aConcejales || bPct - aPct;
            })
            .map((p, idx) => {
                const color = getPartyColor(p.siglas, p.nombre, p.color, idx);
                return { ...p, color };
            });
    }, [elecciones]);

    const totalSeats = useMemo(() => {
        if (elecciones?.concejales_totales && elecciones.concejales_totales > 0) {
            return elecciones.concejales_totales;
        }
        return partidos.reduce((acc, p) => acc + (p.concejales || 0), 0) || 0;
    }, [elecciones, partidos]);

    const majorityThreshold = useMemo(() => {
        if (!totalSeats) return 0;
        return Math.floor(totalSeats / 2) + 1;
    }, [totalSeats]);

    const hoveredPartyData = useMemo(() => {
        if (!hoveredParty) return null;
        return partidos.find((p) => p.siglas === hoveredParty) || null;
    }, [hoveredParty, partidos]);

    const seats = useMemo(() => {
        if (!totalSeats || !partidos.length) return [];
        let rowConfigs: { radius: number; count: number; dotR: number }[] = [];
        if (totalSeats <= 11) {
            rowConfigs = [{ radius: 100, count: totalSeats, dotR: 8 }];
        } else if (totalSeats <= 35) {
            const r1 = 75;
            const r2 = 110;
            const count1 = Math.round(totalSeats * (r1 / (r1 + r2)));
            const count2 = totalSeats - count1;
            rowConfigs = [
                { radius: r1, count: count1, dotR: 6 },
                { radius: r2, count: count2, dotR: 6 },
            ];
        } else {
            const r1 = 62;
            const r2 = 88;
            const r3 = 115;
            const sum = r1 + r2 + r3;
            const count1 = Math.round(totalSeats * (r1 / sum));
            const count2 = Math.round(totalSeats * (r2 / sum));
            const count3 = totalSeats - count1 - count2;
            rowConfigs = [
                { radius: r1, count: count1, dotR: 4.8 },
                { radius: r2, count: count2, dotR: 4.8 },
                { radius: r3, count: count3, dotR: 4.8 },
            ];
        }

        const cx = 160;
        const cy = 155;
        const points: { x: number; y: number; angle: number; r: number }[] = [];

        for (const row of rowConfigs) {
            const { radius, count } = row;
            if (count <= 0) continue;
            if (count === 1) {
                const angle = Math.PI / 2;
                points.push({
                    x: cx + radius * Math.cos(angle),
                    y: cy - radius * Math.sin(angle),
                    angle,
                    r: radius,
                });
            } else {
                const startAngle = Math.PI - 0.08;
                const endAngle = 0.08;
                const step = (startAngle - endAngle) / (count - 1);
                for (let i = 0; i < count; i++) {
                    const angle = startAngle - i * step;
                    points.push({
                        x: cx + radius * Math.cos(angle),
                        y: cy - radius * Math.sin(angle),
                        angle,
                        r: radius,
                    });
                }
            }
        }

        points.sort((a, b) => b.angle - a.angle);

        const result: { x: number; y: number; party: EleccionesPartido; dotR: number; key: string }[] = [];
        let seatIdx = 0;
        for (const party of partidos) {
            const partyCount = party.concejales || 0;
            for (let i = 0; i < partyCount && seatIdx < points.length; i++) {
                const pt = points[seatIdx];
                const dotR = totalSeats <= 11 ? 8 : totalSeats <= 35 ? 6 : 4.8;
                result.push({
                    x: Math.round(pt.x * 10) / 10,
                    y: Math.round(pt.y * 10) / 10,
                    party,
                    dotR,
                    key: `${party.siglas}-${i}`,
                });
                seatIdx++;
            }
        }
        return result;
    }, [totalSeats, partidos]);

    if (!elecciones || (!elecciones.alcaldia && partidos.length === 0)) {
        return null;
    }

    const { alcaldia, gobierno, anio = 2023, legislatura = "2023-2027" } = elecciones;

    const leadPartySiglas = alcaldia?.partido || partidos[0]?.siglas;
    const leadParty = leadPartySiglas
        ? partidos.find((p) => p.siglas.toUpperCase() === leadPartySiglas.toUpperCase())
        : partidos[0];
    const leadPartyColor = leadParty?.color || "#1F3A2E";
    const leadSeats = leadParty?.concejales || 0;
    const isAbsoluteMajority = gobierno?.mayoria_absoluta ?? (totalSeats > 0 && leadSeats >= majorityThreshold);

    return (
        <section className="py-14 sm:py-12 relative">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="title-font text-3xl font-semibold tracking-tight sm:text-4xl">
                        Equipo de gobierno
                    </h2>
                </div>
                {legislatura && (
                    <span className="text-xs font-mono uppercase tracking-widest text-title/60">
                        Mandato {legislatura}
                    </span>
                )}
            </div>

            <div className="border-y border-title/20 bg-bg-card">
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-title/15 items-stretch">
                    <div className="lg:col-span-6 flex flex-col divide-y divide-title/15">
                        <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-white/20">
                            <div className="w-full flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/50">
                                    Hemiciclo del pleno
                                </span>
                                <span className="text-[10px] font-mono text-title/60">
                                    Mayoría en {majorityThreshold} escaños
                                </span>
                            </div>

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
                                                className="transition-all duration-150 cursor-pointer"
                                                onMouseEnter={() => seat.party.siglas && setHoveredParty(seat.party.siglas)}
                                                onMouseLeave={() => setHoveredParty(null)}
                                            >
                                                <title>{`${seat.party.siglas || "Candidatura"}: ${seat.party.concejales ?? 0} ${(seat.party.concejales ?? 0) === 1 ? "concejal" : "concejales"}`}</title>
                                            </circle>
                                        );
                                    })}

                                    <ellipse
                                        cx={160}
                                        cy={155}
                                        rx={22}
                                        ry={7}
                                        fill="currentColor"
                                        className="text-title/15"
                                    />

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
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 flex flex-col justify-between gap-5 flex-1 bg-white/10">
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2 text-title/60">
                                    <MdAccountBalance className="text-text-2 text-base" aria-hidden="true" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/60">
                                        {alcaldia?.nombre ? "Alcaldía y Gobernabilidad" : "Composición y Gobernabilidad"}
                                    </span>
                                </div>
                                <h3 className="title-font text-2xl sm:text-3xl font-semibold leading-tight text-title">
                                    {alcaldia?.nombre
                                        ? formatPersonName(alcaldia.nombre)
                                        : leadPartySiglas
                                        ? `Pleno municipal (${leadPartySiglas})`
                                        : "Pleno municipal"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                                    {leadPartySiglas && (
                                        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-title bg-white/70 border border-title/20">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: leadPartyColor }}
                                                aria-hidden="true"
                                            />
                                            {alcaldia?.partido ? alcaldia.partido : `${leadPartySiglas} (1ª fuerza)`}
                                        </span>
                                    )}
                                    {gobierno?.etiqueta ? (
                                        <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-title bg-bg-card border border-title/20 inline-flex items-center gap-1.5">
                                            <MdCheckCircleOutline className="text-text-2" aria-hidden="true" />
                                            {gobierno.etiqueta}
                                        </span>
                                    ) : isAbsoluteMajority ? (
                                        <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-title bg-bg-card border border-title/20 inline-flex items-center gap-1.5">
                                            <MdCheckCircleOutline className="text-text-2" aria-hidden="true" />
                                            Mayoría absoluta
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-title bg-bg-card border border-title/20 inline-flex items-center gap-1.5">
                                            <MdCheckCircleOutline className="text-text-2" aria-hidden="true" />
                                            Sin mayoría absoluta
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm leading-relaxed text-title/75">
                                {alcaldia?.partido ? (
                                    <>
                                        El gobierno municipal está presidido por el{" "}
                                        <span className="font-semibold">{alcaldia.partido}</span>
                                        {totalSeats > 0 && (
                                            <>, formación que cuenta con{" "}
                                                <span className="font-semibold">{leadSeats} de los {totalSeats}</span> concejales de la corporación local.
                                            </>
                                        )}{" "}
                                        {isAbsoluteMajority
                                            ? "Dispone de mayoría absoluta para la aprobación de iniciativas."
                                            : "El pleno requiere acuerdos para la aprobación de presupuestos y ordenanzas."}
                                    </>
                                ) : leadPartySiglas ? (
                                    <>
                                        La formación con más representación en el pleno municipal es el{" "}
                                        <span className="font-semibold">{leadPartySiglas}</span>
                                        {totalSeats > 0 && (
                                            <>, que cuenta con{" "}
                                                <span className="font-semibold">{leadSeats} de los {totalSeats}</span> concejales de la corporación local.
                                            </>
                                        )}{" "}
                                        {isAbsoluteMajority
                                            ? "Dispone de mayoría absoluta suficiente para la gobernabilidad."
                                            : "El pleno municipal requiere acuerdos para alcanzar mayorías en votaciones e investidura."}
                                    </>
                                ) : (
                                    "Datos oficiales de la corporación municipal actualizados para la legislatura vigente."
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between pb-1 border-b border-title/10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-title/50">
                                Grupos políticos
                            </span>
                            <span className="text-[10px] font-mono text-title/50">
                                {partidos.length} formaciones
                            </span>
                        </div>

                        <div className={partidos.length >= 5 ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 content-between" : "flex flex-col gap-3 flex-1 justify-between"}>
                            {partidos.map((p, i) => {
                                const isHovered = Boolean(p.siglas && hoveredParty === p.siglas);
                                const isFaded = hoveredParty !== null && !isHovered;
                                const isMayor = Boolean(leadPartySiglas && p.siglas && leadPartySiglas.toUpperCase() === p.siglas.toUpperCase());
                                const isGrid = partidos.length >= 5;
                                const isOddLast = isGrid && partidos.length % 2 === 1 && i === partidos.length - 1;
                                const concejales = p.concejales ?? 0;
                                const pctVal = typeof p.pct === "number" ? p.pct : (p.pct ? parseFloat(p.pct) : undefined);
                                const hasPct = pctVal !== undefined && !Number.isNaN(pctVal);
                                const pctPleno = totalSeats > 0 ? ((concejales / totalSeats) * 100) : 0;
                                const barWidth = hasPct ? pctVal : pctPleno;

                                return (
                                    <div
                                        key={p.siglas || `partido-${i}`}
                                        onMouseEnter={() => p.siglas && setHoveredParty(p.siglas)}
                                        onMouseLeave={() => setHoveredParty(null)}
                                        className={`p-3 sm:p-3.5 bg-white/40 border border-title/15 transition-all duration-150 flex flex-col justify-center gap-2 hover:bg-white/70 cursor-pointer ${
                                            isGrid ? (isOddLast ? "sm:col-span-2" : "") : "flex-1"
                                        }`}
                                        style={{ opacity: isFaded ? 0.4 : 1 }}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: p.color || "#1F3A2E" }}
                                                    aria-hidden="true"
                                                />
                                                <span className="font-bold text-sm sm:text-base text-title tracking-wide truncate">
                                                    {p.siglas}
                                                </span>
                                                {isMayor && (
                                                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-title/10 text-title border border-title/20 shrink-0">
                                                        {alcaldia?.partido ? "Alcaldía" : "1ª Fuerza"}
                                                    </span>
                                                )}
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
                                                    className="h-full transition-all duration-300"
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
                </div>
            </div>

            <p className="mt-3 px-0.5 gap-1 flex items-center text-[10px] text-title/50 group relative w-fit">
                <span>Fuente:</span>
                <a target="_blank" rel="noopener noreferrer" className="group-hover:text-text-2 transition-colors duration-150" href="https://infoelectoral.interior.gob.es">Ministerio del Interior</a>
            </p>
        </section>
    );
}
