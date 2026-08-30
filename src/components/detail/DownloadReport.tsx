"use client";

import { PDFDownloadLink, Document, Page, StyleSheet, Text, View, ImageBackground, Svg, G, Line, Circle, Rect, Path } from "@react-pdf/renderer";
import { FaFileArrowDown } from "react-icons/fa6";
import type { DepartmentScore, ScoreResult } from "@/lib/scores/calculateScores";
import { formatIndicatorValue } from "@/lib/scores/departmentPriority";
import { TABLES, getTableKey, type TableConfig } from "@/lib/config/tables";

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

const chartColors = ["#C46A4A", "#1F3A2E", "#6B7F4D", "#C28B38", "#3D6053", "#D48B6E", "#4E6E7E", "#944C36", "#8EA675", "#9E7B56", "#825366", "#284B3D"];

const styles = StyleSheet.create({
    page: {
        backgroundColor: colors.beige,
        color: colors.ink,
        fontFamily: "Helvetica",
        fontSize: 9,
        paddingTop: 54,
        paddingHorizontal: 48,
        paddingBottom: 44,
    },
    cover: {
        backgroundColor: colors.beige,
    },
    coverImage: {
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        objectFit: "cover",
        width: "100%",
    },
    coverMunicipality: {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginHorizontal: 58,
        marginTop: -12,
    },
    coverMunicipalityName: {
        color: colors.terracotta,
        fontFamily: "Times-Bold",
        fontSize: 64,
        lineHeight: 1.05,
        textAlign: "center",
    },
    coverMunicipalitySubtitle: {
        color: colors.title,
        fontFamily: "Times-BoldItalic",
        fontSize: 15,
        lineHeight: 1.2,
        textAlign: "center",
        marginTop: 20,
    },
    header: {
        alignItems: "center",
        borderBottomColor: `${colors.green}33`,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 10,
        position: "absolute",
        top: 28,
        left: 48,
        right: 48,
    },
    headerBrand: {
        color: colors.green,
        fontFamily: "Times-Bold",
        fontSize: 11,
    },
    headerTitle: {
        color: colors.muted,
        fontSize: 7,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    footer: {
        bottom: 20,
        left: 48,
        position: "absolute",
        right: 48,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerLeft: {
        color: colors.muted,
        fontSize: 7,
        flex: 1,
        textAlign: "left",
    },
    footerCenter: {
        color: colors.muted,
        fontSize: 7,
        flex: 1,
        textAlign: "center",
    },
    footerRight: {
        color: colors.muted,
        fontSize: 7,
        flex: 1,
        textAlign: "right",
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        borderBottomColor: `${colors.green}44`,
        borderBottomWidth: 1,
        color: colors.green,
        fontFamily: "Times-Bold",
        fontSize: 22,
        marginBottom: 12,
        paddingBottom: 7,
    },
    intro: {
        color: colors.muted,
        fontSize: 10,
        lineHeight: 1.5,
        marginBottom: 16,
    },
    facts: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 22,
    },
    fact: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: `${colors.green}15`,
        flexGrow: 1,
        padding: 11,
    },
    factLabel: {
        color: colors.muted,
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    factValue: {
        color: colors.green,
        fontFamily: "Times-Bold",
        fontSize: 17,
        marginTop: 4,
    },
    globalScoreBlock: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: `${colors.green}22`,
        padding: 16,
        marginBottom: 18,
    },
    globalScoreHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
    },
    globalEyebrow: {
        color: `${colors.green}88`,
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    globalScoreRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
        marginTop: 4,
    },
    globalScoreNumber: {
        color: colors.green,
        fontFamily: "Times-Bold",
        fontSize: 42,
        lineHeight: 1,
    },
    globalScoreMax: {
        color: `${colors.green}66`,
        fontFamily: "Helvetica-Bold",
        fontSize: 10,
    },
    globalBar: {
        backgroundColor: `${colors.green}18`,
        height: 4,
        marginTop: 8,
        width: 160,
    },
    globalBarFill: {
        backgroundColor: colors.terracotta,
        height: 4,
    },
    globalLabel: {
        color: colors.green,
        fontFamily: "Times-Bold",
        fontSize: 13,
        lineHeight: 1.25,
        textAlign: "right",
        flex: 1,
        paddingLeft: 12,
    },
    profileBox: {
        borderTopColor: `${colors.green}12`,
        borderTopWidth: 1,
        marginTop: 12,
        paddingTop: 7,
    },
    profileLine: {
        color: `${colors.green}88`,
        fontFamily: "Helvetica",
        fontSize: 7,
        letterSpacing: 0.15,
        lineHeight: 1.45,
    },
    profilePrefix: {
        color: `${colors.green}55`,
        fontFamily: "Helvetica-Bold",
        fontSize: 6.5,
        letterSpacing: 0.9,
        textTransform: "uppercase",
    },
    profileDot: {
        color: `${colors.green}35`,
        fontFamily: "Helvetica",
        fontSize: 7,
    },
    department: {
        borderBottomColor: `${colors.green}22`,
        borderBottomWidth: 1,
        marginBottom: 10,
        paddingBottom: 10,
    },
    departmentHeader: {
        alignItems: "baseline",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    departmentName: {
        color: colors.green,
        fontFamily: "Times-Bold",
        fontSize: 13,
        textTransform: "capitalize",
    },
    departmentScore: {
        color: colors.terracotta,
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
    },
    bar: {
        backgroundColor: `${colors.green}18`,
        height: 4,
        marginBottom: 7,
        width: "100%",
    },
    barFill: {
        backgroundColor: colors.terracotta,
        height: 4,
    },
    indicator: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 3,
    },
    indicatorLabel: {
        color: colors.ink,
        paddingRight: 14,
        width: "58%",
    },
    indicatorValue: {
        color: colors.muted,
        textAlign: "right",
        width: "28%",
    },
    indicatorScore: {
        color: colors.terracotta,
        fontFamily: "Helvetica-Bold",
        textAlign: "right",
        width: "14%",
    },
    chartsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -6,
    },
    chartGroup: {
        borderBottomColor: `${colors.green}22`,
        borderBottomWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 6,
        paddingBottom: 13,
        width: "50%",
    },
    chartGroupFull: {
        width: "100%",
    },
    chartTitle: {
        color: colors.green,
        fontFamily: "Times-Bold",
        fontSize: 13,
        marginBottom: 2,
    },
    chartDate: {
        color: colors.muted,
        fontSize: 7,
        marginBottom: 8,
    },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 7,
    },
    legendItem: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 4,
        paddingRight: 8,
        width: "50%",
    },
    legendMarker: {
        height: 6,
        marginRight: 4,
        width: 6,
    },
    legendLabel: {
        color: colors.ink,
        fontSize: 7,
        paddingRight: 4,
        width: "76%",
    },
    legendValue: {
        color: colors.muted,
        fontSize: 7,
        textAlign: "right",
        width: "24%",
    },
    note: {
        color: colors.muted,
        fontSize: 7.5,
        lineHeight: 1.45,
    },
});

