"use client";

import { useMemo, useState } from "react";
import { defineChart, lineY, barY, areaY, dot } from "@tanstack/charts";
import { scalePoint } from "@tanstack/charts/scales/point";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { polar, pie, radialArc } from "@tanstack/charts/polar";
import { Chart } from "@tanstack/charts/react/tooltip";
import { tooltip } from "@tanstack/charts/tooltip";
import type { ChartType } from "@/lib/config/tables";
import { IoTimeSharp } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";

export interface BaseChartProps {
    type?: ChartType;
    data: any;
    title?: string;
    height?: number;
    formatName?: (name: string) => string;
}

const BRAND_PALETTE = [
    "#C46A4A",
    "#1F3A2E",
    "#6B7F4D",
    "#C28B38",
    "#3D6053",
    "#D48B6E",
    "#4E6E7E",
    "#944C36",
    "#8EA675",
    "#9E7B56",
    "#825366",
    "#284B3D",
];

const IGNORED_SEGMENTS = new Set(["dato base", "personas", "todas las edades"]);

export function formatSeriesName(name?: string): string {
    if (!name) return "";
    const parts = name.split(".").map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return name.trim();

    const segments = parts.slice(1).filter((p) => !IGNORED_SEGMENTS.has(p.toLowerCase()));
    if (!segments.length) return parts[1] || parts[0] || name;

    const nonTotal = segments.filter((p) => p.toLowerCase() !== "total");
    return (nonTotal.length ? nonTotal : segments).join(" - ");
}

const getPeriod = (d: any) => String(d?.Anyo ?? d?.T3_Periodo ?? d?.Periodo ?? d?.Fecha ?? d?.period ?? "");
const getVal = (v: any) => (typeof v === "number" ? v : Number(v) || 0);

