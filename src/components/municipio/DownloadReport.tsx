"use client";

import { useState } from "react";
import { FaFileArrowDown } from "react-icons/fa6";
import { VscLoading } from "react-icons/vsc";
import type { DepartmentScore, ScoreResult } from "@/lib/scores/calculateScores";
import { getGlobalLabel } from "@/lib/scores/calculateScores";
import { formatIndicatorValue } from "@/lib/scores/departmentPriority";
import { TABLES, getTableKey, filterData, getPeriod, formatSeriesName, CHART_PALETTE, type TableConfig } from "@/lib/config/tables";
import type { WikipediaData } from "@/actions/wikipedia";
import type { EleccionesData, EleccionesPartido } from "@/types";
import { formatPersonName, getSortedPartidos, computeHemicicloSeats } from "@/lib/elecciones";

let Document: any;
let Page: any;
let Text: any;
let View: any;
let Image: any;
let ImageBackground: any;
let Svg: any;
let G: any;
let Line: any;
let Circle: any;
let Rect: any;
let Path: any;

type MunicipioData = Record<string, any>;
type IneData = Record<string, any[]> | null;

const colors = {
    green: "#1F3A2E",
    title: "#1F3A2E",
    terracotta: "#C46A4A",
    beige: "#f1e8d7",
    card: "#F4EBE2",
    ink: "#1B1B1B",
    muted: "#667068",
};