function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatNumber(value: unknown) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("es-ES") : "Sin datos";
}

function formatCompactNumber(value: number) {
    return new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatDate() {
    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date());
}

function scorePercentage(department: DepartmentScore) {
    if (!department.maxScore) return 0;
    return Math.round((department.score / department.maxScore) * 100);
}

function getProfilePills(preferences: Record<string, any>): { label: string; active: boolean }[] {
    const age = Number(preferences.age ?? 35);
    const ageLabel = age < 30 ? "Joven" : age < 45 ? "Adulto/a joven" : age < 60 ? "Adulto/a" : "Mayor";
    return [
        { label: `${age} años · ${ageLabel}`, active: true },
        { label: preferences.hasCar ? "Con coche" : "Sin coche", active: true },
        { label: "Con hijos", active: !!preferences.hasSchoolChildren },
        { label: "Busca empleo", active: !!preferences.lookingForWork },
        { label: "Teletrabaja", active: !!preferences.remotework },
        { label: "Jubilado/a", active: !!preferences.isRetired },
        { label: "Con mascota", active: !!preferences.hasPet },
    ];
}

function getValue(value: unknown) {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : 0;
}

function getPeriod(value: any) {
    return String(value?.Anyo ?? value?.T3_Periodo ?? value?.Periodo ?? value?.Fecha ?? value?.period ?? "");
}

