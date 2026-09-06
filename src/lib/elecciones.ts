import { EleccionesData, EleccionesPartido } from "@/types";

export function formatPersonName(rawName?: string): string {
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

export const DEFAULT_PARTY_COLORS: Record<string, string> = {
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
};

export const PALETTE = [
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

export function getPartyColor(siglas?: string, nombre?: string, colorProp?: string, index: number = 0): string {
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

export function getSortedPartidos(elecciones?: EleccionesData): (EleccionesPartido & { color: string })[] {
    if (!elecciones?.partidos || !Array.isArray(elecciones.partidos)) return [];
    const mayorSiglas = elecciones.alcaldia?.partido?.toUpperCase();

    const conRepresentacion = elecciones.partidos.filter((p) => (p?.concejales || 0) > 0);
    const sourcePartidos = conRepresentacion.length > 0 ? conRepresentacion : elecciones.partidos;

    return sourcePartidos
        .toSorted((a, b) => {
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
}

export function computeHemicicloSeats(
    totalSeats: number,
    partidos: (EleccionesPartido & { color: string })[]
) {
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

    const result: { x: number; y: number; party: EleccionesPartido & { color: string }; dotR: number; key: string }[] = [];
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
}