export default function BaseChart({ type = "line", data, title, height = 260, formatName }: BaseChartProps) {
    const [showLegend, setShowLegend] = useState(false);
    const isPolar = type === "pie" || type === "donut";
    const isCategorical = isPolar || type === "column";
    const isSeriesArray = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.Data);

    const { flatData, pieData, latestYear } = useMemo(() => {
        if (!Array.isArray(data) || !data.length) {
            return { flatData: [], pieData: [], latestYear: "" };
        }

        if (isCategorical) {
            const raw = isSeriesArray
                ? data.map((s: any) => ({
                    label: (formatName ? formatName(s.Nombre) : formatSeriesName(s.Nombre)) || "Dato",
                    value: getVal(s.Data?.[0]?.Valor),
                }))
                : data.map((d: any) => ({
                    label: (formatName ? formatName(String(d.Nombre ?? getPeriod(d) ?? "Dato")) : formatSeriesName(String(d.Nombre ?? getPeriod(d) ?? "Dato"))),
                    value: getVal(d.Valor),
                }));

            const filtered = isPolar
                ? raw.filter((d: any) => !isNaN(d.value) && d.value > 0)
                : raw.filter((d: any) => !isNaN(d.value));

            const latest = isSeriesArray ? getPeriod(data[0]?.Data?.[0]) : getPeriod(data[0]);
            return { flatData: [], pieData: filtered, latestYear: latest };
        }

        if (isSeriesArray) {
            const flatData = data.flatMap((s: any) => {
                const sName = (formatName ? formatName(s.Nombre) : formatSeriesName(s.Nombre)) || "Dato";
                const seriesData = s.Data || [];
                const res = new Array(seriesData.length);
                for (let i = 0; i < seriesData.length; i++) {
                    const item = seriesData[seriesData.length - 1 - i];
                    res[i] = { period: getPeriod(item), value: getVal(item.Valor), series: sName };
                }
                return res;
            });
            return { flatData, pieData: [], latestYear: getPeriod(data[0]?.Data?.[0]) };
        }

        const res = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            const item = data[data.length - 1 - i];
            res[i] = { period: getPeriod(item), value: getVal(item.Valor), series: title || "Valor" };
        }
        return { flatData: res, pieData: [], latestYear: getPeriod(data[0]) };
    }, [data, isCategorical, isPolar, isSeriesArray, title, formatName]);

    const totalPieValue = useMemo(() => {
        return pieData.reduce((acc: number, item: any) => acc + item.value, 0);
    }, [pieData]);

    const definition = useMemo(() => {
        if (isPolar) {
            if (!pieData.length) return null;
            const slices = pie(pieData, { value: (d: any) => d.value });

            return defineChart({
                marks: [
                    polar({
                        inset: 8,
                        radiusRatio: 0.88,
                        marks: [
                            radialArc(slices, {
                                innerRadius: type === "donut" ? ({ radius }) => radius * 0.58 : 0,
                                cornerRadius: 3,
                                color: (d: any) => d.label,
                                key: (d: any) => d.label,
                            }),
                        ],
                    }),
                ],
                color: { range: BRAND_PALETTE },
                tooltip: { use: tooltip, anchor: "pointer" },
            });
        }

        if (type === "column") {
            if (!pieData.length) return null;
            return defineChart({
                marks: [
                    barY(pieData, {
                        x: (d: any) => d.label,
                        y: (d: any) => d.value,
                        color: (d: any) => d.label,
                    }),
                ],
                x: { scale: scaleBand, grid: false },
                y: { scale: scaleLinear, grid: true, nice: true },
                color: { range: BRAND_PALETTE },
                tooltip: { use: tooltip, anchor: "pointer" },
            });
        }

        if (!flatData.length) return null;

        const isSingle = !isSeriesArray || data.length === 1;
        const color = isSingle ? "#C46A4A" : undefined;
        const seriesColor = isSingle ? undefined : (d: any) => d.series;

        const marks: any[] = [];
        if (type === "line") {
            marks.push(
                lineY(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, stroke: color, color: seriesColor, strokeWidth: 2.5 }),
                dot(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, fill: color, color: seriesColor, stroke: "#f4ebe2", strokeWidth: 1.5, r: 4 })
            );
        } else if (type === "bar") {
            marks.push(
                barY(flatData, { x: (d: any) => d.period, y: (d: any) => d.value, z: (d: any) => d.series, fill: color, color: seriesColor })
            );
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
            color: { range: BRAND_PALETTE },
            tooltip: { use: tooltip, anchor: "pointer" },
        });
    }, [isPolar, pieData, flatData, isSeriesArray, data, type]);

    if (!definition) return null;

    const legends: { label: string; extra?: string; percentage?: string }[] | null = isCategorical
        ? pieData.map((d: any) => {
            const pct = totalPieValue > 0 ? ((d.value / totalPieValue) * 100).toFixed(0) : undefined;
            return {
                label: d.label,
                extra: d.value.toLocaleString("es-ES"),
                percentage: pct ? `${pct}%` : undefined
            };
        })
        : isSeriesArray && data.length > 1
            ? data.map((s: any, idx: number) => ({
                label: (formatName ? formatName(s.Nombre) : formatSeriesName(s.Nombre)) || `Serie ${idx + 1}`
            }))
            : null;

    const hasLegends = legends && legends.length > 0;
    const isManyLegends = legends && legends.length > 2;

    return (
        <div className="flex flex-col gap-3 w-full text-title relative">
            <div className="flex justify-between w-full items-center">
                {title && <h3 className="font-semibold text-title text-sm md:text-base">{title}</h3>}
                <div className="flex items-center gap-2">
                    {hasLegends && (
                        <button
                            type="button"
                            onClick={() => setShowLegend(!showLegend)}
                            className={`flex items-center transition-colors cursor-pointer p-1 rounded ${showLegend ? "text-title bg-title/10" : "text-title/60 hover:text-title hover:bg-title/5"
                                }`}
                            title={showLegend ? "Ocultar leyenda" : "Mostrar leyenda"}
                            aria-label={showLegend ? "Ocultar leyenda" : "Mostrar leyenda"}
                        >
                            <FaListUl size={12} />
                        </button>
                    )}
                    {latestYear && (
                        <h4 title={`Última actualización: ${latestYear}`} className="flex gap-1 items-center justify-center font-semibold text-title/70 text-xs">
                            <IoTimeSharp size={13} />
                            {latestYear}
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
                        if (isPolar) {
                            return (
                                <div className="flex flex-col gap-1 text-xs">
                                    {points.map((p, idx) => {
                                        const d = (p.datum || {}) as any;
                                        const label = d.label ?? d.data?.label ?? d.key ?? "";
                                        const val = typeof d.value === "number" ? d.value : d.data?.value ?? p.yValue ?? 0;
                                        const frac = typeof d.fraction === "number" ? d.fraction : d.data?.fraction;
                                        return (
                                            <div key={idx} className="flex items-center gap-2">
                                                {label && <span className="text-title/80 font-medium">{label}:</span>}
                                                <span className="font-bold text-title tabular-nums">
                                                    {val.toLocaleString("es-ES")}
                                                </span>
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
                                {points.map((p, idx) => {
                                    const val = typeof p.yValue === "number" ? p.yValue : (p.datum as any)?.value ?? 0;
                                    return (
                                        <span key={idx} className="font-bold text-title tabular-nums">
                                            {typeof val === "number" ? val.toLocaleString("es-ES") : String(val)}
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    }}
                />
            </div>

            {hasLegends && showLegend && (
                <div
                    className={
                        `flex ${isManyLegends
                            ? "flex-col sm:grid sm:grid-cols-2"
                            : "flex-wrap items-center justify-center"
                        } gap-x-4 gap-y-1.5 pt-2 border-t border-title/10 w-full text-xs`
                    }
                >
                    {legends.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 py-0.5 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-title/20"
                                    style={{ backgroundColor: BRAND_PALETTE[idx % BRAND_PALETTE.length] }}
                                />
                                <span className="font-medium text-title/85 text-[11px] sm:text-xs truncate">
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {item.percentage && (
                                    <span className="text-title/40 font-mono text-[10px]">
                                        {item.percentage}
                                    </span>
                                )}
                                {item.extra && (
                                    <span className="text-title/70 font-mono font-semibold text-[11px] tabular-nums">
                                        ({item.extra})
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