function formatSeriesName(name?: string) {
    if (!name) return "";
    const ignored = new Set(["dato base", "personas", "todas las edades"]);
    const parts = name.split(".").map((part) => part.trim()).filter(Boolean);
    if (parts.length <= 1) return name.trim();
    const segments = parts.slice(1).filter((part) => !ignored.has(part.toLowerCase()));
    const nonTotal = segments.filter((part) => part.toLowerCase() !== "total");
    return (nonTotal.length ? nonTotal : segments).join(" - ") || name.trim();
}

function filterData(data: any[], filter?: TableConfig["filter"]) {
    if (!filter || !Array.isArray(data)) return data;
    if (typeof filter === "function") return data.filter(filter);
    if (typeof filter === "string") {
        const query = filter.toLowerCase();
        return data.filter((item) => item.Nombre?.toLowerCase().includes(query) || item.COD?.toLowerCase().includes(query));
    }
    if (typeof filter[0] === "number") return (filter as number[]).map((index) => data[index]).filter(Boolean);
    return data.filter((item) => {
        const name = (item.Nombre || "").toLowerCase();
        const code = (item.COD || "").toLowerCase();
        return (filter as (string | string[])[]).some((rule) => Array.isArray(rule)
            ? rule.every((word) => name.includes(word.toLowerCase()) || code.includes(word.toLowerCase()))
            : name.includes(rule.toLowerCase()) || code.includes(rule.toLowerCase())
        );
    });
}

function displayName(table: TableConfig, item: any, fallback: string) {
    const name = String(item?.Nombre ?? item?.COD ?? fallback);
    return (table.formatName?.(name) ?? formatSeriesName(name)) || fallback;
}