const styles: any = {
    page: { backgroundColor: colors.beige, color: colors.ink, fontFamily: "Helvetica", fontSize: 9, paddingTop: 54, paddingHorizontal: 48, paddingBottom: 44 },
    cover: { backgroundColor: colors.beige },
    coverImage: { alignItems: "center", height: "100%", justifyContent: "center", objectFit: "cover", width: "100%" },
    coverMunicipality: { alignItems: "center", display: "flex", flexDirection: "column", justifyContent: "center", marginHorizontal: 58, marginTop: -12 },
    coverMunicipalityName: { color: colors.terracotta, fontFamily: "Times-Bold", fontSize: 64, lineHeight: 1.05, textAlign: "center" },
    coverMunicipalitySubtitle: { color: colors.title, fontFamily: "Times-BoldItalic", fontSize: 15, lineHeight: 1.2, textAlign: "center", marginTop: 20 },
    footer: { bottom: 20, left: 48, position: "absolute", right: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    footerText: { color: colors.muted, fontSize: 7, flex: 1 },
    section: { marginBottom: 20 },
    sectionTitle: { borderBottomColor: `${colors.green}44`, borderBottomWidth: 1, color: colors.green, fontFamily: "Times-Bold", fontSize: 22, marginBottom: 12, paddingBottom: 7 },
    intro: { color: colors.muted, fontSize: 10, lineHeight: 1.5, marginBottom: 16 },
    summaryImageCard: { backgroundColor: colors.card, borderColor: `${colors.green}22`, borderWidth: 1, marginTop: 12, overflow: "hidden" },
    summaryImage: { height: 220, objectFit: "cover", width: "100%" },
    summaryImageHalf: { height: 160, objectFit: "cover", width: "100%" },
    summaryImageCaption: { color: colors.muted, fontSize: 7.5, paddingHorizontal: 10, paddingVertical: 6, textAlign: "center" },
    summaryImagesRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    summaryImageCol: { backgroundColor: colors.card, borderColor: `${colors.green}22`, borderWidth: 1, flex: 1, overflow: "hidden" },
    globalScoreBlock: { backgroundColor: colors.card, borderWidth: 1, borderColor: `${colors.green}22`, padding: 16, marginBottom: 18 },
    globalScoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 12 },
    globalEyebrow: { color: `${colors.green}88`, fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.4, textTransform: "uppercase" },
    globalScoreRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 },
    globalScoreNumber: { color: colors.green, fontFamily: "Times-Bold", fontSize: 42, lineHeight: 1 },
    globalScoreMax: { color: `${colors.green}66`, fontFamily: "Helvetica-Bold", fontSize: 10 },
    globalBar: { backgroundColor: `${colors.green}18`, height: 4, marginTop: 8, width: 160 },
    globalBarFill: { backgroundColor: colors.terracotta, height: 4 },
    globalLabel: { color: colors.green, fontFamily: "Times-Bold", fontSize: 13, lineHeight: 1.25, textAlign: "right", flex: 1, paddingLeft: 12 },
    profileBox: { borderTopColor: `${colors.green}12`, borderTopWidth: 1, marginTop: 12, paddingTop: 7 },
    profileLine: { color: `${colors.green}88`, fontFamily: "Helvetica", fontSize: 7.5, letterSpacing: 0.3 },
    profilePrefix: { fontFamily: "Helvetica-Bold", color: colors.green },
    department: { backgroundColor: colors.card, borderColor: `${colors.green}22`, borderWidth: 1, marginBottom: 10, padding: 10 },
    departmentHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    departmentName: { color: colors.green, fontFamily: "Times-Bold", fontSize: 11 },
    departmentScore: { color: colors.terracotta, fontFamily: "Helvetica-Bold", fontSize: 10 },
    bar: { backgroundColor: `${colors.green}18`, height: 4, marginBottom: 8, width: "100%" },
    barFill: { backgroundColor: colors.green, height: 4 },
    indicator: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    indicatorLabel: { color: colors.ink, fontSize: 8, width: "52%" },
    indicatorValue: { color: colors.muted, fontSize: 8, textAlign: "right", width: "28%" },
    indicatorScore: { color: colors.green, fontFamily: "Helvetica-Bold", fontSize: 8, textAlign: "right", width: "20%" },
    chartsContainer: { borderColor: `${colors.green}22`, borderWidth: 1 },
    chartRow: { flexDirection: "row", borderTopColor: `${colors.green}22`, borderTopWidth: 1 },
    chartGroup: { backgroundColor: colors.card, flex: 1, padding: 8 },
    chartGroupFull: { width: "100%" },
    chartBorderRight: { borderRightColor: `${colors.green}22`, borderRightWidth: 1 },
    chartTitle: { color: colors.green, fontFamily: "Times-Bold", fontSize: 9.5, marginBottom: 2 },
    chartDate: { color: colors.muted, fontSize: 7, marginBottom: 8 },
    legend: { flexDirection: "row", flexWrap: "wrap", marginTop: 7 },
    legendItem: { alignItems: "center", flexDirection: "row", marginBottom: 4, paddingRight: 8, width: "50%" },
    legendMarker: { height: 6, marginRight: 4, width: 6 },
    legendLabel: { color: colors.ink, fontSize: 7, paddingRight: 4, width: "76%" },
    legendValue: { color: colors.muted, fontSize: 7, textAlign: "right", width: "24%" },
    sourceGrid: { flexDirection: "row", marginHorizontal: -4, marginBottom: 12 },
    sourceItem: { paddingHorizontal: 4, width: "33.33%" },
    sourceCard: { backgroundColor: colors.card, borderColor: `${colors.green}22`, borderWidth: 1, height: 100, padding: 8 },
    sourceTag: { color: colors.terracotta, fontFamily: "Helvetica-Bold", fontSize: 5.5, letterSpacing: 0.5, marginBottom: 3, textTransform: "uppercase" },
    sourceTitle: { color: colors.green, fontFamily: "Times-Bold", fontSize: 8.5, marginBottom: 2 },
    sourceDesc: { color: colors.muted, fontSize: 6.5, lineHeight: 1.35 },
    methodologySectionTitle: { color: colors.green, fontFamily: "Times-Bold", fontSize: 10.5, marginBottom: 7, paddingBottom: 2, borderBottomColor: `${colors.green}22`, borderBottomWidth: 1 },
    formulaBox: { backgroundColor: `${colors.green}0a`, borderColor: `${colors.green}18`, borderWidth: 1, marginTop: 4, padding: 3.5 },
    formulaText: { color: colors.green, fontFamily: "Courier", fontSize: 5.4, lineHeight: 1.25 },
    legalBox: { backgroundColor: colors.card, borderColor: `${colors.green}22`, borderWidth: 1, padding: 8 },
    legalText: { color: colors.muted, fontSize: 6.8, lineHeight: 1.4 },
    note: { color: colors.muted, fontSize: 7.5, lineHeight: 1.45 },
    gobTopRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    gobCard: { backgroundColor: colors.card, borderColor: `${colors.green}22`, borderWidth: 1, padding: 10, flex: 1 },
    gobEyebrow: { color: `${colors.green}88`, fontFamily: "Helvetica-Bold", fontSize: 6.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 },
    gobTitle: { color: colors.green, fontFamily: "Times-Bold", fontSize: 13, marginBottom: 4 },
    gobBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2, marginBottom: 6 },
    gobBadge: { backgroundColor: `${colors.green}12`, borderColor: `${colors.green}24`, borderWidth: 0.8, paddingVertical: 2, paddingHorizontal: 5, flexDirection: "row", alignItems: "center", gap: 4 },
    gobBadgeText: { color: colors.green, fontFamily: "Helvetica-Bold", fontSize: 6.5 },
    gobPartyDot: { width: 5, height: 5, borderRadius: 2.5 },
    gobDesc: { color: colors.muted, fontSize: 7.2, lineHeight: 1.35 },
    gobPartiesContainer: { backgroundColor: colors.card, borderColor: `${colors.green}22`, borderWidth: 1, padding: 10, marginTop: 4 },
    gobPartyItem: { marginBottom: 3 },
    gobPartyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
    gobPartyLeft: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
    gobPartyName: { color: colors.ink, fontFamily: "Helvetica-Bold", fontSize: 7.8 },
    gobPartyTag: { backgroundColor: `${colors.green}15`, paddingHorizontal: 3, paddingVertical: 1, fontSize: 5.5, fontFamily: "Helvetica-Bold", color: colors.green },
    gobPartyRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    gobPartySeats: { color: colors.green, fontFamily: "Times-Bold", fontSize: 9.5 },
    gobPartyPct: { color: colors.muted, fontSize: 7, width: 44, textAlign: "right" },
    gobPartyBarBg: { backgroundColor: `${colors.green}15`, height: 3, width: "100%", marginTop: 2, marginBottom: 3 },
    gobPartyBarFill: { height: 3 },
};

const capitalize = (v: string) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
const shorten = (v: string, max = 18) => (v.length > max ? `${v.slice(0, max - 1)}…` : v);
const numVal = (v: unknown) => { const n = typeof v === "number" ? v : Number(v); return Number.isFinite(n) ? n : 0; };
const formatNumber = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n.toLocaleString("es-ES") : "Sin datos"; };
const compactFmt = new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 });
const formatCompact = (v: number) => compactFmt.format(v);
const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

