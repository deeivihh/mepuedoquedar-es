"use client";

import { useMemo, useState } from "react";
import { defineChart, lineY, barY, areaY, dot } from "@tanstack/charts";
import { scalePoint } from "@tanstack/charts/scales/point";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { polar, pie, radialArc } from "@tanstack/charts/polar";
import { Chart } from "@tanstack/charts/react/tooltip";
import { tooltip } from "@tanstack/charts/tooltip";
import { ChartType, CHART_PALETTE, formatSeriesName, getPeriod } from "@/lib/config/tables";
import { IoTimeSharp } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";

export interface BaseChartProps {
    type?: ChartType;
    data: any;
    title?: string;
    height?: number;
    formatName?: (name: string) => string;
}

const getVal = (v: any) => (typeof v === "number" ? v : Number(v) || 0);

function parseChartData(type: ChartType, data: any, title?: string, formatName?: (name: string) => string) {
    const isPolar = type === "pie" || type === "donut";
    const isCategorical = isPolar || type === "column";
    const isSeriesArray = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.Data);

    if (!Array.isArray(data) || !data.length) {
        return { flatData: [], pieData: [], latestYear: "", isPolar, isCategorical, isSeriesArray };
    }

    const getName = (raw: string) => (formatName ? formatName(raw) : formatSeriesName(raw)) || "Dato";

    if (isCategorical) {
        const raw = isSeriesArray
            ? data.map((s: any) => ({ label: getName(s.Nombre), value: getVal(s.Data?.[0]?.Valor) }))
            : data.map((d: any) => ({ label: getName(String(d.Nombre ?? getPeriod(d) ?? "Dato")), value: getVal(d.Valor) }));

        const filtered = isPolar ? raw.filter((d: any) => !isNaN(d.value) && d.value > 0) : raw.filter((d: any) => !isNaN(d.value));
        const latest = isSeriesArray ? getPeriod(data[0]?.Data?.[0]) : getPeriod(data[0]);
        return { flatData: [], pieData: filtered, latestYear: latest, isPolar, isCategorical, isSeriesArray };
    }

    if (isSeriesArray) {
        const flatData = data.flatMap((s: any) => {
            const sName = getName(s.Nombre);
            const seriesData = s.Data || [];
            return seriesData.map((_: any, i: number) => {
                const item = seriesData[seriesData.length - 1 - i];
                return { period: getPeriod(item), value: getVal(item.Valor), series: sName };
            });
        });
        return { flatData, pieData: [], latestYear: getPeriod(data[0]?.Data?.[0]), isPolar, isCategorical, isSeriesArray };
    }

    const res = data.map((_: any, i: number) => {
        const item = data[data.length - 1 - i];
        return { period: getPeriod(item), value: getVal(item.Valor), series: title || "Valor" };
    });
    return { flatData: res, pieData: [], latestYear: getPeriod(data[0]), isPolar, isCategorical, isSeriesArray };
}

function createPolarDefinition(type: ChartType, pieData: any[]) {
    if (!pieData.length) return null;
    return defineChart({
        marks: [
            polar({
                inset: 8,
                radiusRatio: 0.88,
                marks: [
                    radialArc(pie(pieData, { value: (d: any) => d.value }), {
                        innerRadius: type === "donut" ? ({ radius }) => radius * 0.58 : 0,
                        cornerRadius: 0,
                        color: (d: any) => d.label,
                        key: (d: any) => d.label,
                    }),
                ],
            }),
        ],
        color: { range: CHART_PALETTE },
        tooltip: { use: tooltip, anchor: "pointer" },
    });
}

function createColumnDefinition(pieData: any[]) {
    if (!pieData.length) return null;
    return defineChart({
        marks: [barY(pieData, { x: (d: any) => d.label, y: (d: any) => d.value, color: (d: any) => d.label })],
        x: { scale: scaleBand, grid: false },
        y: { scale: scaleLinear, grid: true, nice: true },
        color: { range: CHART_PALETTE },
        tooltip: { use: tooltip, anchor: "pointer" },
    });
}

function createCartesianDefinition(type: ChartType, flatData: any[], isSingle: boolean) {
    if (!flatData.length) return null;
    const color = isSingle ? "#C46A4A" : undefined;
    const seriesColor = isSingle ? undefined : (d: any) => d.series;
    const marks: any[] = [];

    if (type === "line") {
        marks.push(
            lineY(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, stroke: color, color: seriesColor, strokeWidth: 2.5 }),
            dot(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, fill: color, color: seriesColor, stroke: "#f4ebe2", strokeWidth: 1.5, r: 4 })
        );
    } else if (type === "bar") {
        marks.push(barY(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, fill: color, color: seriesColor }));
    } else if (type === "area") {
        marks.push(
            areaY(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, fill: color, color: seriesColor, fillOpacity: 0.25 }),
            lineY(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, stroke: color, color: seriesColor, strokeWidth: 2 })
        );
    }

    return defineChart({
        marks,
        x: { scale: type === "bar" ? scaleBand : scalePoint, grid: false },
        y: { scale: scaleLinear, grid: true, nice: true },
        color: { range: CHART_PALETTE },
        tooltip: { use: tooltip, anchor: "pointer" },
    });
}