function shorten(value: string, max = 18) {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function piePath(index: number, values: number[], innerRadius = 0) {
    const total = values.reduce((sum, value) => sum + value, 0);
    const start = values.slice(0, index).reduce((sum, value) => sum + value, 0) / total * Math.PI * 2 - Math.PI / 2;
    const end = (values.slice(0, index + 1).reduce((sum, value) => sum + value, 0) / total * Math.PI * 2) - Math.PI / 2;
    const outerRadius = 52;
    const center = 65;
    const point = (radius: number, angle: number) => `${center + radius * Math.cos(angle)} ${center + radius * Math.sin(angle)}`;
    const largeArc = end - start > Math.PI ? 1 : 0;
    if (!innerRadius) return `M ${center} ${center} L ${point(outerRadius, start)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${point(outerRadius, end)} Z`;
    return `M ${point(outerRadius, start)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${point(outerRadius, end)} L ${point(innerRadius, end)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${point(innerRadius, start)} Z`;
}

function ChartLegend({ entries }: { entries: { label: string; value: number }[] }) {
    return (
        <View style={styles.legend}>
            {entries.map((entry, index) => (
                <View key={`${entry.label}-${index}`} style={styles.legendItem}>
                    <View style={{ ...styles.legendMarker, backgroundColor: chartColors[index % chartColors.length] }} />
                    <Text style={styles.legendLabel}>{shorten(entry.label, 34)}</Text>
                    <Text style={styles.legendValue}>{formatNumber(entry.value)}</Text>
                </View>
            ))}
        </View>
    );
}

function CategoricalChart({ type, entries, fullWidth }: { type: "pie" | "donut" | "column"; entries: { label: string; value: number }[]; fullWidth?: boolean }) {
    if (type === "pie" || type === "donut") {
        const vbW = fullWidth ? 520 : 130;
        const cx = fullWidth ? vbW / 2 : 65;
        const scale = fullWidth ? 2.1 : 1;
        const rOuter = 52 * scale;
        const rInner = type === "donut" ? (fullWidth ? 62 : 29) : 0;
        const size = fullWidth ? 168 : 142;
        return (
            <View>
                <Svg width="100%" height={size} viewBox={`0 0 ${vbW} 130`}>
                    {entries.map((entry, index) => {
                        const total = entries.reduce((s, v) => s + v.value, 0);
                        const start = entries.slice(0, index).reduce((s, v) => s + v.value, 0) / total * Math.PI * 2 - Math.PI / 2;
                        const end = entries.slice(0, index + 1).reduce((s, v) => s + v.value, 0) / total * Math.PI * 2 - Math.PI / 2;
                        const largeArc = end - start > Math.PI ? 1 : 0;
                        const point = (r: number, a: number) => `${cx + r * Math.cos(a)} ${65 + r * Math.sin(a)}`;
                        const d = !rInner ? `M ${cx} 65 L ${point(rOuter, start)} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${point(rOuter, end)} Z` : `M ${point(rOuter, start)} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${point(rOuter, end)} L ${point(rInner, end)} A ${rInner} ${rInner} 0 ${largeArc} 0 ${point(rInner, start)} Z`;
                        return <Path key={entry.label} d={d} fill={chartColors[index % chartColors.length]} />;
                    })}
                    {type === "donut" && <Circle cx={cx} cy="65" r={rInner ? rInner - 6 : 0} fill={colors.card} />}
                </Svg>
                <ChartLegend entries={entries} />
            </View>
        );
    }

    const maxValue = Math.max(...entries.map((entry) => entry.value), 1);
    const width = 500;
    const barWidth = Math.min(fullWidth ? 68 : 42, (fullWidth ? 460 : 360) / entries.length);
    return (
        <View>
            <Svg width="100%" height={150} viewBox={`0 0 ${width} 150`}>
                <Line x1="36" y1="120" x2="480" y2="120" stroke={`${colors.green}66`} strokeWidth="1" />
                {entries.map((entry, index) => {
                    const height = (entry.value / maxValue) * 95;
                    const x = 52 + index * (390 / entries.length);
                    return (
                        <G key={entry.label}>
                            <Rect x={x} y={120 - height} width={barWidth} height={height} fill={chartColors[index % chartColors.length]} />
                            <Text x={x + barWidth / 2} y="135" fill={colors.muted} style={{ fontSize: 6 }} textAnchor="middle">{index + 1}</Text>
                        </G>
                    );
                })}
                <Text x="30" y="28" fill={colors.muted} style={{ fontSize: 7 }} textAnchor="end">{formatNumber(maxValue)}</Text>
            </Svg>
            <ChartLegend entries={entries} />
        </View>
    );
}

function LineChart({ series, fullWidth }: { series: { label: string; points: { period: string; value: number }[] }[]; fullWidth?: boolean }) {
    const values = series.flatMap((item) => item.points.map((point) => point.value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const longest = Math.max(...series.map((item) => item.points.length));
    const dates = series[0]?.points.map((point) => point.period) ?? [];
    const plot = fullWidth ? { left: 31, right: 468, top: 13, bottom: 94 } : { left: 31, right: 234, top: 13, bottom: 94 };
    const vbW = fullWidth ? 500 : 250;
    const pointPosition = (point: { value: number }, index: number, length: number) => ({
        x: plot.left + (index / Math.max(length - 1, 1)) * (plot.right - plot.left),
        y: plot.bottom - ((point.value - min) / range) * (plot.bottom - plot.top),
    });
    const linePath = (points: { value: number }[]) => points.map((point, index) => {
        const { x, y } = pointPosition(point, index, points.length);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
    const areaPath = (points: { value: number }[]) => {
        const first = pointPosition(points[0], 0, points.length);
        const last = pointPosition(points[points.length - 1], points.length - 1, points.length);
        return `${linePath(points)} L ${last.x} ${plot.bottom} L ${first.x} ${plot.bottom} Z`;
    };
    const legend = series.map((item) => ({ label: item.label, value: item.points[item.points.length - 1]?.value ?? 0 }));
    const ticks = [max, min + range / 2, min];
    const dateIndexes = [0, Math.floor((longest - 1) / 2), longest - 1].filter((index, position, list) => list.indexOf(index) === position);
    return (
        <View>
            <Svg width="100%" height={126} viewBox={`0 0 ${vbW} 126`}>
                {ticks.map((value, index) => {
                    const y = plot.top + index * ((plot.bottom - plot.top) / 2);
                    return (
                        <G key={value}>
                            <Line x1={plot.left} y1={y} x2={plot.right} y2={y} stroke={`${colors.green}20`} strokeWidth="0.8" />
                            <Text x="26" y={y + 2.5} fill={colors.muted} style={{ fontSize: 6 }} textAnchor="end">{formatCompactNumber(value)}</Text>
                        </G>
                    );
                })}
                {series.map((item, index) => (
                    <G key={item.label}>
                        {series.length === 1 && <Path d={areaPath(item.points)} fill={chartColors[index % chartColors.length]} fillOpacity={0.12} />}
                        <Path d={linePath(item.points)} fill="none" stroke={chartColors[index % chartColors.length]} strokeWidth="2.2" />
                        {item.points.map((point, pointIndex) => {
                            const position = pointPosition(point, pointIndex, item.points.length);
                            return <Circle key={`${item.label}-${point.period}`} cx={position.x} cy={position.y} r="2.2" fill={colors.card} stroke={chartColors[index % chartColors.length]} strokeWidth="1.3" />;
                        })}
                    </G>
                ))}
                <Line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} stroke={`${colors.green}55`} strokeWidth="0.8" />
                {dateIndexes.map((index) => (
                    <Text key={index} x={plot.left + (index / Math.max(longest - 1, 1)) * (plot.right - plot.left)} y="109" fill={colors.muted} style={{ fontSize: 6 }} textAnchor="middle">{shorten(dates[index], 10)}</Text>
                ))}
            </Svg>
            <ChartLegend entries={legend} />
        </View>
    );
}

function hasChartData(table: TableConfig, data: any[]): boolean {
    const filtered = filterData(data, table.filter);
    if (!filtered.length) return false;
    const isCategorical = table.type === "pie" || table.type === "donut" || table.type === "column";
    if (isCategorical) {
        const entries = filtered.reduce<{ label: string; value: number }[]>((acc, item, index) => {
            const entry = { label: displayName(table, item, `Dato ${index + 1}`), value: getValue(Array.isArray(item?.Data) ? item.Data[0]?.Valor : item?.Valor) };
            if (table.type === "pie" || table.type === "donut" ? entry.value > 0 : Number.isFinite(entry.value)) {
                acc.push(entry);
            }
            return acc;
        }, []);
        return entries.length > 0;
    }
    const isSeriesArray = Array.isArray(filtered) && filtered.some((item) => Array.isArray(item?.Data));
    const series = isSeriesArray
        ? filtered.reduce<{ label: string; points: { period: string; value: number }[] }[]>((acc, item, index) => {
            const points = [...item.Data].reverse().map((point) => ({ period: getPeriod(point), value: getValue(point.Valor) }));
            if (points.length) {
                acc.push({ label: displayName(table, item, `Serie ${index + 1}`), points });
            }
            return acc;
        }, [])
        : [{ label: table.title ?? "Valor", points: [...filtered].reverse().map((item) => ({ period: getPeriod(item), value: getValue(item.Valor) })) }];
    return series.length > 0 && series.some((item) => item.points.length > 0);
}

function IneChart({ table, data, fullWidth }: { table: TableConfig; data: any[]; fullWidth?: boolean }) {
    const filtered = filterData(data, table.filter);
    const isCategorical = table.type === "pie" || table.type === "donut" || table.type === "column";
    const isSeriesArray = Array.isArray(filtered) && filtered.some((item) => Array.isArray(item?.Data));
    const latest = isSeriesArray ? getPeriod(filtered[0]?.Data?.[0]) : getPeriod(filtered[0]);

    if (!filtered.length) return null;

    if (isCategorical) {
        const chartType = table.type === "pie" || table.type === "donut" || table.type === "column" ? table.type : "column";
        const entries = filtered.reduce<{ label: string; value: number }[]>((acc, item, index) => {
            const entry = { label: displayName(table, item, `Dato ${index + 1}`), value: getValue(Array.isArray(item?.Data) ? item.Data[0]?.Valor : item?.Valor) };
            if (table.type === "pie" || table.type === "donut" ? entry.value > 0 : Number.isFinite(entry.value)) {
                acc.push(entry);
            }
            return acc;
        }, []);
        if (!entries.length) return null;
        return (
            <View style={[styles.chartGroup, fullWidth ? styles.chartGroupFull : {}]} wrap={false}>
                <Text style={styles.chartTitle}>{table.title ?? "Indicadores INE"}</Text>
                {latest && <Text style={styles.chartDate}>Última actualización: {latest}</Text>}
                <CategoricalChart type={chartType} entries={entries} fullWidth={fullWidth} />
            </View>
        );
    }

    const series = isSeriesArray
        ? filtered.reduce<{ label: string; points: { period: string; value: number }[] }[]>((acc, item, index) => {
            const points = [...item.Data].reverse().map((point) => ({ period: getPeriod(point), value: getValue(point.Valor) }));
            if (points.length) {
                acc.push({ label: displayName(table, item, `Serie ${index + 1}`), points });
            }
            return acc;
        }, [])
        : [{ label: table.title ?? "Valor", points: [...filtered].reverse().map((item) => ({ period: getPeriod(item), value: getValue(item.Valor) })) }];
    if (!series.length || !series.some((item) => item.points.length)) return null;
    return (
        <View style={[styles.chartGroup, fullWidth ? styles.chartGroupFull : {}]} wrap={false}>
            <Text style={styles.chartTitle}>{table.title ?? "Indicadores INE"}</Text>
            {latest && <Text style={styles.chartDate}>Última actualización: {latest}</Text>}
            <LineChart series={series} fullWidth={fullWidth} />
        </View>
    );
}

function ReportFooter() {
    return (
        <View style={styles.footer} fixed>
            <Text style={styles.footerLeft}>mepuedoquedar.es</Text>
            <Text style={styles.footerCenter} render={({ pageNumber, totalPages }) => `${pageNumber} de ${totalPages}`} />
            <Text style={styles.footerRight}>{formatDate()}</Text>
        </View>
    );
}

function MunicipioReport({ data, scores, ineData, preferences, isDefault }: { data: MunicipioData; scores: ScoreResult; ineData: IneData; preferences: Record<string, any>; isDefault: boolean }) {
    const departments = Object.entries(scores.departments);

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

            <Page size="A4" style={styles.page}>
                <ReportFooter />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen</Text>
                    <Text style={styles.intro}>
                        Este informe reúne la información mostrada para {data.municipio} y calcula la afinidad del municipio según los servicios, indicadores territoriales y preferencias seleccionadas.
                    </Text>
                    <View style={styles.facts}>
                        <View style={styles.fact}>
                            <Text style={styles.factLabel}>Población</Text>
                            <Text style={styles.factValue}>{formatNumber(data.poblacion)}</Text>
                        </View>
                        {data.distance > 0 && (
                            <View style={styles.fact}>
                                <Text style={styles.factLabel}>Distancia</Text>
                                <Text style={styles.factValue}>{data.distance >= 1000 ? `${(data.distance / 1000).toFixed(0)} km` : `${data.distance} m`}</Text>
                            </View>
                        )}
                        {data.mas?.vivienda?.alquiler?.precio && (
                            <View style={styles.fact}>
                                <Text style={styles.factLabel}>Alquiler de referencia</Text>
                                <Text style={styles.factValue}>{data.mas.vivienda.alquiler.precio} EUR</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
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
                            <Text style={styles.globalLabel}>{(() => {
                                if (scores.global >= 80) return "¡Es sin duda tu lugar ideal!";
                                if (scores.global >= 65) return "Es un lugar muy recomendable";
                                if (scores.global >= 50) return "Podría ser una buena opción";
                                if (scores.global >= 35) return "Quizás no sea para ti";
                                return "No parece tu lugar ideal";
                            })()}</Text>
                        </View>
                        <View style={styles.profileBox}>
                            <Text style={styles.profileLine}>
                                <Text style={styles.profilePrefix}>Perfil  ·  </Text>
                                {getProfilePills(preferences)
                                    .reduce<string[]>((acc, p) => {
                                        if (p.active) acc.push(p.label);
                                        return acc;
                                    }, [])
                                    .join("  ·  ")}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.sectionTitle}>Puntuación por áreas</Text>
                    {departments.map(([name, department]) => {
                        const percentage = scorePercentage(department);
                        return (
                            <View key={name} style={styles.department} wrap={false}>
                                <View style={styles.departmentHeader}>
                                    <Text style={styles.departmentName}>{name === "ine" ? "Indicadores INE" : capitalize(name)}</Text>
                                    <Text style={styles.departmentScore}>{percentage}/100</Text>
                                </View>
                                <View style={styles.bar}>
                                    <View style={{ ...styles.barFill, width: `${percentage}%` }} />
                                </View>
                                {department.noData ? (
                                    <Text style={styles.note}>Sin registros oficiales suficientes en el término municipal.</Text>
                                ) : (
                                    department.indicators.map((indicator) => (
                                        <View key={indicator.label} style={styles.indicator}>
                                            <Text style={styles.indicatorLabel}>{indicator.label}</Text>
                                            <Text style={styles.indicatorValue}>{formatIndicatorValue(indicator)}</Text>
                                            <Text style={styles.indicatorScore}>+{indicator.score}/{indicator.max}</Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        );
                    })}
                </View>
            </Page>

            {ineData && TABLES.some((table) => ineData[getTableKey(table)]?.length) && (
                <Page size="A4" style={styles.page}>
                    <ReportFooter />
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Datos estadísticos</Text>
                        <Text style={styles.intro}>Series y distribuciones del Instituto Nacional de Estadística. La leyenda identifica cada serie o categoría y muestra su último valor disponible.</Text>
                        <View style={styles.chartsGrid}>
                            {(() => {
                                const visible = TABLES.filter((table) => hasChartData(table, ineData[getTableKey(table)] ?? []));
                                return visible.map((table, index) => {
                                    const isLastOdd = visible.length % 2 === 1 && index === visible.length - 1;
                                    return <IneChart key={getTableKey(table)} table={table} data={ineData[getTableKey(table)] ?? []} fullWidth={isLastOdd} />;
                                });
                            })()}
                        </View>
                    </View>
                </Page>
            )}

            <Page size="A4" style={styles.page}>
                <ReportFooter />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fuentes y alcance</Text>
                    <Text style={styles.intro}>
                        La puntuación combina datos abiertos de la Junta de Castilla y León con estadísticas del Instituto Nacional de Estadística. Los pesos pueden variar si se han definido preferencias personales en la plataforma.
                    </Text>
                    <Text style={styles.note}>
                        Este documento se genera automáticamente y tiene carácter informativo. Las puntuaciones e indicadores son modelos orientativos de análisis ciudadano y no constituyen una recomendación o asesoramiento vinculante.
                    </Text>
                    <Text style={{ ...styles.note, marginTop: 12 }}>
                        ¿Me puedo quedar? es un proyecto independiente y de código abierto. Fuentes: Datos Abiertos de Castilla y León, Instituto Nacional de Estadística y Ministerio de Vivienda cuando hay información de alquiler disponible.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function DownloadReport({ data, scores, ineData, preferences, isDefault }: { data: MunicipioData; scores: ScoreResult; ineData: IneData; preferences: Record<string, any>; isDefault: boolean }) {
    return (
        <PDFDownloadLink
            document={<MunicipioReport data={data} scores={scores} ineData={ineData} preferences={preferences} isDefault={isDefault} />}
            fileName={`me-puedo-quedar-en-${slugify(data.municipio)}.pdf`}
            className="fixed bottom-5 right-5 z-50 inline-flex min-h-11 items-center gap-2 bg-text-2 px-4 py-3 text-sm font-semibold text-text-3 shadow-lg shadow-title/20 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-title sm:bottom-7 sm:right-7"
        >
            {({ loading }) => (
                <>
                    <FaFileArrowDown aria-hidden="true" />
                    {loading ? "Generando informe..." : "Descargar informe"}
                </>
            )}
        </PDFDownloadLink>
    );
}