function ChartLegend({ entries }: { entries: { label: string; value: number }[] }) {
    return (
        <View style={styles.legend}>
            {entries.map((entry, i) => (
                <View key={entry.label} style={styles.legendItem}>
                    <View style={{ ...styles.legendMarker, backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                    <Text style={styles.legendLabel}>{shorten(entry.label, 34)}</Text>
                    <Text style={styles.legendValue}>{formatNumber(entry.value)}</Text>
                </View>
            ))}
        </View>
    );
}

function PieDonutChart({ type, entries, fullWidth }: { type: "pie" | "donut"; entries: { label: string; value: number }[]; fullWidth?: boolean }) {
    const vbW = fullWidth ? 520 : 130;
    const cx = fullWidth ? vbW / 2 : 65;
    const rOuter = 52 * (fullWidth ? 2.1 : 1);
    const rInner = type === "donut" ? (fullWidth ? 62 : 29) : 0;
    const size = fullWidth ? 168 : 142;
    const total = entries.reduce((s, v) => s + v.value, 0) || 1;

    const slicePath = (start: number, end: number) => {
        const large = end - start > Math.PI ? 1 : 0;
        const pt = (r: number, a: number) => `${cx + r * Math.cos(a)} ${65 + r * Math.sin(a)}`;
        if (!rInner) return `M ${cx} 65 L ${pt(rOuter, start)} A ${rOuter} ${rOuter} 0 ${large} 1 ${pt(rOuter, end)} Z`;
        return `M ${pt(rOuter, start)} A ${rOuter} ${rOuter} 0 ${large} 1 ${pt(rOuter, end)} L ${pt(rInner, end)} A ${rInner} ${rInner} 0 ${large} 0 ${pt(rInner, start)} Z`;
    };

    return (
        <View>
            <Svg width="100%" height={size} viewBox={`0 0 ${vbW} 130`}>
                {entries.map((entry, idx) => {
                    const start = (entries.slice(0, idx).reduce((s, v) => s + v.value, 0) / total) * Math.PI * 2 - Math.PI / 2;
                    const end = (entries.slice(0, idx + 1).reduce((s, v) => s + v.value, 0) / total) * Math.PI * 2 - Math.PI / 2;
                    return <Path key={entry.label} d={slicePath(start, end)} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />;
                })}
                {type === "donut" && <Circle cx={cx} cy="65" r={rInner ? rInner - 6 : 0} fill={colors.card} />}
            </Svg>
            <ChartLegend entries={entries} />
        </View>
    );
}

function ColumnChart({ entries, fullWidth }: { entries: { label: string; value: number }[]; fullWidth?: boolean }) {
    const maxVal = Math.max(...entries.map((e) => e.value), 1);
    const barW = Math.min(fullWidth ? 68 : 42, (fullWidth ? 460 : 360) / entries.length);
    return (
        <View>
            <Svg width="100%" height={150} viewBox="0 0 500 150">
                <Line x1="36" y1="120" x2="480" y2="120" stroke={`${colors.green}66`} strokeWidth="1" />
                {entries.map((entry, idx) => {
                    const h = (entry.value / maxVal) * 95;
                    const x = 52 + idx * (390 / entries.length);
                    return (
                        <G key={entry.label}>
                            <Rect x={x} y={120 - h} width={barW} height={h} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
                            <Text x={x + barW / 2} y="135" fill={colors.muted} style={{ fontSize: 6 }} textAnchor="middle">{idx + 1}</Text>
                        </G>
                    );
                })}
                <Text x="30" y="28" fill={colors.muted} style={{ fontSize: 7 }} textAnchor="end">{formatNumber(maxVal)}</Text>
            </Svg>
            <ChartLegend entries={entries} />
        </View>
    );
}

function LineChart({ series, fullWidth }: { series: { label: string; points: { period: string; value: number }[] }[]; fullWidth?: boolean }) {
    const vals = series.flatMap((item) => item.points.map((p) => p.value));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const longest = Math.max(...series.map((item) => item.points.length), 1);
    const dates = series[0]?.points.map((p) => p.period) ?? [];
    const plot = fullWidth ? { left: 31, right: 468, top: 13, bottom: 94 } : { left: 31, right: 234, top: 13, bottom: 94 };
    const vbW = fullWidth ? 500 : 250;

    const pos = (p: { value: number }, idx: number, len: number) => ({
        x: plot.left + (idx / Math.max(len - 1, 1)) * (plot.right - plot.left),
        y: plot.bottom - ((p.value - min) / range) * (plot.bottom - plot.top),
    });

    const linePath = (pts: { value: number }[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${pos(p, i, pts.length).x} ${pos(p, i, pts.length).y}`).join(" ");
    const areaPath = (pts: { value: number }[]) => `${linePath(pts)} L ${pos(pts.at(-1)!, pts.length - 1, pts.length).x} ${plot.bottom} L ${pos(pts[0], 0, pts.length).x} ${plot.bottom} Z`;
    const ticks = [max, min + range / 2, min];
    const dateIdxs = [0, Math.floor((longest - 1) / 2), longest - 1].filter((idx, p, l) => l.indexOf(idx) === p);

    return (
        <View>
            <Svg width="100%" height={126} viewBox={`0 0 ${vbW} 126`}>
                {ticks.map((val, i) => {
                    const y = plot.top + i * ((plot.bottom - plot.top) / 2);
                    return (
                        <G key={val}>
                            <Line x1={plot.left} y1={y} x2={plot.right} y2={y} stroke={`${colors.green}20`} strokeWidth="0.8" />
                            <Text x="26" y={y + 2.5} fill={colors.muted} style={{ fontSize: 6 }} textAnchor="end">{formatCompact(val)}</Text>
                        </G>
                    );
                })}
                {series.map((item, idx) => (
                    <G key={item.label}>
                        {series.length === 1 && <Path d={areaPath(item.points)} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} fillOpacity={0.12} />}
                        <Path d={linePath(item.points)} fill="none" stroke={CHART_PALETTE[idx % CHART_PALETTE.length]} strokeWidth="2.2" />
                        {item.points.map((pt, pIdx) => {
                            const p = pos(pt, pIdx, item.points.length);
                            return <Circle key={pIdx} cx={p.x} cy={p.y} r="2.2" fill={colors.card} stroke={CHART_PALETTE[idx % CHART_PALETTE.length]} strokeWidth="1.3" />;
                        })}
                    </G>
                ))}
                <Line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} stroke={`${colors.green}55`} strokeWidth="0.8" />
                {dateIdxs.map((idx) => (
                    <Text key={idx} x={plot.left + (idx / Math.max(longest - 1, 1)) * (plot.right - plot.left)} y="109" fill={colors.muted} style={{ fontSize: 6 }} textAnchor="middle">{shorten(dates[idx] || "", 10)}</Text>
                ))}
            </Svg>
            <ChartLegend entries={series.map((s) => ({ label: s.label, value: s.points.at(-1)?.value ?? 0 }))} />
        </View>
    );
}

function ChartBox({ title, latest, fullWidth, borderRight, children }: { title: string; latest?: string; fullWidth?: boolean; borderRight?: boolean; children: React.ReactNode }) {
    return (
        <View style={[styles.chartGroup, fullWidth ? styles.chartGroupFull : {}, borderRight ? styles.chartBorderRight : {}]} wrap={false}>
            <Text style={styles.chartTitle}>{title}</Text>
            {latest && <Text style={styles.chartDate}>Última actualización: {latest}</Text>}
            {children}
        </View>
    );
}

function getIneCat(table: TableConfig, filtered: any[]) {
    const isPolar = table.type === "pie" || table.type === "donut";
    return filtered.reduce<{ label: string; value: number }[]>((acc, item, i) => {
        const raw = Array.isArray(item?.Data) ? item.Data[0]?.Valor : item?.Valor;
        const name = String(item?.Nombre ?? item?.COD ?? `Dato ${i + 1}`);
        const label = (table.formatName?.(name) ?? formatSeriesName(name)) || name;
        const value = numVal(raw);
        if (isPolar ? value > 0 : Number.isFinite(value)) acc.push({ label, value });
        return acc;
    }, []);
}

function getIneSeries(table: TableConfig, filtered: any[]) {
    if (Array.isArray(filtered) && filtered.some((item) => Array.isArray(item?.Data))) {
        return filtered.reduce<{ label: string; points: { period: string; value: number }[] }[]>((acc, item, i) => {
            const name = String(item?.Nombre ?? item?.COD ?? `Serie ${i + 1}`);
            const label = (table.formatName?.(name) ?? formatSeriesName(name)) || name;
            const points = [...item.Data].reverse().map((p) => ({ period: getPeriod(p), value: numVal(p.Valor) }));
            if (points.length) acc.push({ label, points });
            return acc;
        }, []);
    }
    return [{
        label: table.title ?? "Valor",
        points: [...filtered].reverse().map((item) => ({ period: getPeriod(item), value: numVal(item.Valor) })),
    }];
}

function IneChart({ table, data, fullWidth, borderRight }: { table: TableConfig; data: any[]; fullWidth?: boolean; borderRight?: boolean }) {
    const filtered = filterData(data, table.filter);
    if (!filtered?.length) return null;
    const isCat = table.type === "pie" || table.type === "donut" || table.type === "column";
    const latest = Array.isArray(filtered) && Array.isArray(filtered[0]?.Data) ? getPeriod(filtered[0]?.Data?.[0]) : getPeriod(filtered[0]);

    if (isCat) {
        const entries = getIneCat(table, filtered);
        if (!entries.length) return null;
        return (
            <ChartBox title={table.title ?? "Indicadores INE"} latest={latest} fullWidth={fullWidth} borderRight={borderRight}>
                {table.type === "pie" || table.type === "donut" ? <PieDonutChart type={table.type} entries={entries} fullWidth={fullWidth} /> : <ColumnChart entries={entries} fullWidth={fullWidth} />}
            </ChartBox>
        );
    }

    const series = getIneSeries(table, filtered);
    if (!series.length || !series.some((s) => s.points.length)) return null;
    return (
        <ChartBox title={table.title ?? "Indicadores INE"} latest={latest} fullWidth={fullWidth} borderRight={borderRight}>
            <LineChart series={series} fullWidth={fullWidth} />
        </ChartBox>
    );
}

function AlquilerChart({ vivienda, fullWidth, borderRight }: { vivienda: any; fullWidth?: boolean; borderRight?: boolean }) {
    if (!vivienda?.alquiler?.precio && !vivienda?.alquiler?.serie?.length) return null;
    const points = Array.isArray(vivienda.alquiler.serie) && vivienda.alquiler.serie.length
        ? vivienda.alquiler.serie.toSorted((a: any, b: any) => Number(a.anio) - Number(b.anio)).map((item: any) => ({ period: String(item.anio), value: Number(item.precio) }))
        : [{ period: String(vivienda.actualizado ?? ""), value: Number(vivienda.alquiler.precio) }];

    return (
        <ChartBox title="Alquiler de referencia" latest={String(vivienda.actualizado ?? points.at(-1)?.period ?? "")} fullWidth={fullWidth} borderRight={borderRight}>
            <LineChart series={[{ label: vivienda.tipo === "casa" ? "Casas (€/mes)" : "Pisos (€/mes)", points }]} fullWidth={fullWidth} />
        </ChartBox>
    );
}

function ReportFooter() {
    const formattedDate = dateFmt.format(new Date());
    return (
        <View style={styles.footer} fixed>
            <Text style={[styles.footerText, { textAlign: "left" }]}>mepuedoquedar.es</Text>
            <Text style={[styles.footerText, { textAlign: "center" }]} render={({ pageNumber, totalPages }: any) => `${pageNumber} de ${totalPages}`} />
            <Text style={[styles.footerText, { textAlign: "right" }]}>{formattedDate}</Text>
        </View>
    );
}

function getProfilePills(pref: Record<string, any>) {
    const age = Number(pref.age ?? 35);
    const label = age < 30 ? "Joven" : age < 45 ? "Adulto/a joven" : age < 60 ? "Adulto/a" : "Mayor";
    return [
        `${age} años · ${label}`,
        pref.hasCar ? "Con coche" : "Sin coche",
        pref.hasSchoolChildren ? "Con hijos" : "",
        pref.lookingForWork ? "Busca empleo" : "",
        pref.remotework ? "Teletrabaja" : "",
        pref.isRetired ? "Jubilado/a" : "",
        pref.hasPet ? "Con mascota" : "",
    ].filter(Boolean);
}

function getDisplayName(nombre?: string | null, leadPartySiglas?: string) {
    if (nombre) return formatPersonName(nombre);
    if (leadPartySiglas) return `Pleno municipal (${leadPartySiglas})`;
    return "Pleno municipal";
}

function getNarrative(
    alcaldiaPartido?: string,
    leadPartySiglas?: string,
    leadSeats: number = 0,
    totalSeats: number = 0,
    isAbsoluteMajority: boolean = false
) {
    const seatsInfo = totalSeats > 0 ? `, formación que cuenta con ${leadSeats} de los ${totalSeats} concejales de la corporación local.` : ".";
    const majorityInfo = isAbsoluteMajority
        ? "Dispone de mayoría absoluta para la aprobación de iniciativas."
        : "El pleno requiere acuerdos para la aprobación de presupuestos y ordenanzas.";

    if (alcaldiaPartido) {
        return `El gobierno municipal está presidido por el ${alcaldiaPartido}${seatsInfo} ${majorityInfo}`;
    }
    if (leadPartySiglas) {
        return `La formación con más representación en el pleno municipal es el ${leadPartySiglas}${seatsInfo} ${majorityInfo}`;
    }
    return "Datos oficiales de la corporación municipal actualizados para la legislatura vigente.";
}

function AlcaldiaCardReport({
    alcaldia,
    gobierno,
    leadPartySiglas,
    leadPartyColor,
    leadSeats,
    totalSeats,
    isAbsoluteMajority,
}: {
    alcaldia?: EleccionesData["alcaldia"];
    gobierno?: EleccionesData["gobierno"];
    leadPartySiglas?: string;
    leadPartyColor: string;
    leadSeats: number;
    totalSeats: number;
    isAbsoluteMajority: boolean;
}) {
    const badgeText = gobierno?.etiqueta || (isAbsoluteMajority ? "Mayoría absoluta" : "Sin mayoría absoluta");
    const sectionEyebrow = alcaldia?.nombre ? "Alcaldía y Gobernabilidad" : "Composición y Gobernabilidad";
    const displayName = getDisplayName(alcaldia?.nombre, leadPartySiglas);
    const partyTag = alcaldia?.partido ? alcaldia.partido : (leadPartySiglas ? `${leadPartySiglas} (1ª fuerza)` : "");
    const narrative = getNarrative(alcaldia?.partido, leadPartySiglas, leadSeats, totalSeats, isAbsoluteMajority);

    return (
        <View style={styles.gobCard}>
            <Text style={styles.gobEyebrow}>{sectionEyebrow}</Text>
            <Text style={styles.gobTitle}>{displayName}</Text>
            <View style={styles.gobBadgeRow}>
                {partyTag ? (
                    <View style={styles.gobBadge}>
                        <View style={[styles.gobPartyDot, { backgroundColor: leadPartyColor }]} />
                        <Text style={styles.gobBadgeText}>{partyTag}</Text>
                    </View>
                ) : null}
                <View style={styles.gobBadge}>
                    <Text style={styles.gobBadgeText}>{badgeText}</Text>
                </View>
            </View>
            <Text style={styles.gobDesc}>{narrative}</Text>
        </View>
    );
}

function HemicicloReport({
    totalSeats,
    majorityThreshold,
    seats,
}: {
    totalSeats: number;
    majorityThreshold: number;
    seats: { x: number; y: number; party: EleccionesPartido & { color: string }; dotR: number; key: string }[];
}) {
    return (
        <View style={styles.gobCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={styles.gobEyebrow}>Hemiciclo del pleno</Text>
                <Text style={{ color: colors.muted, fontSize: 6.5 }}>Mayoría en {majorityThreshold} escaños</Text>
            </View>
            <Svg width="100%" height={110} viewBox="0 0 320 180">
                {seats.map((seat) => (
                    <Circle
                        key={seat.key}
                        cx={seat.x}
                        cy={seat.y}
                        r={seat.dotR * 1.1}
                        fill={seat.party.color || colors.green}
                    />
                ))}
                <Text x="160" y="125" textAnchor="middle" fill={colors.green} style={{ fontSize: 28, fontFamily: "Times-Bold" }}>
                    {totalSeats}
                </Text>
                <Text x="160" y="139" textAnchor="middle" fill={`${colors.green}88`} style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}>
                    CONCEJALES
                </Text>
            </Svg>
        </View>
    );
}

function PartidosListReport({
    partidos,
    leadPartySiglas,
    isAlcaldiaSet,
    totalSeats,
}: {
    partidos: (EleccionesPartido & { color: string })[];
    leadPartySiglas?: string;
    isAlcaldiaSet: boolean;
    totalSeats: number;
}) {
    const isGrid = partidos.length >= 5;
    const half = Math.ceil(partidos.length / 2);
    const col1 = isGrid ? partidos.slice(0, half) : partidos;
    const col2 = isGrid ? partidos.slice(half) : [];

    const renderPartyItem = (p: EleccionesPartido & { color: string }) => {
        const isMayor = Boolean(leadPartySiglas && p.siglas && leadPartySiglas.toUpperCase() === p.siglas.toUpperCase());
        const concejales = p.concejales ?? 0;
        const pctVal = typeof p.pct === "number" ? p.pct : (p.pct ? parseFloat(String(p.pct)) : undefined);
        const hasPct = pctVal !== undefined && !Number.isNaN(pctVal);
        const pctPleno = totalSeats > 0 ? ((concejales / totalSeats) * 100) : 0;
        const barWidth = hasPct ? pctVal : pctPleno;

        return (
            <View key={p.siglas} style={styles.gobPartyItem} wrap={false}>
                <View style={styles.gobPartyRow}>
                    <View style={styles.gobPartyLeft}>
                        <View style={[styles.gobPartyDot, { backgroundColor: p.color || colors.green }]} />
                        <Text style={styles.gobPartyName}>{p.siglas}</Text>
                        {isMayor && (
                            <Text style={styles.gobPartyTag}>{isAlcaldiaSet ? "Alcaldía" : "1ª fuerza"}</Text>
                        )}
                    </View>
                    <View style={styles.gobPartyRight}>
                        <Text style={styles.gobPartySeats}>
                            {concejales} {concejales === 1 ? "concejal" : "concejales"}
                        </Text>
                        <Text style={styles.gobPartyPct}>
                            {hasPct ? `${pctVal.toFixed(1)}% votos` : "—"}
                        </Text>
                        <Text style={[styles.gobPartyPct, { width: 48 }]}>
                            {totalSeats > 0 ? `${pctPleno.toFixed(0)}% pleno` : "—"}
                        </Text>
                    </View>
                </View>
                <View style={styles.gobPartyBarBg}>
                    <View style={[styles.gobPartyBarFill, { width: `${Math.min(100, Math.max(0, barWidth))}%`, backgroundColor: p.color || colors.green }]} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.gobPartiesContainer} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, paddingBottom: 4, borderBottomColor: `${colors.green}20`, borderBottomWidth: 0.8 }}>
                <Text style={styles.gobEyebrow}>Grupos políticos con representación</Text>
                <Text style={{ color: colors.muted, fontSize: 6.5 }}>{partidos.length} formaciones</Text>
            </View>
            {isGrid ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>{col1.map(renderPartyItem)}</View>
                    <View style={{ flex: 1 }}>{col2.map(renderPartyItem)}</View>
                </View>
            ) : (
                <View>{partidos.map(renderPartyItem)}</View>
            )}
        </View>
    );
}

function GobiernoPageReport({ elecciones }: { elecciones: EleccionesData }) {
    const partidos = getSortedPartidos(elecciones);
    const totalSeats = (elecciones.concejales_totales && elecciones.concejales_totales > 0)
        ? elecciones.concejales_totales
        : (partidos.reduce((acc, p) => acc + (p.concejales || 0), 0) || 0);
    const majorityThreshold = totalSeats > 0 ? Math.floor(totalSeats / 2) + 1 : 0;
    const seats = computeHemicicloSeats(totalSeats, partidos);

    const { alcaldia, gobierno, legislatura = "2023-2027" } = elecciones;
    const leadPartySiglas = alcaldia?.partido || partidos[0]?.siglas;
    const leadParty = leadPartySiglas
        ? partidos.find((p) => p.siglas.toUpperCase() === leadPartySiglas.toUpperCase())
        : partidos[0];
    const leadPartyColor = leadParty?.color || colors.green;
    const leadSeats = leadParty?.concejales || 0;
    const isAbsoluteMajority = gobierno?.mayoria_absoluta ?? (totalSeats > 0 && leadSeats >= majorityThreshold);

    return (
        <Page size="A4" style={styles.page}>
            <ReportFooter />
            <View style={styles.section}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomColor: `${colors.green}44`, borderBottomWidth: 1, marginBottom: 12, paddingBottom: 7 }}>
                    <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
                        Equipo de gobierno
                    </Text>
                    {legislatura && (
                        <Text style={{ color: `${colors.green}99`, fontFamily: "Helvetica-Bold", fontSize: 7.5, textTransform: "uppercase" }}>
                            Mandato {legislatura}
                        </Text>
                    )}
                </View>
                <Text style={styles.intro}>
                    Composición de la corporación municipal y gobernabilidad resultante de los comicios locales.
                </Text>

                <View style={styles.gobTopRow} wrap={false}>
                    <AlcaldiaCardReport
                        alcaldia={alcaldia}
                        gobierno={gobierno}
                        leadPartySiglas={leadPartySiglas}
                        leadPartyColor={leadPartyColor}
                        leadSeats={leadSeats}
                        totalSeats={totalSeats}
                        isAbsoluteMajority={isAbsoluteMajority}
                    />
                    <HemicicloReport
                        totalSeats={totalSeats}
                        majorityThreshold={majorityThreshold}
                        seats={seats}
                    />
                </View>

                {partidos.length > 0 && (
                    <PartidosListReport
                        partidos={partidos}
                        leadPartySiglas={leadPartySiglas}
                        isAlcaldiaSet={Boolean(alcaldia?.partido)}
                        totalSeats={totalSeats}
                    />
                )}

                <Text style={[styles.note, { marginTop: 10 }]}>
                    Fuente: Ministerio del Interior (Elecciones Municipales {elecciones.anio || 2023})
                </Text>
            </View>
        </Page>
    );
}

function SummaryPageReport({ data, wikiData }: { data: MunicipioData; wikiData?: WikipediaData | null }) {
    const hasWikiText = Boolean(wikiData?.paragraphs?.length);
    const images = wikiData?.images || [];

    return (
        <Page size="A4" style={styles.page}>
            <ReportFooter />
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conoce el lugar</Text>
                {hasWikiText ? (
                    <View wrap={false}>
                        {wikiData!.paragraphs!.slice(0, 3).map((p) => (
                            <Text key={p.slice(0, 40)} style={[styles.intro, { marginBottom: 8 }]}>{p}</Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.intro}>
                        {data.municipio} es un municipio de {data.provincia} (Castilla y León), con {formatNumber(data.poblacion)} habitantes censados.
                    </Text>
                )}
                {images.length === 1 && (
                    <View style={styles.summaryImageCard} wrap={false}>
                        <Image src={images[0].url} style={styles.summaryImage} alt="" />
                        {images[0].description && <Text style={styles.summaryImageCaption}>{images[0].description}</Text>}
                    </View>
                )}
                {images.length > 1 && (
                    <View style={styles.summaryImagesRow} wrap={false}>
                        {images.slice(0, 2).map((img) => (
                            <View key={img.url} style={styles.summaryImageCol}>
                                <Image src={img.url} style={styles.summaryImageHalf} alt="" />
                                {img.description && <Text style={styles.summaryImageCaption}>{shorten(img.description, 50)}</Text>}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </Page>
    );
}

function ChartsPageReport({ chartRows }: { chartRows: any[][] }) {
    return (
        <Page size="A4" style={styles.page}>
            <ReportFooter />
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos estadísticos</Text>
                <Text style={styles.intro}>Series y distribuciones oficiales del INE y del Ministerio de Vivienda con su último valor disponible.</Text>
                <View style={styles.chartsContainer}>
                    {chartRows.map((row, rIdx) => (
                        <View key={rIdx} style={[styles.chartRow, rIdx > 0 ? { marginTop: -1 } : {}]} wrap={false}>
                            {row.map((item, cIdx) => (
                                item.type === "ine" ? (
                                    <IneChart key={getTableKey(item.table)} table={item.table} data={item.data} fullWidth={row.length === 1} borderRight={row.length > 1 && cIdx === 0} />
                                ) : (
                                    <AlquilerChart key="alquiler" vivienda={item.vivienda} fullWidth={row.length === 1} borderRight={row.length > 1 && cIdx === 0} />
                                )
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    );
}

function MunicipioReport({ data, scores, ineData, preferences, wikiData }: { data: MunicipioData; scores: ScoreResult; ineData: IneData; preferences: Record<string, any>; isDefault: boolean; wikiData?: WikipediaData | null }) {
    const elecciones: EleccionesData | undefined = data.mas?.elecciones;
    const hasElecciones = Boolean(elecciones && (elecciones.alcaldia || (elecciones.partidos && elecciones.partidos.length > 0)));
    const departments = Object.entries(scores.departments);
    const visibleTables = ineData ? TABLES.filter((t) => filterData(ineData[getTableKey(t)] ?? [], t.filter).length > 0) : [];
    const showAlquiler = Boolean(data.mas?.vivienda?.alquiler?.precio || data.mas?.vivienda?.alquiler?.serie?.length);

    const chartItems = [
        ...visibleTables.map((t) => ({ type: "ine" as const, table: t, data: ineData?.[getTableKey(t)] ?? [] })),
        ...(showAlquiler ? [{ type: "alquiler" as const, vivienda: data.mas.vivienda }] : []),
    ];

    const chartRows: (typeof chartItems)[] = [];
    for (let i = 0; i < chartItems.length; i += 2) {
        chartRows.push(i === chartItems.length - 1 ? [chartItems[i]] : [chartItems[i], chartItems[i + 1]]);
    }

    return (
        <Document title={`Informe de ${data.municipio}`} author="¿Me puedo quedar?" subject="Análisis territorial del municipio">
            <Page size="A4" style={styles.cover}>
                <ImageBackground src="/images/report-cover.png" style={styles.coverImage}>
                    <View style={styles.coverMunicipality}>
                        <Text style={styles.coverMunicipalityName}>{data.municipio}</Text>
                        <Text style={styles.coverMunicipalitySubtitle}>mepuedoquedar.es</Text>
                    </View>
                </ImageBackground>
            </Page>

            <SummaryPageReport data={data} wikiData={wikiData} />

            <Page size="A4" style={styles.page}>
                <ReportFooter />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Puntuación</Text>
                    <View style={styles.globalScoreBlock} wrap={false}>
                        <View style={styles.globalScoreHeader}>
                            <View>
                                <Text style={styles.globalEyebrow}>¿Encaja contigo?</Text>
                                <View style={styles.globalScoreRow}>
                                    <Text style={styles.globalScoreNumber}>{scores.global}</Text>
                                    <Text style={styles.globalScoreMax}>/ 100</Text>
                                </View>
                                <View style={styles.globalBar}>
                                    <View style={[styles.globalBarFill, { width: `${Math.min(100, Math.max(0, scores.global))}%` }]} />
                                </View>
                            </View>
                            <Text style={styles.globalLabel}>{getGlobalLabel(scores.global)}</Text>
                        </View>
                        <View style={styles.profileBox}>
                            <Text style={styles.profileLine}>
                                <Text style={styles.profilePrefix}>Perfil  ·  </Text>
                                {getProfilePills(preferences).join("  ·  ")}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Puntuación por áreas</Text>
                    {departments.map(([name, dept]) => {
                        const pct = dept.maxScore ? Math.round((dept.score / dept.maxScore) * 100) : 0;
                        return (
                            <View key={name} style={styles.department} wrap={false}>
                                <View style={styles.departmentHeader}>
                                    <Text style={styles.departmentName}>{name === "ine" ? "Indicadores INE" : capitalize(name)}</Text>
                                    <Text style={styles.departmentScore}>{pct}/100</Text>
                                </View>
                                <View style={styles.bar}>
                                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                                </View>
                                {dept.noData ? (
                                    <Text style={styles.note}>Sin registros oficiales suficientes en el término municipal.</Text>
                                ) : (
                                    dept.indicators.map((ind) => (
                                        <View key={ind.label} style={styles.indicator}>
                                            <Text style={styles.indicatorLabel}>{ind.label}</Text>
                                            <Text style={styles.indicatorValue}>{formatIndicatorValue(ind)}</Text>
                                            <Text style={styles.indicatorScore}>+{ind.score}/{ind.max}</Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        );
                    })}
                </View>
            </Page>

            {chartRows.length > 0 && <ChartsPageReport chartRows={chartRows} />}

            {hasElecciones && <GobiernoPageReport elecciones={elecciones!} />}

            <Page size="A4" style={styles.page}>
                <ReportFooter />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Metodología y fuentes</Text>
                    <Text style={styles.intro}>¿Me puedo quedar? evalúa y compara de forma objetiva la calidad de vida y servicios en los 2.248 municipios de Castilla y León en un índice transparente de 0 a 100%.</Text>
                    <Text style={styles.methodologySectionTitle}>1. Sistema de puntuación y normalización</Text>
                    <View style={styles.sourceGrid} wrap={false}>
                        {[
                            { tag: "A. Normalización", title: "Escala 0 a 100", desc: "Conversión de servicios mediante funciones matemáticas:", formulas: ["Umbral: V ≥ Mín ? 100 : 0", "Log: min(100, ln(V)/ln(Opt)×100)", "Interp: (V-Min)/(Opt-Min)×100"] },
                            { tag: "B. Equidad rural", title: "Factor corrector", desc: "Evita penalizar a pueblos pequeños:", formulas: ["Factor = 0.10 + 0.90 × min(1, Pob/5.000)"], extra: "<100 hab: penaliza 10%. >5.000: 100%." },
                            { tag: "C. Personalización", title: "Puntuación global", desc: "Media ponderada según prioridades ciudadanas:", formulas: ["Global = [Σ(Score_k × Peso_k × Fac_k)", "         / Σ(Peso_k × Fac_k)] × 100"] },
                        ].map((card) => (
                            <View key={card.tag} style={styles.sourceItem}>
                                <View style={styles.sourceCard}>
                                    <Text style={styles.sourceTag}>{card.tag}</Text>
                                    <Text style={styles.sourceTitle}>{card.title}</Text>
                                    <Text style={styles.sourceDesc}>{card.desc}</Text>
                                    <View style={styles.formulaBox}>
                                        {card.formulas.map((f) => <Text key={f} style={styles.formulaText}>{f}</Text>)}
                                    </View>
                                    {card.extra && <Text style={[styles.sourceDesc, { marginTop: 3 }]}>{card.extra}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.methodologySectionTitle}>2. Fuentes de información pública</Text>
                    <View style={styles.sourceGrid} wrap={false}>
                        {[
                            { tag: "Junta de Castilla y León", title: "Datos Abiertos", desc: "Datos actualizados sobre sanidad, colegios, empleo, comercio, seguridad, etc." },
                            { tag: "Estadísticas", title: "INE", desc: "Series históricas sobre empresas, ocupación y población mediante API oficial." },
                            { tag: "Datos extra", title: "Otras fuentes", desc: "Precios de referencia de alquiler (MIVAU) y medios de comunicación locales." },
                        ].map((source) => (
                            <View key={source.tag} style={styles.sourceItem}>
                                <View style={styles.sourceCard}>
                                    <Text style={styles.sourceTag}>{source.tag}</Text>
                                    <Text style={styles.sourceTitle}>{source.title}</Text>
                                    <Text style={styles.sourceDesc}>{source.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.legalBox} wrap={false}>
                        <Text style={styles.legalText}>
                            ¿Me puedo quedar? (mepuedoquedar.es) es un proyecto de código abierto bajo la Ley 37/2007 de reutilización de información del sector público. Las puntuaciones son modelos cuantitativos orientativos de análisis ciudadano.
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

const slugify = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function DownloadReport({ data, scores, ineData, preferences, isDefault, wikiData }: { data: MunicipioData; scores: ScoreResult; ineData: IneData; preferences: Record<string, any>; isDefault: boolean; wikiData?: WikipediaData | null }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const ReactPDF = await import("@react-pdf/renderer");
            Document = ReactPDF.Document;
            Page = ReactPDF.Page;
            Text = ReactPDF.Text;
            View = ReactPDF.View;
            Image = ReactPDF.Image;
            ImageBackground = ReactPDF.ImageBackground;
            Svg = ReactPDF.Svg;
            G = ReactPDF.G;
            Line = ReactPDF.Line;
            Circle = ReactPDF.Circle;
            Rect = ReactPDF.Rect;
            Path = ReactPDF.Path;

            const doc = <MunicipioReport data={data} scores={scores} ineData={ineData} preferences={preferences} isDefault={isDefault} wikiData={wikiData} />;
            const blob = await ReactPDF.pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `me-puedo-quedar-en-${slugify(data.municipio)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="fixed bottom-5 right-5 z-50 inline-flex min-h-11 items-center gap-2 bg-text-2 px-4 py-3 text-sm font-semibold text-text-3 shadow-lg shadow-title/20 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-title sm:bottom-7 sm:right-7 disabled:opacity-50"
        >
            {loading ? <VscLoading className="animate-spin" aria-hidden="true" /> : <FaFileArrowDown aria-hidden="true" />}
            {loading ? "Generando informe..." : "Descargar informe"}
        </button>
    );
}