export default function BaseChart({ type = "line", data, title, height = 260, formatName }: BaseChartProps) {
    const [showLegend, setShowLegend] = useState(false);
    const chartData = useMemo(() => parseChartData(type, data, title, formatName), [type, data, title, formatName]);

    const definition = useMemo(() => {
        if (chartData.isPolar) return createPolarDefinition(type, chartData.pieData);
        if (type === "column") return createColumnDefinition(chartData.pieData);
        return createCartesianDefinition(type, chartData.flatData, !chartData.isSeriesArray || data.length === 1);
    }, [type, chartData, data]);

    const legends = useMemo(() => {
        if (chartData.isCategorical) {
            const total = chartData.pieData.reduce((acc: number, item: any) => acc + item.value, 0);
            return chartData.pieData.map((d: any) => ({
                label: d.label,
                extra: d.value.toLocaleString("es-ES"),
                percentage: total > 0 ? `${((d.value / total) * 100).toFixed(0)}%` : undefined,
            }));
        }
        if (chartData.isSeriesArray && data.length > 1) {
            return data.map((s: any, idx: number) => ({
                label: (formatName ? formatName(s.Nombre) : formatSeriesName(s.Nombre)) || `Serie ${idx + 1}`,
            }));
        }
        return null;
    }, [chartData, data, formatName]);

    if (!definition) return null;
    const hasLegends = Boolean(legends && legends.length > 0);

    return (
        <div className="flex flex-col gap-3 w-full text-title relative">
            <div className="flex justify-between w-full items-center">
                {title && <h3 className="font-semibold text-title text-sm md:text-base">{title}</h3>}
                <div className="flex items-center gap-2">
                    {hasLegends && (
                        <button
                            type="button"
                            onClick={() => setShowLegend((prev) => !prev)}
                            className={`flex items-center transition-colors cursor-pointer p-1 ${showLegend ? "text-title bg-title/10" : "text-title/60 hover:text-title hover:bg-title/5"}`}
                            title={showLegend ? "Ocultar leyenda" : "Mostrar leyenda"}
                            aria-label={showLegend ? "Ocultar leyenda" : "Mostrar leyenda"}
                        >
                            <FaListUl size={12} />
                        </button>
                    )}
                    {chartData.latestYear && (
                        <h4 title={`Última actualización: ${chartData.latestYear}`} className="flex gap-1 items-center justify-center font-semibold text-title/70 text-xs">
                            <IoTimeSharp size={13} />
                            {chartData.latestYear}
                        </h4>
                    )}
                </div>
            </div>

            <div className="w-full relative">
                <Chart
                    ariaLabel={title || "Gráfico"}
                    definition={definition}
                    height={height}
                    className="w-full"
                    renderTooltipBody={({ points }) => {
                        if (!points?.length) return null;
                        if (chartData.isPolar) {
                            return (
                                <div className="flex flex-col gap-1 text-xs">
                                    {points.map((p) => {
                                        const d = (p.datum || {}) as any;
                                        const label = d.label ?? d.data?.label ?? d.key ?? "";
                                        const val = typeof d.value === "number" ? d.value : d.data?.value ?? p.yValue ?? 0;
                                        const frac = typeof d.fraction === "number" ? d.fraction : d.data?.fraction;
                                        return (
                                            <div key={label} className="flex items-center gap-2">
                                                {label && <span className="text-title/80 font-medium">{label}:</span>}
                                                <span className="font-bold text-title tabular-nums">{val.toLocaleString("es-ES")}</span>
                                                {frac !== undefined && (
                                                    <span className="text-title/60 tabular-nums">
                                                        ({(frac * 100).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%)
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }
                        return (
                            <div className="flex items-center gap-1.5 text-xs">
                                {points[0].xValue !== undefined && <span className="text-title/80">{String(points[0].xValue)}:</span>}
                                {points.map((p) => {
                                    const val = typeof p.yValue === "number" ? p.yValue : (p.datum as any)?.value ?? 0;
                                    const pointKey = p.key ?? `${(p as any).series ?? (p.datum as any)?.label ?? "val"}-${p.xValue}`;
                                    return (
                                        <span key={pointKey} className="font-bold text-title tabular-nums">
                                            {typeof val === "number" ? val.toLocaleString("es-ES") : String(val)}
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    }}
                />
            </div>

            {hasLegends && showLegend && legends && (
                <div className={`flex ${legends.length > 2 ? "flex-col sm:grid sm:grid-cols-2" : "flex-wrap items-center justify-center"} gap-x-4 gap-y-1.5 pt-2 border-t border-title/10 w-full text-xs`}>
                    {legends.map((item: any, idx: number) => (
                        <div key={item.label} className="flex items-center justify-between gap-2 py-0.5 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 shrink-0 border border-title/20" style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }} />
                                <span className="font-medium text-title/85 text-[11px] sm:text-xs truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {item.percentage && <span className="text-title/40 font-mono text-[10px]">{item.percentage}</span>}
                                {item.extra && <span className="text-title/70 font-mono font-semibold text-[11px] tabular-nums">({item.extra})</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
